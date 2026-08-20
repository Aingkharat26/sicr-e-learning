# Navigation

เมนูและการนำทาง

## Navbar — `sic-navbar`

_Category: Navigation_

แถบเมนูบน — header มี UI เริ่มต้นแบบง่ายให้ (โลโก้+ชื่อ จาก logo/brand input) แต่ left (hamburger) และ right (theme toggle+แจ้งเตือน+เมนูโปรไฟล์) ไม่มี UI สำเร็จรูปแล้ว ต้องประกอบเองทั้งหมดผ่าน content-template slots (sicNavbarHeader/sicNavbarLeft/sicNavbarRight) โดย component ยังมี state/method ให้ครบ (darkMode, notifications, user, menuItems, toggleSidebar(), toggleDarkMode(), toggleNotifications(), toggleUserMenu() ฯลฯ) รับ context เป็น instance ของ navbar เอง (let-navbar) เข้าถึงทุกอย่างได้จาก template ของคุณเอง — ไม่มีช่องค้นหาในตัว ถ้าต้องการค้นหาแบบ popover ให้ใช้ sic-search แทน

**template.html**

```html
<sic-navbar
  [sticky]="false"
  [showSidebarToggle]="true"
  [(collapsed)]="navbarCollapsed"
  [darkMode]="navbarDarkMode"
  [notifications]="navbarNotifications"
  [user]="navbarUser"
  [menuItems]="navbarMenuItems"
  (darkModeChange)="navbarDarkMode = $event"
  (notificationClick)="handleNavbarNotification($event)"
  (viewAllNotifications)="handleNavbarViewAll()"
  (menuItemClick)="handleNavbarMenuItem($event)"
>
  <!-- ไม่ใส่ sicNavbarHeader ก็ยังได้ header เริ่มต้นแบบง่าย ถ้ามี logo/brand input -->
  <ng-template sicNavbarHeader let-navbar>
    <div class="my-navbar-brand">🐙 sic-ng</div>
  </ng-template>

  <!-- ไม่มี UI hamburger ให้แล้ว ประกอบเองจาก showSidebarToggle/collapsed -->
  <ng-template sicNavbarLeft let-navbar>
    <div class="my-navbar-left">
      @if (navbar.showSidebarToggle) {
        <button type="button" (click)="navbar.toggleSidebar()">☰</button>
      }
    </div>
  </ng-template>

  <!-- ไม่มี UI theme toggle/แจ้งเตือน/user menu ให้แล้ว ประกอบเองจาก darkMode/notifications/user -->
  <ng-template sicNavbarRight let-navbar>
    <div class="my-navbar-right">
      <button type="button" (click)="navbar.toggleDarkMode()">{{ navbar.darkMode ? '🌙' : '☀️' }}</button>
      <button type="button" (click)="navbar.toggleNotifications($event)">
        🔔
        @if (navbar.hasUnread) { <span class="dot"></span> }
      </button>
      @if (navbar.notificationsOpen) {
        <div class="my-navbar-panel">
          @for (n of navbar.notifications; track n.id) {
            <button type="button" (click)="navbar.selectNotification(n)">{{ n.message }}</button>
          } @empty {
            <span>{{ navbar.noNotificationsText }}</span>
          }
        </div>
      }
      @if (navbar.user) {
        <button type="button" (click)="navbar.toggleUserMenu($event)">{{ navbar.user.name }}</button>
      }
    </div>
  </ng-template>
</sic-navbar>
```

**component.ts**

```typescript
navbarCollapsed = false;
navbarDarkMode = false;
navbarUser: SicNavbarUser = { name: 'Musharof', email: 'randomuser@pimjo.com' };
navbarMenuItems: SicNavbarMenuItem[] = [
  { label: 'Edit profile', icon: '👤', action: 'edit-profile' },
  { label: 'Account Settings', icon: '⚙️', action: 'account-settings' },
  { label: 'Support', icon: '💬', action: 'support' },
  { label: 'Sign out', icon: '↩️', action: 'sign-out' },
];
// actor + message + target ประกอบเป็นข้อความเดียว: "Terry Franci requests permission to change Project - Nganter App"
navbarNotifications: SicNavbarNotification[] = [
  {
    id: 1,
    actor: 'Terry Franci',
    message: 'requests permission to change',
    target: 'Project - Nganter App',
    category: 'Project',
    time: '5 min ago',
    status: 'online', // เขียว/แดง/เหลือง/เทา ที่มุมล่างของ avatar
    read: false,
  },
];

handleNavbarMenuItem(item: SicNavbarMenuItem): void {
  this.toasts.show(`เลือกเมนู ${item.label}`, 'info');
}

handleNavbarNotification(notification: SicNavbarNotification): void {
  this.toasts.show(`เปิดแจ้งเตือน: ${notification.actor ?? notification.message}`, 'info');
}

handleNavbarViewAll(): void {
  this.toasts.show('ดูการแจ้งเตือนทั้งหมด', 'info');
}
```

**Attributes**

