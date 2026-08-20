import { InjectionToken } from '@angular/core';

/** Injected into the opened component: `data = inject(SIC_DIALOG_DATA) as MyDataType`. */
export const SIC_DIALOG_DATA = new InjectionToken<unknown>('SIC_DIALOG_DATA');

export interface SicDialogConfig {
  width?: string;
  height?: string;
  disableClose?: boolean;
}

/**
 * Injected into the opened component (`inject(SicDialogRef)`) so it can close
 * itself and hand a result back to whoever called `SicDialogService.open()`.
 */
export class SicDialogRef<T = unknown, R = unknown> {
  componentInstance!: T;

  constructor(private readonly closeFn: (result?: R) => void) {}

  close(result?: R): void {
    this.closeFn(result);
  }
}
