import { useState } from 'react';

interface TrackingShareActionsProps {
  trackingToken: string;
  orderCode: string;
}

export function TrackingShareActions({
  trackingToken,
  orderCode,
}: TrackingShareActionsProps) {
  const [copied, setCopied] = useState(false);

  const trackingUrl =
    `${window.location.origin}/track/${trackingToken}`;

  const handleCopy = async (): Promise<void> => {
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

  const handleShare = async (): Promise<void> => {
    if (navigator.share) {
      await navigator.share({
        title: `Seguimiento ${orderCode}`,
        text: `Podés seguir el estado de tu reparación ${orderCode} desde este enlace:`,
        url: trackingUrl,
      });

      return;
    }

    await handleCopy();
  };

  return (
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
        onClick={() => void handleCopy()}
      >
        {copied
          ? 'Enlace copiado'
          : 'Copiar enlace'}
      </button>

      {'share' in navigator && (
        <button
          type="button"
          className="secondary-button"
          onClick={() => void handleShare()}
        >
          Compartir
        </button>
      )}
    </div>
  );
}