# Getting Started

ติดตั้งและตั้งค่าเริ่มต้นก่อนเริ่มใช้ component อื่นๆ

## การติดตั้ง — `npm install sic-ng`

_Category: Setup_

ติดตั้ง sic-ng และ peer dependencies (Angular 22 + CDK) แล้ว import theme CSS หนึ่งครั้งใน styles.css — dayjs มาพร้อมกับ sic-ng อยู่แล้ว ไม่ต้องติดตั้งเอง

**CLI**

```bash
npm install sic-ng
npm install @angular/cdk@^22
```

**styles.css**

```css
@import 'sic-ng/theme/all-themes.css'; /* รองรับสลับ theme ทั้ง 6 แบบตอน runtime */
/* หรือถ้าใช้ default theme อย่างเดียว: @import 'sic-ng/theme/default-theme.css'; */
```

**app.config.ts**

```typescript
import { bootstrapApplication } from '@angular/platform-browser';
import { provideSicTheme, provideSicConfig } from 'sic-ng';

bootstrapApplication(AppComponent, {
  providers: [provideSicTheme(), provideSicConfig({})],
});
```

**Attributes**

| Name | Type | Default | Description |
|---|---|---|---|
| `@angular/core, @angular/common, @angular/forms, @angular/cdk` | `peerDependency` | `^22.0.0` | ต้องติดตั้งเองในโปรเจกต์ (ปกติมีอยู่แล้วถ้าเป็น Angular app) |
| `dayjs` | `dependency` | `^1.11` | ติดมาพร้อม sic-ng อยู่แล้ว — ใช้ภายใน sic-calendar, sic-datepicker, sic-calendar-timeline ฯลฯ ต้อง import locale เองถ้าใช้ locale อื่นนอกจาก en เช่น import 'dayjs/locale/th' |
| `'sic-ng/theme/all-themes.css'` | `CSS import` |  | รวมทุก theme (default/sunset/forest/violet/slate/glass) — ใช้เมื่อจะสลับ theme ตอน runtime ผ่าน SicThemeService.setThemeName() |
| `'sic-ng/theme/default-theme.css'` | `CSS import` |  | เฉพาะ default theme (ไฟล์เล็กกว่า) — ใช้เมื่อไม่ต้องการสลับ theme หลายแบบ |

**Events**

_None._

---

## ตั้งค่า Theme — `provideSicTheme(config)`

_Category: Setup_

ตั้งค่า mode (light/dark/system) และเลือกพาเลตสีสำเร็จรูป (theme) ครั้งเดียวตอน bootstrap ผ่าน provideSicTheme() — mode จะจำค่าล่าสุดใน localStorage และตาม prefers-color-scheme ให้อัตโนมัติเมื่อเป็น system เปลี่ยนระหว่างรันได้ผ่าน SicThemeService (inject ได้ทุกที่ เช่น component นี้เองก็ใช้ toggleTheme() ที่ปุ่มมุมขวาบน)

**app.config.ts**

```typescript
import { bootstrapApplication } from '@angular/platform-browser';
import { provideSicTheme } from 'sic-ng';

bootstrapApplication(AppComponent, {
  providers: [
    provideSicTheme({ mode: 'system', theme: 'violet' }),
  ],
});
```

**component.ts**

```typescript
import { Component, inject } from '@angular/core';
import { SicThemeService } from 'sic-ng';

export class MyComponent {
  private readonly themeService = inject(SicThemeService);

  // signals อ่านสถานะปัจจุบันได้ตลอด
  isDark = this.themeService.isDark;
  themeName = this.themeService.themeName;

  toggleDark(): void {
    this.themeService.toggleDark();
  }

  useSunsetTheme(): void {
    this.themeService.setThemeName('sunset');
  }
}
```

**Attributes**

| Name | Type | Default | Description |
|---|---|---|---|
| `mode` | `'light' \| 'dark' \| 'system'` | `'system'` | provideSicTheme() config — โหมดเริ่มต้น, จำค่าล่าสุดใน localStorage อัตโนมัติหลังจากนั้น |
| `theme` | `'default' \| 'sunset' \| 'forest' \| 'violet' \| 'slate' \| 'glass'` | `'default'` | provideSicTheme() config — พาเลตสีสำเร็จรูปเริ่มต้น (ต้อง import sic-ng/theme/all-themes.css ถ้าจะสลับได้มากกว่า 1 แบบ) |
| `SicThemeService.mode / isDark / themeName` | `Signal` |  | อ่านสถานะปัจจุบัน — isDark ใช้คำนวณจาก mode และ prefers-color-scheme (ถ้าเป็น system) ให้อัตโนมัติ |
| `SicThemeService.setTheme(mode)` | `method` |  | เปลี่ยน mode และบันทึกลง localStorage |
| `SicThemeService.toggleDark()` | `method` |  | สลับระหว่าง 'light' กับ 'dark' (ปุ่มมุมขวาบนของหน้านี้ใช้ตัวนี้) |
| `SicThemeService.setThemeName(name)` | `method` |  | เปลี่ยนพาเลตสีสำเร็จรูประหว่างรัน และบันทึกลง localStorage |

