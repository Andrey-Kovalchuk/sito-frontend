import { useMemo, useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { TestDataBadge } from '../components/TestDataBadge';
import { MESSENGER_LABELS, SENDER_CATEGORY_LABELS } from '../mocks/testData';
import { useChecks } from '../state/ChecksContext';
import { useSenders } from '../state/SendersContext';
import type { Messenger, SenderCategory } from '../types';
import styles from './SendersPage.module.css';

type CategoryFilter = 'all' | SenderCategory;
const MESSENGER_KEYS: Messenger[] = ['telegram', 'viber', 'whatsapp', 'signal', 'sms', 'other'];
const CATEGORY_KEYS: SenderCategory[] = ['blacklisted', 'watch', 'trusted'];

export function SendersPage() {
  const { senders, addSender, updateSenderCategory, removeSender, resetSenders } = useSenders();
  const { checks } = useChecks();
  const [searchParams, setSearchParams] = useSearchParams();

  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const query = searchParams.get('q') ?? '';

  const [newHandle, setNewHandle] = useState('');
  const [newMessenger, setNewMessenger] = useState<Messenger>('telegram');
  const [newCategory, setNewCategory] = useState<SenderCategory>('blacklisted');
  const [newNote, setNewNote] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const handleQueryChange = (value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value.trim()) {
      next.set('q', value);
    } else {
      next.delete('q');
    }
    setSearchParams(next, { replace: true });
  };

  const handleAddSender = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = newHandle.trim();
    if (!trimmed) {
      setFormError('Введіть ім’я, номер або @нікнейм відправника.');
      return;
    }
    if (trimmed.length > 64 || /[<>]/.test(trimmed)) {
      setFormError('Відправник має бути до 64 символів без символів < або >.');
      return;
    }

    setFormError(null);
    addSender({
      handle: trimmed,
      messenger: newMessenger,
      category: newCategory,
      note: newNote.trim(),
    });
    setNewHandle('');
    setNewNote('');
  };

  const enrichedSenders = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return senders
      .filter((s) => {
        if (categoryFilter !== 'all' && s.category !== categoryFilter) {
          return false;
        }
        if (normalizedQuery) {
          return (
            s.handle.toLowerCase().includes(normalizedQuery) ||
            s.note.toLowerCase().includes(normalizedQuery)
          );
        }
        return true;
      })
      .map((s) => {
        const matchCount = checks.filter(
          (c) => c.sender.trim().toLowerCase() === s.handle.trim().toLowerCase()
        ).length;
        return {
          ...s,
          matchCount,
        };
      });
  }, [senders, checks, categoryFilter, query]);

  return (
    <div className={styles.page}>
      <div className={styles.topRow}>
        <div>
          <h1 className={styles.title}>Реєстр відправників</h1>
          <p className={styles.subtitle}>
            Облік підозрілих, заблокованих та довірених контактів із підрахунком їхніх повідомлень у
            журналі.
          </p>
        </div>
        <div className={styles.topActions}>
          <TestDataBadge />
          <button type="button" className={styles.resetBtn} onClick={resetSenders}>
            Скинути реєстр до початкових даних
          </button>
        </div>
      </div>

      <section className={styles.addSection} aria-label="Додавання відправника">
        <h2 className={styles.sectionTitle}>Додати або оновити контакт у реєстрі</h2>
        <form className={styles.addForm} onSubmit={handleAddSender} noValidate>
          <div className={styles.formGrid}>
            <div className={styles.field}>
              <label htmlFor="sender-handle-input" className={styles.label}>
                Відправник (ім&apos;я, номер, @нікнейм)
              </label>
              <input
                id="sender-handle-input"
                type="text"
                className={styles.input}
                placeholder="Наприклад: Тест-Банк Інфо"
                value={newHandle}
                onChange={(e) => {
                  setNewHandle(e.target.value);
                  setFormError(null);
                }}
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="sender-messenger-select" className={styles.label}>
                Месенджер
              </label>
              <select
                id="sender-messenger-select"
                className={styles.select}
                value={newMessenger}
                onChange={(e) => setNewMessenger(e.target.value as Messenger)}
              >
                {MESSENGER_KEYS.map((m) => (
                  <option key={m} value={m}>
                    {MESSENGER_LABELS[m]}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.field}>
              <label htmlFor="sender-category-select" className={styles.label}>
                Категорія довіри
              </label>
              <select
                id="sender-category-select"
                className={styles.select}
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as SenderCategory)}
              >
                {CATEGORY_KEYS.map((cat) => (
                  <option key={cat} value={cat}>
                    {SENDER_CATEGORY_LABELS[cat]}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.field}>
              <label htmlFor="sender-note-input" className={styles.label}>
                Примітка
              </label>
              <input
                id="sender-note-input"
                type="text"
                className={styles.input}
                placeholder="Короткий опис джерела"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
              />
            </div>
          </div>

          {formError && (
            <p className={styles.errorText} role="alert">
              {formError}
            </p>
          )}

          <div className={styles.formActions}>
            <button type="submit" className={styles.primaryBtn}>
              Додати в реєстр
            </button>
          </div>
        </form>
      </section>

      <div className={styles.filterBar}>
        <div className={styles.field}>
          <label htmlFor="senders-filter-category" className={styles.label}>
            Фільтр за категорією
          </label>
          <select
            id="senders-filter-category"
            className={styles.select}
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as CategoryFilter)}
          >
            <option value="all">Усі категорії ({senders.length})</option>
            <option value="blacklisted">У чорному списку</option>
            <option value="watch">Під наглядом</option>
            <option value="trusted">Довірений</option>
          </select>
        </div>

        <div className={styles.field}>
          <label htmlFor="senders-filter-query" className={styles.label}>
            Пошук за контактом або приміткою
          </label>
          <input
            id="senders-filter-query"
            type="search"
            className={styles.input}
            placeholder="Введіть ім'я або номер"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
          />
        </div>
      </div>

      {enrichedSenders.length === 0 ? (
        <div className={styles.emptyBox} role="status">
          Контактів за цим запитом не знайдено.
        </div>
      ) : (
        <div className={styles.cardsGrid}>
          {enrichedSenders.map((item) => (
            <article key={item.id} className={styles.senderCard}>
              <div className={styles.cardHeader}>
                <div>
                  <h3 className={styles.handleTitle}>{item.handle}</h3>
                  <span className={styles.messengerMeta}>
                    Джерело: {MESSENGER_LABELS[item.messenger]}
                  </span>
                </div>
                <span
                  className={
                    item.category === 'blacklisted'
                      ? `${styles.catBadge} ${styles.catBlacklisted}`
                      : item.category === 'watch'
                        ? `${styles.catBadge} ${styles.catWatch}`
                        : `${styles.catBadge} ${styles.catTrusted}`
                  }
                >
                  {SENDER_CATEGORY_LABELS[item.category]}
                </span>
              </div>

              <p className={styles.noteText}>{item.note}</p>

              <div className={styles.crossLinks}>
                <Link to={`/history?q=${encodeURIComponent(item.handle)}`}>
                  Перевірки в журналі ({item.matchCount}) →
                </Link>
                <Link
                  to={`/check?sender=${encodeURIComponent(item.handle)}&messenger=${item.messenger}`}
                >
                  Нова перевірка від контакту →
                </Link>
              </div>

              <div className={styles.cardFooter}>
                <label className={styles.inlineLabel}>
                  Статус:
                  <select
                    aria-label={`Категорія для ${item.handle}`}
                    className={styles.smallSelect}
                    value={item.category}
                    onChange={(e) =>
                      updateSenderCategory(item.id, e.target.value as SenderCategory)
                    }
                  >
                    {CATEGORY_KEYS.map((cat) => (
                      <option key={cat} value={cat}>
                        {SENDER_CATEGORY_LABELS[cat]}
                      </option>
                    ))}
                  </select>
                </label>

                <button
                  type="button"
                  className={styles.deleteBtn}
                  onClick={() => removeSender(item.id)}
                >
                  Видалити
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
