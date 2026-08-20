---
name: "sic-generate"
description: "Generate a new page or wire up routing in a sic-ng Angular app, using sic-ng components and following the Project Structure standard (model/form/service/resolver/component files). Use when the user asks to create/generate/scaffold a new page, screen, or route in an app that uses sic-ng."
---

# generate — Page & Routing Scaffolding

Ask the user first which they want (unless it's obvious from their request): **generate a page**, **generate/wire up routing**, or both together (a new page that also needs a route added for it — the common case).

Before generating anything, look at how the target app already organizes pages and routes — don't impose a structure that doesn't match what's already there. A real reference layout (from an actual sic-ng consuming app) looks like this:

```
src/app/
  app.routes.ts                          # top-level routes
  management/
    profile/
      profile.component.ts/.html/.css
      profile.form.ts
      profile.model.ts
      profile.resolver.ts
      profile.service.ts
    business/
      business.component.ts              # shell/layout for this feature's children
      business-create/
        business-create.component.ts/.html/.css
        business-create.form.ts
        business-create.model.ts
        business-create.resolver.ts
        business-create.service.ts
  feature/
    bu/
      bu.routes.ts                        # shared routes file for this feature area
      rt/
        burt01/
          burt01.component.ts/.html/.css
          burt01.resolver.ts
          ...
```

Key things to notice and replicate: **each page's own folder never contains its own `.routes.ts`** — routing lives one level up, in a routes file shared by every page in that feature area.

## Generating a page

For a page named `pageName` (match the existing casing convention in the app — usually `camelCase`/`kebab-case` file prefix, `PascalCase` class names), always produce these files in the page's own folder:

| File | Purpose |
|---|---|
| `pageName.model.ts` | Plain interfaces — the entity model, plus `PageNamePageData` (shape of `route.snapshot.data['form']`, only needed if there's a resolver) |
| `pageName.form.ts` | Static factory `PageNameForm.createForm(fb)` building the `FormGroup` — only if the page has a form |
| `pageName.service.ts` | `@Injectable`, API calls only — no `FormGroup`/`SicFormData` logic |
| `pageName.resolver.ts` | Only if data must be ready before the page opens. Wraps the loaded model in `SicFormData` (**always pass the loaded model as the resolver's 2nd constructor argument** — omitting it makes the row start as `Added`/`isChanged: true` even though it was just loaded) |
| `pageName.component.ts/.html/.css` | Reads `route.snapshot.data['form']` if there's a resolver, binds the form, implements `SicCanComponentDeactivate.pageDirty()` if there's anything the user could lose by navigating away |

Build the UI out of sic-ng components (`sic-card`, `sic-grid`/`sic-flex` for layout, `sic-input`/`sic-combobox`/etc. for fields, `sic-gridpanel` for tables) — never write custom CSS layout when a sic-ng layout component covers it, and never use `sic-input` for a field whose value comes from a fixed list (use `sic-combobox` instead).

Pick whichever of these 3 shapes fits the page (ask if unclear):

1. **Single-entity edit form** — one `SicFormData`. UI: a `sic-card` wrapping the fields (`sic-grid` for layout), save button in `sicCardFooter` (`sic-flex justify="end"`).

2. **Search/list page** — two `sic-card`s: a Criteria card (free-text/range fields use `sic-input`; anything picked from a fixed list uses `sic-combobox`; footer has search + clear buttons, right-aligned) and a Detail card (`sic-gridpanel` with paging on, a trailing edit-icon button column using `{ type: 'button', buttonText: '✏️', sortable: false }`, no `label` on that column). If there are comboboxes needing options from the server, load them all via `forkJoin` in the resolver rather than each combobox fetching its own on open.

3. **Form + history/log grid** — a single-entity edit form plus a second `sic-gridpanel` (e.g. a change history) that loads its own rows via its own `(loadData)` handler (not the resolver — resolvers are for data that must be ready before the page opens). Save combines both into one payload with `sicFormCombine({ mainKey: sicFormDataInstance, gridKey: gridPanelComponent })`, then `combined.markAllAsTouched()` + check `combined.invalid`. `pageDirty()` must check both (`mainForm.isChanged || (historyGrid?.hasPendingChanges ?? false)`) — since the deactivate guard calls `pageDirty()` from outside any click handler, hold the grid with `@ViewChild`, not a template reference variable passed into a click handler.

For exact code shape of all 3 (attribute names, full working examples), consult sic-ng's own tutorial — either the running `/tutorial` page (Project Structure section) if the app has it, or `projects/sic-ng/src/lib/tutorial/tutorial-page.component.ts` if working inside the `sic-ng` repo itself.

## Generating / wiring up routing

Don't create a `.routes.ts` per page. Instead:

- If the page belongs to an **existing feature area** (there's already a `<feature>/<feature>.routes.ts`), add an entry to that file's `routes: Routes` array.
- If it's a **new feature area**, create `<feature>/<feature>.routes.ts` exporting `export const routes: Routes = [...]`, then wire it into the parent route via `loadChildren`:
  ```ts
  {
    path: '<feature>',
    loadChildren: () => import('./<feature>/<feature>.routes').then((m) => m.routes),
  }
  ```
- Each page's own route entry:
  ```ts
  {
    path: '<pageName>',
    loadComponent: () => import('./<pageName>/<pageName>.component').then((m) => m.PageNameComponent),
    resolve: { form: pageNameResolver },       // only if the page has a resolver — key is always literally 'form'
    canDeactivate: [/* the app's own deactivate guard */], // only if the component implements pageDirty()
  }
  ```
- Match whatever the app's actual deactivate guard is called (check existing routes for the pattern already in use — it may be sic-ng's own `sicCanDeactivateGuard`, or a locally-defined one) rather than assuming.

Verify by checking that the new/edited routes file has no syntax errors and that the app's top-level `app.routes.ts` (or the relevant feature routes file) actually reaches the new route — trace the `loadChildren`/`loadComponent` chain from the root to confirm it's reachable, not just that the file exists.

## Verification

After **any** file this skill creates or edits, always run the app's build — `ng build` or `npm run build`, whichever the project uses — and fix any errors (missing imports, typos in `@Input` names, mismatched resolver/route data keys, etc.) before reporting the page/route as done. Don't stop at "the files look right."

## Related skills

- `sic-layout` — the app shell (navbar/sidebar) pages generated here render inside; scaffold that first if it doesn't exist yet.
- `sic-project-setup` — initial app bootstrap, if not done yet.
- `sic-ng` — component reference for exact attribute/event names when building page UI.
