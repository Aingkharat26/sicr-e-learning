import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SicThemeService } from '../../theme/theme.service';
import { SicSpaceBgComponent } from './sic-space-bg.component';

describe('SicSpaceBgComponent', () => {
  let fixture: ComponentFixture<SicSpaceBgComponent>;
  let component: SicSpaceBgComponent;
  let themeService: SicThemeService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [SicSpaceBgComponent] }).compileComponents();
    fixture = TestBed.createComponent(SicSpaceBgComponent);
    component = fixture.componentInstance;
    themeService = TestBed.inject(SicThemeService);
    fixture.detectChanges();
  });

  function shapes(): HTMLElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll('.sic-space-bg__shape'));
  }

  it('defaults to the gradient variant, rendering a single layer with the default light-mode gradient palette (SicThemeService.isDark() is false by default)', () => {
    // jsdom's CSSOM normalizes hex colors to rgb() when read back via .style.
    const layer: HTMLElement = fixture.nativeElement.querySelector('.sic-space-bg__gradient');
    expect(layer).toBeTruthy();
    expect(layer.style.background).toContain('135deg');
    expect(layer.style.background).toContain('rgb(224, 231, 255)');
    expect(shapes().length).toBe(0);
  });

  it('uses [colors] instead of the default palette when provided', () => {
    fixture.componentRef.setInput('colors', ['#111111', '#222222']);
    fixture.detectChanges();

    // jsdom's CSSOM normalizes hex colors to rgb() when read back via .style.
    const layer: HTMLElement = fixture.nativeElement.querySelector('.sic-space-bg__gradient');
    expect(layer.style.background).toContain('rgb(17, 17, 17)');
    expect(layer.style.background).toContain('rgb(34, 34, 34)');
    expect(layer.style.background).not.toContain('rgb(15, 23, 42)');
  });

  it('respects [gradientAngle]', () => {
    fixture.componentRef.setInput('gradientAngle', 45);
    fixture.detectChanges();

    const layer: HTMLElement = fixture.nativeElement.querySelector('.sic-space-bg__gradient');
    expect(layer.style.background).toContain('45deg');
  });

  it('switches to the dark-mode default palette when colorMode="auto" and SicThemeService.isDark() becomes true', () => {
    themeService.isDark.set(true);
    fixture.detectChanges();

    const layer: HTMLElement = fixture.nativeElement.querySelector('.sic-space-bg__gradient');
    expect(layer.style.background).toContain('rgb(15, 23, 42)'); // #0f172a — dark default's first stop
  });

  it('forces the dark default palette via [colorMode]="dark" even when SicThemeService.isDark() is false', () => {
    fixture.componentRef.setInput('colorMode', 'dark');
    fixture.detectChanges();

    const layer: HTMLElement = fixture.nativeElement.querySelector('.sic-space-bg__gradient');
    expect(layer.style.background).toContain('rgb(15, 23, 42)');
  });

  it('forces the light default palette via [colorMode]="light" even when SicThemeService.isDark() is true', () => {
    themeService.isDark.set(true);
    fixture.componentRef.setInput('colorMode', 'light');
    fixture.detectChanges();

    const layer: HTMLElement = fixture.nativeElement.querySelector('.sic-space-bg__gradient');
    expect(layer.style.background).toContain('rgb(224, 231, 255)');
  });

  it('toggles the sic-space-bg-host--dark/--light host classes to match the effective mode', () => {
    const host: HTMLElement = fixture.nativeElement;
    expect(host.classList.contains('sic-space-bg-host--light')).toBe(true);
    expect(host.classList.contains('sic-space-bg-host--dark')).toBe(false);

    themeService.isDark.set(true);
    fixture.detectChanges();

    expect(host.classList.contains('sic-space-bg-host--dark')).toBe(true);
    expect(host.classList.contains('sic-space-bg-host--light')).toBe(false);
  });

  it('scatters [density] hexagon shapes for the hexagon variant', () => {
    fixture.componentRef.setInput('variant', 'hexagon');
    fixture.componentRef.setInput('density', 10);
    fixture.detectChanges();

    const els = shapes();
    expect(els.length).toBe(10);
    els.forEach((el) => expect(el.classList.contains('sic-space-bg__shape--hexagon')).toBe(true));
  });

  it('cycles geometric shapes through circle/square/triangle/hexagon kinds', () => {
    fixture.componentRef.setInput('variant', 'geometric');
    fixture.componentRef.setInput('density', 4);
    fixture.detectChanges();

    const kinds = shapes().map((el) => ['circle', 'square', 'triangle', 'hexagon'].find((k) => el.classList.contains(`sic-space-bg__shape--${k}`)));
    expect(kinds).toEqual(['circle', 'square', 'triangle', 'hexagon']);
  });

  it('scatters [density] sparkle dots for the sparkle variant', () => {
    fixture.componentRef.setInput('variant', 'sparkle');
    fixture.componentRef.setInput('density', 15);
    fixture.detectChanges();

    const els = shapes();
    expect(els.length).toBe(15);
    els.forEach((el) => expect(el.classList.contains('sic-space-bg__shape--sparkle')).toBe(true));
  });

  it('renders zero shapes when density is 0', () => {
    fixture.componentRef.setInput('variant', 'hexagon');
    fixture.componentRef.setInput('density', 0);
    fixture.detectChanges();

    expect(shapes().length).toBe(0);
  });

  it('lays out the same shapes deterministically for the same [seed]', () => {
    fixture.componentRef.setInput('variant', 'hexagon');
    fixture.componentRef.setInput('seed', 42);
    fixture.detectChanges();

    const first = shapes().map((el) => el.style.left);
    fixture.detectChanges();
    const second = shapes().map((el) => el.style.left);

    expect(first).toEqual(second);
  });

  it('produces a different layout for a different [seed]', () => {
    fixture.componentRef.setInput('variant', 'hexagon');
    fixture.componentRef.setInput('seed', 1);
    fixture.detectChanges();
    const layoutA = shapes().map((el) => el.style.left);

    fixture.componentRef.setInput('seed', 2);
    fixture.detectChanges();
    const layoutB = shapes().map((el) => el.style.left);

    expect(layoutA).not.toEqual(layoutB);
  });

  it('adds the animated modifier class by default, and omits it when [animated] is false', () => {
    expect(fixture.nativeElement.querySelector('.sic-space-bg--animated')).toBeTruthy();

    fixture.componentRef.setInput('animated', false);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.sic-space-bg--animated')).toBeNull();
  });

  it('exposes [animationSpeed] as a --sic-space-bg-speed CSS var on the host', () => {
    fixture.componentRef.setInput('animationSpeed', 8);
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).style.getPropertyValue('--sic-space-bg-speed')).toBe('8s');
  });

  it('applies [opacity] and [blur] to the pattern layer', () => {
    fixture.componentRef.setInput('opacity', 0.3);
    fixture.componentRef.setInput('blur', '4px');
    fixture.detectChanges();

    const layer: HTMLElement = fixture.nativeElement.querySelector('.sic-space-bg');
    expect(layer.style.opacity).toBe('0.3');
    expect(layer.style.filter).toBe('blur(4px)');
  });

  it('applies [backgroundColor] to the host', () => {
    fixture.componentRef.setInput('backgroundColor', '#0b1120');
    fixture.detectChanges();

    // jsdom's CSSOM normalizes hex colors to rgb() when read back via .style.
    expect((fixture.nativeElement as HTMLElement).style.background).toContain('rgb(11, 17, 32)');
  });

  it('scales each shape by [size] and its own random factor via a CSS calc()', () => {
    fixture.componentRef.setInput('variant', 'hexagon');
    fixture.componentRef.setInput('seed', 42);
    // parseFloat can't read past the leading "calc(", so pull the number out with a regex instead.
    const numberIn = (css: string): number => Number(/[\d.]+/.exec(css)?.[0]);

    fixture.componentRef.setInput('size', '1rem');
    fixture.detectChanges();
    const widthAt1rem = numberIn(shapes()[0].style.width);

    fixture.componentRef.setInput('size', '3rem');
    fixture.detectChanges();
    const widthAt3rem = numberIn(shapes()[0].style.width);

    // jsdom's CSSOM simplifies `calc(3rem * 1.29)` down to a single `calc(3.87rem)` value, so
    // instead of matching the raw string, confirm the resolved width scaled with [size] (3x).
    expect(widthAt3rem).toBeCloseTo(widthAt1rem * 3, 5);
  });
});
