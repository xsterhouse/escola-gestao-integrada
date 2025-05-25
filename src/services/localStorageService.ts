
import { toast } from "@/hooks/use-toast";

export interface LocalStorageData {
  id: string;
  type: string;
  data: any;
  createdAt: Date;
  updatedAt: Date;
  version: number;
  schoolId?: string;
  userId?: string;
}

export interface LocalStorageOptions {
  schoolId?: string;
  userId?: string;
  autoSync?: boolean;
}

class LocalStorageService {
  private readonly VERSION = 1;
  private readonly PREFIX = 'sigre_';

  private getKey(type: string, schoolId?: string): string {
    return `${this.PREFIX}${type}${schoolId ? `_${schoolId}` : ''}`;
  }

  private validateData(data: any): boolean {
    try {
      JSON.stringify(data);
      return true;
    } catch {
      return false;
    }
  }

  save<T>(type: string, data: T, options: LocalStorageOptions = {}): string {
    try {
      if (!this.validateData(data)) {
        throw new Error('Dados inválidos para armazenamento');
      }

      const id = crypto.randomUUID();
      const key = this.getKey(type, options.schoolId);
      
      const storageData: LocalStorageData = {
        id,
        type,
        data,
        createdAt: new Date(),
        updatedAt: new Date(),
        version: this.VERSION,
        schoolId: options.schoolId,
        userId: options.userId
      };

      // Recuperar dados existentes
      const existing = this.getAll<T>(type, options);
      existing.push(storageData);

      localStorage.setItem(key, JSON.stringify(existing));

      // Log da operação
      this.logOperation('CREATE', type, id, options.schoolId);

      console.log(`💾 Dados salvos: ${type} - ID: ${id}`);
      
      if (options.autoSync) {
        this.syncWithOfflineStorage(type, data, 'create', id);
      }

      return id;
    } catch (error) {
      console.error('Erro ao salvar no localStorage:', error);
      toast({
        title: "Erro ao salvar dados",
        description: "Não foi possível salvar os dados localmente.",
        variant: "destructive"
      });
      throw error;
    }
  }

  update<T>(type: string, id: string, data: Partial<T>, options: LocalStorageOptions = {}): boolean {
    try {
      const key = this.getKey(type, options.schoolId);
      const existing = this.getAll<T>(type, options);
      
      const index = existing.findIndex(item => item.id === id);
      if (index === -1) {
        throw new Error(`Item não encontrado: ${id}`);
      }

      existing[index] = {
        ...existing[index],
        data: { ...existing[index].data, ...data },
        updatedAt: new Date()
      };

      localStorage.setItem(key, JSON.stringify(existing));

      // Log da operação
      this.logOperation('UPDATE', type, id, options.schoolId);

      console.log(`📝 Dados atualizados: ${type} - ID: ${id}`);

      if (options.autoSync) {
        this.syncWithOfflineStorage(type, existing[index].data, 'update', id);
      }

      return true;
    } catch (error) {
      console.error('Erro ao atualizar no localStorage:', error);
      toast({
        title: "Erro ao atualizar dados",
        description: "Não foi possível atualizar os dados localmente.",
        variant: "destructive"
      });
      return false;
    }
  }

  delete(type: string, id: string, options: LocalStorageOptions = {}): boolean {
    try {
      const key = this.getKey(type, options.schoolId);
      const existing = this.getAll(type, options);
      
      const filtered = existing.filter(item => item.id !== id);
      
      if (filtered.length === existing.length) {
        throw new Error(`Item não encontrado: ${id}`);
      }

      localStorage.setItem(key, JSON.stringify(filtered));

      // Log da operação
      this.logOperation('DELETE', type, id, options.schoolId);

      console.log(`🗑️ Dados removidos: ${type} - ID: ${id}`);

      if (options.autoSync) {
        this.syncWithOfflineStorage(type, { id }, 'delete', id);
      }

      return true;
    } catch (error) {
      console.error('Erro ao remover do localStorage:', error);
      toast({
        title: "Erro ao remover dados",
        description: "Não foi possível remover os dados localmente.",
        variant: "destructive"
      });
      return false;
    }
  }

