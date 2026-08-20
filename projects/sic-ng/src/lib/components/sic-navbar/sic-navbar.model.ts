export interface SicNavbarMenuItem {
  label: string;
  icon?: string;
  action?: string;
}

export interface SicNavbarUser {
  name: string;
  email: string;
  avatarUrl?: string;
}

export interface SicNavbarNotification {
  id: string | number;
  /** e.g. "requests permission to change" */
  message: string;
  /** Bold lead-in name shown before `message`, e.g. "Terry Franci". */
  actor?: string;
  /** Bold phrase shown after `message`, e.g. "Project - Nganter App". */
  target?: string;
  /** e.g. "Project" — shown before `time` in the meta line. */
  category?: string;
  /** e.g. "5 min ago" */
  time?: string;
  avatarUrl?: string;
  /** Falls back to a plain icon/initial when there's no avatarUrl. */
  icon?: string;
  status?: 'online' | 'offline' | 'busy' | 'away';
  read?: boolean;
}
