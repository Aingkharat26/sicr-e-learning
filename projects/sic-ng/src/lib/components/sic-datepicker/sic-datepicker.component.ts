import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, ElementRef, HostBinding, HostListener, Input, PLATFORM_ID, ViewChild, forwardRef, inject } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import dayjs, { Dayjs } from 'dayjs';
import { injectSicConfig } from '../../config/sic-config';
import { SicFormControlBase, SicTextAlign } from '../../base/sic-form-control.base';

export type SicDateEra = 'BE' | 'CE';
export type SicDatepickerMode = 'day' | 'month' | 'year';
type SicDatepickerView = SicDatepickerMode;

interface SicDayCell {
  date: Dayjs;
  label: string;
  inMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  isCursor: boolean;
  disabled: boolean;
}

interface SicMonthCell {
  month: number;
  label: string;
  isSelected: boolean;
  isCursor: boolean;
  disabled: boolean;
}

interface SicYearCell {
  year: number;
  label: string;
  isSelected: boolean;
  isCursor: boolean;
  disabled: boolean;
}

const YEAR_WINDOW = 12;
const BE_OFFSET = 543;
let nextFieldId = 0;

/** yyyy/yy/MMMM/MMM/MM/M/dd/d/EEEE/EEE — deliberately not dayjs's own token set
 *  (dayjs's lowercase "dd" means weekday-min, not day-of-month) so the format
 *  input behaves the way most consumers expect from Angular/date-fns style patterns. */
const FORMAT_TOKEN_RE = /yyyy|yy|MMMM|MMM|MM|M|dd|d|EEEE|EEE/g;

function toEraYear(ceYear: number, era: SicDateEra): number {
  return era === 'BE' ? ceYear + BE_OFFSET : ceYear;
}

function formatDate(date: Dayjs, pattern: string, era: SicDateEra, locale: string): string {
  const d = date.locale(locale);
  const yyyy = String(toEraYear(d.year(), era)).padStart(4, '0');

  const replacements: Record<string, string> = {
    yyyy,
    yy: yyyy.slice(-2),
    MMMM: d.format('MMMM'),
    MMM: d.format('MMM'),
    MM: d.format('MM'),
    M: d.format('M'),
    dd: d.format('DD'),
    d: d.format('D'),
    EEEE: d.format('dddd'),
    EEE: d.format('ddd'),
  };

  return pattern.replace(FORMAT_TOKEN_RE, (token) => replacements[token]);
}

@Component({
  selector: 'sic-datepicker',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sic-datepicker.component.html',
  styleUrl: './sic-datepicker.component.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SicDatepickerComponent),
      multi: true,
    },
  ],
})
export class SicDatepickerComponent extends SicFormControlBase<Date | string | null> {
  private readonly sicConfig = injectSicConfig();

  @Input() min?: Date | string | null;
  @Input() max?: Date | string | null;
  @Input() outputType: 'date' | 'string' = 'string';
  @Input() align: SicTextAlign = 'left';
  @Input() placeholder = 'Select date';

  /** Display format for the field. Tokens: yyyy, yy, MMMM, MMM, MM, M, dd, d, EEEE, EEE. */
  @Input() format = this.sicConfig.dateFormat ?? 'dd/MM/yyyy';
  /** Year numbering shown to the user. Storage/output is always the real (CE) date. */
  @Input() era: SicDateEra = this.sicConfig.era ?? 'CE';
  /** dayjs locale code for month/weekday names. Import the matching `dayjs/locale/<code>`
   *  package yourself before use — dayjs falls back to English for unregistered locales. */
  @Input() locale = this.sicConfig.locale ?? 'en';
  /** Granularity the picker commits to. 'month' skips the day grid, 'year' skips both. */
  @Input() mode: SicDatepickerMode = 'day';
  @Input() weekStartsOn: 0 | 1 = 0;
  @Input() clearable = true;

  @HostBinding('class.sic-datepicker-host') readonly hostClass = true;
  @HostBinding('class.sic-align-center') get isAlignCenter(): boolean {
    return this.align === 'center';
  }
  @HostBinding('class.sic-align-right') get isAlignRight(): boolean {
    return this.align === 'right';
  }

