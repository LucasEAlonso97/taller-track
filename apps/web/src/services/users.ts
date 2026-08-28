import { apiFetch } from './api';

import type {
  CreateTechnicianInput,
  ResetTechnicianPasswordInput,
  ResetTechnicianPasswordResponse,
  User,
} from '../types/user';

const API_URL =
  import.meta.env.VITE_API_URL;

export async function getUsers(): Promise<User[]> {
  const response = await apiFetch(
    `${API_URL}/users`,
  );

  if (!response.ok) {
    throw new Error(
      'No se pudieron cargar los usuarios.',
    );
  }

  return response.json() as Promise<User[]>;
}

export async function createTechnician(
  input: CreateTechnicianInput,
): Promise<User> {
  const response = await apiFetch(
    `${API_URL}/users`,
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
    const body = await response
      .json()
      .catch(() => null);

    throw new Error(
      body?.message ??
        'No se pudo crear el técnico.',
    );
  }

  return response.json() as Promise<User>;
}

export async function updateUserStatus(
  userId: string,
  isActive: boolean,
): Promise<User> {
  const response = await apiFetch(
    `${API_URL}/users/${userId}/status`,
    {
      method: 'PATCH',

      headers: {
        'Content-Type':
          'application/json',
      },

      body: JSON.stringify({
        isActive,
      }),
    },
  );

  if (!response.ok) {
    const body = await response
      .json()
      .catch(() => null);

    throw new Error(
      body?.message ??
        'No se pudo actualizar el usuario.',
    );
  }

  return response.json() as Promise<User>;
}

export async function resetTechnicianPassword(
  userId: string,
  input: ResetTechnicianPasswordInput,
): Promise<ResetTechnicianPasswordResponse> {
  const response = await apiFetch(
    `${API_URL}/users/${userId}/reset-password`,
    {
      method: 'PATCH',

      headers: {
        'Content-Type':
          'application/json',
      },

      body: JSON.stringify(input),
    },
  );

  if (!response.ok) {
    const body = await response
      .json()
      .catch(() => null);

    throw new Error(
      body?.message ??
        'No se pudo restablecer la contraseña.',
    );
  }

  return response.json() as Promise<ResetTechnicianPasswordResponse>;
}