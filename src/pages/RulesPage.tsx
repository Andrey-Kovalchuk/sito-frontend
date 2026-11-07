import { Link, useSearchParams } from 'react-router-dom';
import { TestDataBadge } from '../components/TestDataBadge';
import { VerdictLabel } from '../components/VerdictLabel';
import { MESSAGE_TEMPLATES, MESSENGER_LABELS, RULES_CATALOG } from '../mocks/testData';
import { useChecks } from '../state/ChecksContext';
import type { SignalKind } from '../types';
import { defangUrl, sanitizeText } from '../utils/sanitize';
import styles from './RulesPage.module.css';

export function RulesPage() {
  const { checks } = useChecks();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedKind = searchParams.get('kind') as SignalKind | null;

  return (
    <div className={styles.page}>
      <div className={styles.headerRow}>
        <div>
          <h1 className={styles.title}>Довідник ознак та шаблони повідомлень</h1>
          <p className={styles.subtitle}>
            Опис евристичних правил заглушки аналізу та набір демонстраційних повідомлень для
            швидкої перевірки.
          </p>
        </div>
        <TestDataBadge />
      </div>

      <section className={styles.section} aria-label="Бібліотека шаблонів повідомлень">
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            Бібліотека типових шаблонів повідомлень (test data)
          </h2>
          <Link to="/check" className={styles.sectionLink}>
            Перейти до порожньої форми →
          </Link>
        </div>

        <div className={styles.templatesGrid}>
          {MESSAGE_TEMPLATES.map((tpl) => {
            const { cleanText } = sanitizeText(tpl.text);
            return (
              <article key={tpl.id} className={styles.templateCard}>
                <div className={styles.templateTop}>
                  <div>
                    <span className={styles.templateCategory}>{tpl.categoryLabel}</span>
                    <h3 className={styles.templateTitle}>{tpl.title}</h3>
                  </div>
                  <VerdictLabel verdict={tpl.expectedVerdict} />
                </div>

                <p className={styles.templateMeta}>
                  Джерело: {MESSENGER_LABELS[tpl.messenger]} · Відправник:{' '}
                  <Link to={`/senders?q=${encodeURIComponent(tpl.sender)}`}>{tpl.sender}</Link>
                </p>

                <div className={styles.templateText}>{defangUrl(cleanText)}</div>

                <div className={styles.templateActions}>
                  <Link to={`/check?template=${tpl.id}`} className={styles.loadBtn}>
                    Завантажити у форму перевірки →
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className={styles.section} aria-label="Довідник індикаторів та правил детекції">
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Довідник індикаторів та правил детекції</h2>
          {selectedKind && (
            <button
              type="button"
              className={styles.clearHighlightBtn}
              onClick={() => setSearchParams({}, { replace: true })}
            >
              Зняти виділення правила
            </button>
          )}
        </div>

        <div className={styles.rulesList}>
          {RULES_CATALOG.map((rule) => {
            const matchCount = checks.filter((c) =>
              c.signals.some((s) => s.kind === rule.kind)
            ).length;
            const isHighlighted = selectedKind === rule.kind;

            return (
              <article
                key={rule.kind}
                className={
                  isHighlighted
                    ? `${styles.ruleCard} ${styles.ruleCardHighlighted}`
                    : styles.ruleCard
                }
              >
                <div className={styles.ruleTop}>
                  <div className={styles.ruleTitleRow}>
                    <h3 className={styles.ruleTitle}>{rule.label}</h3>
                    <code className={styles.ruleCode}>{rule.kind}</code>
                  </div>
                  <span className={styles.ruleWeight}>Вага: +{rule.weight} балів</span>
                </div>

                <p className={styles.ruleDesc}>{rule.description}</p>

                <div className={styles.triggersRow}>
                  <span className={styles.triggersLabel}>Ключові маркери:</span>
                  {rule.triggers.map((t) => (
                    <code key={t} className={styles.triggerChip}>
                      {t}
                    </code>
                  ))}
                </div>

                <div className={styles.ruleFooter}>
                  <Link to={`/history?signal=${rule.kind}`}>
                    Показати записи в журналі з цією ознакою ({matchCount}) →
                  </Link>
                  <Link to="/overview">Переглянути у Зведенні →</Link>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
