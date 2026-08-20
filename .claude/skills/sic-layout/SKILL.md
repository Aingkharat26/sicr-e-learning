---
name: "sic-layout"
description: "Design and scaffold one or more app shells (navbar/sidebar/breadcrumb frames) for a sic-ng app — e.g. a public shell for a homepage/storefront plus a separate authenticated shell for an admin/back-office area — including OAuth2/OIDC login protecting the ones that need it. Asks about shell count, structure, sidebar behavior, navbar content, and authentication per shell, then generates the shell component(s), route wiring, and auth wiring (guard, interceptor, callback route). Use when the user asks to set up the app's overall layout/shell, add a sidebar or navbar, split public vs. authenticated areas of the app, protect pages behind login, or design the page frame(s) that pages render inside."
---

# sic-layout — App Shell Design & Scaffolding

The app shell is the persistent navbar/sidebar frame every page renders inside — different from `sic-generate`, which scaffolds the pages that render *in* that frame. Ask the questions below (via `AskUserQuestion`, fixed options, not free text) before writing any code, since the shell shape drives which files/wiring get generated.

## Step 0 — How many shells does the app need?

**Q0 — Single shell or multiple** (single-select): a lot of apps need more than one distinct frame — e.g. a public storefront/marketing shell with no login (navbar-only, maybe not even a sidebar) plus a separate authenticated back-office/admin shell (navbar + sidebar) once the user logs in. Don't assume one shell fits the whole app just because that's the common case.
- **One shell for the whole app** — proceed straight to Step 1 once.
- **Multiple shells** (e.g. a public layout + an authenticated layout) — ask the user to name and briefly describe each shell (how many, and what each is for — public/marketing vs. authenticated back-office is the most common split, but let them define their own), then run Step 1 through Step 2b **once per shell**, keeping each shell's answers and generated files completely separate. Typically only the authenticated shell(s) get Q7 = an auth option; a public shell normally answers Q7 = "No auth needed."

If there are multiple shells, also cover in Step 2's routing wiring: each shell is its own top-level parent route (`component`/`loadComponent` pointing at that shell, with a `children: []` array for the pages that render inside it via that shell's `<router-outlet />`) — not nested inside each other. Only the route group(s) backed by an auth-requiring shell get `canActivate: [authGuard]` on their parent route; the public shell's route group must not.

## Step 1 — Ask about shell structure

**Q1 — Shell type** (single-select):
- **Navbar only** — top bar, no side menu. Simple apps / marketing-style pages.
- **Sidebar only** — no top bar.
- **Navbar + Sidebar + Breadcrumb** — admin/dashboard shell. Most common choice. If picked, continue to Q2–Q5 below.
- **None / custom** — skip scaffolding; just point the user at `references/navigation.md` in the `sic-ng` skill for individual component usage.

If the answer isn't "Navbar + Sidebar + Breadcrumb," skip straight to Step 2 with only the relevant single component (`sic-navbar` or `sic-sidebar` alone) — Q2/Q3/Q6 (placement, collapse, breadcrumb) don't apply without both.

**Q2 — Sidebar placement** (single-select, only if the shell has a sidebar) — these map directly to the two shell layouts sic-ng's own tutorial documents (`references/navigation.md`, "Navbar + Sidebar + Breadcrumb" sections) — don't invent a third arrangement:
- **v1 — sidebar under navbar**: navbar spans the full width on top; sidebar and content sit in a row underneath it. Outer shell is a column (navbar, then a row of sidebar+content).
- **v2 — sidebar full height**: sidebar is a full-height sibling on the left from top to bottom; navbar+content form the right column. Logo/brand moves to the sidebar's own `logo`/`brand` inputs instead of `sicNavbarHeader`, since the navbar no longer spans the full width.

**Q3 — Sidebar collapse behavior** (single-select):
- `rail` — collapses to a narrow icon-only strip (`collapseMode="rail"`, the sidebar default).
- `hidden` — collapses away completely, width 0 (`collapseMode="hidden"`).
- Not collapsible — no toggle at all: don't render a hamburger, and don't wire a `collapsed` state.