| Name | Type | Default | Description |
|---|---|---|---|
| `sticky` | `boolean` | `false` | กำหนดให้ navbar ติดด้านบนขณะ scroll (position: sticky — ยังกินพื้นที่ใน document flow ตามปกติ) |
| `fixed` | `boolean` | `false` | ปักหมุด navbar ไว้บนสุดของหน้าจอเสมอด้วย position: fixed (ลอยทับเนื้อหา ไม่กินพื้นที่ document flow — อย่าลืมเผื่อ padding/margin-top ให้เนื้อหาถัดไปเอง) มีผลเหนือกว่า sticky ถ้าตั้งทั้งคู่ |
| `logo / brand` | `string` |  | ใช้กับ header เริ่มต้นแบบง่าย (โลโก้+ชื่อ) เป็น UI สำเร็จรูปเดียวที่ยังมีให้ — ถ้าไม่ใส่และไม่ใช้ sicNavbarHeader จะไม่มีอะไรแสดงเลย |
| `collapsed` | `boolean` | `false` | ใช้ตัวแปรเดียวกับ sic-sidebar เพื่อผูก hamburger ที่คุณสร้างเองใน sicNavbarLeft เข้ากับสถานะย่อ/ขยายของ sidebar โดยตรง |
| `showSidebarToggle` | `boolean` | `false` | ไม่มี UI ในตัวอ่านค่านี้ — เป็น state เปล่าไว้ให้ sicNavbarLeft ของคุณเช็คเองว่าจะวาดปุ่ม hamburger หรือไม่ |
| `showThemeToggle / showNotifications` | `boolean` | `true` | เช่นเดียวกับ showSidebarToggle — ไม่มี UI ในตัวอ่านค่านี้แล้ว เป็น state ไว้ให้ template ของคุณเองเช็ค |
| `darkMode` | `boolean` | `false` | state ปุ่มสลับธีม (☀️/🌙) — ไม่มี UI ในตัวแล้ว ต้องประกอบเองผ่าน sicNavbarRight แล้วผูกกับ darkMode/toggleDarkMode() — component ไม่ผูกกับธีมจริง ต้องรับ event ไปตั้งค่าเอง |
| `notifications` | `SicNavbarNotification[]` |  | รายการแจ้งเตือน — ไม่มี UI dropdown ในตัวแล้ว ต้องประกอบเองผ่าน sicNavbarRight แล้วผูกกับ notifications/notificationsOpen/toggleNotifications()/selectNotification()/closeNotifications()/handleViewAllNotifications()/hasUnread/noNotificationsText/viewAllNotificationsText |
| `user` | `SicNavbarUser` |  | ชื่อ/อีเมล/รูป — ไม่มี UI ปุ่มมุมขวาในตัวแล้ว ต้องประกอบเองผ่าน sicNavbarRight |
| `menuItems` | `SicNavbarMenuItem[]` |  | รายการเมนู dropdown โปรไฟล์ — ไม่มี UI ในตัวแล้ว ต้องประกอบเองผ่าน sicNavbarRight แล้วผูกกับ menuItems/userMenuOpen/toggleUserMenu()/selectMenuItem() |
| `sicNavbarHeader / sicNavbarLeft / sicNavbarRight` | `<ng-template>` |  | บังคับต้องใส่ sicNavbarLeft/sicNavbarRight เองถ้าต้องการ hamburger/theme toggle/แจ้งเตือน/user menu เพราะไม่มี UI เริ่มต้นแล้ว (sicNavbarHeader ยังมีทางเลือกใช้ logo/brand input แทนได้) — รับ context { $implicit: navbar instance } เช่น <ng-template sicNavbarRight let-navbar> |

**Events**

| Name | Payload | Description |
|---|---|---|
| `collapsedChange` | `boolean` | เมื่อกด hamburger |
| `darkModeChange` | `boolean` | เมื่อกดปุ่มสลับธีม |
| `notificationClick` | `SicNavbarNotification` | เมื่อเลือกแจ้งเตือนใน dropdown (ปิด dropdown ให้อัตโนมัติ) |
| `viewAllNotifications` | `-` | เมื่อกดปุ่ม "View All Notifications" ท้าย panel (ปิด dropdown ให้อัตโนมัติ) |
| `menuItemClick` | `SicNavbarMenuItem` | เมื่อเลือกเมนูใน dropdown โปรไฟล์ (ปิด dropdown ให้อัตโนมัติ) |

---

## Breadcrumb — `sic-breadcrumb`

_Category: Navigation_

แสดงลำดับ path ปัจจุบัน เช่น Home / Library

**template.html**

```html
<sic-breadcrumb [items]="breadcrumbItems" separator="/" />
```

**component.ts**

```typescript
breadcrumbItems: SicBreadcrumbItem[] = [
  { label: 'Home', link: '/' },
  { label: 'Library' },
];
```

**Attributes**

| Name | Type | Default | Description |
|---|---|---|---|
| `items` | `SicBreadcrumbItem[]` |  | รายการ breadcrumb แต่ละตัว เช่น label และ link |
| `separator` | `string` | `/` | ตัวคั่นระหว่าง breadcrumb |

**Events**

_None._

---

## Sidebar — `sic-sidebar`

_Category: Navigation_

