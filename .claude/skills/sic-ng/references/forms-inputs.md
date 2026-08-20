# Forms & Inputs

รับข้อมูลจากผู้ใช้

## SicFormData — `new SicFormData(formGroup, model?)`

_Category: Form Utility_

ห่อ FormGroup ธรรมดาด้วย EF-Core-style change tracking (SicEntityState: Added/Unchanged/Modified/Deleted/Detached) — เดา Added/Unchanged อัตโนมัติจากว่ามีการส่ง model (พารามิเตอร์ที่ 2) เข้ามาหรือไม่ (ส่งมา = แถวที่โหลดมาแล้ว เริ่มที่ Unchanged, ไม่ส่ง = แถวใหม่ เริ่มที่ Added) เติม FormControl ชื่อ state ให้ formGroup อัตโนมัติถ้ายังไม่มี ลองพิมพ์ในช่องด้านล่างแล้วดู state/isChanged เปลี่ยนตาม หรือกดปุ่มต่างๆ ดู

**template.html**

```html
<form [formGroup]="contactData.formGroup">
  <sic-input label="ชื่อ" formControlName="name" />
</form>

<p>state: {{ contactData.state }}</p>
<p>isChanged: {{ contactData.isChanged }}</p>

<sic-button (click)="contactData.delete()">ลบแถวนี้</sic-button>
<sic-button (click)="contactData.restore()">ยกเลิกการแก้ไข (กลับ baseline)</sic-button>
<sic-button (click)="contactData.reset()">ล้างข้อมูล</sic-button>
<sic-button (click)="contactData.markAsPristine()">บันทึกสำเร็จแล้ว (re-baseline)</sic-button>
```

**component.ts**

```typescript
import { FormBuilder } from '@angular/forms';
import { SicFormData } from 'sic-ng';

interface ContactModel {
  name: string;
}

export class MyComponent {
  private readonly fb = inject(FormBuilder);

  // ส่ง model (พารามิเตอร์ที่ 2) เข้ามา = แถวที่โหลดมาแล้ว → เริ่มที่ Unchanged
  readonly contactForm = this.fb.group({ name: this.fb.control('Ada', Validators.required) });
  readonly contactData = new SicFormData<ContactModel>(this.contactForm, { name: 'Ada' });

  // ไม่ส่ง model = แถวใหม่ (blank row) → เริ่มที่ Added เสมอ ไม่ว่าจะแก้ค่าอะไรก็ยังเป็น Added
  readonly newRowForm = this.fb.group({ name: this.fb.control('', Validators.required) });
  readonly newRowData = new SicFormData<ContactModel>(this.newRowForm);

  save(): void {
    // บันทึกสำเร็จแล้ว: reset dirty ของ Angular + re-baseline ค่าที่ใช้เทียบ "เปลี่ยนแปลงหรือยัง"
    // เป็นค่าที่เพิ่งบันทึกไป (ไม่ใช่ค่าตอนสร้าง SicFormData ครั้งแรก)
    this.contactData.markAsPristine();
  }
}
```

**Attributes**

| Name | Type | Default | Description |
|---|---|---|---|
| `formGroup` | `FormGroup` |  | พารามิเตอร์ที่ 1 (constructor) — FormGroup ที่จะถูกห่อ เติม FormControl ชื่อ state ให้อัตโนมัติถ้ายังไม่มีอยู่แล้ว |
| `model` | `TModel (optional)` |  | พารามิเตอร์ที่ 2 (constructor) — ส่งมา = ถือว่าเป็นแถวที่โหลดมาแล้ว (เริ่มที่ Unchanged), ไม่ส่ง = แถวใหม่ (เริ่มที่ Added เสมอ ไม่ว่าจะแก้ไขยังไง) |
| `state` | `SicEntityState` |  | getter — 'added' \| 'unchanged' \| 'modified' \| 'deleted' \| 'detached' ปัจจุบัน |
| `isChanged / isNotChanged` | `boolean` |  | isChanged = added/modified/deleted, isNotChanged = unchanged/detached — ใช้เช็คก่อน save หรือก่อนออกจากหน้า (คู่กับ sicCanDeactivateGuard) |
| `value` | `TModel` |  | ค่าปัจจุบันของ form รวม state เข้าไปด้วย เฉพาะตอนที่ TModel เองมี field state ประกาศไว้เท่านั้น (เช่น แถวใน editable grid ที่ต้องส่ง state ไปกับ payload ตอน bulk-save) |
| `invalid / valid` | `boolean` |  | เหมือน formGroup.invalid/valid แต่แถวที่ Deleted จะไม่ถูกนับว่า invalid (validator ของแถวที่กำลังจะถูกลบไม่ควรบล็อกการ save) |
| `dirty` | `boolean` |  | เหมือน formGroup.dirty ตรงๆ |
| `delete()` | `method` |  | ตั้ง state เป็น Deleted — ไม่ได้ลบ control ออกจาก formGroup จริง แค่ mark ไว้ว่าจะลบตอน save |
| `restore()` | `method` |  | ยกเลิกการแก้ไขที่ยังไม่บันทึก โดย patch ค่า formGroup กลับไปเป็น baseline ล่าสุด (ค่าตอนสร้าง หรือค่าที่ markAsPristine() ไว้ล่าสุด) แล้วคำนวณ state ใหม่ — ใช้ยกเลิก delete() ได้ด้วยในตัว ยกเว้นแถวที่ยังเป็น Added (แถวใหม่ที่ยังไม่เคยบันทึก) จะยังคงเป็น Added ต่อไปแม้ค่าจะถูกล้างกลับไปว่างแล้ว |
| `reset()` | `method` |  | ล้างทุก control กลับเป็นค่า default ของตัวเอง (เหมือน formGroup.reset()) แล้วปล่อยให้ state คำนวณใหม่ตามปกติจากการเปลี่ยนค่านั้น |
| `markAsPristine()` | `method` |  | เรียกหลัง save สำเร็จ — reset dirty ของ Angular และ re-baseline ทั้งค่าที่ใช้เทียบ "เปลี่ยนแปลงหรือยัง" และเป้าหมายของ restore() ให้เป็นค่าที่เพิ่งบันทึกไป |
| `markAllAsTouched()` | `method` |  | proxy ไปที่ formGroup.markAllAsTouched() ตรงๆ |
| `destroy()` | `method` |  | ยกเลิก subscription ภายใน (ที่ sync state จาก formGroup.valueChanges) — เรียกตอน component/row นี้ถูกทำลาย |

