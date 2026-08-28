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
    <main className="tt-login">
      <section className="tt-login-visual">
        <div className="tt-login-grid" />

        <div className="tt-login-visual-content">
          <div className="tt-login-brand-light">
            <span className="tt-login-logo-light">
              TT
            </span>

            <div>
              <strong>
                TallerTrack
              </strong>

              <span>
                Gestión técnica
              </span>
            </div>
          </div>

          <div className="tt-login-copy">
            <span className="tt-login-kicker">
              Control operativo
            </span>

            <h1>
              Todo el taller,
              <br />
              en una sola vista.
            </h1>

            <p>
              Organizá clientes, equipos,
              reparaciones y seguimiento
              sin depender de papeles,
              mensajes o planillas.
            </p>
          </div>

          <div className="tt-login-preview">
            <div className="tt-preview-top">
              <div>
                <span>
                  Vista general
                </span>

                <strong>
                  Actividad del taller
                </strong>
              </div>

              <span className="tt-preview-live">
                En línea
              </span>
            </div>

            <div className="tt-preview-stats">
              <div>
                <span>
                  En reparación
                </span>

                <strong>
                  08
                </strong>
              </div>

              <div>
                <span>
                  Pendientes
                </span>

                <strong>
                  03
                </strong>
              </div>

              <div>
                <span>
                  Listos
                </span>

                <strong>
                  05
                </strong>
              </div>
            </div>

            <div className="tt-preview-repair">
              <div className="tt-preview-device">
                <span className="tt-preview-icon">
                  PC
                </span>

                <div>
                  <strong>
                    Notebook Lenovo
                  </strong>

                  <span>
                    #TT-1042 · Diagnóstico
                  </span>
                </div>
              </div>

              <span className="tt-preview-status">
                En revisión
              </span>
            </div>

            <div className="tt-preview-repair">
              <div className="tt-preview-device">
                <span className="tt-preview-icon">
                  MB
                </span>

                <div>
                  <strong>
                    MacBook Air
                  </strong>

                  <span>
                    #TT-1039 · Reparación
                  </span>
                </div>
              </div>

              <span className="tt-preview-status ready">
                Listo
              </span>
            </div>
          </div>

          <div className="tt-login-features">
            <span>
              Clientes
            </span>

            <span>
              Equipos
            </span>

            <span>
              Reparaciones
            </span>

            <span>
              Seguimiento
            </span>
          </div>
        </div>
      </section>

      <section className="tt-login-access">
        <div className="tt-login-card">
          <div className="tt-login-mobile-brand">
            <span className="tt-login-mobile-logo">
              TT
            </span>

            <div>
              <strong>
                TallerTrack
              </strong>

              <span>
                Gestión técnica del taller
              </span>
            </div>
          </div>

          <div className="tt-login-heading">
            <span>
              Acceso al sistema
            </span>

            <h2>
              Bienvenido
            </h2>

            <p>
              Ingresá con tu cuenta para
              acceder al panel del taller.
            </p>
          </div>

          <form
            className="tt-login-form"
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
              <div className="tt-login-error">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="tt-login-button"
              disabled={loading}
            >
              {loading
                ? 'Ingresando...'
                : 'Iniciar sesión'}
            </button>
          </form>

          <div className="tt-login-footer">
            <span className="tt-login-security-dot" />

            Acceso seguro al sistema
          </div>
        </div>
      </section>
    </main>
  );
}