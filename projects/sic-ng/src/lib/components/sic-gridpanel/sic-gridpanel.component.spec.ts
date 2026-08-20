import { Component, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Validators } from '@angular/forms';
import { SIC_CONFIG } from '../../config/sic-config';
import { SicGridPanelComponent, SicGridPanelConfig, SicGridLoadRequest, SicGridPanelTemplate } from './sic-gridpanel.component';

@Component({
  selector: 'test-host-required-validation',
  standalone: true,
  imports: [SicGridPanelComponent],
  template: `<sic-gridpanel #grid [config]="config" (loadData)="handleLoad($event, grid)" />`,
})
class HostComponent {
  @ViewChild('grid') grid!: SicGridPanelComponent;

  config: SicGridPanelConfig = {
    id: 'id',
    column: [{ label: 'Name', name: 'name', type: 'text', editable: true, validators: [Validators.required] }],
  };

  handleLoad(request: SicGridLoadRequest, grid: SicGridPanelComponent): void {
    grid.setRows([], { totalElements: 0 }, request.requestId);
  }
}

describe('SicGridPanelComponent required-field validation on save', () => {
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

  it('shows a red-bordered field with an error message when saving an empty required cell', () => {
    host.grid.addRow();
    fixture.detectChanges();

    host.grid.saveChanges();
    fixture.detectChanges();

    const input: HTMLInputElement = fixture.nativeElement.querySelector('.sic-input__field');
    const errorSpan: HTMLElement | null = fixture.nativeElement.querySelector('.sic-field__error');

    expect(input.classList.contains('sic-input__field--invalid')).toBe(true);
    expect(errorSpan?.textContent).toContain('required');
  });
});

@Component({
  selector: 'test-host-selection',
  standalone: true,
  imports: [SicGridPanelComponent],
  template: `<sic-gridpanel #grid [config]="config" (loadData)="handleLoad($event, grid)" />`,
})
class SelectionHostComponent {
  @ViewChild('grid') grid!: SicGridPanelComponent;

  config: SicGridPanelConfig = {
    id: 'id',
    pageable: false,
    column: [{ label: 'Name', name: 'name', type: 'text' }],
  };

  rows = [
    { id: 1, name: 'Alice' },
    { id: 2, name: 'Bob' },
    { id: 3, name: 'Carol' },
  ];

  handleLoad(request: SicGridLoadRequest, grid: SicGridPanelComponent): void {
    grid.setRows(this.rows, { totalElements: this.rows.length }, request.requestId);
  }
}

describe('SicGridPanelComponent row selection', () => {
  let fixture: ComponentFixture<SelectionHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [SelectionHostComponent] }).compileComponents();
    fixture = TestBed.createComponent(SelectionHostComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  function checkboxInputs(): HTMLInputElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll('.sic-checkbox__input'));
  }

  it('checking the header "select all" checkbox checks every row checkbox', () => {
    const [selectAll, ...rowBoxes] = checkboxInputs();
    expect(rowBoxes.length).toBe(3);

    selectAll.click();
    fixture.detectChanges();

    expect(rowBoxes.every((box) => box.checked)).toBe(true);

    selectAll.click();
    fixture.detectChanges();

    expect(rowBoxes.every((box) => box.checked)).toBe(false);
  });

  it('checking every row checkbox individually checks the header "select all" checkbox', () => {
    const [selectAll, ...rowBoxes] = checkboxInputs();

    rowBoxes.forEach((box) => {
      box.click();
      fixture.detectChanges();
    });

    expect(selectAll.checked).toBe(true);
  });
});

@Component({
  selector: 'test-host-selection-disabled',
  standalone: true,
  imports: [SicGridPanelComponent],
  template: `<sic-gridpanel #grid [config]="config" (loadData)="handleLoad($event, grid)" />`,
})
class SelectionDisabledHostComponent {
  @ViewChild('grid') grid!: SicGridPanelComponent;

  config: SicGridPanelConfig = {
    id: 'id',
    pageable: false,
    selectable: false,
    column: [{ label: 'Name', name: 'name', type: 'text' }],
  };

  rows = [
    { id: 1, name: 'Alice' },
    { id: 2, name: 'Bob' },
  ];

  handleLoad(request: SicGridLoadRequest, grid: SicGridPanelComponent): void {
    grid.setRows(this.rows, { totalElements: this.rows.length }, request.requestId);
  }
}

