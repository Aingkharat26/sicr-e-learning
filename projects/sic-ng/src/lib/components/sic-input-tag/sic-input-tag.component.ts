import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostBinding, Input, ViewChild, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { SicFormControlBase } from '../../base/sic-form-control.base';
import { SicTagColor, SicTagComponent, SicTagItem } from '../sic-tag/sic-tag.component';

let nextFieldId = 0;

@Component({
  selector: 'sic-input-tag',
  standalone: true,
  imports: [CommonModule, SicTagComponent],
  templateUrl: './sic-input-tag.component.html',
  styleUrl: './sic-input-tag.component.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SicInputTagComponent),
      multi: true,
    },
  ],
})
export class SicInputTagComponent extends SicFormControlBase<string> {
  /** Character (or string) that ends a tag while typing. Also used to join the committed tags into the exported string value. */
  @Input() delimiter = ',';
  @Input() placeholder = 'Add tag...';
  /** Truncates any tag longer than this many characters (typed or pasted). */
  @Input() maxTagLength?: number;
  /** Once this many tags exist, no more can be added — the input is disabled. */
  @Input() maxTags?: number;
  /** Color of the rendered tag pills (see sic-tag's `color`). */
  @Input() tagColor: SicTagColor = 'neutral';

  @ViewChild('inputEl') private inputRef?: ElementRef<HTMLInputElement>;

  @HostBinding('class.sic-input-tag-host') readonly hostClass = true;

  readonly fieldId = `sic-input-tag-${++nextFieldId}`;

  override value = '';
  tags: string[] = [];
  inputValue = '';

  get tagItems(): SicTagItem[] {
    return this.tags.map((text) => ({ text, color: this.tagColor }));
  }

  get isAtMaxTags(): boolean {
    return this.maxTags !== undefined && this.tags.length >= this.maxTags;
  }

  override writeValue(value: string | null | undefined): void {
    this.value = value ?? '';
    this.tags = this.splitTags(this.value);
    this.inputValue = '';
    this.cdr.markForCheck();
  }

  focusInput(): void {
    this.inputRef?.nativeElement.focus();
  }

  handleInput(event: Event): void {
    const raw = (event.target as HTMLInputElement).value;

    if (!this.delimiter) {
      this.inputValue = this.clampLength(raw);
      return;
    }

    // Only a segment terminated by the delimiter becomes a tag — whatever
    // comes after the last delimiter is still being typed and stays pending.
    const parts = raw.split(this.delimiter);
    const pending = parts.pop() ?? '';

    for (const part of parts) {
      this.addTag(part);
    }

    this.inputValue = this.clampLength(pending);
  }

  handleKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      if (this.addTag(this.inputValue)) {
        this.inputValue = '';
      }
      return;
    }

    if (event.key === 'Backspace' && !this.inputValue && this.tags.length) {
      event.preventDefault();
      this.removeTag(this.tags.length - 1);
    }
  }

  handleBlur(): void {
    if (this.addTag(this.inputValue)) {
      this.inputValue = '';
    }
    this.markTouched();
  }

  removeTag(index: number): void {
    if (this.disabled || this.readonly) {
      return;
    }

    this.tags = this.tags.filter((_, i) => i !== index);
    this.emitTags();
  }

  /** Adds `raw` as a new tag if it's non-empty and under the tag-count limit. Returns whether it was added. */
  private addTag(raw: string): boolean {
    if (this.disabled || this.readonly || this.isAtMaxTags) {
      return false;
    }

    const text = this.clampLength(raw.trim());
    if (!text) {
      return false;
    }

    this.tags = [...this.tags, text];
    this.emitTags();
    return true;
  }

  private emitTags(): void {
    this.value = this.tags.join(this.delimiter);
    this.commitValue(this.value);
    this.markTouched();
  }

  private clampLength(text: string): string {
    return this.maxTagLength ? text.slice(0, this.maxTagLength) : text;
  }

  private splitTags(value: string): string[] {
    if (!value) {
      return [];
    }

    const parts = this.delimiter ? value.split(this.delimiter) : [value];
    return parts.map((part) => this.clampLength(part.trim())).filter(Boolean);
  }
}
