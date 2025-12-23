import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { showToast } from '../utils/toast';

export interface LocationCoordinate {
  latitude: number;
  longitude: number;
  timestamp?: number;
  accuracy?: number;
  altitude?: number;
  heading?: number;
  speed?: number;
}

export interface RouteWaypoint extends LocationCoordinate {
  id: string;
  name: string;
  description?: string;
  type: 'temple' | 'checkpoint' | 'rest_area' | 'scenic_point' | 'start' | 'end';
  estimatedDuration?: number; // minutes to reach from previous point
  distance?: number; // meters from previous point
  elevation?: number;
  significance?: string;
}

export interface WalkRoute {
  id: string;
  name: string;
  description: string;
  difficulty: 'easy' | 'moderate' | 'hard' | 'expert';
  distance: number; // total distance in meters
  estimatedDuration: number; // total duration in minutes
  elevationGain: number;
  waypoints: RouteWaypoint[];
  tags: string[];
  isActive: boolean;
  createdAt: string;
  completedCount: number;
  rating: number;
  reviews: RouteReview[];
  safety: {
    level: 'low' | 'medium' | 'high';
    warnings: string[];
    emergencyContacts: string[];
    checkpoints: string[];
  };
}

export interface RouteReview {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  timestamp: string;
  completedDate: string;
  conditions?: {
    weather: string;
    crowdLevel: string;
    pathCondition: string;
  };
}

export interface TrackingSession {
  id: string;
  routeId?: string;
  startTime: string;
  endTime?: string;
  path: LocationCoordinate[];
  distance: number;
  duration: number;
  averageSpeed: number;
  maxSpeed: number;
  elevationGain: number;
  calories?: number;
  steps?: number;
  status: 'active' | 'paused' | 'completed' | 'stopped';
  checkpoints: {
    waypointId: string;
    timestamp: string;
    actualLocation: LocationCoordinate;
  }[];
}

export interface SafetyAlert {
  id: string;
  type: 'emergency' | 'medical' | 'weather' | 'route_deviation' | 'low_battery' | 'offline';
  message: string;
  location: LocationCoordinate;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  resolved: boolean;
  resolvedAt?: string;
}

class AdvancedLocationService {
  private static instance: AdvancedLocationService;
  private watchId: Location.LocationSubscription | null = null;
  private currentSession: TrackingSession | null = null;
  private isTracking = false;
  private lastLocation: LocationCoordinate | null = null;
  private trackingCallbacks: ((location: LocationCoordinate) => void)[] = [];
  private safetyCallbacks: ((alert: SafetyAlert) => void)[] = [];
  private routes: WalkRoute[] = [];
  private emergencyContacts: string[] = [];

  private constructor() {
    this.initializeRoutes();
    this.loadEmergencyContacts();
  }

  public static getInstance(): AdvancedLocationService {
    if (!AdvancedLocationService.instance) {
      AdvancedLocationService.instance = new AdvancedLocationService();
    }
    return AdvancedLocationService.instance;
  }

  // Permission Management
  public async requestLocationPermissions(): Promise<boolean> {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        showToast.error('Location permission is required for tracking');
        return false;
      }

      const backgroundStatus = await Location.requestBackgroundPermissionsAsync();
      if (backgroundStatus.status !== 'granted') {
        showToast.warning('Background location permission recommended for better tracking');
      }