describe('SicGridPanelComponent config.selectable = false', () => {
  it('renders no selection checkboxes and no delete-selected toolbar button', async () => {
    await TestBed.configureTestingModule({ imports: [SelectionDisabledHostComponent] }).compileComponents();
    const fixture = TestBed.createComponent(SelectionDisabledHostComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('.sic-checkbox__input').length).toBe(0);
    expect(fixture.nativeElement.querySelector('[aria-label="Delete selected rows"]')).toBeNull();

    fixture.destroy();
  });
});

@Component({
  selector: 'test-host-custom-template',
  standalone: true,
  imports: [SicGridPanelComponent, SicGridPanelTemplate],
  template: `
    <sic-gridpanel #grid [config]="config" (loadData)="handleLoad($event, grid)">
      <ng-template sicGridPanelTemplate="statusBadge" section="cell" let-row>
        <span class="custom-status">{{ row.status }} badge</span>
      </ng-template>
    </sic-gridpanel>
  `,
})
class CustomTemplateHostComponent {
  @ViewChild('grid') grid!: SicGridPanelComponent;

  config: SicGridPanelConfig = {
    id: 'id',
    pageable: false,
    column: [{ label: 'Status', name: 'status', type: 'statusBadge' }],
  };

  rows = [{ id: 1, status: 'active' }];

  handleLoad(request: SicGridLoadRequest, grid: SicGridPanelComponent): void {
    grid.setRows(this.rows, { totalElements: this.rows.length }, request.requestId);
  }
}

@Component({
  selector: 'test-host-toolbar',
  standalone: true,
  imports: [SicGridPanelComponent],
  template: `<sic-gridpanel #grid [config]="config" (loadData)="handleLoad($event, grid)" />`,
})
class ToolbarHostComponent {
  @ViewChild('grid') grid!: SicGridPanelComponent;

  config: SicGridPanelConfig = {
    id: 'id',
    column: [{ label: 'Name', name: 'name', type: 'text' }],
    toolbar: { add: false, review: false },
  };

  handleLoad(request: SicGridLoadRequest, grid: SicGridPanelComponent): void {
    grid.setRows([], { totalElements: 0 }, request.requestId);
  }
}

