# Overlays & Feedback

dialog, toast และ tooltip

## Dialog — `sic-dialog`

_Category: Overlay_

กล่อง modal สำหรับยืนยันหรือแสดงรายละเอียดเพิ่มเติม

**template.html**

```html
<sic-button (click)="dialogOpen = true">Open dialog</sic-button>

<sic-dialog
  [open]="dialogOpen"
  title="Confirm"
  [disableClose]="false"
  width="28rem"
  (openChange)="dialogOpen = $event"
>
  Are you sure you want to continue?
  <div sicDialogFooter>
    <sic-button variant="ghost" (click)="dialogOpen = false">Cancel</sic-button>
    <sic-button variant="solid" (click)="dialogOpen = false">Confirm</sic-button>
  </div>
</sic-dialog>
```

**component.ts**

```typescript
dialogOpen = false;
```

**Attributes**

| Name | Type | Default | Description |
|---|---|---|---|
| `open` | `boolean` | `false` | สถานะเปิด/ปิด dialog |
| `title` | `string` |  | หัวข้อ dialog |
| `disableClose` | `boolean` | `false` | ป้องกันการปิดจาก overlay หรือปุ่ม escape |
| `width` | `string` |  | ความกว้างของ dialog เช่น 28rem |
| `sicDialogFooter` | `content slot` |  | พื้นที่ footer ของ dialog |

**Events**

| Name | Payload | Description |
|---|---|---|
| `openChange` | `boolean` | ส่งสถานะใหม่เมื่อ dialog เปิดหรือปิด |

---

## Dialog (service) — `SicDialogService`

_Category: Overlay_

เปิด dialog แบบ imperative ด้วย SicDialogService — ส่ง component เข้าไปตรง ๆ พร้อมข้อมูล (data) และ config (width/height/disableClose) แล้ว subscribe รับผลลัพธ์ตอนปิดได้เลย component ที่ถูกเปิดสามารถ inject SIC_DIALOG_DATA เพื่อรับข้อมูล และ inject SicDialogRef เพื่อปิดตัวเองพร้อมส่งผลลัพธ์กลับ

**confirm-dialog.component.ts**

```typescript
// confirm-dialog.component.ts — component ที่จะถูกเปิดผ่าน service
@Component({
  standalone: true,
  imports: [SicButtonComponent],
  template: `
    <p>Confirm action for {{ data.name }}?</p>
    <sic-button (click)="dialogRef.close('confirmed')">Confirm</sic-button>
    <sic-button (click)="dialogRef.close()">Cancel</sic-button>
  `,
})
class ConfirmDialogComponent {
  data = inject(SIC_DIALOG_DATA) as { name: string };
  dialogRef = inject<SicDialogRef<ConfirmDialogComponent, string>>(SicDialogRef);
}

// ที่เรียกใช้งาน
this.sicDialogService
  .open<ConfirmDialogComponent, { name: string }, string>(
    ConfirmDialogComponent,
    { name: 'Ada Lovelace' },
    { width: '90%', height: 'auto' },
  )
  .subscribe((result) => {
    // result เป็นค่าที่ dialogRef.close(result) ส่งมา, undefined ถ้าปิดโดยไม่ระบุผล (คลิก backdrop/Escape)
  });
```

**my.component.ts**

```typescript
constructor(private sicDialogService: SicDialogService) {}
```

**Attributes**

| Name | Type | Default | Description |
|---|---|---|---|
| `component` | `ComponentType<T>` |  | component ที่จะเปิดใน dialog — ต้องเป็น standalone component |
| `data` | `D (argument ที่ 2, optional)` |  | ข้อมูลที่ส่งเข้าไป รับได้ใน component ที่เปิดผ่าน inject(SIC_DIALOG_DATA) |
| `config` | `{ width?: string; height?: string; disableClose?: boolean }  (argument ที่ 3, optional)` |  | width/height ของ dialog (เช่น "90%", "32rem") และปิดการปิดจาก backdrop/Escape ได้ด้วย disableClose |

**Events**

| Name | Payload | Description |
|---|---|---|
| `open(...).subscribe(...)` | `R \| undefined` | ค่าที่ component ภายในส่งผ่าน dialogRef.close(result) — undefined ถ้าปิดโดยไม่มีผลลัพธ์ (backdrop/Escape) หรือปิดผ่าน handle.close() เอง |

---

## Dialog (common: info/success/danger/warning/confirm) — `SicDialogService.info/success/danger/warning/confirm`

_Category: Overlay_

