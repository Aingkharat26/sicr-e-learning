import { CdkDragDrop, CdkDropList } from '@angular/cdk/drag-drop';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SIC_CONFIG } from '../../config/sic-config';
import { SicDragDropComponent } from './sic-drag-drop.component';
import { SicDragDropList, SicDragDropMoveEvent } from './sic-drag-drop.model';

interface Card {
  id: number;
  title: string;
}

function makeDropEvent<T>(
  previousContainer: { id: string; data: T[] },
  container: { id: string; data: T[] },
  previousIndex: number,
  currentIndex: number,
): CdkDragDrop<T[]> {
  return {
    previousContainer: previousContainer as unknown as CdkDropList<T[]>,
    container: container as unknown as CdkDropList<T[]>,
    previousIndex,
    currentIndex,
    item: {} as any,
    isPointerOverContainer: true,
    distance: { x: 0, y: 0 },
    dropPoint: { x: 0, y: 0 },
    event: new MouseEvent('mouseup'),
  };
}

describe('SicDragDropComponent', () => {
  let fixture: ComponentFixture<SicDragDropComponent<Card>>;
  let component: SicDragDropComponent<Card>;

  const todoCards: Card[] = [
    { id: 1, title: 'Write spec' },
    { id: 2, title: 'Build component' },
  ];
  const doneCards: Card[] = [{ id: 3, title: 'Research CDK' }];

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [SicDragDropComponent] }).compileComponents();
    fixture = TestBed.createComponent(SicDragDropComponent) as ComponentFixture<SicDragDropComponent<Card>>;
    component = fixture.componentInstance;
  });

  function cardsIn(listEl: Element): string[] {
    return Array.from(listEl.querySelectorAll('.sic-drag-drop__fallback')).map((el) => el.textContent?.trim() ?? '');
  }

  it('wraps `items` into a single unnamed list when `lists` is not given', () => {
    fixture.componentRef.setInput('items', todoCards);
    fixture.detectChanges();

    expect(component.resolvedLists.length).toBe(1);
    expect(component.resolvedLists[0].items).toEqual(todoCards);
    expect(fixture.nativeElement.querySelectorAll('.sic-drag-drop__list').length).toBe(1);
  });

  it('renders every list with its title and item count using the default fallback', () => {
    const lists: SicDragDropList<Card>[] = [
      { id: 'todo', title: 'Todo', items: todoCards },
      { id: 'done', title: 'Done', items: doneCards },
    ];
    fixture.componentRef.setInput('lists', lists);
    fixture.detectChanges();

    const listEls = fixture.nativeElement.querySelectorAll('.sic-drag-drop__list');
    expect(listEls.length).toBe(2);
    expect(listEls[0].querySelector('.sic-drag-drop__list-title').textContent).toBe('Todo');
    expect(cardsIn(listEls[0]).length).toBe(2);
    expect(cardsIn(listEls[1]).length).toBe(1);
  });

  it('renders plain-value items directly via the default fallback interpolation', () => {
    const stringFixture = TestBed.createComponent(SicDragDropComponent) as ComponentFixture<SicDragDropComponent<string>>;
    stringFixture.componentRef.setInput('items', ['Write spec', 'Build component']);
    stringFixture.detectChanges();

    const labels = Array.from(stringFixture.nativeElement.querySelectorAll('.sic-drag-drop__fallback')).map(
      (el: any) => el.textContent.trim(),
    );
    expect(labels).toEqual(['Write spec', 'Build component']);
  });

  it('shows the empty-list placeholder for a list with no items', () => {
    fixture.componentRef.setInput('lists', [{ id: 'empty', items: [] }] as SicDragDropList<Card>[]);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.sic-drag-drop__empty')?.textContent).toBe('Drop items here');
  });

  describe('drop()', () => {
    let lists: SicDragDropList<Card>[];

    beforeEach(() => {
      lists = [
        { id: 'todo', items: [...todoCards] },
        { id: 'done', items: [...doneCards] },
      ];
      fixture.componentRef.setInput('lists', lists);
      fixture.detectChanges();
    });

    it('reorders items within the same list', () => {
      const spy = vi.fn();
      component.itemMoved.subscribe(spy);
      const todoList = lists[0];

      component.drop(makeDropEvent({ id: 'todo', data: todoList.items }, { id: 'todo', data: todoList.items }, 0, 1));

      expect(todoList.items.map((c) => c.title)).toEqual(['Build component', 'Write spec']);
      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({
          previousListId: 'todo',
          currentListId: 'todo',
          previousIndex: 0,
          currentIndex: 1,
        }),
      );
    });

    it('moves an item from one list to another', () => {
      const spy = vi.fn();
      component.itemMoved.subscribe(spy);
      const [todoList, doneList] = lists;

      component.drop(makeDropEvent({ id: 'todo', data: todoList.items }, { id: 'done', data: doneList.items }, 0, 1));

      expect(todoList.items.map((c) => c.title)).toEqual(['Build component']);
      expect(doneList.items.map((c) => c.title)).toEqual(['Research CDK', 'Write spec']);

      const event: SicDragDropMoveEvent<Card> = spy.mock.calls[0][0];
      expect(event.previousListId).toBe('todo');
      expect(event.currentListId).toBe('done');
      expect(event.item.title).toBe('Write spec');
    });

    it('re-renders the DOM after a drop (markForCheck covers CDK-driven mutation)', () => {
      const [todoList, doneList] = lists;
      expect(cardsIn(fixture.nativeElement.querySelectorAll('.sic-drag-drop__list')[1]).length).toBe(1);

      component.drop(makeDropEvent({ id: 'todo', data: todoList.items }, { id: 'done', data: doneList.items }, 0, 0));
      fixture.detectChanges();

      const listEls = fixture.nativeElement.querySelectorAll('.sic-drag-drop__list');
      expect(cardsIn(listEls[1]).length).toBe(2);
      expect(doneList.items.map((c) => c.title)).toEqual(['Write spec', 'Research CDK']);
    });
  });
});

