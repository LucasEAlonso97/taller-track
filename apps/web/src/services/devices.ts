import type {
  CreateDeviceInput,
  Device,
} from '../types/device';

import { apiFetch } from './api';

const API_URL =
  import.meta.env.VITE_API_URL ??
  'http://localhost:3000/api';

export async function getDevices(): Promise<Device[]> {
  const response = await apiFetch(
    `${API_URL}/devices`,
  );

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
  const response = await apiFetch(
    `${API_URL}/devices`,
    {
      method: 'POST',

      headers: {
        'Content-Type':
          'application/json',
      },

      body: JSON.stringify(input),
    },
  );

  if (!response.ok) {
    const data =
      (await response.json()) as {
        message?: string | string[];
      };

    const message = Array.isArray(
      data.message,
    )
      ? data.message.join(', ')
      : data.message;

    throw new Error(
      message ??
        'No se pudo registrar el equipo',
    );
  }

  return response.json() as Promise<Device>;
}

export interface DeleteDeviceResponse {
  message: string;
  id: string;
  device: string;
}

export async function deleteDevice(
  id: string,
): Promise<DeleteDeviceResponse> {
  const response = await apiFetch(
    `${API_URL}/devices/${id}`,
    {
      method: 'DELETE',
    },
  );

  if (!response.ok) {
    const data = (await response
      .json()
      .catch(() => null)) as {
      message?: string | string[];
    } | null;

    const message = Array.isArray(
      data?.message,
    )
      ? data.message.join(', ')
      : data?.message;

    throw new Error(
      message ??
        'No se pudo eliminar el equipo.',
    );
  }

  return response.json() as Promise<DeleteDeviceResponse>;
}