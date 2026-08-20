import { CommonModule } from '@angular/common';
import { ConnectedPosition, Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import {
  Component,
  ElementRef,
  EventEmitter,
  HostBinding,
  Input,
  Output,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
  forwardRef,
  inject,
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { Observable, Subscription, isObservable } from 'rxjs';
import { take } from 'rxjs/operators';
import { injectSicConfig } from '../../config/sic-config';
import { SicFormControlBase, SicTextAlign } from '../../base/sic-form-control.base';

const MENTIONS_OVERLAY_POSITIONS: ConnectedPosition[] = [
  { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top', offsetY: 4 },
  { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom', offsetY: -4 },
];

export interface SicCommentMentionOption {
  id: string | number;
  label: string;
  /** Handle stored in the text instead of `id`, e.g. "ada_lovelace". Falls back to `String(id)` when omitted. */
  username?: string;
}

export type SicCommentMentionSearch = (
  query: string,
) => SicCommentMentionOption[] | Promise<SicCommentMentionOption[]> | Observable<SicCommentMentionOption[]>;

export interface SicCommentTextPart {
  text: string;
  type: 'plain' | 'mention' | 'hashtag';
}

const MENTION_OR_HASHTAG_RE = /([@#][\w-]+)/g;

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Splits raw comment text into plain/mention/hashtag runs for the highlight
 * overlay. A textarea can't color part of its own text, so the overlay is a
 * same-sized, identically-styled layer drawn behind an otherwise-transparent
 * textarea (see the component's template/CSS) — this is what produces its content.
 *
 * `mentionLabels` are full display names already inserted via the picker
 * (e.g. "Ada Lovelace") — they may contain spaces, so they need their own
 * alternation on top of the plain `@word` pattern used while a mention is
 * still being typed/searched.
 */
export function splitCommentHighlightParts(text: string, mentionLabels: string[] = []): SicCommentTextPart[] {
  const parts: SicCommentTextPart[] = [];
  let lastIndex = 0;

  const labelAlternation = [...mentionLabels]
    .sort((a, b) => b.length - a.length)
    .map(escapeRegExp)
    .join('|');
  const mentionPattern = labelAlternation ? `@(?:${labelAlternation}|[\\w-]+)` : `@[\\w-]+`;
  const re = mentionLabels.length ? new RegExp(`(${mentionPattern}|#[\\w-]+)`, 'g') : MENTION_OR_HASHTAG_RE;

  for (const match of text.matchAll(re)) {
    const index = match.index ?? 0;
    if (index > lastIndex) {
      parts.push({ text: text.slice(lastIndex, index), type: 'plain' });
    }
    const token = match[0];
    parts.push({ text: token, type: token.startsWith('@') ? 'mention' : 'hashtag' });
    lastIndex = index + token.length;
  }

  if (lastIndex < text.length) {
    parts.push({ text: text.slice(lastIndex), type: 'plain' });
  }

  // A textarea always renders a trailing blank line for a trailing "\n"; a
  // plain wrapped div doesn't unless it ends with something visible too.
  if (text.endsWith('\n')) {
    parts.push({ text: ' ', type: 'plain' });
  }

  return parts;
}

/**
 * For displaying a *posted* comment elsewhere in your app: mentions are
 * stored as `@id`/`@username` (see `SicCommentMentionOption.username`), not
 * the person's display name — call this to swap each one back to a name
 * using your own user directory/lookup. `resolve` returning `undefined`
 * leaves that token as-is (e.g. an unknown/deleted user).
 */
export function resolveMentionDisplay(text: string, resolve: (usernameOrId: string) => string | undefined): string {
  return text.replace(/@([\w-]+)/g, (fullMatch, token: string) => {
    const label = resolve(token);
    return label ? `@${label}` : fullMatch;
  });
}

let nextFieldId = 0;

@Component({
  selector: 'sic-input-comment',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sic-input-comment.component.html',
  styleUrl: './sic-input-comment.component.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SicInputCommentComponent),
      multi: true,
    },
  ],
})
export class SicInputCommentComponent extends SicFormControlBase<string> {
  private readonly sicConfig = injectSicConfig();
  private readonly overlay = inject(Overlay);
  private readonly viewContainerRef = inject(ViewContainerRef);

  @Input() name?: string;
  @Input() placeholder = '';
  @Input() rows = 4;
  @Input() maxlength?: number;
  @Input() autoResize = false;
  @Input() align: SicTextAlign = 'left';

  /** Turns the "@mention" picker on/off. */
  @Input() enableMentions = true;
  /** Called with the text typed after "@" — return (or resolve/emit) the options to show. */
  @Input() mentionSearch?: SicCommentMentionSearch;

  /** Turns "#hashtag" recognition on/off. A hashtag is recognized once terminated by a space. */
  @Input() enableHashtags = true;

  /** Turns the attach-file control on/off. */
  @Input() enableUpload = true;
  @Input() accept = 'image/*';
  @Input() multiple = true;
  @Input() maxSizeMb = this.sicConfig.maxUploadSizeMb ?? 10;
  @Input() files: File[] = [];

  @Output() mentionClick = new EventEmitter<SicCommentMentionOption>();
  @Output() hashtagClick = new EventEmitter<string>();
  @Output() filesChange = new EventEmitter<File[]>();
  @Output() rejected = new EventEmitter<File[]>();

  @ViewChild('textareaEl') private textareaRef?: ElementRef<HTMLTextAreaElement>;
  @ViewChild('highlightEl') private highlightRef?: ElementRef<HTMLDivElement>;
  @ViewChild('fileInput') private fileInputRef?: ElementRef<HTMLInputElement>;
  @ViewChild('wrapperEl', { static: true }) private wrapperRef!: ElementRef<HTMLDivElement>;
  @ViewChild('mentionsTemplate') private mentionsTemplateRef?: TemplateRef<unknown>;

  @HostBinding('class.sic-input-comment-host') readonly hostClass = true;
  @HostBinding('class.sic-align-center') get isAlignCenter(): boolean {
    return this.align === 'center';
  }
  @HostBinding('class.sic-align-right') get isAlignRight(): boolean {
    return this.align === 'right';
  }

  get noMatchesText(): string {
    return this.sicConfig.messages?.noMatches ?? 'No matches';
  }

  get loadingText(): string {
    return this.sicConfig.messages?.loading ?? 'Loading…';
  }

  get attachFileLabel(): string {
    return this.sicConfig.messages?.attachFile ?? 'Attach file';
  }

  get removeFileLabel(): string {
    return this.sicConfig.messages?.removeFile ?? 'Remove file';
  }

  readonly fieldId = `sic-input-comment-${++nextFieldId}`;

  /** Stored/emitted form, e.g. "hello @1" — mentions encoded as id/username. */
  override value = '';
  /** Edited form shown in the textarea, e.g. "hello @Ada Lovelace" — mentions expanded to their full label. */
  displayValue = '';
  dragOver = false;

  /** Text typed after the triggering "@", or `null` while the picker is closed. */
  mentionQuery: string | null = null;
  mentionOptions: SicCommentMentionOption[] = [];
  mentionLoading = false;
  activeMentionIndex = 0;

  private mentionTriggerIndex: number | null = null;
  private mentionRequestId = 0;
  private mentionSub?: Subscription;
  private mentionsOverlayRef?: OverlayRef;
  private readonly previewUrls = new Map<File, string>();
  /** label -> option, used to encode a display mention back to its stored id/username. */
  private readonly mentionsByLabel = new Map<string, SicCommentMentionOption>();
  /** id/username (as stored in `value`) -> label, used to decode a written-in value for display. */
  private readonly labelsByMentionId = new Map<string, string>();

  override ngOnDestroy(): void {
    super.ngOnDestroy();
    this.mentionSub?.unsubscribe();
    this.mentionsOverlayRef?.dispose();

    for (const url of this.previewUrls.values()) {
      URL.revokeObjectURL(url);
    }
    this.previewUrls.clear();
  }

  override writeValue(value: string | null | undefined): void {
    this.value = value ?? '';
    this.displayValue = resolveMentionDisplay(this.value, (token) => this.labelsByMentionId.get(token));
    this.cdr.markForCheck();
  }

  get highlightParts(): SicCommentTextPart[] {
    return splitCommentHighlightParts(this.displayValue, Array.from(this.mentionsByLabel.keys()));
  }

  /** Replaces each known "@Full Label" run in `display` with its stored "@id"/"@username" token. */
  private encodeForStorage(display: string): string {
    if (!this.mentionsByLabel.size) {
      return display;
    }

    const alternation = Array.from(this.mentionsByLabel.keys())
      .sort((a, b) => b.length - a.length)
      .map(escapeRegExp)
      .join('|');
    const re = new RegExp(`@(?:${alternation})(?![\\w-])`, 'g');

    return display.replace(re, (fullMatch) => {
      const option = this.mentionsByLabel.get(fullMatch.slice(1));
      return option ? `@${option.username ?? option.id}` : fullMatch;
    });
  }

  private registerMention(option: SicCommentMentionOption): void {
    this.mentionsByLabel.set(option.label, option);
    this.labelsByMentionId.set(String(option.username ?? option.id), option.label);
  }

  handleScroll(): void {
    const textarea = this.textareaRef?.nativeElement;
    const highlight = this.highlightRef?.nativeElement;
    if (textarea && highlight) {
      highlight.scrollTop = textarea.scrollTop;
      highlight.scrollLeft = textarea.scrollLeft;
    }
  }

  handleInput(event: Event): void {
    const textarea = event.target as HTMLTextAreaElement;
    this.displayValue = textarea.value;
    this.value = this.encodeForStorage(this.displayValue);
    this.onChange(this.value);

    if (this.autoResize) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }

    this.detectMentionTrigger(textarea);
    this.detectCompletedHashtag(textarea, event as InputEvent);
  }

  handleKeydown(event: KeyboardEvent): void {
    if (this.mentionQuery !== null && this.mentionOptions.length) {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        this.activeMentionIndex = (this.activeMentionIndex + 1) % this.mentionOptions.length;
        return;
      }

      if (event.key === 'ArrowUp') {
        event.preventDefault();
        this.activeMentionIndex = (this.activeMentionIndex - 1 + this.mentionOptions.length) % this.mentionOptions.length;
        return;
      }

      if (event.key === 'Enter') {
        event.preventDefault();
        this.selectMention(this.mentionOptions[this.activeMentionIndex]);
        return;
      }
    }

    if (event.key === 'Escape' && this.mentionQuery !== null) {
      event.preventDefault();
      this.closeMentionPicker();
    }
  }

  handleBlur(): void {
    this.markTouched();
    // Options use (mousedown)="$event.preventDefault()" so clicking one never
    // reaches this handler in the first place — safe to always close here.
    this.closeMentionPicker();
  }

  selectMention(option: SicCommentMentionOption): void {
    const textarea = this.textareaRef?.nativeElement;
    const start = this.mentionTriggerIndex ?? 0;
    const caret = textarea?.selectionStart ?? this.displayValue.length;
    const before = this.displayValue.slice(0, start);
    const after = this.displayValue.slice(caret);
    // Shown in the textarea as the full label ("@Ada Lovelace"); encoded back
    // to "@id"/"@username" for the stored/emitted `value` — see
    // `encodeForStorage()`/`resolveMentionDisplay()`.
    const insertText = `@${option.label} `;

    this.registerMention(option);
    this.displayValue = `${before}${insertText}${after}`;
    this.value = this.encodeForStorage(this.displayValue);
    this.onChange(this.value);
    this.closeMentionPicker();
    this.mentionClick.emit(option);

    queueMicrotask(() => {
      const ta = this.textareaRef?.nativeElement;
      if (!ta) {
        return;
      }
      const caretPos = before.length + insertText.length;
      ta.focus();
      ta.setSelectionRange(caretPos, caretPos);
    });
  }

  openFilePicker(): void {
    if (!this.disabled && !this.readonly) {
      this.fileInputRef?.nativeElement.click();
    }
  }

  handleFileInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.addFiles(input.files);
    input.value = '';
  }

  handleDrop(event: DragEvent): void {
    if (!this.enableUpload) {
      return;
    }
    event.preventDefault();
    this.dragOver = false;

    if (!this.disabled && !this.readonly) {
      this.addFiles(event.dataTransfer?.files ?? null);
    }
  }

  handleDragOver(event: DragEvent): void {
    if (!this.enableUpload) {
      return;
    }
    event.preventDefault();
    this.dragOver = true;
  }

  handleDragLeave(): void {
    this.dragOver = false;
  }

  removeFile(file: File): void {
    this.files = this.files.filter((f) => f !== file);

    const url = this.previewUrls.get(file);
    if (url) {
      URL.revokeObjectURL(url);
      this.previewUrls.delete(file);
    }

    this.filesChange.emit(this.files);
  }

  previewUrlFor(file: File): string | null {
    if (!file.type.startsWith('image/')) {
      return null;
    }

    let url = this.previewUrls.get(file);
    if (!url) {
      url = URL.createObjectURL(file);
      this.previewUrls.set(file, url);
    }
    return url;
  }

  private addFiles(fileList: FileList | null): void {
    if (!fileList) {
      return;
    }

    const incoming = Array.from(fileList);
    const accepted: File[] = [];
    const rejected: File[] = [];

    for (const file of incoming) {
      if (file.size > this.maxSizeMb * 1024 * 1024) {
        rejected.push(file);
        continue;
      }
      accepted.push(file);
    }

    if (rejected.length) {
      this.rejected.emit(rejected);
    }

    this.files = this.multiple ? [...this.files, ...accepted] : accepted.slice(0, 1);
    this.filesChange.emit(this.files);
  }

  private detectMentionTrigger(textarea: HTMLTextAreaElement): void {
    if (!this.enableMentions || !this.mentionSearch) {
      this.closeMentionPicker();
      return;
    }

    const caret = textarea.selectionStart ?? this.displayValue.length;
    const uptoCaret = this.displayValue.slice(0, caret);
    const match = /(?:^|\s)@(\w*)$/.exec(uptoCaret);

    if (!match) {
      this.closeMentionPicker();
      return;
    }

    this.mentionTriggerIndex = caret - match[1].length - 1;
    this.mentionQuery = match[1];
    this.openMentionsOverlay();
    this.runMentionSearch(this.mentionQuery);
  }

  // The dropdown used to be a plain `position: absolute` child of `.sic-input-comment`, which any
  // ancestor with `overflow: hidden` (sic-card, sic-gridpanel cells, etc.) silently clips once it
  // extends past that ancestor's edge. A CDK overlay attaches to the document body instead, so it
  // always renders above everything regardless of what wraps this component.
  private openMentionsOverlay(): void {
    if (this.mentionsOverlayRef || !this.mentionsTemplateRef) {
      return;
    }

    this.mentionsOverlayRef = this.overlay.create({
      positionStrategy: this.overlay.position().flexibleConnectedTo(this.wrapperRef).withPositions(MENTIONS_OVERLAY_POSITIONS).withPush(false),
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
      width: this.wrapperRef.nativeElement.getBoundingClientRect().width,
    });

    this.mentionsOverlayRef.attach(new TemplatePortal(this.mentionsTemplateRef, this.viewContainerRef));
  }

  private closeMentionsOverlay(): void {
    this.mentionsOverlayRef?.dispose();
    this.mentionsOverlayRef = undefined;
  }

  private runMentionSearch(query: string): void {
    if (!this.mentionSearch) {
      return;
    }

    this.mentionSub?.unsubscribe();
    const requestId = ++this.mentionRequestId;
    this.mentionLoading = true;

    const apply = (options: SicCommentMentionOption[]): void => {
      // A newer keystroke may have already superseded this in-flight search.
      if (requestId !== this.mentionRequestId) {
        return;
      }
      this.mentionOptions = options;
      this.mentionLoading = false;
      this.activeMentionIndex = 0;
      this.cdr.markForCheck();
    };

    const result = this.mentionSearch(query);

    if (Array.isArray(result)) {
      apply(result);
    } else if (isObservable(result)) {
      this.mentionSub = result.pipe(take(1)).subscribe(apply);
    } else {
      result.then(apply);
    }
  }

  private detectCompletedHashtag(textarea: HTMLTextAreaElement, event: InputEvent): void {
    if (!this.enableHashtags || event.data !== ' ') {
      return;
    }

    const caret = textarea.selectionStart ?? this.displayValue.length;
    const uptoCaret = this.displayValue.slice(0, caret);
    const match = /(?:^|\s)#(\w+)\s$/.exec(uptoCaret);

    if (match) {
      this.hashtagClick.emit(match[1]);
    }
  }

  private closeMentionPicker(): void {
    this.mentionSub?.unsubscribe();
    this.mentionQuery = null;
    this.mentionOptions = [];
    this.mentionTriggerIndex = null;
    this.mentionLoading = false;
    this.activeMentionIndex = 0;
    this.closeMentionsOverlay();
  }
}
