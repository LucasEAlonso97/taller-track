import type {
  Client,
  CreateClientInput,
  UpdateClientInput,
} from '../types/client';

import { apiFetch } from './api';

const API_URL =
  import.meta.env.VITE_API_URL ??
  'http://localhost:3000/api';

export async function getClients(): Promise<Client[]> {
  const response = await apiFetch(
    `${API_URL}/clients`,
  );

  if (!response.ok) {
    throw new Error(
      'No se pudieron obtener los clientes',
    );
  }

  return response.json() as Promise<Client[]>;
}

export async function getClientById(
  id: string,
): Promise<Client> {
  const response = await apiFetch(
    `${API_URL}/clients/${id}`,
  );

  if (!response.ok) {
    throw new Error(
      'No se pudo obtener el cliente',
    );
  }

  return response.json() as Promise<Client>;
}

export async function createClient(
  client: CreateClientInput,
): Promise<Client> {
  const response = await apiFetch(
    `${API_URL}/clients`,
    {
      method: 'POST',

      headers: {
        'Content-Type':
          'application/json',
      },

      body: JSON.stringify(client),
    },
  );

  if (!response.ok) {
    const errorData =
      (await response.json()) as {
        message?: string | string[];
      };

    const message = Array.isArray(
      errorData.message,
    )
      ? errorData.message.join(', ')
      : errorData.message;

    throw new Error(
      message ??
        'No se pudo crear el cliente',
    );
  }

  return response.json() as Promise<Client>;
}

export async function updateClient(
  id: string,
  client: UpdateClientInput,
): Promise<Client> {
  const response = await apiFetch(
    `${API_URL}/clients/${id}`,
    {
      method: 'PATCH',

      headers: {
        'Content-Type':
          'application/json',
      },

      body: JSON.stringify(client),
    },
  );

  if (!response.ok) {
    throw new Error(
      'No se pudo actualizar el cliente',
    );
  }

  return response.json() as Promise<Client>;
}

export interface DeleteClientResponse {
  message: string;
  id: string;
  client: string;
}

export async function deleteClient(
  id: string,
): Promise<DeleteClientResponse> {
  const response = await apiFetch(
    `${API_URL}/clients/${id}`,
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
        'No se pudo eliminar el cliente.',
    );
  }

  return response.json() as Promise<DeleteClientResponse>;
}