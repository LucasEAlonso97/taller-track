import type { PublicTrackingData } from '../types/tracking';

const API_URL =
  import.meta.env.VITE_API_URL ??
  'http://localhost:3000/api';

export async function getPublicTracking(
  token: string,
): Promise<PublicTrackingData> {
  const response = await fetch(
    `${API_URL}/tracking/${token}`,
  );

  if (!response.ok) {
    if (
      response.status === 404 ||
      response.status === 400
    ) {
      throw new Error(
        'No encontramos una reparación asociada a este enlace.',
      );
    }

    throw new Error(
      'No se pudo consultar el estado de la reparación.',
    );
  }

  return response.json() as Promise<PublicTrackingData>;
}