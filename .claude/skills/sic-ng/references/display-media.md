# Data Display & Media

แสดงข้อมูล รูปภาพ วิดีโอ และสถานะ

## Grid Panel — `sic-gridpanel`

_Category: Data Display_

ตารางข้อมูลแบบแก้ไขได้ทั้งแถว รองรับ column หลาย type (text/number/date/time/color/combobox/checkbox/radio/switch/button) รวมถึง column type กำหนดเอง (custom) ผ่าน ng-template, กำหนด minWidth ต่อคอลัมน์ได้, sort, เลือกแถว, review การเปลี่ยนแปลง, แถวสรุปท้ายตาราง และคุมการโหลด/บันทึกข้อมูลผ่าน event ทั้งหมด (ไม่ผูกกับ HttpClient ภายใน)

**template.html**

```html
<sic-gridpanel
  #grid
  [config]="gridConfig"
  (loadData)="handleGridLoad($event, grid)"
  (saveData)="handleGridSave($event, grid)"
  (rowAction)="handleGridRowAction($event)"
>
  <!-- custom column: ng-template sicGridPanelTemplate="<column.type>" (หรือ column.name ถ้า type เป็น built-in) -->
  <ng-template sicGridPanelTemplate="statusBadge" section="cell" let-row>
    <span class="status-badge" [class.status-badge--active]="row.active">
      {{ row.active ? 'Active' : 'Inactive' }}
    </span>
  </ng-template>
</sic-gridpanel>
```

**component.ts**

```typescript
gridConfig: SicGridPanelConfig = {
  id: 'id',
  defaultSortField: 'name',
  lazy: false, // fetch the whole dataset once, paginate/sort it locally from there
  pageSize: 2,
  pageSizeOptions: [3, 5, 10], // ตัวเลือกใน dropdown "Rows per page" ที่ footer
  // header แถวที่ 2 — group คอลัมน์ที่เกี่ยวข้องกันไว้ด้วยกัน (columns ต้องเรียงติดกัน)
  columnGroups: [
    { label: 'Employee', columns: ['name', 'role'] },
    { label: 'Schedule', columns: ['joinDate', 'startTime'] },
  ],
  column: [
    { label: 'Name', name: 'name', type: 'text', editable: true, sortable: true, minWidth: 160, validators: [Validators.required] },
    {
      label: 'Role',
      name: 'role',
      type: 'combobox',
      editable: true,
      minWidth: 180,
      options: [
        { label: 'Engineer', value: 'Engineer' },
        { label: 'Designer', value: 'Designer' },
        { label: 'Product Manager', value: 'Product Manager' },
      ],
    },
    {
      label: 'Priority',
      name: 'priority',
      type: 'radio',
      editable: true,
      direction: 'row',
      minWidth: 220, // ป้องกันไม่ให้ radio 3 ตัวถูกบีบจนล้น
      options: [
        { label: 'Low', value: 'low' },
        { label: 'Medium', value: 'medium' },
        { label: 'High', value: 'high' },
      ],
    },
    { label: 'Salary', name: 'salary', type: 'number', editable: true, decimals: 0 },
    { label: 'Join date', name: 'joinDate', type: 'date', editable: true, dateFormat: 'dd/MM/yyyy' },
    { label: 'Start time', name: 'startTime', type: 'time', editable: true },
    { label: 'Tag color', name: 'tagColor', type: 'color', editable: true },
    { label: 'Active', name: 'active', type: 'checkbox', editable: true },
    { label: 'Enabled', name: 'enabled', type: 'switch', editable: true },
    { label: 'Status', name: 'status', type: 'statusBadge', align: 'center' }, // custom column — rendered by the projected ng-template below
    { label: 'Detail', name: 'detail', type: 'button', buttonText: 'View' },
  ],
  summaryPage: [
    { column: 'salary', type: 'sum', label: '', decimals: 0 }, // รวมยอดเฉพาะหน้าที่กำลังแสดง
    // custom: นับจำนวนแถวในหน้านี้ แล้วจัดข้อความเอง — ชิดขวา
    { column: 'priority', type: 'custom', align: 'right', calculate: (rows) => rows.length, formatter: (value) => `รวมหน้านี้ ${value} รายการ` },
    // custom: ดึงยอด salary มาแสดงใต้คอลัมน์ joinDate แทน (column แค่กำหนด "ตำแหน่งที่แสดง" ไม่จำเป็นต้องตรงกับ field ที่คำนวณ) — ชิดซ้าย
    {
      column: 'joinDate',
      type: 'custom',
      align: 'left',
      calculate: (rows) => rows.reduce((sum, row) => sum + (Number(row['salary']) || 0), 0),
      formatter: (value) => `${new Intl.NumberFormat().format(value)} บาท`,
    },
  ],
  summary: {
    showOn: 'all', // 'all' (default) ทุกหน้า, 'last' แสดงเฉพาะหน้าสุดท้าย
    columns: [
      { column: 'salary', type: 'sum', label: 'รวมทั้งหมด', decimals: 0 }, // รวมยอดทั้ง dataset
      { column: 'priority', type: 'custom', align: 'right', calculate: (rows) => rows.length, formatter: (value) => `รวมทั้งหมด ${value} รายการ` },
      {
        column: 'joinDate',
        type: 'custom',
        align: 'left',
        calculate: (rows) => rows.reduce((sum, row) => sum + (Number(row['salary']) || 0), 0),
        formatter: (value) => `${new Intl.NumberFormat().format(value)} บาท`,
      },
    ],
  },
  toolbar: { save: true, add: true, delete: true, review: true }, // ปิดปุ่ม review ได้อิสระ
  // ห้ามเลือกแถวของ Carol ผ่าน checkbox — เช็คจาก rowData ไม่ใช่ rowIndex
  // เพราะ rowIndex คือตำแหน่งในหน้าที่กำลังแสดง (0..pageSize-1) ไม่ใช่ index รวมทั้ง dataset
  disableSelect: (rowIndex, row) => row['name'] === 'Carol',
  // ล็อกฟิลด์ salary ของแถวที่ role เป็น Product Manager ไม่ให้แก้ไข
  disableEdit: (rowIndex, fieldName, value, row) => fieldName === 'salary' && row['role'] === 'Product Manager',
};

private gridSourceRows: SicGridRowData[] = [
  { id: 1, name: 'Alice', role: 'Engineer', priority: 'high', salary: 45000, joinDate: '2023-01-15', startTime: '09:00', tagColor: '#2563eb', active: true, enabled: true },
  { id: 2, name: 'Bob', role: 'Designer', priority: 'medium', salary: 38000, joinDate: '2022-11-02', startTime: '09:30', tagColor: '#16a34a', active: true, enabled: true },
  { id: 3, name: 'Carol', role: 'Product Manager', priority: 'low', salary: 52000, joinDate: '2021-06-20', startTime: '10:00', tagColor: '#f59e0b', active: false, enabled: false },
  { id: 4, name: 'Dave', role: 'Engineer', priority: 'medium', salary: 41000, joinDate: '2023-08-09', startTime: '08:45', tagColor: '#dc2626', active: true, enabled: true },
  { id: 5, name: 'Eve', role: 'Designer', priority: 'low', salary: 39500, joinDate: '2024-02-14', startTime: '09:15', tagColor: '#7c3aed', active: true, enabled: false },
];

handleGridLoad(request: SicGridLoadRequest, grid: SicGridPanelComponent): void {
  // in a real app, fetch from the server here instead
  setTimeout(() => {
    grid.setRows(this.gridSourceRows, { totalElements: this.gridSourceRows.length }, request.requestId);
  }, 300);
}

handleGridSave(request: SicGridSaveRequest, grid: SicGridPanelComponent): void {
  // in a real app, persist request.rows to the server here instead
  setTimeout(() => {
    grid.setSaveResult(true, 'บันทึกข้อมูลตัวอย่างสำเร็จ', request.requestId);
  }, 300);
}

handleGridRowAction(event: { action: string; row?: SicGridRowData | null }): void {
  if (event.action === 'detail' && event.row) {
    this.toasts.show(`ดูรายละเอียดของ ${event.row['name']}`, 'info');
  }
}
```

