import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { SicInputAreaComponent } from './sic-input-area.component';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, SicInputAreaComponent],
  template: `
    <form [formGroup]="form">
      <sic-input-area formControlName="message" [errorMessages]="{ required: 'กรุณากรอกข้อความ' }"></sic-input-area>
    </form>
  `,
})
class HostComponent {
  form = new FormBuilder().group({
    message: ['', Validators.required],
  });
}

describe('SicInputAreaComponent (form-group integration)', () => {
  let fixture: ComponentFixture<HostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [HostComponent] }).compileComponents();
    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
  });

  function field(): HTMLTextAreaElement {
    return fixture.nativeElement.querySelector('.sic-input-area__field');
  }

  it('shows the red border and error message after formGroup.markAllAsTouched()', () => {
    fixture.componentInstance.form.markAllAsTouched();
    fixture.detectChanges();

    expect(field().classList.contains('sic-input-area__field--invalid')).toBe(true);
    expect(fixture.nativeElement.querySelector('.sic-field__error')?.textContent).toBe('กรุณากรอกข้อความ');
  });

  it('clears the red border/error message once form.reset() runs after a successful submit — matching the sic-home-demo contact form flow (markAllAsTouched -> valid -> reset)', () => {
    // Mirrors home.component.ts's handleContactSubmit(): markAllAsTouched() to validate, then
    // (once valid) reset() to clear the form back to a blank slate — every control's validation
    // display must clear along with its value, not just the value.
    fixture.componentInstance.form.markAllAsTouched();
    fixture.detectChanges();
    expect(field().classList.contains('sic-input-area__field--invalid')).toBe(true);

    fixture.componentInstance.form.get('message')?.setValue('Hello');
    fixture.componentInstance.form.reset();
    fixture.detectChanges();

    expect(field().value).toBe('');
    expect(field().classList.contains('sic-input-area__field--invalid')).toBe(false);
    expect(fixture.nativeElement.querySelector('.sic-field__error')).toBeNull();
  });
});
