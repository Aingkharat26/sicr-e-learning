import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SIC_CONFIG } from '../../config/sic-config';
import { SicInputNumberComponent } from './sic-input-number.component';

@Component({
  standalone: true,
  imports: [FormsModule, SicInputNumberComponent],
  template: `<sic-input-number [(ngModel)]="value" />`,
})
class HostComponent {
  value: number | null = 1234.5;
}

function field(fixture: ComponentFixture<HostComponent>): HTMLInputElement {
  return fixture.nativeElement.querySelector('.sic-input-number__field');
}

describe('SicInputNumberComponent', () => {
  it('defaults decimals to 2 with no SIC_CONFIG provided', async () => {
    await TestBed.configureTestingModule({ imports: [HostComponent] }).compileComponents();
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(field(fixture).value).toBe('1,234.50');
  });

  it('uses SIC_CONFIG.decimals as the default when the caller does not set [decimals]', async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [{ provide: SIC_CONFIG, useValue: { decimals: 0 } }],
    }).compileComponents();
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(field(fixture).value).toBe('1,235');
  });
});
