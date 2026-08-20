import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ContentChild,
  ElementRef,
  EventEmitter,
  HostBinding,
  HostListener,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  PLATFORM_ID,
  QueryList,
  SimpleChanges,
  TemplateRef,
  ViewChild,
  ViewChildren,
  inject,
} from '@angular/core';
import { injectSicConfig } from '../../config/sic-config';
import { computeMasonryColumns } from './sic-masonry-layout';

/** Template context handed to a custom `<ng-template #itemTemplate let-item let-index="index">` card. */
export interface SicMasonryItemContext<T> {
  $implicit: T;
  index: number;
}

/** One rendered card: `item` plus its position in the original (unsplit) `items`/lazy-loaded array. */
export interface SicMasonryEntry<T> {
  item: T;
  index: number;
}

interface SicMasonryLoadPayload {
  pageNo: number;
  pageSize: number;
}

/** Emitted when `isLazy` is true and the sentinel at the bottom of the grid scrolls into view. Call `items.update(...)` with the next page. */
export interface SicMasonryLoadEvent<T = unknown> extends SicMasonryLoadPayload {
  items: {
    update: (items: T[]) => void;
  };
}

/**
 * Pinterest-style masonry grid. Items are distributed into column buckets — greedily, each item
 * (in original array order) goes into whichever column currently has the least accumulated height,
 * exactly like Pinterest's own layout — so tall/short cards balance out instead of the last column
 * running long. Heights are measured from the real rendered cards, so an initial left-to-right
 * round-robin guess is used until that measurement is available (usually a single animation frame).
 * Pass `[items]` for a plain static grid, or set `[isLazy]="true"` and handle `(loadMore)` to fetch
 * more pages as the user scrolls near the bottom. Provide `<ng-template #itemTemplate>` to fully
 * customize how each card renders, and listen to `(itemClick)` for per-card clicks.
 */
@Component({
  selector: 'sic-masonry',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sic-masonry.component.html',
  styleUrl: './sic-masonry.component.css',
})
export class SicMasonryComponent<T = unknown> implements OnChanges, AfterViewInit, OnDestroy {
  private readonly sicConfig = injectSicConfig();
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly cdr = inject(ChangeDetectorRef);

  @Input() items: T[] = [];
  @Input() cols = 3;
  /** Breakpoint → column count, e.g. { sm: 1, md: 2, lg: 4 } */
  @Input() colsBreakpoints: Record<'sm' | 'md' | 'lg', number> | null = null;
  @Input() gap = 'var(--sic-space-4)';
  /** When true, `items` is ignored — the component loads its own pages via `(loadMore)`, starting automatically on init. */
  @Input() isLazy = false;
  @Input() pageSize = this.sicConfig.pageSize ?? 20;
  @Input() trackBy?: (index: number, item: T) => unknown;

  @Output() loadMore = new EventEmitter<SicMasonryLoadEvent<T>>();
  /** Emits the clicked item (and its index in `items`/the lazy-loaded array). */
  @Output() itemClick = new EventEmitter<T>();

  /** `<ng-template #itemTemplate let-item let-index="index">` overrides how each card renders. */
  @ContentChild('itemTemplate') itemTemplate?: TemplateRef<SicMasonryItemContext<T>>;
  @ViewChild('sentinel') private readonly sentinelRef?: ElementRef<HTMLElement>;
  @ViewChildren('itemEl') private itemEls?: QueryList<ElementRef<HTMLElement>>;

  loadingMore = false;
  hasMore = true;
  /** Column buckets actually rendered — index 0 is the leftmost column. */
  columns: SicMasonryEntry<T>[][] = [];

  private loadedItems: T[] = [];
  private pageNo = 1;
  private observer?: IntersectionObserver;
  private resizeTimer?: ReturnType<typeof setTimeout>;
  private lastRenderedCols = 0;

  get dataset(): T[] {
    return this.isLazy ? this.loadedItems : this.items;
  }

  get noItemsText(): string {
    return this.sicConfig.messages?.noItems ?? 'No items';
  }

  get loadingMoreText(): string {
    return this.sicConfig.messages?.masonryLoading ?? 'Loading more...';
  }

  @HostBinding('class.sic-masonry-host') readonly hostClass = true;
  @HostBinding('class.sic-masonry--responsive') get responsive(): boolean {
    return !!this.colsBreakpoints;
  }
  @HostBinding('style.--sic-masonry-cols') get colsVar(): number {
    return this.cols;
  }
  @HostBinding('style.--sic-masonry-gap') get gapVar(): string {
    return this.gap;
  }
  @HostBinding('style.--sic-masonry-cols-sm') get colsSm(): number {
    return this.colsBreakpoints?.sm ?? this.cols;
  }
  @HostBinding('style.--sic-masonry-cols-md') get colsMd(): number {
    return this.colsBreakpoints?.md ?? this.cols;
  }
  @HostBinding('style.--sic-masonry-cols-lg') get colsLg(): number {
    return this.colsBreakpoints?.lg ?? this.cols;
  }

