import { CommonModule, isPlatformBrowser } from '@angular/common';
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
  PLATFORM_ID,
  SimpleChanges,
  TemplateRef,
  inject,
} from '@angular/core';
import { injectSicConfig } from '../../config/sic-config';
import { SicImageSliderItem } from './sic-image-slider.model';

/** Template context for `#slideTemplate`: `let-item let-index="index"`. Rendered on top of the slide's image — use it to add captions, badges, buttons, etc. */
export interface SicImageSliderContext<T> {
  $implicit: SicImageSliderItem<T>;
  index: number;
}

/**
 * A looping image carousel: prev/next arrows (`[showArrows]`, hideable), position dots
 * (`[showDots]`), optional auto-advance (`[autoSlide]` + `[autoSlideInterval]`, paused on hover),
 * and a `#slideTemplate` slot to overlay custom markup on each slide's image. Reaching past the
 * last slide (via arrows, dots, or auto-slide) wraps back to the first, and vice versa, unless
 * `[loop]` is set false.
 */
@Component({
  selector: 'sic-image-slider',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sic-image-slider.component.html',
  styleUrl: './sic-image-slider.component.css',
})
export class SicImageSliderComponent<T = unknown> implements OnChanges, OnDestroy {
  private readonly sicConfig = injectSicConfig();
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly cdr = inject(ChangeDetectorRef);

  @Input() items: SicImageSliderItem<T>[] = [];
  @Input() activeIndex = 0;
  /** Width/height ratio for the slider, as a CSS `aspect-ratio` value (e.g. `'16 / 9'`, `'1 / 1'`). Width always fills the container; height is derived from this ratio. Default: `'16 / 9'`. */
  @Input() aspectRatio = '16 / 9';
  /**
   * CSS `min-height` value (e.g. `'16rem'`) — a floor under the `aspectRatio`-computed height, so a
   * wide ratio (e.g. `'21 / 9'`) doesn't collapse into a too-short box on a narrow viewport where
   * overlaid content (via `#slideTemplate`) would otherwise overflow it. Unset by default.
   */
  @Input() minHeight?: string;
  /** Corner radius, matching sic-image's scale. Default: `'lg'`. */
  @Input() rounded: 'none' | 'sm' | 'md' | 'lg' | 'full' = 'lg';
  /** Shows/hides the prev/next arrow buttons. Default: true. */
  @Input() showArrows = true;
  /** Shows/hides the position dots. Default: true. */
  @Input() showDots = true;
  /** Wraps from the last slide back to the first (and vice versa) instead of stopping. Default: true. */
  @Input() loop = true;
  /** Automatically advances to the next slide. Default: false. */
  @Input() autoSlide = false;
  /** Milliseconds between auto-slide advances. Default: 4000. */
  @Input() autoSlideInterval = 4000;
  /** Pauses auto-slide while the pointer is over the slider. Default: true. */
  @Input() pauseOnHover = true;
  /**
   * Wraps `#slideTemplate`'s projected content in an absolutely-positioned dark gradient scrim
   * (heavier at the bottom), so light overlay text/buttons stay readable regardless of the
   * underlying slide image — set this instead of hand-rolling the same overlay CSS outside.
   */
  @Input() overlay = false;

  @Output() activeIndexChange = new EventEmitter<number>();
  /** Emits the new index and item whenever the active slide changes, for any reason (arrows, dots, or auto-slide). */
  @Output() slideChange = new EventEmitter<{ index: number; item: SicImageSliderItem<T> }>();
  /** Emits whenever the last slide becomes active. */
  @Output() slideEnd = new EventEmitter<void>();

  /** `<ng-template #slideTemplate let-item let-index="index">` overlays custom markup on top of each slide's image. */
  @ContentChild('slideTemplate') slideTemplate?: TemplateRef<SicImageSliderContext<T>>;

  @HostBinding('class.sic-image-slider-host') readonly hostClass = true;
  @HostBinding('style.--sic-image-slider-aspect-ratio') get aspectRatioVar(): string {
    return this.aspectRatio;
  }
  @HostBinding('style.--sic-image-slider-min-height') get minHeightVar(): string {
    return this.minHeight ?? '0';
  }

  private timer?: ReturnType<typeof setInterval>;
  private hoverPaused = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['items'] && this.activeIndex >= this.items.length) {
      this.activeIndex = 0;
    }

    if (changes['autoSlide'] || changes['autoSlideInterval'] || changes['items']) {
      this.restartAutoSlide();
    }
  }

  ngOnDestroy(): void {
    this.stopAutoSlide();
  }

  get noItemsText(): string {
    return this.sicConfig.messages?.noItems ?? 'No items';
  }

  trackByFn = (index: number, item: SicImageSliderItem<T>): unknown => item.id ?? index;

  next(): void {
    if (!this.items.length) {
      return;
    }

    if (this.activeIndex >= this.items.length - 1) {
      if (this.loop) {
        this.goTo(0);
      }
      return;
    }

    this.goTo(this.activeIndex + 1);
  }

  prev(): void {
    if (!this.items.length) {
      return;
    }

    if (this.activeIndex <= 0) {
      if (this.loop) {
        this.goTo(this.items.length - 1);
      }
      return;
    }

    this.goTo(this.activeIndex - 1);
  }

  goTo(index: number): void {
    if (index < 0 || index >= this.items.length || index === this.activeIndex) {
      return;
    }

    this.activeIndex = index;
    this.activeIndexChange.emit(index);
    this.slideChange.emit({ index, item: this.items[index] });
    if (index === this.items.length - 1) {
      this.slideEnd.emit();
    }
    this.cdr.markForCheck();
  }

  @HostListener('mouseenter')
  onMouseEnter(): void {
    if (!this.pauseOnHover) {
      return;
    }
    this.hoverPaused = true;
    this.stopAutoSlide();
  }

  @HostListener('mouseleave')
  onMouseLeave(): void {
    if (!this.pauseOnHover) {
      return;
    }
    this.hoverPaused = false;
    this.restartAutoSlide();
  }

  private restartAutoSlide(): void {
    this.stopAutoSlide();
    if (this.autoSlide && this.isBrowser && !this.hoverPaused && this.items.length > 1) {
      this.timer = setInterval(() => this.next(), Math.max(500, this.autoSlideInterval));
    }
  }

  private stopAutoSlide(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = undefined;
    }
  }
}
