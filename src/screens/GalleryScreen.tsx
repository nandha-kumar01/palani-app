import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Modal,
  Image,
  Alert,
} from 'react-native';
import { LinearGradient } from '../components/WebLinearGradient';
import { GradientButton } from '../components/GradientButton';
import { WhiteCard } from '../components/GlassCard';
import { colors, fonts, spacing, borderRadius } from '../utils/theme';
import { GalleryImage } from '../types';
import { useApp } from '../context/AppContext';

interface GalleryScreenProps {
  navigation: any;
}

// Mock data for gallery images
const mockGalleryData: GalleryImage[] = [
  {
    id: '1',
    uri: 'https://via.placeholder.com/300x200/667eea/FFFFFF?text=Palani+Temple',
    title: 'Palani Temple Main View',
    description: 'Beautiful view of the main temple',
    uploadedBy: 'admin',
    isAdmin: true,
    createdAt: new Date(),
  },
  {
    id: '2',
    uri: 'https://via.placeholder.com/300x200/764ba2/FFFFFF?text=Pathayathirai',
    title: 'Devotees Walking',
    description: 'Devotees on their spiritual journey',
    uploadedBy: 'admin',
    isAdmin: true,
    createdAt: new Date(),
  },
  {
    id: '3',
    uri: 'https://via.placeholder.com/300x200/FF6B6B/FFFFFF?text=Sunrise',
    title: 'Sunrise at Hills',
    description: 'Beautiful sunrise captured during morning walk',
    uploadedBy: 'user123',
    isAdmin: false,
    createdAt: new Date(),
  },
  {
    id: '4',
    uri: 'https://via.placeholder.com/300x200/4ECDC4/FFFFFF?text=Group+Walk',
    title: 'Group Pathayathirai',
    description: 'Our group walking together',
    uploadedBy: 'user456',
    isAdmin: false,
    createdAt: new Date(),
  },
];

