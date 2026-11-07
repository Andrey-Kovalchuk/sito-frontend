import type {
  CheckRecord,
  MessageTemplate,
  Messenger,
  SenderCategory,
  SenderRecord,
  SignalKind,
  User,
  Verdict,
} from '../types';

// test data
export interface TestAccount {
  user: User;
  password: string;
  sessionDurationMs: number;
  isTestData: boolean;
}

// test data
export const TEST_ACCOUNT: TestAccount = {
  user: {
    id: 'u-test-1', // test data
    email: 'student@sito.test', // test data
    displayName: 'Тестенко Т. Т.', // test data
  },
  password: 'Test1234!', // test data
  sessionDurationMs: 30 * 60 * 1000,
  isTestData: true,
};

export interface SignalRule {
  kind: Exclude<SignalKind, 'hidden_chars' | 'suspicious_link'>;
  label: string;
  keywords: string[];
  weight: number;
}

// test data
export const SIGNAL_RULES: SignalRule[] = [
  {
    kind: 'urgency',
    label: 'Тиск терміновістю',
    keywords: [
      'терміново',
      'негайно',
      'заблоковано',
      'протягом 24 годин',
      'останнє попередження',
    ],
    weight: 25,
  },
  {
    kind: 'payment_data',
    label: 'Запит даних картки',
    keywords: ['cvv', 'номер картки', 'код із смс', 'пін-код', 'термін дії'],
    weight: 35,
  },
  {
    kind: 'prize',
    label: 'Обіцянка виграшу чи виплати',
    keywords: ['виграли', 'приз', 'подарунок', 'бонус', 'компенсаці'],
    weight: 20,
  },
  {
    kind: 'impersonation',
    label: 'Видавання себе за іншу особу',
    keywords: [
      'служба безпеки банку',
      'мамо, це я',
      'з чужого телефону',
      'новий номер',
      'співробітник поліції',
    ],
    weight: 25,
  },
];

export const SUSPICIOUS_LINK_RULE = {
  kind: 'suspicious_link' as const,
  label: 'Посилання в повідомленні',
  weight: 30,
};

export const HIDDEN_CHARS_RULE = {
  kind: 'hidden_chars' as const,
  label: 'Приховані символи в тексті',
  weight: 15,
};

export interface RuleReferenceItem {
  kind: SignalKind;
  label: string;
  weight: number;
  description: string;
  triggers: string[];
}

export const RULES_CATALOG: RuleReferenceItem[] = [
  {
    kind: 'urgency',
    label: 'Тиск терміновістю',
    weight: 25,
    description:
      'Штучне обмеження часу або залякування блокуванням рахунку з метою змусити одержувача діяти без перевірки фактів.',
    triggers: [
      'терміново',
      'негайно',
      'заблоковано',
      'протягом 24 годин',
      'останнє попередження',
    ],
  },
  {
    kind: 'payment_data',
    label: 'Запит даних картки',
    weight: 35,
    description:
      'Спроба виманити конфіденційні платіжні реквізити або одноразові коди підтвердження банківських операцій.',
    triggers: ['cvv', 'номер картки', 'код із смс', 'пін-код', 'термін дії'],
  },
  {
    kind: 'suspicious_link',
    label: 'Посилання в повідомленні',
    weight: 30,
    description:
      'Наявність зовнішньої веб-адреси у тексті. Усі посилання в інтерфейсі знешкоджуються через defangUrl (hxxps://...[.]...).',
    triggers: ['http://...', 'https://...'],
  },
  {
    kind: 'prize',
    label: 'Обіцянка виграшу чи виплати',
    weight: 20,
    description:
      'Приманка у вигляді несподіваного грошового бонусу, подарунка або соціальної виплати, що потребує переходу за посиланням чи передплати.',
    triggers: ['виграли', 'приз', 'подарунок', 'бонус', 'компенсаці'],
  },
  {
    kind: 'impersonation',
    label: 'Видавання себе за іншу особу',
    weight: 25,
    description:
      'Маскування під офіційну установу (службу безпеки банку, поліцію) або близьку людину, яка нібито пише з нового чи чужого номера.',
    triggers: [
      'служба безпеки банку',
      'мамо, це я',
      'з чужого телефону',
      'новий номер',
      'співробітник поліції',
    ],
  },
  {
    kind: 'hidden_chars',
    label: 'Приховані символи в тексті',
    weight: 15,
    description:
      'Використання невидимих zero-width або bidi-символів (U+200B–U+200F, U+202A–U+202E) для обходу текстових фільтрів.',
    triggers: ['U+200B (Zero-Width Space)', 'U+202E (Right-to-Left Override)'],
  },
];

