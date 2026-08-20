import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { SicDatepickerComponent } from '../sic-datepicker/sic-datepicker.component';
import { SicTimepickerComponent } from './sic-timepicker.component';

/**
 * A sic-datepicker and a sic-timepicker bound to the *same* FormControl —
 * one editing the date portion, the other the time portion of one Date.
 * Angular's Reactive Forms plumbing normally suppresses the model->view echo
 * for whichever accessor produced a change (to avoid a feedback loop), which
 * would otherwise mean the sibling control sharing that FormControl never
 * finds out about the update. `SicFormControlBase.commitValue()` works around
 * that by force-syncing the control's value back out to every bound accessor.
 */
@Component({
  standalone: true,
  imports: [ReactiveFormsModule, SicDatepickerComponent, SicTimepickerComponent],
  template: `
    <sic-datepicker outputType="date" [formControl]="dateTime" />
    <sic-timepicker [formControl]="dateTime" />
  `,
})
class ComboHostComponent {
  dateTime = new FormControl<Date | null>(null);
}

describe('sic-datepicker + sic-timepicker sharing one FormControl', () => {
  let fixture: ComponentFixture<ComboHostComponent>;
  let host: ComboHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [ComboHostComponent] }).compileComponents();
    fixture = TestBed.createComponent(ComboHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  function datepicker(): SicDatepickerComponent {
    return fixture.debugElement.query((d) => d.componentInstance instanceof SicDatepickerComponent)
      .componentInstance;
  }

  function timepicker(): SicTimepickerComponent {
    return fixture.debugElement.query((d) => d.componentInstance instanceof SicTimepickerComponent)
      .componentInstance;
  }

  it('reflects a date picked on the datepicker in the timepicker (and the shared control)', () => {
    const dp = datepicker();
    const tp = timepicker();

    dp.selectDay({ date: (dp as any).focusedDate.year(2030).month(6).date(10), disabled: false } as any);
    fixture.detectChanges();

    expect(host.dateTime.value?.getFullYear()).toBe(2030);
    expect(host.dateTime.value?.getMonth()).toBe(6);
    expect(host.dateTime.value?.getDate()).toBe(10);
    // The timepicker's own accessor must have received the update too, not just the raw control.
    expect(tp.value?.getFullYear()).toBe(2030);
  });

  it('reflects a time picked on the timepicker in the datepicker (and the shared control), keeping the date the same', () => {
    host.dateTime.setValue(new Date(2031, 2, 5, 0, 0, 0));
    fixture.detectChanges();

    const dp = datepicker();
    const tp = timepicker();
    // openPanel() is what captures contextDate (the date the committed
    // hour/minute get applied onto) from tp.value — which the shared control
    // sync above should already have set to 2031-03-05.
    tp.openPanel();
    tp.hour = 13;
    tp.minute = 45;
    (tp as any).commit();
    fixture.detectChanges();

    expect(host.dateTime.value?.getFullYear()).toBe(2031);
    expect(host.dateTime.value?.getMonth()).toBe(2);
    expect(host.dateTime.value?.getDate()).toBe(5);
    expect(host.dateTime.value?.getHours()).toBe(13);
    expect(host.dateTime.value?.getMinutes()).toBe(45);
    // The datepicker's own accessor must have received the update too, not just the raw control.
    expect(dp.value).toBeTruthy();
    expect(new Date(dp.value as Date).getHours()).toBe(13);
  });
});