export default function GalleryScreen({ navigation }: GalleryScreenProps) {
  const { user, language } = useApp();
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [galleryData] = useState(mockGalleryData);
  
  // Separate admin and user photos
  const adminPhotos = galleryData.filter(img => img.isAdmin);
  const userPhotos = galleryData.filter(img => !img.isAdmin);

  const handleImagePress = (image: GalleryImage) => {
    setSelectedImage(image);
    setShowModal(true);
  };

  const handleUploadPhoto = () => {
    Alert.alert(
      'Upload Photo',
      'Choose an option',
      [
        { text: 'Camera', onPress: () => selectFromCamera() },
        { text: 'Gallery', onPress: () => selectFromGallery() },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const selectFromCamera = () => {
    // In real app, this would open camera
    Alert.alert('Success', 'Photo captured and uploaded!');
  };

  const selectFromGallery = () => {
    // In real app, this would open gallery
    Alert.alert('Success', 'Photo selected and uploaded!');
  };

  const renderImageItem = ({ item }: { item: GalleryImage }) => (
    <TouchableOpacity 
      style={styles.imageItem}
      onPress={() => handleImagePress(item)}
    >
      <WhiteCard style={styles.imageCard}>
        <Image source={{ uri: item.uri }} style={styles.image} />
        <View style={styles.imageInfo}>
          <Text style={styles.imageTitle} numberOfLines={1}>
            {item.title || 'Untitled'}
          </Text>
          <Text style={styles.imageUploader}>
            {item.isAdmin ? '📌 Admin' : `👤 ${item.uploadedBy}`}
          </Text>
        </View>
        {item.isAdmin && (
          <View style={styles.adminPin}>
            <Text style={styles.adminPinText}>📌</Text>
          </View>
        )}
      </WhiteCard>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[colors.primary.start, colors.primary.end]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          
          <View style={styles.headerTitle}>
            <Text style={styles.headerTitleText}>
              {language === 'tamil' ? 'पडक्गल्' : 'Gallery'}
            </Text>
            <Text style={styles.headerSubtitle}>Sacred Memories</Text>
          </View>

          <TouchableOpacity 
            style={styles.uploadButton}
            onPress={handleUploadPhoto}
          >
            <Text style={styles.uploadButtonText}>📷</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content}>
        {/* Admin Photos Section */}
        {adminPhotos.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                📌 {language === 'tamil' ? 'प्रशासन फोटो' : 'Pinned Photos'}
              </Text>
              <Text style={styles.sectionSubtitle}>
                {language === 'tamil' ? 'प्रशासकद्वारा साझा गरिएको' : 'Shared by Admin'}
              </Text>
            </View>
            
            <FlatList
              data={adminPhotos}
              renderItem={renderImageItem}
              keyExtractor={(item) => item.id}
              numColumns={2}
              scrollEnabled={false}
              contentContainerStyle={styles.imageGrid}
            />
          </View>
        )}

        {/* User Photos Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              👥 {language === 'tamil' ? 'सामुदायिक फोटो' : 'Community Photos'}
            </Text>
            <Text style={styles.sectionSubtitle}>
              {language === 'tamil' ? 'भक्तहरूले साझा गरेका' : 'Shared by Devotees'}
            </Text>
          </View>
          
          <FlatList
            data={userPhotos}
            renderItem={renderImageItem}
            keyExtractor={(item) => item.id}
            numColumns={2}
            scrollEnabled={false}
            contentContainerStyle={styles.imageGrid}
          />
        </View>

        {/* Upload Section */}
        <WhiteCard style={styles.uploadSection}>
          <Text style={styles.uploadTitle}>
            {language === 'tamil' ? 'अपना फोटो साझा गर्नुहोस्' : 'Share Your Photos'}
          </Text>
          <Text style={styles.uploadDescription}>
            {language === 'tamil' 
              ? 'आफ्नो पथयात्राका सुन्दर क्षणहरू साझा गर्नुहोस्'
              : 'Share beautiful moments from your pathayathirai'
            }
          </Text>
          <GradientButton onPress={handleUploadPhoto} style={styles.uploadActionButton}>
            📸 {language === 'tamil' ? 'फोटो अपलोड गर्नुहोस्' : 'Upload Photo'}
          </GradientButton>
        </WhiteCard>
      </ScrollView>

      {/* Image Modal */}
      <Modal
        visible={showModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity 
            style={styles.modalOverlay}
            onPress={() => setShowModal(false)}
          >
            <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
              {selectedImage && (
                <>
                  <Image source={{ uri: selectedImage.uri }} style={styles.modalImage} />
                  <WhiteCard style={styles.modalInfo}>
                    <Text style={styles.modalTitle}>{selectedImage.title}</Text>
                    {selectedImage.description && (
                      <Text style={styles.modalDescription}>{selectedImage.description}</Text>
                    )}
                    <Text style={styles.modalUploader}>
                      {selectedImage.isAdmin ? '📌 Admin Photo' : `Uploaded by ${selectedImage.uploadedBy}`}
                    </Text>
                  </WhiteCard>
                </>
              )}
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={() => setShowModal(false)}
          >
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray.light,
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 24,
    color: colors.white,
  },
  headerTitle: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitleText: {
    fontSize: fonts.sizes.lg,
    fontWeight: fonts.weights.bold,
    color: colors.white,
  },
  headerSubtitle: {
    fontSize: fonts.sizes.sm,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  uploadButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadButtonText: {
    fontSize: 20,
  },
  content: {
    flex: 1,
  },
  section: {
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  sectionHeader: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: fonts.sizes.xl,
    fontWeight: fonts.weights.bold,
    color: colors.gray.dark,
    marginBottom: spacing.xs,
  },
  sectionSubtitle: {
    fontSize: fonts.sizes.sm,
    color: colors.gray.medium,
  },
  imageGrid: {
    justifyContent: 'space-between',
  },
  imageItem: {
    width: '48%',
    marginBottom: spacing.md,
  },
  imageCard: {
    paddingBottom: spacing.md,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 120,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    backgroundColor: colors.gray.light,
  },
  imageInfo: {
    paddingHorizontal: spacing.xs,
  },
  imageTitle: {
    fontSize: fonts.sizes.sm,
    fontWeight: fonts.weights.medium,
    color: colors.gray.dark,
    marginBottom: spacing.xs,
  },
  imageUploader: {
    fontSize: fonts.sizes.xs,
    color: colors.gray.medium,
  },
  adminPin: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: colors.primary.start,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  adminPinText: {
    fontSize: 12,
    color: colors.white,
  },
  uploadSection: {
    margin: spacing.lg,
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  uploadTitle: {
    fontSize: fonts.sizes.lg,
    fontWeight: fonts.weights.bold,
    color: colors.gray.dark,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  uploadDescription: {
    fontSize: fonts.sizes.sm,
    color: colors.gray.medium,
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  uploadActionButton: {
    paddingHorizontal: spacing.xl,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  modalContent: {
    width: '100%',
    alignItems: 'center',
  },
  modalImage: {
    width: '100%',
    height: 300,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.lg,
    resizeMode: 'cover',
  },
  modalInfo: {
    width: '100%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: fonts.sizes.lg,
    fontWeight: fonts.weights.bold,
    color: colors.gray.dark,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  modalDescription: {
    fontSize: fonts.sizes.md,
    color: colors.gray.dark,
    marginBottom: spacing.sm,
    textAlign: 'center',
    lineHeight: 22,
  },
  modalUploader: {
    fontSize: fonts.sizes.sm,
    color: colors.gray.medium,
    textAlign: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    color: colors.white,
    fontWeight: fonts.weights.bold,
  },
});