import { useEffect, useState } from 'react';
import './App.css';

interface HealthResponse {
  status: 'ok';
  service: string;
  timestamp: string;
}

type ConnectionStatus = 'loading' | 'connected' | 'error';

function App() {
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>('loading');

  const [healthData, setHealthData] =
    useState<HealthResponse | null>(null);

  useEffect(() => {
    const checkApiConnection = async (): Promise<void> => {
      try {
        const response = await fetch(
          'http://localhost:3000/api/health',
        );

        if (!response.ok) {
          throw new Error(`Error HTTP: ${response.status}`);
        }

        const data = (await response.json()) as HealthResponse;

        setHealthData(data);
        setConnectionStatus('connected');
      } catch (error) {
        console.error('No se pudo conectar con la API:', error);
        setConnectionStatus('error');
      }
    };

    void checkApiConnection();
  }, []);

  return (
    <main className="app">
      <section className="card">
        <span className="label">TallerTrack</span>

        <h1>Gestión de reparaciones</h1>

        <p className="description">
          Aplicación para administrar clientes, equipos y órdenes de
          reparación.
        </p>

        {connectionStatus === 'loading' && (
          <div className="status loading">
            Comprobando conexión con el backend...
          </div>
        )}

        {connectionStatus === 'connected' && healthData && (
          <div className="status connected">
            <strong>Frontend y backend conectados correctamente</strong>
            <span>Servicio: {healthData.service}</span>
          </div>
        )}

        {connectionStatus === 'error' && (
          <div className="status error">
            <strong>No se pudo conectar con el backend</strong>
            <span>Comprobá que NestJS esté ejecutándose.</span>
          </div>
        )}
      </section>
    </main>
  );
}

export default App;