**Events**

_None._

---

## SicFormData + SicGridPanel Combine — `sicFormCombine(sources)`

_Category: Form Utility_

ฟังก์ชันรวมหลาย SicFormData/SicGridPanel เป็นตัวเดียว (ตัวอย่างด้านล่างใช้ 1 form + 2 sic-gridpanel พร้อมกัน — รองรับ gridpanel ได้มากกว่า 1 ตัว ไม่จำกัดแค่ตัวเดียว) เรียก markAllAsTouched()/valid/invalid/restore()/reset() ตัวเดียว แล้วมันจะ proxy ไปทุก source ให้เอง พร้อม .value ที่รวมเป็น object เดียวตาม key ที่ตั้งไว้ ลองแก้ชื่อให้ว่างหรือลบชื่อสินค้าในตารางแล้วกด "รวมข้อมูล" ดู valid จะเป็น false หรือกด restore()/reset() ดูค่าที่กรอกไว้ถูกยกเลิก

**template.html**

```html
<form [formGroup]="contactData.formGroup">
  <sic-input label="ชื่อ" formControlName="name" />
</form>

<sic-gridpanel
  #itemsGrid
  [config]="itemsConfig"
  (loadData)="handleItemsLoad($event, itemsGrid)"
/>

<!-- gridpanel ตัวที่ 2 ในหน้าเดียวกัน — sicFormCombine รองรับหลาย gridpanel พร้อมกันได้ -->
<sic-gridpanel
  #extrasGrid
  [config]="extrasConfig"
  (loadData)="handleExtrasLoad($event, extrasGrid)"
/>

<sic-button (click)="submit(itemsGrid, extrasGrid)">บันทึก</sic-button>
<sic-button (click)="cancel(itemsGrid, extrasGrid)">ยกเลิกการแก้ไข</sic-button>
```

**component.ts**

```typescript
import { SicFormData, sicFormCombine, SicGridPanelComponent, SicGridPanelConfig, SicGridLoadRequest, SicGridRowData } from 'sic-ng';

interface ContactModel {
  name: string;
}

export class MyComponent {
  readonly contactForm = this.fb.group({ name: this.fb.control('Ada', Validators.required) });
  readonly contactData = new SicFormData<ContactModel>(this.contactForm, { name: 'Ada' });

  itemsConfig: SicGridPanelConfig = {
    id: 'id',
    lazy: false,
    column: [
      { label: 'สินค้า', name: 'name', type: 'text', editable: true, validators: [Validators.required] },
      { label: 'จำนวน', name: 'qty', type: 'number', editable: true, validators: [Validators.required] },
    ],
  };
  private itemsSourceRows: SicGridRowData[] = [{ id: 1, name: 'เมาส์', qty: 2 }];

  extrasConfig: SicGridPanelConfig = {
    id: 'id',
    lazy: false,
    column: [
      { label: 'บริการเสริม', name: 'name', type: 'text', editable: true, validators: [Validators.required] },
      { label: 'ราคา', name: 'price', type: 'number', editable: true, validators: [Validators.required] },
    ],
  };
  private extrasSourceRows: SicGridRowData[] = [{ id: 1, name: 'ประกันสินค้า', price: 199 }];

  handleItemsLoad(request: SicGridLoadRequest, grid: SicGridPanelComponent): void {
    grid.setRows(this.itemsSourceRows, { totalElements: this.itemsSourceRows.length }, request.requestId);
  }

  handleExtrasLoad(request: SicGridLoadRequest, grid: SicGridPanelComponent): void {
    grid.setRows(this.extrasSourceRows, { totalElements: this.extrasSourceRows.length }, request.requestId);
  }

  // #itemsGrid / #extrasGrid ในเทมเพลตคือ instance ของ <sic-gridpanel> เอง — ส่งเข้า sicFormCombine ได้ตรงๆ
  // ใส่ key เพิ่มได้เรื่อยๆ ตามจำนวน gridpanel ที่มีในหน้า ไม่จำกัดแค่ตัวเดียว
  submit(itemsGrid: SicGridPanelComponent, extrasGrid: SicGridPanelComponent): void {
    const combined = sicFormCombine({
      contact: this.contactData, // SicFormData → ได้ .value
      items: itemsGrid,          // SicGridPanelComponent → ได้แถวที่เปลี่ยนแปลง (new/updated/deleted)
      extras: extrasGrid,        // gridpanel ตัวที่ 2 — ใช้ key อะไรก็ได้ตามต้องการ
    });

    combined.markAllAsTouched(); // touch ทุก source ให้ error field/row ที่ invalid แสดงขึ้นมา
    if (combined.invalid) {
      return;
    }

    this.api.submit(combined.value); // { contact: {...}, items: [...], extras: [...] }
  }

  cancel(itemsGrid: SicGridPanelComponent, extrasGrid: SicGridPanelComponent): void {
    // ยกเลิกการแก้ไขทั้ง form และทุกแถวในทุก grid กลับไปเป็นค่าล่าสุดที่บันทึกไว้ ในคำสั่งเดียว
    sicFormCombine({ contact: this.contactData, items: itemsGrid, extras: extrasGrid }).restore();
  }
}
```

**Attributes**

