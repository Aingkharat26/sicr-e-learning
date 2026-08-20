# Layout & General

จัดวาง layout และ action พื้นฐาน

## Grid — `sic-grid`

_Category: Layout_

จัด layout แบบ responsive grid

**template.html**

```html
<sic-grid [cols]="12" gap="1rem" [colsBreakpoints]="{ sm: 12, md: 6, lg: 4 }">
  <div>Column A</div>
  <div>Column B</div>
  <div>Column C</div>
</sic-grid>
```

**Attributes**

| Name | Type | Default | Description |
|---|---|---|---|
| `cols` | `number` | `12` | จำนวน column หลักของ grid |
| `gap` | `string` | `1rem` | ระยะห่างระหว่าง item |
| `colsBreakpoints` | `Record<string, number>` |  | จำนวน column ตาม breakpoint เช่น sm, md, lg |

**Events**

_None._

---

## Flex — `sic-flex`

_Category: Layout_

จัดวาง item แบบ flex row/column

**template.html**

```html
<sic-flex direction="row" gap="0.75rem" align="center" wrap="wrap">
  <sic-button>Primary</sic-button>
  <sic-button variant="outline">Secondary</sic-button>
</sic-flex>
```

**Attributes**

| Name | Type | Default | Description |
|---|---|---|---|
| `direction` | `'row' \| 'column' \| 'row-reverse' \| 'column-reverse'` | `row` | ทิศทางการเรียง item |
| `gap` | `string` | `0` | ระยะห่างระหว่าง item |
| `align` | `'start' \| 'center' \| 'end' \| 'stretch' \| 'baseline'` | `stretch` | align-items — รับทั้ง keyword ของ sic-flex เอง (start/end/...) และค่า CSS ตรงตัว (flex-start/flex-end) ก็ได้ |
| `justify` | `'start' \| 'center' \| 'end' \| 'between' \| 'around' \| 'evenly'` | `start` | justify-content — รับทั้ง keyword ของ sic-flex เอง (between/around/evenly/...) และค่า CSS ตรงตัว (space-between/flex-start/...) ก็ได้ |
| `wrap` | `'nowrap' \| 'wrap' \| 'wrap-reverse'` | `nowrap` | กำหนดการตัดบรรทัด |

**Events**

_None._

---

## Card — `sic-card`

_Category: General_

กล่องเนื้อหาแบบมีหัวข้อและ footer slot

**template.html**

```html
<sic-card title="Order #1024" [bordered]="true" [elevated]="true">
  <p>Order body content goes here.</p>
  <div sicCardFooter>
    <sic-button variant="ghost">Cancel</sic-button>
    <sic-button variant="solid" color="primary">Confirm</sic-button>
  </div>
</sic-card>
```

**Attributes**

| Name | Type | Default | Description |
|---|---|---|---|
| `title` | `string` |  | หัวข้อของ card |
| `bordered` | `boolean` | `false` | แสดงเส้นขอบ card |
| `elevated` | `boolean` | `false` | เพิ่มเงาให้ card |
| `sicCardFooter` | `content slot` |  | พื้นที่ footer ของ card |

**Events**

_None._

---

## Card Stack — `sic-card-stack`

_Category: General_

กองการ์ดซ้อนทับกัน — เอา cursor ไปชี้ (hover) การ์ดจะกางออกเป็นแฟน คลิกการ์ดที่อยู่ด้านหลังจะสลับมาเป็นใบหน้าสุดพร้อม animation (การ์ดคงตัวตน DOM เดิมผ่าน trackBy ด้วย id ทำให้ transition ลื่นไม่กระตุก) ปรับ [expanded] เพื่อบังคับกางออกเอง (ไม่ต้องพึ่ง hover) และปรับแต่ง UI การ์ดเองได้เต็มที่ผ่าน #cardTemplate

**template.html**

```html
<sic-card-stack [items]="destinations" (activeIndexChange)="onCardStackActive($event)">
  <ng-template #cardTemplate let-item let-position="position">
    <div class="my-stack-card">
      <img [src]="item.imageUrl" />
      <h4>{{ item.title }}</h4>
      <span>ตำแหน่ง: {{ position }}</span>
    </div>
  </ng-template>
</sic-card-stack>

<!-- ไม่ใส่ #cardTemplate ก็ใช้ card เริ่มต้นได้เลย (title/description/location/label/meta) -->
<sic-card-stack [items]="destinations" />
```

