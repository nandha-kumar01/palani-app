import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { Alert } from 'react-native';

interface CacheItem<T = any> {
  data: T;
  timestamp: number;
  expiresAt?: number;
  key: string;
}

interface OfflineAction {
  id: string;
  action: string;
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  data?: any;
  timestamp: number;
  retryCount: number;
  maxRetries: number;
}

interface SyncStatus {
  isOnline: boolean;
  lastSyncTime?: number;
  pendingActions: number;
  failedActions: number;
}

class OfflineService {
  private static instance: OfflineService;
  private isOnline: boolean = true;
  private syncQueue: OfflineAction[] = [];
  private isInitialized: boolean = false;
  private syncInProgress: boolean = false;

  // Cache expiry times (in milliseconds)
  private readonly CACHE_DURATIONS = {
    short: 5 * 60 * 1000,      // 5 minutes
    medium: 30 * 60 * 1000,    // 30 minutes  
    long: 24 * 60 * 60 * 1000, // 24 hours
    permanent: 30 * 24 * 60 * 60 * 1000, // 30 days
  };

  static getInstance(): OfflineService {
    if (!OfflineService.instance) {
      OfflineService.instance = new OfflineService();
    }
    return OfflineService.instance;
  }

  // Initialize offline service
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Check initial network status
      const netInfo = await NetInfo.fetch();
      this.isOnline = netInfo.isConnected ?? false;

      // Set up network status listener
      NetInfo.addEventListener(state => {
        const wasOffline = !this.isOnline;
        this.isOnline = state.isConnected ?? false;

        // If we just came back online, sync pending actions
        if (wasOffline && this.isOnline) {
          console.log('📶 Connection restored, syncing data...');
          this.syncPendingActions();
        }
      });

      // Load pending actions from storage
      await this.loadSyncQueue();

