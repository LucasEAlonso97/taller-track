interface ConfirmDeleteModalProps {
  title: string;
  description: string;
  details?: string[];
  confirmLabel?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDeleteModal({
  title,
  description,
  details = [],
  confirmLabel = 'Eliminar',
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDeleteModalProps) {
  return (
    <div
      className="confirm-delete-overlay"
      role="presentation"
    >
      <div
        className="confirm-delete-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-delete-title"
      >
        <span className="confirm-delete-label">
          Acción permanente
        </span>

        <h3 id="confirm-delete-title">
          {title}
        </h3>

        <p>{description}</p>

        {details.length > 0 && (
          <div className="confirm-delete-warning">
            <strong>
              También se eliminarán:
            </strong>

            <ul>
              {details.map((detail) => (
                <li key={detail}>
                  {detail}
                </li>
              ))}
            </ul>
          </div>
        )}

        <p className="confirm-delete-note">
          Esta acción no se puede deshacer.
        </p>

        <div className="confirm-delete-actions">
          <button
            type="button"
            className="secondary-button"
            disabled={loading}
            onClick={onCancel}
          >
            Cancelar
          </button>

          <button
            type="button"
            className="danger-button"
            disabled={loading}
            onClick={onConfirm}
          >
            {loading
              ? 'Eliminando...'
              : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}