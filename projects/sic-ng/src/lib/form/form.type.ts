import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { SicEntityState } from './sic-entity-state';
import { SicStateModel } from './sic-form-data';

/**
 * Maps a flat model to its `FormGroup` controls shape, e.g. for
 * `new FormGroup<ToForm<TModel>>({ ... })`.
 *
 * - `-?` drops the source model's own optional (`?:`) modifier: an optional
 *   *field* on the model must not become an optional *control* on the form —
 *   the control should always exist, only its value may be `null`/unset.
 * - Only for flat models. A nested object/array field maps to a single
 *   `FormControl` holding that whole value, not a nested `FormGroup`/`FormArray`.
 */
export type ToForm<T extends object> = {
  [K in keyof T]-?: FormControl<T[K] | null>;
};

/**
 * Builds a `FormGroup<ToForm<TModel>>` for a `SicStateModel`-based model from just its domain
 * field controls — `state` is appended automatically, so a form definition never has to repeat
 * `state: fb.control(...)` by hand (and can't forget it, unlike `SicFormData`'s own defensive
 * fallback for a form built without one).
 */
export function createSicFormGroup<TModel extends SicStateModel>(
  fb: FormBuilder,
  controls: ToForm<Omit<TModel, 'state'>>,
): FormGroup<ToForm<TModel>> {
  return fb.group({
    ...controls,
    state: fb.control<SicEntityState | null>(null),
  }) as unknown as FormGroup<ToForm<TModel>>;
}
