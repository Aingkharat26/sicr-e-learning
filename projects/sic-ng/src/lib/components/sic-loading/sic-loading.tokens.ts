import { InjectionToken, WritableSignal } from '@angular/core';

export interface SicLoadingState {
  message?: string;
  /** URL to a .png/.gif (or any image) shown instead of the default sic-spinner. */
  image?: string;
  spinnerSize: 'sm' | 'md' | 'lg';
}

/** Injected into `SicLoadingOverlayComponent` — a live signal so `hide()`'s sibling setters can update it while shown. */
export const SIC_LOADING_STATE = new InjectionToken<WritableSignal<SicLoadingState>>('SIC_LOADING_STATE');