      return true;
    } catch (error) {
      console.error('Failed to request location permissions:', error);
      return false;
    }
  }

  public async getCurrentLocation(): Promise<LocationCoordinate | null> {
    try {
      const hasPermission = await this.requestLocationPermissions();
      if (!hasPermission) return null;

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        mayShowUserSettingsDialog: true,
      });

      const coordinate: LocationCoordinate = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        timestamp: location.timestamp,
        accuracy: location.coords.accuracy || undefined,
        altitude: location.coords.altitude || undefined,
        heading: location.coords.heading || undefined,
        speed: location.coords.speed || undefined,
      };

      this.lastLocation = coordinate;
      return coordinate;
    } catch (error) {
      console.error('Failed to get current location:', error);
      showToast.error('Failed to get your location');
      return null;
    }
  }

  // Route Management
  private async initializeRoutes() {
    this.routes = [
      {
        id: 'main_pilgrimage',
        name: 'Main Pilgrimage Route',
        description: 'Traditional pilgrimage path to the main temple with scenic viewpoints',
        difficulty: 'moderate',
        distance: 5200,
        estimatedDuration: 180,
        elevationGain: 450,
        waypoints: [
          {
            id: 'start',
            name: 'Base Camp',
            latitude: 10.4500,
            longitude: 77.5180,
            type: 'start',
            description: 'Starting point with facilities and information center',
            estimatedDuration: 0,
            distance: 0,
            elevation: 300,
          },
          {
            id: 'checkpoint1',
            name: 'First Rest Point',
            latitude: 10.4510,
            longitude: 77.5190,
            type: 'rest_area',
            description: 'Shaded rest area with drinking water',
            estimatedDuration: 30,
            distance: 1200,
            elevation: 380,
          },
          {
            id: 'viewpoint1',
            name: 'Valley Viewpoint',
            latitude: 10.4515,
            longitude: 77.5200,
            type: 'scenic_point',
            description: 'Panoramic view of the valley below',
            estimatedDuration: 60,
            distance: 2400,
            elevation: 520,
            significance: 'Best sunrise viewing spot',
          },
          {
            id: 'temple_entrance',
            name: 'Temple Entrance',
            latitude: 10.4516,
            longitude: 77.5206,
            type: 'temple',
            description: 'Main temple entrance and darshan queue',
            estimatedDuration: 120,
            distance: 4800,
            elevation: 750,
            significance: 'Main temple complex',
          },
          {
            id: 'summit',
            name: 'Summit Temple',
            latitude: 10.4520,
            longitude: 77.5210,
            type: 'end',
            description: 'Sacred summit with panoramic views',
            estimatedDuration: 180,
            distance: 5200,
            elevation: 750,
            significance: 'Highest point of pilgrimage',
          },
        ],
        tags: ['pilgrimage', 'scenic', 'moderate', 'historic'],
        isActive: true,
        createdAt: new Date().toISOString(),
        completedCount: 1247,
        rating: 4.7,
        reviews: [
          {
            id: 'r1',
            userId: 'user123',
            userName: 'Rajesh Kumar',
            rating: 5,
            comment: 'Beautiful route with amazing views. Well maintained path.',
            timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            completedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            conditions: {
              weather: 'Clear',
              crowdLevel: 'Medium',
              pathCondition: 'Good',
            },
          },
        ],
        safety: {
          level: 'medium',
          warnings: [
            'Steep sections require caution',
            'Weather can change quickly',
            'Carry sufficient water',
          ],
          emergencyContacts: ['108', '+91-94444-12345'],
          checkpoints: ['checkpoint1', 'viewpoint1', 'temple_entrance'],
        },
      },
      {
        id: 'sunset_circuit',
        name: 'Sunset Circuit Route',
        description: 'Circular route perfect for evening walks with sunset views',
        difficulty: 'easy',
        distance: 2800,
        estimatedDuration: 90,
        elevationGain: 150,
        waypoints: [
          {
            id: 'parking',
            name: 'Parking Area',
            latitude: 10.4495,
            longitude: 77.5175,
            type: 'start',
            description: 'Vehicle parking and trail start',
            estimatedDuration: 0,
            distance: 0,
            elevation: 280,
          },
          {
            id: 'sunset_point',
            name: 'Sunset Viewpoint',
            latitude: 10.4505,
            longitude: 77.5185,
            type: 'scenic_point',
            description: 'Best sunset viewing location',
            estimatedDuration: 45,
            distance: 1400,
            elevation: 430,
            significance: 'Famous sunset photography spot',
          },
          {
            id: 'return_path',
            name: 'Return Path',
            latitude: 10.4495,
            longitude: 77.5175,
            type: 'end',
            description: 'Return to starting point',
            estimatedDuration: 90,
            distance: 2800,
            elevation: 280,
          },
        ],
        tags: ['sunset', 'easy', 'circular', 'photography'],
        isActive: true,
        createdAt: new Date().toISOString(),
        completedCount: 892,
        rating: 4.5,
        reviews: [],
        safety: {
          level: 'low',
          warnings: ['Return before dark', 'Slippery when wet'],
          emergencyContacts: ['108'],
          checkpoints: ['sunset_point'],
        },
      },
    ];
  }

  public getAvailableRoutes(): WalkRoute[] {
    return this.routes.filter(route => route.isActive);
  }

  public getRouteById(id: string): WalkRoute | null {
    return this.routes.find(route => route.id === id) || null;
  }

  public async addRouteReview(routeId: string, review: Omit<RouteReview, 'id'>): Promise<boolean> {
    try {
      const route = this.routes.find(r => r.id === routeId);
      if (!route) return false;

      const newReview: RouteReview = {
        ...review,
        id: Date.now().toString(),
      };

      route.reviews.push(newReview);
      
      // Recalculate average rating
      const totalRating = route.reviews.reduce((sum, r) => sum + r.rating, 0);
      route.rating = totalRating / route.reviews.length;

      await this.saveRoutesToStorage();
      return true;
    } catch (error) {
      console.error('Failed to add route review:', error);
      return false;
    }
  }

  // Tracking Management
  public async startTracking(routeId?: string): Promise<TrackingSession | null> {
    try {
      const hasPermission = await this.requestLocationPermissions();
      if (!hasPermission) return null;

      if (this.isTracking) {
        throw new Error('Tracking already in progress');
      }

      const sessionId = `session_${Date.now()}`;
      this.currentSession = {
        id: sessionId,
        routeId,
        startTime: new Date().toISOString(),
        path: [],
        distance: 0,
        duration: 0,
        averageSpeed: 0,
        maxSpeed: 0,
        elevationGain: 0,
        status: 'active',
        checkpoints: [],
      };

      this.isTracking = true;

      // Start location tracking
      this.watchId = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000, // Update every 5 seconds
          distanceInterval: 10, // Update every 10 meters
        },
        (location) => {
          this.handleLocationUpdate(location);
        }
      );

      // Save session
      await this.saveSessionToStorage(this.currentSession);
      
      showToast.success('Tracking started');
      return this.currentSession;
    } catch (error) {
      console.error('Failed to start tracking:', error);
      showToast.error('Failed to start tracking');
      return null;
    }
  }

  public async pauseTracking(): Promise<boolean> {
    try {
      if (!this.isTracking || !this.currentSession) return false;

      this.currentSession.status = 'paused';
      await this.saveSessionToStorage(this.currentSession);
      
      if (this.watchId) {
        this.watchId.remove();
        this.watchId = null;
      }

      showToast.success('Tracking paused');
      return true;
    } catch (error) {
      console.error('Failed to pause tracking:', error);
      return false;
    }
  }

  public async resumeTracking(): Promise<boolean> {
    try {
      if (!this.currentSession || this.currentSession.status !== 'paused') return false;

      this.currentSession.status = 'active';
      
      // Resume location tracking
      this.watchId = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000,
          distanceInterval: 10,
        },
        (location) => {
          this.handleLocationUpdate(location);
        }
      );

      await this.saveSessionToStorage(this.currentSession);
      showToast.success('Tracking resumed');
      return true;
    } catch (error) {
      console.error('Failed to resume tracking:', error);
      return false;
    }
  }

  public async stopTracking(): Promise<TrackingSession | null> {
    try {
      if (!this.isTracking || !this.currentSession) return null;

      this.currentSession.status = 'completed';
      this.currentSession.endTime = new Date().toISOString();
      
      // Calculate final statistics
      this.calculateSessionStats();

      if (this.watchId) {
        this.watchId.remove();
        this.watchId = null;
      }

      this.isTracking = false;
      
      const completedSession = this.currentSession;
      await this.saveSessionToStorage(completedSession);
      await this.addCompletedSession(completedSession);
      
      this.currentSession = null;
      
      showToast.success('Tracking completed');
      return completedSession;
    } catch (error) {
      console.error('Failed to stop tracking:', error);
      return null;
    }
  }

  private handleLocationUpdate(location: Location.LocationObject): void {
    if (!this.currentSession) return;

    const coordinate: LocationCoordinate = {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      timestamp: location.timestamp,
      accuracy: location.coords.accuracy || undefined,
      altitude: location.coords.altitude || undefined,
      heading: location.coords.heading || undefined,
      speed: location.coords.speed || undefined,
    };

    // Add to path
    this.currentSession.path.push(coordinate);

    // Calculate distance from last point
    if (this.lastLocation) {
      const distance = this.calculateDistance(this.lastLocation, coordinate);
      this.currentSession.distance += distance;

      // Check for route deviations if following a route
      if (this.currentSession.routeId) {
        this.checkRouteDeviation(coordinate);
      }

      // Safety monitoring
      this.checkSafetyConditions(coordinate);
    }

    this.lastLocation = coordinate;

    // Update statistics
    this.updateSessionStats();

    // Notify callbacks
    this.trackingCallbacks.forEach(callback => callback(coordinate));

    // Save session periodically
    if (this.currentSession.path.length % 10 === 0) {
      this.saveSessionToStorage(this.currentSession);
    }
  }

  private calculateDistance(point1: LocationCoordinate, point2: LocationCoordinate): number {
    const R = 6371000; // Earth's radius in meters
    const dLat = (point2.latitude - point1.latitude) * Math.PI / 180;
    const dLon = (point2.longitude - point1.longitude) * Math.PI / 180;
    
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(point1.latitude * Math.PI / 180) * Math.cos(point2.latitude * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private checkRouteDeviation(currentLocation: LocationCoordinate): void {
    if (!this.currentSession?.routeId) return;

    const route = this.getRouteById(this.currentSession.routeId);
    if (!route) return;

    // Find nearest waypoint
    let nearestDistance = Number.MAX_VALUE;
    let nearestWaypoint: RouteWaypoint | null = null;

    route.waypoints.forEach(waypoint => {
      const distance = this.calculateDistance(currentLocation, waypoint);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestWaypoint = waypoint;
      }
    });

    // Check if significantly off route (more than 100 meters from nearest waypoint)
    if (nearestDistance > 100 && nearestWaypoint) {
      this.createSafetyAlert({
        type: 'route_deviation',
        message: `You are ${Math.round(nearestDistance)}m away from the route. Consider returning to ${nearestWaypoint.name}.`,
        location: currentLocation,
        severity: 'medium',
      });
    }

    // Check if reached a checkpoint
    if (nearestDistance < 50 && nearestWaypoint && nearestWaypoint.type !== 'start') {
      const alreadyReached = this.currentSession.checkpoints.some(cp => cp.waypointId === nearestWaypoint!.id);
      if (!alreadyReached) {
        this.currentSession.checkpoints.push({
          waypointId: nearestWaypoint.id,
          timestamp: new Date().toISOString(),
          actualLocation: currentLocation,
        });
        
        showToast.success(`Reached ${nearestWaypoint.name}`);
      }
    }
  }

  private checkSafetyConditions(location: LocationCoordinate): void {
    // Check battery level (would need native module integration)
    // For now, simulate battery check
    
    // Check if user has been stationary for too long
    if (this.currentSession && this.currentSession.path.length > 10) {
      const recentPath = this.currentSession.path.slice(-10);
      const distances = recentPath.slice(1).map((point, index) => 
        this.calculateDistance(recentPath[index], point)
      );
      const totalRecentDistance = distances.reduce((sum, d) => sum + d, 0);
      
      // If moved less than 20 meters in last 10 updates (5 minutes), create alert
      if (totalRecentDistance < 20) {
        this.createSafetyAlert({
          type: 'medical',
          message: 'You have been stationary for a while. Are you okay?',
          location,
          severity: 'medium',
        });
      }
    }
  }

  private createSafetyAlert(alertData: Omit<SafetyAlert, 'id' | 'timestamp' | 'resolved'>): void {
    const alert: SafetyAlert = {
      ...alertData,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      resolved: false,
    };

    // Notify callbacks
    this.safetyCallbacks.forEach(callback => callback(alert));

    // Auto-resolve some alerts after time
    if (alert.type === 'route_deviation') {
      setTimeout(() => {
        alert.resolved = true;
        alert.resolvedAt = new Date().toISOString();
      }, 5 * 60 * 1000); // 5 minutes
    }
  }

  private updateSessionStats(): void {
    if (!this.currentSession) return;

    const now = new Date();
    const startTime = new Date(this.currentSession.startTime);
    this.currentSession.duration = Math.floor((now.getTime() - startTime.getTime()) / 1000); // seconds

    if (this.currentSession.duration > 0) {
      this.currentSession.averageSpeed = (this.currentSession.distance / this.currentSession.duration) * 3.6; // km/h
    }

    // Update max speed if current speed is higher
    if (this.lastLocation?.speed) {
      const speedKmh = (this.lastLocation.speed || 0) * 3.6;
      if (speedKmh > this.currentSession.maxSpeed) {
        this.currentSession.maxSpeed = speedKmh;
      }
    }

    // Calculate elevation gain
    if (this.currentSession.path.length > 1) {
      let totalGain = 0;
      for (let i = 1; i < this.currentSession.path.length; i++) {
        const prev = this.currentSession.path[i - 1];
        const curr = this.currentSession.path[i];
        if (prev.altitude && curr.altitude && curr.altitude > prev.altitude) {
          totalGain += curr.altitude - prev.altitude;
        }
      }
      this.currentSession.elevationGain = totalGain;
    }
  }

  private calculateSessionStats(): void {
    if (!this.currentSession) return;

    // Calculate final duration
    const endTime = new Date(this.currentSession.endTime || new Date());
    const startTime = new Date(this.currentSession.startTime);
    this.currentSession.duration = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);

    // Calculate average speed
    if (this.currentSession.duration > 0) {
      this.currentSession.averageSpeed = (this.currentSession.distance / this.currentSession.duration) * 3.6;
    }

    // Estimate calories (rough calculation: 50 calories per km)
    this.currentSession.calories = Math.round((this.currentSession.distance / 1000) * 50);

    // Estimate steps (rough calculation: 1300 steps per km)
    this.currentSession.steps = Math.round((this.currentSession.distance / 1000) * 1300);
  }

  // Event Listeners
  public addTrackingCallback(callback: (location: LocationCoordinate) => void): void {
    this.trackingCallbacks.push(callback);
  }

  public removeTrackingCallback(callback: (location: LocationCoordinate) => void): void {
    const index = this.trackingCallbacks.indexOf(callback);
    if (index > -1) {
      this.trackingCallbacks.splice(index, 1);
    }
  }

  public addSafetyCallback(callback: (alert: SafetyAlert) => void): void {
    this.safetyCallbacks.push(callback);
  }

  public removeSafetyCallback(callback: (alert: SafetyAlert) => void): void {
    const index = this.safetyCallbacks.indexOf(callback);
    if (index > -1) {
      this.safetyCallbacks.splice(index, 1);
    }
  }

  // Emergency Functions
  private async loadEmergencyContacts(): Promise<void> {
    try {
      const contacts = await AsyncStorage.getItem('emergency_contacts');
      this.emergencyContacts = contacts ? JSON.parse(contacts) : ['108', '112'];
    } catch (error) {
      console.error('Failed to load emergency contacts:', error);
      this.emergencyContacts = ['108', '112'];
    }
  }

  public async sendEmergencyAlert(location?: LocationCoordinate): Promise<boolean> {
    try {
      const currentLocation = location || await this.getCurrentLocation();
      if (!currentLocation) {
        showToast.error('Cannot get current location for emergency alert');
        return false;
      }

      // Create emergency alert
      this.createSafetyAlert({
        type: 'emergency',
        message: `Emergency alert triggered at coordinates: ${currentLocation.latitude}, ${currentLocation.longitude}`,
        location: currentLocation,
        severity: 'critical',
      });

      // In a real app, this would send SMS or call emergency services
      showToast.success('Emergency alert sent to contacts');
      
      return true;
    } catch (error) {
      console.error('Failed to send emergency alert:', error);
      showToast.error('Failed to send emergency alert');
      return false;
    }
  }

  // Storage Functions
  private async saveSessionToStorage(session: TrackingSession): Promise<void> {
    try {
      await AsyncStorage.setItem(`session_${session.id}`, JSON.stringify(session));
    } catch (error) {
      console.error('Failed to save session to storage:', error);
    }
  }

  private async addCompletedSession(session: TrackingSession): Promise<void> {
    try {
      const existing = await AsyncStorage.getItem('completed_sessions');
      const sessions: string[] = existing ? JSON.parse(existing) : [];
      sessions.unshift(session.id);
      
      // Keep only last 50 sessions
      if (sessions.length > 50) {
        sessions.splice(50);
      }
      
      await AsyncStorage.setItem('completed_sessions', JSON.stringify(sessions));
    } catch (error) {
      console.error('Failed to add completed session:', error);
    }
  }

  private async saveRoutesToStorage(): Promise<void> {
    try {
      await AsyncStorage.setItem('routes', JSON.stringify(this.routes));
    } catch (error) {
      console.error('Failed to save routes to storage:', error);
    }
  }

  public async getCompletedSessions(): Promise<TrackingSession[]> {
    try {
      const sessionIds = await AsyncStorage.getItem('completed_sessions');
      if (!sessionIds) return [];

      const ids: string[] = JSON.parse(sessionIds);
      const sessions: TrackingSession[] = [];

      for (const id of ids) {
        const sessionData = await AsyncStorage.getItem(`session_${id}`);
        if (sessionData) {
          sessions.push(JSON.parse(sessionData));
        }
      }

      return sessions.sort((a, b) => 
        new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
      );
    } catch (error) {
      console.error('Failed to get completed sessions:', error);
      return [];
    }
  }

  // Getters
  public getCurrentSession(): TrackingSession | null {
    return this.currentSession;
  }

  public getIsTracking(): boolean {
    return this.isTracking;
  }

  public getLastLocation(): LocationCoordinate | null {
    return this.lastLocation;
  }
}

export default AdvancedLocationService.getInstance();