import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  Component,
  ContentChild,
  ElementRef,
  EventEmitter,
  HostBinding,
  HostListener,
  Input,
  OnDestroy,
  Output,
  PLATFORM_ID,
  TemplateRef,
  ViewChild,
  forwardRef,
  inject,
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { injectSicConfig } from '../../config/sic-config';
import { SicFormControlBase, SicTextAlign } from '../../base/sic-form-control.base';
import { SicSpinnerComponent } from '../sic-spinner/sic-spinner.component';

export type SicComboboxValue = unknown | unknown[] | null;

interface SicComboboxQueryPayload {
  keyword?: string;
  value?: unknown;
  pageNo: number;
  pageSize: number;
}

/**
 * Emitted through `search` whenever isPaging = true needs data from the
 * caller: typing a keyword (pageNo:1), scrolling to load the next page
 * (pageNo++), or resolving the display label for a value written into the
 * formControl (value set, pageNo:1, pageSize:1). Call `options.update(items)`
 * with the fetched page — the component owns pagination/append/loading state
 * from there, no [options] input required while isPaging is true.
 */
export interface SicComboboxQueryEvent<T = unknown> extends SicComboboxQueryPayload {
  options: {
    update: (items: T[]) => void;
  };
}

export interface SicComboboxOptionContext<T> {
  $implicit: T;
  selected: boolean;
  active: boolean;
}

export interface SicComboboxDisplayContext<T> {
  $implicit: T[];
  multi: boolean;
}

const QUERY_DEBOUNCE_MS = 300;
const SCROLL_THRESHOLD_PX = 24;

@Component({
  selector: 'sic-combobox',
  standalone: true,
  imports: [CommonModule, SicSpinnerComponent],
  templateUrl: './sic-combobox.component.html',
  styleUrl: './sic-combobox.component.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SicComboboxComponent),
      multi: true,
    },
  ],
})
export class SicComboboxComponent<T = unknown> extends SicFormControlBase<SicComboboxValue> implements OnDestroy {
  private readonly sicConfig = injectSicConfig();

  @Input() options: T[] = [];
  @Input() optionLabel: keyof T | ((option: T) => string) = ((o: T) => String(o)) as any;
  @Input() optionValue: keyof T | ((option: T) => unknown) = ((o: T) => o) as any;
  @Input() placeholder = 'Select…';
  @Input() multi = false;
  @Input() searchable = true;
  @Input() isPaging = false;
  @Input() pageSize = this.sicConfig.pageSize ?? 10;
  @Input() align: SicTextAlign = 'left';
  @Input() clearable = true;

  @Output() search = new EventEmitter<SicComboboxQueryEvent<T>>();

  @ContentChild('optionTemplate') optionTemplate?: TemplateRef<SicComboboxOptionContext<T>>;
  @ContentChild('displayTemplate') displayTemplate?: TemplateRef<SicComboboxDisplayContext<T>>;
  @ViewChild('inputEl') private readonly inputRef?: ElementRef<HTMLInputElement>;
  @ViewChild('panel') private readonly panelRef?: ElementRef<HTMLElement>;

  @HostBinding('class.sic-combobox-host') readonly hostClass = true;
  @HostBinding('class.sic-align-center') get isAlignCenter(): boolean {
    return this.align === 'center';
  }
  @HostBinding('class.sic-align-right') get isAlignRight(): boolean {
    return this.align === 'right';
  }

  get noOptionsText(): string {
    return this.sicConfig.messages?.noOptions ?? 'No options';
  }

  override value: SicComboboxValue = null;
  open = false;
  query = '';
  loadingMore = false;
  activeIndex = -1;

  /**
   * The panel is positioned with `position: fixed` (viewport coordinates,
   * recomputed on open/scroll/resize) instead of `absolute` so it can escape
   * an ancestor with `overflow: auto`/`clip` — e.g. a horizontally-scrolling
   * sic-gridpanel cell — instead of being clipped by it.
   */
  panelTop = 0;
  panelLeft = 0;
  panelWidth = 0;

