import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from '../components/WebLinearGradient';
import { WhiteCard } from '../components/GlassCard';
import { colors, fonts, spacing } from '../utils/theme';

interface HistoryScreenProps {
  navigation: any;
}

export default function HistoryScreen({ navigation }: HistoryScreenProps) {
  return (
    <View style={styles.container}>
      <LinearGradient colors={[colors.primary.start, colors.primary.end]} style={styles.header}>
        <Text style={styles.headerText}>Walk History</Text>
      </LinearGradient>
      <ScrollView style={styles.content}>
        <WhiteCard style={styles.card}>
          <Text style={styles.title}>Your Walking Journey</Text>
          <Text style={styles.subtitle}>Track your spiritual progress</Text>
        </WhiteCard>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray.light },
  header: { paddingTop: 50, paddingHorizontal: spacing.lg, paddingBottom: spacing.lg },
  headerText: { fontSize: fonts.sizes.lg, fontWeight: fonts.weights.bold, color: colors.white, textAlign: 'center' },
  content: { flex: 1, paddingHorizontal: spacing.lg, paddingVertical: spacing.lg },
  card: { alignItems: 'center', paddingVertical: spacing.xl },
  title: { fontSize: fonts.sizes.xl, fontWeight: fonts.weights.bold, color: colors.gray.dark, marginBottom: spacing.sm },
  subtitle: { fontSize: fonts.sizes.md, color: colors.gray.medium, textAlign: 'center' },
});