/**
 * Classic "shortest column first" masonry packing: walks `heights` in the item's original array
 * order and assigns each one to whichever column currently has the smallest accumulated height —
 * the same algorithm Pinterest-style masonry grids use. Ties (e.g. every column still at 0 before
 * any item has landed) resolve to the lowest column index, which is what makes items read
 * left-to-right for the common case of same-height items.
 *
 * Pure and DOM-free on purpose: real item heights only exist once the browser has laid the
 * content out, but the placement decision itself doesn't need a DOM to be tested against.
 */
export function computeMasonryColumns(heights: readonly number[], columnCount: number): number[] {
  const safeColumnCount = Math.max(1, Math.floor(columnCount) || 1);
  const columnHeights = new Array<number>(safeColumnCount).fill(0);
  const assignment: number[] = new Array(heights.length);

  for (let i = 0; i < heights.length; i++) {
    let shortest = 0;
    for (let c = 1; c < safeColumnCount; c++) {
      if (columnHeights[c] < columnHeights[shortest]) {
        shortest = c;
      }
    }
    assignment[i] = shortest;
    columnHeights[shortest] += heights[i];
  }

  return assignment;
}
