
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { LinearGradient } from '../components/WebLinearGradient';
import { GradientButton } from '../components/GradientButton';
import { WhiteCard } from '../components/GlassCard';
import BottomNavigation from '../components/BottomNavigation';
import { colors, fonts, spacing, borderRadius } from '../utils/theme';
import { useApp } from '../context/AppContext';
import { showToast } from '../utils/toast';

interface ProfileScreenProps {
  navigation: any;
}

export default function ProfileScreen({ navigation }: ProfileScreenProps) {
  const { user, language, logout } = useApp();
  const [userStats] = useState({
    totalWalks: 12,
    totalDistance: 85.5,
    totalTime: 24,
    achievements: 5,
  });

  const handleEditProfile = () => {
    // Navigate to edit profile screen
    Alert.alert('Coming Soon', 'Profile editing feature will be available soon!');
  };

  const handleLogout = () => {
    Alert.alert(
      language === 'tamil' ? 'வெளியேறு' : 'Logout',
      language === 'tamil' ? 'நீங்கள் நிச்சயமாக வெளியேற விரும்புகிறீர்களா?' : 'Are you sure you want to logout?',
      [
        { text: language === 'tamil' ? 'ரத்து' : 'Cancel', style: 'cancel' },
        { 
          text: language === 'tamil' ? 'வெளியேறு' : 'Logout', 
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              console.log('✅ Logout successful, navigating to login screen...');
              
              showToast.success(
                language === 'tamil' ? 'வெற்றிகரமாக வெளியேறினீர்கள்' : 'Logged out successfully'
              );
              
              // Navigate back to login screen after a short delay
              setTimeout(() => {
                navigation.navigate('login');
              }, 500);
            } catch (error) {
              console.error('❌ Logout error:', error);
              showToast.error(
                language === 'tamil' ? 'வெளியேற முடியவில்லை' : 'Error logging out'
              );
            }
          }
        },
      ]
    );
  };

  const profileOptions = [
    {
      id: 'achievements',
      title: language === 'tamil' ? 'சாதனைகள்' : 'Achievements',
      icon: '🏆',
      onPress: () => navigation.navigate('Achievements'),
    },
    {
      id: 'preferences',
      title: language === 'tamil' ? 'அமைப்புகள்' : 'Settings',
      icon: '⚙️',
      onPress: () => navigation.navigate('Settings'),
    },
    {
      id: 'help',
      title: language === 'tamil' ? 'உதவி மற்றும் ஆதரவு' : 'Help & Support',
      icon: '❓',
      onPress: () => navigation.navigate('HelpSupport'),
    },
    {
      id: 'about',
      title: language === 'tamil' ? 'ஆப் பற்றி' : 'About App',
      icon: 'ℹ️',
      onPress: () => navigation.navigate('About'),
    },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[colors.primary.start, colors.primary.end]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.profileSection}>
            <TouchableOpacity style={styles.profileImageContainer}>
              {user?.profilePicture ? (
                <Image source={{ uri: user.profilePicture }} style={styles.profileImage} />
              ) : (
                <View style={styles.profilePlaceholder}>
                  <Text style={styles.profilePlaceholderText}>
                    {user?.name?.charAt(0)?.toUpperCase() || '👤'}
                  </Text>
                </View>
              )}
              <View style={styles.editIconContainer}>
                <TouchableOpacity style={styles.editIcon} onPress={handleEditProfile}>
                  <Text style={styles.editIconText}>✏️</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
            
            <Text style={styles.userName}>{user?.name || 'Devotee'}</Text>
            <Text style={styles.userEmail}>{user?.email || ''}</Text>
            
            {user?.phone && (
              <Text style={styles.userPhone}>📱 {user.phone}</Text>
            )}
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content}>
        {/* Stats Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {language === 'tamil' ? 'உங்கள் பயண புள்ளிவிவரங்கள்' : 'Your Journey Stats'}
          </Text>
          
          <View style={styles.statsGrid}>
            <WhiteCard style={styles.statCard}>
              <Text style={styles.statNumber}>{userStats.totalWalks}</Text>
              <Text style={styles.statLabel}>
                {language === 'tamil' ? 'நடைகள்' : 'Walks'}
              </Text>
            </WhiteCard>
            
            <WhiteCard style={styles.statCard}>
              <Text style={styles.statNumber}>{userStats.totalDistance}</Text>
              <Text style={styles.statLabel}>
                {language === 'tamil' ? 'கிமீ' : 'KM'}
              </Text>
            </WhiteCard>
            
            <WhiteCard style={styles.statCard}>
              <Text style={styles.statNumber}>{userStats.totalTime}</Text>
              <Text style={styles.statLabel}>
                {language === 'tamil' ? 'மணிநேரங்கள்' : 'Hours'}
              </Text>
            </WhiteCard>
            
            <WhiteCard style={styles.statCard}>
              <Text style={styles.statNumber}>{userStats.achievements}</Text>
              <Text style={styles.statLabel}>
                {language === 'tamil' ? 'பேட்ஜ்கள்' : 'Badges'}
              </Text>
            </WhiteCard>
          </View>
        </View>

        {/* Profile Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {language === 'tamil' ? 'சுயவிவர விருப्पങ्கள्' : 'Profile Options'}
          </Text>
          
          {profileOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={styles.optionItem}
              onPress={option.onPress}
            >
              <WhiteCard style={styles.optionCard}>
                <View style={styles.optionContent}>
                  <View style={styles.optionLeft}>
                    <Text style={styles.optionIcon}>{option.icon}</Text>
                    <Text style={styles.optionTitle}>{option.title}</Text>
                  </View>
                  <Text style={styles.optionArrow}>→</Text>
                </View>
              </WhiteCard>
            </TouchableOpacity>
          ))}
        </View>

        {/* Personal Information */}
        {(user?.age || user?.gender || user?.emergencyContact) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {language === 'tamil' ? 'தனிப்பட்ட தகவல்கள்' : 'Personal Information'}
            </Text>
            
            <WhiteCard style={styles.infoCard}>
              {user.age && (
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>
                    {language === 'tamil' ? 'வயது' : 'Age'}:
                  </Text>
                  <Text style={styles.infoValue}>{user.age} years</Text>
                </View>
              )}
              
              {user.gender && (
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>
                    {language === 'tamil' ? 'பாலினம்' : 'Gender'}:
                  </Text>
                  <Text style={styles.infoValue}>
                    {user.gender.charAt(0).toUpperCase() + user.gender.slice(1)}
                  </Text>
                </View>
              )}
              
              {user.emergencyContact && (
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>
                    {language === 'tamil' ? 'அவசர தொடர்பு' : 'Emergency Contact'}:
                  </Text>
                  <Text style={styles.infoValue}>{user.emergencyContact}</Text>
                </View>
              )}
            </WhiteCard>
          </View>
        )}

        {/* Logout Button with extra bottom padding */}
        <View style={styles.logoutSection}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutText}>
              {language === 'tamil' ? 'வெளியேறு' : 'Logout'}
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* Extra spacer for bottom navigation */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
      
      <BottomNavigation navigation={navigation} activeTab="profile" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray.light,
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  headerContent: {
    alignItems: 'center',
  },
  profileSection: {
    alignItems: 'center',
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: spacing.md,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: colors.white,
  },
  profilePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.white,
  },
  profilePlaceholderText: {
    fontSize: 40,
    color: colors.white,
    fontWeight: fonts.weights.bold,
  },
  editIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
  },
  editIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editIconText: {
    fontSize: 12,
  },
  userName: {
    fontSize: fonts.sizes.xxl,
    fontWeight: fonts.weights.bold,
    color: colors.white,
    marginBottom: spacing.xs,
  },
  userEmail: {
    fontSize: fonts.sizes.md,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: spacing.xs,
  },
  userPhone: {
    fontSize: fonts.sizes.sm,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  content: {
    flex: 1,
  },
  section: {
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  sectionTitle: {
    fontSize: fonts.sizes.lg,
    fontWeight: fonts.weights.bold,
    color: colors.gray.dark,
    marginBottom: spacing.lg,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    marginBottom: spacing.md,
  },
  statNumber: {
    fontSize: fonts.sizes.xxl,
    fontWeight: fonts.weights.bold,
    color: colors.primary.start,
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: fonts.sizes.sm,
    color: colors.gray.medium,
    fontWeight: fonts.weights.medium,
  },
  optionItem: {
    marginBottom: spacing.sm,
  },
  optionCard: {
    paddingVertical: spacing.md,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionIcon: {
    fontSize: 20,
    marginRight: spacing.md,
  },
  optionTitle: {
    fontSize: fonts.sizes.md,
    color: colors.gray.dark,
    fontWeight: fonts.weights.medium,
  },
  optionArrow: {
    fontSize: 16,
    color: colors.gray.medium,
  },
  infoCard: {
    paddingVertical: spacing.lg,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  infoLabel: {
    fontSize: fonts.sizes.md,
    color: colors.gray.medium,
    fontWeight: fonts.weights.medium,
  },
  infoValue: {
    fontSize: fonts.sizes.md,
    color: colors.gray.dark,
    fontWeight: fonts.weights.medium,
  },
  logoutSection: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  logoutButton: {
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.danger,
    alignItems: 'center',
  },
  logoutText: {
    fontSize: fonts.sizes.md,
    color: colors.danger,
    fontWeight: fonts.weights.semibold,
  },
  bottomSpacer: {
    height: 100,
  },
});