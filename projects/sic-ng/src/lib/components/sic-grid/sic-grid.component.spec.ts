import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SicGridComponent } from './sic-grid.component';

describe('SicGridComponent', () => {
  let fixture: ComponentFixture<SicGridComponent>;
  let component: SicGridComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [SicGridComponent] }).compileComponents();
    fixture = TestBed.createComponent(SicGridComponent);
    component = fixture.componentInstance;
  });

  it('sets an inline grid-template-columns from [cols] when there are no breakpoints', () => {
    component.cols = 6;
    fixture.detectChanges();

    const host: HTMLElement = fixture.nativeElement;
    expect(host.style.gridTemplateColumns).toBe('repeat(6, minmax(0, 1fr))');
    expect(host.classList.contains('sic-grid--responsive')).toBe(false);
  });

  it('leaves grid-template-columns unset inline when [colsBreakpoints] is given, so the stylesheet @media rules control it instead of a fixed inline style', () => {
    component.colsBreakpoints = { sm: 1, md: 2, lg: 4 };
    fixture.detectChanges();

    const host: HTMLElement = fixture.nativeElement;
    expect(host.style.gridTemplateColumns).toBe('');
    expect(host.classList.contains('sic-grid--responsive')).toBe(true);
    expect(host.style.getPropertyValue('--sic-grid-cols-sm')).toBe('1');
    expect(host.style.getPropertyValue('--sic-grid-cols-md')).toBe('2');
    expect(host.style.getPropertyValue('--sic-grid-cols-lg')).toBe('4');
  });
});