export const SIGNAL_LABELS: Record<SignalKind, string> = {
  urgency: 'Тиск терміновістю',
  payment_data: 'Запит даних картки',
  suspicious_link: 'Посилання в повідомленні',
  prize: 'Обіцянка виграшу чи виплати',
  impersonation: 'Видавання себе за іншу особу',
  hidden_chars: 'Приховані символи в тексті',
};

export const MESSENGER_LABELS: Record<Messenger, string> = {
  telegram: 'Telegram',
  viber: 'Viber',
  whatsapp: 'WhatsApp',
  signal: 'Signal',
  sms: 'SMS',
  other: 'Інше',
};

export const VERDICT_LABELS: Record<Verdict, string> = {
  fake: 'ФЕЙК',
  suspicious: 'ПІДОЗРІЛО',
  safe: 'ЙМОВІРНО БЕЗПЕЧНО',
};

export const SENDER_CATEGORY_LABELS: Record<SenderCategory, string> = {
  blacklisted: 'У чорному списку',
  watch: 'Під наглядом',
  trusted: 'Довірений',
};

// test data
export const SEED_CHECKS: CheckRecord[] = [
  {
    // test data
    id: 'chk-001',
    createdAt: '2026-10-20T09:14:00Z',
    messenger: 'telegram',
    sender: 'Тест-Кредит',
    text: 'Шановний клієнте, вашу картку Тест-Кредит заблоковано. Терміново підтвердіть дані: номер картки, термін дії та CVV за посиланням https://test-kredyt-verify.test/login',
    verdict: 'fake',
    score: 90,
    signals: [
      {
        kind: 'urgency',
        label: 'Тиск терміновістю',
        fragment: 'заблоковано',
        weight: 25,
      },
      {
        kind: 'payment_data',
        label: 'Запит даних картки',
        fragment: 'номер картки',
        weight: 35,
      },
      {
        kind: 'suspicious_link',
        label: 'Посилання в повідомленні',
        fragment: 'https://test-kredyt-verify.test/login',
        weight: 30,
      },
    ],
    isTestData: true,
  },
  {
    // test data
    id: 'chk-002',
    createdAt: '2026-10-22T17:40:00Z',
    messenger: 'viber',
    sender: 'ШвидкоПошта Розіграш',
    text: 'Вітаємо! Ви виграли смартфон у розіграші ШвидкоПошти. Щоб отримати приз протягом 24 годин, оплатіть доставку 49 грн: https://shvydko-bonus.test/prize',
    verdict: 'fake',
    score: 75,
    signals: [
      {
        kind: 'prize',
        label: 'Обіцянка виграшу чи виплати',
        fragment: 'виграли',
        weight: 20,
      },
      {
        kind: 'urgency',
        label: 'Тиск терміновістю',
        fragment: 'протягом 24 годин',
        weight: 25,
      },
      {
        kind: 'suspicious_link',
        label: 'Посилання в повідомленні',
        fragment: 'https://shvydko-bonus.test/prize',
        weight: 30,
      },
    ],
    isTestData: true,
  },
  {
    // test data
    id: 'chk-003',
    createdAt: '2026-10-24T21:05:00Z',
    messenger: 'whatsapp',
    sender: '+380 00 000 0001',
    text: 'Мамо, це я, пишу з чужого телефону, свій розбив. Терміново скинь 3000 грн на картку, потім все поясню.',
    verdict: 'suspicious',
    score: 50,
    signals: [
      {
        kind: 'impersonation',
        label: 'Видавання себе за іншу особу',
        fragment: 'Мамо, це я',
        weight: 25,
      },
      {
        kind: 'urgency',
        label: 'Тиск терміновістю',
        fragment: 'Терміново',
        weight: 25,
      },
    ],
    isTestData: true,
  },
  {
    // test data
    id: 'chk-004',
    createdAt: '2026-10-27T12:30:00Z',
    messenger: 'sms',
    sender: 'SHVYDKO',
    text: 'Ваша посилка затримується на складі. Уточніть адресу доставки: https://shvydko-posylka.test/track',
    verdict: 'suspicious',
    score: 30,
    manualVerdict: 'fake',
    note: 'Посилання не з офіційного сайту служби доставки.',
    signals: [
      {
        kind: 'suspicious_link',
        label: 'Посилання в повідомленні',
        fragment: 'https://shvydko-posylka.test/track',
        weight: 30,
      },
    ],
    isTestData: true,
  },
  {
    // test data
    id: 'chk-005',
    createdAt: '2026-10-29T08:02:00Z',
    messenger: 'telegram',
    sender: 'Олена Тестова',
    text: 'Привіт, завтра пара о 10:00 в аудиторії 214, не забудь ноутбук.',
    verdict: 'safe',
    score: 0,
    signals: [],
    isTestData: true,
  },
  {
    // test data
    id: 'chk-006',
    createdAt: '2026-11-01T10:00:00Z',
    messenger: 'sms',
    sender: 'Деканат',
    text: 'Нагадування: оплата за гуртожиток до 15 листопада. Реквізити в деканаті.',
    verdict: 'safe',
    score: 0,
    signals: [],
    isTestData: true,
  },
  {
    // test data
    id: 'chk-007',
    createdAt: '2026-11-03T15:47:00Z',
    messenger: 'telegram',
    sender: 'Служба безпеки',
    text: "Служба безпеки банку: на ваше ім'я оформлюють кредит. Негайно назвіть код із СМС, щоб скасувати операцію.",
    verdict: 'fake',
    score: 85,
    signals: [
      {
        kind: 'impersonation',
        label: 'Видавання себе за іншу особу',
        fragment: 'Служба безпеки банку',
        weight: 25,
      },
      {
        kind: 'urgency',
        label: 'Тиск терміновістю',
        fragment: 'Негайно',
        weight: 25,
      },
      {
        kind: 'payment_data',
        label: 'Запит даних картки',
        fragment: 'код із СМС',
        weight: 35,
      },
    ],
    isTestData: true,
  },
  {
    // test data
    id: 'chk-008',
    createdAt: '2026-11-05T19:20:00Z',
    messenger: 'viber',
    sender: 'Комунальний центр',
    text: 'Отримайте компен\u200Bсацію за комунальні послуги до кінця тижня: https://kompensatsiya.test/form',
    verdict: 'fake',
    score: 65,
    signals: [
      {
        kind: 'hidden_chars',
        label: 'Приховані символи в тексті',
        fragment: 'U+200B',
        weight: 15,
      },
      {
        kind: 'prize',
        label: 'Обіцянка виграшу чи виплати',
        fragment: 'компенсаці',
        weight: 20,
      },
      {
        kind: 'suspicious_link',
        label: 'Посилання в повідомленні',
        fragment: 'https://kompensatsiya.test/form',
        weight: 30,
      },
    ],
    isTestData: true,
  },
];

