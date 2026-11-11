import { Link } from 'react-router-dom';
import type { Signal } from '../../types';
import { defangUrl } from '../../utils/sanitize';
import styles from './SignalsList.module.css';

interface SignalsListProps {
  signals: Signal[];
}

export function SignalsList({ signals }: SignalsListProps) {
  if (signals.length === 0) {
    return <p className={styles.empty}>Підозрілих ознак за словником не виявлено.</p>;
  }

  return (
    <ul className={styles.list} aria-label="Виявлені ознаки">
      {signals.map((sig) => (
        <li key={sig.kind} className={styles.item}>
          <div className={styles.topRow}>
            <span className={styles.label}>{sig.label}</span>
            <div className={styles.rightMeta}>
              <span className={styles.weight}>+{sig.weight}</span>
              <Link to={`/rules?kind=${sig.kind}`} className={styles.ruleLink}>
                Правило →
              </Link>
            </div>
          </div>
          <div className={styles.fragmentRow}>
            Фрагмент: <code className={styles.fragment}>«{defangUrl(sig.fragment)}»</code>
          </div>
        </li>
      ))}
    </ul>
  );
}
