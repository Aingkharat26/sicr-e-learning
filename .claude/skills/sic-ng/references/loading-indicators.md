# Loading & Indicators

สถานะโหลดและความคืบหน้า

## Spinner — `sic-spinner`

_Category: Loading_

แสดง loading แบบหมุน

**template.html**

```html
<sic-spinner size="md" />
```

**Attributes**

| Name | Type | Default | Description |
|---|---|---|---|
| `size` | `'sm' \| 'md' \| 'lg'` | `md` | ขนาด spinner |

**Events**

_None._

---

## Loading Overlay (service) — `SicLoadingService`

_Category: Loading_

สร้าง loading overlay เต็มจอแบบ imperative ด้วย SicLoadingService — ค่าเริ่มต้นแสดง sic-spinner หมุน หรือจะเปลี่ยนไปแสดงรูปภาพ (png/gif) แทนก็ได้ผ่าน image ตั้งข้อความ (message) ประกอบได้ รองรับ timeout เพื่อปิดอัตโนมัติ หรือปิดเองด้วย handle.hide()

**my.component.ts**

```typescript
const loading = this.sicLoadingService.show({
  message: 'Loading...',
  timeout: 5000, // ปิดอัตโนมัติหลัง 5 วินาที ถ้ายังไม่ hide() เอง
});

// ทำงานบางอย่าง แล้วปิดเองก่อน timeout
doSomeWork().then(() => loading.hide());

// หรือแสดงรูปภาพของคุณเอง (png/gif) แทน spinner
const loadingWithGif = this.sicLoadingService.show({
  image: '/assets/loading.gif',
  message: 'Uploading...',
});
```

**component.ts**

```typescript
constructor(private sicLoadingService: SicLoadingService) {}
```

**Attributes**

| Name | Type | Default | Description |
|---|---|---|---|
| `message` | `string` |  | ข้อความใต้ spinner/รูปภาพ |
| `image` | `string` |  | URL รูป .png/.gif ที่จะแสดงแทน sic-spinner ค่าเริ่มต้น |
| `spinnerSize` | `'sm' \| 'md' \| 'lg'` | `lg` | ขนาด sic-spinner เมื่อไม่ได้กำหนด image |
| `timeout` | `number` |  | ปิดอัตโนมัติหลังผ่านไปกี่มิลลิวินาที ไม่ใส่ = ไม่ปิดเอง ต้องเรียก handle.hide() |

**Events**

| Name | Payload | Description |
|---|---|---|
| `show(...)` | `SicLoadingHandle` | คืน handle: hide(), setMessage(text), setImage(url), isVisible() |

---

## Skeleton — `sic-skeleton`

_Category: Loading_

placeholder ระหว่างรอโหลดข้อมูล

**template.html**

```html
<sic-skeleton variant="text" width="200px" />
<sic-skeleton variant="circle" width="48px" height="48px" />
```

**Attributes**

| Name | Type | Default | Description |
|---|---|---|---|
| `variant` | `'text' \| 'rect' \| 'circle'` | `text` | รูปแบบ skeleton |
| `width` | `string` |  | ความกว้าง เช่น 200px |
| `height` | `string` |  | ความสูง เช่น 48px |

**Events**

_None._

---

## Progress Bar — `sic-progress-bar`

_Category: Loading_

แสดงเปอร์เซ็นต์ความคืบหน้าหรือโหมด indeterminate

**template.html**

```html
<sic-progress-bar [value]="progressValue" color="primary" />
<sic-progress-bar [indeterminate]="true" color="success" />
```

**component.ts**

```typescript
progressValue = 60;
```

**Attributes**

| Name | Type | Default | Description |
|---|---|---|---|
| `value` | `number` |  | ค่า progress 0-100 |
| `indeterminate` | `boolean` | `false` | โหมดไม่ระบุเปอร์เซ็นต์ |
| `color` | `string` | `primary` | สีของ progress bar |

**Events**

_None._

---
