import {
  type ChangeEvent,
  type FormEvent,
  useEffect,
  useState,
} from 'react';
import { getDevices } from '../services/devices';
import {
  createRepairOrder,
  getRepairOrders,
} from '../services/repair-orders';
import type { Device } from '../types/device';
import type {
  CreateRepairOrderInput,
  RepairOrder,
  RepairStatus,
} from '../types/repair-order';

const initialForm: CreateRepairOrderInput = {
  deviceId: '',
  reportedIssue: '',
  estimatedCompletionDate: '',
};

const statusLabels: Record<RepairStatus, string> = {
  RECEIVED: 'Recibido',
  IN_DIAGNOSIS: 'En diagnóstico',
  WAITING_APPROVAL: 'Esperando aprobación',
  IN_REPAIR: 'En reparación',
  READY_FOR_PICKUP: 'Listo para retirar',
  DELIVERED: 'Entregado',
  CANCELLED: 'Cancelado',
  UNREPAIRED: 'Sin reparación',
};

export function RepairOrdersPanel() {
  const [orders, setOrders] = useState<RepairOrder[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);

  const [form, setForm] =
    useState<CreateRepairOrderInput>(initialForm);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async (): Promise<void> => {
      try {
        setError(null);

        const [ordersData, devicesData] = await Promise.all([
          getRepairOrders(),
          getDevices(),
        ]);

        setOrders(ordersData);
        setDevices(devicesData);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : 'No se pudieron cargar los datos.',
        );
      } finally {
        setLoading(false);
      }
    };

    void loadData();
  }, []);

  const handleChange = (
    event: ChangeEvent<
      HTMLSelectElement |
      HTMLInputElement |
      HTMLTextAreaElement
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

      const newOrder = await createRepairOrder({
        deviceId: form.deviceId,
        reportedIssue: form.reportedIssue,
        estimatedCompletionDate:
          form.estimatedCompletionDate
            ? new Date(
                form.estimatedCompletionDate,
              ).toISOString()
            : undefined,
      });

      setOrders((current) => [
        newOrder,
        ...current,
      ]);

      setForm(initialForm);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'No se pudo crear la reparación.',
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <header className="page-header">
        <div>
          <p className="eyebrow">Reparaciones</p>
          <h2>Órdenes de reparación</h2>
          <p>
            Registrá ingresos y consultá el estado de los
            equipos del taller.
          </p>
        </div>

        <div className="client-counter">
          <strong>{orders.length}</strong>
          <span>órdenes</span>
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
            <span className="panel-label">
              Nuevo ingreso
            </span>

            <h3>Nueva reparación</h3>
          </div>

          <form
            className="client-form"
            onSubmit={handleSubmit}
          >
            <label>
              Equipo

              <select
                name="deviceId"
                value={form.deviceId}
                onChange={handleChange}
                required
              >
                <option value="">
                  Seleccionar equipo
                </option>

                {devices.map((device) => (
                  <option
                    key={device.id}
                    value={device.id}
                  >
                    {device.client.firstName}{' '}
                    {device.client.lastName}
                    {' — '}
                    {device.brand} {device.model}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Problema informado

              <textarea
                name="reportedIssue"
                value={form.reportedIssue}
                onChange={handleChange}
                rows={5}
                minLength={5}
                required
                placeholder="Ej: El equipo no enciende..."
              />
            </label>

            <label>
              Fecha estimada de finalización

              <input
                type="datetime-local"
                name="estimatedCompletionDate"
                value={form.estimatedCompletionDate ?? ''}
                onChange={handleChange}
              />
            </label>

            <button
              className="primary-button"
              type="submit"
              disabled={saving}
            >
              {saving
                ? 'Creando orden...'
                : 'Crear orden'}
            </button>
          </form>
        </section>

        <section className="panel">
          <div className="panel-header">
            <span className="panel-label">
              Taller
            </span>

            <h3>Órdenes registradas</h3>
          </div>

          {loading && (
            <p className="empty-state">
              Cargando reparaciones...
            </p>
          )}

          {!loading && orders.length === 0 && (
            <p className="empty-state">
              Todavía no hay reparaciones registradas.
            </p>
          )}

          {!loading && orders.length > 0 && (
            <div className="repair-list">
              {orders.map((order) => (
                <article
                  key={order.id}
                  className="repair-card"
                >
                  <div className="repair-card-header">
                    <div>
                      <strong className="repair-code">
                        {order.code}
                      </strong>

                      <span className="repair-status">
                        {statusLabels[order.status]}
                      </span>
                    </div>

                    <span className="repair-date">
                      {new Date(
                        order.createdAt,
                      ).toLocaleDateString('es-AR')}
                    </span>
                  </div>

                  <h4>
                    {order.device.brand}{' '}
                    {order.device.model}
                  </h4>

                  <p className="repair-client">
                    {order.device.client.firstName}{' '}
                    {order.device.client.lastName}
                    {' · '}
                    {order.device.type}
                  </p>

                  <p className="repair-issue">
                    {order.reportedIssue}
                  </p>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
}