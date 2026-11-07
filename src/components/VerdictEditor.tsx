import { useState, type FormEvent } from 'react';
import { VERDICT_LABELS } from '../mocks/testData';
import type { Verdict } from '../types';
import styles from './VerdictEditor.module.css';

interface VerdictEditorProps {
  value: Verdict;
  initialNote?: string;
  onApply: (verdict: Verdict, note: string) => void;
  onCancel: () => void;
}

const VERDICT_OPTIONS: Verdict[] = ['fake', 'suspicious', 'safe'];

export function VerdictEditor({
  value,
  initialNote = '',
  onApply,
  onCancel,
}: VerdictEditorProps) {
  const [selectedVerdict, setSelectedVerdict] = useState<Verdict>(value);
  const [note, setNote] = useState<string>(initialNote);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onApply(selectedVerdict, note);
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.field}>
        <label htmlFor="manual-verdict-select" className={styles.label}>
          Ручна оцінка
        </label>
        <select
          id="manual-verdict-select"
          className={styles.select}
          value={selectedVerdict}
          onChange={(e) => setSelectedVerdict(e.target.value as Verdict)}
        >
          {VERDICT_OPTIONS.map((v) => (
            <option key={v} value={v}>
              {VERDICT_LABELS[v]}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.field}>
        <label htmlFor="manual-verdict-note" className={styles.label}>
          Нотатка до перевірки (необов&apos;язково)
        </label>
        <textarea
          id="manual-verdict-note"
          className={styles.textarea}
          rows={3}
          maxLength={500}
          placeholder="Коротке обґрунтування зміни оцінки або контекст отримання"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </div>

      <div className={styles.actions}>
        <button type="submit" className={styles.primaryBtn}>
          Застосувати
        </button>
        <button type="button" className={styles.secondaryBtn} onClick={onCancel}>
          Скасувати
        </button>
      </div>
    </form>
  );
}
