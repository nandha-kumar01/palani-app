/**
 * Simple Login API Test Example
 * 
 * This file demonstrates how to use the login API 
 * that matches your curl command exactly
 */

import { apiService, LoginRequest } from './src/services/api';

// Test function that matches your curl command
export const testLoginAPI = async () => {
  try {
    // This matches your exact curl command data
    const loginData: LoginRequest = {
      email: "pr657122@gmail.com",
      password: "mySecurePassword123"
    };

    console.log('🚀 Testing Login API...');
    console.log('API Endpoint: https://palani-admin.vercel.app/api/auth/login');
    console.log('Request Data:', { 
      email: loginData.email, 
      password: '***hidden***' 
    });

    // Make the API call
    const response = await apiService.login(loginData);

    console.log('✅ Login API Success!');
    console.log('Response:', {
      message: response.message,
      user: {
        id: response.user._id,
        name: response.user.name,
        email: response.user.email,
        phone: response.user.phone,
        role: response.user.role,
        isActive: response.user.isActive
      },
      hasAccessToken: !!response.accessToken,
      hasRefreshToken: !!response.refreshToken
    });

    return {
      success: true,
      message: 'Login successful!',
      user: response.user,
      tokens: {
        accessToken: response.accessToken,
        refreshToken: response.refreshToken
      }
    };

  } catch (error) {
    console.error('❌ Login API Failed:', error);
    
    return {
      success: false,
      error: error,
      message: 'Login failed - please check credentials'
    };
  }
};

// Alternative test with demo credentials
export const testLoginAPIDemo = async () => {
  const demoCredentials: LoginRequest = {
    email: "dssasa@gmail.com",
    password: "User@123"
  };

  console.log('🧪 Testing with demo credentials...');
  
  try {
    const response = await apiService.login(demoCredentials);
    console.log('✅ Demo login successful:', response.user.name);
    return response;
  } catch (error) {
    console.error('❌ Demo login failed:', error);
    throw error;
  }
};

// Usage examples:
/*

// Test 1: Your exact curl command credentials
await testLoginAPI();

// Test 2: Demo credentials  
await testLoginAPIDemo();

// Test 3: Direct API usage
import { apiService } from './src/services/api';

const loginUser = async () => {
  try {
    const result = await apiService.login({
      email: "pr657122@gmail.com",
      password: "mySecurePassword123"
    });
    
    console.log('Login success:', result);
  } catch (error) {
    console.log('Login failed:', error);
  }
};

*/