import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import './index.css';

import App from './App.tsx';
import { PublicTrackingPage } from './components/PublicTrackingPage';

const trackingMatch =
  window.location.pathname.match(
    /^\/track\/([^/]+)\/?$/,
  );

createRoot(
  document.getElementById('root')!,
).render(
  <StrictMode>
    {trackingMatch ? (
      <PublicTrackingPage
        token={trackingMatch[1]}
      />
    ) : (
      <App />
    )}
  </StrictMode>,
);