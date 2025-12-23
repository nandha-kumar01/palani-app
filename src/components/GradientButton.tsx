import React, { ReactNode } from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { LinearGradient } from './WebLinearGradient';
import { colors, fonts, borderRadius, shadows } from '../utils/theme';

interface GradientButtonProps {
  onPress: () => void;
  children: ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export function GradientButton({ 
  onPress, 
  children, 
  style, 
  textStyle, 
  disabled = false,
  size = 'medium'
}: GradientButtonProps) {
  const buttonStyle = [
    styles.button,
    styles[size],
    style,
    disabled && styles.disabled
  ];

  const textStyleCombined = [
    styles.text,
    styles[`${size}Text` as keyof typeof styles],
    textStyle,
    disabled && styles.disabledText
  ];

  return (
    <TouchableOpacity 
      onPress={onPress} 
      disabled={disabled}
      activeOpacity={0.8}
      style={buttonStyle}
    >
      <LinearGradient
        colors={disabled ? ['#ccc', '#999'] : [colors.primary.start, colors.primary.end]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.flatten([styles.gradient, size === 'small' ? styles.small : size === 'large' ? styles.large : styles.medium])}
      >
        <Text style={textStyleCombined}>{children}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: borderRadius.md,
    ...shadows.medium,
  },
  gradient: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  small: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: borderRadius.sm,
  },
  medium: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: borderRadius.md,
  },
  large: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: borderRadius.lg,
  },
  text: {
    color: colors.white,
    fontWeight: fonts.weights.semibold,
    textAlign: 'center',
  },
  smallText: {
    fontSize: fonts.sizes.sm,
  },
  mediumText: {
    fontSize: fonts.sizes.md,
  },
  largeText: {
    fontSize: fonts.sizes.lg,
  },
  disabled: {
    opacity: 0.6,
  },
  disabledText: {
    color: colors.gray.medium,
  },
});