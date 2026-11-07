import { describe, expect, it } from 'vitest';
import { defangUrl, sanitizeText } from './sanitize';

describe('sanitizeText', () => {
  it('повертає текст без змін та hadHiddenChars=false для чистого тексту', () => {
    const res = sanitizeText('Привіт, завтра зустріч о 10:00.');
    expect(res.cleanText).toBe('Привіт, завтра зустріч о 10:00.');
    expect(res.hadHiddenChars).toBe(false);
  });

  it('видаляє zero-width та bidi-символи і позначає hadHiddenChars=true', () => {
    const raw = 'Отримайте компен\u200Bсацію \u202Eзараз';
    const res = sanitizeText(raw);
    expect(res.cleanText).toBe('Отримайте компенсацію зараз');
    expect(res.hadHiddenChars).toBe(true);
  });

  it('виконує NFKC-нормалізацію сумісних символів', () => {
    const raw = 'ﬁnance';
    const res = sanitizeText(raw);
    expect(res.cleanText).toBe('finance');
  });
});

describe('defangUrl', () => {
  it('знешкоджує http та https посилання, замінюючи протокол і крапки в домені', () => {
    const input = 'Перейдіть на https://test-kredyt.test/login або http://sub.bad.test';
    const output = defangUrl(input);
    expect(output).toBe(
      'Перейдіть на hxxps://test-kredyt[.]test/login або hxxp://sub[.]bad[.]test'
    );
  });

  it('не змінює звичайний текст без посилань', () => {
    expect(defangUrl('Звичайне текстове повідомлення.')).toBe('Звичайне текстове повідомлення.');
  });
});
