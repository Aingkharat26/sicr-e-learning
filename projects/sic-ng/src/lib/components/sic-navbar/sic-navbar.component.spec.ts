import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { SIC_CONFIG } from '../../config/sic-config';
import { SicNavbarComponent } from './sic-navbar.component';
import { SicNavbarMenuItem, SicNavbarNotification, SicNavbarUser } from './sic-navbar.model';
import { SicNavbarHeaderDirective, SicNavbarLeftDirective, SicNavbarRightDirective } from './sic-navbar-template.directive';

describe('SicNavbarComponent', () => {
  let fixture: ComponentFixture<SicNavbarComponent>;
  let component: SicNavbarComponent;

  const user: SicNavbarUser = { name: 'Musharof', email: 'randomuser@pimjo.com' };
  const menuItems: SicNavbarMenuItem[] = [
    { label: 'Edit profile', icon: '👤', action: 'edit-profile' },
    { label: 'Sign out', icon: '↩️', action: 'sign-out' },
  ];
  const notifications: SicNavbarNotification[] = [
    {
      id: 1,
      actor: 'Terry Franci',
      message: 'requests permission to change',
      target: 'Project - Nganter App',
      category: 'Project',
      time: '5 min ago',
      status: 'online',
      read: false,
    },
    { id: 2, message: 'Server backup completed', time: '1 hr ago', read: true },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [SicNavbarComponent] }).compileComponents();
    fixture = TestBed.createComponent(SicNavbarComponent);
    component = fixture.componentInstance;
  });

  describe('sticky/fixed positioning', () => {
    it('adds no positioning class by default', () => {
      fixture.detectChanges();

      const host: HTMLElement = fixture.nativeElement;
      expect(host.classList.contains('sic-navbar--sticky')).toBe(false);
      expect(host.classList.contains('sic-navbar--fixed')).toBe(false);
    });

    it('adds sic-navbar--sticky when [sticky] is set', () => {
      fixture.componentRef.setInput('sticky', true);
      fixture.detectChanges();

      expect(fixture.nativeElement.classList.contains('sic-navbar--sticky')).toBe(true);
    });

    it('adds sic-navbar--fixed when [fixed] is set', () => {
      fixture.componentRef.setInput('fixed', true);
      fixture.detectChanges();

      expect(fixture.nativeElement.classList.contains('sic-navbar--fixed')).toBe(true);
    });

    it('fixed takes precedence over sticky when both are set', () => {
      fixture.componentRef.setInput('sticky', true);
      fixture.componentRef.setInput('fixed', true);
      fixture.detectChanges();

      const host: HTMLElement = fixture.nativeElement;
      expect(host.classList.contains('sic-navbar--fixed')).toBe(true);
      expect(host.classList.contains('sic-navbar--sticky')).toBe(false);
    });
  });

  describe('header/brand default', () => {
    it('renders nothing by default when no logo/brand and no headerTemplate is given', () => {
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.sic-navbar__brand')).toBeNull();
    });

    it('renders the default logo/brand row when inputs are given', () => {
      fixture.componentRef.setInput('logo', '🐙');
      fixture.componentRef.setInput('brand', 'sic-ng');
      fixture.detectChanges();

      const brand = fixture.nativeElement.querySelector('.sic-navbar__brand');
      expect(brand.textContent).toContain('🐙');
      expect(brand.textContent).toContain('sic-ng');
    });
  });

  it('has no built-in left/right UI — those slots render nothing unless a template is provided', () => {
    fixture.detectChanges();
    const host: HTMLElement = fixture.nativeElement;
    expect(host.querySelector('.sic-navbar__left')).toBeNull();
    expect(host.querySelector('.sic-navbar__right')).toBeNull();
    expect(host.textContent?.trim()).toBe('');
  });

  it('defaults showSidebarToggle to false', () => {
    expect(component.showSidebarToggle).toBe(false);
  });

  describe('sidebar toggle state (for a custom sicNavbarLeft template to consume)', () => {
    it('toggleSidebar() emits collapsedChange and flips collapsed', () => {
      fixture.detectChanges();
      const spy = vi.fn();
      component.collapsedChange.subscribe(spy);

      component.toggleSidebar();

      expect(spy).toHaveBeenCalledWith(true);
      expect(component.collapsed).toBe(true);
    });
  });

  it('toggleDarkMode() flips darkMode and emits darkModeChange', () => {
    fixture.detectChanges();
    const spy = vi.fn();
    component.darkModeChange.subscribe(spy);

    component.toggleDarkMode();

    expect(spy).toHaveBeenCalledWith(true);
    expect(component.darkMode).toBe(true);
  });

  describe('notifications state (for a custom sicNavbarRight template to consume)', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('notifications', notifications);
      fixture.detectChanges();
    });

    it('hasUnread is true when at least one notification is unread', () => {
      expect(component.hasUnread).toBe(true);
    });

    it('toggleNotifications() opens the panel and closes the user menu', () => {
      component.userMenuOpen = true;
      component.toggleNotifications(new MouseEvent('click'));

      expect(component.notificationsOpen).toBe(true);
      expect(component.userMenuOpen).toBe(false);
    });

    it('closeNotifications() closes the panel', () => {
      component.notificationsOpen = true;
      component.closeNotifications();

      expect(component.notificationsOpen).toBe(false);
    });

    it('handleViewAllNotifications() emits viewAllNotifications and closes the panel', () => {
      const spy = vi.fn();
      component.viewAllNotifications.subscribe(spy);
      component.notificationsOpen = true;

      component.handleViewAllNotifications();

      expect(spy).toHaveBeenCalled();
      expect(component.notificationsOpen).toBe(false);
    });

    it('selectNotification() emits notificationClick and closes the panel', () => {
      const spy = vi.fn();
      component.notificationClick.subscribe(spy);
      component.notificationsOpen = true;

      component.selectNotification(notifications[0]);

      expect(spy).toHaveBeenCalledWith(notifications[0]);
      expect(component.notificationsOpen).toBe(false);
    });
  });

  describe('user menu state (for a custom sicNavbarRight template to consume)', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('user', user);
      fixture.componentRef.setInput('menuItems', menuItems);
      fixture.detectChanges();
    });

    it('toggleUserMenu() opens the panel and closes notifications (mutually exclusive)', () => {
      component.notificationsOpen = true;

      component.toggleUserMenu(new MouseEvent('click'));

      expect(component.userMenuOpen).toBe(true);
      expect(component.notificationsOpen).toBe(false);
    });

    it('selectMenuItem() emits menuItemClick and closes the panel', () => {
      const spy = vi.fn();
      component.menuItemClick.subscribe(spy);
      component.userMenuOpen = true;

      component.selectMenuItem(menuItems[1]);

      expect(spy).toHaveBeenCalledWith(menuItems[1]);
      expect(component.userMenuOpen).toBe(false);
    });

    it('closes an open panel when clicking outside the component', () => {
      component.userMenuOpen = true;
      fixture.detectChanges();

      document.body.click();
      fixture.detectChanges();

      expect(component.userMenuOpen).toBe(false);
    });
  });
});

