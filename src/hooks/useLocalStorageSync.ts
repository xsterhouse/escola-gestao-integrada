
import { useState, useEffect, useCallback, useRef } from 'react';

export function useLocalStorageSync<T>(key: string, initialValue: T[]) {
  const [data, setData] = useState<T[]>(initialValue);
  const keyRef = useRef(key);
  const initializedRef = useRef(false);
  const isUpdatingRef = useRef(false);

  // Update key ref when key changes
  useEffect(() => {
    keyRef.current = key;
    // Reset initialization when key changes
    initializedRef.current = false;
  }, [key]);

  // Load data from localStorage - stable function
  const loadData = useCallback(() => {
    if (isUpdatingRef.current) return; // Prevent loading during our own updates
    
    try {
      const stored = localStorage.getItem(keyRef.current);
      console.log(`📖 Carregando dados de: ${keyRef.current}`, stored ? 'dados encontrados' : 'sem dados');
      
      if (stored) {
        const parsed = JSON.parse(stored);
        setData(Array.isArray(parsed) ? parsed : []);
      } else {
        setData([]);
      }
    } catch (error) {
      console.error(`❌ Erro ao carregar ${keyRef.current}:`, error);
      setData([]);
    }
  }, []);

  // Save data to localStorage - stable function
  const saveData = useCallback((newData: T[]) => {
    try {
      isUpdatingRef.current = true; // Flag to prevent loading our own changes
      localStorage.setItem(keyRef.current, JSON.stringify(newData));
      setData(newData);
      
      console.log(`💾 Dados salvos em: ${keyRef.current} - ${newData.length} itens`);
      
      // Small delay to reset the flag after the storage event has been processed
      setTimeout(() => {
        isUpdatingRef.current = false;
      }, 50);
    } catch (error) {
      console.error(`❌ Erro ao salvar ${keyRef.current}:`, error);
      isUpdatingRef.current = false;
    }
  }, []);

  // Initialize data when key changes or on first load
  useEffect(() => {
    if (!initializedRef.current) {
      loadData();
      initializedRef.current = true;
    }
  }, [loadData, key]); // Include key in dependencies to reload when key changes

  // Listen to storage changes from other tabs only (native browser event)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      // Only process changes from other tabs/windows and for our specific key
      if (e.key === keyRef.current && e.newValue && !isUpdatingRef.current) {
        try {
          const parsed = JSON.parse(e.newValue);
          setData(Array.isArray(parsed) ? parsed : []);
          console.log(`🔄 Dados sincronizados de outra aba: ${keyRef.current}`);
        } catch (error) {
          console.error(`❌ Erro ao processar mudança de storage para ${keyRef.current}:`, error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []); // No dependencies to prevent re-registration

  return { data, saveData, loadData };
}