  @ViewChild('trigger') private triggerRef?: ElementRef<HTMLButtonElement>;
  @ViewChild('fieldWrap') private fieldWrapRef?: ElementRef<HTMLElement>;
  @ViewChild('panel') private panelRef?: ElementRef<HTMLElement>;

  private readonly elementRef = inject(ElementRef<HTMLElement>);
  /** Set right before we refocus the trigger ourselves (after commit/Escape), so
   *  the (focus) handler doesn't treat that as a user focus and reopen. */
  private suppressAutoOpen = false;
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly handleAncestorScroll = (): void => {
    if (this.open) {
      this.updatePanelPosition();
    }
  };

  readonly fieldId = `sic-datepicker-${++nextFieldId}`;

  override value: Date | string | null = null;
  open = false;
  view: SicDatepickerView = this.mode;
  focusedDate = dayjs();
  /**
   * The panel is positioned with `position: fixed` (viewport coordinates,
   * recomputed on open/scroll/resize) instead of `absolute` so it can escape
   * an ancestor with `overflow: auto`/`clip` — e.g. a sic-gridpanel cell —
   * instead of being clipped by it.
   */
  panelTop = 0;
  panelLeft = 0;
  /** Only true once the user starts arrow-keying — keeps the cursor ring from
   *  appearing when just clicking the prev/next nav buttons with a mouse
   *  (dayjs().add(n,'month') keeps the day-of-month, which used to make every
   *  month's Nth day look highlighted while merely browsing). */
  keyboardActive = false;

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

  override writeValue(value: Date | string | null | undefined): void {
    this.value = value ?? null;
    this.cdr.markForCheck();
  }

  get displayValue(): string {
    const d = this.selectedDate;
    return d ? formatDate(d, this.format, this.era, this.locale) : '';
  }

  get showClear(): boolean {
    return this.clearable && !this.disabled && !this.readonly && !!this.selectedDate;
  }

  clearValue(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();

    if (this.disabled || this.readonly) {
      return;
    }

    this.value = null;
    this.commitValue(this.value);
    this.markTouched();
  }

  get headerLabel(): string {
    if (this.view === 'year') {
      const start = this.yearWindowStart;
      return `${toEraYear(start, this.era)} - ${toEraYear(start + YEAR_WINDOW - 1, this.era)}`;
    }

    if (this.view === 'month') {
      return String(toEraYear(this.focusedDate.year(), this.era));
    }

    return `${this.focusedDate.locale(this.locale).format('MMMM')} ${toEraYear(this.focusedDate.year(), this.era)}`;
  }

  get weekdayLabels(): string[] {
    const start = dayjs().locale(this.locale).day(this.weekStartsOn);
    return Array.from({ length: 7 }, (_, i) => start.add(i, 'day').format('dd'));
  }

  get dayCells(): SicDayCell[] {
    const month = this.focusedDate.month();
    const startOffset = (this.focusedDate.startOf('month').day() - this.weekStartsOn + 7) % 7;
    const gridStart = this.focusedDate.startOf('month').subtract(startOffset, 'day');
    const today = dayjs();
    const selected = this.selectedDate;

    return Array.from({ length: 42 }, (_, i) => {
      const date = gridStart.add(i, 'day');

      return {
        date,
        label: date.format('D'),
        inMonth: date.month() === month,
        isToday: date.isSame(today, 'day'),
        isSelected: !!selected && date.isSame(selected, 'day'),
        isCursor: date.isSame(this.focusedDate, 'day'),
        disabled: this.isDayDisabled(date),
      };
    });
  }

  get monthCells(): SicMonthCell[] {
    const selected = this.selectedDate;

    return Array.from({ length: 12 }, (_, month) => {
      const cellDate = this.focusedDate.month(month);

      return {
        month,
        label: cellDate.locale(this.locale).format('MMMM'),
        isSelected: !!selected && selected.year() === this.focusedDate.year() && selected.month() === month,
        isCursor: this.focusedDate.month() === month,
        disabled: this.isMonthDisabled(this.focusedDate.year(), month),
      };
    });
  }

  get yearCells(): SicYearCell[] {
    const start = this.yearWindowStart;
    const selected = this.selectedDate;

    return Array.from({ length: YEAR_WINDOW }, (_, i) => {
      const year = start + i;

      return {
        year,
        label: String(toEraYear(year, this.era)),
        isSelected: !!selected && selected.year() === year,
        isCursor: this.focusedDate.year() === year,
        disabled: this.isYearDisabled(year),
      };
    });
  }

