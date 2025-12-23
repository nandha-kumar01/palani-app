import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Image,
  Linking,
  Platform
} from 'react-native';
import { LinearGradient } from '../components/WebLinearGradient';
import { colors, fonts, spacing, shadows, borderRadius } from '../utils/theme';

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
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const todayTiming = annadhanam.timings.find(t => t.day === currentDay);
    
    if (!todayTiming || !todayTiming.isAvailable) {
      return { isOpen: false, message: 'Closed Today' };
    }
    
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
      {/* Fixed Header */}
      <LinearGradient 
        colors={[colors.primary.start, colors.primary.end]} 
        style={styles.header}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBackButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Details</Text>
        <View style={styles.headerSpacer} />
      </LinearGradient>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Large Image Card */}
        <View style={styles.imageCard}>
          {annadhanam.images && annadhanam.images.length > 0 ? (
            <Image 
              source={{ uri: annadhanam.images[0] }} 
              style={styles.mainImage}
              resizeMode="cover"
            />
          ) : (
            <LinearGradient 
              colors={[colors.primary.start, colors.primary.end]} 
              style={styles.mainImage}
            >
              <Text style={styles.imagePlaceholder}>🍛</Text>
            </LinearGradient>
          )}
        </View>

        {/* Main Content */}
        <View style={styles.content}>
          {/* Title */}
          <Text style={styles.title}>{annadhanam.name}</Text>
          
          {/* Live Status Card */}
          <View style={[styles.statusCard, status.isOpen ? styles.openCard : styles.closedCard]}>
            <View style={styles.statusRow}>
              <View style={[styles.statusDot, status.isOpen ? styles.openDot : styles.closedDot]} />
              <View style={styles.statusTextContainer}>
                <Text style={[styles.statusLabel, status.isOpen ? styles.openText : styles.closedText]}>
                  {status.isOpen ? 'OPEN NOW' : 'CLOSED'}
                </Text>
                <Text style={styles.statusMessage}>{status.message}</Text>
              </View>
            </View>
            {status.timing && (
              <Text style={styles.todayTiming}>Today: {status.timing}</Text>
            )}
          </View>

          {/* Quick Info Grid */}
          <View style={styles.infoGrid}>
            <View style={styles.infoBox}>
              <Text style={styles.infoIcon}>👥</Text>
              <Text style={styles.infoValue}>{annadhanam.capacity}</Text>
              <Text style={styles.infoLabel}>Seats</Text>
            </View>
            <View style={styles.infoBox}>
              <Text style={styles.infoIcon}>🍽️</Text>
              <Text style={styles.infoValue}>{annadhanam.foodType}</Text>
              <Text style={styles.infoLabel}>Type</Text>
            </View>
            <View style={styles.infoBox}>
              <Text style={styles.infoIcon}>📅</Text>
              <Text style={styles.infoValue}>{menuItemsCount}/7</Text>
              <Text style={styles.infoLabel}>Days</Text>
            </View>
          </View>

          {/* About */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.description}>{annadhanam.description}</Text>
          </View>

          {/* Weekly Schedule */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Weekly Schedule</Text>
            <View style={styles.scheduleCard}>
              {annadhanam.timings.map((timing, index) => {
                const now = new Date();
                const currentDay = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][now.getDay()];
                const isToday = timing.day === currentDay;
                
                return (
                  <View 
                    key={index} 
                    style={[
                      styles.scheduleRow, 
                      isToday && styles.todayRow,
                      index === annadhanam.timings.length - 1 && styles.lastRow
                    ]}
                  >
                    <View style={styles.dayColumn}>
                      <Text style={[styles.dayName, isToday && styles.todayText]}>
                        {timing.day.substring(0, 3)}
                      </Text>
                      {isToday && <View style={styles.todayIndicator} />}
                    </View>
                    <Text style={[styles.scheduleTime, !timing.isAvailable && styles.closedSchedule]}>
                      {timing.isAvailable ? `${timing.startTime} - ${timing.endTime}` : 'Closed'}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Organizer */}
          {annadhanam.organizer && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Contact</Text>
              <TouchableOpacity style={styles.contactCard} onPress={handleCall}>
                <View style={styles.contactLeft}>
                  <View style={styles.contactIcon}>
                    <Text style={styles.contactEmoji}>👤</Text>
                  </View>
                  <View>
                    <Text style={styles.contactName}>{annadhanam.organizer.name}</Text>
                    <Text style={styles.contactPhone}>📞 {annadhanam.organizer.contact}</Text>
                  </View>
                </View>
                <Text style={styles.contactArrow}>→</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Special Instructions */}
          {annadhanam.specialInstructions && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Important Note</Text>
              <View style={styles.noteCard}>
                <Text style={styles.noteIcon}>ℹ️</Text>
                <Text style={styles.noteText}>{annadhanam.specialInstructions}</Text>
              </View>
            </View>
          )}

          {/* Location */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Location</Text>
            <View style={styles.locationCard}>
              <Text style={styles.locationAddress}>{annadhanam.location.address}</Text>
              <TouchableOpacity style={styles.mapButton} onPress={handleLocation}>
                <Text style={styles.mapIcon}>📍</Text>
                <Text style={styles.mapText}>Open in Maps</Text>
              </TouchableOpacity>
              
              {/* Call Button - Inside Location Card */}
              {annadhanam.organizer?.contact && (
                <View style={styles.buttonSpacing}>
                  <TouchableOpacity style={styles.callButton} onPress={handleCall}>
                    <Text style={styles.callIcon}>📞</Text>
                    <Text style={styles.callText}>Call Now</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>

          <View style={styles.bottomSpace} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray.light,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  headerBackButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 24,
    color: colors.white,
  },
  headerTitle: {
    flex: 1,
    fontSize: fonts.sizes.lg,
    fontWeight: fonts.weights.bold,
    color: colors.white,
    textAlign: 'center',
    marginRight: 40,
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  imageCard: {
    margin: spacing.lg,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...shadows.dark,
    backgroundColor: colors.white,
  },
  mainImage: {
    width: '100%',
    height: 250,
  },
  imagePlaceholder: {
    fontSize: 80,
  },
  content: {
    paddingHorizontal: spacing.lg,
  },
  title: {
    fontSize: fonts.sizes.xxl,
    fontWeight: fonts.weights.bold,
    color: colors.gray.dark,
    marginBottom: spacing.md,
    lineHeight: 32,
  },
  statusCard: {
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
    ...shadows.medium,
  },
  openCard: {
    backgroundColor: colors.success + '15',
    borderLeftWidth: 4,
    borderLeftColor: colors.success,
  },
  closedCard: {
    backgroundColor: colors.danger + '15',
    borderLeftWidth: 4,
    borderLeftColor: colors.danger,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: spacing.sm,
  },
  openDot: {
    backgroundColor: colors.success,
  },
  closedDot: {
    backgroundColor: colors.danger,
  },
  statusTextContainer: {
    flex: 1,
  },
  statusLabel: {
    fontSize: fonts.sizes.sm,
    fontWeight: fonts.weights.bold,
    letterSpacing: 0.5,
  },
  openText: {
    color: colors.success,
  },
  closedText: {
    color: colors.danger,
  },
  statusMessage: {
    fontSize: fonts.sizes.xs,
    color: colors.gray.medium,
    marginTop: 2,
  },
  todayTiming: {
    fontSize: fonts.sizes.xs,
    color: colors.gray.dark,
    fontWeight: fonts.weights.medium,
  },
  infoGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  infoBox: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    ...shadows.light,
  },
  infoIcon: {
    fontSize: 28,
    marginBottom: spacing.xs,
  },
  infoValue: {
    fontSize: fonts.sizes.md,
    fontWeight: fonts.weights.bold,
    color: colors.gray.dark,
    marginBottom: 2,
    textAlign: 'center',
  },
  infoLabel: {
    fontSize: fonts.sizes.xs,
    color: colors.gray.medium,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: fonts.sizes.md,
    fontWeight: fonts.weights.bold,
    color: colors.gray.dark,
    marginBottom: spacing.sm,
  },
  description: {
    fontSize: fonts.sizes.sm,
    color: colors.gray.medium,
    lineHeight: 22,
  },
  scheduleCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    ...shadows.light,
  },
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray.lighter,
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  todayRow: {
    backgroundColor: colors.primary.light + '10',
  },
  dayColumn: {
    width: 50,
    flexDirection: 'row',
    alignItems: 'center',
  },
  dayName: {
    fontSize: fonts.sizes.sm,
    fontWeight: fonts.weights.medium,
    color: colors.gray.dark,
  },
  todayText: {
    color: colors.primary.main,
    fontWeight: fonts.weights.bold,
  },
  todayIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary.main,
    marginLeft: spacing.xs,
  },
  scheduleTime: {
    flex: 1,
    fontSize: fonts.sizes.sm,
    color: colors.gray.dark,
    textAlign: 'right',
  },
  closedSchedule: {
    color: colors.gray.medium,
    fontStyle: 'italic',
  },
  contactCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...shadows.light,
  },
  contactLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  contactIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary.light + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactEmoji: {
    fontSize: 24,
  },
  contactName: {
    fontSize: fonts.sizes.md,
    fontWeight: fonts.weights.semibold,
    color: colors.gray.dark,
  },
  contactPhone: {
    fontSize: fonts.sizes.sm,
    color: colors.primary.main,
    marginTop: 2,
  },
  contactArrow: {
    fontSize: fonts.sizes.xl,
    color: colors.gray.medium,
  },
  noteCard: {
    backgroundColor: colors.warning + '15',
    borderLeftWidth: 4,
    borderLeftColor: colors.warning,
    borderRadius: borderRadius.sm,
    padding: spacing.md,
    flexDirection: 'row',
    gap: spacing.sm,
  },
  noteIcon: {
    fontSize: 20,
  },
  noteText: {
    flex: 1,
    fontSize: fonts.sizes.sm,
    color: colors.gray.dark,
    lineHeight: 20,
  },
  locationCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    ...shadows.light,
  },
  locationAddress: {
    fontSize: fonts.sizes.sm,
    color: colors.gray.dark,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary.main,
    borderRadius: borderRadius.sm,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
  },
  mapIcon: {
    fontSize: 16,
  },
  mapText: {
    fontSize: fonts.sizes.sm,
    fontWeight: fonts.weights.semibold,
    color: colors.white,
  },
  buttonSpacing: {
    marginTop: spacing.sm,
  },
  bottomSpace: {
    height: 20,
  },
  callButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.success,
    borderRadius: borderRadius.sm,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
  },
  callGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    gap: spacing.xs,
  },
  callIcon: {
    fontSize: 16,
  },
  callText: {
    fontSize: fonts.sizes.sm,
    fontWeight: fonts.weights.semibold,
    color: colors.white,
  },
  callLabel: {
    fontSize: fonts.sizes.sm,
    fontWeight: fonts.weights.semibold,
    color: colors.white,
  },
});
