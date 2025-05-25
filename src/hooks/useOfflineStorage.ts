
import { useState, useEffect } from 'react';
import { offlineStorage, OfflineData } from '@/services/offlineDb';
import { useNetworkStatus } from './useNetworkStatus';
import { useToast } from '@/hooks/use-toast';

export const useOfflineStorage = () => {
  const [pendingData, setPendingData] = useState<OfflineData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { isOnline } = useNetworkStatus();
  const { toast } = useToast();

  useEffect(() => {
    loadPendingData();
  }, []);

  const loadPendingData = async () => {
    try {
      const unsynced = await offlineStorage.getUnsyncedData();
      setPendingData(unsynced);
    } catch (error) {
      console.error('Erro ao carregar dados pendentes:', error);
    }
  };

  const saveOffline = async (type: string, data: any, action: string, originalId?: string) => {
    try {
      const id = await offlineStorage.saveOfflineData(type, data, action, originalId);
      
      if (!isOnline) {
        toast({
          title: "Dados salvos offline",
          description: "Os dados serão sincronizados quando a conexão for restabelecida.",
          variant: "default"
        });
      }

      await loadPendingData();
      return id;
    } catch (error) {
      console.error('Erro ao salvar dados offline:', error);
      toast({
        title: "Erro ao salvar offline",
        description: "Não foi possível salvar os dados localmente.",
        variant: "destructive"
      });
      throw error;
    }
  };

  const clearPendingData = async () => {
    try {
      setIsLoading(true);
      const unsynced = await offlineStorage.getUnsyncedData();
      
      for (const item of unsynced) {
        if (item.id) {
          await offlineStorage.markAsSynced(item.id);
        }
      }
      
      await loadPendingData();
      
      toast({
        title: "Dados sincronizados",
        description: "Todos os dados pendentes foram sincronizados com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao limpar dados pendentes:', error);
      toast({
        title: "Erro na sincronização",
        description: "Alguns dados podem não ter sido sincronizados.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    pendingData,
    isLoading,
    saveOffline,
    clearPendingData,
    loadPendingData
  };
};
