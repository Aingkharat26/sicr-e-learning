import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  ContentChild,
  EventEmitter,
  HostBinding,
  HostListener,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  TemplateRef,
  inject,
} from '@angular/core';
import { SicSidebarItem, SicSidebarSection, SicSidebarUser } from './sic-sidebar.model';
import {
  SicSidebarFooterDirective,
  SicSidebarHeaderDirective,
  SicSidebarMenuDirective,
  SicSidebarSubheaderDirective,
  SicSidebarTemplateContext,
} from './sic-sidebar-template.directive';

@Component({
  selector: 'sic-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sic-sidebar.component.html',
  styleUrl: './sic-sidebar.component.css',
})
export class SicSidebarComponent implements OnChanges, OnDestroy {
  private readonly cdr = inject(ChangeDetectorRef);
  /** Back-compat flat item list, rendered as a single untitled 'menu' section when `sections` isn't given. */
  @Input() items: SicSidebarItem[] = [];
  @Input() sections: SicSidebarSection[] = [];

  @Input() collapsed = false;
  @Input() activeLink?: string;
  /** Hides the built-in collapse/expand button — set this when some other control (e.g. a navbar hamburger) drives `collapsed` instead. */
  @Input() showToggle = true;
  /** 'rail' (default): collapsed sidebar shrinks to an icon-only rail. 'hidden': collapsed sidebar disappears entirely (0 width), same as the built-in mobile behavior, at any viewport size. */
  @Input() collapseMode: 'rail' | 'hidden' = 'rail';

  @Input() logo?: string;
  @Input() brand?: string;

  @Input() search = '';
  @Input() searchPlaceholder = 'Search...';

  @Input() darkMode = false;

  @Input() user?: SicSidebarUser;

  /** Overrides the accent color used for the active-item highlight and badges. */
  @Input() accentColor?: string;

  @Output() itemSelect = new EventEmitter<SicSidebarItem>();
  @Output() collapsedChange = new EventEmitter<boolean>();
  @Output() searchChange = new EventEmitter<string>();
  @Output() darkModeChange = new EventEmitter<boolean>();
  @Output() userAction = new EventEmitter<SicSidebarUser>();

  /** Custom `<ng-template sicSidebarHeader let-collapsed="collapsed">` replaces the default logo/brand row. */
  @ContentChild(SicSidebarHeaderDirective, { read: TemplateRef }) headerTemplate?: TemplateRef<SicSidebarTemplateContext>;
  /** `<ng-template sicSidebarSubheader>` — the row below the header has no built-in UI, so this is the only way to render one (e.g. a search box using `search`/`searchChange`/`searchPlaceholder` below). */
  @ContentChild(SicSidebarSubheaderDirective, { read: TemplateRef }) subheaderTemplate?: TemplateRef<SicSidebarTemplateContext>;
  /** Custom `<ng-template sicSidebarMenu>` replaces the default sections/nav entirely. */
  @ContentChild(SicSidebarMenuDirective, { read: TemplateRef }) menuTemplate?: TemplateRef<SicSidebarTemplateContext>;
  /** `<ng-template sicSidebarFooter let-sidebar>` — the footer has no built-in UI, so this is the only way to render one (e.g. a theme toggle using `darkMode`/`darkModeChange`, or a user card using `user`/`userAction`, both below). */
  @ContentChild(SicSidebarFooterDirective, { read: TemplateRef }) footerTemplate?: TemplateRef<SicSidebarTemplateContext>;

  get templateContext(): SicSidebarTemplateContext {
    return { $implicit: this, collapsed: this.collapsed, expanded: this.expanded };
  }