describe('SicNavbarComponent SIC_CONFIG defaults', () => {
  it('uses SIC_CONFIG.messages for noNotificationsText/viewAllNotificationsText, for custom templates to read', async () => {
    await TestBed.configureTestingModule({
      imports: [SicNavbarComponent],
      providers: [
        {
          provide: SIC_CONFIG,
          useValue: { messages: { noNotifications: 'ไม่มีการแจ้งเตือน', viewAllNotifications: 'ดูทั้งหมด' } },
        },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(SicNavbarComponent);

    expect(fixture.componentInstance.noNotificationsText).toBe('ไม่มีการแจ้งเตือน');
    expect(fixture.componentInstance.viewAllNotificationsText).toBe('ดูทั้งหมด');
  });
});

@Component({
  standalone: true,
  imports: [SicNavbarComponent, SicNavbarHeaderDirective, SicNavbarLeftDirective, SicNavbarRightDirective],
  template: `
    <sic-navbar>
      <ng-template sicNavbarHeader>Custom header</ng-template>
      <ng-template sicNavbarLeft>Custom left</ng-template>
      <ng-template sicNavbarRight let-navbar>
        <button type="button" class="custom-right-btn" (click)="navbar.toggleDarkMode()">Custom right</button>
      </ng-template>
    </sic-navbar>
  `,
})
class SlotHostComponent {}

describe('SicNavbarComponent slot overrides', () => {
  let hostFixture: ComponentFixture<SlotHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [SlotHostComponent] }).compileComponents();
    hostFixture = TestBed.createComponent(SlotHostComponent);
    hostFixture.detectChanges();
  });

  it('renders projected header/left/right templates', () => {
    const root: HTMLElement = hostFixture.nativeElement;
    expect(root.textContent).toContain('Custom header');
    expect(root.textContent).toContain('Custom left');
    expect(root.textContent).toContain('Custom right');
  });

  it('exposes the navbar instance as $implicit so a custom template can call component methods', () => {
    hostFixture.nativeElement.querySelector('.custom-right-btn').click();
    hostFixture.detectChanges();

    const navbarDebugEl = hostFixture.debugElement.query(By.css('sic-navbar'));
    expect(navbarDebugEl.componentInstance.darkMode).toBe(true);
  });
});
