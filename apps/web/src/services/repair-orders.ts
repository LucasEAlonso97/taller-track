import type {
  CreateRepairOrderInput,
  QuoteStatus,
  RepairOrder,
  RepairStatus,
} from '../types/repair-order';

import { apiFetch } from './api';



const API_URL =
  import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';

export async function getRepairOrders(): Promise<RepairOrder[]> {
  const response = await apiFetch(`${API_URL}/repair-orders`);

  if (!response.ok) {
    throw new Error('No se pudieron obtener las reparaciones');
  }

  return response.json() as Promise<RepairOrder[]>;
}

export async function createRepairOrder(
  input: CreateRepairOrderInput,
): Promise<RepairOrder> {
  const response = await apiFetch(`${API_URL}/repair-orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const data = (await response.json()) as {
      message?: string | string[];
    };

    const message = Array.isArray(data.message)
      ? data.message.join(', ')
      : data.message;

    throw new Error(
      message ?? 'No se pudo crear la reparación',
    );
  }

  return response.json() as Promise<RepairOrder>;
}

export async function updateRepairOrderStatus(
  id: string,
  status: RepairStatus,
): Promise<RepairOrder> {
  const response = await apiFetch(
    `${API_URL}/repair-orders/${id}/status`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    },
  );

  if (!response.ok) {
    const data = (await response.json()) as {
      message?: string | string[];
    };

    const message = Array.isArray(data.message)
      ? data.message.join(', ')
      : data.message;

    throw new Error(
      message ?? 'No se pudo actualizar el estado',
    );
  }

  return response.json() as Promise<RepairOrder>;
}

export interface UpdateRepairDiagnosisInput {
  diagnosis: string;
  estimatedCompletionDate?: string;
}

export async function updateRepairDiagnosis(
  id: string,
  input: UpdateRepairDiagnosisInput,
): Promise<RepairOrder> {
  const response = await apiFetch(
    `${API_URL}/repair-orders/${id}/diagnosis`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    },
  );

  if (!response.ok) {
    const data = (await response.json()) as {
      message?: string | string[];
    };

    const message = Array.isArray(data.message)
      ? data.message.join(', ')
      : data.message;

    throw new Error(
      message ?? 'No se pudo guardar el diagnóstico',
    );
  }

  return response.json() as Promise<RepairOrder>;
}

export async function addRepairInternalNote(
  repairOrderId: string,
  content: string,
): Promise<RepairOrder> {
  const response = await apiFetch(
    `${API_URL}/repair-orders/${repairOrderId}/notes`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content,
      }),
    },
  );

  if (!response.ok) {
    throw new Error(
      'No se pudo agregar la nota interna.',
    );
  }

  return response.json() as Promise<RepairOrder>;
}
export interface UpdateRepairQuoteInput {
  amount: number;
  description?: string;
}

export async function addRepairPhotos(
  repairOrderId: string,
  files: File[],
): Promise<RepairOrder> {
  const formData = new FormData();

  files.forEach((file) => {
    formData.append('files', file);
  });

  const response = await apiFetch(
    `${API_URL}/repair-orders/${repairOrderId}/photos`,
    {
      method: 'POST',
      body: formData,
    },
  );

  if (!response.ok) {
    const errorBody = await response
      .json()
      .catch(() => null);

    throw new Error(
      errorBody?.message ??
        'No se pudieron subir las fotos.',
    );
  }

  return response.json() as Promise<RepairOrder>;
}

export function getRepairPhotoUrl(
  repairOrderId: string,
  photoId: string,
): string {
  return `${API_URL}/repair-orders/${repairOrderId}/photos/${photoId}/file`;
}
export async function updateRepairQuote(
  id: string,
  input: UpdateRepairQuoteInput,
): Promise<RepairOrder> {
  const response = await apiFetch(
    `${API_URL}/repair-orders/${id}/quote`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    },
  );

  if (!response.ok) {
    const data = (await response.json()) as {
      message?: string | string[];
    };

    const message = Array.isArray(data.message)
      ? data.message.join(', ')
      : data.message;

    throw new Error(
      message ?? 'No se pudo guardar el presupuesto',
    );
  }

  return response.json() as Promise<RepairOrder>;
}

export async function updateRepairQuoteStatus(
  id: string,
  status: QuoteStatus,
): Promise<RepairOrder> {
  const response = await apiFetch(
    `${API_URL}/repair-orders/${id}/quote/status`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    },
  );

  if (!response.ok) {
    const data = (await response.json()) as {
      message?: string | string[];
    };

    const message = Array.isArray(data.message)
      ? data.message.join(', ')
      : data.message;

    throw new Error(
      message ??
        'No se pudo actualizar el presupuesto',
    );
  }

  return response.json() as Promise<RepairOrder>;
}