เมนูด้านข้าง รองรับสถานะย่อ/ขยาย, active link, และ badge แบบ dynamic — ตอนย่ออยู่ เอา cursor ไปวางจะกางออกมาเต็มชั่วคราวแล้วหุบกลับเองเมื่อเมาส์ออก (peek), เมนูรองรับการซ้อน submenu ได้ไม่จำกัดจำนวนชั้น (item.children ใส่ children ต่อกันไปเรื่อยๆ ได้) แต่ละชั้นพับ/กางเองได้อิสระ และเมื่อ activeLink ตรงกับเมนูที่ซ้อนอยู่ลึกแค่ไหนก็ตาม ทุกชั้นที่เป็นบรรพบุรุษของมันจะกางอัตโนมัติให้เห็นเมนูที่ active อยู่เสมอ, header/footer ล็อกตำแหน่งไว้ ส่วนเมนูตรงกลางมี scrollbar เองเมื่อยาวเกิน, บนจอมือถือตอนย่อจะซ่อนทั้งหมดเหลือแค่ปุ่มขยาย — header/menu มี UI เริ่มต้นให้ (โลโก้/รายการเมนู) ส่วน subheader (ช่องค้นหา) และ footer (โปรไฟล์ + ปุ่ม logout) ไม่มี UI สำเร็จรูปแล้ว ต้องประกอบเองผ่าน content-template slots ทั้งหมด (ใช้ state/method ที่ยังมีให้ เช่น search, user, handleSearchInput(), handleUserAction())

**template.html**

```html
<sic-sidebar
  [sections]="sidebarSections"
  [collapsed]="sidebarCollapsed"
  activeLink="/setting/general/language"
  logo="🐙"
  brand="Web Monster"
  [search]="sidebarSearch"
  [user]="sidebarUser"
  accentColor="#ef4444"
  (collapsedChange)="sidebarCollapsed = $event"
  (searchChange)="sidebarSearch = $event"
  (userAction)="handleSidebarUserAction($event)"
>
  <!-- ไม่มี UI ช่องค้นหาให้แล้ว ประกอบเองจาก search/searchChange -->
  <ng-template sicSidebarSubheader let-sidebar let-expanded="expanded">
    <div class="my-sidebar-search">
      🔍
      @if (expanded) {
        <input [value]="sidebar.search" (input)="sidebar.handleSearchInput($any($event.target).value)" placeholder="Search..." />
      }
    </div>
  </ng-template>

  <!-- ไม่มี UI user card / logout ให้แล้ว ประกอบเองจาก user/userAction -->
  <ng-template sicSidebarFooter let-sidebar let-expanded="expanded">
    @if (sidebar.user) {
      <div class="my-sidebar-footer">
        <span>{{ sidebar.user.name.charAt(0) }}</span>
        @if (expanded) { <span>{{ sidebar.user.name }}</span> }
        @if (expanded) {
          <button type="button" title="Logout" (click)="sidebar.handleUserAction()">
            <svg viewBox="0 0 24 24" width="17" height="17"><!-- logout icon --></svg>
          </button>
        }
      </div>
    }
  </ng-template>
</sic-sidebar>
```

**component.ts**

```typescript
sidebarSections: SicSidebarSection[] = [
  {
    title: 'Menu',
    items: [
      { label: 'Home', icon: '🏠', link: '/home' },
      { label: 'Task', icon: '📋', link: '/task', badge: 12 },
      { label: 'Notification', icon: '🔔', link: '/notification', badge: 14 },
      {
        // children ซ้อนกันได้ไม่จำกัดชั้น — แต่ละ item ก็มี children ของตัวเองได้อีก
        label: 'Setting',
        icon: '⚙️',
        children: [
          {
            label: 'General',
            children: [
              { label: 'Language', link: '/setting/general/language' },
              { label: 'Region', link: '/setting/general/region' },
            ],
          },
          {
            label: 'Security',
            children: [{ label: 'Two-Factor Auth', link: '/setting/security/2fa' }],
          },
          { label: 'Notifications', link: '/setting/notifications' },
        ],
      },
    ],
  },
  {
    title: 'Group',
    variant: 'list', // dot + chevron แทน icon + badge
    items: [
      { label: 'Figma Files', color: '#22c55e', link: '/group/figma' },
      { label: 'Downloads', color: '#3b82f6', link: '/group/downloads' },
    ],
  },
];
sidebarUser: SicSidebarUser = { name: 'Web Monster', email: 'web@monster.com' };
sidebarCollapsed = false;
sidebarSearch = '';

handleSidebarUserAction(user: SicSidebarUser): void {
  this.toasts.show(`ออกจากระบบ ${user.name}`, 'info');
}
```

**Attributes**