| Name | Type | Default | Description |
|---|---|---|---|
| `sources` | `Record<string, SicFormData \| SicGridPanelComponent>` |  | key อะไรก็ได้ที่อยากให้ปรากฏใน JSON ผลลัพธ์ → SicFormData หรือ instance ของ <sic-gridpanel> (ผ่าน template reference variable เช่น #itemsGrid) |
| `valid / invalid` | `boolean` |  | getter อ่านค่าสด — true/false ตาม valid/invalid ของทุก source รวมกัน (SicFormData.invalid, sic-gridpanel.invalid ตัวใหม่ที่เช็คแถวที่เปลี่ยนแปลง) |
| `value` | `TValue` |  | getter อ่านค่าสด — object เดียว 1 key ต่อ 1 source: SicFormData ให้ .value ตรงๆ, sic-gridpanel ให้ array ของแถวที่เปลี่ยนแปลง (new/updated/deleted) รูปแบบเดียวกับ payload ของ (saveData) ผ่าน getChangedRowsPayload() |
| `markAllAsTouched()` | `method` |  | proxy ไปเรียก markAllAsTouched() ของทุก source — เรียกก่อนเช็ค valid/invalid เพื่อให้ error ของ field/แถวที่ invalid ขึ้นแสดงจริง |
| `restore()` | `method` |  | proxy ไปเรียก restore() ของทุก source — ยกเลิกการแก้ไขที่ยังไม่บันทึกกลับไปเป็น baseline ล่าสุด ทั้ง form และทุกแถวใน grid ในคำสั่งเดียว |
| `reset()` | `method` |  | proxy ไปเรียก reset() ของทุก source — ล้างทุกอย่างกลับไปว่าง/pristine (SicFormData เคลียร์ค่ากลับ default, sic-gridpanel ล้างการเปลี่ยนแปลงทั้งหมดรวมถึงแถวใหม่) |

**Events**

_None._

---

## Input — `sic-input`

_Category: Form_

input text ทั่วไป ใช้กับ ngModel หรือ Reactive Forms ได้

**template.html**

```html
<sic-input
  name="email"
  label="Email"
  placeholder="you@example.com"
  [(ngModel)]="email"
/>
```

**component.ts**

```typescript
email = '';
```

**Attributes**

| Name | Type | Default | Description |
|---|---|---|---|
| `name` | `string` |  | ชื่อ control เมื่อใช้กับ template-driven forms |
| `label` | `string` |  | ข้อความ label |
| `placeholder` | `string` |  | ข้อความ placeholder |
| `ngModel / formControlName` | `string` |  | ผูกค่ากับ form control |
| `errorMessages` | `Record<string, string>` |  | ข้อความ error แยกตาม validator key |

**Events**

| Name | Payload | Description |
|---|---|---|
| `ngModelChange` | `string` | ส่งค่าใหม่เมื่อ input เปลี่ยน |

---

## Password Input — `sic-input-password`

_Category: Form_

input สำหรับรหัสผ่าน

**template.html**

```html
<sic-input-password
  name="password"
  label="Password"
  [(ngModel)]="password"
/>
```

**component.ts**

```typescript
password = '';
```

**Attributes**

| Name | Type | Default | Description |
|---|---|---|---|
| `name` | `string` |  | ชื่อ control |
| `label` | `string` |  | ข้อความ label |
| `ngModel / formControlName` | `string` |  | ผูกค่ารหัสผ่านกับ form |

**Events**

| Name | Payload | Description |
|---|---|---|
| `ngModelChange` | `string` | ส่งค่า password ใหม่ |

---

## Number Input — `sic-input-number`

_Category: Form_

input สำหรับตัวเลข พร้อม min/max, จัดชิดขวาเป็นค่าเริ่มต้น, ปรับทศนิยมและตัวคั่นหลักพันได้

**template.html**

```html
<sic-input-number name="age" label="Age" [min]="0" [max]="120" [(ngModel)]="age" />

<sic-input-number
  label="Price"
  [decimals]="2"
  thousandSeparator=","
  suffix="THB"
  [(ngModel)]="price"
/>
```

**component.ts**

```typescript
age: number | null = 25;
price: number | null = 1234.5;
```

**Attributes**

| Name | Type | Default | Description |
|---|---|---|---|
| `min` | `number` |  | ค่าต่ำสุดที่อนุญาต |
| `max` | `number` |  | ค่าสูงสุดที่อนุญาต |
| `align` | `'left' \| 'center' \| 'right'` | `right` | การจัดตำแหน่งข้อความในช่อง |
| `decimals` | `number` | `2` | จำนวนตำแหน่งทศนิยมที่ปัดและแสดงผล |
| `thousandSeparator` | `string` | `,` | ตัวคั่นหลักพัน เปลี่ยนได้ เช่น "." หรือช่องว่าง |
| `decimalSeparator` | `string` | `.` | ตัวคั่นทศนิยม เปลี่ยนได้ เช่น "," สำหรับรูปแบบยุโรป |
| `prefix` | `string` |  | ข้อความนำหน้าค่า เช่น "$" |
| `suffix` | `string` |  | ข้อความต่อท้ายค่า เช่น "THB" |
| `label` | `string` |  | ข้อความ label |
| `ngModel / formControlName` | `number \| null` |  | ผูกค่าตัวเลขกับ form (ค่าจริง ไม่ใช่ข้อความที่ format แล้ว) |

**Events**

| Name | Payload | Description |
|---|---|---|
| `ngModelChange` | `number \| null` | ส่งค่าตัวเลขใหม่ |

---

## Textarea — `sic-input-area`

_Category: Form_

textarea สำหรับข้อความหลายบรรทัด

**template.html**

```html
<sic-input-area
  name="bio"
  label="Bio"
  [rows]="4"
  [autoResize]="true"
  [(ngModel)]="bio"
/>
```

**component.ts**

```typescript
bio = '';
```

**Attributes**

| Name | Type | Default | Description |
|---|---|---|---|
| `rows` | `number` | `3` | จำนวนแถวเริ่มต้น |
| `autoResize` | `boolean` | `false` | ปรับความสูงอัตโนมัติเมื่อพิมพ์ |
| `label` | `string` |  | ข้อความ label |
| `ngModel / formControlName` | `string` |  | ผูกค่าข้อความกับ form |

**Events**

| Name | Payload | Description |
|---|---|---|
| `ngModelChange` | `string` | ส่งข้อความใหม่ |

---

## Comment Input — `sic-input-comment`

_Category: Form_

ทรงเดียวกับ Textarea แต่รองรับ @mention (ยิงไป API ผ่าน mentionSearch เพื่อสร้าง option ให้เลือก, highlight สีเมื่อพิมพ์) และ #hashtag (จบด้วย spacebar, highlight สีเช่นกัน) และแนบไฟล์/รูปพร้อม preview — mention จะถูกเก็บในค่า text เป็น @id หรือ @username (ไม่ใช่ชื่อที่แสดง) ใช้ resolveMentionDisplay() แปลงกลับเป็นชื่อตอนแสดงผลคอมเมนต์ที่โพสต์แล้ว — เปิด/ปิดแต่ละความสามารถแยกกันได้ผ่าน enableMentions / enableHashtags / enableUpload

**template.html**

```html
<sic-input-comment
  label="Comment"
  placeholder="พิมพ์ข้อความ, @ เพื่อกล่าวถึง, # เพื่อแท็กหัวข้อ..."
  [mentionSearch]="searchMentions"
  [maxSizeMb]="5"
  [(ngModel)]="comment"
  (mentionClick)="onMentionClick($event)"
  (hashtagClick)="onHashtagClick($event)"
  (filesChange)="onCommentFilesChange($event)"
/>
```

**component.ts**

```typescript
comment = '';

// เรียก API จริงของคุณเองตรงนี้ — คืนค่าเป็น array ตรง ๆ, Promise, หรือ Observable ก็ได้
// ใส่ username (ถ้ามี) ไม่งั้นจะเก็บเป็น @<id> แทน
searchMentions = (query: string): Promise<SicCommentMentionOption[]> => {
  return this.http
    .get<SicCommentMentionOption[]>('/api/users/mentions', { params: { q: query } })
    .toPromise();
};

onMentionClick(option: SicCommentMentionOption): void {
  // option.label คือชื่อที่แสดงตอนเลือก — แต่ค่าที่เก็บใน comment จริง ๆ
  // จะเป็น "@" + (option.username ?? option.id)
  this.toasts.show(`Mentioned ${option.label}`, 'info');
}

onHashtagClick(tag: string): void {
  this.toasts.show(`Tagged #${tag}`, 'info');
}

