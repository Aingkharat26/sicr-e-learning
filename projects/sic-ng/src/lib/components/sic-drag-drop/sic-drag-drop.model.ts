export interface SicDragDropList<T = unknown> {
  /** Unique across every list rendered on the page — used as the underlying `cdkDropList` id so items can be dropped between lists. */
  id: string;
  title?: string;
  items: T[];
}

/** Template context handed to a custom `<ng-template #itemTemplate let-item let-index="index" let-listId="listId">` card. */
export interface SicDragDropItemContext<T> {
  $implicit: T;
  index: number;
  listId: string;
}

/** Template context handed to a custom `<ng-template #columnHeaderTemplate let-list>` column header. */
export interface SicDragDropColumnHeaderContext<T> {
  $implicit: SicDragDropList<T>;
}

export interface SicDragDropMoveEvent<T = unknown> {
  item: T;
  previousListId: string;
  previousIndex: number;
  currentListId: string;
  currentIndex: number;
}
