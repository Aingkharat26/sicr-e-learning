import { CommonModule } from '@angular/common';
import { Component, ContentChild, HostBinding, Input, TemplateRef } from '@angular/core';
import { SicTimelineItem } from './sic-timeline.model';

export type SicTimelineOrientation = 'horizontal' | 'vertical';
export type SicTimelineSide = 'start' | 'end';

/** Template context handed to a custom `<ng-template #itemTemplate let-item let-index="index" let-side="side">` entry. */
export interface SicTimelineItemContext<T> {
  $implicit: T;
  index: number;
  side: SicTimelineSide;
}

/**
 * A vertical or horizontal timeline. `[alternate]` (default true) zigzags entries across the
 * axis line, same as the reference "history" layouts; set it to false to keep every entry on one
 * side instead. Provide `<ng-template #itemTemplate>` to fully customize how each entry renders —
 * otherwise a plain date/title/description block is used.
 */
@Component({
  selector: 'sic-timeline',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sic-timeline.component.html',
  styleUrl: './sic-timeline.component.css',
})
export class SicTimelineComponent<T extends SicTimelineItem = SicTimelineItem> {
  @Input() items: T[] = [];
  @Input() orientation: SicTimelineOrientation = 'vertical';
  /** Zigzag entries across the axis (default) instead of keeping them all on one side. */
  @Input() alternate = true;
  /** Which side item 0 renders on. With `alternate`, every following item flips; without it, every item stays on this side. */
  @Input() side: SicTimelineSide = 'start';

  /** `<ng-template #itemTemplate let-item let-index="index" let-side="side">` overrides how each entry renders. */
  @ContentChild('itemTemplate') itemTemplate?: TemplateRef<SicTimelineItemContext<T>>;

  @HostBinding('class.sic-timeline-host') readonly hostClass = true;
  @HostBinding('class.sic-timeline--horizontal') get isHorizontal(): boolean {
    return this.orientation === 'horizontal';
  }
  @HostBinding('class.sic-timeline--hide-start') get hideStart(): boolean {
    return !this.alternate && this.side === 'end';
  }
  @HostBinding('class.sic-timeline--hide-end') get hideEnd(): boolean {
    return !this.alternate && this.side === 'start';
  }

  contentSide(index: number): SicTimelineSide {
    if (!this.alternate) {
      return this.side;
    }

    if (index % 2 === 0) {
      return this.side;
    }

    return this.side === 'start' ? 'end' : 'start';
  }

  trackByFn = (_index: number, item: T): unknown => item;
}
