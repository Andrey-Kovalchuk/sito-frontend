import type { CheckRecord } from '../../types';
import { downloadFile, toCsv, toJson } from '../../utils/exportFile';
import styles from './ExportButtons.module.css';

interface ExportButtonsProps {
  items: CheckRecord[];
}

export function ExportButtons({ items }: ExportButtonsProps) {
  const handleExportCsv = () => {
    const csv = toCsv(items);
    downloadFile(csv, 'sito-checks.csv', 'text/csv;charset=utf-8');
  };

  const handleExportJson = () => {
    const json = toJson(items);
    downloadFile(json, 'sito-checks.json', 'application/json;charset=utf-8');
  };

  const isDisabled = items.length === 0;

  return (
    <div className={styles.group}>
      <button
        type="button"
        className={styles.btn}
        onClick={handleExportCsv}
        disabled={isDisabled}
      >
        Експортувати CSV
      </button>
      <button
        type="button"
        className={styles.btn}
        onClick={handleExportJson}
        disabled={isDisabled}
      >
        Експортувати JSON
      </button>
    </div>
  );
}
