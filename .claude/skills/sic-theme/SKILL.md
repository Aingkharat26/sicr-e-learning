---
name: "sic-theme"
description: "Change or customize sic-ng's theme — switch between the 6 built-in presets (default/sunset/forest/violet/slate/glass), light/dark/system mode, or override individual colors (colorPrimary, colorSuccess, colorDanger, colorWarning) and border radii (radiusSm/radiusMd/radiusLg) at bootstrap or at runtime. Use when the user asks to change the app's theme/colors, customize the primary/brand color, adjust corner radius, or switch light/dark mode."
---

# sic-theme — Theme & Custom Colors

Every sic-ng component reads its colors and radii **only** from CSS custom properties (`--sic-color-primary`, `--sic-radius-md`, etc.) — there's no hardcoded color anywhere in the library. There are two independent ways to change them; ask the user which fits, or use both together.

Whenever the user needs to pick a `theme` preset or `mode`, ask with the `AskUserQuestion` tool as a fixed option list (single-select) — don't ask as free text:
- `theme`: options `default`, `sunset`, `forest`, `violet`, `slate`, `glass`
- `mode`: options `light`, `dark`, `system`

## Option A — Bootstrap-time (`provideSicTheme()`)

Set once at app startup, in `app.config.ts`'s `providers` array. Covers both preset switching and custom color/radius overrides in the same call:

```ts
import { provideSicTheme } from 'sic-ng';

export const appConfig: ApplicationConfig = {
  providers: [
    provideSicTheme({
      mode: 'system',        // 'light' | 'dark' | 'system'
      theme: 'violet',       // 'default' | 'sunset' | 'forest' | 'violet' | 'slate' | 'glass'
      colorPrimary: '#7c3aed',
      colorSuccess: '#16a34a',
      colorDanger: '#dc2626',
      colorWarning: '#d97706',
      radiusSm: '0.375rem',
      radiusMd: '0.625rem',
      radiusLg: '1rem',
      fontSans: "'Sarabun', system-ui, sans-serif", // optional — custom font family
    }),
  ],
};
```

- `mode` persists to `localStorage` automatically and follows `prefers-color-scheme` when set to `'system'`.
- `theme` picks a preset color palette as the *starting point* — `colorPrimary`/`colorSuccess`/`colorDanger`/`colorWarning` then override individual colors on top of whichever preset is chosen (they don't require picking a specific `theme` first).
- If the app wants to let users pick from more than one preset at runtime later, `src/styles.css` must import all 6 themes: `@import 'sic-ng/theme/all-themes.css';` instead of just `default-theme.css` (this belongs in Step 3 of the `sic-project-setup` skill if that hasn't been done yet — check `src/styles.css` before assuming it's already wired).

## Option B — Runtime (`applySicThemeConfig()`)

Same config shape as `provideSicTheme()`, but callable *any time*, against *any element* — no reload needed. Use this for a user-facing settings page that lets people pick their own colors:

```ts
import { applySicThemeConfig } from 'sic-ng';

// apply immediately, app-wide
applySicThemeConfig(
  { colorPrimary: '#7c3aed', radiusMd: '0.625rem' },
  document.documentElement,
);
```

Only pass the keys actually changing — unspecified keys are left as they are (this does not reset unrelated colors back to a preset).

## Switching presets/mode from inside the running app

For live-toggle UI (a theme picker, a dark-mode switch), don't call `provideSicTheme()` again — inject `SicThemeService` instead:

```ts
import { inject } from '@angular/core';
import { SicThemeService } from 'sic-ng';

private readonly themeService = inject(SicThemeService);

// read (signals)
this.themeService.isDark();
this.themeService.themeName();

// write
this.themeService.toggleDark();               // flip light/dark
this.themeService.setTheme('dark');            // set light/dark/system explicitly
this.themeService.setThemeName('sunset');       // switch preset palette
```

Both `setTheme()` and `setThemeName()` persist to `localStorage`, same as the bootstrap config.

## Which to use — quick guide

- **"เปลี่ยนสีหลักของแอปทั้งหมด ตอน build เดียว"** (fixed brand color, decided once) → Option A, set `colorPrimary` (+ others as needed) in `provideSicTheme()`.
- **"ให้ผู้ใช้เลือกสีเอง / เปลี่ยนสีจากหน้า settings"** → Option B, `applySicThemeConfig()` called from that settings page, typically against `document.documentElement`.
- **"สลับ theme สำเร็จรูป / สลับ dark mode ตอนรัน"** → `SicThemeService`, not either of the above.
- **"ปรับ radius ให้มุมโค้งมากขึ้น/น้อยลง"** → `radiusSm`/`radiusMd`/`radiusLg` via either Option A or B, same as colors.

## Verification

After **any** change made by this skill, always run the app's build before considering the task done — `ng build` or `npm run build`, whichever the project uses — and fix any errors before reporting success. Don't skip this because the change "looks like just config/CSS."

Then, if a dev server is available, visually confirm on a component that uses each changed token — e.g. `sic-button variant="solid" color="primary"` for `colorPrimary`, `sic-card` corners for `radiusMd`. If nothing changed, check that `src/styles.css` actually imports a `sic-ng/theme/*.css` file (colors/radii are CSS custom properties defined there — without the import there's nothing for the override to build on top of).
