import { CommonModule, DatePipe } from '@angular/common';
import {
  AfterContentInit,
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ContentChildren,
  Directive,
  ElementRef,
  EventEmitter,
  HostBinding,
  HostListener,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  QueryList,
  SimpleChanges,
  TemplateRef,
  ViewChild,
  inject,
} from '@angular/core';
import { AsyncValidatorFn, FormControl, FormsModule, ReactiveFormsModule, ValidatorFn } from '@angular/forms';
import { Subscription } from 'rxjs';
import { injectSicConfig } from '../../config/sic-config';
import { SicInputComponent } from '../sic-input/sic-input.component';
import { SicInputNumberComponent } from '../sic-input-number/sic-input-number.component';
import { SicInputAreaComponent } from '../sic-input-area/sic-input-area.component';
import { SicCheckboxComponent } from '../sic-checkbox/sic-checkbox.component';
import { SicDatepickerComponent } from '../sic-datepicker/sic-datepicker.component';
import { SicTimepickerComponent } from '../sic-timepicker/sic-timepicker.component';
import { SicComboboxComponent } from '../sic-combobox/sic-combobox.component';
import { SicRadioComponent, SicRadioOption } from '../sic-radio/sic-radio.component';
import { SicColorpickerComponent } from '../sic-colorpicker/sic-colorpicker.component';
import { SicUploadComponent } from '../sic-upload/sic-upload.component';
import { SicSwitchComponent } from '../sic-switch/sic-switch.component';
import { SicTooltipDirective } from '../sic-tooltip/sic-tooltip.directive';
import { SicToastService } from '../sic-toast/sic-toast.service';

const SIC_GRID_INPUT_IMPORTS = [
  SicInputComponent,
  SicInputNumberComponent,
  SicInputAreaComponent,
  SicCheckboxComponent,
  SicDatepickerComponent,
  SicTimepickerComponent,
  SicComboboxComponent,
  SicRadioComponent,
  SicColorpickerComponent,
  SicUploadComponent,
  SicSwitchComponent,
];

export type SicGridPanelTemplateSection = 'cell' | 'header' | 'footer';

export interface SicGridOption {
  label: string;
  value: unknown;
}

export interface SicGridColumnAction {
  name: string;
  label: string;
  variant?: 'default' | 'danger' | 'ghost';
}

export interface SicGridColumnConfig {
  label: string;
  name: string;
  type: string;
  editable?: boolean;
  sortable?: boolean;
  /** Horizontal alignment of the cell's content. Defaults to 'right' for number columns, 'left' otherwise. */
  align?: 'left' | 'center' | 'right';
  width?: number;
  /** Floor for the column's width (px) — applies both when columns fit and shrink proportionally, and when they overflow to fixed widths. */
  minWidth?: number;
  placeholder?: string;
  hidden?: boolean;
  options?: SicGridOption[];
  checkedValue?: unknown;
  uncheckedValue?: unknown;
  rows?: number;
  direction?: 'row' | 'column';
  dateFormat?: string;
  clearable?: boolean;
  minDate?: string;
  maxDate?: string;
  decimals?: number;
  accept?: string;
  multiple?: boolean;
  maxSizeMb?: number;
  hint?: string;
  validator?: ValidatorFn | ValidatorFn[] | null;
  validators?: ValidatorFn | ValidatorFn[] | null;
  asyncValidator?: AsyncValidatorFn | AsyncValidatorFn[] | null;
  asyncValidators?: AsyncValidatorFn | AsyncValidatorFn[] | null;
  errorMessages?: Record<string, string>;
  buttonText?: string;
  actions?: SicGridColumnAction[];
  footerText?: string;
  customTemplate?: string;
}

/** Groups several columns under one shared label spanning a second header row above them. */
export interface SicGridColumnGroupConfig {
  label: string;
  /** `column.name`s covered by this group — must be contiguous among the currently visible columns. */
  columns: string[];
  align?: 'left' | 'center' | 'right';
}

export interface SicGridToolbarConfig {
  /** Save-changes button. Default true. */
  save?: boolean;
  /** Add-row button. Default true. */
  add?: boolean;
  /** Delete-selected-rows button. Default true. */
  delete?: boolean;
  /** Review-changed-rows toggle button. Default true. */
  review?: boolean;
}

export type SicGridSummaryType = 'sum' | 'avg' | 'count' | 'min' | 'max' | 'custom';

export interface SicGridSummaryConfig {
  /** Column name this summary is rendered under, in the footer row. */
  column: string;
  type: SicGridSummaryType;
  label?: string;
  /** Only used as a fallback when `column.type` isn't 'number' (or type is 'custom' on a non-number column) — a 'number' column's own `decimals` wins otherwise, so the summary always matches how the column itself formats its values. Ignored for type 'count' (always a plain integer). */
  decimals?: number;
  /** Defaults to 'right' for number columns, 'left' otherwise. */
  align?: 'left' | 'center' | 'right';
  /** Required when type is 'custom'; the raw number fed into `formatter`. */
  calculate?: (rows: SicGridRowData[]) => number;
  formatter?: (value: number, rows: SicGridRowData[]) => string;
}

export interface SicGridGrandSummaryConfig {
  /** 'all' (default): render the grand-total row on every page. 'last': only on the final page. */
  showOn?: 'all' | 'last';
  columns: SicGridSummaryConfig[];
}

export interface SicGridPanelConfig {
  id: string;
  defaultSortField?: string;
  defaultSortDescending?: boolean;
  pageable?: boolean;
  /** Show the row-selection checkbox column (header "select all" + per-row). Default true. */
  selectable?: boolean;
  /**
   * true (default): every page/sort/keyword change re-emits `(loadData)` —
   * the host fetches just that page from the server.
   * false: `(loadData)` fires once (plus explicit `reload()`); the host
   * hands back the *entire* dataset via `setRows()` and the grid sorts and
   * paginates it locally without further round-trips.
   */
  lazy?: boolean;
  pageNumber?: number;
  pageSize?: number;
  /** Options offered by the footer's page-size dropdown. Default [10, 30, 50]. */
  pageSizeOptions?: number[];
  /** Show the footer's page-size dropdown (when `pageable` is also on). Default true. */
  pageSizeSelector?: boolean;
  keyword?: string;
  params?: Record<string, unknown>;
  disableRow?: (row: SicGridRowData) => boolean;
  /** Return true to disable the row's selection checkbox — independent of `disableRow`. */
  disableSelect?: (rowIndex: number, rowData: SicGridRowData) => boolean;
  /** Called per editable cell — return true to make that field (or, if the callback ignores fieldName, the whole row) readonly. */
  disableEdit?: (rowIndex: number, fieldName: string, data: unknown, rowData: SicGridRowData) => boolean;
  createRowValue?: Record<string, unknown> | (() => Record<string, unknown>);
  column?: SicGridColumnConfig[];
  columns?: SicGridColumnConfig[];
  /** Optional — groups columns under a shared label on a second header row above them (e.g. "Info" spanning Age/Visits/Status). Omit for the regular single-row header. */
  columnGroups?: SicGridColumnGroupConfig[];
  /** Aggregated values rendered on their own footer row, per column, computed from just the currently-displayed page. */
  summaryPage?: SicGridSummaryConfig[];
  /**
   * Aggregated values rendered on a second footer row (below summaryPage's,
   * if present), computed from the *entire* dataset rather than just the
   * current page — in `lazy: false` mode that's genuinely every row; in
   * `lazy: true` mode it's limited to whatever pages the grid has already
   * loaded, since the client never holds the full server-side dataset at once.
   */
  summary?: SicGridGrandSummaryConfig;
  /** Show/hide individual toolbar buttons. Every button defaults to visible. */
  toolbar?: SicGridToolbarConfig;
  /** Show/hide the entire toolbar bar (save/add/delete/review buttons), regardless of the individual `toolbar` flags. Default true. */
  showToolbar?: boolean;
  /** Show/hide the entire footer bar (page-size dropdown, "Total N rows", pager), regardless of `pageable`/`pageSizeSelector`. Default true. */
  showFooterBar?: boolean;
}

export interface SicGridLoadRequest {
  requestId: number;
  pageNumber: number;
  pageSize: number;
  sortField: string | null;
  sortDescending: boolean;
  keyword: string | null;
  params: Record<string, unknown> | null;
}

export interface SicGridSaveRequest {
  requestId: number;
  rows: unknown[];
}

interface SicGridPagingState {
  pageNumber?: number;
  pageSize?: number;
  totalElements?: number;
  totalPages?: number;
}

interface SicGridControlState {
  touched: boolean;
  dirty: boolean;
}

type SicGridPagerItem = number | 'start-ellipsis' | 'end-ellipsis';

type SicGridCellControlKey = `${string}:${string}`;
type SicGridRowState = 'active' | 'new' | 'updated' | 'deleted';
type SicGridPersistState = 4 | 3 | 2;
export type SicGridRowData = Record<string, unknown>;

