import { SicFormData } from './sic-form-data';
import { SicGridPanelComponent } from '../components/sic-gridpanel/sic-gridpanel.component';

export type SicFormCombineSource = SicFormData<any> | SicGridPanelComponent;

export interface SicFormCombineResult<TValue = Record<string, unknown>> {
  /** True only if every source is currently valid. Read live — reflects edits made after `sicFormCombine()` was called. */
  readonly valid: boolean;
  readonly invalid: boolean;
  /** One key per entry of `sources`: a `SicFormData`'s `.value`, or a grid's pending new/updated/deleted rows via `getChangedRowsPayload()`. Read live. */
  readonly value: TValue;
  /** Touches every source's controls, so invalid fields/rows show their error state — proxies to each source's own `markAllAsTouched()`. */
  markAllAsTouched(): void;
  /** Reverts every source back to its last-known baseline — proxies to each source's own `restore()`. */
  restore(): void;
  /** Clears every source back to blank/pristine — proxies to each source's own `reset()`. */
  reset(): void;
}

/**
 * Combines several `SicFormData` instances and/or `SicGridPanelComponent`s
 * (e.g. one form plus multiple editable grids on the same page) into a single
 * result — for validating and submitting them together as one JSON payload.
 */
export function sicFormCombine<TValue = Record<string, unknown>>(
  sources: Record<string, SicFormCombineSource>,
): SicFormCombineResult<TValue> {
  const entries = Object.entries(sources);

  return {
    get valid(): boolean {
      return entries.every(([, source]) => source.valid);
    },
    get invalid(): boolean {
      return !this.valid;
    },
    get value(): TValue {
      const value: Record<string, unknown> = {};
      for (const [key, source] of entries) {
        value[key] = source instanceof SicFormData ? source.value : source.getChangedRowsPayload();
      }
      return value as TValue;
    },
    markAllAsTouched(): void {
      entries.forEach(([, source]) => source.markAllAsTouched());
    },
    restore(): void {
      entries.forEach(([, source]) => source.restore());
    },
    reset(): void {
      entries.forEach(([, source]) => source.reset());
    },
  };
}
