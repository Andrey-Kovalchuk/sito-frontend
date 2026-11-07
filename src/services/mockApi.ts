import {
  HIDDEN_CHARS_RULE,
  SIGNAL_RULES,
  SUSPICIOUS_LINK_RULE,
  TEST_ACCOUNT,
} from '../mocks/testData';
import type { AnalysisResult, MessageInput, Session, Signal, Verdict } from '../types';
import { sanitizeText } from '../utils/sanitize';

const LOGIN_DELAY_MS = 400;
const ANALYZE_DELAY_MS = 900;

function waitWithAbort(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      const abortErr = new Error('Перевірку скасовано');
      abortErr.name = 'AbortError';
      reject(abortErr);
      return;
    }

    const onAbort = () => {
      clearTimeout(timerId);
      const abortErr = new Error('Перевірку скасовано');
      abortErr.name = 'AbortError';
      reject(abortErr);
    };

    const timerId = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort);
      resolve();
    }, ms);

    signal?.addEventListener('abort', onAbort, { once: true });
  });
}

export async function login(email: string, password: string): Promise<Session> {
  await waitWithAbort(LOGIN_DELAY_MS);

  const normalizedEmail = email.trim().toLowerCase();
  if (
    normalizedEmail !== TEST_ACCOUNT.user.email.toLowerCase() ||
    password !== TEST_ACCOUNT.password
  ) {
    throw new Error('Невірний email або пароль');
  }

  const expiresAt = Date.now() + TEST_ACCOUNT.sessionDurationMs;
  const payload = btoa(JSON.stringify({ sub: TEST_ACCOUNT.user.id, exp: expiresAt }));
  // test data
  const token = `test.${payload}.not-a-real-signature`;

  return {
    token,
    user: TEST_ACCOUNT.user,
    expiresAt,
  };
}

export function evaluateMessageSync(rawText: string): AnalysisResult {
  const { cleanText, hadHiddenChars } = sanitizeText(rawText);
  const lower = cleanText.toLowerCase();
  const signals: Signal[] = [];

  if (hadHiddenChars) {
    signals.push({
      kind: HIDDEN_CHARS_RULE.kind,
      label: HIDDEN_CHARS_RULE.label,
      fragment: 'U+200B',
      weight: HIDDEN_CHARS_RULE.weight,
    });
  }

  for (const rule of SIGNAL_RULES) {
    let earliestIndex = -1;
    let matchedKeyword = '';

    for (const kw of rule.keywords) {
      const idx = lower.indexOf(kw);
      if (idx !== -1 && (earliestIndex === -1 || idx < earliestIndex)) {
        earliestIndex = idx;
        matchedKeyword = kw;
      }
    }

    if (earliestIndex !== -1) {
      const fragment = cleanText.slice(earliestIndex, earliestIndex + matchedKeyword.length);
      signals.push({
        kind: rule.kind,
        label: rule.label,
        fragment,
        weight: rule.weight,
      });
    }
  }

  const linkMatch = /https?:\/\/[^\s]+/i.exec(cleanText);
  if (linkMatch) {
    signals.push({
      kind: SUSPICIOUS_LINK_RULE.kind,
      label: SUSPICIOUS_LINK_RULE.label,
      fragment: linkMatch[0],
      weight: SUSPICIOUS_LINK_RULE.weight,
    });
  }

  const totalWeight = signals.reduce((sum, item) => sum + item.weight, 0);
  const score = Math.min(100, totalWeight);

  let verdict: Verdict = 'safe';
  if (score >= 65) {
    verdict = 'fake';
  } else if (score >= 30) {
    verdict = 'suspicious';
  }

  return {
    verdict,
    score,
    signals,
  };
}

export async function analyzeMessage(
  input: MessageInput,
  signal?: AbortSignal
): Promise<AnalysisResult> {
  await waitWithAbort(ANALYZE_DELAY_MS, signal);

  if (input.text.toLowerCase().includes('#помилка')) {
    throw new Error('Тестова помилка сервісу перевірки');
  }

  return evaluateMessageSync(input.text);
}
