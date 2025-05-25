
import { useState, useEffect, useCallback } from 'react';

export function useLocalStorageSync<T>(key: string, initialValue: T[]) {
  const [data, setData] = useState<T[]>(initialValue);

  // Carregar dados do localStorage
  const loadData = useCallback(() => {
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        const parsed = JSON.parse(stored);
        setData(Array.isArray(parsed) ? parsed : []);
      }
    } catch (error) {
      console.error(`Erro ao carregar ${key}:`, error);
      setData([]);
    }
  }, [key]);

  // Salvar dados no localStorage
  const saveData = useCallback((newData: T[]) => {
    try {
      localStorage.setItem(key, JSON.stringify(newData));
      setData(newData);
      
      // Disparar evento customizado para outros componentes
      window.dispatchEvent(new CustomEvent(`storage-${key}`, {
        detail: newData
      }));
    } catch (error) {
      console.error(`Erro ao salvar ${key}:`, error);
    }
  }, [key]);

  // Escutar mudanças no localStorage de outras abas/componentes
  useEffect(() => {
    loadData();

    // Listener para mudanças no localStorage (outras abas)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          setData(Array.isArray(parsed) ? parsed : []);
        } catch (error) {
          console.error(`Erro ao processar mudança de storage para ${key}:`, error);
        }
      }
    };

    // Listener para mudanças locais
    const handleLocalChange = (e: CustomEvent) => {
      setData(e.detail);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener(`storage-${key}`, handleLocalChange as EventListener);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener(`storage-${key}`, handleLocalChange as EventListener);
    };
  }, [key, loadData]);

  return { data, saveData, loadData };
}
