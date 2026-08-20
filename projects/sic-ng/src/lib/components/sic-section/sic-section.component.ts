import { CommonModule } from '@angular/common';
import { Component, HostBinding, Input } from '@angular/core';

/**
 * A page-section wrapper: centered max-width column with responsive padding and scroll-margin
 * (for anchor-link navigation) by default. `[fullBleed]` drops that container for full-width
 * content (e.g. a hero image slider); `[bordered]` adds a top border (e.g. a page footer);
 * `[center]` centers any plain-text content projected into it. `[title]`/`[lead]` render an
 * optional centered heading/lead paragraph above the projected content.
 */
@Component({
  selector: 'sic-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sic-section.component.html',
  styleUrl: './sic-section.component.css',
})
export class SicSectionComponent {
  @Input() title?: string;
  @Input() lead?: string;
  @Input() fullBleed = false;
  @Input() bordered = false;
  @Input() center = false;

  @HostBinding('class.sic-section-host') readonly hostClass = true;
  @HostBinding('class.sic-section--full-bleed') get isFullBleed(): boolean {
    return this.fullBleed;
  }
  @HostBinding('class.sic-section--bordered') get isBordered(): boolean {
    return this.bordered;
  }
  @HostBinding('class.sic-section--center') get isCentered(): boolean {
    return this.center;
  }
}
