import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'palani_access_token';
const REFRESH_TOKEN_KEY = 'palani_refresh_token';
const USER_DATA_KEY = 'palani_user_data';

export interface UserData {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  isActive: boolean;
}

class TokenStorage {
  // Store access token
  async setAccessToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem(TOKEN_KEY, token);
      console.log('Access token stored successfully');
    } catch (error) {
      console.error('Error storing access token:', error);
      throw error;
    }
  }

  // Get access token
  async getAccessToken(): Promise<string | null> {
    try {
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      return token;
    } catch (error) {
      console.error('Error getting access token:', error);
      return null;
    }
  }

  // Store refresh token
  async setRefreshToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem(REFRESH_TOKEN_KEY, token);
      console.log('Refresh token stored successfully');
    } catch (error) {
      console.error('Error storing refresh token:', error);
      throw error;
    }
  }

  // Get refresh token
  async getRefreshToken(): Promise<string | null> {
    try {
      const token = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
      return token;
    } catch (error) {
      console.error('Error getting refresh token:', error);
      return null;
    }
  }

  // Store user data
  async setUserData(userData: UserData): Promise<void> {
    try {
      await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
      console.log('User data stored successfully');
    } catch (error) {
      console.error('Error storing user data:', error);
      throw error;
    }
  }

  // Get user data
  async getUserData(): Promise<UserData | null> {
    try {
      const userData = await AsyncStorage.getItem(USER_DATA_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
  }

  // Clear all stored data (logout)
  async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([TOKEN_KEY, REFRESH_TOKEN_KEY, USER_DATA_KEY]);
      console.log('All user data cleared successfully');
    } catch (error) {
      console.error('Error clearing user data:', error);
      throw error;
    }
  }

  // Check if user is logged in
  async isLoggedIn(): Promise<boolean> {
    try {
      const token = await this.getAccessToken();
      const userData = await this.getUserData();
      return !!(token && userData);
    } catch (error) {
      console.error('Error checking login status:', error);
      return false;
    }
  }

  // Store complete login data
  async storeLoginData(accessToken: string, refreshToken: string, userData: UserData): Promise<void> {
    try {
      await Promise.all([
        this.setAccessToken(accessToken),
        this.setRefreshToken(refreshToken),
        this.setUserData(userData)
      ]);
      console.log('Complete login data stored successfully');
    } catch (error) {
      console.error('Error storing complete login data:', error);
      throw error;
    }
  }
}

export const tokenStorage = new TokenStorage();