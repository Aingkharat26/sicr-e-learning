/**
 * Tracks a row/entity's relationship to its persisted source, mirroring the
 * EF Core `EntityState` names so backend/frontend state vocab stays aligned
 * across a save-changes payload.
 */
export const SicEntityState = {
  /** Not tracked for change-detection at all (e.g. the row was removed from its parent list/grid). */
  Detached: 'detached',
  /** Matches the last-known-saved baseline — no pending changes. */
  Unchanged: 'unchanged',
  /** New row not yet persisted. */
  Added: 'added',
  /** Differs from the last-known-saved baseline. */
  Modified: 'modified',
  /** Marked for deletion on next save. */
  Deleted: 'deleted',
} as const;

export type SicEntityState = (typeof SicEntityState)[keyof typeof SicEntityState];
