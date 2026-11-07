import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { HighlightedText } from '../components/HighlightedText';
import { RiskScale } from '../components/RiskScale';
import { SignalsList } from '../components/SignalsList';
import { TestDataBadge } from '../components/TestDataBadge';
import { VerdictEditor } from '../components/VerdictEditor';
import { VerdictLabel } from '../components/VerdictLabel';
import { MESSENGER_LABELS, SENDER_CATEGORY_LABELS, SIGNAL_LABELS } from '../mocks/testData';
import { useChecks } from '../state/ChecksContext';
import { useSenders } from '../state/SendersContext';
import type { Verdict } from '../types';
import styles from './CheckDetailsPage.module.css';

export function CheckDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { checks, getCheckById, updateCheck, removeCheck } = useChecks();
  const { findSenderByHandle, addSender } = useSenders();
  const [editing, setEditing] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const record = id ? getCheckById(id) : undefined;
  const senderEntry = record?.sender ? findSenderByHandle(record.sender) : undefined;

  const relatedRecords = useMemo(() => {
    if (!record) {
      return [];
    }
    const recordSignalKinds = new Set(record.signals.map((s) => s.kind));
    const normalizedSender = record.sender.trim().toLowerCase();

    return checks
      .filter((other) => other.id !== record.id)
      .map((other) => {
        const sameSender =
          normalizedSender.length > 0 &&
          other.sender.trim().toLowerCase() === normalizedSender;
        const sharedSignals = other.signals.filter((s) => recordSignalKinds.has(s.kind));
        return {
          record: other,
          sameSender,
          sharedSignals,
          relevance: (sameSender ? 10 : 0) + sharedSignals.length,
        };
      })
      .filter((item) => item.relevance > 0)
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, 4);
  }, [checks, record]);

  if (!record) {
    return (
      <div className={styles.notFoundBox}>
        <h1 className={styles.title}>Запис не знайдено у журналі.</h1>
        <p className={styles.backRow}>
          <Link to="/history">Повернутися до журналу</Link>
        </p>
      </div>
    );
  }

  const effectiveVerdict = record.manualVerdict ?? record.verdict;

  const handleApplyEdit = (manualVerdict: Verdict, note: string) => {
    updateCheck(record.id, manualVerdict, note);
    setEditing(false);
  };

  const handleConfirmDelete = () => {
    removeCheck(record.id);
    setConfirmOpen(false);
    navigate('/history', { replace: true });
  };

  const handleAddSenderToBlacklist = () => {
    if (!record.sender.trim()) {
      return;
    }
    addSender({
      handle: record.sender.trim(),
      messenger: record.messenger,
      category: 'blacklisted',
      note: `Додано з деталей запису ${record.id} [test data]`,
    });
  };

  return (
    <div className={styles.page}>
      <div className={styles.breadcrumbs}>
        <Link to="/history">← До журналу перевірок</Link>
        <Link to={`/check?fromCheck=${record.id}`} className={styles.recheckLink}>
          Завантажити у форму перевірки →
        </Link>
      </div>

      <article className={styles.card}>
        <div className={styles.headerRow}>
          <div>
            <h1 className={styles.title}>Запис {record.id}</h1>
            <p className={styles.metaText}>
              Дата: {record.createdAt} · Джерело:{' '}
              <Link to={`/history?messenger=${record.messenger}`}>
                {MESSENGER_LABELS[record.messenger]}
              </Link>{' '}
              · Відправник: {record.sender || 'Не вказано'}
            </p>
          </div>
          <TestDataBadge />
        </div>

        <div className={styles.verdictBlock}>
          <div className={styles.verdictTop}>
            <VerdictLabel verdict={effectiveVerdict} />
            {record.manualVerdict && (
              <span className={styles.manualInfo}>
                Ручна оцінка (автоматична: {record.verdict})
              </span>
            )}
          </div>
          <RiskScale score={record.score} verdict={effectiveVerdict} />
        </div>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Статус відправника в Реєстрі</h2>
          <div className={styles.senderBox}>
            {record.sender ? (
              <>
                <div className={styles.senderInfoRow}>
                  <span className={styles.senderHandle}>{record.sender}</span>
                  <span className={styles.senderBadge}>
                    {senderEntry
                      ? SENDER_CATEGORY_LABELS[senderEntry.category]
                      : 'Не зареєстровано в реєстрі'}
                  </span>
                </div>
                {senderEntry && <p className={styles.senderNote}>{senderEntry.note}</p>}
                <div className={styles.senderActions}>
                  {(!senderEntry || senderEntry.category !== 'blacklisted') && (
                    <button
                      type="button"
                      className={styles.smallBtn}
                      onClick={handleAddSenderToBlacklist}
                    >
                      Додати в чорний список
                    </button>
                  )}
                  <Link to={`/senders?q=${encodeURIComponent(record.sender)}`}>
                    Відкрити в Реєстрі відправників →
                  </Link>
                  <Link to={`/history?q=${encodeURIComponent(record.sender)}`}>
                    Усі записи від цього контакту →
                  </Link>
                </div>
              </>
            ) : (
              <p className={styles.senderNote}>Відправника для цього запису не вказано.</p>
            )}
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Текст повідомлення</h2>
          <HighlightedText
            text={record.text}
            fragments={record.signals.map((s) => s.fragment)}
          />
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Виявлені ознаки ({record.signals.length})</h2>
          <SignalsList signals={record.signals} />
        </section>

        {record.note && !editing && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Нотатка</h2>
            <p className={styles.noteContent}>{record.note}</p>
          </section>
        )}

        {relatedRecords.length > 0 && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              Пов&apos;язані записи в журналі ({relatedRecords.length})
            </h2>
            <div className={styles.relatedGrid}>
              {relatedRecords.map(({ record: rel, sameSender, sharedSignals }) => (
                <div key={rel.id} className={styles.relatedCard}>
                  <div className={styles.relatedTop}>
                    <Link to={`/history/${rel.id}`} className={styles.relatedId}>
                      Запис {rel.id}
                    </Link>
                    <VerdictLabel verdict={rel.manualVerdict ?? rel.verdict} />
                  </div>
                  <p className={styles.relatedMeta}>
                    {MESSENGER_LABELS[rel.messenger]} · {rel.sender || 'Невідомий'}
                  </p>
                  <p className={styles.relatedReason}>
                    {sameSender
                      ? 'Спільний відправник'
                      : `Спільні ознаки: ${sharedSignals.map((s) => SIGNAL_LABELS[s.kind]).join(', ')}`}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {editing ? (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Редагування оцінки та нотатки</h2>
            <VerdictEditor
              value={effectiveVerdict}
              initialNote={record.note}
              onApply={handleApplyEdit}
              onCancel={() => setEditing(false)}
            />
          </section>
        ) : (
          <div className={styles.actions}>
            <button
              type="button"
              className={styles.secondaryBtn}
              onClick={() => setEditing(true)}
            >
              Змінити оцінку
            </button>
            <button
              type="button"
              className={styles.dangerBtn}
              onClick={() => setConfirmOpen(true)}
            >
              Видалити запис
            </button>
          </div>
        )}
      </article>

      <ConfirmDialog
        open={confirmOpen}
        title="Видалення запису з журналу"
        description={`Ви дійсно бажаєте видалити запис ${record.id}? Цю дію неможливо скасувати.`}
        confirmLabel="Видалити запис"
        cancelLabel="Скасувати"
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
