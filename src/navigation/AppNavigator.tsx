import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';

// Import Screens
import SplashScreen from '../screens/SplashScreen';
import LanguageSelectionScreen from '../screens/LanguageSelectionScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import OTPVerificationScreen from '../screens/OTPVerificationScreen';
import ProfileSetupScreen from '../screens/ProfileSetupScreen';
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';
import AchievementsScreen from '../screens/AchievementsScreen';
import AboutScreen from '../screens/AboutScreen';
import HelpSupportScreen from '../screens/HelpSupportScreen';
import LiveTrackingScreen from '../screens/LiveTrackingScreen';
import MusicScreen from '../screens/MusicScreen';
import GalleryScreen from '../screens/GalleryScreen';
import GalleryListScreen from '../screens/GalleryListScreen';
import GalleryDetailScreen from '../screens/GalleryDetailScreen';
import TempleScreen from '../screens/TempleScreen';
import TempleDetailScreen from '../screens/TempleDetailScreen';
import AnnadhanamScreen from '../screens/AnnadhanamScreen';
import AnnadhanamDetailScreen from '../screens/AnnadhanamDetailScreen';
import MadangalScreen from '../screens/MadangalScreen';
import MadangalDetailScreen from '../screens/MadangalDetailScreen';
import QuotesScreen from '../screens/QuotesScreen';
import GroupWalkScreen from '../screens/GroupWalkScreen';
import GroupWalkDetailScreen from '../screens/GroupWalkDetailScreen';
import HistoryScreen from '../screens/HistoryScreen';

// Bottom Navigation
import BottomNavigation from '../components/BottomNavigation';
import { colors } from '../utils/theme';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Auth Stack Navigator
function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="LanguageSelection" component={LanguageSelectionScreen} />
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
      <Stack.Screen name="OTPVerification" component={OTPVerificationScreen} />
      <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
    </Stack.Navigator>
  );
}

// Main App Tab Navigator
function MainTabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <BottomNavigation {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="LiveTracking" component={LiveTrackingScreen} />
      <Tab.Screen name="Gallery" component={GalleryScreen} />
      <Tab.Screen name="Music" component={MusicScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

// Main App Stack Navigator
function AppStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* Main Tab Navigator */}
      <Stack.Screen name="MainTabs" component={MainTabs} />
      
      {/* Profile Related Screens */}
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="Achievements" component={AchievementsScreen} />
      <Stack.Screen name="About" component={AboutScreen} />
      <Stack.Screen name="HelpSupport" component={HelpSupportScreen} />
      
      {/* Content Screens */}
      <Stack.Screen name="Temple" component={TempleScreen} />
      <Stack.Screen name="TempleDetail" component={TempleDetailScreen} />
      <Stack.Screen name="Annadhanam" component={AnnadhanamScreen} />
      <Stack.Screen name="AnnadhanamDetail" component={AnnadhanamDetailScreen} />
      <Stack.Screen name="Madangal" component={MadangalScreen} />
      <Stack.Screen name="MadangalDetail" component={MadangalDetailScreen} />
      <Stack.Screen name="Quotes" component={QuotesScreen} />
      
      {/* Gallery Screens */}
      <Stack.Screen name="GalleryList" component={GalleryListScreen} />
      <Stack.Screen name="GalleryDetail" component={GalleryDetailScreen} />
      
      {/* Group Walk Screens */}
      <Stack.Screen name="GroupWalk" component={GroupWalkScreen} />
      <Stack.Screen name="GroupWalkDetail" component={GroupWalkDetailScreen} />
      
      {/* Other Screens */}
      <Stack.Screen name="History" component={HistoryScreen} />
    </Stack.Navigator>
  );
}

// Root Navigator
export default function AppNavigator() {
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);

  return (
    <NavigationContainer>
      {isAuthenticated ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
}