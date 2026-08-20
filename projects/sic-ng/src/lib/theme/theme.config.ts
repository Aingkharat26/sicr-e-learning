import { InjectionToken } from '@angular/core';
import { SicFontFace, applySicFontFaces } from './theme.fonts';
import { SicThemeName } from './theme.service';

export interface SicThemeConfig {
  mode?: 'light' | 'dark' | 'system';
  theme?: SicThemeName;

  colorPrimary?: string;
  colorSuccess?: string;
  colorDanger?: string;
  colorWarning?: string;

  radiusSm?: string;
  radiusMd?: string;
  radiusLg?: string;

  /** CSS `font-family` value applied to `--sic-font-sans`, e.g. `'"Prompt", "RobotoCondensed", sans-serif'`. Register the family first via `fonts` if it's a custom/self-hosted font. */
  fontSans?: string;
  /** Custom `@font-face` declarations (e.g. self-hosted TTF/WOFF2 files) to inject before `fontSans` is applied — see `SicFontFace`. */
  fonts?: SicFontFace[];
}

export const SIC_THEME_CONFIG = new InjectionToken<SicThemeConfig>('SIC_THEME_CONFIG');

const CONFIG_TO_TOKEN: Record<Exclude<keyof SicThemeConfig, 'mode' | 'theme' | 'fonts'>, string> = {
  colorPrimary: '--sic-color-primary',
  colorSuccess: '--sic-color-success',
  colorDanger: '--sic-color-danger',
  colorWarning: '--sic-color-warning',
  radiusSm: '--sic-radius-sm',
  radiusMd: '--sic-radius-md',
  radiusLg: '--sic-radius-lg',
  fontSans: '--sic-font-sans',
};

/** `target.ownerDocument` — used to inject `config.fonts`' `@font-face` rules, since that needs the `Document`, not just an element. Always set for an element that's part of a live (or SSR-rendered) document tree, which `target` (typically `document.documentElement`) always is. */
export function applySicThemeConfig(config: SicThemeConfig, target: HTMLElement): void {
  if (config.fonts && target.ownerDocument) {
    applySicFontFaces(config.fonts, target.ownerDocument);
  }

  for (const key of Object.keys(CONFIG_TO_TOKEN) as (keyof typeof CONFIG_TO_TOKEN)[]) {
    const value = config[key];

    if (value) {
      target.style.setProperty(CONFIG_TO_TOKEN[key], value);
    }
  }
}
