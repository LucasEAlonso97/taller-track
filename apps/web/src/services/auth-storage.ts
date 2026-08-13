import type {
  AuthUser,
} from '../types/auth';

const TOKEN_KEY =
  'tallertrack-access-token';

const USER_KEY =
  'tallertrack-user';

export function getAccessToken():
  string | null {
  return localStorage.getItem(
    TOKEN_KEY,
  );
}

export function getStoredUser():
  AuthUser | null {
  const stored =
    localStorage.getItem(USER_KEY);

  if (!stored) {
    return null;
  }

  try {
    return JSON.parse(
      stored,
    ) as AuthUser;
  } catch {
    localStorage.removeItem(
      USER_KEY,
    );

    return null;
  }
}

export function saveSession(
  accessToken: string,
  user: AuthUser,
): void {
  localStorage.setItem(
    TOKEN_KEY,
    accessToken,
  );

  localStorage.setItem(
    USER_KEY,
    JSON.stringify(user),
  );
}

export function clearSession(): void {
  localStorage.removeItem(
    TOKEN_KEY,
  );

  localStorage.removeItem(
    USER_KEY,
  );
}