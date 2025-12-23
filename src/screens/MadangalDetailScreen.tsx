import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Platform,
  Linking,
  Alert,
} from 'react-native';
import { LinearGradient } from '../components/WebLinearGradient';
import { WhiteCard } from '../components/GlassCard';
import { colors, spacing } from '../utils/theme';

const { width } = Dimensions.get('window');
const IMAGE_HEIGHT = 300;

interface MadangalDetailScreenProps {
  navigation: any;
  route: {
    params: {
      madangal: {
        _id: string;
        name: string;
        description: string;
        capacity: number;
        currentOccupancy: number;
        facilities: string[];
        cost: number;
        costType: string;
        images: string[];
        location: {
          latitude: number;
          longitude: number;
          address: string;
        };
        contact: {
          name: string;
          phone: string;
          email: string;
        };
        currentlyAvailable: boolean;
        isActive: boolean;
        checkInTime?: string;
        checkOutTime?: string;
        rules?: string[];
      };
    };
  };
}

export default function MadangalDetailScreen({ navigation, route }: MadangalDetailScreenProps) {
  const { madangal } = route.params;
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const handleCall = () => {
    if (madangal.contact.phone) {
      const phoneNumber = `tel:${madangal.contact.phone}`;
      Linking.canOpenURL(phoneNumber)
        .then((supported) => {
          if (supported) {
            Linking.openURL(phoneNumber);
          } else {
            Alert.alert('Error', 'Phone call is not supported on this device');
          }
        })
        .catch((err) => console.error('Error opening phone:', err));
    }
  };

  const handleEmail = () => {
    if (madangal.contact.email) {
      const emailUrl = `mailto:${madangal.contact.email}`;
      Linking.canOpenURL(emailUrl)
        .then((supported) => {
          if (supported) {
            Linking.openURL(emailUrl);
          }
        })
        .catch((err) => console.error('Error opening email:', err));
    }
  };

  const handleGetDirections = () => {
    const { latitude, longitude } = madangal.location;
    const url = Platform.select({
      ios: `maps:0,0?q=${latitude},${longitude}`,
      android: `geo:0,0?q=${latitude},${longitude}(${madangal.name})`,
      default: `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`,
    });

    Linking.canOpenURL(url!)
      .then((supported) => {
        if (supported) {
          Linking.openURL(url!);
        } else {
          Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`);
        }
      })
      .catch((err) => console.error('Error opening maps:', err));
  };

  const getAvailabilityColor = () => {
    const occupancyRate = (madangal.currentOccupancy / madangal.capacity) * 100;
    if (occupancyRate >= 90) return '#ef4444';
    if (occupancyRate >= 70) return '#f59e0b';
    return '#10b981';
  };

  const getAvailabilityInfo = () => {
    const available = madangal.capacity - madangal.currentOccupancy;
    const occupancyRate = (madangal.currentOccupancy / madangal.capacity) * 100;
    return {
      available,
      percentage: occupancyRate.toFixed(0),
      status: occupancyRate >= 90 ? 'கிட்டத்தட்ட நிரம்பியுள்ளது' : 
              occupancyRate >= 70 ? 'குறைவான இடங்கள் உள்ளன' : 
              'போதுமான இடங்கள் உள்ளன'
    };
  };

  const facilityIcons: { [key: string]: string } = {
    'Electricity': '⚡',
    'Water': '💧',
    'Bathroom': '🚿',
    'Bed': '🛏️',
    'Fan': '🌀',
    'Parking': '🅿️',
    'Security': '🔒',
    'WiFi': '📶',
    'Food': '🍽️',
  };

  const availabilityInfo = getAvailabilityInfo();

  return (
    <View style={styles.container}>
      {/* Simple Header Image */}
      <View style={styles.imageSection}>
        <Image
          source={{ uri: madangal.images[selectedImageIndex] || 'https://via.placeholder.com/400x300' }}
          style={styles.mainImage}
          resizeMode="cover"
        />
        
        {/* Simple Gradient */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.6)']}
          style={styles.imageGradient}
        />

        {/* Back Button */}
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>

        {/* Title */}
        <View style={styles.titleOverlay}>
          <Text style={styles.mainTitle}>{madangal.name}</Text>
        </View>
      </View>

      {/* Scrollable Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{madangal.capacity}</Text>
            <Text style={styles.statLabel}>மொத்தம்</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{availabilityInfo.available}</Text>
            <Text style={styles.statLabel}>கிடைக்கும்</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{availabilityInfo.percentage}%</Text>
            <Text style={styles.statLabel}>நிரம்பியது</Text>
          </View>
        </View>

        {/* Status Badge */}
        <View style={styles.statusRow}>
          <View style={[styles.statusBadge, { backgroundColor: getAvailabilityColor() }]}>
            <Text style={styles.statusText}>
              {madangal.currentlyAvailable ? '✓ கிடைக்கும்' : '✗ நிரம்பியது'}
            </Text>
          </View>
          {madangal.costType === 'free' && (
            <View style={styles.freeBadge}>
              <Text style={styles.freeBadgeText}>இலவசம்</Text>
            </View>
          )}
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📝 விவரம்</Text>
          <Text style={styles.description}>{madangal.description}</Text>
        </View>

        {/* Facilities */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏠 வசதிகள்</Text>
          <View style={styles.facilitiesList}>
            {madangal.facilities.map((facility, index) => (
              <View key={index} style={styles.facilityItem}>
                <Text style={styles.facilityIcon}>{facilityIcons[facility] || '✓'}</Text>
                <Text style={styles.facilityText}>{facility}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Location */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📍 இடம்</Text>
          <Text style={styles.address}>{madangal.location.address}</Text>
          <TouchableOpacity style={styles.actionButton} onPress={handleGetDirections}>
            <Text style={styles.actionButtonText}>வழிகளைப் பெறுங்கள்</Text>
          </TouchableOpacity>
        </View>

        {/* Contact */}
        {(madangal.contact.name || madangal.contact.phone || madangal.contact.email) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📞 தொடர்பு</Text>
            
            {madangal.contact.name && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>பெயர்:</Text>
                <Text style={styles.infoValue}>{madangal.contact.name}</Text>
              </View>
            )}
            
            {madangal.contact.phone && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>தொலைபேசி:</Text>
                <TouchableOpacity onPress={handleCall}>
                  <Text style={styles.infoValueLink}>{madangal.contact.phone}</Text>
                </TouchableOpacity>
              </View>
            )}

            {madangal.contact.email && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>மின்னஞ்சல்:</Text>
                <TouchableOpacity onPress={handleEmail}>
                  <Text style={styles.infoValueLink}>{madangal.contact.email}</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* Gallery */}
        {madangal.images.length > 1 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📷 படங்கள்</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.galleryScroll}
            >
              {madangal.images.map((image, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => setSelectedImageIndex(index)}
                  style={styles.galleryItem}
                >
                  <Image 
                    source={{ uri: image }} 
                    style={[
                      styles.galleryImage,
                      selectedImageIndex === index && styles.galleryImageSelected
                    ]} 
                    resizeMode="cover" 
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Bottom Button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity 
          style={[
            styles.bookButton,
            !madangal.currentlyAvailable && styles.bookButtonDisabled
          ]}
          disabled={!madangal.currentlyAvailable}
          onPress={() => {}}
        >
          <Text style={styles.bookButtonText}>
            {madangal.currentlyAvailable ? 'முன்பதிவு செய்க' : 'இடங்கள் இல்லை'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  imageSection: {
    height: 250,
    position: 'relative',
  },
  mainImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#e0e0e0',
  },
  imageGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 40,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 24,
    color: '#fff',
    marginLeft: -2,
  },
  titleOverlay: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  content: {
    flex: 1,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    marginBottom: spacing.md,
    borderRadius: 12,
    padding: spacing.md,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary.start,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.gray.medium,
    fontWeight: '500',
  },
  statusRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  freeBadge: {
    backgroundColor: '#10b981',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  freeBadgeText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  section: {
    backgroundColor: '#fff',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    padding: spacing.lg,
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.gray.dark,
    marginBottom: spacing.md,
  },
  description: {
    fontSize: 15,
    color: colors.gray.dark,
    lineHeight: 24,
  },
  facilitiesList: {
    gap: spacing.sm,
  },
  facilityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  facilityIcon: {
    fontSize: 20,
    marginRight: spacing.md,
    width: 30,
  },
  facilityText: {
    fontSize: 15,
    color: colors.gray.dark,
    fontWeight: '500',
  },
  address: {
    fontSize: 15,
    color: colors.gray.dark,
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  actionButton: {
    backgroundColor: colors.primary.start,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    borderLeftWidth: 3,
    borderLeftColor: colors.primary.start,
    borderRightWidth: 3,
    borderRightColor: colors.primary.start,
    marginBottom: spacing.sm,
    borderRadius: 8,
    backgroundColor: '#f9fafb',
  },
  infoLabel: {
    fontSize: 14,
    color: colors.gray.medium,
    fontWeight: '600',
    minWidth: 100,
    marginRight: spacing.md,
  },
  infoValue: {
    fontSize: 15,
    color: colors.gray.dark,
    fontWeight: '600',
    flex: 1,
  },
  infoValueLink: {
    fontSize: 15,
    color: colors.primary.start,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  galleryScroll: {
    marginTop: spacing.sm,
  },
  galleryItem: {
    marginRight: spacing.md,
  },
  galleryImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
    backgroundColor: '#e0e0e0',
    borderWidth: 2,
    borderColor: '#f0f0f0',
  },
  galleryImageSelected: {
    borderColor: colors.primary.start,
  },
  bottomSpacing: {
    height: 100,
  },
  bottomBar: {
    backgroundColor: '#fff',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    paddingBottom: Platform.OS === 'ios' ? spacing.xl : spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  bookButton: {
    backgroundColor: colors.primary.start,
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  bookButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
});
