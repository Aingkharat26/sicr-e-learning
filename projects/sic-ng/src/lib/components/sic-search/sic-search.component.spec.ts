import { ApplicationRef, Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SIC_CONFIG } from '../../config/sic-config';
import { SicSearchComponent } from './sic-search.component';

interface Fruit {
  id: number;
  name: string;
}

const fruits: Fruit[] = [
  { id: 1, name: 'Apple' },
  { id: 2, name: 'Banana' },
  { id: 3, name: 'Cherry' },
];

describe('SicSearchComponent', () => {
  let fixture: ComponentFixture<SicSearchComponent<Fruit>>;
  let component: SicSearchComponent<Fruit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [SicSearchComponent] }).compileComponents();
    fixture = TestBed.createComponent(SicSearchComponent) as ComponentFixture<SicSearchComponent<Fruit>>;
    component = fixture.componentInstance;
    fixture.componentRef.setInput('items', fruits);
    fixture.componentRef.setInput('optionLabel', 'name');
    fixture.detectChanges();
  });

  afterEach(() => {
    document.querySelectorAll('.cdk-overlay-container').forEach((el) => el.remove());
  });

  function tick(): void {
    TestBed.inject(ApplicationRef).tick();
  }

  function panel(): HTMLElement {
    tick();
    return document.querySelector('.cdk-overlay-pane')!;
  }

  it('renders nothing in the overlay container until opened', () => {
    expect(document.querySelector('.cdk-overlay-pane')).toBeNull();
  });

  it('opens an overlay with an input and every item listed, closing again when open becomes false', () => {
    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();

    const items = panel().querySelectorAll('.sic-search__item');
    expect(items.length).toBe(3);
    expect(panel().querySelector('.sic-search__input')).toBeTruthy();

    fixture.componentRef.setInput('open', false);
    fixture.detectChanges();

    expect(document.querySelector('.cdk-overlay-pane')).toBeNull();
  });

  it('tags the overlay pane so the panel gets centered inside it instead of shoved to the left edge', () => {
    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();

    expect(panel().classList.contains('sic-search-overlay-pane')).toBe(true);
  });

  it('applies [minWidth] as a min-width style on the panel', () => {
    fixture.componentRef.setInput('minWidth', '24rem');
    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();

    const panelEl: HTMLElement = panel().querySelector('.sic-search__panel')!;
    expect(panelEl.style.minWidth).toBe('24rem');
  });

  it('filters items by the typed query (case-insensitive substring)', () => {
    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();

    const input: HTMLInputElement = panel().querySelector('.sic-search__input')!;
    input.value = 'an';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const items = panel().querySelectorAll('.sic-search__item');
    expect(items.length).toBe(1);
    expect(items[0].textContent).toContain('Banana');
  });

  it('shows the empty state when nothing matches', () => {
    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();

    const input: HTMLInputElement = panel().querySelector('.sic-search__input')!;
    input.value = 'zzz';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(panel().querySelector('.sic-search__empty')?.textContent).toBe('No results');
  });

  it('emits itemSelect and openChange(false) and closes on click by default', () => {
    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();

    const selectSpy = vi.fn();
    const openChangeSpy = vi.fn();
    component.itemSelect.subscribe(selectSpy);
    component.openChange.subscribe(openChangeSpy);

    (panel().querySelectorAll('.sic-search__item')[1] as HTMLElement).click();
    fixture.detectChanges();

    expect(selectSpy).toHaveBeenCalledWith(fruits[1]);
    expect(openChangeSpy).toHaveBeenCalledWith(false);
    expect(document.querySelector('.cdk-overlay-pane')).toBeNull();
  });

  it('stays open after selection when closeOnSelect is false', () => {
    fixture.componentRef.setInput('closeOnSelect', false);
    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();

    const selectSpy = vi.fn();
    component.itemSelect.subscribe(selectSpy);

    (panel().querySelectorAll('.sic-search__item')[0] as HTMLElement).click();
    fixture.detectChanges();

    expect(selectSpy).toHaveBeenCalledWith(fruits[0]);
    expect(document.querySelector('.cdk-overlay-pane')).toBeTruthy();
  });

  it('closes and emits openChange(false) on backdrop click', () => {
    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();
    panel();

    const openChangeSpy = vi.fn();
    component.openChange.subscribe(openChangeSpy);

    const backdrop: HTMLElement = document.querySelector('.cdk-overlay-backdrop')!;
    backdrop.click();
    fixture.detectChanges();

    expect(openChangeSpy).toHaveBeenCalledWith(false);
    expect(document.querySelector('.cdk-overlay-pane')).toBeNull();
  });

  it('closes on Escape via the overlay keydown stream', () => {
    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();
    panel();

    const openChangeSpy = vi.fn();
    component.openChange.subscribe(openChangeSpy);

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    fixture.detectChanges();

    expect(openChangeSpy).toHaveBeenCalledWith(false);
    expect(document.querySelector('.cdk-overlay-pane')).toBeNull();
  });

  describe('keyboard navigation', () => {
    it('ArrowDown/ArrowUp move the active item and Enter selects it', () => {
      fixture.componentRef.setInput('open', true);
      fixture.detectChanges();

      const selectSpy = vi.fn();
      component.itemSelect.subscribe(selectSpy);

      const input: HTMLInputElement = panel().querySelector('.sic-search__input')!;
      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
      fixture.detectChanges();
      expect(panel().querySelectorAll('.sic-search__item')[1].classList).toContain('sic-search__item--active');

      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
      fixture.detectChanges();

      expect(selectSpy).toHaveBeenCalledWith(fruits[1]);
    });
  });
});

