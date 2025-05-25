
import { registerSW } from 'virtual:pwa-register';

export const registerServiceWorker = () => {
  const updateSW = registerSW({
    onNeedRefresh() {
      console.log('🔄 Nova versão disponível');
      // Aqui você pode mostrar um toast ou modal para o usuário atualizar
      if (confirm('Nova versão disponível. Deseja atualizar agora?')) {
        updateSW(true);
      }
    },
    onOfflineReady() {
      console.log('📱 App pronto para usar offline');
      // Mostrar notificação de que o app está pronto para usar offline
    },
    onRegistered(r) {
      console.log('✅ Service Worker registrado:', r);
    },
    onRegisterError(error) {
      console.error('❌ Erro ao registrar Service Worker:', error);
    }
  });
  
  return updateSW;
};

export const checkIfPWAInstalled = () => {
  return window.matchMedia('(display-mode: standalone)').matches || 
         window.navigator.standalone || 
         document.referrer.includes('android-app://');
};

export const getInstallPrompt = () => {
  let deferredPrompt: any = null;
  
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
  });
  
  return {
    prompt: () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        return deferredPrompt.userChoice;
      }
      return Promise.resolve({ outcome: 'dismissed' });
    },
    isAvailable: () => !!deferredPrompt
  };
};
