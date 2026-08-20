# sic-ng → Figma component build spec

Exact values extracted from sic-ng's source CSS (`projects/sic-ng/src/lib/tokens/*.css`), for building matching Figma components/variants. All rem → px conversions assume the 16px browser default root size sic-ng relies on. Reference token names (`{color.primary}` etc.) match `tokens.json` in this same folder — bind Figma layers to those variables rather than hardcoding hex values, so switching the Figma file's theme/mode updates every component at once, same as `provideSicTheme()` does in the real app.

## Foundations

**Spacing scale** (`core.spacing`): 4 / 8 / 12 / 16 px.

**Font**: `Prompt` (Google Fonts, has Thai glyph coverage — sic-ng's shipped default). Sizes: sm 13.6px / md 15.2px / lg 16.8px. Weight 600 (semibold) for buttons/labels, 400 for body text.

**Control heights** (buttons, inputs, comboboxes — every form control shares these): sm 35.2px / md 46.4px / lg 54.4px.

**Radius** — differs per theme, that's part of each theme's identity (sharp/slate vs. very round/violet). Always pull from the active theme's `radius.sm/md/lg` token, never a fixed number:

| Theme | sm | md | lg |
|---|---|---|---|
| Default | 8px | 13.6px | 20px |
| Sunset | 10.4px | 17.6px | 25.6px |
| Forest | 6.4px | 11.2px | 17.6px |
| Violet | 12px | 20px | 32px |
| Slate | 4px | 5.6px | 8px |
| Glass | 12px | 20px | 28px |

`radius.full` = 999px (pills/avatars/circular buttons) — same across all themes.

**Shadows** — sic-ng builds these from `color-mix()`, which has no direct Figma equivalent; approximate as flat-color drop shadows in Figma effects:
- `shadow.sm`: Y 1px, blur 2px, ~8-10% black (or theme's ink color or dark mode).
- `shadow.md`: Y 8px, blur 24px, ~12-16% black.
- Glass theme additionally needs a **Background blur** effect (18px light / 20px dark) on any translucent surface (card, dialog, sidebar, navbar, popover panels) — this is Figma's native background-blur effect, not a drop shadow.

## Button (`sic-button` / `sic-a-link` — identical visual spec)

Variant × Color × Size matrix. Build as one Figma component with variant properties: `size` (sm/md/lg), `variant` (solid/outline/ghost), `color` (primary/success/danger/warning), `state` (default/hover/disabled).

- **Shape**: `border-radius: {radius.md}` (not sm/lg — buttons always use the md radius token), border 1.5px.
- **Sizing**: height = `{controlHeight.<size>}`; horizontal padding = `{spacing.3}` (sm), `{spacing.4}` (md), `1.5× spacing.4` = 24px (lg); gap between icon/label = `{spacing.2}`.
- **Solid**: background = `{color.<color>}`, text = white (or `{color.primaryContrast}` for the primary color specifically — it's the only color with a dedicated contrast token; success/danger/warning are hardcoded `#fff` in source, so just use white for those three).
- **Outline**: background transparent, border color = text color = `{color.<color>}`.
- **Ghost**: background transparent, border transparent, text = `{color.<color>}`.
- **Hover** (any variant): 90% opacity of the base state.
- **Disabled**: 55% opacity, no hover.
- **Font**: weight 600, size per `size` variant.

## Text input / control field (`sic-input`, `sic-combobox` trigger, `sic-datepicker`, etc. — all share this chrome)

- **Shape**: full width, height = `{controlHeight.<size>}`, padding-inline `{spacing.3}`, border 1px solid `{color.border}`, radius `{radius.md}`.
- **Fill**: `{color.bg}`, text `{color.textActive}`.
- **Hover**: border shifts toward `{color.primary}` (~22% mix).
- **Focus**: border ~45% `{color.primary}` mix + a 3px, ~14%-opacity `{color.primary}` outer glow (Figma: a second border/shadow layer).
- **Invalid**: border/glow use `{color.danger}` instead of primary, same mix ratios (~46% border / ~12% glow).
- **Disabled**: fill becomes `{color.surface}`, text `{color.textMuted}`.
- **Sizes**: sm/lg swap only height + font-size, padding stays the same.

## Card (`sic-card`)

- Background `{color.bg}` (or `{color.surface}` if elevated on a bg-colored page — check context), radius `{radius.lg}`, optional 1px `{color.border}` when `bordered`, optional `shadow.md` when `elevated`.
- Header: title text, `{color.textActive}`, weight 600.
- Footer slot (`sicCardFooter`): right-aligned action row by convention (matches the Project Structure "standard form" pattern — save button bottom-right).
- Glass theme: card additionally gets the background-blur effect (see Foundations) since `sic-card` is one of the components glass mode blurs.

## Badge / Tag / Icon Badge

- Small pill: radius `{radius.full}`, background = a light tint of the semantic color (~10-15% mix into `{color.bg}`), text = the full-strength semantic color, padding `{spacing.1}` × `{spacing.2}`, font size sm.
- `sic-icon-badge` specifically: circular (equal width/height, radius full), background = light tint of `{color.primary}`, centers a single icon/emoji.

## Sidebar / Navbar chrome

Not single components — see the `sic-layout` skill's routing/behavior spec for structure. For visuals: navbar height ~64px, sidebar expanded width ~260px / rail (collapsed) width ~72px are reasonable Figma defaults matching sic-ng's own demo screenshots, but sic-ng doesn't hardcode these as tokens — treat them as house defaults, adjust to the actual app's content if it differs.

## Building it in Figma

1. Import `tokens.json` via the **Tokens Studio for Figma** plugin (Tools → Import), which creates 6 themes × 2 modes = 12 Figma **Variable modes** you can flip per-frame, mirroring `provideSicTheme({ theme, mode })` in the real app.
2. Build each component once, binding every fill/stroke/radius/spacing value to a variable from step 1 (not a literal) — this is what makes the whole library re-skin instantly when a designer switches theme/mode on a frame, same as the real components do at runtime.
3. Cross-check any component not covered above directly against its real CSS in `projects/sic-ng/src/lib/components/<name>/*.css` and its `.claude/skills/sic-ng/references/*.md` entry — don't guess dimensions for a component this spec doesn't cover.
