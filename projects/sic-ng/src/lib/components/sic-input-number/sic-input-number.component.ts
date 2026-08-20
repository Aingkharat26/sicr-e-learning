import { CommonModule } from '@angular/common';
import { Component, HostBinding, Input, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { injectSicConfig } from '../../config/sic-config';
import { SicFormControlBase, SicTextAlign } from '../../base/sic-form-control.base';

@Component({
  selector: 'sic-input-number',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sic-input-number.component.html',
  styleUrl: './sic-input-number.component.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SicInputNumberComponent),
      multi: true,
    },
  ],
})
export class SicInputNumberComponent extends SicFormControlBase<number | null> {
  private readonly sicConfig = injectSicConfig();

  @Input() name?: string;
  @Input() placeholder = '';
  @Input() min?: number;
  @Input() max?: number;
  @Input() prefix = '';
  @Input() suffix = '';
  @Input() align: SicTextAlign = 'right';
  @Input() decimals = this.sicConfig.decimals ?? 2;
  @Input() thousandSeparator = ',';
  @Input() decimalSeparator = '.';

  @HostBinding('class.sic-input-number-host') readonly hostClass = true;
  @HostBinding('class.sic-align-center') get isAlignCenter(): boolean {
    return this.align === 'center';
  }
  @HostBinding('class.sic-align-right') get isAlignRight(): boolean {
    return this.align === 'right';
  }

  override value: number | null = null;

  private focused = false;
  private rawValue = '';

  get displayValue(): string {
    return this.focused ? this.rawValue : this.formatNumber(this.value);
  }

  override writeValue(value: number | null | undefined): void {
    this.value = value ?? null;
    this.cdr.markForCheck();
  }

  handleFocus(): void {
    this.focused = true;
    this.rawValue = this.value != null ? this.toEditableString(this.value) : '';
  }

  handleInput(event: Event): void {
    const raw = (event.target as HTMLInputElement).value;
    this.rawValue = raw;

    const parsed = this.parseInput(raw);
    this.value = parsed;
    this.onChange(parsed);
  }

  handleBlur(): void {
    this.focused = false;

    if (this.value != null) {
      this.value = this.clamp(this.roundToDecimals(this.value));
      this.onChange(this.value);
    }

    this.rawValue = '';
    this.markTouched();
  }

  private clamp(value: number): number {
    let next = value;

    if (this.min !== undefined) {
      next = Math.max(this.min, next);
    }
    if (this.max !== undefined) {
      next = Math.min(this.max, next);
    }

    return next;
  }

  private roundToDecimals(value: number): number {
    return Number(value.toFixed(this.decimals));
  }

  private toEditableString(value: number): string {
    const fixed = this.roundToDecimals(value).toFixed(this.decimals);
    return this.decimalSeparator === '.' ? fixed : fixed.replace('.', this.decimalSeparator);
  }

  private formatNumber(value: number | null): string {
    if (value == null || Number.isNaN(value)) {
      return '';
    }

    const fixed = this.roundToDecimals(value).toFixed(this.decimals);
    const negative = fixed.startsWith('-');
    const [intPart, decPart] = (negative ? fixed.slice(1) : fixed).split('.');
    const grouped = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, this.thousandSeparator);
    const sign = negative ? '-' : '';

    return decPart !== undefined ? `${sign}${grouped}${this.decimalSeparator}${decPart}` : `${sign}${grouped}`;
  }

  private parseInput(raw: string): number | null {
    const trimmed = raw.trim();

    if (trimmed === '' || trimmed === '-') {
      return null;
    }

    let cleaned = trimmed.split(this.thousandSeparator).join('');

    if (this.decimalSeparator !== '.') {
      cleaned = cleaned.split(this.decimalSeparator).join('.');
    }

    const parsed = Number(cleaned);
    return Number.isNaN(parsed) ? this.value : parsed;
  }
}
