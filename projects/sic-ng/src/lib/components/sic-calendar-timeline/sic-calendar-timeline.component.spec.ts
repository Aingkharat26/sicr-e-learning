import { ApplicationRef, Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import 'dayjs/locale/th';
import { SicCalendarTimelineComponent } from './sic-calendar-timeline.component';
import { SicCalendarTimelineRow } from './sic-calendar-timeline.model';

const rows: SicCalendarTimelineRow[] = [
  {
    id: 1,
    label: 'Lorem ipsum 0',
    progress: 72,
    phases: [{ label: 'Phase A', start: '2024-01-02', end: '2024-01-04', color: '#22c55e' }],
  },
  {
    id: 2,
    label: 'Lorem ipsum 1',
    progress: 89,
    phases: [],
  },
];

describe('SicCalendarTimelineComponent', () => {
  let fixture: ComponentFixture<SicCalendarTimelineComponent>;
  let component: SicCalendarTimelineComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [SicCalendarTimelineComponent] }).compileComponents();
    fixture = TestBed.createComponent(SicCalendarTimelineComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('items', rows);
    fixture.componentRef.setInput('startDate', '2024-01-01');
    fixture.componentRef.setInput('endDate', '2024-01-07');
    fixture.detectChanges();
  });

  function headerCells(): HTMLElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll('.sic-calendar-timeline__header-cell'));
  }

  function labelRows(): HTMLElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll('.sic-calendar-timeline__label-row'));
  }

  it('renders one day column per day in the range (inclusive)', () => {
    expect(headerCells().length).toBe(7);
    expect(headerCells()[0].textContent).toContain('1');
    expect(headerCells()[6].textContent).toContain('7');
  });

  it('renders week columns when viewMode="week"', () => {
    fixture.componentRef.setInput('viewMode', 'week');
    fixture.detectChanges();

    // Jan 1 2024 is a Monday; with a Sun-start week, 2024-01-01..07 spans 2 week columns (the week containing Dec31-Jan6, and the week containing Jan7-13).
    expect(headerCells().length).toBe(2);
  });

  it('renders month columns when viewMode="month"', () => {
    fixture.componentRef.setInput('startDate', '2024-01-15');
    fixture.componentRef.setInput('endDate', '2024-03-05');
    fixture.componentRef.setInput('viewMode', 'month');
    fixture.detectChanges();

    expect(headerCells().length).toBe(3);
    expect(headerCells()[0].textContent).toContain('January');
  });

  it('renders one row per item, with the label and progress', () => {
    const rowEls = labelRows();
    expect(rowEls.length).toBe(2);
    expect(rowEls[0].textContent).toContain('Lorem ipsum 0');
    expect(rowEls[0].textContent).toContain('72');
  });

  it('positions a phase at the correct day columns', () => {
    const phase = fixture.nativeElement.querySelector('.sic-calendar-timeline__phase') as HTMLElement;
    // start 2024-01-02 is column 2 (1-based), end 2024-01-04 is column 4 -> span 3
    expect(phase.style.gridColumn).toBe('2 / span 3');
  });

  it('clamps a phase that starts before the visible range to the first column', () => {
    fixture.componentRef.setInput('items', [
      { id: 1, label: 'Row', phases: [{ start: '2023-12-20', end: '2024-01-03', color: '#000' }] },
    ]);
    fixture.detectChanges();

    const phase = fixture.nativeElement.querySelector('.sic-calendar-timeline__phase') as HTMLElement;
    expect(phase.style.gridColumn).toBe('1 / span 3');
  });

  it('gives every cell an explicit grid-column so a wide phase (with its own explicit grid-column) does not push the auto-placement of later cells into the wrong column, leaving gaps with no grid line', () => {
    fixture.componentRef.setInput('items', [
      { id: 1, label: 'Row', phases: [{ start: '2024-01-01', end: '2024-01-05', color: '#000' }] },
    ]);
    fixture.detectChanges();

    const row = fixture.nativeElement.querySelector('.sic-calendar-timeline__row') as HTMLElement;
    const cells = Array.from(row.querySelectorAll('.sic-calendar-timeline__cell')) as HTMLElement[];
    expect(cells.length).toBe(7);
    cells.forEach((cell, i) => expect(cell.style.gridColumn).toBe(String(i + 1)));
  });

  it('excludes a phase entirely outside the visible range', () => {
    fixture.componentRef.setInput('items', [
      { id: 1, label: 'Row', phases: [{ start: '2024-02-01', end: '2024-02-05', color: '#000' }] },
    ]);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.sic-calendar-timeline__phase')).toBeNull();
  });

  it('shows พ.ศ. year in the month group header when era="BE"', () => {
    fixture.componentRef.setInput('era', 'BE');
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.sic-calendar-timeline__group')?.textContent).toContain('2567');
  });

  it('shows Thai weekday abbreviations when locale="th"', () => {
    fixture.componentRef.setInput('locale', 'th');
    fixture.detectChanges();

    // 2024-01-01 is a Monday -> dayjs('th').format('ddd') => "จ."
    expect(headerCells()[0].textContent).toContain('จ');
  });

  it('toggles the label column and emits showLabelColumnChange', () => {
    const spy = vi.fn();
    component.showLabelColumnChange.subscribe(spy);

    expect(fixture.nativeElement.querySelector('.sic-calendar-timeline__labels')).toBeTruthy();

    fixture.nativeElement.querySelector('.sic-calendar-timeline__toggle').click();
    fixture.detectChanges();

    expect(spy).toHaveBeenCalledWith(false);
    expect(fixture.nativeElement.querySelector('.sic-calendar-timeline__labels')).toBeNull();
  });

  it('emits rowClick and phaseClick', () => {
    const rowSpy = vi.fn();
    const phaseSpy = vi.fn();
    component.rowClick.subscribe(rowSpy);
    component.phaseClick.subscribe(phaseSpy);

    labelRows()[0].click();
    expect(rowSpy).toHaveBeenCalledWith(rows[0]);

    (fixture.nativeElement.querySelector('.sic-calendar-timeline__phase') as HTMLElement).click();
    expect(phaseSpy).toHaveBeenCalledWith({ row: rows[0], phase: rows[0].phases[0] });
  });

  it('shows the empty state when items is empty', () => {
    fixture.componentRef.setInput('items', []);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.sic-calendar-timeline__empty')?.textContent).toBe('No items');
  });

  it('shows a built-in view-mode switcher by default and hides it when showViewModeToggle is false', () => {
    expect(fixture.nativeElement.querySelector('.sic-calendar-timeline__toolbar')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.sic-calendar-timeline__view-btn')?.textContent).toContain('Day');

    fixture.componentRef.setInput('showViewModeToggle', false);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.sic-calendar-timeline__toolbar')).toBeNull();
  });

  it('switches viewMode via the popover and emits viewModeChange, without a native <select>', () => {
    expect(fixture.nativeElement.querySelector('select')).toBeNull();

    const spy = vi.fn();
    component.viewModeChange.subscribe(spy);

    fixture.nativeElement.querySelector('.sic-calendar-timeline__view-btn').click();
    fixture.detectChanges();
    TestBed.inject(ApplicationRef).tick();

    const options = Array.from(document.querySelectorAll('.cdk-overlay-pane .sic-popover__list-item')) as HTMLElement[];
    expect(options.map((el) => el.textContent?.trim())).toEqual(['Day', 'Week', 'Month']);

    options[2].click();
    fixture.detectChanges();

    expect(spy).toHaveBeenCalledWith('month');
    expect(component.viewMode).toBe('month');

    document.querySelectorAll('.cdk-overlay-container').forEach((el) => el.remove());
  });

  it('gives the label header a compact height in month view, where there is no group super-header', () => {
    fixture.componentRef.setInput('viewMode', 'month');
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.sic-calendar-timeline__groups')).toBeNull();
    expect(
      fixture.nativeElement.querySelector('.sic-calendar-timeline__labels-header--compact'),
    ).toBeTruthy();
  });

  it('applies maxHeight as an inline max-height on both scrolling panes', () => {
    fixture.componentRef.setInput('maxHeight', '10rem');
    fixture.detectChanges();

    const labels = fixture.nativeElement.querySelector('.sic-calendar-timeline__labels') as HTMLElement;
    const grid = fixture.nativeElement.querySelector('.sic-calendar-timeline__scroll') as HTMLElement;
    expect(labels.style.maxHeight).toBe('10rem');
    expect(grid.style.maxHeight).toBe('10rem');
  });
});

