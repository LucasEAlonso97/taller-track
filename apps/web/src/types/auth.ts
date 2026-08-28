export type UserRole =
  | 'ADMIN'
  | 'TECHNICIAN';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface LoginResponse {
  accessToken: string;
  user: AuthUser;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

export interface ChangePasswordResponse {
  message: string;
}