**Events**

_None._

---

## ปรับสีเอง (Custom Color) — `applySicThemeConfig(config, element)`

_Category: Setup_

ทุก component อ่านสีจาก CSS custom property (--sic-color-primary ฯลฯ) เท่านั้น ปรับเองได้ 2 ทาง: (1) ตอน bootstrap ผ่าน provideSicTheme({ colorPrimary, ... }) หรือ (2) รันไทม์เรียก applySicThemeConfig() ตรงๆ กับ element ใดก็ได้ (เช่น document.documentElement เพื่อเปลี่ยนทั้งแอปทันที ไม่ต้อง reload) — ลองเปลี่ยนสีด้านล่างดูได้เลย

**app.config.ts**

```typescript
import { bootstrapApplication } from '@angular/platform-browser';
import { provideSicTheme } from 'sic-ng';

bootstrapApplication(AppComponent, {
  providers: [
    provideSicTheme({
      colorPrimary: '#7c3aed',
      colorSuccess: '#16a34a',
      colorDanger: '#dc2626',
      colorWarning: '#d97706',
      radiusSm: '0.375rem',
      radiusMd: '0.625rem',
      radiusLg: '1rem',
      fontSans: "'Sarabun', system-ui, sans-serif",
    }),
  ],
});
```

**settings.component.ts**

```typescript
import { applySicThemeConfig } from 'sic-ng';

// เปลี่ยนสีทั้งแอประหว่างรัน (เช่น จาก settings page ของผู้ใช้เอง)
applySicThemeConfig({ colorPrimary: '#7c3aed' }, document.documentElement);
```

**Attributes**

| Name | Type | Default | Description |
|---|---|---|---|
| `colorPrimary / colorSuccess / colorDanger / colorWarning` | `string (CSS color)` |  | แมปไปที่ --sic-color-primary/success/danger/warning — ทุก component ใช้ token เดียวกันนี้เสมอ ไม่มีสี hardcode |
| `radiusSm / radiusMd / radiusLg` | `string (CSS length)` |  | แมปไปที่ --sic-radius-sm/md/lg |
| `fontSans` | `string (CSS font-family)` |  | แมปไปที่ --sic-font-sans |
| `applySicThemeConfig(config, element)` | `function` |  | ใช้ config เดียวกับ provideSicTheme() แต่เรียกตรงกับ element ไหนก็ได้ ตอนไหนก็ได้ (ไม่ใช่แค่ตอน bootstrap) — ปกติเรียกกับ document.documentElement เพื่อให้มีผลทั้งแอป |

**Events**

_None._

---

## Global Config (SicConfig) — `provideSicConfig(config)`

_Category: Setup_

ตั้งค่า default กลางของทั้งไลบรารีครั้งเดียวตอน bootstrap แทนที่จะใส่ @Input ซ้ำๆ ทุก instance เช่น จำนวนทศนิยม, format ปฏิทิน, พ.ศ./ค.ศ., รูป loading เริ่มต้น และข้อความ static ต่างๆ เพื่อรองรับ bilingual — @Input ของแต่ละ component ยังชนะค่าจาก config นี้เสมอถ้าใส่ไว้

**app.config.ts**

