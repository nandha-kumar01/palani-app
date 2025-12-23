import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import { Camera } from 'expo-camera';
import { Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface CameraOptions {
  quality?: number;
  allowsEditing?: boolean;
  aspect?: [number, number];
  base64?: boolean;
}

interface PhotoMetadata {
  id: string;
  uri: string;
  filename: string;
  timestamp: string;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  tags: string[];
  description?: string;
  walkId?: string;
  templeId?: string;
  groupWalkId?: string;
  isShared: boolean;
  likes: number;
  comments: any[];
}

class CameraService {
  private static instance: CameraService;
  private isInitialized = false;
  private hasPermissions = false;

  static getInstance(): CameraService {
    if (!CameraService.instance) {
      CameraService.instance = new CameraService();
    }
    return CameraService.instance;
  }

  // Initialize camera service
  async initialize(): Promise<boolean> {
    if (this.isInitialized) return this.hasPermissions;

    try {
      // Request camera permissions
      const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
      const mediaLibraryPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();

      this.hasPermissions = 
        cameraPermission.status === 'granted' && 
        mediaLibraryPermission.status === 'granted';

      if (!this.hasPermissions) {
        Alert.alert(
          'Permissions Required',
          'Camera and media library permissions are needed to capture and save photos.',
          [{ text: 'OK' }]
        );
        return false;
      }

      this.isInitialized = true;
      console.log('📸 Camera service initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize camera service:', error);
      return false;
    }
  }

  // Take photo with camera
  async takePicture(options: CameraOptions = {}): Promise<PhotoMetadata | null> {
    const hasPermission = await this.initialize();
    if (!hasPermission) return null;

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: options.allowsEditing ?? true,
        aspect: options.aspect ?? [4, 3],
        quality: options.quality ?? 0.8,
        base64: options.base64 ?? false,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const photoMetadata = await this.createPhotoMetadata(asset.uri, asset.fileName);
        await this.savePhotoToLibrary(photoMetadata);
        return photoMetadata;
      }

      return null;
    } catch (error) {
      console.error('Failed to take picture:', error);
      Alert.alert('Error', 'Failed to take picture. Please try again.');
      return null;
    }
  }

  // Pick image from gallery
  async pickFromGallery(options: CameraOptions = {}): Promise<PhotoMetadata | null> {
    const hasPermission = await this.initialize();
    if (!hasPermission) return null;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: options.allowsEditing ?? true,
        aspect: options.aspect ?? [4, 3],
        quality: options.quality ?? 0.8,
        base64: options.base64 ?? false,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const photoMetadata = await this.createPhotoMetadata(asset.uri, asset.fileName);
        return photoMetadata;
      }

      return null;
    } catch (error) {
      console.error('Failed to pick image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
      return null;
    }
  }

  // Pick multiple images
  async pickMultipleImages(): Promise<PhotoMetadata[]> {
    const hasPermission = await this.initialize();
    if (!hasPermission) return [];

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        selectionLimit: 10,
        quality: 0.8,
      });

      if (!result.canceled && result.assets) {
        const photoPromises = result.assets.map(async (asset) => {
          return await this.createPhotoMetadata(asset.uri, asset.fileName);
        });

        return await Promise.all(photoPromises);
      }

      return [];
    } catch (error) {
      console.error('Failed to pick multiple images:', error);
      return [];
    }
  }

  // Show camera/gallery selection dialog
  async showImagePickerOptions(): Promise<PhotoMetadata | null> {
    return new Promise((resolve) => {
      Alert.alert(
        'Select Photo',
        'Choose how you want to select a photo',
        [
          { text: 'Camera', onPress: async () => resolve(await this.takePicture()) },
          { text: 'Gallery', onPress: async () => resolve(await this.pickFromGallery()) },
          { text: 'Cancel', style: 'cancel', onPress: () => resolve(null) },
        ]
      );
    });
  }

  // Create photo metadata
  private async createPhotoMetadata(uri: string, filename?: string): Promise<PhotoMetadata> {
    const timestamp = new Date().toISOString();
    const id = `photo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      id,
      uri,
      filename: filename || `photo_${timestamp.slice(0, 10)}.jpg`,
      timestamp,
      tags: [],
      isShared: false,
      likes: 0,
      comments: [],
    };
  }

  // Save photo to user's gallery library
  private async savePhotoToLibrary(photo: PhotoMetadata): Promise<void> {
    try {
      const photos = await this.getUserPhotos();
      photos.unshift(photo);
      await AsyncStorage.setItem('userPhotos', JSON.stringify(photos));
      console.log('📱 Photo saved to user library');
    } catch (error) {
      console.error('Failed to save photo to library:', error);
    }
  }

  // Get user's photos from storage
  async getUserPhotos(): Promise<PhotoMetadata[]> {
    try {
      const photos = await AsyncStorage.getItem('userPhotos');
      return photos ? JSON.parse(photos) : [];
    } catch (error) {
      console.error('Failed to get user photos:', error);
      return [];
    }
  }

  // Add tags to photo
  async addTagsToPhoto(photoId: string, tags: string[]): Promise<void> {
    try {
      const photos = await this.getUserPhotos();
      const updatedPhotos = photos.map(photo => 
        photo.id === photoId 
          ? { ...photo, tags: [...new Set([...photo.tags, ...tags])] }
          : photo
      );
      await AsyncStorage.setItem('userPhotos', JSON.stringify(updatedPhotos));
    } catch (error) {
      console.error('Failed to add tags to photo:', error);
    }
  }

  // Add description to photo
  async addDescriptionToPhoto(photoId: string, description: string): Promise<void> {
    try {
      const photos = await this.getUserPhotos();
      const updatedPhotos = photos.map(photo => 
        photo.id === photoId ? { ...photo, description } : photo
      );
      await AsyncStorage.setItem('userPhotos', JSON.stringify(updatedPhotos));
    } catch (error) {
      console.error('Failed to add description to photo:', error);
    }
  }

  // Link photo to walk/temple
  async linkPhotoToActivity(
    photoId: string, 
    activityType: 'walk' | 'temple' | 'group_walk',
    activityId: string
  ): Promise<void> {
    try {
      const photos = await this.getUserPhotos();
      const updatedPhotos = photos.map(photo => {
        if (photo.id === photoId) {
          const updates: any = {};
          if (activityType === 'walk') updates.walkId = activityId;
          if (activityType === 'temple') updates.templeId = activityId;
          if (activityType === 'group_walk') updates.groupWalkId = activityId;
          return { ...photo, ...updates };
        }
        return photo;
      });
      await AsyncStorage.setItem('userPhotos', JSON.stringify(updatedPhotos));
    } catch (error) {
      console.error('Failed to link photo to activity:', error);
    }
  }

  // Share photo
  async sharePhoto(photoId: string): Promise<void> {
    try {
      const photos = await this.getUserPhotos();
      const updatedPhotos = photos.map(photo => 
        photo.id === photoId ? { ...photo, isShared: true } : photo
      );
      await AsyncStorage.setItem('userPhotos', JSON.stringify(updatedPhotos));
      
      // Here you would integrate with your backend to share the photo
      console.log('📤 Photo shared to community');
    } catch (error) {
      console.error('Failed to share photo:', error);
    }
  }

  // Get photos by activity
  async getPhotosByActivity(activityType: 'walk' | 'temple' | 'group_walk', activityId: string): Promise<PhotoMetadata[]> {
    try {
      const photos = await this.getUserPhotos();
      return photos.filter(photo => {
        if (activityType === 'walk') return photo.walkId === activityId;
        if (activityType === 'temple') return photo.templeId === activityId;
        if (activityType === 'group_walk') return photo.groupWalkId === activityId;
        return false;
      });
    } catch (error) {
      console.error('Failed to get photos by activity:', error);
      return [];
    }
  }

  // Get photos by tags
  async getPhotosByTags(tags: string[]): Promise<PhotoMetadata[]> {
    try {
      const photos = await this.getUserPhotos();
      return photos.filter(photo => 
        tags.some(tag => photo.tags.includes(tag))
      );
    } catch (error) {
      console.error('Failed to get photos by tags:', error);
      return [];
    }
  }

  // Delete photo
  async deletePhoto(photoId: string): Promise<void> {
    try {
      const photos = await this.getUserPhotos();
      const updatedPhotos = photos.filter(photo => photo.id !== photoId);
      await AsyncStorage.setItem('userPhotos', JSON.stringify(updatedPhotos));
      console.log('🗑️ Photo deleted');
    } catch (error) {
      console.error('Failed to delete photo:', error);
    }
  }

  // Get photo statistics
  async getPhotoStats(): Promise<{
    totalPhotos: number;
    walkPhotos: number;
    templePhotos: number;
    groupWalkPhotos: number;
    sharedPhotos: number;
    totalLikes: number;
  }> {
    try {
      const photos = await this.getUserPhotos();
      
      return {
        totalPhotos: photos.length,
        walkPhotos: photos.filter(p => p.walkId).length,
        templePhotos: photos.filter(p => p.templeId).length,
        groupWalkPhotos: photos.filter(p => p.groupWalkId).length,
        sharedPhotos: photos.filter(p => p.isShared).length,
        totalLikes: photos.reduce((sum, p) => sum + p.likes, 0),
      };
    } catch (error) {
      console.error('Failed to get photo stats:', error);
      return {
        totalPhotos: 0,
        walkPhotos: 0,
        templePhotos: 0,
        groupWalkPhotos: 0,
        sharedPhotos: 0,
        totalLikes: 0,
      };
    }
  }

  // Export photos (for backup)
  async exportPhotos(): Promise<PhotoMetadata[]> {
    return await this.getUserPhotos();
  }

  // Import photos (from backup)
  async importPhotos(photos: PhotoMetadata[]): Promise<void> {
    try {
      const existingPhotos = await this.getUserPhotos();
      const mergedPhotos = [...existingPhotos, ...photos];
      
      // Remove duplicates based on id
      const uniquePhotos = mergedPhotos.filter((photo, index, self) => 
        index === self.findIndex(p => p.id === photo.id)
      );
      
      await AsyncStorage.setItem('userPhotos', JSON.stringify(uniquePhotos));
      console.log('📥 Photos imported successfully');
    } catch (error) {
      console.error('Failed to import photos:', error);
    }
  }
}

// Export singleton instance
export default CameraService.getInstance();