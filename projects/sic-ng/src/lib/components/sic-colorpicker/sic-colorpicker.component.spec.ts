import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SicColorpickerComponent } from './sic-colorpicker.component';

@Component({
  standalone: true,
  imports: [FormsModule, SicColorpickerComponent],
  template: `<sic-colorpicker [clearable]="isClearable" [(ngModel)]="color" />`,
})
class HostComponent {
  color: string | null = '#2563eb';
  isClearable = true;
}

describe('SicColorpickerComponent clear button', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [HostComponent] }).compileComponents();
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  function getComponent(): SicColorpickerComponent {
    return fixture.debugElement.query((d) => d.componentInstance instanceof SicColorpickerComponent)
      .componentInstance;
  }

  function clearBtn(): HTMLButtonElement | null {
    return fixture.nativeElement.querySelector('.sic-colorpicker__clear');
  }

  it('shows the clear button when a color is set', async () => {
    await fixture.whenStable();
    fixture.detectChanges();

    expect(clearBtn()).toBeTruthy();
  });

  it('clicking clear sets the value to null', async () => {
    await fixture.whenStable();
    fixture.detectChanges();
    const cmp = getComponent();

    clearBtn()!.click();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(cmp.value).toBeNull();
    expect(host.color).toBeNull();
    expect(clearBtn()).toBeNull();
  });

  it('hides the clear button once cleared', async () => {
    await fixture.whenStable();
    fixture.detectChanges();
    const cmp = getComponent();

    cmp.clear(new MouseEvent('click'));
    fixture.detectChanges();

    expect(clearBtn()).toBeNull();
  });

  it('respects [clearable]="false"', async () => {
    // A fresh fixture with clearable=false from the start — this repo's
    // Angular+Vitest setup doesn't reliably propagate an @Input mutated on
    // the host mid-test after the fixture has rendered once (reproduced with
    // both this input and the pre-existing `allowText` input; unrelated to
    // this component's own logic, which the other tests exercise directly).
    const freshFixture = TestBed.createComponent(HostComponent);
    freshFixture.componentInstance.isClearable = false;
    freshFixture.detectChanges();
    await freshFixture.whenStable();
    freshFixture.detectChanges();

    expect(freshFixture.nativeElement.querySelector('.sic-colorpicker__clear')).toBeNull();
    freshFixture.destroy();
  });
});

describe('SicColorpickerComponent manual hex entry', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [HostComponent] }).compileComponents();
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  function hexInput(): HTMLInputElement {
    return fixture.nativeElement.querySelector('.sic-colorpicker__hex');
  }

  function getComponent(): SicColorpickerComponent {
    return fixture.debugElement.query((d) => d.componentInstance instanceof SicColorpickerComponent)
      .componentInstance;
  }

  it('commits a valid typed hex value', () => {
    const input = hexInput();
    input.value = '#ff0000';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(getComponent().value).toBe('#ff0000');
    expect(host.color).toBe('#ff0000');
  });

  it('reverts the field to the previous value on blur if the typed text is not a valid hex code', () => {
    const cmp = getComponent();
    const originalValue = cmp.value;
    const input = hexInput();

    input.value = '#zzz';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(cmp.value).toBe(originalValue);

    input.dispatchEvent(new Event('blur'));
    fixture.detectChanges();

    expect(input.value).toBe(originalValue);
    expect(cmp.value).toBe(originalValue);
  });
});
