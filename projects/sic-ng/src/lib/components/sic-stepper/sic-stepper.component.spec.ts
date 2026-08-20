import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SIC_CONFIG } from '../../config/sic-config';
import { SicStepperComponent } from './sic-stepper.component';
import { SicStepperStep } from './sic-stepper.model';

const steps: SicStepperStep[] = [
  { label: 'Account' },
  { label: 'Profile', optional: true },
  { label: 'Confirm' },
];

describe('SicStepperComponent', () => {
  let fixture: ComponentFixture<SicStepperComponent>;
  let component: SicStepperComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [SicStepperComponent] }).compileComponents();
    fixture = TestBed.createComponent(SicStepperComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('steps', steps);
    fixture.detectChanges();
  });

  function indicators(): HTMLButtonElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll('.sic-stepper__indicator'));
  }

  function navButtons(): HTMLElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll('.sic-stepper__nav sic-button button'));
  }

  it('renders one indicator per step, numbered, with the first active', () => {
    const items = indicators();
    expect(items.length).toBe(3);
    expect(items[0].classList).toContain('sic-stepper__indicator--active');
    expect(fixture.nativeElement.querySelector('.sic-stepper__circle').textContent.trim()).toBe('1');
  });

  it('defaults to horizontal orientation (no --vertical host class)', () => {
    expect(fixture.nativeElement.classList.contains('sic-stepper--vertical')).toBe(false);
  });

  it('adds the vertical host class when orientation="vertical"', () => {
    fixture.componentRef.setInput('orientation', 'vertical');
    fixture.detectChanges();

    expect(fixture.nativeElement.classList.contains('sic-stepper--vertical')).toBe(true);
  });

  it('Next advances activeIndex and emits activeIndexChange', () => {
    const spy = vi.fn();
    component.activeIndexChange.subscribe(spy);

    navButtons().find((btn) => btn.textContent?.trim() === 'Next')!.click();

    expect(component.activeIndex).toBe(1);
    expect(spy).toHaveBeenCalledWith(1);
  });

  it('Previous is disabled on the first step and moves back otherwise', () => {
    expect(navButtons().find((btn) => btn.textContent?.trim() === 'Previous')!.hasAttribute('disabled')).toBe(true);

    component.goTo(1);
    fixture.detectChanges();

    const spy = vi.fn();
    component.activeIndexChange.subscribe(spy);
    navButtons().find((btn) => btn.textContent?.trim() === 'Previous')!.click();

    expect(component.activeIndex).toBe(0);
    expect(spy).toHaveBeenCalledWith(0);
  });

  it('shows Skip only on an optional step, and it advances + emits skip and activeIndexChange', () => {
    expect(navButtons().some((btn) => btn.textContent?.trim() === 'Skip')).toBe(false);

    component.goTo(1);
    fixture.detectChanges();
    expect(navButtons().some((btn) => btn.textContent?.trim() === 'Skip')).toBe(true);

    const skipSpy = vi.fn();
    const changeSpy = vi.fn();
    component.skip.subscribe(skipSpy);
    component.activeIndexChange.subscribe(changeSpy);

    navButtons().find((btn) => btn.textContent?.trim() === 'Skip')!.click();

    expect(skipSpy).toHaveBeenCalledWith(1);
    expect(changeSpy).toHaveBeenCalledWith(2);
    expect(component.activeIndex).toBe(2);
  });

  it('shows Finish instead of Next on the last step, and it emits finish without changing activeIndex', () => {
    component.goTo(2);
    fixture.detectChanges();

    expect(navButtons().some((btn) => btn.textContent?.trim() === 'Next')).toBe(false);
    expect(navButtons().some((btn) => btn.textContent?.trim() === 'Finish')).toBe(true);

    const spy = vi.fn();
    component.finish.subscribe(spy);
    navButtons().find((btn) => btn.textContent?.trim() === 'Finish')!.click();

    expect(spy).toHaveBeenCalled();
    expect(component.activeIndex).toBe(2);
  });

  it('clicking a step indicator jumps directly to it', () => {
    const spy = vi.fn();
    component.activeIndexChange.subscribe(spy);

    indicators()[2].click();

    expect(component.activeIndex).toBe(2);
    expect(spy).toHaveBeenCalledWith(2);
  });

  it('does not jump to a disabled step', () => {
    fixture.componentRef.setInput('steps', [{ label: 'A' }, { label: 'B', disabled: true }, { label: 'C' }]);
    fixture.detectChanges();

    indicators()[1].click();

    expect(component.activeIndex).toBe(0);
  });

  it('marks earlier steps complete', () => {
    component.goTo(2);
    fixture.detectChanges();

    const items = indicators();
    expect(items[0].classList).toContain('sic-stepper__indicator--complete');
    expect(items[1].classList).toContain('sic-stepper__indicator--complete');
    expect(items[2].classList).toContain('sic-stepper__indicator--active');
  });

  it('hides the nav row when showNav is false', () => {
    fixture.componentRef.setInput('showNav', false);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.sic-stepper__nav')).toBeNull();
  });
});

describe('SicStepperComponent SIC_CONFIG defaults', () => {
  it('uses SIC_CONFIG.messages for the nav button labels', async () => {
    await TestBed.configureTestingModule({
      imports: [SicStepperComponent],
      providers: [
        {
          provide: SIC_CONFIG,
          useValue: {
            messages: {
              stepperPrevious: 'ย้อนกลับ',
              stepperNext: 'ถัดไป',
              stepperSkip: 'ข้าม',
              stepperFinish: 'เสร็จสิ้น',
            },
          },
        },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(SicStepperComponent);
    fixture.componentRef.setInput('steps', steps);
    fixture.componentRef.setInput('activeIndex', 1);
    fixture.detectChanges();

    const labels = Array.from(fixture.nativeElement.querySelectorAll('.sic-stepper__nav sic-button button')).map(
      (el: any) => el.textContent.trim(),
    );
    expect(labels).toEqual(['ย้อนกลับ', 'ข้าม', 'ถัดไป']);
  });
});
