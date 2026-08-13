import {
  type FormEvent,
  useState,
} from 'react';

import { login } from '../services/auth';

import type {
  AuthUser,
} from '../types/auth';

interface LoginPageProps {
  onLogin: (user: AuthUser) => void;
}

export function LoginPage({
  onLogin,
}: LoginPageProps) {
  const [email, setEmail] =
    useState('');

  const [password, setPassword] =
    useState('');

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    event.preventDefault();

    try {
      setLoading(true);
      setError(null);

      const result = await login(
        email,
        password,
      );

      onLogin(result.user);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'No se pudo iniciar sesión.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page">
      <section className="login-card">
        <div className="login-brand">
          <span className="login-logo">
            TT
          </span>

          <div>
            <h1>TallerTrack</h1>

            <p>
              Gestión técnica del taller
            </p>
          </div>
        </div>

        <div className="login-heading">
          <span className="eyebrow">
            Acceso al sistema
          </span>

          <h2>Iniciar sesión</h2>

          <p>
            Ingresá con tu cuenta para
            acceder al panel del taller.
          </p>
        </div>

        <form
          className="login-form"
          onSubmit={(event) => {
            void handleSubmit(event);
          }}
        >
          <label>
            Email

            <input
              type="email"
              value={email}
              onChange={(event) => {
                setEmail(
                  event.target.value,
                );
              }}
              autoComplete="email"
              placeholder="nombre@tallertrack.com"
              required
            />
          </label>

          <label>
            Contraseña

            <input
              type="password"
              value={password}
              onChange={(event) => {
                setPassword(
                  event.target.value,
                );
              }}
              autoComplete="current-password"
              placeholder="••••••••"
              required
            />
          </label>

          {error && (
            <div className="login-error">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="primary-button login-button"
            disabled={loading}
          >
            {loading
              ? 'Ingresando...'
              : 'Iniciar sesión'}
          </button>
        </form>
      </section>
    </main>
  );
}