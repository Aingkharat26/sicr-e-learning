---
name: "sic-ng"
description: "Learn or look up how to use any sic-ng component — usage examples, @Input/@Output, live demos, and which components exist. Use when the user asks how to use a specific sic-ng component, wants to see what components are available, asks 'is there a component for X', or needs to explore/learn the sic-ng library."
---

# sic-ng — Component Reference

This skill ships a full offline reference, extracted straight from sic-ng's own tutorial page, so component usage doesn't have to be reconstructed from memory or guessed.

## How to use it

1. Read `references/index.md` first — it lists every group and every component/selector inside it, one line each.
2. Find which group the component you need is in, then read **only that group's file** (`references/<group-id>.md`) — don't read every reference file, they add up to ~4700 lines combined.
3. Each component entry in a reference file has: description, every code example (template/component.ts, sometimes split into more tabs like model/form/service/resolver for multi-file patterns), a full **Attributes** table, and a full **Events** table — this is the same content shown on the live `/tutorial` page's component cards.

Groups → files:

| Group | File | Covers |
|---|---|---|
| Getting Started | `references/getting-started.md` | `npm install`, `provideSicTheme`, `applySicThemeConfig`, `provideSicConfig` (see the `sic-theme` and `sic-provide-config` skills for deeper guidance on these specifically) |
| Project Structure | `references/project-structure.md` | standard form / standard search / standard transaction page-scaffolding patterns (see the `sic-generate` skill to actually scaffold one) |
| Navigation | `references/navigation.md` | `sic-navbar`, `sic-sidebar`, `sic-breadcrumb`, `sic-tabs`, `sic-stepper`, `sic-timeline` |
| Layout & General | `references/layout-general.md` | `sic-grid`, `sic-flex`, `sic-card`, `sic-card-stack`, `sic-button`, `sic-a-link`, `sic-button-group`, `sic-section`, `sic-show`, `sic-text`, `sic-icon-badge` |
| Forms & Inputs | `references/forms-inputs.md` | `SicFormData`, `sicFormCombine`, every `sic-input*`, `sic-combobox`, `sic-checkbox`, `sic-radio`, `sic-switch`, `sic-range`, `sic-datepicker`, `sic-timepicker`, `sic-colorpicker`, `sic-upload`, `sic-rating`, reactive-form validation |
| Data Display & Media | `references/display-media.md` | `sic-gridpanel`, `sic-calendar`, `sic-calendar-timeline`, `sic-code`, `sic-image`, `sic-image-slider`, `sic-video-player`, `sic-sound-player`, `sic-space-bg`, `sic-masonry`, `sic-drag-drop`, `sic-badge`, `sic-tag`, `sic-avatar`, `sic-accordion` |
| Overlays & Feedback | `references/feedback-overlays.md` | `sic-dialog` (+ `SicDialogService`), `sic-search`, `sic-popover`, `sic-toast` (+ `SicToastService`), `sic-tooltip` |
| Loading & Indicators | `references/loading-indicators.md` | `sic-spinner`, `SicLoadingService`, `sic-skeleton`, `sic-progress-bar` |

## If the reference seems out of date

These files are a point-in-time extraction of `projects/sic-ng/src/lib/tutorial/tutorial-page.component.ts`. If working inside the `sic-ng` repo itself and the component's actual `.ts` source (`projects/sic-ng/src/lib/components/<name>/`) looks like it's drifted from what a reference file says, trust the real source over the reference and mention the discrepancy — the reference can be regenerated from the tutorial source but isn't automatically kept in sync.

If working in an app that consumes sic-ng (not this repo) and something in the reference doesn't match what TypeScript/the IDE reports, the shipped type definitions win: `node_modules/sic-ng/types/sic-ng.d.ts` (or wherever `node_modules/sic-ng` was installed from, per the `git+https://...` install in `sic-project-setup`).

**Never invent an `@Input`/`@Output` name or a config shape (e.g. `SicGridPanelConfig`, `SicNavbarNotification`) from guesswork** — verify it against the reference files first, since sic-ng components tend to have several optional inputs with non-obvious names and defaults.

## Answering "what components exist for X"

Scan `references/index.md`'s selector lists by category first, then open the specific group file to confirm before telling the user it exists — don't just assume based on the name pattern.

## Related skills

- `sic-project-setup` — bootstrapping a new app, including optionally adding the `/tutorial` route.
- `sic-generate` — scaffolding a new page using the Project Structure patterns.
- `sic-provide-config` — library-wide defaults (decimals, era, messages, etc.), not per-component usage.
- `sic-theme` — colors, radius, dark mode, not per-component usage.
