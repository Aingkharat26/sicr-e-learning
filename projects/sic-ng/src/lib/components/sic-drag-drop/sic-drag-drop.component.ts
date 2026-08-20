import { CommonModule } from '@angular/common';
import {
  CdkDrag,
  CdkDragDrop,
  CdkDragHandle,
  CdkDragPlaceholder,
  CdkDropList,
  CdkDropListGroup,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { ChangeDetectorRef, Component, ContentChild, EventEmitter, HostBinding, Input, Output, TemplateRef, inject } from '@angular/core';
import { injectSicConfig } from '../../config/sic-config';
import {
  SicDragDropColumnHeaderContext,
  SicDragDropItemContext,
  SicDragDropList,
  SicDragDropMoveEvent,
} from './sic-drag-drop.model';

/**
 * Reorder items within a list, or drag them between multiple lists (kanban-style) — built on
 * `@angular/cdk/drag-drop`. Pass a single-element `[lists]` (or the `[items]` shorthand) for plain
 * reordering, or several lists to allow moving cards between columns. Customize card/column-header
 * rendering via `<ng-template #itemTemplate>` / `<ng-template #columnHeaderTemplate>`.
 */
@Component({
  selector: 'sic-drag-drop',
  standalone: true,
  imports: [CommonModule, CdkDropListGroup, CdkDropList, CdkDrag, CdkDragHandle, CdkDragPlaceholder],
  templateUrl: './sic-drag-drop.component.html',
  styleUrl: './sic-drag-drop.component.css',
})
export class SicDragDropComponent<T = unknown> {
  private readonly sicConfig = injectSicConfig();
  private readonly cdr = inject(ChangeDetectorRef);

  /** Back-compat shorthand: a single unnamed reorderable list, used when `lists` isn't given. */
  @Input() items: T[] = [];
  @Input() lists: SicDragDropList<T>[] = [];
  @Input() trackBy?: (index: number, item: T) => unknown;
  /** When true, only a dedicated ⠿ handle starts a drag instead of the whole card. */
  @Input() showDragHandle = false;

  @Output() itemMoved = new EventEmitter<SicDragDropMoveEvent<T>>();

  /** `<ng-template #itemTemplate let-item let-index="index" let-listId="listId">` overrides how each card renders. */
  @ContentChild('itemTemplate') itemTemplate?: TemplateRef<SicDragDropItemContext<T>>;
  /** `<ng-template #columnHeaderTemplate let-list>` overrides the header above each list/column. */
  @ContentChild('columnHeaderTemplate') columnHeaderTemplate?: TemplateRef<SicDragDropColumnHeaderContext<T>>;

  @HostBinding('class.sic-drag-drop-host') readonly hostClass = true;

  get resolvedLists(): SicDragDropList<T>[] {
    if (this.lists.length) {
      return this.lists;
    }

    return this.items.length ? [{ id: '__sic_drag_drop_default__', items: this.items }] : [];
  }

  get emptyListText(): string {
    return this.sicConfig.messages?.dragDropEmptyList ?? 'Drop items here';
  }

  trackByFn = (index: number, item: T): unknown => {
    return this.trackBy ? this.trackBy(index, item) : item;
  };

  drop(event: CdkDragDrop<T[]>): void {
    const previousListId = event.previousContainer.id;
    const currentListId = event.container.id;

    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);
    }

    // CdkDropList emits this from its own pointer-event handling, which isn't
    // guaranteed to be picked up by this app's zoneless change detection.
    this.cdr.markForCheck();

    this.itemMoved.emit({
      item: event.container.data[event.currentIndex],
      previousListId,
      previousIndex: event.previousIndex,
      currentListId,
      currentIndex: event.currentIndex,
    });
  }
}
