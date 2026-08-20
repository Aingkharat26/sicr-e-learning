import { inject } from '@angular/core';
// `import type` — these are erased entirely at compile time (never emitted as a real `@angular/
// router` import), since @angular/router is an *optional* peer dependency: consumers who never use
// this guard shouldn't need the package installed just to import something else from sic-ng.
import type { ActivatedRouteSnapshot, CanDeactivateFn, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { injectSicConfig } from '../config/sic-config';
import { SicDialogService } from '../components/sic-dialog/sic-dialog.service';

/** Implement on any routed component to opt into `sicCanDeactivateGuard`'s unsaved-changes prompt. */
export interface SicCanComponentDeactivate {
  /** Return true while the page has unsaved changes the user could lose by navigating away. */
  pageDirty(): boolean;
}

/**
 * Route `data` key a *target* route can set to `true` to skip the confirm prompt for that
 * navigation — e.g. a session-expired or logout redirect the app itself triggers, which has no
 * user present to answer a "leave page?" dialog: `{ path: 'login', data: { [SIC_SKIP_DEACTIVATE_GUARD]: true } }`.
 */
export const SIC_SKIP_DEACTIVATE_GUARD = 'skipDeactivateGuard';

/**
 * `canDeactivate` guard: prompts to confirm leaving (via `SicDialogService.confirm()`) only when
 * the component being left reports unsaved changes through `SicCanComponentDeactivate.pageDirty()`.
 *
 * This only intercepts in-app Angular Router navigation — a browser tab close/refresh bypasses it
 * entirely. Pair it with `sicWarnBeforeUnload()` in the same component to also cover that case.
 *
 * ```ts
 * // profile.routes.ts
 * {
 *   path: 'profile',
 *   loadComponent: () => import('./management/profile/profile.component').then((m) => m.Profile),
 *   resolve: { form: profileResolver },
 *   canDeactivate: [sicCanDeactivateGuard],
 * }
 *
 * // profile.component.ts
 * export class Profile implements SicCanComponentDeactivate {
 *   // ...
 *   pageDirty(): boolean {
 *     return this.formProfileData.dirty; // SicFormData already tracks this
 *   }
 * }
 * ```
 */
export const sicCanDeactivateGuard: CanDeactivateFn<SicCanComponentDeactivate> = (
  component: SicCanComponentDeactivate,
  _currentRoute: ActivatedRouteSnapshot,
  _currentState: RouterStateSnapshot,
  nextState: RouterStateSnapshot,
): boolean | Observable<boolean> => {
  if (!component.pageDirty || !component.pageDirty()) {
    return true;
  }

  if (hasRouteDataFlag(nextState.root, SIC_SKIP_DEACTIVATE_GUARD)) {
    return true;
  }

  const dialogService = inject(SicDialogService);
  const sicConfig = injectSicConfig();

  return dialogService
    .confirm(
      sicConfig.messages?.unsavedChangesTitle ?? 'Unsaved changes',
      sicConfig.messages?.unsavedChangesMessage ?? 'You have unsaved changes. Leave this page anyway?',
    )
    .pipe(
      // A broken/rejecting confirm dialog should block navigation, not silently let it through —
      // losing unsaved work is unrecoverable, being stuck on the current page is not.
      catchError(() => of(false)),
    );
};

function hasRouteDataFlag(snapshot: ActivatedRouteSnapshot | null, key: string): boolean {
  let current = snapshot;
  while (current) {
    if (current.data[key]) {
      return true;
    }
    current = current.firstChild;
  }
  return false;
}