  private loadedOptions: T[] = [];
  private selectedOptions: T[] = [];
  private pageNo = 1;
  private hasMore = true;
  private resolving = false;
  private queryDebounce?: ReturnType<typeof setTimeout>;
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly handleAncestorScroll = (): void => {
    if (this.open) {
      this.updatePanelPosition();
    }
  };

  override ngOnInit(): void {
    super.ngOnInit();

    if (this.isBrowser) {
      document.addEventListener('scroll', this.handleAncestorScroll, true);
    }
  }

  override ngOnDestroy(): void {
    super.ngOnDestroy();

    if (this.isBrowser) {
      document.removeEventListener('scroll', this.handleAncestorScroll, true);
    }
  }

  @HostListener('window:resize')
  handleWindowResize(): void {
    if (this.open) {
      this.updatePanelPosition();
    }
  }

  private get dataset(): T[] {
    return this.isPaging ? this.loadedOptions : this.options;
  }

  get filteredOptions(): T[] {
    if (this.isPaging) {
      return this.loadedOptions;
    }

    if (!this.query) {
      return this.options;
    }

    const q = this.query.toLowerCase();
    return this.options.filter((option) => this.labelFor(option).toLowerCase().includes(q));
  }

  get selectedLabel(): string {
    return this.selectedOptions.map((option) => this.labelFor(option)).join(', ');
  }

  get fieldValue(): string {
    return this.open ? this.query : this.selectedLabel;
  }

  get showDisplayOverlay(): boolean {
    return !this.open && !!this.displayTemplate && this.selectedOptions.length > 0;
  }

  get showClear(): boolean {
    if (!this.clearable || this.disabled || this.readonly) {
      return false;
    }

    return this.multi ? Array.isArray(this.value) && this.value.length > 0 : this.value != null;
  }

  get selectedOptionsView(): T[] {
    return this.selectedOptions;
  }

  labelFor(option: T): string {
    return typeof this.optionLabel === 'function'
      ? this.optionLabel(option)
      : String(option[this.optionLabel]);
  }

  valueFor(option: T): unknown {
    return typeof this.optionValue === 'function'
      ? this.optionValue(option)
      : option[this.optionValue];
  }

  isSelected(option: T): boolean {
    const v = this.valueFor(option);

    if (this.multi && Array.isArray(this.value)) {
      return this.value.some((existing) => existing === v);
    }

    return this.value != null && this.value === v;
  }

  override writeValue(value: SicComboboxValue): void {
    this.value = value;
    this.syncSelectedFromValue();
    this.cdr.markForCheck();
  }

  handleFocus(): void {
    if (this.disabled) {
      return;
    }

    this.open = true;
    this.query = '';
    this.activeIndex = -1;
    this.updatePanelPosition();
  }

  handleBlur(): void {
    this.open = false;
    this.markTouched();
  }

  handleQuery(event: Event): void {
    this.query = (event.target as HTMLInputElement).value;
    this.open = true;
    this.activeIndex = -1;
    this.updatePanelPosition();

    if (!this.isPaging) {
      return;
    }

    if (this.queryDebounce) {
      clearTimeout(this.queryDebounce);
    }

    this.queryDebounce = setTimeout(() => {
      this.pageNo = 1;
      this.hasMore = true;
      this.loadingMore = true;
      this.emitQuery({ keyword: this.query, pageNo: this.pageNo, pageSize: this.pageSize });
    }, QUERY_DEBOUNCE_MS);
  }

  handleKeydown(event: KeyboardEvent): void {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.open = true;
      this.updatePanelPosition();
      this.activeIndex = Math.min(this.activeIndex + 1, this.filteredOptions.length - 1);
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.open = true;
      this.updatePanelPosition();
      this.activeIndex = Math.max(this.activeIndex - 1, 0);
      return;
    }

    if (event.key === 'Enter') {
      if (this.open && this.activeIndex >= 0 && this.activeIndex < this.filteredOptions.length) {
        event.preventDefault();
        this.selectOption(this.filteredOptions[this.activeIndex]);
      }
      return;
    }

