import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import { LoginPage } from './LoginPage';
import { clearToken, setToken, getSsoLoginUrl } from '../lib/api';
import { ThemeProvider } from '../context/ThemeContext';

const renderLoginPage = () => {
  return render(
    <ThemeProvider>
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/kuesioner" element={<div>Halaman Kuesioner</div>} />
        </Routes>
      </MemoryRouter>
    </ThemeProvider>,
  );
};

describe('LoginPage - login via SSO', () => {
  beforeEach(() => {
    clearToken();
  });

  it('menampilkan tombol yang mengarah ke URL login SSO', () => {
    renderLoginPage();

    const ssoLink = screen.getByRole('link', { name: /masuk dengan sso/i });
    expect(ssoLink).toHaveAttribute('href', getSsoLoginUrl());
  });

  it('mengalihkan ke /kuesioner jika token sudah ada (user sudah login)', () => {
    setToken('fake-token');
    renderLoginPage();

    expect(screen.getByText('Halaman Kuesioner')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /masuk dengan sso/i })).not.toBeInTheDocument();
  });
});