**Attributes**

| Name | Type | Default | Description |
|---|---|---|---|
| `config` | `SicGridPanelConfig` |  | กำหนด id ของแถว, รายการคอลัมน์ (column) — column.type รองรับ text/area/number/date/time/color/upload/combobox/checkbox/radio/switch/button หรือกำหนด type เองเพื่อ render ด้วย ng-template ที่ใส่ไว้ใน <sic-gridpanel> (ดูตัวอย่าง statusBadge), column.align จัดตำแหน่งแนวนอนของเนื้อหาในเซลล์ (left/center/right — default: right สำหรับ number, ที่เหลือ left) ใช้ได้กับทุก type รวมถึง custom column, column.minWidth กำหนดความกว้างขั้นต่ำต่อคอลัมน์ (px), การ sort เริ่มต้น และ toolbar เพื่อเปิด/ปิดปุ่มบน toolbar แต่ละปุ่มอิสระ (save/add/delete/review) — ทุกปุ่มแสดงเป็นค่าเริ่มต้น |
| `config.summaryPage` | `SicGridSummaryConfig[]` |  | แถวสรุปท้ายตาราง คำนวณจากแถวในหน้าที่กำลังแสดงเท่านั้น — แต่ละ item ระบุ column, type (sum/avg/count/min/max/custom), label, align, decimals (ถ้าไม่ระบุจะใช้ decimals ของ column นั้นแทนสำหรับ column type number), calculate (จำเป็นเมื่อ type เป็น custom) และ formatter |
| `config.summary` | `{ showOn?: 'all' \| 'last'; columns: SicGridSummaryConfig[] }` |  | แถวสรุปยอดรวม "ทั้ง dataset" แสดงต่อจากแถว summaryPage (ถ้ามี) — showOn กำหนดว่าจะแสดงทุกหน้า (default) หรือเฉพาะหน้าสุดท้าย ("last") หมายเหตุ: ในโหมด lazy (default) grid รู้จักแค่ข้อมูลหน้าที่โหลดมาแล้ว ไม่ใช่ dataset เต็มจากฝั่ง server — ถ้าต้องการยอดรวมที่แม่นยำข้ามหน้าให้ใช้ lazy: false |
| `config.selectable` | `boolean` |  | default true — false เพื่อซ่อนคอลัมน์ checkbox เลือกแถวทั้งหมด (header "select all" และทุกแถว) รวมถึงปุ่ม "Delete selected rows" บน toolbar |
| `config.columnGroups` | `{ label, columns: string[], align? }[]` |  | ทางเลือก — เพิ่ม header แถวที่ 2 ด้านบน โดยแต่ละ group ครอบคลุมคอลัมน์ตาม column.name ที่ระบุใน columns (ต้องเรียงติดกันใน visible columns) แสดงเป็น label เดียวคร่อมความกว้างของคอลัมน์เหล่านั้น ส่วนคอลัมน์ที่ไม่ได้อยู่ใน group ใดจะ header สูงเต็ม 2 แถวตามปกติ ไม่ระบุ columnGroups เลย จะแสดง header แถวเดียวแบบเดิม |
| `config.pageSizeOptions` | `number[]` |  | ตัวเลือกใน dropdown เปลี่ยนจำนวนแถวต่อหน้าที่ footer default [10, 30, 50] — ถ้า pageSize ปัจจุบันไม่อยู่ใน list จะถูกเพิ่มเข้าไปให้อัตโนมัติเพื่อให้ dropdown เลือกถูกค่า |
| `config.pageSizeSelector` | `boolean` |  | default true — false เพื่อซ่อน dropdown เปลี่ยนจำนวนแถวต่อหน้า (แสดงเมื่อ pageable เปิดอยู่เท่านั้น) |
| `config.showToolbar` | `boolean` |  | default true — false เพื่อซ่อน toolbar ทั้งแถบ (save/add/delete/review) ทับค่า config.toolbar ของแต่ละปุ่มทั้งหมด |
| `config.showFooterBar` | `boolean` |  | default true — false เพื่อซ่อน footer bar ทั้งแถบ (dropdown เปลี่ยนจำนวนแถวต่อหน้า, "รวม N รายการ", ปุ่มเปลี่ยนหน้า) ไม่เกี่ยวกับแถวสรุป summary/summaryPage ซึ่งควบคุมแยกกัน |
| `config.disableRow` | `(row) => boolean` |  | คืนค่า true เพื่อปิดทั้งแถว (แก้ไข/ลบ/เลือกไม่ได้ทั้งหมด) |
| `config.disableSelect` | `(rowIndex, rowData) => boolean` |  | คืนค่า true เพื่อปิดเฉพาะ checkbox เลือกแถวนั้น โดยไม่กระทบการแก้ไขฟิลด์อื่น — rowIndex คือตำแหน่งของแถวในหน้าที่กำลังแสดงอยู่ (0..pageSize-1) ไม่ใช่ index รวมทั้ง dataset ถ้าต้องการอ้างอิงแถวแบบคงที่ไม่ขึ้นกับหน้า ให้เช็คจาก rowData แทน (เช่น id) |
| `config.disableEdit` | `(rowIndex, fieldName, data, rowData) => boolean` |  | ถูกเรียกทุกคอลัมน์ที่ editable ของทุกแถว — คืนค่า true เพื่อล็อกฟิลด์นั้นเป็น readonly (จะคืน true ทุก fieldName ของแถวเดียวกัน ก็ล็อกทั้งแถวได้เช่นกัน) — rowIndex เป็นตำแหน่งในหน้าปัจจุบันเช่นเดียวกับ disableSelect ให้ใช้ rowData เพื่ออ้างอิงแถวที่แน่นอน |

**Events**

| Name | Payload | Description |
|---|---|---|
| `loadData` | `SicGridLoadRequest` | ขอให้โหลดข้อมูลหน้าใหม่ (page/sort/keyword) — เมื่อโหลดเสร็จให้เรียก grid.setRows(rows, pageable, requestId) หรือ grid.setLoadError(message, requestId) |
| `saveData` | `SicGridSaveRequest` | ขอให้บันทึกแถวที่เปลี่ยนแปลง — เมื่อบันทึกเสร็จให้เรียก grid.setSaveResult(success, message, requestId) |
| `rowsChange` | `SicGridRowData[]` | ค่าปัจจุบันของทุกแถวที่ถูก track (รวม state) เปลี่ยนแปลง |
| `rowAction` | `{ action, row, rows, column }` | เกิดจากปุ่มในคอลัมน์ type: button (action = column.name) หรือการ add/save/reset/soft-delete |
| `softDeleteChange` | `{ id, deleted, row }` | แถวถูกทำเครื่องหมายลบ/กู้คืน |

