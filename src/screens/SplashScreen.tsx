import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, Animated, Image, ActivityIndicator } from 'react-native';
import { LinearGradient } from '../components/WebLinearGradient';
import { colors, fonts } from '../utils/theme';
import { useLanguage } from '../context/LanguageContext';

const { width, height } = Dimensions.get('window');

interface SplashScreenProps {
  onFinish: () => void;
}

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  const { t } = useLanguage();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const dot1Anim = useRef(new Animated.Value(0.3)).current;
  const dot2Anim = useRef(new Animated.Value(0.3)).current;
  const dot3Anim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Start pulsing dots animation
    const createPulseAnimation = (animValue: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.timing(animValue, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(animValue, {
            toValue: 0.3,
            duration: 600,
            useNativeDriver: true,
          }),
        ]),
        { iterations: -1 }
      );
    };

    // Start animations with delays for wave effect
    setTimeout(() => createPulseAnimation(dot1Anim, 0).start(), 0);
    setTimeout(() => createPulseAnimation(dot2Anim, 200).start(), 200);
    setTimeout(() => createPulseAnimation(dot3Anim, 400).start(), 400);
  }, []);

  return (
    <LinearGradient
      colors={[colors.primary.start, colors.primary.end]}
      style={styles.container}
    >
      <Animated.View style={[
        styles.content,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}>
        <Image 
          source={{ uri: 'https://res.cloudinary.com/dy5vca5ux/image/upload/v1761384953/Untitled-1_1_t9ptmt.png' }}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.appTitle}>{t('appName')}</Text>
        <View style={styles.loadingContainer}>
          <View style={styles.dotsContainer}>
            <Animated.View style={[
              styles.dot,
              { opacity: dot1Anim, transform: [{ scale: dot1Anim }] }
            ]} />
            <Animated.View style={[
              styles.dot,
              { opacity: dot2Anim, transform: [{ scale: dot2Anim }] }
            ]} />
            <Animated.View style={[
              styles.dot,
              { opacity: dot3Anim, transform: [{ scale: dot3Anim }] }
            ]} />
          </View>
        </View>
      </Animated.View>
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
    paddingHorizontal: 20,
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  loadingContainer: {
    marginTop: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  dot: {
    width: 9,
    height: 9,
    borderRadius: 6,
    backgroundColor: colors.white,
    marginHorizontal: 4,
  },
  loadingText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: fonts.weights.medium,
    textAlign: 'center',
  },
  appTitle: {
    fontSize: 32,
    fontWeight: fonts.weights.bold,
    color: colors.white,
    textAlign: 'center',
    letterSpacing: 1,
  },
  muruganContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  omIcon: {
    fontSize: 40,
    color: colors.white,
    marginBottom: 20,
  },
  muruganArt: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  lordText: {
    fontSize: 60,
    color: '#FFD700',
    fontWeight: fonts.weights.bold,
    marginHorizontal: 10,
  },
  muruganFace: {
    fontSize: 80,
    marginHorizontal: 15,
  },
  loadingSpinner: {
    marginTop: 10,
  },
  spinnerText: {
    fontSize: 40,
    color: '#FFD700',
  },
  appNameTamil: {
    fontSize: 28,
    fontWeight: fonts.weights.bold,
    color: colors.white,
    marginBottom: 8,
    textAlign: 'center',
  },
  appNameEnglish: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 30,
    textAlign: 'center',
  },
  blessingsContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  blessing: {
    fontSize: 16,
    color: '#FFD700',
    marginBottom: 8,
    textAlign: 'center',
  },

});