  private get yearWindowStart(): number {
    return Math.floor(this.focusedDate.year() / YEAR_WINDOW) * YEAR_WINDOW;
  }

  private get selectedDate(): Dayjs | null {
    if (!this.value) {
      return null;
    }

    const d = dayjs(this.value);
    return d.isValid() ? d : null;
  }

  private get minDate(): Dayjs | null {
    if (!this.min) {
      return null;
    }
    const d = dayjs(this.min);
    return d.isValid() ? d : null;
  }

  private get maxDate(): Dayjs | null {
    if (!this.max) {
      return null;
    }
    const d = dayjs(this.max);
    return d.isValid() ? d : null;
  }

  private isDayDisabled(date: Dayjs): boolean {
    const min = this.minDate;
    const max = this.maxDate;
    return (!!min && date.isBefore(min, 'day')) || (!!max && date.isAfter(max, 'day'));
  }

  private isMonthDisabled(year: number, month: number): boolean {
    const min = this.minDate;
    const max = this.maxDate;
    const start = dayjs().year(year).month(month).startOf('month');
    const end = dayjs().year(year).month(month).endOf('month');
    return (!!min && end.isBefore(min, 'day')) || (!!max && start.isAfter(max, 'day'));
  }

  private isYearDisabled(year: number): boolean {
    const min = this.minDate;
    const max = this.maxDate;
    const start = dayjs().year(year).startOf('year');
    const end = dayjs().year(year).endOf('year');
    return (!!min && end.isBefore(min, 'day')) || (!!max && start.isAfter(max, 'day'));
  }

  @HostListener('document:click', ['$event'])
  handleDocumentClick(event: MouseEvent): void {
    if (this.open && !this.elementRef.nativeElement.contains(event.target as Node)) {
      this.closePanel();
    }
  }

  handleTriggerClick(event: MouseEvent): void {
    // Prevents the wrapping <label>'s native click-forwarding from stealing
    // focus back to whichever labelable element it resolves to.
    event.preventDefault();

    if (this.disabled) {
      return;
    }

    // Belt-and-braces: (focus) already opens it on most browsers since
    // mousedown focuses the button before this click handler runs, but not
    // reliably everywhere (e.g. Safari doesn't always focus buttons on click).
    this.openPanel();
  }

  handleTriggerFocus(): void {
    if (this.suppressAutoOpen) {
      this.suppressAutoOpen = false;
      return;
    }

    if (this.disabled) {
      return;
    }

    this.openPanel();
  }

  handleFocusOut(event: FocusEvent): void {
    const next = event.relatedTarget as Node | null;

    if (!next || !this.elementRef.nativeElement.contains(next)) {
      this.closePanel();
    }
  }

  openPanel(): void {
    if (this.open) {
      return;
    }

    this.open = true;
    this.view = this.mode;
    this.keyboardActive = false;
    this.focusedDate = this.selectedDate ?? dayjs();
    this.updatePanelPosition();
  }

  closePanel(): void {
    this.open = false;
  }

  private refocusTrigger(): void {
    this.suppressAutoOpen = true;
    this.triggerRef?.nativeElement.focus();
  }

  private updatePanelPosition(): void {
    // Anchor off the field wrapper (border/padding box), not the inner
    // trigger <button> — the button is only vertically centered within it
    // (flex align-items: center), so its own rect.bottom sits above the
    // field's real bottom edge and made the panel overlap the field.
    const triggerEl = this.fieldWrapRef?.nativeElement ?? this.triggerRef?.nativeElement;
    if (!triggerEl) {
      return;
    }

    const rect = triggerEl.getBoundingClientRect();
    this.panelTop = rect.bottom + 4;
    this.panelLeft = rect.left;

    // The panel's height depends on the active view (day/month/year), so a
    // fixed guess would be wrong — measure it for real once it exists in the
    // DOM and flip above the trigger / clamp on-screen if it would otherwise
    // run off the viewport.
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
    const panelWidth = panelEl.offsetWidth;

    if (triggerRect.bottom + 4 + panelHeight > window.innerHeight - margin && triggerRect.top - panelHeight - 4 >= margin) {
      this.panelTop = triggerRect.top - panelHeight - 4;
    }

    this.panelLeft = Math.min(Math.max(this.panelLeft, margin), Math.max(window.innerWidth - panelWidth - margin, margin));
    this.cdr.markForCheck();
  }

