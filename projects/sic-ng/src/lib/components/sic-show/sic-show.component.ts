import { Component, HostBinding, Input } from '@angular/core';

export type SicShowBreakpoint = 'md' | 'lg';

/**
 * Shows or hides projected content at a breakpoint entirely through this component's own scoped
 * CSS — a real, typed component instead of a utility class the consumer has to memorize. Matches
 * the breakpoint scale sic-grid/sic-masonry already use (`md`: 768px, `lg`: 1024px). Renders as
 * `display: contents` when visible, so the wrapped content still participates directly in the
 * parent's own flex/grid layout instead of being boxed inside an extra element.
 */
@Component({
  selector: 'sic-show',
  standalone: true,
  template: `<ng-content></ng-content>`,
  styleUrl: './sic-show.component.css',
})
export class SicShowComponent {
  /** Visible from this breakpoint up, hidden below it. */
  @Input() from?: SicShowBreakpoint;
  /** Visible up to (below) this breakpoint, hidden from it up. */
  @Input() upTo?: SicShowBreakpoint;

  @HostBinding('class.sic-show--from-md') get isFromMd(): boolean {
    return this.from === 'md';
  }
  @HostBinding('class.sic-show--from-lg') get isFromLg(): boolean {
    return this.from === 'lg';
  }
  @HostBinding('class.sic-show--upto-md') get isUpToMd(): boolean {
    return this.upTo === 'md';
  }
  @HostBinding('class.sic-show--upto-lg') get isUpToLg(): boolean {
    return this.upTo === 'lg';
  }
}
