import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SIC_CONFIG } from '../../config/sic-config';
import { SicComboboxComponent } from './sic-combobox.component';

interface Person {
  id: number;
  name: string;
}

@Component({
  standalone: true,
  imports: [FormsModule, SicComboboxComponent],
  template: `
    <sic-combobox
      [options]="people"
      optionLabel="name"
      optionValue="id"
      [clearable]="clearable"
      [(ngModel)]="selected"
    />
  `,
})
class HostComponent {
  people: Person[] = [
    { id: 1, name: 'Alice' },
    { id: 2, name: 'Bob' },
  ];
  selected: number | null = null;
  clearable = true;
}

describe('SicComboboxComponent clear button', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [HostComponent] }).compileComponents();
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  function getComponent(): SicComboboxComponent {
    return fixture.debugElement.query((d) => d.componentInstance instanceof SicComboboxComponent).componentInstance;
  }

  function clearBtn(): HTMLButtonElement | null {
    return fixture.nativeElement.querySelector('.sic-combobox__clear');
  }

  it('hides the clear button when there is no value', () => {
    expect(clearBtn()).toBeNull();
  });

  it('shows the clear button once a value is selected', async () => {
    const cmp = getComponent();
    cmp.selectOption(host.people[0]);
    fixture.detectChanges();

    expect(clearBtn()).toBeTruthy();
  });

  it('clicking clear resets the value and does not open the dropdown', async () => {
    const cmp = getComponent();
    cmp.selectOption(host.people[0]);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(host.selected).toBe(1);

    clearBtn()!.click();
    fixture.detectChanges();

    expect(cmp.value).toBeNull();
    expect(cmp.open).toBe(false);
  });

  it('respects [clearable]="false"', () => {
    const cmp = getComponent();
    host.clearable = false;
    cmp.selectOption(host.people[0]);
    fixture.detectChanges();

    expect(clearBtn()).toBeNull();
  });
});

describe('SicComboboxComponent SIC_CONFIG defaults', () => {
  it('uses SIC_CONFIG.pageSize as the default when the caller does not bind [pageSize]', async () => {
    await TestBed.configureTestingModule({
      imports: [SicComboboxComponent],
      providers: [{ provide: SIC_CONFIG, useValue: { pageSize: 25 } }],
    }).compileComponents();
    const fixture = TestBed.createComponent(SicComboboxComponent);

    expect(fixture.componentInstance.pageSize).toBe(25);
  });

  it('uses SIC_CONFIG.messages.noOptions for the empty options list', async () => {
    await TestBed.configureTestingModule({
      imports: [SicComboboxComponent],
      providers: [{ provide: SIC_CONFIG, useValue: { messages: { noOptions: 'ไม่มีตัวเลือก' } } }],
    }).compileComponents();
    const fixture = TestBed.createComponent(SicComboboxComponent);
    fixture.componentInstance.open = true;
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.sic-combobox__empty')?.textContent).toBe('ไม่มีตัวเลือก');
  });
});