onCommentFilesChange(files: File[]): void {
  console.log('attached files', files);
}

// ตอนแสดงคอมเมนต์ที่โพสต์แล้วที่อื่นในแอป (ไม่ใช่ในกล่องพิมพ์) แปลง @id/@username กลับเป็นชื่อ:
displayComment(raw: string): string {
  return resolveMentionDisplay(raw, (usernameOrId) => this.userDirectory.get(usernameOrId)?.name);
}
```

**Attributes**

| Name | Type | Default | Description |
|---|---|---|---|
| `label` | `string` |  | ข้อความ label |
| `rows` | `number` | `4` | จำนวนแถวเริ่มต้น |
| `autoResize` | `boolean` | `false` | ปรับความสูงอัตโนมัติเมื่อพิมพ์ |
| `enableMentions` | `boolean` | `true` | เปิด/ปิดการกล่าวถึงด้วย @ (highlight สีเมื่อพิมพ์เสมอถ้าเปิดใช้) |
| `mentionSearch` | `(query: string) => SicCommentMentionOption[] \| Promise<SicCommentMentionOption[]> \| Observable<SicCommentMentionOption[]>` |  | ฟังก์ชันที่เรียกทุกครั้งที่พิมพ์ตามหลัง @ — ควรยิง API ของคุณเองแล้วคืน option ให้เลือก แต่ละ option คือ { id, label, username? } |
| `enableHashtags` | `boolean` | `true` | เปิด/ปิดการแท็กหัวข้อด้วย # (จบด้วยการเว้นวรรค, highlight สีเมื่อพิมพ์) |
| `enableUpload` | `boolean` | `true` | เปิด/ปิดปุ่มแนบไฟล์/รูปภาพ |
| `accept` | `string` | `'image/*'` | ชนิดไฟล์ที่เลือกได้จาก picker |
| `multiple` | `boolean` | `true` | แนบได้หลายไฟล์พร้อมกัน |
| `maxSizeMb` | `number` | `10` | ขนาดไฟล์สูงสุดต่อไฟล์ (MB) เกินจะถูก reject |
| `files` | `File[]` | `[]` | ไฟล์ที่แนบอยู่ (ผูกแบบ [(files)] ได้) |
| `ngModel / formControlName` | `string` |  | ข้อความคอมเมนต์ (ไม่รวมไฟล์แนบ) — mention ที่เลือกจะถูกเก็บเป็น "@" + (option.username ?? option.id) ไม่ใช่ชื่อที่แสดง (option.label) |

**Events**

| Name | Payload | Description |
|---|---|---|
| `ngModelChange` | `string` | ส่งข้อความคอมเมนต์ใหม่ |
| `mentionClick` | `SicCommentMentionOption` | เกิดเมื่อเลือก mention จากรายการ |
| `hashtagClick` | `string` | เกิดเมื่อพิมพ์ #หัวข้อ จบด้วยการเว้นวรรค (ส่งข้อความหัวข้อไม่รวม #) |
| `filesChange` | `File[]` | เกิดเมื่อรายการไฟล์ที่แนบเปลี่ยน (เพิ่ม/ลบ) |
| `rejected` | `File[]` | เกิดเมื่อมีไฟล์เกิน maxSizeMb ถูกปฏิเสธ |

---

## Comment Input — แสดงชื่อจาก @id/@username — `resolveMentionDisplay(text, resolve)`

_Category: Form_

sic-input-comment เก็บ mention เป็น @id หรือ @username เท่านั้น (ไม่ใช่ชื่อที่แสดง) เพื่อให้ค่าที่บันทึกไม่พังเมื่อคนเปลี่ยนชื่อภายหลัง — เวลาจะแสดงคอมเมนต์ที่โพสต์แล้ว (เช่น หน้ารายการคอมเมนต์) ใช้ resolveMentionDisplay() แปลงกลับเป็นชื่อจริงผ่าน lookup ของคุณเอง

**component.ts**

```typescript
import { resolveMentionDisplay } from 'sic-ng';

const raw = 'ยินดีด้วย @ada_lovelace กับ @42 เลย!'; // เก็บไว้ตอน submit
const userDirectory = new Map([
  ['ada_lovelace', 'Ada Lovelace'],
  ['42', 'Grace Hopper'],
]);

