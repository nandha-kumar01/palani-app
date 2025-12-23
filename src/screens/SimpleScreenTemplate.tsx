import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from '../components/WebLinearGradient';
import BottomNavigation from '../components/BottomNavigation';
import { colors, fonts, spacing } from '../utils/theme';

interface SimpleScreenProps {
  navigation: any;
  screenName: string;
  icon?: string;
  description?: string;
  activeTab?: string;
}

export default function SimpleScreenTemplate({ 
  navigation, 
  screenName, 
  icon = '📱',
  description = 'This screen is under development',
  activeTab = ''
}: SimpleScreenProps) {
  // Determine the correct active tab based on screen name
  const getActiveTab = () => {
    switch (screenName) {
      case 'Live Tracking':
        return 'track';
      case 'Group Walk':
        return 'group';
      case 'Profile':
        return 'profile';
      default:
        return 'home';
    }
  };
  
  const currentActiveTab = activeTab || getActiveTab();
  
  return (
    <View style={styles.container}>
      {/* Debug indicator */}
      <View style={styles.debugIndicator}>
        <Text style={styles.debugText}>{screenName.toUpperCase()} ✅</Text>
      </View>
      
      <LinearGradient
        colors={[colors.primary.start, colors.primary.end]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => {
              console.log(`Going back from ${screenName}`);
              navigation.goBack();
            }}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{screenName}</Text>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        <View style={styles.centerContent}>
          <Text style={styles.icon}>{icon}</Text>
          <Text style={styles.screenTitle}>{screenName}</Text>
          <Text style={styles.description}>{description}</Text>
          
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              ✅ Screen loaded successfully{'\n'}
              🔗 Navigation working{'\n'}
              📱 Ready for development
            </Text>
          </View>

          <TouchableOpacity 
            style={styles.testButton}
            onPress={() => {
              console.log(`${screenName} test button pressed`);
              alert(`${screenName} is working! 🎉`);
            }}
          >
            <Text style={styles.testButtonText}>Test Screen</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Universal Bottom Navigation */}
      <BottomNavigation navigation={navigation} activeTab={currentActiveTab as any} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray.light,
  },
  debugIndicator: {
    position: 'absolute',
    top: 40,
    right: 10,
    zIndex: 1000,
    backgroundColor: 'green',
    padding: 5,
    borderRadius: 3,
  },
  debugText: {
    color: 'white',
    fontSize: 8,
    fontWeight: 'bold',
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: spacing.md,
    padding: spacing.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
  },
  backButtonText: {
    color: 'white',
    fontSize: fonts.sizes.md,
    fontWeight: fonts.weights.semibold,
  },
  headerTitle: {
    flex: 1,
    fontSize: fonts.sizes.xl,
    fontWeight: fonts.weights.bold,
    color: 'white',
    textAlign: 'center',
    marginRight: 50, // Balance the back button
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    paddingBottom: 110, // Account for bottom navigation
  },
  centerContent: {
    alignItems: 'center',
    backgroundColor: 'white',
    padding: spacing.xl,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    maxWidth: 300,
    width: '100%',
  },
  icon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  screenTitle: {
    fontSize: fonts.sizes.xxl,
    fontWeight: fonts.weights.bold,
    color: colors.gray.dark,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  description: {
    fontSize: fonts.sizes.md,
    color: colors.gray.medium,
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  infoBox: {
    backgroundColor: colors.gray.light,
    padding: spacing.md,
    borderRadius: 10,
    marginBottom: spacing.lg,
    width: '100%',
  },
  infoText: {
    fontSize: fonts.sizes.sm,
    color: colors.gray.dark,
    textAlign: 'center',
    lineHeight: 18,
  },
  testButton: {
    backgroundColor: colors.primary.start,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 10,
    width: '100%',
  },
  testButtonText: {
    color: 'white',
    fontSize: fonts.sizes.md,
    fontWeight: fonts.weights.semibold,
    textAlign: 'center',
  },
});