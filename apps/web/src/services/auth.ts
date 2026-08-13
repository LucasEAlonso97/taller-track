import type {
  LoginResponse,
} from '../types/auth';

import {
  saveSession,
} from './auth-storage';

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