describe('SicGridPanelComponent toolbar button visibility', () => {
  it('hides only the buttons turned off via config.toolbar', async () => {
    await TestBed.configureTestingModule({ imports: [ToolbarHostComponent] }).compileComponents();
    const fixture = TestBed.createComponent(ToolbarHostComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const buttons: HTMLButtonElement[] = Array.from(fixture.nativeElement.querySelectorAll('.sic-gridpanel__toolbar-button'));
    const labels = buttons.map((button) => button.getAttribute('aria-label'));

    expect(labels).toContain('Save changes');
    expect(labels).toContain('Delete selected rows');
    expect(labels).not.toContain('Add row');
    expect(labels).not.toContain('Review changed rows');

    fixture.destroy();
  });
});

@Component({
  selector: 'test-host-toolbar-footer-hidden',
  standalone: true,
  imports: [SicGridPanelComponent],
  template: `<sic-gridpanel #grid [config]="config" (loadData)="handleLoad($event, grid)" />`,
})
class ToolbarFooterHiddenHostComponent {
  @ViewChild('grid') grid!: SicGridPanelComponent;

  config: SicGridPanelConfig = {
    id: 'id',
    column: [{ label: 'Name', name: 'name', type: 'text' }],
    showToolbar: false,
    showFooterBar: false,
  };

  handleLoad(request: SicGridLoadRequest, grid: SicGridPanelComponent): void {
    grid.setRows([], { totalElements: 0 }, request.requestId);
  }
}

@Component({
  selector: 'test-host-toolbar-footer-default',
  standalone: true,
  imports: [SicGridPanelComponent],
  template: `<sic-gridpanel #grid [config]="config" (loadData)="handleLoad($event, grid)" />`,
})
class ToolbarFooterDefaultHostComponent {
  @ViewChild('grid') grid!: SicGridPanelComponent;

  config: SicGridPanelConfig = {
    id: 'id',
    column: [{ label: 'Name', name: 'name', type: 'text' }],
  };

  handleLoad(request: SicGridLoadRequest, grid: SicGridPanelComponent): void {
    grid.setRows([], { totalElements: 0 }, request.requestId);
  }
}

describe('SicGridPanelComponent config.showToolbar / config.showFooterBar', () => {
  it('hides the entire toolbar and footer bar when both are turned off, regardless of individual toolbar buttons', async () => {
    await TestBed.configureTestingModule({ imports: [ToolbarFooterHiddenHostComponent] }).compileComponents();
    const fixture = TestBed.createComponent(ToolbarFooterHiddenHostComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.sic-gridpanel__toolbar')).toBeNull();
    expect(fixture.nativeElement.querySelector('.sic-gridpanel__footer-bar')).toBeNull();

    fixture.destroy();
  });

  it('shows both by default', async () => {
    await TestBed.configureTestingModule({ imports: [ToolbarFooterDefaultHostComponent] }).compileComponents();
    const fixture = TestBed.createComponent(ToolbarFooterDefaultHostComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.sic-gridpanel__toolbar')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.sic-gridpanel__footer-bar')).toBeTruthy();

    fixture.destroy();
  });
});

@Component({
  selector: 'test-host-disable-callbacks',
  standalone: true,
  imports: [SicGridPanelComponent],
  template: `<sic-gridpanel #grid [config]="config" (loadData)="handleLoad($event, grid)" />`,
})
class DisableCallbackHostComponent {
  @ViewChild('grid') grid!: SicGridPanelComponent;

  config: SicGridPanelConfig = {
    id: 'id',
    pageable: false,
    column: [
      { label: 'Name', name: 'name', type: 'text', editable: true },
      { label: 'Age', name: 'age', type: 'number', editable: true },
    ],
    // row 0 (Alice) cannot be selected; the 'age' field is locked for row 1 (Bob) only.
    disableSelect: (rowIndex) => rowIndex === 0,
    disableEdit: (rowIndex, fieldName) => rowIndex === 1 && fieldName === 'age',
  };

  rows = [
    { id: 1, name: 'Alice', age: 30 },
    { id: 2, name: 'Bob', age: 40 },
  ];

  handleLoad(request: SicGridLoadRequest, grid: SicGridPanelComponent): void {
    grid.setRows(this.rows, { totalElements: this.rows.length }, request.requestId);
  }
}

describe('SicGridPanelComponent disableSelect / disableEdit callbacks', () => {
  let fixture: ComponentFixture<DisableCallbackHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [DisableCallbackHostComponent] }).compileComponents();
    fixture = TestBed.createComponent(DisableCallbackHostComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('disables only the row selection checkbox the callback targets', () => {
    const checkboxes: HTMLInputElement[] = Array.from(fixture.nativeElement.querySelectorAll('.sic-checkbox__input'));
    const [, aliceBox, bobBox] = checkboxes;

    expect(aliceBox.disabled).toBe(true);
    expect(bobBox.disabled).toBe(false);
  });

  it('disables only the field the callback targets, on the row it targets', () => {
    const nameInputs: HTMLInputElement[] = Array.from(fixture.nativeElement.querySelectorAll('.sic-input__field'));
    const ageInputs: HTMLInputElement[] = Array.from(fixture.nativeElement.querySelectorAll('.sic-input-number__field'));

    expect(nameInputs.every((input) => !input.disabled)).toBe(true);
    expect(ageInputs[0].disabled).toBe(false);
    expect(ageInputs[1].disabled).toBe(true);
  });
});

