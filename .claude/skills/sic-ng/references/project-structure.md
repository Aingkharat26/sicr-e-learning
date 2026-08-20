# Project Structure

มาตรฐานการตั้งชื่อไฟล์ต่อ 1 หน้า (page/feature) ในโปรเจกต์ที่ใช้ sic-ng

## Search + Grid Pattern — `standard search`

_Category: Setup_

รูปแบบมาตรฐานของหน้าค้นหา ตั้งชื่อไฟล์แบบเดียวกับ "standard form" ทุกประการ (pageName.model.ts/.form.ts/.service.ts/.resolver.ts/.routes.ts/.component.ts/.html/.css) แค่ pageName เป็น "employee-search" — แบ่งเป็น 2 ส่วนเสมอ: (1) Criteria — card หัวข้อ "เงื่อนไข" มีฟอร์มตัวกรอง (ฟิลด์แบบเลือกจากรายการ เช่น แผนก/ตำแหน่ง ใช้ sic-combobox ไม่ใช้ sic-input) footer เป็นปุ่มค้นหา/ล้างข้อมูล ชิดขวา, (2) Detail — card หัวข้อ "รายละเอียด" เนื้อหาเป็น sic-gridpanel แสดงผลลัพธ์แบบแบ่งหน้า คอลัมน์สุดท้ายเป็นปุ่มแก้ไข (ไอคอนปากกา) ปิด sort ไว้ — resolver โหลด options ของ dropdown (แผนก/ตำแหน่ง) ก่อนเข้าหน้า ไม่ต้องรอผู้ใช้เปิด combobox แล้วค่อยยิง API — กดปุ่มแก้ไขที่แถวในตารางแล้วพาไปหน้า "standard form" เพื่อแก้ไขข้อมูลของแถวนั้น

**employee-search.model.ts**

```typescript
export interface EmployeeSearchCriteria {
  employeeCodeFrom: string;
  employeeCodeTo: string;
  department: string;
  position: string;
}

export interface EmployeeListItem {
  employeeCode: string;
  employeeName: string;
  department: string;
  position: string;
}

export interface EmployeeSearchOption {
  label: string;
  value: string;
}

// รูปร่างของ route.snapshot.data ทั้งก้อน — ตัวเลือก dropdown (แผนก/ตำแหน่ง) โหลดจาก resolver
// ก่อนเข้าหน้าเสมอ ไม่ต้องรอผู้ใช้เปิด combobox แล้วค่อยยิง API เอง
export interface EmployeeSearchPageData {
  departmentOptions: EmployeeSearchOption[];
  positionOptions: EmployeeSearchOption[];
}
```

**employee-search.form.ts**

```typescript
import { FormBuilder, FormGroup } from '@angular/forms';
import { ToForm } from 'sic-ng';
import { EmployeeSearchCriteria } from './employee-search.model';

export class EmployeeSearchForm {
  static createForm(fb: FormBuilder): FormGroup<ToForm<EmployeeSearchCriteria>> {
    return fb.group<ToForm<EmployeeSearchCriteria>>({
      employeeCodeFrom: fb.control(''),
      employeeCodeTo: fb.control(''),
      department: fb.control(''),
      position: fb.control(''),
    });
  }
}
```

**employee-search.service.ts**

```typescript
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { EmployeeListItem, EmployeeSearchCriteria, EmployeeSearchOption } from './employee-search.model';

@Injectable({ providedIn: 'root' })
export class EmployeeSearchService {
  private readonly http = inject(HttpClient);

  search(criteria: EmployeeSearchCriteria): Observable<EmployeeListItem[]> {
    return this.http.get<EmployeeListItem[]>('/api/employees/search', { params: { ...criteria } });
  }

  getDepartmentOptions(): Observable<EmployeeSearchOption[]> {
    return this.http.get<EmployeeSearchOption[]>('/api/employees/departments');
  }

  getPositionOptions(): Observable<EmployeeSearchOption[]> {
    return this.http.get<EmployeeSearchOption[]>('/api/employees/positions');
  }
}
```

**employee-search.resolver.ts**

```typescript
import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { forkJoin } from 'rxjs';
import { EmployeeSearchPageData } from './employee-search.model';
import { EmployeeSearchService } from './employee-search.service';

export const employeeSearchResolver: ResolveFn<EmployeeSearchPageData> = () => {
  const service = inject(EmployeeSearchService);

  // โหลด options ของทุก combobox พร้อมกันก่อนเข้าหน้า (forkJoin รอทุกตัวเสร็จ)
  return forkJoin({
    departmentOptions: service.getDepartmentOptions(),
    positionOptions: service.getPositionOptions(),
  });
};
```

**employee-search.routes.ts**

