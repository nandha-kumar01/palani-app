
import React, { useState, useCallback, useMemo, useEffect, memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

type TabId = 'home' | 'track' | 'group' | 'profile' | 'community';

interface BottomNavigationProps {
  activeTab?: TabId;
  onTabPress?: (tab: TabId) => void;
  navigation?: any;
}

// Memoized tab button component to prevent unnecessary re-renders
const TabButton = memo(({ 
  tab, 
  isActive, 
  onPress 
}: { 
  tab: { id: TabId; icon: string; label: string; screen: string }, 
  isActive: boolean, 
  onPress: () => void 
}) => (
  <TouchableOpacity
    style={styles.tabButton}
    onPress={onPress}
    activeOpacity={0.6}
    delayPressIn={0}
    delayPressOut={0}
  >
    {isActive ? (
      <LinearGradient
        colors={['#f3eefe', '#f7f3ff']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.activeTab}
      >
        <Ionicons name={tab.icon as any} size={26} color="#7c3aed" />
        <Text style={styles.activeLabel}>{tab.label}</Text>
      </LinearGradient>
    ) : (
      <Ionicons name={tab.icon as any} size={28} color="#ffffff" />
    )}
  </TouchableOpacity>
));

const BottomNavigation: React.FC<BottomNavigationProps> = ({ activeTab: propActiveTab, onTabPress, navigation }) => {
  const [currentActiveTab, setCurrentActiveTab] = useState<TabId>(propActiveTab || 'home');
  
  // Update active tab when prop changes (for initial navigation)
  useEffect(() => {
    if (propActiveTab && propActiveTab !== currentActiveTab) {
      setCurrentActiveTab(propActiveTab);
    }
  }, [propActiveTab, currentActiveTab]);
  
  // Static tabs array - never changes
  const tabs = useMemo(() => [
    { id: 'home' as TabId, icon: 'home-outline', label: 'Home', screen: 'Home' },
    { id: 'track' as TabId, icon: 'location-outline', label: 'Track', screen: 'LiveTracking' },
    { id: 'group' as TabId, icon: 'people-outline', label: 'Group', screen: 'GroupWalk' },
    { id: 'profile' as TabId, icon: 'person-outline', label: 'Profile', screen: 'Profile' },
  ], []);

  // Ultra-fast tab press handler
  const handleTabPress = useCallback((tab: TabId, screen: string) => {
    // Immediate state update for instant visual feedback
    setCurrentActiveTab(tab);
    
    // Immediate navigation
    navigation?.navigate(screen);
    
    // Optional callback
    onTabPress?.(tab);
  }, [navigation, onTabPress]);

  // Create press handlers for each tab (memoized)
  const tabPressHandlers = useMemo(() => 
    tabs.reduce((handlers, tab) => {
      handlers[tab.id] = () => handleTabPress(tab.id, tab.screen);
      return handlers;
    }, {} as Record<TabId, () => void>)
  , [tabs, handleTabPress]);

  return (
    <View style={styles.wrapper}>
      <View style={styles.navContainer}>
        {tabs.map((tab) => (
          <TabButton
            key={tab.id}
            tab={tab}
            isActive={tab.id === currentActiveTab}
            onPress={tabPressHandlers[tab.id]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    pointerEvents: 'box-none',
  },
  navContainer: {
    width: width,
    backgroundColor: '#7c3aed',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    // shadow (iOS)
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    // elevation (Android)
    elevation: 10,
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  activeTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  activeLabel: {
    color: '#7c3aed',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  bottomIndicatorContainer: {
    marginTop: 8,
    width: width,
    alignItems: 'center',
  },
  bottomIndicator: {
    width: 84,
    height: 6,
    backgroundColor: '#d6d3df',
    borderRadius: 4,
  },
});

export default memo(BottomNavigation);

