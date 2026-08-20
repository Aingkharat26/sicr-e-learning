import { CommonModule } from '@angular/common';
import { Component, HostBinding, Input } from '@angular/core';

export type SicButtonVariant = 'solid' | 'outline' | 'ghost';
export type SicButtonSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'sic-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sic-button.component.html',
  styleUrl: './sic-button.component.css',
})
export class SicButtonComponent {
  @Input() variant: SicButtonVariant = 'solid';
  @Input() color: 'primary' | 'success' | 'danger' | 'warning' = 'primary';
  /** Default matches SicFormControlBase's default ('sm'), so a button sitting next to a default-sized sic-input/sic-combobox/etc. lines up without either side having to set `size` explicitly. */
  @Input() size: SicButtonSize = 'sm';
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() disabled = false;
  @Input() loading = false;
  @Input() block = false;
  /** Shrinks the whole rendered button on narrow phones (<=480px) — for a large CTA that would
   * otherwise crowd a small viewport, without needing a separate `size="sm"` binding just for it. */
  @Input() compactOnMobile = false;

  @HostBinding('class.sic-button-host') readonly hostClass = true;
  @HostBinding('class.sic-button--block') get isBlock() {
    return this.block;
  }
  @HostBinding('class.sic-button--compact-mobile') get isCompactOnMobile() {
    return this.compactOnMobile;
  }
}
