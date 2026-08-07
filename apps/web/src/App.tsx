import {
  type ChangeEvent,
  type FormEvent,
  useEffect,
  useState,
} from 'react';
import './App.css';

import { DevicesPanel } from './components/DevicesPanel';
import { RepairOrdersPanel } from './components/RepairOrdersPanel';

import {
  createClient,
  getClientById,
  getClients,
  updateClient,
} from './services/clients';

import type {
  Client,
  CreateClientInput,
  UpdateClientInput,
} from './types/client';

type ActiveSection =
  | 'clients'
  | 'devices'
  | 'repairs';

const initialForm: CreateClientInput = {
  firstName: '',
  lastName: '',
  phone: '',
  email: '',
  notes: '',
};

function App() {
  const [activeSection, setActiveSection] =
    useState<ActiveSection>('clients');

  const [clients, setClients] = useState<Client[]>([]);

  const [form, setForm] =
    useState<CreateClientInput>(initialForm);

  const [selectedClient, setSelectedClient] =
    useState<Client | null>(null);

  const [editForm, setEditForm] =
    useState<UpdateClientInput>({});

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [loadingDetail, setLoadingDetail] =
    useState(false);

  const [updating, setUpdating] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const loadClients = async (): Promise<void> => {
    try {
      setError(null);

      const data = await getClients();

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
      HTMLInputElement | HTMLTextAreaElement
    >,
  ): void => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    event.preventDefault();

    try {
      setSaving(true);
      setError(null);

      const newClient = await createClient({
        ...form,
        email: form.email || undefined,
        notes: form.notes || undefined,
      });

      setClients((current) => [
        newClient,
        ...current,
      ]);

      setForm(initialForm);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('No se pudo crear el cliente.');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleOpenClient = async (
    id: string,
  ): Promise<void> => {
    try {
      setLoadingDetail(true);
      setError(null);

      const client = await getClientById(id);

      setSelectedClient(client);

      setEditForm({
        firstName: client.firstName,
        lastName: client.lastName,
        phone: client.phone,
        email: client.email ?? '',
        notes: client.notes ?? '',
      });
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'No se pudo cargar el cliente.',
      );
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleEditChange = (
    event: ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement
    >,
  ): void => {
    const { name, value } = event.target;

    setEditForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleUpdateClient = async (
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    event.preventDefault();

    if (!selectedClient) {
      return;
    }

    try {
      setUpdating(true);
      setError(null);

      const updatedClient = await updateClient(
        selectedClient.id,
        {
          ...editForm,
          email: editForm.email || undefined,
          notes: editForm.notes || undefined,
        },
      );

      setSelectedClient(updatedClient);

      setClients((current) =>
        current.map((client) =>
          client.id === updatedClient.id
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

  const handleCloseDetail = (): void => {
    setSelectedClient(null);
    setEditForm({});
  };

  const handleSectionChange = (
    section: ActiveSection,
  ): void => {
    setActiveSection(section);
    setError(null);
    setSelectedClient(null);
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div>
          <p className="brand-label">
            TallerTrack
          </p>

          <h1>Gestión del taller</h1>
        </div>

        <nav>
          <button
            className={`nav-item ${
              activeSection === 'clients'
                ? 'active'
                : ''
            }`}
            type="button"
            onClick={() =>
              handleSectionChange('clients')
            }
          >
            Clientes
          </button>

          <button
            className={`nav-item ${
              activeSection === 'devices'
                ? 'active'
                : ''
            }`}
            type="button"
            onClick={() =>
              handleSectionChange('devices')
            }
          >
            Equipos
          </button>

          <button
            className={`nav-item ${
              activeSection === 'repairs'
                ? 'active'
                : ''
            }`}
            type="button"
            onClick={() =>
              handleSectionChange('repairs')
            }
          >
            Reparaciones
          </button>
        </nav>
      </aside>

      <main className="content">
        {activeSection === 'clients' && (
          <>
            <header className="page-header">
              <div>
                <p className="eyebrow">
                  Clientes
                </p>

                <h2>
                  Gestión de clientes
                </h2>

                <p>
                  Registrá, consultá y editá
                  los clientes del taller.
                </p>
              </div>

              <div className="client-counter">
                <strong>
                  {clients.length}
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
                      Nuevo registro
                    </span>

                    <h3>
                      Agregar cliente
                    </h3>
                  </div>
                </div>

                <form
                  className="client-form"
                  onSubmit={handleSubmit}
                >
                  <div className="form-row">
                    <label>
                      Nombre

                      <input
                        type="text"
                        name="firstName"
                        value={form.firstName}
                        onChange={handleChange}
                        required
                        minLength={2}
                      />
                    </label>

                    <label>
                      Apellido

                      <input
                        type="text"
                        name="lastName"
                        value={form.lastName}
                        onChange={handleChange}
                        required
                        minLength={2}
                      />
                    </label>
                  </div>

                  <label>
                    Teléfono

                    <input
                      type="text"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      required
                      minLength={6}
                    />
                  </label>

                  <label>
                    Email

                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                    />
                  </label>

                  <label>
                    Notas

                    <textarea
                      name="notes"
                      value={form.notes}
                      onChange={handleChange}
                      rows={4}
                    />
                  </label>

                  <button
                    className="primary-button"
                    type="submit"
                    disabled={saving}
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
                      Base de clientes
                    </span>

                    <h3>
                      Clientes registrados
                    </h3>
                  </div>
                </div>

                {loading && (
                  <p className="empty-state">
                    Cargando clientes...
                  </p>
                )}

                {!loading &&
                  clients.length === 0 && (
                    <p className="empty-state">
                      Todavía no hay clientes
                      registrados.
                    </p>
                  )}

                {!loading &&
                  clients.length > 0 && (
                    <div className="client-list">
                      {clients.map(
                        (client) => (
                          <article
                            className="client-card"
                            key={client.id}
                          >
                            <div className="client-avatar">
                              {client.firstName
                                .charAt(0)
                                .toUpperCase()}

                              {client.lastName
                                .charAt(0)
                                .toUpperCase()}
                            </div>

                            <div className="client-info">
                              <strong>
                                {client.firstName}{' '}
                                {client.lastName}
                              </strong>

                              <span>
                                {client.phone}
                              </span>

                              {client.email && (
                                <span>
                                  {client.email}
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
                              Ver detalle
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
                  Cargando cliente...
                </p>
              </section>
            )}

            {selectedClient &&
              !loadingDetail && (
                <section className="detail-panel">
                  <div className="detail-header">
                    <div>
                      <span className="panel-label">
                        Detalle del cliente
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
                          minLength={2}
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
                          minLength={2}
                        />
                      </label>
                    </div>

                    <label>
                      Teléfono

                      <input
                        type="text"
                        name="phone"
                        value={
                          editForm.phone ?? ''
                        }
                        onChange={
                          handleEditChange
                        }
                        required
                        minLength={6}
                      />
                    </label>

                    <label>
                      Email

                      <input
                        type="email"
                        name="email"
                        value={
                          editForm.email ?? ''
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
                          editForm.notes ?? ''
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
                      disabled={updating}
                    >
                      {updating
                        ? 'Guardando cambios...'
                        : 'Guardar cambios'}
                    </button>
                  </form>
                </section>
              )}
          </>
        )}

        {activeSection === 'devices' && (
          <DevicesPanel />
        )}

        {activeSection === 'repairs' && (
          <RepairOrdersPanel />
        )}
      </main>
    </div>
  );
}

export default App;