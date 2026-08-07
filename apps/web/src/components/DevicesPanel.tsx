import {
  type ChangeEvent,
  type FormEvent,
  useEffect,
  useState,
} from 'react';

import {
  createDevice,
  getDevices,
} from '../services/devices';

import { getClients } from '../services/clients';

import type { Client } from '../types/client';

import type {
  CreateDeviceInput,
  Device,
} from '../types/device';

const initialForm: CreateDeviceInput = {
  type: '',
  brand: '',
  model: '',
  serialNumber: '',
  accessories: '',
  initialCondition: '',
  clientId: '',
};

export function DevicesPanel() {
  const [devices, setDevices] =
    useState<Device[]>([]);

  const [clients, setClients] =
    useState<Client[]>([]);

  const [form, setForm] =
    useState<CreateDeviceInput>(initialForm);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    const loadData = async (): Promise<void> => {
      try {
        setError(null);

        const [devicesData, clientsData] =
          await Promise.all([
            getDevices(),
            getClients(),
          ]);

        setDevices(devicesData);
        setClients(clientsData);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : 'No se pudieron cargar los equipos.',
        );
      } finally {
        setLoading(false);
      }
    };

    void loadData();
  }, []);

  const handleChange = (
    event: ChangeEvent<
      HTMLInputElement |
      HTMLTextAreaElement |
      HTMLSelectElement
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

      const newDevice = await createDevice({
        type: form.type,
        brand: form.brand,
        model: form.model,
        clientId: form.clientId,

        serialNumber:
          form.serialNumber || undefined,

        accessories:
          form.accessories || undefined,

        initialCondition:
          form.initialCondition || undefined,
      });

      setDevices((current) => [
        newDevice,
        ...current,
      ]);

      setForm(initialForm);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'No se pudo registrar el equipo.',
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
            Equipos
          </p>

          <h2>
            Gestión de equipos
          </h2>

          <p>
            Registrá los dispositivos que ingresan
            al taller y asocialos con sus propietarios.
          </p>
        </div>

        <div className="client-counter">
          <strong>{devices.length}</strong>
          <span>equipos</span>
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
                Agregar equipo
              </h3>
            </div>
          </div>

          {clients.length === 0 && !loading ? (
            <p className="empty-state">
              Primero necesitás registrar al menos
              un cliente.
            </p>
          ) : (
            <form
              className="client-form"
              onSubmit={handleSubmit}
            >
              <label>
                Propietario

                <select
                  name="clientId"
                  value={form.clientId}
                  onChange={handleChange}
                  required
                >
                  <option value="">
                    Seleccionar cliente
                  </option>

                  {clients.map((client) => (
                    <option
                      key={client.id}
                      value={client.id}
                    >
                      {client.firstName}{' '}
                      {client.lastName}
                      {' — '}
                      {client.phone}
                    </option>
                  ))}
                </select>
              </label>

              <div className="form-row">
                <label>
                  Tipo

                  <input
                    type="text"
                    name="type"
                    value={form.type}
                    onChange={handleChange}
                    required
                    minLength={2}
                    placeholder="Notebook"
                  />
                </label>

                <label>
                  Marca

                  <input
                    type="text"
                    name="brand"
                    value={form.brand}
                    onChange={handleChange}
                    required
                    minLength={2}
                    placeholder="Lenovo"
                  />
                </label>
              </div>

              <label>
                Modelo

                <input
                  type="text"
                  name="model"
                  value={form.model}
                  onChange={handleChange}
                  required
                  placeholder="ThinkPad T480"
                />
              </label>

              <label>
                Número de serie

                <input
                  type="text"
                  name="serialNumber"
                  value={form.serialNumber ?? ''}
                  onChange={handleChange}
                  placeholder="Opcional"
                />
              </label>

              <label>
                Accesorios recibidos

                <textarea
                  name="accessories"
                  value={form.accessories ?? ''}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Ej: cargador original, funda..."
                />
              </label>

              <label>
                Estado inicial

                <textarea
                  name="initialCondition"
                  value={
                    form.initialCondition ?? ''
                  }
                  onChange={handleChange}
                  rows={4}
                  placeholder="Ej: marcas de uso, pantalla rota..."
                />
              </label>

              <button
                className="primary-button"
                type="submit"
                disabled={saving}
              >
                {saving
                  ? 'Registrando...'
                  : 'Registrar equipo'}
              </button>
            </form>
          )}
        </section>

        <section className="panel">
          <div className="panel-header">
            <div>
              <span className="panel-label">
                Inventario
              </span>

              <h3>
                Equipos registrados
              </h3>
            </div>
          </div>

          {loading && (
            <p className="empty-state">
              Cargando equipos...
            </p>
          )}

          {!loading &&
            devices.length === 0 && (
              <p className="empty-state">
                Todavía no hay equipos registrados.
              </p>
            )}

          {!loading &&
            devices.length > 0 && (
              <div className="device-list">
                {devices.map((device) => (
                  <article
                    className="device-card"
                    key={device.id}
                  >
                    <div className="device-card-top">
                      <div>
                        <span className="device-type">
                          {device.type}
                        </span>

                        <h4>
                          {device.brand}{' '}
                          {device.model}
                        </h4>
                      </div>

                      {device.serialNumber && (
                        <span className="device-serial">
                          SN: {device.serialNumber}
                        </span>
                      )}
                    </div>

                    <p className="device-owner">
                      {device.client.firstName}{' '}
                      {device.client.lastName}
                    </p>

                    <span className="device-phone">
                      {device.client.phone}
                    </span>

                    {device.accessories && (
                      <div className="device-detail">
                        <strong>
                          Accesorios
                        </strong>

                        <p>
                          {device.accessories}
                        </p>
                      </div>
                    )}

                    {device.initialCondition && (
                      <div className="device-detail">
                        <strong>
                          Estado al ingresar
                        </strong>

                        <p>
                          {
                            device.initialCondition
                          }
                        </p>
                      </div>
                    )}
                  </article>
                ))}
              </div>
            )}
        </section>
      </div>
    </>
  );
}