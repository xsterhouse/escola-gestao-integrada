
import { useState, useEffect, useCallback } from 'react';
import { localStorageService, LocalStorageOptions, LocalStorageData } from '@/services/localStorageService';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface UseLocalStorageReturn<T> {
  data: LocalStorageData[];
  loading: boolean;
  save: (item: T) => string | null;
  update: (id: string, item: Partial<T>) => boolean;
  remove: (id: string) => boolean;
  getById: (id: string) => LocalStorageData | null;
  clear: () => boolean;
  refresh: () => void;
}

export function useLocalStorage<T>(
  type: string,
  options: LocalStorageOptions = {}
): UseLocalStorageReturn<T> {
  const { currentSchool, user } = useAuth();
  const { toast } = useToast();
  const [data, setData] = useState<LocalStorageData[]>([]);
  const [loading, setLoading] = useState(true);

  // Configurações com valores padrão do contexto
  const storageOptions: LocalStorageOptions = {
    schoolId: options.schoolId || currentSchool?.id,
    userId: options.userId || user?.id,
    autoSync: options.autoSync !== false // padrão true
  };

  const loadData = useCallback(() => {
    setLoading(true);
    try {
      const items = localStorageService.getAll<T>(type, storageOptions);
      setData(items);
    } catch (error) {
      console.error(`Erro ao carregar dados do tipo ${type}:`, error);
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar os dados do armazenamento local.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [type, storageOptions.schoolId, storageOptions.userId, toast]);

  const save = useCallback((item: T): string | null => {
    try {
      const id = localStorageService.save(type, item, storageOptions);
      loadData(); // Recarregar dados
      
      toast({
        title: "Dados salvos",
        description: "Os dados foram salvos com sucesso no armazenamento local.",
      });
      
      return id;
    } catch (error) {
      console.error('Erro ao salvar:', error);
      return null;
    }
  }, [type, storageOptions, loadData, toast]);

  const update = useCallback((id: string, item: Partial<T>): boolean => {
    try {
      const success = localStorageService.update(type, id, item, storageOptions);
      if (success) {
        loadData(); // Recarregar dados
        
        toast({
          title: "Dados atualizados",
          description: "Os dados foram atualizados com sucesso.",
        });
      }
      return success;
    } catch (error) {
      console.error('Erro ao atualizar:', error);
      return false;
    }
  }, [type, storageOptions, loadData, toast]);

  const remove = useCallback((id: string): boolean => {
    try {
      const success = localStorageService.delete(type, id, storageOptions);
      if (success) {
        loadData(); // Recarregar dados
        
        toast({
          title: "Dados removidos",
          description: "Os dados foram removidos com sucesso.",
        });
      }
      return success;
    } catch (error) {
      console.error('Erro ao remover:', error);
      return false;
    }
  }, [type, storageOptions, loadData, toast]);

  const getById = useCallback((id: string): LocalStorageData | null => {
    return localStorageService.getById<T>(type, id, storageOptions);
  }, [type, storageOptions]);

  const clear = useCallback((): boolean => {
    try {
      const success = localStorageService.clear(type, storageOptions);
      if (success) {
        loadData(); // Recarregar dados
        
        toast({
          title: "Dados limpos",
          description: "Todos os dados foram removidos com sucesso.",
        });
      }
      return success;
    } catch (error) {
      console.error('Erro ao limpar:', error);
      return false;
    }
  }, [type, storageOptions, loadData, toast]);

  const refresh = useCallback(() => {
    loadData();
  }, [loadData]);

  // Carregar dados na inicialização
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Auto-refresh quando mudar escola ou usuário
  useEffect(() => {
    loadData();
  }, [currentSchool?.id, user?.id, loadData]);

  return {
    data,
    loading,
    save,
    update,
    remove,
    getById,
    clear,
    refresh
  };
}

// Hook especializado para auto-save de formulários
export function useAutoSave<T>(
  type: string,
  formData: T,
  options: { interval?: number; enabled?: boolean } = {}
) {
  const { save } = useLocalStorage<T>(`${type}_draft`);
  const { interval = 5000, enabled = true } = options;

  useEffect(() => {
    if (!enabled || !formData) return;

    const timer = setInterval(() => {
      if (Object.keys(formData as any).length > 0) {
        save(formData);
        console.log(`💾 Auto-save: ${type}`);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [formData, enabled, interval, save, type]);
}

// Hook para recuperar dados de draft
export function useDraftRecovery<T>(type: string): {
  draft: LocalStorageData | null;
  clearDraft: () => void;
  hasDraft: boolean;
} {
  const { data, clear } = useLocalStorage<T>(`${type}_draft`);
  
  const draft = data.length > 0 ? data[data.length - 1] : null;
  const hasDraft = !!draft;

  const clearDraft = useCallback(() => {
    clear();
  }, [clear]);

  return {
    draft,
    clearDraft,
    hasDraft
  };
}
