import {
  type FormEvent,
  useState,
} from 'react';

import { addRepairInternalNote } from '../services/repair-orders';

import type {
  RepairInternalNote,
  RepairOrder,
} from '../types/repair-order';

interface RepairInternalNotesProps {
  repairOrderId: string;
  notes: RepairInternalNote[];
  onOrderUpdated: (
    order: RepairOrder,
  ) => void;
}

export function RepairInternalNotes({
  repairOrderId,
  notes,
  onOrderUpdated,
}: RepairInternalNotesProps) {
  const [content, setContent] =
    useState('');

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    event.preventDefault();

    const trimmedContent =
      content.trim();

    if (!trimmedContent) {
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const updatedOrder =
        await addRepairInternalNote(
          repairOrderId,
          trimmedContent,
        );

      onOrderUpdated(updatedOrder);

      setContent('');
    } catch {
      setError(
        'No se pudo guardar la nota interna.',
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="repair-internal-notes">
      <div className="internal-notes-header">
        <div>
          <span className="internal-notes-label">
            Uso interno
          </span>

          <h4>
            Notas internas
          </h4>
        </div>

        <span className="internal-notes-count">
          {notes.length}
        </span>
      </div>

      <form
        className="internal-note-form"
        onSubmit={(event) => {
          void handleSubmit(event);
        }}
      >
        <textarea
          value={content}
          onChange={(event) => {
            setContent(
              event.target.value,
            );
          }}
          placeholder="Ej: Se probó otra fuente, el equipo continúa sin encender..."
          maxLength={2000}
          disabled={saving}
        />

        <div className="internal-note-form-footer">
          <span>
            {content.length}/2000
          </span>

          <button
            type="submit"
            className="secondary-button"
            disabled={
              saving ||
              content.trim().length ===
                0
            }
          >
            {saving
              ? 'Guardando...'
              : 'Agregar nota'}
          </button>
        </div>
      </form>

      {error && (
        <p className="internal-note-error">
          {error}
        </p>
      )}

      {notes.length === 0 ? (
        <p className="internal-notes-empty">
          Todavía no hay notas
          internas.
        </p>
      ) : (
        <div className="internal-notes-list">
          {notes.map((note) => (
            <article
              key={note.id}
              className="internal-note-item"
            >
              <p>
                {note.content}
              </p>

              <div className="trace-meta">
                {note.createdBy && (
                  <>
                    <strong>
                      {
                        note.createdBy
                          .name
                      }
                    </strong>

                    <span>
                      {' · '}
                    </span>
                  </>
                )}

                <time
                  dateTime={
                    note.createdAt
                  }
                >
                  {new Date(
                    note.createdAt,
                  ).toLocaleString(
                    'es-AR',
                    {
                      dateStyle:
                        'medium',

                      timeStyle:
                        'short',
                    },
                  )}
                </time>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}