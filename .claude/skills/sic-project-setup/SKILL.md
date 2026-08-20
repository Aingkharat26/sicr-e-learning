---
name: "sic-project-setup"
description: "Bootstrap a new Angular app wired up for the sic-ng component library — checks Node/Angular versions, scaffolds the app, installs sic-ng + theme config, and optionally adds the built-in tutorial page. Use when the user asks to set up, bootstrap, or initialize a new sic-ng project."
---

# sic-ng Project Setup

Walk through these steps in order, once, when bootstrapping a brand-new app.

## Step 1 — Check versions

- Run `node -v`. Required: Node **24.18.0 or higher, on the 24.x major**.
- If the current Node version doesn't satisfy that, check whether `nvm` is available (`nvm version` on Windows/nvm-windows, or `nvm --version` for unix nvm).
  - **If `nvm` is found**: install and switch automatically — don't just report the problem and stop:
    ```
    nvm install 24.18.0
    nvm use 24.18.0
    ```
    Then re-run `node -v` to confirm it now reports 24.18.0+ before continuing.
  - **If `nvm` is not found**: tell the user Node 24.18.0+ is required and ask them to install it themselves (either directly or by installing `nvm` first) — don't attempt to install Node any other way.
- Run `ng version` (if `ng` isn't installed globally, use `npx -y @angular/cli@latest version` instead).
- sic-ng's peer dependencies require Angular `^22.0.0`. If the installed global CLI is an older major, that's fine — `npx @angular/cli@latest new` in Step 2 always fetches the latest CLI regardless of what's installed globally.

## Step 2 — Create the Angular app

- **First, ask the user whether they want the project created in the current folder itself** (i.e. the folder Claude is already working in is meant to *be* the project root — not gain a nested subfolder inside it).
  - **If yes**: the current folder's name becomes the project name — validate it against the rules below. `ng new <name>` always creates a *new* folder named `<name>`, so to make it populate the current folder in place: go **up one directory first** (`cd ..`), then run `ng new` from there using the current folder's own name. This regenerates that same folder with the Angular app inside it — confirm with the user that the folder is empty (or that overwriting is fine) before doing this, since `ng new` will refuse/fail on a non-empty existing directory.
  - **If no**: ask for the project name (never invent one or default to a placeholder), and create it as a normal new subfolder of the current directory — no directory change needed.
- Either way, validate the project name against the standard Angular CLI project-name rules before using it (these are enforced by `ng new` itself, but check up front so you can ask again instead of letting the command fail):
  - Must start with a letter.
  - Only lowercase letters, digits, and dashes (`-`) — no spaces, underscores, uppercase letters, or other special characters.
  - Must not end with a dash, and no consecutive dashes.
  - Must not be an Angular/JS reserved word (e.g. `test`, `angular`, `app`).
  - If the name doesn't satisfy these, tell the user why and ask for a corrected name — don't silently rewrite it yourself. (If this came from "use the current folder," that means the current folder's name itself isn't a valid project name — ask whether to rename the folder or fall back to picking a separate project name instead.)
- Run:
  ```
  npx @angular/cli@latest new <app-name> --standalone --routing --style=css
  ```
  - `--standalone` — every sic-ng component is a standalone component.
  - `--routing` — sic-ng's own page-scaffolding patterns (resolvers, `canDeactivate` guards) are route-based.
  - `--style=css` — sic-ng ships plain CSS theme files, no preprocessor required.
- `cd` into the new app directory (the current-folder case above already went up one level, so this returns back into it — same folder, now populated). All later steps run from there.

## Step 3 — Install sic-ng and configure the theme

`sic-ng` is installed from its private GitHub repo (not the public npm registry), pinned to the latest release tag:

- Find the latest version tag first:
  ```
  git ls-remote --tags --refs https://github.com/softinter-chiangrai/sic-ng.git
  ```
  Tags follow `vMAJOR.MINOR.PATCH` — pick the highest by semver, not just the last line in the output.
- Install using that tag, authenticating with a GitHub personal access token from the `GITHUB_TOKEN` environment variable — **never write a real token as a literal string in a command, a file, or anywhere that could be committed to git.** If `GITHUB_TOKEN` isn't already set in the environment, ask the user for their token and have them export it themselves (or enter it interactively) rather than typing it into chat/a file for you to paste back in.
  ```
  npm install "git+https://${GITHUB_TOKEN}@github.com/softinter-chiangrai/sic-ng.git#<latest-tag>"
  ```
  Replace `<latest-tag>` with the tag found above, e.g. `v22.1.1`.
- Then install the peer dependency:
  ```
  npm install @angular/cdk@^22
  ```

Ask the user (via `AskUserQuestion`, single-select): do they want to switch between all 6 built-in themes at runtime, or just use one fixed theme?

- **All themes** → add to `src/styles.css`:
  ```css
  @import 'sic-ng/theme/all-themes.css';
  ```
- **Default theme only** (smaller CSS) → add to `src/styles.css`:
  ```css
  @import 'sic-ng/theme/default-theme.css';
  ```

Ask which starting theme and mode they want — use the `AskUserQuestion` tool with a fixed option list (single-select), don't ask as free text the user has to type out:
- `theme`: options `default`, `sunset`, `forest`, `violet`, `slate`, `glass`
- `mode`: options `light`, `dark`, `system`

Then wire it into `app.config.ts`'s `providers` array:

```ts
import { provideSicTheme, provideSicConfig } from 'sic-ng';

export const appConfig: ApplicationConfig = {
  providers: [
    // ...existing providers
    provideSicTheme({ mode: 'system', theme: 'default' }), // use the chosen values
    provideSicConfig({}), // starting point — fill in decimals/dateFormat/era/locale/messages later as needed
  ],
};
```

## Step 4 — Ask about the tutorial page

Ask the user whether they want sic-ng's built-in tutorial/demo page added as a route, for local reference while building (it documents every component, plus a "Project Structure" section with standard page-scaffolding patterns for later).

- **If yes**: add a lazy route pointing at `TutorialPageComponent` (exported from `sic-ng`), e.g.:
  ```ts
  {
    path: 'tutorial',
    loadComponent: () => import('sic-ng').then((m) => m.TutorialPageComponent),
  }
  ```
- **If no**: skip this step.

## Step 5 — Clear the root component template

`ng new` scaffolds `src/app/app.component.html` (or `app.html` in newer CLI output layouts — check which one exists) with a large boilerplate welcome page. Replace its entire contents with just the router outlet, since routing now owns what renders:

```html
<router-outlet />
```

Don't leave any of the generated boilerplate (welcome text, logo, links) behind — this is the last step, so the app should be left in a clean, ready-to-build state.

## Step 6 — Build test

Run the app's build — `ng build` or `npm run build` — and fix any errors before reporting setup as complete. This is a full new install (git-installed private package, theme wiring, config wiring), so confirm it actually compiles rather than assuming each step worked.

## Related skills

- `sic-layout` — design and scaffold the app shell (navbar/sidebar/breadcrumb), normally the next step right after this setup.
- `sic-generate` — scaffold individual pages using the Project Structure patterns.
- `sic-provide-config` / `sic-theme` — deeper follow-up tuning of config defaults and colors beyond what Step 3 covers.
