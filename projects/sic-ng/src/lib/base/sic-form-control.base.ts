import { AfterViewInit, ChangeDetectorRef, Directive, HostBinding, Injector, Input, OnDestroy, OnInit, effect, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { AbstractControl, ControlValueAccessor, NgControl } from '@angular/forms';
import { BehaviorSubject, EMPTY, switchMap } from 'rxjs';
import { SicValidator } from '../validator/sic.validator';

export type SicSize = 'sm' | 'md' | 'lg';
export type SicTextAlign = 'left' | 'center' | 'right';

/**
 * Shared ControlValueAccessor plumbing for every sic-ng form control.
 * Mirrors the CVA shape used across sic-app/src/app/core/component (NgControl
 * pulled via Injector in ngOnInit, error state resolved through SicValidator).
 */
@Directive()
export abstract class SicFormControlBase<T> implements ControlValueAccessor, OnInit, AfterViewInit, OnDestroy {
  @Input() size: SicSize = 'sm';
  @Input() label?: string;
  @Input() hint?: string;
  @Input() disabled = false;
  @Input() readonly = false;
  @Input() errorMessages: Record<string, string> = {};

  @HostBinding('class.sic-size-sm') get isSm(): boolean {
    return this.size === 'sm';
  }
  @HostBinding('class.sic-size-lg') get isLg(): boolean {
    return this.size === 'lg';
  }
  @HostBinding('class.sic-disabled') get isDisabledHost(): boolean {
    return this.disabled;
  }

  abstract value: T;
  touched = false;

  protected readonly injector = inject(Injector);
  protected readonly validator = inject(SicValidator);
  protected readonly cdr = inject(ChangeDetectorRef);

  private ngControl: NgControl | null = null;

  // `null` until ngAfterViewInit resolves the real control (see below) — feeds `controlEvents`.
  // Kept as one stable Subject/Signal pair for this component's whole lifetime (never
  // reassigned): a signal that's read once during a template check and then *replaced* loses the
  // dependency Angular tracked on the old instance, since the template consumer was tracking that
  // specific signal object, not "whatever `this.controlEvents` currently points to". Pushing a new
  // value through this Subject instead keeps the exact same signal identity throughout, so the
  // dependency established on the very first render stays valid for the component's entire life.
  private readonly controlSource = new BehaviorSubject<AbstractControl | null>(null);

  /**
   * `markAsTouched()`/`markAllAsTouched()` (e.g. a parent form validating every control before
   * submit) never emits through `statusChanges`/`valueChanges` — Angular only fires those for
   * value/validity changes, not touched/pristine ones. `control.events` is the unified stream that
   * DOES include a `TouchedChangeEvent` for it (alongside status/value/pristine changes).
   * `toSignal()` turns that stream into a signal read from `showError`/`errorMessage` below — no
   * manual `Subscription`/`markForCheck()` needed: Angular's own change-detection scheduler picks
   * up the signal read as a dependency of this component's view and re-checks it on emit, and
   * `toSignal()` unsubscribes by itself via `DestroyRef` when this is destroyed. Without this, an
   * already-rendered control marked touched from the outside stays visually unchanged (no red
   * border/error message) until something unrelated happens to re-run change detection here.
   */
  private readonly controlEvents = toSignal(
    this.controlSource.pipe(switchMap((control) => control?.events ?? EMPTY)),
    { injector: this.injector, initialValue: undefined },
  );

  /**
   * `touched` (below) is this component's own blur-tracked flag — a fallback `shouldShowError` ORs
   * in alongside `control.touched`/`control.dirty`. `markTouched()` only ever sets it to `true`;
   * nothing resets it back to `false` on its own. Every subclass's `writeValue()` override replaces
   * the base implementation entirely (none call `super.writeValue()`), so resetting it there
   * wouldn't reliably run — instead, this effect re-syncs it from the control directly every time
   * `controlEvents` changes (any status/value/touched/pristine event), which reliably fires on
   * `form.reset()`. Without it, a field blurred even once keeps showError permanently gated open:
   * `reset()` correctly clears the *control's* own touched/dirty, but this stale local flag alone
   * would keep forcing showError back to true as soon as the control is invalid again (e.g. a
   * required field reset to empty).
   */
  private readonly syncTouchedFromControl = effect(
    () => {
      this.controlEvents();
      if (this.control && !this.control.touched) {
        this.touched = false;
      }
    },
    { injector: this.injector },
  );

  protected onChange: (value: T) => void = () => {};
  protected onTouched: () => void = () => {};

  ngOnInit(): void {
    this.ngControl = this.injector.get(NgControl, null);

    if (this.ngControl) {
      // Must happen here (not later, e.g. ngAfterViewInit) — FormControlName's own setup reads
      // this synchronously during its *own* ngOnChanges to wire up the control, which can run
      // before or after this directive's ngOnInit depending on the host element's directive
      // order, so this needs to be available as early as possible.
      this.ngControl.valueAccessor = this;
    }
  }

  ngAfterViewInit(): void {
    // `this.ngControl.control` is reliably populated by AfterViewInit (FormControlName's own
    // ngOnChanges/ngOnInit, which sets it, is guaranteed to have already run for every directive
    // on this host element by this point) — it is NOT reliably populated yet during THIS
    // directive's own ngOnInit, since directive initialization order on the same element isn't
    // guaranteed, so resolving it any earlier can silently capture `undefined`.
    this.controlSource.next(this.ngControl?.control ?? null);
  }

  // No cleanup of its own needed anymore (toSignal() above manages its own teardown via
  // DestroyRef) — kept as a no-op purely so subclasses that `override ngOnDestroy()` and call
  // `super.ngOnDestroy()` for their own cleanup keep compiling.
  ngOnDestroy(): void {}

  get control() {
    return this.validator.getControl(this.ngControl);
  }

  get showError(): boolean {
    this.controlEvents();
    return this.validator.shouldShowError(this.control, this.touched);
  }

  get errorMessage(): string | null {
    this.controlEvents();
    return this.validator.getErrorMessage(this.control, this.errorMessages);
  }

  get isRequired(): boolean {
    return this.validator.isRequired(this.control);
  }

  writeValue(value: T): void {
    this.value = value;
    // Called whenever a control's value is set programmatically (setValue/
    // patchValue/reset), regardless of that call's `emitEvent` option — the
    // one CVA hook guaranteed to fire, so this is where an externally-driven
    // update (e.g. a parent grid resetting a row) forces this component's
    // own view to actually re-render it.
    this.cdr.markForCheck();
  }

  registerOnChange(fn: (value: T) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    this.cdr.markForCheck();
  }

  markTouched(): void {
    if (!this.touched) {
      this.touched = true;
      this.onTouched();
    }
  }

  /**
   * Commits a new value through the normal CVA `onChange` pipeline, then
   * force-syncs the underlying control's value back out to every accessor
   * bound to it. Angular's forms plumbing deliberately suppresses that
   * model->view echo for the accessor that produced the change (to avoid a
   * feedback loop) — but that also means a second sic-ng control sharing the
   * very same `FormControl` (e.g. a datepicker editing the date portion and a
   * timepicker editing the time portion of one shared `Date`, both wired via
   * `[formControl]`/`formControlName`) would never see the other's update.
   * `emitEvent: false` avoids re-running validation/emitting valueChanges a
   * second time — `onChange` above already did that once.
   */
  protected commitValue(value: T): void {
    this.onChange(value);
    this.control?.setValue(value, { emitViewToModelChange: false, emitEvent: false });
  }
}
