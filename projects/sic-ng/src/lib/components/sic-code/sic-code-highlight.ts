export type SicCodeLanguage = 'typescript' | 'javascript' | 'html' | 'css' | 'json' | 'bash' | 'plaintext';

export type SicCodeTokenType =
  | 'keyword'
  | 'string'
  | 'comment'
  | 'number'
  | 'boolean'
  | 'function'
  | 'property'
  | 'tag'
  | 'attr'
  | 'punctuation'
  | 'text';

export interface SicCodeToken {
  text: string;
  type: SicCodeTokenType;
}

const STRING = String.raw`"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|\`(?:[^\`\\]|\\.)*\``;
const LINE_COMMENT = String.raw`//[^\n]*`;
const BLOCK_COMMENT = String.raw`/\*[\s\S]*?\*/`;
const HASH_COMMENT = String.raw`#[^\n]*`;
const HTML_COMMENT = String.raw`<!--[\s\S]*?-->`;
const NUMBER = String.raw`\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?(?:px|rem|em|%|vh|vw|deg|s|ms)?\b`;

const JS_KEYWORDS = [
  'abstract', 'any', 'as', 'async', 'await', 'boolean', 'break', 'case', 'catch', 'class', 'const', 'continue',
  'debugger', 'declare', 'default', 'delete', 'do', 'else', 'enum', 'export', 'extends', 'false', 'finally', 'for',
  'from', 'function', 'get', 'if', 'implements', 'import', 'in', 'instanceof', 'interface', 'let', 'new', 'null',
  'number', 'of', 'private', 'protected', 'public', 'readonly', 'return', 'set', 'static', 'string', 'super',
  'switch', 'this', 'throw', 'true', 'try', 'type', 'typeof', 'undefined', 'var', 'void', 'while', 'yield',
];

const BASH_KEYWORDS = [
  'if', 'then', 'else', 'elif', 'fi', 'for', 'while', 'until', 'do', 'done', 'case', 'esac', 'function', 'return',
  'export', 'local', 'echo', 'cd', 'exit', 'break', 'continue', 'in', 'set',
];

/** Named regex-group name -> token type, built into one alternation per language. Group order = match priority when multiple patterns could start at the same position. */
function buildRule(patterns: Partial<Record<SicCodeTokenType, string>>): RegExp {
  const parts = Object.entries(patterns).map(([type, pattern]) => `(?<${type}>${pattern})`);
  return new RegExp(parts.join('|'), 'g');
}

const LANGUAGE_RULES: Partial<Record<SicCodeLanguage, RegExp>> = {
  typescript: buildRule({
    comment: `${BLOCK_COMMENT}|${LINE_COMMENT}`,
    string: STRING,
    number: NUMBER,
    keyword: String.raw`\b(?:${JS_KEYWORDS.join('|')})\b`,
    function: String.raw`\b[A-Za-z_$][\w$]*(?=\s*\()`,
    punctuation: String.raw`[{}()\[\];,.:<>=+\-*/%!&|^~?]`,
  }),
  json: buildRule({
    property: String.raw`"(?:[^"\\]|\\.)*"(?=\s*:)`,
    string: STRING,
    number: NUMBER,
    boolean: String.raw`\b(?:true|false|null)\b`,
    punctuation: String.raw`[{}\[\],:]`,
  }),
  css: buildRule({
    comment: BLOCK_COMMENT,
    string: STRING,
    property: String.raw`[a-zA-Z-]+(?=\s*:)`,
    number: NUMBER,
    punctuation: String.raw`[{}:;,.#]`,
  }),
  html: buildRule({
    comment: HTML_COMMENT,
    string: STRING,
    tag: String.raw`(?<=<\/?)[a-zA-Z][\w-]*`,
    attr: String.raw`\b[a-zA-Z-]+(?=\s*=)`,
    punctuation: String.raw`[<>=/]`,
  }),
  bash: buildRule({
    comment: HASH_COMMENT,
    string: STRING,
    keyword: String.raw`\b(?:${BASH_KEYWORDS.join('|')})\b`,
    punctuation: String.raw`[{}()\[\];|&<>=]`,
  }),
};
LANGUAGE_RULES.javascript = LANGUAGE_RULES.typescript;

function tokenizeFlat(code: string, language: SicCodeLanguage): SicCodeToken[] {
  const rule = LANGUAGE_RULES[language];
  if (!rule) {
    return [{ text: code, type: 'text' }];
  }

  rule.lastIndex = 0;
  const tokens: SicCodeToken[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = rule.exec(code))) {
    if (match.index > lastIndex) {
      tokens.push({ text: code.slice(lastIndex, match.index), type: 'text' });
    }

    const type = (Object.keys(match.groups ?? {}).find((key) => match!.groups![key] !== undefined) ??
      'text') as SicCodeTokenType;
    tokens.push({ text: match[0], type });
    lastIndex = match.index + match[0].length;

    if (match[0].length === 0) {
      rule.lastIndex += 1;
    }
  }

  if (lastIndex < code.length) {
    tokens.push({ text: code.slice(lastIndex), type: 'text' });
  }

  return tokens;
}

/** Splits a flat token stream on embedded `\n`s (block comments/template literals can span lines) into one token array per source line. */
function splitIntoLines(tokens: SicCodeToken[]): SicCodeToken[][] {
  const lines: SicCodeToken[][] = [[]];

  for (const token of tokens) {
    const parts = token.text.split('\n');
    parts.forEach((part, i) => {
      if (i > 0) {
        lines.push([]);
      }
      if (part.length) {
        lines[lines.length - 1].push({ text: part, type: token.type });
      }
    });
  }

  return lines;
}

/** Tokenizes `code` for syntax highlighting, returning one token array per line (ready for a line-numbered render). Unsupported/`'plaintext'` languages return each line as a single 'text' token. */
export function tokenizeCode(code: string, language: SicCodeLanguage): SicCodeToken[][] {
  return splitIntoLines(tokenizeFlat(code, language));
}
