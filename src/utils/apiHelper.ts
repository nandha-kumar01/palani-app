import { apiService } from '../services/api';

// API Helper for making authenticated requests
export const apiHelper = {
  get: async (endpoint: string) => {
    try {
      const response = await fetch(`https://palani-admin.vercel.app/api${endpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OGNkMjEwMmFiMjljOGNkYTgxNzA4OTQiLCJlbWFpbCI6ImFkbWluQHBhbGFuaS5jb20iLCJpc0FkbWluIjp0cnVlLCJpYXQiOjE3NjI1MzI2NzAsImV4cCI6MTc2MzEzNzQ3MH0.b2HoKQgssDsc3AFqBhj1uSGS5AiHxVya6iuBKncs3fI',
        },
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },
  post: async (endpoint: string, body: any) => {
    try {
      const response = await fetch(`https://palani-admin.vercel.app/api${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OGNkMjEwMmFiMjljOGNkYTgxNzA4OTQiLCJlbWFpbCI6ImFkbWluQHBhbGFuaS5jb20iLCJpc0FkbWluIjp0cnVlLCJpYXQiOjE3NjI1MzI2NzAsImV4cCI6MTc2MzEzNzQ3MH0.b2HoKQgssDsc3AFqBhj1uSGS5AiHxVya6iuBKncs3fI',
        },
        body: JSON.stringify(body),
      });
      
      // Check if response is ok
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Get response text first
      const text = await response.text();
      
      // If empty response, return success
      if (!text || text.trim() === '') {
        return { success: true, message: 'Operation completed successfully' };
      }
      
      // Try to parse JSON
      try {
        const data = JSON.parse(text);
        return data;
      } catch (parseError) {
        console.error('JSON Parse Error:', parseError);
        console.error('Response text:', text);
        // If parse fails but response was ok, return success
        return { success: true, message: 'Operation completed' };
      }
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },
};

// Test function to verify API integration
export const testRegistrationAPI = async () => {
  try {
    console.log('Testing registration API...');
    
    const testData = {
      name: 'Test User',
      email: 'test@example.com',
      phone: '9876543210',
      password: 'Test@123',
    };

    console.log('Sending registration request:', {
      ...testData,
      password: '***hidden***'
    });

    const response = await apiService.register(testData);
    
    console.log('Registration response:', response);
    
    return response;
  } catch (error) {
    console.error('Registration test failed:', error);
    throw error;
  }
};

// Helper function to format phone number for display
export const formatPhoneNumber = (phone: string): string => {
  // Remove all non-digits
  const cleaned = phone.replace(/\D/g, '');
  
  // Format as Indian phone number: +91 98765 43210
  if (cleaned.length === 10) {
    return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
  } else if (cleaned.length === 12 && cleaned.startsWith('91')) {
    return `+${cleaned.slice(0, 2)} ${cleaned.slice(2, 7)} ${cleaned.slice(7)}`;
  } else if (cleaned.length === 13 && cleaned.startsWith('91')) {
    return `+${cleaned.slice(0, 2)} ${cleaned.slice(2, 7)} ${cleaned.slice(7)}`;
  }
  
  return phone; // Return as-is if format is not recognized
};

// Validate Indian phone number
export const isValidIndianPhone = (phone: string): boolean => {
  const cleaned = phone.replace(/\D/g, '');
  
  // Indian mobile numbers: 10 digits starting with 6, 7, 8, or 9
  if (cleaned.length === 10) {
    return /^[6-9]\d{9}$/.test(cleaned);
  }
  
  // With country code +91
  if (cleaned.length === 12 && cleaned.startsWith('91')) {
    return /^91[6-9]\d{9}$/.test(cleaned);
  }
  
  return false;
};