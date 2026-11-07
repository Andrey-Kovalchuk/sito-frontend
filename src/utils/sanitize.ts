// Діапазони zero-width, bidi-перевизначень та керувальних символів (крім \t, \n, \r)
// eslint-disable-next-line no-control-regex
const HIDDEN_AND_CONTROL_CHARS_REGEX = /[\u200B-\u200F\u202A-\u202E\u2066-\u2069\uFEFF\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

export interface SanitizeResult {
  cleanText: string;
  hadHiddenChars: boolean;
}

export function sanitizeText(raw: string): SanitizeResult {
  const normalized = raw.normalize('NFKC');
  const hadHiddenChars = HIDDEN_AND_CONTROL_CHARS_REGEX.test(normalized);
  HIDDEN_AND_CONTROL_CHARS_REGEX.lastIndex = 0;
  const cleanText = normalized.replace(HIDDEN_AND_CONTROL_CHARS_REGEX, '');
  return { cleanText, hadHiddenChars };
}

export function defangUrl(text: string): string {
  return text.replace(/\b(https?):\/\/([^\s/]+)(\/[^\s]*)?/gi, (_match, scheme: string, host: string, rest?: string) => {
    const safeScheme = scheme.toLowerCase() === 'https' ? 'hxxps' : 'hxxp';
    const safeHost = host.replace(/\./g, '[.]');
    return `${safeScheme}://${safeHost}${rest ?? ''}`;
  });
}
