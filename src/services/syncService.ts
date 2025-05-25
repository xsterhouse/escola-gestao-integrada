
import { offlineStorage, SyncQueue } from './offlineDb';
import { useToast } from '@/hooks/use-toast';

export class SyncService {
  private isRunning = false;
  private maxRetries = 3;

  async syncPendingData() {
    if (this.isRunning) {
      console.log('Sincronização já está em execução');
      return;
    }

    this.isRunning = true;
    console.log('🔄 Iniciando sincronização...');

    try {
      const pendingItems = await offlineStorage.getSyncQueue();
      console.log(`📊 ${pendingItems.length} itens pendentes para sincronização`);

      for (const item of pendingItems) {
        if (item.retryCount >= this.maxRetries) {
          console.log(`❌ Item ${item.id} excedeu máximo de tentativas`);
          continue;
        }

        try {
          await this.syncItem(item);
          if (item.id) {
            await offlineStorage.removeSyncItem(item.id);
          }
          console.log(`✅ Item sincronizado: ${item.type}`);
        } catch (error) {
          console.error(`❌ Erro ao sincronizar item ${item.id}:`, error);
          if (item.id) {
            await offlineStorage.incrementRetryCount(
              item.id, 
              error instanceof Error ? error.message : 'Erro desconhecido'
            );
          }
        }
      }

      console.log('✅ Sincronização concluída');
    } catch (error) {
      console.error('❌ Erro geral na sincronização:', error);
    } finally {
      this.isRunning = false;
    }
  }

  private async syncItem(item: SyncQueue) {
    // Simular API call baseado no tipo de item
    switch (item.type) {
      case 'contract':
        return await this.syncContract(item);
      case 'product':
        return await this.syncProduct(item);
      case 'invoice':
        return await this.syncInvoice(item);
      case 'planning':
        return await this.syncPlanning(item);
      case 'financial':
        return await this.syncFinancial(item);
      default:
        throw new Error(`Tipo de sincronização não suportado: ${item.type}`);
    }
  }

  private async syncContract(item: SyncQueue) {
    // Implementar lógica específica para contratos
    console.log('Sincronizando contrato:', item.data);
    
    // Simular requisição para API
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Salvar no localStorage como se fosse uma API real
    const contracts = JSON.parse(localStorage.getItem('contracts') || '[]');
    
    switch (item.action) {
      case 'create':
        contracts.push(item.data);
        break;
      case 'update':
        const updateIndex = contracts.findIndex((c: any) => c.id === item.data.id);
        if (updateIndex !== -1) {
          contracts[updateIndex] = item.data;
        }
        break;
      case 'delete':
        const deleteIndex = contracts.findIndex((c: any) => c.id === item.data.id);
        if (deleteIndex !== -1) {
          contracts.splice(deleteIndex, 1);
        }
        break;
    }
    
    localStorage.setItem('contracts', JSON.stringify(contracts));
  }

  private async syncProduct(item: SyncQueue) {
    console.log('Sincronizando produto:', item.data);
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const products = JSON.parse(localStorage.getItem('products') || '[]');
    
    switch (item.action) {
      case 'create':
        products.push(item.data);
        break;
      case 'update':
        const updateIndex = products.findIndex((p: any) => p.id === item.data.id);
        if (updateIndex !== -1) {
          products[updateIndex] = item.data;
        }
        break;
      case 'delete':
        const deleteIndex = products.findIndex((p: any) => p.id === item.data.id);
        if (deleteIndex !== -1) {
          products.splice(deleteIndex, 1);
        }
        break;
    }
    
    localStorage.setItem('products', JSON.stringify(products));
  }

  private async syncInvoice(item: SyncQueue) {
    console.log('Sincronizando nota fiscal:', item.data);
    await new Promise(resolve => setTimeout(resolve, 1200));
    // Implementar lógica para notas fiscais
  }

  private async syncPlanning(item: SyncQueue) {
    console.log('Sincronizando planejamento:', item.data);
    await new Promise(resolve => setTimeout(resolve, 900));
    // Implementar lógica para planejamentos
  }

  private async syncFinancial(item: SyncQueue) {
    console.log('Sincronizando dados financeiros:', item.data);
    await new Promise(resolve => setTimeout(resolve, 1100));
    // Implementar lógica para dados financeiros
  }

  async detectConflicts(localData: any, serverData: any) {
    // Lógica simples para detectar conflitos baseada em timestamp
    const localTimestamp = new Date(localData.updatedAt || localData.createdAt);
    const serverTimestamp = new Date(serverData.updatedAt || serverData.createdAt);
    
    if (localTimestamp > serverTimestamp) {
      return {
        hasConflict: true,
        resolution: 'local_newer',
        message: 'Dados locais são mais recentes'
      };
    } else if (serverTimestamp > localTimestamp) {
      return {
        hasConflict: true,
        resolution: 'server_newer',
        message: 'Dados do servidor são mais recentes'
      };
    }
    
    return {
      hasConflict: false,
      resolution: 'no_conflict',
      message: 'Dados estão sincronizados'
    };
  }
}

export const syncService = new SyncService();
