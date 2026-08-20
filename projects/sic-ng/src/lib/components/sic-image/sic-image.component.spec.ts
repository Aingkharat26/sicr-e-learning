import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SicImageComponent } from './sic-image.component';

describe('SicImageComponent', () => {
  let fixture: ComponentFixture<SicImageComponent>;
  let component: SicImageComponent;

  function img(selector = 'img'): HTMLImageElement {
    return fixture.nativeElement.querySelector(selector) as HTMLImageElement;
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SicImageComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SicImageComponent);
    component = fixture.componentInstance;
  });

  it('renders the src directly in sync mode', () => {
    component.src = 'https://example.com/photo.jpg';
    fixture.detectChanges();

    expect(img().src).toBe('https://example.com/photo.jpg');
  });

  it('falls back to the fallback URL after an error', () => {
    component.src = 'https://example.com/broken.jpg';
    component.fallback = 'https://example.com/fallback.jpg';
    fixture.detectChanges();

    img().dispatchEvent(new Event('error'));
    fixture.detectChanges();

    expect(img().src).toBe('https://example.com/fallback.jpg');
  });

  it('appends width/height as query params on the resolved URL', () => {
    component.src = 'https://example.com/photo.jpg';
    component.width = 320;
    component.height = 240;
    fixture.detectChanges();

    const url = new URL(img().src);
    expect(url.searchParams.get('w')).toBe('320');
    expect(url.searchParams.get('h')).toBe('240');
  });

  it('uses custom query param names when given', () => {
    component.src = 'https://example.com/photo.jpg';
    component.width = 100;
    component.widthParam = 'width';
    fixture.detectChanges();

    const url = new URL(img().src);
    expect(url.searchParams.get('width')).toBe('100');
  });

  it('does not append size params when appendSizeToUrl is false', () => {
    component.src = 'https://example.com/photo.jpg';
    component.width = 100;
    component.appendSizeToUrl = false;
    fixture.detectChanges();

    expect(img().src).toBe('https://example.com/photo.jpg');
  });

  it('keeps a relative src relative after appending size params', () => {
    component.src = '/images/photo.jpg';
    component.width = 50;
    fixture.detectChanges();

    expect(img().getAttribute('src')).toBe('/images/photo.jpg?w=50');
  });

  describe('async mode - skeleton strategy', () => {
    beforeEach(() => {
      component.src = 'https://example.com/photo.jpg';
      component.mode = 'async';
      component.asyncStrategy = 'skeleton';
      fixture.detectChanges();
    });

    it('shows a skeleton placeholder and a hidden full image until it loads', () => {
      expect(fixture.nativeElement.querySelector('sic-skeleton')).toBeTruthy();

      const fullImg = img();
      expect(fullImg.classList).toContain('sic-image__img--hidden');

      fullImg.dispatchEvent(new Event('load'));
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('sic-skeleton')).toBeFalsy();
      expect(fullImg.classList).not.toContain('sic-image__img--hidden');
    });
  });

  describe('async mode - progressive strategy', () => {
    beforeEach(() => {
      component.src = 'https://example.com/photo.jpg';
      component.mode = 'async';
      component.asyncStrategy = 'progressive';
      component.lowResWidth = 16;
      fixture.detectChanges();
    });

    it('shows a low-res placeholder first, then the full image once loaded', () => {
      const placeholder = img('.sic-image__img--placeholder');
      expect(placeholder).toBeTruthy();
      expect(new URL(placeholder.src).searchParams.get('w')).toBe('16');

      const fullImg = fixture.nativeElement.querySelector('img:not(.sic-image__img--placeholder)') as HTMLImageElement;
      fullImg.dispatchEvent(new Event('load'));
      fixture.detectChanges();

      expect(img('.sic-image__img--placeholder')).toBeFalsy();
    });
  });
});
