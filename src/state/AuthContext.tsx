import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  type ReactNode,
} from 'react';
import { login as apiLogin } from '../services/mockApi';
import { isSession, load, remove, save, SESSION_STORAGE_KEY } from '../services/storage';
import type { Session } from '../types';

interface AuthState {
  session: Session | null;
}

type AuthAction = { type: 'SET_SESSION'; session: Session } | { type: 'CLEAR_SESSION' };

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_SESSION':
      return { session: action.session };
    case 'CLEAR_SESSION':
      return { session: null };
    default:
      return state;
  }
}

function loadInitialSession(): Session | null {
  const stored = load<Session | null>(
    SESSION_STORAGE_KEY,
    (val): val is Session | null => val === null || isSession(val),
    null,
    window.sessionStorage
  );
  if (stored && stored.expiresAt > Date.now()) {
    return stored;
  }
  if (stored) {
    remove(SESSION_STORAGE_KEY, window.sessionStorage);
  }
  return null;
}

export interface AuthContextValue {
  session: Session | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  checkSessionExpiry: () => boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, undefined, () => ({
    session: loadInitialSession(),
  }));

  const logout = useCallback(() => {
    remove(SESSION_STORAGE_KEY, window.sessionStorage);
    dispatch({ type: 'CLEAR_SESSION' });
  }, []);

  const checkSessionExpiry = useCallback((): boolean => {
    if (!state.session) {
      return false;
    }
    if (state.session.expiresAt <= Date.now()) {
      logout();
      return false;
    }
    return true;
  }, [state.session, logout]);

  useEffect(() => {
    if (!state.session) {
      return;
    }
    const intervalId = window.setInterval(() => {
      if (state.session && state.session.expiresAt <= Date.now()) {
        logout();
      }
    }, 60_000);

    return () => window.clearInterval(intervalId);
  }, [state.session, logout]);

  const login = useCallback(async (email: string, password: string) => {
    const newSession = await apiLogin(email, password);
    save(SESSION_STORAGE_KEY, newSession, window.sessionStorage);
    dispatch({ type: 'SET_SESSION', session: newSession });
  }, []);

  const isAuthenticated = Boolean(state.session && state.session.expiresAt > Date.now());

  return (
    <AuthContext.Provider
      value={{
        session: state.session,
        isAuthenticated,
        login,
        logout,
        checkSessionExpiry,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth має викликатися всередині AuthProvider');
  }
  return ctx;
}
