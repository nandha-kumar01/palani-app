import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Image,
  Dimensions,
  Linking,
  Platform
} from 'react-native';
import { LinearGradient } from '../components/WebLinearGradient';
import { WhiteCard } from '../components/GlassCard';
import { colors, fonts, spacing, shadows, borderRadius } from '../utils/theme';

const { width, height } = Dimensions.get('window');

interface Annadhanam {
  _id: string;
  name: string;
  description: string;
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  timings: Array<{
    day: string;
    startTime: string;
    endTime: string;
    isAvailable: boolean;
  }>;
  foodType: string;
  capacity: number;
  currentAvailability: boolean;
  images: string[];
  isActive: boolean;
  organizer: {
    name: string;
    contact: string;
  };
  specialInstructions?: string;
  createdAt: string;
  updatedAt: string;
}

interface AnnadhanamDetailScreenProps {
  navigation: any;
  route: {
    params: {
      annadhanam: Annadhanam;
    };
  };
}

export default function AnnadhanamDetailScreen({ navigation, route }: AnnadhanamDetailScreenProps) {
  const { annadhanam } = route.params;

  const handleCall = () => {
    if (annadhanam.organizer?.contact) {
      const phoneNumber = Platform.OS === 'ios' 
        ? `telprompt:${annadhanam.organizer.contact}` 
        : `tel:${annadhanam.organizer.contact}`;
      Linking.openURL(phoneNumber);
    }
  };

  const handleLocation = () => {
    const address = encodeURIComponent(annadhanam.location.address);
    const url = Platform.OS === 'ios'
      ? `maps:0,0?q=${address}`
      : `geo:0,0?q=${address}`;
    Linking.openURL(url);
  };

  // Check if currently open based on device time
  const getCurrentStatus = () => {
    const now = new Date();
    const currentDay = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][now.getDay()];
    const currentTime = now.getHours() * 60 + now.getMinutes(); // minutes since midnight
    
    const todayTiming = annadhanam.timings.find(t => t.day === currentDay);
    
    if (!todayTiming || !todayTiming.isAvailable) {
      return { isOpen: false, message: 'Closed Today' };
    }
    
    // Parse time strings (HH:MM format)
    const [startHour, startMin] = todayTiming.startTime.split(':').map(Number);
    const [endHour, endMin] = todayTiming.endTime.split(':').map(Number);
    
    const startTime = startHour * 60 + startMin;
    const endTime = endHour * 60 + endMin;
    
    if (currentTime >= startTime && currentTime <= endTime) {
      return { 
        isOpen: true, 
        message: `Open until ${todayTiming.endTime}`,
        timing: `${todayTiming.startTime} - ${todayTiming.endTime}`
      };
    } else if (currentTime < startTime) {
      return { 
        isOpen: false, 
        message: `Opens at ${todayTiming.startTime}`,
        timing: `${todayTiming.startTime} - ${todayTiming.endTime}`
      };
    } else {
      return { 
        isOpen: false, 
        message: 'Closed for today',
        timing: `${todayTiming.startTime} - ${todayTiming.endTime}`
      };
    }
  };

  const status = getCurrentStatus();
  const menuItemsCount = annadhanam.timings.filter(t => t.isAvailable).length;

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Hero Image Section - Larger & Clearer */}
        <View style={styles.heroSection}>
          {annadhanam.images && annadhanam.images.length > 0 ? (
            <Image 
              source={{ uri: annadhanam.images[0] }} 
              style={styles.heroImage}
              resizeMode="cover"
            />
          ) : (
            <LinearGradient 
              colors={[colors.primary.start, colors.primary.end]} 
              style={styles.heroImage}
            >
              <View style={styles.heroPlaceholder}>
                <Text style={styles.placeholderText}>🍛</Text>
              </View>
            </LinearGradient>
          )}
          
          {/* Subtle Dark Overlay for Better Text Readability */}
          <LinearGradient 
            colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.4)']} 
            style={styles.heroGradient}
          />

          {/* Back Button */}
          <TouchableOpacity 
            onPress={() => navigation.goBack()} 
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>

          {/* Active Badge on Image */}
          {annadhanam.isActive && (
            <View style={styles.activeImageBadge}>
              <View style={styles.activePulse} />
              <Text style={styles.activeImageText}>● ACTIVE NOW</Text>
            </View>
          )}
        </View>

        {/* Content Section */}
        <View style={styles.contentSection}>
          {/* Title & Status */}
          <View style={styles.titleSection}>
            <Text style={styles.title}>{annadhanam.name}</Text>
            {annadhanam.isActive && (
              <View style={styles.statusRow}>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>Currently Active</Text>
              </View>
            )}
          </View>

          {/* Quick Info Cards */}
          <View style={styles.quickInfoGrid}>
            <View style={styles.quickInfoCard}>
              <Text style={styles.quickInfoIcon}>👥</Text>
              <Text style={styles.quickInfoValue}>{annadhanam.capacity}</Text>
              <Text style={styles.quickInfoLabel}>Capacity</Text>
            </View>
            <View style={styles.quickInfoCard}>
              <Text style={styles.quickInfoIcon}>🍽️</Text>
              <Text style={styles.quickInfoValue}>{annadhanam.foodType}</Text>
              <Text style={styles.quickInfoLabel}>Food Type</Text>
            </View>
            <View style={styles.quickInfoCard}>
              <Text style={styles.quickInfoIcon}>�</Text>
              <Text style={styles.quickInfoValue}>{menuItemsCount}</Text>
              <Text style={styles.quickInfoLabel}>Days Open</Text>
            </View>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.description}>{annadhanam.description}</Text>
          </View>

          {/* Timings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Opening Hours</Text>
            <View style={styles.timingsContainer}>
              {annadhanam.timings.map((timing, index) => (
                <View key={index} style={styles.timingRow}>
                  <Text style={styles.dayText}>{timing.day.substring(0, 3)}</Text>
                  <View style={styles.timingDots} />
                  <Text style={[
                    styles.timeText, 
                    !timing.isAvailable && styles.closedText
                  ]}>
                    {timing.isAvailable ? `${timing.startTime} - ${timing.endTime}` : 'Closed'}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Organizer */}
          {annadhanam.organizer && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Organized By</Text>
              <View style={styles.organizerCard}>
                <View style={styles.organizerIcon}>
                  <Text style={styles.organizerIconText}>👤</Text>
                </View>
                <View style={styles.organizerInfo}>
                  <Text style={styles.organizerName}>{annadhanam.organizer.name}</Text>
                  <TouchableOpacity 
                    style={styles.contactButton}
                    onPress={handleCall}
                  >
                    <Text style={styles.contactIcon}>📞</Text>
                    <Text style={styles.contactText}>{annadhanam.organizer.contact}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}

          {/* Special Instructions */}
          {annadhanam.specialInstructions && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Important Information</Text>
              <View style={styles.instructionCard}>
                <Text style={styles.instructionIcon}>ℹ️</Text>
                <Text style={styles.instructionText}>{annadhanam.specialInstructions}</Text>
              </View>
            </View>
          )}

          {/* Location */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Location</Text>
            <View style={styles.locationCard}>
              <View style={styles.locationIconContainer}>
                <Text style={styles.locationIcon}>📍</Text>
              </View>
              <View style={styles.locationInfo}>
                <Text style={styles.locationAddress}>{annadhanam.location.address}</Text>
                <TouchableOpacity 
                  style={styles.directionsButton} 
                  onPress={handleLocation}
                >
                  <Text style={styles.directionsText}>Get Directions</Text>
                  <Text style={styles.directionsArrow}>→</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Bottom Spacing */}
          <View style={styles.bottomSpacing} />
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      {annadhanam.organizer?.contact && (
        <TouchableOpacity style={styles.floatingButton} onPress={handleCall}>
          <LinearGradient 
            colors={[colors.primary.start, colors.primary.end]} 
            style={styles.floatingGradient}
          >
            <Text style={styles.floatingIcon}>📞</Text>
            <Text style={styles.floatingText}>Call Now</Text>
          </LinearGradient>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scrollView: {
    flex: 1,
  },
  heroSection: {
    height: 380,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.gray.lighter,
  },
  heroPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 100,
  },
  heroGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 150,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: spacing.lg,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.dark,
  },
  backButtonText: {
    fontSize: 24,
    color: colors.gray.dark,
  },
  activeImageBadge: {
    position: 'absolute',
    top: 50,
    right: spacing.lg,
    backgroundColor: 'rgba(40, 167, 69, 0.95)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    ...shadows.dark,
  },
  activePulse: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.white,
  },
  activeImageText: {
    color: colors.white,
    fontSize: fonts.sizes.xs,
    fontWeight: fonts.weights.bold,
    letterSpacing: 0.5,
  },
  contentSection: {
    backgroundColor: colors.white,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    marginTop: -30,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },
  titleSection: {
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: fonts.sizes.xxl,
    fontWeight: fonts.weights.bold,
    color: colors.gray.dark,
    marginBottom: spacing.sm,
    lineHeight: 32,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.success,
  },
  statusText: {
    fontSize: fonts.sizes.sm,
    color: colors.success,
    fontWeight: fonts.weights.semibold,
  },
  quickInfoGrid: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  quickInfoCard: {
    flex: 1,
    backgroundColor: colors.gray.light,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.gray.lighter,
  },
  quickInfoIcon: {
    fontSize: 32,
    marginBottom: spacing.xs,
  },
  quickInfoValue: {
    fontSize: fonts.sizes.md,
    fontWeight: fonts.weights.bold,
    color: colors.gray.dark,
    marginBottom: 2,
    textAlign: 'center',
  },
  quickInfoLabel: {
    fontSize: fonts.sizes.xs,
    color: colors.gray.medium,
    textAlign: 'center',
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: fonts.sizes.lg,
    fontWeight: fonts.weights.bold,
    color: colors.gray.dark,
    marginBottom: spacing.md,
  },
  description: {
    fontSize: fonts.sizes.md,
    color: colors.gray.medium,
    lineHeight: 24,
  },
  timingsContainer: {
    backgroundColor: colors.gray.light,
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  timingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  dayText: {
    fontSize: fonts.sizes.sm,
    fontWeight: fonts.weights.semibold,
    color: colors.gray.dark,
    width: 40,
  },
  timingDots: {
    flex: 1,
    height: 1,
    backgroundColor: colors.gray.lighter,
    marginHorizontal: spacing.sm,
  },
  timeText: {
    fontSize: fonts.sizes.sm,
    color: colors.primary.main,
    fontWeight: fonts.weights.medium,
    minWidth: 100,
    textAlign: 'right',
  },
  closedText: {
    color: colors.gray.medium,
    fontStyle: 'italic',
  },
  organizerCard: {
    flexDirection: 'row',
    backgroundColor: colors.gray.light,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    gap: spacing.md,
  },
  organizerIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary.light + '30',
    justifyContent: 'center',
    alignItems: 'center',
  },
  organizerIconText: {
    fontSize: 24,
  },
  organizerInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  organizerName: {
    fontSize: fonts.sizes.md,
    fontWeight: fonts.weights.semibold,
    color: colors.gray.dark,
    marginBottom: spacing.xs,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  contactIcon: {
    fontSize: 14,
  },
  contactText: {
    fontSize: fonts.sizes.sm,
    color: colors.primary.main,
    fontWeight: fonts.weights.medium,
  },
  instructionCard: {
    flexDirection: 'row',
    backgroundColor: colors.warning + '15',
    borderLeftWidth: 4,
    borderLeftColor: colors.warning,
    borderRadius: borderRadius.sm,
    padding: spacing.md,
    gap: spacing.sm,
  },
  instructionIcon: {
    fontSize: 20,
  },
  instructionText: {
    flex: 1,
    fontSize: fonts.sizes.sm,
    color: colors.gray.dark,
    lineHeight: 22,
  },
  locationCard: {
    flexDirection: 'row',
    backgroundColor: colors.gray.light,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    gap: spacing.md,
  },
  locationIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.danger + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationIcon: {
    fontSize: 24,
  },
  locationInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  locationAddress: {
    fontSize: fonts.sizes.sm,
    color: colors.gray.dark,
    marginBottom: spacing.sm,
    lineHeight: 20,
  },
  directionsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  directionsText: {
    fontSize: fonts.sizes.sm,
    color: colors.primary.main,
    fontWeight: fonts.weights.semibold,
  },
  directionsArrow: {
    fontSize: fonts.sizes.md,
    color: colors.primary.main,
    fontWeight: fonts.weights.bold,
  },
  bottomSpacing: {
    height: 100,
  },
  floatingButton: {
    position: 'absolute',
    bottom: spacing.lg,
    left: spacing.lg,
    right: spacing.lg,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...shadows.dark,
  },
  floatingGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md + 2,
    gap: spacing.sm,
  },
  floatingIcon: {
    fontSize: 20,
  },
  floatingText: {
    fontSize: fonts.sizes.lg,
    color: colors.white,
    fontWeight: fonts.weights.bold,
  },
});