---

## Calendar — `sic-calendar`

_Category: Data Display_

ปฏิทินเต็มรูปแบบ (full calendar) แยกข้อมูล 2 ส่วน: วันหยุด (badge วงกลมซ้อนกัน คลิกเปิด sidebar) และ task (บรรทัดไอคอน+ข้อความ ล้นแล้วยุบเป็น "ดูเพิ่มเติม") รองรับ grid/list, คลิกที่ชื่อเดือน/ปี (header) เพื่อเลือกเดือน-ปีโดยตรง และสลับ พ.ศ./ค.ศ. ด้วย dayjs (เปิด/ปิดปุ่มสลับได้ผ่าน eraSwitcher)

**template.html**

```html
<sic-calendar
  [weekStartsOn]="1"
  locale="th"
  [tasks]="calendarTasks"
  [holidays]="calendarHolidays"
  [(era)]="calendarEra"
  [(view)]="calendarView"
  (dateClick)="handleCalendarDateClick($event)"
  (eventClick)="handleCalendarEventClick($event)"
  (holidayClick)="handleCalendarHolidayClick($event)"
  (monthChange)="handleCalendarMonthChange($event)"
/>
```

**component.ts**

```typescript
// ต้อง import ก่อนใช้ locale ที่ไม่ใช่ 'en' (เหมือน sic-datepicker)
import 'dayjs/locale/th';
import { SicCalendarEra, SicCalendarEvent, SicCalendarHoliday, SicCalendarView } from 'sic-ng';

calendarEra: SicCalendarEra = 'BE';
calendarView: SicCalendarView = 'grid';
calendarTasks: SicCalendarEvent[] = [
  { id: 1, date: new Date(), title: 'ประชุมทีมประจำสัปดาห์', color: '#22c55e', icon: '👥', description: '10:00 - ห้องประชุม A' },
  { id: 2, date: new Date(), title: 'ส่งมอบงานลูกค้า', color: '#f59e0b', icon: '📦' },
];
calendarHolidays: SicCalendarHoliday[] = [
  { id: 1, date: new Date(), title: 'วันหยุดชดเชยบริษัท', source: 'office' },
  { id: 2, date: new Date(), title: 'วันหยุดราชการ', source: 'government' },
];

handleCalendarDateClick(event: { date: Date; tasks: SicCalendarEvent[]; holidays: SicCalendarHoliday[] }): void {
  console.log('คลิกวันที่', event.date, event.tasks.length, 'task', event.holidays.length, 'วันหยุด');
}

handleCalendarEventClick(event: SicCalendarEvent): void {
  console.log('คลิก task', event.title, event.description);
}

handleCalendarHolidayClick(holiday: SicCalendarHoliday): void {
  console.log('คลิกวันหยุด', holiday.title, holiday.source);
}

handleCalendarMonthChange(date: Date): void {
  console.log('เปลี่ยนเดือนไปที่', date);
}
```

**Attributes**

| Name | Type | Default | Description |
|---|---|---|---|
| `selected` | `Date \| string \| null` |  | วันที่ที่เลือกอยู่ (คลิกวันในปฏิทินเพื่อเปลี่ยน) |
| `weekStartsOn` | `0 \| 1` | `0` | วันเริ่มต้นของสัปดาห์ 0 = Sunday, 1 = Monday |
| `tasks` | `SicCalendarEvent[]` | `[]` | { id?, date, title, color?, icon?, description? } — แสดงเป็นบรรทัดไอคอน+ข้อความ (ตัดด้วย … ถ้ายาวเกิน 1 บรรทัด) เรียงลงตาม field date ของแต่ละ task ถ้าเกิน maxVisibleTasks บรรทัดสุดท้ายจะยุบเป็น "ดูเพิ่มเติม" เปิด sidebar แสดงรายการทั้งหมด |
| `holidays` | `SicCalendarHoliday[]` | `[]` | { id?, date, title, source?, color?, icon? } — source: 'office'\|'government'\|'bank'\|'other' กำหนดไอคอน/สี default ให้อัตโนมัติถ้าไม่ระบุ color/icon เอง แสดงเป็น badge วงกลมซ้อนทับกันในแต่ละวัน คลิกเพื่อเปิด sidebar แสดงรายการวันหยุดของวันนั้น |
| `era` | `'BE' \| 'CE'` | `'CE'` | ปีที่แสดงบน header — BE = พ.ศ. (ค.ศ. + 543), CE = ค.ศ. ค่าที่เก็บ/ส่งออกยังคงเป็นวันที่จริงเสมอ กดปุ่ม พ.ศ./ค.ศ. เพื่อสลับได้ (รองรับ [(era)] two-way binding) |
| `eraSwitcher` | `boolean` | `true` | false เพื่อซ่อนปุ่มสลับ พ.ศ./ค.ศ. บน toolbar (ยังคงกำหนดปีที่แสดงได้ผ่าน era input ตามปกติ แค่ผู้ใช้กดสลับเองไม่ได้) |
| `view` | `'grid' \| 'list'` | `'grid'` | 'grid' = ปฏิทินรายเดือนแบบตาราง, 'list' = agenda แสดงทุกวันในเดือนเรียงจากบนลงล่างพร้อม task การ์ดสี รองรับ [(view)] two-way binding |
| `locale` | `string` | `'en'` | dayjs locale สำหรับชื่อเดือน/วัน — ต้อง import 'dayjs/locale/<code>' เองก่อนใช้ locale อื่นนอกจาก 'en' |
| `maxVisibleTasks` | `number` | `3` | จำนวนบรรทัด task สูงสุดต่อวันในมุมมอง grid ก่อนบรรทัดสุดท้ายจะยุบเป็น "ดูเพิ่มเติม (+N)" |

**Events**

| Name | Payload | Description |
|---|---|---|
| `selectedChange` | `Date` | วันที่ถูกเลือกเปลี่ยน (คลิกวันในปฏิทิน) |
| `dateClick` | `{ date: Date; tasks: SicCalendarEvent[]; holidays: SicCalendarHoliday[] }` | คลิกวันที่ใดก็ตาม (นอกพื้นที่ badge วันหยุด/บรรทัด task) พร้อม task และวันหยุดทั้งหมดของวันนั้น |
| `eventClick` | `SicCalendarEvent` | คลิกที่บรรทัด task โดยตรง (ทั้งใน grid/list และในรายการ sidebar) — ใช้เปิดรายละเอียด/แก้ไข task นั้นได้ |
| `holidayClick` | `SicCalendarHoliday` | คลิกรายการวันหยุดใน sidebar (เปิด sidebar ก่อนโดยคลิก badge วงกลมซ้อนในวันนั้น) |
| `eraChange` | `'BE' \| 'CE'` | ผู้ใช้กดปุ่มสลับ พ.ศ./ค.ศ. |
| `viewChange` | `'grid' \| 'list'` | ผู้ใช้สลับมุมมอง grid/list |
| `monthChange` | `Date` | เดือนที่แสดงเปลี่ยน (กดปุ่มเดือนก่อนหน้า/ถัดไป/Today) — payload คือวันที่ 1 ของเดือนใหม่ ไม่ยิงซ้ำถ้ายังอยู่เดือนเดิม |

---

## Calendar Timeline — `sic-calendar-timeline`

_Category: Data Display_