```typescript
import { Routes } from '@angular/router';
import { employeeSearchResolver } from './employee-search.resolver';

export const employeeSearchRoutes: Routes = [
  {
    path: '',
    // loadComponent แทน component ตรงๆ — โหลด employee-search.component.ts เป็น lazy chunk แยกจากส่วนอื่นของแอป
    loadComponent: () => import('./employee-search.component').then((m) => m.EmployeeSearchComponent),
    // key 'form' คงที่เหมือน standard form — employee-search.component.ts อ่านผ่าน route.snapshot.data['form']
    resolve: { form: employeeSearchResolver },
  },
];

// app.routes.ts (route ระดับบนสุดของแอป) — โหลด employeeSearchRoutes แบบ lazy ทั้งกลุ่มผ่าน loadChildren
// export const routes: Routes = [
//   { path: 'employees', loadChildren: () => import('./employee-search/employee-search.routes').then((m) => m.employeeSearchRoutes) },
// ];
```

**employee-search.component.ts**

```typescript
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { SicButtonComponent, SicCardComponent, SicComboboxComponent, SicFlexComponent, SicGridComponent, SicGridLoadRequest, SicGridPanelComponent, SicGridPanelConfig, SicGridRowData, SicInputComponent } from 'sic-ng';
import { EmployeeSearchForm } from './employee-search.form';
import { EmployeeSearchPageData } from './employee-search.model';
import { EmployeeSearchService } from './employee-search.service';

@Component({
  selector: 'app-employee-search',
  standalone: true,
  imports: [ReactiveFormsModule, SicCardComponent, SicGridComponent, SicFlexComponent, SicInputComponent, SicComboboxComponent, SicButtonComponent],
  templateUrl: './employee-search.component.html',
  styleUrl: './employee-search.component.css',
})
export class EmployeeSearchComponent {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly service = inject(EmployeeSearchService);

  readonly searchForm = EmployeeSearchForm.createForm(this.fb);

  // route.snapshot.data เป็น { [key: string]: any } — key 'form' มาจาก resolve: { form: employeeSearchResolver }
  // ใน employee-search.routes.ts ต้องอ่านผ่าน key นั้นก่อนเสมอ อ่าน .data ตรงๆ เฉยๆ จะได้ undefined
  private readonly pageData = this.route.snapshot.data['form'] as EmployeeSearchPageData;
  readonly departmentOptions = this.pageData.departmentOptions;
  readonly positionOptions = this.pageData.positionOptions;

  gridConfig: SicGridPanelConfig = {
    id: 'employeeCode',
    lazy: false,
    selectable: false,
    toolbar: { save: false, add: false, delete: false, review: false },
    column: [
      { label: 'รหัสพนักงาน', name: 'employeeCode', type: 'text' },
      { label: 'ชื่อ', name: 'employeeName', type: 'text' },
      { label: 'แผนก', name: 'department', type: 'text' },
      { label: 'ตำแหน่ง', name: 'position', type: 'text' },
      // คอลัมน์สุดท้าย — ปุ่มแก้ไขต่อแถว แทนด้วยไอคอนปากกา (ไม่ใช้ column.label เพื่อไม่ให้มีหัวคอลัมน์) ปิด sort ไว้
      { label: '', name: 'edit', type: 'button', buttonText: '✏️', align: 'center', width: 60, sortable: false },
    ],
  };

  handleGridLoad(request: SicGridLoadRequest, grid: SicGridPanelComponent): void {
    this.service.search(this.searchForm.getRawValue() as any).subscribe((rows) => {
      grid.setRows(rows, { totalElements: rows.length }, request.requestId);
    });
  }

  handleGridRowAction(event: { action: string; row?: SicGridRowData | null }): void {
    if (event.action === 'edit' && event.row) {
      // นำทางไปหน้า standard form (pageName.component.ts) พร้อม employeeCode ของแถวนั้น
      // this.router.navigate(['/employees', event.row['employeeCode']]);
    }
  }

  submitSearch(grid: SicGridPanelComponent): void {
    grid.reload(); // (loadData) ยิงใหม่ พร้อมค่าล่าสุดใน searchForm
  }

  clearSearch(): void {
    this.searchForm.reset();
  }
}
```

**employee-search.component.html**

