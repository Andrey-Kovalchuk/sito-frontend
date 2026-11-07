import type { CheckRecord, SenderRecord, Session } from '../types';

export const SESSION_STORAGE_KEY = 'sito.session';
export const CHECKS_STORAGE_KEY = 'sito.checks.v1';
export const SENDERS_STORAGE_KEY = 'sito.senders.v1';

export function load<T>(
  key: string,
  guard: (val: unknown) => val is T,
  fallback: T,
  storage: Storage = window.localStorage
): T {
  try {
    const raw = storage.getItem(key);
    if (raw === null) {
      return fallback;
    }
    const parsed: unknown = JSON.parse(raw);
    if (guard(parsed)) {
      return parsed;
    }
    return fallback;
  } catch {
    return fallback;
  }
}

export function save<T>(key: string, value: T, storage: Storage = window.localStorage): void {
  try {
    storage.setItem(key, JSON.stringify(value));
  } catch {
    // Ігноруємо помилки переповнення або блокування сховища у приватному режимі
  }
}

export function remove(key: string, storage: Storage = window.localStorage): void {
  try {
    storage.removeItem(key);
  } catch {
    // Ігноруємо помилки доступу до сховища
  }
}

export function isSession(val: unknown): val is Session {
  if (typeof val !== 'object' || val === null) {
    return false;
  }
  const candidate = val as Record<string, unknown>;
  if (typeof candidate.token !== 'string' || typeof candidate.expiresAt !== 'number') {
    return false;
  }
  const user = candidate.user;
  if (typeof user !== 'object' || user === null) {
    return false;
  }
  const u = user as Record<string, unknown>;
  return (
    typeof u.id === 'string' &&
    typeof u.email === 'string' &&
    typeof u.displayName === 'string'
  );
}

export function isCheckRecordArray(val: unknown): val is CheckRecord[] {
  if (!Array.isArray(val)) {
    return false;
  }
  return val.every((item) => {
    if (typeof item !== 'object' || item === null) {
      return false;
    }
    const rec = item as Record<string, unknown>;
    return (
      typeof rec.id === 'string' &&
      typeof rec.createdAt === 'string' &&
      typeof rec.text === 'string' &&
      typeof rec.messenger === 'string' &&
      typeof rec.sender === 'string' &&
      typeof rec.verdict === 'string' &&
      typeof rec.score === 'number' &&
      Array.isArray(rec.signals) &&
      typeof rec.isTestData === 'boolean'
    );
  });
}

export function isSenderRecordArray(val: unknown): val is SenderRecord[] {
  if (!Array.isArray(val)) {
    return false;
  }
  return val.every((item) => {
    if (typeof item !== 'object' || item === null) {
      return false;
    }
    const rec = item as Record<string, unknown>;
    return (
      typeof rec.id === 'string' &&
      typeof rec.handle === 'string' &&
      typeof rec.messenger === 'string' &&
      typeof rec.category === 'string' &&
      typeof rec.note === 'string' &&
      typeof rec.createdAt === 'string' &&
      typeof rec.isTestData === 'boolean'
    );
  });
}
