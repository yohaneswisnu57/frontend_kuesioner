import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { RequireAuth } from './components/RequireAuth';
import { LoginPage } from './pages/LoginPage';
import { KuesionerPage } from './pages/KuesionerPage';
import { SsoCallbackPage } from './pages/SsoCallbackPage';
import { RingkasanKelompokPage } from './pages/RingkasanKelompokPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
    },
  },
});

function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/callback" element={<SsoCallbackPage />} />
              <Route path="/sso/callback" element={<SsoCallbackPage />} />
              <Route
                path="/kuesioner"
                element={
                  <RequireAuth>
                    <KuesionerPage />
                  </RequireAuth>
                }
              />
              <Route
                path="/ringkasan-kelompok"
                element={
                  <RequireAuth>
                    <RingkasanKelompokPage />
                  </RequireAuth>
                }
              />
              <Route path="/" element={<Navigate to="/kuesioner" replace />} />
              <Route path="*" element={<Navigate to="/kuesioner" replace />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
