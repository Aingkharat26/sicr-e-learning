import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SicFlexComponent } from './sic-flex.component';

describe('SicFlexComponent', () => {
  let fixture: ComponentFixture<SicFlexComponent>;
  let component: SicFlexComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [SicFlexComponent] }).compileComponents();
    fixture = TestBed.createComponent(SicFlexComponent);
    component = fixture.componentInstance;
  });

  it('sets display:flex and the direction/wrap/gap inline styles', () => {
    component.direction = 'column';
    component.wrap = 'wrap';
    component.gap = '1rem';
    fixture.detectChanges();

    const host: HTMLElement = fixture.nativeElement;
    expect(host.style.display).toBe('flex');
    expect(host.style.flexDirection).toBe('column');
    expect(host.style.flexWrap).toBe('wrap');
    expect(host.style.gap).toBe('1rem');
  });

  it('maps its own shorthand align/justify keywords to the right CSS values', () => {
    component.align = 'start';
    component.justify = 'between';
    fixture.detectChanges();

    const host: HTMLElement = fixture.nativeElement;
    expect(host.style.alignItems).toBe('flex-start');
    expect(host.style.justifyContent).toBe('space-between');
  });

  it('also accepts the raw CSS keywords directly, instead of silently dropping the style when they do not match the shorthand map', () => {
    component.align = 'flex-start';
    component.justify = 'space-between';
    fixture.detectChanges();

    const host: HTMLElement = fixture.nativeElement;
    expect(host.style.alignItems).toBe('flex-start');
    expect(host.style.justifyContent).toBe('space-between');
  });
});
