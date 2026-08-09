import {
  useEffect,
  useState,
} from 'react';

import { getPublicTracking } from '../services/tracking';

import type {
  QuoteStatus,
  RepairStatus,
} from '../types/repair-order';

import type { PublicTrackingData } from '../types/tracking';

interface PublicTrackingPageProps {
  token: string;
}

const statusLabels: Record<RepairStatus, string> = {
  RECEIVED: 'Equipo recibido',
  IN_DIAGNOSIS: 'En diagnóstico',
  WAITING_APPROVAL: 'Esperando aprobación',
  IN_REPAIR: 'En reparación',
  READY_FOR_PICKUP: 'Listo para retirar',
  DELIVERED: 'Entregado',
  CANCELLED: 'Cancelado',
  UNREPAIRED: 'Sin reparación',
};

const quoteStatusLabels: Record<QuoteStatus, string> = {
  PENDING: 'Esperando respuesta',
  APPROVED: 'Aprobado',
  REJECTED: 'Rechazado',
};

export function PublicTrackingPage({
  token,
}: PublicTrackingPageProps) {
  const [tracking, setTracking] =
    useState<PublicTrackingData | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    const loadTracking =
      async (): Promise<void> => {
        try {
          setError(null);

          const data =
            await getPublicTracking(token);

          setTracking(data);
        } catch (error) {
          setError(
            error instanceof Error
              ? error.message
              : 'No se pudo consultar la reparación.',
          );
        } finally {
          setLoading(false);
        }
      };

    void loadTracking();
  }, [token]);

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

  if (loading) {
    return (
      <main className="public-tracking-page">
        <div className="public-tracking-shell">
          <p className="public-tracking-loading">
            Consultando reparación...
          </p>
        </div>
      </main>
    );
  }

  if (error || !tracking) {
    return (
      <main className="public-tracking-page">
        <div className="public-tracking-shell">
          <div className="public-tracking-brand">
            TallerTrack
          </div>

          <section className="public-tracking-error">
            <h1>
              No pudimos encontrar la reparación
            </h1>

            <p>
              {error ??
                'Revisá que el enlace sea correcto.'}
            </p>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="public-tracking-page">
      <div className="public-tracking-shell">
        <header className="public-tracking-topbar">
          <div className="public-tracking-brand">
            TallerTrack
          </div>

          <span>
            Seguimiento de reparación
          </span>
        </header>

        <section className="public-tracking-hero">
          <div>
            <span className="public-order-label">
              Orden
            </span>

            <h1>
              {tracking.code}
            </h1>

            <p>
              {tracking.device.type}
              {' · '}
              {tracking.device.brand}{' '}
              {tracking.device.model}
            </p>
          </div>

          <span
            className={`public-current-status status-${tracking.status.toLowerCase()}`}
          >
            {statusLabels[tracking.status]}
          </span>
        </section>

        <div className="public-tracking-grid">
          <section className="public-tracking-card">
            <span className="public-section-label">
              Estado de la reparación
            </span>

            <h2>
              Seguimiento
            </h2>

            <div className="public-timeline">
              {tracking.statusHistory.map(
                (historyItem, index) => {
                  const isLast =
                    index ===
                    tracking.statusHistory.length - 1;

                  return (
                    <div
                      className="public-timeline-item"
                      key={`${historyItem.status}-${historyItem.createdAt}`}
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
                              dateStyle: 'medium',
                              timeStyle: 'short',
                            },
                          )}
                        </span>
                      </div>
                    </div>
                  );
                },
              )}
            </div>
          </section>

          <div className="public-tracking-side">
            <section className="public-tracking-card">
              <span className="public-section-label">
                Equipo
              </span>

              <h2>
                {tracking.device.brand}{' '}
                {tracking.device.model}
              </h2>

              <p>
                {tracking.device.type}
              </p>
            </section>

            <section className="public-tracking-card">
              <span className="public-section-label">
                Problema informado
              </span>

              <p className="public-detail-text">
                {tracking.reportedIssue}
              </p>
            </section>

            {tracking.diagnosis && (
              <section className="public-tracking-card">
                <span className="public-section-label">
                  Diagnóstico técnico
                </span>

                <p className="public-detail-text">
                  {tracking.diagnosis}
                </p>
              </section>
            )}

            {tracking.quote && (
              <section className="public-tracking-card">
                <div className="public-quote-header">
                  <span className="public-section-label">
                    Presupuesto
                  </span>

                  <span
                    className={`quote-status quote-status-${tracking.quote.status.toLowerCase()}`}
                  >
                    {
                      quoteStatusLabels[
                        tracking.quote.status
                      ]
                    }
                  </span>
                </div>

                <strong className="public-quote-amount">
                  {formatCurrency(
                    tracking.quote.amount,
                  )}
                </strong>

                {tracking.quote.description && (
                  <p className="public-detail-text">
                    {
                      tracking.quote.description
                    }
                  </p>
                )}
              </section>
            )}

            {tracking.estimatedCompletionDate && (
              <section className="public-tracking-card">
                <span className="public-section-label">
                  Entrega estimada
                </span>

                <strong className="public-estimated-date">
                  {new Date(
                    tracking.estimatedCompletionDate,
                  ).toLocaleString(
                    'es-AR',
                    {
                      dateStyle: 'long',
                      timeStyle: 'short',
                    },
                  )}
                </strong>
              </section>
            )}
          </div>
        </div>

        <footer className="public-tracking-footer">
          <strong>
            TallerTrack
          </strong>

          <span>
            Última actualización:{' '}
            {new Date(
              tracking.updatedAt,
            ).toLocaleString(
              'es-AR',
              {
                dateStyle: 'short',
                timeStyle: 'short',
              },
            )}
          </span>
        </footer>
      </div>
    </main>
  );
}