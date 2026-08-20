import { CommonModule } from '@angular/common';
import {
  Component,
  ContentChild,
  ElementRef,
  EventEmitter,
  HostBinding,
  Input,
  Output,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import dayjs, { Dayjs } from 'dayjs';
import { injectSicConfig } from '../../config/sic-config';
import { SicPopoverButtonDirective, SicPopoverListDirective } from '../sic-popover/sic-popover-template.directive';
import { SicPopoverComponent } from '../sic-popover/sic-popover.component';
import { SicCalendarTimelinePhase, SicCalendarTimelineRow } from './sic-calendar-timeline.model';

/** 'BE' = พุทธศักราช (CE year + 543), 'CE' = คริสต์ศักราช. Storage/output dates are always real (CE) dates — this only changes the year shown to the user. */
export type SicCalendarTimelineEra = 'BE' | 'CE';
export type SicCalendarTimelineViewMode = 'day' | 'week' | 'month';

/** Template context for `#labelTemplate`: `let-row let-index="index"`. */
export interface SicCalendarTimelineLabelContext<T> {
  $implicit: SicCalendarTimelineRow<T>;
  index: number;
}

/** Template context for `#phaseTemplate`: `let-phase let-row="row" let-index="index"`. */
export interface SicCalendarTimelinePhaseContext<T> {
  $implicit: SicCalendarTimelinePhase;
  row: SicCalendarTimelineRow<T>;
  index: number;
}

interface SicCalendarTimelineColumn {
  start: Dayjs;
  end: Dayjs;
  label: string;
  sublabel?: string;
  isWeekend: boolean;
  isToday: boolean;
}

interface SicCalendarTimelineGroup {
  label: string;
  span: number;
}

interface SicCalendarTimelinePhasePosition {
  phase: SicCalendarTimelinePhase;
  colStart: number;
  colSpan: number;
}

interface SicCalendarTimelineViewModeOption {
  value: SicCalendarTimelineViewMode;
  label: string;
}

const BE_OFFSET = 543;

function toEraYear(ceYear: number, era: SicCalendarTimelineEra): number {
  return era === 'BE' ? ceYear + BE_OFFSET : ceYear;
}

function asDayjs(value: Date | string): Dayjs {
  return dayjs(value);
}

/**
 * Gantt-style timeline: a collapsible row-label column on the left, and a day/week/month grid on
 * the right where each row's `phases` render as positioned bars. `[startDate]`/`[endDate]` set the
 * visible range; `[viewMode]` controls the column granularity. Header/year formatting goes through
 * dayjs — set `[locale]` (import the matching `dayjs/locale/<code>` package yourself, e.g.
 * `dayjs/locale/th`, for localized weekday/month names) and `[era]` ('BE' shows พ.ศ., 'CE' shows
 * ค.ศ., default from `SIC_CONFIG.era`). Customize row rendering via `#labelTemplate` and bar
 * rendering via `#phaseTemplate`.
 */
@Component({
  selector: 'sic-calendar-timeline',
  standalone: true,
  imports: [CommonModule, SicPopoverComponent, SicPopoverButtonDirective, SicPopoverListDirective],
  templateUrl: './sic-calendar-timeline.component.html',
  styleUrl: './sic-calendar-timeline.component.css',
})
export class SicCalendarTimelineComponent<T = unknown> {
  private readonly sicConfig = injectSicConfig();
  private syncingScroll = false;

  @Input() items: SicCalendarTimelineRow<T>[] = [];
  @Input() startDate: Date | string = dayjs().startOf('month').toDate();
  @Input() endDate: Date | string = dayjs().endOf('month').toDate();
  @Input() viewMode: SicCalendarTimelineViewMode = 'day';
  /** Which view-mode choices the built-in `[showViewModeToggle]` popover offers, in order. Default: all three. */
  @Input() viewModeOptions: SicCalendarTimelineViewMode[] = ['day', 'week', 'month'];
  /** Shows/hides the built-in day/week/month switcher (a `sic-popover` above the grid). Default: true. */
  @Input() showViewModeToggle = true;
  @Input() era: SicCalendarTimelineEra = this.sicConfig.era ?? 'CE';
  /** dayjs locale code for weekday/month names. Import the matching `dayjs/locale/<code>`
   *  package yourself before use (e.g. `import 'dayjs/locale/th';` then `locale="th"`) — dayjs
   *  falls back to English for unregistered locales. */
  @Input() locale = this.sicConfig.locale ?? 'en';
  /** Shows/hides the row-label column (bindable with `[(showLabelColumn)]`). */
  @Input() showLabelColumn = true;
  /** Caps the row area's height (any CSS length) and makes it scroll — both label rows and the
   *  timeline grid scroll together — instead of growing unbounded with the item count. */
  @Input() maxHeight: string | null = '28rem';

  @Output() showLabelColumnChange = new EventEmitter<boolean>();
  @Output() viewModeChange = new EventEmitter<SicCalendarTimelineViewMode>();
  @Output() phaseClick = new EventEmitter<{ row: SicCalendarTimelineRow<T>; phase: SicCalendarTimelinePhase }>();
  @Output() rowClick = new EventEmitter<SicCalendarTimelineRow<T>>();

  @ViewChild('labelsPane') private labelsPaneRef?: ElementRef<HTMLElement>;
  @ViewChild('gridPane') private gridPaneRef?: ElementRef<HTMLElement>;

  /** `<ng-template #labelTemplate let-row let-index="index">` overrides the row-label cell. */
  @ContentChild('labelTemplate') labelTemplate?: TemplateRef<SicCalendarTimelineLabelContext<T>>;
  /** `<ng-template #phaseTemplate let-phase let-row="row" let-index="index">` overrides how each phase bar renders. */
  @ContentChild('phaseTemplate') phaseTemplate?: TemplateRef<SicCalendarTimelinePhaseContext<T>>;

  @HostBinding('class.sic-calendar-timeline-host') readonly hostClass = true;

  get noItemsText(): string {
    return this.sicConfig.messages?.noItems ?? 'No items';
  }

  get viewModeLabelText(): string {
    return this.sicConfig.messages?.calendarTimelineViewLabel ?? 'View';
  }

  get viewModeItems(): SicCalendarTimelineViewModeOption[] {
    return this.viewModeOptions.map((value) => ({ value, label: this.viewModeLabel(value) }));
  }

  get activeViewModeLabel(): string {
    return this.viewModeLabel(this.viewMode);
  }

  private viewModeLabel(mode: SicCalendarTimelineViewMode): string {
    switch (mode) {
      case 'day':
        return this.sicConfig.messages?.calendarTimelineDay ?? 'Day';
      case 'week':
        return this.sicConfig.messages?.calendarTimelineWeek ?? 'Week';
      case 'month':
        return this.sicConfig.messages?.calendarTimelineMonth ?? 'Month';
    }
  }

  private get start(): Dayjs {
    return asDayjs(this.startDate).startOf('day');
  }

  private get end(): Dayjs {
    return asDayjs(this.endDate).endOf('day');
  }

  get columns(): SicCalendarTimelineColumn[] {
    const today = dayjs();
    const start = this.start;
    const end = this.end;

    if (this.viewMode === 'month') {
      const cols: SicCalendarTimelineColumn[] = [];
      let cursor = start.startOf('month');
      while (cursor.isBefore(end) || cursor.isSame(end, 'month')) {
        const colStart = cursor.startOf('month');
        const colEnd = cursor.endOf('month');
        cols.push({
          start: colStart,
          end: colEnd,
          label: colStart.locale(this.locale).format('MMMM'),
          sublabel: String(toEraYear(colStart.year(), this.era)),
          isWeekend: false,
          isToday: today.isSame(colStart, 'month'),
        });
        cursor = cursor.add(1, 'month');
      }
      return cols;
    }

    if (this.viewMode === 'week') {
      const cols: SicCalendarTimelineColumn[] = [];
      let cursor = start.startOf('week');
      while (cursor.isBefore(end) || cursor.isSame(end, 'week')) {
        const colStart = cursor.startOf('week');
        const colEnd = cursor.endOf('week');
        cols.push({
          start: colStart,
          end: colEnd,
          label: colStart.locale(this.locale).format('D MMM'),
          sublabel: String(toEraYear(colStart.year(), this.era)),
          isWeekend: false,
          isToday: today.isAfter(colStart) && today.isBefore(colEnd.add(1, 'day')),
        });
        cursor = cursor.add(1, 'week');
      }
      return cols;
    }

    // day
    const cols: SicCalendarTimelineColumn[] = [];
    let cursor = start.startOf('day');
    while (cursor.isBefore(end) || cursor.isSame(end, 'day')) {
      const dow = cursor.day();
      cols.push({
        start: cursor,
        end: cursor.endOf('day'),
        label: cursor.locale(this.locale).format('D'),
        sublabel: cursor.locale(this.locale).format('ddd'),
        isWeekend: dow === 0 || dow === 6,
        isToday: cursor.isSame(today, 'day'),
      });
      cursor = cursor.add(1, 'day');
    }
    return cols;
  }

  /** Month/year super-header spanning the day/week columns underneath it — not shown in month view, where each column already is a month. */
  get groups(): SicCalendarTimelineGroup[] {
    if (this.viewMode === 'month') {
      return [];
    }

    const cols = this.columns;
    const groups: SicCalendarTimelineGroup[] = [];

    for (const col of cols) {
      const label = `${col.start.locale(this.locale).format('MMMM')} ${toEraYear(col.start.year(), this.era)}`;
      const last = groups[groups.length - 1];
      if (last && last.label === label) {
        last.span += 1;
      } else {
        groups.push({ label, span: 1 });
      }
    }

    return groups;
  }

  get gridTemplateColumns(): string {
    const minWidth = this.viewMode === 'month' ? '7rem' : this.viewMode === 'week' ? '5.5rem' : '2.75rem';
    return `repeat(${Math.max(this.columns.length, 1)}, minmax(${minWidth}, 1fr))`;
  }

  phasePositions(row: SicCalendarTimelineRow<T>): SicCalendarTimelinePhasePosition[] {
    const cols = this.columns;
    if (!cols.length) {
      return [];
    }

    const rangeStart = cols[0].start;
    const rangeEnd = cols[cols.length - 1].end;
    const positions: SicCalendarTimelinePhasePosition[] = [];

    for (const phase of row.phases) {
      const phaseStart = asDayjs(phase.start);
      const phaseEnd = asDayjs(phase.end);
      if (phaseEnd.isBefore(rangeStart) || phaseStart.isAfter(rangeEnd)) {
        continue;
      }

      const startIdx = cols.findIndex((col) => !phaseStart.isAfter(col.end));
      let endIdx = -1;
      for (let i = cols.length - 1; i >= 0; i--) {
        if (!phaseEnd.isBefore(cols[i].start)) {
          endIdx = i;
          break;
        }
      }

      const safeStart = Math.max(0, startIdx);
      const safeEnd = Math.max(safeStart, endIdx < 0 ? cols.length - 1 : endIdx);

      positions.push({
        phase,
        colStart: safeStart + 1,
        colSpan: safeEnd - safeStart + 1,
      });
    }

    return positions;
  }

  trackByFn = (_index: number, row: SicCalendarTimelineRow<T>): unknown => row.id;

  toggleLabelColumn(): void {
    this.showLabelColumn = !this.showLabelColumn;
    this.showLabelColumnChange.emit(this.showLabelColumn);
  }

  selectViewMode(option: SicCalendarTimelineViewModeOption): void {
    if (option.value === this.viewMode) {
      return;
    }

    this.viewMode = option.value;
    this.viewModeChange.emit(this.viewMode);
  }

  handlePhaseClick(row: SicCalendarTimelineRow<T>, phase: SicCalendarTimelinePhase): void {
    this.phaseClick.emit({ row, phase });
  }

  handleRowClick(row: SicCalendarTimelineRow<T>): void {
    this.rowClick.emit(row);
  }

  /** Keeps the label column's rows and the timeline grid's rows scrolled to the same vertical
   *  offset — they're two independently-scrollable panes (only the grid pane scrolls horizontally). */
  onLabelsScroll(): void {
    this.syncScroll(this.labelsPaneRef, this.gridPaneRef);
  }

  onGridScroll(): void {
    this.syncScroll(this.gridPaneRef, this.labelsPaneRef);
  }

  private syncScroll(from?: ElementRef<HTMLElement>, to?: ElementRef<HTMLElement>): void {
    if (this.syncingScroll || !from || !to) {
      return;
    }

    this.syncingScroll = true;
    to.nativeElement.scrollTop = from.nativeElement.scrollTop;
    this.syncingScroll = false;
  }
}
