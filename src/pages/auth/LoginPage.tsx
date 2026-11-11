import { useState, type FormEvent } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { TestDataBadge } from '../../components/layout/TestDataBadge';
import { TEST_ACCOUNT } from '../../mocks/testData';
import { useAuth } from '../../state/AuthContext';
import { validateLogin, type LoginErrors } from '../../utils/validate';
import styles from './LoginPage.module.css';

interface LocationState {
  from?: string;
}

export function LoginPage() {
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | null;
  const redirectTo = state?.from && state.from !== '/login' ? state.from : '/check';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<LoginErrors>({});
  const [authError, setAuthError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  const handleFillTestCredentials = () => {
    setEmail(TEST_ACCOUNT.user.email);
    setPassword(TEST_ACCOUNT.password);
    setFieldErrors({});
    setAuthError(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    const errors = validateLogin(email, password);
    if (errors.email || errors.password) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setSubmitting(true);
    try {
      await login(email, password);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Помилка входу в систему';
      setAuthError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.page}>
      <main className={styles.card}>
        <div className={styles.header}>
          <div className={styles.logoBlock}>
            <h1 className={styles.logoWord}>Сито</h1>
            <span className={styles.logoBar} aria-hidden="true" />
          </div>
          <p className={styles.subtitle}>
            Перевірка підозрілих повідомлень з месенджерів. Навчальний проєкт.
          </p>
        </div>

        <div className={styles.testAccessBox}>
          <div className={styles.testAccessTop}>
            <span className={styles.testCredentials}>
              Тестовий доступ: {TEST_ACCOUNT.user.email} / {TEST_ACCOUNT.password}
            </span>
            <TestDataBadge compact />
          </div>
          <button
            type="button"
            className={styles.fillBtn}
            onClick={handleFillTestCredentials}
            disabled={submitting}
          >
            Підставити тестові дані
          </button>
        </div>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <div className={styles.field}>
            <label htmlFor="login-email" className={styles.label}>
              Електронна пошта
            </label>
            <input
              id="login-email"
              type="email"
              autoComplete="username"
              className={fieldErrors.email ? `${styles.input} ${styles.inputInvalid}` : styles.input}
              placeholder="student@sito.test"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setFieldErrors((prev) => ({ ...prev, email: undefined }));
              }}
              disabled={submitting}
              aria-invalid={Boolean(fieldErrors.email)}
            />
            {fieldErrors.email && (
              <p className={styles.fieldError} role="alert">
                {fieldErrors.email}
              </p>
            )}
          </div>

          <div className={styles.field}>
            <label htmlFor="login-password" className={styles.label}>
              Пароль
            </label>
            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              className={
                fieldErrors.password ? `${styles.input} ${styles.inputInvalid}` : styles.input
              }
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setFieldErrors((prev) => ({ ...prev, password: undefined }));
              }}
              disabled={submitting}
              aria-invalid={Boolean(fieldErrors.password)}
            />
            {fieldErrors.password && (
              <p className={styles.fieldError} role="alert">
                {fieldErrors.password}
              </p>
            )}
          </div>

          {authError && (
            <div className={styles.authErrorBox} role="alert">
              {authError}
            </div>
          )}

          <button type="submit" className={styles.submitBtn} disabled={submitting}>
            {submitting ? 'Перевірка облікових даних…' : 'Увійти'}
          </button>
        </form>
      </main>
    </div>
  );
}
