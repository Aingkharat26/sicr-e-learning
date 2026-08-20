import { CommonModule } from '@angular/common';
import { Component, HostBinding, Input } from '@angular/core';

@Component({
  selector: 'sic-grid',
  standalone: true,
  imports: [CommonModule],
  template: `<ng-content></ng-content>`,
  styleUrl: './sic-grid.component.css',
})
export class SicGridComponent {
  @Input() cols = 12;
  @Input() gap = 'var(--sic-space-4)';
  /** Breakpoint → column count, e.g. { sm: 1, md: 2, lg: 4 } */
  @Input() colsBreakpoints: Record<'sm' | 'md' | 'lg', number> | null = null;

  @HostBinding('style.display') readonly display = 'grid';
  @HostBinding('style.gap') get gridGap() {
    return this.gap;
  }
  @HostBinding('class.sic-grid--responsive') get responsive() {
    return !!this.colsBreakpoints;
  }
  // Only bind an inline grid-template-columns when there are no breakpoints — an inline style
  // always wins over the stylesheet's `@media` rules regardless of specificity, so leaving this
  // set in responsive mode silently pinned the grid to `cols` at every viewport width and made
  // colsBreakpoints do nothing. Unset (null removes the style entirely) lets .sic-grid--responsive's
  // CSS custom properties/@media rules take over instead.
  @HostBinding('style.grid-template-columns') get gridCols() {
    return this.colsBreakpoints ? null : `repeat(${this.cols}, minmax(0, 1fr))`;
  }
  @HostBinding('style.--sic-grid-cols-sm') get colsSm() {
    return this.colsBreakpoints?.sm ?? this.cols;
  }
  @HostBinding('style.--sic-grid-cols-md') get colsMd() {
    return this.colsBreakpoints?.md ?? this.cols;
  }
  @HostBinding('style.--sic-grid-cols-lg') get colsLg() {
    return this.colsBreakpoints?.lg ?? this.cols;
  }
}