| Name | Type | Default | Description |
|---|---|---|---|
| `sections` | `SicSidebarSection[]` |  | กลุ่มเมนู แต่ละกลุ่มมี title และ variant (menu = icon+badge, list = dot สี+chevron) |
| `items` | `SicSidebarItem[]` |  | (ทางเลือกแบบเดิม) รายการเมนูแบบไม่มีกลุ่ม ใช้แทน sections ได้เมื่อไม่ต้องการแบ่งกลุ่ม |
| `items[].children` | `SicSidebarItem[]` |  | ซ้อน submenu ในแต่ละ item ได้ — children ของ children ได้เรื่อยๆ ไม่จำกัดจำนวนชั้น แต่ละชั้นพับ/กางเป็นอิสระจากกัน |
| `collapsed` | `boolean` | `false` | กำหนดสถานะย่อ/ขยาย sidebar |
| `showToggle` | `boolean` | `true` | ซ่อนปุ่มพับ/กางในตัวได้ (เช่น เมื่อจะใช้ hamburger ของ sic-navbar ควบคุม collapsed แทน — ดูตัวอย่าง "Navbar + Sidebar + Breadcrumb" ด้านล่าง) |
| `collapseMode` | `'rail' \| 'hidden'` | `'rail'` | 'rail': ตอนพับเหลือแถบไอคอนแคบๆ (ค่าเริ่มต้น). 'hidden': ตอนพับหายไปทั้งหมด (กว้าง 0) ไม่ต้องแสดงแบบย่อเลย เหมือนพฤติกรรมบนมือถือแต่ใช้ได้ทุกขนาดจอ |
| `activeLink` | `string` |  | link ปัจจุบันที่ต้องการ highlight — ถ้าอยู่ในเมนูที่ซ้อนอยู่ลึกกี่ชั้นก็ตาม ทุกชั้นที่เป็นบรรพบุรุษจะกางอัตโนมัติให้เห็นเมนู active นั้น |
| `logo / brand` | `string` |  | โลโก้ (emoji/ตัวอักษร) และชื่อระบบที่ส่วนหัว (มี UI เริ่มต้นให้) |
| `search / searchPlaceholder` | `string` |  | state ช่องค้นหา — ไม่มี UI ในตัวแล้ว ต้องประกอบเองผ่าน sicSidebarSubheader แล้วผูกกับ search/handleSearchInput() |
| `darkMode` | `boolean` | `false` | state โหมดมืด — ไม่มี UI ในตัวแล้ว ต้องประกอบเองผ่าน sicSidebarFooter แล้วผูกกับ darkMode/setDarkMode() |
| `user` | `SicSidebarUser` |  | ข้อมูลผู้ใช้ (avatar, name, email) — ไม่มี UI การ์ดในตัวแล้ว ต้องประกอบเองผ่าน sicSidebarFooter แล้วผูกกับ user/handleUserAction() |
| `accentColor` | `string` |  | สีเน้นของ active bar และ badge ปรับได้ต่อ instance (ค่าเริ่มต้นคือ --sic-color-danger) |
| `sicSidebarHeader / sicSidebarMenu` | `<ng-template>` |  | ถ้าต้องการ แทนที่ header/เมนู ที่มี UI เริ่มต้นให้อยู่แล้ว |
| `sicSidebarSubheader / sicSidebarFooter` | `<ng-template>` |  | บังคับต้องใส่เองถ้าต้องการช่องค้นหา/theme toggle/user card เพราะไม่มี UI เริ่มต้นแล้ว — รับ context { collapsed, expanded, $implicit: sidebar instance } เช่น <ng-template sicSidebarFooter let-sidebar> |

**Events**

| Name | Payload | Description |
|---|---|---|
| `collapsedChange` | `boolean` | ส่งค่าออกมาเมื่อ sidebar ถูกย่อหรือขยาย |
| `itemSelect` | `SicSidebarItem` | เมื่อเลือกเมนูที่ไม่มี children |
| `searchChange` | `string` | ส่งออกมาเมื่อเรียก sidebar.handleSearchInput(value) จาก template ของคุณเอง |
| `darkModeChange` | `boolean` | ส่งออกมาเมื่อเรียก sidebar.setDarkMode(value) จาก template ของคุณเอง |
| `userAction` | `SicSidebarUser` | ส่งออกมาเมื่อเรียก sidebar.handleUserAction() จาก template ของคุณเอง |

---

## Navbar + Sidebar + Breadcrumb ร่วมกัน — `sic-navbar + sic-sidebar + sic-breadcrumb`

_Category: Navigation_

ตัวอย่างการวาง layout แบบ admin shell จริง: ปิดปุ่มพับ/กางในตัวของ sic-sidebar ([showToggle]="false") แล้วใช้ hamburger ของ sic-navbar (ประกอบเองใน sicNavbarHeader วางไว้เป็นอันแรกก่อนโลโก้) ควบคุม collapsed ตัวเดียวกันแทน — ตั้ง [collapseMode]="'hidden'" ให้ sidebar หายไปทั้งหมดตอนพับแทนที่จะเหลือแถบไอคอนแคบๆ (ไม่ต้องแสดงแบบย่อเลย ตามที่ขอ) และ sic-breadcrumb ด้านบนแสดง path ของเมนูที่เลือกอยู่ ไล่จากเมนูแม่ไปจนถึงเมนูปัจจุบัน คำนวณจาก activeLink โดยไล่ดู children ของ sidebarSections เอง (breadcrumb ไม่ได้ผูกกับ sidebar โดยตรง เพราะ sidebar ไม่มี event ส่ง path ออกมาให้ ต้องประกอบเองฝั่ง host เสมอ) — ฝั่งขวาของ navbar (sicNavbarRight) ประกอบ 3 อย่าง: ปุ่มสลับ dark mode ธรรมดา, กระดิ่งแจ้งเตือนที่ใช้ sic-popover แสดงรายการแจ้งเตือนเป็น list (แทนที่จะ toggle เอง), และรูป+ชื่อโปรไฟล์

**template.html**

