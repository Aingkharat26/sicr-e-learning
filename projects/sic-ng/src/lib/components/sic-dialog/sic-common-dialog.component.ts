import { CommonModule } from '@angular/common';
import { Component, HostBinding, inject } from '@angular/core';
import { injectSicConfig } from '../../config/sic-config';
import { SicButtonComponent } from '../sic-button/sic-button.component';
import { SIC_DIALOG_DATA, SicDialogRef } from './sic-dialog.tokens';

export type SicCommonDialogType = 'info' | 'success' | 'danger' | 'warning' | 'confirm';

export interface SicCommonDialogData {
  type: SicCommonDialogType;
  title: string;
  description: string;
  closeText?: string;
  cancelText?: string;
  confirmText?: string;
}

/**
 * Shared body for `SicDialogService.info/success/danger/warning/confirm()` —
 * icon on top, then title, then description, then a `sic-button` footer
 * (a single "Close" button, or "Cancel"/"Confirm" for the confirm type).
 */
@Component({
  selector: 'sic-common-dialog',
  standalone: true,
  imports: [CommonModule, SicButtonComponent],
  templateUrl: './sic-common-dialog.component.html',
  styleUrl: './sic-common-dialog.component.css',
})
export class SicCommonDialogComponent {
  readonly data = inject(SIC_DIALOG_DATA) as SicCommonDialogData;
  private readonly dialogRef = inject<SicDialogRef<SicCommonDialogComponent, boolean>>(SicDialogRef);
  private readonly sicConfig = injectSicConfig();

  @HostBinding('class.sic-common-dialog-host') readonly hostClass = true;

  get isConfirm(): boolean {
    return this.data.type === 'confirm';
  }

  get buttonColor(): 'primary' | 'success' | 'danger' | 'warning' {
    return this.data.type === 'info' || this.data.type === 'confirm' ? 'primary' : this.data.type;
  }

  get cancelText(): string {
    return this.data.cancelText ?? this.sicConfig.messages?.cancel ?? 'Cancel';
  }

  get confirmText(): string {
    return this.data.confirmText ?? this.sicConfig.messages?.confirm ?? 'Confirm';
  }

  get closeText(): string {
    return this.data.closeText ?? this.sicConfig.messages?.close ?? 'Close';
  }

  close(result?: boolean): void {
    this.dialogRef.close(result);
  }
}
