import {
  type ChangeEvent,
  useState,
} from 'react';

import { AuthenticatedImage } from './AuthenticatedImage';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';

import {
  addRepairPhotos,
  deleteRepairPhoto,
  getRepairPhotoUrl,
} from '../services/repair-orders';

import type {
  RepairOrder,
  RepairPhoto,
} from '../types/repair-order';

interface RepairPhotosProps {
  repairOrderId: string;

  photos: RepairPhoto[];

  canDelete?: boolean;

  onOrderUpdated: (
    order: RepairOrder,
  ) => void;

  onPhotoDeleted?: (
    photoId: string,
  ) => void;
}

export function RepairPhotos({
  repairOrderId,
  photos,
  canDelete = false,
  onOrderUpdated,
  onPhotoDeleted,
}: RepairPhotosProps) {
  const [
    selectedFiles,
    setSelectedFiles,
  ] = useState<File[]>([]);

  const [
    uploading,
    setUploading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<string | null>(null);

  const [
    photoToDelete,
    setPhotoToDelete,
  ] = useState<RepairPhoto | null>(
    null,
  );

  const [
    deletingPhotoId,
    setDeletingPhotoId,
  ] = useState<string | null>(null);

  const remainingPhotos =
    Math.max(
      0,
      6 - photos.length,
    );

  const handleFileChange = (
    event: ChangeEvent<HTMLInputElement>,
  ): void => {
    const files = Array.from(
      event.target.files ?? [],
    );

    setError(null);

    if (
      files.length >
      remainingPhotos
    ) {
      setError(
        `Solo podés agregar ${remainingPhotos} foto${
          remainingPhotos === 1
            ? ''
            : 's'
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
      if (
        selectedFiles.length === 0
      ) {
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

        onOrderUpdated(
          updatedOrder,
        );

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

  const handleDeletePhoto =
    async (): Promise<void> => {
      if (!photoToDelete) {
        return;
      }

      const photoId =
        photoToDelete.id;

      try {
        setDeletingPhotoId(
          photoId,
        );

        setError(null);

        await deleteRepairPhoto(
          repairOrderId,
          photoId,
        );

        onPhotoDeleted?.(
          photoId,
        );

        setPhotoToDelete(null);
      } catch (error) {
        setPhotoToDelete(null);

        setError(
          error instanceof Error
            ? error.message
            : 'No se pudo eliminar la foto.',
        );
      } finally {
        setDeletingPhotoId(null);
      }
    };

  return (
    <section className="repair-photos">
      <div className="repair-photos-header">
        <div>
          <span className="repair-photos-label">
            Uso interno
          </span>

          <h4>
            Fotos del equipo
          </h4>
        </div>

        <span className="repair-photos-count">
          {photos.length}/6
        </span>
      </div>

      {photos.length > 0 ? (
        <div className="repair-photo-grid">
          {photos.map(
            (photo) => (
              <div
                key={photo.id}
                className="repair-photo-item"
                title={
                  photo.originalName
                }
              >
                <AuthenticatedImage
                  src={getRepairPhotoUrl(
                    repairOrderId,
                    photo.id,
                  )}
                  alt={
                    photo.originalName
                  }
                />

                <span>
                  {
                    photo.originalName
                  }
                </span>

                {canDelete && (
                  <button
                    type="button"
                    className="repair-photo-delete"
                    title="Eliminar foto"
                    aria-label={`Eliminar ${photo.originalName}`}
                    onClick={() =>
                      setPhotoToDelete(
                        photo,
                      )
                    }
                  >
                    ×
                  </button>
                )}
              </div>
            ),
          )}
        </div>
      ) : (
        <p className="repair-photos-empty">
          Todavía no se cargaron
          fotos del equipo.
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
              disabled={
                uploading
              }
              onChange={
                handleFileChange
              }
            />
          </label>

          {selectedFiles.length >
            0 && (
            <span className="repair-photo-selected">
              {
                selectedFiles.length
              }{' '}
              {selectedFiles.length ===
              1
                ? 'foto seleccionada'
                : 'fotos seleccionadas'}
            </span>
          )}

          <button
            type="button"
            className="secondary-button"
            disabled={
              uploading ||
              selectedFiles.length ===
                0
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
          Alcanzaste el máximo de 6
          fotos.
        </p>
      )}

      {error && (
        <p className="repair-photo-error">
          {error}
        </p>
      )}

      {photoToDelete && (
        <ConfirmDeleteModal
          title="Eliminar foto"
          description={
            photoToDelete.originalName
          }
          confirmLabel="Eliminar foto"
          loading={
            deletingPhotoId ===
            photoToDelete.id
          }
          onCancel={() =>
            setPhotoToDelete(null)
          }
          onConfirm={() =>
            void handleDeletePhoto()
          }
        />
      )}
    </section>
  );
}