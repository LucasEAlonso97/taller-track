import { TrackingQrCode } from './TrackingQrCode';

import type { RepairOrder } from '../types/repair-order';

interface RepairReceiptProps {
  order: RepairOrder;
  onClose: () => void;
}

export function RepairReceipt({
  order,
  onClose,
}: RepairReceiptProps) {
  const handlePrint = (): void => {
    window.print();
  };

  return (
    <div className="receipt-overlay">
      <div className="repair-receipt">
        <div className="receipt-actions">
          <button
            type="button"
            className="secondary-button"
            onClick={onClose}
          >
            Cerrar
          </button>

          <button
            type="button"
            className="primary-button"
            onClick={handlePrint}
          >
            Imprimir comprobante
          </button>
        </div>

        <header className="receipt-header">
          <div>
            <span className="receipt-brand">
              TallerTrack
            </span>

            <h1>
              Comprobante de ingreso
            </h1>
          </div>

          <div className="receipt-order-code">
            <span>Orden</span>
            <strong>{order.code}</strong>
          </div>
        </header>

        <div className="receipt-divider" />

        <section className="receipt-section">
          <h2>Cliente</h2>

          <div className="receipt-grid">
            <div>
              <span>Nombre</span>

              <strong>
                {order.device.client.firstName}{' '}
                {order.device.client.lastName}
              </strong>
            </div>

            <div>
              <span>Teléfono</span>

              <strong>
                {order.device.client.phone}
              </strong>
            </div>

            {order.device.client.email && (
              <div>
                <span>Email</span>

                <strong>
                  {order.device.client.email}
                </strong>
              </div>
            )}
          </div>
        </section>

        <section className="receipt-section">
          <h2>Equipo</h2>

          <div className="receipt-grid">
            <div>
              <span>Tipo</span>

              <strong>
                {order.device.type}
              </strong>
            </div>

            <div>
              <span>Marca</span>

              <strong>
                {order.device.brand}
              </strong>
            </div>

            <div>
              <span>Modelo</span>

              <strong>
                {order.device.model}
              </strong>
            </div>

            {order.device.serialNumber && (
              <div>
                <span>Número de serie</span>

                <strong>
                  {order.device.serialNumber}
                </strong>
              </div>
            )}
          </div>

          {order.device.accessories && (
            <div className="receipt-detail">
              <span>
                Accesorios entregados
              </span>

              <p>
                {order.device.accessories}
              </p>
            </div>
          )}

          {order.device.initialCondition && (
            <div className="receipt-detail">
              <span>
                Estado al ingresar
              </span>

              <p>
                {order.device.initialCondition}
              </p>
            </div>
          )}
        </section>

        <section className="receipt-section">
          <h2>Reparación</h2>

          <div className="receipt-detail">
            <span>
              Problema informado
            </span>

            <p>
              {order.reportedIssue}
            </p>
          </div>

          <div className="receipt-grid">
            <div>
              <span>
                Fecha de ingreso
              </span>

              <strong>
                {new Date(
                  order.createdAt,
                ).toLocaleString(
                  'es-AR',
                  {
                    dateStyle: 'long',
                    timeStyle: 'short',
                  },
                )}
              </strong>
            </div>

            {order.estimatedCompletionDate && (
              <div>
                <span>
                  Entrega estimada
                </span>

                <strong>
                  {new Date(
                    order.estimatedCompletionDate,
                  ).toLocaleString(
                    'es-AR',
                    {
                      dateStyle: 'long',
                      timeStyle: 'short',
                    },
                  )}
                </strong>
              </div>
            )}
          </div>
        </section>

        <section className="receipt-tracking-section">
          <div>
            <span className="receipt-tracking-label">
              Seguimiento online
            </span>

            <h2>
              Consultá el estado de tu reparación
            </h2>

            <p>
              Escaneá el código QR para ver el
              progreso actualizado de la orden.
            </p>
          </div>

          <TrackingQrCode
            trackingToken={order.trackingToken}
            orderCode={order.code}
          />
        </section>

        <section className="receipt-signatures">
  <div className="signature-box">
    <span className="signature-line" />

    <strong>
      Firma del cliente
    </strong>

    <span>
      Aclaración
    </span>
  </div>

  <div className="signature-box">
    <span className="signature-line" />

    <strong>
      Recepción del taller
    </strong>

    <span>
      Firma / sello
    </span>
  </div>
</section>

        <footer className="receipt-footer">
          <span>
            Comprobante generado por TallerTrack
          </span>

          <strong>
            {order.code}
          </strong>
        </footer>
      </div>
    </div>
  );
}