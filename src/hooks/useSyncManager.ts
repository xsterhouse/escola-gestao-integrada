
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
  }, []);

  useEffect(() => {
    if (isOnline && pendingCount > 0) {
      // Auto-sync quando volta online
      setTimeout(() => {
        handleManualSync();
      }, 2000); // Aguarda 2 segundos para estabilizar a conexão
    }
  }, [isOnline, pendingCount]);

  const updatePendingCount = async () => {
    try {
      const queue = await offlineStorage.getSyncQueue();
      setPendingCount(queue.length);
    } catch (error) {
      console.error('Erro ao atualizar contagem pendente:', error);
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
      setLastSyncTime(new Date());

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
      
      if (isOnline) {
        // Se estiver online, tenta sincronizar imediatamente
        setTimeout(() => {
          handleManualSync();
        }, 1000);
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
