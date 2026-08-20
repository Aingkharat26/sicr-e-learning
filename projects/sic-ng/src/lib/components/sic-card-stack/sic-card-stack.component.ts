import { CommonModule } from '@angular/common';
import {
  Component,
  ContentChild,
  EventEmitter,
  HostBinding,
  HostListener,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  TemplateRef,
} from '@angular/core';
import { injectSicConfig } from '../../config/sic-config';
import { SicCardStackItem } from './sic-card-stack.model';

/** Template context for `#cardTemplate`: `let-item let-index="index" let-position="position"`. */
export interface SicCardStackContext<T> {
  $implicit: SicCardStackItem<T>;
  index: number;
  /** 0 = front-most (fully visible) card, increasing toward the back of the stack. */
  position: number;
}

/**
 * A deck of overlapping cards: collapsed into a cascaded stack by default, fanning out on hover
 * (or via `[expanded]`). Clicking any card behind the front one brings it to the front, animating
 * every card's position with a CSS transition (front/back cards keep their DOM identity across
 * reorders via `trackBy`-by-id, so the transition is smooth rather than a re-render jump).
 * Customize card rendering with `#cardTemplate`.
 */
@Component({
  selector: 'sic-card-stack',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sic-card-stack.component.html',
  styleUrl: './sic-card-stack.component.css',
})
export class SicCardStackComponent<T = unknown> implements OnChanges {
  private readonly sicConfig = injectSicConfig();

  @Input() items: SicCardStackItem<T>[] = [];
  /** Fans the stack out on hover. Default: true. */
  @Input() expandOnHover = true;
  /** Set true/false to force the fanned-out state regardless of hover; leave null to follow hover. */
  @Input() expanded: boolean | null = null;

  /** Emits the item index whenever a back card is clicked and becomes the new front card. */
  @Output() activeIndexChange = new EventEmitter<number>();
  /** Emits on every card click, front or back. */
  @Output() cardClick = new EventEmitter<{ item: SicCardStackItem<T>; index: number }>();

  /** `<ng-template #cardTemplate let-item let-index="index" let-position="position">` overrides card rendering. */
  @ContentChild('cardTemplate') cardTemplate?: TemplateRef<SicCardStackContext<T>>;

  @HostBinding('class.sic-card-stack-host') readonly hostClass = true;

  private hovered = false;
  /** stackOrder[position] = item index; position 0 is the front-most card. */
  private stackOrder: number[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['items'] && this.stackOrder.length !== this.items.length) {
      this.stackOrder = this.items.map((_, i) => i);
    }
  }

  get noItemsText(): string {
    return this.sicConfig.messages?.noItems ?? 'No items';
  }

  get isExpanded(): boolean {
    return this.expanded ?? (this.expandOnHover && this.hovered);
  }

  @HostListener('mouseenter')
  onMouseEnter(): void {
    this.hovered = true;
  }

  @HostListener('mouseleave')
  onMouseLeave(): void {
    this.hovered = false;
  }

  positionOf(index: number): number {
    const position = this.stackOrder.indexOf(index);
    return position < 0 ? index : position;
  }

  zIndexOf(index: number): number {
    return this.items.length - this.positionOf(index);
  }

  trackByFn = (index: number, item: SicCardStackItem<T>): unknown => item.id ?? index;

  selectCard(index: number): void {
    this.cardClick.emit({ item: this.items[index], index });

    if (this.positionOf(index) === 0) {
      return;
    }

    this.stackOrder = [index, ...this.stackOrder.filter((i) => i !== index)];
    this.activeIndexChange.emit(index);
  }
}