describe('SicDragDropComponent custom templates', () => {
  @Component({
    standalone: true,
    imports: [SicDragDropComponent],
    template: `
      <sic-drag-drop [lists]="lists">
        <ng-template #columnHeaderTemplate let-list>
          <h3 class="custom-header">{{ list.title }} ({{ list.items.length }})</h3>
        </ng-template>
        <ng-template #itemTemplate let-item let-index="index" let-listId="listId">
          <span class="custom-card">{{ listId }}/{{ index }}: {{ item.title }}</span>
        </ng-template>
      </sic-drag-drop>
    `,
  })
  class TemplateHostComponent {
    lists: SicDragDropList<Card>[] = [{ id: 'todo', title: 'Todo', items: [{ id: 1, title: 'Write spec' }] }];
  }

  it('renders the projected column-header and item templates instead of the defaults', async () => {
    await TestBed.configureTestingModule({ imports: [TemplateHostComponent] }).compileComponents();
    const fixture = TestBed.createComponent(TemplateHostComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.custom-header')?.textContent).toBe('Todo (1)');
    expect(fixture.nativeElement.querySelector('.custom-card')?.textContent).toBe('todo/0: Write spec');
    expect(fixture.nativeElement.querySelector('.sic-drag-drop__list-title')).toBeNull();
    expect(fixture.nativeElement.querySelector('.sic-drag-drop__fallback')).toBeNull();
  });
});

describe('SicDragDropComponent SIC_CONFIG defaults', () => {
  it('uses SIC_CONFIG.messages.dragDropEmptyList for the empty-list placeholder', async () => {
    await TestBed.configureTestingModule({
      imports: [SicDragDropComponent],
      providers: [{ provide: SIC_CONFIG, useValue: { messages: { dragDropEmptyList: 'วางรายการที่นี่' } } }],
    }).compileComponents();
    const fixture = TestBed.createComponent(SicDragDropComponent) as ComponentFixture<SicDragDropComponent<Card>>;
    fixture.componentRef.setInput('lists', [{ id: 'empty', items: [] }] as SicDragDropList<Card>[]);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.sic-drag-drop__empty')?.textContent).toBe('วางรายการที่นี่');
  });
});