```html
<sic-flex direction="column" gap="1rem">
  <sic-card [bordered]="true" title="เงื่อนไข">
    <form [formGroup]="searchForm">
      <sic-grid [cols]="2" gap="1rem" [colsBreakpoints]="{ sm: 1, md: 2, lg: 2 }">
        <sic-input label="รหัสพนักงาน ตั้งแต่" formControlName="employeeCodeFrom" />
        <sic-input label="ถึง" formControlName="employeeCodeTo" />
        <sic-combobox label="แผนก" [options]="departmentOptions" optionLabel="label" optionValue="value" formControlName="department" />
        <sic-combobox label="ตำแหน่ง" [options]="positionOptions" optionLabel="label" optionValue="value" formControlName="position" />
      </sic-grid>
    </form>

    <sic-flex sicCardFooter direction="row" justify="end" gap="0.5rem">
      <sic-button variant="outline" (click)="clearSearch()">ล้างข้อมูล</sic-button>
      <sic-button (click)="submitSearch(grid)">ค้นหา</sic-button>
    </sic-flex>
  </sic-card>

  <sic-card [bordered]="true" title="รายละเอียด">
    <sic-gridpanel
      #grid
      [config]="gridConfig"
      (loadData)="handleGridLoad($event, grid)"
      (rowAction)="handleGridRowAction($event)"
    />
  </sic-card>
</sic-flex>
```

**employee-search.component.css**

```css
/* ปกติไม่ต้องมี custom CSS เลย — ใช้ sic-card/sic-flex/sic-grid จัด layout
   และ token กลาง (--sic-space-*, --sic-color-*) แทน ใส่เฉพาะกรณีจำเป็นจริงๆ เท่านั้น */
```

**Attributes**

| Name | Type | Default | Description |
|---|---|---|---|
| `pageName.model.ts` | `interface` |  | criteria/list-item/option interface ของหน้านี้ รวมถึง pageNamePageData (รูปร่างของ route.snapshot.data ทั้งก้อน) ก็ประกาศไว้ในไฟล์นี้เหมือน standard form |
| `pageName.form.ts` | `class (static factory)` |  | สร้าง FormGroup ของฟอร์มเงื่อนไข — ไม่มี validator เพราะทุกฟิลด์เป็น optional filter |
| `pageName.service.ts` | `@Injectable` |  | เรียก API เท่านั้น — search() สำหรับตาราง, getXxxOptions() สำหรับ options ของแต่ละ sic-combobox |
| `pageName.resolver.ts` | `ResolveFn` |  | โหลด options ของทุก dropdown พร้อมกันด้วย forkJoin ก่อนเข้าหน้า คืนเป็น pageNamePageData |
| `pageName.routes.ts` | `Routes` |  | ผูก resolver เข้ากับ route ผ่าน resolve: { form: pageNameResolver } (key เดียวกับ standard form) และโหลด component แบบ lazy ผ่าน loadComponent |
| `pageName.component.ts/.html/.css` | `Component` |  | Criteria (sic-card title="เงื่อนไข" + sic-combobox ผูกกับ options จาก resolver + footer ปุ่มค้นหา/ล้างข้อมูลชิดขวา) และ Detail (sic-card title="รายละเอียด" + sic-gridpanel คอลัมน์สุดท้ายเป็นปุ่มแก้ไข ปิด sortable) |

**Events**

_None._

---

## File Naming Convention — `standard form`

_Category: Setup_

ตั้งชื่อไฟล์ต่อ 1 หน้า (แทน pageName ด้วยชื่อหน้าจริง เช่น employee) ให้เดาได้ทันทีว่าแต่ละไฟล์ทำหน้าที่อะไร และเปิดหาไฟล์ที่เกี่ยวข้องกันได้ง่ายเพราะชื่อขึ้นต้นเหมือนกัน: (1) component — pageName.component.ts/.html/.css (+ .spec.ts ถ้ามีเทส), (2) formGroup — pageName.form.ts (static factory สร้าง FormGroup), (3) model — pageName.model.ts (interface ของข้อมูล), (4) resolver — pageName.resolver.ts (โหลดข้อมูลก่อนเข้าหน้า), (5) service — pageName.service.ts (เรียก API), (6) routes — pageName.routes.ts (ผูก resolver/guard เข้ากับ route, lazy-load ด้วย loadComponent) ตัวอย่างด้านล่างใช้หน้า "employee" ประกอบร่างกันครบทั้ง 6 ไฟล์ ตั้งแต่ model → form → service → resolver → routes → component — ด้านบนเป็น demo หน้าตาจริงที่ได้จากโครงสร้างนี้ (ผูกกับ SicFormData เหมือนใน employee.component.ts)

**employee.model.ts**

```typescript
import { SicFormData } from 'sic-ng';

export interface EmployeeModel {
  employeeCode: string;
  employeeName: string;
  department: string;
  position: string;
  salary: number;
}

// ห่อด้วย EmployeePageData (ไม่คืน SicFormData ตรงๆ) เผื่อหน้านี้ต้องใช้มากกว่า 1 form/grid ในอนาคต —
// เพิ่ม field ใหม่ใน interface นี้ แล้วสร้างเพิ่มในตัว resolver เดียวกันได้เลย โดยไม่ต้องเพิ่ม
// resolve key ใหม่ทุกครั้งที่เพิ่ม form (route ผูกกับ resolver แค่ key เดียวคือ 'form' เสมอ)
export interface EmployeePageData {
  employeeData: SicFormData<EmployeeModel>;
}
```

