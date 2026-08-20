import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  HostBinding,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
  Output,
  PLATFORM_ID,
  inject,
} from '@angular/core';
import dayjs, { Dayjs } from 'dayjs';
import { injectSicConfig } from '../../config/sic-config';
import { SicTooltipDirective } from '../sic-tooltip/sic-tooltip.directive';

/** 'BE' = พุทธศักราช (CE year + 543), 'CE' = คริสต์ศักราช. Storage/output dates are always real (CE) dates — this only changes the year shown to the user. */
export type SicCalendarEra = 'BE' | 'CE';
export type SicCalendarView = 'grid' | 'list';
/** Who observes the holiday — drives the default icon/color when the entry doesn't set its own. */
export type SicCalendarHolidaySource = 'office' | 'government' | 'bank' | 'other';

export interface SicCalendarEvent {
  id?: string | number;
  /** The day this task falls on. */
  date: Date | string;
  title: string;
  /** CSS color for the task's dot/line. Defaults to the theme primary color. */
  color?: string;
  /** Short text/emoji rendered next to the title (e.g. an icon glyph). */
  icon?: string;
  description?: string;
}

export interface SicCalendarHoliday {
  id?: string | number;
  /** The day this holiday falls on. */
  date: Date | string;
  title: string;
  source?: SicCalendarHolidaySource;
  /** CSS color for the badge. Defaults to a color based on `source`. */
  color?: string;
  /** Short text/emoji for the badge. Defaults to an icon based on `source`. */
  icon?: string;
}

interface SicCalendarDayCell {
  date: Dayjs;
  inMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  tasks: SicCalendarEvent[];
  holidays: SicCalendarHoliday[];
}

type SicCalendarTaskLine = { task: SicCalendarEvent; moreCount?: undefined } | { task?: undefined; moreCount: number };

const BE_OFFSET = 543;
const MAX_HOLIDAY_BADGES = 3;
/** Below this rendered width (px), the calendar switches to its "compact" layout:
 *  abbreviated weekday names and holiday badges dropped to their own line. Covers
 *  phones and tablets — only genuinely wide (desktop) widths get the roomy layout. */
const COMPACT_MAX_WIDTH = 1024;

const HOLIDAY_SOURCE_META: Record<SicCalendarHolidaySource, { icon: string; color: string; label: string }> = {
  office: { icon: '🏢', color: '#6366f1', label: 'วันหยุดออฟฟิศ' },
  government: { icon: '🏛️', color: '#dc2626', label: 'วันหยุดราชการ' },
  bank: { icon: '🏦', color: '#059669', label: 'วันหยุดธนาคาร' },
  other: { icon: '📌', color: '#6b7280', label: 'วันหยุดอื่นๆ' },
};

function toEraYear(ceYear: number, era: SicCalendarEra): number {
  return era === 'BE' ? ceYear + BE_OFFSET : ceYear;
}

@Component({
  selector: 'sic-calendar',
  standalone: true,
  imports: [CommonModule, SicTooltipDirective],
  templateUrl: './sic-calendar.component.html',
  styleUrl: './sic-calendar.component.css',
})
export class SicCalendarComponent implements OnInit, OnDestroy {
  private readonly sicConfig = injectSicConfig();

  @Input() selected: Date | string | null = null;
  @Input() weekStartsOn: 0 | 1 = 0;
  /** Tasks — shown as icon+title lines (one per line, ellipsized) inside each day. */
  @Input() tasks: SicCalendarEvent[] = [];
  /** Holidays — shown as a cluster of overlapping circular badges inside each day. */
  @Input() holidays: SicCalendarHoliday[] = [];
  @Input() era: SicCalendarEra = this.sicConfig.era ?? 'CE';
  /** Show/hide the พ.ศ./ค.ศ. toggle button in the toolbar. Default true. */
  @Input() eraSwitcher = true;
  @Input() view: SicCalendarView = 'grid';
  /** dayjs locale code for month/weekday names. Import the matching `dayjs/locale/<code>`
   *  package yourself before use — dayjs falls back to English for unregistered locales. */
  @Input() locale = this.sicConfig.locale ?? 'en';
  /** Max task lines shown per day cell (grid view) before the last line collapses into "ดูเพิ่มเติม". */
  @Input() maxVisibleTasks = 3;

  @Output() selectedChange = new EventEmitter<Date>();
  @Output() eraChange = new EventEmitter<SicCalendarEra>();
  @Output() viewChange = new EventEmitter<SicCalendarView>();
  @Output() dateClick = new EventEmitter<{ date: Date; tasks: SicCalendarEvent[]; holidays: SicCalendarHoliday[] }>();
  @Output() eventClick = new EventEmitter<SicCalendarEvent>();
  @Output() holidayClick = new EventEmitter<SicCalendarHoliday>();
  /** Fires whenever the viewed month changes (prev/next/today nav) with the first day of the new month. */
  @Output() monthChange = new EventEmitter<Date>();

