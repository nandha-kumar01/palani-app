import * as Notifications from 'expo-notifications';
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
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

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
    if (this.isInitialized) return null;

    try {
      // Request permissions
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        console.warn('Notification permission denied');
        return null;
      }

      // Get push notification token
      let token = null;
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'Default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }

      // Get expo push token for remote notifications
      try {
        const tokenData = await Notifications.getExpoPushTokenAsync();
        token = tokenData.data;
        console.log('📱 Push notification token:', token);
      } catch (error) {
        console.warn('Failed to get push token:', error);
      }

      this.isInitialized = true;
      return token;
    } catch (error) {
      console.error('Failed to initialize notifications:', error);
      return null;
    }
  }

  // Schedule a local notification
  async scheduleNotification(config: NotificationConfig): Promise<string | null> {
    try {
      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title: config.title,
          body: config.body,
          data: config.data || {},
        },
        trigger: config.trigger || undefined,
      });
      
      console.log('📝 Scheduled notification:', identifier);
      return identifier;
    } catch (error) {
      console.error('Failed to schedule notification:', error);
      return null;
    }
  }

  // Cancel a specific notification
  async cancelNotification(identifier: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(identifier);
      console.log('❌ Cancelled notification:', identifier);
    } catch (error) {
      console.error('Failed to cancel notification:', error);
    }
  }

  // Cancel all notifications
  async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('❌ Cancelled all notifications');
    } catch (error) {
      console.error('Failed to cancel all notifications:', error);
    }
  }

  // Get all scheduled notifications
  async getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Failed to get scheduled notifications:', error);
      return [];
    }
  }

  // Schedule daily walk reminder
  async scheduleDailyWalkReminder(hour: number = 6, minute: number = 0): Promise<string | null> {
    return this.scheduleNotification({
      title: 'Time for Your Spiritual Journey! 🚶‍♂️',
      body: 'Start your day with a peaceful pilgrimage walk. Join the community!',
      data: { type: 'daily_walk_reminder' },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
        hour,
        minute,
        repeats: true,
      } as Notifications.CalendarTriggerInput,
    });
  }

  // Schedule achievement notification
  async notifyAchievementUnlocked(achievementTitle: string, points: number): Promise<string | null> {
    return this.scheduleNotification({
      title: '🏆 Achievement Unlocked!',
      body: `You've earned "${achievementTitle}" (+${points} points)`,
      data: { type: 'achievement', achievement: achievementTitle, points },
    });
  }

  // Notify about new group walk
  async notifyNewGroupWalk(walkTitle: string, startTime: Date): Promise<string | null> {
    return this.scheduleNotification({
      title: '👥 New Group Walk Available!',
      body: `Join "${walkTitle}" starting soon. Don't miss out!`,
      data: { type: 'group_walk', walkTitle, startTime: startTime.toISOString() },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: new Date(Date.now() + 1000),
      } as Notifications.DateTriggerInput,
    });
  }

  // Notify about annadhanam availability
  async notifyAnnadhanamAvailable(location: string, timings: string): Promise<string | null> {
    return this.scheduleNotification({
      title: '🍽️ Annadhanam Available',
      body: `Free meals available at ${location}. Timings: ${timings}`,
      data: { type: 'annadhanam', location, timings },
    });
  }

  // Schedule festival notification
  async scheduleFestivalNotification(festivalName: string, date: Date): Promise<string | null> {
    return this.scheduleNotification({
      title: `🎉 ${festivalName} Approaching`,
      body: 'Join special celebrations and community prayers at the temple.',
      data: { type: 'festival', festivalName, date: date.toISOString() },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: new Date(date.getTime() - 24 * 60 * 60 * 1000),
      } as Notifications.DateTriggerInput,
    });
  }

  // Notify about meditation session
  async notifyMeditationSession(time: string): Promise<string | null> {
    return this.scheduleNotification({
      title: '🧘‍♂️ Meditation Time',
      body: `Your scheduled meditation session starts at ${time}. Find your peace.`,
      data: { type: 'meditation', time },
    });
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
  addNotificationReceivedListener(listener: (notification: Notifications.Notification) => void) {
    return Notifications.addNotificationReceivedListener(listener);
  }

  // Handle notification response (when user taps notification)
  addNotificationResponseReceivedListener(listener: (response: Notifications.NotificationResponse) => void) {
    return Notifications.addNotificationResponseReceivedListener(listener);
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