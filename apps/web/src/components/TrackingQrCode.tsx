import {
  useEffect,
  useState,
} from 'react';

import QRCode from 'qrcode';

interface TrackingQrCodeProps {
  trackingToken: string;
  orderCode: string;
}

export function TrackingQrCode({
  trackingToken,
  orderCode,
}: TrackingQrCodeProps) {
  const [qrDataUrl, setQrDataUrl] =
    useState<string | null>(null);

  const [error, setError] =
    useState<string | null>(null);

  const trackingUrl =
    `${window.location.origin}/track/${trackingToken}`;

  useEffect(() => {
    const generateQr =
      async (): Promise<void> => {
        try {
          setError(null);

          const dataUrl =
            await QRCode.toDataURL(
              trackingUrl,
              {
                width: 220,
                margin: 1,
                errorCorrectionLevel: 'M',
              },
            );

          setQrDataUrl(dataUrl);
        } catch {
          setError(
            'No se pudo generar el código QR.',
          );
        }
      };

    void generateQr();
  }, [trackingUrl]);

  if (error) {
    return (
      <p className="qr-error">
        {error}
      </p>
    );
  }

  if (!qrDataUrl) {
    return (
      <p className="qr-loading">
        Generando QR...
      </p>
    );
  }

  return (
    <div className="tracking-qr">
      <img
        src={qrDataUrl}
        alt={`QR de seguimiento de ${orderCode}`}
      />

      <div className="tracking-qr-info">
        <strong>
          Escaneá para seguir la reparación
        </strong>

        <span>
          {orderCode}
        </span>
      </div>
    </div>
  );
}