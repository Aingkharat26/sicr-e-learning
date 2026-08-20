export interface SicSidebarItem {
  label: string;
  icon?: string;
  link?: string;
  /** Dot color for 'list' variant sections (e.g. a project/workspace color). */
  color?: string;
  /** Badge shown next to the label for 'menu' variant sections (e.g. an unread count). */
  badge?: string | number;
  badgeColor?: string;
  /** Nested submenu — items can nest their own `children` recursively with no depth limit. */
  children?: SicSidebarItem[];
}

export interface SicSidebarSection {
  title?: string;
  items: SicSidebarItem[];
  /** 'menu' (default): icon + label + badge. 'list': color dot + label + chevron. */
  variant?: 'menu' | 'list';
}

export interface SicSidebarUser {
  name: string;
  email: string;
  avatarUrl?: string;
}
