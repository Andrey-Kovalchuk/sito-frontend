import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { AppRoutes } from '../../App';
import { TEST_ACCOUNT } from '../../mocks/testData';
import { SESSION_STORAGE_KEY } from '../../services/storage';
import { AuthProvider } from '../../state/AuthContext';
import { ChecksProvider } from '../../state/ChecksContext';
import { SendersProvider } from '../../state/SendersContext';

function renderAt(entry: string) {
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
          <MemoryRouter initialEntries={[entry]}>
            <AppRoutes />
          </MemoryRouter>
        </SendersProvider>
      </ChecksProvider>
    </AuthProvider>
  );
}

describe('OverviewPage, SendersPage та RulesPage (міжсторінкові переходи)', () => {
  it('відображає зведення на /overview та переходить у відфільтрований журнал за ознакою', async () => {
    const user = userEvent.setup();
    renderAt('/overview');

    expect(
      screen.getByRole('heading', { name: 'Зведення та аналітичні зрізи' })
    ).toBeInTheDocument();
    expect(screen.getByText('Матриця спрацювань ознак маніпуляції')).toBeInTheDocument();

    await user.click(screen.getByRole('link', { name: 'Фільтр «Фейк» →' }));
    expect(screen.getByRole('heading', { name: 'Журнал перевірок' })).toBeInTheDocument();
    expect(screen.getByText('Показано записів: 5 із 8')).toBeInTheDocument();
  });

  it('дозволяє додати відправника в реєстр на /senders та перейти до нової перевірки від нього', async () => {
    const user = userEvent.setup();
    renderAt('/senders');

    expect(screen.getByRole('heading', { name: 'Реєстр відправників' })).toBeInTheDocument();

    await user.type(
      screen.getByLabelText(/Відправник \(ім'я, номер, @нікнейм\)/),
      'Новий-Тест-Контакт'
    );
    await user.type(screen.getByLabelText('Примітка'), 'Додано в інтеграційному тесті');
    await user.click(screen.getByRole('button', { name: 'Додати в реєстр' }));

    expect(screen.getByText('Новий-Тест-Контакт')).toBeInTheDocument();

    const checkLinks = screen.getAllByRole('link', { name: 'Нова перевірка від контакту →' });
    await user.click(checkLinks[0]);

    expect(screen.getByRole('heading', { name: 'Перевірка повідомлення' })).toBeInTheDocument();
    expect(screen.getByLabelText(/Відправник/)).toHaveValue('Новий-Тест-Контакт');
  });

  it('відображає шаблони та довідник правил на /rules і завантажує шаблон у форму перевірки', async () => {
    const user = userEvent.setup();
    renderAt('/rules?kind=payment_data');

    expect(
      screen.getByRole('heading', { name: 'Довідник ознак та шаблони повідомлень' })
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Зняти виділення правила' })).toBeInTheDocument();

    const loadButtons = screen.getAllByRole('link', { name: 'Завантажити у форму перевірки →' });
    await user.click(loadButtons[0]);

    expect(screen.getByRole('heading', { name: 'Перевірка повідомлення' })).toBeInTheDocument();
    expect(
      screen.getByText(/Завантажено шаблон: «Блокування банківської картки»/)
    ).toBeInTheDocument();
  });
});