  @HostBinding('class.sic-calendar-host') readonly hostClass = true;
  @HostBinding('class.sic-calendar-host--compact') get compactHostClass(): boolean {
    return this.compact;
  }

  get noEventsText(): string {
    return this.sicConfig.messages?.noEvents ?? 'No events';
  }

  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly cdr = inject(ChangeDetectorRef);
  private resizeObserver?: ResizeObserver;

  viewDate = dayjs();

  /**
   * True once the calendar's own rendered width drops below `COMPACT_MAX_WIDTH`
   * — measured with a `ResizeObserver` on the host rather than a CSS media/container
   * query so it works reliably regardless of container-query support, and reflects
   * the calendar's actual embedded width rather than the browser window's.
   */
  compact = false;

  sidebarOpen = false;
  sidebarKind: 'holiday' | 'task' | null = null;
  sidebarDate: Dayjs | null = null;
  sidebarHolidays: SicCalendarHoliday[] = [];
  sidebarTasks: SicCalendarEvent[] = [];

  monthYearPickerOpen = false;

  get monthLabel(): string {
    const d = this.viewDate.locale(this.locale);
    return `${d.format('MMMM')} ${toEraYear(d.year(), this.era)}`;
  }

  /** Abbreviated weekday labels (mobile). See `orderedWeekdayFullLabels` for the desktop variant. */
  get orderedWeekdayLabels(): string[] {
    const start = dayjs().locale(this.locale).day(this.weekStartsOn);
    return Array.from({ length: 7 }, (_, i) => start.add(i, 'day').format('dd'));
  }

  /** Full weekday names — shown instead of `orderedWeekdayLabels` above a CSS breakpoint (desktop). */
  get orderedWeekdayFullLabels(): string[] {
    const start = dayjs().locale(this.locale).day(this.weekStartsOn);
    return Array.from({ length: 7 }, (_, i) => start.add(i, 'day').format('dddd'));
  }

  get dayCells(): SicCalendarDayCell[] {
    const month = this.viewDate.month();
    const startOffset = (this.viewDate.startOf('month').day() - this.weekStartsOn + 7) % 7;
    const gridStart = this.viewDate.startOf('month').subtract(startOffset, 'day');
    const today = dayjs();
    const selected = this.selectedDate;

    return Array.from({ length: 42 }, (_, i) => {
      const date = gridStart.add(i, 'day');

      return {
        date,
        inMonth: date.month() === month,
        isToday: date.isSame(today, 'day'),
        isSelected: !!selected && date.isSame(selected, 'day'),
        tasks: this.tasksForDate(date),
        holidays: this.holidaysForDate(date),
      };
    });
  }

  get agendaDays(): SicCalendarDayCell[] {
    const start = this.viewDate.startOf('month');
    const daysInMonth = this.viewDate.daysInMonth();
    const today = dayjs();
    const selected = this.selectedDate;

    return Array.from({ length: daysInMonth }, (_, i) => {
      const date = start.add(i, 'day');

      return {
        date,
        inMonth: true,
        isToday: date.isSame(today, 'day'),
        isSelected: !!selected && date.isSame(selected, 'day'),
        tasks: this.tasksForDate(date),
        holidays: this.holidaysForDate(date),
      };
    });
  }

  get monthOptions(): { value: number; label: string }[] {
    return Array.from({ length: 12 }, (_, month) => ({
      value: month,
      label: dayjs().month(month).locale(this.locale).format('MMMM'),
    }));
  }

  /** A 21-year window centered on the currently viewed year. */
  get yearOptions(): number[] {
    const base = this.viewDate.year();
    return Array.from({ length: 21 }, (_, i) => base - 10 + i);
  }

  yearOptionLabel(year: number): string {
    return String(toEraYear(year, this.era));
  }

  get sidebarTitle(): string {
    if (!this.sidebarDate) {
      return '';
    }

    const d = this.sidebarDate.locale(this.locale);
    return `${d.format('D MMMM')} ${toEraYear(d.year(), this.era)}`;
  }

  private get selectedDate(): Dayjs | null {
    if (!this.selected) {
      return null;
    }

    const d = dayjs(this.selected);
    return d.isValid() ? d : null;
  }

  private tasksForDate(date: Dayjs): SicCalendarEvent[] {
    return this.tasks.filter((task) => dayjs(task.date).isSame(date, 'day'));
  }

  private holidaysForDate(date: Dayjs): SicCalendarHoliday[] {
    return this.holidays.filter((holiday) => dayjs(holiday.date).isSame(date, 'day'));
  }

