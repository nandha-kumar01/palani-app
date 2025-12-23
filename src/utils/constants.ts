// API Configuration
export const API_CONFIG = {
  BASE_URL: 'https://palani-admin.vercel.app/api',
  ENDPOINTS: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    VERIFY_OTP: '/auth/verify-otp',
    RESEND_OTP: '/auth/resend-otp',
  },
};

// Default Group ID for new registrations
export const DEFAULT_GROUP_ID = '68cd276d4ae83b63029e3098';

// Error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your internet connection.',
  REGISTRATION_FAILED: 'Registration failed. Please try again.',
  INVALID_CREDENTIALS: 'Invalid email or password.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  SERVER_ERROR: 'Server error. Please try again later.',
};

// Success messages
export const SUCCESS_MESSAGES = {
  REGISTRATION_SUCCESS: 'Account created successfully!',
  LOGIN_SUCCESS: 'Login successful!',
  OTP_SENT: 'OTP sent successfully!',
};