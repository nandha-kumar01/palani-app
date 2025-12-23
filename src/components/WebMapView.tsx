import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { colors } from '../utils/theme';

interface WebMapViewProps {
  style?: any;
  region?: any;
  children?: React.ReactNode;
}

export const WebMapView: React.FC<WebMapViewProps> = ({ style, region, children }) => {
  if (Platform.OS === 'web') {
    return (
      <View style={[styles.webMapContainer, style]}>
        <Text style={styles.webMapText}>🗺️ Map View</Text>
        <Text style={styles.webMapSubtext}>Maps are not available on web platform</Text>
        <Text style={styles.webMapSubtext}>Use mobile app for full map functionality</Text>
        {children}
      </View>
    );
  }

  // For mobile platforms, use react-native-maps
  try {
    const MapView = require('react-native-maps').default;
    return (
      <MapView style={style} region={region}>
        {children}
      </MapView>
    );
  } catch (error) {
    return (
      <View style={[styles.webMapContainer, style]}>
        <Text style={styles.webMapText}>🗺️ Map View</Text>
        <Text style={styles.webMapSubtext}>Maps library not available</Text>
      </View>
    );
  }
};

interface WebMarkerProps {
  coordinate: {
    latitude: number;
    longitude: number;
  };
  title?: string;
  description?: string;
  children?: React.ReactNode;
}

export const WebMarker: React.FC<WebMarkerProps> = ({ coordinate, title, description, children }) => {
  if (Platform.OS === 'web') {
    return (
      <View style={styles.webMarker}>
        <Text style={styles.webMarkerText}>📍</Text>
        {title && <Text style={styles.webMarkerTitle}>{title}</Text>}
      </View>
    );
  }

  try {
    const { Marker } = require('react-native-maps');
    return (
      <Marker coordinate={coordinate} title={title} description={description}>
        {children}
      </Marker>
    );
  } catch (error) {
    return null;
  }
};

interface WebPolylineProps {
  coordinates: Array<{
    latitude: number;
    longitude: number;
  }>;
  strokeColor?: string;
  strokeWidth?: number;
}

export const WebPolyline: React.FC<WebPolylineProps> = ({ coordinates, strokeColor, strokeWidth }) => {
  if (Platform.OS === 'web') {
    return (
      <View style={styles.webPolyline}>
        <Text style={styles.webPolylineText}>
          📈 Route with {coordinates.length} points
        </Text>
      </View>
    );
  }

  try {
    const { Polyline } = require('react-native-maps');
    return (
      <Polyline
        coordinates={coordinates}
        strokeColor={strokeColor}
        strokeWidth={strokeWidth}
      />
    );
  } catch (error) {
    return null;
  }
};

const styles = StyleSheet.create({
  webMapContainer: {
    backgroundColor: colors.gray.light,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    padding: 20,
  },
  webMapText: {
    fontSize: 24,
    marginBottom: 8,
  },
  webMapSubtext: {
    fontSize: 14,
    color: colors.gray.medium,
    textAlign: 'center',
    marginBottom: 4,
  },
  webMarker: {
    alignItems: 'center',
    padding: 4,
  },
  webMarkerText: {
    fontSize: 20,
  },
  webMarkerTitle: {
    fontSize: 12,
    color: colors.gray.dark,
    fontWeight: '600',
  },
  webPolyline: {
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 4,
    marginVertical: 4,
  },
  webPolylineText: {
    fontSize: 12,
    color: colors.gray.dark,
  },
});