**employee.form.ts**

```typescript
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToForm } from 'sic-ng';
import { EmployeeModel } from './employee.model';

export class EmployeeForm {
  static createForm(fb: FormBuilder): FormGroup<ToForm<EmployeeModel>> {
    return fb.group<ToForm<EmployeeModel>>({
      employeeCode: fb.control(null, [Validators.required, Validators.maxLength(20)]),
      employeeName: fb.control(null, [Validators.required, Validators.maxLength(100)]),
      department: fb.control(null, [Validators.required]),
      position: fb.control(null, [Validators.required]),
      salary: fb.control(null, [Validators.required, Validators.min(0)]),
    });
  }
}
```

**employee.service.ts**

```typescript
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { EmployeeModel } from './employee.model';

@Injectable({ providedIn: 'root' })
export class EmployeeService {
  private readonly http = inject(HttpClient);

  getEmployee(employeeCode: string): Observable<EmployeeModel> {
    return this.http.get<EmployeeModel>(`/api/employees/${employeeCode}`);
  }

  saveEmployee(model: EmployeeModel): Observable<void> {
    return this.http.post<void>('/api/employees', model);
  }
}
```

**employee.resolver.ts**

```typescript
import { inject } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRouteSnapshot, ResolveFn } from '@angular/router';
import { SicFormData } from 'sic-ng';
import { catchError, EMPTY, map, tap } from 'rxjs';
import { EmployeeForm } from './employee.form';
import { EmployeeModel, EmployeePageData } from './employee.model';
import { EmployeeService } from './employee.service';

export const employeeResolver: ResolveFn<EmployeePageData> = (route: ActivatedRouteSnapshot) => {
  const fb = inject(FormBuilder);
  const service = inject(EmployeeService);
  const employeeForm = EmployeeForm.createForm(fb);
  const employeeCode = route.paramMap.get('employeeCode');

  // ไม่มี employeeCode ใน route (เช่น /employees/new) — เป็นแถวใหม่ ไม่ต้องเรียก service
  // ไม่ส่ง model (พารามิเตอร์ที่ 2) ให้ SicFormData เพื่อให้เริ่มที่ Added ตามความหมายของแถวใหม่จริงๆ
  if (!employeeCode) {
    return { employeeData: new SicFormData<EmployeeModel>(employeeForm) };
  }

  return service.getEmployee(employeeCode).pipe(
    tap((data: EmployeeModel) => {
      if (!data) {
        // service คืนสำเร็จแต่ไม่มีข้อมูล (เช่น employeeCode ไม่ตรงกับใครเลย) — ถือเป็น error เพื่อให้
        // catchError ด้านล่างจัดการเหมือนกรณี error อื่นๆ ไม่ปล่อยให้หน้าเปิดพร้อม form ว่างเงียบๆ
        throw new Error(`ไม่พบข้อมูลพนักงานรหัส ${employeeCode}`);
      }

      employeeForm.patchValue(data);
    }),
    // ส่ง data (พารามิเตอร์ที่ 2) เข้า SicFormData เสมอ — ไม่งั้นจะกลายเป็นแถวใหม่ (Added)
    // ทั้งที่จริงเป็นข้อมูลที่โหลดมาแล้ว (isChanged จะเป็น true ตั้งแต่เริ่มโดยไม่ได้แก้อะไรเลย)
    map((data): EmployeePageData => ({ employeeData: new SicFormData<EmployeeModel>(employeeForm, data) })),
    catchError((err) => {
      console.error('Failed to load employee:', err);
      return EMPTY;
    }),
  );
};
```

**employee.routes.ts**

```typescript
import { Routes } from '@angular/router';
import { sicCanDeactivateGuard } from 'sic-ng';
import { employeeResolver } from './employee.resolver';

export const employeeRoutes: Routes = [
  {
    path: ':employeeCode',
    // loadComponent แทน component ตรงๆ — โหลด employee.component.ts เป็น lazy chunk แยกจากส่วนอื่นของแอป
    loadComponent: () => import('./employee.component').then((m) => m.EmployeeComponent),
    // key 'form' คงที่ทุกหน้า ไม่ว่า resolver จะคืนกี่ form/grid ก็ตาม (ทั้งหมดห่อรวมอยู่ใน
    // EmployeePageData ก้อนเดียว) — employee.component.ts อ่านผ่าน route.snapshot.data['form']
    resolve: { form: employeeResolver },
    // เด้ง dialog ยืนยันก่อนออกจากหน้าถ้า EmployeeComponent.pageDirty() คืน true (ดู employee.component.ts)
    canDeactivate: [sicCanDeactivateGuard],
  },
];

// app.routes.ts (route ระดับบนสุดของแอป) — โหลด employeeRoutes แบบ lazy ทั้งกลุ่มผ่าน loadChildren
// export const routes: Routes = [
//   { path: 'employees', loadChildren: () => import('./employee/employee.routes').then((m) => m.employeeRoutes) },
// ];
```