  @HostBinding('class.sic-sidebar-host') readonly hostClass = true;
  @HostBinding('class.sic-sidebar--collapsed') get isCollapsed() {
    return this.collapsed;
  }
  /** True while a collapsed sidebar is temporarily flared open to full width because the pointer is hovering over it. */
  @HostBinding('class.sic-sidebar--peek') get isPeeking(): boolean {
    return this.collapsed && this.hovering;
  }
  @HostBinding('class.sic-sidebar--hide-collapsed') get isHideCollapseMode(): boolean {
    return this.collapseMode === 'hidden';
  }
  @HostBinding('style.--sic-sidebar-accent') get accentVar(): string | null {
    return this.accentColor ?? null;
  }

  /** Whether the sidebar should currently render its full (labels + submenus) layout, either because it isn't collapsed or because it's peeking open. */
  get expanded(): boolean {
    return !this.collapsed || this.isPeeking;
  }

  expandedLabels = new Set<string>();
  private hovering = false;
  /**
   * A brief close-delay absorbs the spurious mouseleave→mouseenter pair that some browsers fire
   * when the peek panel's geometry (position/box-shadow) changes right under a stationary cursor —
   * without it, that single-frame hit-test glitch reads as the sidebar endlessly flickering open/closed.
   */
  private closeTimer?: ReturnType<typeof setTimeout>;

  @HostListener('mouseenter')
  onMouseEnter(): void {
    this.clearCloseTimer();
    this.hovering = true;
  }

  @HostListener('mouseleave')
  onMouseLeave(): void {
    this.clearCloseTimer();
    this.closeTimer = setTimeout(() => {
      this.closeTimer = undefined;
      this.hovering = false;
      this.cdr.markForCheck();
    }, 120);
  }

  ngOnDestroy(): void {
    this.clearCloseTimer();
  }

  private clearCloseTimer(): void {
    if (this.closeTimer) {
      clearTimeout(this.closeTimer);
      this.closeTimer = undefined;
    }
  }

  get resolvedSections(): SicSidebarSection[] {
    if (this.sections.length) {
      return this.sections;
    }
    return this.items.length ? [{ items: this.items, variant: 'menu' }] : [];
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['activeLink'] || changes['sections'] || changes['items']) {
      this.expandAncestorsOfActiveLink();
    }
  }

  /** Auto-expands every collapsed submenu that contains the item matching `activeLink`, so navigating straight to a deep URL still reveals it. */
  private expandAncestorsOfActiveLink(): void {
    if (!this.activeLink) {
      return;
    }
    for (const section of this.resolvedSections) {
      if (this.expandAncestorsInList(section.items, [])) {
        break;
      }
    }
  }

  private expandAncestorsInList(items: SicSidebarItem[], ancestors: SicSidebarItem[]): boolean {
    for (const item of items) {
      if (item.link === this.activeLink) {
        ancestors.forEach((ancestor) => this.expandedLabels.add(ancestor.label));
        return true;
      }
      if (item.children?.length && this.expandAncestorsInList(item.children, [...ancestors, item])) {
        return true;
      }
    }
    return false;
  }

  toggleCollapsed(): void {
    this.collapsed = !this.collapsed;
    this.collapsedChange.emit(this.collapsed);
  }

  toggleExpand(item: SicSidebarItem): void {
    if (this.expandedLabels.has(item.label)) {
      this.expandedLabels.delete(item.label);
    } else {
      this.expandedLabels.add(item.label);
    }
  }

  isExpanded(item: SicSidebarItem): boolean {
    return this.expandedLabels.has(item.label);
  }

  selectItem(item: SicSidebarItem): void {
    if (item.children?.length) {
      this.toggleExpand(item);
      return;
    }

    this.itemSelect.emit(item);
  }

  handleSearchInput(value: string): void {
    this.search = value;
    this.searchChange.emit(value);
  }

  setDarkMode(value: boolean): void {
    if (value === this.darkMode) {
      return;
    }
    this.darkMode = value;
    this.darkModeChange.emit(value);
  }

  handleUserAction(): void {
    if (this.user) {
      this.userAction.emit(this.user);
    }
  }
}
