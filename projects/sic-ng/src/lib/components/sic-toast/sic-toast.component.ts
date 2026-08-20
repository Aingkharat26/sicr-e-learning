import { CommonModule } from '@angular/common';
import { Component, HostBinding, Input, inject } from '@angular/core';
import { SicToast, SicToastIcon, SicToastPosition, SicToastService } from './sic-toast.service';

const BUILTIN_ICON_KEYS = ['success', 'danger', 'warning', 'info'] as const;
type SicToastBuiltinIcon = (typeof BUILTIN_ICON_KEYS)[number];

@Component({
  selector: 'sic-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sic-toast.component.html',
  styleUrl: './sic-toast.component.css',
})
export class SicToastComponent {
  @Input() position: SicToastPosition = 'top-right';

  readonly toastService = inject(SicToastService);

  @HostBinding('class') get hostClasses() {
    return `sic-toast-host sic-toast--${this.position}`;
  }

  dismiss(id: number): void {
    this.toastService.dismiss(id);
  }

  /** `undefined` on the toast means "use the type's default icon" — `neutral` has none. */
  resolvedIcon(toast: SicToast): SicToastIcon {
    if (toast.icon !== undefined) {
      return toast.icon;
    }
    return toast.type === 'neutral' ? false : toast.type;
  }

  isBuiltinIcon(icon: SicToastIcon): icon is SicToastBuiltinIcon {
    return typeof icon === 'string' && (BUILTIN_ICON_KEYS as readonly string[]).includes(icon);
  }
}