**employee.component.ts**

```typescript
import { Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { SicButtonComponent, SicCanComponentDeactivate, SicCardComponent, SicFlexComponent, SicFormData, SicGridComponent, SicInputComponent, SicInputNumberComponent } from 'sic-ng';
import { EmployeeModel, EmployeePageData } from './employee.model';
import { EmployeeService } from './employee.service';

@Component({
  selector: 'app-employee',
  standalone: true,
  imports: [ReactiveFormsModule, SicCardComponent, SicGridComponent, SicFlexComponent, SicInputComponent, SicInputNumberComponent, SicButtonComponent],
  templateUrl: './employee.component.html',
  styleUrl: './employee.component.css',
})
export class EmployeeComponent implements SicCanComponentDeactivate {
  private readonly route = inject(ActivatedRoute);
  private readonly service = inject(EmployeeService);

  // route.snapshot.data เป็น { [key: string]: any } — key 'form' มาจาก resolve: { form: employeeResolver }
  // ใน employee.routes.ts ต้องอ่านผ่าน key นั้นก่อนเสมอ อ่าน .data ตรงๆ (as EmployeePageData) เฉยๆ จะได้ undefined
  readonly employeeData: SicFormData<EmployeeModel> = (this.route.snapshot.data['form'] as EmployeePageData).employeeData;

  // sicCanDeactivateGuard (ผูกไว้ที่ canDeactivate ใน employee.routes.ts) เรียกเมธอดนี้ก่อนออกจากหน้า
  // คืน true = ยังมีข้อมูลที่ยังไม่บันทึก จะเด้ง dialog ถามยืนยันก่อนออก
  pageDirty(): boolean {
    return this.employeeData.isChanged;
  }

  save(): void {
    this.employeeData.markAllAsTouched();
    if (this.employeeData.invalid) {
      return;
    }

    this.service.saveEmployee(this.employeeData.value).subscribe(() => this.employeeData.markAsPristine());
  }
}
```

**employee.component.html**

```html
<sic-card [bordered]="true" title="ข้อมูลพนักงาน">
  <form [formGroup]="employeeData.formGroup">
    <sic-grid [cols]="2" gap="1rem" [colsBreakpoints]="{ sm: 1, md: 2, lg: 2 }">
      <sic-input label="รหัสพนักงาน" formControlName="employeeCode" />
      <sic-input label="ชื่อ" formControlName="employeeName" />
      <sic-input label="แผนก" formControlName="department" />
      <sic-input label="ตำแหน่ง" formControlName="position" />
      <sic-input-number label="เงินเดือน" [decimals]="0" formControlName="salary" />
    </sic-grid>
  </form>

  <sic-flex sicCardFooter direction="row" justify="end">
    <sic-button [disabled]="!employeeData.isChanged" (click)="save()">บันทึก</sic-button>
  </sic-flex>
</sic-card>
```

**employee.component.css**

```css
/* ปกติไม่ต้องมี custom CSS เลย — ใช้ sic-section/sic-flex/sic-grid จัด layout
   และ token กลาง (--sic-space-*, --sic-color-*) แทน ใส่เฉพาะกรณีจำเป็นจริงๆ เท่านั้น */
```

**Attributes**

