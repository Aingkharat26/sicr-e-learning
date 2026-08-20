---
name: "sic-figma"
description: "Build or update a Figma design system/component library matching sic-ng's real components and themes — ships a Tokens Studio-compatible design tokens JSON (all 6 themes × light/dark) and a per-component build spec (exact sizes, radii, colors extracted from source CSS). Use when the user asks for a Figma library for sic-ng, wants designers to have matching components, or asks to export/sync sic-ng's design tokens to Figma."
---

# sic-figma — sic-ng Design Tokens & Component Spec for Figma

**Scope limitation, state this up front if not already clear to the user:** this cannot write directly into a Figma file — there's no Figma API/plugin access from here. What this skill produces is (1) a design-tokens JSON a human imports into Figma via a plugin, which creates real Figma Variables, and (2) a written build spec precise enough that a designer or another tool can recreate every component pixel-for-pixel. The actual Figma file assembly is a manual (or plugin-assisted) step outside this environment.

## What's in `references/`

- **`tokens.json`** — Tokens Studio for Figma import format. Structured as `core` (theme-independent spacing/font-size/control-height/radius-full) + one `<theme>/shape` set (radius, per theme) + one `<theme>/light` and `<theme>/dark` set (colors) per theme, for all 6 sic-ng themes (`default`, `sunset`, `forest`, `violet`, `slate`, `glass`). `$themes` at the bottom defines the 12 combinations (theme × mode) as ready-to-use Figma theme switches.
- **`components.md`** — exact build spec (sizes, radii, colors, states) for the core components (Button, text input/control field, Card, Badge) plus foundations (spacing, font, control heights, shadows). Grounded in the real source CSS, not invented.

## How to use this

1. **Importing into Figma**: install the "Tokens Studio for Figma" plugin, then Tools → Import → paste/upload `tokens.json`. This creates Figma Variable collections the designer can flip per-frame to preview any theme/mode combination — tell the user this workflow rather than trying to produce a `.fig` file directly.
2. **Building components**: walk `components.md` top to bottom, binding every fill/stroke/radius/spacing to the imported variables (not literal hex/px values) — this is what makes a frame re-skin instantly when its variable mode changes, the same way `provideSicTheme()` re-skins a real app instantly.
3. **Filling gaps**: `components.md` intentionally covers only the highest-traffic components (button, input chrome, card, badge) plus foundations, not all ~75 sic-ng components. For anything else, read the component's real CSS (`projects/sic-ng/src/lib/components/<name>/*.css`) and its entry in `.claude/skills/sic-ng/references/*.md` — don't guess dimensions or colors.

## Keeping tokens.json in sync

The token values are a point-in-time extraction from `projects/sic-ng/src/lib/tokens/_tokens.css`, `_tokens.dark.css`, and each `_theme-*.css` file. If those source files change (a new theme, a re-tuned color/radius), regenerate the affected entries in `tokens.json` by re-reading the source CSS — don't hand-tweak values without checking the CSS first, and don't add a token that doesn't correspond to a real `--sic-*` custom property.

## Related skills

- `sic-theme` — the *runtime* (Angular app) side of the same theme system (`provideSicTheme()`/`applySicThemeConfig()`/`SicThemeService`); this skill is the *design* side of the same 6 themes/colors/radii.
- `sic-ng` — full component reference, needed for any component not covered in `components.md`.
