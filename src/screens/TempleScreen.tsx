import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  FlatList, 
  Image, 
  Dimensions,
  RefreshControl,
  Alert 
} from 'react-native';
import { LinearGradient } from '../components/WebLinearGradient';
import { WhiteCard } from '../components/GlassCard';
import { colors, fonts, spacing } from '../utils/theme';
import { apiService, Temple } from '../services/api';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

interface TempleScreenProps {
  navigation: any;
}

export default function TempleScreen({ navigation }: TempleScreenProps) {
  const [temples, setTemples] = useState<Temple[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch temples from API
  const fetchTemples = async () => {
    try {
      setError(null);
      console.log('🏛️ Fetching temples...');
      const response = await apiService.getTemples(1000);
      
      console.log('🏛️ Temple API Response:', response);
      console.log('🏛️ Temples array:', response.temples);
      console.log('🏛️ Temples count:', response.temples?.length);
      
      if (response.temples && Array.isArray(response.temples)) {
        console.log('🏛️ Setting temples data, count:', response.temples.length);
        setTemples(response.temples);
      } else {
        console.log('🏛️ No temples found in response');
        setError('No temples found');
        setTemples([]);
      }
    } catch (err: any) {
      console.error('🚨 Error fetching temples:', err);
      setError(err.message || 'Failed to load temples');
      setTemples([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTemples();
  }, []);

  // Update temple status every minute for real-time display
  useEffect(() => {
    const interval = setInterval(() => {
      // Force re-render to update temple status
      setTemples(currentTemples => [...currentTemples]);
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTemples();
  };

  const handleTemplePress = (temple: Temple) => {
    // Navigate to temple detail screen
    navigation.navigate('TempleDetail', { templeId: temple._id, temple });
  };

  // Helper function to check if temple is currently open
  const isTempleCurrentlyOpen = (temple: Temple) => {
    if (!temple.isActive) return false;

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    let openingTime = 5 * 60; // Default 5:00 AM
    let closingTime = 21 * 60; // Default 9:00 PM

    // Parse temple timings
    if (temple.timings && typeof temple.timings === 'object') {
      if (temple.timings.opening) {
        openingTime = parseTimeToMinutes(temple.timings.opening);
      }
      if (temple.timings.closing) {
        closingTime = parseTimeToMinutes(temple.timings.closing);
      }
    } else if (temple.timings && typeof temple.timings === 'string') {
      const timeParts = (temple.timings as string).split('-');
      if (timeParts.length === 2) {
        openingTime = parseTimeToMinutes(timeParts[0].trim());
        closingTime = parseTimeToMinutes(timeParts[1].trim());
      }
    }

    return currentTime >= openingTime && currentTime <= closingTime;
  };

  // Helper to parse time string to minutes
  const parseTimeToMinutes = (timeStr: string): number => {
    const time = timeStr.trim().toLowerCase();
    const [hourMin, period] = time.split(/\s+/);
    const [hour, min] = hourMin.split(':').map(Number);
    
    let hours = hour;
    if (period === 'pm' && hour !== 12) hours += 12;
    if (period === 'am' && hour === 12) hours = 0;
    
    return hours * 60 + (min || 0);
  };

  const renderTempleCard = ({ item: temple }: { item: Temple }) => (
    <TouchableOpacity 
      style={styles.templeListCard}
      onPress={() => handleTemplePress(temple)}
      activeOpacity={0.8}
    >
      <WhiteCard style={styles.listCardContainer}>
        {/* Temple Image Thumbnail */}
        <View style={styles.thumbnailContainer}>
          <Image
            source={{ 
              uri: temple.photo || 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=200'
            }}
            style={styles.thumbnailImage}
            resizeMode="cover"
          />
          <View style={styles.activeIndicator}>
            <View style={[styles.statusDot, { backgroundColor: isTempleCurrentlyOpen(temple) ? '#4CAF50' : '#FF5722' }]} />
          </View>
        </View>
        
        {/* Temple Info */}
        <View style={styles.listTempleInfo}>
          <Text style={styles.listTempleName} numberOfLines={1}>{temple.name}</Text>
          
          <View style={styles.listLocationRow}>
            <Ionicons name="location-outline" size={14} color={colors.gray.medium} />
            <Text style={styles.listLocationText} numberOfLines={1}>
              {typeof temple.location === 'string' 
                ? temple.location 
                : temple.location?.address || 'Location not specified'}
            </Text>
          </View>
          
          <View style={styles.listStatsRow}>
            <View style={styles.listStatItem}>
              <Ionicons name="time-outline" size={12} color={isTempleCurrentlyOpen(temple) ? colors.success : '#FF5722'} />
              <Text style={[styles.listStatText, { color: isTempleCurrentlyOpen(temple) ? colors.success : '#FF5722' }]}>
                {isTempleCurrentlyOpen(temple) ? 'Open' : 'Closed'}
              </Text>
            </View>
            <View style={styles.listStatItem}>
              <Ionicons name="people-outline" size={12} color={colors.accent.blue} />
              <Text style={styles.listStatText}>{temple.visitCount} visits</Text>
            </View>
          </View>
        </View>
        
        {/* Arrow Icon */}
        <View style={styles.arrowContainer}>
          <Ionicons name="chevron-forward-outline" size={20} color={colors.gray.medium} />
        </View>
      </WhiteCard>
    </TouchableOpacity>
  );

  // Loading State
  if (loading) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={['#667eea', '#764ba2']} style={styles.loadingHeader}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerText}>🏛️ Sacred Temples</Text>
        </LinearGradient>
        <View style={styles.loadingContainer}>
          <Ionicons name="business" size={64} color="#ccc" />
          <Text style={styles.loadingText}>Loading Temples...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerText}>🏛️ Sacred Temples</Text>
        <TouchableOpacity onPress={onRefresh} style={styles.refreshButton}>
          <Ionicons name="refresh" size={20} color="white" />
        </TouchableOpacity>
      </LinearGradient>

      {/* Error State */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>⚠️ {error}</Text>
          <TouchableOpacity onPress={fetchTemples} style={styles.retryButton}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Temple List */}
      {(() => {
        console.log('🏛️ Render - temples length:', temples.length);
        console.log('🏛️ Render - loading:', loading);
        console.log('🏛️ Render - error:', error);
        return null;
      })()}
      
      {temples.length > 0 ? (
        <FlatList
          data={temples}
          renderItem={renderTempleCard}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      ) : !loading && (
        <View style={styles.emptyContainer}>
          <Ionicons name="business-outline" size={64} color="#ccc" />
          <Text style={styles.emptyTitle}>No Temples Found</Text>
          <Text style={styles.emptyText}>
            {error ? 'Unable to load temples' : 'No temples available at the moment'}
          </Text>
          <TouchableOpacity onPress={fetchTemples} style={styles.retryButtonLarge}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  loadingHeader: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 10,
  },
  
  // Loading & Error States
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
  },
  errorContainer: {
    backgroundColor: 'rgba(255, 87, 87, 0.1)',
    padding: 12,
    margin: 10,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#ff5757',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  errorText: {
    color: '#ff5757',
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  retryButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  retryText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButtonLarge: {
    backgroundColor: '#667eea',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  
  // List Styles
  listContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  
  // Temple List Card Styles
  templeListCard: {
    marginBottom: 12,
  },
  listCardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  thumbnailContainer: {
    position: 'relative',
    marginRight: 12,
  },
  thumbnailImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  activeIndicator: {
    position: 'absolute',
    top: -2,
    right: -2,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: 'white',
  },
  listTempleInfo: {
    flex: 1,
    marginRight: 8,
  },
  listTempleName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  listLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  listLocationText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 4,
    flex: 1,
  },
  listStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  listStatText: {
    fontSize: 12,
    color: '#888',
    marginLeft: 4,
  },
  arrowContainer: {
    padding: 4,
  },
  imageContainer: {
    position: 'relative',
  },
  templeImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#f0f0f0',
  },
  imageCount: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  imageCountText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  
  // Temple Info Styles
  templeInfo: {
    padding: 16,
  },
  templeName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  templeDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  
  // Info Rows
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationText: {
    fontSize: 14,
    color: '#555',
    marginLeft: 8,
    flex: 1,
  },
  deityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  deityText: {
    fontSize: 14,
    color: '#555',
    marginLeft: 8,
    flex: 1,
    fontWeight: '500',
  },
  timingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  timingsText: {
    fontSize: 14,
    color: '#555',
    marginLeft: 8,
    flex: 1,
  },
  timingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  timingText: {
    fontSize: 14,
    color: '#555',
    marginLeft: 8,
    flex: 1,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statsText: {
    fontSize: 14,
    color: '#555',
    marginLeft: 8,
    flex: 1,
  },
  
  // Facilities
  facilitiesContainer: {
    marginBottom: 12,
  },
  facilitiesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  facilitiesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  facilityTag: {
    backgroundColor: '#e8f2ff',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 6,
    marginBottom: 4,
  },
  facilityText: {
    fontSize: 12,
    color: '#667eea',
    fontWeight: '500',
  },
  
  // Contact Info
  contactRow: {
    flexDirection: 'row',
    marginTop: 8,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9ff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#e0e6ff',
  },
  contactText: {
    fontSize: 12,
    color: '#667eea',
    fontWeight: '600',
    marginLeft: 4,
  },
});