const displayText = resolveMentionDisplay(raw, (usernameOrId) => userDirectory.get(usernameOrId));
// -> "ยินดีด้วย @Ada Lovelace กับ @Grace Hopper เลย!"
// ถ้า resolver คืน undefined (เช่น user ถูกลบไปแล้ว) token เดิมจะไม่ถูกแตะต้อง
```

**Attributes**

| Name | Type | Default | Description |
|---|---|---|---|
| `text` | `string` |  | ข้อความดิบที่ได้จาก sic-input-comment (มี @id/@username ฝังอยู่) |
| `resolve` | `(usernameOrId: string) => string \| undefined` |  | lookup ของคุณเอง (เช่น Map หรือเรียก service) คืนชื่อที่จะแสดงแทน หรือ undefined เพื่อคงข้อความเดิมไว้ |

**Events**

_None._

---

## Phone Input — `sic-input-phone`

_Category: Form_

input สำหรับเบอร์โทรศัพท์

**template.html**

```html
<sic-input-phone
  name="phone"
  label="Phone"
  [(ngModel)]="phone"
/>
```

**component.ts**

```typescript
phone = '';
```

**Attributes**

| Name | Type | Default | Description |
|---|---|---|---|
| `name` | `string` |  | ชื่อ control |
| `label` | `string` |  | ข้อความ label |
| `ngModel / formControlName` | `string` |  | ผูกค่าเบอร์โทรกับ form |

**Events**

| Name | Payload | Description |
|---|---|---|
| `ngModelChange` | `string` | ส่งเบอร์โทรใหม่ |

---

## Input Tag — `sic-input-tag`

_Category: Form_

พิมพ์แล้วกด/พิมพ์เครื่องหมายคั่นที่ระบุ (ค่าเริ่มต้น ",") เพื่อสร้าง tag ใหม่เรื่อย ๆ — ค่าที่ ngModel ได้รับเป็น string เดียวที่รวม tag ทั้งหมดด้วยเครื่องหมายคั่นนั้น เช่น "ขนม,ไทย,นำเข้า" กำหนดความยาวสูงสุดต่อ tag, จำนวน tag สูงสุด, และสีของ tag (tagColor) ได้

**template.html**

```html
<sic-input-tag
  label="Keywords"
  placeholder="พิมพ์แล้วคั่นด้วย ,"
  [maxTagLength]="20"
  [maxTags]="5"
  tagColor="primary"
  [(ngModel)]="keywords"
/>
```

**component.ts**

```typescript
keywords = 'ขนม,ไทย,นำเข้า';
```

**Attributes**

| Name | Type | Default | Description |
|---|---|---|---|
| `delimiter` | `string` | `','` | ตัวคั่นที่จบ tag ขณะพิมพ์ และใช้ join tag ทั้งหมดเป็น string ตอนส่งออก |
| `placeholder` | `string` | `'Add tag...'` | ข้อความ placeholder เมื่อยังไม่มี tag |
| `maxTagLength` | `number` |  | ความยาวสูงสุดของแต่ละ tag (ตัดข้อความส่วนเกินทิ้ง) |
| `maxTags` | `number` |  | จำนวน tag สูงสุดที่เพิ่มได้ ครบแล้วช่อง input จะถูกปิด |
| `tagColor` | `'primary' \| 'success' \| 'danger' \| 'warning' \| 'neutral'` | `neutral` | สีของ tag ทุกอันที่แสดง (ใช้ค่าสีเดียวกับ sic-tag) |
| `ngModel / formControlName` | `string` |  | string เดียวที่รวม tag ทั้งหมดด้วย delimiter เช่น "ขนม,ไทย,นำเข้า" (ค่าว่างถ้าไม่มี tag) |

**Events**

| Name | Payload | Description |
|---|---|---|
| `ngModelChange` | `string` | ส่ง string ของ tag ทั้งหมดใหม่ทุกครั้งที่เพิ่ม/ลบ tag |

---

## Combobox — `sic-combobox`

_Category: Form_

เลือกข้อมูลจากรายการ options พิมพ์กรองในช่องเดียวกับที่แสดงผล ใช้ลูกศรขึ้น/ลง และ Enter เลือกได้

**template.html**

```html
<sic-combobox
  label="Assignee"
  [options]="people"
  optionLabel="name"
  placeholder="Select a person…"
  [(ngModel)]="selectedPerson"
/>
```

**component.ts**

```typescript
interface Person {
  name: string;
  role: string;
}

selectedPerson: Person | null = null;
people: Person[] = [
  { name: 'Alice', role: 'Engineer' },
  { name: 'Bob', role: 'Designer' },
  { name: 'Carol', role: 'Product Manager' },
];
```

**Attributes**

| Name | Type | Default | Description |
|---|---|---|---|
| `options` | `unknown[]` |  | รายการตัวเลือก (ใช้เฉพาะตอน isPaging = false, กรองฝั่งหน้าบ้าน) |
| `optionLabel` | `string` |  | field ที่ใช้แสดงเป็น label |
| `optionValue` | `string` |  | field ที่ใช้เป็น value ของ formControl (default: ทั้ง object) |
| `placeholder` | `string` |  | ข้อความ placeholder |
| `multi` | `boolean` |  | เลือกได้หลายค่า |
| `searchable` | `boolean` |  | พิมพ์กรองรายการได้ในช่อง input เดียวกับที่แสดงผล |
| `isPaging` | `boolean` |  | เปิดโหมด infinite scroll — โหลดข้อมูลผ่าน event search เท่านั้น ไม่ต้องผูก [options] |
| `pageSize` | `number` |  | จำนวนแถวต่อหน้าเมื่อ isPaging = true (default 10) |
| `clearable` | `boolean` | `true` | แสดงปุ่ม clear (×) ชิดขวาเมื่อมีค่าที่เลือกอยู่ |
| `ngModel / formControlName` | `unknown` |  | ค่าที่เลือกอยู่ (ผลลัพธ์จาก optionValue) |
| `#optionTemplate` | `ng-template` |  | ng-template ที่ใส่ไว้ข้างใน <sic-combobox> เพื่อ custom หน้าตาแต่ละ option, context: { $implicit: option, selected, active } |
| `#displayTemplate` | `ng-template` |  | ng-template สำหรับ custom หน้าตาตอนปิด dropdown (ค่าที่เลือกไว้), context: { $implicit: selectedOptions[], multi } — ถ้าไม่ใส่จะ fallback เป็น label ธรรมดาในช่อง input |

**Events**

