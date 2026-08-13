import {
  clearSession,
  getAccessToken,
} from './auth-storage';

export async function apiFetch(
  input: RequestInfo | URL,
  init: RequestInit = {},
): Promise<Response> {
  const token = getAccessToken();

  const headers =
    new Headers(init.headers);

  if (token) {
    headers.set(
      'Authorization',
      `Bearer ${token}`,
    );
  }

  const response = await fetch(input, {
    ...init,
    headers,
  });

  if (response.status === 401) {
    clearSession();

    window.dispatchEvent(
      new Event('auth:unauthorized'),
    );
  }

  return response;
}