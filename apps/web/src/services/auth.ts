import type {
  ChangePasswordInput,
  ChangePasswordResponse,
  LoginResponse,
} from '../types/auth';

import {
  saveSession,
} from './auth-storage';

import { apiFetch } from './api';

const API_URL =
  import.meta.env.VITE_API_URL;

export async function login(
  email: string,
  password: string,
): Promise<LoginResponse> {
  const response = await fetch(
    `${API_URL}/auth/login`,
    {
      method: 'POST',

      headers: {
        'Content-Type':
          'application/json',
      },

      body: JSON.stringify({
        email,
        password,
      }),
    },
  );

  if (!response.ok) {
    throw new Error(
      'Email o contraseña incorrectos.',
    );
  }

  const result =
    (await response.json()) as LoginResponse;

  saveSession(
    result.accessToken,
    result.user,
  );

  return result;
}

export async function changePassword(
  input: ChangePasswordInput,
): Promise<ChangePasswordResponse> {
  const response = await apiFetch(
    `${API_URL}/auth/change-password`,
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
    let message =
      'No se pudo cambiar la contraseña.';

    try {
      const body =
        (await response.json()) as {
          message?: string;
        };

      if (body.message) {
        message = body.message;
      }
    } catch {
      // Se mantiene el mensaje genérico.
    }

    throw new Error(message);
  }

  return response.json() as Promise<ChangePasswordResponse>;
}