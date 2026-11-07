import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  type ReactNode,
} from 'react';
import { SEED_CHECKS } from '../mocks/testData';
import { CHECKS_STORAGE_KEY, isCheckRecordArray, load, save } from '../services/storage';
import type { CheckRecord, Verdict } from '../types';

export type ChecksAction =
  | { type: 'ADD'; record: CheckRecord }
  | { type: 'UPDATE'; id: string; manualVerdict?: Verdict; note?: string }
  | { type: 'REMOVE'; id: string }
  | { type: 'RESET_TO_SEED' };

export function checksReducer(state: CheckRecord[], action: ChecksAction): CheckRecord[] {
  switch (action.type) {
    case 'ADD':
      return [action.record, ...state];
    case 'UPDATE':
      return state.map((item) =>
        item.id === action.id
          ? {
              ...item,
              manualVerdict: action.manualVerdict,
              note: action.note && action.note.trim() ? action.note.trim() : undefined,
            }
          : item
      );
    case 'REMOVE':
      return state.filter((item) => item.id !== action.id);
    case 'RESET_TO_SEED':
      return [...SEED_CHECKS];
    default:
      return state;
  }
}

function initChecks(): CheckRecord[] {
  const loaded = load<CheckRecord[]>(CHECKS_STORAGE_KEY, isCheckRecordArray, SEED_CHECKS);
  save(CHECKS_STORAGE_KEY, loaded);
  return loaded;
}

export interface ChecksContextValue {
  checks: CheckRecord[];
  addCheck: (record: CheckRecord) => void;
  updateCheck: (id: string, manualVerdict?: Verdict, note?: string) => void;
  removeCheck: (id: string) => void;
  resetToSeed: () => void;
  getCheckById: (id: string) => CheckRecord | undefined;
}

const ChecksContext = createContext<ChecksContextValue | undefined>(undefined);

export function ChecksProvider({ children }: { children: ReactNode }) {
  const [checks, dispatch] = useReducer(checksReducer, undefined, initChecks);

  useEffect(() => {
    save(CHECKS_STORAGE_KEY, checks);
  }, [checks]);

  const addCheck = useCallback((record: CheckRecord) => {
    dispatch({ type: 'ADD', record });
  }, []);

  const updateCheck = useCallback((id: string, manualVerdict?: Verdict, note?: string) => {
    dispatch({ type: 'UPDATE', id, manualVerdict, note });
  }, []);

  const removeCheck = useCallback((id: string) => {
    dispatch({ type: 'REMOVE', id });
  }, []);

  const resetToSeed = useCallback(() => {
    dispatch({ type: 'RESET_TO_SEED' });
  }, []);

  const getCheckById = useCallback(
    (id: string) => checks.find((item) => item.id === id),
    [checks]
  );

  return (
    <ChecksContext.Provider
      value={{
        checks,
        addCheck,
        updateCheck,
        removeCheck,
        resetToSeed,
        getCheckById,
      }}
    >
      {children}
    </ChecksContext.Provider>
  );
}

export function useChecks(): ChecksContextValue {
  const ctx = useContext(ChecksContext);
  if (!ctx) {
    throw new Error('useChecks має викликатися всередині ChecksProvider');
  }
  return ctx;
}
