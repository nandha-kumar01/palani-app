import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator,
  RefreshControl,
  Image,
  Dimensions
} from 'react-native';
import { LinearGradient } from '../components/WebLinearGradient';
import { WhiteCard } from '../components/GlassCard';
import { colors, fonts, spacing, shadows, borderRadius } from '../utils/theme';

const { width } = Dimensions.get('window');

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

interface AnnadhanamScreenProps {
  navigation: any;
}

export default function AnnadhanamScreen({ navigation }: AnnadhanamScreenProps) {
  const [annadhanamList, setAnnadhanamList] = useState<Annadhanam[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnnadhanamData = async () => {
    try {
      setError(null);
      const response = await fetch('https://palani-admin.vercel.app/api/admin/annadhanam', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OGNkMjEwMmFiMjljOGNkYTgxNzA4OTQiLCJlbWFpbCI6ImFkbWluQHBhbGFuaS5jb20iLCJpc0FkbWluIjp0cnVlLCJpYXQiOjE3NjI0NDEwOTYsImV4cCI6MTc2MzA0NTg5Nn0.adwAcR6m1h2acDUm6HTcu1d_8frB9UxL4EG1k04BSmU'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }

      const data = await response.json();
      console.log('API Response:', data); // Debug log
      
      // Handle different response structures - API returns "annadhanamList"
      let annadhanamArray = [];
      if (Array.isArray(data)) {
        annadhanamArray = data;
      } else if (data.annadhanamList && Array.isArray(data.annadhanamList)) {
        annadhanamArray = data.annadhanamList;
      } else if (data.annadhanam && Array.isArray(data.annadhanam)) {
        annadhanamArray = data.annadhanam;
      } else if (data.data && Array.isArray(data.data)) {
        annadhanamArray = data.data;
      }
      
      setAnnadhanamList(annadhanamArray);
    } catch (err) {
      setError('Unable to load Annadhanam details. Please try again.');
      console.error('Error fetching annadhanam:', err);
      setAnnadhanamList([]); // Set empty array on error
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnnadhanamData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchAnnadhanamData();
  };

  const handleCardPress = (item: Annadhanam) => {
    navigation.navigate('AnnadhanamDetail', { annadhanam: item });
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={[colors.primary.start, colors.primary.end]} style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerText}>Annadhanam</Text>
        </LinearGradient>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary.main} />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={[colors.primary.start, colors.primary.end]} style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerText}>Annadhanam</Text>
        </LinearGradient>
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>😔</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchAnnadhanamData}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={[colors.primary.start, colors.primary.end]} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerText}>🍛 Annadhanam</Text>
          <Text style={styles.headerSubtext}>Free meals service</Text>
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary.main]} />
        }
      >
        {!Array.isArray(annadhanamList) || annadhanamList.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No Annadhanam services available</Text>
          </View>
        ) : (
          annadhanamList.map((item, index) => (
            <TouchableOpacity 
              key={item._id || index} 
              onPress={() => handleCardPress(item)}
              activeOpacity={0.8}
            >
              <WhiteCard style={styles.card}>
                <View style={styles.cardRow}>
                  {/* Left: Image */}
                  <View style={styles.imageContainer}>
                    {item.images && item.images.length > 0 ? (
                      <Image 
                        source={{ uri: item.images[0] }} 
                        style={styles.cardImage}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={styles.imagePlaceholder}>
                        <Text style={styles.placeholderEmoji}>🍛</Text>
                      </View>
                    )}
                    {item.isActive && (
                      <View style={styles.activeIndicator}>
                        <View style={styles.activeDot} />
                      </View>
                    )}
                  </View>

                  {/* Right: Content */}
                  <View style={styles.cardContent}>
                    <Text style={styles.name} numberOfLines={2}>
                      {item.name}
                    </Text>
                    
                    <View style={styles.infoContainer}>
                      <View style={styles.infoItem}>
                        <Text style={styles.infoIcon}>📍</Text>
                        <Text style={styles.infoText} numberOfLines={1}>
                          {item.location.address.split(',')[0]}
                        </Text>
                      </View>
                      
                      <View style={styles.infoItem}>
                        <Text style={styles.infoIcon}>🕒</Text>
                        <Text style={styles.infoText}>
                          {item.timings[0]?.startTime} - {item.timings[0]?.endTime}
                        </Text>
                      </View>

                      <View style={styles.infoItem}>
                        <Text style={styles.infoIcon}>👥</Text>
                        <Text style={styles.infoText}>{item.capacity} people</Text>
                      </View>
                    </View>

                    <View style={styles.footer}>
                      <View style={styles.foodTypeBadge}>
                        <Text style={styles.foodTypeText}>{item.foodType}</Text>
                      </View>
                      <Text style={styles.arrowIcon}>→</Text>
                    </View>
                  </View>
                </View>
              </WhiteCard>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
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
    paddingBottom: spacing.xl, 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  backButton: { 
    width: 40, 
    height: 40, 
    borderRadius: 20, 
    backgroundColor: 'rgba(255, 255, 255, 0.3)', 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginRight: spacing.md,
    ...shadows.medium
  },
  backButtonText: { 
    fontSize: 24, 
    color: colors.white 
  },
  headerContent: {
    flex: 1,
  },
  headerText: { 
    fontSize: fonts.sizes.xxl, 
    fontWeight: fonts.weights.bold, 
    color: colors.white 
  },
  headerSubtext: {
    fontSize: fonts.sizes.sm,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  content: { 
    flex: 1, 
    paddingHorizontal: spacing.lg, 
    paddingTop: spacing.md,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: fonts.sizes.md,
    color: colors.gray.medium,
  },
  errorText: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  errorMessage: {
    fontSize: fonts.sizes.md,
    color: colors.gray.medium,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  retryButton: {
    backgroundColor: colors.primary.main,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    ...shadows.medium,
  },
  retryButtonText: {
    color: colors.white,
    fontSize: fonts.sizes.md,
    fontWeight: fonts.weights.semibold,
  },
  emptyContainer: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: fonts.sizes.md,
    color: colors.gray.medium,
    textAlign: 'center',
  },
  card: { 
    marginBottom: spacing.md,
    padding: spacing.md,
    ...shadows.medium,
  },
  cardRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  imageContainer: {
    position: 'relative',
  },
  cardImage: {
    width: 120,
    height: 120,
    borderRadius: borderRadius.md,
    backgroundColor: colors.gray.lighter,
  },
  imagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: borderRadius.md,
    backgroundColor: colors.gray.lighter,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderEmoji: {
    fontSize: 48,
  },
  activeIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: colors.success,
    borderRadius: 12,
    padding: 6,
    ...shadows.medium,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.white,
  },
  cardContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  name: { 
    fontSize: fonts.sizes.md, 
    fontWeight: fonts.weights.bold, 
    color: colors.gray.dark,
    marginBottom: spacing.xs,
    lineHeight: 20,
  },
  infoContainer: {
    gap: 4,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoIcon: {
    fontSize: 12,
    width: 16,
  },
  infoText: {
    fontSize: fonts.sizes.xs,
    color: colors.gray.medium,
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  foodTypeBadge: {
    backgroundColor: colors.primary.light + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  foodTypeText: {
    fontSize: fonts.sizes.xs,
    color: colors.primary.main,
    fontWeight: fonts.weights.semibold,
    textTransform: 'capitalize',
  },
  arrowIcon: {
    fontSize: fonts.sizes.lg,
    color: colors.primary.main,
    fontWeight: fonts.weights.bold,
  },
});