**component.ts**

```typescript
import { SicCardStackItem } from 'sic-ng';

destinations: SicCardStackItem[] = [
  { id: 1, label: '01', meta: '6 min read', title: 'Coastal path', description: 'Salt air along the chalk cliffs.', location: 'West shore', imageUrl: 'https://picsum.photos/seed/coast/400/300' },
  { id: 2, label: '02', meta: '4 min read', title: 'Desert wind', description: 'Wide skies over red sand.', location: 'Painted flats', imageUrl: 'https://picsum.photos/seed/desert/400/300' },
  { id: 3, label: '03', meta: '8 min read', title: 'Mountain rest', description: 'Cool air above the tree line.', location: 'North ridge', imageUrl: 'https://picsum.photos/seed/mountain/400/300' },
];

onCardStackActive(index: number): void {
  this.toasts.show(`Now in front: ${this.destinations[index].title}`, 'info');
}
```

**Attributes**

| Name | Type | Default | Description |
|---|---|---|---|
| `items` | `SicCardStackItem[]` | `[]` | { id?, title?, description?, imageUrl?, label?, meta?, location?, data? } — array JSON ธรรมดา |
| `expandOnHover` | `boolean` | `true` | กางการ์ดออกเป็นแฟนเมื่อ hover ที่กอง |
| `expanded` | `boolean \| null` | `null` | บังคับสถานะกางออก (true/false) แทนการพึ่ง hover — null คือให้ตาม hover ตามปกติ |
| `#cardTemplate` | `content slot` |  | ปรับแต่ง UI ของแต่ละการ์ดเอง รับ let-item, let-index="index", let-position="position" (0 = การ์ดหน้าสุด) — ไม่ใส่จะ fallback เป็น card เริ่มต้น |

**Events**

| Name | Payload | Description |
|---|---|---|
| `activeIndexChange` | `number` | เกิดเมื่อคลิกการ์ดด้านหลังแล้วสลับมาเป็นใบหน้าสุด (ไม่เกิดถ้าคลิกใบที่อยู่หน้าสุดอยู่แล้ว) |
| `cardClick` | `{ item: SicCardStackItem; index: number }` | เกิดทุกครั้งที่คลิกการ์ด ไม่ว่าจะอยู่ตำแหน่งไหน |

---

## Button — `sic-button`

_Category: General_

ปุ่ม action หลัก รองรับ variant, color, loading และ disabled

**template.html**

```html
<sic-button variant="solid" color="primary" [loading]="false" (click)="save()">
  Save
</sic-button>
```

**component.ts**

```typescript
save(): void {
  // persist changes
}
```

**Attributes**

| Name | Type | Default | Description |
|---|---|---|---|
| `variant` | `'solid' \| 'outline' \| 'ghost'` | `solid` | รูปแบบปุ่ม |
| `color` | `'primary' \| 'success' \| 'danger' \| string` | `primary` | สีของปุ่ม |
| `size` | `'sm' \| 'md' \| 'lg'` | `'sm'` | ความสูง/font-size ของปุ่ม — default เป็น sm ให้ตรงกับ default ของ sic-input/sic-combobox/ฯลฯ (SicFormControlBase) พอดี ปุ่มกับ input แถวเดียวกันจึงสูงเท่ากันโดยไม่ต้องกำหนด size ให้ตรงกันเอง |
| `loading` | `boolean` | `false` | แสดงสถานะกำลังโหลด |
| `disabled` | `boolean` | `false` | ปิดการใช้งานปุ่ม |
| `block` | `boolean` | `false` | ให้ปุ่มกว้างเต็ม container |
| `type` | `'button' \| 'submit' \| 'reset'` | `button` | ชนิดของ HTML button |

**Events**

| Name | Payload | Description |
|---|---|---|
| `click` | `MouseEvent` | เกิดเมื่อผู้ใช้กดปุ่ม |

---

## Button Group — `sic-button-group`

_Category: General_

รวมปุ่มหลายปุ่มให้เป็นกลุ่มเดียว

