import { CommonModule } from '@angular/common';
import { Component, HostBinding, Input, OnChanges, SimpleChanges } from '@angular/core';
import { SicSkeletonComponent } from '../sic-skeleton/sic-skeleton.component';

export type SicImageMode = 'sync' | 'async';
export type SicImageAsyncStrategy = 'progressive' | 'skeleton';

@Component({
  selector: 'sic-image',
  standalone: true,
  imports: [CommonModule, SicSkeletonComponent],
  templateUrl: './sic-image.component.html',
  styleUrl: './sic-image.component.css',
})
export class SicImageComponent implements OnChanges {
  @Input({ required: true }) src!: string;
  @Input() alt = '';
  @Input() fallback = '';
  @Input() loading: 'lazy' | 'eager' = 'lazy';
  @Input() rounded: 'none' | 'sm' | 'md' | 'lg' | 'full' = 'none';
  /** Grayscale + dimmed at rest, full color on hover — a common "trust bar"/partner-logo touch. */
  @Input() grayscaleHover = false;

  @Input() width?: number | string;
  @Input() height?: number | string;

  /** `sync` renders the `<img>` immediately. `async` defers reveal until the full image finishes loading. */
  @Input() mode: SicImageMode = 'sync';
  /**
   * Only applies when `mode="async"`.
   * - `progressive`: show a small/blurred placeholder first, then swap to the full image once it loads.
   * - `skeleton`: show a shimmering placeholder until the full image loads, then reveal it.
   */
  @Input() asyncStrategy: SicImageAsyncStrategy = 'skeleton';
  /** Explicit low-res URL for the `progressive` strategy. Defaults to `src` requested at `lowResWidth`. */
  @Input() lowResSrc = '';
  /** Width requested for the auto-generated low-res placeholder when `lowResSrc` isn't set. */
  @Input() lowResWidth = 24;

  /** Append `width`/`height` as query params onto the resolved image URL, for CDNs that resize on request. */
  @Input() appendSizeToUrl = true;
  @Input() widthParam = 'w';
  @Input() heightParam = 'h';

  @HostBinding('class.sic-image-host') readonly hostClass = true;
  @HostBinding('class.sic-image-host--grayscale-hover') get isGrayscaleHover(): boolean {
    return this.grayscaleHover;
  }

  errored = false;
  loaded = false;
  private lowResErrored = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['src']) {
      this.errored = false;
      this.loaded = false;
      this.lowResErrored = false;
    }
  }

  get resolvedSrc(): string {
    const base = this.errored && this.fallback ? this.fallback : this.src;
    return this.buildUrl(base, this.width, this.height);
  }

  get resolvedLowResSrc(): string {
    if (this.lowResErrored) return this.resolvedSrc;
    if (this.lowResSrc) return this.lowResSrc;
    const base = this.errored && this.fallback ? this.fallback : this.src;
    return this.buildUrl(base, this.lowResWidth, undefined);
  }

  get hostWidthStyle(): string | undefined {
    return this.width === undefined ? undefined : toCssSize(this.width);
  }

  get hostHeightStyle(): string | undefined {
    return this.height === undefined ? undefined : toCssSize(this.height);
  }

  handleError(): void {
    this.errored = true;
    this.loaded = false;
  }

  handleLowResError(): void {
    this.lowResErrored = true;
  }

  handleLoad(): void {
    this.loaded = true;
  }

  private buildUrl(src: string, width?: number | string, height?: number | string): string {
    if (!src || !this.appendSizeToUrl || (width === undefined && height === undefined)) return src;
    try {
      const isAbsolute = /^[a-z][a-z0-9+.-]*:/i.test(src) || src.startsWith('//');
      const url = isAbsolute ? new URL(src) : new URL(src, 'http://sic-ng.local/');
      if (width !== undefined) url.searchParams.set(this.widthParam, String(width));
      if (height !== undefined) url.searchParams.set(this.heightParam, String(height));
      return isAbsolute ? url.toString() : `${url.pathname}${url.search}${url.hash}`;
    } catch {
      return src;
    }
  }
}

function toCssSize(value: number | string): string {
  return typeof value === 'number' ? `${value}px` : value;
}
