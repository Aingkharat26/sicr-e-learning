import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SicALinkComponent } from './sic-a-link.component';

describe('SicALinkComponent', () => {
  let fixture: ComponentFixture<SicALinkComponent>;
  let component: SicALinkComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [SicALinkComponent] }).compileComponents();
    fixture = TestBed.createComponent(SicALinkComponent);
    component = fixture.componentInstance;
  });

  function link(): HTMLAnchorElement {
    return fixture.nativeElement.querySelector('.sic-button');
  }

  it('renders a real <a> with the given href, styled with the same classes as sic-button', () => {
    fixture.componentRef.setInput('href', '/pricing');
    fixture.detectChanges();

    expect(link().tagName).toBe('A');
    expect(link().getAttribute('href')).toBe('/pricing');
    expect(link().classList).toContain('sic-button--solid');
    expect(link().classList).toContain('sic-button--primary');
    expect(link().classList).toContain('sic-button--sm');
  });

  it('auto-adds rel="noopener noreferrer" when target="_blank" and no explicit rel is set', () => {
    fixture.componentRef.setInput('href', 'https://example.com');
    fixture.componentRef.setInput('target', '_blank');
    fixture.detectChanges();

    expect(link().getAttribute('rel')).toBe('noopener noreferrer');
  });

  it('lets an explicit rel override the target="_blank" default', () => {
    fixture.componentRef.setInput('href', 'https://example.com');
    fixture.componentRef.setInput('target', '_blank');
    fixture.componentRef.setInput('rel', 'nofollow');
    fixture.detectChanges();

    expect(link().getAttribute('rel')).toBe('nofollow');
  });

  it('omits href, adds aria-disabled/tabindex=-1, and prevents navigation on click when disabled', () => {
    fixture.componentRef.setInput('href', '/pricing');
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();

    expect(link().getAttribute('href')).toBeNull();
    expect(link().getAttribute('aria-disabled')).toBe('true');
    expect(link().getAttribute('tabindex')).toBe('-1');

    const event = new MouseEvent('click', { cancelable: true });
    link().dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
  });

  it('sets a bare download attribute for download=true, or the given filename for a string', () => {
    fixture.componentRef.setInput('href', '/file.pdf');
    fixture.componentRef.setInput('download', true);
    fixture.detectChanges();
    expect(link().getAttribute('download')).toBe('');

    fixture.componentRef.setInput('download', 'report.pdf');
    fixture.detectChanges();
    expect(link().getAttribute('download')).toBe('report.pdf');
  });
});
