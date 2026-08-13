import {
  useEffect,
  useState,
} from 'react';

import { apiFetch } from '../services/api';

interface AuthenticatedImageProps {
  src: string;
  alt: string;
  className?: string;
}

export function AuthenticatedImage({
  src,
  alt,
  className,
}: AuthenticatedImageProps) {
  const [objectUrl, setObjectUrl] =
    useState<string | null>(null);

  const [error, setError] =
    useState(false);

  useEffect(() => {
    let currentObjectUrl: string | null =
      null;

    const loadImage = async (): Promise<void> => {
      try {
        setError(false);

        const response = await apiFetch(src);

        if (!response.ok) {
          throw new Error(
            'No se pudo cargar la imagen.',
          );
        }

        const blob = await response.blob();

        currentObjectUrl =
          URL.createObjectURL(blob);

        setObjectUrl(currentObjectUrl);
      } catch {
        setError(true);
      }
    };

    void loadImage();

    return () => {
      if (currentObjectUrl) {
        URL.revokeObjectURL(
          currentObjectUrl,
        );
      }
    };
  }, [src]);

  if (error) {
    return (
      <div className="authenticated-image-error">
        No se pudo cargar
      </div>
    );
  }

  if (!objectUrl) {
    return (
      <div className="authenticated-image-loading">
        Cargando...
      </div>
    );
  }

  return (
    <img
      src={objectUrl}
      alt={alt}
      className={className}
      loading="lazy"
    />
  );
}