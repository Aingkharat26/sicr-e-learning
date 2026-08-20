import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SicCardStackComponent } from './sic-card-stack.component';
import { SicCardStackItem } from './sic-card-stack.model';

const items: SicCardStackItem[] = [
  { id: 'a', title: 'Coastal path', description: 'Salt air along the chalk cliffs.', location: 'West shore', label: '01', meta: '6 min read' },
  { id: 'b', title: 'Desert wind', description: 'Wide skies over red sand.', location: 'Painted flats', label: '02', meta: '4 min read' },
  { id: 'c', title: 'Mountain rest', description: 'Cool air above the tree line.', location: 'North ridge', label: '03', meta: '8 min read' },
];

describe('SicCardStackComponent', () => {
  let fixture: ComponentFixture<SicCardStackComponent>;
  let component: SicCardStackComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [SicCardStackComponent] }).compileComponents();
    fixture = TestBed.createComponent(SicCardStackComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('items', items);
    fixture.detectChanges();
  });

  function cards(): HTMLElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll('.sic-card-stack__card'));
  }

  it('renders one card per item, front-most (position 0) first by default', () => {
    const els = cards();
    expect(els.length).toBe(3);
    expect(els[0].style.getPropertyValue('--sic-card-stack-pos')).toBe('0');
    expect(els[1].style.getPropertyValue('--sic-card-stack-pos')).toBe('1');
    expect(els[2].style.getPropertyValue('--sic-card-stack-pos')).toBe('2');
  });

  it('gives the front-most card the highest z-index', () => {
    const els = cards();
    expect(els[0].style.zIndex).toBe('3');
    expect(els[1].style.zIndex).toBe('2');
    expect(els[2].style.zIndex).toBe('1');
  });

  it('renders the default card content (title/description/location/label/meta)', () => {
    const first = cards()[0];
    expect(first.querySelector('.sic-card-stack__title')?.textContent).toBe('Coastal path');
    expect(first.querySelector('.sic-card-stack__description')?.textContent).toBe('Salt air along the chalk cliffs.');
    expect(first.querySelector('.sic-card-stack__location')?.textContent).toContain('West shore');
    expect(first.querySelector('.sic-card-stack__label')?.textContent).toBe('01');
    expect(first.querySelector('.sic-card-stack__meta')?.textContent).toBe('6 min read');
  });

  it('is not expanded until hovered, and collapses again on mouseleave', () => {
    const root = fixture.nativeElement.querySelector('.sic-card-stack');
    expect(root.classList).not.toContain('sic-card-stack--expanded');

    fixture.nativeElement.dispatchEvent(new MouseEvent('mouseenter'));
    fixture.detectChanges();
    expect(root.classList).toContain('sic-card-stack--expanded');

    fixture.nativeElement.dispatchEvent(new MouseEvent('mouseleave'));
    fixture.detectChanges();
    expect(root.classList).not.toContain('sic-card-stack--expanded');
  });

  it('forces the expanded state via [expanded], ignoring hover', () => {
    fixture.componentRef.setInput('expanded', true);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.sic-card-stack').classList).toContain('sic-card-stack--expanded');
  });

  it('clicking a back card brings it to front, emits activeIndexChange, and reorders positions', () => {
    const spy = vi.fn();
    component.activeIndexChange.subscribe(spy);

    cards()[2].click(); // click item index 2 ("c"), currently at back
    fixture.detectChanges();

    expect(spy).toHaveBeenCalledWith(2);

    const els = cards();
    // DOM order is unchanged (tracked by id) — only each card's --sic-card-stack-pos moves.
    expect(els[2].style.getPropertyValue('--sic-card-stack-pos')).toBe('0');
    expect(els[2].style.zIndex).toBe('3');
    expect(els[0].style.getPropertyValue('--sic-card-stack-pos')).toBe('1');
    expect(els[1].style.getPropertyValue('--sic-card-stack-pos')).toBe('2');
  });

  it('clicking the already-front card emits cardClick but not activeIndexChange', () => {
    const cardSpy = vi.fn();
    const activeSpy = vi.fn();
    component.cardClick.subscribe(cardSpy);
    component.activeIndexChange.subscribe(activeSpy);

    cards()[0].click();
    fixture.detectChanges();

    expect(cardSpy).toHaveBeenCalledWith({ item: items[0], index: 0 });
    expect(activeSpy).not.toHaveBeenCalled();
  });

  it('shows the empty state when items is empty', () => {
    fixture.componentRef.setInput('items', []);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.sic-card-stack__empty')?.textContent).toBe('No items');
  });
});

describe('SicCardStackComponent custom template', () => {
  @Component({
    standalone: true,
    imports: [SicCardStackComponent],
    template: `
      <sic-card-stack [items]="items">
        <ng-template #cardTemplate let-item let-index="index" let-position="position">
          <span class="custom-card">{{ item.title }} #{{ index }} @{{ position }}</span>
        </ng-template>
      </sic-card-stack>
    `,
  })
  class TemplateHostComponent {
    items: SicCardStackItem[] = [{ id: 1, title: 'One' }, { id: 2, title: 'Two' }];
  }

  it('renders the projected #cardTemplate instead of the default card markup', () => {
    TestBed.configureTestingModule({ imports: [TemplateHostComponent] });
    const fixture = TestBed.createComponent(TemplateHostComponent);
    fixture.detectChanges();

    const custom = fixture.nativeElement.querySelectorAll('.custom-card');
    expect(custom.length).toBe(2);
    expect(custom[0].textContent).toBe('One #0 @0');
    expect(custom[1].textContent).toBe('Two #1 @1');
    expect(fixture.nativeElement.querySelector('.sic-card-stack__title')).toBeNull();
  });
});