// test data
export const SEED_SENDERS: SenderRecord[] = [
  {
    // test data
    id: 'snd-001',
    handle: 'Тест-Кредит',
    messenger: 'telegram',
    category: 'blacklisted',
    note: 'Фішинговий акаунт, що імітує повідомлення банку [test data]',
    createdAt: '2026-10-20T09:15:00Z',
    isTestData: true,
  },
  {
    // test data
    id: 'snd-002',
    handle: 'ШвидкоПошта Розіграш',
    messenger: 'viber',
    category: 'blacklisted',
    note: 'Розсилка фейкових виграшів від імені поштового оператора [test data]',
    createdAt: '2026-10-22T17:45:00Z',
    isTestData: true,
  },
  {
    // test data
    id: 'snd-003',
    handle: 'Служба безпеки',
    messenger: 'telegram',
    category: 'blacklisted',
    note: 'Телефонне та месенджер-шахрайство з вимаганням коду з СМС [test data]',
    createdAt: '2026-11-03T15:50:00Z',
    isTestData: true,
  },
  {
    // test data
    id: 'snd-004',
    handle: '+380 00 000 0001',
    messenger: 'whatsapp',
    category: 'watch',
    note: 'Невідомий номер, схема «пишу з чужого телефону» [test data]',
    createdAt: '2026-10-24T21:10:00Z',
    isTestData: true,
  },
  {
    // test data
    id: 'snd-005',
    handle: 'Олена Тестова',
    messenger: 'telegram',
    category: 'trusted',
    note: 'Староста навчальної групи ТЕСТ-31 [test data]',
    createdAt: '2026-10-29T08:05:00Z',
    isTestData: true,
  },
  {
    // test data
    id: 'snd-006',
    handle: 'Деканат',
    messenger: 'sms',
    category: 'trusted',
    note: 'Офіційні навчальні нагадування факультету [test data]',
    createdAt: '2026-11-01T10:05:00Z',
    isTestData: true,
  },
];

