import { ComponentType } from '@angular/cdk/portal';
import { Component, ComponentRef, HostBinding, Injector, ViewChild, ViewContainerRef } from '@angular/core';

/**
 * The actual visual "box" for every dialog opened via `SicDialogService`.
 * `SicDialogService.open()` attaches THIS component to the CDK overlay (not
 * the caller's component directly) so the panel look (background, radius,
 * shadow) comes from a real Angular `:host` style — a CDK overlay pane is a
 * plain DOM element outside any component's template, so a `panelClass`
 * string matched against some other component's scoped stylesheet can never
 * actually reach it. The caller's component is then created inside this
 * component's `ng-container` outlet via `attachContent()`.
 */
@Component({
  selector: 'sic-dialog-panel',
  standalone: true,
  template: `<ng-container #outlet></ng-container>`,
  styleUrl: './sic-dialog-panel.component.css',
})
export class SicDialogPanelComponent {
  @ViewChild('outlet', { read: ViewContainerRef, static: true }) private outlet!: ViewContainerRef;

  @HostBinding('class.sic-dialog-panel-host') readonly hostClass = true;

  attachContent<T>(component: ComponentType<T>, injector: Injector): ComponentRef<T> {
    const contentRef = this.outlet.createComponent(component, { injector });

    // A custom element with no stylesheet rule for its own `:host` defaults to `display: inline`
    // (the plain-HTML default for unrecognized tags) — an inline box ignores width/height/margin,
    // which is what actually breaks "centered on screen" for callers who forgot `:host { display:
    // block; }` on their own dialog component. Force it to block ourselves so every dialog content
    // component lays out (and centers) correctly regardless of whether its author remembered that.
    const element = contentRef.location.nativeElement as HTMLElement;
    if (getComputedStyle(element).display === 'inline') {
      element.style.display = 'block';
    }

    return contentRef;
  }
}
