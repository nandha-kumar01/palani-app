import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Linking,
  Alert,
  Platform,
  Share,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { WebMapView, WebMarker } from '../components/WebMapView';
import { colors, fonts, spacing, borderRadius, shadows } from '../utils/theme';
import { Temple } from '../types';

const { width, height } = Dimensions.get('window');

interface TempleDetailScreenProps {
  navigation: {
    navigate: (screenName: string, params?: any) => void;
    goBack: () => void;
  };
  route?: {
    params: {
      templeId: string;
      temple: Temple;
    };
  };
}

const TempleDetailScreen: React.FC<TempleDetailScreenProps> = ({ navigation, route }) => {
  const temple = route?.params?.temple;
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);



  // Helper functions to safely access complex location/timing data
  const getLocationAddress = () => {
    if (typeof temple?.location === 'string') return temple.location;
    return temple?.location?.address || 'Palani, Tamil Nadu';
  };

  const getLocationCoordinates = () => {
    // Check if location is an object with coordinates
    if (typeof temple?.location === 'object' && temple?.location?.coordinates) {
      return temple.location.coordinates;
    }
    
    // Check if coordinates are directly in location object
    if (typeof temple?.location === 'object' && temple?.location?.latitude && temple?.location?.longitude) {
      return { latitude: temple.location.latitude, longitude: temple.location.longitude };
    }
    
    // Check if location has lat/lng fields (different naming)
    if (typeof temple?.location === 'object') {
      const loc = temple.location as any;
      if (loc.lat && loc.lng) {
        return { latitude: loc.lat, longitude: loc.lng };
      }
      if (loc.lat && loc.long) {
        return { latitude: loc.lat, longitude: loc.long };
      }
    }
    
    // Default to Palani coordinates if no temple coordinates found
    return { latitude: 10.2379, longitude: 77.9421 };
  };

  const getTimings = () => {
    if (typeof temple?.timings === 'string') return temple.timings;
    if (temple?.timings?.opening && temple?.timings?.closing) {
      return `${temple.timings.opening} - ${temple.timings.closing}`;
    }
    return '5:00 AM - 9:00 PM';
  };

  // Real-time temple status based on current time
  const getTempleStatus = () => {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes(); // Current time in minutes

    // Parse temple timings
    let openingTime = 5 * 60; // Default 5:00 AM in minutes
    let closingTime = 21 * 60; // Default 9:00 PM in minutes

    // Try to parse actual temple timings
    if (temple?.timings && typeof temple.timings === 'object') {
      if (temple.timings.opening) {
        openingTime = parseTimeToMinutes(temple.timings.opening);
      }
      if (temple.timings.closing) {
        closingTime = parseTimeToMinutes(temple.timings.closing);
      }
    } else if (temple?.timings && typeof temple.timings === 'string') {
      // Parse string format like "5:00 AM - 9:00 PM"
      const timeParts = temple.timings.split('-');
      if (timeParts.length === 2) {
        openingTime = parseTimeToMinutes(timeParts[0].trim());
        closingTime = parseTimeToMinutes(timeParts[1].trim());
      }
    }

    // Check if temple is currently open
    const isOpen = temple.isActive && currentTime >= openingTime && currentTime <= closingTime;
    
    return {
      isOpen,
      openingTime,
      closingTime,
      nextStatusChange: isOpen 
        ? `Closes at ${formatMinutesToTime(closingTime)}`
        : `Opens at ${formatMinutesToTime(openingTime)}`
    };
  };

  // Helper function to parse time string to minutes
  const parseTimeToMinutes = (timeStr: string): number => {
    const time = timeStr.trim().toLowerCase();
    const [hourMin, period] = time.split(/\s+/);
    const [hour, min] = hourMin.split(':').map(Number);
    
    let hours = hour;
    if (period === 'pm' && hour !== 12) hours += 12;
    if (period === 'am' && hour === 12) hours = 0;
    
    return hours * 60 + (min || 0);
  };

  // Helper function to format minutes back to time string
  const formatMinutesToTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours > 12 ? hours - 12 : (hours === 0 ? 12 : hours);
    return `${displayHours}:${mins.toString().padStart(2, '0')} ${period}`;
  };

  // State for real-time updates
  const [currentStatus, setCurrentStatus] = useState(getTempleStatus());
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update status and time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStatus(getTempleStatus());
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [temple]);

  if (!temple) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Temple data not found</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleCall = () => {
    const phoneNumber = temple.contact?.phone;
    if (!phoneNumber) {
      Alert.alert('Contact Info', 'Phone number not available for this temple');
      return;
    }
    
    if (Platform.OS === 'web') {
      Alert.alert('Call Temple', `Would you like to call ${phoneNumber}?`);
    } else {
      Linking.openURL(`tel:${phoneNumber}`);
    }
  };

  const handleDirections = () => {
    const { latitude, longitude } = getLocationCoordinates();
    const url = Platform.select({
      ios: `maps://app?daddr=${latitude},${longitude}`,
      android: `google.navigation:q=${latitude},${longitude}`,
      web: `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`,
    });
    
    if (url) {
      Linking.openURL(url);
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out ${temple.name} - A beautiful temple in ${getLocationAddress()}. Visit for divine blessings!`,
        title: temple.name,
      });
    } catch (error) {
      console.error('Error sharing temple:', error);
    }
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    // Here you would typically save to storage or API
  };

  const images = temple.gallery || [temple.photo].filter(Boolean);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header with Image Gallery */}
      <View style={styles.imageSection}>
        <Image
          source={{ 
            uri: images[currentImageIndex] || 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800'
          }}
          style={styles.headerImage}
          resizeMode="cover"
        />
        
        {/* Overlay with navigation */}
        <View style={styles.headerOverlay}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          
          <View style={styles.headerRightButtons}>
            <TouchableOpacity onPress={toggleFavorite} style={styles.headerButton}>
              <Ionicons 
                name={isFavorite ? "heart" : "heart-outline"} 
                size={24} 
                color={isFavorite ? "#FF6B6B" : "white"} 
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleShare} style={styles.headerButton}>
              <Ionicons name="share-outline" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Image indicators */}
        {images.length > 1 && (
          <View style={styles.imageIndicators}>
            {images.map((_, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.indicator,
                  currentImageIndex === index && styles.activeIndicator,
                ]}
                onPress={() => setCurrentImageIndex(index)}
              />
            ))}
          </View>
        )}

        {/* Real-time Status badge */}
        <View style={styles.statusBadge}>
          <View style={[styles.statusDot, { backgroundColor: currentStatus.isOpen ? '#4CAF50' : '#FF5722' }]} />
          <Text style={styles.statusText}>
            {currentStatus.isOpen ? 'Open Now' : 'Closed'}
          </Text>
        </View>

        {/* Current time display */}
        <View style={styles.currentTimeBadge}>
          <Ionicons name="time-outline" size={14} color="white" />
          <Text style={styles.currentTimeText}>
            {currentTime.toLocaleTimeString('en-US', { 
              hour: 'numeric', 
              minute: '2-digit', 
              hour12: true 
            })}
          </Text>
        </View>
      </View>

      {/* Temple Info */}
      <View style={styles.contentSection}>
        {/* Title and basic info */}
        <View style={styles.titleSection}>
          <Text style={styles.templeName}>{temple.name}</Text>
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={18} color={colors.primary.main} />
            <Text style={styles.locationText}>
              {getLocationAddress()}
            </Text>
          </View>
          
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Ionicons name="people-outline" size={16} color={colors.accent.blue} />
              <Text style={styles.statText}>{temple.visitCount} visits</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="star" size={16} color="#FFD700" />
              <Text style={styles.statText}>
                {temple.rating ? `${temple.rating.toFixed(1)} rating` : '4.8 rating'}
              </Text>
            </View>
          </View>
        </View>

        {/* Timings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🕐 Temple Timings</Text>
          <View style={styles.timingCard}>
            <View style={styles.timingRow}>
              <Text style={styles.timingLabel}>Temple Timings:</Text>
              <Text style={styles.timingValue}>
                {getTimings()}
              </Text>
            </View>
            {/* Show additional timing info only if available in database */}
            {temple.timings && typeof temple.timings === 'object' && temple.timings.morning && temple.timings.evening && (
              <>
                <View style={styles.timingRow}>
                  <Text style={styles.timingLabel}>Morning:</Text>
                  <Text style={styles.timingValue}>{temple.timings.morning}</Text>
                </View>
                <View style={styles.timingRow}>
                  <Text style={styles.timingLabel}>Evening:</Text>
                  <Text style={styles.timingValue}>{temple.timings.evening}</Text>
                </View>
              </>
            )}
            <View style={styles.timingRow}>
              <Text style={styles.timingLabel}>Current Status:</Text>
              <Text style={[styles.timingValue, { color: currentStatus.isOpen ? colors.success : '#FF5722', fontWeight: '600' }]}>
                {currentStatus.isOpen ? '🟢 Open Now' : '🔴 Closed'}
              </Text>
            </View>
            <View style={styles.timingRow}>
              <Text style={styles.timingLabel}>
                {currentStatus.isOpen ? 'Closes at:' : 'Opens at:'}
              </Text>
              <Text style={[styles.timingValue, { color: '#666', fontSize: 13 }]}>
                {currentStatus.isOpen 
                  ? formatMinutesToTime(currentStatus.closingTime)
                  : formatMinutesToTime(currentStatus.openingTime)
                }
              </Text>
            </View>
          </View>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏛️ About This Temple</Text>
          <Text style={styles.description}>
            {temple.description || `${temple.name} is a sacred temple where devotees come to seek divine blessings and experience spiritual peace. Visit this holy place to connect with the divine and find inner tranquility.`}
          </Text>
        </View>



        {/* Deity Info - Show if available */}
        {temple.deity && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🕉️ Main Deity</Text>
            <Text style={styles.description}>{temple.deity}</Text>
          </View>
        )}

        {/* Special Features - Show if available */}
        {temple.specialFeatures && temple.specialFeatures.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>✨ Special Features</Text>
            <View style={styles.facilitiesGrid}>
              {temple.specialFeatures.map((feature, index) => (
                <View key={`feature-${index}`} style={styles.facilityItem}>
                  <Ionicons name="star-outline" size={16} color={colors.primary.main} />
                  <Text style={styles.facilityText}>{feature}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Facilities & Services */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎯 Facilities & Services</Text>
          <View style={styles.facilitiesGrid}>
            {(temple.facilities && temple.facilities.length > 0 
              ? temple.facilities 
              : ['Prayer Hall', 'Prasadam Counter', 'Parking Available', 'Restrooms']
            ).map((facility, index) => (
              <View key={`facility-${index}`} style={styles.facilityItem}>
                <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                <Text style={styles.facilityText}>{facility}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Festivals - Show if available */}
        {temple.festivals && temple.festivals.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🎉 Major Festivals</Text>
            <View style={styles.facilitiesGrid}>
              {temple.festivals.map((festival, index) => (
                <View key={`festival-${index}`} style={styles.facilityItem}>
                  <Ionicons name="calendar-outline" size={16} color={colors.accent.orange} />
                  <Text style={styles.facilityText}>{festival}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Map Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📍 Location & Directions</Text>
          
          {/* Show location coordinates */}
          <Text style={styles.coordinatesText}>
            📍 Location: {getLocationCoordinates().latitude.toFixed(4)}°N, {getLocationCoordinates().longitude.toFixed(4)}°E
          </Text>
          
          <View style={styles.mapContainer}>
            <WebMapView
              region={{
                latitude: getLocationCoordinates().latitude,
                longitude: getLocationCoordinates().longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
              style={styles.map}
            >
              <WebMarker
                coordinate={getLocationCoordinates()}
                title={temple.name}
                description={getLocationAddress()}
              />
            </WebMapView>
          </View>
          
          <TouchableOpacity onPress={handleDirections} style={styles.directionsButton}>
            <Ionicons name="navigate-outline" size={20} color="white" />
            <Text style={styles.directionsText}>Get Directions</Text>
          </TouchableOpacity>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionSection}>
          {/* Only show call button if phone number exists */}
          {temple.contact?.phone && (
            <TouchableOpacity onPress={handleCall} style={styles.actionButton}>
              <LinearGradient
                colors={[colors.success, '#20A745']}
                style={styles.actionButtonGradient}
              >
                <Ionicons name="call-outline" size={20} color="white" />
                <Text style={styles.actionButtonText}>Call Temple</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
          
      
        </View>

        {/* Contact Info - Show if email exists */}
        {temple.contact?.email && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📧 Contact Information</Text>
            <View style={styles.contactInfoContainer}>
              {temple.contact.phone && (
                <Text style={styles.contactInfo}>📞 {temple.contact.phone}</Text>
              )}
              <Text style={styles.contactInfo}>✉️ {temple.contact.email}</Text>
            </View>
          </View>
        )}

        {/* Footer info */}
        <View style={styles.footerInfo}>
          <Text style={styles.footerText}>
            🙏 Please maintain silence and respect temple traditions
          </Text>
         
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  
  // Header Image Section
  imageSection: {
    position: 'relative',
    height: height * 0.4,
  },
  headerImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f0f0f0',
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: 50,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerRightButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  imageIndicators: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  activeIndicator: {
    backgroundColor: 'white',
  },
  statusBadge: {
    position: 'absolute',
    top: 80,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  currentTimeBadge: {
    position: 'absolute',
    top: 120,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  currentTimeText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '500',
    marginLeft: 4,
  },

  // Content Section
  contentSection: {
    flex: 1,
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -20,
    paddingTop: 20,
  },
  
  // Title Section
  titleSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  templeName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  locationText: {
    fontSize: 16,
    color: '#666',
    marginLeft: 8,
    flex: 1,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 20,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 14,
    color: '#888',
    marginLeft: 6,
    fontWeight: '500',
  },

  // Sections
  section: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  
  // Timings
  timingCard: {
    backgroundColor: '#f8f9ff',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary.main,
  },
  timingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  timingLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  timingValue: {
    fontSize: 14,
    color: '#666',
  },

  // Description
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#555',
    textAlign: 'justify',
  },

  // Facilities
  facilitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  facilityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f8f0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  facilityText: {
    fontSize: 14,
    color: colors.success,
    marginLeft: 6,
    fontWeight: '500',
  },

  // Map
  coordinatesText: {
    fontSize: 13,
    color: '#777',
    marginBottom: 12,
    backgroundColor: '#f8f9fa',
    padding: 8,
    borderRadius: 6,
    textAlign: 'center',
  },
  mapContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
  map: {
    height: 200,
  },
  directionsButton: {
    backgroundColor: colors.primary.main,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
  },
  directionsText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },

  // Action Buttons
  actionSection: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
  actionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 10,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },

  // Contact Info
  contactInfoContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
  },
  contactInfo: {
    fontSize: 14,
    color: '#555',
    marginBottom: 6,
  },

  // Footer
  footerInfo: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginBottom: 8,
  },
  lastUpdated: {
    fontSize: 12,
    color: '#aaa',
    marginBottom: 4,
  },

  // Error State
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: colors.primary.main,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default TempleDetailScreen;