import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SicToastComponent } from './sic-toast.component';
import { SicToastService } from './sic-toast.service';

describe('SicToastComponent', () => {
  let fixture: ComponentFixture<SicToastComponent>;
  let service: SicToastService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SicToastComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SicToastComponent);
    service = TestBed.inject(SicToastService);
    service.clear();
    fixture.detectChanges();
  });

  function items(): NodeListOf<HTMLElement> {
    return fixture.nativeElement.querySelectorAll('.sic-toast__item');
  }

  it('shows the built-in icon implied by type when no icon override is given', () => {
    service.show('Saved', 'success', 0);
    fixture.detectChanges();

    const icon = items()[0].querySelector('.sic-toast__icon--success svg');
    expect(icon).toBeTruthy();
  });

  it('renders no icon for the neutral type by default', () => {
    service.show({ message: 'Reading an article', type: 'neutral', duration: 0 });
    fixture.detectChanges();

    expect(items()[0].querySelector('.sic-toast__icon')).toBeNull();
  });

  it('renders a title above the message when title is given', () => {
    service.show({ title: 'Your complaint has been received', message: 'You will be notified', type: 'success', duration: 0 });
    fixture.detectChanges();

    const item = items()[0];
    expect(item.querySelector('.sic-toast__title')?.textContent).toContain('Your complaint has been received');
    expect(item.querySelector('.sic-toast__message')?.textContent).toContain('You will be notified');
  });

  it('renders a custom emoji/text icon instead of the built-in one when icon overrides it', () => {
    service.show({ message: 'Nice', type: 'success', icon: '🎉', duration: 0 });
    fixture.detectChanges();

    const icon = items()[0].querySelector('.sic-toast__icon');
    expect(icon?.querySelector('svg')).toBeNull();
    expect(icon?.textContent).toContain('🎉');
  });

  it('hides the icon entirely when icon is explicitly false', () => {
    service.show({ message: 'Quiet', type: 'success', icon: false, duration: 0 });
    fixture.detectChanges();

    expect(items()[0].querySelector('.sic-toast__icon')).toBeNull();
  });

  it('renders a right-aligned badge, e.g. a reward amount', () => {
    service.show({ message: 'Reading an article', type: 'neutral', badge: { text: '+500' }, duration: 0 });
    fixture.detectChanges();

    expect(items()[0].querySelector('.sic-toast__badge')?.textContent).toContain('+500');
  });

  it('dismisses the toast on click', () => {
    service.show('Click me', 'info', 0);
    fixture.detectChanges();
    expect(items().length).toBe(1);

    items()[0].click();
    fixture.detectChanges();

    expect(items().length).toBe(0);
  });
});
