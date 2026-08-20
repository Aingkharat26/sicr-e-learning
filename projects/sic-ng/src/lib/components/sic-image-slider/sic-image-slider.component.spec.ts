import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SicImageSliderComponent } from './sic-image-slider.component';
import { SicImageSliderItem } from './sic-image-slider.model';

const items: SicImageSliderItem[] = [
  { id: 1, imageUrl: 'https://example.com/1.jpg', caption: 'One' },
  { id: 2, imageUrl: 'https://example.com/2.jpg', caption: 'Two' },
  { id: 3, imageUrl: 'https://example.com/3.jpg', caption: 'Three' },
];

describe('SicImageSliderComponent', () => {
  let fixture: ComponentFixture<SicImageSliderComponent>;
  let component: SicImageSliderComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [SicImageSliderComponent] }).compileComponents();
    fixture = TestBed.createComponent(SicImageSliderComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('items', items);
    fixture.detectChanges();
  });

  function track(): HTMLElement {
    return fixture.nativeElement.querySelector('.sic-image-slider__track');
  }

  function dots(): HTMLElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll('.sic-image-slider__dot'));
  }

  it('renders one slide per item and translates the track to the active index', () => {
    expect(fixture.nativeElement.querySelectorAll('.sic-image-slider__slide').length).toBe(3);
    expect(track().style.transform).toBe('translateX(0%)');

    fixture.nativeElement.querySelector('.sic-image-slider__arrow--next').click();
    fixture.detectChanges();

    expect(track().style.transform).toBe('translateX(-100%)');
  });

  it('renders one dot per item, marking the active one', () => {
    expect(dots().length).toBe(3);
    expect(dots()[0].classList).toContain('sic-image-slider__dot--active');
    expect(dots()[1].classList).not.toContain('sic-image-slider__dot--active');
  });

  it('hides arrows via [showArrows] and dots via [showDots]', () => {
    fixture.componentRef.setInput('showArrows', false);
    fixture.componentRef.setInput('showDots', false);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.sic-image-slider__arrow')).toBeNull();
    expect(fixture.nativeElement.querySelector('.sic-image-slider__dots')).toBeNull();
  });

  it('clicking a dot navigates to that slide and emits activeIndexChange/slideChange', () => {
    const indexSpy = vi.fn();
    const changeSpy = vi.fn();
    component.activeIndexChange.subscribe(indexSpy);
    component.slideChange.subscribe(changeSpy);

    dots()[2].click();
    fixture.detectChanges();

    expect(indexSpy).toHaveBeenCalledWith(2);
    expect(changeSpy).toHaveBeenCalledWith({ index: 2, item: items[2] });
    expect(component.activeIndex).toBe(2);
  });

  it('wraps from the last slide to the first on next(), and vice versa on prev()', () => {
    component.goTo(2);
    fixture.detectChanges();

    fixture.nativeElement.querySelector('.sic-image-slider__arrow--next').click();
    fixture.detectChanges();
    expect(component.activeIndex).toBe(0);

    fixture.nativeElement.querySelector('.sic-image-slider__arrow--prev').click();
    fixture.detectChanges();
    expect(component.activeIndex).toBe(2);
  });

  it('does not wrap when loop is false', () => {
    fixture.componentRef.setInput('loop', false);
    component.goTo(2);
    fixture.detectChanges();

    fixture.nativeElement.querySelector('.sic-image-slider__arrow--next').click();
    fixture.detectChanges();
    expect(component.activeIndex).toBe(2);

    component.goTo(0);
    fixture.detectChanges();
    fixture.nativeElement.querySelector('.sic-image-slider__arrow--prev').click();
    fixture.detectChanges();
    expect(component.activeIndex).toBe(0);
  });

  it('emits slideEnd when the last slide becomes active, but not otherwise', () => {
    const spy = vi.fn();
    component.slideEnd.subscribe(spy);

    component.goTo(1);
    expect(spy).not.toHaveBeenCalled();

    component.goTo(2);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('renders the default caption when no #slideTemplate is projected', () => {
    expect(fixture.nativeElement.querySelector('.sic-image-slider__caption')?.textContent).toBe('One');
  });

  it('auto-advances on a timer when autoSlide is true, and pauses on hover', () => {
    vi.useFakeTimers();
    try {
      fixture.componentRef.setInput('autoSlide', true);
      fixture.componentRef.setInput('autoSlideInterval', 1000);
      fixture.detectChanges();

      vi.advanceTimersByTime(1000);
      fixture.detectChanges();
      expect(component.activeIndex).toBe(1);

      fixture.nativeElement.dispatchEvent(new MouseEvent('mouseenter'));
      vi.advanceTimersByTime(5000);
      fixture.detectChanges();
      expect(component.activeIndex).toBe(1); // paused, no further advance

      fixture.nativeElement.dispatchEvent(new MouseEvent('mouseleave'));
      vi.advanceTimersByTime(1000);
      fixture.detectChanges();
      expect(component.activeIndex).toBe(2);
    } finally {
      vi.useRealTimers();
    }
  });

  it('shows the empty state when items is empty', () => {
    fixture.componentRef.setInput('items', []);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.sic-image-slider__empty')?.textContent).toBe('No items');
  });

  it('defaults to rounded="lg", and applies a matching modifier class to the viewport', () => {
    const viewport: HTMLElement = fixture.nativeElement.querySelector('.sic-image-slider__viewport');
    expect(viewport.classList.contains('sic-image-slider__viewport--lg')).toBe(true);
  });

  it('applies rounded="none" (no radius modifier class) when set', () => {
    fixture.componentRef.setInput('rounded', 'none');
    fixture.detectChanges();

    const viewport: HTMLElement = fixture.nativeElement.querySelector('.sic-image-slider__viewport');
    expect(viewport.classList.contains('sic-image-slider__viewport--none')).toBe(true);
    expect(viewport.className).not.toContain('--lg');
  });

  it('defaults --sic-image-slider-min-height to 0 (no floor under the aspect-ratio height)', () => {
    const host: HTMLElement = fixture.nativeElement;
    expect(host.style.getPropertyValue('--sic-image-slider-min-height')).toBe('0');
  });

  it('exposes [minHeight] as --sic-image-slider-min-height on the host, so a wide aspectRatio has a floor on narrow viewports', () => {
    fixture.componentRef.setInput('minHeight', '18rem');
    fixture.detectChanges();

    const host: HTMLElement = fixture.nativeElement;
    expect(host.style.getPropertyValue('--sic-image-slider-min-height')).toBe('18rem');
  });
});