| Name | Payload | Description |
|---|---|---|
| `ngModelChange` | `unknown` | ส่งค่าที่เลือกใหม่ |
| `search` | `{ keyword?, value?, pageNo, pageSize, options: { update(items) } }` | ยิงเมื่อ isPaging = true ในสามกรณี: พิมพ์ค้นหา (keyword, pageNo 1), เลื่อนโหลดหน้าถัดไป (keyword, pageNo เพิ่มขึ้น), หรือ resolve label จากค่าที่ set เข้า formControl (value, pageNo 1, pageSize 1) — เรียก api แล้วเรียก e.options.update(items) ด้วยรายการที่ได้ ไม่ต้องจัดการ append/replace เอง |

---

## Checkbox — `sic-checkbox`

_Category: Form_

ตัวเลือกแบบ true/false

**template.html**

```html
<sic-checkbox
  label="I agree to the terms"
  [(ngModel)]="agree"
/>
```

**component.ts**

```typescript
agree = false;
```

**Attributes**

| Name | Type | Default | Description |
|---|---|---|---|
| `label` | `string` |  | ข้อความ label |
| `ngModel / formControlName` | `boolean` |  | สถานะ checked |

**Events**

| Name | Payload | Description |
|---|---|---|
| `ngModelChange` | `boolean` | ส่งค่า checked ใหม่ |

---

## Radio — `sic-radio`

_Category: Form_

ตัวเลือกแบบเลือกได้หนึ่งค่าในกลุ่มเดียวกัน วางทีละตัวเองก็ได้ หรือส่ง [options] เข้าไปให้ loop สร้างทั้งกลุ่มในตัวเดียว พร้อมเลือกจัดวางแนวตั้ง/แนวนอนได้

**template.html**

```html
<!-- วางเองทีละตัว -->
<sic-radio name="notify" label="Email" radioValue="email" [(ngModel)]="notifyBy" />
<sic-radio name="notify" label="SMS" radioValue="sms" [(ngModel)]="notifyBy" />

<!-- ส่ง options เข้าไปให้ loop ทั้งกลุ่ม -->
<sic-radio
  label="Shipping method"
  [options]="shippingOptions"
  direction="row"
  [(ngModel)]="shippingMethod"
/>
```

**component.ts**

```typescript
notifyBy: 'email' | 'sms' = 'email';

shippingMethod = 'standard';
shippingOptions: SicRadioOption[] = [
  { value: 'standard', name: 'Standard (3-5 days)' },
  { value: 'express', name: 'Express (1-2 days)' },
  { value: 'pickup', name: 'Store pickup' },
];
```

**Attributes**

| Name | Type | Default | Description |
|---|---|---|---|
| `name` | `string` |  | ชื่อกลุ่ม radio (เมื่อใช้ [options] จะ generate ให้อัตโนมัติ) |
| `label` | `string` |  | ข้อความ label ของ radio ตัวเดียว หรือหัวข้อของกลุ่มเมื่อใช้ [options] |
| `radioValue` | `unknown` |  | ค่าของ radio ตัวนี้ (โหมดวางทีละตัว) |
| `options` | `{ value: unknown; name: string }[]` |  | รายการตัวเลือกให้ component loop สร้าง radio ทั้งกลุ่มในตัวเดียว |
| `direction` | `'row' \| 'column'` | `column` | ทิศทางการจัดวางตัวเลือกเมื่อใช้ [options] (row = แนวนอน, column = แนวตั้ง) |
| `ngModel / formControlName` | `unknown` |  | ค่าที่เลือกอยู่ |

**Events**

| Name | Payload | Description |
|---|---|---|
| `ngModelChange` | `unknown` | ส่งค่าที่เลือกใหม่ |

---

## Switch — `sic-switch`

_Category: Form_

toggle เปิด/ปิด

**template.html**

```html
<sic-switch
  label="Dark mode"
  [(ngModel)]="darkMode"
/>
```

**component.ts**

```typescript
darkMode = false;
```

**Attributes**

| Name | Type | Default | Description |
|---|---|---|---|
| `label` | `string` |  | ข้อความ label |
| `ngModel / formControlName` | `boolean` |  | สถานะเปิด/ปิด |

**Events**

| Name | Payload | Description |
|---|---|---|
| `ngModelChange` | `boolean` | ส่งสถานะใหม่ |

---

## Range — `sic-range`

_Category: Form_

slider สำหรับเลือกค่าหรือช่วงค่า

**template.html**

```html
<sic-range label="Volume" [min]="0" [max]="100" [(ngModel)]="volumeRange" />
<sic-range label="Price range" [min]="0" [max]="100" [dual]="true" [(ngModel)]="priceRange" />
```

**component.ts**

```typescript
volumeRange = 50;
priceRange: [number, number] = [20, 80];
```

**Attributes**

| Name | Type | Default | Description |
|---|---|---|---|
| `min` | `number` | `0` | ค่าต่ำสุด |
| `max` | `number` | `100` | ค่าสูงสุด |
| `dual` | `boolean` | `false` | เปิดโหมดเลือกช่วงค่า 2 ค่า |
| `ngModel / formControlName` | `number \| [number, number]` |  | ค่าที่เลือก |

**Events**

| Name | Payload | Description |
|---|---|---|
| `ngModelChange` | `number \| [number, number]` | ส่งค่าใหม่ของ slider |

---

## Datepicker — `sic-datepicker`

_Category: Form_

เลือกวันที่ ใช้ dayjs เป็น core, ปรับ พ.ศ./ค.ศ., locale ของเดือน/วัน, รูปแบบที่แสดงในช่อง และ mode (day/month/year) ได้ พร้อมเลื่อนด้วยลูกศรและกด Enter เพื่อเลือก

**template.html**

```html
<!-- ค่าเริ่มต้น: ค.ศ., อังกฤษ, dd/MM/yyyy -->
<sic-datepicker label="Birthday" outputType="string" [(ngModel)]="birthday" />

<!-- พ.ศ. + ภาษาไทย + กำหนดรูปแบบเอง (ต้อง import 'dayjs/locale/th' เอง) -->
<sic-datepicker
  label="Event date"
  era="BE"
  locale="th"
  format="EEEE d MMMM yyyy"
  [(ngModel)]="eventDate"
/>

<!-- mode="month" ข้าม day grid ไปเลือกแค่เดือน -->
<sic-datepicker label="Billing month" mode="month" format="MMMM yyyy" [(ngModel)]="billingMonth" />
```

**component.ts**

