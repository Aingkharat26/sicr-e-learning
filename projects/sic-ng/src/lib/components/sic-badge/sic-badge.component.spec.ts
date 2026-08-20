import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SicBadgeComponent } from './sic-badge.component';

describe('SicBadgeComponent', () => {
  let fixture: ComponentFixture<SicBadgeComponent>;
  let component: SicBadgeComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SicBadgeComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SicBadgeComponent);
    component = fixture.componentInstance;
  });

  function badgeEl(): HTMLElement | null {
    return fixture.nativeElement.querySelector('.sic-badge__count, .sic-badge__dot');
  }

  it('defaults to the top-right position', () => {
    component.count = 3;
    fixture.detectChanges();

    expect(badgeEl()!.classList).toContain('sic-badge__count--top-right');
  });

  it('applies the requested position class for a count badge', () => {
    component.count = 3;
    component.position = 'bottom-left';
    fixture.detectChanges();

    const el = badgeEl()!;
    expect(el.classList).toContain('sic-badge__count--bottom-left');
    expect(el.classList).not.toContain('sic-badge__count--top-right');
  });

  it('applies the requested position class for a dot badge', () => {
    component.dot = true;
    component.position = 'top-left';
    fixture.detectChanges();

    const el = badgeEl()!;
    expect(el.classList).toContain('sic-badge__dot--top-left');
  });
});
