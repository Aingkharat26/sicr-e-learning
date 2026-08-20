import { CommonModule } from '@angular/common';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import {
  Component,
  ContentChild,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
  inject,
} from '@angular/core';
import { injectSicConfig } from '../../config/sic-config';

/** Template context handed to a custom `<ng-template #itemTemplate let-item let-active="active">` result row. */
export interface SicSearchItemContext<T> {
  $implicit: T;
  active: boolean;
  query: string;
}

/**
 * A ⌘K-style popup search: bind `[open]`/`(openChange)` (e.g. from a nav-bar search button),
 * pass `[items]`, and it renders a centered overlay with a text input and a filtered result list.
 * Closes on Escape or a backdrop click. Provide `<ng-template #itemTemplate>` to fully customize
 * how each result renders.
 */
@Component({
  selector: 'sic-search',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sic-search.component.html',
  styleUrl: './sic-search.component.css',
})
export class SicSearchComponent<T = unknown> implements OnChanges, OnDestroy {
  private readonly overlay = inject(Overlay);
  private readonly viewContainerRef = inject(ViewContainerRef);
  private readonly sicConfig = injectSicConfig();

  @Input() open = false;
  @Input() items: T[] = [];
  @Input() query = '';
  @Input() placeholder = 'Search...';
  /** Property name to read the display label from, or a function computing it. Default: `String(item)`. */
  @Input() optionLabel: keyof T | ((item: T) => string) = ((item: T) => String(item)) as unknown as (item: T) => string;
  /** Full replacement for the built-in case-insensitive substring filter, e.g. for server-side search where `items` already arrives pre-filtered. */
  @Input() filterFn?: (items: T[], query: string) => T[];
  @Input() closeOnSelect = true;
  /** Minimum width of the search panel (any CSS length, e.g. `'24rem'`). Default: none. */
  @Input() minWidth?: string;

  @Output() openChange = new EventEmitter<boolean>();
  @Output() queryChange = new EventEmitter<string>();
  @Output() itemSelect = new EventEmitter<T>();

  /** `<ng-template #itemTemplate let-item let-active="active" let-query="query">` overrides how each result renders. */
  @ContentChild('itemTemplate') itemTemplate?: TemplateRef<SicSearchItemContext<T>>;
  @ViewChild('panelTemplate', { static: true }) private readonly panelTemplateRef!: TemplateRef<unknown>;

  activeIndex = -1;

  private overlayRef?: OverlayRef;

  get noResultsText(): string {
    return this.sicConfig.messages?.noResults ?? 'No results';
  }

  get filteredItems(): T[] {
    if (this.filterFn) {
      return this.filterFn(this.items, this.query);
    }

    if (!this.query) {
      return this.items;
    }

    const q = this.query.toLowerCase();
    return this.items.filter((item) => this.labelFor(item).toLowerCase().includes(q));
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['open']) {
      return;
    }

    if (this.open) {
      this.openOverlay();
    } else {
      this.closeOverlay();
    }
  }

  ngOnDestroy(): void {
    this.overlayRef?.dispose();
  }

  @HostListener('document:keydown.escape')
  onDocumentEscape(): void {
    this.close();
  }

  labelFor(item: T): string {
    return typeof this.optionLabel === 'function' ? this.optionLabel(item) : String(item[this.optionLabel]);
  }

  handleQueryInput(value: string): void {
    this.query = value;
    this.activeIndex = -1;
    this.queryChange.emit(value);
  }

  handleKeydown(event: KeyboardEvent): void {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.activeIndex = Math.min(this.activeIndex + 1, this.filteredItems.length - 1);
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.activeIndex = Math.max(this.activeIndex - 1, 0);
      return;
    }

    if (event.key === 'Enter') {
      if (this.activeIndex >= 0 && this.activeIndex < this.filteredItems.length) {
        event.preventDefault();
        this.selectItem(this.filteredItems[this.activeIndex]);
      }
      return;
    }

    if (event.key === 'Escape') {
      this.close();
    }
  }

  selectItem(item: T): void {
    this.itemSelect.emit(item);

    if (this.closeOnSelect) {
      this.close();
    }
  }

  close(): void {
    if (!this.open) {
      return;
    }

    this.open = false;
    this.openChange.emit(false);
    this.closeOverlay();
  }

  private openOverlay(): void {
    if (this.overlayRef) {
      return;
    }

    this.activeIndex = -1;
    this.overlayRef = this.overlay.create({
      positionStrategy: this.overlay.position().global().centerHorizontally().top('10vh'),
      hasBackdrop: true,
      width: 'min(38rem, calc(100vw - 2rem))',
      // `.cdk-overlay-pane` is a flex container with no centering of its own — the panel is
      // usually narrower than this pane's fixed width, and flex's default `justify-content:
      // flex-start` shoves it against the pane's left edge instead of centering it. Scoped to
      // sic-search panes only, so other Overlay-based components keep their default alignment.
      panelClass: 'sic-search-overlay-pane',
    });

    this.overlayRef.attach(new TemplatePortal(this.panelTemplateRef, this.viewContainerRef));

    // The backdrop element is outside any component's template, so it must be
    // dimmed via a direct inline style rather than a CSS class (see SicDialogService).
    if (this.overlayRef.backdropElement) {
      this.overlayRef.backdropElement.style.background = 'color-mix(in srgb, #000 45%, transparent)';
    }

    this.overlayRef.backdropClick().subscribe(() => this.close());

    queueMicrotask(() => this.overlayRef?.overlayElement.querySelector<HTMLInputElement>('.sic-search__input')?.focus());
  }

  private closeOverlay(): void {
    this.overlayRef?.dispose();
    this.overlayRef = undefined;
  }
}