  /** The column count actually in effect right now, resolved from `colsBreakpoints` + the current viewport width, matching the same sm/md breakpoints (768/1024px) the rest of the library uses. */
  get effectiveCols(): number {
    if (!this.colsBreakpoints || !this.isBrowser) {
      return this.cols;
    }

    const width = window.innerWidth;
    if (width >= 1024) {
      return this.colsBreakpoints.lg ?? this.cols;
    }
    if (width >= 768) {
      return this.colsBreakpoints.md ?? this.cols;
    }
    return this.colsBreakpoints.sm ?? this.cols;
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    if (!this.isBrowser || !this.colsBreakpoints) {
      return;
    }

    clearTimeout(this.resizeTimer);
    this.resizeTimer = setTimeout(() => {
      this.rebuildNaiveColumns();
      this.scheduleRelayout();
    }, 150);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isLazy'] && this.isLazy && changes['isLazy'].firstChange) {
      this.loadNextPage();
    }

    if (changes['items'] || changes['cols'] || changes['colsBreakpoints']) {
      this.rebuildNaiveColumns();
      this.scheduleRelayout();
    }
  }

  ngAfterViewInit(): void {
    this.rebuildNaiveColumns();
    this.scheduleRelayout();

    if (!this.isBrowser || !this.isLazy || typeof IntersectionObserver === 'undefined') {
      return;
    }

    this.observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        this.loadNextPage();
      }
    });

    if (this.sentinelRef) {
      this.observer.observe(this.sentinelRef.nativeElement);
    }
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
    clearTimeout(this.resizeTimer);
  }

  trackByFn = (index: number, entry: SicMasonryEntry<T>): unknown => {
    return this.trackBy ? this.trackBy(index, entry.item) : entry.item;
  };

  handleItemClick(entry: SicMasonryEntry<T>): void {
    this.itemClick.emit(entry.item);
  }

  /** Left-to-right round-robin guess, used until real card heights are measured (and as the permanent layout if measurement isn't available, e.g. during SSR). */
  private rebuildNaiveColumns(): void {
    const cols = this.effectiveCols;
    this.lastRenderedCols = cols;
    const buckets: SicMasonryEntry<T>[][] = Array.from({ length: cols }, () => []);
    this.dataset.forEach((item, index) => {
      buckets[index % cols].push({ item, index });
    });
    this.columns = buckets;
  }

  private scheduleRelayout(): void {
    if (!this.isBrowser || typeof requestAnimationFrame === 'undefined') {
      return;
    }

    requestAnimationFrame(() => this.relayoutFromMeasuredHeights());
  }

  /** Re-buckets items using the real rendered height of each card (see computeMasonryColumns). No-ops if nothing has a measurable height yet (e.g. still hidden/off-screen). */
  private relayoutFromMeasuredHeights(): void {
    if (!this.itemEls?.length || !this.dataset.length) {
      return;
    }

    const heights = new Array<number>(this.dataset.length).fill(0);
    this.itemEls.forEach((el) => {
      const indexAttr = el.nativeElement.getAttribute('data-index');
      if (indexAttr !== null) {
        heights[Number(indexAttr)] = el.nativeElement.offsetHeight;
      }
    });

    if (heights.every((h) => h === 0)) {
      return;
    }

    const cols = this.lastRenderedCols || this.effectiveCols;
    const assignment = computeMasonryColumns(heights, cols);
    const buckets: SicMasonryEntry<T>[][] = Array.from({ length: cols }, () => []);
    this.dataset.forEach((item, index) => {
      buckets[assignment[index]].push({ item, index });
    });
    this.columns = buckets;
    this.cdr.markForCheck();
  }

  private loadNextPage(): void {
    if (!this.isLazy || this.loadingMore || !this.hasMore) {
      return;
    }

    this.loadingMore = true;
    this.cdr.markForCheck();
    this.loadMore.emit({
      pageNo: this.pageNo,
      pageSize: this.pageSize,
      items: {
        update: (items: T[]) => this.applyLoadedItems(items),
      },
    });
  }

  private applyLoadedItems(items: T[]): void {
    this.loadedItems = this.pageNo === 1 ? items : [...this.loadedItems, ...items];
    this.hasMore = items.length >= this.pageSize;
    this.loadingMore = false;
    this.pageNo += 1;
    this.rebuildNaiveColumns();
    this.scheduleRelayout();
    this.cdr.markForCheck();
  }
}
