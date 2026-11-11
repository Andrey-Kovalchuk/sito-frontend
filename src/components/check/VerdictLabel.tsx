import { VERDICT_LABELS } from '../../mocks/testData';
import type { Verdict } from '../../types';
import styles from './VerdictLabel.module.css';

interface VerdictLabelProps {
  verdict: Verdict;
}

export function VerdictLabel({ verdict }: VerdictLabelProps) {
  const variantClass =
    verdict === 'fake'
      ? styles.fake
      : verdict === 'suspicious'
        ? styles.suspicious
        : styles.safe;

  return <span className={`${styles.stamp} ${variantClass}`}>{VERDICT_LABELS[verdict]}</span>;
}
