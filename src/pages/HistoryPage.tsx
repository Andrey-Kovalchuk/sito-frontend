import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ChecksTable } from '../components/ChecksTable';
import { ExportButtons } from '../components/ExportButtons';
import {
  FilterBar,
  type FilterState,
  type MessengerFilter,
  type SignalFilter,
  type VerdictFilter,
} from '../components/FilterBar';
import { useChecks } from '../state/ChecksContext';
import styles from './HistoryPage.module.css';

const ALLOWED_VERDICTS: VerdictFilter[] = ['all', 'fake', 'suspicious', 'safe'];
const ALLOWED_MESSENGERS: MessengerFilter[] = [
  'all',
  'telegram',
  'viber',
  'whatsapp',
  'signal',
  'sms',
  'other',
];
const ALLOWED_SIGNALS: SignalFilter[] = [
  'all',
  'urgency',
  'payment_data',
  'suspicious_link',
  'prize',
  'impersonation',
  'hidden_chars',
];

export function HistoryPage() {
  const { checks, resetToSeed } = useChecks();
  const [searchParams, setSearchParams] = useSearchParams();

  const rawVerdict = searchParams.get('verdict') as VerdictFilter | null;
  const verdict: VerdictFilter =
    rawVerdict && ALLOWED_VERDICTS.includes(rawVerdict) ? rawVerdict : 'all';

  const rawMessenger = searchParams.get('messenger') as MessengerFilter | null;
  const messenger: MessengerFilter =
    rawMessenger && ALLOWED_MESSENGERS.includes(rawMessenger) ? rawMessenger : 'all';

  const rawSignal = searchParams.get('signal') as SignalFilter | null;
  const signal: SignalFilter =
    rawSignal && ALLOWED_SIGNALS.includes(rawSignal) ? rawSignal : 'all';

  const query = searchParams.get('q') ?? '';

  const filterValue: FilterState = { verdict, messenger, signal, query };

  const handleFilterChange = (next: FilterState) => {
    const nextParams = new URLSearchParams();
    if (next.verdict !== 'all') {
      nextParams.set('verdict', next.verdict);
    }
    if (next.messenger !== 'all') {
      nextParams.set('messenger', next.messenger);
    }
    if (next.signal !== 'all') {
      nextParams.set('signal', next.signal);
    }
    if (next.query.trim()) {
      nextParams.set('q', next.query);
    }
    setSearchParams(nextParams, { replace: true });
  };

  const filteredChecks = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return checks.filter((item) => {
      const effectiveVerdict = item.manualVerdict ?? item.verdict;
      if (verdict !== 'all' && effectiveVerdict !== verdict) {
        return false;
      }
      if (messenger !== 'all' && item.messenger !== messenger) {
        return false;
      }
      if (signal !== 'all' && !item.signals.some((s) => s.kind === signal)) {
        return false;
      }
      if (normalizedQuery) {
        const inText = item.text.toLowerCase().includes(normalizedQuery);
        const inSender = item.sender.toLowerCase().includes(normalizedQuery);
        return inText || inSender;
      }
      return true;
    });
  }, [checks, verdict, messenger, signal, query]);

  return (
    <div className={styles.page}>
      <div className={styles.topRow}>
        <div>
          <h1 className={styles.title}>Журнал перевірок</h1>
          <p className={styles.countText}>
            Показано записів: {filteredChecks.length} із {checks.length}
          </p>
        </div>
        <div className={styles.topActions}>
          <ExportButtons items={filteredChecks} />
          <button type="button" className={styles.seedBtn} onClick={resetToSeed}>
            Відновити тестові записи
          </button>
        </div>
      </div>

      <FilterBar value={filterValue} onChange={handleFilterChange} />

      <ChecksTable items={filteredChecks} />
    </div>
  );
}
