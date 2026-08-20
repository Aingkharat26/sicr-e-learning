import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SIC_CONFIG } from '../../config/sic-config';
import { SicDatepickerComponent } from './sic-datepicker.component';

@Component({
  standalone: true,
  imports: [FormsModule, SicDatepickerComponent],
  template: `
    <sic-datepicker [(ngModel)]="date" [min]="min" [max]="max" [mode]="mode" [era]="era" [format]="format" />
    <input id="outside" type="text" />
  `,
})
class HostComponent {
  date: string | null = null;
  min?: string;
  max?: string;
  mode: 'day' | 'month' | 'year' = 'day';
  era: 'BE' | 'CE' = 'CE';
  format = 'dd/MM/yyyy';
}

describe('SicDatepickerComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  beforeAll(() => {
    if (!HTMLElement.prototype.scrollIntoView) {
      HTMLElement.prototype.scrollIntoView = () => {};
    }
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [HostComponent] }).compileComponents();
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  function getComponent(): SicDatepickerComponent {
    return fixture.debugElement.query((d) => d.componentInstance instanceof SicDatepickerComponent)
      .componentInstance;
  }

  function trigger(): HTMLButtonElement {
    return fixture.nativeElement.querySelector('.sic-datepicker__trigger .sic-control-field__reset-btn');
  }

  function clearBtn(): HTMLButtonElement | null {
    return fixture.nativeElement.querySelector('.sic-datepicker__trigger .sic-field-clear-btn');
  }

  it('hides the clear button when there is no value, shows it once a date is picked, and hides it again after clearing', async () => {
    const cmp = getComponent();
    expect(clearBtn()).toBeNull();

    trigger().click();
    fixture.detectChanges();
    const dayCell: HTMLButtonElement = fixture.nativeElement.querySelector(
      '.sic-datepicker__day:not(.sic-datepicker__day--outside)',
    );
    dayCell.click();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(clearBtn()).toBeTruthy();

    clearBtn()!.click();
    fixture.detectChanges();

    expect(cmp.value).toBeNull();
    expect(cmp.open).toBe(false);
    expect(clearBtn()).toBeNull();
  });

  it('formats the display value with the default dd/MM/yyyy pattern', async () => {
    host.date = '2024-03-05';
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(trigger().textContent).toContain('05/03/2024');
  });

  it('shows the Buddhist era year when era="BE"', async () => {
    host.era = 'BE';
    host.date = '2024-03-05';
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(trigger().textContent).toContain('05/03/2567');
  });

  it('opens the panel on click and closes it after picking a day, refocusing the trigger', () => {
    const cmp = getComponent();
    const btn = trigger();

    btn.click();
    fixture.detectChanges();
    expect(cmp.open).toBe(true);

    const dayCell: HTMLButtonElement | null = fixture.nativeElement.querySelector(
      '.sic-datepicker__day:not(.sic-datepicker__day--outside)',
    );
    expect(dayCell).toBeTruthy();

    dayCell!.click();
    fixture.detectChanges();

    expect(cmp.open).toBe(false);
    expect(fixture.nativeElement.querySelector('.sic-datepicker__panel')).toBeNull();
    expect(document.activeElement).toBe(btn);
  });

  it('opens the panel just by focusing the trigger (no click)', () => {
    const cmp = getComponent();
    trigger().focus();
    fixture.detectChanges();

    expect(cmp.open).toBe(true);
  });

  it('closes the panel when focus leaves the component entirely', () => {
    const cmp = getComponent();
    const outside: HTMLInputElement = fixture.nativeElement.querySelector('#outside');

    trigger().focus();
    fixture.detectChanges();
    expect(cmp.open).toBe(true);

    outside.focus();
    fixture.detectChanges();

    expect(cmp.open).toBe(false);
  });

  it('keeps native focus on the trigger when clicking panel buttons, so Tab never lands inside the panel', () => {
    const btn = trigger();
    btn.focus();
    fixture.detectChanges();

    const dayCell: HTMLButtonElement = fixture.nativeElement.querySelector(
      '.sic-datepicker__day:not(.sic-datepicker__day--outside)',
    );
    expect(dayCell.getAttribute('tabindex')).toBe('-1');

    const nextBtn: HTMLButtonElement = fixture.nativeElement.querySelector('.sic-datepicker__nav:last-of-type');
    expect(nextBtn.getAttribute('tabindex')).toBe('-1');

    nextBtn.click();
    fixture.detectChanges();

    expect(document.activeElement).toBe(btn);
  });

  it('does not reopen after selecting (guards against native <label> click-forwarding)', () => {
    const cmp = getComponent();
    const btn = trigger();

    btn.click();
    fixture.detectChanges();

    const dayCell: HTMLButtonElement = fixture.nativeElement.querySelector(
      '.sic-datepicker__day:not(.sic-datepicker__day--outside)',
    );
    dayCell.click();
    fixture.detectChanges();

    expect(cmp.open).toBe(false);
  });

  it('moves the focused day with arrow keys (dispatched from the trigger, which keeps native focus) and selects it with Enter', () => {
    const cmp = getComponent();
    const btn = trigger();
    btn.click();
    fixture.detectChanges();

    const before = cmp.focusedDate;

    btn.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    fixture.detectChanges();
    expect(cmp.focusedDate.valueOf()).toBe(before.add(1, 'day').valueOf());
    expect(cmp.keyboardActive).toBe(true);

    btn.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    fixture.detectChanges();
    expect(cmp.focusedDate.valueOf()).toBe(before.add(1, 'day').add(7, 'day').valueOf());

    btn.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    fixture.detectChanges();

    expect(cmp.open).toBe(false);
    expect(host.date).toBe(before.add(8, 'day').format('YYYY-MM-DD'));
  });

  it('does not show the keyboard cursor ring when browsing months with the mouse nav buttons', () => {
    const cmp = getComponent();
    const btn = trigger();
    btn.click();
    fixture.detectChanges();

    btn.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    fixture.detectChanges();
    expect(cmp.keyboardActive).toBe(true);

    const nextBtn: HTMLButtonElement = fixture.nativeElement.querySelector('.sic-datepicker__nav:last-of-type');
    nextBtn.click();
    fixture.detectChanges();

    expect(cmp.keyboardActive).toBe(false);
    expect(fixture.nativeElement.querySelector('.sic-datepicker__day--cursor')).toBeNull();
  });

  it('disables days outside the min/max range', async () => {
    host.min = '2024-03-10';
    host.max = '2024-03-20';
    host.date = '2024-03-15';
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    trigger().click();
    fixture.detectChanges();

    const cmp = getComponent();
    const disabledInMonth = cmp.dayCells.filter((c) => c.inMonth && c.disabled);
    expect(disabledInMonth.length).toBeGreaterThan(0);
    expect(cmp.dayCells.find((c) => c.date.date() === 15 && c.inMonth)?.disabled).toBe(false);
    expect(cmp.dayCells.find((c) => c.date.date() === 1 && c.inMonth)?.disabled).toBe(true);
  });

  it('mode="month" skips the day grid and commits a month', () => {
    host.mode = 'month';
    fixture.detectChanges();

    const cmp = getComponent();
    trigger().click();
    fixture.detectChanges();
    expect(cmp.view).toBe('month');

    const monthCell: HTMLButtonElement = fixture.nativeElement.querySelector('.sic-datepicker__cell');
    monthCell.click();
    fixture.detectChanges();

    expect(cmp.open).toBe(false);
    expect(host.date).toBeTruthy();
  });

  it('mode="year" skips straight to the year grid and commits a year', () => {
    host.mode = 'year';
    fixture.detectChanges();

    const cmp = getComponent();
    trigger().click();
    fixture.detectChanges();
    expect(cmp.view).toBe('year');

    const yearCell: HTMLButtonElement = fixture.nativeElement.querySelector('.sic-datepicker__cell');
    yearCell.click();
    fixture.detectChanges();

    expect(cmp.open).toBe(false);
    expect(host.date).toBeTruthy();
  });

  it('reopens showing the month of the previously selected day, not the current month', async () => {
    const cmp = getComponent();
    trigger().click();
    fixture.detectChanges();

    const beforeNav = cmp.focusedDate;
    const nextBtn: HTMLButtonElement = fixture.nativeElement.querySelector('.sic-datepicker__nav:last-of-type');
    nextBtn.click();
    fixture.detectChanges();
    expect(cmp.focusedDate.month()).toBe((beforeNav.month() + 1) % 12);

    const dayCell: HTMLButtonElement | null = fixture.nativeElement.querySelector(
      '.sic-datepicker__day:not(.sic-datepicker__day--outside)',
    );
    dayCell!.click();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const pickedMonth = cmp.value ? new Date(cmp.value as string).getUTCMonth() : -1;

    trigger().click();
    fixture.detectChanges();

    expect(cmp.view).toBe('day');
    expect(cmp.focusedDate.month()).toBe(pickedMonth);
  });

  it('does not mark the same day-of-month as selected in other months after browsing with the prev/next arrows (regression)', () => {
    // Reported bug: pick e.g. Aug 14, then click the mouse "prev"/"next" header
    // arrows to browse other months — every month's 14th looked selected,
    // because dayjs().add(n,'month') keeps the day-of-month, and the cursor
    // highlight used to be styled identically to "selected".
    const cmp = getComponent();
    trigger().click();
    fixture.detectChanges();

    const nextBtn: HTMLButtonElement = fixture.nativeElement.querySelector('.sic-datepicker__nav:last-of-type');
    nextBtn.click();
    fixture.detectChanges();

    // pick a day safely in the middle of the month so it can never resurface
    // as a leading/trailing cell of an adjacent month's grid
    const midMonthIndex = cmp.dayCells.findIndex((c) => c.inMonth && c.date.date() === 14);
    expect(midMonthIndex).toBeGreaterThanOrEqual(0);
    const dayButtons: NodeListOf<HTMLButtonElement> = fixture.nativeElement.querySelectorAll('.sic-datepicker__day');
    dayButtons[midMonthIndex].click();
    fixture.detectChanges();

    trigger().click();
    fixture.detectChanges();

    const prevBtn: HTMLButtonElement = fixture.nativeElement.querySelector('.sic-datepicker__nav:first-of-type');
    prevBtn.click();
    fixture.detectChanges();

    expect(cmp.dayCells.some((c) => c.isSelected)).toBe(false);
  });

  it('drills up from day view to year view via the header, then back down through month', () => {
    const cmp = getComponent();
    trigger().click();
    fixture.detectChanges();
    expect(cmp.view).toBe('day');

    const header: HTMLButtonElement = fixture.nativeElement.querySelector('.sic-datepicker__header-label');
    header.click();
    fixture.detectChanges();
    expect(cmp.view).toBe('year');

    const yearCell: HTMLButtonElement = fixture.nativeElement.querySelector('.sic-datepicker__cell');
    yearCell.click();
    fixture.detectChanges();
    expect(cmp.view).toBe('month');

    const monthCell: HTMLButtonElement = fixture.nativeElement.querySelector('.sic-datepicker__cell');
    monthCell.click();
    fixture.detectChanges();
    expect(cmp.view).toBe('day');
    expect(cmp.open).toBe(true);
  });
});

