import { FormControl, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { SicEntityState } from './sic-entity-state';

export type SicStateModel = {
  state?: SicEntityState | null;
};

/**
 * Wraps a row's `FormGroup` with EF-Core-style change tracking (`SicEntityState`),
 * for building an "editable grid" where each row needs to report whether it's
 * new/edited/deleted before a bulk save.
 */
export class SicFormData<TModel extends object & SicStateModel> {
  private initialModel: TModel;
  private initialComparableValue: Record<string, unknown>;
  private readonly subscription: Subscription;
  private currentState: SicEntityState;
  // Whether `state` belongs in `.value`'s returned shape at all — true only when the caller's own
  // `TModel`/form actually has a `state` field (e.g. an editable-grid row that needs it for a
  // bulk-save payload). A model that doesn't declare `state` (like a plain contact-form model)
  // should never see it leak into `.value`, even though the underlying FormGroup always has a
  // `state` control internally for tracking purposes.
  private readonly includesStateInValue: boolean;

  constructor(
    private readonly sourceFormGroup: FormGroup,
    model?: TModel,
  ) {
    const formHadStateControl = this.sourceFormGroup.contains('state');

    // A form built without a `state` control (easy to forget when hand-writing an
    // `fb.group({...})` call) would otherwise silently swallow every state update — `writeState()`
    // only syncs onto a control that already exists. Adding it here means callers never have to
    // remember `state: fb.control(...)` themselves.
    if (!formHadStateControl) {
      this.sourceFormGroup.addControl('state', new FormControl<SicEntityState | null>(null), { emitEvent: false });
    }

    // Whether the caller handed us an existing entity (loaded row) vs. left it
    // undefined for a brand-new blank row — this, not any particular field on
    // the model, is what decides the Unchanged/Added default below.
    const hasExplicitModel = model !== undefined;
    const resolvedModel = hasExplicitModel ? (model as TModel) : (this.sourceFormGroup.getRawValue() as TModel);

    this.includesStateInValue = hasExplicitModel
      ? Object.prototype.hasOwnProperty.call(model, 'state')
      : formHadStateControl;

    this.sourceFormGroup.patchValue(resolvedModel, { emitEvent: false });

    this.initialModel = this.cloneValue(resolvedModel);
    this.currentState = this.resolveInitialState(resolvedModel, hasExplicitModel);
    this.initialComparableValue = this.toComparableValue(this.sourceFormGroup.getRawValue());

    this.writeState(this.currentState);
    this.subscription = this.sourceFormGroup.valueChanges.subscribe(() => this.syncStateFromForm());
  }

  get isChanged(): boolean {
    return this.currentState === SicEntityState.Modified || this.currentState === SicEntityState.Added || this.currentState === SicEntityState.Deleted;
  }

  get isNotChanged(): boolean {
    return this.currentState === SicEntityState.Unchanged || this.currentState === SicEntityState.Detached;
  }

  get state(): SicEntityState {
    return this.currentState;
  }

  get formGroup(): FormGroup {
    return this.sourceFormGroup;
  }

  // A row marked for deletion is about to be dropped from the payload entirely,
  // so its own validators (required fields, etc.) shouldn't be able to block a
  // save that a caller drives by checking every row's `invalid` first.
  get invalid(): boolean {
    return this.currentState !== SicEntityState.Deleted && this.sourceFormGroup.invalid;
  }

  get valid(): boolean {
    return !this.invalid;
  }

  get value(): TModel {
    const rawValue = this.sourceFormGroup.getRawValue() as Partial<TModel> & { state?: unknown };
    const merged: Record<string, unknown> = {
      ...this.cloneValue(this.initialModel),
      ...rawValue,
    };

    if (this.includesStateInValue) {
      merged['state'] = this.currentState;
    } else {
      delete merged['state'];
    }

    return merged as TModel;
  }

  delete(): void {
    this.writeState(SicEntityState.Deleted);
  }

  /**
   * Discards any unsaved edits by patching the form's values back to the last-known-saved
   * baseline (the model this `SicFormData` was constructed/last `markAsPristine()`d with), then
   * re-derives state from that — which also reverses a pending `delete()`, since the row's value
   * no longer differs from its baseline. Works regardless of the row's current state, except a
   * still-`Added` (never-saved) row, which stays `Added` — reverted back to blank, it's still a
   * pending new row, not a persisted-and-unchanged one.
   */
  restore(): void {
    this.sourceFormGroup.patchValue(this.initialModel, { emitEvent: false });

    if (this.currentState === SicEntityState.Added) {
      this.writeState(SicEntityState.Added);
      return;
    }

    this.applyComparableState();
  }

  /** Clears every control back to its own default value (e.g. `fb.control(null)` → `null`) and
   * marks the form pristine/untouched — for starting a brand-new blank entry. State is then
   * re-derived reactively from the resulting (blank) value, same as any other edit. */
  reset(): void {
    this.sourceFormGroup.reset();
  }

  markAllAsTouched(): void {
    this.sourceFormGroup.markAllAsTouched();
  }

  /**
   * Call after a successful save: resets Angular's own `dirty` flag AND
   * re-baselines both the comparable value used for dirty-checking and `restore()`'s target
   * value to the row's current (just-saved) value — without this, editing the row again
   * afterwards (or calling `restore()`) would keep comparing/reverting against the value from
   * when this `SicFormData` was first constructed, not the value that was actually saved.
   */
  markAsPristine(): void {
    this.sourceFormGroup.markAsPristine();
    this.initialModel = this.cloneValue(this.sourceFormGroup.getRawValue()) as TModel;
    this.initialComparableValue = this.toComparableValue(this.sourceFormGroup.getRawValue());
    this.writeState(SicEntityState.Unchanged);
  }

  destroy(): void {
    this.subscription.unsubscribe();
  }

  get dirty(): boolean {
    return this.sourceFormGroup.dirty;
  }

  private syncStateFromForm(): void {
    if (this.currentState === SicEntityState.Deleted) {
      return;
    }

    if (this.currentState === SicEntityState.Added) {
      this.writeState(SicEntityState.Added);
      return;
    }

    this.applyComparableState();
  }

  private applyComparableState(): void {
    const currentComparableValue = this.toComparableValue(this.sourceFormGroup.getRawValue());
    const hasChanges = !this.isEqual(this.initialComparableValue, currentComparableValue);

    this.writeState(hasChanges ? SicEntityState.Modified : SicEntityState.Unchanged);
  }

  private resolveInitialState(model: TModel, hasExplicitModel: boolean): SicEntityState {
    if (model.state != null) {
      return model.state;
    }

    return hasExplicitModel ? SicEntityState.Unchanged : SicEntityState.Added;
  }

  private writeState(state: SicEntityState): void {
    this.currentState = state;

    const stateControl = this.sourceFormGroup.get('state');
    if (stateControl) {
      stateControl.setValue(state, { emitEvent: false });
    }
  }

  private toComparableValue(value: Record<string, unknown>): Record<string, unknown> {
    const comparableValue = this.cloneValue(value);
    delete comparableValue['state'];
    return comparableValue;
  }

  private cloneValue<TValue>(value: TValue): TValue {
    if (typeof globalThis.structuredClone === 'function') {
      return globalThis.structuredClone(value);
    }

    return this.cloneFallback(value);
  }

  private cloneFallback<TValue>(value: TValue): TValue {
    if (value == null || typeof value !== 'object') {
      return value;
    }

    if (value instanceof Date) {
      return new Date(value.getTime()) as TValue;
    }

    if (Array.isArray(value)) {
      return value.map((item) => this.cloneFallback(item)) as TValue;
    }

    const clone: Record<string, unknown> = {};
    for (const [key, item] of Object.entries(value)) {
      clone[key] = this.cloneFallback(item);
    }

    return clone as TValue;
  }

  private isEqual(left: unknown, right: unknown): boolean {
    if (left === right) {
      return true;
    }

    if (left instanceof Date && right instanceof Date) {
      return left.getTime() === right.getTime();
    }

    if (
      left == null ||
      right == null ||
      typeof left !== 'object' ||
      typeof right !== 'object'
    ) {
      return false;
    }

    if (Array.isArray(left) || Array.isArray(right)) {
      if (!Array.isArray(left) || !Array.isArray(right) || left.length !== right.length) {
        return false;
      }

      return left.every((item, index) => this.isEqual(item, right[index]));
    }

    const leftEntries = Object.entries(left);
    const rightEntries = Object.entries(right);

    if (leftEntries.length !== rightEntries.length) {
      return false;
    }

    return leftEntries.every(([key, value]) => this.isEqual(value, (right as Record<string, unknown>)[key]));
  }
}
