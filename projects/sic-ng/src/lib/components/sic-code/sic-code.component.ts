import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ChangeDetectorRef, Component, HostBinding, Input, OnChanges, PLATFORM_ID, SimpleChanges, inject } from '@angular/core';
import { injectSicConfig } from '../../config/sic-config';
import { SicCodeLanguage, SicCodeToken, tokenizeCode } from './sic-code-highlight';

const COPIED_RESET_MS = 1500;

/**
 * Read-only code block: line numbers (toggleable via `[showLineNumbers]`), a copy-to-clipboard
 * button, and lightweight syntax highlighting (no external dependency) for
 * typescript/javascript/html/css/json/bash — colored close to a typical Prettier-formatted
 * VSCode theme, light and dark.
 */
@Component({
  selector: 'sic-code',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sic-code.component.html',
  styleUrl: './sic-code.component.css',
})
export class SicCodeComponent implements OnChanges {
  private readonly sicConfig = injectSicConfig();
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly cdr = inject(ChangeDetectorRef);

  @Input() code = '';
  @Input() language: SicCodeLanguage = 'plaintext';
  @Input() showLineNumbers = true;
  @Input() showCopyButton = true;

  @HostBinding('class.sic-code-host') readonly hostClass = true;

  lines: SicCodeToken[][] = [];
  justCopied = false;

  private copyResetTimer?: ReturnType<typeof setTimeout>;

  get copyText(): string {
    return this.sicConfig.messages?.codeCopy ?? 'Copy';
  }

  get copiedText(): string {
    return this.sicConfig.messages?.codeCopied ?? 'Copied';
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['code'] || changes['language']) {
      this.lines = tokenizeCode(this.code, this.language);
    }
  }

  async copy(): Promise<void> {
    if (!this.isBrowser || typeof navigator === 'undefined' || !navigator.clipboard) {
      return;
    }

    await navigator.clipboard.writeText(this.code);

    this.justCopied = true;
    clearTimeout(this.copyResetTimer);
    this.copyResetTimer = setTimeout(() => {
      this.justCopied = false;
      this.cdr.markForCheck();
    }, COPIED_RESET_MS);
  }
}
