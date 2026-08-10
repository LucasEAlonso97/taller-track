import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import { getClients } from '../services/clients';
import { getDevices } from '../services/devices';
import { getRepairOrders } from '../services/repair-orders';

import type { RepairFilter } from '../types/repair-filter';

import type {
  RepairOrder,
  RepairStatus,
} from '../types/repair-order';

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

const closedStatuses: RepairStatus[] = [
  'DELIVERED',
  'CANCELLED',
  'UNREPAIRED',
];

interface DashboardPanelProps {
  onOpenRepairs: (filter: RepairFilter) => void;
}

export function DashboardPanel({
  onOpenRepairs,
}: DashboardPanelProps) {
  const [orders, setOrders] =
    useState<RepairOrder[]>([]);

  const [clientsCount, setClientsCount] =
    useState(0);

  const [devicesCount, setDevicesCount] =
    useState(0);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    const loadDashboard =
      async (): Promise<void> => {
        try {
          setError(null);

          const [
            clients,
            devices,
            repairOrders,
          ] = await Promise.all([
            getClients(),
            getDevices(),
            getRepairOrders(),
          ]);

          setClientsCount(clients.length);
          setDevicesCount(devices.length);
          setOrders(repairOrders);
        } catch (error) {
          setError(
            error instanceof Error
              ? error.message
              : 'No se pudo cargar el dashboard.',
          );
        } finally {
          setLoading(false);
        }
      };

    void loadDashboard();
  }, []);

  const dashboardData = useMemo(() => {
    const now = Date.now();

    const threeDaysInMilliseconds =
      3 * 24 * 60 * 60 * 1000;

    const activeOrders = orders.filter(
      (order) =>
        !closedStatuses.includes(
          order.status,
        ),
    );

    const waitingApproval = orders.filter(
      (order) =>
        order.status ===
        'WAITING_APPROVAL',
    );

    const readyForPickup = orders.filter(
      (order) =>
        order.status ===
        'READY_FOR_PICKUP',
    );

    const overdue = activeOrders.filter(
      (order) => {
        if (
          !order.estimatedCompletionDate
        ) {
          return false;
        }

        return (
          new Date(
            order.estimatedCompletionDate,
          ).getTime() < now
        );
      },
    );

    const stale = activeOrders.filter(
      (order) => {
        const updatedAt =
          new Date(
            order.updatedAt,
          ).getTime();

        return (
          now - updatedAt >=
          threeDaysInMilliseconds
        );
      },
    );

    return {
      activeOrders,
      waitingApproval,
      readyForPickup,
      overdue,
      stale,
      recentOrders: orders.slice(0, 5),
    };
  }, [orders]);

  if (loading) {
    return (
      <div className="panel">
        <p>Cargando dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="panel">
        <p className="error-message">
          {error}
        </p>
      </div>
    );
  }

  return (
    <div className="dashboard-panel">
      <div className="section-heading">
        <div>
          <h1>Inicio</h1>

          <p>
            Resumen general del taller.
          </p>
        </div>
      </div>

      <div className="dashboard-stats">
        <article className="dashboard-stat-card">
          <span>Clientes</span>

          <strong>
            {clientsCount}
          </strong>
        </article>

        <article className="dashboard-stat-card">
          <span>Equipos</span>

          <strong>
            {devicesCount}
          </strong>
        </article>

        <article className="dashboard-stat-card">
          <span>
            Reparaciones activas
          </span>

          <strong>
            {
              dashboardData
                .activeOrders.length
            }
          </strong>
        </article>

        <article className="dashboard-stat-card">
          <span>
            Total de órdenes
          </span>

          <strong>
            {orders.length}
          </strong>
        </article>
      </div>

      <section className="dashboard-attention-section">
        <div className="dashboard-section-header">
          <div>
            <span className="dashboard-eyebrow">
              Trabajo pendiente
            </span>

            <h2>
              Necesitan atención
            </h2>
          </div>

          <p>
            Situaciones que conviene
            revisar hoy.
          </p>
        </div>

        <div className="dashboard-attention-grid">
          <button
            type="button"
            className="attention-card"
            onClick={() =>
              onOpenRepairs(
                'WAITING_APPROVAL',
              )
            }
          >
            <div>
              <span className="attention-card-label">
                Esperando aprobación
              </span>

              <strong>
                {
                  dashboardData
                    .waitingApproval
                    .length
                }
              </strong>
            </div>

            <span className="attention-card-description">
              Presupuestos pendientes de
              respuesta
            </span>
          </button>

          <button
            type="button"
            className="attention-card"
            onClick={() =>
              onOpenRepairs(
                'READY_FOR_PICKUP',
              )
            }
          >
            <div>
              <span className="attention-card-label">
                Listas para retirar
              </span>

              <strong>
                {
                  dashboardData
                    .readyForPickup
                    .length
                }
              </strong>
            </div>

            <span className="attention-card-description">
              Equipos esperando al cliente
            </span>
          </button>

          <button
            type="button"
            className={`attention-card ${
              dashboardData.overdue
                .length > 0
                ? 'attention-card-warning'
                : ''
            }`}
            onClick={() =>
              onOpenRepairs('OVERDUE')
            }
          >
            <div>
              <span className="attention-card-label">
                Reparaciones atrasadas
              </span>

              <strong>
                {
                  dashboardData
                    .overdue.length
                }
              </strong>
            </div>

            <span className="attention-card-description">
              Superaron la fecha estimada
            </span>
          </button>

          <button
            type="button"
            className={`attention-card ${
              dashboardData.stale
                .length > 0
                ? 'attention-card-warning'
                : ''
            }`}
            onClick={() =>
              onOpenRepairs('STALE')
            }
          >
            <div>
              <span className="attention-card-label">
                Sin actualizar +3 días
              </span>

              <strong>
                {
                  dashboardData
                    .stale.length
                }
              </strong>
            </div>

            <span className="attention-card-description">
              Órdenes activas sin movimientos
              recientes
            </span>
          </button>
        </div>
      </section>

      <section className="dashboard-recent-section">
        <div className="dashboard-section-header">
          <div>
            <span className="dashboard-eyebrow">
              Actividad
            </span>

            <h2>
              Reparaciones recientes
            </h2>
          </div>
        </div>

        {dashboardData.recentOrders
          .length === 0 ? (
          <p className="empty-state">
            Todavía no hay reparaciones.
          </p>
        ) : (
          <div className="recent-orders">
            {dashboardData.recentOrders.map(
              (order) => (
                <article
                  className="recent-order"
                  key={order.id}
                >
                  <div>
                    <strong>
                      {order.code}
                    </strong>

                    <span>
                      {order.device.brand}{' '}
                      {order.device.model}
                    </span>
                  </div>

                  <span
                    className={`repair-status status-${order.status.toLowerCase()}`}
                  >
                    {
                      statusLabels[
                        order.status
                      ]
                    }
                  </span>
                </article>
              ),
            )}
          </div>
        )}
      </section>
    </div>
  );
}