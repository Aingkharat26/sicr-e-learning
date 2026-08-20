import { computeMasonryColumns } from './sic-masonry-layout';

describe('computeMasonryColumns', () => {
  it('fills columns left-to-right on the first pass when every item is the same height', () => {
    expect(computeMasonryColumns([10, 10, 10, 10, 10, 10], 3)).toEqual([0, 1, 2, 0, 1, 2]);
  });

  it('sends each new item to whichever column is currently shortest', () => {
    // col0=0 col1=0 col2=0 -> item0 -> col0 (0)
    // col0=100 col1=0 col2=0 -> item1 -> col1 (100)
    // col0=100 col1=100 col2=0 -> item2 -> col2 (100)
    // col0=100 col1=100 col2=100 -> item3 -> col0 (tie -> lowest index)
    // col0=110 col1=100 col2=100 -> item4 -> col1 (tie -> lowest index)
    expect(computeMasonryColumns([100, 100, 100, 10, 10], 3)).toEqual([0, 1, 2, 0, 1]);
  });

  it('routes a tall item to a column, then keeps routing short items to whichever is now shortest', () => {
    // col0=0 col1=0 -> item0 (200) -> col0
    // col0=200 col1=0 -> item1 (10) -> col1
    // col0=200 col1=10 -> item2 (10) -> col1
    // col0=200 col1=20 -> item3 (10) -> col1
    expect(computeMasonryColumns([200, 10, 10, 10], 2)).toEqual([0, 1, 1, 1]);
  });

  it('handles a single column by sending everything there', () => {
    expect(computeMasonryColumns([5, 5, 5], 1)).toEqual([0, 0, 0]);
  });

  it('handles an empty heights array', () => {
    expect(computeMasonryColumns([], 3)).toEqual([]);
  });

  it('clamps a non-positive column count to 1', () => {
    expect(computeMasonryColumns([1, 2, 3], 0)).toEqual([0, 0, 0]);
  });
});
