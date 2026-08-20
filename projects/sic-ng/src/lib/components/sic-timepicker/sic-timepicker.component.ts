import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, ElementRef, HostBinding, HostListener, Input, PLATFORM_ID, ViewChild, forwardRef, inject } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import dayjs, { Dayjs } from 'dayjs';
import { SicFormControlBase, SicTextAlign } from '../../base/sic-form-control.base';

export type SicTimeSegment = 'hour' | 'minute';

interface SicClockNumber {
  value: number;
  label: string;
  transform: string;
}

const FACE_OUTER_R = 78;
const FACE_INNER_R = 46;
/** How long after closing we ignore an incoming focus event on the trigger — see `justClosedAt`. */
const REOPEN_GUARD_MS = 500;
let nextFieldId = 0;

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

function polarTransform(indexAngleDeg: number, radius: number): string {
  return `translate(-50%, -50%) rotate(${indexAngleDeg}deg) translate(${radius}px) rotate(${-indexAngleDeg}deg)`;
}

@Component({
  selector: 'sic-timepicker',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sic-timepicker.component.html',
  styleUrl: './sic-timepicker.component.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SicTimepickerComponent),
      multi: true,
    },
  ],
})
export class SicTimepickerComponent extends SicFormControlBase<Date | null> {
  /** Real datetime bounds (Date or a value dayjs can parse) — only the time-of-day is enforced, evaluated against the date currently held (or today, if empty). */
  @Input() min?: Date | string | null;
  @Input() max?: Date | string | null;
  @Input() align: SicTextAlign = 'left';
  @Input() placeholder = 'Select time';
  @Input() clearable = true;

  @ViewChild('trigger') private triggerRef?: ElementRef<HTMLButtonElement>;
  @ViewChild('fieldWrap') private fieldWrapRef?: ElementRef<HTMLElement>;
  @ViewChild('panel') private panelRef?: ElementRef<HTMLElement>;
  @ViewChild('face') private faceRef?: ElementRef<HTMLDivElement>;

  private readonly platformId = inject(PLATFORM_ID);
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  /**
   * Timestamp of the last time we closed the panel and refocused the trigger.
   * `handleTriggerFocus` ignores any focus event within `REOPEN_GUARD_MS` of
   * this, no matter what caused it — a plain single-consume flag isn't
   * enough here, because on touch devices the browser can shift focus onto a
   * panel-internal button (if the release happens to land on one) at a delay
   * that varies by browser/OS, and once that focus eventually settles back
   * onto the trigger it would otherwise look like a fresh, deliberate focus
   * and reopen the panel right after it closed.
   */
  private justClosedAt = 0;
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  /** True while the user is pressing/dragging on the clock face — the hand follows the pointer live; the value only commits on release. */
  dragging = false;
  /** True once the current drag/tap's most recent position landed on a disabled hour/minute — release must then be a no-op (stay open, same segment) instead of advancing/committing as if a value had actually changed. */
  private pointerOnDisabledTarget = false;
  private readonly handleAncestorScroll = (): void => {
    if (this.open) {
      this.updatePanelPosition();
    }
  };

  readonly fieldId = `sic-timepicker-${++nextFieldId}`;

  @HostBinding('class.sic-timepicker-host') readonly hostClass = true;
  @HostBinding('class.sic-align-center') get isAlignCenter(): boolean {
    return this.align === 'center';
  }
  @HostBinding('class.sic-align-right') get isAlignRight(): boolean {
    return this.align === 'right';
  }