describe('SicGridPanelComponent custom column templates', () => {
  it('renders the projected ng-template for a non-built-in column type', async () => {
    await TestBed.configureTestingModule({ imports: [CustomTemplateHostComponent] }).compileComponents();
    const fixture = TestBed.createComponent(CustomTemplateHostComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const badge: HTMLElement | null = fixture.nativeElement.querySelector('.custom-status');
    expect(badge?.textContent?.trim()).toBe('active badge');

    fixture.destroy();
  });
});

@Component({
  selector: 'test-host-summary-format',
  standalone: true,
  imports: [SicGridPanelComponent],
  template: `<sic-gridpanel #grid [config]="config" (loadData)="handleLoad($event, grid)" />`,
})
class SummaryFormatHostComponent {
  @ViewChild('grid') grid!: SicGridPanelComponent;

  config: SicGridPanelConfig = {
    id: 'id',
    pageable: false,
    column: [{ label: 'Salary', name: 'salary', type: 'number', decimals: 1 }],
    // No summaryPage.decimals set — should follow column.decimals (1), not the old sum/max default (0).
    summaryPage: [{ column: 'salary', type: 'sum' }],
  };

  rows = [{ id: 1, salary: 10.25 }, { id: 2, salary: 20.05 }];

  handleLoad(request: SicGridLoadRequest, grid: SicGridPanelComponent): void {
    grid.setRows(this.rows, { totalElements: this.rows.length }, request.requestId);
  }
}

describe('SicGridPanelComponent summary formatting', () => {
  it('formats sum/avg/min/max/custom using the target column\'s own decimals', async () => {
    await TestBed.configureTestingModule({ imports: [SummaryFormatHostComponent] }).compileComponents();
    const fixture = TestBed.createComponent(SummaryFormatHostComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const summary: HTMLElement | null = fixture.nativeElement.querySelector('.sic-gridpanel__footer-summary');
    // 10.25 + 20.05 = 30.3, formatted to column.decimals = 1 → "30.3", not "30" (old default) or "30.30".
    expect(summary?.textContent?.trim()).toBe('30.3');

    fixture.destroy();
  });
});

@Component({
  selector: 'test-host-grand-summary',
  standalone: true,
  imports: [SicGridPanelComponent],
  template: `<sic-gridpanel #grid [config]="config" (loadData)="handleLoad($event, grid)" />`,
})
class GrandSummaryHostComponent {
  @ViewChild('grid') grid!: SicGridPanelComponent;

  config: SicGridPanelConfig = {
    id: 'id',
    lazy: false,
    pageSize: 2,
    column: [{ label: 'Salary', name: 'salary', type: 'number', decimals: 0 }],
    summaryPage: [{ column: 'salary', type: 'sum', label: 'page' }],
    summary: { showOn: 'last', columns: [{ column: 'salary', type: 'sum', label: 'total' }] },
  };

  rows = [
    { id: 1, salary: 10 },
    { id: 2, salary: 20 },
    { id: 3, salary: 30 },
    { id: 4, salary: 40 },
  ];

  handleLoad(request: SicGridLoadRequest, grid: SicGridPanelComponent): void {
    grid.setRows(this.rows, { totalElements: this.rows.length }, request.requestId);
  }
}

describe('SicGridPanelComponent summaryPage + summary (grand total)', () => {
  let fixture: ComponentFixture<GrandSummaryHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [GrandSummaryHostComponent] }).compileComponents();
    fixture = TestBed.createComponent(GrandSummaryHostComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  function footerRows(): HTMLElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll('.sic-gridpanel__footer'));
  }

  it('shows only the summaryPage row on a non-last page, with showOn "last"', () => {
    const rows = footerRows();
    expect(rows.length).toBe(1);
    expect(rows[0].classList.contains('sic-gridpanel__footer--grand')).toBe(false);
    expect(rows[0].textContent).toContain('page 30'); // 10 + 20
  });

  it('shows the summaryPage row first, then the grand summary row, on the last page', () => {
    fixture.componentInstance.grid.goToPage(2);
    fixture.detectChanges();

    const rows = footerRows();
    expect(rows.length).toBe(2);
    expect(rows[0].classList.contains('sic-gridpanel__footer--grand')).toBe(false);
    expect(rows[0].textContent).toContain('page 70'); // 30 + 40
    expect(rows[1].classList.contains('sic-gridpanel__footer--grand')).toBe(true);
    expect(rows[1].textContent).toContain('total 100'); // 10 + 20 + 30 + 40
  });
});

@Component({
  selector: 'test-host-column-groups',
  standalone: true,
  imports: [SicGridPanelComponent],
  template: `<sic-gridpanel #grid [config]="config" (loadData)="handleLoad($event, grid)" />`,
})
class ColumnGroupsHostComponent {
  @ViewChild('grid') grid!: SicGridPanelComponent;

  config: SicGridPanelConfig = {
    id: 'id',
    pageable: false,
    column: [
      { label: 'First Name', name: 'firstName', type: 'text' },
      { label: 'Last Name', name: 'lastName', type: 'text' },
      { label: 'Age', name: 'age', type: 'number' },
      { label: 'Visits', name: 'visits', type: 'number' },
    ],
    columnGroups: [
      { label: 'Name', columns: ['firstName', 'lastName'] },
      { label: 'Info', columns: ['age', 'visits'] },
    ],
  };

  handleLoad(request: SicGridLoadRequest, grid: SicGridPanelComponent): void {
    grid.setRows([], { totalElements: 0 }, request.requestId);
  }
}

