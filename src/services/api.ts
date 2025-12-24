const API_BASE_URL = 'https://palani-admin.vercel.app/api';

export interface RegisterRequest {
  name: string;
  email: string;
  phone: string;
  password: string;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  user?: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  token?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  message: string;
  user: {
    _id: string;
    name: string;
    email: string;
    phone: string;
    role: string;
    isActive: boolean;
  };
}

export interface RegisterVerifyRequest {
  email: string;
  otp: string;
}

export interface RegisterVerifyResponse {
  success: boolean;
  message: string;
  user?: {
    id: string;
    name: string;
    email: string;
    phone: string;
    isVerified?: boolean;
  };
  token?: string;
}

export interface VerifyOTPRequest {
  email: string;
  otp: string;
}

export interface VerifyOTPResponse {
  success: boolean;
  message: string;
  user?: {
    id: string;
    name: string;
    email: string;
    phone: string;
    isVerified?: boolean;
  };
  token?: string;
}

export interface ResendOTPRequest {
  email: string;
}

export interface ResendOTPResponse {
  success: boolean;
  message: string;
}

export interface Song {
  _id: string;
  title: string;
  artist: string;
  album?: string;
  duration: number;
  audioUrl: string;
  thumbnailUrl?: string;
  genre?: string;
  releaseDate?: string;
  lyrics?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SongsResponse {
  success: boolean;
  message: string;
  data: Song[];
  total: number;
}

export interface Temple {
  _id: string;
  name: string;
  description?: string;
  photo: string; // Single photo URL from API
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  timings: {
    opening: string;
    closing: string;
  };
  isActive: boolean;
  visitCount: number;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface TemplesResponse {
  temples: Temple[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    limit: number;
  };
}

export interface Annadhanam {
  _id: string;
  name: string;
  description: string;
  location: string;
  timings: string;
  foodItems: string[];
  photo: string;
  capacity: number;
  isActive: boolean;
  contactNumber?: string;
  openingTime?: string;
  closingTime?: string;
  specialInstructions?: string;
  facilities?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface AnnadhanamResponse {
  success: boolean;
  message: string;
  annadhanam: Annadhanam[];
  total: number;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: { [key: string]: string };
  status?: number;
}

class ApiService {
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {},
    requireAuth: boolean = false
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const defaultHeaders: { [key: string]: string } = {
      'Content-Type': 'application/json',
    };

    // Add authorization header if required
    if (requireAuth) {
      const { tokenStorage } = await import('./tokenStorage');
      const token = await tokenStorage.getAccessToken();
      if (token) {
        defaultHeaders['Authorization'] = `Bearer ${token}`;
      }
    }

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
    
      const response = await fetch(url, config);
      const data = await response.json();
      
      

      if (!response.ok) {
        // Handle both 'message' and 'error' fields from API
        const errorMessage = data.message || data.error || `HTTP error! status: ${response.status}`;
        console.error(`API Error ${response.status}:`, errorMessage, data.errors);
        
        throw {
          success: false,
          message: errorMessage,
          errors: data.errors,
          status: response.status,
        } as ApiError;
      }

      // Check if API returned success: false even with 200 status
      if (data.success === false) {
        const errorMessage = data.message || data.error || 'An error occurred';
        console.error('API returned error:', errorMessage);
        
        throw {
          success: false,
          message: errorMessage,
          errors: data.errors,
        } as ApiError;
      }

      return data;
    } catch (error) {
      if (error instanceof TypeError) {
        // Network error
        console.error('Network error:', error);
        throw {
          success: false,
          message: 'Network error. Please check your internet connection.',
        } as ApiError;
      }
      
      console.error('API request error:', error);
      throw error;
    }
  }

  async register(userData: RegisterRequest): Promise<RegisterResponse> {
    return this.makeRequest<RegisterResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async registerVerify(data: RegisterVerifyRequest): Promise<RegisterVerifyResponse> {
    return this.makeRequest<RegisterVerifyResponse>('/auth/register-verify', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Add other API methods here as needed
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    return this.makeRequest<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async verifyOTP(data: VerifyOTPRequest): Promise<VerifyOTPResponse> {
    return this.makeRequest<VerifyOTPResponse>('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async resendOTP(data: ResendOTPRequest): Promise<ResendOTPResponse> {
    return this.makeRequest<ResendOTPResponse>('/auth/resend-otp', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Get user profile (authenticated request)
  async getProfile() {
    return this.makeRequest('/auth/profile', {
      method: 'GET',
    }, true); // requireAuth = true
  }

  // Logout user
  async logout() {
    return this.makeRequest('/auth/logout', {
      method: 'POST',
    }, true); // requireAuth = true
  }

  // Get all songs
  async getSongs(): Promise<SongsResponse> {
    return this.makeRequest<SongsResponse>('/songs', {
      method: 'GET',
    });
  }

  // Get all temples with admin token
  async getTemples(limit: number = 1000): Promise<TemplesResponse> {
    // Use admin token for temples API (since it requires admin access)
    const adminToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OGNkMjEwMmFiMjljOGNkYTgxNzA4OTQiLCJlbWFpbCI6ImFkbWluQHBhbGFuaS5jb20iLCJpc0FkbWluIjp0cnVlLCJpYXQiOjE3NjY0NzU3NTksImV4cCI6MTc2NzA4MDU1OX0.5WRtTCEcDR5bhMXUrIlDdPqasDXgzw0wGeUz5VLUi50';
    
    return this.makeRequest<TemplesResponse>(`/admin/temples?limit=${limit}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${adminToken}`,
      },
    });
  }

  // Get all annadhanam services with admin token
  async getAnnadhanam(): Promise<AnnadhanamResponse> {
    // Use admin token for annadhanam API (since it requires admin access)
    const adminToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OGNkMjEwMmFiMjljOGNkYTgxNzA4OTQiLCJlbWFpbCI6ImFkbWluQHBhbGFuaS5jb20iLCJpc0FkbWluIjp0cnVlLCJpYXQiOjE3NjY0NzU3NTksImV4cCI6MTc2NzA4MDU1OX0.5WRtTCEcDR5bhMXUrIlDdPqasDXgzw0wGeUz5VLUi50';
    
    return this.makeRequest<AnnadhanamResponse>('/admin/annadhanam', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${adminToken}`,
      },
    });
  }

  // Get all madangal (rest stops) with admin token
  async getMadangal(): Promise<any> {
    const adminToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OGNkMjEwMmFiMjljOGNkYTgxNzA4OTQiLCJlbWFpbCI6ImFkbWluQHBhbGFuaS5jb20iLCJpc0FkbWluIjp0cnVlLCJpYXQiOjE3NjY0NzU3NTksImV4cCI6MTc2NzA4MDU1OX0.5WRtTCEcDR5bhMXUrIlDdPqasDXgzw0wGeUz5VLUi50';

    return this.makeRequest<any>('/admin/madangal', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${adminToken}`,
      },
    });
  }

  // Get quotes (admin)
  async getQuotes(page: number = 1, limit: number = 200): Promise<any> {
    const adminToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OGNkMjEwMmFiMjljOGNkYTgxNzA4OTQiLCJlbWFpbCI6ImFkbWluQHBhbGFuaS5jb20iLCJpc0FkbWluIjp0cnVlLCJpYXQiOjE3NjY0NzU3NTksImV4cCI6MTc2NzA4MDU1OX0.5WRtTCEcDR5bhMXUrIlDdPqasDXgzw0wGeUz5VLUi50';

    return this.makeRequest<any>(`/admin/quotes?page=${page}&limit=${limit}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${adminToken}`,
      },
    });
  }
}

export const apiService = new ApiService();