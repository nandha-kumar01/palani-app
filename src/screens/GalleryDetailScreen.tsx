import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Share,
  Platform,
  Dimensions,
} from 'react-native';
import { LinearGradient } from '../components/WebLinearGradient';
import { colors, spacing } from '../utils/theme';
import { useLanguage } from '../context/LanguageContext';

const { width } = Dimensions.get('window');

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

interface GalleryDetailScreenProps {
  navigation: any;
  route: {
    params: {
      item: GalleryItem;
    };
  };
}

export default function GalleryDetailScreen({ navigation, route }: GalleryDetailScreenProps) {
  const { language } = useLanguage();
  const { item } = route.params;
  const [imageLoaded, setImageLoaded] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'ta' ? 'ta-IN' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${item.title}\n\n${item.description}\n\n🌟 பழனி முருகன் கோவில் | Palani Murugan Temple`,
        url: item.imageUrl,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={[colors.primary.start, colors.primary.end]} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {language === 'ta' ? '📸 படம்' : '📸 Photo'}
        </Text>
        <TouchableOpacity onPress={handleShare} style={styles.shareButton}>
          <Text style={styles.shareButtonText}>📤</Text>
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Image Container */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: item.imageUrl }}
            style={styles.mainImage}
            resizeMode="cover"
            onLoad={() => setImageLoaded(true)}
          />
          {!imageLoaded && (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.placeholderText}>🖼️</Text>
            </View>
          )}
        </View>

        {/* Content Card */}
        <View style={styles.contentCard}>
          {/* Title Section */}
          <View style={styles.titleSection}>
            <View style={styles.decorativeLine} />
            <Text style={styles.title}>{item.title}</Text>
            <View style={styles.decorativeLine} />
          </View>

          {/* Date Badge */}
          <View style={styles.dateBadge}>
            <Text style={styles.dateIcon}>📅</Text>
            <Text style={styles.dateText}>{formatDate(item.createdAt)}</Text>
          </View>

          {/* Description Section */}
          <View style={styles.descriptionSection}>
            <View style={styles.quoteMarkLeft}>
              <Text style={styles.quoteText}>"</Text>
            </View>
            <Text style={styles.description}>{item.description}</Text>
            <View style={styles.quoteMarkRight}>
              <Text style={styles.quoteText}>"</Text>
            </View>
          </View>

          {/* Info Cards */}
          <View style={styles.infoCardsContainer}>
            <View style={styles.infoCard}>
              <Text style={styles.infoIcon}>🌟</Text>
              <Text style={styles.infoLabel}>
                {language === 'ta' ? 'நிலை' : 'Status'}
              </Text>
              <Text style={styles.infoValue}>
                {item.isActive 
                  ? (language === 'ta' ? 'செயலில்' : 'Active')
                  : (language === 'ta' ? 'செயலற்ற' : 'Inactive')
                }
              </Text>
            </View>

            <View style={styles.infoCard}>
              <Text style={styles.infoIcon}>🕉️</Text>
              <Text style={styles.infoLabel}>
                {language === 'ta' ? 'வகை' : 'Category'}
              </Text>
              <Text style={styles.infoValue}>
                {language === 'ta' ? 'கோவில்' : 'Temple'}
              </Text>
            </View>
          </View>

          {/* Share Section */}
          <TouchableOpacity style={styles.shareButtonLarge} onPress={handleShare}>
            <LinearGradient
              colors={[colors.primary.start, colors.primary.end]}
              style={styles.shareGradient}
            >
              <Text style={styles.shareButtonIcon}>📤</Text>
              <Text style={styles.shareButtonTextLarge}>
                {language === 'ta' ? 'பகிரவும்' : 'Share'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Blessing Section */}
          <View style={styles.blessingSection}>
            <Text style={styles.blessingIcon}>🙏</Text>
            <Text style={styles.blessingText}>
              {language === 'ta' 
                ? 'வெற்றிவேல் முருகனுக்கு அரோகரா!' 
                : 'Vetri Vel Muruganukku Arohara!'}
            </Text>
          </View>
        </View>
      </ScrollView>
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
  shareButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareButtonText: {
    fontSize: 20,
  },
  content: {
    flex: 1,
  },
  imageContainer: {
    width: '100%',
    height: 300,
    backgroundColor: '#f0f0f0',
    position: 'relative',
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  placeholderText: {
    fontSize: 60,
    opacity: 0.3,
  },
  contentCard: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -20,
    paddingTop: spacing.xl,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  decorativeLine: {
    width: 60,
    height: 3,
    backgroundColor: colors.primary.start,
    borderRadius: 2,
    marginVertical: spacing.sm,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.gray.dark,
    textAlign: 'center',
    lineHeight: 32,
    paddingHorizontal: spacing.md,
  },
  dateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF5E6',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    alignSelf: 'center',
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 140, 0, 0.3)',
  },
  dateIcon: {
    fontSize: 16,
    marginRight: spacing.xs,
  },
  dateText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary.start,
  },
  descriptionSection: {
    position: 'relative',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    backgroundColor: '#f9f9f9',
    borderRadius: 16,
    marginBottom: spacing.lg,
  },
  quoteMarkLeft: {
    position: 'absolute',
    top: -5,
    left: 10,
  },
  quoteMarkRight: {
    position: 'absolute',
    bottom: -5,
    right: 10,
  },
  quoteText: {
    fontSize: 50,
    color: colors.primary.start,
    opacity: 0.2,
    fontWeight: '700',
    lineHeight: 50,
  },
  description: {
    fontSize: 16,
    lineHeight: 26,
    color: colors.gray.dark,
    textAlign: 'left',
    fontStyle: 'italic',
  },
  infoCardsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  infoCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
    marginHorizontal: spacing.xs,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  infoIcon: {
    fontSize: 32,
    marginBottom: spacing.xs,
  },
  infoLabel: {
    fontSize: 12,
    color: colors.gray.medium,
    marginBottom: spacing.xs,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary.start,
  },
  shareButtonLarge: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: spacing.lg,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  shareGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
  },
  shareButtonIcon: {
    fontSize: 24,
    marginRight: spacing.sm,
  },
  shareButtonTextLarge: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  blessingSection: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    backgroundColor: '#FFF5E6',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(255, 140, 0, 0.2)',
  },
  blessingIcon: {
    fontSize: 40,
    marginBottom: spacing.sm,
  },
  blessingText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary.start,
    textAlign: 'center',
  },
});