```typescript
// ต้อง import ก่อนใช้ locale ที่ไม่ใช่ 'en'
import 'dayjs/locale/th';

birthday = '';
eventDate: string | null = null;
billingMonth: string | null = null;
```

**Attributes**

| Name | Type | Default | Description |
|---|---|---|---|
| `label` | `string` |  | ข้อความ label |
| `outputType` | `'string' \| 'date'` | `string` | ชนิดข้อมูลที่ส่งออก (string จะเป็น ISO yyyy-MM-dd เสมอ ไม่ขึ้นกับ format) |
| `format` | `string` | `dd/MM/yyyy` | รูปแบบที่แสดงในช่อง รองรับ token: yyyy, yy, MMMM, MMM, MM, M, dd, d, EEEE, EEE |
| `era` | `'BE' \| 'CE'` | `CE` | ปีที่แสดงเป็น พ.ศ. (BE) หรือ ค.ศ. (CE) ค่าที่เก็บ/ส่งออกยังเป็นปีจริงเสมอ |
| `locale` | `string` | `en` | ภาษาไว้แสดงชื่อเดือน/วัน ต้อง import "dayjs/locale/<code>" เองก่อนใช้ ไม่งั้น fallback เป็นอังกฤษ |
| `mode` | `'day' \| 'month' \| 'year'` | `day` | ระดับการเลือก month/year จะข้าม grid ที่ละเอียดกว่าไปเลย |
| `weekStartsOn` | `0 \| 1` | `0` | วันเริ่มต้นของสัปดาห์ 0 = Sunday, 1 = Monday |
| `min` | `Date \| string` |  | วันที่ต่ำสุดที่เลือกได้ (Date จริง หรือ ISO string) |
| `max` | `Date \| string` |  | วันที่สูงสุดที่เลือกได้ (Date จริง หรือ ISO string) |
| `clearable` | `boolean` | `true` | แสดงปุ่ม clear (×) ชิดขวาเมื่อมีวันที่เลือกอยู่ |
| `ngModel / formControlName` | `string \| Date \| null` |  | ค่าของวันที่ |

**Events**

| Name | Payload | Description |
|---|---|---|
| `ngModelChange` | `string \| Date \| null` | ส่งวันที่ใหม่ |

---

## Timepicker — `sic-timepicker`

_Category: Form_

เลือกเวลาแบบนาฬิกา 24 ชั่วโมง เป็นกล่องลอยเหมือน datepicker เลื่อนซ้าย/ขวาสลับชั่วโมง/นาที เลื่อนขึ้น/ลงปรับค่า Enter เพื่อเลือก และเปิด/ปิดอัตโนมัติตาม focus ค่าที่เก็บ/ส่งออกเป็น Date เต็ม (เหมือน sic-datepicker) จึงใช้ formcontrol ตัวเดียวกับ sic-datepicker ร่วมกันได้ — ถ้ายังไม่มีค่ามาก่อนจะใส่วันที่ปัจจุบันให้อัตโนมัติ ถ้ามีค่าอยู่แล้วจะอัปเดตแค่เวลา วันที่เดิมไม่เปลี่ยน

**template.html**

```html
<sic-timepicker label="Meeting time" [(ngModel)]="meetingTime" />

<!-- จำกัดช่วงเวลาที่เลือกได้ ด้วย datetime จริง (เทียบเฉพาะเวลา บนวันที่ของค่าปัจจุบัน/วันนี้) -->
<sic-timepicker
  label="Support window"
  [min]="supportWindowStart"
  [max]="supportWindowEnd"
  [(ngModel)]="supportTime"
/>
```

**component.ts**

```typescript
meetingTime: Date | null = null;
supportTime: Date | null = null;
supportWindowStart = new Date(new Date().setHours(9, 30, 0, 0));
supportWindowEnd = new Date(new Date().setHours(17, 0, 0, 0));
```

**Attributes**

| Name | Type | Default | Description |
|---|---|---|---|
| `label` | `string` |  | ข้อความ label |
| `min` | `Date \| string` |  | ขอบล่างของเวลาที่เลือกได้ (Date จริง) เทียบเฉพาะเวลา บนวันที่ของค่าปัจจุบัน/วันนี้ |
| `max` | `Date \| string` |  | ขอบบนของเวลาที่เลือกได้ (Date จริง) เทียบเฉพาะเวลา บนวันที่ของค่าปัจจุบัน/วันนี้ |
| `placeholder` | `string` | `Select time` | ข้อความเมื่อยังไม่ได้เลือกเวลา |
| `clearable` | `boolean` | `true` | แสดงปุ่ม clear (×) ชิดขวาเมื่อมีเวลาที่เลือกอยู่ |
| `ngModel / formControlName` | `Date \| null` |  | ค่าเวลาเป็น Date เต็ม (ไม่ใช่แค่ string "HH:mm" อีกต่อไป) — ถ้าก่อนหน้าเป็น null จะใส่วันที่วันนี้ให้, ถ้ามีอยู่แล้วจะแก้แค่ชั่วโมง/นาที วันที่เดิมไม่เปลี่ยน จึงใช้ formcontrol เดียวกับ sic-datepicker ประกบกันได้ (ดูตัวอย่าง "Datepicker + Timepicker ร่วมกัน") |

**Events**

| Name | Payload | Description |
|---|---|---|
| `ngModelChange` | `Date \| null` | ส่งเวลาใหม่ (เป็น Date เต็ม) |

---

## Datepicker + Timepicker ร่วมกัน — `sic-datepicker + sic-timepicker`

_Category: Form_

ใช้ sic-datepicker คู่กับ sic-timepicker บน FormControl ตัวเดียวกัน (ผูกด้วย [formControl] ทั้งคู่, ต้องตั้ง outputType="date" ที่ datepicker) เพื่อแยกกล่อง "วันที่" กับ "เวลา" ของ datetime เดียวกัน — datepicker แก้ปี/เดือน/วัน, timepicker แก้ชั่วโมง/นาที ของ Date object เดียวกัน แล้วอีกกล่องเห็นการเปลี่ยนแปลงทันที พร้อมตัวอย่าง min ผูกกับเวลาเริ่ม เพื่อกันไม่ให้เลือกวัน/เวลาสิ้นสุดก่อนวัน/เวลาเริ่ม

**template.html**

