import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import { getClients } from '../services/clients';
import { getDevices } from '../services/devices';
import { getRepairOrders } from '../services/repair-orders';

import type { Client } from '../types/client';
import type { Device } from '../types/device';
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

const inactiveStatuses: RepairStatus[] = [
  'DELIVERED',
  'CANCELLED',
  'UNREPAIRED',
];

export function DashboardPanel() {
  const [clients, setClients] =
    useState<Client[]>([]);

  const [devices, setDevices] =
    useState<Device[]>([]);

  const [orders, setOrders] =
    useState<RepairOrder[]>([]);

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
            clientsData,
            devicesData,
            ordersData,
          ] = await Promise.all([
            getClients(),
            getDevices(),
            getRepairOrders(),
          ]);

          setClients(clientsData);
          setDevices(devicesData);
          setOrders(ordersData);
        } catch (error) {
          setError(
            error instanceof Error
              ? error.message
              : 'No se pudo cargar el resumen.',
          );
        } finally {
          setLoading(false);
        }
      };

    void loadDashboard();
  }, []);

  const activeOrders = useMemo(
    () =>
      orders.filter(
        (order) =>
          !inactiveStatuses.includes(
            order.status,
          ),
      ),
    [orders],
  );

  const waitingApproval = useMemo(
    () =>
      orders.filter(
        (order) =>
          order.status ===
          'WAITING_APPROVAL',
      ).length,
    [orders],
  );

  const inRepair = useMemo(
    () =>
      orders.filter(
        (order) =>
          order.status === 'IN_REPAIR',
      ).length,
    [orders],
  );

  const readyForPickup = useMemo(
    () =>
      orders.filter(
        (order) =>
          order.status ===
          'READY_FOR_PICKUP',
      ).length,
    [orders],
  );

  const recentOrders = useMemo(
    () => orders.slice(0, 5),
    [orders],
  );

  if (loading) {
    return (
      <p className="empty-state">
        Cargando resumen del taller...
      </p>
    );
  }

  return (
    <>
      <header className="page-header">
        <div>
          <p className="eyebrow">
            Inicio
          </p>

          <h2>
            Resumen del taller
          </h2>

          <p>
            Una vista rápida de la actividad
            actual de TallerTrack.
          </p>
        </div>
      </header>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="dashboard-stats">
        <article className="dashboard-stat-card">
          <span>Clientes</span>

          <strong>
            {clients.length}
          </strong>

          <p>
            Registrados
          </p>
        </article>

        <article className="dashboard-stat-card">
          <span>Equipos</span>

          <strong>
            {devices.length}
          </strong>

          <p>
            Registrados
          </p>
        </article>

        <article className="dashboard-stat-card">
          <span>
            Reparaciones activas
          </span>

          <strong>
            {activeOrders.length}
          </strong>

          <p>
            En proceso
          </p>
        </article>

        <article className="dashboard-stat-card">
          <span>
            Total de órdenes
          </span>

          <strong>
            {orders.length}
          </strong>

          <p>
            Históricas
          </p>
        </article>
      </div>

      <div className="dashboard-overview-grid">
        <section className="panel">
          <div className="panel-header">
            <div>
              <span className="panel-label">
                Estado actual
              </span>

              <h3>
                Reparaciones pendientes
              </h3>
            </div>
          </div>

          <div className="dashboard-status-list">
            <div className="dashboard-status-row">
              <div>
                <span className="status-indicator" />

                <span>
                  Esperando aprobación
                </span>
              </div>

              <strong>
                {waitingApproval}
              </strong>
            </div>

            <div className="dashboard-status-row">
              <div>
                <span className="status-indicator" />

                <span>
                  En reparación
                </span>
              </div>

              <strong>
                {inRepair}
              </strong>
            </div>

            <div className="dashboard-status-row">
              <div>
                <span className="status-indicator" />

                <span>
                  Listos para retirar
                </span>
              </div>

              <strong>
                {readyForPickup}
              </strong>
            </div>
          </div>
        </section>

        <section className="panel">
          <div className="panel-header">
            <div>
              <span className="panel-label">
                Actividad reciente
              </span>

              <h3>
                Últimas reparaciones
              </h3>
            </div>
          </div>

          {recentOrders.length === 0 ? (
            <p className="empty-state">
              Todavía no hay reparaciones.
            </p>
          ) : (
            <div className="recent-orders">
              {recentOrders.map((order) => (
                <article
                  key={order.id}
                  className="recent-order"
                >
                  <div>
                    <strong>
                      {order.code}
                    </strong>

                    <span>
                      {order.device.brand}{' '}
                      {order.device.model}
                    </span>

                    <small>
                      {
                        order.device.client
                          .firstName
                      }{' '}
                      {
                        order.device.client
                          .lastName
                      }
                    </small>
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
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
}