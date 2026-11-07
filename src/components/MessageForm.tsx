import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { MESSENGER_LABELS, SENDER_CATEGORY_LABELS } from '../mocks/testData';
import { useSenders } from '../state/SendersContext';
import type { FieldErrors, MessageInput, Messenger } from '../types';
import styles from './MessageForm.module.css';

interface MessageFormProps {
  onSubmit: (input: MessageInput) => void;
  onInputChange?: () => void;
  onReset?: () => void;
  disabled?: boolean;
  errors?: FieldErrors;
  initialValues?: MessageInput;
  presetKey?: string;
}

const MESSENGER_KEYS: Messenger[] = ['telegram', 'viber', 'whatsapp', 'signal', 'sms', 'other'];

export function MessageForm({
  onSubmit,
  onInputChange,
  onReset,
  disabled = false,
  errors = {},
  initialValues,
  presetKey,
}: MessageFormProps) {
  const [text, setText] = useState(initialValues?.text ?? '');
  const [messenger, setMessenger] = useState<Messenger>(initialValues?.messenger ?? 'telegram');
  const [sender, setSender] = useState(initialValues?.sender ?? '');
  const { findSenderByHandle } = useSenders();

  useEffect(() => {
    if (initialValues) {
      setText(initialValues.text);
      setMessenger(initialValues.messenger);
      setSender(initialValues.sender);
    }
  }, [presetKey, initialValues]);

  const handleTextChange = (value: string) => {
    setText(value);
    onInputChange?.();
  };

  const handleMessengerChange = (value: Messenger) => {
    setMessenger(value);
    onInputChange?.();
  };

  const handleSenderChange = (value: string) => {
    setSender(value);
    onInputChange?.();
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit({
      text,
      messenger,
      sender: sender.trim(),
    });
  };

  const handleClear = () => {
    setText('');
    setMessenger('telegram');
    setSender('');
    onReset?.();
  };

  const trimmedLength = text.trim().length;
  const matchedSender = findSenderByHandle(sender);

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <div className={styles.fieldGroup}>
        <div className={styles.labelRow}>
          <label htmlFor="message-text" className={styles.label}>
            Текст повідомлення
          </label>
          <span className={styles.counter}>{trimmedLength} / 4000</span>
        </div>
        <p id="message-text-hint" className={styles.hint}>
          Вставте повідомлення повністю, разом із посиланнями
        </p>
        <textarea
          id="message-text"
          className={errors.text ? `${styles.textarea} ${styles.inputInvalid}` : styles.textarea}
          rows={7}
          value={text}
          onChange={(e) => handleTextChange(e.target.value)}
          disabled={disabled}
          aria-describedby={
            errors.text ? 'message-text-hint message-text-error' : 'message-text-hint'
          }
          aria-invalid={Boolean(errors.text)}
        />
        {errors.text && (
          <p id="message-text-error" className={styles.errorText} role="alert">
            {errors.text}
          </p>
        )}
      </div>

      <div className={styles.row}>
        <div className={styles.fieldGroup}>
          <label htmlFor="message-messenger" className={styles.label}>
            Звідки повідомлення
          </label>
          <select
            id="message-messenger"
            className={errors.messenger ? `${styles.select} ${styles.inputInvalid}` : styles.select}
            value={messenger}
            onChange={(e) => handleMessengerChange(e.target.value as Messenger)}
            disabled={disabled}
            aria-invalid={Boolean(errors.messenger)}
          >
            {MESSENGER_KEYS.map((key) => (
              <option key={key} value={key}>
                {MESSENGER_LABELS[key]}
              </option>
            ))}
          </select>
          {errors.messenger && (
            <p className={styles.errorText} role="alert">
              {errors.messenger}
            </p>
          )}
        </div>

        <div className={styles.fieldGroup}>
          <label htmlFor="message-sender" className={styles.label}>
            Відправник (необов&apos;язково)
          </label>
          <input
            id="message-sender"
            type="text"
            className={errors.sender ? `${styles.input} ${styles.inputInvalid}` : styles.input}
            placeholder="Ім'я, номер або @нікнейм"
            value={sender}
            onChange={(e) => handleSenderChange(e.target.value)}
            disabled={disabled}
            aria-invalid={Boolean(errors.sender)}
          />
          {errors.sender && (
            <p className={styles.errorText} role="alert">
              {errors.sender}
            </p>
          )}
        </div>
      </div>

      {matchedSender && (
        <div
          className={
            matchedSender.category === 'blacklisted'
              ? `${styles.senderMatch} ${styles.senderBlacklisted}`
              : matchedSender.category === 'watch'
                ? `${styles.senderMatch} ${styles.senderWatch}`
                : `${styles.senderMatch} ${styles.senderTrusted}`
          }
        >
          <div className={styles.senderMatchTop}>
            <span className={styles.senderMatchTitle}>
              Контакт у реєстрі: {SENDER_CATEGORY_LABELS[matchedSender.category]}
            </span>
            <Link
              to={`/senders?q=${encodeURIComponent(matchedSender.handle)}`}
              className={styles.senderMatchLink}
            >
              Відкрити в Реєстрі відправників →
            </Link>
          </div>
          <p className={styles.senderMatchNote}>{matchedSender.note}</p>
        </div>
      )}

      <div className={styles.actions}>
        <button type="submit" className={styles.primaryBtn} disabled={disabled}>
          Перевірити
        </button>
        <button
          type="button"
          className={styles.secondaryBtn}
          onClick={handleClear}
          disabled={disabled}
        >
          Очистити
        </button>
      </div>
    </form>
  );
}
