
import { useState, useEffect, useCallback, useRef } from 'react';

export function useLocalStorageSync<T>(key: string, initialValue: T[]) {
  const [data, setData] = useState<T[]>(initialValue);
  const keyRef = useRef(key);
  const initializedRef = useRef(false);

  // Update key ref when key changes
  useEffect(() => {
    keyRef.current = key;
  }, [key]);

  // Carregar dados do localStorage - função estável
  const loadData = useCallback(() => {
    try {
      const stored = localStorage.getItem(keyRef.current);
      if (stored) {
        const parsed = JSON.parse(stored);
        setData(Array.isArray(parsed) ? parsed : []);
      } else {
        setData([]);
      }
    } catch (error) {
      console.error(`Erro ao carregar ${keyRef.current}:`, error);
      setData([]);
    }
  }, []);

  // Salvar dados no localStorage - função estável
  const saveData = useCallback((newData: T[]) => {
    try {
      localStorage.setItem(keyRef.current, JSON.stringify(newData));
      setData(newData);
      
      // Disparar evento customizado para outros componentes
      window.dispatchEvent(new CustomEvent(`storage-${keyRef.current}`, {
        detail: newData
      }));
    } catch (error) {
      console.error(`Erro ao salvar ${keyRef.current}:`, error);
    }
  }, []);

  // Carregar dados apenas uma vez na montagem do componente
  useEffect(() => {
    if (!initializedRef.current) {
      loadData();
      initializedRef.current = true;
    }
  }, []); // Remove loadData dependency to prevent circular dependency

  // Escutar mudanças no localStorage de outras abas/componentes
  useEffect(() => {
    // Listener para mudanças no localStorage (outras abas)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === keyRef.current && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          setData(Array.isArray(parsed) ? parsed : []);
        } catch (error) {
          console.error(`Erro ao processar mudança de storage para ${keyRef.current}:`, error);
        }
      }
    };

    // Listener para mudanças locais
    const handleLocalChange = (e: CustomEvent) => {
      setData(e.detail);
    };

    const eventName = `storage-${keyRef.current}`;
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener(eventName, handleLocalChange as EventListener);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener(eventName, handleLocalChange as EventListener);
    };
  }, []);

  return { data, saveData, loadData };
}