```html
<sic-navbar [sticky]="false" [showSidebarToggle]="true">
  <ng-template sicNavbarHeader let-navbar>
    <!-- hamburger วางไว้เป็นอันแรก ก่อนโลโก้/ชื่อ — สลับ shellCollapsed ตัวเดียวกับที่ผูกกับ sidebar ด้านล่าง -->
    <button type="button" (click)="shellCollapsed = !shellCollapsed">☰</button>
    <div class="my-shell-brand">🐙 sic-ng</div>
  </ng-template>

  <ng-template sicNavbarRight let-navbar>
    <div class="my-shell-right">
      <button type="button" (click)="shellDarkMode = !shellDarkMode">{{ shellDarkMode ? '🌙' : '☀️' }}</button>

      <!-- กระดิ่งแจ้งเตือนประกอบจาก sic-popover เอง แทนที่จะใช้ notificationsOpen/toggleNotifications ของ navbar -->
      <sic-popover [items]="navbarNotifications" (itemSelect)="handleNavbarNotification($event)">
        <ng-template sicPopoverButton let-popover>
          <button type="button" (click)="popover.toggle()">
            🔔
            @if (shellHasUnreadNotifications) { <span class="dot"></span> }
          </button>
        </ng-template>
        <ng-template sicPopoverHeader><div>Notifications</div></ng-template>
        <ng-template sicPopoverList let-item>
          @if (item.actor) { <b>{{ item.actor }}</b> }
          {{ item.message }}
          <span>{{ item.time }}</span>
        </ng-template>
      </sic-popover>

      <div class="my-shell-profile">
        <span class="avatar">{{ navbarUser.name.charAt(0) }}</span>
        <span>{{ navbarUser.name }}</span>
      </div>
    </div>
  </ng-template>
</sic-navbar>

<div class="my-shell-body">
  <sic-sidebar
    [sections]="sidebarSections"
    [collapsed]="shellCollapsed"
    [showToggle]="false"
    collapseMode="hidden"
    [activeLink]="shellActiveLink"
    (itemSelect)="handleShellItemSelect($event)"
  />

  <div class="my-shell-content">
    <sic-breadcrumb [items]="shellBreadcrumbItems" separator="/" (itemClick)="handleShellBreadcrumbClick($event)" />
    <!-- ...เนื้อหาหน้าตาม shellActiveLink... -->
  </div>
</div>
```

**component.ts**

```typescript
shellCollapsed = false;
shellActiveLink = '/home';
shellDarkMode = false;

// ใช้ navbarUser/navbarNotifications ชุดเดียวกับตัวอย่าง sic-navbar เดี่ยวๆ ด้านบน
get shellHasUnreadNotifications(): boolean {
  return this.navbarNotifications.some((n) => !n.read);
}

// ไล่หา path ของเมนูที่ activeLink ตรงกับ item ไหน จาก sidebarSections เดิม (รองรับ children ซ้อนกี่ชั้นก็ได้)
get shellBreadcrumbItems(): SicBreadcrumbItem[] {
  for (const section of this.sidebarSections) {
    const path = this.findSidebarPath(section.items, this.shellActiveLink, []);
    if (path) {
      return path.map((item, i) => i === path.length - 1 ? { label: item.label } : { label: item.label, link: item.link });
    }
  }
  return [];
}

private findSidebarPath(items: SicSidebarItem[], link: string, trail: SicSidebarItem[]): SicSidebarItem[] | null {
  for (const item of items) {
    const nextTrail = [...trail, item];
    if (item.link === link) return nextTrail;
    if (item.children?.length) {
      const found = this.findSidebarPath(item.children, link, nextTrail);
      if (found) return found;
    }
  }
  return null;
}

// sidebar.itemSelect ยิงเฉพาะ item ที่ไม่มี children (ตัวที่มี children แค่พับ/กางตัวเอง ไม่ยิง event) — ใช้ link ของมันเป็น activeLink ใหม่ได้ตรงๆ
handleShellItemSelect(item: SicSidebarItem): void {
  if (item.link) {
    this.shellActiveLink = item.link;
  }
}

handleShellBreadcrumbClick(item: SicBreadcrumbItem): void {
  if (item.link) {
    this.shellActiveLink = item.link;
  }
}
```

**Attributes**

| Name | Type | Default | Description |
|---|---|---|---|
| `[showToggle]="false" (sidebar)` | `boolean` |  | ปิดปุ่มพับ/กางในตัวของ sidebar เพราะจะใช้ hamburger ของ navbar ควบคุม collapsed แทน — ถ้าไม่ปิดจะมีปุ่มพับ/กางซ้อนกันสองที่ |
| `collapseMode="hidden" (sidebar)` | `'rail' \| 'hidden'` |  | ให้ sidebar หายไปทั้งหมดตอนพับ (กว้าง 0) แทนที่จะเหลือแถบไอคอน — ตรงตามที่ขอ "แสดงเต็มหรือพับออกไปเลย ไม่ต้องแสดงแบบย่อ" |
| `sicNavbarHeader (navbar)` | `<ng-template>` |  | ประกอบปุ่ม hamburger รวมกับโลโก้/ชื่อในสล็อตเดียว วางปุ่ม hamburger ไว้เป็นอันแรกสุด แล้วสลับ shellCollapsed ตัวเดียวกับที่ผูกกับ [collapsed] ของ sidebar — navbar กับ sidebar จึงซิงค์กันโดยไม่ต้องมี event พิเศษระหว่างกัน |
| `sicNavbarRight (navbar)` | `<ng-template>` |  | ประกอบ dark mode toggle + กระดิ่งแจ้งเตือน (ใช้ sic-popover แสดง navbarNotifications เป็น list พร้อม header/list ของตัวเอง) + รูป/ชื่อโปรไฟล์จาก navbarUser — ทุกส่วนเป็น state/data ที่ host คุมเองทั้งหมด ไม่ผูกกับ input darkMode/notifications/user ของ sic-navbar เลย |
| `sic-popover (ในกระดิ่งแจ้งเตือน)` | `component` |  | ใช้แทนกลไก notificationsOpen/toggleNotifications ในตัวของ sic-navbar — sicPopoverButton คือปุ่มกระดิ่ง, sicPopoverHeader ใส่หัวข้อ, sicPopoverList แสดงแต่ละแจ้งเตือน, itemSelect ยิง handleNavbarNotification เดิม |
| `shellBreadcrumbItems (host)` | `SicBreadcrumbItem[]` |  | getter ที่ host เขียนเอง ไล่หา path จาก sidebarSections ตาม shellActiveLink — sic-breadcrumb เองไม่รู้จัก sidebar เลย จึงต้องคำนวณ path นี้ที่ฝั่ง host เสมอไม่ว่าจะใช้คู่กับ sidebar แบบไหน |

