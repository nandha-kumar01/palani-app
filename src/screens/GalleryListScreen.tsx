import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  RefreshControl,
  Platform,
} from 'react-native';
import { LinearGradient } from '../components/WebLinearGradient';
import { colors, spacing } from '../utils/theme';
import { useLanguage } from '../context/LanguageContext';
import { apiHelper } from '../utils/apiHelper';

interface GalleryItem {
  _id: string;
  title: string;
  description: string;
  imageUrl: string;
  uploadedBy: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface GalleryListScreenProps {
  navigation: any;
}

export default function GalleryListScreen({ navigation }: GalleryListScreenProps) {
  const { language, t } = useLanguage();
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchGalleryData();
  }, []);

  const fetchGalleryData = async () => {
    try {
      setLoading(true);
      const response = await apiHelper.get('/gallery');
      console.log('📸 Gallery API Response:', response);
      
      if (response.success && response.data) {
        setGalleryItems(response.data);
        console.log('✅ Gallery items loaded:', response.data.length);
      }
    } catch (error) {
      console.error('❌ Error fetching gallery:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchGalleryData();
    setRefreshing(false);
  };

  const handleItemPress = (item: GalleryItem) => {
    navigation.navigate('GalleryDetail', { item });
  };

  const renderItem = ({ item }: { item: GalleryItem }) => (
    <TouchableOpacity 
      style={styles.galleryItem} 
      onPress={() => handleItemPress(item)}
      activeOpacity={0.8}
    >
      <View style={styles.imageCard}>
        <Image 
          source={{ uri: item.imageUrl }} 
          style={styles.gridImage}
          resizeMode="cover"
        />
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={[colors.primary.start, colors.primary.end]} style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {language === 'ta' ? '📸 படத்தொகுப்பு' : '📸 Gallery'}
          </Text>
        </LinearGradient>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary.start} />
          <Text style={styles.loadingText}>
            {language === 'ta' ? 'படங்களை ஏற்றுகிறது...' : 'Loading images...'}
          </Text>
        </View>
      </View>
    );
  }

  if (galleryItems.length === 0) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={[colors.primary.start, colors.primary.end]} style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {language === 'ta' ? '📸 படத்தொகுப்பு' : '📸 Gallery'}
          </Text>
        </LinearGradient>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🖼️</Text>
          <Text style={styles.emptyText}>
            {language === 'ta' ? 'படங்கள் இல்லை' : 'No images found'}
          </Text>
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
        <Text style={styles.headerTitle}>
          {language === 'ta' ? '📸 படத்தொகுப்பு' : '📸 Gallery'}
        </Text>
        <View style={styles.headerBadge}>
          <Text style={styles.headerBadgeText}>{galleryItems.length}</Text>
        </View>
      </LinearGradient>

      <FlatList
        data={galleryItems}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        numColumns={2}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        columnWrapperStyle={styles.columnWrapper}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={[colors.primary.start]}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
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
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    flex: 1,
  },
  headerBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  headerBadgeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
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
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: spacing.lg,
  },
  emptyText: {
    fontSize: 18,
    color: colors.gray.medium,
    textAlign: 'center',
  },
  listContainer: {
    padding: spacing.sm,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  galleryItem: {
    width: '48.5%',
  },
  imageCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  gridImage: {
    width: '100%',
    height: 180,
    backgroundColor: '#f0f0f0',
  },
});
