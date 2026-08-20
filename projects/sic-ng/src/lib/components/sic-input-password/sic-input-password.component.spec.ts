import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SicInputPasswordComponent } from './sic-input-password.component';

@Component({
  standalone: true,
  imports: [FormsModule, SicInputPasswordComponent],
  template: `<sic-input-password [(ngModel)]="password" />`,
})
class HostComponent {
  password = '';
}

describe('SicInputPasswordComponent', () => {
  let fixture: ComponentFixture<HostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [HostComponent] }).compileComponents();
    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('excludes the show/hide toggle button from the tab order', () => {
    const toggleBtn: HTMLButtonElement = fixture.nativeElement.querySelector('.sic-input-password__toggle');

    expect(toggleBtn.getAttribute('tabindex')).toBe('-1');
  });
});
