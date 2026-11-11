import type { Verdict } from '../../types';
import styles from './RiskScale.module.css';

interface RiskScaleProps {
  score: number;
  verdict?: Verdict;
}

function getSegmentFill(score: number, min: number, max: number): number {
  if (score <= min) {
    return 0;
  }
  if (score >= max) {
    return 100;
  }
  return Math.round(((score - min) / (max - min)) * 100);
}

export function RiskScale({ score, verdict }: RiskScaleProps) {
  const clamped = Math.max(0, Math.min(100, score));
  const resolvedVerdict: Verdict =
    verdict ?? (clamped >= 65 ? 'fake' : clamped >= 30 ? 'suspicious' : 'safe');

  const fillClass =
    resolvedVerdict === 'fake'
      ? styles.fillFake
      : resolvedVerdict === 'suspicious'
        ? styles.fillSuspicious
        : styles.fillSafe;

  const seg1 = getSegmentFill(clamped, 0, 30);
  const seg2 = getSegmentFill(clamped, 30, 65);
  const seg3 = getSegmentFill(clamped, 65, 100);

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <span className={styles.valueText}>Ризик: {clamped} / 100</span>
        <span className={styles.rangesHint}>0–29 · 30–64 · 65–100</span>
      </div>
      <div
        className={styles.trackGrid}
        role="meter"
        aria-label="Рівень ризику повідомлення"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={clamped}
      >
        <div className={styles.segment}>
          <div className={`${styles.fill} ${fillClass}`} style={{ width: `${seg1}%` }} />
        </div>
        <div className={styles.segment}>
          <div className={`${styles.fill} ${fillClass}`} style={{ width: `${seg2}%` }} />
        </div>
        <div className={styles.segment}>
          <div className={`${styles.fill} ${fillClass}`} style={{ width: `${seg3}%` }} />
        </div>
      </div>
    </div>
  );
}