**Q4 — Sidebar menu grouping** (single-select):
- Grouped sections with titles — `sections: SicSidebarSection[]`, each with a `title` and its own `items`.
- Flat list, no group titles — `items: SicSidebarItem[]` directly, no `sections` wrapper.
- **Program → Module hierarchy** — a two-level structure: each `SicSidebarSection` (or top-level item) is a **Program**, and its `items` are that program's **Modules**; each Module item links to a page (`link`) or, if a module itself groups multiple pages, nests a further level via `item.children` (sidebar supports arbitrarily nested `children`, so a 3rd level is possible if a module needs it, but don't add it unless actually needed). Use this when the app organizes itself around business programs/systems that each contain several modules, rather than generic feature groupings.
  - When this is picked, the folder/route structure should mirror it: `src/app/<program>/<module>/<page>/...` and paths like `/<program>/<module>/<page>` — align with whatever `sic-generate` produces for the app's pages rather than inventing a separate convention, since pages generated there must slot into this same hierarchy.

**Q5 — Navbar right-side content** (multi-select — none of these have built-in UI, all must be assembled by hand in `sicNavbarRight`):
- Dark mode toggle (☀️/🌙 button)
- Notifications — bell icon + `sic-popover` showing a list (mirror the tutorial's pattern exactly: `sic-popover` with `sicPopoverButton`/`sicPopoverHeader`/`sicPopoverList`, **not** `sic-navbar`'s own `notificationsOpen`/`toggleNotifications()` — the tutorial's real shell examples use the popover approach)
- User profile (avatar initial + name)
- None of these — leave `sicNavbarRight` empty/omitted

**Q6 — Breadcrumb** (only if Q1 included it): confirm the app has (or will soon have) a real "current location" source to compute it from — normally the current route. `sic-breadcrumb` has no direct binding to `sic-sidebar`; the path must always be computed on the host by walking `sidebarSections`/`items` looking for the active link. If there's no route-driven active link yet, skip breadcrumb rather than generating dead code.

**Q7 — Authentication** (single-select):
- **OAuth2/OIDC (Keycloak-style)** — protect the shell behind login using the pattern below. Follow up by asking for the `issuer` URL, `clientId`, and realm/scope if not given — never invent placeholder credentials that look real; use obvious placeholders (`<issuer-url>`, `<client-id>`) if the user hasn't provided them yet.
- **Already has an auth solution wired up elsewhere in the app** — don't scaffold new auth files; just wire the shell's user-profile UI (Q5) to whatever `AuthService`-equivalent already exists (ask for its name/location).
- **No auth needed** — skip Step 2b entirely; the shell has no login gate.

## Step 2 — Generate the shell component

Ask for a component name if not obvious (commonly `AppShellComponent` or `ShellComponent`). Then produce `*.component.ts/.html/.css` reproducing the wiring pattern from whichever tutorial variant matched Q1/Q2, adapted to the other answers:

- `[showToggle]` / `[collapseMode]` on `sic-sidebar` set per Q3 (if "not collapsible": `showToggle=false` and no hamburger button anywhere).
- `[sections]` vs `[items]` on `sic-sidebar` per Q4 — don't emit both.
- `sicNavbarRight` template containing **only** the pieces picked in Q5 — don't stub out unused dark-mode/notification/profile code "just in case." If Q7 is OAuth2/OIDC or an existing auth solution, the User profile piece must read the real logged-in user (not a hardcoded `SicNavbarUser` mock) and its menu action / a dedicated logout button must call the real logout method — see Step 2b.
- Breadcrumb: only if Q6 confirmed, reusing the tutorial's `findSidebarPath()` helper + `shellBreadcrumbItems` getter pattern (walks `sections`/`items`, supports arbitrarily nested `children`, returns the ancestor chain to the active item).
- **Router integration (the one deliberate deviation from the tutorial demo)**: the tutorial's examples are static demos with a hardcoded `activeLink` and a content-area comment placeholder. A real shell must instead:
  - Wrap `<router-outlet />` in the content area (not a placeholder comment).
  - Derive `activeLink` from the router itself — inject `Router`, read `router.url` initially and subscribe to `router.events` filtered to `NavigationEnd` to keep it live — rather than a component field set once.

For the exact starting-point markup/TS to adapt (full working v1 and v2 examples, `SicSidebarSection`/`SicNavbarUser`/`SicNavbarNotification` shapes, the popover notification pattern, the `findSidebarPath` helper), read `.claude/skills/sic-ng/references/navigation.md` — don't invent attribute names or event payloads; every one used here must be verifiable there.

**If there are multiple shells (Step 0):** each one is its own top-level route with its child pages nested underneath it, not a shared shell with conditional UI. In `app.routes.ts`:

```ts
export const routes: Routes = [
  {
    path: '',
    component: PublicShellComponent,       // navbar-only, no auth
    children: [
      { path: '', loadComponent: () => import('./public/home/home.component').then(m => m.HomeComponent) },
      { path: 'products', loadComponent: () => import('./public/products/products.component').then(m => m.ProductsComponent) },
    ],
  },
  {
    path: 'admin',
    component: AppShellComponent,          // navbar+sidebar, behind login
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', loadComponent: () => import('./admin/dashboard/dashboard.component').then(m => m.DashboardComponent) },
      // ...pages generated by sic-generate go here
    ],
  },
  { path: 'auth/callback', loadComponent: () => import('./core/auth/auth-callback.component').then(m => m.AuthCallbackComponent) },
];
```

Each shell's own `<router-outlet />` (from Step 2) renders whichever child route matched — the outer `Routes` array is what decides *which shell* wraps a given URL, the shell component itself doesn't know or care how many sibling shells exist.

## Step 2b — Authentication (only if Q7 = OAuth2/OIDC)

This is not a sic-ng library feature (the library itself ships no auth) — it's an Angular app-level concern that the shell depends on for its login-gated content and its user-profile UI. Scaffold `src/app/core/auth/` with this exact file breakdown (proven pattern, not invented):

| File | Purpose |
|---|---|
| `auth.config.ts` | `AuthConfig` object (from `angular-oauth2-oidc`) — `issuer`, `clientId`, `responseType: 'code'`, `scope`, `redirectUri`/`postLogoutRedirectUri` computed from `window.location.origin` (guard with `typeof window !== 'undefined'` for SSR safety) |
| `auth.service.ts` | `@Injectable({ providedIn: 'root' })` wrapping `OAuthService` — `initializeAuth()` (loads discovery doc, tries login, falls back to refresh), `isLoggedIn()`, `getAccessToken()`, `login(returnUrl)` (`initCodeFlow`), `logout()`, `handleCallback()`, `refreshToken()`, `consumeReturnUrlFromState()`. Every method short-circuits to a safe default (`false`/`null`) when not running in a browser (`isPlatformBrowser(inject(PLATFORM_ID))`) — needed even in non-SSR apps if prerendering is ever turned on later |
| `auth.guard.ts` | `CanActivateFn` — on the server, always allow (`return true`, never redirect during SSR); in the browser, allow if `auth.isLoggedIn()`, otherwise call `auth.login(state.url)` and return `false` to cancel the navigation |
| `auth-callback.component.ts` | Minimal standalone component at the OAuth redirect route — calls `auth.handleCallback()` in `ngOnInit`, then `router.navigateByUrl()` to the return URL (or `/` on failure) |
| `../interceptors/auth-token.interceptor.ts` | `HttpInterceptorFn` — attaches `Authorization: Bearer <token>` to outgoing requests when a token exists; only touch requests matching the app's own API base URL, don't blindly attach the token to every request (e.g. third-party calls) |

Wiring, in `app.config.ts`:
- `provideHttpClient(withInterceptors([authTokenInterceptor]))`
- Register `OAuthModule`/`provideOAuthClient()` per the `angular-oauth2-oidc` package's own Angular 22 setup (check the installed version's docs — its providers API has changed across major versions, don't assume the exact call shape from memory).

Wiring, in routes:
- Add a `/auth/callback` route (matching `redirectUri`'s path) pointing at `AuthCallbackComponent`.
- Add `canActivate: [authGuard]` to the shell's own route (protects everything inside it at once) rather than to every individual page route, unless the app specifically needs some pages public and others protected — in that case guard only the protected subset.

Wiring, in the shell's `sicNavbarRight` (from Q5's User profile choice):
- Inject `AuthService`, show the real user's info if the token/ID payload exposes it (or a generic "signed in" state if it doesn't), and wire a logout action (menu item or dedicated button) to `authService.logout()`.

Ask the user for the OIDC provider's `issuer` URL and `clientId` before writing `auth.config.ts` — don't fabricate a realistic-looking issuer/realm the way a demo would; leave an obvious placeholder if they haven't decided yet.

## Step 3 — Build test

After generating the shell files (all of them, if multiple), run the app's build (`ng build` or `npm run build`) and fix any errors before reporting the shell(s) as done.

## Related skills

- `sic-project-setup` — bootstrap the app first; the shell is normally added right after initial setup, once theme/config are wired.
- `sic-generate` — scaffolds the individual pages that render inside this shell's `<router-outlet />`.
- `sic-ng` — full component reference (`references/navigation.md` specifically) for every attribute/event used here.
- `sic-theme` — colors/dark-mode tokens the shell's dark-mode toggle switches between, not shell structure itself.
