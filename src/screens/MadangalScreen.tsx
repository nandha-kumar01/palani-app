import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  ActivityIndicator,
  Dimensions,
  Platform,
  RefreshControl
} from 'react-native';
import { LinearGradient } from '../components/WebLinearGradient';
import { WhiteCard } from '../components/GlassCard';
import { colors, fonts, spacing } from '../utils/theme';
import { apiHelper } from '../utils/apiHelper';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - spacing.lg * 2;

interface Madangal {
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
}

interface MadangalScreenProps {
  navigation: any;
}

export default function MadangalScreen({ navigation }: MadangalScreenProps) {
  const [madangals, setMadangals] = useState<Madangal[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMadangals = async () => {
    try {
      const response = await apiHelper.get('/admin/madangal');
      if (response.success && response.madangals) {
        setMadangals(response.madangals);
      }
    } catch (error) {
      console.error('Error fetching madangals:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMadangals();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchMadangals();
  };

  const handleMadangalPress = (madangal: Madangal) => {
    navigation.navigate('MadangalDetail', { madangal });
  };

  const getAvailabilityColor = (madangal: Madangal) => {
    const occupancyRate = (madangal.currentOccupancy / madangal.capacity) * 100;
    if (occupancyRate >= 90) return '#ef4444'; // Red
    if (occupancyRate >= 70) return '#f59e0b'; // Orange
    return '#10b981'; // Green
  };

  const getAvailabilityText = (madangal: Madangal) => {
    const available = madangal.capacity - madangal.currentOccupancy;
    return `${available} இடங்கள் உள்ளன`;
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <LinearGradient 
          colors={[colors.primary.start, colors.primary.end]} 
          style={styles.header}
        >
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>மடங்கள்</Text>
          <View style={styles.headerBadge} />
        </LinearGradient>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary.start} />
          <Text style={styles.loadingText}>ஏற்றுகிறது...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient 
        colors={[colors.primary.start, colors.primary.end]} 
        style={styles.header}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>மடங்கள்</Text>
        <View style={styles.headerBadge}>
          <Text style={styles.headerBadgeText}>{madangals.length}</Text>
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary.start]} />
        }
      >
        {/* List Items */}
        <View style={styles.listContainer}>
          {madangals.map((madangal, index) => (
            <TouchableOpacity 
              key={madangal._id} 
              onPress={() => handleMadangalPress(madangal)}
              activeOpacity={0.7}
            >
              <View style={styles.listItem}>
                {/* Left - Image */}
                <View style={styles.imageContainer}>
                  <Image 
                    source={{ uri: madangal.images[0] || 'https://via.placeholder.com/100' }}
                    style={styles.listImage}
                    resizeMode="cover"
                  />
                  {/* Badge on Image */}
                  <View style={[
                    styles.imageBadge,
                    { backgroundColor: madangal.currentlyAvailable ? '#10b981' : '#ef4444' }
                  ]}>
                    <Text style={styles.imageBadgeText}>
                      {madangal.currentlyAvailable ? '✓' : '✗'}
                    </Text>
                  </View>
                </View>

                {/* Right - Content */}
                <View style={styles.listContent}>
                  {/* Title Row */}
                  <View style={styles.titleRow}>
                    <Text style={styles.listTitle} numberOfLines={1}>
                      {madangal.name}
                    </Text>
                    {madangal.costType === 'free' && (
                      <View style={styles.freeBadge}>
                        <Text style={styles.freeBadgeText}>இலவசம்</Text>
                      </View>
                    )}
                  </View>

                  {/* Description */}
                  <Text style={styles.listDescription} numberOfLines={2}>
                    {madangal.description}
                  </Text>

                  {/* Info Row */}
                  <View style={styles.listInfoRow}>
                    <View style={styles.listInfo}>
                      <Text style={styles.listInfoIcon}>👥</Text>
                      <Text style={styles.listInfoText}>{madangal.capacity}</Text>
                    </View>
                    
                    <View style={styles.listInfo}>
                      <Text style={styles.listInfoIcon}>✅</Text>
                      <Text style={styles.listInfoText}>
                        {madangal.capacity - madangal.currentOccupancy} இடம்
                      </Text>
                    </View>

                    {/* Arrow */}
                    <Text style={styles.arrowIcon}>→</Text>
                  </View>

                  {/* Progress Bar */}
                  <View style={styles.progressContainer}>
                    <View style={styles.progressBar}>
                      <View 
                        style={[
                          styles.progressFill,
                          { 
                            width: `${(madangal.currentOccupancy / madangal.capacity) * 100}%` as any,
                            backgroundColor: getAvailabilityColor(madangal)
                          }
                        ]}
                      />
                    </View>
                  </View>
                </View>
              </View>

              {/* Divider */}
              {index < madangals.length - 1 && <View style={styles.divider} />}
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f5f5f5' 
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  backButtonText: {
    fontSize: 24,
    color: '#fff',
    marginLeft: -2,
  },
  headerTitle: {
    flex: 1,
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  headerBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerBadgeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: 16,
    color: colors.gray.medium,
    fontWeight: '500',
  },
  listContainer: {
    backgroundColor: '#fff',
  },
  listItem: {
    flexDirection: 'row',
    padding: spacing.lg,
    backgroundColor: '#fff',
  },
  imageContainer: {
    width: 90,
    height: 90,
    borderRadius: 12,
    overflow: 'hidden',
    marginRight: spacing.md,
    position: 'relative',
  },
  listImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#e0e0e0',
  },
  imageBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  listContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.gray.dark,
    flex: 1,
    marginRight: spacing.sm,
  },
  freeBadge: {
    backgroundColor: '#10b981',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  freeBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  listDescription: {
    fontSize: 13,
    color: colors.gray.medium,
    lineHeight: 18,
    marginBottom: 8,
  },
  listInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  listInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  listInfoIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  listInfoText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.gray.dark,
  },
  arrowIcon: {
    fontSize: 18,
    color: colors.gray.medium,
    marginLeft: 'auto',
  },
  progressContainer: {
    width: '100%',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginLeft: spacing.lg + 90 + spacing.md,
  },
  bottomSpacing: {
    height: spacing.xl,
  },
});