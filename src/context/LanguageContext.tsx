import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Language = 'en' | 'ta';

interface LanguageContextType {
  language: Language | null;
  setLanguage: (lang: Language) => void;
  isLoading: boolean;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

// Translation keys and values
const translations = {
  en: {
    // App Name
    appName: 'Palani Pathayathirai',
    
    // Language Selection
    selectLanguage: 'Select Language',
    chooseEnglish: 'Choose English',
    chooseTamil: 'Choose Tamil',
    changeLanguageLater: 'You can change this later in settings',
    
    // Navigation
    home: 'Home',
    profile: 'Profile',
    history: 'History',
    settings: 'Settings',
    about: 'About',
    
    // Common
    loading: 'Loading...',
    save: 'Save',
    cancel: 'Cancel',
    ok: 'OK',
    yes: 'Yes',
    no: 'No',
    back: 'Back',
    next: 'Next',
    done: 'Done',
    
    // Login/Auth
    login: 'Login',
    register: 'Register',
    phoneNumber: 'Phone Number',
    otp: 'OTP',
    verifyOTP: 'Verify OTP',
    enterPhoneNumber: 'Enter your phone number',
    enterOTP: 'Enter OTP',
    
    // Screens
    liveTracking: 'Live Tracking',
    groupWalk: 'Group Walk',
    temple: 'Temple',
    music: 'Music',
    quotes: 'Quotes',
    gallery: 'Gallery',
    annadhanam: 'Annadhanam',
    madangal: 'Madangal',
    faq: 'FAQ',
    
    // Messages
    welcomeMessage: 'Welcome to Palani Pathayathirai',
    selectLanguageFirst: 'Please select your preferred language',
    
    // Home Screen
    exploreFeaturesTitle: '✨ Explore Features',
    quickAccess: 'Quick Access',
    goodMorning: 'Good Morning',
    goodAfternoon: 'Good Afternoon',
    goodEvening: 'Good Evening',
    devotionJourney: 'Your spiritual journey',
    dashboardTitle: 'Dashboard',
    startYourJourney: 'Start Your Sacred Journey',
    startJourney: 'Start Journey',
    beginPathayathirai: 'Begin your pathayathirai',
    joinGroup: 'Join Group',
    walkWithDevotees: 'Walk with devotees',
    readyForJourney: 'Ready for your spiritual journey',
    walks: 'Walks',
    kilometers: 'KM',
    hours: 'Hours',
    devotee: 'Devotee',
    loadingQuote: 'Loading inspiring quote...',
    spiritualWisdom: 'Spiritual Wisdom',
    
    // Onboarding
    welcome: 'Welcome',
    onboardingTitle: 'Welcome to Palani Pathayathirai',
    onboardingSubtitle: 'Your spiritual journey begins here',
    onboardingDescription: 'Join thousands of devotees on the sacred path to Lord Murugan\'s temple.',
    continue: 'Continue',
    getStarted: 'Get Started',
    
    // Onboarding Screen 1
    appDescription: 'Your spiritual journey begins here',
    onboarding1Description: 'Join thousands of devotees on the sacred path to Lord Murugan\'s temple. Experience the divine blessing of this sacred pilgrimage.',
    
    // Onboarding Screen 2  
    exploreFeatures: 'Explore Features',
    onboarding2Subtitle: 'Discover amazing features',
    onboarding2Description: 'Track your journey, connect with fellow devotees, access temple information, and enrich your spiritual experience.',
    
    // Onboarding Screen 3
    onboarding3Subtitle: 'Begin your sacred journey',
    onboarding3Description: 'Everything is ready! Start your pathayathirai with divine blessings and connect with the spiritual community.',
    
    // Login Screen
    signIn: 'Sign in',
    email: 'Email',  
    password: 'Password',
    rememberMe: 'Remember Me',
    forgotPassword: 'Forgot Password?',
    loginButton: 'Login',
    dontHaveAccount: 'Don\'t have an Account?',
    signUp: 'Sign up',
    
    // Home Screen
    logout: 'Logout',
  },
  ta: {
    // App Name
    appName: 'பழனி பதயாத்திரை',
    
    // Language Selection
    selectLanguage: 'மொழியைத் தேர்ந்தெடுக்கவும்',
    chooseEnglish: 'ஆங்கிலத்தைத் தேர்ந்தெடுக்கவும்',
    chooseTamil: 'தமிழைத் தேர்ந்தெடுக்கவும்',
    changeLanguageLater: 'இதை பின்னர் அமைப்புகளில் மாற்றலாம்',
    
    // Navigation
    home: 'முகப்பு',
    profile: 'சுயவிவரம்',
    history: 'வரலாறு',
    settings: 'அமைப்புகள்',
    about: 'பற்றி',
    
    // Common
    loading: 'ஏற்றுகிறது...',
    save: 'சேமி',
    cancel: 'ரத்து',
    ok: 'சரி',
    yes: 'ஆம்',
    no: 'இல்லை',
    back: 'பின்னே',
    next: 'அடுத்து',
    done: 'முடிந்தது',
    
    // Login/Auth
    login: 'உள்நுழை',
    register: 'பதிவு',
    phoneNumber: 'தொலைபேசி எண்',
    otp: 'ஓடிபி',
    verifyOTP: 'ஓடிபி சரிபார்க்கவும்',
    enterPhoneNumber: 'உங்கள் தொலைபேசி எண்ணை உள்ளிடவும்',
    enterOTP: 'ஓடிபி உள்ளிடவும்',
    
    // Screens
    liveTracking: 'நேரடி கண்காணிப்பு',
    groupWalk: 'குழு நடை',
    temple: 'கோயில்',
    music: 'இசை',
    quotes: 'மேற்கோள்கள்',
    gallery: 'படக்காட்சி',
    annadhanam: 'அன்னதானம்',
    madangal: 'மடங்கள்',
    faq: 'கேள்வி பதில்',
    
    // Messages
    welcomeMessage: 'பழனி பதயாத்திரைக்கு வரவேற்கிறோம்',
    selectLanguageFirst: 'தயவுசெய்து உங்கள் விருப்பமான மொழியைத் தேர்ந்தெடுக்கவும்',
    
    // Home Screen
    exploreFeaturesTitle: '✨ அம்சங்களை ஆராயுங்கள்',
    quickAccess: 'விரைவு அணுகல்',
    goodMorning: 'காலை வணக்கம்',
    goodAfternoon: 'நல்ல பிற்பகல்',
    goodEvening: 'மாலை வணக்கம்',
    devotionJourney: 'உங்கள் ஆன்மீக பயணம்',
    dashboardTitle: 'கட்டுப்பாட்டு பலகை',
    startYourJourney: 'உங்கள் புனித பயணத்தைத் தொடங்குங்கள்',
    startJourney: 'பயணத்தைத் தொடங்குங்கள்',
    beginPathayathirai: 'உங்கள் பதயாத்திரையைத் தொடங்குங்கள்',
    joinGroup: 'குழுவில் சேருங்கள்',
    walkWithDevotees: 'பக்தர்களுடன் நடக்கவும்',
    readyForJourney: 'உங்கள் ஆன்மீக பயணத்திற்கு தயார்',
    walks: 'நடைகள்',
    kilometers: 'கிமீ',
    hours: 'மணிநேரங்கள்',
    devotee: 'பக்தர்',
    loadingQuote: 'ஊக்கமளிக்கும் வாசகம் ஏற்றுகிறது...',
    spiritualWisdom: 'ஆன்மீக ஞானம்',
    
    // Onboarding
    welcome: 'வரவேற்பு',
    onboardingTitle: 'பழனி பதயாத்திரைக்கு வரவேற்கிறோம்',
    onboardingSubtitle: 'உங்கள் ஆன்மீக பயணம் இங்கே தொடங்குகிறது',
    onboardingDescription: 'முருகன் கோயிலுக்கான புனித பாதையில் ஆயிரக்கணக்கான பக்தர்களுடன் சேருங்கள்.',
    continue: 'தொடரவும்',
    getStarted: 'தொடங்குங்கள்',
    
    // Onboarding Screen 1
    appDescription: 'உங்கள் ஆன்மீக பயணம் இங்கே தொடங்குகிறது',
    onboarding1Description: 'முருகன் கோயிலுக்கான புனித பாதையில் ஆயிரக்கணக்கான பக்தர்களுடன் சேருங்கள். இந்த புனித யாத்திரையின் தெய்வீக ஆசீர்வாதத்தை அனுபவியுங்கள்.',
    
    // Onboarding Screen 2
    exploreFeatures: 'அம்சங்களை ஆராயுங்கள்',
    onboarding2Subtitle: 'அற்புதமான அம்சங்களைக் கண்டறியுங்கள்',
    onboarding2Description: 'உங்கள் பயணத்தை கண்காணிக்கவும், சக பக்தர்களுடன் இணைக்கவும், கோயில் தகவல்களை அணுகவும், உங்கள் ஆன்மீக அனுபவத்தை வளப்படுத்தவும்.',
    
    // Onboarding Screen 3
    onboarding3Subtitle: 'உங்கள் புனித பயணத்தைத் தொடங்குங்கள்',
    onboarding3Description: 'எல்லாம் தயார்! தெய்வீக ஆசீர்வாதங்களுடன் உங்கள் பதயாத்திரையைத் தொடங்கி ஆன்மீக சமுதாயத்துடன் இணைந்துகொள்ளுங்கள்.',
    
    // Login Screen
    signIn: 'உள்நுழைக',
    email: 'மின்னஞ்சல்',
    password: 'கடவுச்சொல்',
    rememberMe: 'என்னை நினைவில் வைத்துக் கொள்ளுங்கள்',
    forgotPassword: 'கடவுச்சொல்லை மறந்துவிட்டீர்களா?',
    loginButton: 'உள்நுழைக',
    dontHaveAccount: 'கணக்கு இல்லையா?',
    signUp: 'பதிவு செய்க',
    
    // Home Screen
    logout: 'வெளியேறு',
  },
};

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguageState] = useState<Language | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadLanguage();
  }, []);

  const loadLanguage = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem('selectedLanguage');
      if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'ta')) {
        setLanguageState(savedLanguage);
      }
    } catch (error) {
      console.error('Error loading language:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setLanguage = async (lang: Language) => {
    try {
      await AsyncStorage.setItem('selectedLanguage', lang);
      setLanguageState(lang);
    } catch (error) {
      console.error('Error saving language:', error);
    }
  };

  const t = (key: string): string => {
    const currentLang = language || 'en'; // Default to English if no language selected
    return translations[currentLang][key as keyof typeof translations['en']] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, isLoading, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}