| Name | Type | Default | Description |
|---|---|---|---|
| `pageName.model.ts` | `interface` |  | รูปร่างข้อมูลของหน้านี้ (plain interface ไม่ผูกกับ Angular ใดๆ) — ใช้ร่วมกันได้ทั้ง form/service/resolver/component รวมถึง pageNamePageData (รูปร่างของ route.snapshot.data ทั้งก้อน) ก็ประกาศไว้ในไฟล์นี้ด้วย เผื่อวันหลังหน้านี้ต้องใช้มากกว่า 1 form/grid ก็แค่เพิ่ม field ใน pageNamePageData ที่นี่ แล้วสร้างเพิ่มใน resolver เดียวกัน |
| `pageName.form.ts` | `class (static factory)` |  | สร้าง FormGroup ของหน้านี้ — รวม validator ไว้ที่เดียว ไม่ปนกับ component เพื่อทดสอบ/reuse ได้ง่าย |
| `pageName.service.ts` | `@Injectable` |  | เรียก API เท่านั้น ไม่ยุ่งกับ FormGroup/SicFormData — component เป็นคนต่อ service กับ form เอง |
| `pageName.resolver.ts` | `ResolveFn` |  | โหลดข้อมูลก่อนเข้าหน้า, patchValue เข้า FormGroup ถ้ามีข้อมูล, แล้วห่อด้วย SicFormData ส่ง data ที่โหลดมาเป็นพารามิเตอร์ที่ 2 เสมอ คืนเป็น pageNamePageData (import type จาก pageName.model.ts) |
| `pageName.routes.ts` | `Routes` |  | ผูก resolver เข้ากับ route ผ่าน resolve: { form: pageNameResolver } (key ชื่อ "form" คงที่ทุกหน้า ไม่ว่าจะมีกี่ form/grid ก็ตาม), ผูก canDeactivate: [sicCanDeactivateGuard], และโหลด component แบบ lazy ผ่าน loadComponent — export ไปให้ app.routes.ts เรียกทั้งกลุ่มผ่าน loadChildren |
| `pageName.component.ts/.html/.css` | `Component` |  | อ่านข้อมูลจาก route resolver ผ่าน route.snapshot.data['form'] (ต้องอ่านผ่าน key 'form' เสมอ อ่าน .data ตรงๆ จะได้ undefined เพราะ resolve ผูกไว้ใต้ key นี้ ไม่ใช่ที่ data root), ผูก formGroup เข้ากับ template, เรียก service ตอน save — .css ควรว่างเปล่าเป็นส่วนใหญ่เพราะจัด layout ด้วย sic-component |
| `SicCanComponentDeactivate` | `interface (implements)` |  | component implement pageDirty(): boolean (ปกติคืน employeeData.isChanged ตรงๆ) แล้วผูก canDeactivate: [sicCanDeactivateGuard] ไว้ที่ route — guard จะเด้ง dialog ถามยืนยันก่อนออกจากหน้าถ้ายังมีข้อมูลที่ยังไม่บันทึก |

**Events**

_None._

---

## Form + History Grid Pattern — `standard transaction`

_Category: Setup_

รูปแบบเดียวกับ "standard form" ทุกไฟล์ (pageName.model.ts/.form.ts/.service.ts/.resolver.ts/.routes.ts/.component.ts/.html/.css) เพิ่มเติมแค่ sic-gridpanel อีก 1 ตัวในหน้าเดียวกัน สำหรับบันทึกประวัติการเลื่อนขั้น/เงินเดือน (แถวละ 1 รายการเปลี่ยนแปลง) — save() รวมทั้งฟอร์มหลักและ grid เป็น payload เดียวด้วย sicFormCombine() (ดู "SicFormData + SicGridPanel Combine" ด้านบน), pageDirty() เช็ค isChanged ของฟอร์ม รวมกับ hasPendingChanges ของ grid

**employee-transaction.model.ts**

```typescript
import { SicFormData } from 'sic-ng';

export interface EmployeeModel {
  employeeCode: string;
  employeeName: string;
  department: string;
  position: string;
  salary: number;
}

// ประวัติการเลื่อนขั้น/เงินเดือน 1 แถวใน sic-gridpanel
export interface EmployeeSalaryHistoryModel {
  id: number;
  effectiveDate: string;
  position: string;
  salary: number;
  remark: string;
}

// ห่อด้วย EmployeeTransactionPageData เหมือน standard form — เผื่อวันหลังต้องใช้มากกว่า 1 form/grid
// ที่โหลดจาก resolver ก็เพิ่ม field ใน interface นี้ได้เลย (ส่วน historyGrid ในหน้านี้โหลดผ่าน
// (loadData) ของ sic-gridpanel เอง ไม่ได้โหลดจาก resolver — resolver มีไว้สำหรับข้อมูลที่ต้อง
// พร้อมตั้งแต่เปิดหน้า เช่นตัวฟอร์มหลัก)
export interface EmployeeTransactionPageData {
  employeeData: SicFormData<EmployeeModel>;
}
```

**employee-transaction.form.ts**

```typescript
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToForm } from 'sic-ng';
import { EmployeeModel } from './employee-transaction.model';

export class EmployeeTransactionForm {
  static createForm(fb: FormBuilder): FormGroup<ToForm<EmployeeModel>> {
    return fb.group<ToForm<EmployeeModel>>({
      employeeCode: fb.control(null, [Validators.required, Validators.maxLength(20)]),
      employeeName: fb.control(null, [Validators.required, Validators.maxLength(100)]),
      department: fb.control(null, [Validators.required]),
      position: fb.control(null, [Validators.required]),
      salary: fb.control(null, [Validators.required, Validators.min(0)]),
    });
  }
}
```

**employee-transaction.service.ts**

