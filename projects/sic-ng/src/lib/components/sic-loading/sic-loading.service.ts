import { Overlay } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { Injectable, Injector, StaticProvider, inject, signal } from '@angular/core';
import { injectSicConfig } from '../../config/sic-config';
import { SicLoadingOverlayComponent } from './sic-loading-overlay.component';
import { SIC_LOADING_STATE, SicLoadingState } from './sic-loading.tokens';

export interface SicLoadingOptions {
  message?: string;
  /** URL to a .png/.gif (or any image) shown instead of the default sic-spinner. */
  image?: string;
  spinnerSize?: 'sm' | 'md' | 'lg';
  /** Auto-hides after this many ms. Omitted or 0 means it stays up until `hide()` is called. */
  timeout?: number;
}

export interface SicLoadingHandle {
  hide(): void;
  /** Updates the message on an already-shown overlay. */
  setMessage(message: string | undefined): void;
  /** Swaps to a custom image, or back to the default sic-spinner if `undefined`. */
  setImage(image: string | undefined): void;
  isVisible(): boolean;
}

@Injectable({
  providedIn: 'root',
})
export class SicLoadingService {
  private readonly overlay = inject(Overlay);
  private readonly injector = inject(Injector);
  private readonly sicConfig = injectSicConfig();

  show(options: SicLoadingOptions = {}): SicLoadingHandle {
    const state = signal<SicLoadingState>({
      message: options.message,
      image: options.image ?? this.sicConfig.loadingImage,
      spinnerSize: options.spinnerSize ?? this.sicConfig.loadingSpinnerSize ?? 'lg',
    });

    const overlayRef = this.overlay.create({
      positionStrategy: this.overlay.position().global().centerHorizontally().centerVertically(),
      hasBackdrop: true,
      panelClass: 'sic-loading__panel',
      backdropClass: 'sic-loading__backdrop',
    });

    let visible = true;
    let timeoutHandle: ReturnType<typeof setTimeout> | undefined;

    const hide = (): void => {
      if (!visible) {
        return;
      }
      visible = false;
      if (timeoutHandle !== undefined) {
        clearTimeout(timeoutHandle);
      }
      overlayRef.dispose();
    };

    const providers: StaticProvider[] = [{ provide: SIC_LOADING_STATE, useValue: state }];
    const childInjector = Injector.create({ parent: this.injector, providers });
    const portal = new ComponentPortal(SicLoadingOverlayComponent, null, childInjector);
    overlayRef.attach(portal);

    if (options.timeout && options.timeout > 0) {
      timeoutHandle = setTimeout(hide, options.timeout);
    }

    return {
      hide,
      setMessage: (message) => state.update((s) => ({ ...s, message })),
      setImage: (image) => state.update((s) => ({ ...s, image })),
      isVisible: () => visible,
    };
  }
}
