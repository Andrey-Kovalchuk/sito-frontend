import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AnalysisPanel } from '../components/AnalysisPanel';
import { MessageForm } from '../components/MessageForm';
import { MESSAGE_TEMPLATES } from '../mocks/testData';
import { analyzeMessage } from '../services/mockApi';
import { analysisReducer, initialAnalysisState } from '../state/analysisReducer';
import { useChecks } from '../state/ChecksContext';
import type { CheckRecord, MessageInput, Messenger } from '../types';
import { validateMessage } from '../utils/validate';
import styles from './CheckPage.module.css';

const ALLOWED_MESSENGERS: Messenger[] = [
  'telegram',
  'viber',
  'whatsapp',
  'signal',
  'sms',
  'other',
];

export function CheckPage() {
  const [state, dispatch] = useReducer(analysisReducer, initialAnalysisState);
  const { addCheck, getCheckById } = useChecks();
  const [searchParams, setSearchParams] = useSearchParams();
  const [manualPreset, setManualPreset] = useState<{
    key: string;
    values: MessageInput;
  } | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  const urlPreset = useMemo((): { key: string; values: MessageInput; label?: string } | null => {
    const templateId = searchParams.get('template');
    if (templateId) {
      const tpl = MESSAGE_TEMPLATES.find((t) => t.id === templateId);
      if (tpl) {
        return {
          key: `tpl-${tpl.id}`,
          label: `Завантажено шаблон: «${tpl.title}»`,
          values: {
            text: tpl.text,
            messenger: tpl.messenger,
            sender: tpl.sender,
          },
        };
      }
    }

    const fromCheckId = searchParams.get('fromCheck');
    if (fromCheckId) {
      const rec = getCheckById(fromCheckId);
      if (rec) {
        return {
          key: `chk-${rec.id}`,
          label: `Завантажено дані із запису журналу ${rec.id}`,
          values: {
            text: rec.text,
            messenger: rec.messenger,
            sender: rec.sender,
          },
        };
      }
    }

    const senderParam = searchParams.get('sender');
    const messengerParam = searchParams.get('messenger') as Messenger | null;
    if (senderParam) {
      const validMessenger =
        messengerParam && ALLOWED_MESSENGERS.includes(messengerParam)
          ? messengerParam
          : 'telegram';
      return {
        key: `snd-${senderParam}-${validMessenger}`,
        label: `Підставлено контакт із реєстру: ${senderParam}`,
        values: {
          text: '',
          messenger: validMessenger,
          sender: senderParam,
        },
      };
    }

    return null;
  }, [searchParams, getCheckById]);

  const activePreset = manualPreset ?? urlPreset;

  const handleSelectTemplate = (templateId: string) => {
    const tpl = MESSAGE_TEMPLATES.find((t) => t.id === templateId);
    if (!tpl) {
      return;
    }
    abortControllerRef.current?.abort();
    dispatch({ type: 'RESET' });
    setManualPreset({
      key: `manual-${tpl.id}-${Date.now()}`,
      values: {
        text: tpl.text,
        messenger: tpl.messenger,
        sender: tpl.sender,
      },
    });
  };

  const executeAnalysis = useCallback(async (input: MessageInput) => {
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const result = await analyzeMessage(input, controller.signal);
      dispatch({ type: 'RESOLVE', result });
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }
      const message = err instanceof Error ? err.message : 'Тестова помилка сервісу перевірки';
      dispatch({ type: 'REJECT', message });
    }
  }, []);

  const handleSubmit = (input: MessageInput) => {
    if (state.status === 'analyzing') {
      return;
    }

    const errors = validateMessage(input);
    if (Object.keys(errors).length > 0) {
      dispatch({ type: 'SUBMIT_INVALID', errors });
      return;
    }

    dispatch({ type: 'SUBMIT_VALID', input });
    void executeAnalysis(input);
  };

  const handleInputChange = () => {
    if (state.status === 'invalid') {
      dispatch({ type: 'INPUT_CHANGED' });
    }
  };

  const handleCancel = () => {
    abortControllerRef.current?.abort();
    dispatch({ type: 'CANCEL' });
  };

  const handleRetry = () => {
    if (state.status !== 'error') {
      return;
    }
    const currentInput = state.input;
    dispatch({ type: 'RETRY' });
    void executeAnalysis(currentInput);
  };

  const handleSave = () => {
    if (state.status !== 'result') {
      return;
    }
    // test data
    const newRecord: CheckRecord = {
      id: `chk-${Date.now()}`,
      createdAt: new Date().toISOString(),
      text: state.input.text,
      messenger: state.input.messenger,
      sender: state.input.sender,
      verdict: state.result.verdict,
      score: state.result.score,
      signals: state.result.signals,
      manualVerdict: state.manualVerdict,
      note: state.note,
      isTestData: true, // test data
    };
    addCheck(newRecord);
    dispatch({ type: 'SAVE', recordId: newRecord.id });
  };

  const handleReset = () => {
    abortControllerRef.current?.abort();
    setManualPreset(null);
    if (searchParams.toString()) {
      setSearchParams({}, { replace: true });
    }
    dispatch({ type: 'RESET' });
  };

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div className={styles.headerTop}>
          <div>
            <h1 className={styles.title}>Перевірка повідомлення</h1>
            <p className={styles.subtitle}>
              Вставте текст підозрілого повідомлення, щоб виявити ознаки маніпуляції чи фішингу.
            </p>
          </div>
          <div className={styles.quickNavLinks}>
            <Link to="/rules">Довідник правил і шаблонів →</Link>
            <Link to="/senders">Реєстр відправників →</Link>
          </div>
        </div>

        <div className={styles.templatesBar}>
          <span className={styles.templatesLabel}>Швидке заповнення з шаблону:</span>
          <div className={styles.templatesButtons}>
            {MESSAGE_TEMPLATES.map((tpl) => (
              <button
                key={tpl.id}
                type="button"
                className={styles.templateChip}
                onClick={() => handleSelectTemplate(tpl.id)}
                disabled={state.status === 'analyzing'}
              >
                {tpl.title}
              </button>
            ))}
          </div>
        </div>

        {urlPreset?.label && !manualPreset && (
          <div className={styles.presetNotice}>
            <span>{urlPreset.label}</span>
          </div>
        )}
      </div>

      <div className={styles.grid}>
        <div className={styles.formCol}>
          <MessageForm
            onSubmit={handleSubmit}
            onInputChange={handleInputChange}
            onReset={handleReset}
            disabled={state.status === 'analyzing'}
            errors={state.status === 'invalid' ? state.errors : undefined}
            initialValues={activePreset?.values}
            presetKey={activePreset?.key}
          />
        </div>

        <div className={styles.panelCol}>
          <AnalysisPanel
            state={state}
            dispatch={dispatch}
            onCancel={handleCancel}
            onRetry={handleRetry}
            onSave={handleSave}
            onReset={handleReset}
          />
        </div>
      </div>
    </div>
  );
}
