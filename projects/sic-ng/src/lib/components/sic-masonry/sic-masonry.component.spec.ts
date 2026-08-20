import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SIC_CONFIG } from '../../config/sic-config';
import { SicMasonryComponent, SicMasonryLoadEvent } from './sic-masonry.component';

interface Card {
  id: number;
  title: string;
}

const cards: Card[] = [
  { id: 1, title: 'One' },
  { id: 2, title: 'Two' },
  { id: 3, title: 'Three' },
];

class FakeIntersectionObserver implements IntersectionObserver {
  static instances: FakeIntersectionObserver[] = [];
  readonly root = null;
  readonly rootMargin = '';
  readonly scrollMargin = '';
  readonly thresholds: ReadonlyArray<number> = [];
  observedElements: Element[] = [];

  constructor(private readonly callback: IntersectionObserverCallback) {
    FakeIntersectionObserver.instances.push(this);
  }

  observe(target: Element): void {
    this.observedElements.push(target);
  }

  unobserve(): void {}

  disconnect(): void {}

  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }

  trigger(isIntersecting: boolean): void {
    this.callback([{ isIntersecting } as IntersectionObserverEntry], this);
  }
}

describe('SicMasonryComponent', () => {
  let fixture: ComponentFixture<SicMasonryComponent<Card>>;
  let component: SicMasonryComponent<Card>;
  let originalIntersectionObserver: typeof IntersectionObserver;

  beforeEach(async () => {
    originalIntersectionObserver = (globalThis as any).IntersectionObserver;
    (globalThis as any).IntersectionObserver = FakeIntersectionObserver;
    FakeIntersectionObserver.instances = [];

    await TestBed.configureTestingModule({ imports: [SicMasonryComponent] }).compileComponents();
    fixture = TestBed.createComponent(SicMasonryComponent) as ComponentFixture<SicMasonryComponent<Card>>;
    component = fixture.componentInstance;
  });

  afterEach(() => {
    (globalThis as any).IntersectionObserver = originalIntersectionObserver;
  });

  function items(): HTMLElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll('.sic-masonry__item'));
  }

  function columns(): HTMLElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll('.sic-masonry__column'));
  }

  it('renders every item using the default fallback rendering', () => {
    fixture.componentRef.setInput('items', cards);
    fixture.detectChanges();

    expect(items().length).toBe(3);
    expect(fixture.nativeElement.querySelectorAll('.sic-masonry__fallback').length).toBe(3);
  });

  it('shows the empty state when items is empty', () => {
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.sic-masonry__empty')?.textContent).toBe('No items');
  });

  it('exposes cols/gap/breakpoints as CSS custom properties on the host', () => {
    fixture.componentRef.setInput('cols', 4);
    fixture.componentRef.setInput('gap', '2rem');
    fixture.componentRef.setInput('colsBreakpoints', { sm: 1, md: 2, lg: 4 });
    fixture.detectChanges();

    const style = fixture.nativeElement.style;
    expect(style.getPropertyValue('--sic-masonry-cols')).toBe('4');
    expect(style.getPropertyValue('--sic-masonry-gap')).toBe('2rem');
    expect(style.getPropertyValue('--sic-masonry-cols-sm')).toBe('1');
    expect(style.getPropertyValue('--sic-masonry-cols-md')).toBe('2');
    expect(style.getPropertyValue('--sic-masonry-cols-lg')).toBe('4');
    expect(fixture.nativeElement.classList).toContain('sic-masonry--responsive');
  });

  describe('column layout', () => {
    function dataIndexesOf(column: HTMLElement): string[] {
      return Array.from(column.querySelectorAll('.sic-masonry__item')).map((el) => el.getAttribute('data-index')!);
    }

    it('distributes items left-to-right, one column at a time, before real heights are measured', () => {
      fixture.componentRef.setInput('cols', 3);
      fixture.componentRef.setInput('items', [...cards, { id: 4, title: 'Four' }, { id: 5, title: 'Five' }]);
      fixture.detectChanges();

      const cols = columns();
      expect(cols.length).toBe(3);
      // round-robin: item0->col0, item1->col1, item2->col2, item3->col0, item4->col1
      expect(dataIndexesOf(cols[0])).toEqual(['0', '3']);
      expect(dataIndexesOf(cols[1])).toEqual(['1', '4']);
      expect(dataIndexesOf(cols[2])).toEqual(['2']);
    });

    it('rebuilds into the new column count when cols changes', () => {
      fixture.componentRef.setInput('cols', 3);
      fixture.componentRef.setInput('items', cards);
      fixture.detectChanges();
      expect(columns().length).toBe(3);

      fixture.componentRef.setInput('cols', 2);
      fixture.detectChanges();
      expect(columns().length).toBe(2);
    });
  });

  it('emits itemClick with the clicked item', () => {
    fixture.componentRef.setInput('items', cards);
    fixture.detectChanges();

    const spy = vi.fn();
    component.itemClick.subscribe(spy);

    items()[1].click();

    expect(spy).toHaveBeenCalledWith(cards[1]);
  });

  describe('lazy loading', () => {
    it('requests the first page automatically on init and appends items via the update callback', () => {
      const loadSpy = vi.fn();
      component.loadMore.subscribe(loadSpy);
      fixture.componentRef.setInput('isLazy', true);
      fixture.componentRef.setInput('pageSize', 2);
      fixture.detectChanges();

      expect(loadSpy).toHaveBeenCalledWith(expect.objectContaining({ pageNo: 1, pageSize: 2 }));
      const event: SicMasonryLoadEvent<Card> = loadSpy.mock.calls[0][0];
      event.items.update([cards[0], cards[1]]);
      fixture.detectChanges();

      expect(items().length).toBe(2);
      expect(component.loadingMore).toBe(false);
      expect(component.hasMore).toBe(true);
    });

    it('loads the next page when the sentinel intersects, and stops once a short page signals the end', () => {
      const loadSpy = vi.fn();
      component.loadMore.subscribe(loadSpy);
      fixture.componentRef.setInput('isLazy', true);
      fixture.componentRef.setInput('pageSize', 2);
      fixture.detectChanges();

      (loadSpy.mock.calls[0][0] as SicMasonryLoadEvent<Card>).items.update([cards[0], cards[1]]);
      fixture.detectChanges();

      const observer = FakeIntersectionObserver.instances[0];
      observer.trigger(true);

      expect(loadSpy).toHaveBeenCalledWith(expect.objectContaining({ pageNo: 2, pageSize: 2 }));
      (loadSpy.mock.calls[1][0] as SicMasonryLoadEvent<Card>).items.update([cards[2]]);
      fixture.detectChanges();

      expect(items().length).toBe(3);
      expect(component.hasMore).toBe(false);

      observer.trigger(true);
      expect(loadSpy).toHaveBeenCalledTimes(2);
    });

    it('ignores intersection while a page is already loading', () => {
      const loadSpy = vi.fn();
      component.loadMore.subscribe(loadSpy);
      fixture.componentRef.setInput('isLazy', true);
      fixture.detectChanges();

      const observer = FakeIntersectionObserver.instances[0];
      observer.trigger(true);
      observer.trigger(true);

      expect(loadSpy).toHaveBeenCalledTimes(1);
    });
  });

});

