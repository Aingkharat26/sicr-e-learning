import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';

export type SicThemeMode = 'light' | 'dark' | 'system';
export type SicThemeName = 'default' | 'sunset' | 'forest' | 'violet' | 'slate' | 'glass';

const STORAGE_KEY = 'sic-ng-theme';
const STORAGE_KEY_NAME = 'sic-ng-theme-name';
const THEME_NAMES: ReadonlyArray<Exclude<SicThemeName, 'default'>> = ['sunset', 'forest', 'violet', 'slate', 'glass'];

@Injectable({
  providedIn: 'root',
})
export class SicThemeService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly document = inject(DOCUMENT);

  readonly mode = signal<SicThemeMode>('system');
  readonly isDark = signal(false);
  readonly themeName = signal<SicThemeName>('default');

  private mediaQuery?: MediaQueryList;
  private mediaQueryHandler?: (event: MediaQueryListEvent) => void;

  init(defaultMode: SicThemeMode = 'system', defaultThemeName: SicThemeName = 'default'): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const saved = (localStorage.getItem(STORAGE_KEY) as SicThemeMode | null) ?? defaultMode;
    this.mode.set(saved);
    this.applyTheme(saved);
    this.bindSystemThemeListener();

    const savedName = (localStorage.getItem(STORAGE_KEY_NAME) as SicThemeName | null) ?? defaultThemeName;
    this.themeName.set(savedName);
    this.applyThemeName(savedName);
  }

  setThemeName(name: SicThemeName): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.themeName.set(name);
    localStorage.setItem(STORAGE_KEY_NAME, name);
    this.applyThemeName(name);
  }

  private applyThemeName(name: SicThemeName): void {
    const html = this.document.documentElement;

    for (const themeName of THEME_NAMES) {
      html.classList.toggle(`theme-${themeName}`, name === themeName);
    }
  }

  setTheme(mode: SicThemeMode): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.mode.set(mode);
    localStorage.setItem(STORAGE_KEY, mode);
    this.applyTheme(mode);
  }

  toggleDark(): void {
    this.setTheme(this.mode() === 'dark' ? 'light' : 'dark');
  }

  private applyTheme(mode: SicThemeMode): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const html = this.document.documentElement;
    const isDark =
      mode === 'dark' ||
      (mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    this.isDark.set(isDark);
    html.classList.toggle('dark', isDark);
    html.style.colorScheme = isDark ? 'dark' : 'light';
  }

  private bindSystemThemeListener(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    this.mediaQueryHandler = (event: MediaQueryListEvent) => {
      if (this.mode() !== 'system') {
        return;
      }

      const html = this.document.documentElement;
      this.isDark.set(event.matches);
      html.classList.toggle('dark', event.matches);
      html.style.colorScheme = event.matches ? 'dark' : 'light';
    };

    this.mediaQuery.addEventListener('change', this.mediaQueryHandler);
  }
}