**template.html**

```html
<sic-button-group [attached]="true" direction="row">
  <sic-button variant="outline">Day</sic-button>
  <sic-button variant="outline">Week</sic-button>
  <sic-button variant="outline">Month</sic-button>
</sic-button-group>
```

**Attributes**

| Name | Type | Default | Description |
|---|---|---|---|
| `attached` | `boolean` | `false` | ทำให้ปุ่มติดกันเป็นชุดเดียว |
| `direction` | `'row' \| 'column'` | `row` | ทิศทางการเรียงปุ่ม |

**Events**

_None._

---

## A Link — `sic-a-link`

_Category: General_

<a> จริง (ไม่ใช่ <button>) แต่หน้าตาเหมือน sic-button เป๊ะๆ — ใช้ CSS ชุดเดียวกัน (variant/color/size) ใช้ตอนต้องการ link semantics จริง เช่น เปิดแท็บใหม่, คลิกขวา "เปิดในแท็บใหม่", href ที่ crawlable ได้

**template.html**

```html
<sic-a-link href="/pricing" variant="solid" color="primary">ดูราคา</sic-a-link>

<!-- external link เปิดแท็บใหม่ — rel="noopener noreferrer" ใส่ให้อัตโนมัติ -->
<sic-a-link href="https://example.com" target="_blank" variant="outline">เว็บไซต์ภายนอก</sic-a-link>

<!-- ดาวน์โหลดไฟล์ -->
<sic-a-link href="/report.pdf" [download]="'report.pdf'" variant="ghost">ดาวน์โหลด PDF</sic-a-link>

<!-- ปิดการใช้งาน — ตัด href ออก, ใส่ aria-disabled, กัน click -->
<sic-a-link href="/pricing" [disabled]="true">ดูราคา</sic-a-link>
```

**Attributes**

| Name | Type | Default | Description |
|---|---|---|---|
| `href` | `string` |  | ปกติเหมือน <a href> — ถ้า disabled จะถูกตัดออกจาก DOM ให้อัตโนมัติ |
| `target` | `'_blank' \| '_self' \| '_parent' \| '_top'` |  | เหมือน <a target> |
| `rel` | `string` |  | ทับค่า default noopener noreferrer ที่ใส่ให้อัตโนมัติเมื่อ target="_blank" |
| `download` | `string \| boolean` |  | true = ใส่ attribute download เปล่าๆ, string = ใช้เป็นชื่อไฟล์ที่ดาวน์โหลด |
| `variant` | `'solid' \| 'outline' \| 'ghost'` | `solid` | เหมือน sic-button |
| `color` | `'primary' \| 'success' \| 'danger' \| 'warning'` | `primary` | เหมือน sic-button |
| `size` | `'sm' \| 'md' \| 'lg'` | `'sm'` | เหมือน sic-button |
| `disabled` | `boolean` | `false` | <a> ไม่มี disabled ในตัว — ตัด href ออก, ใส่ aria-disabled="true"/tabindex="-1", และ preventDefault() ตอนคลิก |
| `block` | `boolean` | `false` | ให้ link กว้างเต็ม container |

**Events**

_None._

---

## Section — `sic-section`

_Category: Layout_

ตัวห่อ page section: container กว้างสูงสุด + padding + scroll-margin (สำหรับ anchor link) มาให้ในตัว — ใส่ title/lead ได้ตรงๆ, fullBleed ตัด container ออกสำหรับเนื้อหาเต็มความกว้าง (เช่น hero), bordered เพิ่มเส้นขอบบน (เช่น footer), center จัดกึ่งกลาง content ที่เป็น text

**template.html**

```html
<sic-section id="about" title="เกี่ยวกับเรา" lead="รายละเอียดสั้นๆ ใต้หัวข้อ">
  <p>เนื้อหาของ section...</p>
</sic-section>

<!-- เต็มความกว้าง ไม่มี container/padding — ใช้กับเนื้อหาแบบ hero -->
<sic-section [fullBleed]="true">...</sic-section>

<!-- footer: เส้นขอบบน + จัดกึ่งกลาง content -->
<sic-section [bordered]="true" [center]="true">...</sic-section>
```

**Attributes**

