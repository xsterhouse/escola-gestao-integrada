
import { useState, useEffect, useCallback } from 'react';

export function useLocalStorageSync<T>(key: string, initialValue: T[]) {
  const [data, setData] = useState<T[]>(initialValue);

  // Carregar dados do localStorage - sem dependências para evitar recriação
  const loadData = useCallback(() => {
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        const parsed = JSON.parse(stored);
        setData(Array.isArray(parsed) ? parsed : []);
      } else {
        setData([]);
      }
    } catch (error) {
      console.error(`Erro ao carregar ${key}:`, error);
      setData([]);
    }
  }, []); // Removendo key das dependências para evitar recriação

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

  // Carregar dados apenas uma vez na montagem do componente
  useEffect(() => {
    loadData();
  }, [key]); // Apenas key como dependência, não loadData

  // Escutar mudanças no localStorage de outras abas/componentes
  useEffect(() => {
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
  }, [key]);

  return { data, saveData, loadData };
}
