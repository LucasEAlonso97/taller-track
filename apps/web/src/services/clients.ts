import type {
  Client,
  CreateClientInput,
} from '../types/client';

const API_URL =
  import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';

export async function getClients(): Promise<Client[]> {
  const response = await fetch(`${API_URL}/clients`);

  if (!response.ok) {
    throw new Error('No se pudieron obtener los clientes');
  }

  return response.json() as Promise<Client[]>;
}

export async function createClient(
  client: CreateClientInput,
): Promise<Client> {
  const response = await fetch(`${API_URL}/clients`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(client),
  });

  if (!response.ok) {
    throw new Error('No se pudo crear el cliente');
  }

  return response.json() as Promise<Client>;
}