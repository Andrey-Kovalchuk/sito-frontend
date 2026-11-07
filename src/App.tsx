import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { CheckDetailsPage } from './pages/CheckDetailsPage';
import { CheckPage } from './pages/CheckPage';
import { HistoryPage } from './pages/HistoryPage';
import { LoginPage } from './pages/LoginPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { OverviewPage } from './pages/OverviewPage';
import { RulesPage } from './pages/RulesPage';
import { SendersPage } from './pages/SendersPage';
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
