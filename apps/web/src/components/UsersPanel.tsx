import {
  type FormEvent,
  useEffect,
  useState,
} from 'react';

import {
  createTechnician,
  getUsers,
  resetTechnicianPassword,
  updateUserStatus,
} from '../services/users';

import type {
  User,
} from '../types/user';

export function UsersPanel() {
  const [users, setUsers] =
    useState<User[]>([]);

  const [name, setName] =
    useState('');

  const [email, setEmail] =
    useState('');

  const [password, setPassword] =
    useState('');

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [
    updatingUserId,
    setUpdatingUserId,
  ] = useState<string | null>(
    null,
  );

  const [
    resetUserId,
    setResetUserId,
  ] = useState<string | null>(
    null,
  );

  const [
    newPassword,
    setNewPassword,
  ] = useState('');

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState('');

  const [
    resettingUserId,
    setResettingUserId,
  ] = useState<string | null>(
    null,
  );

  const [error, setError] =
    useState<string | null>(
      null,
    );

  const [success, setSuccess] =
    useState<string | null>(
      null,
    );

  useEffect(() => {
    const loadUsers =
      async (): Promise<void> => {
        try {
          setError(null);

          const data =
            await getUsers();

          setUsers(data);
        } catch (error) {
          setError(
            error instanceof Error
              ? error.message
              : 'No se pudieron cargar los usuarios.',
          );
        } finally {
          setLoading(false);
        }
      };

    void loadUsers();
  }, []);

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    event.preventDefault();

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const technician =
        await createTechnician({
          name: name.trim(),
          email: email.trim(),
          password,
        });

      setUsers(
        (current) => [
          ...current,
          technician,
        ],
      );

      setName('');
      setEmail('');
      setPassword('');

      setSuccess(
        'Técnico creado correctamente.',
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'No se pudo crear el técnico.',
      );
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange =
    async (
      user: User,
    ): Promise<void> => {
      try {
        setUpdatingUserId(
          user.id,
        );

        setError(null);
        setSuccess(null);

        const updatedUser =
          await updateUserStatus(
            user.id,
            !user.isActive,
          );

        setUsers(
          (current) =>
            current.map(
              (item) =>
                item.id ===
                updatedUser.id
                  ? updatedUser
                  : item,
            ),
        );

        setSuccess(
          updatedUser.isActive
            ? `${updatedUser.name} fue activado correctamente.`
            : `${updatedUser.name} fue desactivado correctamente.`,
        );
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : 'No se pudo actualizar el usuario.',
        );
      } finally {
        setUpdatingUserId(
          null,
        );
      }
    };

  const handleOpenPasswordReset = (
    userId: string,
  ): void => {
    setResetUserId(
      userId,
    );

    setNewPassword('');
    setConfirmPassword('');
    setError(null);
    setSuccess(null);
  };

  const handleCancelPasswordReset =
    (): void => {
      setResetUserId(null);
      setNewPassword('');
      setConfirmPassword('');
      setError(null);
    };

  const handlePasswordReset =
    async (
      event: FormEvent<HTMLFormElement>,
      user: User,
    ): Promise<void> => {
      event.preventDefault();

      setError(null);
      setSuccess(null);

      if (
        newPassword.length < 8
      ) {
        setError(
          'La nueva contraseña debe tener al menos 8 caracteres.',
        );

        return;
      }

      if (
        newPassword !==
        confirmPassword
      ) {
        setError(
          'Las contraseñas no coinciden.',
        );

        return;
      }

      try {
        setResettingUserId(
          user.id,
        );

        const result =
          await resetTechnicianPassword(
            user.id,
            {
              newPassword,
            },
          );

        setSuccess(
          `${result.message} Usuario: ${user.name}.`,
        );

        setResetUserId(
          null,
        );

        setNewPassword('');
        setConfirmPassword('');
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : 'No se pudo restablecer la contraseña.',
        );
      } finally {
        setResettingUserId(
          null,
        );
      }
    };

  return (
    <>
      <header className="page-header">
        <div>
          <p className="eyebrow">
            Administración
          </p>

          <h2>
            Usuarios
          </h2>

          <p>
            Administrá quién puede
            acceder a TallerTrack.
          </p>
        </div>

        <div className="client-counter">
          <strong>
            {users.length}
          </strong>

          <span>
            usuarios
          </span>
        </div>
      </header>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {success && (
        <div className="user-success-message">
          {success}
        </div>
      )}

      <div className="dashboard-grid">
        <section className="panel">
          <div className="panel-header">
            <div>
              <span className="panel-label">
                Equipo
              </span>

              <h3>
                Nuevo técnico
              </h3>
            </div>
          </div>

          <form
            className="client-form"
            onSubmit={(event) => {
              void handleSubmit(
                event,
              );
            }}
          >
            <label>
              Nombre

              <input
                type="text"
                value={name}
                onChange={(
                  event,
                ) =>
                  setName(
                    event.target
                      .value,
                  )
                }
                minLength={2}
                maxLength={100}
                required
              />
            </label>

            <label>
              Email

              <input
                type="email"
                value={email}
                onChange={(
                  event,
                ) =>
                  setEmail(
                    event.target
                      .value,
                  )
                }
                required
              />
            </label>

            <label>
              Contraseña temporal

              <input
                type="password"
                value={password}
                onChange={(
                  event,
                ) =>
                  setPassword(
                    event.target
                      .value,
                  )
                }
                minLength={8}
                autoComplete="new-password"
                required
              />
            </label>

            <button
              type="submit"
              className="primary-button"
              disabled={saving}
            >
              {saving
                ? 'Creando...'
                : 'Crear técnico'}
            </button>
          </form>
        </section>

        <section className="panel">
          <div className="panel-header">
            <div>
              <span className="panel-label">
                Accesos
              </span>

              <h3>
                Usuarios registrados
              </h3>
            </div>
          </div>

          {loading && (
            <p className="empty-state">
              Cargando usuarios...
            </p>
          )}

          {!loading &&
            users.map(
              (user) => (
                <article
                  key={user.id}
                  className="user-card"
                >
                  <div className="user-card-info">
                    <div className="user-card-heading">
                      <strong>
                        {user.name}
                      </strong>

                      <span
                        className={`user-role user-role-${user.role.toLowerCase()}`}
                      >
                        {user.role ===
                        'ADMIN'
                          ? 'Administrador'
                          : 'Técnico'}
                      </span>
                    </div>

                    <span className="user-email">
                      {
                        user.email
                      }
                    </span>
                  </div>

                  <div className="user-card-status">
                    <span
                      className={
                        user.isActive
                          ? 'user-status-active'
                          : 'user-status-inactive'
                      }
                    >
                      {user.isActive
                        ? 'Activo'
                        : 'Desactivado'}
                    </span>

                    {user.role ===
                      'TECHNICIAN' && (
                      <div className="user-actions">
                        <button
                          type="button"
                          className="secondary-button"
                          disabled={
                            resettingUserId ===
                            user.id
                          }
                          onClick={() =>
                            handleOpenPasswordReset(
                              user.id,
                            )
                          }
                        >
                          Restablecer contraseña
                        </button>

                        <button
                          type="button"
                          className="secondary-button"
                          disabled={
                            updatingUserId ===
                              user.id ||
                            resettingUserId ===
                              user.id
                          }
                          onClick={() => {
                            void handleStatusChange(
                              user,
                            );
                          }}
                        >
                          {updatingUserId ===
                          user.id
                            ? 'Actualizando...'
                            : user.isActive
                              ? 'Desactivar'
                              : 'Activar'}
                        </button>
                      </div>
                    )}
                  </div>

                  {user.role ===
                    'TECHNICIAN' &&
                    resetUserId ===
                      user.id && (
                      <form
                        className="user-password-reset"
                        onSubmit={(
                          event,
                        ) => {
                          void handlePasswordReset(
                            event,
                            user,
                          );
                        }}
                      >
                        <div className="user-password-reset-header">
                          <div>
                            <span className="panel-label">
                              Seguridad
                            </span>

                            <strong>
                              Restablecer
                              contraseña
                            </strong>
                          </div>

                          <button
                            type="button"
                            className="close-button"
                            onClick={
                              handleCancelPasswordReset
                            }
                            disabled={
                              resettingUserId ===
                              user.id
                            }
                          >
                            Cancelar
                          </button>
                        </div>

                        <label>
                          Nueva contraseña

                          <input
                            type="password"
                            value={
                              newPassword
                            }
                            onChange={(
                              event,
                            ) =>
                              setNewPassword(
                                event
                                  .target
                                  .value,
                              )
                            }
                            minLength={
                              8
                            }
                            maxLength={
                              128
                            }
                            autoComplete="new-password"
                            required
                          />
                        </label>

                        <label>
                          Confirmar
                          contraseña

                          <input
                            type="password"
                            value={
                              confirmPassword
                            }
                            onChange={(
                              event,
                            ) =>
                              setConfirmPassword(
                                event
                                  .target
                                  .value,
                              )
                            }
                            minLength={
                              8
                            }
                            maxLength={
                              128
                            }
                            autoComplete="new-password"
                            required
                          />
                        </label>

                        <button
                          type="submit"
                          className="primary-button"
                          disabled={
                            resettingUserId ===
                            user.id ||
                            !newPassword ||
                            !confirmPassword
                          }
                        >
                          {resettingUserId ===
                          user.id
                            ? 'Restableciendo...'
                            : 'Guardar nueva contraseña'}
                        </button>
                      </form>
                    )}
                </article>
              ),
            )}
        </section>
      </div>
    </>
  );
}