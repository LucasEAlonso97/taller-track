import {
  type ChangeEvent,
  useState,
} from 'react';

import { AuthenticatedImage } from './AuthenticatedImage';

import {
  addRepairPhotos,
  getRepairPhotoUrl,
} from '../services/repair-orders';

import type {
  RepairOrder,
  RepairPhoto,
} from '../types/repair-order';

interface RepairPhotosProps {
  repairOrderId: string;
  photos: RepairPhoto[];
  onOrderUpdated: (
    order: RepairOrder,
  ) => void;
}

export function RepairPhotos({
  repairOrderId,
  photos,
  onOrderUpdated,
}: RepairPhotosProps) {
  const [selectedFiles, setSelectedFiles] =
    useState<File[]>([]);

  const [uploading, setUploading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const remainingPhotos =
    Math.max(0, 6 - photos.length);

  const handleFileChange = (
    event: ChangeEvent<HTMLInputElement>,
  ): void => {
    const files = Array.from(
      event.target.files ?? [],
    );

    setError(null);

    if (files.length > remainingPhotos) {
      setError(
        `Solo podés agregar ${remainingPhotos} foto${
          remainingPhotos === 1 ? '' : 's'
        } más.`,
      );

      event.target.value = '';
      setSelectedFiles([]);

      return;
    }

    setSelectedFiles(files);
  };

  const handleUpload =
    async (): Promise<void> => {
      if (selectedFiles.length === 0) {
        return;
      }

      try {
        setUploading(true);
        setError(null);

        const updatedOrder =
          await addRepairPhotos(
            repairOrderId,
            selectedFiles,
          );

        onOrderUpdated(updatedOrder);
        setSelectedFiles([]);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : 'No se pudieron subir las fotos.',
        );
      } finally {
        setUploading(false);
      }
    };

  return (
    <section className="repair-photos">
      <div className="repair-photos-header">
        <div>
          <span className="repair-photos-label">
            Uso interno
          </span>

          <h4>Fotos del equipo</h4>
        </div>

        <span className="repair-photos-count">
          {photos.length}/6
        </span>
      </div>

      {photos.length > 0 ? (
        <div className="repair-photo-grid">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="repair-photo-item"
              title={photo.originalName}
            >
              <AuthenticatedImage
                src={getRepairPhotoUrl(
                  repairOrderId,
                  photo.id,
                )}
                alt={photo.originalName}
              />

              <span>
                {photo.originalName}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="repair-photos-empty">
          Todavía no se cargaron fotos del
          equipo.
        </p>
      )}

      {remainingPhotos > 0 && (
        <div className="repair-photo-upload">
          <label className="repair-photo-picker">
            Seleccionar fotos

            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              disabled={uploading}
              onChange={handleFileChange}
            />
          </label>

          {selectedFiles.length > 0 && (
            <span className="repair-photo-selected">
              {selectedFiles.length}{' '}
              {selectedFiles.length === 1
                ? 'foto seleccionada'
                : 'fotos seleccionadas'}
            </span>
          )}

          <button
            type="button"
            className="secondary-button"
            disabled={
              uploading ||
              selectedFiles.length === 0
            }
            onClick={() => {
              void handleUpload();
            }}
          >
            {uploading
              ? 'Subiendo...'
              : 'Subir fotos'}
          </button>
        </div>
      )}

      {remainingPhotos === 0 && (
        <p className="repair-photo-limit">
          Alcanzaste el máximo de 6 fotos.
        </p>
      )}

      {error && (
        <p className="repair-photo-error">
          {error}
        </p>
      )}
    </section>
  );
}