import { describe, expect, it, vi } from 'vitest';
import { SEED_CHECKS } from '../mocks/testData';
import type { CheckRecord } from '../types';
import { downloadFile, toCsv, toJson } from './exportFile';

describe('exportFile', () => {
  it('генерує CSV з UTF-8 BOM та екранує подвійні лапки', () => {
    const csv = toCsv([SEED_CHECKS[0]]);
    expect(csv.startsWith('\uFEFFid,createdAt,messenger,sender,verdict')).toBe(true);
    expect(csv).toContain('"chk-001"');
    expect(csv).toContain('"urgency;payment_data;suspicious_link"');
  });

  it('захищає клітинки CSV від формульних ін’єкцій (=, +, -, @)', () => {
    // test data
    const dangerousRecord: CheckRecord = {
      ...SEED_CHECKS[0],
      id: 'chk-formula',
      sender: '=CMD|" /C calc"!A0',
      note: '+SUM(A1:A2)',
      text: '@malicious -payload',
      isTestData: true,
    };

    const csv = toCsv([dangerousRecord]);
    expect(csv).toContain(`"'=CMD|"" /C calc""!A0"`);
    expect(csv).toContain(`"'+SUM(A1:A2)"`);
    expect(csv).toContain(`"'@malicious -payload"`);
  });

  it('генерує форматований JSON з прапорцем isTestData', () => {
    const json = toJson(SEED_CHECKS.slice(0, 2));
    const parsed = JSON.parse(json) as {
      project: string;
      isTestData: boolean;
      count: number;
      records: CheckRecord[];
    };
    expect(parsed.project).toBe('Сито');
    expect(parsed.isTestData).toBe(true);
    expect(parsed.count).toBe(2);
    expect(parsed.records).toHaveLength(2);
  });

  it('downloadFile створює тимчасове посилання та викликає click', () => {
    const createObjectURLMock = vi.fn(() => 'blob:test-url');
    const revokeObjectURLMock = vi.fn();
    Object.defineProperty(URL, 'createObjectURL', {
      value: createObjectURLMock,
      writable: true,
    });
    Object.defineProperty(URL, 'revokeObjectURL', {
      value: revokeObjectURLMock,
      writable: true,
    });

    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

    downloadFile('test-content', 'export.csv', 'text/csv');

    expect(createObjectURLMock).toHaveBeenCalledTimes(1);
    expect(clickSpy).toHaveBeenCalledTimes(1);
    expect(revokeObjectURLMock).toHaveBeenCalledWith('blob:test-url');

    clickSpy.mockRestore();
  });
});
