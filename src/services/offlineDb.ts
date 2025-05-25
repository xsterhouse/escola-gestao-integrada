
import Dexie, { Table } from 'dexie';

export interface OfflineData {
  id?: number;
  type: 'contract' | 'product' | 'invoice' | 'planning' | 'financial';
  data: any;
  action: 'create' | 'update' | 'delete';
  timestamp: Date;
  synced: boolean;
  originalId?: string;
}

export interface SyncQueue {
  id?: number;
  type: string;
  data: any;
  action: string;
  timestamp: Date;
  retryCount: number;
  lastError?: string;
}

export class OfflineDatabase extends Dexie {
  offlineData!: Table<OfflineData>;
  syncQueue!: Table<SyncQueue>;

  constructor() {
    super('SGIREOfflineDB');
    
    this.version(1).stores({
      offlineData: '++id, type, synced, timestamp',
      syncQueue: '++id, type, timestamp, retryCount'
    });
  }
}

export const offlineDb = new OfflineDatabase();

// Métodos auxiliares para gerenciar dados offline
export const offlineStorage = {
  async saveOfflineData(type: string, data: any, action: string, originalId?: string) {
    return await offlineDb.offlineData.add({
      type: type as any,
      data,
      action: action as any,
      timestamp: new Date(),
      synced: false,
      originalId
    });
  },

  async getUnsyncedData() {
    return await offlineDb.offlineData.where('synced').equals(false).toArray();
  },

  async markAsSynced(id: number) {
    return await offlineDb.offlineData.update(id, { synced: true });
  },

  async addToSyncQueue(type: string, data: any, action: string) {
    return await offlineDb.syncQueue.add({
      type,
      data,
      action,
      timestamp: new Date(),
      retryCount: 0
    });
  },

  async getSyncQueue() {
    return await offlineDb.syncQueue.orderBy('timestamp').toArray();
  },

  async removeSyncItem(id: number) {
    return await offlineDb.syncQueue.delete(id);
  },

  async incrementRetryCount(id: number, error: string) {
    const item = await offlineDb.syncQueue.get(id);
    if (item) {
      return await offlineDb.syncQueue.update(id, {
        retryCount: item.retryCount + 1,
        lastError: error
      });
    }
  }
};
