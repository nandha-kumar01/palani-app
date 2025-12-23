import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { LinearGradient } from '../components/WebLinearGradient';
import { GradientButton } from '../components/GradientButton';
import { CustomTextInput } from '../components/CustomTextInput';
import { WhiteCard } from '../components/GlassCard';
import { colors, fonts, spacing, borderRadius } from '../utils/theme';
import { User } from '../types';
import { generateId } from '../utils/helpers';

interface ProfileSetupScreenProps {
  onComplete: (userData: User) => void;
  initialData?: {
    name?: string;
    email?: string;
    phone?: string;
  };
}

export default function ProfileSetupScreen({ onComplete, initialData }: ProfileSetupScreenProps) {
  const [profilePicture, setProfilePicture] = useState<string | undefined>();
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    age: '',
    gender: '' as 'male' | 'female' | 'other' | '',
    emergencyContact: '',
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (formData.age && (isNaN(Number(formData.age)) || Number(formData.age) < 1 || Number(formData.age) > 120)) {
      newErrors.age = 'Please enter a valid age';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProfilePictureSelect = () => {
    Alert.alert(
      'Profile Picture',
      'Choose an option',
      [
        { text: 'Camera', onPress: () => selectFromCamera() },
        { text: 'Gallery', onPress: () => selectFromGallery() },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const selectFromCamera = () => {
    // Simulate camera selection
    setProfilePicture('https://via.placeholder.com/150/667eea/FFFFFF?text=📷');
  };

  const selectFromGallery = () => {
    // Simulate gallery selection
    setProfilePicture('https://via.placeholder.com/150/764ba2/FFFFFF?text=👤');
  };

  const handleComplete = () => {
    if (!validateForm()) return;

    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const userData: User = {
        id: generateId(),
        name: formData.name,
        email: initialData?.email || '',
        phone: initialData?.phone || '',
        profilePicture,
        age: formData.age ? Number(formData.age) : undefined,
        gender: formData.gender || undefined,
        emergencyContact: formData.emergencyContact || undefined,
        createdAt: new Date(),
      };

      onComplete(userData);
      setLoading(false);
    }, 1000);
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <LinearGradient
      colors={[colors.primary.start, colors.primary.end]}
      style={styles.container}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Complete Profile</Text>
            <Text style={styles.titleTamil}>சுயவிவரம் முடிக்கவும்</Text>
            <Text style={styles.subtitle}>Help us personalize your experience</Text>
          </View>

          <WhiteCard style={styles.card}>
            <View style={styles.profilePictureSection}>
              <TouchableOpacity 
                style={styles.profilePictureContainer}
                onPress={handleProfilePictureSelect}
              >
                {profilePicture ? (
                  <Image source={{ uri: profilePicture }} style={styles.profilePicture} />
                ) : (
                  <View style={styles.profilePicturePlaceholder}>
                    <Text style={styles.profilePictureIcon}>📷</Text>
                    <Text style={styles.profilePictureText}>Add Photo</Text>
                  </View>
                )}
                <View style={styles.editIconContainer}>
                  <Text style={styles.editIcon}>✏️</Text>
                </View>
              </TouchableOpacity>
            </View>

            <CustomTextInput
              label="Full Name / முழு பெயர்"
              placeholder="Enter your full name"
              value={formData.name}
              onChangeText={(value) => updateFormData('name', value)}
              error={errors.name}
              icon={<Text style={styles.inputIcon}>👤</Text>}
            />

            <CustomTextInput
              label="Age / வயது (Optional)"
              placeholder="Enter your age"
              value={formData.age}
              onChangeText={(value) => updateFormData('age', value)}
              keyboardType="numeric"
              error={errors.age}
              icon={<Text style={styles.inputIcon}>🎂</Text>}
            />

            <View style={styles.genderSection}>
              <Text style={styles.genderLabel}>Gender / பாலினம் (Optional)</Text>
              <View style={styles.genderOptions}>
                {[
                  { value: 'male', label: 'Male', icon: '👨' },
                  { value: 'female', label: 'Female', icon: '👩' },
                  { value: 'other', label: 'Other', icon: '👤' },
                ].map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.genderOption,
                      formData.gender === option.value && styles.genderOptionSelected
                    ]}
                    onPress={() => updateFormData('gender', option.value)}
                  >
                    <Text style={styles.genderOptionIcon}>{option.icon}</Text>
                    <Text style={[
                      styles.genderOptionText,
                      formData.gender === option.value && styles.genderOptionTextSelected
                    ]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <CustomTextInput
              label="Emergency Contact / அவசர தொடர்பு (Optional)"
              placeholder="Emergency contact number"
              value={formData.emergencyContact}
              onChangeText={(value) => updateFormData('emergencyContact', value)}
              keyboardType="phone-pad"
              icon={<Text style={styles.inputIcon}>🚨</Text>}
            />

            <GradientButton 
              onPress={handleComplete} 
              disabled={loading}
              style={styles.completeButton}
            >
              {loading ? 'Setting up...' : 'Complete Setup'}
            </GradientButton>

            <TouchableOpacity style={styles.skipButton}>
              <Text style={styles.skipText}>Skip for now</Text>
            </TouchableOpacity>
          </WhiteCard>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: fonts.sizes.xxxl,
    fontWeight: fonts.weights.bold,
    color: colors.white,
    textAlign: 'center',
  },
  titleTamil: {
    fontSize: fonts.sizes.lg,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  subtitle: {
    fontSize: fonts.sizes.md,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginTop: spacing.md,
  },
  card: {
    paddingVertical: spacing.xl,
  },
  profilePictureSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  profilePictureContainer: {
    position: 'relative',
  },
  profilePicture: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  profilePicturePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.gray.light,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.gray.medium,
    borderStyle: 'dashed',
  },
  profilePictureIcon: {
    fontSize: 30,
    marginBottom: spacing.xs,
  },
  profilePictureText: {
    fontSize: fonts.sizes.sm,
    color: colors.gray.medium,
    fontWeight: fonts.weights.medium,
  },
  editIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.primary.start,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editIcon: {
    fontSize: 12,
  },
  inputIcon: {
    fontSize: 16,
  },
  genderSection: {
    marginBottom: spacing.md,
  },
  genderLabel: {
    fontSize: fonts.sizes.sm,
    fontWeight: fonts.weights.medium,
    color: colors.gray.dark,
    marginBottom: spacing.sm,
  },
  genderOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  genderOption: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
    marginHorizontal: spacing.xs,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.gray.light,
    backgroundColor: colors.white,
  },
  genderOptionSelected: {
    borderColor: colors.primary.start,
    backgroundColor: colors.primary.start + '10',
  },
  genderOptionIcon: {
    fontSize: 24,
    marginBottom: spacing.xs,
  },
  genderOptionText: {
    fontSize: fonts.sizes.sm,
    color: colors.gray.dark,
    fontWeight: fonts.weights.medium,
  },
  genderOptionTextSelected: {
    color: colors.primary.start,
    fontWeight: fonts.weights.semibold,
  },
  completeButton: {
    marginBottom: spacing.lg,
  },
  skipButton: {
    alignSelf: 'center',
  },
  skipText: {
    fontSize: fonts.sizes.md,
    color: colors.gray.medium,
    textDecorationLine: 'underline',
  },
});