```typescript
import { bootstrapApplication } from '@angular/platform-browser';
import { provideSicTheme, provideSicConfig } from 'sic-ng';

bootstrapApplication(AppComponent, {
  providers: [
    provideSicTheme({ mode: 'system' }),
    provideSicConfig({
      decimals: 2,
      dateFormat: 'dd/MM/yyyy',
      era: 'BE', // ผู้ใช้ไทยเห็น พ.ศ. ทุก sic-datepicker/sic-calendar โดยไม่ต้องใส่ era ทีละตัว
      locale: 'th',
      loadingImage: '/assets/brand-loader.gif',
      maxUploadSizeMb: 20,
      pageSize: 25,
      messages: {
        // sic-combobox
        noOptions: 'ไม่มีตัวเลือก',
        // sic-input-comment @mention
        noMatches: 'ไม่พบรายการที่ตรงกัน',
        loading: 'กำลังโหลด…',
        attachFile: 'แนบไฟล์',
        removeFile: 'ลบไฟล์แนบ',
        // sic-upload
        dragDropHint: 'ลากไฟล์มาวาง หรือคลิกเพื่อเลือกไฟล์',
        // sic-navbar
        noNotifications: 'ไม่มีการแจ้งเตือน',
        viewAllNotifications: 'ดูการแจ้งเตือนทั้งหมด',
        // sic-calendar
        noEvents: 'ไม่มีกิจกรรม',
        // sic-dialog common dialog
        cancel: 'ยกเลิก',
        confirm: 'ยืนยัน',
        close: 'ปิด',
        // sic-gridpanel
        gridLoading: 'กำลังโหลด...',
        gridSaving: 'กำลังบันทึกข้อมูล...',
        gridLoadingOverlay: 'กำลังโหลดข้อมูล...',
        gridNoData: 'ไม่พบข้อมูล',
        gridNoChangedData: 'ไม่มีข้อมูลที่เปลี่ยนแปลง',
        gridNoDataHint: 'ลองปรับคำค้นหา หรือเพิ่มแถวใหม่',
        gridNoChangedDataHint: 'ลองปิดโหมด review เพื่อดูทุกแถว',
        gridPageSizeSuffix: ' รายการ',
        // sic-search
        noResults: 'ไม่พบผลลัพธ์',
        // sic-masonry / sic-calendar-timeline / sic-card-stack
        noItems: 'ไม่มีรายการ',
        masonryLoading: 'กำลังโหลดเพิ่มเติม...',
        // sic-drag-drop
        dragDropEmptyList: 'วางรายการที่นี่',
        // sic-stepper
        stepperPrevious: 'ย้อนกลับ',
        stepperNext: 'ถัดไป',
        stepperSkip: 'ข้าม',
        stepperFinish: 'เสร็จสิ้น',
        // sic-code
        codeCopy: 'คัดลอก',
        codeCopied: 'คัดลอกแล้ว',
        // sic-calendar-timeline view switcher
        calendarTimelineViewLabel: 'มุมมอง',
        calendarTimelineDay: 'วัน',
        calendarTimelineWeek: 'สัปดาห์',
        calendarTimelineMonth: 'เดือน',
        // sic-video-player
        playVideo: 'เล่นวิดีโอ',
        // sicCanDeactivateGuard
        unsavedChangesTitle: 'มีการเปลี่ยนแปลงที่ยังไม่บันทึก',
        unsavedChangesMessage: 'คุณมีการเปลี่ยนแปลงที่ยังไม่บันทึก ต้องการออกจากหน้านี้หรือไม่?',
      },
    }),
  ],
});
```

**Attributes**

