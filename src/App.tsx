import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { LoginPage } from './pages/auth/LoginPage';
import { CheckPage } from './pages/check/CheckPage';
import { CheckDetailsPage } from './pages/history/CheckDetailsPage';
import { HistoryPage } from './pages/history/HistoryPage';
import { NotFoundPage } from './pages/not-found/NotFoundPage';
import { OverviewPage } from './pages/overview/OverviewPage';
import { RulesPage } from './pages/rules/RulesPage';
import { SendersPage } from './pages/senders/SendersPage';
import { AuthProvider } from './state/AuthContext';
import { ChecksProvider } from './state/ChecksContext';
import { SendersProvider } from './state/SendersContext';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<Navigate to="/check" replace />} />
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/check" element={<CheckPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/history/:id" element={<CheckDetailsPage />} />
        <Route path="/overview" element={<OverviewPage />} />
        <Route path="/senders" element={<SendersPage />} />
        <Route path="/rules" element={<RulesPage />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export function App() {
  return (
    <AuthProvider>
      <ChecksProvider>
        <SendersProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </SendersProvider>
      </ChecksProvider>
    </AuthProvider>
  );
}