dialog สำเร็จรูป ไม่ต้องสร้าง component เอง: ไอคอนด้านบน ตามด้วย title, description, และปุ่ม sic-button — info/success/danger/warning มีปุ่ม "Close" ปุ่มเดียว, confirm มีปุ่ม "Cancel"/"Confirm" ทั้งหมด subscribe รับผลลัพธ์ตอนปิดได้เหมือน open()

**my.component.ts**

```typescript
this.sicDialogService.info('Title', 'Description').subscribe(() => {
  // ปิดแล้ว (ปุ่ม Close เท่านั้น ไม่มีผลลัพธ์)
});

this.sicDialogService.success('Title', 'Description').subscribe(() => { /* ... */ });
this.sicDialogService.danger('Title', 'Description').subscribe(() => { /* ... */ });
this.sicDialogService.warning('Title', 'Description').subscribe(() => { /* ... */ });

this.sicDialogService.confirm('Delete this item?', 'This action cannot be undone.').subscribe((confirmed) => {
  if (confirmed) {
    // ผู้ใช้กด Confirm
  }
  // confirmed เป็น false ถ้ากด Cancel, คลิก backdrop, หรือกด Escape
});
```

**component.ts**

```typescript
constructor(private sicDialogService: SicDialogService) {}
```

**Attributes**

| Name | Type | Default | Description |
|---|---|---|---|
| `title` | `string` |  | หัวข้อ (argument ที่ 1) |
| `description` | `string` |  | ข้อความอธิบาย (argument ที่ 2) |
| `config` | `SicDialogConfig (argument ที่ 3, optional)` |  | width/height/disableClose เหมือน open() |

**Events**

| Name | Payload | Description |
|---|---|---|
| `info/success/danger/warning(...).subscribe(...)` | `void` | เกิดเมื่อกดปุ่ม Close |
| `confirm(...).subscribe(...)` | `boolean` | true เมื่อกด Confirm, false เมื่อกด Cancel หรือปิดโดยวิธีอื่น (backdrop/Escape) |

---

## Search (popup overlay) — `sic-search`

_Category: Overlay_

popup search แบบ ⌘K: ผูก [open]/(openChange) เพื่อเปิด-ปิด ส่ง [items] เข้าไป ค้นหาแบบ substring case-insensitive ในตัว หรือกำหนด [filterFn] เองก็ได้ (เช่นค้นจาก server) ปิดได้ทั้งกด Escape หรือคลิก backdrop ใช้ลูกศรขึ้น/ลง + Enter เลือกได้ และปรับแต่งแต่ละแถวผลลัพธ์ได้เต็มที่ผ่าน #itemTemplate

**template.html**

```html
<sic-button variant="outline" (click)="searchOpen = true">Open search</sic-button>

<sic-search
  [open]="searchOpen"
  [items]="searchPages"
  [optionLabel]="'label'"
  placeholder="Search pages..."
  (openChange)="searchOpen = $event"
  (itemSelect)="onSearchSelect($event)"
>
  <ng-template #itemTemplate let-item let-active="active">
    <strong>{{ item.label }}</strong>
    <span style="opacity: 0.6; margin-left: 0.5rem;">{{ item.path }}</span>
  </ng-template>
</sic-search>
```

**component.ts**

```typescript
searchOpen = false;
searchPages = [
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Users', path: '/users' },
  { label: 'Settings', path: '/settings' },
];

onSearchSelect(page: { label: string; path: string }): void {
  this.router.navigateByUrl(page.path);
}
```

**Attributes**

| Name | Type | Default | Description |
|---|---|---|---|
| `open` | `boolean` | `false` | สถานะเปิด/ปิด overlay |
| `items` | `T[]` | `[]` | รายการทั้งหมดที่ค้นหาได้ |
| `query` | `string` | `''` | คำค้นหาปัจจุบัน (bindable) |
| `placeholder` | `string` | `Search...` | placeholder ของช่องค้นหา |
| `optionLabel` | `keyof T \| ((item: T) => string)` |  | ชื่อ property ที่ใช้แสดง/ค้นหา หรือฟังก์ชันคำนวณ label เอง — default คือ String(item) |
| `filterFn` | `(items: T[], query: string) => T[]` |  | แทนที่ filter default (substring) ทั้งหมด เช่นกรณี items มาจาก server ที่กรองมาแล้ว |
| `closeOnSelect` | `boolean` | `true` | ปิด overlay อัตโนมัติหลังเลือกผลลัพธ์หรือไม่ |
| `minWidth` | `string` |  | ความกว้างขั้นต่ำของ panel (ค่า CSS length ใด ๆ เช่น '24rem') |
| `#itemTemplate` | `content slot` |  | ปรับแต่ง UI ของแต่ละแถวผลลัพธ์เอง รับ let-item, let-active, let-query |

