import React, { useState } from 'react';
import { TextInput, StyleSheet, TextInputProps, View, Text, TouchableOpacity } from 'react-native';
import { colors, fonts, borderRadius, shadows, spacing } from '../utils/theme';

interface CustomTextInputProps extends TextInputProps {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  placeholder?: string;
  maxLength?: number;
  isPassword?: boolean;
}

export function CustomTextInput({ label, error, icon, style, isPassword, ...props }: CustomTextInputProps) {
  const [isSecureEntry, setIsSecureEntry] = useState(isPassword);

  const toggleSecureEntry = () => {
    setIsSecureEntry(!isSecureEntry);
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.inputContainer}>
        {icon && <View style={styles.iconContainer}>{icon}</View>}
        <TextInput
          style={[
            styles.input,
            icon ? styles.inputWithIcon : null,
            isPassword ? styles.inputWithEyeIcon : null,
            error ? styles.inputError : null,
            style
          ]}
          placeholderTextColor={colors.gray.medium}
          secureTextEntry={isSecureEntry}
          {...props}
        />
        {isPassword && (
          <TouchableOpacity 
            style={styles.eyeIconContainer}
            onPress={toggleSecureEntry}
            activeOpacity={0.7}
          >
            <Text style={styles.eyeIcon}>
              {isSecureEntry ? 'Show' : 'Hide'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: fonts.sizes.sm,
    fontWeight: fonts.weights.medium,
    color: colors.gray.dark,
    marginBottom: spacing.xs,
  },
  inputContainer: {
    position: 'relative',
  },
  input: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: fonts.sizes.md,
    color: colors.gray.dark,
    borderWidth: 1,
    borderColor: colors.gray.light,
    ...shadows.light,
  },
  inputWithIcon: {
    paddingLeft: 48,
  },
  inputWithEyeIcon: {
    paddingRight: 48,
  },
  inputError: {
    borderColor: colors.danger,
  },
  iconContainer: {
    position: 'absolute',
    left: spacing.md,
    top: '50%',
    transform: [{ translateY: -10 }],
    zIndex: 1,
  },
  eyeIconContainer: {
    position: 'absolute',
    right: spacing.md,
    top: '50%',
    transform: [{ translateY: -12 }],
    zIndex: 1,
    padding: 2,
  },
  eyeIcon: {
    fontSize: 12,
    color: colors.primary.start,
    fontWeight: '600',
  },
  error: {
    fontSize: fonts.sizes.xs,
    color: colors.danger,
    marginTop: spacing.xs,
  },
});