// test data
export const MESSAGE_TEMPLATES: MessageTemplate[] = [
  {
    // test data
    id: 'tpl-bank',
    title: 'Блокування банківської картки',
    categoryLabel: 'Банківський фішинг',
    messenger: 'telegram',
    sender: 'Тест-Кредит',
    text: 'Шановний клієнте, вашу картку Тест-Кредит заблоковано. Терміново підтвердіть дані: номер картки, термін дії та CVV за посиланням https://test-kredyt-verify.test/login',
    expectedVerdict: 'fake',
    isTestData: true,
  },
  {
    // test data
    id: 'tpl-prize',
    title: 'Фейковий розіграш призу',
    categoryLabel: 'Псевдовиграш та передплата',
    messenger: 'viber',
    sender: 'ШвидкоПошта Розіграш',
    text: 'Вітаємо! Ви виграли смартфон у розіграші ШвидкоПошти. Щоб отримати приз протягом 24 годин, оплатіть доставку 49 грн: https://shvydko-bonus.test/prize',
    expectedVerdict: 'fake',
    isTestData: true,
  },
  {
    // test data
    id: 'tpl-friend',
    title: 'Прохання грошей з чужого номера',
    categoryLabel: 'Соціальна інженерія',
    messenger: 'whatsapp',
    sender: '+380 00 000 0001',
    text: 'Мамо, це я, пишу з чужого телефону, свій розбив. Терміново скинь 3000 грн на картку, потім все поясню.',
    expectedVerdict: 'suspicious',
    isTestData: true,
  },
  {
    // test data
    id: 'tpl-hidden',
    title: 'Виплата з прихованим символом U+200B',
    categoryLabel: 'Маскування символів + фішинг',
    messenger: 'viber',
    sender: 'Комунальний центр',
    text: 'Отримайте компен\u200Bсацію за комунальні послуги до кінця тижня: https://kompensatsiya.test/form',
    expectedVerdict: 'fake',
    isTestData: true,
  },
  {
    // test data
    id: 'tpl-safe',
    title: 'Звичайне навчальне повідомлення',
    categoryLabel: 'Безпечне побутове повідомлення',
    messenger: 'telegram',
    sender: 'Олена Тестова',
    text: 'Привіт, завтра пара о 10:00 в аудиторії 214, не забудь ноутбук.',
    expectedVerdict: 'safe',
    isTestData: true,
  },
];