describe('SicDatepickerComponent SIC_CONFIG defaults', () => {
  beforeAll(() => {
    if (!HTMLElement.prototype.scrollIntoView) {
      HTMLElement.prototype.scrollIntoView = () => {};
    }
  });

  it('falls back to format/era/locale from SIC_CONFIG when the caller does not bind them', async () => {
    await TestBed.configureTestingModule({
      imports: [SicDatepickerComponent],
      providers: [{ provide: SIC_CONFIG, useValue: { dateFormat: 'yyyy-MM-dd', era: 'BE', locale: 'th' } }],
    }).compileComponents();
    const fixture = TestBed.createComponent(SicDatepickerComponent);
    const cmp = fixture.componentInstance;

    expect(cmp.format).toBe('yyyy-MM-dd');
    expect(cmp.era).toBe('BE');
    expect(cmp.locale).toBe('th');
  });

  it('still lets an explicit [format]/[era]/[locale] binding win over SIC_CONFIG', async () => {
    @Component({
      standalone: true,
      imports: [SicDatepickerComponent],
      template: `<sic-datepicker format="dd-MM-yyyy" era="CE" locale="en" />`,
    })
    class OverrideHost {}

    await TestBed.configureTestingModule({
      imports: [OverrideHost],
      providers: [{ provide: SIC_CONFIG, useValue: { dateFormat: 'yyyy-MM-dd', era: 'BE', locale: 'th' } }],
    }).compileComponents();
    const fixture = TestBed.createComponent(OverrideHost);
    fixture.detectChanges();

    const cmp = fixture.debugElement.query((d) => d.componentInstance instanceof SicDatepickerComponent)
      .componentInstance as SicDatepickerComponent;

    expect(cmp.format).toBe('dd-MM-yyyy');
    expect(cmp.era).toBe('CE');
    expect(cmp.locale).toBe('en');
  });
});
