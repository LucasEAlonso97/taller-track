import {
  type ChangeEvent,
  type FormEvent,
  useEffect,
  useMemo,
  useState,
} from 'react';

import './App.css';

import { AccountPanel } from './components/AccountPanel';
import { ConfirmDeleteModal } from './components/ConfirmDeleteModal';
import { DashboardPanel } from './components/DashboardPanel';
import { DevicesPanel } from './components/DevicesPanel';
import { LoginPage } from './components/LoginPage';
import { RepairOrdersPanel } from './components/RepairOrdersPanel';
import { SearchInput } from './components/SearchInput';
import { UsersPanel } from './components/UsersPanel';

import {
  clearSession,
  getStoredUser,
} from './services/auth-storage';

import {
  createClient,
  deleteClient,
  getClientById,
  getClients,
  updateClient,
} from './services/clients';

import type {
  AuthUser,
} from './types/auth';

import type {
  Client,
  CreateClientInput,
  UpdateClientInput,
} from './types/client';

import type {
  RepairFilter,
} from './types/repair-filter';

type ActiveSection =
  | 'dashboard'
  | 'clients'
  | 'devices'
  | 'repairs'
  | 'account'
  | 'users';

const initialForm: CreateClientInput = {
  firstName: '',
  lastName: '',
  phone: '',
  email: '',
  notes: '',
};

