import { CommonModule } from '@angular/common';
import {
  Component,
  ContentChild,
  ElementRef,
  EventEmitter,
  HostBinding,
  HostListener,
  Input,
  Output,
  TemplateRef,
  inject,
} from '@angular/core';
import { injectSicConfig } from '../../config/sic-config';
import { SicNavbarMenuItem, SicNavbarNotification, SicNavbarUser } from './sic-navbar.model';
import {
  SicNavbarHeaderDirective,
  SicNavbarLeftDirective,
  SicNavbarRightDirective,
  SicNavbarTemplateContext,
} from './sic-navbar-template.directive';

@Component({
  selector: 'sic-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sic-navbar.component.html',
  styleUrl: './sic-navbar.component.css',
})
export class SicNavbarComponent {
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly sicConfig = injectSicConfig();

  @Input() sticky = false;
  /** Pins the navbar to the top of the viewport with `position: fixed` (floats above scrolled content, unlike `sticky` which stays within its normal document-flow slot). Takes precedence over `sticky` if both are set — remember to add top padding/margin to whatever follows so it isn't hidden underneath. */
  @Input() fixed = false;

  @Input() brand?: string;
  @Input() logo?: string;

  /** Mirrors sic-sidebar's `collapsed`/`collapsedChange` so both can bind to the same variable. */
  @Input() collapsed = false;
  /** No built-in UI reads this directly (left/right have no default template) — it's state your own sicNavbarLeft template can consult before rendering its own hamburger button. */
  @Input() showSidebarToggle = false;

  @Input() showThemeToggle = true;
  @Input() darkMode = false;

  @Input() showNotifications = true;
  @Input() notifications: SicNavbarNotification[] = [];

  @Input() user?: SicNavbarUser;
  @Input() menuItems: SicNavbarMenuItem[] = [];

  @Output() collapsedChange = new EventEmitter<boolean>();
  @Output() darkModeChange = new EventEmitter<boolean>();
  @Output() notificationClick = new EventEmitter<SicNavbarNotification>();
  @Output() viewAllNotifications = new EventEmitter<void>();
  @Output() menuItemClick = new EventEmitter<SicNavbarMenuItem>();

  /** Custom `<ng-template sicNavbarHeader let-navbar>` replaces the default brand row. */
  @ContentChild(SicNavbarHeaderDirective, { read: TemplateRef }) headerTemplate?: TemplateRef<SicNavbarTemplateContext>;
  /** Custom `<ng-template sicNavbarLeft let-navbar>` replaces the sidebar-toggle row. */
  @ContentChild(SicNavbarLeftDirective, { read: TemplateRef }) leftTemplate?: TemplateRef<SicNavbarTemplateContext>;
  /** Custom `<ng-template sicNavbarRight let-navbar>` replaces the theme/notifications/user row. */
  @ContentChild(SicNavbarRightDirective, { read: TemplateRef }) rightTemplate?: TemplateRef<SicNavbarTemplateContext>;

  get templateContext(): SicNavbarTemplateContext {
    return { $implicit: this };
  }

  @HostBinding('class.sic-navbar-host') readonly hostClass = true;
  @HostBinding('class.sic-navbar--sticky') get isSticky() {
    return this.sticky && !this.fixed;
  }
  @HostBinding('class.sic-navbar--fixed') get isFixed() {
    return this.fixed;
  }

  notificationsOpen = false;
  userMenuOpen = false;

  get noNotificationsText(): string {
    return this.sicConfig.messages?.noNotifications ?? 'No notifications';
  }

  get viewAllNotificationsText(): string {
    return this.sicConfig.messages?.viewAllNotifications ?? 'View All Notifications';
  }

  get hasUnread(): boolean {
    return this.notifications.some((n) => !n.read);
  }

  toggleSidebar(): void {
    this.collapsed = !this.collapsed;
    this.collapsedChange.emit(this.collapsed);
  }

  toggleDarkMode(): void {
    this.darkMode = !this.darkMode;
    this.darkModeChange.emit(this.darkMode);
  }

  toggleNotifications(event: Event): void {
    event.stopPropagation();
    this.userMenuOpen = false;
    this.notificationsOpen = !this.notificationsOpen;
  }

  toggleUserMenu(event: Event): void {
    event.stopPropagation();
    this.notificationsOpen = false;
    this.userMenuOpen = !this.userMenuOpen;
  }

  selectNotification(notification: SicNavbarNotification): void {
    this.notificationClick.emit(notification);
    this.notificationsOpen = false;
  }

  closeNotifications(): void {
    this.notificationsOpen = false;
  }

  handleViewAllNotifications(): void {
    this.viewAllNotifications.emit();
    this.notificationsOpen = false;
  }

  selectMenuItem(item: SicNavbarMenuItem): void {
    this.menuItemClick.emit(item);
    this.userMenuOpen = false;
  }

  @HostListener('document:click', ['$event'])
  handleDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target as Node)) {
      this.notificationsOpen = false;
      this.userMenuOpen = false;
    }
  }
}