**Events**

| Name | Payload | Description |
|---|---|---|
| `openChange` | `boolean` | ส่งสถานะใหม่เมื่อ overlay เปิดหรือปิด (Escape/backdrop/เลือกผลลัพธ์) |
| `queryChange` | `string` | ส่งคำค้นหาทุกครั้งที่ผู้ใช้พิมพ์ |
| `itemSelect` | `T` | เกิดเมื่อผู้ใช้เลือกผลลัพธ์ (คลิกหรือกด Enter) |

---

## Popover — `sic-popover`

_Category: Overlay_

popover ทั่วไป: ปุ่ม trigger เปิด overlay ที่แสดง [items] เป็น list ต่อกับปุ่มโดยตรง (ไม่ใช่ overlay กลางจอแบบ sic-search) ปิดได้ทั้งกด Escape หรือคลิก backdrop — ทุกส่วนแทนที่ได้อิสระผ่าน content-template slots: sicPopoverButton (ปุ่ม trigger, default เป็น "⋯"), sicPopoverHeader (หัว panel, ไม่มี default), sicPopoverList (แต่ละแถวใน list, default คือ {{ item }}), sicPopoverFooter (ท้าย panel, ไม่มี default)

**template.html**

```html
<sic-popover [items]="menuActions" (itemSelect)="onMenuActionSelect($event)">
  <ng-template sicPopoverButton let-popover>
    <sic-button variant="ghost" (click)="popover.toggle()">⋮</sic-button>
  </ng-template>
  <ng-template sicPopoverHeader>
    <div class="my-popover-header">Actions</div>
  </ng-template>
  <ng-template sicPopoverList let-item>
    <span>{{ item.icon }} {{ item.label }}</span>
  </ng-template>
  <ng-template sicPopoverFooter>
    <div class="my-popover-footer">v1.0</div>
  </ng-template>
</sic-popover>
```

**component.ts**

```typescript
menuActions = [
  { label: 'Edit', icon: '✏️' },
  { label: 'Duplicate', icon: '📄' },
  { label: 'Delete', icon: '🗑️' },
];

onMenuActionSelect(action: { label: string; icon: string }): void {
  this.toasts.show(`เลือก: ${action.label}`, 'info');
}
```

**Attributes**

| Name | Type | Default | Description |
|---|---|---|---|
| `items` | `T[]` | `[]` | รายการที่แสดงเป็น list ใน panel |
| `open` | `boolean` | `false` | สถานะเปิด/ปิด (bindable) — ใช้ตอนต้องการควบคุมจากภายนอก เช่น เปิดจากปุ่มอื่น |
| `closeOnSelect` | `boolean` | `true` | ปิด popover อัตโนมัติหลังเลือกรายการหรือไม่ |
| `placement` | `'bottom-start' \| 'bottom-end' \| 'top-start' \| 'top-end'` | `'bottom-start'` | ตำแหน่ง panel เทียบกับปุ่ม trigger (มีตำแหน่งสำรองอัตโนมัติถ้าพื้นที่ไม่พอ) |
| `sicPopoverButton` | `<ng-template>` |  | แทนที่ปุ่ม trigger เริ่มต้น ("⋯") — รับ context { $implicit: popover instance, open } เช่น <ng-template sicPopoverButton let-popover> แล้วเรียก popover.toggle() เอง |
| `sicPopoverHeader / sicPopoverFooter` | `<ng-template>` |  | หัว/ท้ายของ panel — ไม่มี UI เริ่มต้นให้ ถ้าไม่ใส่จะไม่มีอะไรแสดง |
| `sicPopoverList` | `<ng-template>` |  | แทนที่การแสดงผลแต่ละแถว รับ context { $implicit: item, index } — ไม่ใส่จะ fallback เป็น {{ item }} เฉยๆ (เหมาะกับ items ที่เป็น string/number) |

**Events**

| Name | Payload | Description |
|---|---|---|
| `openChange` | `boolean` | ส่งสถานะใหม่เมื่อ popover เปิดหรือปิด (toggle/Escape/backdrop/เลือกรายการ) |
| `itemSelect` | `T` | เกิดเมื่อผู้ใช้คลิกเลือกแถวใน list |

---

