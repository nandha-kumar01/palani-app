import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Animated,
  Platform,
  ScrollView,
  PermissionsAndroid,
} from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_DEFAULT } from 'react-native-maps';
import * as Location from 'expo-location';
import { Pedometer, Accelerometer } from 'expo-sensors';
import { LinearGradient } from '../components/WebLinearGradient';
import { colors, spacing } from '../utils/theme';
import { useLanguage } from '../context/LanguageContext';

interface LiveTrackingScreenProps {
  navigation: any;
}

export default function LiveTrackingScreen({ navigation }: LiveTrackingScreenProps) {
  const { language } = useLanguage();
  const [isTracking, setIsTracking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [distance, setDistance] = useState(0);
  const [speed, setSpeed] = useState(0);
  const [steps, setSteps] = useState(0);
  const [calories, setCalories] = useState(0);
  const [hasLocationPermission, setHasLocationPermission] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<any>(null);
  const [route, setRoute] = useState<any[]>([]);
  const [mapRegion, setMapRegion] = useState<any>(null);
  
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const locationSubscription = useRef<any>(null);
  const pedometerSubscription = useRef<any>(null);
  const accelerometerSubscription = useRef<any>(null);
  const lastLocation = useRef<any>(null);
  const startStepCount = useRef<number>(0);
  const lastAcceleration = useRef<number>(0);
  const stepDetectionThreshold = useRef<number>(1.2);
  const lastStepTime = useRef<number>(0);
  const isTrackingRef = useRef<boolean>(false);
  const isPausedRef = useRef<boolean>(false);

  // Request location permission on mount
  useEffect(() => {
    checkLocationPermission();
    checkPedometerAvailability();
    
    return () => {
      if (locationSubscription.current) {
        locationSubscription.current.remove();
      }
      if (pedometerSubscription.current) {
        pedometerSubscription.current.remove();
      }
      if (accelerometerSubscription.current) {
        accelerometerSubscription.current.remove();
      }
    };
  }, []);

  const checkPedometerAvailability = async () => {
    const isAvailable = await Pedometer.isAvailableAsync();
    if (isAvailable) {
      console.log('Pedometer is available');
    } else {
      console.log('Pedometer not available on this device');
    }
  };

  const requestActivityPermission = async (): Promise<boolean> => {
    if (Platform.OS === 'android' && Platform.Version >= 29) {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACTIVITY_RECOGNITION,
          {
            title: language === 'ta' ? 'உடல் செயல்பாடு அனுமதி' : 'Physical Activity Permission',
            message: language === 'ta'
              ? 'உங்கள் அடிகளை கணக்கிட செயல்பாடு அங்கீகாரம் தேவை'
              : 'We need access to your physical activity to count your steps accurately',
            buttonNeutral: language === 'ta' ? 'பின்னர் கேளுங்கள்' : 'Ask Me Later',
            buttonNegative: language === 'ta' ? 'ரத்து' : 'Cancel',
            buttonPositive: 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn('❌ Activity permission error:', err);
        return false;
      }
    }
    return true; // iOS doesn't need this permission
  };

  const checkLocationPermission = async () => {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status === 'granted') {
        setHasLocationPermission(true);
        getCurrentLocation();
      }
    } catch (error) {
      console.log('Location permission not granted yet');
    }
  };

  const requestLocationPermission = async () => {
    try {
      // Check if location services are enabled
      const isEnabled = await Location.hasServicesEnabledAsync();
      
      if (!isEnabled) {
        Alert.alert(
          language === 'ta' ? 'GPS முடக்கப்பட்டுள்ளது' : 'GPS Disabled',
          language === 'ta' 
            ? 'உங்கள் சாதனத்தில் GPS அல்லது இடச் சேவைகளை இயக்கவும்'
            : 'Please enable GPS or Location Services on your device',
          [{ text: 'OK' }]
        );
        return;
      }

      // First check if already granted
      const { status: existingStatus } = await Location.getForegroundPermissionsAsync();
      
      if (existingStatus === 'granted') {
        setHasLocationPermission(true);
        await getCurrentLocation();
        await startLocationTracking(); // Start live tracking immediately
        return;
      }

      // Request permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status === 'granted') {
        setHasLocationPermission(true);
        await getCurrentLocation();
        await startLocationTracking(); // Start live tracking immediately
        
        Alert.alert(
          language === 'ta' ? '✅ அனுமதி வழங்கப்பட்டது' : '✅ Permission Granted',
          language === 'ta' 
            ? 'இப்போது உங்கள் நேரடி இடம் மேப்பில் காட்டப்படும்'
            : 'Your live location is now shown on the map'
        );
      } else {
        setHasLocationPermission(false);
        Alert.alert(
          language === 'ta' ? 'அனுமதி மறுக்கப்பட்டது' : 'Permission Denied',
          language === 'ta' 
            ? 'இடம் அனுமதி இல்லாமல் நேரடி கண்காணிப்பு வேலை செய்யாது'
            : 'Live tracking will not work without location permission'
        );
      }
    } catch (error) {
      console.error('Error requesting location permission:', error);
      Alert.alert(
        language === 'ta' ? 'பிழை' : 'Error',
        language === 'ta' 
          ? 'இடம் அனுமதி கோரும்போது பிழை ஏற்பட்டது'
          : 'Error requesting location permission'
      );
    }
  };

  const getCurrentLocation = async () => {
    try {
      console.log('Getting current location...');
      
      // Check if location services are enabled first
      const isEnabled = await Location.hasServicesEnabledAsync();
      if (!isEnabled) {
        Alert.alert(
          language === 'ta' ? 'GPS முடக்கப்பட்டுள்ளது' : 'GPS Disabled',
          language === 'ta' 
            ? 'தயவுசெய்து உங்கள் சாதன அமைப்புகளில் இருந்து GPS அல்லது இடச் சேவைகளை இயக்கவும்'
            : 'Please enable GPS or Location Services from your device settings',
          [{ text: 'OK' }]
        );
        return;
      }

      // Try to get current position with lower accuracy first
      let location;
      try {
        location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
      } catch (balancedError) {
        console.log('High accuracy failed, trying low accuracy...');
        // If balanced fails, try low accuracy
        location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Low,
        });
      }
      
      console.log('Current location received:', location.coords);
      
      setCurrentLocation(location.coords);
      setMapRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.003,
        longitudeDelta: 0.003,
      });
      
      lastLocation.current = location.coords;
    } catch (error) {
      console.error('Error getting current location:', error);
      
      // Try to use last known location
      try {
        console.log('Trying last known location...');
        const lastKnown = await Location.getLastKnownPositionAsync();
        if (lastKnown) {
          console.log('Using last known location');
          setCurrentLocation(lastKnown.coords);
          setMapRegion({
            latitude: lastKnown.coords.latitude,
            longitude: lastKnown.coords.longitude,
            latitudeDelta: 0.003,
            longitudeDelta: 0.003,
          });
          lastLocation.current = lastKnown.coords;
          
          Alert.alert(
            language === 'ta' ? 'கடைசி அறியப்பட்ட இடம்' : 'Last Known Location',
            language === 'ta' 
              ? 'தற்போதைய GPS கிடைக்கவில்லை. கடைசி அறியப்பட்ட இடம் காட்டப்படுகிறது'
              : 'Current GPS unavailable. Showing last known location'
          );
          return;
        }
      } catch (e) {
        console.log('No last known location available');
      }
      
      // Show detailed error
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      Alert.alert(
        language === 'ta' ? 'GPS பிழை' : 'GPS Error',
        language === 'ta' 
          ? 'உங்கள் இடத்தைப் பெற முடியவில்லை.\n\n1. GPS/இடச் சேவைகள் இயக்கப்பட்டுள்ளதா?\n2. வெளியில் இருக்கிறீர்களா அல்லது ஜன்னலுக்கு அருகில் இருக்கிறீர்களா?\n3. சில நொடிகள் காத்திருந்து மீண்டும் முயற்சிக்கவும்'
          : 'Unable to get your location.\n\n1. Is GPS/Location Services enabled?\n2. Are you outdoors or near a window?\n3. Wait a few seconds and try again',
        [
          { 
            text: language === 'ta' ? 'மீண்டும் முயற்சி' : 'Retry', 
            onPress: () => getCurrentLocation()
          },
          {
            text: language === 'ta' ? 'இல்லை' : 'Cancel',
            style: 'cancel'
          }
        ]
      );
    }
  };

  const startLocationTracking = () => {
    Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 2000, // Update every 2 seconds
        distanceInterval: 1, // Update every 1 meter
      },
      (location) => {
        const newCoords = location.coords;
        
        console.log('📍 Location update:', newCoords.latitude.toFixed(5), newCoords.longitude.toFixed(5));
        
        // Always update current location
        setCurrentLocation(newCoords);
        
        // Update map region to follow user
        setMapRegion({
          latitude: newCoords.latitude,
          longitude: newCoords.longitude,
          latitudeDelta: 0.003,
          longitudeDelta: 0.003,
        });
        
        // Calculate distance if we have previous location and tracking is active
        if (lastLocation.current && isTrackingRef.current && !isPausedRef.current) {
          const dist = calculateDistance(
            lastLocation.current.latitude,
            lastLocation.current.longitude,
            newCoords.latitude,
            newCoords.longitude
          );
          
          console.log('📏 Distance calculated:', (dist * 1000).toFixed(2), 'meters');
          
          setDistance(prev => {
            const newDist = prev + dist;
            console.log('📊 Total distance:', newDist.toFixed(3), 'km');
            return newDist;
          });
        }
        
        // Add to route when tracking
        if (isTrackingRef.current && !isPausedRef.current) {
          setRoute(prev => [...prev, {
            latitude: newCoords.latitude,
            longitude: newCoords.longitude,
          }]);
        }
        
        lastLocation.current = newCoords;
        
        // Update speed (convert m/s to km/h)
        if (newCoords.speed !== null && newCoords.speed >= 0) {
          setSpeed(newCoords.speed * 3.6);
        }
      }
    ).then(subscription => {
      locationSubscription.current = subscription;
      console.log('✅ Location tracking started successfully');
    }).catch(error => {
      console.error('❌ Error starting location tracking:', error);
    });
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth's radius in km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const toRad = (value: number) => {
    return value * Math.PI / 180;
  };

  useEffect(() => {
    if (isTracking && !isPaused) {
      console.log('⏰ Timer starting...');
      timerRef.current = setInterval(() => {
        setDuration(prev => {
          const newDuration = prev + 1;
          if (newDuration % 10 === 0) {
            console.log('⏱️ Duration:', newDuration, 'seconds');
          }
          return newDuration;
        });
        // Calories calculated based on steps (approx 0.04 kcal per step)
        setCalories(Math.round(steps * 0.04));
      }, 1000);
    } else {
      if (timerRef.current) {
        console.log('⏰ Timer stopped');
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isTracking, isPaused, steps]);

  useEffect(() => {
    if (isTracking) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.3, duration: 1000, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isTracking]);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDistance = (km: number) => {
    if (km < 1) return `${Math.round(km * 1000)} m`;
    return `${km.toFixed(2)} km`;
  };

  const startAccelerometerStepDetection = () => {
    console.log('📱 Starting accelerometer-based step detection...');
    
    // Set update interval to 100ms for responsive step detection
    Accelerometer.setUpdateInterval(100);
    
    // Stop any existing subscription
    if (accelerometerSubscription.current) {
      accelerometerSubscription.current.remove();
    }
    
    accelerometerSubscription.current = Accelerometer.addListener(({ x, y, z }) => {
      // Calculate total acceleration magnitude
      const acceleration = Math.sqrt(x * x + y * y + z * z);
      
      // Detect peaks in acceleration (steps)
      const now = Date.now();
      const timeSinceLastStep = now - lastStepTime.current;
      
      // Check if acceleration crosses threshold and enough time has passed (min 200ms between steps)
      if (acceleration > stepDetectionThreshold.current && 
          lastAcceleration.current <= stepDetectionThreshold.current &&
          timeSinceLastStep > 200) {
        
        // Step detected!
        lastStepTime.current = now;
        setSteps(prev => {
          const newSteps = prev + 1;
          console.log('🚶 Step detected! Total steps:', newSteps);
          return newSteps;
        });
      }
      
      lastAcceleration.current = acceleration;
    });
    
    console.log('✅ Accelerometer step detection started');
  };

  const startPedometer = () => {
    console.log('🔄 Starting pedometer...');
    
    // Request permission and start pedometer
    requestActivityPermission().then(hasPermission => {
      if (!hasPermission) {
        console.log('❌ Activity permission denied');
        return;
      }
      
      console.log('✅ Activity permission granted');
      
      // Check if pedometer is available
      Pedometer.isAvailableAsync().then(isAvailable => {
        if (!isAvailable) {
          console.log('❌ Pedometer not available on this device');
          return;
        }
        
        console.log('✅ Pedometer available, creating subscription...');
        
        // Stop any existing subscription
        if (pedometerSubscription.current) {
          pedometerSubscription.current.remove();
        }
        
        // Subscribe to step updates
        pedometerSubscription.current = Pedometer.watchStepCount(result => {
          console.log('📊 Pedometer update! Steps:', result.steps);
          
          // Set baseline on first reading
          if (startStepCount.current === 0) {
            startStepCount.current = result.steps;
            console.log('🎯 Baseline set:', startStepCount.current);
            setSteps(0);
          } else {
            // Calculate steps since we started
            const walkSteps = result.steps - startStepCount.current;
            console.log('🚶 Walk steps:', walkSteps);
            setSteps(walkSteps > 0 ? walkSteps : 0);
          }
        });
        
        console.log('✅ Pedometer subscription created');
      }).catch(error => {
        console.error('❌ Pedometer check error:', error);
      });
    }).catch(error => {
      console.error('❌ Permission error:', error);
    });
  };

  const handleStartTracking = () => {
    console.log('👆 Start button clicked!');
    
    // Prevent multiple rapid calls
    if (isTracking) {
      console.log('⚠️ Already tracking, ignoring...');
      return;
    }

    if (!hasLocationPermission) {
      Alert.alert(
        language === 'ta' ? 'அனுமதி தேவை' : 'Permission Required',
        language === 'ta' 
          ? 'முதலில் இடம் அனுமதி வழங்கவும்'
          : 'Please grant location permission first',
        [
          { text: language === 'ta' ? 'இல்லை' : 'Cancel', style: 'cancel' },
          { 
            text: language === 'ta' ? 'அனுமதி' : 'Allow', 
            onPress: () => requestLocationPermission()
          }
        ]
      );
      return;
    }

    if (!currentLocation) {
      Alert.alert(
        language === 'ta' ? 'GPS கிடைக்கவில்லை' : 'GPS Not Ready',
        language === 'ta' 
          ? 'உங்கள் இடம் கிடைக்கும் வரை காத்திருக்கவும்'
          : 'Please wait for GPS location to be ready',
        [{ text: 'OK' }]
      );
      return;
    }

    console.log('🚀 Starting tracking...');
    
    // Reset all states
    setDuration(0);
    setDistance(0);
    setSpeed(0);
    setSteps(0);
    setCalories(0);
    setRoute([{
      latitude: currentLocation.latitude,
      longitude: currentLocation.longitude,
    }]);
    startStepCount.current = 0;
    lastLocation.current = currentLocation;
    
    // Start location tracking immediately
    console.log('📍 Starting location tracking...');
    startLocationTracking();
    
    // Start accelerometer-based step detection (more accurate than pedometer)
    console.log('🚶 Starting step detection...');
    startAccelerometerStepDetection();
    
    // Set tracking to true
    console.log('✅ Setting tracking state to true...');
    setIsTracking(true);
    setIsPaused(false);
    isTrackingRef.current = true;
    isPausedRef.current = false;
    
    console.log('✅ Tracking started! Timer should be running now.');
  };

  const handlePauseResume = () => {
    const newPausedState = !isPaused;
    setIsPaused(newPausedState);
    isPausedRef.current = newPausedState;
    
    if (newPausedState) {
      console.log('⏸️ Tracking paused');
      // Stop accelerometer when paused
      if (accelerometerSubscription.current) {
        accelerometerSubscription.current.remove();
        accelerometerSubscription.current = null;
      }
    } else {
      console.log('▶️ Tracking resumed');
      // Restart accelerometer when resumed
      startAccelerometerStepDetection();
    }
  };

  const handleEndTracking = () => {
    Alert.alert(
      language === 'ta' ? 'நடையை முடிக்கவா?' : 'End Walk?',
      language === 'ta' ? 'உங்கள் பாதயாத்திரையை முடிக்க விரும்புகிறீர்களா?' : 'Are you sure you want to end your pathayathirai?',
      [
        { text: language === 'ta' ? 'இல்லை' : 'Cancel', style: 'cancel' },
        { 
          text: language === 'ta' ? 'முடி' : 'End', 
          style: 'destructive',
          onPress: () => {
            setIsTracking(false);
            setIsPaused(false);
            isTrackingRef.current = false;
            isPausedRef.current = false;
            setDuration(0);
            setDistance(0);
            setSpeed(0);
            setSteps(0);
            setCalories(0);
            setRoute([]);
            
            if (locationSubscription.current) {
              locationSubscription.current.remove();
              locationSubscription.current = null;
            }
            
            if (pedometerSubscription.current) {
              pedometerSubscription.current.remove();
              pedometerSubscription.current = null;
            }
            
            if (accelerometerSubscription.current) {
              accelerometerSubscription.current.remove();
              accelerometerSubscription.current = null;
            }
            
            // Show summary alert
            Alert.alert(
              language === 'ta' ? '✅ நடை முடிந்தது!' : '✅ Walk Complete!',
              language === 'ta' 
                ? `மொத்த தூரம்: ${formatDistance(distance)}\nநேரம்: ${formatTime(duration)}\nஅடிகள்: ${steps}`
                : `Total Distance: ${formatDistance(distance)}\nTime: ${formatTime(duration)}\nSteps: ${steps}`,
              [{ text: 'OK' }]
            );
          }
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={[colors.primary.start, colors.primary.end]} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {language === 'ta' ? '🚶 நேரடி கண்காணிப்பு' : '🚶 Live Tracking'}
        </Text>
        <Animated.View style={[styles.trackingIndicator, { transform: [{ scale: pulseAnim }] }]}>
          <View style={[styles.trackingDot, { backgroundColor: isTracking && !isPaused ? '#4CAF50' : '#95a5a6' }]} />
        </Animated.View>
      </LinearGradient>

      <View style={styles.content}>
        {/* Map View */}
        <View style={styles.mapContainer}>
          {currentLocation && mapRegion ? (
            <MapView
              style={styles.map}
              provider={PROVIDER_DEFAULT}
              region={mapRegion}
              showsUserLocation={true}
              showsMyLocationButton={true}
              followsUserLocation={true}
              showsCompass={true}
              loadingEnabled={true}
              zoomEnabled={true}
              scrollEnabled={!isTracking}
            >
              {/* Current location marker with pin */}
              <Marker
                coordinate={{
                  latitude: currentLocation.latitude,
                  longitude: currentLocation.longitude,
                }}
                title={language === 'ta' ? 'நீங்கள் இருக்கும் இடம்' : 'You are here'}
                description={hasLocationPermission 
                  ? (language === 'ta' ? 'உங்கள் தற்போதைய இடம்' : 'Your current location')
                  : (language === 'ta' ? 'டிஃபால்ட் இடம்' : 'Default location')
                }
                pinColor="#FF6B35"
              >
                <View style={styles.customMarker}>
                  <View style={styles.markerPulse} />
                  <View style={styles.markerPin}>
                    <Text style={styles.markerEmoji}>📍</Text>
                  </View>
                </View>
              </Marker>
              
              {/* Route polyline */}
              {route.length > 1 && (
                <Polyline
                  coordinates={route}
                  strokeColor="#FF6B35"
                  strokeWidth={4}
                  lineDashPattern={[0]}
                />
              )}
            </MapView>
          ) : (
            <View style={styles.mapPlaceholder}>
              <Text style={styles.mapIcon}>📍</Text>
              <Text style={styles.mapText}>
                {!hasLocationPermission 
                  ? (language === 'ta' ? 'இடம் அனுமதி தேவை' : 'Location Permission Required')
                  : (language === 'ta' ? 'உங்கள் இடத்தைப் பெறுகிறது...' : 'Getting your location...')
                }
              </Text>
              <TouchableOpacity 
                style={styles.permissionButton}
                onPress={requestLocationPermission}
              >
                <Text style={styles.permissionButtonText}>
                  {!hasLocationPermission 
                    ? (language === 'ta' ? 'அனுமதி வழங்கு' : 'Grant Permission')
                    : (language === 'ta' ? 'மீண்டும் முயற்சி' : 'Retry')
                  }
                </Text>
              </TouchableOpacity>
            </View>
          )}
          
          {isTracking && (
            <View style={styles.liveTag}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>LIVE</Text>
            </View>
          )}
        </View>

        {/* Stats Overlay on Map */}
        <View style={styles.statsOverlay}>
          {/* Main Stats Cards */}
          <View style={styles.mainStatsRow}>
            <View style={styles.mainStatCard}>
              <View style={styles.statIconCircle}>
                <Text style={styles.statIconLarge}>🏃</Text>
              </View>
              <View style={styles.statInfo}>
                <Text style={styles.mainStatLabel}>{language === 'ta' ? 'தூரம்' : 'Distance'}</Text>
                <Text style={styles.mainStatValue}>{formatDistance(distance)}</Text>
              </View>
            </View>

            <View style={styles.mainStatCard}>
              <View style={styles.statIconCircle}>
                <Text style={styles.statIconLarge}>⏱️</Text>
              </View>
              <View style={styles.statInfo}>
                <Text style={styles.mainStatLabel}>{language === 'ta' ? 'நேரம்' : 'Time'}</Text>
                <Text style={styles.mainStatValue}>{formatTime(duration)}</Text>
              </View>
            </View>
          </View>

          {/* Compact Stats Grid */}
          <View style={styles.compactStatsGrid}>
            <View style={styles.compactStatItem}>
              <Text style={styles.compactStatIcon}>⚡</Text>
              <Text style={styles.compactStatValue}>{speed.toFixed(1)}</Text>
              <Text style={styles.compactStatLabel}>km/h</Text>
            </View>

            <View style={[styles.compactStatItem, styles.statDivider]}>
              <Text style={styles.compactStatIcon}>�</Text>
              <Text style={styles.compactStatValue}>{steps}</Text>
              <Text style={styles.compactStatLabel}>{language === 'ta' ? 'அடி' : 'steps'}</Text>
            </View>

            <View style={[styles.compactStatItem, styles.statDivider]}>
              <Text style={styles.compactStatIcon}>🔥</Text>
              <Text style={styles.compactStatValue}>{calories}</Text>
              <Text style={styles.compactStatLabel}>kcal</Text>
            </View>

            <View style={[styles.compactStatItem, styles.statDivider]}>
              <Text style={styles.compactStatIcon}>📍</Text>
              <Text style={styles.compactStatValue}>0</Text>
              <Text style={styles.compactStatLabel}>{language === 'ta' ? 'கோயில்' : 'temples'}</Text>
            </View>
          </View>

          {/* Bottom Controls - Inside Card */}
          <View style={styles.controlsInCard}>
            {!isTracking ? (
              <TouchableOpacity 
                style={styles.startButtonContainer} 
                onPress={handleStartTracking}
                activeOpacity={0.7}
              >
                <LinearGradient colors={[colors.primary.start, colors.primary.end]} style={styles.startButton}>
                  <Text style={styles.startIcon}>🚀</Text>
                  <Text style={styles.startButtonText}>
                    {language === 'ta' ? 'பாதயாத்திரை தொடங்கு' : 'Start Pathayathirai'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            ) : (
              <View style={styles.trackingControls}>
                <TouchableOpacity style={[styles.controlButton, styles.pauseButton]} onPress={handlePauseResume}>
                  <Text style={styles.controlIcon}>{isPaused ? '▶️' : '⏸️'}</Text>
                  <Text style={styles.controlText}>
                    {isPaused 
                      ? (language === 'ta' ? 'தொடர்' : 'Resume')
                      : (language === 'ta' ? 'நிறுத்து' : 'Pause')
                    }
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.controlButton, styles.endButton]} onPress={handleEndTracking}>
                  <Text style={styles.controlIcon}>⏹️</Text>
                  <Text style={styles.controlText}>{language === 'ta' ? 'முடி' : 'End'}</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  backButtonText: {
    fontSize: 24,
    color: '#fff',
    marginLeft: -2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    flex: 1,
  },
  trackingIndicator: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  trackingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  content: {
    flex: 1,
    position: 'relative',
  },
  mapContainer: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    position: 'relative',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  mapPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  mapIcon: {
    fontSize: 60,
    marginBottom: spacing.sm,
  },
  mapText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray.medium,
    textAlign: 'center',
    paddingHorizontal: spacing.md,
  },
  customMarker: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerPulse: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 107, 53, 0.2)',
    top: -15,
  },
  markerPin: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FF6B35',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  markerEmoji: {
    fontSize: 20,
  },
  permissionButton: {
    marginTop: spacing.md,
    backgroundColor: colors.primary.start,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  liveTag: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e74c3c',
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  liveDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
    marginRight: 6,
  },
  liveText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 1,
  },
  statsOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  mainStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  mainStatCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: spacing.sm,
    marginHorizontal: spacing.xs,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  statIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFF5F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.xs,
  },
  statIconLarge: {
    fontSize: 18,
  },
  statInfo: {
    flex: 1,
  },
  mainStatLabel: {
    fontSize: 9,
    color: colors.gray.medium,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginBottom: 1,
  },
  mainStatValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary.start,
  },
  compactStatsGrid: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: spacing.sm,
    justifyContent: 'space-around',
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  compactStatItem: {
    alignItems: 'center',
    paddingHorizontal: spacing.xs,
  },
  statDivider: {
    borderLeftWidth: 1,
    borderLeftColor: '#f0f0f0',
  },
  compactStatIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  compactStatValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.gray.dark,
    marginBottom: 2,
  },
  compactStatLabel: {
    fontSize: 10,
    color: colors.gray.medium,
    fontWeight: '600',
  },
  controlsInCard: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: Platform.OS === 'ios' ? spacing.xl : spacing.lg,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  controls: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    paddingBottom: Platform.OS === 'ios' ? spacing.xl : spacing.md,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  startButtonContainer: {
    borderRadius: 20,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: colors.primary.start,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  startButtonDisabled: {
    opacity: 0.6,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  startIcon: {
    fontSize: 22,
    marginRight: spacing.sm,
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.3,
  },
  trackingControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  controlButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    borderRadius: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  pauseButton: {
    backgroundColor: '#f39c12',
  },
  endButton: {
    backgroundColor: '#e74c3c',
  },
  controlIcon: {
    fontSize: 22,
    marginRight: spacing.sm,
  },
  controlText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
  },
});
