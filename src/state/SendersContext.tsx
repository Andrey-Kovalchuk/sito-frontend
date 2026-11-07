import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  type ReactNode,
} from 'react';
import { SEED_SENDERS } from '../mocks/testData';
import { isSenderRecordArray, load, save, SENDERS_STORAGE_KEY } from '../services/storage';
import type { Messenger, SenderCategory, SenderRecord } from '../types';

export type SendersAction =
  | { type: 'ADD_SENDER'; record: SenderRecord }
  | { type: 'UPDATE_CATEGORY'; id: string; category: SenderCategory }
  | { type: 'REMOVE_SENDER'; id: string }
  | { type: 'RESET_SENDERS' };

export function sendersReducer(state: SenderRecord[], action: SendersAction): SenderRecord[] {
  switch (action.type) {
    case 'ADD_SENDER': {
      const existsIndex = state.findIndex(
        (s) => s.handle.trim().toLowerCase() === action.record.handle.trim().toLowerCase()
      );
      if (existsIndex !== -1) {
        return state.map((item, idx) =>
          idx === existsIndex
            ? {
                ...item,
                category: action.record.category,
                messenger: action.record.messenger,
                note: action.record.note || item.note,
              }
            : item
        );
      }
      return [action.record, ...state];
    }
    case 'UPDATE_CATEGORY':
      return state.map((item) =>
        item.id === action.id ? { ...item, category: action.category } : item
      );
    case 'REMOVE_SENDER':
      return state.filter((item) => item.id !== action.id);
    case 'RESET_SENDERS':
      return [...SEED_SENDERS];
    default:
      return state;
  }
}

function initSenders(): SenderRecord[] {
  const loaded = load<SenderRecord[]>(SENDERS_STORAGE_KEY, isSenderRecordArray, SEED_SENDERS);
  save(SENDERS_STORAGE_KEY, loaded);
  return loaded;
}

export interface NewSenderInput {
  handle: string;
  messenger: Messenger;
  category: SenderCategory;
  note: string;
}

export interface SendersContextValue {
  senders: SenderRecord[];
  addSender: (input: NewSenderInput) => SenderRecord;
  updateSenderCategory: (id: string, category: SenderCategory) => void;
  removeSender: (id: string) => void;
  resetSenders: () => void;
  findSenderByHandle: (handle: string) => SenderRecord | undefined;
}

const SendersContext = createContext<SendersContextValue | undefined>(undefined);

export function SendersProvider({ children }: { children: ReactNode }) {
  const [senders, dispatch] = useReducer(sendersReducer, undefined, initSenders);

  useEffect(() => {
    save(SENDERS_STORAGE_KEY, senders);
  }, [senders]);

  const addSender = useCallback((input: NewSenderInput): SenderRecord => {
    // test data
    const record: SenderRecord = {
      id: `snd-${Date.now()}`,
      handle: input.handle.trim(),
      messenger: input.messenger,
      category: input.category,
      note: input.note.trim() || 'Додано користувачем під час перевірки [test data]',
      createdAt: new Date().toISOString(),
      isTestData: true, // test data
    };
    dispatch({ type: 'ADD_SENDER', record });
    return record;
  }, []);

  const updateSenderCategory = useCallback((id: string, category: SenderCategory) => {
    dispatch({ type: 'UPDATE_CATEGORY', id, category });
  }, []);

  const removeSender = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_SENDER', id });
  }, []);

  const resetSenders = useCallback(() => {
    dispatch({ type: 'RESET_SENDERS' });
  }, []);

  const findSenderByHandle = useCallback(
    (handle: string): SenderRecord | undefined => {
      const normalized = handle.trim().toLowerCase();
      if (!normalized) {
        return undefined;
      }
      return senders.find((item) => item.handle.trim().toLowerCase() === normalized);
    },
    [senders]
  );

  return (
    <SendersContext.Provider
      value={{
        senders,
        addSender,
        updateSenderCategory,
        removeSender,
        resetSenders,
        findSenderByHandle,
      }}
    >
      {children}
    </SendersContext.Provider>
  );
}

export function useSenders(): SendersContextValue {
  const ctx = useContext(SendersContext);
  if (!ctx) {
    throw new Error('useSenders має викликатися всередині SendersProvider');
  }
  return ctx;
}
