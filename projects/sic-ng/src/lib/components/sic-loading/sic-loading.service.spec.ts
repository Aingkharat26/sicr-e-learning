import { ApplicationRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { SIC_CONFIG } from '../../config/sic-config';
import { SicLoadingService } from './sic-loading.service';

describe('SicLoadingService', () => {
  let service: SicLoadingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SicLoadingService);
  });

  afterEach(() => {
    document.querySelectorAll('.cdk-overlay-container').forEach((el) => el.remove());
  });

  function tick(): void {
    TestBed.inject(ApplicationRef).tick();
  }

  function overlay(): HTMLElement {
    tick();
    return document.querySelector('.sic-loading-overlay')!;
  }

  it('shows a sic-spinner by default (no image)', () => {
    const handle = service.show();

    expect(overlay().querySelector('sic-spinner')).toBeTruthy();
    expect(overlay().querySelector('.sic-loading-overlay__image')).toBeNull();

    handle.hide();
  });

  it('shows a custom image instead of the spinner when image is given', () => {
    const handle = service.show({ image: '/assets/loading.gif' });

    const img: HTMLImageElement = overlay().querySelector('.sic-loading-overlay__image')!;
    expect(img).toBeTruthy();
    expect(img.src).toContain('/assets/loading.gif');
    expect(overlay().querySelector('sic-spinner')).toBeNull();

    handle.hide();
  });

  it('shows the given message', () => {
    const handle = service.show({ message: 'Please wait...' });

    expect(overlay().querySelector('.sic-loading-overlay__message')?.textContent).toContain('Please wait...');

    handle.hide();
  });

  it('hide() disposes the overlay and isVisible() reflects that', () => {
    const handle = service.show();
    expect(handle.isVisible()).toBe(true);
    expect(document.querySelector('.sic-loading-overlay')).toBeTruthy();

    handle.hide();

    expect(handle.isVisible()).toBe(false);
    expect(document.querySelector('.sic-loading-overlay')).toBeNull();
  });

  it('hide() is idempotent (calling it twice does not throw)', () => {
    const handle = service.show();
    handle.hide();
    expect(() => handle.hide()).not.toThrow();
  });

  it('setMessage()/setImage() update an already-shown overlay', () => {
    const handle = service.show({ message: 'Step 1' });
    expect(overlay().querySelector('.sic-loading-overlay__message')?.textContent).toContain('Step 1');

    handle.setMessage('Step 2');
    expect(overlay().querySelector('.sic-loading-overlay__message')?.textContent).toContain('Step 2');

    handle.setImage('/assets/done.png');
    expect(overlay().querySelector('sic-spinner')).toBeNull();
    expect((overlay().querySelector('.sic-loading-overlay__image') as HTMLImageElement).src).toContain('/assets/done.png');

    handle.hide();
  });

  it('auto-hides after the given timeout', () => {
    vi.useFakeTimers();
    const handle = service.show({ timeout: 2000 });
    expect(handle.isVisible()).toBe(true);

    vi.advanceTimersByTime(2000);

    expect(handle.isVisible()).toBe(false);
    expect(document.querySelector('.sic-loading-overlay')).toBeNull();
    vi.useRealTimers();
  });

  it('never auto-hides when timeout is omitted/0', () => {
    vi.useFakeTimers();
    const handle = service.show();
    vi.advanceTimersByTime(100000);

    expect(handle.isVisible()).toBe(true);
    vi.useRealTimers();
    handle.hide();
  });

  it('does not fire the timeout after an earlier manual hide()', () => {
    vi.useFakeTimers();
    const handle = service.show({ timeout: 2000 });
    handle.hide();

    expect(() => vi.advanceTimersByTime(2000)).not.toThrow();
    expect(handle.isVisible()).toBe(false);
    vi.useRealTimers();
  });
});

describe('SicLoadingService SIC_CONFIG defaults', () => {
  afterEach(() => {
    document.querySelectorAll('.cdk-overlay-container').forEach((el) => el.remove());
  });

  function tick(): void {
    TestBed.inject(ApplicationRef).tick();
  }

  it('uses SIC_CONFIG.loadingImage/loadingSpinnerSize when show() is called with no options', () => {
    TestBed.configureTestingModule({
      providers: [{ provide: SIC_CONFIG, useValue: { loadingImage: '/assets/brand-loader.gif', loadingSpinnerSize: 'sm' } }],
    });
    const service = TestBed.inject(SicLoadingService);

    const handle = service.show();
    tick();
    const overlayEl = document.querySelector('.sic-loading-overlay')!;
    const img: HTMLImageElement = overlayEl.querySelector('.sic-loading-overlay__image')!;

    expect(img.src).toContain('/assets/brand-loader.gif');
    expect(overlayEl.querySelector('sic-spinner')).toBeNull();

    handle.hide();
  });

  it('lets a per-call image/spinnerSize win over SIC_CONFIG', () => {
    TestBed.configureTestingModule({
      providers: [{ provide: SIC_CONFIG, useValue: { loadingImage: '/assets/brand-loader.gif' } }],
    });
    const service = TestBed.inject(SicLoadingService);

    const handle = service.show({ image: '/assets/call-specific.png' });
    tick();
    const img: HTMLImageElement = document.querySelector('.sic-loading-overlay__image')!;

    expect(img.src).toContain('/assets/call-specific.png');

    handle.hide();
  });
});