```html
<sic-grid [cols]="1" gap="1rem" [colsBreakpoints]="{ sm: 1, md: 2, lg: 4 }">
  <sic-datepicker label="วันที่เริ่มดำเนินการ" outputType="date" [formControl]="startDateTime" />
  <sic-timepicker label="เวลาเริ่มดำเนินการ" [formControl]="startDateTime" />

  <!-- min ผูกกับค่าเริ่ม กันไม่ให้เลือกวัน/เวลาสิ้นสุดย้อนก่อนวัน/เวลาเริ่ม -->
  <sic-datepicker label="วันที่สิ้นสุด" outputType="date" [min]="startDateTime.value" [formControl]="endDateTime" />
  <sic-timepicker label="เวลาสิ้นสุด" [min]="startDateTime.value" [formControl]="endDateTime" />
</sic-grid>
```

**component.ts**

```typescript
startDateTime = new FormControl<Date | null>(null);
endDateTime = new FormControl<Date | null>(null);
```

**Attributes**

| Name | Type | Default | Description |
|---|---|---|---|
| `formControl` | `FormControl<Date \| null>` |  | FormControl เดียวกันผูกทั้ง sic-datepicker และ sic-timepicker — datepicker แก้ไขแค่ปี/เดือน/วัน, timepicker แก้ไขแค่ชั่วโมง/นาที ของ Date object เดียวกัน ทั้งสองกล่อง sync กันอัตโนมัติไม่ว่าจะแก้จากฝั่งไหน |
| `outputType (datepicker)` | `'date'` |  | ต้องกำหนดเป็น "date" ไม่ใช่ "string" ค่าเริ่มต้น เพื่อให้ผลลัพธ์เป็น Date object ที่ timepicker แก้ต่อได้ |
| `min (ทั้งคู่)` | `Date \| string` |  | ตัวอย่างนี้ผูก min ของกล่องวันที่/เวลาสิ้นสุดไว้กับค่าปัจจุบันของ startDateTime เพื่อบังคับว่าห้ามสิ้นสุดก่อนเริ่ม |

**Events**

_None._

---

## Colorpicker — `sic-colorpicker`

_Category: Form_

เลือกสี พร้อมตัวเลือกให้พิมพ์ค่าสีเองได้

**template.html**

```html
<sic-colorpicker
  label="Brand color"
  [allowText]="true"
  [(ngModel)]="brandColor"
/>
```

**component.ts**

```typescript
brandColor: string | null = '#2563eb';
```

**Attributes**

| Name | Type | Default | Description |
|---|---|---|---|
| `label` | `string` |  | ข้อความ label |
| `allowText` | `boolean` | `false` | อนุญาตให้พิมพ์ค่าสีเอง |
| `clearable` | `boolean` | `true` | แสดงปุ่ม clear (×) ชิดขวาเมื่อมีค่าสีอยู่ (เคลียร์แล้วค่าจะเป็น null) |
| `ngModel / formControlName` | `string \| null` |  | ค่าสี เช่น #2563eb (null เมื่อยังไม่ได้เลือก/ถูก clear) |

**Events**

| Name | Payload | Description |
|---|---|---|
| `ngModelChange` | `string` | ส่งค่าสีใหม่ |

---

## Upload — `sic-upload`

_Category: Form_

เลือกไฟล์จากเครื่องผู้ใช้

**template.html**

```html
<sic-upload
  label="Attachments"
  [multiple]="true"
  [maxSizeMb]="10"
  [(ngModel)]="files"
/>
```

**component.ts**

```typescript
files: File[] = [];
```

**Attributes**

| Name | Type | Default | Description |
|---|---|---|---|
| `label` | `string` |  | ข้อความ label |
| `multiple` | `boolean` | `false` | เลือกหลายไฟล์ได้ |
| `maxSizeMb` | `number` |  | ขนาดไฟล์สูงสุดหน่วย MB |
| `ngModel / formControlName` | `File[]` |  | รายการไฟล์ที่เลือก |

**Events**

| Name | Payload | Description |
|---|---|---|
| `ngModelChange` | `File[]` | ส่งรายการไฟล์ใหม่ |

---

## Rating — `sic-rating`

_Category: Form_

ให้คะแนนแบบดาว รองรับครึ่งคะแนน

**template.html**

```html
<sic-rating
  label="Rate this"
  [max]="5"
  [allowHalf]="true"
  [(ngModel)]="rating"
/>
```

**component.ts**

```typescript
rating = 3;
```

**Attributes**

| Name | Type | Default | Description |
|---|---|---|---|
| `label` | `string` |  | ข้อความ label |
| `max` | `number` | `5` | คะแนนสูงสุด |
| `allowHalf` | `boolean` | `false` | อนุญาตให้เลือกครึ่งคะแนน |
| `ngModel / formControlName` | `number` |  | คะแนนที่เลือก |

**Events**

| Name | Payload | Description |
|---|---|---|
| `ngModelChange` | `number` | ส่งคะแนนใหม่ |

---

## Reactive Form Validation — `Reactive form + SicValidator`

_Category: Form_

ตัวอย่างการแสดง error message จาก Angular Validators

**template.html**

```html
<form [formGroup]="form" (ngSubmit)="submit()">
  <sic-input
    label="Email"
    formControlName="email"
    [errorMessages]="{ required: 'กรุณากรอกอีเมล', email: 'รูปแบบอีเมลไม่ถูกต้อง' }"
  />
  <sic-button type="submit" [disabled]="form.invalid">Save</sic-button>
</form>
```

**component.ts**

```typescript
form: FormGroup;

constructor(private fb: FormBuilder) {
  this.form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });
}

submit(): void {
  if (this.form.valid) {
    // ...
  } else {
    this.form.markAllAsTouched();
  }
}
```

**Attributes**

| Name | Type | Default | Description |
|---|---|---|---|
| `formGroup` | `FormGroup` |  | กลุ่ม form ของ Reactive Forms |
| `formControlName` | `string` |  | ชื่อ control ใน FormGroup |
| `errorMessages` | `Record<string, string>` |  | map validator key เป็นข้อความ error |
| `disabled` | `boolean` |  | ปิดปุ่มเมื่อ form invalid |

**Events**

| Name | Payload | Description |
|---|---|---|
| `ngSubmit` | `SubmitEvent` | เกิดเมื่อ submit form |

---
