import type {
  CreateRepairOrderInput,
  RepairOrder,
  RepairStatus,
} from '../types/repair-order';

const API_URL =
  import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';

export async function getRepairOrders(): Promise<RepairOrder[]> {
  const response = await fetch(`${API_URL}/repair-orders`);

  if (!response.ok) {
    throw new Error('No se pudieron obtener las reparaciones');
  }

  return response.json() as Promise<RepairOrder[]>;
}

export async function createRepairOrder(
  input: CreateRepairOrderInput,
): Promise<RepairOrder> {
  const response = await fetch(`${API_URL}/repair-orders`, {
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
  const response = await fetch(
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
  const response = await fetch(
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