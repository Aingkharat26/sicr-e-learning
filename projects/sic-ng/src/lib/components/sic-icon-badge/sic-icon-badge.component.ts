import { Component } from '@angular/core';

/** A round, tinted-primary badge for a leading icon/emoji — e.g. a contact-info row's icon. */
@Component({
  selector: 'sic-icon-badge',
  standalone: true,
  template: `<ng-content></ng-content>`,
  styleUrl: './sic-icon-badge.component.css',
})
export class SicIconBadgeComponent {}
