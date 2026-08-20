import { CommonModule } from '@angular/common';
import { Component, HostBinding, Input } from '@angular/core';

export type SicBadgePosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';

@Component({
  selector: 'sic-badge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sic-badge.component.html',
  styleUrl: './sic-badge.component.css',
})
export class SicBadgeComponent {
  @Input() count?: number;
  @Input() max = 99;
  @Input() dot = false;
  @Input() color: 'primary' | 'success' | 'danger' | 'warning' = 'primary';
  @Input() position: SicBadgePosition = 'top-right';

  @HostBinding('class.sic-badge-host') readonly hostClass = true;

  get displayCount(): string {
    if (this.count === undefined) {
      return '';
    }

    return this.count > this.max ? `${this.max}+` : String(this.count);
  }
}
