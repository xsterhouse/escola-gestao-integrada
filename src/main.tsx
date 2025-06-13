
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerServiceWorker } from './utils/pwaUtils';

const root = createRoot(document.getElementById("root")!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Registrar Service Worker para PWA e funcionalidade offline
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    registerServiceWorker();
    console.log('🚀 PWA inicializado com sucesso!');
  });
}

// Event listener para detectar quando volta online
window.addEventListener('online', () => {
  console.log('🌐 Conexão restabelecida - Tentando sincronização automática');
  // Dispara evento customizado para componentes que precisam reagir
  window.dispatchEvent(new CustomEvent('connection-restored'));
});

window.addEventListener('offline', () => {
  console.log('📡 Aplicação funcionando em modo offline');
});
