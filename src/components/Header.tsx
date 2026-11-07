import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../state/AuthContext';
import { TestDataBadge } from './TestDataBadge';
import styles from './Header.module.css';

const NAV_ITEMS = [
  { to: '/check', label: 'Перевірка' },
  { to: '/history', label: 'Журнал' },
  { to: '/overview', label: 'Зведення' },
  { to: '/senders', label: 'Відправники' },
  { to: '/rules', label: 'Довідник і шаблони' },
];

interface HeaderProps {
  viewport?: 'mobile' | 'tablet' | 'desktop';
}

export function Header({ viewport }: HeaderProps) {
  const { session, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    setMenuOpen(false);
    logout();
    navigate('/login', { replace: true });
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <header className={styles.header} data-header-vp={viewport}>
      <div className={styles.inner}>
        <div className={styles.brandGroup}>
          <NavLink to="/check" className={styles.logo} onClick={closeMenu}>
            <span className={styles.logoWord}>Сито</span>
            <span className={styles.logoBar} aria-hidden="true" />
          </NavLink>
          <TestDataBadge compact />
        </div>

        <button
          type="button"
          className={styles.menuToggle}
          aria-expanded={menuOpen}
          aria-controls="main-navigation"
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          {menuOpen ? '✕ Закрити' : '☰ Меню'}
        </button>

        <div
          id="main-navigation"
          className={menuOpen ? `${styles.navContainer} ${styles.navOpen}` : styles.navContainer}
        >
          <nav className={styles.nav} aria-label="Основна навігація">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={closeMenu}
                className={({ isActive }) =>
                  isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className={styles.userArea}>
            {session && (
              <span className={styles.userEmail} title={session.user.displayName}>
                {session.user.email}
              </span>
            )}
            <button type="button" className={styles.logoutBtn} onClick={handleLogout}>
              Вийти
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
