import styles from './TestDataBadge.module.css';

interface TestDataBadgeProps {
  compact?: boolean;
}

export function TestDataBadge({ compact = false }: TestDataBadgeProps) {
  return (
    <span className={compact ? `${styles.badge} ${styles.compact}` : styles.badge}>
      Тестові дані · test data
    </span>
  );
}
