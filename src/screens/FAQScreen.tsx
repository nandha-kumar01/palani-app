import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, spacing, borderRadius } from '../utils/theme';
import { useLanguage } from '../context/LanguageContext';

interface FAQ {
  id: string;
  question: string;
  answer: string;
}

export default function FAQScreen({ navigation }: any) {
  const { t } = useLanguage();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const faqs: FAQ[] = [
    {
      id: '1',
      question: 'How do I start my pilgrimage walk?',
      answer: 'Go to the Live Tracking screen from the home screen and tap "Start Journey". Make sure to enable location permissions for accurate tracking.',
    },
    {
      id: '2',
      question: 'Can I join a group walk?',
      answer: 'Yes! Visit the Group Walk section to see available groups and join them. You can also create your own group and invite others.',
    },
    {
      id: '3',
      question: 'How do I check temple information?',
      answer: 'Navigate to the Temple section from the home screen to view details about Palani temple, timings, festivals, and more.',
    },
    {
      id: '4',
      question: 'What is Annadhanam?',
      answer: 'Annadhanam is the free food service provided at the temple. You can view schedules, menus, and volunteer opportunities in the Annadhanam section.',
    },
    {
      id: '5',
      question: 'How do I upload photos to the gallery?',
      answer: 'Go to the Gallery section and tap the upload button. You can share your pilgrimage photos with the community.',
    },
    {
      id: '6',
      question: 'Where can I find devotional music?',
      answer: 'Visit the Music section to listen to bhajans, mantras, and other devotional songs related to Lord Murugan.',
    },
    {
      id: '7',
      question: 'How do I track my pilgrimage history?',
      answer: 'Your walk history, achievements, and statistics are available in your Profile section under History.',
    },
    {
      id: '8',
      question: 'Can I use the app offline?',
      answer: 'Yes! The app saves important data for offline use. However, live tracking and community features require internet connection.',
    },
  ];

  const toggleFAQ = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary.main} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>FAQ</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.subtitle}>Frequently Asked Questions</Text>

        {faqs.map((faq) => (
          <TouchableOpacity
            key={faq.id}
            style={styles.faqCard}
            onPress={() => toggleFAQ(faq.id)}
            activeOpacity={0.7}
          >
            <View style={styles.faqHeader}>
              <Text style={styles.question}>{faq.question}</Text>
              <Ionicons
                name={expandedId === faq.id ? 'chevron-up' : 'chevron-down'}
                size={20}
                color={colors.primary.main}
              />
            </View>
            
            {expandedId === faq.id && (
              <View style={styles.answerContainer}>
                <Text style={styles.answer}>{faq.answer}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}

        <View style={styles.contactSection}>
          <Text style={styles.contactTitle}>Still have questions?</Text>
          <Text style={styles.contactText}>
            Contact our support team for more help
          </Text>
          <TouchableOpacity
            style={styles.contactButton}
            onPress={() => navigation.navigate('HelpSupport')}
          >
            <Text style={styles.contactButtonText}>Contact Support</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: colors.primary.main,
    paddingTop: 40,
    paddingBottom: 16,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  subtitle: {
    fontSize: 16,
    color: colors.gray.medium,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  faqCard: {
    backgroundColor: '#fff',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  question: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: colors.black,
    marginRight: spacing.sm,
  },
  answerContainer: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  answer: {
    fontSize: 14,
    color: colors.gray.medium,
    lineHeight: 20,
  },
  contactSection: {
    backgroundColor: '#fff',
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.black,
    marginBottom: spacing.sm,
  },
  contactText: {
    fontSize: 14,
    color: colors.gray.medium,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  contactButton: {
    backgroundColor: colors.primary.main,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
  },
  contactButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