describe('SicGridPanelComponent column groups', () => {
  it('renders one group header cell per group, plus each column header underneath', async () => {
    await TestBed.configureTestingModule({ imports: [ColumnGroupsHostComponent] }).compileComponents();
    const fixture = TestBed.createComponent(ColumnGroupsHostComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const groupCells: HTMLElement[] = Array.from(fixture.nativeElement.querySelectorAll('.sic-gridpanel__header-group-cell'));
    expect(groupCells.map((cell) => cell.textContent?.trim())).toEqual(['Name', 'Info']);

    const columnLabels: HTMLElement[] = Array.from(fixture.nativeElement.querySelectorAll('.sic-gridpanel__sort > span:first-child'));
    expect(columnLabels.map((label) => label.textContent?.trim())).toEqual(['First Name', 'Last Name', 'Age', 'Visits']);

    fixture.destroy();
  });
});

@Component({
  selector: 'test-host-page-size',
  standalone: true,
  imports: [SicGridPanelComponent],
  template: `<sic-gridpanel #grid [config]="config" (loadData)="handleLoad($event, grid)" />`,
})
class PageSizeHostComponent {
  @ViewChild('grid') grid!: SicGridPanelComponent;

  config: SicGridPanelConfig = {
    id: 'id',
    lazy: false,
    pageSize: 10,
    column: [{ label: 'Name', name: 'name', type: 'text' }],
  };

  rows = Array.from({ length: 25 }, (_, i) => ({ id: i + 1, name: `Row ${i + 1}` }));

  handleLoad(request: SicGridLoadRequest, grid: SicGridPanelComponent): void {
    grid.setRows(this.rows, { totalElements: this.rows.length }, request.requestId);
  }
}

describe('SicGridPanelComponent page-size selector', () => {
  let fixture: ComponentFixture<PageSizeHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [PageSizeHostComponent] }).compileComponents();
    fixture = TestBed.createComponent(PageSizeHostComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('defaults to [10, 30, 50] with no label suffix, with the current page size selected', () => {
    expect(fixture.componentInstance.grid.pageSizeSelectOptions).toEqual([
      { label: '10', value: 10 },
      { label: '30', value: 30 },
      { label: '50', value: 50 },
    ]);

    const input: HTMLInputElement = fixture.nativeElement.querySelector('.sic-gridpanel__page-size-select .sic-combobox__input');
    expect(input.value).toBe('10');
  });

  it('appends SIC_CONFIG messages.gridPageSizeSuffix to each option label when configured', async () => {
    await TestBed.resetTestingModule()
      .configureTestingModule({
        imports: [PageSizeHostComponent],
        providers: [{ provide: SIC_CONFIG, useValue: { messages: { gridPageSizeSuffix: ' รายการ' } } }],
      })
      .compileComponents();
    const configuredFixture = TestBed.createComponent(PageSizeHostComponent);
    configuredFixture.detectChanges();
    await configuredFixture.whenStable();
    configuredFixture.detectChanges();

    expect(configuredFixture.componentInstance.grid.pageSizeSelectOptions).toEqual([
      { label: '10 รายการ', value: 10 },
      { label: '30 รายการ', value: 30 },
      { label: '50 รายการ', value: 50 },
    ]);
  });

  it('shows the combined "ต่อหน้า รวม N รายการ" summary next to the page-size selector', () => {
    const summary: HTMLElement = fixture.nativeElement.querySelector('.sic-gridpanel__summary');
    expect(summary.textContent).toContain('ต่อหน้า รวม 25 รายการ');
  });

  it('selecting a new page size updates pageSize and re-paginates immediately (lazy: false)', () => {
    expect(fixture.nativeElement.querySelectorAll('.sic-gridpanel__row').length).toBe(10);

    fixture.componentInstance.grid.pageSizeControl.setValue(30);
    fixture.detectChanges();

    expect(fixture.componentInstance.grid.pageSize).toBe(30);
    expect(fixture.nativeElement.querySelectorAll('.sic-gridpanel__row').length).toBe(25);
  });
});

@Component({
  selector: 'test-host-page-size-disabled',
  standalone: true,
  imports: [SicGridPanelComponent],
  template: `<sic-gridpanel #grid [config]="config" (loadData)="handleLoad($event, grid)" />`,
})
class PageSizeDisabledHostComponent {
  @ViewChild('grid') grid!: SicGridPanelComponent;