**Events**

| Name | Payload | Description |
|---|---|---|
| `itemSelect (sidebar)` | `SicSidebarItem` | อัพเดต shellActiveLink เมื่อเลือกเมนูที่ไม่มี children — breadcrumb จะคำนวณ path ใหม่ตามนี้อัตโนมัติ |
| `itemClick (breadcrumb)` | `SicBreadcrumbItem` | คลิกเมนูแม่ใน breadcrumb เพื่อย้อนกลับไปเมนูนั้นได้เลย (ตั้ง shellActiveLink กลับไปที่ link ของ ancestor ที่คลิก) |
| `itemSelect (sic-popover)` | `SicNavbarNotification` | เมื่อคลิกแจ้งเตือนใน popover — ตัวอย่างนี้ส่งต่อไป handleNavbarNotification เดิม (แสดง toast) |

---

## Navbar + Sidebar + Breadcrumb ร่วมกัน (v2: sidebar เต็มความสูง) — `sic-sidebar + sic-navbar + sic-breadcrumb`

_Category: Navigation_

เหมือนตัวอย่าง v1 ทุกอย่าง (ปิด [showToggle] ของ sidebar, ใช้ hamburger ของ navbar ควบคุม collapsed, collapseMode="hidden", breadcrumb คำนวณ path เอง, ฝั่งขวาของ navbar มี dark mode + sic-popover แจ้งเตือน + โปรไฟล์) แต่สลับ layout ใหม่: sidebar ขึ้นไปเต็มความสูงของ shell ตั้งแต่บนสุดจนล่างสุด (ไม่ได้อยู่ใต้ navbar เหมือน v1) โดย sidebar กับ navbar วางเรียงกันแบบแถว (row) แทนที่จะเป็นคอลัมน์ — sidebar เป็น sibling อยู่ซ้ายสุด ส่วน navbar+เนื้อหาอยู่ในคอลัมน์ทางขวา โลโก้/แบรนด์จึงย้ายไปอยู่ที่ sidebar เอง (logo/brand input) แทนที่จะอยู่ใน sicNavbarHeader เพราะ navbar ไม่ได้กว้างเต็มจอด้านบนอีกต่อไป

**template.html**

```html
<div class="my-shell-v2">
  <sic-sidebar
    [sections]="sidebarSections"
    [collapsed]="shellCollapsedV2"
    [showToggle]="false"
    collapseMode="hidden"
    logo="🐙"
    brand="sic-ng"
    [activeLink]="shellActiveLinkV2"
    (itemSelect)="handleShellItemSelectV2($event)"
  />

  <div class="my-shell-v2-main">
    <sic-navbar [sticky]="false" [showSidebarToggle]="true">
      <ng-template sicNavbarHeader let-navbar>
        <!-- ไม่มีโลโก้ตรงนี้แล้ว เพราะย้ายไปอยู่ที่ sidebar (เต็มความสูง) แทน -->
        <button type="button" (click)="shellCollapsedV2 = !shellCollapsedV2">☰</button>
      </ng-template>

      <ng-template sicNavbarRight let-navbar>
        <!-- เหมือน v1 ทุกอย่าง: dark mode toggle + sic-popover แจ้งเตือน + โปรไฟล์ -->
        <div class="my-shell-right">
          <button type="button" (click)="shellDarkModeV2 = !shellDarkModeV2">{{ shellDarkModeV2 ? '🌙' : '☀️' }}</button>
          <sic-popover [items]="navbarNotifications" (itemSelect)="handleNavbarNotification($event)">
            <ng-template sicPopoverButton let-popover>
              <button type="button" (click)="popover.toggle()">🔔</button>
            </ng-template>
            <ng-template sicPopoverList let-item>{{ item.message }}</ng-template>
          </sic-popover>
          <div class="my-shell-profile">
            <span class="avatar">{{ navbarUser.name.charAt(0) }}</span>
            <span>{{ navbarUser.name }}</span>
          </div>
        </div>
      </ng-template>
    </sic-navbar>

    <div class="my-shell-content">
      <sic-breadcrumb [items]="shellBreadcrumbItemsV2" separator="/" (itemClick)="handleShellBreadcrumbClickV2($event)" />
    </div>
  </div>
</div>
```

**component.ts**

