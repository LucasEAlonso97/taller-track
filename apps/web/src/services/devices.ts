import type {
  CreateDeviceInput,
  Device,
} from '../types/device';

const API_URL =
  import.meta.env.VITE_API_URL ??
  'http://localhost:3000/api';

export async function getDevices(): Promise<Device[]> {
  const response = await fetch(`${API_URL}/devices`);

  if (!response.ok) {
    throw new Error(
      'No se pudieron obtener los equipos',
    );
  }

  return response.json() as Promise<Device[]>;
}

export async function createDevice(
  input: CreateDeviceInput,
): Promise<Device> {
  const response = await fetch(`${API_URL}/devices`, {
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
      message ?? 'No se pudo registrar el equipo',
    );
  }

  return response.json() as Promise<Device>;
}