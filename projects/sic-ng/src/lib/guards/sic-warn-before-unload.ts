import { isPlatformBrowser } from '@angular/common';
import { DestroyRef, PLATFORM_ID, inject } from '@angular/core';

/**
 * Warns on a browser tab close/refresh (the native `beforeunload` prompt) whenever `isDirty()`
 * returns true — the one "leave the page" path `sicCanDeactivateGuard` can't intercept, since that
 * guard only runs for in-app Angular Router navigation.
 *
 * Call once from a routed page component's constructor (or any injection context) — it removes
 * its own listener on destroy via `DestroyRef`, no manual cleanup needed. No-op outside the
 * browser (SSR).
 */
export function sicWarnBeforeUnload(isDirty: () => boolean): void {
  if (!isPlatformBrowser(inject(PLATFORM_ID))) {
    return;
  }

  const handler = (event: BeforeUnloadEvent): void => {
    if (!isDirty()) {
      return;
    }
    event.preventDefault();
    event.returnValue = '';
  };

  window.addEventListener('beforeunload', handler);
  inject(DestroyRef).onDestroy(() => window.removeEventListener('beforeunload', handler));
}
