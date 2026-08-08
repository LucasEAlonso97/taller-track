import {
  type ChangeEvent,
  type FormEvent,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { getDevices } from '../services/devices';

import {
  createRepairOrder,
  getRepairOrders,
  updateRepairDiagnosis,
  updateRepairOrderStatus,
} from '../services/repair-orders';

import type { Device } from '../types/device';

import type {
  CreateRepairOrderInput,
  RepairOrder,
  RepairStatus,
} from '../types/repair-order';

type StatusFilter = 'ALL' | RepairStatus;

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

const statuses = Object.keys(
  statusLabels,
) as RepairStatus[];

export function RepairOrdersPanel() {
  const [orders, setOrders] =
    useState<RepairOrder[]>([]);

  const [devices, setDevices] =
    useState<Device[]>([]);

  const [form, setForm] =
    useState<CreateRepairOrderInput>(initialForm);

  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>('ALL');

  const [expandedOrderId, setExpandedOrderId] =
    useState<string | null>(null);

  const [editingDiagnosisId, setEditingDiagnosisId] =
    useState<string | null>(null);

  const [diagnosisDraft, setDiagnosisDraft] =
    useState('');

  const [savingDiagnosisId, setSavingDiagnosisId] =
    useState<string | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [updatingOrderId, setUpdatingOrderId] =
    useState<string | null>(null);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    const loadData = async (): Promise<void> => {
      try {
        setError(null);

        const [ordersData, devicesData] =
          await Promise.all([
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

  const filteredOrders = useMemo(() => {
    if (statusFilter === 'ALL') {
      return orders;
    }

    return orders.filter(
      (order) => order.status === statusFilter,
    );
  }, [orders, statusFilter]);

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

      const newOrder =
        await createRepairOrder({
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

  const handleStatusChange = async (
    orderId: string,
    status: RepairStatus,
  ): Promise<void> => {
    try {
      setUpdatingOrderId(orderId);
      setError(null);

      const updatedOrder =
        await updateRepairOrderStatus(
          orderId,
          status,
        );

      setOrders((current) =>
        current.map((order) =>
          order.id === updatedOrder.id
            ? updatedOrder
            : order,
        ),
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'No se pudo actualizar el estado.',
      );
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const toggleHistory = (
    orderId: string,
  ): void => {
    setExpandedOrderId((current) =>
      current === orderId
        ? null
        : orderId,
    );
  };

  const handleEditDiagnosis = (
    order: RepairOrder,
  ): void => {
    setEditingDiagnosisId(order.id);
    setDiagnosisDraft(
      order.diagnosis ?? '',
    );
  };

  const handleCancelDiagnosis =
    (): void => {
      setEditingDiagnosisId(null);
      setDiagnosisDraft('');
    };

  const handleSaveDiagnosis = async (
    orderId: string,
  ): Promise<void> => {
    try {
      setSavingDiagnosisId(orderId);
      setError(null);

      const updatedOrder =
        await updateRepairDiagnosis(
          orderId,
          {
            diagnosis: diagnosisDraft,
          },
        );

      setOrders((current) =>
        current.map((order) =>
          order.id === updatedOrder.id
            ? updatedOrder
            : order,
        ),
      );

      setEditingDiagnosisId(null);
      setDiagnosisDraft('');
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'No se pudo guardar el diagnóstico.',
      );
    } finally {
      setSavingDiagnosisId(null);
    }
  };

  return (
    <>
      <header className="page-header">
        <div>
          <p className="eyebrow">
            Reparaciones
          </p>

          <h2>
            Órdenes de reparación
          </h2>

          <p>
            Registrá ingresos y gestioná
            el avance de cada reparación.
          </p>
        </div>

        <div className="client-counter">
          <strong>
            {orders.length}
          </strong>

          <span>
            órdenes
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
                Nuevo ingreso
              </span>

              <h3>
                Nueva reparación
              </h3>
            </div>
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
                    {
                      device.client
                        .firstName
                    }{' '}
                    {
                      device.client
                        .lastName
                    }
                    {' — '}
                    {device.brand}{' '}
                    {device.model}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Problema informado

              <textarea
                name="reportedIssue"
                value={
                  form.reportedIssue
                }
                onChange={handleChange}
                rows={5}
                minLength={5}
                required
                placeholder="Ej: El equipo no enciende..."
              />
            </label>

            <label>
              Fecha estimada de
              finalización

              <input
                type="datetime-local"
                name="estimatedCompletionDate"
                value={
                  form.estimatedCompletionDate ??
                  ''
                }
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
          <div className="panel-header repair-panel-header">
            <div>
              <span className="panel-label">
                Taller
              </span>

              <h3>
                Órdenes registradas
              </h3>
            </div>

            <select
              className="status-filter"
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target
                    .value as StatusFilter,
                )
              }
            >
              <option value="ALL">
                Todos los estados
              </option>

              {statuses.map((status) => (
                <option
                  key={status}
                  value={status}
                >
                  {statusLabels[status]}
                </option>
              ))}
            </select>
          </div>

          {!loading && (
            <p className="repair-results">
              {filteredOrders.length}{' '}
              {filteredOrders.length ===
              1
                ? 'orden'
                : 'órdenes'}
            </p>
          )}

          {loading && (
            <p className="empty-state">
              Cargando reparaciones...
            </p>
          )}

          {!loading &&
            filteredOrders.length ===
              0 && (
              <p className="empty-state">
                No hay reparaciones
                para este estado.
              </p>
            )}

          {!loading &&
            filteredOrders.length >
              0 && (
              <div className="repair-list">
                {filteredOrders.map(
                  (order) => {
                    const isHistoryOpen =
                      expandedOrderId ===
                      order.id;

                    const isEditingDiagnosis =
                      editingDiagnosisId ===
                      order.id;

                    const isSavingDiagnosis =
                      savingDiagnosisId ===
                      order.id;

                    return (
                      <article
                        key={order.id}
                        className="repair-card"
                      >
                        <div className="repair-card-header">
                          <div>
                            <strong className="repair-code">
                              {
                                order.code
                              }
                            </strong>

                            <span
                              className={`repair-status status-${order.status.toLowerCase()}`}
                            >
                              {
                                statusLabels[
                                  order
                                    .status
                                ]
                              }
                            </span>
                          </div>

                          <span className="repair-date">
                            {new Date(
                              order.createdAt,
                            ).toLocaleDateString(
                              'es-AR',
                            )}
                          </span>
                        </div>

                        <h4>
                          {
                            order.device
                              .brand
                          }{' '}
                          {
                            order.device
                              .model
                          }
                        </h4>

                        <p className="repair-client">
                          {
                            order.device
                              .client
                              .firstName
                          }{' '}
                          {
                            order.device
                              .client
                              .lastName
                          }
                          {' · '}
                          {
                            order.device
                              .type
                          }
                        </p>

                        <p className="repair-issue">
                          {
                            order.reportedIssue
                          }
                        </p>

                        <div className="diagnosis-section">
                          <div className="diagnosis-header">
                            <span>
                              Diagnóstico
                              técnico
                            </span>

                            {!isEditingDiagnosis && (
                              <button
                                type="button"
                                className="diagnosis-edit-button"
                                onClick={() =>
                                  handleEditDiagnosis(
                                    order,
                                  )
                                }
                              >
                                {order.diagnosis
                                  ? 'Editar'
                                  : 'Agregar diagnóstico'}
                              </button>
                            )}
                          </div>

                          {isEditingDiagnosis ? (
                            <div className="diagnosis-editor">
                              <textarea
                                value={
                                  diagnosisDraft
                                }
                                onChange={(
                                  event,
                                ) =>
                                  setDiagnosisDraft(
                                    event
                                      .target
                                      .value,
                                  )
                                }
                                rows={4}
                                minLength={3}
                                maxLength={2000}
                                placeholder="Describí el diagnóstico técnico..."
                              />

                              <div className="diagnosis-actions">
                                <button
                                  type="button"
                                  className="secondary-button"
                                  onClick={
                                    handleCancelDiagnosis
                                  }
                                  disabled={
                                    isSavingDiagnosis
                                  }
                                >
                                  Cancelar
                                </button>

                                <button
                                  type="button"
                                  className="primary-button"
                                  disabled={
                                    diagnosisDraft
                                      .trim()
                                      .length <
                                      3 ||
                                    isSavingDiagnosis
                                  }
                                  onClick={() =>
                                    void handleSaveDiagnosis(
                                      order.id,
                                    )
                                  }
                                >
                                  {isSavingDiagnosis
                                    ? 'Guardando...'
                                    : 'Guardar diagnóstico'}
                                </button>
                              </div>
                            </div>
                          ) : (
                            <p
                              className={
                                order.diagnosis
                                  ? 'diagnosis-text'
                                  : 'diagnosis-empty'
                              }
                            >
                              {order.diagnosis ??
                                'Todavía no se cargó un diagnóstico.'}
                            </p>
                          )}
                        </div>

                        {order.estimatedCompletionDate && (
                          <p className="repair-estimated">
                            Entrega
                            estimada:{' '}
                            {new Date(
                              order.estimatedCompletionDate,
                            ).toLocaleString(
                              'es-AR',
                              {
                                dateStyle:
                                  'short',
                                timeStyle:
                                  'short',
                              },
                            )}
                          </p>
                        )}

                        <div className="repair-actions">
                          <label>
                            Estado

                            <select
                              value={
                                order.status
                              }
                              disabled={
                                updatingOrderId ===
                                order.id
                              }
                              onChange={(
                                event,
                              ) =>
                                void handleStatusChange(
                                  order.id,
                                  event
                                    .target
                                    .value as RepairStatus,
                                )
                              }
                            >
                              {statuses.map(
                                (status) => (
                                  <option
                                    key={
                                      status
                                    }
                                    value={
                                      status
                                    }
                                  >
                                    {
                                      statusLabels[
                                        status
                                      ]
                                    }
                                  </option>
                                ),
                              )}
                            </select>
                          </label>

                          {updatingOrderId ===
                            order.id && (
                            <span className="saving-status">
                              Actualizando...
                            </span>
                          )}
                        </div>

                        <div className="history-section">
                          <button
                            type="button"
                            className="history-toggle"
                            onClick={() =>
                              toggleHistory(
                                order.id,
                              )
                            }
                            aria-expanded={
                              isHistoryOpen
                            }
                          >
                            {isHistoryOpen
                              ? 'Ocultar historial'
                              : 'Ver historial'}
                          </button>

                          {isHistoryOpen && (
                            <div className="status-timeline">
                              {order
                                .statusHistory
                                ?.length >
                              0 ? (
                                order.statusHistory.map(
                                  (
                                    historyItem,
                                    index,
                                  ) => {
                                    const isLast =
                                      index ===
                                      order
                                        .statusHistory
                                        .length -
                                        1;

                                    return (
                                      <div
                                        className="timeline-item"
                                        key={
                                          historyItem.id
                                        }
                                      >
                                        <div className="timeline-marker-column">
                                          <span
                                            className={`timeline-dot ${
                                              isLast
                                                ? 'current'
                                                : ''
                                            }`}
                                          />

                                          {!isLast && (
                                            <span className="timeline-line" />
                                          )}
                                        </div>

                                        <div className="timeline-content">
                                          <strong>
                                            {
                                              statusLabels[
                                                historyItem
                                                  .status
                                              ]
                                            }
                                          </strong>

                                          <span>
                                            {new Date(
                                              historyItem.createdAt,
                                            ).toLocaleString(
                                              'es-AR',
                                              {
                                                dateStyle:
                                                  'short',
                                                timeStyle:
                                                  'short',
                                              },
                                            )}
                                          </span>
                                        </div>
                                      </div>
                                    );
                                  },
                                )
                              ) : (
                                <p className="history-empty">
                                  Esta orden
                                  no tiene
                                  historial
                                  registrado.
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </article>
                    );
                  },
                )}
              </div>
            )}
        </section>
      </div>
    </>
  );
}