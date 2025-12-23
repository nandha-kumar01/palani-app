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
import { apiService, LoginRequest, ApiError } from '../services/api';

/**
 * Test screen for login API integration
 * This demonstrates how to use the login endpoint that matches your curl command
 */
export default function LoginAPITestScreen() {
  const [email, setEmail] = useState('pr657122@gmail.com'); // Pre-filled for testing
  const [password, setPassword] = useState('mySecurePassword123'); // Pre-filled for testing
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    setLoading(true);
    setResponse(null);

    try {
      const loginData: LoginRequest = {
        email: email.trim().toLowerCase(),
        password: password.trim()
      };

      console.log('Testing login API with data:', { 
        ...loginData, 
        password: '***hidden***' 
      });
      console.log('API Endpoint: https://palani-admin.vercel.app/api/auth/login');

      const result = await apiService.login(loginData);
      
      console.log('API Response:', result);
      setResponse(result);

      Alert.alert(
        'Success!',
        `Login successful!\n\nWelcome: ${result.user.name}\nEmail: ${result.user.email}`,
        [{ text: 'OK' }]
      );

    } catch (error) {
      console.error('Login error:', error);
      
      const apiError = error as ApiError;
      let errorMessage = 'Login failed. Please try again.';
      
      if (apiError.message) {
        if (apiError.message.includes('401')) {
          errorMessage = 'Invalid email or password. Please check your credentials.';
        } else if (apiError.message.includes('400')) {
          errorMessage = 'Invalid login data. Please check all fields.';
        } else {
          errorMessage = apiError.message;
        }
      }
      
      setResponse({ error: apiError });
      
      Alert.alert('Login Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEmail('pr657122@gmail.com');
    setPassword('mySecurePassword123');
    setResponse(null);
  };

  const fillDemoCredentials = () => {
    setEmail('dssasa@gmail.com');
    setPassword('User@123');
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
          <Text style={styles.title}>Login API Test</Text>
          <Text style={styles.subtitle}>Test the login API endpoint</Text>
        </View>

        <WhiteCard style={styles.card}>
          <View style={styles.apiInfo}>
            <Text style={styles.apiTitle}>API Endpoint</Text>
            <Text style={styles.apiUrl}>POST /api/auth/login</Text>
            <Text style={styles.apiDescription}>
              This endpoint authenticates users and returns access tokens
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
            label="Password"
            placeholder="Enter password"
            value={password}
            onChangeText={setPassword}
            isPassword={true}
            icon={<Text style={styles.inputIcon}>🔒</Text>}
          />

          <View style={styles.curlContainer}>
            <Text style={styles.curlTitle}>Equivalent cURL Command:</Text>
            <Text style={styles.curlText}>
{`curl --location 'https://palani-admin.vercel.app/api/auth/login' \\
--header 'Content-Type: application/json' \\
--data-raw '{
    "email": "${email}",
    "password": "${password}"
}'`}
            </Text>
          </View>

          <GradientButton 
            onPress={handleLogin} 
            disabled={loading}
            style={styles.loginButton}
          >
            {loading ? 'Logging In...' : 'Test Login API'}
          </GradientButton>

          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={resetForm}
            >
              <Text style={styles.actionButtonText}>Reset Form</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionButton, styles.demoButton]}
              onPress={fillDemoCredentials}
            >
              <Text style={styles.actionButtonText}>Demo Credentials</Text>
            </TouchableOpacity>
          </View>

          {response && (
            <View style={styles.responseContainer}>
              <Text style={styles.responseTitle}>
                {response.error ? '❌ API Error Response:' : '✅ API Success Response:'}
              </Text>
              <ScrollView style={styles.responseScroll} nestedScrollEnabled>
                <Text style={styles.responseText}>
                  {JSON.stringify(response, null, 2)}
                </Text>
              </ScrollView>
            </View>
          )}

          <View style={styles.infoContainer}>
            <Text style={styles.infoTitle}>📋 Response Structure:</Text>
            <Text style={styles.infoText}>
              ✅ Success Response:{'\n'}
              • accessToken: string{'\n'}
              • refreshToken: string{'\n'}
              • message: string{'\n'}
              • user: object with _id, name, email, phone, role, isActive{'\n\n'}
              
              ❌ Error Response:{'\n'}
              • success: false{'\n'}
              • message: string{'\n'}
              • status: HTTP status code
            </Text>
          </View>
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
  loginButton: {
    marginBottom: spacing.md,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  actionButton: {
    flex: 1,
    backgroundColor: 'rgba(108, 99, 255, 0.1)',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: 'rgba(108, 99, 255, 0.3)',
    marginHorizontal: spacing.xs,
  },
  demoButton: {
    backgroundColor: 'rgba(40, 167, 69, 0.1)',
    borderColor: 'rgba(40, 167, 69, 0.3)',
  },
  actionButtonText: {
    fontSize: fonts.sizes.sm,
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
    marginBottom: spacing.lg,
  },
  responseTitle: {
    fontSize: fonts.sizes.sm,
    fontWeight: fonts.weights.semibold,
    color: colors.gray.dark,
    marginBottom: spacing.xs,
  },
  responseScroll: {
    maxHeight: 200,
  },
  responseText: {
    fontSize: fonts.sizes.xs,
    color: colors.gray.medium,
    fontFamily: 'monospace',
    lineHeight: 16,
  },
  infoContainer: {
    backgroundColor: 'rgba(108, 99, 255, 0.05)',
    padding: spacing.md,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: 'rgba(108, 99, 255, 0.2)',
  },
  infoTitle: {
    fontSize: fonts.sizes.sm,
    fontWeight: fonts.weights.semibold,
    color: colors.gray.dark,
    marginBottom: spacing.xs,
  },
  infoText: {
    fontSize: fonts.sizes.xs,
    color: colors.gray.medium,
    lineHeight: 18,
  },
});