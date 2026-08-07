import {
  type ChangeEvent,
  type FormEvent,
  useEffect,
  useState,
} from 'react';
import './App.css';
import {
  createClient,
  getClients,
} from './services/clients';
import type {
  Client,
  CreateClientInput,
} from './types/client';

const initialForm: CreateClientInput = {
  firstName: '',
  lastName: '',
  phone: '',
  email: '',
  notes: '',
};

function App() {
  const [clients, setClients] = useState<Client[]>([]);
  const [form, setForm] =
    useState<CreateClientInput>(initialForm);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadClients = async (): Promise<void> => {
    try {
      setError(null);

      const data = await getClients();

      setClients(data);
    } catch {
      setError('No se pudieron cargar los clientes.');
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
    } catch {
      setError(
        'No se pudo crear el cliente. Revisá los datos.',
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div>
          <p className="brand-label">TallerTrack</p>
          <h1>Gestión del taller</h1>
        </div>

        <nav>
          <button className="nav-item active">
            Clientes
          </button>

          <button className="nav-item" disabled>
            Equipos
          </button>

          <button className="nav-item" disabled>
            Reparaciones
          </button>
        </nav>
      </aside>

      <main className="content">
        <header className="page-header">
          <div>
            <p className="eyebrow">Clientes</p>
            <h2>Gestión de clientes</h2>
            <p>
              Registrá y consultá los clientes del taller.
            </p>
          </div>

          <div className="client-counter">
            <strong>{clients.length}</strong>
            <span>clientes</span>
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
                <h3>Agregar cliente</h3>
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
                <h3>Clientes registrados</h3>
              </div>
            </div>

            {loading && (
              <p className="empty-state">
                Cargando clientes...
              </p>
            )}

            {!loading && clients.length === 0 && (
              <p className="empty-state">
                Todavía no hay clientes registrados.
              </p>
            )}

            {!loading && clients.length > 0 && (
              <div className="client-list">
                {clients.map((client) => (
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

                      <span>{client.phone}</span>

                      {client.email && (
                        <span>{client.email}</span>
                      )}
                    </div>

                    <button
                      className="detail-button"
                      type="button"
                      disabled
                    >
                      Ver detalle
                    </button>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

export default App;