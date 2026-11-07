import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { TestDataBadge } from '../components/TestDataBadge';
import { MESSENGER_LABELS, RULES_CATALOG, SENDER_CATEGORY_LABELS } from '../mocks/testData';
import { useChecks } from '../state/ChecksContext';
import { useSenders } from '../state/SendersContext';
import type { Messenger } from '../types';
import styles from './OverviewPage.module.css';

const MESSENGER_KEYS: Messenger[] = ['telegram', 'viber', 'whatsapp', 'signal', 'sms', 'other'];

export function OverviewPage() {
  const { checks } = useChecks();
  const { senders } = useSenders();

  const stats = useMemo(() => {
    let fakeCount = 0;
    let suspiciousCount = 0;
    let safeCount = 0;
    let totalScore = 0;

    for (const rec of checks) {
      const effectiveVerdict = rec.manualVerdict ?? rec.verdict;
      if (effectiveVerdict === 'fake') {
        fakeCount += 1;
      } else if (effectiveVerdict === 'suspicious') {
        suspiciousCount += 1;
      } else {
        safeCount += 1;
      }
      totalScore += rec.score;
    }

    const avgScore = checks.length > 0 ? Math.round(totalScore / checks.length) : 0;
    const blacklistedCount = senders.filter((s) => s.category === 'blacklisted').length;

    const byMessenger = MESSENGER_KEYS.map((m) => {
      const count = checks.filter((c) => c.messenger === m).length;
      const pct = checks.length > 0 ? Math.round((count / checks.length) * 100) : 0;
      return { messenger: m, label: MESSENGER_LABELS[m], count, pct };
    }).filter((item) => item.count > 0);

    const bySignal = RULES_CATALOG.map((rule) => {
      const count = checks.filter((c) => c.signals.some((s) => s.kind === rule.kind)).length;
      return {
        ...rule,
        count,
      };
    });

    const watchedSenders = senders
      .filter((s) => s.category === 'blacklisted' || s.category === 'watch')
      .map((s) => {
        const matchCount = checks.filter(
          (c) => c.sender.trim().toLowerCase() === s.handle.trim().toLowerCase()
        ).length;
        return {
          ...s,
          matchCount,
        };
      });

    return {
      total: checks.length,
      fakeCount,
      suspiciousCount,
      safeCount,
      avgScore,
      blacklistedCount,
      byMessenger,
      bySignal,
      watchedSenders,
    };
  }, [checks, senders]);

  return (
    <div className={styles.page}>
      <div className={styles.headerRow}>
        <div>
          <h1 className={styles.title}>Зведення та аналітичні зрізи</h1>
          <p className={styles.subtitle}>
            Агреговані показники за журналом перевірок і реєстром відправників із прямими
            переходами до відфільтрованих вибірок.
          </p>
        </div>
        <TestDataBadge />
      </div>

      <section className={styles.metricsGrid} aria-label="Ключові показники">
        <div className={styles.metricCard}>
          <span className={styles.metricLabel}>Усього перевірок</span>
          <span className={styles.metricValue}>{stats.total}</span>
          <Link to="/history" className={styles.metricLink}>
            Відкрити журнал →
          </Link>
        </div>

        <div className={`${styles.metricCard} ${styles.metricFake}`}>
          <span className={styles.metricLabel}>Виявлено фейків</span>
          <span className={styles.metricValue}>{stats.fakeCount}</span>
          <Link to="/history?verdict=fake" className={styles.metricLink}>
            Фільтр «Фейк» →
          </Link>
        </div>

        <div className={`${styles.metricCard} ${styles.metricSuspicious}`}>
          <span className={styles.metricLabel}>Підозрілі повідомлення</span>
          <span className={styles.metricValue}>{stats.suspiciousCount}</span>
          <Link to="/history?verdict=suspicious" className={styles.metricLink}>
            Фільтр «Підозріло» →
          </Link>
        </div>

        <div className={`${styles.metricCard} ${styles.metricSafe}`}>
          <span className={styles.metricLabel}>Ймовірно безпечні</span>
          <span className={styles.metricValue}>{stats.safeCount}</span>
          <Link to="/history?verdict=safe" className={styles.metricLink}>
            Фільтр «Безпечно» →
          </Link>
        </div>

        <div className={styles.metricCard}>
          <span className={styles.metricLabel}>Середній індекс ризику</span>
          <span className={styles.metricValue}>{stats.avgScore} / 100</span>
          <Link to="/check" className={styles.metricLink}>
            Нова перевірка →
          </Link>
        </div>

        <div className={styles.metricCard}>
          <span className={styles.metricLabel}>У чорному списку</span>
          <span className={styles.metricValue}>{stats.blacklistedCount}</span>
          <Link to="/senders" className={styles.metricLink}>
            Реєстр відправників →
          </Link>
        </div>
      </section>

      <div className={styles.twoCol}>
        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2 className={styles.panelTitle}>Розподіл за месенджерами</h2>
            <Link to="/history" className={styles.smallLink}>
              Усі джерела →
            </Link>
          </div>
          {stats.byMessenger.length === 0 ? (
            <p className={styles.emptyText}>Журнал порожній.</p>
          ) : (
            <ul className={styles.barList}>
              {stats.byMessenger.map((item) => (
                <li key={item.messenger} className={styles.barItem}>
                  <div className={styles.barTop}>
                    <span className={styles.barName}>{item.label}</span>
                    <span className={styles.barMeta}>
                      {item.count} зап. ({item.pct}%)
                    </span>
                  </div>
                  <div className={styles.barTrack}>
                    <div className={styles.barFill} style={{ width: `${item.pct}%` }} />
                  </div>
                  <div className={styles.barAction}>
                    <Link to={`/history?messenger=${item.messenger}`}>
                      Відкрити записи з {item.label} →
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2 className={styles.panelTitle}>Контакти під контролем</h2>
            <Link to="/senders" className={styles.smallLink}>
              Керувати реєстром →
            </Link>
          </div>
          <ul className={styles.sendersList}>
            {stats.watchedSenders.map((s) => (
              <li key={s.id} className={styles.senderRow}>
                <div className={styles.senderTop}>
                  <span className={styles.senderHandle}>{s.handle}</span>
                  <span className={styles.senderBadge}>
                    {SENDER_CATEGORY_LABELS[s.category]}
                  </span>
                </div>
                <p className={styles.senderNote}>{s.note}</p>
                <div className={styles.senderLinks}>
                  <Link to={`/history?q=${encodeURIComponent(s.handle)}`}>
                    Записи в журналі ({s.matchCount}) →
                  </Link>
                  <Link to={`/senders?q=${encodeURIComponent(s.handle)}`}>
                    Картка в реєстрі →
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <h2 className={styles.panelTitle}>Матриця спрацювань ознак маніпуляції</h2>
          <Link to="/rules" className={styles.smallLink}>
            Довідник правил і шаблонів →
          </Link>
        </div>

        {/* Мобільний вигляд: картки (< 720px або режим смартфона) */}
        <div className={styles.signalCardsList}>
          {stats.bySignal.map((item) => (
            <article key={item.kind} className={styles.signalCard}>
              <div className={styles.signalCardTop}>
                <span className={styles.sigName}>{item.label}</span>
                <span className={styles.monoCell}>
                  Вага +{item.weight} · Збігів: {item.count}
                </span>
              </div>
              <p className={styles.sigDesc}>{item.description}</p>
              <div className={styles.signalCardLinks}>
                <Link to={`/history?signal=${item.kind}`}>
                  Записи в журналі ({item.count}) →
                </Link>
                <Link to={`/rules?kind=${item.kind}`}>Опис правила →</Link>
              </div>
            </article>
          ))}
        </div>

        {/* Табличний вигляд (>= 720px) */}
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th scope="col">Індикатор (ознака)</th>
                <th scope="col">Вага</th>
                <th scope="col">Збігів у журналі</th>
                <th scope="col">Зв&apos;язані розділи</th>
              </tr>
            </thead>
            <tbody>
              {stats.bySignal.map((item) => (
                <tr key={item.kind}>
                  <td>
                    <div className={styles.sigName}>{item.label}</div>
                    <div className={styles.sigDesc}>{item.description}</div>
                  </td>
                  <td className={styles.monoCell}>+{item.weight}</td>
                  <td className={styles.monoCell}>{item.count}</td>
                  <td>
                    <div className={styles.rowLinks}>
                      <Link to={`/history?signal=${item.kind}`}>
                        Записи в журналі ({item.count}) →
                      </Link>
                      <Link to={`/rules?kind=${item.kind}`}>Опис правила →</Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
