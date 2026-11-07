import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { AuthProvider } from '../state/AuthContext';
import { LoginPage } from './LoginPage';

function renderLogin() {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/check" element={<div>Екран перевірки Сито</div>} />
        </Routes>
      </MemoryRouter>
    </AuthProvider>
  );
}

describe('LoginPage', () => {
  it('показує помилки валідації при спробі відправити порожню форму', async () => {
    const user = userEvent.setup();
    renderLogin();

    await user.click(screen.getByRole('button', { name: 'Увійти' }));

    expect(screen.getByText('Введіть електронну пошту.')).toBeInTheDocument();
    expect(screen.getByText('Введіть пароль.')).toBeInTheDocument();
  });

  it('показує повідомлення про помилку при невірному паролі', async () => {
    const user = userEvent.setup();
    renderLogin();

    await user.type(screen.getByLabelText('Електронна пошта'), 'student@sito.test');
    await user.type(screen.getByLabelText('Пароль'), 'WrongPass123');
    await user.click(screen.getByRole('button', { name: 'Увійти' }));

    await waitFor(
      () => {
        expect(screen.getByRole('alert')).toHaveTextContent('Невірний email або пароль');
      },
      { timeout: 2000 }
    );
  });

  it('підставляє тестові дані та перенаправляє на /check після успішного входу', async () => {
    const user = userEvent.setup();
    renderLogin();

    await user.click(screen.getByRole('button', { name: 'Підставити тестові дані' }));
    await user.click(screen.getByRole('button', { name: 'Увійти' }));

    await waitFor(
      () => {
        expect(screen.getByText('Екран перевірки Сито')).toBeInTheDocument();
      },
      { timeout: 2000 }
    );
  });
});
