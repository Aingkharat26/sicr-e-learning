import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { SicInputComponent } from './sic-input.component';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, SicInputComponent],
  template: `
    <form [formGroup]="form">
      <sic-input formControlName="name" [errorMessages]="{ required: 'จำเป็นต้องกรอก' }"></sic-input>
    </form>
  `,
})
class HostComponent {
  form = new FormBuilder().group({
    name: ['', Validators.required],
  });
}

describe('SicInputComponent (form-group integration)', () => {
  let fixture: ComponentFixture<HostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [HostComponent] }).compileComponents();
    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
  });

  function field(): HTMLInputElement {
    return fixture.nativeElement.querySelector('.sic-input__field');
  }

  it('does not show the red border/error message before anything touches the field', () => {
    expect(field().classList.contains('sic-input__field--invalid')).toBe(false);
    expect(fixture.nativeElement.querySelector('.sic-field__error')).toBeNull();
  });

  it('shows the red border and error message once the form is validated via formGroup.markAllAsTouched() — not just a direct blur', () => {
    // Regression test: FormGroup.markAllAsTouched() (e.g. called from a submit handler) only
    // fires each control's `events` stream (a TouchedChangeEvent) — it never emits through
    // `statusChanges`/`valueChanges`. sic-input's showError/errorMessage are plain getters read
    // from the underlying control, so nothing re-renders this component unless something
    // explicitly marks it for check in response to that specific event.
    fixture.componentInstance.form.markAllAsTouched();
    fixture.detectChanges();

    expect(field().classList.contains('sic-input__field--invalid')).toBe(true);
    expect(fixture.nativeElement.querySelector('.sic-field__error')?.textContent).toBe('จำเป็นต้องกรอก');
  });

  it('clears the red border/error message after form.reset() even if the field was blurred earlier', () => {
    // Regression test: SicFormControlBase.touched (its own local blur-tracked flag, separate from
    // the underlying control's `touched`) used to only ever get set to true by markTouched() and
    // never back to false — so once a field had been blurred even once, showError stayed
    // permanently gated open by that stale local flag as soon as the control went invalid again
    // (e.g. reset() clearing a required field back to ''), even though form.reset() correctly
    // clears the *control's* own touched/dirty.
    field().dispatchEvent(new Event('blur'));
    fixture.detectChanges();
    expect(field().classList.contains('sic-input__field--invalid')).toBe(true);

    fixture.componentInstance.form.reset();
    fixture.detectChanges();

    expect(field().classList.contains('sic-input__field--invalid')).toBe(false);
    expect(fixture.nativeElement.querySelector('.sic-field__error')).toBeNull();
  });
});
