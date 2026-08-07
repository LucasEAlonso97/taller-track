import type { Client } from './client';

export interface Device {
  id: string;
  type: string;
  brand: string;
  model: string;
  serialNumber: string | null;
  accessories: string | null;
  initialCondition: string | null;
  clientId: string;
  createdAt: string;
  updatedAt: string;
  client: Client;
}