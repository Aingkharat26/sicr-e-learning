import { CommonModule } from '@angular/common';
import { Component, HostBinding, Input, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { SicFormControlBase, SicTextAlign } from '../../base/sic-form-control.base';

@Component({
  selector: 'sic-colorpicker',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sic-colorpicker.component.html',
  styleUrl: './sic-colorpicker.component.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SicColorpickerComponent),
      multi: true,
    },
  ],
})
export class SicColorpickerComponent extends SicFormControlBase<string | null> {
  @Input() allowText = true;
  @Input() align: SicTextAlign = 'left';
  @Input() clearable = true;

  @HostBinding('class.sic-colorpicker-host') readonly hostClass = true;
  @HostBinding('class.sic-align-center') get isAlignCenter(): boolean {
    return this.align === 'center';
  }
  @HostBinding('class.sic-align-right') get isAlignRight(): boolean {
    return this.align === 'right';
  }

  override value: string | null = '#2563eb';

  /** Native <input type="color"> can't represent "no color" — this is only
   *  what the swatch itself renders; `value` (the real, emitted state) stays null. */
  get swatchValue(): string {
    return this.value ?? '#ffffff';
  }

  get showClear(): boolean {
    return this.clearable && !this.disabled && !this.readonly && !!this.value;
  }

  override writeValue(value: string | null | undefined): void {
    this.value = value ?? null;
    this.cdr.markForCheck();
  }

  handleColorInput(event: Event): void {
    this.value = (event.target as HTMLInputElement).value;
    this.onChange(this.value);
  }

  handleTextInput(event: Event): void {
    const raw = (event.target as HTMLInputElement).value;

    if (this.isValidHex(raw)) {
      this.value = raw;
      this.onChange(this.value);
    }
  }

  handleTextBlur(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (!this.isValidHex(input.value)) {
      input.value = this.value ?? '';
    }

    this.markTouched();
  }

  private isValidHex(raw: string): boolean {
    return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(raw);
  }

  clear(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();

    if (this.disabled || this.readonly) {
      return;
    }

    this.value = null;
    this.onChange(this.value);
    this.markTouched();
  }

  handleBlur(): void {
    this.markTouched();
  }
}
