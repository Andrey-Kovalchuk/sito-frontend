import { describe, expect, it } from 'vitest';
import { analysisReducer, initialAnalysisState } from './analysisReducer';
import type { AnalysisResult, MessageInput } from '../types';

// test data
const sampleInput: MessageInput = {
  text: 'Шановний клієнте, вашу картку заблоковано.',
  messenger: 'telegram',
  sender: 'Тест-Кредит',
};

// test data
const sampleResult: AnalysisResult = {
  verdict: 'fake',
  score: 85,
  signals: [
    {
      kind: 'urgency',
      label: 'Тиск терміновістю',
      fragment: 'заблоковано',
      weight: 25,
    },
  ],
};

describe('analysisReducer', () => {
  it('переходить з idle у analyzing при SUBMIT_VALID та у invalid при SUBMIT_INVALID', () => {
    const analyzing = analysisReducer(initialAnalysisState, {
      type: 'SUBMIT_VALID',
      input: sampleInput,
    });
    expect(analyzing).toEqual({ status: 'analyzing', input: sampleInput });

    const invalid = analysisReducer(initialAnalysisState, {
      type: 'SUBMIT_INVALID',
      errors: { text: 'Помилка' },
    });
    expect(invalid).toEqual({ status: 'invalid', errors: { text: 'Помилка' } });
  });

  it('переходить з invalid у idle при INPUT_CHANGED та у analyzing при SUBMIT_VALID', () => {
    const invalidState = analysisReducer(initialAnalysisState, {
      type: 'SUBMIT_INVALID',
      errors: { text: 'Закороткий текст' },
    });

    const backToIdle = analysisReducer(invalidState, { type: 'INPUT_CHANGED' });
    expect(backToIdle).toEqual({ status: 'idle' });

    const toAnalyzing = analysisReducer(invalidState, {
      type: 'SUBMIT_VALID',
      input: sampleInput,
    });
    expect(toAnalyzing).toEqual({ status: 'analyzing', input: sampleInput });
  });

  it('ігнорує повторний SUBMIT_VALID у стані analyzing (захист від подвійного кліку)', () => {
    const analyzingState = analysisReducer(initialAnalysisState, {
      type: 'SUBMIT_VALID',
      input: sampleInput,
    });
    const nextState = analysisReducer(analyzingState, {
      type: 'SUBMIT_VALID',
      input: { ...sampleInput, text: 'Інший текст' },
    });
    expect(nextState).toBe(analyzingState);
  });

  it('обробляє RESOLVE, REJECT та CANCEL зі стану analyzing', () => {
    const analyzingState = analysisReducer(initialAnalysisState, {
      type: 'SUBMIT_VALID',
      input: sampleInput,
    });

    const resolved = analysisReducer(analyzingState, {
      type: 'RESOLVE',
      result: sampleResult,
    });
    expect(resolved).toEqual({
      status: 'result',
      input: sampleInput,
      result: sampleResult,
    });

    const rejected = analysisReducer(analyzingState, {
      type: 'REJECT',
      message: 'Помилка сервісу',
    });
    expect(rejected).toEqual({
      status: 'error',
      input: sampleInput,
      message: 'Помилка сервісу',
    });

    const cancelled = analysisReducer(analyzingState, { type: 'CANCEL' });
    expect(cancelled).toEqual({ status: 'idle' });
  });

  it('обробляє редагування оцінки (START_EDIT -> APPLY_EDIT / CANCEL_EDIT) та збереження (SAVE)', () => {
    const resultState = analysisReducer(
      { status: 'analyzing', input: sampleInput },
      { type: 'RESOLVE', result: sampleResult }
    );

    const editingState = analysisReducer(resultState, { type: 'START_EDIT' });
    expect(editingState.status).toBe('editing');

    const cancelledEdit = analysisReducer(editingState, { type: 'CANCEL_EDIT' });
    expect(cancelledEdit.status).toBe('result');

    const appliedEdit = analysisReducer(editingState, {
      type: 'APPLY_EDIT',
      manualVerdict: 'suspicious',
      note: 'Перевірено вручну',
    });
    expect(appliedEdit).toEqual({
      status: 'result',
      input: sampleInput,
      result: sampleResult,
      manualVerdict: 'suspicious',
      note: 'Перевірено вручну',
    });

    const savedState = analysisReducer(appliedEdit, {
      type: 'SAVE',
      recordId: 'chk-999',
    });
    expect(savedState).toEqual({ status: 'saved', recordId: 'chk-999' });

    const resetFromSaved = analysisReducer(savedState, { type: 'RESET' });
    expect(resetFromSaved).toEqual({ status: 'idle' });
  });

  it('обробляє RETRY та RESET зі стану error і повертає той самий об’єкт для недозволених подій', () => {
    const errorState = analysisReducer(
      { status: 'analyzing', input: sampleInput },
      { type: 'REJECT', message: 'Тестовий збій' }
    );

    const ignored = analysisReducer(errorState, { type: 'START_EDIT' });
    expect(ignored).toBe(errorState);

    const retried = analysisReducer(errorState, { type: 'RETRY' });
    expect(retried).toEqual({ status: 'analyzing', input: sampleInput });

    const reset = analysisReducer(errorState, { type: 'RESET' });
    expect(reset).toEqual({ status: 'idle' });

    const idleIgnored = analysisReducer(initialAnalysisState, { type: 'CANCEL' });
    expect(idleIgnored).toBe(initialAnalysisState);
  });
});
