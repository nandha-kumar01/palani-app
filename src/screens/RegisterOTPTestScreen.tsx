import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Alert 
} from 'react-native';
import { LinearGradient } from '../components/WebLinearGradient';
import { GradientButton } from '../components/GradientButton';
import { CustomTextInput } from '../components/CustomTextInput';
import { WhiteCard } from '../components/GlassCard';
import { colors, fonts, spacing, borderRadius } from '../utils/theme';
import { apiService, RegisterVerifyRequest, ApiError } from '../services/api';

/**
 * Test screen for register-verify API integration
 * This demonstrates how to use the register-verify endpoint
 */
export default function RegisterOTPTestScreen() {
  const [email, setEmail] = useState('pr657122@gmail.com'); // Pre-filled for testing
  const [otp, setOtp] = useState('729673'); // Pre-filled for testing
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);

  const handleRegisterVerify = async () => {
    if (!email.trim() || !otp.trim()) {
      Alert.alert('Error', 'Please enter both email and OTP');
      return;
    }

    if (otp.length !== 6) {
      Alert.alert('Error', 'OTP must be 6 digits');
      return;
    }

    setLoading(true);
    setResponse(null);

    try {
      const verifyData: RegisterVerifyRequest = {
        email: email.trim(),
        otp: otp.trim()
      };

      console.log('Testing register-verify API with data:', verifyData);
      console.log('API Endpoint: https://palani-admin.vercel.app/api/auth/register-verify');

      const result = await apiService.registerVerify(verifyData);
      
      console.log('API Response:', result);
      setResponse(result);

      Alert.alert(
        'Success!',
        `Registration verified successfully!\n\nMessage: ${result.message}`,
        [{ text: 'OK' }]
      );

    } catch (error) {
      console.error('Register verify error:', error);
      
      const apiError = error as ApiError;
      let errorMessage = 'Verification failed. Please try again.';
      
      if (apiError.message) {
        errorMessage = apiError.message;
      }
      
      setResponse({ error: apiError });
      
      Alert.alert('Verification Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEmail('pr657122@gmail.com');
    setOtp('729673');
    setResponse(null);
  };

  return (
    <LinearGradient
      colors={[colors.primary.start, colors.primary.end]}
      style={styles.container}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Register OTP Test</Text>
          <Text style={styles.subtitle}>Test the register-verify API endpoint</Text>
        </View>

        <WhiteCard style={styles.card}>
          <View style={styles.apiInfo}>
            <Text style={styles.apiTitle}>API Endpoint</Text>
            <Text style={styles.apiUrl}>POST /api/auth/register-verify</Text>
            <Text style={styles.apiDescription}>
              This endpoint verifies the OTP sent during registration
            </Text>
          </View>

          <CustomTextInput
            label="Email"
            placeholder="Enter email address"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            icon={<Text style={styles.inputIcon}>📧</Text>}
          />

          <CustomTextInput
            label="OTP Code"
            placeholder="Enter 6-digit OTP"
            value={otp}
            onChangeText={setOtp}
            keyboardType="numeric"
            maxLength={6}
            icon={<Text style={styles.inputIcon}>🔐</Text>}
          />

          <View style={styles.curlContainer}>
            <Text style={styles.curlTitle}>Equivalent cURL Command:</Text>
            <Text style={styles.curlText}>
{`curl --location 'https://palani-admin.vercel.app/api/auth/register-verify' \\
--header 'Content-Type: application/json' \\
--data-raw '{
    "email": "${email}",
    "otp": "${otp}"
}'`}
            </Text>
          </View>

          <GradientButton 
            onPress={handleRegisterVerify} 
            disabled={loading}
            style={styles.verifyButton}
          >
            {loading ? 'Verifying OTP...' : 'Verify Registration OTP'}
          </GradientButton>

          <TouchableOpacity 
            style={styles.resetButton}
            onPress={resetForm}
          >
            <Text style={styles.resetButtonText}>Reset Form</Text>
          </TouchableOpacity>

          {response && (
            <View style={styles.responseContainer}>
              <Text style={styles.responseTitle}>
                {response.error ? '❌ API Error Response:' : '✅ API Success Response:'}
              </Text>
              <Text style={styles.responseText}>
                {JSON.stringify(response, null, 2)}
              </Text>
            </View>
          )}
        </WhiteCard>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
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
  subtitle: {
    fontSize: fonts.sizes.md,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  card: {
    paddingVertical: spacing.xl,
  },
  apiInfo: {
    backgroundColor: colors.gray.light,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.lg,
  },
  apiTitle: {
    fontSize: fonts.sizes.md,
    fontWeight: fonts.weights.semibold,
    color: colors.gray.dark,
    marginBottom: spacing.xs,
  },
  apiUrl: {
    fontSize: fonts.sizes.sm,
    fontWeight: fonts.weights.medium,
    color: colors.primary.start,
    marginBottom: spacing.xs,
  },
  apiDescription: {
    fontSize: fonts.sizes.sm,
    color: colors.gray.medium,
  },
  inputIcon: {
    fontSize: 16,
  },
  curlContainer: {
    backgroundColor: '#f8f9fa',
    padding: spacing.md,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.lg,
  },
  curlTitle: {
    fontSize: fonts.sizes.sm,
    fontWeight: fonts.weights.semibold,
    color: colors.gray.dark,
    marginBottom: spacing.xs,
  },
  curlText: {
    fontSize: fonts.sizes.xs,
    color: colors.gray.medium,
    fontFamily: 'monospace',
    lineHeight: 16,
  },
  verifyButton: {
    marginBottom: spacing.md,
  },
  resetButton: {
    backgroundColor: 'rgba(108, 99, 255, 0.1)',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: 'rgba(108, 99, 255, 0.3)',
    marginBottom: spacing.lg,
  },
  resetButtonText: {
    fontSize: fonts.sizes.md,
    color: colors.primary.start,
    textAlign: 'center',
    fontWeight: fonts.weights.medium,
  },
  responseContainer: {
    backgroundColor: '#f8f9fa',
    padding: spacing.md,
    borderRadius: borderRadius.sm,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary.start,
  },
  responseTitle: {
    fontSize: fonts.sizes.sm,
    fontWeight: fonts.weights.semibold,
    color: colors.gray.dark,
    marginBottom: spacing.xs,
  },
  responseText: {
    fontSize: fonts.sizes.xs,
    color: colors.gray.medium,
    fontFamily: 'monospace',
    lineHeight: 16,
  },
});