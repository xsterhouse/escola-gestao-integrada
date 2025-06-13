
import { useState, useEffect } from 'react';
import { useNetworkStatus } from './useNetworkStatus';
import { syncService } from '@/services/syncService';
import { offlineStorage } from '@/services/offlineDb';
import { useToast } from '@/hooks/use-toast';

export const useSyncManager = () => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const { isOnline } = useNetworkStatus();
  const { toast } = useToast();

  useEffect(() => {
    updatePendingCount();
    
    // Carregar última data de sincronização do localStorage
    const savedLastSync = localStorage.getItem('lastSyncTime');
    if (savedLastSync) {
      setLastSyncTime(new Date(savedLastSync));
    }
  }, []);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    if (isOnline && pendingCount > 0) {
      // Auto-sync quando volta online (com delay para estabilizar)
      timeoutId = setTimeout(() => {
        console.log('🔄 Iniciando sincronização automática...');
        handleAutoSync();
      }, 3000);
    }

    // Listener para evento customizado de reconexão
    const handleConnectionRestored = () => {
      if (pendingCount > 0) {
        timeoutId = setTimeout(() => {
          handleAutoSync();
        }, 2000);
      }
    };

    window.addEventListener('connection-restored', handleConnectionRestored);

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      window.removeEventListener('connection-restored', handleConnectionRestored);
    };
  }, [isOnline, pendingCount]);

  const updatePendingCount = async () => {
    try {
      const queue = await offlineStorage.getSyncQueue();
      setPendingCount(queue.length);
      console.log(`📊 ${queue.length} itens pendentes para sincronização`);
    } catch (error) {
      console.error('Erro ao atualizar contagem pendente:', error);
    }
  };

  const handleAutoSync = async () => {
    if (!isOnline || isSyncing) return;
    
    try {
      setIsSyncing(true);
      await syncService.syncPendingData();
      await updatePendingCount();
      setLastSyncTime(new Date());
      localStorage.setItem('lastSyncTime', new Date().toISOString());
      
      console.log('✅ Sincronização automática concluída');
    } catch (error) {
      console.error('❌ Erro na sincronização automática:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleManualSync = async () => {
    if (!isOnline) {
      toast({
        title: "Sem conexão",
        description: "Conecte-se à internet para sincronizar os dados.",
        variant: "destructive"
      });
      return;
    }

    if (isSyncing) {
      toast({
        title: "Sincronização em andamento",
        description: "Aguarde a conclusão da sincronização atual.",
        variant: "default"
      });
      return;
    }

    setIsSyncing(true);
    
    try {
      toast({
        title: "Sincronizando...",
        description: `${pendingCount} itens pendentes para sincronização.`,
      });

      await syncService.syncPendingData();
      await updatePendingCount();
      const syncTime = new Date();
      setLastSyncTime(syncTime);
      localStorage.setItem('lastSyncTime', syncTime.toISOString());

      toast({
        title: "Sincronização concluída",
        description: "Todos os dados foram sincronizados com sucesso.",
      });
    } catch (error) {
      console.error('Erro na sincronização manual:', error);
      toast({
        title: "Erro na sincronização",
        description: "Alguns dados podem não ter sido sincronizados. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const addToQueue = async (type: string, data: any, action: string) => {
    try {
      await offlineStorage.addToSyncQueue(type, data, action);
      await updatePendingCount();
      
      console.log(`📝 Adicionado à fila: ${type} - ${action}`);
      
      if (isOnline && !isSyncing) {
        // Se estiver online, tenta sincronizar após um pequeno delay
        setTimeout(() => {
          handleAutoSync();
        }, 1500);
      }
    } catch (error) {
      console.error('Erro ao adicionar à fila de sincronização:', error);
      throw error;
    }
  };

  return {
    isSyncing,
    pendingCount,
    lastSyncTime,
    handleManualSync,
    addToQueue,
    updatePendingCount
  };
};
