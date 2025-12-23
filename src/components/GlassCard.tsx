import React, { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors, borderRadius, shadows } from '../utils/theme';

interface GlassCardProps {
  children: ReactNode;
  style?: ViewStyle;
  intensity?: number;
}

export function GlassCard({ children, style, intensity = 20 }: GlassCardProps) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.blurView}>
        <View style={styles.content}>
          {children}
        </View>
      </View>
    </View>
  );
}

// Fallback for when BlurView is not available
export function WhiteCard({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  return (
    <View style={[styles.whiteCard, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...shadows.light,
  },
  blurView: {
    backgroundColor: colors.glass.background,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.glass.border,
  },
  content: {
    padding: 20,
  },
  whiteCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: 20,
    ...shadows.light,
  },
});