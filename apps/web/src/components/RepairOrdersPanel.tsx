import {
  type ChangeEvent,
  type FormEvent,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { RepairReceipt } from './RepairReceipt';
import { SearchInput } from './SearchInput';
import { TrackingShareActions } from './TrackingShareActions';
import { RepairInternalNotes } from './RepairInternalNotes';
import { RepairPhotos } from './RepairPhotos';

import { getDevices } from '../services/devices';

import {
  createRepairOrder,
  getRepairOrders,
  updateRepairDiagnosis,
  updateRepairOrderStatus,
  updateRepairQuote,
  updateRepairQuoteStatus,
} from '../services/repair-orders';

import type { Device } from '../types/device';

import type {
  CreateRepairOrderInput,
  QuoteStatus,
  RepairOrder,
  RepairStatus,
} from '../types/repair-order';

import type { RepairFilter } from '../types/repair-filter';

const initialForm: CreateRepairOrderInput = {
  deviceId: '',
  reportedIssue: '',
  estimatedCompletionDate: '',
};

const statusLabels: Record<
  RepairStatus,
  string
> = {
  RECEIVED: 'Recibido',
  IN_DIAGNOSIS: 'En diagnóstico',
  WAITING_APPROVAL:
    'Esperando aprobación',
  IN_REPAIR: 'En reparación',
  READY_FOR_PICKUP:
    'Listo para retirar',
  DELIVERED: 'Entregado',
  CANCELLED: 'Cancelado',
  UNREPAIRED: 'Sin reparación',
};

const quoteStatusLabels: Record<
  QuoteStatus,
  string
> = {
  PENDING: 'Esperando respuesta',
  APPROVED: 'Aprobado',
  REJECTED: 'Rechazado',
};

const statuses = Object.keys(
  statusLabels,
) as RepairStatus[];

interface RepairOrdersPanelProps {
  initialFilter?: RepairFilter;
}

export function RepairOrdersPanel({
  initialFilter = 'ALL',
}: RepairOrdersPanelProps) {
  const [orders, setOrders] =
    useState<RepairOrder[]>([]);

  const [devices, setDevices] =
    useState<Device[]>([]);

  const [form, setForm] =
    useState<CreateRepairOrderInput>(
      initialForm,
    );

  const [statusFilter, setStatusFilter] =
    useState<RepairFilter>(initialFilter);

  const [search, setSearch] = useState('');

  const [
    expandedOrderId,
    setExpandedOrderId,
  ] = useState<string | null>(null);

  const [
    editingDiagnosisId,
    setEditingDiagnosisId,
  ] = useState<string | null>(null);

  const [
    diagnosisDraft,
    setDiagnosisDraft,
  ] = useState('');

  const [
    savingDiagnosisId,
    setSavingDiagnosisId,
  ] = useState<string | null>(null);

  const [
    editingQuoteId,
    setEditingQuoteId,
  ] = useState<string | null>(null);

  const [
    quoteAmountDraft,
    setQuoteAmountDraft,
  ] = useState('');

  const [
    quoteDescriptionDraft,
    setQuoteDescriptionDraft,
  ] = useState('');

  const [
    savingQuoteId,
    setSavingQuoteId,
  ] = useState<string | null>(null);

  const [
    respondingQuoteId,
    setRespondingQuoteId,
  ] = useState<string | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [
    updatingOrderId,
    setUpdatingOrderId,
  ] = useState<string | null>(null);

  const [error, setError] =
    useState<string | null>(null);

  const [
    receiptOrder,
    setReceiptOrder,
  ] = useState<RepairOrder | null>(null);

  useEffect(() => {
    const loadData =
      async (): Promise<void> => {
        try {
          setError(null);

          const [
            ordersData,
            devicesData,
          ] = await Promise.all([
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

  useEffect(() => {
    setStatusFilter(initialFilter);
  }, [initialFilter]);

  const filteredOrders = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase();

    const now = Date.now();

    const threeDaysInMilliseconds =
      3 * 24 * 60 * 60 * 1000;

    const closedStatuses: RepairStatus[] = [
      'DELIVERED',
      'CANCELLED',
      'UNREPAIRED',
    ];

    return orders.filter((order) => {
      let matchesFilter = true;

      if (statusFilter === 'OVERDUE') {
        const isActive =
          !closedStatuses.includes(
            order.status,
          );

        const isOverdue =
          order.estimatedCompletionDate !==
            null &&
          new Date(
            order.estimatedCompletionDate,
          ).getTime() < now;

        matchesFilter =
          isActive && isOverdue;
      } else if (
        statusFilter === 'STALE'
      ) {
        const isActive =
          !closedStatuses.includes(
            order.status,
          );

        const lastUpdate =
          new Date(
            order.updatedAt,
          ).getTime();

        matchesFilter =
          isActive &&
          now - lastUpdate >=
            threeDaysInMilliseconds;
      } else if (
        statusFilter !== 'ALL'
      ) {
        matchesFilter =
          order.status === statusFilter;
      }

      if (!matchesFilter) {
        return false;
      }

      if (!query) {
        return true;
      }

      const clientName =
        `${order.device.client.firstName} ${order.device.client.lastName}`.toLowerCase();

      const deviceName =
        `${order.device.brand} ${order.device.model}`.toLowerCase();

      const diagnosisMatches =
        order.diagnosis
          ?.toLowerCase()
          .includes(query) ?? false;


      return (
        order.code
          .toLowerCase()
          .includes(query) ||
        clientName.includes(query) ||
        deviceName.includes(query) ||
        order.device.type
          .toLowerCase()
          .includes(query) ||
        order.reportedIssue
          .toLowerCase()
          .includes(query) ||
        diagnosisMatches
      );
    });
  }, [
    orders,
    statusFilter,
    search,
  ]);

  const handleOrderUpdated = (
    updatedOrder: RepairOrder,
  ): void => {
    setOrders((currentOrders) =>
      currentOrders.map((order) =>
        order.id === updatedOrder.id
          ? updatedOrder
          : order,
      ),
    );
  };

  const handleChange = (
    event: ChangeEvent<
      HTMLSelectElement |
      HTMLInputElement |
      HTMLTextAreaElement
    >,
  ): void => {
    const { name, value } =
      event.target;

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

          reportedIssue:
            form.reportedIssue,

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
            diagnosis:
              diagnosisDraft,
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

  const handleEditQuote = (
    order: RepairOrder,
  ): void => {
    setEditingQuoteId(order.id);

    setQuoteAmountDraft(
      order.quote
        ? String(order.quote.amount)
        : '',
    );

    setQuoteDescriptionDraft(
      order.quote?.description ??
        '',
    );
  };

  const handleCancelQuote =
    (): void => {
      setEditingQuoteId(null);
      setQuoteAmountDraft('');
      setQuoteDescriptionDraft('');
    };

  const handleSaveQuote = async (
    orderId: string,
  ): Promise<void> => {
    const amount = Number(
      quoteAmountDraft,
    );

    if (
      !Number.isInteger(amount) ||
      amount <= 0
    ) {
      setError(
        'El presupuesto debe ser un monto entero mayor a 0.',
      );
      return;
    }

    try {
      setSavingQuoteId(orderId);
      setError(null);

      const updatedOrder =
        await updateRepairQuote(
          orderId,
          {
            amount,

            description:
              quoteDescriptionDraft
                .trim() ||
              undefined,
          },
        );

      setOrders((current) =>
        current.map((order) =>
          order.id === updatedOrder.id
            ? updatedOrder
            : order,
        ),
      );

      setEditingQuoteId(null);
      setQuoteAmountDraft('');
      setQuoteDescriptionDraft('');
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'No se pudo guardar el presupuesto.',
      );
    } finally {
      setSavingQuoteId(null);
    }
  };

  const handleQuoteStatus = async (
    orderId: string,
    status: QuoteStatus,
  ): Promise<void> => {
    try {
      setRespondingQuoteId(orderId);
      setError(null);

      const updatedOrder =
        await updateRepairQuoteStatus(
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
          : 'No se pudo responder el presupuesto.',
      );
    } finally {
      setRespondingQuoteId(null);
    }
  };

  const formatCurrency = (
    amount: number,
  ): string => {
    return new Intl.NumberFormat(
      'es-AR',
      {
        style: 'currency',
        currency: 'ARS',
        maximumFractionDigits: 0,
      },
    ).format(amount);
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

                {devices.map(
                  (device) => (
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
                  ),
                )}
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
                    .value as RepairFilter,
                )
              }
            >
              <option value="ALL">
                Todos los estados
              </option>

              {statuses.map(
                (status) => (
                  <option
                    key={status}
                    value={status}
                  >
                    {
                      statusLabels[
                        status
                      ]
                    }
                  </option>
                ),
              )}

              <option value="OVERDUE">
                Reparaciones atrasadas
              </option>

              <option value="STALE">
                Sin actualizar +3 días
              </option>
            </select>
          </div>

          {!loading &&
            orders.length > 0 && (
              <SearchInput
                value={search}
                onChange={setSearch}
                placeholder="Buscar por código, cliente, equipo o problema..."
              />
            )}

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
            orders.length === 0 && (
              <p className="empty-state">
                Todavía no hay
                reparaciones registradas.
              </p>
            )}

          {!loading &&
            orders.length > 0 &&
            filteredOrders.length ===
              0 && (
              <p className="empty-state">
                No encontramos
                reparaciones con los
                filtros actuales.
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

                    const isEditingQuote =
                      editingQuoteId ===
                      order.id;

                    const isSavingQuote =
                      savingQuoteId ===
                      order.id;

                    const isRespondingQuote =
                      respondingQuoteId ===
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
  <>
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

    {order.diagnosisUpdatedAt && (
      <div className="trace-meta">
        {order.diagnosisUpdatedBy && (
          <>
            <span>
              Actualizado por{' '}
            </span>

            <strong>
              {
                order
                  .diagnosisUpdatedBy
                  .name
              }
            </strong>

            <span>
              {' · '}
            </span>
          </>
        )}

        <time
          dateTime={
            order.diagnosisUpdatedAt
          }
        >
          {new Date(
            order.diagnosisUpdatedAt,
          ).toLocaleString(
            'es-AR',
            {
              dateStyle: 'short',
              timeStyle: 'short',
            },
          )}
        </time>
      </div>
    )}
  </>
)}
                        </div>

                        <div className="quote-section">
                          <div className="quote-header">
                            <div>
                              <span className="quote-title">
                                Presupuesto
                              </span>

                              {order.quote && (
                                <span
                                  className={`quote-status quote-status-${order.quote.status.toLowerCase()}`}
                                >
                                  {
                                    quoteStatusLabels[
                                      order
                                        .quote
                                        .status
                                    ]
                                  }
                                </span>
                              )}
                            </div>

                            {!isEditingQuote && (
                              <button
                                type="button"
                                className="diagnosis-edit-button"
                                onClick={() =>
                                  handleEditQuote(
                                    order,
                                  )
                                }
                              >
                                {order.quote
                                  ? 'Editar'
                                  : 'Agregar presupuesto'}
                              </button>
                            )}
                          </div>

                          {isEditingQuote ? (
                            <div className="quote-editor">
                              <label>
                                Monto

                                <input
                                  type="number"
                                  min="1"
                                  step="1"
                                  value={
                                    quoteAmountDraft
                                  }
                                  onChange={(
                                    event,
                                  ) =>
                                    setQuoteAmountDraft(
                                      event
                                        .target
                                        .value,
                                    )
                                  }
                                  placeholder="85000"
                                />
                              </label>

                              <label>
                                Detalle

                                <textarea
                                  value={
                                    quoteDescriptionDraft
                                  }
                                  onChange={(
                                    event,
                                  ) =>
                                    setQuoteDescriptionDraft(
                                      event
                                        .target
                                        .value,
                                    )
                                  }
                                  rows={3}
                                  maxLength={1000}
                                  placeholder="Ej: reemplazo del conector de carga + mano de obra"
                                />
                              </label>

                              <div className="diagnosis-actions">
                                <button
                                  type="button"
                                  className="secondary-button"
                                  onClick={
                                    handleCancelQuote
                                  }
                                  disabled={
                                    isSavingQuote
                                  }
                                >
                                  Cancelar
                                </button>

                                <button
                                  type="button"
                                  className="primary-button"
                                  disabled={
                                    !quoteAmountDraft ||
                                    Number(
                                      quoteAmountDraft,
                                    ) <=
                                      0 ||
                                    isSavingQuote
                                  }
                                  onClick={() =>
                                    void handleSaveQuote(
                                      order.id,
                                    )
                                  }
                                >
                                  {isSavingQuote
                                    ? 'Guardando...'
                                    : 'Guardar presupuesto'}
                                </button>
                              </div>
                            </div>
                          ) : order.quote ? (
                            <div className="quote-content">
                              <strong className="quote-amount">
                                {formatCurrency(
                                  order
                                    .quote
                                    .amount,
                                )}
                              </strong>
                                {order.quote.updatedBy && (
  <div className="trace-meta">
    <span>
      Presupuesto cargado por{' '}
    </span>

    <strong>
      {
        order.quote
          .updatedBy.name
      }
    </strong>
  </div>
)}
                              {order.quote
                                .description && (
                                <p>
                                  {
                                    order
                                      .quote
                                      .description
                                  }
                                </p>
                              )}

                              {order.quote
                                .status ===
                                'PENDING' && (
                                <div className="quote-response-actions">
                                  <button
                                    type="button"
                                    className="quote-reject-button"
                                    disabled={
                                      isRespondingQuote
                                    }
                                    onClick={() =>
                                      void handleQuoteStatus(
                                        order.id,
                                        'REJECTED',
                                      )
                                    }
                                  >
                                    Rechazar
                                  </button>

                                  <button
                                    type="button"
                                    className="quote-approve-button"
                                    disabled={
                                      isRespondingQuote
                                    }
                                    onClick={() =>
                                      void handleQuoteStatus(
                                        order.id,
                                        'APPROVED',
                                      )
                                    }
                                  >
                                    {isRespondingQuote
                                      ? 'Procesando...'
                                      : 'Aprobar'}
                                  </button>
                                </div>
                              )}

                              {order.quote
                                .respondedAt && (
                                <span className="quote-response-date">
                                  Respondido:{' '}
                                  {new Date(
                                    order
                                      .quote
                                      .respondedAt,
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
                              )}
                            </div>
                          ) : (
                            <p className="diagnosis-empty">
                              Todavía no se
                              cargó un
                              presupuesto.
                            </p>
                          )}
                        </div>

                        <RepairInternalNotes
                          repairOrderId={order.id}
                          notes={order.internalNotes}
                          onOrderUpdated={
                            handleOrderUpdated
                          }
                        />

                         <RepairPhotos
                          repairOrderId={order.id}
                          photos={order.photos}
                           onOrderUpdated={handleOrderUpdated}
                        />

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
                                (
                                  status,
                                ) => (
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
      historyItem.status
    ]
  }
</strong>

<span>
  {new Date(
    historyItem.createdAt,
  ).toLocaleString(
    'es-AR',
    {
      dateStyle: 'short',
      timeStyle: 'short',
    },
  )}
</span>

{historyItem.changedBy && (
  <small className="timeline-user">
    Por{' '}
    <strong>
      {
        historyItem
          .changedBy.name
      }
    </strong>
  </small>
)}
                                        </div>
                                      </div>
                                    );
                                  },
                                )
                              ) : (
                                <p className="history-empty">
                                  Esta orden no
                                  tiene historial
                                  registrado.
                                </p>
                              )}
                            </div>
                          )}
                          <TrackingShareActions
                            trackingToken={
                              order.trackingToken
                            }
                            orderCode={order.code}
                            clientPhone={
                              order.device.client.phone
                            }
                            deviceName={`${order.device.brand} ${order.device.model}`}
                            status={order.status}
                            quoteAmount={
                              order.quote?.amount
                            }
                          />

                          <button
                            type="button"
                            className="secondary-button"
                            onClick={() =>
                              setReceiptOrder(order)
                            }
                          >
                            Comprobante
                          </button>
                        </div>
                      </article>
                    );
                  },
                  
                )}
                
              </div>
            )}
            
        </section>
        
      </div>
      {receiptOrder && (
        <RepairReceipt
          order={receiptOrder}
          onClose={() =>
            setReceiptOrder(null)
          }
        />
      )}
    </>
  );
}