## Toast — `sic-toast`

_Category: Feedback_

ข้อความแจ้งเตือนชั่วคราว ใช้งานร่วมกับ SicToastService — การ์ดโทนมืดพร้อมไอคอนวงกลม, หัวข้อ/ข้อความสี, และ badge ทางขวา (เช่น +500) ปรับแต่งได้ทั้งไอคอนและ badge

**template.html**

```html
<sic-button variant="outline" (click)="notify()">Show toast</sic-button>
<sic-toast position="top-right" />
```

**component.ts**

```typescript
constructor(private toasts: SicToastService) {}

notify(): void {
  // แบบสั้น (เดิม ยังใช้ได้เหมือนเดิม)
  this.toasts.show('This is a toast message', 'info');

  // แบบเต็ม: title + message + icon/badge ที่กำหนดเอง
  this.toasts.show({
    title: 'Your complaint has been received',
    message: 'You will be notified as soon as it is processed by a moderator',
    type: 'success',
  });

  this.toasts.show({
    title: "Your complaint can't be received",
    message: 'Retry later or contact a moderator',
    type: 'danger',
  });

  this.toasts.show({
    message: 'Reading an article',
    type: 'neutral',
    badge: { text: '+500' },
  });
}
```

**Attributes**

| Name | Type | Default | Description |
|---|---|---|---|
| `position` | `string` | `top-right` | ตำแหน่ง toast เช่น top-right |

**Events**

_None._

---

## Toast (custom icon / badge) — `SicToastService.show(options)`

_Category: Feedback_

show() รับได้ทั้งรูปแบบสั้น show(message, type, duration) เดิม หรือรูปแบบเต็มเป็น options object เพื่อกำหนด title, icon (บังคับไอคอนเอง หรือ false เพื่อซ่อน หรือ emoji/ตัวอักษรใด ๆ), และ badge (เช่น +500 พร้อม coin ทางขวา) — type "neutral" ไม่มีไอคอน default

**sic-toast.model.ts**

```typescript
interface SicToastOptions {
  title?: string;
  message: string;
  type?: 'info' | 'success' | 'danger' | 'warning' | 'neutral';
  duration?: number;
  icon?: 'success' | 'danger' | 'warning' | 'info' | false | string; // preset, false = ซ่อน, string อื่น = แสดงเป็นข้อความ/emoji
  badge?: { text: string; icon?: string };
}
```

**component.ts**

```typescript
// ไอคอน custom เป็น emoji แทน default ของ type
this.toasts.show({ message: 'Level up!', type: 'success', icon: '🎉' });

// ซ่อนไอคอนไปเลย
this.toasts.show({ message: 'Quiet update', type: 'info', icon: false });
```

**Attributes**

| Name | Type | Default | Description |
|---|---|---|---|
| `title` | `string` |  | หัวข้อตัวหนา สีตาม type (ไม่ใส่ = ไม่มีหัวข้อ) |
| `message` | `string` |  | ข้อความรอง สีเทา |
| `type` | `'info' \| 'success' \| 'danger' \| 'warning' \| 'neutral'` | `info` | กำหนดสีไอคอน/หัวข้อ และไอคอน default (neutral = ไม่มีไอคอน) |
| `icon` | `'success' \| 'danger' \| 'warning' \| 'info' \| false \| string` |  | บังคับไอคอนเอง: preset ในตัว, false เพื่อซ่อน, หรือ string อื่น (เช่น emoji) แสดงตรง ๆ ในวงกลมไอคอน |
| `badge` | `{ text: string; icon?: string }` |  | ป้ายชิดขวา เช่น { text: "+500" } สำหรับ toast แจ้งรางวัล/แต้ม |
| `duration` | `number` | `3500` | มิลลิวินาทีก่อนปิดอัตโนมัติ ใส่ 0 เพื่อไม่ให้ปิดเอง |

**Events**

_None._

---

## Tooltip Directive — `sicTooltip`

_Category: Feedback_

แสดงข้อความช่วยเหลือเมื่อ hover หรือ focus

**template.html**

```html
<sic-button [sicTooltip]="'Save changes'" sicTooltipPlacement="bottom">
  Hover me
</sic-button>
```

**Attributes**

| Name | Type | Default | Description |
|---|---|---|---|
| `sicTooltip` | `string` |  | ข้อความใน tooltip |
| `sicTooltipPlacement` | `'top' \| 'right' \| 'bottom' \| 'left'` | `top` | ตำแหน่ง tooltip |

**Events**

_None._

---