  override value: Date | null = null;
  open = false;
  segment: SicTimeSegment = 'hour';
  hour = 0;
  minute = 0;
  /** Date (year/month/day) the currently open panel's hour/minute get committed onto — the existing value's date, or today if there wasn't one. Fixed for the lifetime of one open/commit cycle so dragging never shifts the date underfoot. */
  private contextDate: Dayjs = dayjs();
  /**
   * The panel is positioned with `position: fixed` (viewport coordinates,
   * recomputed on open/scroll/resize) instead of `absolute` so it can escape
   * an ancestor with `overflow: auto`/`clip` — e.g. a sic-gridpanel cell —
   * instead of being clipped by it.
   */
  panelTop = 0;
  panelLeft = 0;

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
    this.value = this.toValidDate(value);
    this.cdr.markForCheck();
  }

  get displayValue(): string {
    return this.value ? `${pad2(this.value.getHours())}:${pad2(this.value.getMinutes())}` : '';
  }

  get showClear(): boolean {
    return this.clearable && !this.disabled && !this.readonly && !!this.value;
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

  private toValidDate(value: Date | string | null | undefined): Date | null {
    if (!value) {
      return null;
    }
    const d = dayjs(value);
    return d.isValid() ? d.toDate() : null;
  }

  get hourOuterNumbers(): SicClockNumber[] {
    return this.buildRing(0, FACE_OUTER_R);
  }

  get hourInnerNumbers(): SicClockNumber[] {
    return this.buildRing(12, FACE_INNER_R);
  }

  get minuteNumbers(): SicClockNumber[] {
    return Array.from({ length: 12 }, (_, i) => {
      const value = i * 5;
      const angle = i * 30 - 90;
      return { value, label: pad2(value), transform: polarTransform(angle, FACE_OUTER_R) };
    });
  }

  get handAngle(): number {
    return this.segment === 'hour' ? (this.hour % 12) * 30 - 90 : this.minute * 6 - 90;
  }

  get handLength(): number {
    if (this.segment === 'minute') {
      return FACE_OUTER_R;
    }
    return this.hour < 12 ? FACE_OUTER_R : FACE_INNER_R;
  }

  private buildRing(startValue: number, radius: number): SicClockNumber[] {
    return Array.from({ length: 12 }, (_, i) => {
      const value = startValue + i;
      const angle = i * 30 - 90;
      return { value, label: pad2(value), transform: polarTransform(angle, radius) };
    });
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

  /** An hour is only disabled if every minute within it falls outside [min, max] on the current context date. */
  isHourDisabled(h: number): boolean {
    const min = this.minDate;
    const max = this.maxDate;
    if (!min && !max) {
      return false;
    }
    const startOfHour = this.contextDate.hour(h).minute(0).second(0).millisecond(0);
    const endOfHour = this.contextDate.hour(h).minute(59).second(59).millisecond(999);
    return (!!min && endOfHour.isBefore(min)) || (!!max && startOfHour.isAfter(max));
  }

  isMinuteDisabled(m: number): boolean {
    const min = this.minDate;
    const max = this.maxDate;
    if (!min && !max) {
      return false;
    }
    const candidate = this.contextDate.hour(this.hour).minute(m).second(0).millisecond(0);
    return (!!min && candidate.isBefore(min)) || (!!max && candidate.isAfter(max));
  }

  handleFocusOut(event: FocusEvent): void {
    const next = event.relatedTarget as Node | null;

    if (!next || !this.elementRef.nativeElement.contains(next)) {
      this.closePanel();
    }
  }

  handleTriggerFocus(): void {
    if (this.isWithinReopenGuard()) {
      return;
    }

    if (this.disabled) {
      return;
    }

    this.openPanel();
  }

  handleTriggerClick(event: MouseEvent): void {
    event.preventDefault();

    // On some browsers/emulators, a compatibility `click` synthesized for a
    // touch gesture can target whatever element currently has focus rather
    // than the original touch coordinates — since `refocusTrigger()` moves
    // focus to the trigger right when a drag-release commits and closes the
    // panel, that stray click lands here and would otherwise reopen it
    // immediately. Guard this the same way as `handleTriggerFocus`.
    if (this.isWithinReopenGuard()) {
      return;
    }

    if (this.disabled) {
      return;
    }

    this.openPanel();
  }

  private isWithinReopenGuard(): boolean {
    return Date.now() - this.justClosedAt < REOPEN_GUARD_MS;
  }

  handleKeydown(event: KeyboardEvent): void {
    if (!this.open) {
      if (event.key === 'Enter' || event.key === ' ' || event.key === 'ArrowUp' || event.key === 'ArrowDown') {
        event.preventDefault();
        this.openPanel();
      }
      return;
    }

    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        this.segment = 'hour';
        break;
      case 'ArrowRight':
        event.preventDefault();
        this.segment = 'minute';
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.adjust(1);
        break;
      case 'ArrowDown':
        event.preventDefault();
        this.adjust(-1);
        break;
      case 'Enter':
        event.preventDefault();
        this.commit();
        break;
      case 'Escape':
        event.preventDefault();
        this.closePanel();
        this.refocusTrigger();
        break;
    }
  }

  setSegment(segment: SicTimeSegment, event?: MouseEvent): void {
    event?.preventDefault();
    this.segment = segment;
  }

  /**
   * Selecting a number on the clock face — a discrete tap and a
   * press-and-hold-then-slide are the same gesture here (a tap is just a
   * zero-movement drag), handled entirely through pointer events rather than
   * a `(click)` on each number button: pointerdown starts a drag (even when
   * it lands directly on a number, so holding one and sliding away still
   * works) and updates the value live via `updateFromPointer`, and release
   * finalizes it (advance to the minute segment, or commit and close). Using
   * pointer events exclusively — instead of also wiring `(click)` on the
   * number buttons and suppressing the browser's redundant compatibility
   * click — avoids relying on exactly-once click-suppression timing, which
   * differs enough across mobile browsers to be unreliable.
   */
  handleFacePointerDown(event: PointerEvent): void {
    if (this.disabled || this.readonly) {
      return;
    }

    // Also suppresses any compatibility mouse/click events the browser would
    // otherwise synthesize for this gesture — moot now that no `(click)`
    // handler exists on the numbers, but still prevents an unwanted
    // mousedown-driven focus shift onto the tapped number for mouse input.
    event.preventDefault();
    this.dragging = true;
    this.pointerOnDisabledTarget = false;
    this.updateFromPointer(event.clientX, event.clientY);
  }

  @HostListener('document:pointermove', ['$event'])
  handleDocumentPointerMove(event: PointerEvent): void {
    if (!this.dragging) {
      return;
    }

    this.updateFromPointer(event.clientX, event.clientY);
  }

  @HostListener('document:pointerup')
  @HostListener('document:pointercancel')
  handleDocumentPointerUp(): void {
    if (!this.dragging) {
      return;
    }

    this.dragging = false;

    if (this.pointerOnDisabledTarget) {
      // The release landed on a disabled hour/minute — updateFromPointer() already refused to
      // change hour/minute for it, so treat this as if nothing was pressed at all instead of
      // advancing to the minute segment (or committing and closing) with a stale, unchanged value.
      this.cdr.markForCheck();
      return;
    }

    if (this.segment === 'hour') {
      this.segment = 'minute';
    } else {
      this.commit();
    }

    this.cdr.markForCheck();
  }

  private updateFromPointer(clientX: number, clientY: number): void {
    const faceEl = this.faceRef?.nativeElement;
    if (!faceEl) {
      return;
    }

    const rect = faceEl.getBoundingClientRect();
    const radius = rect.width / 2;
    if (radius === 0) {
      return;
    }

    const dx = clientX - (rect.left + radius);
    const dy = clientY - (rect.top + radius);
    const radiusFraction = Math.sqrt(dx * dx + dy * dy) / radius;
    // atan2 is 0deg at 3 o'clock, counter-clockwise; +90 and normalize to get 0deg at 12 o'clock, clockwise.
    const angleDeg = (Math.atan2(dy, dx) * (180 / Math.PI) + 90 + 360) % 360;

    if (this.segment === 'hour') {
      const step = Math.round(angleDeg / 30) % 12;
      // Face radii (FACE_OUTER_R/FACE_INNER_R) are laid out assuming a 100px
      // face radius (12.5rem face at the default 16px root font-size).
      const isOuter = radiusFraction >= (FACE_OUTER_R + FACE_INNER_R) / 2 / 100;
      const nextHour = isOuter ? step : step + 12;

      this.pointerOnDisabledTarget = this.isHourDisabled(nextHour);
      if (!this.pointerOnDisabledTarget) {
        this.hour = nextHour;
      }
      return;
    }

    const nextMinute = Math.round(angleDeg / 6) % 60;
    this.pointerOnDisabledTarget = this.isMinuteDisabled(nextMinute);
    if (!this.pointerOnDisabledTarget) {
      this.minute = nextMinute;
    }
  }

  openPanel(): void {
    if (this.open) {
      return;
    }

    this.open = true;
    this.segment = 'hour';

    this.contextDate = this.value ? dayjs(this.value) : dayjs();
    this.hour = this.contextDate.hour();
    this.minute = this.contextDate.minute();
    this.updatePanelPosition();
  }

  closePanel(): void {
    this.open = false;
    this.dragging = false;
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

    // Measure the panel for real once it exists in the DOM and flip above
    // the trigger / clamp on-screen if it would otherwise run off the
    // viewport (e.g. a trigger near the right/bottom edge of the page).
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

  private adjust(delta: number): void {
    if (this.segment === 'hour') {
      this.hour = (this.hour + delta + 24) % 24;
    } else {
      this.minute = (this.minute + delta + 60) % 60;
    }
  }

  private commit(): void {
    // Keyboard nav (adjust(), via ArrowUp/ArrowDown) doesn't skip disabled hours/minutes as it
    // wraps — and Enter commits whatever's currently selected regardless of which segment is
    // active — so this is the last line of defense against actually committing a disabled time.
    if (this.isHourDisabled(this.hour) || this.isMinuteDisabled(this.minute)) {
      return;
    }

    // Base off contextDate (the value's own date, or today when there wasn't
    // one yet) so committing only ever changes the time-of-day — the date
    // never shifts underfoot just because the user picked a time.
    this.value = this.contextDate.hour(this.hour).minute(this.minute).second(0).millisecond(0).toDate();
    this.commitValue(this.value);
    this.markTouched();
    this.closePanel();
    this.refocusTrigger();
  }

  private refocusTrigger(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.justClosedAt = Date.now();
    this.triggerRef?.nativeElement.focus();

    // On touch devices, releasing over a panel-internal button (e.g. the
    // number just tapped) can shift focus there instead, at a delay that
    // varies by browser/OS — re-assert once more shortly after so focus
    // still visually lands back on the trigger in the common case. This is
    // purely cosmetic now: `justClosedAt` above is what actually prevents a
    // stray/delayed focus event from reopening the panel, regardless of
    // whether this second call wins the race.
    setTimeout(() => {
      const triggerEl = this.triggerRef?.nativeElement;
      if (!this.open && triggerEl && document.activeElement !== triggerEl) {
        triggerEl.focus();
      }
    });
  }
}
