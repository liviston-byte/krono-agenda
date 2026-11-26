import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@/design-system/tokens.css';
import '@/shared/i18n';
import { App } from '@/app/App';

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Service worker registration is optional in unsupported environments
    });
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
