import { useState } from 'react';

import type { RepairStatus } from '../types/repair-order';
import { TrackingQrCode } from './TrackingQrCode';

interface TrackingShareActionsProps {
  trackingToken: string;
  orderCode: string;
  clientPhone: string;
  deviceName: string;
  status: RepairStatus;
  quoteAmount?: number | null;
}

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

export function TrackingShareActions({
  trackingToken,
  orderCode,
  clientPhone,
  deviceName,
  status,
  quoteAmount,
}: TrackingShareActionsProps) {
  const [copied, setCopied] =
    useState(false);

  const [showQr, setShowQr] =
    useState(false);

  const trackingUrl =
    `${window.location.origin}/track/${trackingToken}`;

  const handleCopy =
    async (): Promise<void> => {
      try {
        await navigator.clipboard.writeText(
          trackingUrl,
        );

        setCopied(true);

        window.setTimeout(() => {
          setCopied(false);
        }, 2000);
      } catch {
        setCopied(false);
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

  const getWhatsAppMessage = (): string => {
    if (status === 'READY_FOR_PICKUP') {
      return [
        'Hola, tu equipo ya está listo para retirar.',
        '',
        `Orden: ${orderCode}`,
        `Equipo: ${deviceName}`,
        '',
        'Podés consultar el seguimiento desde acá:',
        trackingUrl,
      ].join('\n');
    }

    if (status === 'WAITING_APPROVAL') {
      return [
        `Hola, tenemos listo el presupuesto de tu reparación ${orderCode}.`,
        '',
        `Equipo: ${deviceName}`,
        ...(quoteAmount
          ? [
              `Presupuesto: ${formatCurrency(
                quoteAmount,
              )}`,
            ]
          : []),
        '',
        'Podés consultar el estado desde acá:',
        trackingUrl,
      ].join('\n');
    }

    return [
      `Hola, te compartimos una actualización de tu reparación ${orderCode}.`,
      '',
      `Equipo: ${deviceName}`,
      `Estado actual: ${statusLabels[status]}`,
      '',
      'Podés seguir el estado de tu reparación desde acá:',
      trackingUrl,
    ].join('\n');
  };

  const handleWhatsApp = (): void => {
    const message =
      encodeURIComponent(
        getWhatsAppMessage(),
      );

    const normalizedPhone =
      clientPhone.replace(/\D/g, '');

    const whatsappUrl =
      normalizedPhone.length > 0
        ? `https://wa.me/${normalizedPhone}?text=${message}`
        : `https://wa.me/?text=${message}`;

    window.open(
      whatsappUrl,
      '_blank',
      'noopener,noreferrer',
    );
  };

  return (
    <>
      <div className="tracking-share-actions">
        <a
          className="secondary-button"
          href={trackingUrl}
          target="_blank"
          rel="noreferrer"
        >
          Ver seguimiento
        </a>

        <button
          type="button"
          className="secondary-button"
          onClick={() =>
            void handleCopy()
          }
        >
          {copied
            ? 'Enlace copiado'
            : 'Copiar enlace'}
        </button>

        <button
          type="button"
          className="secondary-button"
          onClick={handleWhatsApp}
        >
          Enviar por WhatsApp
        </button>

        <button
          type="button"
          className="secondary-button"
          onClick={() =>
            setShowQr(
              (current) => !current,
            )
          }
        >
          {showQr
            ? 'Ocultar QR'
            : 'Mostrar QR'}
        </button>
      </div>

      {showQr && (
        <TrackingQrCode
          trackingToken={trackingToken}
          orderCode={orderCode}
        />
      )}
    </>
  );
}