/** Which decorative pattern `sic-space-bg` renders. */
export type SicSpaceBgVariant = 'hexagon' | 'geometric' | 'gradient' | 'sparkle';

/** Which built-in default palette to use when `[colors]` is empty. `'auto'` follows `SicThemeService.isDark()`. */
export type SicSpaceBgColorMode = 'auto' | 'light' | 'dark';

/** One scattered shape/sparkle, laid out deterministically from `[seed]`. Not used by the `'gradient'` variant. */
export interface SicSpaceBgShape {
  id: number;
  /** Position, in percent of the host's width/height. */
  left: number;
  top: number;
  /** Multiplier applied to `[size]` for this shape. */
  size: number;
  /** Animation delay/duration, in seconds. */
  delay: number;
  duration: number;
  opacity: number;
  color: string;
  /** Static rotation, in degrees. */
  rotate: number;
  /** Only set for `'geometric'` — cycles through the 4 kinds across the scattered shapes. */
  kind?: 'circle' | 'square' | 'triangle' | 'hexagon';
}
