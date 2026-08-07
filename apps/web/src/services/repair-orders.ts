import type {
  CreateRepairOrderInput,
  RepairOrder,
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