  config: SicGridPanelConfig = {
    id: 'id',
    pageSizeSelector: false,
    column: [{ label: 'Name', name: 'name', type: 'text' }],
  };

  handleLoad(request: SicGridLoadRequest, grid: SicGridPanelComponent): void {
    grid.setRows([], { totalElements: 0 }, request.requestId);
  }
}

describe('SicGridPanelComponent config.pageSizeSelector = false', () => {
  it('hides the page-size dropdown', async () => {
    await TestBed.configureTestingModule({ imports: [PageSizeDisabledHostComponent] }).compileComponents();
    const fixture = TestBed.createComponent(PageSizeDisabledHostComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.sic-gridpanel__page-size-select')).toBeNull();
    expect(fixture.nativeElement.querySelector('.sic-gridpanel__summary').textContent).toContain('รวม 0 รายการ');

    fixture.destroy();
  });
});

@Component({
  selector: 'test-host-review-mode',
  standalone: true,
  imports: [SicGridPanelComponent],
  template: `<sic-gridpanel #grid [config]="config" (loadData)="handleLoad($event, grid)" />`,
})
class ReviewModeHostComponent {
  @ViewChild('grid') grid!: SicGridPanelComponent;

  config: SicGridPanelConfig = {
    id: 'id',
    pageable: false,
    column: [{ label: 'Name', name: 'name', type: 'text', editable: true }],
  };

  rows = [
    { id: 1, name: 'Alice' },
    { id: 2, name: 'Bob' },
    { id: 3, name: 'Carol' },
  ];

  handleLoad(request: SicGridLoadRequest, grid: SicGridPanelComponent): void {
    grid.setRows(this.rows, { totalElements: this.rows.length }, request.requestId);
  }
}

describe('SicGridPanelComponent review mode: edit / reset / delete keep the list in sync', () => {
  let fixture: ComponentFixture<ReviewModeHostComponent>;
  let host: ReviewModeHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [ReviewModeHostComponent] }).compileComponents();
    fixture = TestBed.createComponent(ReviewModeHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  function nameInputs(): HTMLInputElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll('.sic-gridpanel__row .sic-input__field'));
  }

  function typeInto(input: HTMLInputElement, value: string): void {
    input.value = value;
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
  }

  it('editing an already-changed row again while in review mode keeps reflecting the latest value', () => {
    typeInto(nameInputs()[0], 'Alicia');

    host.grid.toggleReviewChanges();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('.sic-gridpanel__row').length).toBe(1);

    typeInto(nameInputs()[0], 'Alicia Updated');

    expect(nameInputs()[0].value).toBe('Alicia Updated');
    expect(host.grid.rows[0]['name']).toBe('Alicia Updated');
  });

  it('resetting a row while in review mode removes it from the changed-rows list immediately', () => {
    typeInto(nameInputs()[0], 'Alicia');
    typeInto(nameInputs()[1], 'Bobby');

    host.grid.toggleReviewChanges();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('.sic-gridpanel__row').length).toBe(2);

    const resetButton: HTMLButtonElement = fixture.nativeElement.querySelector('.sic-gridpanel__reset-row-button');
    resetButton.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('.sic-gridpanel__row').length).toBe(1);
    expect(host.grid.totalElements).toBe(1);
  });

  it('deleting the last remaining new row while in review mode empties the list and clears totals immediately', () => {
    host.grid.addRow();
    fixture.detectChanges();

    host.grid.toggleReviewChanges();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('.sic-gridpanel__row').length).toBe(1);

    const checkboxes: HTMLInputElement[] = Array.from(fixture.nativeElement.querySelectorAll('.sic-checkbox__input'));
    const rowCheckbox = checkboxes[1];
    rowCheckbox.click();
    fixture.detectChanges();

    host.grid.deleteSelectedRows();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('.sic-gridpanel__row').length).toBe(0);
    expect(host.grid.totalElements).toBe(0);
  });

  it('resetting an edited row while in review mode is reflected correctly after closing review mode', () => {
    typeInto(nameInputs()[1], 'Bobd');

    host.grid.toggleReviewChanges();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('.sic-gridpanel__row').length).toBe(1);

    const resetButton: HTMLButtonElement = fixture.nativeElement.querySelector('.sic-gridpanel__reset-row-button');
    resetButton.click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('.sic-gridpanel__row').length).toBe(0);

    host.grid.toggleReviewChanges();
    fixture.detectChanges();

    expect(nameInputs()[1].value).toBe('Bob');
  });
});
