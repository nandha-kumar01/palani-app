import React from 'react';
import { View, Platform, ViewStyle } from 'react-native';
import { LinearGradient as ExpoLinearGradient } from 'expo-linear-gradient';

interface LinearGradientProps {
  colors: readonly [string, string, ...string[]];
  start?: { x: number; y: number };
  end?: { x: number; y: number };
  style?: ViewStyle;
  children?: React.ReactNode;
}

export const LinearGradient: React.FC<LinearGradientProps> = ({
  colors,
  start = { x: 0, y: 0 },
  end = { x: 0, y: 1 },
  style,
  children,
}) => {
  if (Platform.OS === 'web') {
    // For web, use CSS gradient
    const webGradient = {
      background: `linear-gradient(135deg, ${colors.join(', ')})`,
      ...style,
    } as ViewStyle;

    return (
      <View style={webGradient}>
        {children}
      </View>
    );
  }

  // For mobile, use Expo LinearGradient
  return (
    <ExpoLinearGradient
      colors={colors}
      start={start}
      end={end}
      style={style}
    >
      {children}
    </ExpoLinearGradient>
  );
};