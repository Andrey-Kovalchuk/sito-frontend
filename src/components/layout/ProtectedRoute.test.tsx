import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { TEST_ACCOUNT } from '../../mocks/testData';
import { SESSION_STORAGE_KEY } from '../../services/storage';
import { AuthProvider } from '../../state/AuthContext';
import { ProtectedRoute } from './ProtectedRoute';

function renderWithRouter(initialEntry = '/check') {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={[initialEntry]}>
        <Routes>
          <Route path="/login" element={<div>Сторінка входу</div>} />
          <Route
            path="/check"
            element={
              <ProtectedRoute>
                <div>Захищений екран перевірки</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    </AuthProvider>
  );
}

describe('ProtectedRoute', () => {
  it('перенаправляє на /login, якщо сесія відсутня', () => {
    renderWithRouter('/check');
    expect(screen.getByText('Сторінка входу')).toBeInTheDocument();
  });

  it('перенаправляє на /login, якщо сесія прострочена', () => {
    // test data
    window.sessionStorage.setItem(
      SESSION_STORAGE_KEY,
      JSON.stringify({
        token: 'test.expired.sig',
        user: TEST_ACCOUNT.user,
        expiresAt: Date.now() - 10_000,
      })
    );

    renderWithRouter('/check');
    expect(screen.getByText('Сторінка входу')).toBeInTheDocument();
  });

  it('відображає захищений контент за наявності дійсної сесії', () => {
    // test data
    window.sessionStorage.setItem(
      SESSION_STORAGE_KEY,
      JSON.stringify({
        token: 'test.valid.sig',
        user: TEST_ACCOUNT.user,
        expiresAt: Date.now() + 600_000,
      })
    );

    renderWithRouter('/check');
    expect(screen.getByText('Захищений екран перевірки')).toBeInTheDocument();
  });
});
