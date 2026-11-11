import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { SEED_CHECKS } from '../../mocks/testData';
import { AuthProvider } from '../../state/AuthContext';
import { ChecksProvider } from '../../state/ChecksContext';
import { SendersProvider } from '../../state/SendersContext';
import { CheckDetailsPage } from '../history/CheckDetailsPage';
import { CheckPage } from './CheckPage';

function renderCheckFlow(initialEntry = '/check') {
  return render(
    <AuthProvider>
      <ChecksProvider>
        <SendersProvider>
          <MemoryRouter initialEntries={[initialEntry]}>
            <Routes>
              <Route path="/check" element={<CheckPage />} />
              <Route path="/history/:id" element={<CheckDetailsPage />} />
            </Routes>
          </MemoryRouter>
        </SendersProvider>
      </ChecksProvider>
    </AuthProvider>
  );
}

describe('CheckPage', () => {
  it('відображає помилку валідації для закороткого тексту та скидає її при введенні', async () => {
    const user = userEvent.setup();
    renderCheckFlow();

    const textarea = screen.getByLabelText('Текст повідомлення');
    await user.type(textarea, 'Привіт');
    await user.click(screen.getByRole('button', { name: 'Перевірити' }));

    expect(screen.getByText('Виправте помилки у формі')).toBeInTheDocument();
    expect(
      screen.getAllByText('Текст закороткий: мінімум 10 символів (зараз 6).').length
    ).toBeGreaterThan(0);

    await user.type(textarea, ' додатковий текст');
    expect(screen.queryByText('Виправте помилки у формі')).not.toBeInTheDocument();
  });

  it('проходить повний цикл: введення -> аналіз -> вердикт -> ручна оцінка -> збереження в журнал', async () => {
    const user = userEvent.setup();
    renderCheckFlow();

    const textarea = screen.getByLabelText('Текст повідомлення');
    await user.click(textarea);
    await user.paste(SEED_CHECKS[0].text);
    await user.type(screen.getByLabelText(/Відправник/), 'Тест-Кредит');

    expect(screen.getByText(/Контакт у реєстрі: У чорному списку/)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Перевірити' }));
    expect(screen.getByText('Перевіряємо…')).toBeInTheDocument();

    await waitFor(
      () => {
        expect(screen.getByText('ФЕЙК')).toBeInTheDocument();
      },
      { timeout: 2500 }
    );

    expect(screen.getByText('Ризик: 90 / 100')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Змінити оцінку' }));
    const noteField = screen.getByLabelText(/Нотатка до перевірки/);
    await user.type(noteField, 'Отримано в Telegram від невідомого каналу');
    await user.click(screen.getByRole('button', { name: 'Застосувати' }));

    expect(screen.getByText(/Отримано в Telegram від невідомого каналу/)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Зберегти в журнал' }));
    expect(screen.getByText('Збережено в журнал')).toBeInTheDocument();

    await user.click(screen.getByRole('link', { name: 'Відкрити запис' }));
    expect(screen.getByText(/Отримано в Telegram від невідомого каналу/)).toBeInTheDocument();
  });

  it('завантажує шаблон через URL-параметр ?template=tpl-bank або кнопку швидкого шаблону', async () => {
    const user = userEvent.setup();
    renderCheckFlow('/check?template=tpl-bank');

    expect(screen.getByText(/Завантажено шаблон: «Блокування банківської картки»/)).toBeInTheDocument();
    expect(screen.getByLabelText('Текст повідомлення')).toHaveValue(SEED_CHECKS[0].text);

    await user.click(screen.getByRole('button', { name: 'Звичайне навчальне повідомлення' }));
    expect(screen.getByLabelText('Текст повідомлення')).toHaveValue(SEED_CHECKS[4].text);
  });

  it('демонструє стан помилки при спецключі #помилка та дозволяє повторити або скинути', async () => {
    const user = userEvent.setup();
    renderCheckFlow();

    await user.type(
      screen.getByLabelText('Текст повідомлення'),
      'Тестове повідомлення #помилка для перевірки стану'
    );
    await user.click(screen.getByRole('button', { name: 'Перевірити' }));

    await waitFor(
      () => {
        expect(
          screen.getByText('Не вдалося виконати перевірку (тестова помилка)')
        ).toBeInTheDocument();
      },
      { timeout: 2500 }
    );

    await user.click(screen.getByRole('button', { name: 'Нова перевірка' }));
    expect(
      screen.getByText(/Вставте текст повідомлення ліворуч і натисніть «Перевірити»/)
    ).toBeInTheDocument();
  });
});