```typescript
// state ชุดของตัวเอง แยกจาก v1 ไม่ให้กระทบกัน แต่ใช้ sidebarSections/navbarUser/navbarNotifications/
// findSidebarPath ร่วมกับ v1 ได้เลยเพราะเป็น data/helper กลางที่ไม่ผูกกับ layout แบบใดแบบหนึ่ง
shellCollapsedV2 = false;
shellActiveLinkV2 = '/home';
shellDarkModeV2 = false;

get shellBreadcrumbItemsV2(): SicBreadcrumbItem[] {
  for (const section of this.sidebarSections) {
    const path = this.findSidebarPath(section.items, this.shellActiveLinkV2, []);
    if (path) {
      return path.map((item, i) => i === path.length - 1 ? { label: item.label } : { label: item.label, link: item.link });
    }
  }
  return [];
}

handleShellItemSelectV2(item: SicSidebarItem): void {
  if (item.link) {
    this.shellActiveLinkV2 = item.link;
  }
}

handleShellBreadcrumbClickV2(item: SicBreadcrumbItem): void {
  if (item.link) {
    this.shellActiveLinkV2 = item.link;
  }
}
```

**Attributes**

| Name | Type | Default | Description |
|---|---|---|---|
| `.my-shell-v2 { display: flex }` | `CSS` |  | จุดต่างหลักจาก v1: shell นอกสุดเป็น flex แบบแถว (sidebar เป็น sibling ซ้ายสุด) แทนที่จะเป็นคอลัมน์ (navbar บนสุด แล้วค่อยเป็นแถวของ sidebar+content ข้างล่าง) — sidebar จึงสูงเท่า shell ทั้งก้อนตั้งแต่บนจนล่าง |
| `logo / brand (sidebar)` | `string` |  | ย้ายโลโก้/แบรนด์มาไว้ที่ sidebar แทน navbar เพราะ sidebar อยู่เต็มความสูงแล้ว ที่ว่างด้านบนสุดของ sidebar จึงเหมาะเป็นตำแหน่งโลโก้มากกว่า |
| `sicNavbarHeader (navbar)` | `<ng-template>` |  | เหลือแค่ปุ่ม hamburger อย่างเดียว (ไม่มีโลโก้แล้ว) สลับ shellCollapsedV2 ตัวเดียวกับที่ผูกกับ [collapsed] ของ sidebar |
| `sicNavbarRight / sic-popover` | `<ng-template> / component` |  | เหมือน v1 ทุกประการ — dark mode toggle, กระดิ่งแจ้งเตือนด้วย sic-popover, รูป/ชื่อโปรไฟล์ |

**Events**

| Name | Payload | Description |
|---|---|---|
| `itemSelect (sidebar)` | `SicSidebarItem` | อัพเดต shellActiveLinkV2 — เหมือน v1 แต่แยก state กัน |
| `itemClick (breadcrumb)` | `SicBreadcrumbItem` | ย้อนกลับไปเมนูแม่ที่คลิกใน breadcrumb |
| `itemSelect (sic-popover)` | `SicNavbarNotification` | ส่งต่อไป handleNavbarNotification เดิม (แสดง toast) |

---

## Tabs — `sic-tabs`

_Category: Navigation_

สลับเนื้อหาด้วย tab id

**template.html**

```html
<sic-tabs
  [tabs]="tabs"
  [activeId]="activeTabId"
  (activeIdChange)="activeTabId = $event"
/>
```

**component.ts**

```typescript
tabs: SicTab[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'details', label: 'Details' },
];
activeTabId = 'overview';
```

**Attributes**

| Name | Type | Default | Description |
|---|---|---|---|
| `tabs` | `SicTab[]` |  | รายการ tab เช่น id และ label |
| `activeId` | `string` |  | id ของ tab ที่ active อยู่ |

**Events**

| Name | Payload | Description |
|---|---|---|
| `activeIdChange` | `string` | ส่ง id ของ tab ใหม่เมื่อผู้ใช้เปลี่ยน tab |

---

## Stepper — `sic-stepper`

_Category: Navigation_

ตัวชี้ขั้นตอนแบบ wizard ปรับได้ทั้งแนวนอน (horizontal, ค่าเริ่มต้น) และแนวตั้ง (vertical) ผ่าน [orientation] มีปุ่ม Previous/Skip/Next/Finish ในตัว (Skip โผล่เฉพาะขั้นที่ optional=true, Finish แทนที่ Next เมื่อถึงขั้นสุดท้าย) คลิกที่หัวข้อขั้นตอนเพื่อกระโดดไปตรงๆ ได้เลย (เว้นแต่ตั้ง disabled) — เนื้อหาของแต่ละขั้นไม่มี UI ในตัว (เหมือน sic-tabs) ต้องใส่เองผ่าน ng-content แล้ว @switch (activeIndex) เอง

**template.html**

```html
<sic-stepper
  [steps]="wizardSteps"
  [(activeIndex)]="wizardStep"
  orientation="horizontal"
  (skip)="onWizardSkip($event)"
  (finish)="onWizardFinish()"
>
  @switch (wizardStep) {
    @case (0) { <p>กรอกบัญชีผู้ใช้...</p> }
    @case (1) { <p>กรอกโปรไฟล์ (ข้ามได้)...</p> }
    @case (2) { <p>ยืนยันข้อมูล...</p> }
  }
</sic-stepper>
```

**component.ts**

