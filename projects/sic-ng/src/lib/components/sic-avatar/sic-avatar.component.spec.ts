import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SicAvatarComponent, SicAvatarItem } from './sic-avatar.component';

describe('SicAvatarComponent', () => {
  let fixture: ComponentFixture<SicAvatarComponent>;
  let component: SicAvatarComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SicAvatarComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SicAvatarComponent);
    component = fixture.componentInstance;
  });

  function stackItems(): NodeListOf<HTMLElement> {
    return fixture.nativeElement.querySelectorAll('.sic-avatar-stack__item');
  }

  it('shows initials by default and emits avatarClick on click in single mode', () => {
    component.name = 'Ada Lovelace';
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.sic-avatar__initials').textContent).toBe('AL');

    const spy = vi.fn();
    component.avatarClick.subscribe(spy);
    (fixture.nativeElement as HTMLElement).click();

    expect(spy).toHaveBeenCalled();
  });

  it('renders one overlapping stack item per entry in [items], left to right by z-index', () => {
    component.items = [{ name: 'Ada Lovelace' }, { name: 'Grace Hopper' }, { name: 'Alan Turing' }];
    fixture.detectChanges();

    const els = stackItems();
    expect(els.length).toBe(3);
    expect(els[0].style.zIndex).toBe('1');
    expect(els[1].style.zIndex).toBe('2');
    expect(els[2].style.zIndex).toBe('3');
    expect(els[0].textContent).toContain('AL');
    expect(els[1].textContent).toContain('GH');
  });

  it('emits itemClick with the item and index when a stack item is clicked, and does not also emit avatarClick', () => {
    const items: SicAvatarItem[] = [{ name: 'Ada Lovelace' }, { name: 'Grace Hopper' }];
    component.items = items;
    fixture.detectChanges();

    const itemSpy = vi.fn();
    const avatarSpy = vi.fn();
    component.itemClick.subscribe(itemSpy);
    component.avatarClick.subscribe(avatarSpy);

    stackItems()[1].dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(itemSpy).toHaveBeenCalledWith({ item: items[1], index: 1 });
    expect(avatarSpy).not.toHaveBeenCalled();
  });

  it('falls back to initials for one item after its image errors, without affecting the others', () => {
    component.items = [{ name: 'Ada Lovelace', src: 'https://example.com/broken.jpg' }, { name: 'Grace Hopper' }];
    fixture.detectChanges();

    const img: HTMLImageElement = fixture.nativeElement.querySelector('.sic-avatar-stack__item img');
    img.dispatchEvent(new Event('error'));
    fixture.detectChanges();

    const els = stackItems();
    expect(els[0].querySelector('img')).toBeNull();
    expect(els[0].textContent).toContain('AL');
  });
});
