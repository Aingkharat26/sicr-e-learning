import { ApplicationRef, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { SIC_CONFIG } from '../../config/sic-config';
import {
  SicCommentMentionOption,
  SicCommentMentionSearch,
  SicInputCommentComponent,
  resolveMentionDisplay,
  splitCommentHighlightParts,
} from './sic-input-comment.component';

@Component({
  standalone: true,
  imports: [FormsModule, SicInputCommentComponent],
  template: `
    <sic-input-comment
      [(ngModel)]="text"
      [mentionSearch]="mentionSearch"
      [enableMentions]="enableMentions"
      [enableHashtags]="enableHashtags"
      [enableUpload]="enableUpload"
      [maxSizeMb]="maxSizeMb"
      (mentionClick)="onMentionClick($event)"
      (hashtagClick)="onHashtagClick($event)"
      (filesChange)="onFilesChange($event)"
      (rejected)="onRejected($event)"
    />
  `,
})
class HostComponent {
  text = '';
  enableMentions = true;
  enableHashtags = true;
  enableUpload = true;
  maxSizeMb = 10;
  lastMentionQuery: string | null = null;
  lastMentionClick: SicCommentMentionOption | null = null;
  lastHashtagClick: string | null = null;
  lastFiles: File[] | null = null;
  lastRejected: File[] | null = null;

  mentionSearch: SicCommentMentionSearch = (query: string) => {
    this.lastMentionQuery = query;
    return [
      { id: 1, label: 'ada' },
      { id: 2, label: 'grace' },
    ].filter((o) => o.label.startsWith(query));
  };

  onMentionClick(option: SicCommentMentionOption): void {
    this.lastMentionClick = option;
  }

  onHashtagClick(tag: string): void {
    this.lastHashtagClick = tag;
  }

  onFilesChange(files: File[]): void {
    this.lastFiles = files;
  }

  onRejected(files: File[]): void {
    this.lastRejected = files;
  }
}

function file(name: string, sizeBytes: number, type = 'text/plain'): File {
  return new File([new Uint8Array(sizeBytes)], name, { type });
}

describe('SicInputCommentComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [HostComponent] }).compileComponents();
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    document.querySelectorAll('.cdk-overlay-container').forEach((el) => el.remove());
  });

  function getComponent(): SicInputCommentComponent {
    return fixture.debugElement.query((d) => d.componentInstance instanceof SicInputCommentComponent)
      .componentInstance;
  }

  function textarea(): HTMLTextAreaElement {
    return fixture.nativeElement.querySelector('.sic-input-comment__field');
  }

  function typeAndSetCaret(value: string, caret: number = value.length, data: string | null = null): void {
    const el = textarea();
    el.value = value;
    el.selectionStart = caret;
    el.selectionEnd = caret;
    const event = new InputEvent('input', { data });
    Object.defineProperty(event, 'target', { value: el, configurable: true });
    el.dispatchEvent(event);
    fixture.detectChanges();
  }

  describe('mentions', () => {
    it('opens the mention picker with matching options once "@" is typed', () => {
      typeAndSetCaret('hi @a');

      const cmp = getComponent();
      expect(cmp.mentionQuery).toBe('a');
      expect(cmp.mentionOptions.map((o) => o.label)).toEqual(['ada']);
      expect(host.lastMentionQuery).toBe('a');
    });

    it('closes the picker once the "@word" is no longer at the caret (e.g. a space was typed after it)', () => {
      typeAndSetCaret('hi @a');
      expect(getComponent().mentionQuery).toBe('a');

      typeAndSetCaret('hi @ada ', 8, ' ');
      expect(getComponent().mentionQuery).toBeNull();
    });

    it('inserts the selected mention as its id (not the display label) at the trigger position, and emits mentionClick', () => {
      typeAndSetCaret('hi @a');
      const cmp = getComponent();
      const option = cmp.mentionOptions[0];

      cmp.selectMention(option);
      fixture.detectChanges();

      expect(option.label).toBe('ada');
      expect(host.text).toBe('hi @1 ');
      expect(host.lastMentionClick).toEqual(option);
      expect(cmp.mentionQuery).toBeNull();
    });

    it('inserts the option.username instead of the raw id when one is given', () => {
      host.mentionSearch = () => [{ id: 1, label: 'Ada Lovelace', username: 'ada_lovelace' }];
      fixture.detectChanges();

      typeAndSetCaret('hi @a');
      const cmp = getComponent();
      cmp.selectMention(cmp.mentionOptions[0]);
      fixture.detectChanges();

      expect(host.text).toBe('hi @ada_lovelace ');
    });

    it('shows the full label in the textarea while storing/emitting the id-encoded form', () => {
      host.mentionSearch = () => [{ id: 1, label: 'Ada Lovelace' }];
      fixture.detectChanges();

      typeAndSetCaret('hi @a');
      const cmp = getComponent();
      cmp.selectMention(cmp.mentionOptions[0]);
      fixture.detectChanges();

      expect(cmp.displayValue).toBe('hi @Ada Lovelace ');
      expect(host.text).toBe('hi @1 ');
      expect(textarea().value).toBe('hi @Ada Lovelace ');
    });

    it('decodes a written-in encoded value back to the full label once that mention has been seen before (e.g. re-selected from the same options list)', () => {
      host.mentionSearch = () => [{ id: 1, label: 'Ada Lovelace' }];
      fixture.detectChanges();

      typeAndSetCaret('hi @a');
      const cmp = getComponent();
      cmp.selectMention(cmp.mentionOptions[0]);
      fixture.detectChanges();

      cmp.writeValue('hi @1 again');
      fixture.detectChanges();

      expect(cmp.displayValue).toBe('hi @Ada Lovelace again');
    });

    it('does not open the picker when enableMentions is false', () => {
      host.enableMentions = false;
      fixture.detectChanges();

      typeAndSetCaret('hi @a');

      expect(getComponent().mentionQuery).toBeNull();
    });

    it('supports an async (Promise-based) mentionSearch', async () => {
      host.mentionSearch = () => Promise.resolve([{ id: 9, label: 'later' }]);
      fixture.detectChanges();

      typeAndSetCaret('@l');
      await Promise.resolve();
      fixture.detectChanges();

      expect(getComponent().mentionOptions).toEqual([{ id: 9, label: 'later' }]);
    });

    it('supports an Observable-based mentionSearch', () => {
      host.mentionSearch = () => of([{ id: 3, label: 'obs' }]);
      fixture.detectChanges();

      typeAndSetCaret('@o');
      fixture.detectChanges();

      expect(getComponent().mentionOptions).toEqual([{ id: 3, label: 'obs' }]);
    });

    it('renders the option list in a CDK overlay attached to the body, not as an in-place absolutely-positioned child — so an ancestor with overflow:hidden (e.g. sic-card) never clips it', () => {
      typeAndSetCaret('hi @a');
      TestBed.inject(ApplicationRef).tick();

      expect(fixture.nativeElement.querySelector('.sic-input-comment__mentions')).toBeNull();

      const optionInOverlay = document.querySelector('.cdk-overlay-pane .sic-input-comment__mention-option');
      expect(optionInOverlay?.textContent?.trim()).toBe('ada');
    });

    it('closes/disposes the overlay once the picker closes', () => {
      typeAndSetCaret('hi @a');
      TestBed.inject(ApplicationRef).tick();
      expect(document.querySelector('.cdk-overlay-pane')).toBeTruthy();

      typeAndSetCaret('hi @ada ', 8, ' ');

      expect(document.querySelector('.cdk-overlay-pane')).toBeNull();
    });
  });

  describe('hashtags', () => {
    it('emits hashtagClick once a "#word" is terminated by a space', () => {
      typeAndSetCaret('check #angular ', 15, ' ');

      expect(host.lastHashtagClick).toBe('angular');
    });

    it('does not emit while still typing the hashtag (no trailing space yet)', () => {
      typeAndSetCaret('check #angul', 12, 'l');

      expect(host.lastHashtagClick).toBeNull();
    });

    it('does not emit when enableHashtags is false', () => {
      host.enableHashtags = false;
      fixture.detectChanges();

      typeAndSetCaret('check #angular ', 15, ' ');

      expect(host.lastHashtagClick).toBeNull();
    });
  });

  describe('file uploads', () => {
    function dropEvent(files: File[]): Event {
      const event = new Event('drop', { bubbles: true, cancelable: true });
      Object.defineProperty(event, 'dataTransfer', { value: { files }, configurable: true });
      return event;
    }

    it('accepts a file dropped directly on the textarea (event bubbles up to the drop zone)', () => {
      const f = file('photo.png', 100, 'image/png');

      textarea().dispatchEvent(dropEvent([f]));
      fixture.detectChanges();

      const cmp = getComponent();
      expect(cmp.files).toEqual([f]);
      expect(host.lastFiles).toEqual([f]);
    });

    it('adds a dropped/selected file and emits filesChange', () => {
      const cmp = getComponent();
      const f = file('photo.png', 100, 'image/png');

      (cmp as any).addFiles([f]);
      fixture.detectChanges();

      expect(cmp.files).toEqual([f]);
      expect(host.lastFiles).toEqual([f]);
    });

    it('rejects a file over maxSizeMb instead of adding it', () => {
      host.maxSizeMb = 0.000001; // ~1 byte
      fixture.detectChanges();
      const cmp = getComponent();
      const big = file('big.txt', 1024);

      (cmp as any).addFiles([big]);
      fixture.detectChanges();

      expect(cmp.files).toEqual([]);
      expect(host.lastRejected).toEqual([big]);
    });

    it('creates an object-URL preview for image files but not for non-image files', () => {
      const cmp = getComponent();
      const img = file('a.png', 10, 'image/png');
      const doc = file('a.txt', 10, 'text/plain');

      expect(cmp.previewUrlFor(img)).toMatch(/^blob:/);
      expect(cmp.previewUrlFor(doc)).toBeNull();
    });

    it('removes a file and revokes its preview URL', () => {
      const cmp = getComponent();
      const img = file('a.png', 10, 'image/png');
      (cmp as any).addFiles([img]);
      fixture.detectChanges();
      cmp.previewUrlFor(img);

      cmp.removeFile(img);
      fixture.detectChanges();

      expect(cmp.files).toEqual([]);
      expect(host.lastFiles).toEqual([]);
    });

    it('does not render the attach button when enableUpload is false', () => {
      host.enableUpload = false;
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('.sic-input-comment__attach-btn')).toBeNull();
    });

    it('renders the attach button inside the editor (overlaid on the textarea), not in a separate row', () => {
      const editor = fixture.nativeElement.querySelector('.sic-input-comment__editor');
      expect(editor.querySelector('.sic-input-comment__attach-btn')).toBeTruthy();
    });
  });

  describe('@mention / #hashtag highlighting', () => {
    it('renders a mention token in its own highlighted span', () => {
      typeAndSetCaret('hi @ada_lovelace bye');

      const el = fixture.nativeElement.querySelector('.sic-input-comment__hl-mention');
      expect(el?.textContent).toBe('@ada_lovelace');
    });

    it('renders a hashtag token in its own highlighted span', () => {
      typeAndSetCaret('check #angular out');

      const el = fixture.nativeElement.querySelector('.sic-input-comment__hl-hashtag');
      expect(el?.textContent).toBe('#angular');
    });

    it('does not highlight plain text', () => {
      typeAndSetCaret('just plain text');

      expect(fixture.nativeElement.querySelector('.sic-input-comment__hl-mention')).toBeNull();
      expect(fixture.nativeElement.querySelector('.sic-input-comment__hl-hashtag')).toBeNull();
    });
  });
});

