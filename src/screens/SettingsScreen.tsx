import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Switch, 
  Alert
} from 'react-native';
import { LinearGradient } from '../components/WebLinearGradient';
import { WhiteCard } from '../components/GlassCard';
import BottomNavigation from '../components/BottomNavigation';
import { colors, fonts, spacing, borderRadius } from '../utils/theme';
import { useApp } from '../context/AppContext';
import { showToast } from '../utils/toast';

interface SettingsScreenProps {
  navigation: any;
}

interface SettingSection {
  id: string;
  title: string;
  titleTamil: string;
  icon: string;
  items: SettingItem[];
}

interface SettingItem {
  id: string;
  title: string;
  titleTamil: string;
  description?: string;
  descriptionTamil?: string;
  type: 'switch' | 'select' | 'slider' | 'button' | 'info';
  value?: any;
  options?: { label: string; labelTamil: string; value: any }[];
  onPress?: () => void;
  onChange?: (value: any) => void;
  min?: number;
  max?: number;
  step?: number;
}

export default function SettingsScreen({ navigation }: SettingsScreenProps) {
  const { language, setLanguage, theme, setTheme, user } = useApp();
  
  // Local settings state
  const [notifications, setNotifications] = useState(true);
  const [locationTracking, setLocationTracking] = useState(true);
  const [autoBackup, setAutoBackup] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibration, setVibration] = useState(true);
  const [walkReminders, setWalkReminders] = useState(true);
  const [fontSize, setFontSize] = useState(16);
  const [privacyMode, setPrivacyMode] = useState(false);

  const settingSections: SettingSection[] = [
    {
      id: 'general',
      title: 'General',
      titleTamil: 'பொதுவான',
      icon: '⚙️',
      items: [
        {
          id: 'language',
          title: 'Language',
          titleTamil: 'மொழி',
          description: 'Choose your preferred language',
          descriptionTamil: 'உங்கள் விருப்பமான மொழியைத் தேர்வுசெய்யவும்',
          type: 'select',
          value: language,
          options: [
            { label: 'English', labelTamil: 'ஆங்கிலம்', value: 'english' },
            { label: 'தமிழ்', labelTamil: 'தமிழ்', value: 'tamil' },
          ],
          onChange: (value) => {
            setLanguage(value);
            showToast.success(
              value === 'tamil' ? 'மொழி மாற்றப்பட்டது' : 'Language changed'
            );
          },
        },
        {
          id: 'theme',
          title: 'Dark Mode',
          titleTamil: 'இருள் முறை',
          description: 'Switch between light and dark themes',
          descriptionTamil: 'வெளிச்சம் மற்றும் இருள் தீம்களுக்கு இடையில் மாறவும்',
          type: 'switch',
          value: theme === 'dark',
          onChange: (value) => {
            setTheme(value ? 'dark' : 'light');
            showToast.success(
              language === 'tamil' 
                ? (value ? 'இருள் முறை இயக்கப்பட்டது' : 'வெளிச்ச முறை இயக்கப்பட்டது')
                : (value ? 'Dark mode enabled' : 'Light mode enabled')
            );
          },
        },
        {
          id: 'fontSize',
          title: 'Font Size',
          titleTamil: 'எழுத்து அளவு',
          description: 'Adjust text size for better readability',
          descriptionTamil: 'சிறந்த படிப்புக்காக எழுத்து அளவை சரிசெய்யவும்',
          type: 'slider',
          value: fontSize,
          min: 12,
          max: 24,
          step: 1,
          onChange: setFontSize,
        },
      ],
    },
    {
      id: 'notifications',
      title: 'Notifications',
      titleTamil: 'அறிவிப்புகள்',
      icon: '🔔',
      items: [
        {
          id: 'notifications',
          title: 'Push Notifications',
          titleTamil: 'புஷ் அறிவிப்புகள்',
          description: 'Receive app notifications',
          descriptionTamil: 'ஆப் அறிவிப்புகளைப் பெறுங்கள்',
          type: 'switch',
          value: notifications,
          onChange: setNotifications,
        },
        {
          id: 'walkReminders',
          title: 'Walk Reminders',
          titleTamil: 'நடைப்பயண நினைவூட்டல்கள்',
          description: 'Daily reminders for pilgrimage walks',
          descriptionTamil: 'யாத்திரை நடைகளுக்கான தினசரி நினைவூட்டல்கள்',
          type: 'switch',
          value: walkReminders,
          onChange: setWalkReminders,
        },
        {
          id: 'sound',
          title: 'Sound',
          titleTamil: 'ஒலி',
          description: 'Play sounds for notifications',
          descriptionTamil: 'அறிவிப்புகளுக்கான ஒலிகளை இயக்கவும்',
          type: 'switch',
          value: soundEnabled,
          onChange: setSoundEnabled,
        },
        {
          id: 'vibration',
          title: 'Vibration',
          titleTamil: 'அதிர்வு',
          description: 'Vibrate for notifications',
          descriptionTamil: 'அறிவிப்புகளுக்கான அதிர்வு',
          type: 'switch',
          value: vibration,
          onChange: setVibration,
        },
      ],
    },
    {
      id: 'privacy',
      title: 'Privacy & Security',
      titleTamil: 'தனியுரிமை மற்றும் பாதுகாப்பு',
      icon: '🔐',
      items: [
        {
          id: 'locationTracking',
          title: 'Location Tracking',
          titleTamil: 'இருப்பிட கண்காணிப்பு',
          description: 'Allow location tracking for walks',
          descriptionTamil: 'நடைகளுக்கான இருப்பிட கண்காணிப்பை அனுமதிக்கவும்',
          type: 'switch',
          value: locationTracking,
          onChange: setLocationTracking,
        },
        {
          id: 'privacyMode',
          title: 'Privacy Mode',
          titleTamil: 'தனியுரிமை முறை',
          description: 'Hide personal information in public views',
          descriptionTamil: 'பொது காட்சிகளில் தனிப்பட்ட தகவல்களை மறைக்கவும்',
          type: 'switch',
          value: privacyMode,
          onChange: setPrivacyMode,
        },
        {
          id: 'dataManagement',
          title: 'Data Management',
          titleTamil: 'தரவு மேலாண்மை',
          description: 'Manage your personal data',
          descriptionTamil: 'உங்கள் தனிப்பட்ட தரவை நிர்வகிக்கவும்',
          type: 'button',
          onPress: () => {
            Alert.alert(
              language === 'tamil' ? 'தரவு மேலாண்மை' : 'Data Management',
              language === 'tamil' 
                ? 'உங்கள் தரவை ஏற்றுமதி செய்ய, அழிக்க அல்லது பதிவிறக்க உங்களுக்கு உரிமை உண்டு.'
                : 'You have the right to export, delete, or download your data.',
              [
                { text: language === 'tamil' ? 'சரி' : 'OK' }
              ]
            );
          },
        },
      ],
    },
    {
      id: 'data',
      title: 'Data & Storage',
      titleTamil: 'தரவு மற்றும் சேமிப்பு',
      icon: '💾',
      items: [
        {
          id: 'autoBackup',
          title: 'Auto Backup',
          titleTamil: 'தானியங்கி காப்பு',
          description: 'Automatically backup your progress',
          descriptionTamil: 'உங்கள் முன்னேற்றத்தை தானாகவே காப்பு செய்யவும்',
          type: 'switch',
          value: autoBackup,
          onChange: setAutoBackup,
        },
        {
          id: 'clearCache',
          title: 'Clear Cache',
          titleTamil: 'தற்காலிக சேமிப்பை அழிக்கவும்',
          description: 'Clear temporary files to free up space',
          descriptionTamil: 'இடத்தை விடுவிக்க தற்காலிக கோப்புகளை அழிக்கவும்',
          type: 'button',
          onPress: () => {
            Alert.alert(
              language === 'tamil' ? 'தற்காலிக சேமிப்பை அழிக்கவும்' : 'Clear Cache',
              language === 'tamil' 
                ? 'தற்காலிக கோப்புகளை அழிக்க விரும்புகிறீர்களா?'
                : 'Are you sure you want to clear temporary files?',
              [
                { text: language === 'tamil' ? 'ரத்து' : 'Cancel', style: 'cancel' },
                { 
                  text: language === 'tamil' ? 'அழிக்கவும்' : 'Clear',
                  onPress: () => {
                    showToast.success(
                      language === 'tamil' 
                        ? 'தற்காலிக சேமிப்பு அழிக்கப்பட்டது'
                        : 'Cache cleared successfully'
                    );
                  }
                },
              ]
            );
          },
        },
        {
          id: 'exportData',
          title: 'Export Data',
          titleTamil: 'தரவு ஏற்றுமதி',
          description: 'Download your data in JSON format',
          descriptionTamil: 'உங்கள் தரவை JSON வடிவத்தில் பதிவிறக்கவும்',
          type: 'button',
          onPress: () => {
            showToast.info(
              language === 'tamil' 
                ? 'தரவு ஏற்றுமதி விரைவில் வரும்'
                : 'Data export coming soon'
            );
          },
        },
      ],
    },
    {
      id: 'account',
      title: 'Account',
      titleTamil: 'கணக்கு',
      icon: '👤',
      items: [
        {
          id: 'editProfile',
          title: 'Edit Profile',
          titleTamil: 'சுயவிவரத்தைத் திருத்தவும்',
          description: 'Update your personal information',
          descriptionTamil: 'உங்கள் தனிப்பட்ட தகவல்களை புதுப்பிக்கவும்',
          type: 'button',
          onPress: () => {
            navigation.navigate('ProfileSetup');
          },
        },
        {
          id: 'changePassword',
          title: 'Change Password',
          titleTamil: 'கடவுச்சொல்லை மாற்றவும்',
          description: 'Update your account password',
          descriptionTamil: 'உங்கள் கணக்கு கடவுச்சொல்லை புதுப்பிக்கவும்',
          type: 'button',
          onPress: () => {
            Alert.alert(
              language === 'tamil' ? 'கடவுச்சொல் மாற்றம்' : 'Change Password',
              language === 'tamil' 
                ? 'இந்த அம்சம் விரைவில் கிடைக்கும்!'
                : 'This feature will be available soon!',
              [{ text: language === 'tamil' ? 'சரி' : 'OK' }]
            );
          },
        },
        {
          id: 'deleteAccount',
          title: 'Delete Account',
          titleTamil: 'கணக்கை அழிக்கவும்',
          description: 'Permanently delete your account',
          descriptionTamil: 'உங்கள் கணக்கை நிரந்தரமாக அழிக்கவும்',
          type: 'button',
          onPress: () => {
            Alert.alert(
              language === 'tamil' ? 'கணக்கை அழிக்கவும்' : 'Delete Account',
              language === 'tamil' 
                ? 'உங்கள் கணக்கை நிரந்தரமாக அழிக்க விரும்புகிறீர்களா? இது மாற்ற முடியாதது.'
                : 'Are you sure you want to permanently delete your account? This cannot be undone.',
              [
                { text: language === 'tamil' ? 'ரத்து' : 'Cancel', style: 'cancel' },
                { 
                  text: language === 'tamil' ? 'அழிக்கவும்' : 'Delete',
                  style: 'destructive',
                  onPress: () => {
                    showToast.error(
                      language === 'tamil' 
                        ? 'கணக்கு அழிப்பு விரைவில் வரும்'
                        : 'Account deletion coming soon'
                    );
                  }
                },
              ]
            );
          },
        },
      ],
    },
  ];

  const renderSettingItem = (item: SettingItem) => {
    const title = language === 'tamil' ? item.titleTamil : item.title;
    const description = language === 'tamil' ? item.descriptionTamil : item.description;

    switch (item.type) {
      case 'switch':
        return (
          <View key={item.id} style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Text style={styles.settingTitle}>{title}</Text>
              {description && (
                <Text style={styles.settingDescription}>{description}</Text>
              )}
            </View>
            <Switch
              value={item.value}
              onValueChange={item.onChange}
              trackColor={{ false: colors.gray.light, true: colors.primary.start }}
              thumbColor={item.value ? colors.white : colors.gray.medium}
            />
          </View>
        );

      case 'select':
        return (
          <TouchableOpacity key={item.id} style={styles.settingItem} onPress={() => {
            Alert.alert(
              title,
              language === 'tamil' ? 'विकल्प चुनें' : 'Choose an option',
              item.options?.map(option => ({
                text: language === 'tamil' ? option.labelTamil : option.label,
                onPress: () => item.onChange?.(option.value),
              })) || []
            );
          }}>
            <View style={styles.settingLeft}>
              <Text style={styles.settingTitle}>{title}</Text>
              {description && (
                <Text style={styles.settingDescription}>{description}</Text>
              )}
            </View>
            <View style={styles.settingRight}>
              <Text style={styles.settingValue}>
                {item.options?.find(opt => opt.value === item.value)?.[language === 'tamil' ? 'labelTamil' : 'label'] || item.value}
              </Text>
              <Text style={styles.settingArrow}>→</Text>
            </View>
          </TouchableOpacity>
        );

      case 'slider':
        return (
          <View key={item.id} style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Text style={styles.settingTitle}>{title}</Text>
              {description && (
                <Text style={styles.settingDescription}>{description}</Text>
              )}
            </View>
            <View style={styles.sliderContainer}>
              <Text style={styles.sliderValue}>{item.value}</Text>
              <TouchableOpacity
                style={styles.slider}
                onPress={() => {
                  const newValue = item.value === item.max ? item.min || 0 : (item.value || 0) + (item.step || 1);
                  item.onChange?.(newValue);
                }}
              >
                <View style={{
                  height: 4,
                  backgroundColor: colors.gray.light,
                  borderRadius: 2,
                }}>
                  <View style={{
                    height: 4,
                    width: `${((item.value || 0) / (item.max || 100)) * 100}%`,
                    backgroundColor: colors.primary.start,
                    borderRadius: 2,
                  }} />
                </View>
              </TouchableOpacity>
            </View>
          </View>
        );

      case 'button':
        return (
          <TouchableOpacity key={item.id} style={styles.settingItem} onPress={item.onPress}>
            <View style={styles.settingLeft}>
              <Text style={styles.settingTitle}>{title}</Text>
              {description && (
                <Text style={styles.settingDescription}>{description}</Text>
              )}
            </View>
            <Text style={styles.settingArrow}>→</Text>
          </TouchableOpacity>
        );

      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={[colors.primary.start, colors.primary.end]} style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        
        <Text style={styles.headerText}>
          {language === 'tamil' ? 'அமைப்புகள்' : 'Settings'}
        </Text>
      </LinearGradient>

      <ScrollView style={styles.content}>
        {settingSections.map((section) => (
          <View key={section.id} style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionIcon}>{section.icon}</Text>
              <Text style={styles.sectionTitle}>
                {language === 'tamil' ? section.titleTamil : section.title}
              </Text>
            </View>
            
            <WhiteCard style={styles.card}>
              {section.items.map((item, index) => (
                <View key={item.id}>
                  {renderSettingItem(item)}
                  {index < section.items.length - 1 && (
                    <View style={styles.itemDivider} />
                  )}
                </View>
              ))}
            </WhiteCard>
          </View>
        ))}

        {/* App Version */}
        <View style={styles.section}>
          <WhiteCard style={styles.card}>
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Text style={styles.settingTitle}>
                  {language === 'tamil' ? 'ஆப் பதிப்பு' : 'App Version'}
                </Text>
                <Text style={styles.settingDescription}>
                  Palani Pathayathirai
                </Text>
              </View>
              <Text style={styles.settingValue}>1.0.0</Text>
            </View>
          </WhiteCard>
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
    backgroundColor: colors.gray.light 
  },
  header: { 
    paddingTop: 50, 
    paddingHorizontal: spacing.lg, 
    paddingBottom: spacing.lg,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: spacing.lg,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  backButtonText: {
    fontSize: 20,
    color: colors.white,
    fontWeight: fonts.weights.bold,
  },
  headerText: { 
    fontSize: fonts.sizes.xxl, 
    fontWeight: fonts.weights.bold, 
    color: colors.white, 
    textAlign: 'center',
    marginTop: spacing.md,
  },
  content: { 
    flex: 1, 
    paddingHorizontal: spacing.lg, 
    paddingVertical: spacing.lg 
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionIcon: {
    fontSize: 20,
    marginRight: spacing.sm,
  },
  sectionTitle: {
    fontSize: fonts.sizes.lg,
    fontWeight: fonts.weights.bold,
    color: colors.gray.dark,
  },
  card: { 
    paddingVertical: spacing.lg 
  },
  settingItem: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  settingLeft: {
    flex: 1,
    marginRight: spacing.md,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingTitle: { 
    fontSize: fonts.sizes.md, 
    fontWeight: fonts.weights.medium,
    color: colors.gray.dark,
    marginBottom: spacing.xs,
  },
  settingDescription: {
    fontSize: fonts.sizes.sm,
    color: colors.gray.medium,
    lineHeight: 18,
  },
  settingValue: { 
    fontSize: fonts.sizes.md, 
    color: colors.primary.start, 
    fontWeight: fonts.weights.medium,
    marginRight: spacing.sm,
  },
  settingArrow: {
    fontSize: 16,
    color: colors.gray.medium,
  },
  itemDivider: {
    height: 1,
    backgroundColor: colors.gray.light,
    marginHorizontal: spacing.md,
  },
  sliderContainer: {
    alignItems: 'center',
    minWidth: 120,
  },
  sliderValue: {
    fontSize: fonts.sizes.sm,
    color: colors.gray.dark,
    fontWeight: fonts.weights.medium,
    marginBottom: spacing.xs,
  },
  slider: {
    width: 100,
    height: 20,
  },
  bottomSpacer: {
    height: 100,
  },
});