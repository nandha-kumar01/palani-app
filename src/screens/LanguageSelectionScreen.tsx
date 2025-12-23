import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Image, Animated } from 'react-native';
import { LinearGradient } from '../components/WebLinearGradient';
import { colors, fonts, spacing } from '../utils/theme';
import { useLanguage } from '../context/LanguageContext';

const { width, height } = Dimensions.get('window');

interface LanguageSelectionScreenProps {
  onLanguageSelect: (language: 'en' | 'ta') => void;
}

export default function LanguageSelectionScreen({ onLanguageSelect }: LanguageSelectionScreenProps) {
  const { t, language } = useLanguage();
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'ta' | null>(language);
  const [buttonScale] = useState(new Animated.Value(1));

  const handleLanguageSelect = (language: 'en' | 'ta') => {
    setSelectedLanguage(language);
  };

  const animateButtonAndContinue = () => {
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setTimeout(() => {
        if (selectedLanguage) {
          onLanguageSelect(selectedLanguage);
        }
      }, 50);
    });
  };

  const getContinueButtonText = () => {
    if (selectedLanguage === 'en') {
      return 'Continue in English';
    } else if (selectedLanguage === 'ta') {
      return 'தமிழில் தொடரவும்';
    }
    return 'Select a Language';
  };

  const getHeadingText = () => {
    if (selectedLanguage === 'en') {
      return 'Choose Your preferred language';
    } else if (selectedLanguage === 'ta') {
      return 'உங்கள் விருப்பமான மொழியைத் தேர்ந்தெடுக்கவும்';
    }
    return 'Choose Your preferred language';
  };

  return (
    <LinearGradient
      colors={[colors.primary.start, colors.primary.end]}
      style={styles.container}
    >
      <View style={styles.content}>
        {/* Logo Section */}
        <View style={styles.logoContainer}>
          <Image 
            source={{ uri: 'https://res.cloudinary.com/dy5vca5ux/image/upload/v1761384953/Untitled-1_1_t9ptmt.png' }}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <View style={styles.titleContainer}>
          <Text style={[
            styles.title,
            selectedLanguage === 'ta' && styles.titleTamil
          ]}>{getHeadingText()}</Text>
        </View>

        <View style={styles.languageContainer}>
          <View style={styles.languageGrid}>
            <TouchableOpacity
              style={[
                styles.languageCard, 
                styles.englishCard,
                selectedLanguage === 'en' && styles.selectedCard
              ]}
              onPress={() => handleLanguageSelect('en')}
              activeOpacity={0.8}
            >
              {selectedLanguage === 'en' && (
                <View style={styles.tickContainer}>
                  <Text style={styles.tickMark}>✓</Text>
                </View>
              )}
              <Text style={styles.languageCardText}>English</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.languageCard, 
                styles.tamilCard,
                selectedLanguage === 'ta' && styles.selectedCard
              ]}
              onPress={() => handleLanguageSelect('ta')}
              activeOpacity={0.8}
            >
              {selectedLanguage === 'ta' && (
                <View style={styles.tickContainer}>
                  <Text style={styles.tickMark}>✓</Text>
                </View>
              )}
              <Text style={styles.languageCardText}>தமிழ்</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Continue Button */}
        <Animated.View style={[styles.continueButtonContainer, { transform: [{ scale: buttonScale }] }]}>
          <TouchableOpacity 
            style={[
              styles.continueButton,
              !selectedLanguage && styles.continueButtonDisabled
            ]}
            onPress={animateButtonAndContinue}
            disabled={!selectedLanguage}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={selectedLanguage ? [colors.white, colors.white] : ['#f0f0f0', '#e0e0e0']}
              style={styles.continueButtonGradient}
            >
              <Text style={[
                styles.continueButtonText,
                !selectedLanguage && styles.continueButtonTextDisabled
              ]}>
                {getContinueButtonText()}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    width: '100%',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 100,
    height: 100,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 50,
    minHeight: 80,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    color: colors.white,
    textAlign: 'center',
    lineHeight: 28,
        fontWeight: fonts.weights.bold,
  },
  titleTamil: {
    fontSize: 22,
     color: colors.white,
    textAlign: 'center',
    lineHeight: 28,
        fontWeight: fonts.weights.bold,

  },
  languageContainer: {
    width: '100%',
    marginBottom: 60,
  },
  languageGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  languageCard: {
    width: '45%',
    height: 80,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    position: 'relative',
  },
  englishCard: {
    backgroundColor: colors.primary.start,
  },
  tamilCard: {
    backgroundColor: colors.primary.end,
  },
  selectedCard: {
    elevation: 6,
    shadowOpacity: 0.3,
    transform: [{ scale: 1.02 }],
  },
  languageCardText: {
    fontSize: 20,
    fontWeight: fonts.weights.bold,
    color: colors.white,
    textAlign: 'center',
  },
  tickContainer: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: colors.white,
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  tickMark: {
    fontSize: 16,
    fontWeight: fonts.weights.bold,
    color: colors.success || '#28a745',
  },
  footerText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  continueButtonContainer: {
    width: '100%',
    paddingHorizontal: 20,
  },
  continueButton: {
    borderRadius: 25,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  continueButtonDisabled: {
    elevation: 2,
    shadowOpacity: 0.1,
  },
  continueButtonGradient: {
    paddingVertical: 16,
    paddingHorizontal: spacing.xl,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: fonts.weights.bold,
    color: colors.primary.start,
    textAlign: 'center',
    lineHeight: 24,
  },
  continueButtonTextDisabled: {
    color: colors.gray.medium,
  },
});