  getAll<T>(type: string, options: LocalStorageOptions = {}): LocalStorageData[] {
    try {
      const key = this.getKey(type, options.schoolId);
      const stored = localStorage.getItem(key);
      
      if (!stored) return [];
      
      const parsed = JSON.parse(stored);
      
      // Migração de dados se necessário
      return this.migrateDataIfNeeded(parsed);
    } catch (error) {
      console.error('Erro ao recuperar do localStorage:', error);
      return [];
    }
  }

  getById<T>(type: string, id: string, options: LocalStorageOptions = {}): LocalStorageData | null {
    const all = this.getAll<T>(type, options);
    return all.find(item => item.id === id) || null;
  }

  clear(type: string, options: LocalStorageOptions = {}): boolean {
    try {
      const key = this.getKey(type, options.schoolId);
      localStorage.removeItem(key);
      
      // Log da operação
      this.logOperation('CLEAR', type, 'all', options.schoolId);

      console.log(`🧹 Dados limpos: ${type}`);
      return true;
    } catch (error) {
      console.error('Erro ao limpar localStorage:', error);
      return false;
    }
  }

  exportData(type?: string): any {
    try {
      const allKeys = Object.keys(localStorage).filter(key => key.startsWith(this.PREFIX));
      const exportData: any = {};

      allKeys.forEach(key => {
        if (!type || key.includes(type)) {
          exportData[key] = JSON.parse(localStorage.getItem(key) || '[]');
        }
      });

      return exportData;
    } catch (error) {
      console.error('Erro ao exportar dados:', error);
      return {};
    }
  }

  importData(data: any): boolean {
    try {
      Object.entries(data).forEach(([key, value]) => {
        if (key.startsWith(this.PREFIX)) {
          localStorage.setItem(key, JSON.stringify(value));
        }
      });

      console.log('📥 Dados importados com sucesso');
      return true;
    } catch (error) {
      console.error('Erro ao importar dados:', error);
      return false;
    }
  }

  private migrateDataIfNeeded(data: any[]): LocalStorageData[] {
    return data.map(item => {
      if (!item.version || item.version < this.VERSION) {
        return {
          ...item,
          version: this.VERSION,
          createdAt: item.createdAt ? new Date(item.createdAt) : new Date(),
          updatedAt: new Date()
        };
      }
      return {
        ...item,
        createdAt: new Date(item.createdAt),
        updatedAt: new Date(item.updatedAt)
      };
    });
  }

  private logOperation(operation: string, type: string, id: string, schoolId?: string): void {
    const logKey = `${this.PREFIX}logs`;
    const logs = JSON.parse(localStorage.getItem(logKey) || '[]');
    
    logs.push({
      id: crypto.randomUUID(),
      operation,
      type,
      itemId: id,
      schoolId,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent
    });

    // Manter apenas os últimos 1000 logs
    if (logs.length > 1000) {
      logs.splice(0, logs.length - 1000);
    }

    localStorage.setItem(logKey, JSON.stringify(logs));
  }

  private async syncWithOfflineStorage(type: string, data: any, action: string, id: string): Promise<void> {
    try {
      // Integração com sistema offline existente
      const { offlineStorage } = await import('./offlineDb');
      await offlineStorage.saveOfflineData(type, data, action, id);
    } catch (error) {
      console.error('Erro na sincronização offline:', error);
    }
  }

  // Métodos utilitários para desenvolvimento
  getStorageInfo(): any {
    const keys = Object.keys(localStorage).filter(key => key.startsWith(this.PREFIX));
    const info: any = {
      totalKeys: keys.length,
      totalSize: 0,
      types: {}
    };

    keys.forEach(key => {
      const data = localStorage.getItem(key) || '';
      const size = new Blob([data]).size;
      info.totalSize += size;

      const type = key.replace(this.PREFIX, '').split('_')[0];
      if (!info.types[type]) {
        info.types[type] = { count: 0, size: 0 };
      }
      
      const items = JSON.parse(data);
      info.types[type].count += Array.isArray(items) ? items.length : 1;
      info.types[type].size += size;
    });

    return info;
  }

  getLogs(): any[] {
    const logKey = `${this.PREFIX}logs`;
    return JSON.parse(localStorage.getItem(logKey) || '[]');
  }
}

export const localStorageService = new LocalStorageService();