  drillUp(): void {
    if (this.view === 'day' || this.view === 'month') {
      this.view = 'year';
      this.keyboardActive = false;
    }
  }

  stepPrimary(direction: 1 | -1): void {
    if (this.view === 'year') {
      this.focusedDate = this.focusedDate.add(direction * YEAR_WINDOW, 'year');
    } else if (this.view === 'month') {
      this.focusedDate = this.focusedDate.add(direction, 'year');
    } else {
      this.focusedDate = this.focusedDate.add(direction, 'month');
    }

    this.keyboardActive = false;
  }

  selectDay(cell: SicDayCell, event?: MouseEvent): void {
    event?.preventDefault();

    if (cell.disabled) {
      return;
    }

    this.focusedDate = cell.date;
    this.commit(cell.date);
  }

  selectMonth(cell: SicMonthCell, event?: MouseEvent): void {
    event?.preventDefault();

    if (cell.disabled) {
      return;
    }

    this.focusedDate = this.focusedDate.month(cell.month);

    if (this.mode === 'month') {
      this.commit(this.focusedDate);
    } else {
      this.view = 'day';
    }
  }

  selectYear(cell: SicYearCell, event?: MouseEvent): void {
    event?.preventDefault();

    if (cell.disabled) {
      return;
    }

    this.focusedDate = this.focusedDate.year(cell.year);

    if (this.mode === 'year') {
      this.commit(this.focusedDate);
    } else {
      this.view = 'month';
    }
  }

  handleTriggerKeydown(event: KeyboardEvent): void {
    if (!this.open) {
      if (event.key === 'Enter' || event.key === ' ' || event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        this.openPanel();
      }
      return;
    }

    const key = event.key;

    if (key === 'Escape') {
      event.preventDefault();
      this.closePanel();
      this.refocusTrigger();
      return;
    }

    if (key === 'Enter' || key === ' ') {
      event.preventDefault();
      this.activateFocused();
      return;
    }

    const step = this.arrowStep(key);
    if (!step) {
      return;
    }

    event.preventDefault();
    this.keyboardActive = true;
    this.focusedDate = this.focusedDate.add(step.amount, step.unit);
  }

  private arrowStep(key: string): { amount: number; unit: 'day' | 'month' | 'year' } | null {
    if (this.view === 'day') {
      if (key === 'ArrowLeft') return { amount: -1, unit: 'day' };
      if (key === 'ArrowRight') return { amount: 1, unit: 'day' };
      if (key === 'ArrowUp') return { amount: -7, unit: 'day' };
      if (key === 'ArrowDown') return { amount: 7, unit: 'day' };
      return null;
    }

    if (this.view === 'month') {
      if (key === 'ArrowLeft') return { amount: -1, unit: 'month' };
      if (key === 'ArrowRight') return { amount: 1, unit: 'month' };
      if (key === 'ArrowUp') return { amount: -3, unit: 'month' };
      if (key === 'ArrowDown') return { amount: 3, unit: 'month' };
      return null;
    }

    if (key === 'ArrowLeft') return { amount: -1, unit: 'year' };
    if (key === 'ArrowRight') return { amount: 1, unit: 'year' };
    if (key === 'ArrowUp') return { amount: -4, unit: 'year' };
    if (key === 'ArrowDown') return { amount: 4, unit: 'year' };
    return null;
  }

  private activateFocused(): void {
    if (this.view === 'day') {
      const cell = this.dayCells.find((c) => c.isCursor);
      if (cell) {
        this.selectDay(cell);
      }
      return;
    }

    if (this.view === 'month') {
      const cell = this.monthCells.find((c) => c.isCursor);
      if (cell) {
        this.selectMonth(cell);
      }
      return;
    }

    const cell = this.yearCells.find((c) => c.isCursor);
    if (cell) {
      this.selectYear(cell);
    }
  }

  private commit(date: Dayjs): void {
    const normalized = date.toDate();
    this.value = this.outputType === 'date' ? normalized : date.format('YYYY-MM-DD');
    this.commitValue(this.value);
    this.markTouched();
    this.closePanel();
    this.refocusTrigger();
  }
}