| Name | Type | Default | Description |
|---|---|---|---|
| `decimals` | `number` | `2` | จำนวนทศนิยมเริ่มต้นของ sic-input-number และคอลัมน์/summary ชนิด number ใน sic-gridpanel |
| `dateFormat` | `string` | `'dd/MM/yyyy'` | format วันที่เริ่มต้นของ sic-datepicker และคอลัมน์ date ใน sic-gridpanel |
| `era` | `'BE' \| 'CE'` | `'CE'` | ระบบปีเริ่มต้น (พ.ศ./ค.ศ.) ของ sic-datepicker และ sic-calendar — เก็บ/ส่งค่าเป็น ค.ศ. จริงเสมอ เปลี่ยนแค่ปีที่โชว์ผู้ใช้ |
| `locale` | `string` | `'en'` | dayjs locale code เริ่มต้นของ sic-datepicker/sic-calendar (ต้อง import dayjs/locale/xx เองก่อนใช้) |
| `loadingImage` | `string` |  | URL รูป .png/.gif เริ่มต้นของ SicLoadingService.show() เมื่อไม่ได้ระบุ image ต่อครั้ง — ไม่ใส่จะแสดง sic-spinner |
| `loadingSpinnerSize` | `'sm' \| 'md' \| 'lg'` | `'lg'` | ขนาด sic-spinner เริ่มต้นของ SicLoadingService.show() เมื่อไม่มี image และไม่ระบุ spinnerSize |
| `maxUploadSizeMb` | `number` | `10` | ขนาดไฟล์สูงสุด (MB) เริ่มต้นของ sic-upload และ sic-input-comment |
| `pageSize` | `number` | `10` | จำนวนแถว/รายการต่อหน้าเริ่มต้นของ sic-gridpanel และ sic-combobox |
| `pageSizeOptions` | `number[]` | `[10, 30, 50]` | ตัวเลือกจำนวนต่อหน้าเริ่มต้นใน dropdown ของ sic-gridpanel |
| `messages.noOptions` | `string` | `'No options'` | sic-combobox เมื่อไม่มีตัวเลือก |
| `messages.noMatches` | `string` | `'No matches'` | sic-input-comment เมื่อค้นหา @mention ไม่เจอ |
| `messages.loading` | `string` | `'Loading…'` | sic-input-comment ระหว่าง mentionSearch กำลังทำงาน |
| `messages.attachFile` | `string` | `'Attach file'` | sic-input-comment aria-label ปุ่มแนบไฟล์ |
| `messages.removeFile` | `string` | `'Remove file'` | sic-input-comment aria-label ปุ่มลบไฟล์แนบ |
| `messages.dragDropHint` | `string` | `'Drag & drop files here, or click to browse'` | sic-upload ข้อความในกล่องลากไฟล์ |
| `messages.noNotifications` | `string` | `'No notifications'` | sic-navbar เมื่อไม่มีการแจ้งเตือน |
| `messages.viewAllNotifications` | `string` | `'View All Notifications'` | sic-navbar ปุ่มท้าย dropdown แจ้งเตือน |
| `messages.noEvents` | `string` | `'No events'` | sic-calendar มุมมอง list เมื่อวันนั้นไม่มีกิจกรรม |
| `messages.cancel / confirm / close` | `string` | `'Cancel' / 'Confirm' / 'Close'` | sic-dialog common dialog — ใช้เมื่อไม่ได้ส่ง cancelText/confirmText/closeText ต่อครั้ง |
| `messages.gridLoading / gridSaving / gridLoadingOverlay` | `string` |  | sic-gridpanel ข้อความระหว่างโหลด/บันทึกข้อมูล |
| `messages.gridNoData / gridNoChangedData` | `string` |  | sic-gridpanel หัวข้อ empty state (โหมดปกติ / โหมด review changes) |
| `messages.gridNoDataHint / gridNoChangedDataHint` | `string` |  | sic-gridpanel คำอธิบายใต้หัวข้อ empty state |
| `messages.gridPageSizeSuffix` | `string` | `''` | ข้อความต่อท้ายตัวเลขใน dropdown เลือกจำนวนต่อหน้าของ sic-gridpanel เช่น ตั้งเป็น " รายการ" จะได้ "10 รายการ" |
| `messages.noResults` | `string` | `'No results'` | sic-search เมื่อค้นหาแล้วไม่พบผลลัพธ์ |
| `messages.noItems` | `string` | `'No items'` | empty state ของ sic-masonry, sic-calendar-timeline และ sic-card-stack เมื่อ items ว่าง |
| `messages.masonryLoading` | `string` | `'Loading more...'` | sic-masonry ข้อความระหว่างโหลดหน้าถัดไปในโหมด isLazy |
| `messages.dragDropEmptyList` | `string` | `'Drop items here'` | sic-drag-drop ข้อความ placeholder เมื่อ list/column ว่าง |
| `messages.stepperPrevious / stepperNext / stepperSkip / stepperFinish` | `string` | `'Previous' / 'Next' / 'Skip' / 'Finish'` | sic-stepper ปุ่ม nav ในตัว (Skip แสดงเฉพาะ step ที่เป็น optional) |
| `messages.codeCopy / codeCopied` | `string` | `'Copy' / 'Copied'` | sic-code ปุ่ม copy — สถานะปกติ และสถานะที่แสดงชั่วครู่หลังคัดลอกสำเร็จ |
| `messages.calendarTimelineViewLabel` | `string` | `'View'` | sic-calendar-timeline ป้ายกำกับหน้าตัวสลับมุมมอง day/week/month |
| `messages.calendarTimelineDay / calendarTimelineWeek / calendarTimelineMonth` | `string` | `'Day' / 'Week' / 'Month'` | sic-calendar-timeline ตัวเลือกในตัวสลับมุมมอง day/week/month |
| `messages.playVideo` | `string` | `'Play video'` | sic-video-player aria-label ปุ่ม play ที่ทับอยู่บน poster ก่อนเริ่มเล่น |
| `messages.unsavedChangesTitle` | `string` | `'Unsaved changes'` | sicCanDeactivateGuard หัวข้อ dialog ยืนยันเมื่อออกจากหน้าที่มีการเปลี่ยนแปลงยังไม่บันทึก |
| `messages.unsavedChangesMessage` | `string` | `'You have unsaved changes. Leave this page anyway?'` | sicCanDeactivateGuard ข้อความอธิบายใน dialog เดียวกัน |

**Events**

_None._

---