```typescript
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { EmployeeModel, EmployeeSalaryHistoryModel } from './employee-transaction.model';

@Injectable({ providedIn: 'root' })
export class EmployeeTransactionService {
  private readonly http = inject(HttpClient);

  getEmployee(employeeCode: string): Observable<EmployeeModel> {
    return this.http.get<EmployeeModel>(`/api/employees/${employeeCode}`);
  }

  getSalaryHistory(employeeCode: string): Observable<EmployeeSalaryHistoryModel[]> {
    return this.http.get<EmployeeSalaryHistoryModel[]>(`/api/employees/${employeeCode}/salary-history`);
  }

  // payload เดียวจาก sicFormCombine() — { employee: {...}, history: [...] }
  saveTransaction(payload: unknown): Observable<void> {
    return this.http.post<void>('/api/employees/transaction', payload);
  }
}
```

**employee-transaction.resolver.ts**

```typescript
import { inject } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRouteSnapshot, ResolveFn } from '@angular/router';
import { SicFormData } from 'sic-ng';
import { catchError, EMPTY, map, tap } from 'rxjs';
import { EmployeeTransactionForm } from './employee-transaction.form';
import { EmployeeModel, EmployeeTransactionPageData } from './employee-transaction.model';
import { EmployeeTransactionService } from './employee-transaction.service';

// history ไม่ได้โหลดที่นี่ — sic-gridpanel โหลดของตัวเองผ่าน (loadData) ตอน component แสดงผล
export const employeeTransactionResolver: ResolveFn<EmployeeTransactionPageData> = (route: ActivatedRouteSnapshot) => {
  const fb = inject(FormBuilder);
  const service = inject(EmployeeTransactionService);
  const employeeForm = EmployeeTransactionForm.createForm(fb);
  const employeeCode = route.paramMap.get('employeeCode');

  if (!employeeCode) {
    return { employeeData: new SicFormData<EmployeeModel>(employeeForm) };
  }

  return service.getEmployee(employeeCode).pipe(
    tap((data: EmployeeModel) => {
      if (!data) {
        throw new Error(`ไม่พบข้อมูลพนักงานรหัส ${employeeCode}`);
      }

      employeeForm.patchValue(data);
    }),
    map((data): EmployeeTransactionPageData => ({ employeeData: new SicFormData<EmployeeModel>(employeeForm, data) })),
    catchError((err) => {
      console.error('Failed to load employee:', err);
      return EMPTY;
    }),
  );
};
```

**employee-transaction.routes.ts**

```typescript
import { Routes } from '@angular/router';
import { sicCanDeactivateGuard } from 'sic-ng';
import { employeeTransactionResolver } from './employee-transaction.resolver';

export const employeeTransactionRoutes: Routes = [
  {
    path: ':employeeCode',
    loadComponent: () => import('./employee-transaction.component').then((m) => m.EmployeeTransactionComponent),
    resolve: { form: employeeTransactionResolver },
    canDeactivate: [sicCanDeactivateGuard],
  },
];
```

**employee-transaction.component.ts**

```typescript
import { Component, ViewChild, inject } from '@angular/core';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import {
  SicButtonComponent,
  SicCanComponentDeactivate,
  SicCardComponent,
  SicFlexComponent,
  SicFormData,
  sicFormCombine,
  SicGridComponent,
  SicGridLoadRequest,
  SicGridPanelComponent,
  SicGridPanelConfig,
  SicInputComponent,
  SicInputNumberComponent,
} from 'sic-ng';
import { EmployeeModel, EmployeeTransactionPageData } from './employee-transaction.model';
import { EmployeeTransactionService } from './employee-transaction.service';

@Component({
  selector: 'app-employee-transaction',
  standalone: true,
  imports: [ReactiveFormsModule, SicCardComponent, SicGridComponent, SicFlexComponent, SicInputComponent, SicInputNumberComponent, SicButtonComponent],
  templateUrl: './employee-transaction.component.html',
  styleUrl: './employee-transaction.component.css',
})
export class EmployeeTransactionComponent implements SicCanComponentDeactivate {
  private readonly route = inject(ActivatedRoute);
  private readonly service = inject(EmployeeTransactionService);

  // ต้องใช้ @ViewChild ตัวนี้ (ต่างจากตัวอย่างอื่นที่ส่ง grid ผ่าน template reference variable ตรงๆ
  // ในปุ่ม) เพราะ pageDirty() ถูกเรียกจาก sicCanDeactivateGuard ตอนออกจากหน้า ไม่ใช่ตอน click
  @ViewChild('historyGrid') private historyGrid?: SicGridPanelComponent;

  readonly employeeData: SicFormData<EmployeeModel> = (this.route.snapshot.data['form'] as EmployeeTransactionPageData).employeeData;

  historyGridConfig: SicGridPanelConfig = {
    id: 'id',
    lazy: false,
    column: [
      { label: 'วันที่มีผล', name: 'effectiveDate', type: 'date', editable: true, validators: [Validators.required] },
      { label: 'ตำแหน่งใหม่', name: 'position', type: 'text', editable: true, validators: [Validators.required] },
      { label: 'เงินเดือนใหม่', name: 'salary', type: 'number', editable: true, decimals: 0, validators: [Validators.required] },
      { label: 'หมายเหตุ', name: 'remark', type: 'text', editable: true },
    ],
  };

  handleHistoryLoad(request: SicGridLoadRequest, grid: SicGridPanelComponent): void {
    this.service.getSalaryHistory(this.employeeData.value.employeeCode).subscribe((rows) => {
      grid.setRows(rows, { totalElements: rows.length }, request.requestId);
    });
  }

  pageDirty(): boolean {
    return this.employeeData.isChanged || (this.historyGrid?.hasPendingChanges ?? false);
  }

  save(): void {
    if (!this.historyGrid) {
      return;
    }

    const combined = sicFormCombine({
      employee: this.employeeData,
      history: this.historyGrid,
    });

    combined.markAllAsTouched();
    if (combined.invalid) {
      return;
    }

    this.service.saveTransaction(combined.value).subscribe(() => {
      this.employeeData.markAsPristine();
      // reload() ดึงแถวประวัติล่าสุดจาก server กลับมาแสดง หลังบันทึกสำเร็จ
      this.historyGrid?.reload();
    });
  }
}
```

