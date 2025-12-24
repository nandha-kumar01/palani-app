// import * as Notifications from 'expo-notifications';
// NOTE: expo-notifications removed from Expo Go in SDK 53
// Use a development build for push notifications: https://docs.expo.dev/develop/development-builds/introduction/
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface NotificationConfig {
  title: string;
  body: string;
  data?: any;
  trigger?: Notifications.NotificationTriggerInput;
}

interface ScheduledNotification {
  id: string;
  title: string;
  body: string;
  scheduledTime: Date;
  type: 'daily' | 'weekly' | 'custom';
}

// Configure notification behavior
// Disabled: expo-notifications not available in Expo Go
// Notifications.setNotificationHandler({
//   handleNotification: async () => ({
//     shouldShowAlert: true,
//     shouldPlaySound: true,
//     shouldSetBadge: true,
//     shouldShowBanner: true,
//     shouldShowList: true,
//   }),
// });

class NotificationService {
  private static instance: NotificationService;
  private isInitialized = false;

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  // Initialize notification service
  async initialize(): Promise<string | null> {
    // expo-notifications not available in Expo Go SDK 53+
    // This will be implemented in development builds
    console.log('ℹ️ Notifications disabled in Expo Go. Use development build for push notifications.');
    this.isInitialized = true;
    return null;
  }

  // Schedule a local notification
  async scheduleNotification(config: NotificationConfig): Promise<string | null> {
    // Disabled in Expo Go
    return null;
  }

  // Cancel a specific notification
  async cancelNotification(identifier: string): Promise<void> {
    // Disabled in Expo Go
  }

  // Cancel all notifications
  async cancelAllNotifications(): Promise<void> {
    // Disabled in Expo Go
  }

  // Get all scheduled notifications
  async getScheduledNotifications(): Promise<any[]> {
    // Disabled in Expo Go
    return [];
  }

  // Schedule daily walk reminder
  async scheduleDailyWalkReminder(hour: number = 6, minute: number = 0): Promise<string | null> {
    // Disabled in Expo Go
    return null;
  }

  // Schedule achievement notification
  async notifyAchievementUnlocked(achievementTitle: string, points: number): Promise<string | null> {
    // Disabled in Expo Go
    return null;
  }

  // Notify about new group walk
  async notifyNewGroupWalk(walkTitle: string, startTime: Date): Promise<string | null> {
    // Disabled in Expo Go
    return null;
  }

  // Notify about annadhanam availability
  async notifyAnnadhanamAvailable(location: string, timings: string): Promise<string | null> {
    // Disabled in Expo Go
    return null;
  }

  // Schedule festival notification
  async scheduleFestivalNotification(festivalName: string, date: Date): Promise<string | null> {
    // Disabled in Expo Go
    return null;
  }

  // Notify about meditation session
  async notifyMeditationSession(time: string): Promise<string | null> {
    // Disabled in Expo Go
    return null;
  }

  // Save notification preferences
  async saveNotificationPreferences(preferences: {
    dailyReminders: boolean;
    groupWalkAlerts: boolean;
    achievementNotifications: boolean;
    annadhanamAlerts: boolean;
    meditationReminders: boolean;
    festivalNotifications: boolean;
  }): Promise<void> {
    try {
      await AsyncStorage.setItem('notificationPreferences', JSON.stringify(preferences));
      console.log('✅ Saved notification preferences');
    } catch (error) {
      console.error('Failed to save notification preferences:', error);
    }
  }

  // Load notification preferences
  async loadNotificationPreferences(): Promise<any> {
    try {
      const preferences = await AsyncStorage.getItem('notificationPreferences');
      return preferences ? JSON.parse(preferences) : {
        dailyReminders: true,
        groupWalkAlerts: true,
        achievementNotifications: true,
        annadhanamAlerts: true,
        meditationReminders: false,
        festivalNotifications: true,
      };
    } catch (error) {
      console.error('Failed to load notification preferences:', error);
      return {};
    }
  }

  // Handle notification received
  addNotificationReceivedListener(listener: (notification: any) => void) {
    // Disabled in Expo Go - listener won't be called
    return {
      remove: () => {}
    };
  }

  // Handle notification response (when user taps notification)
  addNotificationResponseReceivedListener(listener: (response: any) => void) {
    // Disabled in Expo Go - listener won't be called
    return {
      remove: () => {}
    };
  }

  // Send push notification to specific user (requires backend)
  async sendPushNotification(expoPushToken: string, title: string, body: string, data?: any): Promise<boolean> {
    const message = {
      to: expoPushToken,
      sound: 'default',
      title,
      body,
      data: data || {},
    };

    try {
      const response = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });

      const result = await response.json();
      console.log('📤 Push notification sent:', result);
      return response.ok;
    } catch (error) {
      console.error('Failed to send push notification:', error);
      return false;
    }
  }

  // Get notification history from storage
  async getNotificationHistory(): Promise<any[]> {
    try {
      const history = await AsyncStorage.getItem('notificationHistory');
      return history ? JSON.parse(history) : [];
    } catch (error) {
      console.error('Failed to get notification history:', error);
      return [];
    }
  }

  // Add to notification history
  async addToNotificationHistory(notification: any): Promise<void> {
    try {
      const history = await this.getNotificationHistory();
      const newEntry = {
        ...notification,
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        read: false,
      };
      
      history.unshift(newEntry);
      
      // Keep only last 50 notifications
      if (history.length > 50) {
        history.splice(50);
      }
      
      await AsyncStorage.setItem('notificationHistory', JSON.stringify(history));
    } catch (error) {
      console.error('Failed to add to notification history:', error);
    }
  }

  // Mark notification as read
  async markNotificationAsRead(notificationId: string): Promise<void> {
    try {
      const history = await this.getNotificationHistory();
      const updatedHistory = history.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true }
          : notification
      );
      await AsyncStorage.setItem('notificationHistory', JSON.stringify(updatedHistory));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }
}

// Export singleton instance
export default NotificationService.getInstance();