describe('splitCommentHighlightParts', () => {
  it('splits plain, mention, and hashtag runs', () => {
    expect(splitCommentHighlightParts('hi @ada check #angular now')).toEqual([
      { text: 'hi ', type: 'plain' },
      { text: '@ada', type: 'mention' },
      { text: ' check ', type: 'plain' },
      { text: '#angular', type: 'hashtag' },
      { text: ' now', type: 'plain' },
    ]);
  });

  it('returns a single plain part for text with no tokens', () => {
    expect(splitCommentHighlightParts('just plain text')).toEqual([{ text: 'just plain text', type: 'plain' }]);
  });

  it('appends a trailing space so a trailing newline renders the same extra blank line as a textarea', () => {
    const parts = splitCommentHighlightParts('hi\n');
    expect(parts[parts.length - 1]).toEqual({ text: ' ', type: 'plain' });
  });
});

describe('resolveMentionDisplay', () => {
  it('replaces each @token with the name resolved for it', () => {
    const users: Record<string, string> = { ada_lovelace: 'Ada Lovelace', 42: 'Grace Hopper' };
    const result = resolveMentionDisplay('hi @ada_lovelace and @42!', (token) => users[token]);

    expect(result).toBe('hi @Ada Lovelace and @Grace Hopper!');
  });

  it('leaves a token as-is when the resolver returns undefined (e.g. unknown/deleted user)', () => {
    const result = resolveMentionDisplay('hi @unknown_user', () => undefined);

    expect(result).toBe('hi @unknown_user');
  });

  it('does not touch hashtags', () => {
    const result = resolveMentionDisplay('see #angular @ada', (token) => (token === 'ada' ? 'Ada Lovelace' : undefined));

    expect(result).toBe('see #angular @Ada Lovelace');
  });
});

describe('SicInputCommentComponent SIC_CONFIG defaults', () => {
  it('uses SIC_CONFIG.maxUploadSizeMb and messages for maxSizeMb / attach / remove / mention text', async () => {
    await TestBed.configureTestingModule({
      imports: [SicInputCommentComponent],
      providers: [
        {
          provide: SIC_CONFIG,
          useValue: {
            maxUploadSizeMb: 20,
            messages: { attachFile: 'แนบไฟล์', removeFile: 'ลบไฟล์', noMatches: 'ไม่พบ', loading: 'กำลังโหลด…' },
          },
        },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(SicInputCommentComponent);
    const cmp = fixture.componentInstance;
    fixture.detectChanges();

    expect(cmp.maxSizeMb).toBe(20);
    expect(fixture.nativeElement.querySelector('.sic-input-comment__attach-btn').getAttribute('aria-label')).toBe('แนบไฟล์');
    expect(cmp.noMatchesText).toBe('ไม่พบ');
    expect(cmp.loadingText).toBe('กำลังโหลด…');
    expect(cmp.removeFileLabel).toBe('ลบไฟล์');
  });
});
