import { describe, expect, it } from 'vitest';
import { SEED_CHECKS } from '../mocks/testData';
import {
  CHECKS_STORAGE_KEY,
  isCheckRecordArray,
  isSession,
  load,
  remove,
  save,
} from './storage';

describe('storage service', () => {
  it('зберігає та зчитує валідні дані через type guard', () => {
    save(CHECKS_STORAGE_KEY, SEED_CHECKS);
    const loaded = load(CHECKS_STORAGE_KEY, isCheckRecordArray, []);
    expect(loaded).toHaveLength(8);
    expect(loaded[0].id).toBe('chk-001');
  });

  it('повертає fallback, якщо у сховищі пошкоджений JSON', () => {
    window.localStorage.setItem(CHECKS_STORAGE_KEY, '{broken-json');
    const loaded = load(CHECKS_STORAGE_KEY, isCheckRecordArray, SEED_CHECKS);
    expect(loaded).toEqual(SEED_CHECKS);
  });

  it('повертає fallback, якщо структура даних не проходить type guard', () => {
    window.localStorage.setItem(CHECKS_STORAGE_KEY, JSON.stringify([{ invalid: 123 }]));
    const loaded = load(CHECKS_STORAGE_KEY, isCheckRecordArray, SEED_CHECKS);
    expect(loaded).toEqual(SEED_CHECKS);
  });

  it('перевіряє коректність об’єкта сесії через isSession та видаляє ключ', () => {
    expect(isSession(null)).toBe(false);
    expect(isSession({ token: 'abc', expiresAt: 1000, user: null })).toBe(false);
    expect(
      isSession({
        token: 'test.123.sig',
        expiresAt: 999999,
        user: { id: 'u-1', email: 'student@sito.test', displayName: 'Тестенко' },
      })
    ).toBe(true);

    remove(CHECKS_STORAGE_KEY);
    expect(window.localStorage.getItem(CHECKS_STORAGE_KEY)).toBeNull();
  });
});