@Directive({
  selector: 'ng-template[sicGridPanelTemplate]',
  standalone: true,
})
export class SicGridPanelTemplate {
  @Input('sicGridPanelTemplate') name = '';
  @Input() section: SicGridPanelTemplateSection = 'cell';

  constructor(readonly template: TemplateRef<unknown>) {}
}

@Component({
  selector: 'sic-gridpanel',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SicTooltipDirective,
    ...SIC_GRID_INPUT_IMPORTS,
  ],
  providers: [DatePipe],
  templateUrl: './sic-gridpanel.component.html',
  styleUrl: './sic-gridpanel.component.css',
})
export class SicGridPanelComponent implements OnChanges, AfterContentInit, AfterViewInit, OnDestroy {
  private readonly sicConfig = injectSicConfig();

  @Input({ required: true }) config!: SicGridPanelConfig;

  @Output() readonly loadData = new EventEmitter<SicGridLoadRequest>();
  @Output() readonly saveData = new EventEmitter<SicGridSaveRequest>();
  @Output() readonly rowsChange = new EventEmitter<SicGridRowData[]>();
  @Output() readonly rowAction = new EventEmitter<{ action: string; row?: SicGridRowData | null; rows?: SicGridRowData[]; column?: SicGridColumnConfig | null }>();
  @Output() readonly softDeleteChange = new EventEmitter<{ id: unknown; deleted: boolean; row: SicGridRowData }>();

  @HostBinding('class.sic-gridpanel-host') readonly hostClass = true;

  @ContentChildren(SicGridPanelTemplate) templates?: QueryList<SicGridPanelTemplate>;
  @ViewChild('surface') private readonly surfaceRef?: ElementRef<HTMLDivElement>;

  readonly rows: SicGridRowData[] = [];
  readonly deletedRowIds = new Set<string>();
  readonly selectedRowIds = new Set<string>();

  loading = false;
  saving = false;
  reviewChangesOnly = false;
  currentPage = 1;
  pageSize = this.sicConfig.pageSize ?? 10;
  totalElements = 0;
  totalPages = 1;
  sortField: string | null = null;
  sortDescending = false;
  gridTemplateColumns = '';
  /** True when columns use fixed pixel widths that may exceed the host width (needs horizontal
   * scroll) — false when columns are proportional (`calc(% ...)`) and stretch to fill the host.
   * Drives whether the header/row grids are `width: max-content` or `width: 100%`; mixing
   * `max-content` with percentage-based tracks makes each row's rendered column widths follow
   * that row's own content instead of a shared width, desyncing header and body columns. */
  gridColumnsFixedWidth = false;

  private readonly controlMap = new Map<SicGridCellControlKey, FormControl>();
  private readonly controlSubscriptions = new Map<SicGridCellControlKey, Subscription>();
  private readonly controlStateMap = new Map<SicGridCellControlKey, SicGridControlState>();
  private readonly selectionControlMap = new Map<string, FormControl>();
  private readonly selectionSubscriptions = new Map<string, Subscription>();
  private readonly originalRowSnapshots = new Map<string, string>();
  private readonly localAddedRows: SicGridRowData[] = [];
  private readonly localUpdatedRows = new Map<string, SicGridRowData>();
  private readonly comboboxOptionsCache = new WeakMap<SicGridColumnConfig, { source: SicGridOption[] | undefined; mapped: SicGridOption[] }>();
  private readonly radioOptionsCache = new WeakMap<SicGridColumnConfig, { source: SicGridOption[] | undefined; mapped: SicRadioOption[] }>();
  private readonly rowKeys = new WeakMap<object, string>();
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly datePipe = inject(DatePipe);
  private readonly toastService = inject(SicToastService);
  private templatesReady = false;
  private rowKeySequence = 0;
  private pageBeforeReviewChanges = 1;
  private latestServerRows: SicGridRowData[] = [];
  private serverTotalElements = 0;
  private syncingSelectionState = false;
  private validationRequested = false;
  private loadRequestId = 0;
  private pendingLoadRequestId: number | null = null;
  private saveRequestId = 0;
  private pendingSaveRequestId: number | null = null;
  private pendingSaveTrackedRows: SicGridRowData[] = [];
  readonly selectAllControl = new FormControl(false);
  private readonly selectAllSubscription = this.selectAllControl.valueChanges.subscribe((checked) => {
    if (this.syncingSelectionState) {
      return;
    }

    this.toggleSelectAll(checked === true);
  });

  readonly pageSizeControl = new FormControl<number>(this.sicConfig.pageSize ?? 10);
  private syncingPageSize = false;
  private readonly pageSizeSubscription = this.pageSizeControl.valueChanges.subscribe((size) => {
    if (this.syncingPageSize || size == null) {
      return;
    }

    this.changePageSize(size);
  });

  private visibleColumnsCache: { source: SicGridColumnConfig[]; mapped: SicGridColumnConfig[] } | null = null;

  get visibleColumns(): SicGridColumnConfig[] {
    const source = this.config?.column ?? this.config?.columns ?? [];
    if (this.visibleColumnsCache && this.visibleColumnsCache.source === source) {
      return this.visibleColumnsCache.mapped;
    }

    const mapped = source.filter((column) => !column.hidden);
    this.visibleColumnsCache = { source, mapped };
    return mapped;
  }

  get hasColumnGroups(): boolean {
    return !!this.config?.columnGroups?.length;
  }

  get visibleColumnGroups(): SicGridColumnGroupConfig[] {
    return this.config?.columnGroups ?? [];
  }

  /** True if `column` is covered by one of `config.columnGroups`. */
  isColumnGrouped(column: SicGridColumnConfig): boolean {
    return !!this.config?.columnGroups?.some((group) => group.columns.includes(column.name));
  }

  /**
   * CSS grid-column line range for a single header cell — line 1 is the
   * selection column, so a visible column at index `i` occupies lines
   * `i + 2` to `i + 3`.
   */
  getColumnGridColumn(column: SicGridColumnConfig): string {
    const index = this.visibleColumns.indexOf(column);
    return index < 0 ? 'auto' : `${index + 2} / ${index + 3}`;
  }

  /** CSS grid-column line range spanning every (visible) member column of a group. */
  getGroupGridColumn(group: SicGridColumnGroupConfig): string {
    const indexes = group.columns
      .map((name) => this.visibleColumns.findIndex((column) => column.name === name))
      .filter((index) => index >= 0);

    if (indexes.length === 0) {
      return 'auto';
    }

    return `${Math.min(...indexes) + 2} / ${Math.max(...indexes) + 3}`;
  }

  get hasFooter(): boolean {
    return (
      this.hasGrandSummary ||
      this.visibleColumns.some((column) => !!column.footerText || this.hasSummary(column) || !!this.findTemplate(this.resolveTemplateName(column), 'footer'))
    );
  }

  get showPager(): boolean {
    return this.config?.pageable !== false;
  }

  get showPageSizeSelector(): boolean {
    return this.showPager && this.config?.pageSizeSelector !== false;
  }

  /** The configured options, plus the current `pageSize` itself if it isn't already one of them. */
  get pageSizeOptions(): number[] {
    const configured = this.config?.pageSizeOptions ?? this.sicConfig.pageSizeOptions ?? [10, 30, 50];
    return configured.includes(this.pageSize) ? configured : [...configured, this.pageSize].sort((a, b) => a - b);
  }

  get pageSizeSelectOptions(): { label: string; value: number }[] {
    const suffix = this.sicConfig.messages?.gridPageSizeSuffix ?? '';
    return this.pageSizeOptions.map((size) => ({ label: `${size}${suffix}`, value: size }));
  }

  get loadingText(): string {
    return this.sicConfig.messages?.gridLoading ?? 'Loading...';
  }

  get noDataTitle(): string {
    return this.reviewChangesOnly
      ? this.sicConfig.messages?.gridNoChangedData ?? 'No changed data'
      : this.sicConfig.messages?.gridNoData ?? 'No data found';
  }

  get noDataSubtitle(): string {
    return this.reviewChangesOnly
      ? this.sicConfig.messages?.gridNoChangedDataHint ?? 'Try turning off review mode to see all rows.'
      : this.sicConfig.messages?.gridNoDataHint ?? 'Try adjusting your search or add a new row.';
  }

  get busyText(): string {
    return this.saving
      ? this.sicConfig.messages?.gridSaving ?? 'Saving data...'
      : this.sicConfig.messages?.gridLoadingOverlay ?? 'Loading data...';
  }

  get isLazy(): boolean {
    return this.config?.lazy !== false;
  }

  get hasPendingChanges(): boolean {
    return this.getTrackedRows().some((row) => {
      const state = this.getRowState(row);
      return state === 'new' || state === 'updated' || state === 'deleted';
    });
  }

