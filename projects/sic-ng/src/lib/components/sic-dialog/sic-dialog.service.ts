import { ComponentType, Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { Injectable, Injector, StaticProvider, inject } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { SicCommonDialogComponent, SicCommonDialogData, SicCommonDialogType } from './sic-common-dialog.component';
import { SicDialogPanelComponent } from './sic-dialog-panel.component';
import { SIC_DIALOG_DATA, SicDialogConfig, SicDialogRef } from './sic-dialog.tokens';

export { SIC_DIALOG_DATA, SicDialogRef } from './sic-dialog.tokens';
export type { SicDialogConfig } from './sic-dialog.tokens';

/**
 * The Observable emits the value passed to `SicDialogRef.close(result)` once,
 * then completes — closing without a result (e.g. backdrop click or Escape)
 * emits `undefined`. `componentInstance`/`close` are attached to it directly
 * so callers that need them don't have to give up the `.subscribe(...)` form.
 */
export type SicDialogHandle<T, R> = Observable<R | undefined> & {
  componentInstance: T;
  close: (result?: R) => void;
};

@Injectable({
  providedIn: 'root',
})
export class SicDialogService {
  private readonly overlay = inject(Overlay);
  private readonly injector = inject(Injector);

  open<T, D = unknown, R = unknown>(
    component: ComponentType<T>,
    data?: D,
    config: SicDialogConfig = {},
  ): SicDialogHandle<T, R> {
    const overlayRef = this.overlay.create({
      positionStrategy: this.overlay.position().global().centerHorizontally().centerVertically(),
      hasBackdrop: true,
      width: config.width ?? 'auto',
      height: config.height ?? 'auto',
      // `.cdk-overlay-pane` is a flex container with no centering of its own — fine when its box
      // shrinks to the panel's natural size (the `'auto'` default), but once a caller sets an
      // explicit `width`/`height` (e.g. '90%') the pane becomes far bigger than the panel inside
      // it, and flex's default `justify-content: flex-start` shoves that panel against the pane's
      // left edge instead of centering it. Scoped to dialog panes only, so other Overlay-based
      // components (popover, combobox, etc.) that rely on default pane alignment are unaffected.
      panelClass: 'sic-dialog-overlay-pane',
    });

    const resultSubject = new Subject<R | undefined>();

    const close = (result?: R): void => {
      if (resultSubject.closed) {
        return;
      }
      resultSubject.next(result);
      resultSubject.complete();
      overlayRef.dispose();
    };

    if (!config.disableClose) {
      overlayRef.backdropClick().subscribe(() => close());
    }

    // Safety net: if the overlay is ever torn down some other way (not via
    // `close()`), still complete the handle instead of leaving subscribers
    // hanging forever.
    overlayRef.detachments().subscribe(() => {
      if (!resultSubject.closed) {
        resultSubject.complete();
      }
    });

    const dialogRef = new SicDialogRef<T, R>(close);

    const providers: StaticProvider[] = [
      { provide: SIC_DIALOG_DATA, useValue: data },
      { provide: SicDialogRef, useValue: dialogRef },
    ];
    const childInjector = Injector.create({ parent: this.injector, providers });

    // Attach our own panel wrapper (real `:host` styling, scoping works
    // normally) instead of the caller's component directly, then create the
    // caller's component inside it — see SicDialogPanelComponent for why.
    const panelPortal = new ComponentPortal(SicDialogPanelComponent, null, this.injector);
    const panelRef = overlayRef.attach(panelPortal);
    const contentRef = panelRef.instance.attachContent(component, childInjector);
    dialogRef.componentInstance = contentRef.instance;

    // Likewise, the backdrop element is outside any component's template —
    // dim it directly rather than relying on CSS class matching.
    if (overlayRef.backdropElement) {
      overlayRef.backdropElement.style.background = 'color-mix(in srgb, #000 45%, transparent)';
    }

    const handle = resultSubject.asObservable() as SicDialogHandle<T, R>;
    handle.componentInstance = contentRef.instance;
    handle.close = close;
    return handle;
  }

  /** Icon + title + description + a single "Close" button. */
  info(title: string, description: string, config?: SicDialogConfig): Observable<void> {
    return this.openCommon('info', title, description, config);
  }

  /** Icon + title + description + a single "Close" button. */
  success(title: string, description: string, config?: SicDialogConfig): Observable<void> {
    return this.openCommon('success', title, description, config);
  }

  /** Icon + title + description + a single "Close" button. */
  danger(title: string, description: string, config?: SicDialogConfig): Observable<void> {
    return this.openCommon('danger', title, description, config);
  }

  /** Icon + title + description + a single "Close" button. */
  warning(title: string, description: string, config?: SicDialogConfig): Observable<void> {
    return this.openCommon('warning', title, description, config);
  }

  /** Icon + title + description + "Cancel"/"Confirm" buttons. Emits `true` if confirmed, `false` for cancel/backdrop/Escape. */
  confirm(title: string, description: string, config?: SicDialogConfig): Observable<boolean> {
    return this.open<SicCommonDialogComponent, SicCommonDialogData, boolean>(
      SicCommonDialogComponent,
      { type: 'confirm', title, description },
      config,
    ).pipe(map((result) => !!result));
  }

  private openCommon(type: SicCommonDialogType, title: string, description: string, config?: SicDialogConfig): Observable<void> {
    return this.open<SicCommonDialogComponent, SicCommonDialogData, boolean>(
      SicCommonDialogComponent,
      { type, title, description },
      config,
    ).pipe(map(() => undefined));
  }
}
