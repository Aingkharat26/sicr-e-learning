import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SicTimepickerComponent } from './sic-timepicker.component';

@Component({
  standalone: true,
  imports: [FormsModule, SicTimepickerComponent],
  template: `
    <sic-timepicker [(ngModel)]="time" [min]="min" [max]="max" />
    <input id="outside" type="text" />
  `,
})
class HostComponent {
  time: Date | null = null;
  min?: Date;
  max?: Date;
}

/** Builds a Date for today at the given hour/minute, so it lines up with the
 *  component's own "today" default context date (dayjs() at open/construction). */
function todayAt(hour: number, minute: number): Date {
  const d = new Date();
  d.setHours(hour, minute, 0, 0);
  return d;
}

describe('SicTimepickerComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [HostComponent] }).compileComponents();
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  function getComponent(): SicTimepickerComponent {
    return fixture.debugElement.query((d) => d.componentInstance instanceof SicTimepickerComponent)
      .componentInstance;
  }

  function trigger(): HTMLButtonElement {
    return fixture.nativeElement.querySelector('.sic-timepicker__trigger .sic-control-field__reset-btn');
  }

  function clearBtn(): HTMLButtonElement | null {
    return fixture.nativeElement.querySelector('.sic-timepicker__trigger .sic-field-clear-btn');
  }

  function face(): HTMLElement {
    return fixture.nativeElement.querySelector('.sic-timepicker__face');
  }

  function stubFaceRect(): void {
    // radius = 100px, matching the component's FACE_OUTER_R/FACE_INNER_R assumption.
    vi.spyOn(face(), 'getBoundingClientRect').mockReturnValue({
      left: 0,
      top: 0,
      width: 200,
      height: 200,
      right: 200,
      bottom: 200,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    } as DOMRect);
  }

  function pointerEvent(type: string, clientX: number, clientY: number): PointerEvent {
    return new PointerEvent(type, { clientX, clientY, bubbles: true, cancelable: true });
  }

  /**
   * Selecting a number on the clock face is handled entirely through pointer
   * events (see `sic-timepicker.component.ts` for why) — a plain tap is just
   * a pointerdown immediately followed by a pointerup at the same position.
   */
  function tapFaceAt(clientX: number, clientY: number): void {
    face().dispatchEvent(pointerEvent('pointerdown', clientX, clientY));
    fixture.detectChanges();
    document.dispatchEvent(pointerEvent('pointerup', clientX, clientY));
    fixture.detectChanges();
  }

  it('hides the clear button when there is no value, shows it once a time is set, and hides it again after clearing', () => {
    const cmp = getComponent();
    expect(clearBtn()).toBeNull();

    const btn = trigger();
    btn.focus();
    fixture.detectChanges();
    cmp.hour = 9;
    cmp.minute = 15;
    btn.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    fixture.detectChanges();

    expect(clearBtn()).toBeTruthy();

    clearBtn()!.click();
    fixture.detectChanges();

    expect(cmp.value).toBeNull();
    expect(cmp.open).toBe(false);
    expect(clearBtn()).toBeNull();
  });

  it('formats the display value as HH:mm', async () => {
    host.time = todayAt(9, 5);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(trigger().textContent).toContain('09:05');
  });

  it('opens the panel just by focusing the trigger (no click)', () => {
    const cmp = getComponent();
    trigger().focus();
    fixture.detectChanges();

    expect(cmp.open).toBe(true);
  });

  it('keeps native focus on the trigger when tapping panel buttons, so Tab never lands inside the panel', () => {
    const btn = trigger();
    btn.focus();
    fixture.detectChanges();
    stubFaceRect();

    const hourBtn: HTMLButtonElement = fixture.nativeElement.querySelector(
      '.sic-timepicker__num:not(.sic-timepicker__num--inner)',
    );
    expect(hourBtn.getAttribute('tabindex')).toBe('-1');

    const segmentBtn: HTMLButtonElement = fixture.nativeElement.querySelector('.sic-timepicker__segment');
    expect(segmentBtn.getAttribute('tabindex')).toBe('-1');

    // 12 o'clock, outer ring -> hour 0.
    tapFaceAt(100, 22);

    expect(document.activeElement).toBe(btn);
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

  it('starts on the hour segment; ArrowRight switches to minute, ArrowLeft back to hour', () => {
    const cmp = getComponent();
    const btn = trigger();
    btn.focus();
    fixture.detectChanges();
    expect(cmp.segment).toBe('hour');

    btn.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    fixture.detectChanges();
    expect(cmp.segment).toBe('minute');

    btn.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
    fixture.detectChanges();
    expect(cmp.segment).toBe('hour');
  });

  it('ArrowUp/ArrowDown adjust the active segment, wrapping at the boundaries', () => {
    const cmp = getComponent();
    const btn = trigger();
    btn.focus();
    fixture.detectChanges();
    cmp.hour = 23;

    btn.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }));
    fixture.detectChanges();
    expect(cmp.hour).toBe(0);

    btn.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    fixture.detectChanges();
    expect(cmp.hour).toBe(23);

    btn.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    fixture.detectChanges();
    cmp.minute = 59;

    btn.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }));
    fixture.detectChanges();
    expect(cmp.minute).toBe(0);
  });

  it('Enter commits the current hour/minute and closes, refocusing the trigger without reopening', () => {
    const cmp = getComponent();
    const btn = trigger();
    btn.focus();
    fixture.detectChanges();
    cmp.hour = 14;
    cmp.minute = 30;

    btn.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    fixture.detectChanges();

    expect(cmp.open).toBe(false);
    expect(host.time?.getHours()).toBe(14);
    expect(host.time?.getMinutes()).toBe(30);
    expect(document.activeElement).toBe(btn);
  });

  it('tapping an hour number selects it and advances to the minute segment', () => {
    const cmp = getComponent();
    trigger().focus();
    fixture.detectChanges();
    stubFaceRect();

    // 12 o'clock, outer ring -> hour 0.
    tapFaceAt(100, 22);

    expect(cmp.segment).toBe('minute');
    expect(cmp.open).toBe(true);
  });

  it('tapping a minute number commits and closes the panel', () => {
    const cmp = getComponent();
    trigger().focus();
    fixture.detectChanges();
    const btn = trigger();
    btn.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    fixture.detectChanges();
    expect(cmp.segment).toBe('minute');
    stubFaceRect();

    // 3 o'clock, outer ring -> minute 15.
    tapFaceAt(178, 100);

    expect(cmp.open).toBe(false);
    expect(host.time).toBeTruthy();
  });

  it('disables hours/minutes outside the min/max range', () => {
    host.min = todayAt(9, 30);
    host.max = todayAt(17, 0);
    fixture.detectChanges();

    const cmp = getComponent();
    expect(cmp.isHourDisabled(8)).toBe(true);
    expect(cmp.isHourDisabled(12)).toBe(false);
    expect(cmp.isHourDisabled(18)).toBe(true);
  });

  it('does not reopen after selecting (guards against native <label> click-forwarding)', () => {
    const cmp = getComponent();
    trigger().focus();
    fixture.detectChanges();
    stubFaceRect();

    // 12 o'clock, outer ring -> hour 0 -> advances to minute segment.
    tapFaceAt(100, 22);
    // 3 o'clock, outer ring -> minute 15 -> commits and closes.
    tapFaceAt(178, 100);

    expect(cmp.open).toBe(false);
  });

  describe('Date value semantics (shared with sic-datepicker)', () => {
    it('uses today as the date when there was no previous value', () => {
      const cmp = getComponent();
      const btn = trigger();
      btn.focus();
      fixture.detectChanges();
      cmp.hour = 8;
      cmp.minute = 0;

      btn.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      fixture.detectChanges();

      const today = new Date();
      expect(host.time?.getFullYear()).toBe(today.getFullYear());
      expect(host.time?.getMonth()).toBe(today.getMonth());
      expect(host.time?.getDate()).toBe(today.getDate());
      expect(host.time?.getHours()).toBe(8);
      expect(host.time?.getMinutes()).toBe(0);
    });

    it('keeps the existing date unchanged when picking a new time on an existing value', async () => {
      host.time = new Date(2020, 4, 15, 10, 0, 0);
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();

      const cmp = getComponent();
      const btn = trigger();
      btn.focus();
      fixture.detectChanges();
      cmp.hour = 22;
      cmp.minute = 45;

      btn.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      fixture.detectChanges();

      expect(host.time?.getFullYear()).toBe(2020);
      expect(host.time?.getMonth()).toBe(4);
      expect(host.time?.getDate()).toBe(15);
      expect(host.time?.getHours()).toBe(22);
      expect(host.time?.getMinutes()).toBe(45);
    });
  });

  describe('press-and-hold to slide the clock hand', () => {
    it('dragging on the outer hour ring updates the hand live, then advances to minutes on release', () => {
      const cmp = getComponent();
      trigger().focus();
      fixture.detectChanges();
      stubFaceRect();

      // 12 o'clock position, outer ring (radiusFraction 0.78) -> hour 0.
      face().dispatchEvent(pointerEvent('pointerdown', 100, 22));
      fixture.detectChanges();
      expect(cmp.dragging).toBe(true);
      expect(cmp.hour).toBe(0);
      expect(cmp.segment).toBe('hour');

      // Drag to 3 o'clock, still outer ring -> hour 3. No commit yet.
      document.dispatchEvent(pointerEvent('pointermove', 178, 100));
      fixture.detectChanges();
      expect(cmp.hour).toBe(3);
      expect(host.time).toBeNull();

      document.dispatchEvent(pointerEvent('pointerup', 178, 100));
      fixture.detectChanges();

      expect(cmp.dragging).toBe(false);
      expect(cmp.hour).toBe(3);
      expect(cmp.segment).toBe('minute');
      expect(cmp.open).toBe(true);
      expect(host.time).toBeNull();
    });

    it('dragging on the inner hour ring picks the 12-23 hours', () => {
      const cmp = getComponent();
      trigger().focus();
      fixture.detectChanges();
      stubFaceRect();

      // 3 o'clock position, inner ring (radiusFraction 0.46) -> hour 12 + 3 = 15.
      face().dispatchEvent(pointerEvent('pointerdown', 146, 100));
      fixture.detectChanges();

      expect(cmp.hour).toBe(15);

      document.dispatchEvent(pointerEvent('pointerup', 146, 100));
      fixture.detectChanges();
    });

    it('dragging on the minute ring commits and closes the panel on release', () => {
      const cmp = getComponent();
      trigger().focus();
      fixture.detectChanges();
      cmp.segment = 'minute';
      fixture.detectChanges();
      stubFaceRect();

      // 3 o'clock position, outer ring -> angle 90deg / 6 = minute 15.
      face().dispatchEvent(pointerEvent('pointerdown', 178, 100));
      fixture.detectChanges();
      expect(cmp.minute).toBe(15);
      expect(host.time).toBeNull();

      document.dispatchEvent(pointerEvent('pointerup', 178, 100));
      fixture.detectChanges();

      expect(cmp.dragging).toBe(false);
      expect(cmp.open).toBe(false);
      expect(host.time?.getMinutes()).toBe(15);
    });

    it('dragging the minute hand directly on a number and releasing stays closed instead of bouncing back to the hour segment', () => {
      const cmp = getComponent();
      trigger().focus();
      fixture.detectChanges();
      cmp.segment = 'minute';
      fixture.detectChanges();
      stubFaceRect();

      const minuteBtn: HTMLButtonElement = fixture.nativeElement.querySelector('.sic-timepicker__num');

      // pointerdown starting directly on a number must still start a drag (so
      // holding+sliding away from a number works), and release must finalize
      // and close without any secondary click-driven path able to reopen it —
      // there is no `(click)` handler on the number buttons at all anymore.
      minuteBtn.dispatchEvent(pointerEvent('pointerdown', 178, 100));
      fixture.detectChanges();
      document.dispatchEvent(pointerEvent('pointerup', 178, 100));
      fixture.detectChanges();

      expect(cmp.open).toBe(false);
      expect(cmp.segment).toBe('minute');
      expect(host.time?.getMinutes()).toBe(15);
    });

    it('re-focuses the trigger if a touch tap steals focus onto the number button right after release, instead of reopening the panel', async () => {
      const cmp = getComponent();
      trigger().focus();
      fixture.detectChanges();
      cmp.segment = 'minute';
      fixture.detectChanges();
      stubFaceRect();

      const minuteBtn: HTMLButtonElement = fixture.nativeElement.querySelector('.sic-timepicker__num');

      minuteBtn.dispatchEvent(pointerEvent('pointerdown', 178, 100));
      document.dispatchEvent(pointerEvent('pointerup', 178, 100));

      expect(cmp.open).toBe(false);

      // Simulate the browser's native touch-activation stealing focus onto
      // the tapped button asynchronously, after our own refocus already ran
      // — before Angular's next render removes the (already logically closed)
      // panel from the DOM.
      const stillLiveMinuteBtn: HTMLButtonElement = fixture.nativeElement.querySelector('.sic-timepicker__num');
      stillLiveMinuteBtn.focus();
      expect(document.activeElement).toBe(stillLiveMinuteBtn);

      await new Promise((resolve) => setTimeout(resolve));
      fixture.detectChanges();

      expect(document.activeElement).toBe(trigger());
      expect(cmp.open).toBe(false);
      expect(cmp.segment).toBe('minute');
    });

    it('a genuine focus event landing back on the trigger shortly after a drag-release does not reopen the panel', () => {
      // Reported bug: releasing a drag while the cursor/finger is still over
      // the panel (landing on a number button) lets the browser eventually
      // settle focus back on the trigger on its own timeline — which used to
      // look exactly like a deliberate "focus the trigger to open it" and
      // reopened the panel right back on the hour segment. Regardless of what
      // caused this focus event or how delayed it was, it must be ignored
      // within the post-close guard window.
      const cmp = getComponent();
      trigger().focus();
      fixture.detectChanges();
      cmp.segment = 'minute';
      fixture.detectChanges();
      stubFaceRect();

      face().dispatchEvent(pointerEvent('pointerdown', 178, 100));
      document.dispatchEvent(pointerEvent('pointerup', 178, 100));
      fixture.detectChanges();

      expect(cmp.open).toBe(false);
      expect(host.time?.getMinutes()).toBe(15);

      // The browser settling focus back on the trigger, independent of our
      // own refocus call — simulated as a bare focus event, arriving shortly
      // (well under the guard window) after the close above.
      trigger().dispatchEvent(new FocusEvent('focus'));
      fixture.detectChanges();

      expect(cmp.open).toBe(false);
      expect(cmp.segment).toBe('minute');
    });

    it('a genuine click landing on the trigger right after a drag-release commit does not reopen the panel', () => {
      // Root cause confirmed via device console logs: some browsers/emulators
      // synthesize the compatibility `click` for a touch gesture targeting
      // whatever element currently has focus rather than the original touch
      // coordinates. Since `refocusTrigger()` moves focus onto the trigger the
      // instant a drag-release commits and closes the panel, that stray click
      // lands on the trigger's own `(click)="handleTriggerClick"` and used to
      // reopen the panel immediately (`justClosedAt` previously only guarded
      // `handleTriggerFocus`, not this).
      const cmp = getComponent();
      trigger().focus();
      fixture.detectChanges();
      cmp.segment = 'minute';
      fixture.detectChanges();
      stubFaceRect();

      face().dispatchEvent(pointerEvent('pointerdown', 178, 100));
      document.dispatchEvent(pointerEvent('pointerup', 178, 100));
      fixture.detectChanges();

      expect(cmp.open).toBe(false);
      expect(host.time?.getMinutes()).toBe(15);

      trigger().click();
      fixture.detectChanges();

      expect(cmp.open).toBe(false);
      expect(cmp.segment).toBe('minute');
    });

    it('skips updating to a disabled hour while dragging, keeping the last valid value', () => {
      host.min = todayAt(9, 30);
      host.max = todayAt(17, 0);
      fixture.detectChanges();
      const cmp = getComponent();
      trigger().focus();
      fixture.detectChanges();
      stubFaceRect();
      cmp.hour = 10;

      // 12 o'clock, outer ring -> hour 0, which is disabled by min 09:30.
      face().dispatchEvent(pointerEvent('pointerdown', 100, 22));
      fixture.detectChanges();

      expect(cmp.hour).toBe(10);

      document.dispatchEvent(pointerEvent('pointerup', 100, 22));
      fixture.detectChanges();
    });

    it('releasing a tap on a disabled hour does not advance to the minute segment or close the panel', () => {
      host.min = todayAt(9, 30);
      host.max = todayAt(17, 0);
      fixture.detectChanges();
      const cmp = getComponent();
      trigger().focus();
      fixture.detectChanges();
      stubFaceRect();
      cmp.hour = 10;

      // 12 o'clock, outer ring -> hour 0, disabled by min 09:30.
      tapFaceAt(100, 22);

      expect(cmp.hour).toBe(10);
      expect(cmp.segment).toBe('hour');
      expect(cmp.open).toBe(true);
    });

    it('releasing a tap on a disabled minute does not commit a value or close the panel', () => {
      host.min = todayAt(9, 30);
      host.max = todayAt(17, 0);
      fixture.detectChanges();
      const cmp = getComponent();
      trigger().focus();
      fixture.detectChanges();
      stubFaceRect();
      cmp.hour = 9;
      cmp.minute = 45;
      cmp.segment = 'minute';

      // 12 o'clock, outer ring -> minute 0, which makes 09:00 — disabled by min 09:30.
      tapFaceAt(100, 22);

      expect(cmp.minute).toBe(45);
      expect(cmp.open).toBe(true);
      expect(host.time).toBeNull();
    });

    it('Enter does not commit when the currently selected hour/minute is disabled', () => {
      host.min = todayAt(9, 30);
      host.max = todayAt(17, 0);
      fixture.detectChanges();
      const cmp = getComponent();
      trigger().focus();
      fixture.detectChanges();
      cmp.hour = 8;
      cmp.minute = 0;

      trigger().dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
      fixture.detectChanges();

      expect(cmp.open).toBe(true);
      expect(host.time).toBeNull();
    });

    it('a pointermove with no prior pointerdown is a no-op', () => {
      const cmp = getComponent();
      trigger().focus();
      fixture.detectChanges();
      stubFaceRect();
      const before = cmp.hour;

      document.dispatchEvent(pointerEvent('pointermove', 178, 100));
      fixture.detectChanges();

      expect(cmp.hour).toBe(before);
      expect(cmp.dragging).toBe(false);
    });
  });
});