  get canSaveChanges(): boolean {
    return this.hasPendingChanges && !this.loading && !this.saving;
  }

  get showSaveButton(): boolean {
    return this.config?.toolbar?.save !== false;
  }

  get showAddButton(): boolean {
    return this.config?.toolbar?.add !== false;
  }

  get showSelectionColumn(): boolean {
    return this.config?.selectable !== false;
  }

  get showDeleteButton(): boolean {
    return this.showSelectionColumn && this.config?.toolbar?.delete !== false;
  }

  get showReviewButton(): boolean {
    return this.config?.toolbar?.review !== false;
  }

  get hasVisibleToolbarButtons(): boolean {
    return (
      this.config?.showToolbar !== false &&
      (this.showSaveButton || this.showAddButton || this.showDeleteButton || this.showReviewButton)
    );
  }

  get showFooterBar(): boolean {
    return this.config?.showFooterBar !== false;
  }

  get isBusy(): boolean {
    return this.loading || this.saving;
  }

  get changedRowsCount(): number {
    return this.getChangedRows().length;
  }

  get canReviewChanges(): boolean {
    return this.reviewChangesOnly || this.changedRowsCount > 0;
  }

  get pagerItems(): SicGridPagerItem[] {
    if (this.totalPages <= 1) {
      return [1];
    }

    const windowSize = 5;
    const halfWindow = Math.floor(windowSize / 2);
    let startPage = Math.max(1, this.currentPage - halfWindow);
    let endPage = Math.min(this.totalPages, startPage + windowSize - 1);

    if (endPage - startPage + 1 < windowSize) {
      startPage = Math.max(1, endPage - windowSize + 1);
    }

    const items: SicGridPagerItem[] = [];

    if (startPage > 1) {
      items.push(1);
    }

    if (startPage > 2) {
      items.push('start-ellipsis');
    }

    for (let page = startPage; page <= endPage; page += 1) {
      items.push(page);
    }

    if (endPage < this.totalPages - 1) {
      items.push('end-ellipsis');
    }

    if (endPage < this.totalPages) {
      items.push(this.totalPages);
    }

    return items;
  }

  get selectedRows(): SicGridRowData[] {
    return this.rows.filter((row) => this.selectedRowIds.has(this.getRowKey(row)));
  }

  get selectedCount(): number {
    return this.selectedRows.length;
  }

  get canDeleteSelected(): boolean {
    return this.selectedRows.some((row) => !this.isRowDeleted(row) && !this.isRowDisabled(row));
  }

  get selectableCount(): number {
    return this.rows.filter((row, rowIndex) => !this.isRowDeleted(row) && !this.isRowSelectDisabled(row, rowIndex)).length;
  }

  get deletedCount(): number {
    return this.getTrackedRows().filter((row) => this.getRowState(row) === 'deleted').length;
  }

  get newCount(): number {
    return this.getTrackedRows().filter((row) => this.getRowState(row) === 'new').length;
  }

