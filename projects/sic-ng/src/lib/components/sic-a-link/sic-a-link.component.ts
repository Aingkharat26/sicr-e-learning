import { CommonModule } from '@angular/common';
import { Component, HostBinding, Input } from '@angular/core';
import { SicButtonSize, SicButtonVariant } from '../sic-button/sic-button.component';

/**
 * A real `<a>` styled exactly like `sic-button` (same variant/color/size, same CSS) — for cases
 * that need actual link semantics instead of a button with a click handler: right-click "open in
 * new tab", ctrl/cmd-click, crawlable `href`, `download`, etc.
 */
@Component({
  selector: 'sic-a-link',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sic-a-link.component.html',
  styleUrl: './sic-a-link.component.css',
})
export class SicALinkComponent {
  @Input() href?: string;
  @Input() target?: '_blank' | '_self' | '_parent' | '_top';
  /** Overrides the `target="_blank"` auto `rel="noopener noreferrer"` default. */
  @Input() rel?: string;
  /** `true` for a bare `download` attribute, or a string to suggest a filename. */
  @Input() download?: string | boolean;

  @Input() variant: SicButtonVariant = 'solid';
  @Input() color: 'primary' | 'success' | 'danger' | 'warning' = 'primary';
  @Input() size: SicButtonSize = 'sm';
  @Input() disabled = false;
  @Input() block = false;
  /** Shrinks the whole rendered link on narrow phones (<=480px), matching `sic-button`'s own input. */
  @Input() compactOnMobile = false;

  @HostBinding('class.sic-button-host') readonly hostClass = true;
  @HostBinding('class.sic-button--block') get isBlock(): boolean {
    return this.block;
  }
  @HostBinding('class.sic-button--compact-mobile') get isCompactOnMobile(): boolean {
    return this.compactOnMobile;
  }

  get resolvedHref(): string | null {
    return this.disabled ? null : (this.href ?? null);
  }

  get resolvedRel(): string | null {
    if (this.rel) {
      return this.rel;
    }
    return this.target === '_blank' ? 'noopener noreferrer' : null;
  }

  get resolvedDownload(): string | null {
    if (this.download === true) {
      return '';
    }
    return this.download || null;
  }

  handleClick(event: MouseEvent): void {
    if (this.disabled) {
      event.preventDefault();
    }
  }
}