**employee-transaction.component.html**

```html
<sic-flex direction="column" gap="1rem">
  <sic-card [bordered]="true" title="ข้อมูลพนักงาน">
    <form [formGroup]="employeeData.formGroup">
      <sic-grid [cols]="2" gap="1rem" [colsBreakpoints]="{ sm: 1, md: 2, lg: 2 }">
        <sic-input label="รหัสพนักงาน" formControlName="employeeCode" />
        <sic-input label="ชื่อ" formControlName="employeeName" />
        <sic-input label="แผนก" formControlName="department" />
        <sic-input label="ตำแหน่ง" formControlName="position" />
        <sic-input-number label="เงินเดือน" [decimals]="0" formControlName="salary" />
      </sic-grid>
    </form>
  </sic-card>

  <sic-card [bordered]="true" title="ประวัติการเลื่อนขั้น/เงินเดือน">
    <sic-gridpanel
      #historyGrid
      [config]="historyGridConfig"
      (loadData)="handleHistoryLoad($event, historyGrid)"
    />
  </sic-card>

  <sic-flex direction="row" justify="end">
    <sic-button (click)="save()">บันทึก</sic-button>
  </sic-flex>
</sic-flex>
```

**employee-transaction.component.css**

```css
/* ปกติไม่ต้องมี custom CSS เลย — ใช้ sic-card/sic-flex/sic-grid จัด layout
   และ token กลาง (--sic-space-*, --sic-color-*) แทน ใส่เฉพาะกรณีจำเป็นจริงๆ เท่านั้น */
```

**Attributes**

| Name | Type | Default | Description |
|---|---|---|---|
| `pageName.model.ts` | `interface` |  | เหมือน standard form — เพิ่ม interface สำหรับ 1 แถวของ grid ประวัติ (EmployeeSalaryHistoryModel) ต่างหาก ไม่ต้องใส่ใน pageNamePageData เพราะ grid ไม่ได้โหลดจาก resolver |
| `pageName.service.ts` | `@Injectable` |  | เพิ่มเมธอดโหลด/บันทึกของ grid ประวัติแยกจากฟอร์มหลัก — saveTransaction() รับ payload เดียวจาก sicFormCombine() |
| `sic-gridpanel ตัวที่ 2` | `component` |  | โหลดข้อมูลผ่าน (loadData) ของตัวเอง (ไม่ผ่าน resolver) — เรียก service.getSalaryHistory() ตอน component แสดงผลครั้งแรก |
| `sicFormCombine()` | `function` |  | save() รวม employeeData (SicFormData) + historyGrid (SicGridPanelComponent) เป็น payload เดียว — markAllAsTouched()/invalid เช็คทั้งสองพร้อมกันในคำสั่งเดียว (ดู "SicFormData + SicGridPanel Combine" ด้านบน) |
| `@ViewChild + pageDirty()` | `pattern` |  | ต่างจาก standard form ตรงที่ pageDirty() ต้องเช็ค grid ด้วย (hasPendingChanges) ซึ่งเรียกจาก guard ไม่ใช่ตอน click จึงต้องเก็บ reference ของ grid ไว้ด้วย @ViewChild แทนที่จะส่งผ่าน template reference variable เข้า method ตรงๆ แบบตัวอย่างอื่น |

**Events**

_None._

---
