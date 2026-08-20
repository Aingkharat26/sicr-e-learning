import { applySicFontFaces } from './theme.fonts';

describe('applySicFontFaces', () => {
  function styleElement(): HTMLStyleElement | null {
    return document.getElementById('sic-ng-custom-fonts') as HTMLStyleElement | null;
  }

  afterEach(() => {
    styleElement()?.remove();
  });

  it('injects one @font-face rule per entry into a single <style> element', () => {
    applySicFontFaces(
      [
        { family: 'Prompt', weight: 400, sources: [{ url: '/fonts/prompt/Prompt-Regular.ttf' }] },
        { family: 'Prompt', weight: 700, sources: [{ url: '/fonts/prompt/Prompt-Bold.ttf' }] },
      ],
      document,
    );

    const style = styleElement();
    expect(style).toBeTruthy();
    expect(style?.textContent?.match(/@font-face/g)?.length).toBe(2);
    expect(style?.textContent).toContain('font-family: "Prompt"');
  });

  it('infers the CSS format() from the file extension when not given explicitly', () => {
    applySicFontFaces([{ family: 'Prompt', sources: [{ url: '/fonts/prompt/Prompt-Regular.ttf' }] }], document);

    expect(styleElement()?.textContent).toContain('url("/fonts/prompt/Prompt-Regular.ttf") format("truetype")');
  });

  it('uses an explicit format over the inferred one', () => {
    applySicFontFaces([{ family: 'Prompt', sources: [{ url: '/fonts/prompt/Prompt-Regular.woff2', format: 'woff2-variations' }] }], document);

    expect(styleElement()?.textContent).toContain('format("woff2-variations")');
  });

  it('defaults weight to 400, style to normal, and display to swap', () => {
    applySicFontFaces([{ family: 'Prompt', sources: [{ url: '/fonts/prompt/Prompt-Regular.ttf' }] }], document);

    const css = styleElement()?.textContent ?? '';
    expect(css).toContain('font-weight: 400');
    expect(css).toContain('font-style: normal');
    expect(css).toContain('font-display: swap');
  });

  it('includes unicode-range only when provided', () => {
    applySicFontFaces([{ family: 'Prompt', sources: [{ url: 'a.ttf' }], unicodeRange: 'U+0E00-0E7F' }], document);
    expect(styleElement()?.textContent).toContain('unicode-range: U+0E00-0E7F');

    applySicFontFaces([{ family: 'Prompt', sources: [{ url: 'a.ttf' }] }], document);
    expect(styleElement()?.textContent).not.toContain('unicode-range');
  });

  it('replaces the previous style element instead of appending a duplicate one', () => {
    applySicFontFaces([{ family: 'Prompt', sources: [{ url: 'a.ttf' }] }], document);
    applySicFontFaces([{ family: 'RobotoCondensed', sources: [{ url: 'b.ttf' }] }], document);

    expect(document.querySelectorAll('#sic-ng-custom-fonts').length).toBe(1);
    expect(styleElement()?.textContent).toContain('RobotoCondensed');
    expect(styleElement()?.textContent).not.toContain('Prompt');
  });

  it('removes the style element (and injects nothing) when called with an empty array', () => {
    applySicFontFaces([{ family: 'Prompt', sources: [{ url: 'a.ttf' }] }], document);
    applySicFontFaces([], document);

    expect(styleElement()).toBeNull();
  });

  it('joins multiple sources for the same rule with commas, in order', () => {
    applySicFontFaces(
      [
        {
          family: 'Prompt',
          sources: [
            { url: '/fonts/prompt/Prompt-Regular.woff2' },
            { url: '/fonts/prompt/Prompt-Regular.ttf' },
          ],
        },
      ],
      document,
    );

    const css = styleElement()?.textContent ?? '';
    const srcLine = css.split('\n').find((line) => line.trim().startsWith('src:'));
    expect(srcLine).toContain('format("woff2")');
    expect(srcLine).toContain('format("truetype")');
    expect(srcLine?.indexOf('woff2')).toBeLessThan(srcLine?.indexOf('truetype') ?? -1);
  });
});
