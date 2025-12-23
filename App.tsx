import React, { useState, useEffect } from 'react';
import { View, StatusBar, Text } from 'react-native';
import { RootSiblingParent } from 'react-native-root-siblings';
import { AppProvider } from './src/context/AppContext';
import { LanguageProvider } from './src/context/LanguageContext';
import AppNavigator from './src/navigation/AppNavigator';
import NotificationService from './src/services/notificationService';
import OfflineService from './src/services/offlineService';
import AdvancedLocationService from './src/services/advancedLocationService';

const App: React.FC = () => {
  const [isServicesInitialized, setIsServicesInitialized] = useState(false);

  useEffect(() => {
    initializeServices();
  }, []);

  const initializeServices = async () => {
    try {
      console.log('🚀 Initializing app services...');

      // Initialize notification service
      await NotificationService.initialize();
      console.log('✅ Notification service initialized');

      // Initialize offline service
      await OfflineService.initialize();
      console.log('✅ Offline service initialized');

      // Request location permissions
      const hasLocationPermission = await AdvancedLocationService.requestLocationPermissions();
      if (hasLocationPermission) {
        console.log('✅ Location service initialized');
      } else {
        console.log('⚠️ Location permissions not granted');
      }

      // Initialize analytics service (happens automatically via singleton)
      console.log('✅ Analytics service initialized');

      setIsServicesInitialized(true);
      console.log('🎉 All services initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize services:', error);
      // Continue anyway - app should still work with limited functionality
      setIsServicesInitialized(true);
    }
  };

  // Show loading screen while services initialize
  if (!isServicesInitialized) {
    return (
      <View style={{ 
        flex: 1, 
        backgroundColor: '#667eea', 
        justifyContent: 'center', 
        alignItems: 'center' 
      }}>
        <Text style={{ 
          color: 'white', 
          fontSize: 24, 
          fontWeight: 'bold',
          marginBottom: 20
        }}>
          🙏 Palani Pathayathirai
        </Text>
        <Text style={{ 
          color: 'rgba(255,255,255,0.8)', 
          fontSize: 16 
        }}>
          Initializing services...
        </Text>
      </View>
    );
  }

  return (
    <RootSiblingParent>
      <LanguageProvider>
        <AppProvider>
          <View style={{ flex: 1 }}>
            <StatusBar barStyle="light-content" backgroundColor="#667eea" />
            <AppNavigator />
          </View>
        </AppProvider>
      </LanguageProvider>
    </RootSiblingParent>
  );
};

export default App;