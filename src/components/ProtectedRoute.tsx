import { useEffect, type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../state/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { session, checkSessionExpiry } = useAuth();
  const location = useLocation();

  useEffect(() => {
    checkSessionExpiry();
  }, [location.pathname, checkSessionExpiry]);

  const isValid = Boolean(session && session.expiresAt > Date.now());

  if (!isValid) {
    return <Navigate to="/login" state={{ from: location.pathname + location.search }} replace />;
  }

  return <>{children}</>;
}
