import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { AppRoutes } from '../App';
import { TEST_ACCOUNT } from '../mocks/testData';
import { SESSION_STORAGE_KEY } from '../services/storage';
import { AuthProvider } from '../state/AuthContext';
import { ChecksProvider } from '../state/ChecksContext';
import { SendersProvider } from '../state/SendersContext';

function renderAuthenticatedApp(initialEntry = '/history') {
  // test data
  window.sessionStorage.setItem(
    SESSION_STORAGE_KEY,
    JSON.stringify({
      token: 'test.valid.sig',
      user: TEST_ACCOUNT.user,
      expiresAt: Date.now() + 600_000,
    })
  );

  return render(
    <AuthProvider>
      <ChecksProvider>
        <SendersProvider>
          <MemoryRouter initialEntries={[initialEntry]}>
            <AppRoutes />
          </MemoryRouter>
        </SendersProvider>
      </ChecksProvider>
    </AuthProvider>
  );
}

describe('HistoryPage та CheckDetailsPage', () => {
  it('відображає початкові 8 записів, фільтрує за вердиктом, месенджером, ознакою і пошуком', async () => {
    const user = userEvent.setup();
    renderAuthenticatedApp('/history');

    expect(screen.getByText('Показано записів: 8 із 8')).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText('Вердикт'), 'safe');
    expect(screen.getByText('Показано записів: 2 із 8')).toBeInTheDocument();

    const searchInput = screen.getByLabelText('Пошук за текстом або відправником');
    await user.type(searchInput, 'Деканат');
    expect(screen.getByText('Показано записів: 1 із 8')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Скинути фільтри' }));
    expect(screen.getByText('Показано записів: 8 із 8')).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText('Месенджер'), 'viber');
    expect(screen.getByText('Показано записів: 2 із 8')).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText('Ознака маніпуляції'), 'hidden_chars');
    expect(screen.getByText('Показано записів: 1 із 8')).toBeInTheDocument();

    await user.type(searchInput, 'неіснуючий_запит_12345');
    expect(screen.getByText('Записів за цим фільтром немає.')).toBeInTheDocument();
  });

  it('відкриває деталі запису, показує пов’язані записи, редагує оцінку та видаляє запис', async () => {
    const user = userEvent.setup();
    renderAuthenticatedApp('/history/chk-001');

    expect(screen.getByRole('heading', { name: 'Запис chk-001' })).toBeInTheDocument();
    expect(screen.getByText(/Пов'язані записи в журналі/)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Змінити оцінку' }));
    await user.selectOptions(screen.getByLabelText('Ручна оцінка'), 'suspicious');
    await user.click(screen.getByRole('button', { name: 'Застосувати' }));

    expect(screen.getByText(/Ручна оцінка/)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Видалити запис' }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    const confirmButtons = screen.getAllByRole('button', { name: 'Видалити запис' });
    await user.click(confirmButtons[confirmButtons.length - 1]);

    expect(screen.getByText('Показано записів: 7 із 7')).toBeInTheDocument();
  });

  it('відображає сторінку 404 для невідомого маршруту', () => {
    renderAuthenticatedApp('/some-unknown-route');
    expect(screen.getByText('Сторінку не знайдено.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Перейти до перевірки' })).toBeInTheDocument();
  });
});
