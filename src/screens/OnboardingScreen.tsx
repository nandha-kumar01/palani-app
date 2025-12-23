import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Image,
  TouchableOpacity,
  FlatList,
  Animated,
  StatusBar,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { useLanguage } from '../context/LanguageContext';

const { width, height } = Dimensions.get('window');

const getSlidesData = (language: 'en' | 'ta' | null) => [
  {
    id: '1',
    title: language === 'ta' ? 'உங்கள் ஆன்மீக பயணம்' : 'Your Spiritual Journey',
    description: language === 'ta' 
      ? 'முருகன் கோயிலுக்கான புனித பாதையில் ஆயிரக்கணக்கான பக்தர்களுடன் சேருங்கள். இந்த புனித யாத்திரையின் தெய்வீக ஆசீர்வாதத்தை அனுபவியுங்கள்.'
      : 'Join thousands of devotees on the sacred path to Lord Murugan\'s temple. Experience the divine blessing of this sacred pilgrimage.',
    bgColor: '#A5D8FF',
    image: { uri: 'https://res.cloudinary.com/dy5vca5ux/image/upload/v1755443253/Gold_Bangle_256_l9zz5r.jpg' },
  },
  {
    id: '2',
    title: language === 'ta' ? 'அம்சங்களை ஆராயுங்கள்' : 'Explore Features',
    description: language === 'ta'
      ? 'உங்கள் பயணத்தை கண்காணிக்கவும், சக பக்தர்களுடன் இணைக்கவும், கோயில் தகவல்களை அணுகவும், உங்கள் ஆன்மீக அனுபவத்தை வளப்படுத்தவும்.'
      : 'Track your journey, connect with fellow devotees, access temple information, and enrich your spiritual experience.',
    bgColor: '#FFC6C6',
    image: { uri: 'https://res.cloudinary.com/dy5vca5ux/image/upload/v1755443253/Gold_Bangle_256_l9zz5r.jpg' },
  },
  {
    id: '3',
    title: language === 'ta' ? 'பயணத்தைத் தொடங்குங்கள்' : 'Begin Your Sacred Journey',
    description: language === 'ta'
      ? 'எல்லாம் தயார்! தெய்வீக ஆசீர்வாதங்களுடன் உங்கள் பதயாத்திரையைத் தொடங்கி ஆன்மீக சமுதாயத்துடன் இணைந்துகொள்ளுங்கள்.'
      : 'Everything is ready! Start your pathayathirai with divine blessings and connect with the spiritual community.',
    bgColor: '#CDBEFF',
    image: { uri: 'https://res.cloudinary.com/dy5vca5ux/image/upload/v1755443253/Gold_Bangle_256_l9zz5r.jpg' },
  },
];

interface OnboardingScreenProps {
  onComplete: () => void;
}

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const { language, t } = useLanguage();
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const slides = getSlidesData(language);

  const viewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) setCurrentIndex(viewableItems[0].index);
  }).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

      <FlatList
        data={slides}
        ref={flatListRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        bounces={false}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width }]}>
            {/* Top Section */}
            <View style={[styles.topSection, { backgroundColor: item.bgColor }]}>
              <View style={styles.imageContainer}>
                <Image source={item.image} style={styles.image} />
              </View>
              {/* Smooth white curve */}
              <Svg
                height={100}
                width={width}
                viewBox={`0 0 ${width} 100`}
                style={styles.curveSvg}
              >
                <Path
                  d={`M0,100 Q${width * 0.25},30 ${width * 0.5},60 Q${width * 0.75},90 ${width},30 L${width},100 Z`}
                  fill="#fff"
                />
              </Svg>
            </View>

            {/* Bottom Section */}
            <View style={styles.bottomSection}>
              <View style={styles.textContainer}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.description}>{item.description}</Text>
              </View>

              <View style={styles.bottomRow}>
                <TouchableOpacity onPress={handleSkip}>
                  <Text style={styles.skipText}>
                    {language === 'ta' ? 'தவிர்க்கவும்' : 'Skip'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.nextButtonContainer} onPress={handleNext} activeOpacity={0.9}>
                  <LinearGradient
                    colors={['#667eea', '#764ba2']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.nextButton}
                  >
                    <View style={styles.arrowIcon}>
                      <View style={styles.arrowShape}>
                        <View style={styles.arrowLine} />
                        <View style={styles.arrowHead} />
                      </View>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onViewableItemsChanged={viewableItemsChanged}
        viewabilityConfig={viewConfig}
      />

      {/* Dots Indicator */}
      <View style={styles.indicatorContainer}>
        {slides.map((_, i) => {
          const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
          const dotWidth = scrollX.interpolate({
            inputRange,
            outputRange: [8, 24, 8],
            extrapolate: 'clamp',
          });
          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.3, 1, 0.3],
            extrapolate: 'clamp',
          });
          return (
            <Animated.View
              key={i}
              style={[styles.dot, { width: dotWidth, opacity }]}
            />
          );
        })}
      </View>
    </View>
  );
};

export default OnboardingScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  slide: {
    flex: 1,
    backgroundColor: '#fff',
  },
  topSection: {
    height: height * 0.65,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  imageContainer: {
    height: '100%',
    width: '100%',
    alignItems: 'stretch',
    justifyContent: 'flex-start',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'stretch',
  },
  curveSvg: {
    position: 'absolute',
    bottom: -1, // ensures curve touches bottom perfectly
    zIndex: 2,
  },
  bottomSection: {
    height: height * 0.40,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 30,
    paddingBottom: 30,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 25,
    paddingHorizontal: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#222',
    marginBottom: 12,
    textAlign: 'center',
    lineHeight: 30,
  },
  description: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 10,
  },
  bottomRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 5,
    marginBottom: 10,
  },
  skipText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  nextButtonContainer: {
    shadowColor: '#667eea',
    shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 15,
    elevation: 12,
  },
  nextButton: {
    width: 50,
    height: 50,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0,
    position: 'relative',
  },
  arrowIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 24,
    height: 24,
  },
  arrowShape: {
    position: 'relative',
    width: 20,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowLine: {
    width: 14,
    height: 2,
    backgroundColor: '#ffffff',
    borderRadius: 1,
    position: 'absolute',
    left: 0,
  },
  arrowHead: {
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 0,
    borderTopWidth: 6,
    borderBottomWidth: 6,
    borderLeftColor: '#ffffff',
    borderRightColor: 'transparent',
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    position: 'absolute',
    right: 0,
  },
  arrow: {
    color: '#667eea',
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'center',
    textAlignVertical: 'center',
    includeFontPadding: false,
    textShadowColor: 'rgba(102, 126, 234, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  indicatorContainer: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 30,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#667eea',
    marginHorizontal: 3,
  },
});