describe('SicImageSliderComponent custom template', () => {
  @Component({
    standalone: true,
    imports: [SicImageSliderComponent],
    template: `
      <sic-image-slider [items]="items">
        <ng-template #slideTemplate let-item let-index="index">
          <span class="custom-overlay">{{ item.caption }} #{{ index }}</span>
        </ng-template>
      </sic-image-slider>
    `,
  })
  class TemplateHostComponent {
    items: SicImageSliderItem[] = [
      { id: 1, imageUrl: 'a.jpg', caption: 'A' },
      { id: 2, imageUrl: 'b.jpg', caption: 'B' },
    ];
  }

  it('renders the projected #slideTemplate on top of the image instead of the default caption', () => {
    TestBed.configureTestingModule({ imports: [TemplateHostComponent] });
    const fixture = TestBed.createComponent(TemplateHostComponent);
    fixture.detectChanges();

    const overlays = fixture.nativeElement.querySelectorAll('.custom-overlay');
    expect(overlays.length).toBe(2);
    expect(overlays[0].textContent).toBe('A #0');
    expect(fixture.nativeElement.querySelectorAll('.sic-image-slider__image').length).toBe(2);
    expect(fixture.nativeElement.querySelector('.sic-image-slider__caption')).toBeNull();
  });
});
