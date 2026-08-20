import { EnvironmentProviders, InjectionToken, inject, makeEnvironmentProviders } from '@angular/core';

/**
 * Static/bilingual UI text used across components. Any key left unset falls
 * back to that component's built-in English default — set only the ones you
 * need to change.
 */
export interface SicMessages {
  /** sic-combobox empty options list. Default: 'No options'. */
  noOptions?: string;
  /** sic-input-comment @mention list when the search returned nothing. Default: 'No matches'. */
  noMatches?: string;
  /** sic-input-comment @mention list while `mentionSearch` is resolving. Default: 'Loading…'. */
  loading?: string;
  /** sic-input-comment attach-file button aria-label. Default: 'Attach file'. */
  attachFile?: string;
  /** sic-input-comment / sic-upload remove-file button aria-label. Default: 'Remove file'. */
  removeFile?: string;
  /** sic-upload drop-zone hint. Default: 'Drag & drop files here, or click to browse'. */
  dragDropHint?: string;
  /** sic-navbar notifications panel empty state. Default: 'No notifications'. */
  noNotifications?: string;
  /** sic-navbar notifications panel footer button. Default: 'View All Notifications'. */
  viewAllNotifications?: string;
  /** sic-calendar agenda/list view empty state. Default: 'No events'. */
  noEvents?: string;
  /** sic-dialog common-dialog Cancel button (confirm() dialogs), unless overridden per-call via `cancelText`. Default: 'Cancel'. */
  cancel?: string;
  /** sic-dialog common-dialog Confirm button (confirm() dialogs), unless overridden per-call via `confirmText`. Default: 'Confirm'. */
  confirm?: string;
  /** sic-dialog common-dialog Close button (info/success/danger/warning dialogs), unless overridden per-call via `closeText`. Default: 'Close'. */
  close?: string;
  /** sic-gridpanel initial-load state. Default: 'Loading...'. */
  gridLoading?: string;
  /** sic-gridpanel busy overlay while a save is in flight. Default: 'Saving data...'. */
  gridSaving?: string;
  /** sic-gridpanel busy overlay while data is (re)loading. Default: 'Loading data...'. */
  gridLoadingOverlay?: string;
  /** sic-gridpanel empty state title with no rows. Default: 'No data found'. */
  gridNoData?: string;
  /** sic-gridpanel empty state title in review-changes mode with nothing changed. Default: 'No changed data'. */
  gridNoChangedData?: string;
  /** sic-gridpanel empty state subtitle with no rows. Default: 'Try adjusting your search or add a new row.'. */
  gridNoDataHint?: string;
  /** sic-gridpanel empty state subtitle in review-changes mode with nothing changed. Default: 'Try turning off review mode to see all rows.'. */
  gridNoChangedDataHint?: string;
  /** Suffix appended after the number in sic-gridpanel's page-size dropdown (e.g. "10" + suffix). Default: '' (no suffix). */
  gridPageSizeSuffix?: string;
  /** sic-search empty result list. Default: 'No results'. */
  noResults?: string;
  /** sic-masonry empty state when `items`/the loaded pages are empty. Default: 'No items'. */
  noItems?: string;
  /** sic-masonry indicator shown under the grid while `isLazy` is fetching the next page. Default: 'Loading more...'. */
  masonryLoading?: string;
  /** sic-drag-drop placeholder text shown inside an empty list/column. Default: 'Drop items here'. */
  dragDropEmptyList?: string;
  /** sic-stepper built-in nav "Previous" button. Default: 'Previous'. */
  stepperPrevious?: string;
  /** sic-stepper built-in nav "Next" button. Default: 'Next'. */
  stepperNext?: string;
  /** sic-stepper built-in nav "Skip" button, shown only on optional steps. Default: 'Skip'. */
  stepperSkip?: string;
  /** sic-stepper built-in nav "Finish" button, shown on the last step. Default: 'Finish'. */
  stepperFinish?: string;
  /** sic-code copy button, idle state. Default: 'Copy'. */
  codeCopy?: string;
  /** sic-code copy button, briefly shown right after a successful copy. Default: 'Copied'. */
  codeCopied?: string;
  /** sic-calendar-timeline view-mode switcher label. Default: 'View'. */
  calendarTimelineViewLabel?: string;
  /** sic-calendar-timeline view-mode switcher "day" option. Default: 'Day'. */
  calendarTimelineDay?: string;
  /** sic-calendar-timeline view-mode switcher "week" option. Default: 'Week'. */
  calendarTimelineWeek?: string;
  /** sic-calendar-timeline view-mode switcher "month" option. Default: 'Month'. */
  calendarTimelineMonth?: string;
  /** sic-video-player play-button overlay aria-label, shown over the poster before playback starts. Default: 'Play video'. */
  playVideo?: string;
  /** sicCanDeactivateGuard's confirm-dialog title when the leaving component reports unsaved changes. Default: 'Unsaved changes'. */
  unsavedChangesTitle?: string;
  /** sicCanDeactivateGuard's confirm-dialog description. Default: 'You have unsaved changes. Leave this page anyway?'. */
  unsavedChangesMessage?: string;
}

/** Library-wide defaults, set once via `provideSicConfig()`. Any per-component `@Input` still wins over these. */
export interface SicConfig {
  /** Default decimal places for sic-input-number and sic-gridpanel's `number` columns/summaries. Default: 2. */
  decimals?: number;
  /** Default display format for sic-datepicker and sic-gridpanel's `date` columns. Default: 'dd/MM/yyyy'. */
  dateFormat?: string;
  /** Default year numbering for sic-datepicker/sic-calendar — 'CE' (Gregorian) or 'BE' (Buddhist, ค.ศ. + 543). Default: 'CE'. */
  era?: 'BE' | 'CE';
  /** Default dayjs locale code for sic-datepicker/sic-calendar. Default: 'en'. */
  locale?: string;
  /** Default image URL (.png/.gif/etc.) shown by `SicLoadingService.show()` when the caller doesn't pass its own `image`. Unset falls back to the sic-spinner. */
  loadingImage?: string;
  /** Default spinner size for `SicLoadingService.show()` when no image and no explicit `spinnerSize` are given. Default: 'lg'. */
  loadingSpinnerSize?: 'sm' | 'md' | 'lg';
  /** Default max upload size (MB) for sic-upload and sic-input-comment. Default: 10. */
  maxUploadSizeMb?: number;
  /** Default page size for sic-gridpanel and sic-combobox paging. Default: 10. */
  pageSize?: number;
  /** Default page-size choices for sic-gridpanel. Default: [10, 30, 50]. */
  pageSizeOptions?: number[];
  messages?: SicMessages;
}

export const SIC_CONFIG = new InjectionToken<SicConfig>('SIC_CONFIG');

/** Registers library-wide defaults. Call once alongside `provideSicTheme()` in `bootstrapApplication`/`ApplicationConfig`. */
export function provideSicConfig(config: SicConfig): EnvironmentProviders {
  return makeEnvironmentProviders([{ provide: SIC_CONFIG, useValue: config }]);
}

/** Components call this instead of `inject(SIC_CONFIG, { optional: true })` directly — always returns an object, never null. */
export function injectSicConfig(): SicConfig {
  return inject(SIC_CONFIG, { optional: true }) ?? {};
}
