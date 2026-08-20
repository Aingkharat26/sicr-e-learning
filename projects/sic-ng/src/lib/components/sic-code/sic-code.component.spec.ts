import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SIC_CONFIG } from '../../config/sic-config';
import { SicCodeComponent } from './sic-code.component';

describe('SicCodeComponent', () => {
  let fixture: ComponentFixture<SicCodeComponent>;
  let component: SicCodeComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [SicCodeComponent] }).compileComponents();
    fixture = TestBed.createComponent(SicCodeComponent);
    component = fixture.componentInstance;
  });

  function lines(): HTMLElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll('.sic-code__line'));
  }

  it('renders one .sic-code__line per source line', () => {
    fixture.componentRef.setInput('code', 'const a = 1;\nconst b = 2;');
    fixture.componentRef.setInput('language', 'typescript');
    fixture.detectChanges();

    expect(lines().length).toBe(2);
  });

  it('shows line numbers by default, starting at 1', () => {
    fixture.componentRef.setInput('code', 'a\nb\nc');
    fixture.detectChanges();

    const numbers = Array.from(fixture.nativeElement.querySelectorAll('.sic-code__line-number')).map(
      (el: any) => el.textContent.trim(),
    );
    expect(numbers).toEqual(['1', '2', '3']);
  });

  it('hides line numbers when showLineNumbers is false', () => {
    fixture.componentRef.setInput('code', 'a\nb');
    fixture.componentRef.setInput('showLineNumbers', false);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.sic-code__line-number')).toBeNull();
  });

  it('renders keyword/string/number tokens with the matching CSS class', () => {
    fixture.componentRef.setInput('code', `const x = foo(1, "hi");`);
    fixture.componentRef.setInput('language', 'typescript');
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.sic-code__tok--keyword')?.textContent).toBe('const');
    expect(fixture.nativeElement.querySelector('.sic-code__tok--function')?.textContent).toBe('foo');
    expect(fixture.nativeElement.querySelector('.sic-code__tok--number')?.textContent).toBe('1');
    expect(fixture.nativeElement.querySelector('.sic-code__tok--string')?.textContent).toBe('"hi"');
  });

  it('shows a language badge when language is not "plaintext", and hides it otherwise', () => {
    fixture.componentRef.setInput('code', 'x');
    fixture.componentRef.setInput('language', 'typescript');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.sic-code__lang')?.textContent.trim()).toBe('typescript');

    fixture.componentRef.setInput('language', 'plaintext');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.sic-code__lang')).toBeNull();
  });

  it('hides the copy button when showCopyButton is false', () => {
    fixture.componentRef.setInput('code', 'x');
    fixture.componentRef.setInput('showCopyButton', false);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.sic-code__copy-btn')).toBeNull();
  });

  describe('copy button', () => {
    let writeText: ReturnType<typeof vi.fn>;

    beforeEach(() => {
      writeText = vi.fn().mockResolvedValue(undefined);
      Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
      fixture.componentRef.setInput('code', 'const a = 1;');
      fixture.detectChanges();
    });

    it('copies the raw code text to the clipboard and shows "Copied" briefly', async () => {
      vi.useFakeTimers();
      try {
        fixture.nativeElement.querySelector('.sic-code__copy-btn').click();
        await Promise.resolve();
        fixture.detectChanges();

        expect(writeText).toHaveBeenCalledWith('const a = 1;');
        expect(fixture.nativeElement.querySelector('.sic-code__copy-btn').textContent.trim()).toBe('Copied');

        vi.advanceTimersByTime(1500);
        fixture.detectChanges();
        expect(fixture.nativeElement.querySelector('.sic-code__copy-btn').textContent.trim()).toBe('Copy');
      } finally {
        vi.useRealTimers();
      }
    });
  });
});

describe('SicCodeComponent SIC_CONFIG defaults', () => {
  it('uses SIC_CONFIG.messages for the copy button labels', async () => {
    await TestBed.configureTestingModule({
      imports: [SicCodeComponent],
      providers: [{ provide: SIC_CONFIG, useValue: { messages: { codeCopy: 'คัดลอก', codeCopied: 'คัดลอกแล้ว' } } }],
    }).compileComponents();
    const fixture = TestBed.createComponent(SicCodeComponent);
    fixture.componentRef.setInput('code', 'x');
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.sic-code__copy-btn').textContent.trim()).toBe('คัดลอก');
  });
});