describe('SicMasonryComponent custom item template', () => {
  @Component({
    standalone: true,
    imports: [SicMasonryComponent],
    template: `
      <sic-masonry [items]="cards">
        <ng-template #itemTemplate let-item let-index="index">
          <span class="custom-card">{{ index }}: {{ item.title }}</span>
        </ng-template>
      </sic-masonry>
    `,
  })
  class TemplateHostComponent {
    cards = cards;
  }

  it('renders the projected #itemTemplate for each item instead of the default fallback', async () => {
    await TestBed.configureTestingModule({ imports: [TemplateHostComponent] }).compileComponents();
    const hostFixture = TestBed.createComponent(TemplateHostComponent);
    hostFixture.detectChanges();

    const rows = hostFixture.nativeElement.querySelectorAll('.custom-card');
    expect(rows.length).toBe(3);
    expect(rows[0].textContent).toBe('0: One');
    expect(hostFixture.nativeElement.querySelector('.sic-masonry__fallback')).toBeNull();
  });
});

describe('SicMasonryComponent SIC_CONFIG defaults', () => {
  it('uses SIC_CONFIG.messages.noItems and .masonryLoading', async () => {
    await TestBed.configureTestingModule({
      imports: [SicMasonryComponent],
      providers: [
        { provide: SIC_CONFIG, useValue: { messages: { noItems: 'ไม่มีรายการ', masonryLoading: 'กำลังโหลดเพิ่ม...' } } },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(SicMasonryComponent) as ComponentFixture<SicMasonryComponent<Card>>;
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.sic-masonry__empty')?.textContent).toBe('ไม่มีรายการ');

    // Enabling isLazy auto-fires the first loadMore; with no subscriber to resolve it,
    // loadingMore stays true synchronously, so the loading indicator should already render.
    fixture.componentRef.setInput('isLazy', true);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.sic-masonry__loading')?.textContent).toBe('กำลังโหลดเพิ่ม...');
  });
});
