import type { Dispatch } from 'react';
import { Link } from 'react-router-dom';
import { SENDER_CATEGORY_LABELS } from '../mocks/testData';
import type { AnalysisAction } from '../state/analysisReducer';
import { useSenders } from '../state/SendersContext';
import type { AnalysisState } from '../types';
import { HighlightedText } from './HighlightedText';
import { RiskScale } from './RiskScale';
import { SignalsList } from './SignalsList';
import { TestDataBadge } from './TestDataBadge';
import { VerdictEditor } from './VerdictEditor';
import { VerdictLabel } from './VerdictLabel';
import styles from './AnalysisPanel.module.css';

interface AnalysisPanelProps {
  state: AnalysisState;
  dispatch: Dispatch<AnalysisAction>;
  onCancel: () => void;
  onRetry: () => void;
  onSave: () => void;
  onReset: () => void;
}

export function AnalysisPanel({
  state,
  dispatch,
  onCancel,
  onRetry,
  onSave,
  onReset,
}: AnalysisPanelProps) {
  const { findSenderByHandle, addSender } = useSenders();

  const currentSenderHandle =
    state.status === 'result' || state.status === 'editing' ? state.input.sender.trim() : '';
  const registeredSender = currentSenderHandle
    ? findSenderByHandle(currentSenderHandle)
    : undefined;

  const handleBlacklistSender = () => {
    if (state.status !== 'result' || !state.input.sender.trim()) {
      return;
    }
    addSender({
      handle: state.input.sender.trim(),
      messenger: state.input.messenger,
      category: 'blacklisted',
      note: 'Додано зі сторінки перевірки після аналізу повідомлення [test data]',
    });
  };

  return (
    <section className={styles.panel} aria-label="Результат перевірки" aria-live="polite">
      <div className={styles.panelHeader}>
        <h2 className={styles.panelTitle}>Висновок перевірки</h2>
        <TestDataBadge compact />
      </div>

      {state.status === 'idle' && (
        <div className={styles.idleBox}>
          <p className={styles.idleText}>
            Вставте текст повідомлення ліворуч і натисніть «Перевірити». Сито шукає: тиск
            терміновістю, запит даних картки, підозрілі посилання, обіцянки виграшу, видавання себе
            за іншу особу, приховані символи.
          </p>
          <div className={styles.idleLinks}>
            <Link to="/rules">Переглянути довідник ознак і шаблони →</Link>
            <Link to="/overview">Зведення за журналом →</Link>
          </div>
        </div>
      )}

      {state.status === 'invalid' && (
        <div className={styles.invalidBox} role="status">
          <p className={styles.statusHeading}>Виправте помилки у формі</p>
          <ul className={styles.errorList}>
            {Object.values(state.errors).map((err, idx) => (err ? <li key={idx}>{err}</li> : null))}
          </ul>
        </div>
      )}

      {state.status === 'analyzing' && (
        <div className={styles.analyzingBox}>
          <p className={styles.statusHeading}>Перевіряємо…</p>
          <div className={styles.progressTrack} role="progressbar" aria-label="Виконується аналіз">
            <div className={styles.progressFill} />
          </div>
          <div className={styles.actions}>
            <button type="button" className={styles.secondaryBtn} onClick={onCancel}>
              Скасувати
            </button>
          </div>
        </div>
      )}

      {state.status === 'result' && (
        <div className={styles.resultBox}>
          <div className={styles.verdictRow}>
            <VerdictLabel verdict={state.manualVerdict ?? state.result.verdict} />
            {state.manualVerdict && <span className={styles.manualTag}>Змінено вручну</span>}
          </div>

          <RiskScale
            score={state.result.score}
            verdict={state.manualVerdict ?? state.result.verdict}
          />

          <div className={styles.sectionBlock}>
            <h3 className={styles.subHeading}>Виявлені ознаки ({state.result.signals.length})</h3>
            <SignalsList signals={state.result.signals} />
          </div>

          <div className={styles.sectionBlock}>
            <h3 className={styles.subHeading}>Розбір тексту</h3>
            <HighlightedText
              text={state.input.text}
              fragments={state.result.signals.map((s) => s.fragment)}
            />
          </div>

          {currentSenderHandle && (
            <div className={styles.senderRegistryBox}>
              <div className={styles.senderRegistryRow}>
                <span className={styles.senderRegistryLabel}>
                  Відправник «{currentSenderHandle}»:
                </span>
                {registeredSender ? (
                  <span className={styles.senderRegistryStatus}>
                    {SENDER_CATEGORY_LABELS[registeredSender.category]}
                  </span>
                ) : (
                  <span className={styles.senderRegistryStatus}>ще не в реєстрі</span>
                )}
              </div>
              <div className={styles.senderRegistryLinks}>
                {(!registeredSender || registeredSender.category !== 'blacklisted') && (
                  <button
                    type="button"
                    className={styles.inlineBtn}
                    onClick={handleBlacklistSender}
                  >
                    Додати відправника в чорний список
                  </button>
                )}
                <Link to={`/senders?q=${encodeURIComponent(currentSenderHandle)}`}>
                  Перейти в Реєстр відправників →
                </Link>
                <Link to={`/history?q=${encodeURIComponent(currentSenderHandle)}`}>
                  Пошук контакту в Журналі →
                </Link>
              </div>
            </div>
          )}

          {state.note && (
            <div className={styles.noteBox}>
              <span className={styles.noteLabel}>Нотатка:</span> {state.note}
            </div>
          )}

          <div className={styles.actions}>
            <button type="button" className={styles.primaryBtn} onClick={onSave}>
              Зберегти в журнал
            </button>
            <button
              type="button"
              className={styles.secondaryBtn}
              onClick={() => dispatch({ type: 'START_EDIT' })}
            >
              Змінити оцінку
            </button>
            <button type="button" className={styles.secondaryBtn} onClick={onReset}>
              Нова перевірка
            </button>
          </div>

          <p className={styles.disclaimer}>
            Оцінка демонстраційна: аналіз виконує тестова заглушка.
          </p>
        </div>
      )}

      {state.status === 'editing' && (
        <div className={styles.resultBox}>
          <div className={styles.verdictRow}>
            <VerdictLabel verdict={state.manualVerdict ?? state.result.verdict} />
          </div>
          <VerdictEditor
            value={state.manualVerdict ?? state.result.verdict}
            initialNote={state.note}
            onApply={(manualVerdict, note) =>
              dispatch({ type: 'APPLY_EDIT', manualVerdict, note })
            }
            onCancel={() => dispatch({ type: 'CANCEL_EDIT' })}
          />
        </div>
      )}

      {state.status === 'saved' && (
        <div className={styles.savedBox} role="status">
          <p className={styles.statusHeading}>Збережено в журнал</p>
          <p className={styles.savedDesc}>
            Запис доступний у журналі перевірок для перегляду та експорту.
          </p>
          <div className={styles.actions}>
            <Link to={`/history/${state.recordId}`} className={styles.linkBtn}>
              Відкрити запис
            </Link>
            <Link to="/overview" className={styles.secondaryLinkBtn}>
              Переглянути зведення
            </Link>
            <button type="button" className={styles.secondaryBtn} onClick={onReset}>
              Нова перевірка
            </button>
          </div>
        </div>
      )}

      {state.status === 'error' && (
        <div className={styles.errorBox} role="alert">
          <p className={styles.statusHeading}>
            Не вдалося виконати перевірку (тестова помилка)
          </p>
          <p className={styles.errorDetail}>{state.message}</p>
          <div className={styles.actions}>
            <button type="button" className={styles.primaryBtn} onClick={onRetry}>
              Повторити
            </button>
            <button type="button" className={styles.secondaryBtn} onClick={onReset}>
              Нова перевірка
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