describe('SicSearchComponent SIC_CONFIG defaults', () => {
  afterEach(() => {
    document.querySelectorAll('.cdk-overlay-container').forEach((el) => el.remove());
  });

  it('uses SIC_CONFIG.messages.noResults for the empty state', async () => {
    await TestBed.configureTestingModule({
      imports: [SicSearchComponent],
      providers: [{ provide: SIC_CONFIG, useValue: { messages: { noResults: 'ไม่พบข้อมูล' } } }],
    }).compileComponents();
    const cfgFixture = TestBed.createComponent(SicSearchComponent) as ComponentFixture<SicSearchComponent<Fruit>>;
    cfgFixture.componentRef.setInput('items', []);
    cfgFixture.componentRef.setInput('open', true);
    cfgFixture.detectChanges();
    TestBed.inject(ApplicationRef).tick();

    const pane: HTMLElement = document.querySelector('.cdk-overlay-pane')!;
    expect(pane.querySelector('.sic-search__empty')?.textContent).toBe('ไม่พบข้อมูล');
  });
});

describe('SicSearchComponent custom item template', () => {
  @Component({
    standalone: true,
    imports: [SicSearchComponent],
    template: `
      <sic-search [open]="true" [items]="items">
        <ng-template #itemTemplate let-item let-active="active">
          <span class="custom-row" [class.custom-row--active]="active">{{ item.name }} 🍉</span>
        </ng-template>
      </sic-search>
    `,
  })
  class TemplateHostComponent {
    items = fruits;
  }

  afterEach(() => {
    document.querySelectorAll('.cdk-overlay-container').forEach((el) => el.remove());
  });

  it('renders the projected #itemTemplate for each result instead of the default label', () => {
    TestBed.configureTestingModule({ imports: [TemplateHostComponent] });
    const fixture = TestBed.createComponent(TemplateHostComponent);
    fixture.detectChanges();
    TestBed.inject(ApplicationRef).tick();

    const rows = document.querySelectorAll('.custom-row');
    expect(rows.length).toBe(3);
    expect(rows[0].textContent).toContain('Apple 🍉');
  });
});
