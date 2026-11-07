import { describe, expect, it } from 'vitest';
import { validateLogin, validateMessage } from './validate';
import type { Messenger } from '../types';

describe('validateMessage', () => {
  it('повертає порожній об’єкт помилок для коректного повідомлення', () => {
    const errors = validateMessage({
      text: 'Це достатньо довгий текст повідомлення для перевірки.',
      messenger: 'telegram',
      sender: '@test_sender',
    });
    expect(errors).toEqual({});
  });

  it('повертає помилку для порожнього тексту або лише пробілів', () => {
    const errors = validateMessage({
      text: '    ',
      messenger: 'viber',
      sender: '',
    });
    expect(errors.text).toBe('Введіть текст повідомлення для перевірки.');
  });

  it('повертає помилку з точною кількістю символів для закороткого тексту (< 10)', () => {
    const errors = validateMessage({
      text: 'Привіт',
      messenger: 'telegram',
      sender: '',
    });
    expect(errors.text).toBe('Текст закороткий: мінімум 10 символів (зараз 6).');
  });

  it('повертає помилку для задовгого тексту (> 4000 символів)', () => {
    const errors = validateMessage({
      text: 'а'.repeat(4005),
      messenger: 'sms',
      sender: '',
    });
    expect(errors.text).toContain('Текст задовгий: максимум 4000 символів');
  });

  it('повертає помилку для невідомого месенджера', () => {
    const errors = validateMessage({
      text: 'Нормальний текст повідомлення для перевірки',
      messenger: 'icq' as Messenger,
      sender: '',
    });
    expect(errors.messenger).toBe('Оберіть джерело повідомлення зі списку.');
  });

  it('повертає помилку, якщо відправник містить кутові дужки або довший за 64 символи', () => {
    const errBrackets = validateMessage({
      text: 'Нормальний текст повідомлення для перевірки',
      messenger: 'telegram',
      sender: '<script>alert(1)</script>',
    });
    expect(errBrackets.sender).toBe('Поле відправника не може містити символи < або >.');

    const errLong = validateMessage({
      text: 'Нормальний текст повідомлення для перевірки',
      messenger: 'telegram',
      sender: 's'.repeat(65),
    });
    expect(errLong.sender).toBe('Поле відправника не може перевищувати 64 символи.');
  });
});

describe('validateLogin', () => {
  it('пропускає коректні email та пароль', () => {
    expect(validateLogin('student@sito.test', 'Test1234!')).toEqual({});
  });

  it('виявляє порожній або некоректний email', () => {
    expect(validateLogin('', 'Test1234!').email).toBe('Введіть електронну пошту.');
    expect(validateLogin('not-an-email', 'Test1234!').email).toBe(
      'Некоректний формат електронної пошти.'
    );
  });

  it('виявляє порожній або закороткий пароль', () => {
    expect(validateLogin('student@sito.test', '').password).toBe('Введіть пароль.');
    expect(validateLogin('student@sito.test', '123').password).toBe(
      'Пароль має містити щонайменше 6 символів.'
    );
  });
});
