import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity,
  Animated,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Dimensions,
  Easing
} from 'react-native';
import { LinearGradient } from '../components/WebLinearGradient';
import { colors } from '../utils/theme';
import { useLanguage } from '../context/LanguageContext';
import { apiService } from '../services/api';
import { showToast } from '../utils/toast';

interface OTPVerificationScreenProps {
  onVerify: (otp: string) => void;
  onNavigateBack: () => void;
  phoneNumber?: string;
  email?: string;
  verificationType?: 'registration' | 'login' | 'general';
}

export default function OTPVerificationScreen({ 
  onVerify, 
  onNavigateBack,
  phoneNumber, 
  email, 
  verificationType = 'general'
}: OTPVerificationScreenProps) {
  const { language } = useLanguage();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const otpInputs = useRef<TextInput[]>([]);
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const logoAnimation = useRef(new Animated.Value(0)).current;
  const formAnimation = useRef(new Animated.Value(0)).current;

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

    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // Timer countdown
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleOtpChange = (value: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      otpInputs.current[index + 1]?.focus();
    }

    // Auto-verify when all 6 digits are entered
    if (newOtp.every(digit => digit !== '')) {
      handleVerify(newOtp.join(''));
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      otpInputs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (otpCode?: string) => {
    const otpToVerify = otpCode || otp.join('');
    
    if (otpToVerify.length !== 6) {
      shakeAnimation();
      showToast.warning(
        language === 'ta' ? 'அனைத்து 6 இலக்கங்களையும் உள்ளிடவும்' : 'Please enter all 6 digits'
      );
      return;
    }

    if (!email) {
      showToast.error(
        language === 'ta' ? 'மின்னஞ்சல் முகவரி காணவில்லை' : 'Email address not found'
      );
      return;
    }

    setLoading(true);
    
    try {
      let response;
      
      // Use different API based on verification type
      if (verificationType === 'registration') {
        // For registration, use register-verify API
        response = await apiService.registerVerify({
          email: email,
          otp: otpToVerify
        });
        console.log('Register Verification Response:', response);
      } else {
        // For login or other flows, use verify-otp API
        response = await apiService.verifyOTP({
          email: email,
          otp: otpToVerify
        });
        console.log('OTP Verification Response:', response);
      }
      
      // Show different success messages based on verification type
      let successMessage = '';
      
      if (verificationType === 'registration') {
        successMessage = language === 'ta' 
          ? 'கணக்கு வெற்றிகரமாக சரிபார்க்கப்பட்டது!'
          : 'Account verified successfully!';
      } else {
        successMessage = language === 'ta' 
          ? 'OTP சரிபார்க்கப்பட்டது!'
          : 'OTP verified successfully!';
      }
      
      showToast.success(successMessage);
      
      // Navigate after a short delay
      setTimeout(() => {
        onVerify(otpToVerify);
      }, 500);
    } catch (error: any) {
      console.error('OTP Verification Error:', error);
      shakeAnimation();
      
      const errorMessage = error?.message || 
        (language === 'ta' ? 'OTP சரிபார்ப்பு தோல்வி' : 'OTP verification failed');
      
      showToast.error(errorMessage);
      
      setOtp(['', '', '', '', '', '']);
      otpInputs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    
    if (!email) {
      showToast.error(
        language === 'ta' ? 'மின்னஞ்சல் முகவரி காணவில்லை' : 'Email address not found'
      );
      return;
    }
    
    try {
      setLoading(true);
      
      const response = await apiService.resendOTP({
        email: email
      });
      
      console.log('Resend OTP Response:', response);
      
      setTimer(60);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
      otpInputs.current[0]?.focus();
      
      // Start timer countdown again
      const interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      showToast.success(
        language === 'ta' 
          ? `புதிய OTP ${email} க்கு அனுப்பப்பட்டது`
          : `New OTP sent to ${email}`
      );
    } catch (error: any) {
      console.error('Resend OTP Error:', error);
      
      const errorMessage = error?.message || 
        (language === 'ta' ? 'OTP மீண்டும் அனுப்ப முடியவில்லை' : 'Failed to resend OTP');
      
      showToast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const shakeAnimation = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 100, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 100, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 100, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 100, useNativeDriver: true }),
    ]).start();
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      
      {/* Colorful gradient background */}
      <View style={styles.backgroundContainer}>
        <LinearGradient
          colors={['#ffffff', '#f8fbff', '#e3f2fd', '#bbdefb', '#e1f5fe', '#f8fbff', '#ffffff']}
          style={styles.backgroundGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        />
      </View>
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          bounces={true}
        >
          {/* Header with Back Button */}
          <View style={styles.headerSection}>
            <TouchableOpacity style={styles.backButton} onPress={onNavigateBack}>
              <View style={styles.arrowContainer}>
                <Text style={styles.backIcon}>←</Text>
              </View>
            </TouchableOpacity>
            <View style={styles.headerSpacer} />
          </View>

          {/* Welcome Text */}
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeText}>
              {language === 'ta' ? 'OTP சரிபார்க்கவும்' : 'Verify OTP'}
            </Text>
            <Text style={styles.subtitle}>
              {language === 'ta' 
                ? `6 இலக்க குறியீட்டை உள்ளிடவும்\n${email || phoneNumber} க்கு அனுப்பப்பட்டது`
                : `Enter the 6-digit code sent to\n${email || phoneNumber}`
              }
            </Text>
          </View>

          {/* Form Container */}
          <Animated.View style={[
            styles.formContainer,
            { 
              opacity: fadeAnim,
              transform: [{ translateX: shakeAnim }]
            }
          ]}>
            {/* OTP Input Container */}
            <View style={styles.otpContainer}>
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => {
                    if (ref) otpInputs.current[index] = ref;
                  }}
                  style={[
                    styles.otpInput,
                    digit && styles.otpInputFilled
                  ]}
                  value={digit}
                  onChangeText={(value) => handleOtpChange(value, index)}
                  onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
                  keyboardType="numeric"
                  maxLength={1}
                  textAlign="center"
                  autoFocus={index === 0}
                />
              ))}
            </View>

            {/* Timer and Resend */}
            <View style={styles.timerContainer}>
              {canResend ? (
                <TouchableOpacity onPress={handleResend} style={styles.resendButton}>
                  <Text style={styles.resendText}>
                    {language === 'ta' ? 'OTP மீண்டும் அனுப்பவும்' : 'Resend OTP'}
                  </Text>
                </TouchableOpacity>
              ) : (
                <Text style={styles.timerText}>
                  {language === 'ta' 
                    ? `${timer}வினாடியில் OTP மீண்டும் அனுப்பவும்`
                    : `Resend OTP in ${timer}s`
                  }
                </Text>
              )}
            </View>

            {/* Verify Button */}
            <TouchableOpacity 
              style={[
                styles.verifyButton, 
                loading && styles.verifyButtonDisabled,
                otp.every(digit => digit !== '') && !loading && styles.verifyButtonEnabled
              ]}
              onPress={() => handleVerify()}
              disabled={loading}
            >
              <Text style={styles.verifyButtonText}>
                {loading 
                  ? (language === 'ta' ? 'சரிபார்க்கிறது...' : 'Verifying...') 
                  : (language === 'ta' ? 'OTP சரிபார்க்கவும்' : 'Verify OTP')
                }
              </Text>
            </TouchableOpacity>

            {/* Help Section */}
            <View style={styles.helpContainer}>
              <Text style={styles.helpText}>
                {language === 'ta' ? 'குறியீடு வரவில்லையா?' : "Didn't receive the code?"}
              </Text>
              <TouchableOpacity>
                <Text style={styles.helpLink}>
                  {language === 'ta' ? 'ஆதரவைத் தொடர்பு கொள்ளவும்' : 'Contact Support'}
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>

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
    paddingBottom: 100,
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
  headerSpacer: {
    width: 40,
  },
  // Welcome Section
  welcomeSection: {
    alignItems: 'flex-start',
    marginBottom: 50,
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
    textAlign: 'left',
  },
  // Form Container
  formContainer: {
    flex: 1,
  },
  // OTP Input
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 40,
    paddingHorizontal: 10,
  },
  otpInput: {
    width: 45,
    height: 55,
    borderWidth: 1.5,
    borderColor: '#D0D0D0',
    borderRadius: 8,
    marginHorizontal: 5,
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.black,
    backgroundColor: colors.white,
  },
  otpInputFilled: {
    borderColor: colors.primary.start,
  },
  // Timer and Resend
  timerContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  timerText: {
    fontSize: 14,
    color: colors.gray.medium,
  },
  resendButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  resendText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary.start,
    textDecorationLine: 'underline',
  },
  // Verify Button
  verifyButton: {
    height: 50,
    backgroundColor: colors.gray.medium,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  verifyButtonDisabled: {
    backgroundColor: colors.gray.medium,
  },
  verifyButtonEnabled: {
    backgroundColor: colors.primary.start,
  },
  verifyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
  // Help Section
  helpContainer: {
    alignItems: 'center',
  },
  helpText: {
    fontSize: 14,
    color: colors.gray.medium,
    marginBottom: 8,
    textAlign: 'center',
  },
  helpLink: {
    fontSize: 14,
    color: colors.primary.start,
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
});