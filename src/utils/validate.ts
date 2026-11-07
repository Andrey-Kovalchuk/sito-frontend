import type { FieldErrors, MessageInput, Messenger } from '../types';

const ALLOWED_MESSENGERS: readonly Messenger[] = [
  'telegram',
  'viber',
  'whatsapp',
  'signal',
  'sms',
  'other',
];

const MIN_TEXT_LENGTH = 10;
const MAX_TEXT_LENGTH = 4000;
const MAX_SENDER_LENGTH = 64;

export function validateMessage(input: MessageInput): FieldErrors {
  const errors: FieldErrors = {};
  const trimmedText = input.text.trim();

  if (trimmedText.length === 0) {
    errors.text = 'Введіть текст повідомлення для перевірки.';
  } else if (trimmedText.length < MIN_TEXT_LENGTH) {
    errors.text = `Текст закороткий: мінімум ${MIN_TEXT_LENGTH} символів (зараз ${trimmedText.length}).`;
  } else if (trimmedText.length > MAX_TEXT_LENGTH) {
    errors.text = `Текст задовгий: максимум ${MAX_TEXT_LENGTH} символів (зараз ${trimmedText.length}).`;
  }

  if (!ALLOWED_MESSENGERS.includes(input.messenger)) {
    errors.messenger = 'Оберіть джерело повідомлення зі списку.';
  }

  const trimmedSender = input.sender.trim();
  if (trimmedSender.length > MAX_SENDER_LENGTH) {
    errors.sender = `Поле відправника не може перевищувати ${MAX_SENDER_LENGTH} символи.`;
  } else if (/[<>]/.test(trimmedSender)) {
    errors.sender = 'Поле відправника не може містити символи < або >.';
  }

  return errors;
}

export interface LoginErrors {
  email?: string;
  password?: string;
}

export function validateLogin(email: string, password: string): LoginErrors {
  const errors: LoginErrors = {};
  const trimmedEmail = email.trim();

  if (!trimmedEmail) {
    errors.email = 'Введіть електронну пошту.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
    errors.email = 'Некоректний формат електронної пошти.';
  }

  if (!password) {
    errors.password = 'Введіть пароль.';
  } else if (password.length < 6) {
    errors.password = 'Пароль має містити щонайменше 6 символів.';
  }

  return errors;
}
