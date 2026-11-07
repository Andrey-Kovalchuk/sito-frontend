export type Messenger = 'telegram' | 'viber' | 'whatsapp' | 'signal' | 'sms' | 'other';
export type Verdict = 'safe' | 'suspicious' | 'fake';
export type SignalKind =
  | 'urgency'
  | 'payment_data'
  | 'suspicious_link'
  | 'prize'
  | 'impersonation'
  | 'hidden_chars';

export type SenderCategory = 'blacklisted' | 'watch' | 'trusted';

export interface Signal {
  kind: SignalKind;
  label: string;
  fragment: string;
  weight: number;
}

export interface MessageInput {
  text: string;
  messenger: Messenger;
  sender: string;
}

export interface AnalysisResult {
  verdict: Verdict;
  score: number;
  signals: Signal[];
}

export interface CheckRecord extends MessageInput, AnalysisResult {
  id: string;
  createdAt: string; // ISO 8601
  manualVerdict?: Verdict; // якщо користувач змінив оцінку
  note?: string;
  isTestData: boolean;
}

export interface SenderRecord {
  id: string;
  handle: string;
  messenger: Messenger;
  category: SenderCategory;
  note: string;
  createdAt: string;
  isTestData: boolean;
}

export interface MessageTemplate {
  id: string;
  title: string;
  categoryLabel: string;
  messenger: Messenger;
  sender: string;
  text: string;
  expectedVerdict: Verdict;
  isTestData: boolean;
}

export interface User {
  id: string;
  email: string;
  displayName: string;
}

export interface Session {
  token: string;
  user: User;
  expiresAt: number;
}

export type FieldErrors = Partial<Record<keyof MessageInput, string>>;

export type AnalysisState =
  | { status: 'idle' }
  | { status: 'invalid'; errors: FieldErrors }
  | { status: 'analyzing'; input: MessageInput }
  | {
      status: 'result';
      input: MessageInput;
      result: AnalysisResult;
      manualVerdict?: Verdict;
      note?: string;
    }
  | {
      status: 'editing';
      input: MessageInput;
      result: AnalysisResult;
      manualVerdict?: Verdict;
      note?: string;
    }
  | { status: 'saved'; recordId: string }
  | { status: 'error'; input: MessageInput; message: string };
