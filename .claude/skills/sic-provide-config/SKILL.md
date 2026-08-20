---
name: "sic-provide-config"
description: "Adjust sic-ng's library-wide defaults via provideSicConfig() — decimal places, ค.ศ./พ.ศ. (CE/BE) era, date format, locale, page size, upload size limits, loading indicator, and every static UI text string (messages) for bilingual apps. Use when the user asks to change decimal points, switch between BE/CE year display, translate or customize sic-ng's built-in text, or adjust any other library-wide default instead of setting it on every component instance."
---

# provideSicConfig — Library-wide Defaults

`provideSicConfig(config: SicConfig)` sets defaults once at bootstrap instead of repeating the same `@Input` on every component instance. **Any `@Input` set directly on a component always wins over the config value** — config only fills in what a given instance doesn't specify itself.

## Step 1 — Find or create the call site

Look for an existing `provideSicConfig({...})` in `app.config.ts`'s `providers` array (it's normally added right alongside `provideSicTheme()`). If it exists, **merge** the requested change into the existing object — never overwrite unrelated keys the user already set. If it doesn't exist yet, add it:

```ts
import { provideSicConfig } from 'sic-ng';

export const appConfig: ApplicationConfig = {
  providers: [
    // ...existing providers, including provideSicTheme()
    provideSicConfig({
      // fields go here
    }),
  ],
};
```

## Step 2 — Ask what to change, then apply from this exact field list

Do not invent field names — every valid key is listed here. Ask the user which of these they want, or infer directly from their request:

### Top-level `SicConfig` fields

| Field | Type | Default | Affects |
|---|---|---|---|
| `decimals` | `number` | `2` | `sic-input-number`, and `number`-type columns/summaries in `sic-gridpanel` |
| `dateFormat` | `string` | `'dd/MM/yyyy'` | `sic-datepicker`, and `date`-type columns in `sic-gridpanel` |
| `era` | `'BE' \| 'CE'` | `'CE'` | `sic-datepicker`/`sic-calendar` — **display only**: values are always stored/sent as ค.ศ. (Gregorian) internally; this only changes what year number the user sees (พ.ศ. = ค.ศ. + 543) |
| `locale` | `string` | `'en'` | dayjs locale code for `sic-datepicker`/`sic-calendar` — the app must `import 'dayjs/locale/xx'` itself before setting this (e.g. `import 'dayjs/locale/th'` for `locale: 'th'`) |
| `loadingImage` | `string` | *(none — falls back to `sic-spinner`)* | Default image (.png/.gif) for `SicLoadingService.show()` when a call doesn't pass its own `image` |
| `loadingSpinnerSize` | `'sm' \| 'md' \| 'lg'` | `'lg'` | `SicLoadingService.show()`'s spinner size when no image is set |
| `maxUploadSizeMb` | `number` | `10` | `sic-upload`, `sic-input-comment` file attachments |
| `pageSize` | `number` | `10` | `sic-gridpanel`, `sic-combobox` paging |
| `pageSizeOptions` | `number[]` | `[10, 30, 50]` | `sic-gridpanel`'s page-size dropdown choices |
| `messages` | `SicMessages` | *(see below)* | every static UI text string in the library |

### `messages` (bilingual / custom text) — every key is optional, unset falls back to the English default

