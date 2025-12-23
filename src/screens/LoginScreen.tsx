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
import { GradientButton } from '../components/GradientButton';
import { CustomTextInput } from '../components/CustomTextInput';
import { WhiteCard } from '../components/GlassCard';
import { colors, fonts, spacing, borderRadius, shadows } from '../utils/theme';
import { isValidEmail } from '../utils/helpers';
import { apiService, LoginRequest, ApiError } from '../services/api';
import { tokenStorage } from '../services/tokenStorage';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../utils/constants';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { showToast } from '../utils/toast';

interface LoginScreenProps {
  onLogin: (email: string, password: string) => void;
  onNavigateToSignup: () => void;
  onSocialLogin: (provider: 'google' | 'whatsapp') => void;
  onNavigateToOTP?: (email: string) => void;
  onNavigateBack?: () => void;
}

export default function LoginScreen({ 
  onLogin, 
  onNavigateToSignup, 
  onSocialLogin,
  onNavigateToOTP,
  onNavigateBack
}: LoginScreenProps) {
  const { setUser, setAuthenticated } = useApp();
  const { t, language } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{email?: string; password?: string}>({});
  const [loading, setLoading] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Animation refs
  const logoAnimation = useRef(new Animated.Value(0)).current;
  const formAnimation = useRef(new Animated.Value(0)).current;
  const floatingAnimation = useRef(new Animated.Value(0)).current;
  const pulseAnimation = useRef(new Animated.Value(1)).current;
  const spinAnimation = useRef(new Animated.Value(0)).current;

  const validateForm = () => {
    const newErrors: {email?: string; password?: string} = {};

    if (!email.trim()) {
      newErrors.email = language === 'ta' ? 'மின்னஞ்சல் தேவை' : 'Email is required';
    } else if (!isValidEmail(email)) {
      newErrors.email = language === 'ta' ? 'செல்லுபடியான மின்னஞ்சலை உள்ளிடவும்' : 'Please enter a valid email';
    }

    if (!password.trim()) {
      newErrors.password = language === 'ta' ? 'கடவுச்சொல் தேவை' : 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = language === 'ta' ? 'கடவுச்சொல் குறைந்தது 6 எழுத்துகள் இருக்க வேண்டும்' : 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    setLoading(true);
    
    try {
      const loginData: LoginRequest = {
        email: email.trim().toLowerCase(),
        password: password,
      };

      console.log('Attempting login with email:', loginData.email);

      const response = await apiService.login(loginData);
      
      console.log('Login successful:', response);
      
      // Store tokens and user data
      await tokenStorage.storeLoginData(
        response.accessToken,
        response.refreshToken,
        response.user
      );

      // Update app context with user data
      const user = {
        id: response.user._id,
        name: response.user.name,
        email: response.user.email,
        phone: response.user.phone,
        createdAt: new Date(), // Use current date since API doesn't provide it
      };
      setUser(user);
      setAuthenticated(true);

      console.log(`Login successful for user: ${response.user.name}`);
      console.log('User data set in context, about to navigate...');
      
      showToast.success(
        language === 'ta' 
          ? `வரவேற்கிறோம், ${response.user.name}!`
          : `Welcome back, ${response.user.name}!`
      );
      
      // Small delay to ensure context is updated, then navigate
      setTimeout(() => {
        console.log('Calling onLogin callback to navigate to home');
        onLogin(email, password);
      }, 500);
      
    } catch (error) {
      console.error('Login error:', error);
      
      const apiError = error as ApiError;
      let errorMessage = ERROR_MESSAGES.INVALID_CREDENTIALS;
      
      if (apiError.message) {
        const errorMsg = apiError.message.toLowerCase();
        
        // Check if account is not verified - handle ALL verification error messages
        if (errorMsg.includes('not active') || 
            errorMsg.includes('not verified') ||
            errorMsg.includes('verify') ||
            errorMsg.includes('registration') ||
            errorMsg.includes('complete your registration') ||
            (apiError.status === 401 && (errorMsg.includes('email') || errorMsg.includes('account')))) {
          
          setLoading(false);
          
          Alert.alert(
            language === 'ta' ? 'கணக்கு சரிபார்க்கவும்' : 'Verify Account',
            language === 'ta' 
              ? 'உங்கள் கணக்கை முதலில் சரிபார்க்க வேண்டும். உங்கள் மின்னஞ்சலுக்கு OTP அனுப்பவும்?'
              : 'You need to verify your account first. Send OTP to your email?',
            [
              {
                text: language === 'ta' ? 'ரத்து செய்' : 'Cancel',
                style: 'cancel'
              },
              {
                text: language === 'ta' ? 'OTP அனுப்பவும்' : 'Send OTP',
                onPress: async () => {
                  try {
                    setLoading(true);
                    const userEmail = email.trim().toLowerCase();
                    
                    console.log('Sending OTP to:', userEmail);
                    await apiService.resendOTP({ email: userEmail });
                    
                    setLoading(false);
                    
                    showToast.success(
                      language === 'ta' 
                        ? `${userEmail} க்கு OTP அனுப்பப்பட்டது!`
                        : `OTP sent to ${userEmail}!`
                    );
                    
                    // Navigate to OTP screen after a short delay
                    setTimeout(() => {
                      if (onNavigateToOTP) {
                        onNavigateToOTP(userEmail);
                      }
                    }, 500);
                  } catch (resendError: any) {
                    console.error('Resend OTP Error:', resendError);
                    setLoading(false);
                    showToast.error(
                      resendError?.message || 
                        (language === 'ta' ? 'OTP அனுப்ப முடியவில்லை' : 'Failed to send OTP')
                    );
                  }
                }
              }
            ]
          );
          return;
        }
        
        if (apiError.message.includes('401') || apiError.message.toLowerCase().includes('unauthorized')) {
          errorMessage = language === 'ta' 
            ? 'தவறான மின்னஞ்சல் அல்லது கடவுச்சொல். உங்கள் விவரங்களை சரிபார்க்கவும்.' 
            : 'Invalid email or password. Please check your credentials.';
        } else if (apiError.message.includes('400')) {
          errorMessage = language === 'ta' 
            ? 'தவறான உள்நுழைவு தரவு. அனைத்து புலங்களையும் சரிபார்க்கவும்.' 
            : 'Invalid login data. Please check all fields.';
        } else if (apiError.message.includes('500')) {
          errorMessage = language === 'ta' 
            ? 'சர்வர் பிழை. சிறிது நேரம் கழித்து மீண்டும் முயற்சிக்கவும்.' 
            : 'Server error. Please try again after some time.';
        } else {
          errorMessage = apiError.message;
        }
      }
      
      // Handle specific field errors
      if (apiError.errors) {
        setErrors(apiError.errors);
        errorMessage = language === 'ta' ? 'பிழைகளை சரிசெய்து மீண்டும் முயற்சிக்கவும்.' : 'Please fix the errors and try again.';
      }
      
      showToast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (provider: 'google' | 'whatsapp') => {
    onSocialLogin(provider);
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

    // Spin animation for loading spinner
    Animated.loop(
      Animated.timing(spinAnimation, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      
      {/* Full screen gradient - bottom to top */}
      <LinearGradient
        colors={['#BBDEFB', '#E1F5FE', '#F0F8FF', '#FFFFFF']}
        style={styles.fullScreenGradient}
        start={{ x: 0, y: 1 }}
        end={{ x: 0, y: 0 }}
      />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header with Back Button and Sign up */}
          <View style={styles.headerSection}>
            <TouchableOpacity style={styles.backButton} onPress={onNavigateBack}>
              <View style={styles.arrowContainer}>
                <Text style={styles.backIcon}>←</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.signupHeaderButton}>
              <Text style={styles.signupHeaderText}>
                {language === 'ta' ? 'பதிவு செய்க' : 'Sign up'}
              </Text>
            </TouchableOpacity>
          </View>


          {/* Welcome Text */}
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeText}>
              {language === 'ta' ? 'மீண்டும் வரவேற்கிறோம்!' : 'Welcome Back!'}
            </Text>
            <Text style={styles.subtitle}>
              {language === 'ta' 
                ? 'உங்கள் கணக்கில் உள்நுழைந்து தொடருங்கள்' 
                : 'Sign in now and keep earning exciting rewards for your growing spiritual journey.'
              }
            </Text>
          </View>

          {/* Clean Form Container */}
          <View style={styles.formContainer}>
            {/* Email Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                {language === 'ta' ? 'மின்னஞ்சல் முகவரி*' : 'Email address*'}
              </Text>
              <TextInput
                style={[styles.textInput, errors.email && styles.textInputError]}
                placeholder={language === 'ta' ? 'உங்கள் மின்னஞ்சலை உள்ளிடவும்' : 'sknahid332@gmail.com'}
                placeholderTextColor={colors.gray.medium}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                returnKeyType="next"
              />
              {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
            </View>

            {/* Password Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                {language === 'ta' ? 'கடவுச்சொல்*' : 'Password*'}
              </Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[styles.textInput, errors.password && styles.textInputError]}
                  placeholder={language === 'ta' ? 'உங்கள் கடவுச்சொல்லை உள்ளிடவும்' : '******'}
                  placeholderTextColor={colors.gray.medium}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  returnKeyType="done"
                  onSubmitEditing={handleLogin}
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

            {/* Remember Me and Forgot Password */}
            <View style={styles.optionsRow}>
              <TouchableOpacity style={styles.rememberMeRow}>
                <View style={styles.checkbox}>
                  <Text style={styles.checkmark}>✓</Text>
                </View>
                <Text style={styles.rememberMeText}>
                  {language === 'ta' ? 'என்னை நினைவில் வைத்துக் கொள்ளுங்கள்' : 'Remember me'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity>
                <Text style={styles.forgotPasswordText}>
                  {language === 'ta' ? 'கடவுச்சொல் மறந்துவிட்டதா?' : 'Forgot Password?'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Simple Login Button */}
            <TouchableOpacity 
              style={[styles.loginButton, loading && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={loading}
            >
              <Text style={styles.loginButtonText}>
                {loading 
                  ? (language === 'ta' ? 'உள்நுழைகிறது...' : 'Signing In...') 
                  : (language === 'ta' ? 'உள்நுழையுங்கள்' : 'Sign In')
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
                onPress={() => handleSocialLogin('google')}
              >
                <View style={styles.socialIcon}>
                  <Text style={styles.googleIcon}>G</Text>
                </View>
                <Text style={styles.socialText}>Google</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.socialButton}
                onPress={() => handleSocialLogin('whatsapp')}
              >
                <View style={styles.socialIcon}>
                  <Text style={styles.whatsappIcon}>📱</Text>
                </View>
                <Text style={styles.socialText}>WhatsApp</Text>
              </TouchableOpacity>
            </View> */}
          </View>

          {/* Sign Up Link */}
          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>
              {language === 'ta' ? "கணக்கு இல்லையா? " : "Don't have an account? "}
            </Text>
            <TouchableOpacity onPress={onNavigateToSignup}>
              <Text style={styles.signupLink}>
                {language === 'ta' ? 'பதிவு செய்யுங்கள்' : 'Sign up'}
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
  fullScreenGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
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
    paddingTop: 50,
    paddingBottom: 20,
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
  signupHeaderButton: {
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  signupHeaderText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.black,
  },
  // Logo Section
  logoSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  logo: {
    fontSize: 60,
    marginBottom: 8,
  },
  appName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray.dark,
    textAlign: 'center',
    letterSpacing: 0.5,
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
  // Options Row (Remember Me & Forgot Password)
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  rememberMeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 3,
    backgroundColor: colors.primary.start,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  checkmark: {
    fontSize: 12,
    color: colors.white,
    fontWeight: 'bold',
  },
  rememberMeText: {
    fontSize: 14,
    color: colors.gray.dark,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: colors.primary.start,
    fontWeight: '500',
  },
  // Simple Login Button
  loginButton: {
    height: 50,
    backgroundColor: colors.primary.start,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  loginButtonDisabled: {
    backgroundColor: colors.gray.medium,
  },
  loginButtonText: {
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
    marginBottom: 0,
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
  // Sign Up Section
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 40,
  },
  signupText: {
    fontSize: 14,
    color: colors.gray.medium,
  },
  signupLink: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary.start,
    textDecorationLine: 'underline',
  },
});