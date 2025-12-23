import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Alert,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Dimensions,
  TextInput,
  Animated,
  Easing
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { LinearGradient } from '../components/WebLinearGradient';
import { colors } from '../utils/theme';
import { isValidEmail } from '../utils/helpers';
import { useLanguage } from '../context/LanguageContext';
import { apiService } from '../services/api';
import { showToast } from '../utils/toast';

interface SignupScreenProps {
  onSignup: (name: string, email: string, password: string, phone: string) => void;
  onNavigateToLogin: () => void;
  onSocialSignup: (provider: 'google' | 'whatsapp') => void;
  onNavigateBack?: () => void;
}

export default function SignupScreen({ 
  onSignup, 
  onNavigateToLogin, 
  onSocialSignup,
  onNavigateBack
}: SignupScreenProps) {
  const { language } = useLanguage();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{name?: string; email?: string; phone?: string; password?: string; confirmPassword?: string}>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Animation refs
  const logoAnimation = useRef(new Animated.Value(0)).current;
  const formAnimation = useRef(new Animated.Value(0)).current;
  const floatingAnimation = useRef(new Animated.Value(0)).current;
  const pulseAnimation = useRef(new Animated.Value(1)).current;

  const validateForm = () => {
    const newErrors: {name?: string; email?: string; phone?: string; password?: string; confirmPassword?: string} = {};

    if (!name.trim()) {
      newErrors.name = language === 'ta' ? 'பெயர் தேவை' : 'Name is required';
    }

    if (!email.trim()) {
      newErrors.email = language === 'ta' ? 'மின்னஞ்சல் தேவை' : 'Email is required';
    } else if (!isValidEmail(email)) {
      newErrors.email = language === 'ta' ? 'செல்லுபடியான மின்னஞ்சலை உள்ளிடவும்' : 'Please enter a valid email';
    }

    if (!phone.trim()) {
      newErrors.phone = language === 'ta' ? 'தொலைபேசி எண் தேவை' : 'Phone number is required';
    } else if (phone.length < 10) {
      newErrors.phone = language === 'ta' ? 'செல்லுபடியான தொலைபேசி எண்ணை உள்ளிடவும்' : 'Please enter a valid phone number';
    }

    if (!password.trim()) {
      newErrors.password = language === 'ta' ? 'கடவுச்சொல் தேவை' : 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = language === 'ta' ? 'கடவுச்சொல் குறைந்தது 6 எழுத்துகள் இருக்க வேண்டும்' : 'Password must be at least 6 characters';
    }

    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = language === 'ta' ? 'கடவுச்சொல் உறுதிப்படுத்தல் தேவை' : 'Confirm password is required';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = language === 'ta' ? 'கடவுச்சொற்கள் பொருந்தவில்லை' : 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async () => {
    if (!validateForm()) return;

    setLoading(true);
    
    try {
      // Call registration API
      const response = await apiService.register({
        name: name,
        email: email,
        phone: phone,
        password: password
      });
      
      console.log('Registration Response:', response);
      
      showToast.success(
        language === 'ta' 
          ? `${email} க்கு OTP அனுப்பப்பட்டுள்ளது!`
          : `OTP sent to ${email}!`
      );
      
      // Navigate to OTP screen after a short delay
      setTimeout(() => {
        onSignup(name, email, password, phone);
      }, 500);
    } catch (error: any) {
      console.error('Registration Error:', error);
      
      const errorMessage = error?.message || 
        (language === 'ta' ? 'பதிவு செய்வதில் பிழை ஏற்பட்டது' : 'An error occurred during signup');
      
      showToast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialSignup = (provider: 'google' | 'whatsapp') => {
    onSocialSignup(provider);
  };

  // Initialize animations
  useEffect(() => {
    // Logo entrance animation
    Animated.sequence([
      Animated.timing(logoAnimation, {
        toValue: 1,
        duration: 1000,
        easing: Easing.out(Easing.back(1.2)),
        useNativeDriver: true,
      }),
      Animated.timing(formAnimation, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      })
    ]).start();

    // Floating animation for background elements
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatingAnimation, {
          toValue: 1,
          duration: 3000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(floatingAnimation, {
          toValue: 0,
          duration: 3000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        })
      ])
    ).start();

    // Pulse animation for logo
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnimation, {
          toValue: 1.1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnimation, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        })
      ])
    ).start();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      
      {/* Light blue gradient background - bottom to top */}
      <View style={styles.backgroundContainer}>
        <LinearGradient
          colors={['#BBDEFB', '#E1F5FE', '#F0F8FF', '#FFFFFF']}
          style={styles.backgroundGradient}
          start={{ x: 0, y: 1 }}
          end={{ x: 0, y: 0 }}
        />
      </View>
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          bounces={true}
        >
          {/* Header with Back Button and Sign in */}
          <View style={styles.headerSection}>
            <TouchableOpacity style={styles.backButton} onPress={onNavigateBack || onNavigateToLogin}>
              <View style={styles.arrowContainer}>
                <Text style={styles.backIcon}>←</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.loginHeaderButton} onPress={onNavigateToLogin}>
              <Text style={styles.loginHeaderText}>
                {language === 'ta' ? 'உள்நுழைவு' : 'Sign in'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Welcome Text */}
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeText}>
              {language === 'ta' ? 'கணக்கு உருவாக்கவும்!' : 'Create Account!'}
            </Text>
            <Text style={styles.subtitle}>
              {language === 'ta' 
                ? 'உங்கள் ஆன்மீக பயணத்தைத் தொடங்க பதிவு செய்யுங்கள்' 
                : 'Sign up now and start your spiritual journey with exciting rewards.'
              }
            </Text>
          </View>

          {/* Clean Form Container */}
          <View style={styles.formContainer}>
            {/* Name Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                {language === 'ta' ? 'முழு பெயர்*' : 'Full Name*'}
              </Text>
              <TextInput
                style={[styles.textInput, errors.name && styles.textInputError]}
                placeholder={language === 'ta' ? 'உங்கள் பெயரை உள்ளிடவும்' : 'Enter your full name'}
                placeholderTextColor={colors.gray.medium}
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                returnKeyType="next"
              />
              {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
            </View>

            {/* Email Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                {language === 'ta' ? 'மின்னஞ்சல் முகவரி*' : 'Email address*'}
              </Text>
              <TextInput
                style={[styles.textInput, errors.email && styles.textInputError]}
                placeholder={language === 'ta' ? 'உங்கள் மின்னஞ்சலை உள்ளிடவும்' : 'Enter your email'}
                placeholderTextColor={colors.gray.medium}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                returnKeyType="next"
              />
              {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
            </View>

            {/* Phone Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                {language === 'ta' ? 'தொலைபேசி எண்*' : 'Phone Number*'}
              </Text>
              <TextInput
                style={[styles.textInput, errors.phone && styles.textInputError]}
                placeholder={language === 'ta' ? 'உங்கள் தொலைபேசி எண்ணை உள்ளிடவும்' : 'Enter your phone number'}
                placeholderTextColor={colors.gray.medium}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                returnKeyType="next"
              />
              {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
            </View>

            {/* Password Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                {language === 'ta' ? 'கடவுச்சொல்*' : 'Password*'}
              </Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[styles.textInput, errors.password && styles.textInputError]}
                  placeholder={language === 'ta' ? 'உங்கள் கடவுச்சொல்லை உள்ளிடவும்' : 'Create password'}
                  placeholderTextColor={colors.gray.medium}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  returnKeyType="next"
                />
                <TouchableOpacity 
                  style={styles.eyeIcon}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Icon 
                    name={showPassword ? 'eye-outline' : 'eye-off-outline'} 
                    size={22} 
                    color={colors.gray.medium} 
                  />
                </TouchableOpacity>
              </View>
              {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
            </View>

            {/* Confirm Password Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                {language === 'ta' ? 'கடவுச்சொல் உறுதிப்படுத்தல்*' : 'Confirm Password*'}
              </Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[styles.textInput, errors.confirmPassword && styles.textInputError]}
                  placeholder={language === 'ta' ? 'கடவுச்சொல்லை மீண்டும் உள்ளிடவும்' : 'Confirm your password'}
                  placeholderTextColor={colors.gray.medium}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  returnKeyType="done"
                  onSubmitEditing={handleSignup}
                />
                <TouchableOpacity 
                  style={styles.eyeIcon}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <Icon 
                    name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'} 
                    size={22} 
                    color={colors.gray.medium} 
                  />
                </TouchableOpacity>
              </View>
              {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
            </View>

            {/* Terms and Conditions */}
            <View style={styles.termsRow}>
              <TouchableOpacity style={styles.checkbox}>
                <Text style={styles.checkmark}>✓</Text>
              </TouchableOpacity>
              <Text style={styles.termsText}>
                {language === 'ta' 
                  ? 'நான் நிபந்தனைகள் மற்றும் தனியுரிமைக் கொள்கையை ஏற்றுக்கொள்கிறேன்'
                  : 'I agree to Terms & Conditions and Privacy Policy'
                }
              </Text>
            </View>

            {/* Signup Button */}
            <TouchableOpacity 
              style={[styles.signupButton, loading && styles.signupButtonDisabled]}
              onPress={handleSignup}
              disabled={loading}
            >
              <Text style={styles.signupButtonText}>
                {loading 
                  ? (language === 'ta' ? 'பதிவு செய்கிறது...' : 'Creating Account...') 
                  : (language === 'ta' ? 'கணக்கு உருவாக்கவும்' : 'Create Account')
                }
              </Text>
            </TouchableOpacity>

            {/* Social Login Divider */}
            {/* <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>
                {language === 'ta' ? 'அல்லது தொடருங்கள்' : 'or Continue with'}
              </Text>
              <View style={styles.dividerLine} />
            </View> */}

            {/* Social Login Buttons */}
            {/* <View style={styles.socialContainer}>
              <TouchableOpacity 
                style={styles.socialButton}
                onPress={() => handleSocialSignup('google')}
              >
                <View style={styles.socialIcon}>
                  <Text style={styles.googleIcon}>G</Text>
                </View>
                <Text style={styles.socialText}>Google</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.socialButton}
                onPress={() => handleSocialSignup('whatsapp')}
              >
                <View style={styles.socialIcon}>
                  <Text style={styles.whatsappIcon}>📱</Text>
                </View>
                <Text style={styles.socialText}>WhatsApp</Text>
              </TouchableOpacity>
            </View> */}
          </View>

          {/* Login Link */}
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>
              {language === 'ta' ? "ஏற்கனவே கணக்கு உள்ளதா? " : "Already have an account? "}
            </Text>
            <TouchableOpacity onPress={onNavigateToLogin}>
              <Text style={styles.loginLink}>
                {language === 'ta' ? 'உள்நுழையுங்கள்' : 'Sign in'}
              </Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  backgroundContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  backgroundGradient: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 250,
  },
  // Header Section
  headerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 40,
    paddingTop: 10,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#D0D0D0',
    position: 'relative',
  },
  arrowContainer: {
    position: 'absolute',
    top: -6,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 20,
    color: '#000000',
    fontWeight: '900',
    marginTop: -1,
    marginLeft: -0.5,
  },
  loginHeaderButton: {
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  loginHeaderText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.black,
  },
  // Welcome Section
  welcomeSection: {
    alignItems: 'flex-start',
    marginBottom: 40,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.black,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: colors.gray.medium,
    lineHeight: 22,
    fontWeight: '400',
  },
  // Form Container
  formContainer: {
    flex: 1,
  },
  // Input Styles
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.gray.dark,
    marginBottom: 8,
  },
  textInput: {
    height: 50,
    borderWidth: 1.5,
    borderColor: '#D0D0D0',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    color: colors.black,
    backgroundColor: colors.white,
  },
  textInputError: {
    borderColor: colors.danger,
  },
  passwordContainer: {
    position: 'relative',
  },
  eyeIcon: {
    position: 'absolute',
    right: 16,
    top: 15,
  },
  eyeIconText: {
    fontSize: 18,
    color: colors.gray.medium,
  },
  errorText: {
    fontSize: 12,
    color: colors.danger,
    marginTop: 4,
  },
  // Terms Row
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 30,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 3,
    backgroundColor: colors.primary.start,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  checkmark: {
    fontSize: 12,
    color: colors.white,
    fontWeight: 'bold',
  },
  termsText: {
    fontSize: 14,
    color: colors.gray.dark,
    flex: 1,
    lineHeight: 20,
  },
  // Signup Button
  signupButton: {
    height: 50,
    backgroundColor: colors.primary.start,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  signupButtonDisabled: {
    backgroundColor: colors.gray.medium,
  },
  signupButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
  // Divider
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E5E5',
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: colors.gray.medium,
    fontWeight: '500',
  },
  // Social Login
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  socialButton: {
    flex: 1,
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderRadius: 25,
    borderWidth: 1.5,
    borderColor: '#D0D0D0',
    marginHorizontal: 6,
  },
  socialIcon: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  googleIcon: {
    fontSize: 16,
    color: '#4285f4',
    fontWeight: 'bold',
  },
  whatsappIcon: {
    fontSize: 16,
    color: '#25D366',
  },
  socialText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.gray.dark,
  },
  // Login Section
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    paddingBottom: 20,
  },
  loginText: {
    fontSize: 14,
    color: colors.gray.medium,
  },
  loginLink: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary.start,
    textDecorationLine: 'underline',
  },
});