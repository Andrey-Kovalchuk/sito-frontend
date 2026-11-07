import { describe, expect, it } from 'vitest';
import { SEED_CHECKS } from '../mocks/testData';
import { checksReducer } from './ChecksContext';

describe('checksReducer', () => {
  it('додає новий запис на початок списку (ADD)', () => {
    // test data
    const newRecord = {
      ...SEED_CHECKS[0],
      id: 'chk-new',
      isTestData: true,
    };
    const next = checksReducer(SEED_CHECKS, { type: 'ADD', record: newRecord });
    expect(next).toHaveLength(SEED_CHECKS.length + 1);
    expect(next[0].id).toBe('chk-new');
  });

  it('оновлює ручну оцінку та нотатку запису (UPDATE)', () => {
    const next = checksReducer(SEED_CHECKS, {
      type: 'UPDATE',
      id: 'chk-001',
      manualVerdict: 'suspicious',
      note: 'Нова нотатка',
    });
    const updated = next.find((item) => item.id === 'chk-001');
    expect(updated?.manualVerdict).toBe('suspicious');
    expect(updated?.note).toBe('Нова нотатка');
  });

  it('видаляє запис за id (REMOVE) та відновлює початковий сид (RESET_TO_SEED)', () => {
    const afterRemove = checksReducer(SEED_CHECKS, { type: 'REMOVE', id: 'chk-001' });
    expect(afterRemove).toHaveLength(SEED_CHECKS.length - 1);
    expect(afterRemove.find((item) => item.id === 'chk-001')).toBeUndefined();

    const afterReset = checksReducer(afterRemove, { type: 'RESET_TO_SEED' });
    expect(afterReset).toHaveLength(SEED_CHECKS.length);
  });
});
