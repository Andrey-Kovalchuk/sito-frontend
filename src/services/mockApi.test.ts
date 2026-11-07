import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SEED_CHECKS, TEST_ACCOUNT } from '../mocks/testData';
import { analyzeMessage, evaluateMessageSync, login } from './mockApi';

describe('mockApi', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('успішно виконує login для тестового користувача та відхиляє невірний пароль', async () => {
    const loginPromise = login(TEST_ACCOUNT.user.email, TEST_ACCOUNT.password);
    vi.advanceTimersByTime(450);
    const session = await loginPromise;

    expect(session.user.email).toBe('student@sito.test');
    expect(session.token).toMatch(/^test\..+\.not-a-real-signature$/);

    const badPromise = login('student@sito.test', 'wrong');
    const expectation = expect(badPromise).rejects.toThrow('Невірний email або пароль');
    await vi.advanceTimersByTimeAsync(450);
    await expectation;
  });

  it('повертає очікувані verdict та score для всіх 8 записів початкового журналу (SEED_CHECKS)', () => {
    for (const record of SEED_CHECKS) {
      const evaluated = evaluateMessageSync(record.text);
      expect(evaluated.score).toBe(record.score);
      expect(evaluated.verdict).toBe(record.verdict);
    }
  });

  it('відхиляє проміс при наявності спецключа #помилка', async () => {
    const promise = analyzeMessage({
      text: 'Тестове повідомлення #помилка для перевірки',
      messenger: 'telegram',
      sender: '',
    });
    const expectation = expect(promise).rejects.toThrow('Тестова помилка сервісу перевірки');
    await vi.advanceTimersByTimeAsync(950);
    await expectation;
  });

  it('підтримує скасування запиту через AbortController', async () => {
    const controller = new AbortController();
    const promise = analyzeMessage(
      {
        text: 'Повідомлення, яке буде скасовано під час перевірки',
        messenger: 'viber',
        sender: '',
      },
      controller.signal
    );

    vi.advanceTimersByTime(200);
    controller.abort();

    await expect(promise).rejects.toThrow('Перевірку скасовано');
  });
});