  visibleHolidayBadges(dayHolidays: SicCalendarHoliday[]): SicCalendarHoliday[] {
    return dayHolidays.slice(0, MAX_HOLIDAY_BADGES);
  }

  hiddenHolidayCount(dayHolidays: SicCalendarHoliday[]): number {
    return Math.max(0, dayHolidays.length - MAX_HOLIDAY_BADGES);
  }

  getTaskLines(dayTasks: SicCalendarEvent[]): SicCalendarTaskLine[] {
    if (dayTasks.length <= this.maxVisibleTasks) {
      return dayTasks.map((task) => ({ task }));
    }

    const visible = dayTasks.slice(0, Math.max(0, this.maxVisibleTasks - 1));
    const hiddenCount = dayTasks.length - visible.length;
    return [...visible.map((task) => ({ task }) as SicCalendarTaskLine), { moreCount: hiddenCount }];
  }

  holidayIcon(holiday: SicCalendarHoliday): string {
    return holiday.icon ?? HOLIDAY_SOURCE_META[holiday.source ?? 'other'].icon;
  }

  holidayColor(holiday: SicCalendarHoliday): string {
    return holiday.color ?? HOLIDAY_SOURCE_META[holiday.source ?? 'other'].color;
  }

  holidaySourceLabel(holiday: SicCalendarHoliday): string {
    return HOLIDAY_SOURCE_META[holiday.source ?? 'other'].label;
  }

  eventTooltip(event: SicCalendarEvent): string {
    return event.description ? `${event.title} — ${event.description}` : event.title;
  }

  selectDate(cell: SicCalendarDayCell): void {
    const date = cell.date.toDate();
    this.selected = date;
    this.selectedChange.emit(date);
    this.dateClick.emit({ date, tasks: cell.tasks, holidays: cell.holidays });
  }

  handleEventClick(nativeEvent: MouseEvent, event: SicCalendarEvent): void {
    nativeEvent.stopPropagation();
    this.eventClick.emit(event);
  }

  handleHolidayClick(holiday: SicCalendarHoliday): void {
    this.holidayClick.emit(holiday);
  }

  openHolidaySidebar(nativeEvent: MouseEvent, date: Dayjs, dayHolidays: SicCalendarHoliday[]): void {
    nativeEvent.stopPropagation();
    this.sidebarKind = 'holiday';
    this.sidebarDate = date;
    this.sidebarHolidays = dayHolidays;
    this.sidebarOpen = true;
  }

  openTaskSidebar(nativeEvent: MouseEvent, date: Dayjs, dayTasks: SicCalendarEvent[]): void {
    nativeEvent.stopPropagation();
    this.sidebarKind = 'task';
    this.sidebarDate = date;
    this.sidebarTasks = dayTasks;
    this.sidebarOpen = true;
  }

  closeSidebar(): void {
    this.sidebarOpen = false;
  }

  toggleMonthYearPicker(nativeEvent: MouseEvent): void {
    nativeEvent.stopPropagation();
    this.monthYearPickerOpen = !this.monthYearPickerOpen;
  }

  selectPickerMonth(month: number): void {
    this.setViewDate(this.viewDate.month(month));
  }

  selectPickerYear(year: number): void {
    this.setViewDate(this.viewDate.year(year));
  }

  @HostListener('document:click', ['$event'])
  handleDocumentClick(event: MouseEvent): void {
    if (this.monthYearPickerOpen && !this.elementRef.nativeElement.contains(event.target as Node)) {
      this.monthYearPickerOpen = false;
    }
  }

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId) || typeof ResizeObserver === 'undefined') {
      return;
    }

    this.resizeObserver = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width ?? this.elementRef.nativeElement.getBoundingClientRect().width;
      const nextCompact = width < COMPACT_MAX_WIDTH;
      if (nextCompact !== this.compact) {
        this.compact = nextCompact;
        this.cdr.markForCheck();
      }
    });
    this.resizeObserver.observe(this.elementRef.nativeElement);
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
  }

  prevMonth(): void {
    this.setViewDate(this.viewDate.subtract(1, 'month'));
  }

  nextMonth(): void {
    this.setViewDate(this.viewDate.add(1, 'month'));
  }

  goToToday(): void {
    this.setViewDate(dayjs());
  }

  private setViewDate(next: Dayjs): void {
    const monthChanged = !next.isSame(this.viewDate, 'month') || !next.isSame(this.viewDate, 'year');
    this.viewDate = next;

    if (monthChanged) {
      this.monthChange.emit(next.startOf('month').toDate());
    }
  }

  toggleEra(): void {
    this.era = this.era === 'BE' ? 'CE' : 'BE';
    this.eraChange.emit(this.era);
  }

  setView(view: SicCalendarView): void {
    if (this.view === view) {
      return;
    }

    this.view = view;
    this.viewChange.emit(view);
  }
}
