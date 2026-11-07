import type { CheckRecord } from '../types';

const FORMULA_TRIGGERS = ['=', '+', '-', '@', '\t', '\r'];

function escapeCsvCell(raw: string): string {
  let value = raw;
  if (value.length > 0 && FORMULA_TRIGGERS.some((trigger) => value.startsWith(trigger))) {
    value = `'${value}`;
  }
  const escaped = value.replace(/"/g, '""');
  return `"${escaped}"`;
}

export function toCsv(records: CheckRecord[]): string {
  const headers = [
    'id',
    'createdAt',
    'messenger',
    'sender',
    'verdict',
    'manualVerdict',
    'score',
    'signals',
    'note',
    'text',
    'isTestData',
  ];

  const rows = records.map((rec) => {
    const signalsText = rec.signals.map((s) => s.kind).join(';');
    const cells = [
      rec.id,
      rec.createdAt,
      rec.messenger,
      rec.sender,
      rec.verdict,
      rec.manualVerdict ?? '',
      String(rec.score),
      signalsText,
      rec.note ?? '',
      rec.text,
      String(rec.isTestData),
    ];
    return cells.map(escapeCsvCell).join(',');
  });

  return '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
}

export function toJson(records: CheckRecord[]): string {
  const payload = {
    project: 'Сито',
    exportedAt: new Date().toISOString(),
    isTestData: true, // test data
    count: records.length,
    records,
  };
  return JSON.stringify(payload, null, 2);
}

export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