```typescript
wizardSteps: SicStepperStep[] = [
  { label: 'Account' },
  { label: 'Profile', description: 'รูปโปรไฟล์และข้อมูลเพิ่มเติม', optional: true },
  { label: 'Confirm' },
];
wizardStep = 0;

onWizardSkip(skippedIndex: number): void {
  this.toasts.show(`ข้ามขั้นตอน: ${this.wizardSteps[skippedIndex].label}`, 'info');
}

onWizardFinish(): void {
  this.toasts.show('เสร็จสิ้น wizard', 'success');
}
```

**Attributes**

| Name | Type | Default | Description |
|---|---|---|---|
| `steps` | `SicStepperStep[]` | `[]` | รายการขั้นตอน — { label, description?, optional?, disabled? } |
| `activeIndex` | `number` | `0` | ขั้นตอนปัจจุบัน (bindable ด้วย [(activeIndex)]) |
| `orientation` | `'horizontal' \| 'vertical'` | `'horizontal'` | แนวการวางหัวข้อขั้นตอน — vertical จะวางหัวข้อเป็นคอลัมน์ทางซ้าย เนื้อหาอยู่ทางขวา |
| `showNav` | `boolean` | `true` | ซ่อนแถบปุ่ม Previous/Skip/Next/Finish ในตัว ถ้าต้องการควบคุมเองผ่าน goTo()/goToPrevious()/goToNext()/skipStep()/finishStepper() |

**Events**

| Name | Payload | Description |
|---|---|---|
| `activeIndexChange` | `number` | เกิดทุกครั้งที่ขั้นตอนเปลี่ยน ไม่ว่าจะจาก Previous/Next/Skip หรือคลิกหัวข้อขั้นตอนตรงๆ |
| `skip` | `number` | เกิดเฉพาะตอนกดปุ่ม Skip (นอกเหนือจาก activeIndexChange) ส่ง index ของขั้นที่ถูกข้าม |
| `finish` | `-` | เกิดตอนกดปุ่ม Finish ที่ขั้นตอนสุดท้าย — ไม่เปลี่ยน activeIndex เอง |

---

## Timeline — `sic-timeline`

_Category: Navigation_

เส้นเวลาแบบ vertical (ค่าเริ่มต้น) หรือ horizontal ผ่าน [orientation] — [alternate] (true เป็นค่าเริ่มต้น) สลับข้อความซ้าย/ขวา (หรือบน/ล่างถ้าเป็นแนวนอน) สลับกันไปตามแนวเส้น เหมือนภาพ "ประวัติบริษัท" ทั่วไป ปิด alternate แล้วใช้ [side] เพื่อให้ข้อความอยู่ทางเดียวตลอดแทน (เส้น/วงกลมจะขยับไปติดข้อความฝั่งนั้นให้เอง) แต่ละรายการปรับ template เองได้เต็มที่ผ่าน #itemTemplate ถ้าไม่ใส่จะใช้ default (วันที่/หัวข้อ/รายละเอียด)

**template.html**

```html
<sic-timeline [items]="companyHistory" orientation="vertical" [alternate]="true">
  <ng-template #itemTemplate let-item let-index="index">
    <span class="my-timeline-tag" [style.background]="item.color">{{ item.title }}</span>
    <div class="my-timeline-date">{{ item.date }}</div>
    <p>{{ item.description }}</p>
  </ng-template>
</sic-timeline>

<!-- ทางเดียว: ปิด alternate แล้วเลือกฝั่งด้วย side -->
<sic-timeline [items]="companyHistory" [alternate]="false" side="end" />
```

**component.ts**

```typescript
companyHistory: SicTimelineItem[] = [
  { title: 'Foundation', date: '2020', description: 'Foundation of the company by a group of visionary entrepreneurs.', color: '#f59e0b' },
  { title: 'First product', date: '2021', description: 'Launch of its first product, a revolutionary software for project management.', color: '#ec4899' },
  { title: 'Expansion', date: '2022', description: 'International expansion with the opening of eight new branches.', color: '#3b82f6' },
  { title: 'Market leader', date: '2023', description: 'Acquisition of a competing company, consolidating itself as a market leader.', color: '#f59e0b' },
];
```

**Attributes**

| Name | Type | Default | Description |
|---|---|---|---|
| `items` | `SicTimelineItem[]` | `[]` | รายการเหตุการณ์ — { title?, date?, description?, color?, icon? } |
| `orientation` | `'horizontal' \| 'vertical'` | `'vertical'` | แนวเส้นเวลา |
| `alternate` | `boolean` | `true` | สลับข้อความไปมาคนละฝั่งของเส้นตามลำดับรายการ — ปิดเพื่อให้ทุกรายการอยู่ฝั่งเดียวกันหมด |
| `side` | `'start' \| 'end'` | `'start'` | ฝั่งที่รายการแรก (index 0) เริ่มแสดง — ถ้า alternate=true รายการถัดไปจะสลับฝั่งจากนี้ไปเรื่อยๆ, ถ้า alternate=false ทุกรายการจะอยู่ฝั่งนี้ตลอด (เส้น/วงกลมขยับไปติดข้อความให้เอง) |
| `#itemTemplate` | `content slot` |  | ปรับแต่ง UI ของแต่ละรายการเอง รับ let-item, let-index, let-side — ไม่ใส่จะ fallback เป็น date/title/description ให้อัตโนมัติ |

**Events**

_None._

---