| Key | English default | Used by |
|---|---|---|
| `noOptions` | `'No options'` | `sic-combobox` empty list |
| `noMatches` | `'No matches'` | `sic-input-comment` @mention search, no results |
| `loading` | `'Loading…'` | `sic-input-comment` while `mentionSearch` resolves |
| `attachFile` | `'Attach file'` | `sic-input-comment` attach button aria-label |
| `removeFile` | `'Remove file'` | `sic-input-comment`/`sic-upload` remove button aria-label |
| `dragDropHint` | `'Drag & drop files here, or click to browse'` | `sic-upload` drop-zone hint |
| `noNotifications` | `'No notifications'` | `sic-navbar` notifications panel |
| `viewAllNotifications` | `'View All Notifications'` | `sic-navbar` notifications footer |
| `noEvents` | `'No events'` | `sic-calendar` agenda/list view |
| `cancel` / `confirm` / `close` | `'Cancel'` / `'Confirm'` / `'Close'` | `sic-dialog` common-dialog buttons (unless overridden per-call) |
| `gridLoading` | `'Loading...'` | `sic-gridpanel` initial load |
| `gridSaving` | `'Saving data...'` | `sic-gridpanel` save in flight |
| `gridLoadingOverlay` | `'Loading data...'` | `sic-gridpanel` (re)load overlay |
| `gridNoData` | `'No data found'` | `sic-gridpanel` empty state |
| `gridNoChangedData` | `'No changed data'` | `sic-gridpanel` review-changes mode, nothing changed |
| `gridNoDataHint` | `'Try adjusting your search or add a new row.'` | `sic-gridpanel` empty state subtitle |
| `gridNoChangedDataHint` | `'Try turning off review mode to see all rows.'` | `sic-gridpanel` review-changes empty subtitle |
| `gridPageSizeSuffix` | `''` | text appended after the number in `sic-gridpanel`'s page-size dropdown |
| `noResults` | `'No results'` | `sic-search` empty results |
| `noItems` | `'No items'` | `sic-masonry`, `sic-calendar-timeline`, `sic-card-stack` empty state |
| `masonryLoading` | `'Loading more...'` | `sic-masonry` next-page indicator |
| `dragDropEmptyList` | `'Drop items here'` | `sic-drag-drop` empty list/column placeholder |
| `stepperPrevious` / `stepperNext` / `stepperSkip` / `stepperFinish` | `'Previous'` / `'Next'` / `'Skip'` / `'Finish'` | `sic-stepper` built-in nav buttons |
| `codeCopy` / `codeCopied` | `'Copy'` / `'Copied'` | `sic-code` copy button, idle/just-copied states |
| `calendarTimelineViewLabel` | `'View'` | `sic-calendar-timeline` view-switcher label |
| `calendarTimelineDay` / `calendarTimelineWeek` / `calendarTimelineMonth` | `'Day'` / `'Week'` / `'Month'` | `sic-calendar-timeline` view-switcher options |
| `playVideo` | `'Play video'` | `sic-video-player` play-button aria-label |
| `unsavedChangesTitle` | `'Unsaved changes'` | `sicCanDeactivateGuard` confirm-dialog title |
| `unsavedChangesMessage` | `'You have unsaved changes. Leave this page anyway?'` | `sicCanDeactivateGuard` confirm-dialog description |

## Common requests → exact change

- **"เปลี่ยนทศนิยม" / decimal places** → set `decimals`.
- **"ใช้ พ.ศ." / Buddhist year** → set `era: 'BE'`. Don't touch `locale` unless they also want Thai month/day names — that's `locale: 'th'` plus `import 'dayjs/locale/th';` in `main.ts`/`app.config.ts`, and is independent of `era`.
- **"แปลข้อความเป็นไทย" / translate all text** → set `locale: 'th'` (for date displays) **and** fill in `messages` with Thai strings for every key the app actually surfaces — don't leave the rest silently in English if the user asked for a full translation; ask which specific messages matter if they only mention a few.
- **"เปลี่ยนจำนวนแถวต่อหน้า" / rows-per-page default** → `pageSize` (+ `pageSizeOptions` if the dropdown choices should change too).
- **"จำกัดขนาดไฟล์อัปโหลด"** → `maxUploadSizeMb`.

## Verification

After **any** change made by this skill, always run the app's build first — `ng build` or `npm run build`, whichever the project uses — and fix any errors before reporting success. Don't skip this because the change "looks like just config."

Then, if a dev server is available, confirm the affected component actually reflects the new default — e.g. open a page using `sic-datepicker` and check the displayed year matches the `era` set, or a `sic-gridpanel` and check its empty-state text matches a changed `messages.gridNoData`. Remember: any `@Input` already set directly on that component instance will still take precedence and hide the config change — that's expected, not a bug.
