export type UserRole =
  | 'ADMIN'
  | 'TECHNICIAN';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTechnicianInput {
  name: string;
  email: string;
  password: string;
}