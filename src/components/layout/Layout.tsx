import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import styles from './Layout.module.css';

export type ViewportPreset = 'auto' | 'mobile' | 'tablet' | 'desktop';

function getWindowBucket(width: number): 'mobile' | 'tablet' | 'desktop' {
  if (width < 640) return 'mobile';
  if (width < 920) return 'tablet';
  return 'desktop';
}

export function Layout() {
  const [preset, setPreset] = useState<ViewportPreset>('auto');
  const [windowWidth, setWindowWidth] = useState<number>(() =>
    typeof window !== 'undefined' ? window.innerWidth : 1280
  );

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const effectiveViewport: 'mobile' | 'tablet' | 'desktop' =
    preset === 'auto' ? getWindowBucket(windowWidth) : preset;

  const activeWidthLabel =
    preset === 'mobile'
      ? '360px (Смартфон · 1 колонка, картки)'
      : preset === 'tablet'
        ? '768px (Планшет · 2 колонки)'
        : preset === 'desktop'
          ? '1280px (Десктоп · двоколонкова сітка)'
          : `${windowWidth}px · Авто (${
              effectiveViewport === 'mobile'
                ? 'Мобільний <640px'
                : effectiveViewport === 'tablet'
                  ? 'Планшет 640–919px'
                  : 'Десктоп ≥920px'
            })`;

  return (
    <div className={styles.outerStage} data-preset={preset}>
      <div className={styles.viewportToolbar} role="region" aria-label="Перемикач адаптивності екрана">
        <div className={styles.toolbarInner}>
          <span className={styles.toolbarStatus}>
            Адаптивність інтерфейсу: <strong>{activeWidthLabel}</strong>
          </span>
          <div className={styles.toolbarBtns}>
            <button
              type="button"
              className={
                preset === 'auto'
                  ? `${styles.vpBtn} ${styles.vpBtnActive}`
                  : styles.vpBtn
              }
              onClick={() => setPreset('auto')}
            >
              Авто (Вікно)
            </button>
            <button
              type="button"
              className={
                preset === 'mobile'
                  ? `${styles.vpBtn} ${styles.vpBtnActive}`
                  : styles.vpBtn
              }
              onClick={() => setPreset('mobile')}
            >
              Смартфон 360px
            </button>
            <button
              type="button"
              className={
                preset === 'tablet'
                  ? `${styles.vpBtn} ${styles.vpBtnActive}`
                  : styles.vpBtn
              }
              onClick={() => setPreset('tablet')}
            >
              Планшет 768px
            </button>
            <button
              type="button"
              className={
                preset === 'desktop'
                  ? `${styles.vpBtn} ${styles.vpBtnActive}`
                  : styles.vpBtn
              }
              onClick={() => setPreset('desktop')}
            >
              ПК 1280px
            </button>
          </div>
        </div>
      </div>

      <div
        className={`${styles.wrapper} ${
          preset === 'mobile'
            ? styles.frameMobile
            : preset === 'tablet'
              ? styles.frameTablet
              : ''
        }`}
        data-viewport={effectiveViewport}
      >
        <Header viewport={effectiveViewport} />
        <main className={styles.main}>
          <Outlet />
        </main>
        <footer className={styles.footer}>
          <div className={styles.footerInner}>
            Сито · навчальний проєкт · v0.1 · усі дані тестові
          </div>
        </footer>
      </div>
    </div>
  );
}
