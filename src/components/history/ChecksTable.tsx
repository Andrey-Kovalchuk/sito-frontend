import { Link } from 'react-router-dom';
import { MESSENGER_LABELS, SENDER_CATEGORY_LABELS } from '../../mocks/testData';
import { useSenders } from '../../state/SendersContext';
import type { CheckRecord } from '../../types';
import { defangUrl, sanitizeText } from '../../utils/sanitize';
import { VerdictLabel } from '../check/VerdictLabel';
import styles from './ChecksTable.module.css';

interface ChecksTableProps {
  items: CheckRecord[];
}

function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }
  const yyyy = date.getUTCFullYear();
  const mm = String(date.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(date.getUTCDate()).padStart(2, '0');
  const hh = String(date.getUTCHours()).padStart(2, '0');
  const min = String(date.getUTCMinutes()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
}

function makePreview(raw: string): string {
  const { cleanText } = sanitizeText(raw);
  const safe = defangUrl(cleanText);
  return safe.length > 90 ? `${safe.slice(0, 90)}…` : safe;
}

export function ChecksTable({ items }: ChecksTableProps) {
  const { findSenderByHandle } = useSenders();

  if (items.length === 0) {
    return (
      <div className={styles.emptyBox} role="status">
        Записів за цим фільтром немає.
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.cardsList}>
        {items.map((item) => {
          const effectiveVerdict = item.manualVerdict ?? item.verdict;
          const senderRec = item.sender ? findSenderByHandle(item.sender) : undefined;
          return (
            <article key={item.id} className={styles.card}>
              <div className={styles.cardTop}>
                <span className={styles.monoDate}>{formatDate(item.createdAt)}</span>
                <VerdictLabel verdict={effectiveVerdict} />
              </div>
              <div className={styles.cardMeta}>
                <span>{MESSENGER_LABELS[item.messenger]}</span>
                <span>·</span>
                {item.sender ? (
                  <Link
                    to={`/senders?q=${encodeURIComponent(item.sender)}`}
                    className={styles.senderLink}
                  >
                    {item.sender}
                  </Link>
                ) : (
                  <span>Невідомий відправник</span>
                )}
                {senderRec && (
                  <span className={styles.senderTag}>
                    {SENDER_CATEGORY_LABELS[senderRec.category]}
                  </span>
                )}
                <span>·</span>
                <span className={styles.monoScore}>Ризик: {item.score}</span>
              </div>
              <p className={styles.cardPreview}>{makePreview(item.text)}</p>
              <div className={styles.cardActions}>
                <Link to={`/history/${item.id}`} className={styles.detailsLink}>
                  Деталі перевірки
                </Link>
              </div>
            </article>
          );
        })}
      </div>

      <table className={styles.table}>
        <thead>
          <tr>
            <th scope="col">Дата</th>
            <th scope="col">Джерело / Відправник</th>
            <th scope="col">Повідомлення</th>
            <th scope="col">Ризик</th>
            <th scope="col">Вердикт</th>
            <th scope="col">Дія</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const effectiveVerdict = item.manualVerdict ?? item.verdict;
            const senderRec = item.sender ? findSenderByHandle(item.sender) : undefined;
            return (
              <tr key={item.id}>
                <td className={styles.monoDate}>{formatDate(item.createdAt)}</td>
                <td>
                  <div className={styles.sourceCell}>
                    <span className={styles.sourceName}>{MESSENGER_LABELS[item.messenger]}</span>
                    {item.sender ? (
                      <Link
                        to={`/senders?q=${encodeURIComponent(item.sender)}`}
                        className={styles.senderLink}
                      >
                        {item.sender}
                      </Link>
                    ) : (
                      <span className={styles.senderName}>Невідомий відправник</span>
                    )}
                    {senderRec && (
                      <span className={styles.senderTag}>
                        {SENDER_CATEGORY_LABELS[senderRec.category]}
                      </span>
                    )}
                  </div>
                </td>
                <td className={styles.previewCell}>{makePreview(item.text)}</td>
                <td className={styles.monoScore}>{item.score} / 100</td>
                <td>
                  <VerdictLabel verdict={effectiveVerdict} />
                </td>
                <td>
                  <Link to={`/history/${item.id}`} className={styles.detailsLink}>
                    Відкрити
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
