import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  SicSidebarFooterDirective,
  SicSidebarHeaderDirective,
  SicSidebarMenuDirective,
  SicSidebarSubheaderDirective,
} from './sic-sidebar-template.directive';
import { SicSidebarComponent } from './sic-sidebar.component';
import { SicSidebarItem, SicSidebarSection, SicSidebarUser } from './sic-sidebar.model';

describe('SicSidebarComponent', () => {
  let fixture: ComponentFixture<SicSidebarComponent>;
  let component: SicSidebarComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [SicSidebarComponent] }).compileComponents();
    fixture = TestBed.createComponent(SicSidebarComponent);
    component = fixture.componentInstance;
  });

  function links(): HTMLAnchorElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll('.sic-sidebar__link'));
  }

  describe('back-compat flat items', () => {
    it('wraps `items` into a single untitled menu section', () => {
      component.items = [{ label: 'Dashboard', link: '/dashboard' }];
      fixture.detectChanges();

      expect(links().length).toBe(1);
      expect(fixture.nativeElement.querySelector('.sic-sidebar__section-title')).toBeNull();
    });
  });

  describe('sections', () => {
    const sections: SicSidebarSection[] = [
      {
        title: 'Menu',
        items: [
          { label: 'Home', icon: '🏠' },
          { label: 'Task', icon: '📋', badge: 12, link: '/task' },
        ],
      },
      {
        title: 'Group',
        variant: 'list',
        items: [{ label: 'Figma Files', color: '#22c55e', link: '/figma' }],
      },
    ];

    beforeEach(() => {
      component.sections = sections;
      fixture.detectChanges();
    });

    it('renders each section title', () => {
      const titles = Array.from(fixture.nativeElement.querySelectorAll('.sic-sidebar__section-title')).map(
        (el: any) => el.textContent.trim(),
      );
      expect(titles).toEqual(['Menu', 'Group']);
    });

    it('renders a badge for menu items that have one', () => {
      const badge = fixture.nativeElement.querySelector('.sic-sidebar__badge');
      expect(badge.textContent.trim()).toBe('12');
    });

    it('renders a color dot and chevron for list-variant items instead of an icon/badge', () => {
      const dot = fixture.nativeElement.querySelector('.sic-sidebar__dot');
      expect(dot.style.background).toBeTruthy();
      expect(fixture.nativeElement.querySelector('.sic-sidebar__chevron')).toBeTruthy();
    });

    it('marks the item matching activeLink as active', () => {
      fixture.componentRef.setInput('activeLink', '/task');
      fixture.detectChanges();

      const active = fixture.nativeElement.querySelectorAll('.sic-sidebar__link--active');
      expect(active.length).toBe(1);
      expect(active[0].textContent).toContain('Task');
    });

    it('emits itemSelect for a leaf item', () => {
      const spy = vi.fn();
      component.itemSelect.subscribe(spy);

      links()[1].click();

      expect(spy).toHaveBeenCalledWith(sections[0].items[1]);
    });
  });

  describe('auto-expanding the ancestor submenu of activeLink', () => {
    const nestedSections: SicSidebarSection[] = [
      {
        title: 'Menu',
        items: [
          {
            label: 'Settings',
            icon: '⚙️',
            children: [
              {
                label: 'Account',
                children: [{ label: 'Security', link: '/settings/account/security' }],
              },
            ],
          },
        ],
      },
    ];

    function labelText(): string[] {
      return Array.from(fixture.nativeElement.querySelectorAll('.sic-sidebar__label')).map((el: any) =>
        el.textContent.trim(),
      );
    }

    it('expands every closed ancestor submenu so a deep-linked activeLink is revealed', () => {
      fixture.componentRef.setInput('sections', nestedSections);
      fixture.componentRef.setInput('activeLink', '/settings/account/security');
      fixture.detectChanges();

      expect(labelText()).toEqual(['Settings', 'Account', 'Security']);
      expect(fixture.nativeElement.querySelector('.sic-sidebar__link--active').textContent).toContain('Security');
    });

    it('supports nesting to any depth, not just 3 levels', () => {
      fixture.componentRef.setInput('sections', [
        {
          items: [
            { label: 'L1', children: [{ label: 'L2', children: [{ label: 'L3', children: [{ label: 'L4', link: '/l1/l2/l3/l4' }] }] }] },
          ],
        },
      ]);
      fixture.componentRef.setInput('activeLink', '/l1/l2/l3/l4');
      fixture.detectChanges();

      expect(labelText()).toEqual(['L1', 'L2', 'L3', 'L4']);
      expect(fixture.nativeElement.querySelector('.sic-sidebar__link--active').textContent).toContain('L4');
    });

    it('re-expands ancestors when activeLink changes to a different deep item later', () => {
      fixture.componentRef.setInput('sections', [
        ...nestedSections,
        { items: [{ label: 'Other', children: [{ label: 'Deep other', link: '/other/deep' }] }] },
      ]);
      fixture.componentRef.setInput('activeLink', '/settings/account/security');
      fixture.detectChanges();
      expect(labelText()).toContain('Security');

      fixture.componentRef.setInput('activeLink', '/other/deep');
      fixture.detectChanges();

      expect(labelText()).toContain('Deep other');
    });

    it('does nothing when activeLink is not set', () => {
      fixture.componentRef.setInput('sections', nestedSections);
      fixture.detectChanges();

      expect(labelText()).toEqual(['Settings']);
    });
  });

  describe('collapsed state', () => {
    beforeEach(() => {
      component.sections = [{ title: 'Menu', items: [{ label: 'Home', icon: '🏠' }] }];
      component.collapsed = true;
      fixture.detectChanges();
    });

    it('hides section titles and labels, but keeps the icon', () => {
      expect(fixture.nativeElement.querySelector('.sic-sidebar__section-title')).toBeNull();
      expect(fixture.nativeElement.querySelector('.sic-sidebar__label')).toBeNull();
      expect(fixture.nativeElement.querySelector('.sic-sidebar__icon')).toBeTruthy();
    });

    it('sets a title attribute on the link for a tooltip', () => {
      expect(links()[0].getAttribute('title')).toBe('Home');
    });
  });

  it('toggles collapsed and emits collapsedChange', () => {
    fixture.detectChanges();
    const spy = vi.fn();
    component.collapsedChange.subscribe(spy);

    fixture.nativeElement.querySelector('.sic-sidebar__toggle').click();

    expect(spy).toHaveBeenCalledWith(true);
    expect(component.collapsed).toBe(true);
  });

  it('hides the built-in toggle button when showToggle is false, for an external control (e.g. a navbar hamburger) to drive collapsed instead', () => {
    fixture.componentRef.setInput('showToggle', false);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.sic-sidebar__toggle')).toBeNull();

    fixture.componentRef.setInput('collapsed', true);
    fixture.detectChanges();
    expect(fixture.nativeElement.classList.contains('sic-sidebar--collapsed')).toBe(true);
  });

  it('renders no header row at all when neither logo nor brand is set (avoids a blank padded gap)', () => {
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.sic-sidebar__header')).toBeNull();
  });

  it('renders the header row once logo or brand is set', () => {
    fixture.componentRef.setInput('logo', '🐙');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.sic-sidebar__header')).toBeTruthy();
  });

  describe(`collapseMode="hidden"`, () => {
    it('adds the hide-collapsed host class', () => {
      fixture.componentRef.setInput('collapseMode', 'hidden');
      fixture.detectChanges();

      expect(fixture.nativeElement.classList.contains('sic-sidebar--hide-collapsed')).toBe(true);
    });

    it('does not add the hide-collapsed class in the default "rail" mode', () => {
      fixture.detectChanges();
      expect(fixture.nativeElement.classList.contains('sic-sidebar--hide-collapsed')).toBe(false);
    });
  });

  // The search box, theme toggle, and user card have no built-in UI anymore — a custom
  // sicSidebarSubheader/sicSidebarFooter template is required to render one (see the "slot
  // overrides" describe block below). These verify the underlying state/behavior that such a
  // custom template would bind to (search/searchChange, darkMode/darkModeChange, user/userAction).
  it('emits searchChange and updates search via handleSearchInput', () => {
    const spy = vi.fn();
    component.searchChange.subscribe(spy);

    component.handleSearchInput('files');

    expect(spy).toHaveBeenCalledWith('files');
    expect(component.search).toBe('files');
  });

  describe('setDarkMode', () => {
    it('emits darkModeChange when switching to a new value', () => {
      const spy = vi.fn();
      component.darkModeChange.subscribe(spy);

      component.setDarkMode(true);

      expect(spy).toHaveBeenCalledWith(true);
      expect(component.darkMode).toBe(true);
    });

    it('does not re-emit when already set to that value', () => {
      fixture.componentRef.setInput('darkMode', true);
      const spy = vi.fn();
      component.darkModeChange.subscribe(spy);

      component.setDarkMode(true);

      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe('handleUserAction', () => {
    const user: SicSidebarUser = { name: 'Web Monster', email: 'web@monster.com' };

    it('emits userAction with the current user', () => {
      component.user = user;
      const spy = vi.fn();
      component.userAction.subscribe(spy);

      component.handleUserAction();

      expect(spy).toHaveBeenCalledWith(user);
    });

    it('does nothing when there is no user', () => {
      const spy = vi.fn();
      component.userAction.subscribe(spy);

      component.handleUserAction();

      expect(spy).not.toHaveBeenCalled();
    });
  });

  it('exposes accentColor as the --sic-sidebar-accent CSS variable', () => {
    component.accentColor = '#ef4444';
    fixture.detectChanges();

    expect(fixture.nativeElement.style.getPropertyValue('--sic-sidebar-accent')).toBe('#ef4444');
  });

  describe('hover-to-peek while collapsed', () => {
    beforeEach(() => {
      component.sections = [
        {
          title: 'Menu',
          items: [{ label: 'Home', icon: '🏠', children: [{ label: 'Sub', children: [{ label: 'Deep' }] }] }],
        },
      ];
      component.collapsed = true;
      fixture.detectChanges();
    });

    it('flares open (labels + peek class) on mouseenter and snaps back on mouseleave after the close-delay', () => {
      vi.useFakeTimers();
      try {
        expect(fixture.nativeElement.classList.contains('sic-sidebar--peek')).toBe(false);
        expect(fixture.nativeElement.querySelector('.sic-sidebar__label')).toBeNull();

        fixture.nativeElement.dispatchEvent(new MouseEvent('mouseenter'));
        fixture.detectChanges();

        expect(fixture.nativeElement.classList.contains('sic-sidebar--peek')).toBe(true);
        expect(fixture.nativeElement.querySelector('.sic-sidebar__label').textContent).toBe('Home');
        expect(component.collapsed).toBe(true);

        fixture.nativeElement.dispatchEvent(new MouseEvent('mouseleave'));
        fixture.detectChanges();

        // Still peeking immediately after mouseleave — the close is debounced.
        expect(fixture.nativeElement.classList.contains('sic-sidebar--peek')).toBe(true);

        vi.advanceTimersByTime(120);
        fixture.detectChanges();

        expect(fixture.nativeElement.classList.contains('sic-sidebar--peek')).toBe(false);
        expect(fixture.nativeElement.querySelector('.sic-sidebar__label')).toBeNull();
      } finally {
        vi.useRealTimers();
      }
    });

    it('absorbs a spurious mouseleave immediately followed by mouseenter without ever closing (debounce)', () => {
      vi.useFakeTimers();
      try {
        fixture.nativeElement.dispatchEvent(new MouseEvent('mouseenter'));
        fixture.detectChanges();
        expect(fixture.nativeElement.classList.contains('sic-sidebar--peek')).toBe(true);

        fixture.nativeElement.dispatchEvent(new MouseEvent('mouseleave'));
        fixture.nativeElement.dispatchEvent(new MouseEvent('mouseenter'));
        vi.advanceTimersByTime(120);
        fixture.detectChanges();

        expect(fixture.nativeElement.classList.contains('sic-sidebar--peek')).toBe(true);
      } finally {
        vi.useRealTimers();
      }
    });

    it('shows arbitrarily nested children while peeking, once expanded', () => {
      fixture.nativeElement.dispatchEvent(new MouseEvent('mouseenter'));
      fixture.detectChanges();

      links()[0].click();
      fixture.detectChanges();
      const subLink = fixture.nativeElement.querySelectorAll('.sic-sidebar__children .sic-sidebar__link')[0];
      subLink.click();
      fixture.detectChanges();

      const labels = Array.from(fixture.nativeElement.querySelectorAll('.sic-sidebar__label')).map((el: any) =>
        el.textContent.trim(),
      );
      expect(labels).toEqual(['Home', 'Sub', 'Deep']);
    });

    it('does not peek when the sidebar is not collapsed', () => {
      fixture.componentRef.setInput('collapsed', false);
      fixture.detectChanges();

      fixture.nativeElement.dispatchEvent(new MouseEvent('mouseenter'));
      fixture.detectChanges();

      expect(fixture.nativeElement.classList.contains('sic-sidebar--peek')).toBe(false);
    });
  });
});

@Component({
  standalone: true,
  imports: [
    SicSidebarComponent,
    SicSidebarHeaderDirective,
    SicSidebarSubheaderDirective,
    SicSidebarMenuDirective,
    SicSidebarFooterDirective,
  ],
  template: `
    <sic-sidebar [collapsed]="collapsed">
      <ng-template sicSidebarHeader let-expanded="expanded">Custom header ({{ expanded ? 'open' : 'icon' }})</ng-template>
      <ng-template sicSidebarSubheader>Custom subheader</ng-template>
      <ng-template sicSidebarMenu>Custom menu</ng-template>
      <ng-template sicSidebarFooter let-sidebar>
        <button type="button" class="custom-footer-btn" (click)="sidebar.toggleCollapsed()">Custom footer</button>
      </ng-template>
    </sic-sidebar>
  `,
})
class SlotHostComponent {
  collapsed = false;
}

describe('SicSidebarComponent slot overrides', () => {
  let hostFixture: ComponentFixture<SlotHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [SlotHostComponent] }).compileComponents();
    hostFixture = TestBed.createComponent(SlotHostComponent);
    hostFixture.detectChanges();
  });

  function text(selector: string): string {
    return hostFixture.nativeElement.querySelector(selector).textContent.trim();
  }

  it('renders projected header/subheader/menu/footer templates instead of the defaults, passing the expanded flag', () => {
    const root: HTMLElement = hostFixture.nativeElement;
    expect(root.querySelector('.sic-sidebar__header')).toBeNull();
    expect(root.querySelector('.sic-sidebar__search')).toBeNull();
    expect(root.querySelector('.sic-sidebar__nav')).toBeNull();
    expect(root.querySelector('.sic-sidebar__footer')).toBeNull();

    expect(root.textContent).toContain('Custom header (open)');
    expect(root.textContent).toContain('Custom subheader');
    expect(root.textContent).toContain('Custom menu');
    expect(root.textContent).toContain('Custom footer');
  });

  it('exposes the sidebar instance as $implicit so a custom footer can call component methods', () => {
    hostFixture.nativeElement.querySelector('.custom-footer-btn').click();
    hostFixture.detectChanges();

    expect(hostFixture.componentInstance.collapsed).toBe(false);
    const sidebarEl: HTMLElement = hostFixture.nativeElement.querySelector('sic-sidebar');
    expect(sidebarEl.classList.contains('sic-sidebar--collapsed')).toBe(true);
  });
});
