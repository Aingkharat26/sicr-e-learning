import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SicButtonComponent } from './sic-button.component';

describe('SicButtonComponent', () => {
  let fixture: ComponentFixture<SicButtonComponent>;
  let component: SicButtonComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [SicButtonComponent] }).compileComponents();
    fixture = TestBed.createComponent(SicButtonComponent);
    component = fixture.componentInstance;
  });

  function button(): HTMLButtonElement {
    return fixture.nativeElement.querySelector('.sic-button');
  }

  it('defaults size to "sm", matching SicFormControlBase\'s default so it lines up with sic-input/sic-combobox/etc. out of the box', () => {
    fixture.detectChanges();

    expect(component.size).toBe('sm');
    expect(button().classList).toContain('sic-button--sm');
  });

  it('applies the size class for an explicit size', () => {
    fixture.componentRef.setInput('size', 'lg');
    fixture.detectChanges();

    expect(button().classList).toContain('sic-button--lg');
    expect(button().classList).not.toContain('sic-button--sm');
  });
});
