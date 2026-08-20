import { CommonModule } from '@angular/common';
import { Component, HostBinding, ViewEncapsulation, inject } from '@angular/core';
import { SicSpinnerComponent } from '../sic-spinner/sic-spinner.component';
import { SIC_LOADING_STATE } from './sic-loading.tokens';

/**
 * Body attached by `SicLoadingService.show()` — a `sic-spinner` (default) or a
 * custom png/gif image, plus an optional message.
 *
 * `ViewEncapsulation.None`: the CDK overlay's pane/backdrop elements
 * (`.sic-loading__panel`/`.sic-loading__backdrop`, set as `panelClass`/
 * `backdropClass` in `SicLoadingService`) live outside this component's own
 * template, as plain elements the Overlay created — Angular's normal emulated
 * encapsulation attribute would never match them, so those two rules need to
 * be unscoped to actually apply. This component is always the one instantiated
 * by `show()`, so its styles are guaranteed to be present by the time they're needed.
 */
@Component({
  selector: 'sic-loading-overlay',
  standalone: true,
  imports: [CommonModule, SicSpinnerComponent],
  templateUrl: './sic-loading-overlay.component.html',
  styleUrl: './sic-loading-overlay.component.css',
  encapsulation: ViewEncapsulation.None,
})
export class SicLoadingOverlayComponent {
  readonly state = inject(SIC_LOADING_STATE);

  @HostBinding('class.sic-loading-overlay-host') readonly hostClass = true;
}