function App() {
  const [
    activeSection,
    setActiveSection,
  ] = useState<ActiveSection>(
    'dashboard',
  );

  const [
    currentUser,
    setCurrentUser,
  ] = useState<AuthUser | null>(
    () => getStoredUser(),
  );

  const [
    repairFilter,
    setRepairFilter,
  ] = useState<RepairFilter>('ALL');

  const [
    clients,
    setClients,
  ] = useState<Client[]>([]);

  const [
    form,
    setForm,
  ] = useState<CreateClientInput>(
    initialForm,
  );

  const [
    selectedClient,
    setSelectedClient,
  ] = useState<Client | null>(null);

  const [
    clientToDelete,
    setClientToDelete,
  ] = useState<Client | null>(null);

  const [
    deletingClientId,
    setDeletingClientId,
  ] = useState<string | null>(null);

  const [
    editForm,
    setEditForm,
  ] = useState<UpdateClientInput>(
    {},
  );

  const [
    clientSearch,
    setClientSearch,
  ] = useState('');

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    loadingDetail,
    setLoadingDetail,
  ] = useState(false);

  const [
    updating,
    setUpdating,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<string | null>(
    null,
  );

  const handleLogout = (): void => {
    clearSession();
    setCurrentUser(null);
  };

  useEffect(() => {
    const handleUnauthorized =
      (): void => {
        setCurrentUser(null);
      };

    window.addEventListener(
      'auth:unauthorized',
      handleUnauthorized,
    );

    return () => {
      window.removeEventListener(
        'auth:unauthorized',
        handleUnauthorized,
      );
    };
  }, []);

  const filteredClients =
    useMemo(() => {
      const search =
        clientSearch
          .trim()
          .toLowerCase();

      if (!search) {
        return clients;
      }

      return clients.filter(
        (client) => {
          const fullName =
            `${client.firstName} ${client.lastName}`.toLowerCase();

          const matchesEmail =
            client.email
              ?.toLowerCase()
              .includes(search) ??
            false;

          return (
            fullName.includes(
              search,
            ) ||
            client.phone
              .toLowerCase()
              .includes(search) ||
            matchesEmail
          );
        },
      );
    }, [
      clients,
      clientSearch,
    ]);

  const loadClients =
    async (): Promise<void> => {
      try {
        setError(null);

        const data =
          await getClients();

        setClients(data);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : 'No se pudieron cargar los clientes.',
        );
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    void loadClients();
  }, []);

  const handleChange = (
    event: ChangeEvent<
      | HTMLInputElement
      | HTMLTextAreaElement
    >,
  ): void => {
    const {
      name,
      value,
    } = event.target;

    setForm(
      (current) => ({
        ...current,
        [name]: value,
      }),
    );
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    event.preventDefault();

    try {
      setSaving(true);
      setError(null);

      const newClient =
        await createClient({
          ...form,

          email:
            form.email ||
            undefined,

          notes:
            form.notes ||
            undefined,
        });

      setClients(
        (current) => [
          newClient,
          ...current,
        ],
      );

      setForm(initialForm);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'No se pudo crear el cliente.',
      );
    } finally {
      setSaving(false);
    }
  };

  const handleOpenClient =
    async (
      id: string,
    ): Promise<void> => {
      try {
        setLoadingDetail(true);
        setError(null);

        const client =
          await getClientById(
            id,
          );

        setSelectedClient(
          client,
        );

        setEditForm({
          firstName:
            client.firstName,

          lastName:
            client.lastName,

          phone:
            client.phone,

          email:
            client.email ??
            '',

          notes:
            client.notes ??
            '',
        });
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : 'No se pudo cargar el cliente.',
        );
      } finally {
        setLoadingDetail(
          false,
        );
      }
    };

  const handleEditChange = (
    event: ChangeEvent<
      | HTMLInputElement
      | HTMLTextAreaElement
    >,
  ): void => {
    const {
      name,
      value,
    } = event.target;

    setEditForm(
      (current) => ({
        ...current,
        [name]: value,
      }),
    );
  };

  const handleUpdateClient =
    async (
      event: FormEvent<HTMLFormElement>,
    ): Promise<void> => {
      event.preventDefault();

      if (!selectedClient) {
        return;
      }

      try {
        setUpdating(true);
        setError(null);

        const updatedClient =
          await updateClient(
            selectedClient.id,
            {
              ...editForm,

              email:
                editForm.email ||
                undefined,

              notes:
                editForm.notes ||
                undefined,
            },
          );

        setSelectedClient(
          updatedClient,
        );

        setClients(
          (current) =>
            current.map(
              (client) =>
                client.id ===
                updatedClient.id
                  ? updatedClient
                  : client,
            ),
        );
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : 'No se pudo actualizar el cliente.',
        );
      } finally {
        setUpdating(false);
      }
    };

  const handleDeleteClient =
    async (): Promise<void> => {
      if (!clientToDelete) {
        return;
      }

      const clientId =
        clientToDelete.id;

      try {
        setDeletingClientId(
          clientId,
        );

        setError(null);

        await deleteClient(
          clientId,
        );

        setClients(
          (current) =>
            current.filter(
              (client) =>
                client.id !==
                clientId,
            ),
        );

        if (
          selectedClient?.id ===
          clientId
        ) {
          setSelectedClient(null);
          setEditForm({});
        }

        setClientToDelete(null);
      } catch (error) {
        setClientToDelete(null);

        setError(
          error instanceof Error
            ? error.message
            : 'No se pudo eliminar el cliente.',
        );
      } finally {
        setDeletingClientId(null);
      }
    };

  const handleCloseDetail =
    (): void => {
      setSelectedClient(null);

      setEditForm({});
    };

  const handleSectionChange = (
    section: ActiveSection,
  ): void => {
    if (
      section === 'repairs'
    ) {
      setRepairFilter(
        'ALL',
      );
    }

    setActiveSection(
      section,
    );

    setError(null);

    setSelectedClient(
      null,
    );
  };

  const handleOpenRepairs = (
    filter: RepairFilter,
  ): void => {
    setRepairFilter(
      filter,
    );

    setActiveSection(
      'repairs',
    );

    setError(null);

    setSelectedClient(
      null,
    );
  };

  if (!currentUser) {
    return (
      <LoginPage
        onLogin={
          setCurrentUser
        }
      />
    );
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div>
          <p className="brand-label">
            TallerTrack
          </p>

          <h1>
            Gestión del taller
          </h1>
        </div>

        <nav>
          <button
            className={`nav-item ${
              activeSection ===
              'dashboard'
                ? 'active'
                : ''
            }`}
            type="button"
            onClick={() =>
              handleSectionChange(
                'dashboard',
              )
            }
          >
            Inicio
          </button>

          <button
            className={`nav-item ${
              activeSection ===
              'clients'
                ? 'active'
                : ''
            }`}
            type="button"
            onClick={() =>
              handleSectionChange(
                'clients',
              )
            }
          >
            Clientes
          </button>

          <button
            className={`nav-item ${
              activeSection ===
              'devices'
                ? 'active'
                : ''
            }`}
            type="button"
            onClick={() =>
              handleSectionChange(
                'devices',
              )
            }
          >
            Equipos
          </button>

          <button
            className={`nav-item ${
              activeSection ===
              'repairs'
                ? 'active'
                : ''
            }`}
            type="button"
            onClick={() =>
              handleSectionChange(
                'repairs',
              )
            }
          >
            Reparaciones
          </button>

          <button
            className={`nav-item ${
              activeSection ===
              'account'
                ? 'active'
                : ''
            }`}
            type="button"
            onClick={() =>
              handleSectionChange(
                'account',
              )
            }
          >
            Mi cuenta
          </button>

          {currentUser.role ===
            'ADMIN' && (
            <button
              type="button"
              className={
                activeSection ===
                'users'
                  ? 'nav-item active'
                  : 'nav-item'
              }
              onClick={() =>
                handleSectionChange(
                  'users',
                )
              }
            >
              Usuarios
            </button>
          )}
        </nav>

        <div className="sidebar-user">
          <div>
            <strong>
              {currentUser.name}
            </strong>

            <span>
              {currentUser.role ===
              'ADMIN'
                ? 'Administrador'
                : 'Técnico'}
            </span>
          </div>

          <button
            type="button"
            className="sidebar-logout"
            onClick={
              handleLogout
            }
          >
            Cerrar sesión
          </button>
        </div>
      </aside>

      <main className="content">
        {activeSection ===
          'dashboard' && (
          <DashboardPanel
            onOpenRepairs={
              handleOpenRepairs
            }
          />
        )}

        {activeSection ===
          'clients' && (
          <>
            <header className="page-header">
              <div>
                <p className="eyebrow">
                  Clientes
                </p>

                <h2>
                  Gestión de
                  clientes
                </h2>

                <p>
                  Registrá,
                  consultá y editá
                  los clientes del
                  taller.
                </p>
              </div>

              <div className="client-counter">
                <strong>
                  {
                    clients.length
                  }
                </strong>

                <span>
                  clientes
                </span>
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
                      Nuevo
                      registro
                    </span>

                    <h3>
                      Agregar
                      cliente
                    </h3>
                  </div>
                </div>

                <form
                  className="client-form"
                  onSubmit={
                    handleSubmit
                  }
                >
                  <div className="form-row">
                    <label>
                      Nombre

                      <input
                        type="text"
                        name="firstName"
                        value={
                          form.firstName
                        }
                        onChange={
                          handleChange
                        }
                        required
                        minLength={
                          2
                        }
                      />
                    </label>

                    <label>
                      Apellido

                      <input
                        type="text"
                        name="lastName"
                        value={
                          form.lastName
                        }
                        onChange={
                          handleChange
                        }
                        required
                        minLength={
                          2
                        }
                      />
                    </label>
                  </div>

                  <label>
                    Teléfono

                    <input
                      type="text"
                      name="phone"
                      value={
                        form.phone
                      }
                      onChange={
                        handleChange
                      }
                      required
                      minLength={
                        6
                      }
                    />
                  </label>

                  <label>
                    Email

                    <input
                      type="email"
                      name="email"
                      value={
                        form.email
                      }
                      onChange={
                        handleChange
                      }
                    />
                  </label>

                  <label>
                    Notas

                    <textarea
                      name="notes"
                      value={
                        form.notes
                      }
                      onChange={
                        handleChange
                      }
                      rows={4}
                    />
                  </label>

                  <button
                    className="primary-button"
                    type="submit"
                    disabled={
                      saving
                    }
                  >
                    {saving
                      ? 'Guardando...'
                      : 'Registrar cliente'}
                  </button>
                </form>
              </section>

              <section className="panel client-list-panel">
                <div className="panel-header">
                  <div>
                    <span className="panel-label">
                      Base de
                      clientes
                    </span>

                    <h3>
                      Clientes
                      registrados
                    </h3>
                  </div>
                </div>

                {!loading &&
                  clients.length >
                    0 && (
                    <SearchInput
                      value={
                        clientSearch
                      }
                      onChange={
                        setClientSearch
                      }
                      placeholder="Buscar por nombre, teléfono o email..."
                    />
                  )}

                {loading && (
                  <p className="empty-state">
                    Cargando
                    clientes...
                  </p>
                )}

                {!loading &&
                  clients.length ===
                    0 && (
                    <p className="empty-state">
                      Todavía no
                      hay clientes
                      registrados.
                    </p>
                  )}

                {!loading &&
                  clients.length >
                    0 &&
                  filteredClients.length ===
                    0 && (
                    <p className="empty-state">
                      No
                      encontramos
                      clientes para
                      "
                      {
                        clientSearch
                      }
                      ".
                    </p>
                  )}

                {!loading &&
                  filteredClients.length >
                    0 && (
                    <div className="client-list">
                      {filteredClients.map(
                        (
                          client,
                        ) => (
                          <article
                            className="client-card"
                            key={
                              client.id
                            }
                          >
                            <div className="client-avatar">
                              {client.firstName
                                .charAt(
                                  0,
                                )
                                .toUpperCase()}

                              {client.lastName
                                .charAt(
                                  0,
                                )
                                .toUpperCase()}
                            </div>

                            <div className="client-info">
                              <strong>
                                {
                                  client.firstName
                                }{' '}
                                {
                                  client.lastName
                                }
                              </strong>

                              <span>
                                {
                                  client.phone
                                }
                              </span>

                              {client.email && (
                                <span>
                                  {
                                    client.email
                                  }
                                </span>
                              )}
                            </div>

                            <button
                              className="detail-button"
                              type="button"
                              onClick={() =>
                                void handleOpenClient(
                                  client.id,
                                )
                              }
                            >
                              Ver
                              detalle
                            </button>
                          </article>
                        ),
                      )}
                    </div>
                  )}
              </section>
            </div>

            {loadingDetail && (
              <section className="detail-panel">
                <p>
                  Cargando
                  cliente...
                </p>
              </section>
            )}

            {selectedClient &&
              !loadingDetail && (
                <section className="detail-panel">
                  <div className="detail-header">
                    <div>
                      <span className="panel-label">
                        Detalle del
                        cliente
                      </span>

                      <h3>
                        {
                          selectedClient.firstName
                        }{' '}
                        {
                          selectedClient.lastName
                        }
                      </h3>
                    </div>

                    <button
                      type="button"
                      className="close-button"
                      onClick={
                        handleCloseDetail
                      }
                    >
                      Cerrar
                    </button>
                  </div>

                  <form
                    className="client-form"
                    onSubmit={
                      handleUpdateClient
                    }
                  >
                    <div className="form-row">
                      <label>
                        Nombre

                        <input
                          type="text"
                          name="firstName"
                          value={
                            editForm.firstName ??
                            ''
                          }
                          onChange={
                            handleEditChange
                          }
                          required
                          minLength={
                            2
                          }
                        />
                      </label>

                      <label>
                        Apellido

                        <input
                          type="text"
                          name="lastName"
                          value={
                            editForm.lastName ??
                            ''
                          }
                          onChange={
                            handleEditChange
                          }
                          required
                          minLength={
                            2
                          }
                        />
                      </label>
                    </div>

                    <label>
                      Teléfono

                      <input
                        type="text"
                        name="phone"
                        value={
                          editForm.phone ??
                          ''
                        }
                        onChange={
                          handleEditChange
                        }
                        required
                        minLength={
                          6
                        }
                      />
                    </label>

                    <label>
                      Email

                      <input
                        type="email"
                        name="email"
                        value={
                          editForm.email ??
                          ''
                        }
                        onChange={
                          handleEditChange
                        }
                      />
                    </label>

                    <label>
                      Notas

                      <textarea
                        name="notes"
                        value={
                          editForm.notes ??
                          ''
                        }
                        onChange={
                          handleEditChange
                        }
                        rows={4}
                      />
                    </label>

                    <button
                      className="primary-button"
                      type="submit"
                      disabled={
                        updating
                      }
                    >
                      {updating
                        ? 'Guardando cambios...'
                        : 'Guardar cambios'}
                    </button>
                  </form>

                  {currentUser.role ===
                    'ADMIN' && (
                    <div className="repair-danger-zone">
                      <div>
                        <strong>
                          Eliminar
                          cliente
                        </strong>

                        <span>
                          Solo puede
                          eliminarse si
                          no tiene equipos
                          asociados.
                        </span>
                      </div>

                      <button
                        type="button"
                        className="danger-button"
                        onClick={() =>
                          setClientToDelete(
                            selectedClient,
                          )
                        }
                      >
                        Eliminar
                      </button>
                    </div>
                  )}
                </section>
              )}
          </>
        )}

        {activeSection ===
          'devices' && (
          <DevicesPanel
            canDelete={
              currentUser.role ===
              'ADMIN'
            }
          />
        )}

        {activeSection ===
          'repairs' && (
          <RepairOrdersPanel
            initialFilter={
              repairFilter
            }
            canDelete={
              currentUser.role ===
              'ADMIN'
            }
          />
        )}

        {activeSection ===
          'account' && (
          <AccountPanel
            currentUser={
              currentUser
            }
          />
        )}

        {activeSection ===
          'users' &&
          currentUser.role ===
            'ADMIN' && (
            <UsersPanel />
          )}
      </main>

      {clientToDelete && (
        <ConfirmDeleteModal
          title="Eliminar cliente"
          description={`${clientToDelete.firstName} ${clientToDelete.lastName}`}
          confirmLabel="Eliminar cliente"
          loading={
            deletingClientId ===
            clientToDelete.id
          }
          onCancel={() =>
            setClientToDelete(null)
          }
          onConfirm={() =>
            void handleDeleteClient()
          }
        />
      )}
    </div>
  );
}

export default App;