    if (event.key === 'Escape') {
      this.open = false;
      (event.target as HTMLInputElement).blur();
    }
  }

  onOptionsScroll(event: Event): void {
    if (!this.isPaging || this.loadingMore || !this.hasMore) {
      return;
    }

    const el = event.target as HTMLElement;

    if (el.scrollTop + el.clientHeight >= el.scrollHeight - SCROLL_THRESHOLD_PX) {
      this.loadingMore = true;
      this.pageNo += 1;
      this.emitQuery({ keyword: this.query, pageNo: this.pageNo, pageSize: this.pageSize });
    }
  }

  selectOption(option: T): void {
    const v = this.valueFor(option);

    if (this.multi) {
      const current = Array.isArray(this.value) ? [...this.value] : [];
      const idx = current.findIndex((existing) => existing === v);

      if (idx >= 0) {
        current.splice(idx, 1);
      } else {
        current.push(v);
      }

      this.value = current;
    } else {
      this.value = v;
      this.open = false;
    }

    this.syncSelectedFromValue();
    this.onChange(this.value);
    this.markTouched();
  }

  clear(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();

    if (this.disabled || this.readonly) {
      return;
    }

    this.value = this.multi ? [] : null;
    this.query = '';
    this.syncSelectedFromValue();
    this.onChange(this.value);
    this.markTouched();
  }

  private syncSelectedFromValue(): void {
    if (this.value == null || (Array.isArray(this.value) && this.value.length === 0)) {
      this.selectedOptions = [];
      this.resolving = false;
      return;
    }

    const values = Array.isArray(this.value) ? this.value : [this.value];
    const matched = values
      .map((v) => this.dataset.find((option) => this.valueFor(option) === v))
      .filter((option): option is T => option != null);

    this.selectedOptions = matched;

    if (matched.length === values.length) {
      this.resolving = false;
      return;
    }

    if (this.isPaging && !this.resolving) {
      this.resolving = true;
      values
        .filter((v) => !this.dataset.some((option) => this.valueFor(option) === v))
        .forEach((v) => this.emitQuery({ value: v, pageNo: 1, pageSize: 1 }));
    }
  }

  private updatePanelPosition(): void {
    const inputEl = this.inputRef?.nativeElement;
    if (!inputEl) {
      return;
    }

    const rect = inputEl.getBoundingClientRect();
    this.panelTop = rect.bottom + 4;
    this.panelLeft = rect.left;
    this.panelWidth = rect.width;

    // The panel's real height depends on its (async-loaded, filtered) option
    // list, so a rough guess here would be wrong — measure it for real once
    // it exists in the DOM and flip above the input / clamp on-screen if it
    // would otherwise run off the viewport.
    if (this.isBrowser) {
      requestAnimationFrame(() => this.clampPanelToViewport(rect));
    }
  }

  private clampPanelToViewport(triggerRect: DOMRect): void {
    if (!this.open) {
      return;
    }

    const panelEl = this.panelRef?.nativeElement;
    if (!panelEl) {
      return;
    }

    const margin = 8;
    const panelHeight = panelEl.offsetHeight;
    const panelWidthPx = panelEl.offsetWidth;

    if (triggerRect.bottom + 4 + panelHeight > window.innerHeight - margin && triggerRect.top - panelHeight - 4 >= margin) {
      this.panelTop = triggerRect.top - panelHeight - 4;
    }

    this.panelLeft = Math.min(Math.max(this.panelLeft, margin), Math.max(window.innerWidth - panelWidthPx - margin, margin));
    this.cdr.markForCheck();
  }

  private emitQuery(payload: SicComboboxQueryPayload): void {
    this.search.emit({
      ...payload,
      options: {
        update: (items: T[]) => this.applyFetchedOptions(payload, items),
      },
    });
  }

  private applyFetchedOptions(payload: SicComboboxQueryPayload, items: T[]): void {
    if (payload.value !== undefined) {
      const merged = [...this.loadedOptions];

      for (const item of items) {
        if (!merged.some((existing) => this.valueFor(existing) === this.valueFor(item))) {
          merged.push(item);
        }
      }

      this.loadedOptions = merged;
      this.syncSelectedFromValue();
      return;
    }

    this.loadedOptions = payload.pageNo === 1 ? items : [...this.loadedOptions, ...items];
    this.hasMore = items.length >= payload.pageSize;
    this.loadingMore = false;

    if (payload.pageNo === 1) {
      this.activeIndex = -1;
    }
  }
}
