import { tokenizeCode } from './sic-code-highlight';

describe('tokenizeCode', () => {
  it('returns one line per plain-text line for language="plaintext"', () => {
    const lines = tokenizeCode('hello\nworld', 'plaintext');
    expect(lines).toEqual([
      [{ text: 'hello', type: 'text' }],
      [{ text: 'world', type: 'text' }],
    ]);
  });

  it('tokenizes typescript keywords, strings, numbers, and function calls', () => {
    const [line] = tokenizeCode(`const x = foo(1, "hi");`, 'typescript');
    const types = line.map((t) => t.type);
    const texts = line.map((t) => t.text);

    expect(texts).toContain('const');
    expect(types[texts.indexOf('const')]).toBe('keyword');
    expect(texts).toContain('foo');
    expect(types[texts.indexOf('foo')]).toBe('function');
    expect(texts).toContain('1');
    expect(types[texts.indexOf('1')]).toBe('number');
    expect(texts).toContain('"hi"');
    expect(types[texts.indexOf('"hi"')]).toBe('string');
  });

  it('tokenizes a single-line comment as one comment token', () => {
    const [line] = tokenizeCode('// a note', 'typescript');
    expect(line).toEqual([{ text: '// a note', type: 'comment' }]);
  });

  it('splits a multi-line block comment across the correct lines', () => {
    const lines = tokenizeCode('/* line one\nline two */\nconst x = 1;', 'typescript');

    expect(lines.length).toBe(3);
    expect(lines[0]).toEqual([{ text: '/* line one', type: 'comment' }]);
    expect(lines[1]).toEqual([{ text: 'line two */', type: 'comment' }]);
    expect(lines[2].some((t) => t.type === 'keyword' && t.text === 'const')).toBe(true);
  });

  it('marks a JSON object key (but not a plain string value) as "property"', () => {
    const [line] = tokenizeCode(`{"name": "Alice", "age": 30}`, 'json');
    const nameKey = line.find((t) => t.text === '"name"');
    const nameValue = line.find((t) => t.text === '"Alice"');

    expect(nameKey?.type).toBe('property');
    expect(nameValue?.type).toBe('string');
  });

  it('tokenizes JSON booleans/null distinctly from strings', () => {
    const [line] = tokenizeCode(`{"active": true, "deleted": null}`, 'json');
    expect(line.find((t) => t.text === 'true')?.type).toBe('boolean');
    expect(line.find((t) => t.text === 'null')?.type).toBe('boolean');
  });

  it('tokenizes an HTML tag name and attribute name', () => {
    const [line] = tokenizeCode(`<div class="a">`, 'html');
    expect(line.find((t) => t.text === 'div')?.type).toBe('tag');
    expect(line.find((t) => t.text === 'class')?.type).toBe('attr');
    expect(line.find((t) => t.text === '"a"')?.type).toBe('string');
  });

  it('tokenizes a CSS property name before the colon', () => {
    const [line] = tokenizeCode(`color: red;`, 'css');
    expect(line.find((t) => t.text === 'color')?.type).toBe('property');
  });

  it('tokenizes a bash comment and keyword', () => {
    const lines = tokenizeCode('# note\nif true; then echo hi; fi', 'bash');
    expect(lines[0]).toEqual([{ text: '# note', type: 'comment' }]);
    expect(lines[1].find((t) => t.text === 'if')?.type).toBe('keyword');
  });

  it('drops empty lines to an empty token array', () => {
    const lines = tokenizeCode('const x = 1;\n\nconst y = 2;', 'typescript');
    expect(lines[1]).toEqual([]);
  });
});
