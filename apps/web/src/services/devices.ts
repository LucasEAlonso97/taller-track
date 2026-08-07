import type { Device } from '../types/device';

const API_URL =
  import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';

export async function getDevices(): Promise<Device[]> {
  const response = await fetch(`${API_URL}/devices`);

  if (!response.ok) {
    throw new Error('No se pudieron obtener los equipos');
  }

  return response.json() as Promise<Device[]>;
}