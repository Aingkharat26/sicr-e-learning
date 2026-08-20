import { CommonModule } from '@angular/common';
import { Component, EventEmitter, HostBinding, Input, Output } from '@angular/core';

export type SicTagColor = 'primary' | 'success' | 'danger' | 'warning' | 'neutral';

export interface SicTagItem {
  text: string;
  color?: SicTagColor;
  /** Overrides the component's `closable` input for this one tag. */
  closable?: boolean;
}

@Component({
  selector: 'sic-tag',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sic-tag.component.html',
  styleUrl: './sic-tag.component.css',
})
export class SicTagComponent {
  @Input() color: SicTagColor = 'neutral';
  @Input() closable = false;
  /** Renders one pill per entry instead of the projected content — pass `[{ text, color }]`. */
  @Input() items?: SicTagItem[];

  @Output() closed = new EventEmitter<void>();
  @Output() itemClosed = new EventEmitter<{ item: SicTagItem; index: number }>();

  @HostBinding('class') get hostClasses(): string {
    return this.items ? 'sic-tag-host sic-tag-host--group' : `sic-tag-host sic-tag--${this.color}`;
  }

  isItemClosable(item: SicTagItem): boolean {
    return item.closable ?? this.closable;
  }

  removeItem(item: SicTagItem, index: number, event: MouseEvent): void {
    event.stopPropagation();
    this.itemClosed.emit({ item, index });
  }
}