describe('SicCalendarTimelineComponent custom templates', () => {
  @Component({
    standalone: true,
    imports: [SicCalendarTimelineComponent],
    template: `
      <sic-calendar-timeline [items]="rows" startDate="2024-01-01" endDate="2024-01-07">
        <ng-template #labelTemplate let-row>
          <span class="custom-label">{{ row.label }}!</span>
        </ng-template>
        <ng-template #phaseTemplate let-phase>
          <span class="custom-phase">{{ phase.label }}!</span>
        </ng-template>
      </sic-calendar-timeline>
    `,
  })
  class TemplateHostComponent {
    rows: SicCalendarTimelineRow[] = [
      { id: 1, label: 'Row', phases: [{ label: 'Phase', start: '2024-01-02', end: '2024-01-03' }] },
    ];
  }

  it('renders the projected #labelTemplate and #phaseTemplate instead of the defaults', () => {
    TestBed.configureTestingModule({ imports: [TemplateHostComponent] });
    const fixture = TestBed.createComponent(TemplateHostComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.custom-label')?.textContent).toBe('Row!');
    expect(fixture.nativeElement.querySelector('.custom-phase')?.textContent).toBe('Phase!');
    expect(fixture.nativeElement.querySelector('.sic-calendar-timeline__label-text')).toBeNull();
  });
});
