import { Component, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import dayjs from 'dayjs';
import 'dayjs/locale/th';
import { SIC_CONFIG } from '../../config/sic-config';
import { SicCalendarComponent, SicCalendarEra, SicCalendarEvent, SicCalendarHoliday, SicCalendarView } from './sic-calendar.component';

@Component({
  standalone: true,
  imports: [SicCalendarComponent],
  template: `
    <sic-calendar
      #calendar
      [selected]="selected"
      [tasks]="tasks"
      [holidays]="holidays"
      [era]="era"
      [view]="view"
      [locale]="locale"
      (selectedChange)="selected = $event"
      (dateClick)="onDateClick($event)"
      (eventClick)="onEventClick($event)"
      (holidayClick)="onHolidayClick($event)"
      (eraChange)="era = $event"
      (viewChange)="view = $event"
      (monthChange)="onMonthChange($event)"
    />
  `,
})
class HostComponent {
  @ViewChild('calendar') calendar!: SicCalendarComponent;

  selected: Date | null = null;
  era: SicCalendarEra = 'CE';
  view: SicCalendarView = 'grid';
  locale = 'en';
  tasks: SicCalendarEvent[] = [
    { id: 1, date: '2026-07-15', title: 'Task A', icon: 'A', color: '#3b82f6' },
    { id: 2, date: '2026-07-15', title: 'Task B', icon: 'B', color: '#22c55e' },
    { id: 3, date: '2026-07-15', title: 'Task C', icon: 'C', color: '#f59e0b' },
    { id: 4, date: '2026-07-15', title: 'Task D', icon: 'D', color: '#ef4444' },
    { id: 5, date: '2026-07-20', title: 'Task E', icon: 'E', color: '#8b5cf6' },
  ];
  holidays: SicCalendarHoliday[] = [
    { id: 1, date: '2026-07-15', title: 'Office Holiday', source: 'office' },
    { id: 2, date: '2026-07-15', title: 'Government Holiday', source: 'government' },
  ];

  dateClicks: { date: Date; tasks: SicCalendarEvent[]; holidays: SicCalendarHoliday[] }[] = [];
  eventClicks: SicCalendarEvent[] = [];
  holidayClicks: SicCalendarHoliday[] = [];
  monthChanges: Date[] = [];

  onDateClick(event: { date: Date; tasks: SicCalendarEvent[]; holidays: SicCalendarHoliday[] }): void {
    this.dateClicks.push(event);
  }

  onEventClick(event: SicCalendarEvent): void {
    this.eventClicks.push(event);
  }

  onHolidayClick(holiday: SicCalendarHoliday): void {
    this.holidayClicks.push(holiday);
  }

  onMonthChange(date: Date): void {
    this.monthChanges.push(date);
  }
}

describe('SicCalendarComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [HostComponent] }).compileComponents();
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
    host.calendar.viewDate = dayjs('2026-07-01');
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  function findCell(day: number): HTMLButtonElement {
    const cells: HTMLButtonElement[] = Array.from(fixture.nativeElement.querySelectorAll('.sic-calendar__cell'));
    return cells.find((cell) => cell.querySelector('.sic-calendar__cell-date')?.textContent?.trim() === `${day}`)!;
  }

  it('renders a 42-cell month grid', () => {
    expect(fixture.nativeElement.querySelectorAll('.sic-calendar__cell').length).toBe(42);
  });

  it('shows task lines capped at maxVisibleTasks, collapsing the rest into a "ดูเพิ่มเติม (+N)" line', () => {
    const july15 = findCell(15);
    const lines = july15.querySelectorAll('.sic-calendar__task-line:not(.sic-calendar__task-line--more)');
    const moreLine = july15.querySelector('.sic-calendar__task-line--more');

    expect(lines.length).toBe(2);
    expect(moreLine?.textContent).toContain('ดูเพิ่มเติม (+2)');
  });

  it('shows an overlapping holiday badge cluster for a day with holidays', () => {
    const july15 = findCell(15);
    const badges = july15.querySelectorAll('.sic-calendar__holiday-badge');
    expect(badges.length).toBe(2);
  });

  it('clicking a day cell selects it and emits dateClick with that day\'s tasks/holidays', () => {
    findCell(20).click();
    fixture.detectChanges();

    expect(host.selected?.getDate()).toBe(20);
    expect(host.dateClicks.length).toBe(1);
    expect(host.dateClicks[0].tasks.map((t) => t.title)).toEqual(['Task E']);
    expect(host.dateClicks[0].holidays).toEqual([]);
  });

  it('clicking a task line emits eventClick without also triggering the cell\'s dateClick', () => {
    const taskLine: HTMLElement = findCell(15).querySelector('.sic-calendar__task-line:not(.sic-calendar__task-line--more)')!;
    taskLine.click();
    fixture.detectChanges();

    expect(host.eventClicks.length).toBe(1);
    expect(host.eventClicks[0].title).toBe('Task A');
    expect(host.dateClicks.length).toBe(0);
  });

  it('clicking "ดูเพิ่มเติม" opens the right-hand sidebar listing all of that day\'s tasks', () => {
    const moreLine: HTMLElement = findCell(15).querySelector('.sic-calendar__task-line--more')!;
    moreLine.click();
    fixture.detectChanges();

    const sidebar: HTMLElement = fixture.nativeElement.querySelector('.sic-calendar__sidebar');
    expect(sidebar.classList.contains('sic-calendar__sidebar--open')).toBe(true);

    const items = fixture.nativeElement.querySelectorAll('.sic-calendar__sidebar-item');
    expect(items.length).toBe(4);
    expect(items[0].textContent).toContain('Task A');

    expect(host.dateClicks.length).toBe(0);
  });

  it('clicking the holiday badge cluster opens the sidebar listing holidays and emits holidayClick on item click', () => {
    const cluster: HTMLElement = findCell(15).querySelector('.sic-calendar__holiday-stack')!;
    cluster.click();
    fixture.detectChanges();

    const sidebar: HTMLElement = fixture.nativeElement.querySelector('.sic-calendar__sidebar');
    expect(sidebar.classList.contains('sic-calendar__sidebar--open')).toBe(true);

    const items: HTMLButtonElement[] = Array.from(fixture.nativeElement.querySelectorAll('.sic-calendar__sidebar-item'));
    expect(items.length).toBe(2);

    items[0].click();
    fixture.detectChanges();
    expect(host.holidayClicks.length).toBe(1);
    expect(host.holidayClicks[0].title).toBe('Office Holiday');

    expect(host.dateClicks.length).toBe(0);
  });

  it('closing the sidebar via the close button or backdrop hides it again', () => {
    findCell(15).querySelector<HTMLElement>('.sic-calendar__holiday-stack')!.click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.sic-calendar__sidebar').classList.contains('sic-calendar__sidebar--open')).toBe(true);

    (fixture.nativeElement.querySelector('.sic-calendar__sidebar-close') as HTMLElement).click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.sic-calendar__sidebar').classList.contains('sic-calendar__sidebar--open')).toBe(false);

    findCell(15).querySelector<HTMLElement>('.sic-calendar__holiday-stack')!.click();
    fixture.detectChanges();
    (fixture.nativeElement.querySelector('.sic-calendar__sidebar-backdrop') as HTMLElement).click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.sic-calendar__sidebar').classList.contains('sic-calendar__sidebar--open')).toBe(false);
  });

  it('navigating to the next/previous month emits monthChange with the first day of the new month', () => {
    const nextBtn: HTMLButtonElement = fixture.nativeElement.querySelector('.sic-calendar__nav-btn[aria-label="Next month"]');
    const prevBtn: HTMLButtonElement = fixture.nativeElement.querySelector('.sic-calendar__nav-btn[aria-label="Previous month"]');

    nextBtn.click();
    fixture.detectChanges();

    expect(host.monthChanges.length).toBe(1);
    expect(host.monthChanges[0].getMonth()).toBe(7); // August (0-indexed)
    expect(host.monthChanges[0].getDate()).toBe(1);

    prevBtn.click();
    fixture.detectChanges();

    expect(host.monthChanges.length).toBe(2);
    expect(host.monthChanges[1].getMonth()).toBe(6); // back to July
  });

  it('does not emit a duplicate monthChange when the navigation lands back on the same month', () => {
    const nextBtn: HTMLButtonElement = fixture.nativeElement.querySelector('.sic-calendar__nav-btn[aria-label="Next month"]');
    const todayBtn: HTMLButtonElement = fixture.nativeElement.querySelector('.sic-calendar__today-btn');

    todayBtn.click();
    fixture.detectChanges();
    const countAfterFirstToday = host.monthChanges.length;

    nextBtn.click();
    fixture.detectChanges();
    expect(host.monthChanges.length).toBe(countAfterFirstToday + 1);

    todayBtn.click();
    fixture.detectChanges();
    const countAfterSecondToday = host.monthChanges.length;

    todayBtn.click();
    fixture.detectChanges();
    expect(host.monthChanges.length).toBe(countAfterSecondToday);
  });

  it('toggling the era button switches the header year between CE and BE (+543) and emits eraChange', () => {
    const eraBtn: HTMLButtonElement = fixture.nativeElement.querySelector('.sic-calendar__era-btn');
    expect(fixture.nativeElement.querySelector('.sic-calendar__title').textContent).toContain('2026');

    eraBtn.click();
    fixture.detectChanges();

    expect(host.era).toBe('BE');
    expect(fixture.nativeElement.querySelector('.sic-calendar__title').textContent).toContain('2569');
  });

  it('switching to list view renders one agenda row per day of the month with colored task cards and holiday badges', () => {
    const listBtn: HTMLButtonElement = fixture.nativeElement.querySelectorAll('.sic-calendar__view-btn')[1];
    listBtn.click();
    fixture.detectChanges();

    expect(host.view).toBe('list');
    expect(fixture.nativeElement.querySelectorAll('.sic-calendar__agenda-row').length).toBe(31);
    expect(fixture.nativeElement.querySelectorAll('.sic-calendar__task').length).toBe(5);
    expect(fixture.nativeElement.querySelectorAll('.sic-calendar__holiday-badge').length).toBe(2);
  });

  it('clicking the title opens a month/year picker; picking a month or year jumps the view directly', () => {
    const titleBtn: HTMLButtonElement = fixture.nativeElement.querySelector('.sic-calendar__title');
    expect(fixture.nativeElement.querySelector('.sic-calendar__month-year-picker')).toBeNull();

    titleBtn.click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.sic-calendar__month-year-picker')).toBeTruthy();

    const monthButtons: HTMLButtonElement[] = Array.from(fixture.nativeElement.querySelectorAll('.sic-calendar__picker-month'));
    const december = monthButtons.find((btn) => btn.textContent?.trim() === 'December')!;
    december.click();
    fixture.detectChanges();

    expect(host.calendar.viewDate.month()).toBe(11);
    expect(fixture.nativeElement.querySelector('.sic-calendar__title').textContent).toContain('December');
    // Picking a month doesn't auto-close the picker, so the year list is still open here.
    const yearButtons: HTMLButtonElement[] = Array.from(fixture.nativeElement.querySelectorAll('.sic-calendar__picker-year'));
    const year2030 = yearButtons.find((btn) => btn.textContent?.trim() === '2030')!;
    year2030.click();
    fixture.detectChanges();

    expect(host.calendar.viewDate.year()).toBe(2030);
    expect(fixture.nativeElement.querySelector('.sic-calendar__title').textContent).toContain('2030');
  });

  it('clicking outside the month/year picker closes it', () => {
    (fixture.nativeElement.querySelector('.sic-calendar__title') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.sic-calendar__month-year-picker')).toBeTruthy();

    document.body.click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.sic-calendar__month-year-picker')).toBeNull();
  });
});

@Component({
  standalone: true,
  imports: [SicCalendarComponent],
  template: `<sic-calendar #calendar [eraSwitcher]="false" />`,
})
class EraSwitcherDisabledHostComponent {
  @ViewChild('calendar') calendar!: SicCalendarComponent;
}

describe('SicCalendarComponent eraSwitcher = false', () => {
  it('hides the พ.ศ./ค.ศ. toggle button', async () => {
    await TestBed.configureTestingModule({ imports: [EraSwitcherDisabledHostComponent] }).compileComponents();
    const fixture = TestBed.createComponent(EraSwitcherDisabledHostComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.sic-calendar__era-btn')).toBeNull();

    fixture.destroy();
  });
});

@Component({
  standalone: true,
  imports: [SicCalendarComponent],
  template: `<sic-calendar #calendar locale="th" />`,
})
class ThaiLocaleHostComponent {
  @ViewChild('calendar') calendar!: SicCalendarComponent;
}

describe('SicCalendarComponent locale="th"', () => {
  const thaiMonthNames = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม',
  ];

  it('renders Thai month/weekday names, like sic-datepicker', async () => {
    await TestBed.configureTestingModule({ imports: [ThaiLocaleHostComponent] }).compileComponents();
    const fixture = TestBed.createComponent(ThaiLocaleHostComponent);
    fixture.detectChanges();

    const title = fixture.nativeElement.querySelector('.sic-calendar__title').textContent as string;
    expect(thaiMonthNames.some((month) => title.includes(month))).toBe(true);

    const weekdayHeaders = (root: HTMLElement): string[] =>
      Array.from(root.querySelectorAll('.sic-calendar__weekdays span')).map((el) => (el as HTMLElement).textContent!.trim());

    // Desktop width (default `compact = false`, since JSDOM has no ResizeObserver
    // to flip it) shows the full weekday name.
    expect(weekdayHeaders(fixture.nativeElement)).toContain('อาทิตย์');
    expect(weekdayHeaders(fixture.nativeElement)).not.toContain('อา.');

    fixture.destroy();

    // `compact` isn't an @Input, and mutating it post-render on an already-composed
    // fixture doesn't reliably re-render in this harness — so verify the abbreviated
    // form on a fresh instance with `compact` set before the very first detectChanges.
    const compactFixture = TestBed.createComponent(SicCalendarComponent);
    compactFixture.componentInstance.locale = 'th';
    compactFixture.componentInstance.compact = true;
    compactFixture.detectChanges();

    expect(weekdayHeaders(compactFixture.nativeElement)).toContain('อา.');
    expect(weekdayHeaders(compactFixture.nativeElement)).not.toContain('อาทิตย์');

    compactFixture.destroy();
  });
});

describe('SicCalendarComponent SIC_CONFIG defaults', () => {
  it('falls back to era/locale from SIC_CONFIG when the caller does not bind them', async () => {
    await TestBed.configureTestingModule({
      imports: [SicCalendarComponent],
      providers: [{ provide: SIC_CONFIG, useValue: { era: 'BE', locale: 'th' } }],
    }).compileComponents();
    const fixture = TestBed.createComponent(SicCalendarComponent);

    expect(fixture.componentInstance.era).toBe('BE');
    expect(fixture.componentInstance.locale).toBe('th');
  });

  it('uses SIC_CONFIG.messages.noEvents for the agenda empty state', async () => {
    await TestBed.configureTestingModule({
      imports: [SicCalendarComponent],
      providers: [{ provide: SIC_CONFIG, useValue: { messages: { noEvents: 'ไม่มีกิจกรรม' } } }],
    }).compileComponents();
    const fixture = TestBed.createComponent(SicCalendarComponent);
    fixture.componentInstance.view = 'list';
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.sic-calendar__agenda-empty')?.textContent).toBe('ไม่มีกิจกรรม');
  });
});
