import {
  type FormEvent,
  useEffect,
  useState,
} from 'react';

import {
  createTechnician,
  getUsers,
  updateUserStatus,
} from '../services/users';

import type { User } from '../types/user';

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
  ] = useState<string | null>(null);

  const [error, setError] =
    useState<string | null>(null);

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

      const technician =
        await createTechnician({
          name: name.trim(),
          email: email.trim(),
          password,
        });

      setUsers((current) => [
        ...current,
        technician,
      ]);

      setName('');
      setEmail('');
      setPassword('');
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

  const handleStatusChange = async (
    user: User,
  ): Promise<void> => {
    try {
      setUpdatingUserId(user.id);
      setError(null);

      const updatedUser =
        await updateUserStatus(
          user.id,
          !user.isActive,
        );

      setUsers((current) =>
        current.map((item) =>
          item.id === updatedUser.id
            ? updatedUser
            : item,
        ),
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'No se pudo actualizar el usuario.',
      );
    } finally {
      setUpdatingUserId(null);
    }
  };

  return (
    <>
      <header className="page-header">
        <div>
          <p className="eyebrow">
            Administración
          </p>

          <h2>Usuarios</h2>

          <p>
            Administrá quién puede acceder
            a TallerTrack.
          </p>
        </div>

        <div className="client-counter">
          <strong>{users.length}</strong>
          <span>usuarios</span>
        </div>
      </header>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="dashboard-grid">
        <section className="panel">
          <div className="panel-header">
            <div>
              <span className="panel-label">
                Equipo
              </span>

              <h3>Nuevo técnico</h3>
            </div>
          </div>

          <form
            className="client-form"
            onSubmit={(event) => {
              void handleSubmit(event);
            }}
          >
            <label>
              Nombre

              <input
                type="text"
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
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
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                required
              />
            </label>

            <label>
              Contraseña temporal

              <input
                type="password"
                value={password}
                onChange={(event) =>
                  setPassword(
                    event.target.value,
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
            users.map((user) => (
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
                      {user.role === 'ADMIN'
                        ? 'Administrador'
                        : 'Técnico'}
                    </span>
                  </div>

                  <span className="user-email">
                    {user.email}
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
                    <button
                      type="button"
                      className="secondary-button"
                      disabled={
                        updatingUserId ===
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
                  )}
                </div>
              </article>
            ))}
        </section>
      </div>
    </>
  );
}