      this.isInitialized = true;
      console.log('💾 Offline service initialized');
    } catch (error) {
      console.error('Failed to initialize offline service:', error);
    }
  }

  // Check if device is online
  isDeviceOnline(): boolean {
    return this.isOnline;
  }

  // Store data in cache
  async cacheData<T>(
    key: string, 
    data: T, 
    duration: keyof typeof this.CACHE_DURATIONS = 'medium'
  ): Promise<void> {
    try {
      const cacheItem: CacheItem<T> = {
        data,
        timestamp: Date.now(),
        expiresAt: Date.now() + this.CACHE_DURATIONS[duration],
        key,
      };

      await AsyncStorage.setItem(`cache_${key}`, JSON.stringify(cacheItem));
      console.log(`💾 Cached data: ${key}`);
    } catch (error) {
      console.error(`Failed to cache data for ${key}:`, error);
    }
  }

  // Retrieve data from cache
  async getCachedData<T>(key: string): Promise<T | null> {
    try {
      const cachedItem = await AsyncStorage.getItem(`cache_${key}`);
      if (!cachedItem) return null;

      const cacheItem: CacheItem<T> = JSON.parse(cachedItem);
      
      // Check if cache has expired
      if (cacheItem.expiresAt && Date.now() > cacheItem.expiresAt) {
        await this.removeCachedData(key);
        return null;
      }

      console.log(`📂 Retrieved cached data: ${key}`);
      return cacheItem.data;
    } catch (error) {
      console.error(`Failed to get cached data for ${key}:`, error);
      return null;
    }
  }

  // Remove specific cached data
  async removeCachedData(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(`cache_${key}`);
      console.log(`🗑️ Removed cached data: ${key}`);
    } catch (error) {
      console.error(`Failed to remove cached data for ${key}:`, error);
    }
  }

  // Clear all expired cache
  async clearExpiredCache(): Promise<void> {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const cacheKeys = allKeys.filter(key => key.startsWith('cache_'));
      
      for (const key of cacheKeys) {
        const cachedItem = await AsyncStorage.getItem(key);
        if (cachedItem) {
          const cacheItem: CacheItem = JSON.parse(cachedItem);
          if (cacheItem.expiresAt && Date.now() > cacheItem.expiresAt) {
            await AsyncStorage.removeItem(key);
            console.log(`🧹 Cleared expired cache: ${key}`);
          }
        }
      }
    } catch (error) {
      console.error('Failed to clear expired cache:', error);
    }
  }

  // Clear all cache
  async clearAllCache(): Promise<void> {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const cacheKeys = allKeys.filter(key => key.startsWith('cache_'));
      await AsyncStorage.multiRemove(cacheKeys);
      console.log('🧹 Cleared all cache');
    } catch (error) {
      console.error('Failed to clear all cache:', error);
    }
  }

  // Queue action for offline sync
  async queueAction(
    action: string,
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    data?: any,
    maxRetries: number = 3
  ): Promise<void> {
    const offlineAction: OfflineAction = {
      id: `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      action,
      endpoint,
      method,
      data,
      timestamp: Date.now(),
      retryCount: 0,
      maxRetries,
    };

    this.syncQueue.push(offlineAction);
    await this.saveSyncQueue();
    
    console.log(`📝 Queued offline action: ${action}`);
  }

  // Sync pending actions when online
  async syncPendingActions(): Promise<void> {
    if (!this.isOnline || this.syncInProgress || this.syncQueue.length === 0) {
      return;
    }

    this.syncInProgress = true;
    console.log(`🔄 Syncing ${this.syncQueue.length} pending actions...`);

    const failedActions: OfflineAction[] = [];

    for (const action of this.syncQueue) {
      try {
        // Attempt to execute the action
        const success = await this.executeAction(action);
        
        if (!success) {
          action.retryCount++;
          if (action.retryCount < action.maxRetries) {
            failedActions.push(action);
          } else {
            console.warn(`❌ Max retries reached for action: ${action.action}`);
          }
        } else {
          console.log(`✅ Synced action: ${action.action}`);
        }
      } catch (error) {
        console.error(`Failed to sync action ${action.action}:`, error);
        action.retryCount++;
        if (action.retryCount < action.maxRetries) {
          failedActions.push(action);
        }
      }
    }

    // Update sync queue with failed actions
    this.syncQueue = failedActions;
    await this.saveSyncQueue();

    this.syncInProgress = false;
    console.log(`✅ Sync completed. ${failedActions.length} actions remaining.`);
  }

  // Execute a queued action
  private async executeAction(action: OfflineAction): Promise<boolean> {
    try {
      // This would integrate with your actual API service
      console.log(`🚀 Executing: ${action.method} ${action.endpoint}`);
      
      // Simulate API call - replace with actual API integration
      return new Promise((resolve) => {
        setTimeout(() => {
          // Simulate success/failure
          resolve(Math.random() > 0.2); // 80% success rate
        }, 1000);
      });
    } catch (error) {
      console.error(`Failed to execute action:`, error);
      return false;
    }
  }

  // Save sync queue to storage
  private async saveSyncQueue(): Promise<void> {
    try {
      await AsyncStorage.setItem('syncQueue', JSON.stringify(this.syncQueue));
    } catch (error) {
      console.error('Failed to save sync queue:', error);
    }
  }

  // Load sync queue from storage
  private async loadSyncQueue(): Promise<void> {
    try {
      const queueData = await AsyncStorage.getItem('syncQueue');
      if (queueData) {
        this.syncQueue = JSON.parse(queueData);
        console.log(`📥 Loaded ${this.syncQueue.length} pending actions`);
      }
    } catch (error) {
      console.error('Failed to load sync queue:', error);
    }
  }

  // Get sync status
  async getSyncStatus(): Promise<SyncStatus> {
    try {
      const lastSyncTime = await AsyncStorage.getItem('lastSyncTime');
      const failedActions = this.syncQueue.filter(action => action.retryCount >= action.maxRetries);

      return {
        isOnline: this.isOnline,
        lastSyncTime: lastSyncTime ? parseInt(lastSyncTime) : undefined,
        pendingActions: this.syncQueue.length,
        failedActions: failedActions.length,
      };
    } catch (error) {
      console.error('Failed to get sync status:', error);
      return {
        isOnline: this.isOnline,
        pendingActions: 0,
        failedActions: 0,
      };
    }
  }

  // Store user data for offline access
  async storeUserData(userData: any): Promise<void> {
    await this.cacheData('userData', userData, 'permanent');
  }

  // Get user data (offline-first)
  async getUserData(): Promise<any> {
    return await this.getCachedData('userData');
  }

  // Store temple data for offline access
  async storeTempleData(temples: any[]): Promise<void> {
    await this.cacheData('templeData', temples, 'long');
  }

  // Get temple data (offline-first)
  async getTempleData(): Promise<any[]> {
    const cached = await this.getCachedData('templeData');
    return (cached as any[]) || [];
  }

  // Store annadhanam data for offline access
  async storeAnnadhanamData(annadhanam: any[]): Promise<void> {
    await this.cacheData('annadhanamData', annadhanam, 'medium');
  }

  // Get annadhanam data (offline-first)
  async getAnnadhanamData(): Promise<any[]> {
    const cached = await this.getCachedData('annadhanamData');
    return (cached as any[]) || [];
  }

  // Store madangal data for offline access
  async storeMadangalData(madangal: any[]): Promise<void> {
    await this.cacheData('madangalData', madangal, 'medium');
  }

  // Get madangal data (offline-first)
  async getMadangalData(): Promise<any[]> {
    const cached = await this.getCachedData('madangalData');
    return (cached as any[]) || [];
  }

  // Force sync all data
  async forceSyncAll(): Promise<void> {
    if (!this.isOnline) {
      Alert.alert('No Connection', 'Please check your internet connection and try again.');
      return;
    }

    try {
      console.log('🔄 Force syncing all data...');
      await this.syncPendingActions();
      
      // Update last sync time
      await AsyncStorage.setItem('lastSyncTime', Date.now().toString());
      
      // Clear expired cache
      await this.clearExpiredCache();
      
      console.log('✅ Force sync completed');
    } catch (error) {
      console.error('Failed to force sync:', error);
      Alert.alert('Sync Failed', 'Failed to sync data. Please try again later.');
    }
  }

  // Get cache size information
  async getCacheInfo(): Promise<{ totalItems: number; totalSize: string }> {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const cacheKeys = allKeys.filter(key => key.startsWith('cache_'));
      
      let totalSize = 0;
      for (const key of cacheKeys) {
        const item = await AsyncStorage.getItem(key);
        if (item) {
          totalSize += item.length;
        }
      }

      return {
        totalItems: cacheKeys.length,
        totalSize: this.formatBytes(totalSize),
      };
    } catch (error) {
      console.error('Failed to get cache info:', error);
      return { totalItems: 0, totalSize: '0 B' };
    }
  }

  // Format bytes to human readable
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Handle offline actions for specific features
  async handleOfflineWalkData(walkData: any): Promise<void> {
    if (this.isOnline) {
      // Send immediately if online
      await this.queueAction('saveWalkData', '/api/walks', 'POST', walkData);
      await this.syncPendingActions();
    } else {
      // Queue for later sync
      await this.queueAction('saveWalkData', '/api/walks', 'POST', walkData);
      // Also cache locally
      await this.cacheData(`walkData_${walkData.id}`, walkData, 'permanent');
    }
  }

  async handleOfflineAchievement(achievementData: any): Promise<void> {
    if (this.isOnline) {
      await this.queueAction('unlockAchievement', '/api/achievements', 'POST', achievementData);
      await this.syncPendingActions();
    } else {
      await this.queueAction('unlockAchievement', '/api/achievements', 'POST', achievementData);
      await this.cacheData(`achievement_${achievementData.id}`, achievementData, 'permanent');
    }
  }
}

// Export singleton instance
export default OfflineService.getInstance();