  get updatedCount(): number {
    return this.getTrackedRows().filter((row) => this.getRowState(row) === 'updated').length;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['config']) {
      this.currentPage = this.config?.pageNumber ?? 1;
      this.pageSize = this.config?.pageSize ?? this.sicConfig.pageSize ?? 10;
      this.syncPageSizeControl();
      this.applyDefaultSort();
      this.deletedRowIds.clear();
      this.selectedRowIds.clear();
      this.localAddedRows.splice(0, this.localAddedRows.length);
      this.localUpdatedRows.clear();
      this.latestServerRows = [];
      this.serverTotalElements = 0;
      this.originalRowSnapshots.clear();
      this.controlStateMap.clear();
      this.validationRequested = false;
      this.updateGridTemplateColumns();
      if (this.config) {
        this.requestLoad(true);
      }
    }
  }

  ngAfterContentInit(): void {
    this.templatesReady = true;
    this.templates?.changes.subscribe(() => this.cdr.markForCheck());
  }

  ngAfterViewInit(): void {
    this.updateGridTemplateColumns();
    this.cdr.markForCheck();
  }

  ngOnDestroy(): void {
    this.disposeControls();
    this.disposeSelectionControls();
    this.selectAllSubscription.unsubscribe();
    this.pageSizeSubscription.unsubscribe();
  }

  @HostListener('window:resize')
  handleWindowResize(): void {
    this.updateGridTemplateColumns();
  }

  /** Ask the host application to (re)fetch the current page; listen on `(loadData)`. */
  reload(): void {
    this.requestLoad(false);
  }

  /** Host calls this once its fetch triggered by `(loadData)` resolves. */
  setRows(data: SicGridRowData[], pageable?: SicGridPagingState, requestId?: number): void {
    if (requestId !== undefined && requestId !== this.pendingLoadRequestId) {
      return;
    }

    const serverRows = data.map((row) => ({ ...row }));
    this.captureOriginalSnapshots(serverRows);

    const mergedServerRows = serverRows.map((row) => {
      const rowKey = this.getRowKey(row);
      const updatedRow = this.localUpdatedRows.get(rowKey);
      return updatedRow ? { ...row, ...updatedRow } : row;
    });

    this.latestServerRows = mergedServerRows;
    this.serverTotalElements = pageable?.totalElements ?? data.length;
    this.currentPage = pageable?.pageNumber ?? this.currentPage;
    this.pageSize = pageable?.pageSize ?? this.pageSize;
    this.totalElements = this.serverTotalElements + this.localAddedRows.length;
    this.totalPages = this.resolveCombinedTotalPages();
    this.loading = false;
    this.refreshVisibleRows();
    this.rebuildControls();
    // rebuildSelectionControls() re-derives the "select all" checkbox's
    // disabled state from `this.loading` — must run after it flips to false,
    // otherwise "select all" is left permanently disabled after every load.
    this.rebuildSelectionControls();
    this.rowsChange.emit(this.serializeRows());
    this.updateGridTemplateColumns();
    this.cdr.markForCheck();
  }

  /** Host calls this if its fetch triggered by `(loadData)` fails. */
  setLoadError(message: string, requestId?: number): void {
    if (requestId !== undefined && requestId !== this.pendingLoadRequestId) {
      return;
    }

    this.loading = false;
    this.toastService.show(message || 'Unable to load grid data.', 'danger');
    this.cdr.markForCheck();
  }

  /** Host calls this once its persist triggered by `(saveData)` resolves. */
  setSaveResult(success: boolean, message?: string, requestId?: number): void {
    if (requestId !== undefined && requestId !== this.pendingSaveRequestId) {
      return;
    }

    this.saving = false;

    if (success) {
      this.validationRequested = false;
      const reloadPage = this.reviewChangesOnly ? this.pageBeforeReviewChanges : this.currentPage;
      this.resetTrackedStateAfterSave(reloadPage);
      this.rowAction.emit({ action: 'save', row: null, rows: this.pendingSaveTrackedRows, column: null });
      this.toastService.show(message || 'Grid data was saved successfully.', 'success');
      this.requestLoad(false);
    } else {
      this.toastService.show(message || 'Unable to save grid data.', 'danger');
      this.rowAction.emit({ action: 'save-error', row: null, rows: this.pendingSaveTrackedRows, column: null });
    }

    this.pendingSaveTrackedRows = [];
    this.cdr.markForCheck();
  }

  addRow(): void {
    if (this.loading) {
      return;
    }

    this.appendNewRow();
  }

  toggleReviewChanges(): void {
    if (!this.canReviewChanges) {
      return;
    }

    this.reviewChangesOnly = !this.reviewChangesOnly;

    if (this.reviewChangesOnly) {
      this.pageBeforeReviewChanges = this.currentPage;
      this.currentPage = 1;
      this.refreshRowsForCurrentMode();
      this.rowAction.emit({ action: 'review-changes', row: null, rows: this.getChangedRows(), column: null });
      return;
    }

    this.currentPage = Math.max(1, this.pageBeforeReviewChanges);
    this.rowAction.emit({ action: 'review-all', row: null, rows: this.getTrackedRows(), column: null });

    if (!this.isLazy) {
      this.refreshRowsForCurrentMode();
      return;
    }

    this.requestLoad(false);
  }

  saveChanges(): void {
    if (!this.canSaveChanges) {
      return;
    }

    if (!this.validate()) {
      this.toastService.show('Please check and correct invalid fields before saving.', 'warning');
      return;
    }

    const trackedRows = this.getTrackedRows();
    const payload = this.getChangedRowsPayload();

    this.saving = true;
    this.cdr.markForCheck();

    this.saveRequestId += 1;
    this.pendingSaveRequestId = this.saveRequestId;
    this.pendingSaveTrackedRows = trackedRows;

    this.saveData.emit({ requestId: this.saveRequestId, rows: payload });
  }

  /** True if any tracked new/updated row is currently invalid — mirrors `SicFormData.invalid`, so both can be checked the same way from `sicFormCombine()`. */
  get invalid(): boolean {
    return this.hasInvalidTrackedRows();
  }

  get valid(): boolean {
    return !this.invalid;
  }

  /** Touches every tracked new/updated row's controls, so invalid ones show their error state — mirrors `SicFormData.markAllAsTouched()`. */
  markAllAsTouched(): void {
    this.validationRequested = true;
    this.touchVisibleControls();
    this.cdr.markForCheck();
  }

  /**
   * Touches every tracked row's controls and reports whether they're all valid —
   * without saving. Useful for validating several forms/grids together before a
   * combined submit, e.g. via `sicFormCombine()`.
   */
  validate(): boolean {
    this.markAllAsTouched();
    return this.valid;
  }

  /**
   * Reverts every pending new/updated/deleted row back to its last-known baseline
   * (also undoes a pending delete) — mirrors `SicFormData.restore()`. A brand-new
   * (never-saved) row has no baseline to revert to, so it's left as-is, same as
   * `SicFormData.restore()` leaving an `Added` row `Added`.
   */
  restore(): void {
    this.getTrackedRows().forEach((row) => {
      if (this.originalRowSnapshots.has(this.getRowKey(row))) {
        this.resetRow(row);
      }
    });
  }

  /** Discards every pending change, including brand-new rows — mirrors `SicFormData.reset()`. */
  reset(): void {
    this.restore();
    this.removeLocalAddedRows([...this.localAddedRows]);
  }

  /** The pending new/updated/deleted rows, in save order, as the same payload shape `(saveData)` receives — without triggering a save. */
  getChangedRowsPayload(): unknown[] {
    return this.getRowsToPersist().map((row) => this.buildSavePayload(row, this.toEntityState(this.getRowState(row))));
  }

  private getRowsToPersist(): SicGridRowData[] {
    return this.getTrackedRows()
      .filter((row) => {
        const state = this.getRowState(row);
        return state === 'new' || state === 'updated' || state === 'deleted';
      })
      .sort((leftRow, rightRow) => {
        const leftState = this.getRowState(leftRow);
        const rightState = this.getRowState(rightRow);
        return this.getPersistPriority(leftState) - this.getPersistPriority(rightState);
      });
  }

  deleteSelectedRows(): void {
    if (!this.canDeleteSelected) {
      return;
    }

    const rowsToDelete = this.selectedRows.filter((row) => !this.isRowDeleted(row) && !this.isRowDisabled(row));
    const localRowsToRemove = rowsToDelete.filter((row) => this.isLocalAddedRow(row));
    const persistedRowsToDelete = rowsToDelete.filter((row) => !this.isLocalAddedRow(row));

    persistedRowsToDelete.forEach((row) => {
      const rowKey = this.getRowKey(row);
      this.deletedRowIds.add(rowKey);
      this.persistRowChange(row);
      this.selectedRowIds.delete(rowKey);
      this.softDeleteChange.emit({ id: row[this.config.id], deleted: true, row });
      this.syncSelectionControlValue(row, false);
    });

    if (localRowsToRemove.length > 0) {
      this.removeLocalAddedRows(localRowsToRemove);
    }

    this.refreshRowsAfterTrackingChange();
    this.syncSelectAllState();
    this.rowsChange.emit(this.serializeRows());
    this.rowAction.emit({ action: 'soft-delete', row: null, rows: rowsToDelete, column: null });
  }

  sortBy(column: SicGridColumnConfig): void {
    if (column.sortable === false) {
      return;
    }

    if (this.sortField !== column.name) {
      this.sortField = column.name;
      this.sortDescending = false;
    } else if (this.sortDescending === false) {
      this.sortDescending = true;
    } else {
      this.applyDefaultSort();
    }

    if (this.reviewChangesOnly || !this.isLazy) {
      this.currentPage = 1;
      this.refreshRowsForCurrentMode();
      return;
    }

    this.requestLoad(true);
  }

  goToPreviousPage(): void {
    if (this.currentPage <= 1 || this.loading) {
      return;
    }

    this.currentPage -= 1;

    if (this.reviewChangesOnly || !this.isLazy) {
      this.refreshRowsForCurrentMode();
      return;
    }

    this.requestLoad(false);
  }

  goToNextPage(): void {
    if (this.currentPage >= this.totalPages || this.loading) {
      return;
    }

    this.currentPage += 1;

    if (this.reviewChangesOnly || !this.isLazy) {
      this.refreshRowsForCurrentMode();
      return;
    }

    this.requestLoad(false);
  }

  goToPage(page: number): void {
    if (this.loading || page < 1 || page > this.totalPages || page === this.currentPage) {
      return;
    }

    this.currentPage = page;

    if (this.reviewChangesOnly || !this.isLazy) {
      this.refreshRowsForCurrentMode();
      return;
    }

    this.requestLoad(false);
  }

  changePageSize(size: number): void {
    if (this.loading || size === this.pageSize) {
      this.syncPageSizeControl();
      return;
    }

    this.pageSize = size;
    this.currentPage = 1;
    this.syncPageSizeControl();

    if (this.reviewChangesOnly || !this.isLazy) {
      this.refreshRowsForCurrentMode();
      return;
    }

    this.requestLoad(false);
  }

  private syncPageSizeControl(): void {
    this.syncingPageSize = true;
    this.pageSizeControl.setValue(this.pageSize, { emitEvent: false });
    this.syncingPageSize = false;
  }

  isRowDeleted(row: any): boolean {
    return this.deletedRowIds.has(this.getRowKey(row));
  }

  isRowDisabled(row: SicGridRowData): boolean {
    return this.config.disableRow?.(row) === true;
  }

  isRowSelectDisabled(row: SicGridRowData, rowIndex: number): boolean {
    return this.isRowDisabled(row) || this.config.disableSelect?.(rowIndex, row) === true;
  }

  isRowSelected(row: any): boolean {
    return this.selectedRowIds.has(this.getRowKey(row));
  }

  canResetRow(row: SicGridRowData): boolean {
    const state = this.getRowState(row);
    return state === 'updated' || state === 'deleted';
  }

  isRowEditable(row: any): boolean {
    return !this.deletedRowIds.has(this.getRowKey(row)) && !this.isRowDisabled(row);
  }

  isCellEditable(row: any, column: SicGridColumnConfig): boolean {
    return column.editable === true && this.isRowEditable(row);
  }

  shouldRenderCellField(row: any, column: SicGridColumnConfig): boolean {
    return column.editable === true;
  }

  isCellReadonly(row: any, column: SicGridColumnConfig, rowIndex: number): boolean {
    return (
      this.shouldRenderCellField(row, column) &&
      (this.isRowDisabled(row) || this.isRowDeleted(row) || this.config.disableEdit?.(rowIndex, column.name, row[column.name], row) === true)
    );
  }

  getRowState(row: any): SicGridRowState {
    const rowKey = this.getRowKey(row);
    if (this.deletedRowIds.has(rowKey)) {
      return 'deleted';
    }

    if (!this.originalRowSnapshots.has(rowKey)) {
      return 'new';
    }

    if (this.hasRowChanged(row)) {
      return 'updated';
    }

    return 'active';
  }

  toggleSoftDelete(row: any, column: SicGridColumnConfig): void {
    if (this.isRowDisabled(row)) {
      return;
    }

    if (this.isLocalAddedRow(row)) {
      this.removeLocalAddedRows([row]);
      this.rowsChange.emit(this.serializeRows());
      this.rowAction.emit({ action: 'remove', row, rows: [row], column });
      return;
    }

    const rowKey = this.getRowKey(row);
    const deleted = !this.deletedRowIds.has(rowKey);

    if (deleted) {
      this.deletedRowIds.add(rowKey);
    } else {
      this.deletedRowIds.delete(rowKey);
    }

    this.persistRowChange(row);
    this.rowsChange.emit(this.serializeRows());
    this.refreshRowsAfterTrackingChange();
    this.softDeleteChange.emit({ id: row[this.config.id], deleted, row });
    this.rowAction.emit({ action: deleted ? 'soft-delete' : 'restore', row, rows: [row], column });
  }

  triggerRowAction(action: SicGridColumnAction, row: any, column: SicGridColumnConfig): void {
    this.rowAction.emit({ action: action.name, row, rows: [row], column });
  }

  handleValueChange(row: any, column: SicGridColumnConfig, rawValue: unknown): void {
    row[column.name] = this.coerceValue(column, rawValue);
    this.syncControlValue(row, column, row[column.name]);
    this.rowsChange.emit(this.serializeRows());
    this.refreshRowsAfterTrackingChange();
  }

  resetRow(row: SicGridRowData): void {
    const rowKey = this.getRowKey(row);
    const wasDeleted = this.deletedRowIds.has(rowKey);
    const originalSnapshot = this.originalRowSnapshots.get(rowKey);
    if (!originalSnapshot) {
      return;
    }

    const originalRow = JSON.parse(originalSnapshot) as Record<string, unknown>;
    for (const key of Object.keys(row)) {
      if (key.startsWith('__')) {
        continue;
      }

      if (!(key in originalRow)) {
        delete row[key];
      }
    }

    Object.assign(row, originalRow);

    if (wasDeleted) {
      this.deletedRowIds.delete(rowKey);
      this.selectedRowIds.delete(rowKey);
      this.softDeleteChange.emit({ id: row[this.config.id], deleted: false, row });
      this.rowAction.emit({ action: 'restore', row, rows: [row], column: null });
    }

    this.visibleColumns.forEach((column) => {
      this.syncControlValue(row, column, this.getRowValue(row, column));
    });

    this.persistRowChange(row);
    this.rowsChange.emit(this.serializeRows());
    this.refreshRowsForCurrentMode();
  }

  trackRow = (_index: number, row: any): string => this.getRowKey(row);
  trackColumn = (_index: number, column: SicGridColumnConfig): string => `${column.name}-${column.type}`;

  formatCellValue(row: any, column: SicGridColumnConfig): string {
    const value = row[column.name];
    if (value === null || value === undefined || value === '') {
      return '-';
    }

    switch (column.type) {
      case 'date':
        return this.datePipe.transform(value, column.dateFormat ?? this.sicConfig.dateFormat ?? 'dd/MM/yyyy') ?? '-';
      case 'time':
        return this.datePipe.transform(`1970-01-01T${value}`, 'HH:mm') ?? `${value}`;
      case 'number':
        return typeof value === 'number' ? this.formatNumber(value, column.decimals ?? this.sicConfig.decimals ?? 2) : `${value}`;
      case 'checkbox':
      case 'switch':
        return value ? 'Yes' : 'No';
      case 'upload':
        return Array.isArray(value) && value.length > 0 ? `${value.length} file(s)` : '-';
      case 'combobox':
      case 'radio':
        return this.resolveOptionLabel(column, value);
      default:
        return `${value}`;
    }
  }

  private formatNumber(value: number, decimals: number): string {
    return new Intl.NumberFormat(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(value);
  }

  getCellTemplate(column: SicGridColumnConfig): TemplateRef<unknown> | null {
    return this.findTemplate(this.resolveTemplateName(column), 'cell');
  }

  getHeaderTemplate(column: SicGridColumnConfig): TemplateRef<unknown> | null {
    return this.findTemplate(this.resolveTemplateName(column), 'header');
  }

  getFooterTemplate(column: SicGridColumnConfig): TemplateRef<unknown> | null {
    return this.findTemplate(this.resolveTemplateName(column), 'footer');
  }

  isBuiltInType(type: string): boolean {
    return ['text', 'area', 'number', 'date', 'time', 'color', 'upload', 'combobox', 'checkbox', 'radio', 'switch', 'action', 'button'].includes(type);
  }

  isSortedAsc(column: SicGridColumnConfig): boolean {
    return this.sortField === column.name && !this.sortDescending;
  }

  isSortedDesc(column: SicGridColumnConfig): boolean {
    return this.sortField === column.name && this.sortDescending;
  }

  hasSummary(column: SicGridColumnConfig): boolean {
    return !!this.config?.summaryPage?.some((summary) => summary.column === column.name);
  }

  /** Aggregates `this.rows` (the currently loaded page) per `config.summaryPage`. */
  getSummaryText(column: SicGridColumnConfig): string | null {
    const summaryConfig = this.config?.summaryPage?.find((summary) => summary.column === column.name);
    return this.formatSummaryValue(summaryConfig, column, this.rows);
  }

  getSummaryAlign(column: SicGridColumnConfig): 'left' | 'center' | 'right' {
    return this.resolveSummaryAlign(this.config?.summaryPage, column);
  }

  get hasGrandSummary(): boolean {
    return !!this.config?.summary?.columns?.length;
  }

  /**
   * Rows the grid actually holds — the full dataset in `lazy: false` mode,
   * or just the pages fetched so far in `lazy: true` mode (see the
   * `summary` doc comment on SicGridPanelConfig for why that's the ceiling).
   */
  private get knownRows(): SicGridRowData[] {
    return [...this.latestServerRows, ...this.localAddedRows];
  }

  get showGrandSummaryRow(): boolean {
    if (!this.hasGrandSummary) {
      return false;
    }

    if (this.config?.summary?.showOn === 'last') {
      return this.currentPage >= this.totalPages;
    }

    return true;
  }

  hasGrandSummaryColumn(column: SicGridColumnConfig): boolean {
    return !!this.config?.summary?.columns?.some((summary) => summary.column === column.name);
  }

  /** Aggregates `knownRows` (see above) per `config.summary.columns`. */
  getGrandSummaryText(column: SicGridColumnConfig): string | null {
    const summaryConfig = this.config?.summary?.columns?.find((summary) => summary.column === column.name);
    return this.formatSummaryValue(summaryConfig, column, this.knownRows);
  }

  getGrandSummaryAlign(column: SicGridColumnConfig): 'left' | 'center' | 'right' {
    return this.resolveSummaryAlign(this.config?.summary?.columns, column);
  }

  private resolveSummaryAlign(summaryConfigs: SicGridSummaryConfig[] | undefined, column: SicGridColumnConfig): 'left' | 'center' | 'right' {
    const summaryConfig = summaryConfigs?.find((summary) => summary.column === column.name);
    if (summaryConfig?.align) {
      return summaryConfig.align;
    }

    return column.type === 'number' ? 'right' : 'left';
  }

  private formatSummaryValue(summaryConfig: SicGridSummaryConfig | undefined, column: SicGridColumnConfig, rows: SicGridRowData[]): string | null {
    if (!summaryConfig) {
      return null;
    }

    const value = this.calculateSummaryValue(summaryConfig, rows);
    if (summaryConfig.formatter) {
      return summaryConfig.formatter(value, rows);
    }

    // 'count' is a row count, not a value of the column's own type — always
    // a plain integer. sum/avg/min/max/custom aggregate the column's own
    // values, so format them the same way the column itself displays them
    // (e.g. its `decimals`) instead of a separately-configured precision.
    const decimals =
      summaryConfig.type === 'count'
        ? 0
        : column.type === 'number'
          ? column.decimals ?? this.sicConfig.decimals ?? 2
          : summaryConfig.decimals ?? 0;
    const formatted = this.formatNumber(value, decimals);

    return summaryConfig.label ? `${summaryConfig.label} ${formatted}` : formatted;
  }

  private calculateSummaryValue(summaryConfig: SicGridSummaryConfig, rows: SicGridRowData[]): number {
    if (summaryConfig.type === 'custom') {
      return summaryConfig.calculate?.(rows) ?? 0;
    }

    if (summaryConfig.type === 'count') {
      return rows.length;
    }

    const values = rows
      .map((row) => Number(row[summaryConfig.column]))
      .filter((value) => !Number.isNaN(value));

    switch (summaryConfig.type) {
      case 'sum':
        return values.reduce((sum, value) => sum + value, 0);
      case 'avg':
        return values.length > 0 ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
      case 'min':
        return values.length > 0 ? Math.min(...values) : 0;
      case 'max':
        return values.length > 0 ? Math.max(...values) : 0;
      default:
        return 0;
    }
  }

  getControl(row: any, column: SicGridColumnConfig, rowIndex: number): FormControl {
    const controlKey = this.getControlKey(row, column);
    const existing = this.controlMap.get(controlKey);
    if (existing) {
      this.syncControlDisabledState(row, column, rowIndex, existing);
      return existing;
    }

    const control = new FormControl(
      { value: this.getRowValue(row, column), disabled: this.isCellReadonly(row, column, rowIndex) },
      {
        validators: this.resolveValidators(column),
        asyncValidators: this.resolveAsyncValidators(column),
      },
    );

    if (this.validationRequested) {
      control.markAsTouched();
      control.updateValueAndValidity({ emitEvent: false });
    }

    const savedState = this.controlStateMap.get(controlKey);
    if (savedState?.dirty) {
      control.markAsDirty({ onlySelf: true });
    }
    if (savedState?.touched) {
      control.markAsTouched({ onlySelf: true });
    }
    if (savedState) {
      control.updateValueAndValidity({ emitEvent: false });
    }

    const subscription = control.valueChanges.subscribe((value) => {
      row[column.name] = this.coerceValue(column, value);
      this.persistRowChange(row);
      this.controlStateMap.set(controlKey, {
        touched: control.touched,
        dirty: control.dirty,
      });
      this.rowsChange.emit(this.serializeRows());
      this.refreshRowsAfterTrackingChange();
    });

    this.controlMap.set(controlKey, control);
    this.controlSubscriptions.set(controlKey, subscription);

    return control;
  }

  getSelectionControl(row: any, rowIndex: number): FormControl {
    const rowKey = this.getRowKey(row);
    const existing = this.selectionControlMap.get(rowKey);
    if (existing) {
      this.syncSelectionControlDisabledState(row, rowIndex, existing);
      return existing;
    }

    const shouldBeSelected = !this.isRowSelectDisabled(row, rowIndex) && !this.isRowDeleted(row) && this.selectedRowIds.has(rowKey);
    const control = new FormControl(shouldBeSelected);
    const subscription = control.valueChanges.subscribe((checked) => {
      if (this.syncingSelectionState) {
        return;
      }

      if (this.isRowDeleted(row)) {
        this.syncSelectionControlValue(row, false);
        return;
      }

      if (this.isRowSelectDisabled(row, rowIndex)) {
        this.selectedRowIds.delete(rowKey);
        this.syncSelectionControlValue(row, false);
        return;
      }

      if (checked === true) {
        this.selectedRowIds.add(rowKey);
      } else {
        this.selectedRowIds.delete(rowKey);
      }

      this.syncSelectAllState();
      this.cdr.markForCheck();
    });

    this.selectionControlMap.set(rowKey, control);
    this.selectionSubscriptions.set(rowKey, subscription);
    this.syncSelectionControlDisabledState(row, rowIndex, control);
    return control;
  }

  toRadioOptions(column: SicGridColumnConfig): SicRadioOption[] {
    return (column.options ?? []).map((option) => ({
      value: option.value,
      name: option.label,
    }));
  }

  getRadioOptions(column: SicGridColumnConfig): SicRadioOption[] {
    const cached = this.radioOptionsCache.get(column);
    if (cached && cached.source === column.options) {
      return cached.mapped;
    }

    const mapped = this.toRadioOptions(column);
    this.radioOptionsCache.set(column, { source: column.options, mapped });
    return mapped;
  }

  getComboboxOptions(column: SicGridColumnConfig): SicGridOption[] {
    const cached = this.comboboxOptionsCache.get(column);
    if (cached && cached.source === column.options) {
      return cached.mapped;
    }

    const mapped = column.options ?? [];
    this.comboboxOptionsCache.set(column, { source: column.options, mapped });
    return mapped;
  }

  protected resolveTemplateName(column: SicGridColumnConfig): string {
    return column.customTemplate || (this.isBuiltInType(column.type) ? column.name : column.type);
  }

  private requestLoad(resetPage: boolean): void {
    if (resetPage) {
      this.currentPage = 1;
    }

    this.loading = true;
    this.cdr.markForCheck();

    this.loadRequestId += 1;
    this.pendingLoadRequestId = this.loadRequestId;

    this.loadData.emit({
      requestId: this.loadRequestId,
      pageNumber: this.currentPage,
      pageSize: this.pageSize,
      sortField: this.sortField,
      sortDescending: this.sortDescending,
      keyword: this.config?.keyword ?? null,
      params: this.config?.params ?? null,
    });
  }

  private applyDefaultSort(): void {
    this.sortField = this.config?.defaultSortField ?? this.config?.id ?? null;
    this.sortDescending = this.config?.defaultSortDescending ?? false;
  }

  private touchVisibleControls(): void {
    this.controlMap.forEach((control) => {
      control.markAsTouched();
      // emitEvent: true (default) — the bound field component reacts to
      // statusChanges to refresh its red-border/error text; markAsTouched()
      // alone never notifies it.
      control.updateValueAndValidity();
    });

    this.captureCurrentControlStates();
    this.touchOffScreenTrackedRows();
  }

  /**
   * `controlMap` only holds FormControls for rows on the current page/mode —
   * seed `controlStateMap` (touched) for editable columns of every other
   * tracked new/updated row too, so once that row is rendered later (page
   * change, review-changes toggle, etc.) `getControl()` reconstructs it
   * already touched and its red-border/error state shows immediately.
   */
  private touchOffScreenTrackedRows(): void {
    this.getRowsNeedingValidation().forEach((row) => {
      this.visibleColumns.forEach((column) => {
        if (!this.isEditableColumn(column)) {
          return;
        }

        const controlKey = this.getControlKey(row, column);
        if (this.controlMap.has(controlKey)) {
          return;
        }

        this.controlStateMap.set(controlKey, { touched: true, dirty: true });
      });
    });
  }

  private captureCurrentControlStates(): void {
    this.controlMap.forEach((control, controlKey) => {
      this.controlStateMap.set(controlKey, {
        touched: control.touched,
        dirty: control.dirty,
      });
    });
  }

  private isEditableColumn(column: SicGridColumnConfig): boolean {
    return column.editable === true && column.type !== 'action' && column.type !== 'button';
  }

  private getRowsNeedingValidation(): SicGridRowData[] {
    return this.getTrackedRows().filter((row) => {
      const state = this.getRowState(row);
      return state === 'new' || state === 'updated';
    });
  }

  /** Checks currently-rendered controls plus tracked rows that aren't on this page/mode right now. */
  private hasInvalidTrackedRows(): boolean {
    for (const control of this.controlMap.values()) {
      if (control.invalid) {
        return true;
      }
    }

    for (const row of this.getRowsNeedingValidation()) {
      for (const column of this.visibleColumns) {
        if (!this.isEditableColumn(column)) {
          continue;
        }

        const controlKey = this.getControlKey(row, column);
        if (this.controlMap.has(controlKey)) {
          continue;
        }

        const validators = this.resolveValidators(column);
        if (validators.length === 0) {
          continue;
        }

        const probe = new FormControl(this.getRowValue(row, column), { validators });
        if (probe.invalid) {
          return true;
        }
      }
    }

    return false;
  }

  private buildSavePayload(row: SicGridRowData, state: SicGridPersistState): unknown {
    const payload = this.toSerializableRow(row);
    payload['State'] = state;
    return payload;
  }

  private toEntityState(state: SicGridRowState): SicGridPersistState {
    if (state === 'new') {
      return 4;
    }

    if (state === 'updated') {
      return 3;
    }

    return 2;
  }

  private getPersistPriority(state: SicGridRowState): number {
    if (state === 'deleted') {
      return 0;
    }

    if (state === 'updated') {
      return 1;
    }

    if (state === 'new') {
      return 2;
    }

    return 3;
  }

  private resolveValidators(column: SicGridColumnConfig): ValidatorFn[] {
    return this.normalizeValidatorFns(column.validator, column.validators);
  }

  private resolveAsyncValidators(column: SicGridColumnConfig): AsyncValidatorFn[] {
    return this.normalizeValidatorFns(column.asyncValidator, column.asyncValidators);
  }

  private normalizeValidatorFns<TValidator>(...validators: Array<TValidator | TValidator[] | null | undefined>): TValidator[] {
    return validators.flatMap((validator) => {
      if (!validator) {
        return [];
      }

      return Array.isArray(validator) ? validator : [validator];
    });
  }

  private updateGridTemplateColumns(): void {
    const selectionColumnWidth = 72;
    const columns = this.visibleColumns;
    if (columns.length === 0) {
      this.gridTemplateColumns = `${selectionColumnWidth}px`;
      this.gridColumnsFixedWidth = false;
      return;
    }

    const widths = columns.map((column) => this.resolveColumnWidth(column));
    const totalWidth = widths.reduce((sum, width) => sum + width, 0);
    const hostWidth = this.surfaceRef?.nativeElement.clientWidth || this.getFallbackHostWidth();
    const totalGridWidth = totalWidth + selectionColumnWidth;

    if (hostWidth > 0 && totalGridWidth <= hostWidth) {
      const remainingWidth = `calc(100% - ${selectionColumnWidth}px)`;
      const proportionalColumns = columns
        .map((column, index) => {
          const minWidth = Math.max(0, column.minWidth ?? 0);
          const share = widths[index] / totalWidth;
          return `minmax(${minWidth}px, calc(${remainingWidth} * ${share.toFixed(6)}))`;
        })
        .join(' ');
      this.gridTemplateColumns = `${selectionColumnWidth}px ${proportionalColumns}`;
      this.gridColumnsFixedWidth = false;
      return;
    }

    const fixedColumns = columns
      .map((column, index) => Math.max(widths[index], column.minWidth ?? 0))
      .map((width) => `${width}px`)
      .join(' ');
    this.gridTemplateColumns = `${selectionColumnWidth}px ${fixedColumns}`;
    this.gridColumnsFixedWidth = true;
  }

  private getFallbackHostWidth(): number {
    const nativeElement = this.surfaceRef?.nativeElement.parentElement;
    return nativeElement?.clientWidth ?? 0;
  }

  protected resolveColumnWidth(column: SicGridColumnConfig): number {
    if (typeof column.width === 'number' && column.width > 0) {
      return column.width;
    }

    switch (column.type) {
      case 'checkbox':
      case 'switch':
        return 90;
      case 'action':
      case 'button':
        return 150;
      case 'color':
        return 160;
      case 'upload':
        return 340;
      case 'number':
      case 'date':
      case 'time':
        return 130;
      default:
        return 180;
    }
  }

  private findTemplate(name: string, section: SicGridPanelTemplateSection): TemplateRef<unknown> | null {
    if (!this.templatesReady || !name) {
      return null;
    }

    return this.templates?.find((template) => template.name === name && template.section === section)?.template ?? null;
  }

  private resolveOptionLabel(column: SicGridColumnConfig, value: unknown): string {
    const optionLabel = column.options?.find((option) => option.value === value)?.label;
    if (optionLabel) {
      return optionLabel;
    }

    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      return String(value);
    }

    return '-';
  }

  private coerceValue(column: SicGridColumnConfig, rawValue: unknown): unknown {
    switch (column.type) {
      case 'number':
        return rawValue === '' || rawValue === null ? null : Number(rawValue);
      default:
        return rawValue;
    }
  }

  private rebuildControls(): void {
    this.disposeControls();

    this.rows.forEach((row, rowIndex) => {
      this.visibleColumns.forEach((column) => {
        if (!column.editable || column.type === 'action' || column.type === 'button') {
          return;
        }

        this.getControl(row, column, rowIndex);
      });
    });
  }

  private rebuildSelectionControls(): void {
    this.disposeSelectionControls();

    this.rows.forEach((row, rowIndex) => {
      this.getSelectionControl(row, rowIndex);
    });

    this.syncSelectAllState();
  }

  private syncControlValue(row: any, column: SicGridColumnConfig, value: unknown): void {
    const control = this.controlMap.get(this.getControlKey(row, column));
    if (!control || control.value === value) {
      return;
    }

    control.setValue(value, { emitEvent: false });
  }

  private disposeControls(): void {
    this.captureCurrentControlStates();
    this.controlSubscriptions.forEach((subscription) => subscription.unsubscribe());
    this.controlSubscriptions.clear();
    this.controlMap.clear();
  }

  private disposeSelectionControls(): void {
    this.selectionSubscriptions.forEach((subscription) => subscription.unsubscribe());
    this.selectionSubscriptions.clear();
    this.selectionControlMap.clear();
  }

  private toggleSelectAll(checked: boolean): void {
    this.rows.forEach((row, rowIndex) => {
      if (this.isRowDeleted(row) || this.isRowSelectDisabled(row, rowIndex)) {
        this.selectedRowIds.delete(this.getRowKey(row));
        this.syncSelectionControlValue(row, false);
        return;
      }

      if (checked) {
        this.selectedRowIds.add(this.getRowKey(row));
      } else {
        this.selectedRowIds.delete(this.getRowKey(row));
      }

      this.syncSelectionControlValue(row, checked);
    });

    this.cdr.markForCheck();
  }

  private syncSelectAllState(): void {
    const selectableRows = this.rows.filter((row, rowIndex) => !this.isRowDeleted(row) && !this.isRowSelectDisabled(row, rowIndex));
    const shouldSelectAll = selectableRows.length > 0 && selectableRows.every((row) => this.selectedRowIds.has(this.getRowKey(row)));
    this.syncSelectAllControlDisabledState();

    this.syncingSelectionState = true;
    this.selectAllControl.setValue(shouldSelectAll, { emitEvent: false });
    this.syncingSelectionState = false;
  }

  private syncSelectAllControlDisabledState(): void {
    const shouldDisable = this.loading || this.selectableCount === 0;
    if (shouldDisable) {
      this.syncingSelectionState = true;
      this.selectAllControl.setValue(false, { emitEvent: false });
      this.syncingSelectionState = false;
      this.selectAllControl.disable({ emitEvent: false });
      return;
    }

    this.selectAllControl.enable({ emitEvent: false });
  }

  private syncSelectionControlValue(row: any, checked: boolean): void {
    const control = this.selectionControlMap.get(this.getRowKey(row));
    if (!control || control.value === checked) {
      return;
    }

    this.syncingSelectionState = true;
    control.setValue(checked, { emitEvent: false });
    this.syncingSelectionState = false;
  }

  private syncSelectionControlDisabledState(row: any, rowIndex: number, control: FormControl): void {
    if (this.isRowDeleted(row) || this.isRowSelectDisabled(row, rowIndex)) {
      this.selectedRowIds.delete(this.getRowKey(row));
      this.syncSelectionControlValue(row, false);
      control.disable({ emitEvent: false });
      return;
    }

    control.enable({ emitEvent: false });
  }

  private syncControlDisabledState(row: any, column: SicGridColumnConfig, rowIndex: number, control: FormControl): void {
    if (this.isCellReadonly(row, column, rowIndex)) {
      control.disable({ emitEvent: false });
      return;
    }

    control.enable({ emitEvent: false });
  }

  private appendNewRow(): void {
    const row = this.createEmptyRow();
    this.localAddedRows.push(row);
    this.totalElements = this.serverTotalElements + this.localAddedRows.length;
    this.totalPages = this.resolveCombinedTotalPages();

    if (this.reviewChangesOnly) {
      this.currentPage = this.resolveReviewTargetPage();
      this.refreshRowsForCurrentMode();
      this.rowsChange.emit(this.serializeRows());
      this.rowAction.emit({ action: 'add', row, rows: [row], column: null });
      return;
    }

    const targetPage = this.totalPages;
    if (this.showPager && this.currentPage !== targetPage) {
      this.currentPage = targetPage;

      if (this.isLazy) {
        this.requestLoad(false);
        return;
      }
    }

    this.refreshVisibleRows();
    this.rebuildControls();
    this.rebuildSelectionControls();

    this.syncSelectAllState();
    this.rowsChange.emit(this.serializeRows());
    this.rowAction.emit({ action: 'add', row, rows: [row], column: null });
    this.cdr.markForCheck();
  }

  private createEmptyRow(): Record<string, unknown> {
    const rowDefaults = typeof this.config.createRowValue === 'function'
      ? this.config.createRowValue()
      : (this.config.createRowValue ?? {});

    const row: Record<string, unknown> = {
      ...rowDefaults,
      [this.config.id]: rowDefaults[this.config.id] ?? null,
    };

    this.visibleColumns.forEach((column) => {
      if (column.name in row) {
        return;
      }

      switch (column.type) {
        case 'checkbox':
        case 'switch':
          row[column.name] = column.uncheckedValue ?? false;
          break;
        case 'number':
          row[column.name] = null;
          break;
        default:
          row[column.name] = null;
          break;
      }
    });

    return row;
  }

  private getControlKey(row: any, column: SicGridColumnConfig): SicGridCellControlKey {
    return `${this.getRowKey(row)}:${column.name}`;
  }

  private getRowValue(row: any, column: SicGridColumnConfig): unknown {
    const value = row[column.name];
    if (value === undefined) {
      return null;
    }

    return value;
  }

  private getRowKey(row: any): string {
    const explicitId = row?.[this.config.id];
    if (explicitId !== null && explicitId !== undefined && `${explicitId}`.trim() !== '') {
      return `${explicitId}`;
    }

    if (typeof row === 'object' && row !== null) {
      const existingKey = this.rowKeys.get(row);
      if (existingKey) {
        return existingKey;
      }

      this.rowKeySequence += 1;
      const generatedKey = `row-${this.rowKeySequence}`;
      this.rowKeys.set(row, generatedKey);
      return generatedKey;
    }

    return '';
  }

  private captureOriginalSnapshots(rows: SicGridRowData[]): void {
    rows.forEach((row) => {
      this.originalRowSnapshots.set(this.getRowKey(row), this.serializeComparableRow(row));
    });
  }

  private refreshVisibleRows(): void {
    if (this.reviewChangesOnly) {
      const changedRows = this.getSortedChangedRows();
      const totalPages = this.resolveReviewTotalPages();
      this.totalElements = changedRows.length;
      this.totalPages = totalPages;
      this.currentPage = Math.min(this.currentPage, totalPages);

      const pageStartIndex = this.showPager ? (this.currentPage - 1) * this.pageSize : 0;
      const pageEndIndex = this.showPager ? pageStartIndex + this.pageSize : changedRows.length;
      this.rows.splice(0, this.rows.length, ...changedRows.slice(pageStartIndex, pageEndIndex));
      return;
    }

    if (!this.isLazy) {
      const combinedRows = this.sortRows([...this.latestServerRows, ...this.localAddedRows]);
      this.totalElements = combinedRows.length;
      this.totalPages = this.showPager ? Math.max(1, Math.ceil(combinedRows.length / this.pageSize)) : 1;
      this.currentPage = Math.min(this.currentPage, this.totalPages);

      const pageStartIndex = this.showPager ? (this.currentPage - 1) * this.pageSize : 0;
      const pageEndIndex = this.showPager ? pageStartIndex + this.pageSize : combinedRows.length;
      this.rows.splice(0, this.rows.length, ...combinedRows.slice(pageStartIndex, pageEndIndex));
      return;
    }

    const localRows = this.resolveLocalRowsForCurrentPage();
    this.rows.splice(0, this.rows.length, ...this.latestServerRows, ...localRows);
  }

  private moveToPreviousPageIfEmpty(): void {
    if (this.currentPage <= 1 || this.rows.length > 0) {
      return;
    }

    this.currentPage -= 1;

    if (this.showPager && this.isLazy) {
      this.requestLoad(false);
      return;
    }

    this.refreshVisibleRows();
  }

  private resolveLocalRowsForCurrentPage(): SicGridRowData[] {
    if (!this.showPager) {
      return this.localAddedRows;
    }

    const pageStartIndex = (this.currentPage - 1) * this.pageSize;
    const pageEndIndex = pageStartIndex + this.pageSize;
    const localStartIndex = Math.max(0, pageStartIndex - this.serverTotalElements);
    const localEndIndex = Math.max(0, pageEndIndex - this.serverTotalElements);

    return this.localAddedRows.slice(localStartIndex, localEndIndex);
  }

  private resolveCombinedTotalPages(): number {
    return this.showPager ? Math.max(1, Math.ceil((this.serverTotalElements + this.localAddedRows.length) / this.pageSize)) : 1;
  }

  private resetTrackedStateAfterSave(targetPage: number): void {
    this.deletedRowIds.clear();
    this.selectedRowIds.clear();
    this.localAddedRows.splice(0, this.localAddedRows.length);
    this.localUpdatedRows.clear();
    this.originalRowSnapshots.clear();
    this.controlStateMap.clear();
    this.latestServerRows = [];
    this.serverTotalElements = 0;
    this.reviewChangesOnly = false;
    this.currentPage = Math.max(1, targetPage);
    this.pageBeforeReviewChanges = this.currentPage;
    this.rows.splice(0, this.rows.length);
    this.totalElements = 0;
    this.totalPages = 1;
    this.disposeControls();
    this.disposeSelectionControls();
    this.syncSelectAllState();
  }

  private isLocalAddedRow(row: SicGridRowData): boolean {
    const rowKey = this.getRowKey(row);
    return !this.originalRowSnapshots.has(rowKey) && this.localAddedRows.some((localRow) => this.getRowKey(localRow) === rowKey);
  }

  private removeLocalAddedRows(rows: SicGridRowData[]): void {
    if (rows.length === 0) {
      return;
    }

    const previousPage = this.currentPage;

    const rowKeysToRemove = new Set(rows.map((row) => this.getRowKey(row)));
    const remainingLocalRows = this.localAddedRows.filter((row) => !rowKeysToRemove.has(this.getRowKey(row)));

    this.localAddedRows.splice(0, this.localAddedRows.length, ...remainingLocalRows);
    rowKeysToRemove.forEach((rowKey) => {
      this.selectedRowIds.delete(rowKey);
      this.deletedRowIds.delete(rowKey);
      this.localUpdatedRows.delete(rowKey);
    });

    this.totalElements = this.serverTotalElements + this.localAddedRows.length;
    this.totalPages = this.resolveCombinedTotalPages();
    this.currentPage = Math.min(this.currentPage, this.totalPages);

    if (this.reviewChangesOnly) {
      this.currentPage = Math.min(this.currentPage, this.resolveReviewTotalPages());
      this.refreshRowsForCurrentMode();
      return;
    }

    if (this.showPager && this.isLazy && this.currentPage !== previousPage) {
      this.requestLoad(false);
      return;
    }

    this.refreshVisibleRows();

    if (this.rows.length === 0 && this.currentPage > 1) {
      this.moveToPreviousPageIfEmpty();
      return;
    }

    this.rebuildControls();
    this.rebuildSelectionControls();
    this.cdr.markForCheck();
  }

  private persistRowChange(row: SicGridRowData): void {
    const rowKey = this.getRowKey(row);
    if (!this.originalRowSnapshots.has(rowKey)) {
      return;
    }

    if (this.hasRowChanged(row) || this.deletedRowIds.has(rowKey)) {
      // Store the live row reference (not a copy) — it's the same object held
      // in `latestServerRows`/`rows`, so further in-place edits or a reset
      // while in review mode stay in sync instead of drifting from a frozen
      // snapshot that `latestServerRows` never sees.
      this.localUpdatedRows.set(rowKey, row);
      return;
    }

    this.localUpdatedRows.delete(rowKey);
  }

  private refreshRowsForCurrentMode(): void {
    this.refreshVisibleRows();
    this.rebuildControls();
    this.rebuildSelectionControls();
    this.syncSelectAllState();
    this.cdr.markForCheck();
  }

  private refreshRowsAfterTrackingChange(): void {
    if (!this.reviewChangesOnly) {
      return;
    }

    this.currentPage = Math.min(this.currentPage, this.resolveReviewTotalPages());
    this.refreshRowsForCurrentMode();
  }

  private hasRowChanged(row: any): boolean {
    const originalSnapshot = this.originalRowSnapshots.get(this.getRowKey(row));
    if (!originalSnapshot) {
      return false;
    }

    return originalSnapshot !== this.serializeComparableRow(row);
  }

  private serializeComparableRow(row: any): string {
    return JSON.stringify(this.toSerializableRow(row));
  }

  private toSerializableRow(row: SicGridRowData): Record<string, unknown> {
    const comparableEntries = Object.entries(row)
      .filter(([key]) => !key.startsWith('__'))
      .sort(([leftKey], [rightKey]) => leftKey.localeCompare(rightKey));

    return Object.fromEntries(comparableEntries);
  }

  private getTrackedRows(): SicGridRowData[] {
    const trackedRows = new Map<string, SicGridRowData>();

    [...this.localAddedRows, ...this.localUpdatedRows.values()].forEach((row) => {
      trackedRows.set(this.getRowKey(row), row);
    });

    return Array.from(trackedRows.values());
  }

  private getChangedRows(): SicGridRowData[] {
    return this.getTrackedRows().filter((row) => {
      const state = this.getRowState(row);
      return state === 'new' || state === 'updated' || state === 'deleted';
    });
  }

  private getSortedChangedRows(): SicGridRowData[] {
    return this.sortRows(this.getChangedRows());
  }

  private sortRows(rows: SicGridRowData[]): SicGridRowData[] {
    if (!this.sortField) {
      return rows;
    }

    const sortField = this.sortField;

    return [...rows].sort((leftRow, rightRow) => {
      const leftIsEmpty = this.isEmptySortValue(leftRow[sortField]);
      const rightIsEmpty = this.isEmptySortValue(rightRow[sortField]);

      if (leftIsEmpty && rightIsEmpty) {
        return 0;
      }

      if (leftIsEmpty) {
        return 1;
      }

      if (rightIsEmpty) {
        return -1;
      }

      const comparison = this.compareSortValues(leftRow[sortField], rightRow[sortField]);
      return this.sortDescending ? comparison * -1 : comparison;
    });
  }

  private compareSortValues(leftValue: unknown, rightValue: unknown): number {
    if (leftValue === rightValue) {
      return 0;
    }

    if (typeof leftValue === 'number' && typeof rightValue === 'number') {
      return leftValue - rightValue;
    }

    if (typeof leftValue === 'boolean' && typeof rightValue === 'boolean') {
      return Number(leftValue) - Number(rightValue);
    }

    return this.normalizeSortValue(leftValue).localeCompare(this.normalizeSortValue(rightValue), undefined, { numeric: true, sensitivity: 'base' });
  }

  private isEmptySortValue(value: unknown): boolean {
    return value === null || value === undefined || value === '';
  }

  private normalizeSortValue(value: unknown): string {
    if (value instanceof Date) {
      return value.toISOString();
    }

    if (typeof value === 'string') {
      return value;
    }

    if (typeof value === 'number' || typeof value === 'boolean' || typeof value === 'bigint') {
      return `${value}`;
    }

    if (typeof value === 'object' && value !== null) {
      return JSON.stringify(value);
    }

    if (typeof value === 'symbol') {
      return value.description ?? value.toString();
    }

    return '';
  }

  private resolveReviewTotalPages(): number {
    return this.showPager ? Math.max(1, Math.ceil(this.getChangedRows().length / this.pageSize)) : 1;
  }

  private resolveReviewTargetPage(): number {
    return this.showPager ? Math.max(1, Math.ceil(this.getChangedRows().length / this.pageSize)) : 1;
  }

  private serializeRows(): any[] {
    return this.getTrackedRows().map((row) => ({
      ...row,
      __state: this.getRowState(row),
    }));
  }
}
