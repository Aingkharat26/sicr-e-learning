import { CommonModule } from '@angular/common';
import { Component, EventEmitter, HostBinding, HostListener, Input, Output } from '@angular/core';

export interface SicAvatarItem {
  src?: string;
  name?: string;
}

function initialsOf(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

@Component({
  selector: 'sic-avatar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sic-avatar.component.html',
  styleUrl: './sic-avatar.component.css',
})
export class SicAvatarComponent {
  @Input() src?: string;
  @Input() name = '';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  /** Renders a left-to-right overlapping stack instead of a single avatar — hovering one brings it fully in front of its neighbors. */
  @Input() items?: SicAvatarItem[];

  /** Fires on click in single-avatar mode (no `items`). */
  @Output() avatarClick = new EventEmitter<MouseEvent>();
  /** Fires on click of one avatar within `items`. */
  @Output() itemClick = new EventEmitter<{ item: SicAvatarItem; index: number }>();

  @HostBinding('class.sic-avatar-host') readonly hostClass = true;
  @HostBinding('class.sic-avatar-host--group') get isGroup(): boolean {
    return !!this.items;
  }
  @HostBinding('class.sic-size-sm') get isSm() {
    return this.size === 'sm';
  }
  @HostBinding('class.sic-size-lg') get isLg() {
    return this.size === 'lg';
  }

  errored = false;
  private erroredItemIndexes = new Set<number>();

  get initials(): string {
    return initialsOf(this.name);
  }

  handleError(): void {
    this.errored = true;
  }

  @HostListener('click', ['$event'])
  handleHostClick(event: MouseEvent): void {
    if (!this.items) {
      this.avatarClick.emit(event);
    }
  }

  itemInitials(item: SicAvatarItem): string {
    return initialsOf(item.name ?? '');
  }

  itemHasImage(item: SicAvatarItem, index: number): boolean {
    return !!item.src && !this.erroredItemIndexes.has(index);
  }

  handleItemError(index: number): void {
    this.erroredItemIndexes.add(index);
  }

  handleItemClick(item: SicAvatarItem, index: number, event: MouseEvent): void {
    event.stopPropagation();
    this.itemClick.emit({ item, index });
  }
}
