/** One `src` entry within a `SicFontFace` — a single font file plus its CSS format. */
export interface SicFontFaceSource {
  /** URL to the font file, e.g. `'/fonts/prompt/Prompt-Regular.ttf'`. */
  url: string;
  /** CSS `format()` value, e.g. `'truetype'`, `'woff2'`. Inferred from the URL's file extension when omitted. */
  format?: string;
}

/**
 * One `@font-face` declaration — typically one per weight/style pair of a custom font, mirroring
 * how variable/static font families ship multiple files (e.g. `Prompt-Regular.ttf` at weight 400,
 * `Prompt-Bold.ttf` at weight 700).
 */
export interface SicFontFace {
  /** `font-family` name this rule defines — reference it via `[fontSans]`/`SicThemeConfig.fontSans` (or your own CSS) once registered. */
  family: string;
  /** One or more source files for this family/weight/style combination — multiple entries let the browser pick the first format it supports. */
  sources: SicFontFaceSource[];
  /** Default: `400`. */
  weight?: string | number;
  /** Default: `'normal'`. */
  style?: 'normal' | 'italic' | 'oblique';
  /** Default: `'swap'`. */
  display?: 'auto' | 'block' | 'swap' | 'fallback' | 'optional';
  /** Restricts the rule to a Unicode range, e.g. `'U+0E00-0E7F'` for Thai-only glyphs from a given file. */
  unicodeRange?: string;
}

const STYLE_ELEMENT_ID = 'sic-ng-custom-fonts';

const FORMAT_BY_EXTENSION: Record<string, string> = {
  ttf: 'truetype',
  otf: 'opentype',
  woff: 'woff',
  woff2: 'woff2',
  eot: 'embedded-opentype',
  svg: 'svg',
};

function inferFormat(url: string): string | undefined {
  const extension = url.split(/[?#]/)[0].split('.').pop()?.toLowerCase();
  return extension ? FORMAT_BY_EXTENSION[extension] : undefined;
}

function toFontFaceRule(face: SicFontFace): string {
  const src = face.sources
    .map((source) => {
      const format = source.format ?? inferFormat(source.url);
      return `url("${source.url}")${format ? ` format("${format}")` : ''}`;
    })
    .join(', ');

  const declarations = [
    `font-family: "${face.family}"`,
    `src: ${src}`,
    `font-weight: ${face.weight ?? 400}`,
    `font-style: ${face.style ?? 'normal'}`,
    `font-display: ${face.display ?? 'swap'}`,
    face.unicodeRange ? `unicode-range: ${face.unicodeRange}` : undefined,
  ].filter((declaration): declaration is string => !!declaration);

  return `@font-face {\n  ${declarations.join(';\n  ')};\n}`;
}

/**
 * Injects `@font-face` rules for custom/self-hosted fonts (e.g. TTF/WOFF2 files served from your
 * own app, like a Prompt/RobotoCondensed set) into `target` as a single
 * `<style id="sic-ng-custom-fonts">` element — calling again with a new list replaces it entirely
 * rather than duplicating rules. Registering a family doesn't switch anything to it by itself; set
 * `SicThemeConfig.fontSans` (or your own CSS) to actually use it.
 *
 * `target` is the `Document` to inject into — pass `inject(DOCUMENT)` so this stays SSR-safe (no
 * global `document` reference), matching `applySicThemeConfig`'s `target: HTMLElement` pattern.
 */
export function applySicFontFaces(faces: SicFontFace[], target: Document): void {
  target.getElementById(STYLE_ELEMENT_ID)?.remove();

  if (!faces.length) {
    return;
  }

  const style = target.createElement('style');
  style.id = STYLE_ELEMENT_ID;
  style.textContent = faces.map(toFontFaceRule).join('\n\n');
  target.head.appendChild(style);
}
