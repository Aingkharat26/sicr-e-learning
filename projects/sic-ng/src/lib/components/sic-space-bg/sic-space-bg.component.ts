import { CommonModule } from '@angular/common';
import { Component, HostBinding, Input, inject } from '@angular/core';
import { SicThemeService } from '../../theme/theme.service';
import { SicSpaceBgColorMode, SicSpaceBgShape, SicSpaceBgVariant } from './sic-space-bg.model';

const SHAPE_KINDS: NonNullable<SicSpaceBgShape['kind']>[] = ['circle', 'square', 'triangle', 'hexagon'];

// Dark-mode defaults assume a dark backdrop (bright shapes/gradient stops for contrast); light-mode
// defaults invert that assumption (deeper, more saturated tones so shapes stay visible on a pale
// backdrop, and sparkle dots are dark instead of white since white-on-white would be invisible).
const DEFAULT_COLORS_DARK: Record<SicSpaceBgVariant, string[]> = {
  hexagon: ['#6366f1', '#8b5cf6', '#06b6d4'],
  geometric: ['#f472b6', '#fb923c', '#facc15', '#34d399'],
  gradient: ['#0f172a', '#1e3a8a', '#312e81'],
  sparkle: ['#ffffff', '#c7d2fe', '#fde68a'],
};

const DEFAULT_COLORS_LIGHT: Record<SicSpaceBgVariant, string[]> = {
  hexagon: ['#4f46e5', '#7c3aed', '#0891b2'],
  geometric: ['#db2777', '#ea580c', '#ca8a04', '#059669'],
  gradient: ['#e0e7ff', '#c7d2fe', '#ddd6fe'],
  sparkle: ['#1e293b', '#475569', '#0f172a'],
};

// mulberry32 — a tiny seeded PRNG so shape layout stays stable across re-renders (same seed always
// produces the same scatter), instead of jumping around on every change detection with Math.random().
function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * A decorative, fully CSS-driven animated background layer — fills its container at 100% width/
 * height. Four variants: `'hexagon'` and `'geometric'` scatter floating clip-path shapes,
 * `'sparkle'` twinkles small dots, and `'gradient'` shifts an animated linear-gradient. Shape
 * layout is randomized but deterministic (seeded via `[seed]`), so it doesn't reshuffle on every
 * change detection or differ between server and client renders.
 */
@Component({
  selector: 'sic-space-bg',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sic-space-bg.component.html',
  styleUrl: './sic-space-bg.component.css',
})
export class SicSpaceBgComponent {
  private readonly themeService = inject(SicThemeService);

  /** Which decorative pattern to render. Default: `'gradient'`. */
  @Input() variant: SicSpaceBgVariant = 'gradient';
  /** Palette used to color the pattern (gradient stops, shape fills, sparkle dots). Falls back to a built-in light/dark default for the current `[variant]` when empty (see `[colorMode]`). */
  @Input() colors: string[] = [];
  /** Which built-in default palette to fall back to when `[colors]` is empty. `'auto'` (default) follows `SicThemeService.isDark()`, so the same markup looks right in both light and dark mode without passing `[colors]` explicitly. */
  @Input() colorMode: SicSpaceBgColorMode = 'auto';
  /** Base background color behind the pattern, e.g. a dark backdrop for `'sparkle'`. Default: `'transparent'`. */
  @Input() backgroundColor = 'transparent';
  /** Plays the floating/twinkling/gradient-shift animation. Default: true. */
  @Input() animated = true;
  /** Animation duration in seconds — smaller is faster. Default: 20. */
  @Input() animationSpeed = 20;
  /** Number of shapes/sparkles to scatter. Ignored by `'gradient'`. Default: 24. */
  @Input() density = 24;
  /** Base shape size, as a CSS length (e.g. `'2rem'`). Each shape scales it by a random factor. Default: `'2rem'`. */
  @Input() size = '2rem';
  /** Overall opacity of the pattern layer, 0–1. Default: 0.5. */
  @Input() opacity = 0.5;
  /** CSS blur amount applied to the pattern layer (e.g. `'2px'`) for a soft glow look. Default: `'0px'`. */
  @Input() blur = '0px';
  /** Angle, in degrees, of the `'gradient'` variant's linear gradient. Default: 135. */
  @Input() gradientAngle = 135;
  /** Seeds the deterministic pseudo-random layout — same seed always produces the same scatter of shapes. Default: 1. */
  @Input() seed = 1;

  @HostBinding('class.sic-space-bg-host') readonly hostClass = true;
  @HostBinding('class.sic-space-bg-host--dark') get isDarkClass(): boolean {
    return this.effectiveDark;
  }
  @HostBinding('class.sic-space-bg-host--light') get isLightClass(): boolean {
    return !this.effectiveDark;
  }
  @HostBinding('style.background') get hostBackground(): string {
    return this.backgroundColor;
  }
  @HostBinding('style.--sic-space-bg-speed') get speedVar(): string {
    return `${this.animationSpeed}s`;
  }

  /** Resolves `[colorMode]` against `SicThemeService.isDark()` when set to `'auto'`. */
  get effectiveDark(): boolean {
    if (this.colorMode === 'light') {
      return false;
    }
    if (this.colorMode === 'dark') {
      return true;
    }
    return this.themeService.isDark();
  }

  get palette(): string[] {
    if (this.colors.length) {
      return this.colors;
    }
    return (this.effectiveDark ? DEFAULT_COLORS_DARK : DEFAULT_COLORS_LIGHT)[this.variant];
  }

  get gradientBackground(): string {
    return `linear-gradient(${this.gradientAngle}deg, ${this.palette.join(', ')})`;
  }

  get shapes(): SicSpaceBgShape[] {
    if (this.variant === 'gradient') {
      return [];
    }

    const rand = mulberry32(this.seed);
    const palette = this.palette;
    const count = Math.max(0, this.density);
    const [sizeMin, sizeMax] = this.variant === 'sparkle' ? [0.15, 0.45] : [0.5, 2];

    return Array.from({ length: count }, (_, i) => ({
      id: i,
      left: rand() * 100,
      top: rand() * 100,
      size: sizeMin + rand() * (sizeMax - sizeMin),
      delay: rand() * this.animationSpeed,
      duration: this.animationSpeed * (0.6 + rand() * 0.8),
      opacity: 0.3 + rand() * 0.7,
      color: palette[i % palette.length],
      rotate: rand() * 360,
      kind: this.variant === 'geometric' ? SHAPE_KINDS[i % SHAPE_KINDS.length] : undefined,
    }));
  }

  trackByFn = (_: number, shape: SicSpaceBgShape): number => shape.id;
}
