import { Component, HostBinding, Input } from '@angular/core';

export type SicTextSize = 'sm' | 'md' | 'lg';
export type SicTextWeight = 'normal' | 'semibold' | 'bold';
export type SicTextColor = 'default' | 'muted' | 'active' | 'success';

/**
 * sic-ng's small typography primitive — size/weight/color read from tokens, so labels, captions,
 * and body copy scattered across a page (contact labels, card descriptions, footer captions, a
 * success message, ...) share one component instead of one-off custom CSS per spot.
 */
@Component({
  selector: 'sic-text',
  standalone: true,
  template: `<ng-content></ng-content>`,
  styleUrl: './sic-text.component.css',
})
export class SicTextComponent {
  @Input() size: SicTextSize = 'md';
  @Input() weight: SicTextWeight = 'normal';
  @Input() color: SicTextColor = 'default';
  /** Renders as `display: block` instead of the default `inline`. */
  @Input() block = false;
  /** Uppercase + letter-spaced caption style, e.g. a footer section label. */
  @Input() eyebrow = false;

  @HostBinding('class.sic-text-host') readonly hostClass = true;
  @HostBinding('class.sic-text--sm') get isSm(): boolean {
    return this.size === 'sm';
  }
  @HostBinding('class.sic-text--lg') get isLg(): boolean {
    return this.size === 'lg';
  }
  @HostBinding('class.sic-text--semibold') get isSemibold(): boolean {
    return this.weight === 'semibold';
  }
  @HostBinding('class.sic-text--bold') get isBold(): boolean {
    return this.weight === 'bold';
  }
  @HostBinding('class.sic-text--muted') get isMuted(): boolean {
    return this.color === 'muted';
  }
  @HostBinding('class.sic-text--active') get isActive(): boolean {
    return this.color === 'active';
  }
  @HostBinding('class.sic-text--success') get isSuccess(): boolean {
    return this.color === 'success';
  }
  @HostBinding('class.sic-text--block') get isBlock(): boolean {
    return this.block;
  }
  @HostBinding('class.sic-text--eyebrow') get isEyebrow(): boolean {
    return this.eyebrow;
  }
}