Gantt-style timeline: กำหนด [startDate]/[endDate] เป็นช่วงที่มองเห็นได้ แสดงเป็นรายวัน/สัปดาห์/เดือนได้ผ่าน [(viewMode)] — สลับได้เองในตัวจากปุ่มที่เปิดเป็น sic-popover (แสดง/ซ่อนได้ด้วย [showViewModeToggle]) แต่ละแถวมี phases (bar) ได้หลายช่วงในแถวเดียว (ไม่ทับกันก็ได้ ทับกันก็ได้) คอลัมน์แรก (ชื่อรายการ) พับ/กางได้ (ปุ่ม ‹/› มุมซ้ายบนของตาราง) ตารางจำกัดความสูงและมี scrollbar ในตัวเมื่อรายการยาว ([maxHeight], ค่าเริ่มต้น 28rem, เลื่อน label column กับ timeline พร้อมกันเสมอ) ใช้ dayjs ทั้งหมด (locale สำหรับชื่อวัน/เดือน ต้อง import เองเหมือน sic-calendar/sic-datepicker) และรองรับ พ.ศ./ค.ศ. ผ่าน [era] ปรับแต่งทั้งคอลัมน์ชื่อรายการ (#labelTemplate) และแถบ timeline (#phaseTemplate) เองได้เต็มที่

**template.html**

```html
<sic-calendar-timeline
  [items]="ganttRows"
  startDate="2020-08-11"
  endDate="2020-08-22"
  [(viewMode)]="ganttViewMode"
  locale="th"
  era="BE"
  maxHeight="24rem"
  [(showLabelColumn)]="ganttShowLabels"
  (rowClick)="onGanttRowClick($event)"
  (phaseClick)="onGanttPhaseClick($event)"
>
  <ng-template #labelTemplate let-row>
    <div class="my-gantt-label">
      <img [src]="row.avatarUrl" class="my-gantt-avatar" />
      <span>{{ row.label }}</span>
    </div>
    <span>{{ row.progress }}%</span>
  </ng-template>

  <ng-template #phaseTemplate let-phase let-row="row">
    <img [src]="phase.avatarUrl" class="my-gantt-avatar" />
    <div>
      <strong>{{ phase.label }}</strong>
      <div>{{ phase.description }}</div>
    </div>
  </ng-template>
</sic-calendar-timeline>
```

**component.ts**

```typescript
// ต้อง import ก่อนใช้ locale ที่ไม่ใช่ 'en' (เหมือน sic-calendar/sic-datepicker)
import 'dayjs/locale/th';
import { SicCalendarTimelineRow, SicCalendarTimelineViewMode } from 'sic-ng';

ganttShowLabels = true;
ganttViewMode: SicCalendarTimelineViewMode = 'day';
ganttRows: SicCalendarTimelineRow[] = [
  {
    id: 1,
    label: 'Lorem ipsum 0',
    avatarUrl: 'https://i.pravatar.cc/40?img=1',
    progress: 72,
    phases: [
      { id: 'p1', label: 'John Doe 7', description: 'Lorem ipsum dolor sit amet', start: '2020-08-13', end: '2020-08-14', color: '#94a3b8' },
    ],
  },
  {
    id: 2,
    label: 'Lorem ipsum 1',
    avatarUrl: 'https://i.pravatar.cc/40?img=2',
    progress: 89,
    phases: [
      // แถวเดียวมีได้หลาย phase — ช่วงเวลาไม่จำเป็นต้องต่อกัน
      { id: 'p2', label: 'Planning', start: '2020-08-13', end: '2020-08-13', color: '#f59e0b' },
      { id: 'p3', label: 'John Doe 9', description: 'Lorem ipsum dolor sit amet', start: '2020-08-14', end: '2020-08-22', color: '#22c55e' },
    ],
  },
];

onGanttRowClick(row: SicCalendarTimelineRow): void {
  this.toasts.show(`เปิดแถว: ${row.label}`, 'info');
}

onGanttPhaseClick(event: { row: SicCalendarTimelineRow; phase: { label?: string } }): void {
  this.toasts.show(`เปิด phase: ${event.phase.label}`, 'info');
}
```

**Attributes**

| Name | Type | Default | Description |
|---|---|---|---|
| `items` | `SicCalendarTimelineRow[]` | `[]` | { id, label, avatarUrl?, progress?, phases, data? } — array JSON ธรรมดา, phases คือ { id?, label?, description?, start, end, color?, avatarUrl? }[] ต่อแถว |
| `startDate / endDate` | `Date \| string` |  | ช่วงวันที่ที่มองเห็นได้บนตาราง (บังคับกำหนดทั้งคู่) |
| `[(viewMode)]` | `'day' \| 'week' \| 'month'` | `'day'` | ความละเอียดของคอลัมน์เวลา — สลับได้เองจากปุ่มในตัว (sic-popover) หรือควบคุมจากภายนอกด้วย [(viewMode)] |
| `viewModeOptions` | `('day' \| 'week' \| 'month')[]` | `['day', 'week', 'month']` | ตัวเลือกที่แสดงใน popover สลับมุมมอง (กำหนดลำดับ/ตัดตัวเลือกที่ไม่ต้องการออกได้) |
| `showViewModeToggle` | `boolean` | `true` | แสดง/ซ่อนแถบสลับมุมมอง (View: ...) เหนือตาราง |
| `era` | `'BE' \| 'CE'` | `SIC_CONFIG.era ?? 'CE'` | ปีที่แสดงบนหัวตาราง (กลุ่มเดือน/ปี) — BE = พ.ศ., CE = ค.ศ. |
| `locale` | `string` | `SIC_CONFIG.locale ?? 'en'` | dayjs locale สำหรับชื่อวัน/เดือน — ต้อง import 'dayjs/locale/<code>' เองก่อนใช้ locale อื่นนอกจาก 'en' (เช่น 'th' เพื่อให้ day of week เป็นภาษาไทย) |
| `showLabelColumn` | `boolean` | `true` | เปิด/ปิดคอลัมน์ชื่อรายการทางซ้าย — พับได้เองผ่านปุ่ม ‹/› ในตัว หรือควบคุมจากภายนอกด้วย [(showLabelColumn)] |
| `maxHeight` | `string \| null` | `'28rem'` | จำกัดความสูงของพื้นที่แถว แล้วเลื่อนดูได้ (label column กับ timeline เลื่อนพร้อมกันเสมอ) — ใส่ null เพื่อไม่จำกัดความสูงเหมือนเดิม |
| `#labelTemplate` | `content slot` |  | ปรับแต่ง UI คอลัมน์ชื่อรายการเอง รับ let-row, let-index — ไม่ใส่จะ fallback เป็น avatar+ชื่อ+progress |
| `#phaseTemplate` | `content slot` |  | ปรับแต่ง UI ของแต่ละ phase bar เอง รับ let-phase, let-row="row", let-index="index" — ไม่ใส่จะ fallback เป็น avatar+label+description |

**Events**

| Name | Payload | Description |
|---|---|---|
| `viewModeChange` | `'day' \| 'week' \| 'month'` | เกิดเมื่อเลือกมุมมองใหม่จาก popover ในตัว |
| `showLabelColumnChange` | `boolean` | เกิดเมื่อกดปุ่ม ‹/› พับ/กางคอลัมน์ชื่อรายการ |
| `rowClick` | `SicCalendarTimelineRow` | คลิกที่แถวในคอลัมน์ชื่อรายการ |
| `phaseClick` | `{ row: SicCalendarTimelineRow; phase: SicCalendarTimelinePhase }` | คลิกที่ bar ของ phase ใดก็ตาม |

---

## Code — `sic-code`

_Category: Data Display_

แสดง code block พร้อม syntax highlighting ในตัว (ไม่พึ่ง library ภายนอก) รองรับ typescript/javascript/html/css/json/bash — สีโทนใกล้เคียงกับธีม Prettier/VSCode ทั่วไป ทั้งโหมดสว่างและมืด แสดง/ซ่อนเลขบรรทัดได้ผ่าน [showLineNumbers] และมีปุ่ม copy ในตัว (คัดลอกโค้ดดิบ ไม่ใช่ HTML ที่ไฮไลต์)

**template.html**

```html
<sic-code
  language="typescript"
  [showLineNumbers]="true"
  [code]="snippet"
/>

<!-- ปิดเลขบรรทัด / ปิดปุ่ม copy ได้อิสระ -->
<sic-code language="bash" [showLineNumbers]="false" [code]="installCmd" />
```

**component.ts**

```typescript
snippet = [
  'function greet(name: string): string {',
  '  // returns a friendly greeting',
  "  return 'Hello, ' + name + '!';",
  '}',
].join('\n');

installCmd = 'npm install sic-ng';
```

**Attributes**

| Name | Type | Default | Description |
|---|---|---|---|
| `code` | `string` | `''` | source code ที่จะแสดง (ข้อความดิบ ไม่ใช่ HTML) |
| `language` | `'typescript' \| 'javascript' \| 'html' \| 'css' \| 'json' \| 'bash' \| 'plaintext'` | `'plaintext'` | กำหนดกฎ syntax highlighting — plaintext = ไม่ไฮไลต์เลย (แสดง badge ภาษาที่ toolbar เฉพาะเมื่อไม่ใช่ plaintext) |
| `showLineNumbers` | `boolean` | `true` | แสดง/ซ่อนเลขบรรทัดทางซ้าย |
| `showCopyButton` | `boolean` | `true` | แสดง/ซ่อนปุ่ม copy ที่มุมขวาบนของ toolbar |

**Events**

_None._

---

## Image — `sic-image`

_Category: Media_

แสดงรูปภาพพร้อม fallback, กำหนดขนาด, และเลือกโหมดโหลดแบบ sync/async ได้

**template.html**

```html
<sic-image
  src="https://picsum.photos/id/237/400/300"
  alt="Sample"
  fallback="https://picsum.photos/200"
  rounded="md"
  [width]="320"
  [height]="240"
  mode="async"
  asyncStrategy="progressive"
/>
```

**Attributes**

| Name | Type | Default | Description |
|---|---|---|---|
| `src` | `string` |  | URL รูปภาพหลัก |
| `alt` | `string` |  | ข้อความอธิบายรูปภาพ |
| `fallback` | `string` |  | URL สำรองเมื่อโหลดรูปหลักไม่ได้ |
| `rounded` | `'none' \| 'sm' \| 'md' \| 'lg' \| 'full'` | `none` | ระดับความโค้งของรูป |
| `width` | `number \| string` |  | กำหนดความกว้าง (ตัวเลข = px) |
| `height` | `number \| string` |  | กำหนดความสูง (ตัวเลข = px) |
| `mode` | `'sync' \| 'async'` | `sync` | 'sync' แสดงรูปทันที, 'async' รอโหลดรูปเต็มก่อนค่อยแสดง |
| `asyncStrategy` | `'progressive' \| 'skeleton'` | `skeleton` | ใช้กับ mode="async" เท่านั้น: 'progressive' แสดงรูปหยาบขนาดเล็กก่อนแล้วค่อยสลับเป็นรูปเต็ม, 'skeleton' แสดง placeholder จนกว่าจะโหลดรูปเต็มเสร็จ |
| `lowResSrc` | `string` |  | URL รูปหยาบสำหรับ asyncStrategy="progressive" (ถ้าไม่ระบุจะสร้างจาก src + lowResWidth) |
| `lowResWidth` | `number` | `24` | ความกว้างที่ขอสำหรับรูปหยาบอัตโนมัติ |
| `appendSizeToUrl` | `boolean` | `true` | แนบ width/height เป็น query param บน URL รูป (สำหรับ CDN ที่ resize ตาม query) |
| `widthParam` | `string` | `'w'` | ชื่อ query param สำหรับความกว้าง |
| `heightParam` | `string` | `'h'` | ชื่อ query param สำหรับความสูง |

**Events**

_None._

---

## Image Slider — `sic-image-slider`

_Category: Media_

สไลด์รูปภาพแบบวน — มีปุ่มลูกศรเลื่อนซ้าย/ขวา ([showArrows], ซ่อนได้) จุดไข่ปลาด้านล่างบอกจำนวน/ตำแหน่งปัจจุบัน ([showDots]) เลื่อนอัตโนมัติได้พร้อมกำหนดเวลาเอง ([autoSlide]/[autoSlideInterval], หยุดชั่วคราวเมื่อ hover) เลื่อนเกินภาพสุดท้ายจะวนกลับมาภาพแรกเสมอ (ปิดได้ด้วย [loop]) และเพิ่ม HTML ทับบนรูปแต่ละใบเองได้ผ่าน #slideTemplate

**template.html**

```html
<sic-image-slider
  [items]="slides"
  [autoSlide]="true"
  [autoSlideInterval]="4000"
  (slideChange)="onSlideChange($event)"
  (slideEnd)="onSlideEnd()"
>
  <ng-template #slideTemplate let-item let-index="index">
    <div class="my-slide-overlay">
      <span>{{ index + 1 }}. {{ item.caption }}</span>
    </div>
  </ng-template>
</sic-image-slider>

<!-- ไม่ใส่ #slideTemplate ก็ใช้ caption เริ่มต้นได้เลย -->
<sic-image-slider [items]="slides" [showArrows]="false" />
```

**component.ts**

```typescript
import { SicImageSliderItem } from 'sic-ng';

slides: SicImageSliderItem[] = [
  { id: 1, imageUrl: 'https://picsum.photos/seed/slide1/800/450', caption: 'Coastal path' },
  { id: 2, imageUrl: 'https://picsum.photos/seed/slide2/800/450', caption: 'Desert wind' },
  { id: 3, imageUrl: 'https://picsum.photos/seed/slide3/800/450', caption: 'Mountain rest' },
];

onSlideChange(event: { index: number; item: SicImageSliderItem }): void {
}

onSlideEnd(): void {
  this.toasts.show('Reached the last slide', 'info');
}
```

**Attributes**

| Name | Type | Default | Description |
|---|---|---|---|
| `items` | `SicImageSliderItem[]` | `[]` | { id?, imageUrl, alt?, caption?, data? } — array JSON ธรรมดา |
| `[(activeIndex)]` | `number` | `0` | index ของสไลด์ที่แสดงอยู่ |
| `showArrows` | `boolean` | `true` | แสดง/ซ่อนปุ่มลูกศรเลื่อนซ้าย/ขวา |
| `showDots` | `boolean` | `true` | แสดง/ซ่อนจุดไข่ปลาบอกตำแหน่งด้านล่าง |
| `loop` | `boolean` | `true` | เลื่อนเกินภาพสุดท้าย/แรกแล้ววนกลับ — ปิดเพื่อให้หยุดที่ปลายสุดแทน |
| `autoSlide` | `boolean` | `false` | เลื่อนสไลด์อัตโนมัติ (หยุดชั่วคราวเมื่อ hover ถ้า pauseOnHover เป็น true) |
| `autoSlideInterval` | `number` | `4000` | ระยะเวลา (ms) ระหว่างการเลื่อนอัตโนมัติแต่ละครั้ง |
| `pauseOnHover` | `boolean` | `true` | หยุด auto-slide ชั่วคราวขณะ cursor อยู่เหนือสไลด์ |
| `#slideTemplate` | `content slot` |  | เพิ่ม HTML ทับบนรูปของแต่ละสไลด์เอง รับ let-item, let-index="index" — ไม่ใส่จะ fallback เป็น caption ธรรมดา (ถ้ามี item.caption) |

**Events**

| Name | Payload | Description |
|---|---|---|
| `activeIndexChange` | `number` | เกิดทุกครั้งที่สไลด์เปลี่ยน (ลูกศร, จุดไข่ปลา, หรือ auto-slide) |
| `slideChange` | `{ index: number; item: SicImageSliderItem }` | เกิดพร้อม activeIndexChange แต่แนบข้อมูล item มาด้วย |
| `slideEnd` | `void` | เกิดเมื่อเลื่อนไปถึงภาพสุดท้าย |

---

## Video Player — `sic-video-player`

_Category: Media_

เล่นวิดีโอจาก URL ความกว้างเต็มพื้นที่เสมอ (width 100%) ส่วนความสูงปรับตามอัตราส่วนที่กำหนดผ่าน [aspectRatio]

**template.html**

```html
<sic-video-player
  src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4"
  [muted]="true"
  aspectRatio="4 / 3"
/>
```

**Attributes**

| Name | Type | Default | Description |
|---|---|---|---|
| `src` | `string` |  | URL วิดีโอ |
| `poster` | `string` |  | ภาพปกก่อนเล่น |
| `autoplay` | `boolean` | `false` | เล่นอัตโนมัติเมื่อโหลดเสร็จ |
| `loop` | `boolean` | `false` | เล่นวนซ้ำ |
| `muted` | `boolean` | `false` | ปิดเสียงเริ่มต้น |
| `aspectRatio` | `string` | `'16 / 9'` | สัดส่วนกว้าง/สูงของกล่องวิดีโอ (ค่า CSS aspect-ratio เช่น '4 / 3', '1 / 1') — width เต็มพื้นที่เสมอ ความสูงคำนวณจากอัตราส่วนนี้ |

**Events**

_None._

---

## Sound Player — `sic-sound-player`

_Category: Media_

การ์ดเล่นเพลงสไตล์อัลบั้มขนาดกะทัดรัด — ครอบ `<audio>` จริงไว้ข้างใน มีรูปปก/ไอคอนสำรอง, ป้าย genre และจำนวนการเล่น (plays) ใต้ปกอัลบั้ม, waveform คลิกเพื่อ seek ได้และไล่สีตาม progress อัตโนมัติ, ปุ่มควบคุมเล่น/หยุด/ก่อนหน้า/ถัดไป

**template.html**

```html
<sic-sound-player
  src="https://example.com/my-delorean.mp3"
  title="My Delorean"
  subtitle="A Synthwave Mix"
  coverUrl="https://picsum.photos/seed/delorean/200"
  genre="Synthwave"
  plays="1.2M plays"
  (previousTrack)="onPreviousTrack()"
  (nextTrack)="onNextTrack()"
/>
```

**component.ts**

```typescript
onPreviousTrack(): void {
}

onNextTrack(): void {
}
```

**Attributes**

| Name | Type | Default | Description |
|---|---|---|---|
| `src` | `string` |  | URL ไฟล์เสียง (จำเป็น) |
| `title` | `string` |  | ชื่อเพลง |
| `subtitle` | `string` |  | คำอธิบายรอง เช่น ชื่ออัลบั้ม/ศิลปิน |
| `coverUrl` | `string` |  | URL รูปปก — ไม่ใส่จะ fallback เป็นวงกลมไล่สีพร้อมไอคอนโน้ตดนตรี |
| `genre` | `string` |  | ป้ายประเภทเพลงใต้รูปปก |
| `plays` | `string` |  | ข้อความจำนวนการเล่นที่ format มาแล้ว เช่น "1.2M plays" |
| `autoplay` | `boolean` | `false` | เล่นอัตโนมัติเมื่อโหลดเสร็จ |
| `loop` | `boolean` | `false` | เล่นวนซ้ำ |
| `muted` | `boolean` | `false` | ปิดเสียงเริ่มต้น |
| `barsCount` | `number` | `48` | จำนวนแท่งใน waveform |

**Events**

| Name | Payload | Description |
|---|---|---|
| `play` | `void` | เล่นเพลง |
| `pause` | `void` | หยุดเพลงชั่วคราว |
| `ended` | `void` | เล่นจบเพลง |
| `timeUpdate` | `{ currentTime: number; duration: number }` | เกิดระหว่างเล่นเพลงต่อเนื่อง |
| `previousTrack` | `void` | กดปุ่มเพลงก่อนหน้า |
| `nextTrack` | `void` | กดปุ่มเพลงถัดไป |

---

## Space Background — `sic-space-bg`

_Category: Media_

เลเยอร์พื้นหลังตกแต่งแบบ CSS ล้วน เต็มพื้นที่ container เสมอ (width/height 100%) มี 4 แบบ: hexagon/geometric (ทรงเรขาลอยตัว), gradient (ไล่สีเคลื่อนไหว), sparkle (จุดกระพริบ) — กำหนดสี ([colors]), จำนวนทรง ([density]), ความเร็ว ([animationSpeed]) และ seed ของการสุ่มตำแหน่งได้ (เดิมสุ่มแต่ตำแหน่งจะคงที่ทุกครั้งที่ render ถ้า seed เท่าเดิม) — ถ้าไม่ใส่ [colors] จะ fallback เป็นชุดสีเริ่มต้นที่ปรับตาม dark/light mode อัตโนมัติผ่าน [colorMode] (ค่าเริ่มต้น "auto" ตาม SicThemeService.isDark())

**template.html**

```html
<div style="position: relative; height: 220px; border-radius: 0.75rem; overflow: hidden;">
  <sic-space-bg
    variant="hexagon"
    [colors]="['#6366f1', '#8b5cf6', '#06b6d4']"
    [density]="20"
    backgroundColor="#0f172a"
  />
</div>
```

**Attributes**

| Name | Type | Default | Description |
|---|---|---|---|
| `variant` | `'hexagon' \| 'geometric' \| 'gradient' \| 'sparkle'` | `'gradient'` | รูปแบบลวดลายที่แสดง |
| `colors` | `string[]` | `[]` | ชุดสีที่ใช้ (จุดไล่สี/สีทรง/สีจุดกระพริบ) — ว่างจะ fallback เป็นชุดสีเริ่มต้นของแต่ละ variant ตาม [colorMode] |
| `colorMode` | `'auto' \| 'light' \| 'dark'` | `'auto'` | "auto" เลือกชุดสีเริ่มต้น (เมื่อ [colors] ว่าง) ตาม SicThemeService.isDark() อัตโนมัติ — ระบุ "light"/"dark" เพื่อบังคับชุดสีใดชุดสีหนึ่งไม่ให้ตามธีมของแอป |
| `backgroundColor` | `string` | `'transparent'` | สีพื้นหลังด้านหลังลวดลาย |
| `animated` | `boolean` | `true` | เล่นแอนิเมชันลอย/กระพริบ/ไล่สี |
| `animationSpeed` | `number` | `20` | ความเร็วแอนิเมชัน หน่วยวินาที — ยิ่งน้อยยิ่งเร็ว |
| `density` | `number` | `24` | จำนวนทรง/จุดที่กระจาย (ไม่มีผลกับ variant "gradient") |
| `size` | `string` | `'2rem'` | ขนาดฐานของแต่ละทรง (CSS length) แต่ละทรงจะสุ่มคูณขนาดเอง |
| `opacity` | `number` | `0.5` | ความโปร่งใสของเลเยอร์ลวดลาย (0-1) |
| `blur` | `string` | `'0px'` | ค่า blur ของเลเยอร์ลวดลาย (CSS length) สำหรับเอฟเฟกต์เรืองแสง |
| `gradientAngle` | `number` | `135` | มุม (องศา) ของ linear-gradient — ใช้กับ variant "gradient" เท่านั้น |
| `seed` | `number` | `1` | seed ของการสุ่มตำแหน่งทรง — seed เดิมจะได้ตำแหน่งเดิมทุกครั้ง ไม่สลับสุ่มใหม่ทุกครั้งที่ change detection ทำงาน |

**Events**

_None._

---

## Masonry — `sic-masonry`

_Category: Data Display_

จัดเรียงการ์ดแบบ Pinterest: แต่ละการ์ด (ตามลำดับเดิมใน items ไล่ซ้ายไปขวา) จะถูกส่งไปคอลัมน์ที่ "เตี้ยที่สุด ณ ตอนนั้น" เสมอ (วัดจากความสูงจริงที่ render แล้ว) ทำให้คอลัมน์ balance กันโดยอัตโนมัติแทนที่จะปล่อยให้คอลัมน์ใดคอลัมน์หนึ่งยาวเกิน — ก่อนที่จะวัดความสูงจริงได้ (เฟรมแรก) จะเรียงแบบ round-robin ซ้ายไปขวาไปพลางก่อน กำหนดจำนวนคอลัมน์แบบ responsive ได้, ปรับแต่ง card แต่ละใบเองผ่าน #itemTemplate, รองรับ lazy load ต่อหน้าด้วย [isLazy] + (loadMore) (โหลดหน้าแรกอัตโนมัติ แล้วโหลดหน้าถัดไปเมื่อ scroll ใกล้ถึงท้ายรายการด้วย IntersectionObserver), และมี (itemClick) แจ้งเมื่อคลิกการ์ดใดการ์ดหนึ่ง

**template.html**

```html
<sic-masonry
  [items]="masonryPhotos"
  [cols]="3"
  [colsBreakpoints]="{ sm: 1, md: 2, lg: 3 }"
  gap="0.75rem"
  (itemClick)="onMasonryItemClick($event)"
>
  <ng-template #itemTemplate let-item let-index="index">
    <sic-card [style.height.px]="item.height">
      {{ index }}: {{ item.title }}
    </sic-card>
  </ng-template>
</sic-masonry>

<!-- โหมด lazy load -->
<sic-masonry [isLazy]="true" [pageSize]="12" (loadMore)="onMasonryLoadMore($event)">
  <ng-template #itemTemplate let-item>{{ item.title }}</ng-template>
</sic-masonry>
```

**component.ts**

```typescript
masonryPhotos = [
  { title: 'Photo 1', height: 120 },
  { title: 'Photo 2', height: 200 },
  // ...
];

onMasonryLoadMore(event: SicMasonryLoadEvent<Photo>): void {
  this.api.getPhotos(event.pageNo, event.pageSize).subscribe((page) => {
    event.items.update(page); // component เก็บ/ต่อ array เองภายใน
  });
}

onMasonryItemClick(photo: Photo): void {
  this.toasts.show(`เปิดรูป: ${photo.title}`, 'info');
}
```

**Attributes**

| Name | Type | Default | Description |
|---|---|---|---|
| `items` | `T[]` | `[]` | รายการทั้งหมด (โหมดไม่ lazy) |
| `cols` | `number` | `3` | จำนวนคอลัมน์ |
| `colsBreakpoints` | `{ sm?: number; md?: number; lg?: number }` |  | จำนวนคอลัมน์ตามขนาดจอ (≥768px = md, ≥1024px = lg) |
| `gap` | `string` | `var(--sic-space-4)` | ระยะห่างระหว่างคอลัมน์/การ์ด |
| `isLazy` | `boolean` | `false` | เปิดโหมดโหลดเพิ่มเป็นหน้า ๆ — ตอนเปิดจะเพิกเฉย items แล้วขอหน้าแรกผ่าน (loadMore) อัตโนมัติ |
| `pageSize` | `number` |  | ขนาดหน้าเมื่อ isLazy — ค่าเริ่มต้นจาก SicConfig.pageSize |
| `trackBy` | `(index: number, item: T) => unknown` |  | ฟังก์ชัน track เอง ค่าเริ่มต้น track ด้วยตัว item เอง |
| `#itemTemplate` | `content slot` |  | ปรับแต่ง UI ของแต่ละการ์ดเอง รับ let-item, let-index |

**Events**

| Name | Payload | Description |
|---|---|---|
| `loadMore` | `SicMasonryLoadEvent<T>` | เกิดเมื่อ isLazy=true และ scroll ใกล้ท้ายรายการ (รวมครั้งแรกตอนเปิด) — เรียก event.items.update(items) ด้วยหน้าที่โหลดมา |
| `itemClick` | `T` | เกิดเมื่อคลิกการ์ดใดการ์ดหนึ่ง ส่ง item นั้นออกมา |

---

## Drag & Drop — `sic-drag-drop`

_Category: Data Display_

ลาก-วางเพื่อจัดลำดับใหม่ในลิสต์เดียว หรือย้ายการ์ดข้ามลิสต์แบบ kanban (ต่อยอดจาก @angular/cdk/drag-drop) ส่ง [items] สำหรับลิสต์เดียว หรือ [lists] หลายลิสต์เพื่อย้ายข้ามคอลัมน์ได้ ปรับแต่งการ์ดและหัวคอลัมน์เองได้ผ่าน #itemTemplate / #columnHeaderTemplate

**template.html**

```html
<sic-drag-drop [lists]="kanbanLists" [showDragHandle]="true" (itemMoved)="onCardMoved($event)">
  <ng-template #columnHeaderTemplate let-list>
    <h3>{{ list.title }} ({{ list.items.length }})</h3>
  </ng-template>
  <ng-template #itemTemplate let-item let-listId="listId">
    <sic-card>{{ item.title }}</sic-card>
  </ng-template>
</sic-drag-drop>
```

**component.ts**

```typescript
kanbanLists: SicDragDropList<Task>[] = [
  { id: 'todo', title: 'Todo', items: [{ id: 1, title: 'เขียน spec' }] },
  { id: 'doing', title: 'Doing', items: [{ id: 2, title: 'ทำ component' }] },
  { id: 'done', title: 'Done', items: [] },
];

onCardMoved(event: SicDragDropMoveEvent<Task>): void {
  // event.item, previousListId/currentListId, previousIndex/currentIndex
  // component แก้ไข array ใน lists ให้อัตโนมัติแล้ว ใช้ event นี้แค่ sync ไป backend
}
```

**Attributes**

| Name | Type | Default | Description |
|---|---|---|---|
| `items` | `T[]` | `[]` | (ทางเลือกแบบเดิม) ลิสต์เดียวแบบไม่มีชื่อ ใช้แทน lists ได้เมื่อจัดลำดับในลิสต์เดียว |
| `lists` | `SicDragDropList<T>[]` |  | หลายลิสต์/คอลัมน์ แต่ละอันมี id (ต้อง unique ทั้งหน้า), title, items — ลากข้ามลิสต์ได้ทั้งหมด |
| `showDragHandle` | `boolean` | `false` | true = ลากได้เฉพาะจากปุ่ม ⠿ เท่านั้น, false = ลากจากตรงไหนของการ์ดก็ได้ |
| `trackBy` | `(index: number, item: T) => unknown` |  | ฟังก์ชัน track เอง ค่าเริ่มต้น track ด้วยตัว item เอง |
| `#itemTemplate` | `content slot` |  | ปรับแต่ง UI การ์ดเอง รับ let-item, let-index, let-listId |
| `#columnHeaderTemplate` | `content slot` |  | ปรับแต่งหัวคอลัมน์เอง รับ let-list (SicDragDropList<T>) |

**Events**

| Name | Payload | Description |
|---|---|---|
| `itemMoved` | `SicDragDropMoveEvent<T>` | เกิดหลังลาก-วางเสร็จ (ทั้งจัดลำดับในลิสต์เดิม หรือย้ายข้ามลิสต์) — array ใน lists/items ถูกแก้ไขให้แล้วโดยอัตโนมัติ |

---

## Badge — `sic-badge`

_Category: Data Display_

แสดงจำนวนแจ้งเตือนบน content กำหนดตำแหน่งมุมที่แสดงได้

**template.html**

```html
<sic-badge [count]="5" [max]="99" color="primary">
  <sic-button variant="ghost">Inbox</sic-button>
</sic-badge>

<!-- กำหนดมุมที่แสดง badge -->
<sic-badge [dot]="true" color="danger" position="bottom-left">
  <sic-button variant="ghost">Profile</sic-button>
</sic-badge>
```

**Attributes**

| Name | Type | Default | Description |
|---|---|---|---|
| `count` | `number` |  | จำนวนที่ต้องการแสดง |
| `max` | `number` | `99` | จำนวนสูงสุดก่อนแสดงเป็น 99+ |
| `dot` | `boolean` | `false` | แสดงเป็นจุดกลมแทนตัวเลข |
| `color` | `string` | `primary` | สีของ badge |
| `position` | `'top-right' \| 'top-left' \| 'bottom-right' \| 'bottom-left'` | `top-right` | มุมที่แสดง badge เทียบกับ content ข้างใน |

**Events**

_None._

---

## Tag — `sic-tag`

_Category: Data Display_

ป้าย label สั้น ๆ และปิดได้ ส่ง [items] เป็น array ของ { text, color } เพื่อแสดงหลายป้ายในกล่องเดียวได้

**template.html**

```html
<sic-tag color="primary" [closable]="true" (closed)="onTagClosed()">
  Beta
</sic-tag>

<!-- แสดงหลายป้ายพร้อมกัน ส่ง [{ text, color }] -->
<sic-tag [items]="skillTags" [closable]="true" (itemClosed)="onSkillTagClosed($event)" />
```

**component.ts**

```typescript
onTagClosed(): void {
  this.toasts.show('Tag closed', 'info');
}

skillTags: SicTagItem[] = [
  { text: 'Angular', color: 'danger' },
  { text: 'TypeScript', color: 'primary' },
  { text: 'RxJS', color: 'warning' },
];

onSkillTagClosed(event: { item: SicTagItem; index: number }): void {
  this.skillTags = this.skillTags.filter((_, i) => i !== event.index);
}
```

**Attributes**

| Name | Type | Default | Description |
|---|---|---|---|
| `color` | `string` | `primary` | สีของ tag (โหมดป้ายเดียว) |
| `closable` | `boolean` | `false` | แสดงปุ่มปิด tag ค่าเริ่มต้นของทุกป้าย ถ้าใช้ [items] (แต่ละ item.closable override ได้) |
| `items` | `SicTagItem[]  // { text: string; color?: SicTagColor; closable?: boolean }` |  | ถ้ากำหนด จะ render เป็นหลายป้ายแทน content ที่ project เข้ามา หนึ่งป้ายต่อ item |

**Events**

| Name | Payload | Description |
|---|---|---|
| `closed` | `void` | เกิดเมื่อผู้ใช้กดปิด tag (โหมดป้ายเดียว) |
| `itemClosed` | `{ item: SicTagItem; index: number }` | เกิดเมื่อผู้ใช้กดปิดป้ายใดป้ายหนึ่งใน [items] |

---

## Avatar — `sic-avatar`

_Category: Data Display_

แสดงรูปหรือชื่อย่อผู้ใช้ กดได้ (avatarClick) และรองรับแสดงเป็นกลุ่มซ้อนกันซ้ายไปขวาผ่าน [items] — เมาส์ชี้รูปไหนในกลุ่ม รูปนั้นจะลอยขึ้นมาแสดงเต็มด้านหน้า

**template.html**

```html
<sic-avatar name="Ada Lovelace" size="md" (avatarClick)="onAvatarClick()" />

<!-- แสดงเป็นกลุ่มซ้อนกัน ส่ง [{ name, src }] -->
<sic-avatar [items]="teamAvatars" (itemClick)="onTeamAvatarClick($event)" />
```

**component.ts**

```typescript
onAvatarClick(): void {
  this.toasts.show('Avatar clicked', 'info');
}

teamAvatars: SicAvatarItem[] = [
  { name: 'Ada Lovelace' },
  { name: 'Grace Hopper' },
  { name: 'Alan Turing' },
];

onTeamAvatarClick(event: { item: SicAvatarItem; index: number }): void {
  this.toasts.show(`Clicked ${event.item.name}`, 'info');
}
```

**Attributes**

| Name | Type | Default | Description |
|---|---|---|---|
| `name` | `string` |  | ชื่อที่ใช้สร้าง initials (โหมด avatar เดียว) |
| `size` | `'sm' \| 'md' \| 'lg'` | `md` | ขนาด avatar |
| `src` | `string` |  | URL รูป avatar ถ้ามี (โหมด avatar เดียว) |
| `items` | `SicAvatarItem[]  // { src?: string; name?: string }` |  | ถ้ากำหนด จะแสดงเป็นกลุ่ม avatar ซ้อนกันจากซ้ายไปขวาแทนโหมด avatar เดียว |

**Events**

| Name | Payload | Description |
|---|---|---|
| `avatarClick` | `MouseEvent` | เกิดเมื่อคลิก avatar (โหมด avatar เดียว) |
| `itemClick` | `{ item: SicAvatarItem; index: number }` | เกิดเมื่อคลิก avatar ตัวใดตัวหนึ่งใน [items] |

---

## Accordion & Collapse — `sic-accordion / sic-collapse`

_Category: Data Display_

ซ่อน/แสดงเนื้อหาเป็น section

**template.html**

```html
<sic-accordion [multi]="false">
  <sic-collapse label="Section A">Content A</sic-collapse>
  <sic-collapse label="Section B">Content B</sic-collapse>
</sic-accordion>
```

**Attributes**

| Name | Type | Default | Description |
|---|---|---|---|
| `multi` | `boolean` | `false` | เปิดหลาย section พร้อมกันได้หรือไม่ |
| `label` | `string` |  | หัวข้อของ sic-collapse |

**Events**

_None._

---
