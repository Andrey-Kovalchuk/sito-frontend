import { Link } from 'react-router-dom';
import styles from './NotFoundPage.module.css';

export function NotFoundPage() {
  return (
    <main className={styles.page}>
      <div className={styles.box}>
        <p className={styles.code}>404</p>
        <h1 className={styles.title}>Сторінку не знайдено.</h1>
        <p className={styles.linkRow}>
          <Link to="/check">Перейти до перевірки</Link>
        </p>
      </div>
    </main>
  );
}
