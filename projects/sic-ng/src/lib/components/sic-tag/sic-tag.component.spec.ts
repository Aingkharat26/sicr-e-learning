import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SicTagComponent, SicTagItem } from './sic-tag.component';

describe('SicTagComponent', () => {
  let fixture: ComponentFixture<SicTagComponent>;
  let component: SicTagComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SicTagComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SicTagComponent);
    component = fixture.componentInstance;
  });

  function pills(): NodeListOf<HTMLElement> {
    return fixture.nativeElement.querySelectorAll('.sic-tag__pill');
  }

  it('renders one pill per item in [items], with each item color', () => {
    component.items = [
      { text: 'Angular', color: 'danger' },
      { text: 'TypeScript', color: 'primary' },
    ];
    fixture.detectChanges();

    const els = pills();
    expect(els.length).toBe(2);
    expect(els[0].classList).toContain('sic-tag__pill--danger');
    expect(els[0].textContent).toContain('Angular');
    expect(els[1].classList).toContain('sic-tag__pill--primary');
    expect(els[1].textContent).toContain('TypeScript');
  });

  it('defaults an item without a color to neutral', () => {
    component.items = [{ text: 'No color' }];
    fixture.detectChanges();

    expect(pills()[0].classList).toContain('sic-tag__pill--neutral');
  });

  it('shows a close button per item when closable, and emits itemClosed with the item and index', () => {
    const items: SicTagItem[] = [{ text: 'A' }, { text: 'B' }];
    component.items = items;
    component.closable = true;
    fixture.detectChanges();

    const spy = vi.fn();
    component.itemClosed.subscribe(spy);

    const closeButtons: NodeListOf<HTMLButtonElement> = fixture.nativeElement.querySelectorAll('.sic-tag__close');
    expect(closeButtons.length).toBe(2);

    closeButtons[1].click();

    expect(spy).toHaveBeenCalledWith({ item: items[1], index: 1 });
  });

  it('lets a single item override closable to false even when the component default is true', () => {
    component.items = [{ text: 'A', closable: false }];
    component.closable = true;
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.sic-tag__close')).toBeNull();
  });

  it('falls back to single-tag content-projection mode when items is not set', () => {
    component.color = 'primary';
    component.closable = true;
    fixture.detectChanges();

    expect(pills().length).toBe(0);
    expect(fixture.nativeElement.querySelector('.sic-tag__close')).toBeTruthy();
    expect(fixture.nativeElement.classList).toContain('sic-tag--primary');
  });
});