| Name | Type | Default | Description |
|---|---|---|---|
| `title` | `string` |  | แสดงเป็น <h2> เหนือเนื้อหา (ไม่ใส่ก็ไม่แสดง) |
| `lead` | `string` |  | ย่อหน้าอธิบายใต้ title จัดกึ่งกลางเสมอ |
| `fullBleed` | `boolean` | `false` | ตัด max-width/padding ของ container ออก |
| `bordered` | `boolean` | `false` | เพิ่มเส้นขอบด้านบน |
| `center` | `boolean` | `false` | จัดกึ่งกลาง text ของ content ที่ ng-content เข้ามา (ไม่รวม title/lead ซึ่งกึ่งกลางอยู่แล้ว) |

**Events**

_None._

---

## Show (Responsive) — `sic-show`

_Category: Layout_

แสดง/ซ่อน content ตาม breakpoint ผ่าน component จริง (ไม่ใช่ utility class ที่ต้องจำชื่อเอง) — breakpoint ชุดเดียวกับที่ sic-grid/sic-masonry ใช้ (md: 768px, lg: 1024px) ลองย่อ/ขยายหน้าต่างเบราว์เซอร์เพื่อดูผลของ demo ด้านล่าง

**template.html**

```html
<!-- แสดงตั้งแต่ md (768px) ขึ้นไป -->
<sic-show from="md">
  <nav>...menu links...</nav>
</sic-show>

<!-- แสดงเมื่อจอแคบกว่า md — ใช้คู่กันสลับเป็น hamburger menu -->
<sic-show upTo="md">
  <sic-button variant="outline">☰</sic-button>
</sic-show>
```

**Attributes**

| Name | Type | Default | Description |
|---|---|---|---|
| `from` | `'md' \| 'lg'` |  | แสดงตั้งแต่ breakpoint นี้ขึ้นไป (ซ่อนเมื่อจอแคบกว่า) |
| `upTo` | `'md' \| 'lg'` |  | แสดงเมื่อจอแคบกว่า breakpoint นี้ (ซ่อนตั้งแต่ breakpoint นี้ขึ้นไป) |

**Events**

_None._

---

## Text — `sic-text`

_Category: General_

ตัวอักษรเล็กๆ ที่ปรับ size/weight/color ผ่าน input แทนการเขียน custom CSS เอง — ครอบคลุมกรณีที่ใช้บ่อยอย่าง label/value/caption/ข้อความสถานะ

**template.html**

```html
<sic-text size="lg" weight="bold" block="true">หัวข้อย่อย</sic-text>
<sic-text color="muted" block="true">คำอธิบายสีจาง</sic-text>
<sic-text size="sm" weight="bold" color="active" block="true">ป้ายกำกับ</sic-text>
<sic-text color="success" size="sm">บันทึกสำเร็จ</sic-text>
<sic-text eyebrow="true" color="muted" size="sm" block="true">หมวดหมู่</sic-text>
```

**Attributes**

| Name | Type | Default | Description |
|---|---|---|---|
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | font-size จาก token |
| `weight` | `'normal' \| 'semibold' \| 'bold'` | `'normal'` | font-weight |
| `color` | `'default' \| 'muted' \| 'active' \| 'success'` | `'default'` | สีข้อความจาก token |
| `block` | `boolean` | `false` | display: block แทน inline (ปกติ) |
| `eyebrow` | `boolean` | `false` | สไตล์ caption ตัวพิมพ์ใหญ่ + letter-spacing (เช่น label เหนือหัวข้อ footer) |

**Events**

_None._

---

## Icon Badge — `sic-icon-badge`

_Category: General_

badge วงกลม พื้นหลังโทนสี primary อ่อนๆ สำหรับใส่ icon/emoji นำหน้า เช่น แถวข้อมูลติดต่อ (ที่อยู่/โทร/อีเมล)

**template.html**

```html
<sic-icon-badge>📍</sic-icon-badge>
<sic-icon-badge>📞</sic-icon-badge>
<sic-icon-badge>✉️</sic-icon-badge>
```

**Attributes**

| Name | Type | Default | Description |
|---|---|---|---|
| `content (ng-content)` | `content slot` |  | icon/emoji ที่จะแสดงตรงกลาง badge |

**Events**

_None._

---
