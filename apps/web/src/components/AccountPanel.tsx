import {
  type FormEvent,
  useState,
} from 'react';

import { changePassword } from '../services/auth';

import type {
  AuthUser,
} from '../types/auth';

interface AccountPanelProps {
  currentUser: AuthUser;
}

export function AccountPanel({
  currentUser,
}: AccountPanelProps) {
  const [
    currentPassword,
    setCurrentPassword,
  ] = useState('');

  const [
    newPassword,
    setNewPassword,
  ] = useState('');

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState('');

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [success, setSuccess] =
    useState<string | null>(null);

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    event.preventDefault();

    setError(null);
    setSuccess(null);

    if (
      newPassword !== confirmPassword
    ) {
      setError(
        'Las contraseñas nuevas no coinciden.',
      );

      return;
    }

    if (newPassword.length < 8) {
      setError(
        'La nueva contraseña debe tener al menos 8 caracteres.',
      );

      return;
    }

    if (
      currentPassword === newPassword
    ) {
      setError(
        'La nueva contraseña debe ser diferente a la actual.',
      );

      return;
    }

    try {
      setSaving(true);

      const result =
        await changePassword({
          currentPassword,
          newPassword,
        });

      setSuccess(result.message);

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'No se pudo cambiar la contraseña.',
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <header className="page-header">
        <div>
          <p className="eyebrow">
            Cuenta
          </p>

          <h2>
            Mi cuenta
          </h2>

          <p>
            Consultá tus datos y
            administrá la seguridad de
            tu cuenta.
          </p>
        </div>
      </header>

      <div className="account-grid">
        <section className="panel">
          <div className="panel-header">
            <div>
              <span className="panel-label">
                Perfil
              </span>

              <h3>
                Datos de usuario
              </h3>
            </div>
          </div>

          <div className="account-details">
            <div className="account-detail">
              <span>
                Nombre
              </span>

              <strong>
                {currentUser.name}
              </strong>
            </div>

            <div className="account-detail">
              <span>
                Email
              </span>

              <strong>
                {currentUser.email}
              </strong>
            </div>

            <div className="account-detail">
              <span>
                Rol
              </span>

              <strong>
                {currentUser.role ===
                'ADMIN'
                  ? 'Administrador'
                  : 'Técnico'}
              </strong>
            </div>
          </div>
        </section>

        <section className="panel">
          <div className="panel-header">
            <div>
              <span className="panel-label">
                Seguridad
              </span>

              <h3>
                Cambiar contraseña
              </h3>
            </div>
          </div>

          <form
            className="client-form"
            onSubmit={(event) => {
              void handleSubmit(event);
            }}
          >
            <label>
              Contraseña actual

              <input
                type="password"
                value={
                  currentPassword
                }
                onChange={(event) =>
                  setCurrentPassword(
                    event.target.value,
                  )
                }
                autoComplete="current-password"
                required
              />
            </label>

            <label>
              Nueva contraseña

              <input
                type="password"
                value={newPassword}
                onChange={(event) =>
                  setNewPassword(
                    event.target.value,
                  )
                }
                autoComplete="new-password"
                minLength={8}
                required
              />
            </label>

            <label>
              Repetir nueva contraseña

              <input
                type="password"
                value={
                  confirmPassword
                }
                onChange={(event) =>
                  setConfirmPassword(
                    event.target.value,
                  )
                }
                autoComplete="new-password"
                minLength={8}
                required
              />
            </label>

            {error && (
              <div className="account-message account-message-error">
                {error}
              </div>
            )}

            {success && (
              <div className="account-message account-message-success">
                {success}
              </div>
            )}

            <button
              type="submit"
              className="primary-button"
              disabled={
                saving ||
                !currentPassword ||
                !newPassword ||
                !confirmPassword
              }
            >
              {saving
                ? 'Actualizando...'
                : 'Cambiar contraseña'}
            </button>
          </form>
        </section>
      </div>
    </>
  );
}