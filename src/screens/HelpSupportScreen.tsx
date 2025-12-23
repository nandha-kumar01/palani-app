import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { LinearGradient } from '../components/WebLinearGradient';
import { WhiteCard } from '../components/GlassCard';
import BottomNavigation from '../components/BottomNavigation';
import { colors, fonts, spacing, borderRadius } from '../utils/theme';
import { useApp } from '../context/AppContext';
import { showToast } from '../utils/toast';

interface FAQ {
  id: string;
  question: string;
  questionTamil: string;
  answer: string;
  answerTamil: string;
  category: 'general' | 'walking' | 'technical' | 'account';
}

interface SupportOption {
  id: string;
  title: string;
  titleTamil: string;
  description: string;
  descriptionTamil: string;
  icon: string;
  action: () => void;
}

interface HelpSupportScreenProps {
  navigation: any;
}

export default function HelpSupportScreen({ navigation }: HelpSupportScreenProps) {
  const { language } = useApp();
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const faqs: FAQ[] = [
    {
      id: '1',
      question: 'How do I start my first pilgrimage walk?',
      questionTamil: 'எனது முதல் யாத்திரை நடைப்பயணத்தை எப்படி தொடங்குவது?',
      answer: 'To start your first walk, go to the Group Walks section, select a walk that interests you, and tap "Join Walk". Make sure you have comfortable walking shoes and water.',
      answerTamil: 'உங்கள் முதல் நடைப்பயணத்தைத் தொடங்க, குழு நடைகள் பிரிவுக்குச் சென்று, உங்களுக்கு ஆர்வமான நடைப்பயணத்தைத் தேர்ந்தெடுத்து, "நடைப்பயணத்தில் சேர" என்பதைத் தட்டவும். உங்களிடம் வசதியான நடைப்பய காலணிகள் மற்றும் தண்ணீர் இருப்பதை உறுதிசெய்யவும்.',
      category: 'walking',
    },
    {
      id: '2',
      question: 'What should I bring for a pilgrimage walk?',
      questionTamil: 'யாத்திரை நடைப்பயணத்திற்கு நான் என்ன கொண்டு வர வேண்டும்?',
      answer: 'Essential items include: comfortable walking shoes, water bottle, small towel, energy snacks, mobile phone for emergency, and appropriate clothing for the weather.',
      answerTamil: 'அத்தியாவசிய பொருட்கள்: வசதியான நடைப்பய காலணிகள், தண்ணீர் பாட்டில், சிறிய துண்டு, ஆற்றல் தரும் சிற்றுண்டி, அவசரநேரத்திற்கான மொபைல் போன், மற்றும் வானிலைக்கு ஏற்ற உடைகள்.',
      category: 'walking',
    },
    {
      id: '3',
      question: 'How do I track my walking progress?',
      questionTamil: 'எனது நடைப்பயண முன்னேற்றத்தை எப்படி கண்காணிப்பது?',
      answer: 'Your walking progress is automatically tracked when you join a walk. You can view your statistics in the Profile section, including total distance, time walked, and achievements earned.',
      answerTamil: 'நீங்கள் ஒரு நடைப்பயணத்தில் சேரும்போது உங்கள் நடைப்பயண முன்னேற்றம் தானாகவே கண்காணிக்கப்படுகிறது. மொத்த தூரம், நடந்த நேரம் மற்றும் பெற்ற சாதனைகள் உட்பட உங்கள் புள்ளிவிவரங்களை சுயவிவர பிரிவில் பார்க்கலாம்.',
      category: 'walking',
    },
    {
      id: '4',
      question: 'How do I change my language preference?',
      questionTamil: 'எனது மொழி விருப்பத்தை எப்படி மாற்றுவது?',
      answer: 'Go to Settings > General > Language and select your preferred language. The app supports English and Tamil.',
      answerTamil: 'அமைப்புகள் > பொதுவான > மொழிக்குச் சென்று உங்கள் விருப்பமான மொழியைத் தேர்ந்தெடுக்கவும். ஆப் ஆங்கிலம் மற்றும் தமிழ் மொழிகளை ஆதரிக்கிறது.',
      category: 'general',
    },
    {
      id: '5',
      question: 'What if the app crashes or freezes?',
      questionTamil: 'ஆப் செயலிழந்தால் அல்லது உறைந்தால் என்ன செய்வது?',
      answer: 'Try closing and reopening the app. If the problem persists, restart your device. You can also clear the app cache in Settings > Data & Storage > Clear Cache.',
      answerTamil: 'ஆப்பை மூடி மீண்டும் திறக்க முயற்சி செய்யவும். பிரச்சனை தொடர்ந்தால், உங்கள் சாதனத்தை மறுதொடக்கம் செய்யவும். அமைப்புகள் > தரவு மற்றும் சேமிப்பு > தற்காலிக சேமிப்பை அழிக்கவும் என்பதில் ஆப் தற்காலிக சேமிப்பையும் அழிக்கலாம்.',
      category: 'technical',
    },
    {
      id: '6',
      question: 'How do I reset my password?',
      questionTamil: 'எனது கடவுச்சொல்லை எப்படி மீட்டமைப்பது?',
      answer: 'On the login screen, tap "Forgot Password?" and enter your email address. You will receive a reset link in your email.',
      answerTamil: 'உள்நுழைவு திரையில், "கடவுச்சொல்லை மறந்துவிட்டீர்களா?" என்பதைத் தட்டி உங்கள் மின்னஞ்சல் முகவரியை உள்ளிடவும். உங்கள் மின்னஞ்சலில் மீட்டமைப்பு இணைப்பு வரும்.',
      category: 'account',
    },
    {
      id: '7',
      question: 'Can I use the app offline?',
      questionTamil: 'ஆப்பை ஆஃப்லைனில் பயன்படுத்த முடியுமா?',
      answer: 'Some features like viewing your profile and past walks are available offline. However, joining new walks and real-time tracking require an internet connection.',
      answerTamil: 'உங்கள் சுயவிவரம் மற்றும் கடந்த நடைகளைப் பார்ப்பது போன்ற சில அம்சங்கள் ஆஃப்லைனில் கிடைக்கின்றன. இருப்பினும், புதிய நடைகளில் சேர்வதற்கும் நிகழ்நேர கண்காணிப்புக்கும் இணைய இணைப்பு தேவை.',
      category: 'technical',
    },
    {
      id: '8',
      question: 'How do I delete my account?',
      questionTamil: 'எனது கணக்கை எப்படி அழிக்கலாம்?',
      answer: 'Go to Settings > Account > Delete Account. Please note that this action is permanent and cannot be undone.',
      answerTamil: 'அமைப்புகள் > கணக்கு > கணக்கை அழிக்கவும் என்பதற்குச் செல்லவும். இந்த செயல் நிரந்தரமானது மற்றும் மாற்ற முடியாது என்பதை கவனத்தில் கொள்ளவும்.',
      category: 'account',
    },
  ];

  const categories = [
    { id: 'all', title: 'All', titleTamil: 'அனைத்தும்', icon: '❓' },
    { id: 'general', title: 'General', titleTamil: 'பொதுவான', icon: '⚙️' },
    { id: 'walking', title: 'Walking', titleTamil: 'நடைப்பயணம்', icon: '🚶‍♂️' },
    { id: 'technical', title: 'Technical', titleTamil: 'தொழில்நுட்ப', icon: '🔧' },
    { id: 'account', title: 'Account', titleTamil: 'கணக்கு', icon: '👤' },
  ];

  const supportOptions: SupportOption[] = [
    {
      id: 'email',
      title: 'Email Support',
      titleTamil: 'மின்னஞ்சல் ஆதரவு',
      description: 'Send us your questions via email',
      descriptionTamil: 'மின்னஞ்சல் மூலம் உங்கள் கேள்விகளை எங்களுக்கு அனுப்பவும்',
      icon: '✉️',
      action: () => {
        const email = 'support@palani.com';
        const subject = language === 'tamil' ? 'ஆப் ஆதரவு கோரிக்கை' : 'App Support Request';
        const body = language === 'tamil' 
          ? 'தயவுசெய்து உங்கள் பிரச்சனையை விரிவாக விவரிக்கவும்...'
          : 'Please describe your issue in detail...';
        
        const url = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        
        Linking.openURL(url).catch(() => {
          showToast.error(
            language === 'tamil' 
              ? 'மின்னஞ்சல் ஆப்பைத் திறக்க முடியவில்லை'
              : 'Could not open email app'
          );
        });
      },
    },
    {
      id: 'phone',
      title: 'Phone Support',
      titleTamil: 'தொலைபேசி ஆதரவு',
      description: 'Call us for immediate assistance',
      descriptionTamil: 'உடனடி உதவிக்கு எங்களை அழைக்கவும்',
      icon: '📞',
      action: () => {
        Alert.alert(
          language === 'tamil' ? 'தொலைபேசி ஆதரவு' : 'Phone Support',
          language === 'tamil' 
            ? 'ஆதரவு: +91-XXXX-XXXXXX\n\nஆதரவு நேரம்:\nசோமவாரம் - வெள்ளிக்கிழமை\n9:00 AM - 6:00 PM IST'
            : 'Support: +91-XXXX-XXXXXX\n\nSupport Hours:\nMonday - Friday\n9:00 AM - 6:00 PM IST',
          [
            { text: language === 'tamil' ? 'ரத்து' : 'Cancel' },
            {
              text: language === 'tamil' ? 'அழைக்கவும்' : 'Call',
              onPress: () => {
                Linking.openURL('tel:+91XXXXXXXXXX').catch(() => {
                  showToast.error(
                    language === 'tamil' 
                      ? 'அழைப்பைத் தொடங்க முடியவில்லை'
                      : 'Could not initiate call'
                  );
                });
              },
            },
          ]
        );
      },
    },
    {
      id: 'whatsapp',
      title: 'WhatsApp Support',
      titleTamil: 'வாட்ஸ்ஆப் ஆதரவு',
      description: 'Chat with us on WhatsApp',
      descriptionTamil: 'வாட்ஸ்ஆப்பில் எங்களுடன் அரட்டையடிக்கவும்',
      icon: '💬',
      action: () => {
        const message = language === 'tamil' 
          ? 'வணக்கம், எனக்கு பலானி ஆப்பில் உதவி தேவை.'
          : 'Hello, I need help with the Palani app.';
        
        const url = `whatsapp://send?phone=91XXXXXXXXXX&text=${encodeURIComponent(message)}`;
        
        Linking.openURL(url).catch(() => {
          showToast.error(
            language === 'tamil' 
              ? 'வாட்ஸ்ஆப்பைத் திறக்க முடியவில்லை'
              : 'Could not open WhatsApp'
          );
        });
      },
    },
    {
      id: 'feedback',
      title: 'Send Feedback',
      titleTamil: 'கருத்து அனுப்பவும்',
      description: 'Share your suggestions and feedback',
      descriptionTamil: 'உங்கள் பரிந்துரைகளையும் கருத்துக்களையும் பகிரவும்',
      icon: '💡',
      action: () => {
        Alert.alert(
          language === 'tamil' ? 'கருத்து அனுப்பவும்' : 'Send Feedback',
          language === 'tamil' 
            ? 'உங்கள் கருத்துக்களை எங்களுடன் பகிர்ந்து கொள்ளுங்கள்! feedback@palani.com க்கு மின்னஞ்சல் அனுப்பவும்.'
            : 'Share your thoughts with us! Send an email to feedback@palani.com',
          [{ text: language === 'tamil' ? 'சரி' : 'OK' }]
        );
      },
    },
  ];

  const filteredFAQs = selectedCategory === 'all' 
    ? faqs 
    : faqs.filter(faq => faq.category === selectedCategory);

  const toggleFAQ = (faqId: string) => {
    setExpandedFAQ(expandedFAQ === faqId ? null : faqId);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[colors.primary.start, colors.primary.end]}
        style={styles.header}
      >
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>
            {language === 'tamil' ? 'உதவி மற்றும் ஆதரவு' : 'Help & Support'}
          </Text>
          <Text style={styles.headerSubtitle}>
            {language === 'tamil' ? 'நாங்கள் உங்களுக்கு உதவ இங்கே இருக்கிறோம்' : 'We\'re here to help you'}
          </Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content}>
        {/* Contact Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {language === 'tamil' ? 'எங்களைத் தொடர்பு கொள்ளுங்கள்' : 'Contact Us'}
          </Text>
          
          <View style={styles.supportOptionsGrid}>
            {supportOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={styles.supportOption}
                onPress={option.action}
              >
                <WhiteCard style={styles.supportOptionCard}>
                  <Text style={styles.supportOptionIcon}>{option.icon}</Text>
                  <Text style={styles.supportOptionTitle}>
                    {language === 'tamil' ? option.titleTamil : option.title}
                  </Text>
                  <Text style={styles.supportOptionDescription}>
                    {language === 'tamil' ? option.descriptionTamil : option.description}
                  </Text>
                </WhiteCard>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* FAQ Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {language === 'tamil' ? 'அடிக்கடி கேட்கப்படும் கேள்விகள்' : 'Frequently Asked Questions'}
          </Text>

          {/* Category Filter */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesContainer}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryButton,
                  selectedCategory === category.id && styles.categoryButtonActive
                ]}
                onPress={() => setSelectedCategory(category.id)}
              >
                <Text style={styles.categoryIcon}>{category.icon}</Text>
                <Text style={[
                  styles.categoryText,
                  selectedCategory === category.id && styles.categoryTextActive
                ]}>
                  {language === 'tamil' ? category.titleTamil : category.title}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* FAQ Items */}
          {filteredFAQs.map((faq) => (
            <TouchableOpacity
              key={faq.id}
              style={styles.faqItem}
              onPress={() => toggleFAQ(faq.id)}
            >
              <WhiteCard style={styles.faqCard}>
                <View style={styles.faqHeader}>
                  <Text style={styles.faqQuestion}>
                    {language === 'tamil' ? faq.questionTamil : faq.question}
                  </Text>
                  <Text style={[
                    styles.faqToggle,
                    expandedFAQ === faq.id && styles.faqToggleExpanded
                  ]}>
                    {expandedFAQ === faq.id ? '−' : '+'}
                  </Text>
                </View>
                
                {expandedFAQ === faq.id && (
                  <View style={styles.faqAnswer}>
                    <Text style={styles.faqAnswerText}>
                      {language === 'tamil' ? faq.answerTamil : faq.answer}
                    </Text>
                  </View>
                )}
              </WhiteCard>
            </TouchableOpacity>
          ))}
        </View>

        {/* Additional Resources */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {language === 'tamil' ? 'கூடுதல் ஆதாரங்கள்' : 'Additional Resources'}
          </Text>
          
          <WhiteCard style={styles.resourcesCard}>
            <TouchableOpacity 
              style={styles.resourceItem}
              onPress={() => {
                showToast.info(
                  language === 'tamil' 
                    ? 'வீடியோ வழிகாட்டுதல்கள் விரைவில் வரும்'
                    : 'Video tutorials coming soon'
                );
              }}
            >
              <Text style={styles.resourceIcon}>🎥</Text>
              <View style={styles.resourceContent}>
                <Text style={styles.resourceTitle}>
                  {language === 'tamil' ? 'வீடியோ வழிகாட்டுதல்கள்' : 'Video Tutorials'}
                </Text>
                <Text style={styles.resourceDescription}>
                  {language === 'tamil' 
                    ? 'ஆப்பின் அம்சங்களை எவ்வாறு பயன்படுத்துவது என்பதைக் கற்றுக்கொள்ளுங்கள்'
                    : 'Learn how to use app features'
                  }
                </Text>
              </View>
              <Text style={styles.resourceArrow}>→</Text>
            </TouchableOpacity>

            <View style={styles.resourceDivider} />

            <TouchableOpacity 
              style={styles.resourceItem}
              onPress={() => {
                showToast.info(
                  language === 'tamil' 
                    ? 'சமூக வழிகாட்டி விரைவில் வரும்'
                    : 'Community guide coming soon'
                );
              }}
            >
              <Text style={styles.resourceIcon}>📖</Text>
              <View style={styles.resourceContent}>
                <Text style={styles.resourceTitle}>
                  {language === 'tamil' ? 'சமூக வழிகாட்டி' : 'Community Guide'}
                </Text>
                <Text style={styles.resourceDescription}>
                  {language === 'tamil' 
                    ? 'சமூக நடைகளில் எவ்வாறு பங்கேற்பது என்பதைக் கற்றுக்கொள்ளுங்கள்'
                    : 'Learn how to participate in community walks'
                  }
                </Text>
              </View>
              <Text style={styles.resourceArrow}>→</Text>
            </TouchableOpacity>

            <View style={styles.resourceDivider} />

            <TouchableOpacity 
              style={styles.resourceItem}
              onPress={() => {
                showToast.info(
                  language === 'tamil' 
                    ? 'பாதுகாப்பு வழிகாட்டுதல்கள் விரைவில் வரும்'
                    : 'Safety guidelines coming soon'
                );
              }}
            >
              <Text style={styles.resourceIcon}>🛡️</Text>
              <View style={styles.resourceContent}>
                <Text style={styles.resourceTitle}>
                  {language === 'tamil' ? 'பாதுகாப்பு வழிகாட்டுதல்கள்' : 'Safety Guidelines'}
                </Text>
                <Text style={styles.resourceDescription}>
                  {language === 'tamil' 
                    ? 'பாதுகாப்பான நடைப்பயணத்திற்கான முக்கியமான குறிப்புகள்'
                    : 'Important tips for safe walking'
                  }
                </Text>
              </View>
              <Text style={styles.resourceArrow}>→</Text>
            </TouchableOpacity>
          </WhiteCard>
        </View>

        {/* Emergency Contact */}
        <View style={styles.section}>
          <WhiteCard style={styles.emergencyCard}>
            <View style={styles.emergencyHeader}>
              <Text style={styles.emergencyIcon}>🚨</Text>
              <Text style={styles.emergencyTitle}>
                {language === 'tamil' ? 'அவசர உதவி' : 'Emergency Help'}
              </Text>
            </View>
            <Text style={styles.emergencyDescription}>
              {language === 'tamil' 
                ? 'அவசர நேரத்தில், தயவுசெய்து 108 (அவசர சேவைகள்) அல்லது 100 (காவல்துறை) ஐ அழைக்கவும்'
                : 'In case of emergency, please call 108 (Emergency Services) or 100 (Police)'
              }
            </Text>
            <TouchableOpacity
              style={styles.emergencyButton}
              onPress={() => {
                Alert.alert(
                  language === 'tamil' ? 'அவசர அழைப்பு' : 'Emergency Call',
                  language === 'tamil' ? '108 ஐ அழைக்கவா?' : 'Call 108?',
                  [
                    { text: language === 'tamil' ? 'ரத்து' : 'Cancel' },
                    { 
                      text: language === 'tamil' ? 'அழைக்கவும்' : 'Call',
                      onPress: () => Linking.openURL('tel:108')
                    }
                  ]
                );
              }}
            >
              <Text style={styles.emergencyButtonText}>
                {language === 'tamil' ? '108 ஐ அழைக்கவும்' : 'Call 108'}
              </Text>
            </TouchableOpacity>
          </WhiteCard>
        </View>

        {/* Extra spacer for bottom navigation */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
      
      <BottomNavigation navigation={navigation} activeTab="profile" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray.light,
  },
  header: {
    paddingTop: 50,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: spacing.lg,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  backButtonText: {
    fontSize: 20,
    color: colors.white,
    fontWeight: fonts.weights.bold,
  },
  headerContent: {
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  headerTitle: {
    fontSize: fonts.sizes.xxl,
    fontWeight: fonts.weights.bold,
    color: colors.white,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: fonts.sizes.md,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  section: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: fonts.sizes.lg,
    fontWeight: fonts.weights.bold,
    color: colors.gray.dark,
    marginBottom: spacing.lg,
  },
  supportOptionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  supportOption: {
    width: '48%',
    marginBottom: spacing.md,
  },
  supportOptionCard: {
    padding: spacing.lg,
    alignItems: 'center',
    height: 120,
  },
  supportOptionIcon: {
    fontSize: 32,
    marginBottom: spacing.sm,
  },
  supportOptionTitle: {
    fontSize: fonts.sizes.md,
    fontWeight: fonts.weights.bold,
    color: colors.gray.dark,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  supportOptionDescription: {
    fontSize: fonts.sizes.sm,
    color: colors.gray.medium,
    textAlign: 'center',
    lineHeight: 16,
  },
  categoriesContainer: {
    marginVertical: spacing.md,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.white,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.gray.light,
  },
  categoryButtonActive: {
    backgroundColor: colors.primary.start,
    borderColor: colors.primary.start,
  },
  categoryIcon: {
    fontSize: 16,
    marginRight: spacing.xs,
  },
  categoryText: {
    fontSize: fonts.sizes.sm,
    color: colors.gray.dark,
    fontWeight: fonts.weights.medium,
  },
  categoryTextActive: {
    color: colors.white,
  },
  faqItem: {
    marginBottom: spacing.md,
  },
  faqCard: {
    paddingVertical: spacing.md,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  faqQuestion: {
    flex: 1,
    fontSize: fonts.sizes.md,
    fontWeight: fonts.weights.medium,
    color: colors.gray.dark,
    marginRight: spacing.md,
  },
  faqToggle: {
    fontSize: 20,
    color: colors.primary.start,
    fontWeight: fonts.weights.bold,
    width: 24,
    textAlign: 'center',
  },
  faqToggleExpanded: {
    color: colors.gray.medium,
  },
  faqAnswer: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.gray.light,
    marginTop: spacing.md,
  },
  faqAnswerText: {
    fontSize: fonts.sizes.sm,
    color: colors.gray.medium,
    lineHeight: 20,
  },
  resourcesCard: {
    paddingVertical: spacing.lg,
  },
  resourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  resourceIcon: {
    fontSize: 24,
    marginRight: spacing.md,
  },
  resourceContent: {
    flex: 1,
  },
  resourceTitle: {
    fontSize: fonts.sizes.md,
    fontWeight: fonts.weights.medium,
    color: colors.gray.dark,
    marginBottom: spacing.xs,
  },
  resourceDescription: {
    fontSize: fonts.sizes.sm,
    color: colors.gray.medium,
    lineHeight: 18,
  },
  resourceArrow: {
    fontSize: 16,
    color: colors.gray.medium,
  },
  resourceDivider: {
    height: 1,
    backgroundColor: colors.gray.light,
    marginHorizontal: spacing.md,
  },
  emergencyCard: {
    padding: spacing.lg,
    borderWidth: 2,
    borderColor: colors.danger,
  },
  emergencyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  emergencyIcon: {
    fontSize: 24,
    marginRight: spacing.sm,
  },
  emergencyTitle: {
    fontSize: fonts.sizes.lg,
    fontWeight: fonts.weights.bold,
    color: colors.danger,
  },
  emergencyDescription: {
    fontSize: fonts.sizes.sm,
    color: colors.gray.medium,
    lineHeight: 18,
    marginBottom: spacing.lg,
  },
  emergencyButton: {
    backgroundColor: colors.danger,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  emergencyButtonText: {
    fontSize: fonts.sizes.md,
    fontWeight: fonts.weights.bold,
    color: colors.white,
  },
  bottomSpacer: {
    height: 100,
  },
});