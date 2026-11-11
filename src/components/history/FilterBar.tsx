import { MESSENGER_LABELS, SIGNAL_LABELS } from '../../mocks/testData';
import type { Messenger, SignalKind, Verdict } from '../../types';
import styles from './FilterBar.module.css';

export type VerdictFilter = 'all' | Verdict;
export type MessengerFilter = 'all' | Messenger;
export type SignalFilter = 'all' | SignalKind;

export interface FilterState {
  verdict: VerdictFilter;
  messenger: MessengerFilter;
  signal: SignalFilter;
  query: string;
}

interface FilterBarProps {
  value: FilterState;
  onChange: (next: FilterState) => void;
}

const MESSENGER_KEYS: Messenger[] = ['telegram', 'viber', 'whatsapp', 'signal', 'sms', 'other'];
const SIGNAL_KEYS: SignalKind[] = [
  'urgency',
  'payment_data',
  'suspicious_link',
  'prize',
  'impersonation',
  'hidden_chars',
];

export function FilterBar({ value, onChange }: FilterBarProps) {
  const hasActiveFilter =
    value.verdict !== 'all' ||
    value.messenger !== 'all' ||
    value.signal !== 'all' ||
    value.query.trim().length > 0;

  return (
    <div className={styles.bar}>
      <div className={styles.grid}>
        <div className={styles.field}>
          <label htmlFor="filter-verdict" className={styles.label}>
            Вердикт
          </label>
          <select
            id="filter-verdict"
            className={styles.select}
            value={value.verdict}
            onChange={(e) =>
              onChange({
                ...value,
                verdict: e.target.value as VerdictFilter,
              })
            }
          >
            <option value="all">Усі записи</option>
            <option value="fake">Фейк</option>
            <option value="suspicious">Підозріло</option>
            <option value="safe">Ймовірно безпечно</option>
          </select>
        </div>

        <div className={styles.field}>
          <label htmlFor="filter-messenger" className={styles.label}>
            Месенджер
          </label>
          <select
            id="filter-messenger"
            className={styles.select}
            value={value.messenger}
            onChange={(e) =>
              onChange({
                ...value,
                messenger: e.target.value as MessengerFilter,
              })
            }
          >
            <option value="all">Усі джерела</option>
            {MESSENGER_KEYS.map((m) => (
              <option key={m} value={m}>
                {MESSENGER_LABELS[m]}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.field}>
          <label htmlFor="filter-signal" className={styles.label}>
            Ознака маніпуляції
          </label>
          <select
            id="filter-signal"
            className={styles.select}
            value={value.signal}
            onChange={(e) =>
              onChange({
                ...value,
                signal: e.target.value as SignalFilter,
              })
            }
          >
            <option value="all">Усі ознаки</option>
            {SIGNAL_KEYS.map((s) => (
              <option key={s} value={s}>
                {SIGNAL_LABELS[s]}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.fieldSearch}>
          <label htmlFor="filter-query" className={styles.label}>
            Пошук за текстом або відправником
          </label>
          <input
            id="filter-query"
            type="search"
            className={styles.input}
            placeholder="Введіть слово, номер або відправника"
            value={value.query}
            onChange={(e) =>
              onChange({
                ...value,
                query: e.target.value,
              })
            }
          />
        </div>
      </div>

      {hasActiveFilter && (
        <div className={styles.activeRow}>
          <span className={styles.activeLabel}>Застосовано фільтрацію списку</span>
          <button
            type="button"
            className={styles.resetBtn}
            onClick={() =>
              onChange({
                verdict: 'all',
                messenger: 'all',
                signal: 'all',
                query: '',
              })
            }
          >
            Скинути фільтри
          </button>
        </div>
      )}
    </div>
  );
}
