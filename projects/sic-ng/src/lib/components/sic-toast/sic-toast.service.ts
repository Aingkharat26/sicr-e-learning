import { Injectable, signal } from '@angular/core';

export type SicToastType = 'info' | 'success' | 'danger' | 'warning' | 'neutral';
export type SicToastPosition =
  | 'top-right'
  | 'top-left'
  | 'bottom-right'
  | 'bottom-left'
  | 'top-center'
  | 'bottom-center';

/** One of the built-in icons, `false` to hide the icon entirely, or any other string (e.g. an emoji) to show as-is. */
export type SicToastIcon = 'success' | 'danger' | 'warning' | 'info' | false | string;

export interface SicToastBadge {
  text: string;
  /** Rendered inside the badge's dot. Defaults to a plain colored dot. */
  icon?: string;
}

export interface SicToastOptions {
  /** Bold heading. Falls back to `message` alone (no heading) when omitted. */
  title?: string;
  message: string;
  type?: SicToastType;
  duration?: number;
  /** Overrides the icon normally implied by `type`. */
  icon?: SicToastIcon;
  /** A right-aligned pill, e.g. `{ text: '+500' }` for a reward-style toast. */
  badge?: SicToastBadge;
}

export interface SicToast {
  id: number;
  title?: string;
  message: string;
  type: SicToastType;
  duration: number;
  icon?: SicToastIcon;
  badge?: SicToastBadge;
}

let nextId = 1;

@Injectable({
  providedIn: 'root',
})
export class SicToastService {
  readonly toasts = signal<SicToast[]>([]);

  /** Quick form: `show('Saved', 'success')`. For a title, icon override, or badge, pass a `SicToastOptions` object instead. */
  show(message: string, type?: SicToastType, duration?: number): number;
  show(options: SicToastOptions): number;
  show(messageOrOptions: string | SicToastOptions, type: SicToastType = 'info', duration = 3500): number {
    const options: SicToastOptions =
      typeof messageOrOptions === 'string' ? { message: messageOrOptions, type, duration } : messageOrOptions;

    const toast: SicToast = {
      id: nextId++,
      title: options.title,
      message: options.message,
      type: options.type ?? 'info',
      duration: options.duration ?? 3500,
      icon: options.icon,
      badge: options.badge,
    };

    this.toasts.update((list) => [...list, toast]);

    if (toast.duration > 0) {
      setTimeout(() => this.dismiss(toast.id), toast.duration);
    }

    return toast.id;
  }

  dismiss(id: number): void {
    this.toasts.update((list) => list.filter((t) => t.id !== id));
  }

  clear(): void {
    this.toasts.set([]);
  }
}
