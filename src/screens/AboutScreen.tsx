import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Image,
} from 'react-native';
import { LinearGradient } from '../components/WebLinearGradient';
import { WhiteCard } from '../components/GlassCard';
import BottomNavigation from '../components/BottomNavigation';
import { colors, fonts, spacing, borderRadius } from '../utils/theme';
import { useApp } from '../context/AppContext';

interface AboutScreenProps {
  navigation: any;
}

interface TeamMember {
  name: string;
  role: string;
  roleTamil: string;
  description: string;
  descriptionTamil: string;
}

interface Feature {
  title: string;
  titleTamil: string;
  description: string;
  descriptionTamil: string;
  icon: string;
}

export default function AboutScreen({ navigation }: AboutScreenProps) {
  const { language } = useApp();

  const appInfo = {
    name: 'Palani Pathayathirai',
    version: '1.0.0',
    buildNumber: '001',
    releaseDate: 'November 2024',
    releaseDateTamil: 'நவம்பர் 2024',
  };

  const teamMembers: TeamMember[] = [
    {
      name: 'Development Team',
      role: 'App Development',
      roleTamil: 'ஆப் மேம்பாடு',
      description: 'Passionate developers creating digital solutions for spiritual journeys',
      descriptionTamil: 'ஆன்மீக பயணங்களுக்கான டிஜிட்டல் தீர்வுகளை உருவாக்கும் ஆர்வமுள்ள மேம்பாட்டாளர்கள்',
    },
    {
      name: 'Community Team',
      role: 'Community Management',
      roleTamil: 'சமூக மேலாண்மை',
      description: 'Building and nurturing our devotee community',
      descriptionTamil: 'நமது பக்தர் சமூகத்தை கட்டி நாணர்வுடன் வளர்க்கும்',
    },
    {
      name: 'Design Team',
      role: 'UI/UX Design',
      roleTamil: 'வடிவமைப்பு',
      description: 'Creating beautiful and intuitive user experiences',
      descriptionTamil: 'அழகிய மற்றும் எளிமையான பயனர் அனுபவங்களை உருவாக்குதல்',
    },
  ];

  const features: Feature[] = [
    {
      title: 'Group Walks',
      titleTamil: 'குழு நடைகள்',
      description: 'Join community pilgrimage walks with fellow devotees',
      descriptionTamil: 'சக பக்தர்களுடன் சமூக யாத்திரை நடைகளில் சேரவும்',
      icon: '🚶‍♂️',
    },
    {
      title: 'Live Tracking',
      titleTamil: 'நேரடி கண்காணிப்பு',
      description: 'Real-time location sharing and safety features',
      descriptionTamil: 'நிகழ்நேர இருப்பிட பகிர்வு மற்றும் பாதுகாப்பு அம்சங்கள்',
      icon: '📍',
    },
    {
      title: 'Achievement System',
      titleTamil: 'சாதனை அமைப்பு',
      description: 'Track your spiritual journey milestones',
      descriptionTamil: 'உங்கள் ஆன்மீக பயண மைல்கற்களை கண்காணிக்கவும்',
      icon: '🏆',
    },
    {
      title: 'Multi-language Support',
      titleTamil: 'பல மொழி ஆதரவு',
      description: 'Available in English and Tamil',
      descriptionTamil: 'ஆங்கிலம் மற்றும் தமிழில் கிடைக்கிறது',
      icon: '🌐',
    },
    {
      title: 'Temple Information',
      titleTamil: 'கோவில் தகவல்',
      description: 'Detailed information about sacred temples',
      descriptionTamil: 'புனித கோவில்கள் பற்றிய விரிவான தகவல்',
      icon: '🏛️',
    },
    {
      title: 'Spiritual Content',
      titleTamil: 'ஆன்மீக உள்ளடக்கம்',
      description: 'Daily quotes, music, and spiritual guidance',
      descriptionTamil: 'தினசரி மேற்கோள்கள், இசை மற்றும் ஆன்மீக வழிகாட்டுதல்',
      icon: '📿',
    },
  ];

  const openURL = (url: string) => {
    Linking.openURL(url).catch(err => console.error('An error occurred', err));
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
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>🏛️</Text>
          </View>
          <Text style={styles.appName}>{appInfo.name}</Text>
          <Text style={styles.appTagline}>
            {language === 'tamil' 
              ? 'ஆன்மீக பயணத்திற்கான உங்கள் துணை'
              : 'Your companion for spiritual journeys'
            }
          </Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content}>
        {/* App Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {language === 'tamil' ? 'ஆப் தகவல்' : 'App Information'}
          </Text>
          
          <WhiteCard style={styles.card}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>
                {language === 'tamil' ? 'பதிப்பு:' : 'Version:'}
              </Text>
              <Text style={styles.infoValue}>{appInfo.version}</Text>
            </View>
            
            <View style={styles.infoDivider} />
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>
                {language === 'tamil' ? 'உருவாக்கம் எண்:' : 'Build Number:'}
              </Text>
              <Text style={styles.infoValue}>{appInfo.buildNumber}</Text>
            </View>
            
            <View style={styles.infoDivider} />
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>
                {language === 'tamil' ? 'வெளியீட்டு தேதி:' : 'Release Date:'}
              </Text>
              <Text style={styles.infoValue}>
                {language === 'tamil' ? appInfo.releaseDateTamil : appInfo.releaseDate}
              </Text>
            </View>
          </WhiteCard>
        </View>

        {/* About the App */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {language === 'tamil' ? 'ஆப் பற்றி' : 'About the App'}
          </Text>
          
          <WhiteCard style={styles.card}>
            <Text style={styles.aboutText}>
              {language === 'tamil' 
                ? 'பலானி பாதயாத்திரை என்பது ஆன்மீக பயணிகளை இணைக்கும் ஒரு சமுதாய மேடையாகும். இது பக்தர்களுக்கு ஒன்றாக நடந்து, அனுபவங்களைப் பகிர்ந்து கொள்ளவும், அவர்களின் ஆன்மீக பயணத்தில் முன்னேறவும் உதவுகிறது। பாரம்பர்ய யாத்திரைகளை நவீன தொழில்நுட்பத்துடன் இணைத்து, நாங்கள் அனைவருக்கும் அணுகக்கூடிய மற்றும் அர்த்தமுள்ள அனுபவத்தை வழங்குகிறோம்.'
                : 'Palani Pathayathirai is a community platform that connects spiritual travelers. It helps devotees walk together, share experiences, and progress in their spiritual journey. By combining traditional pilgrimage with modern technology, we provide an accessible and meaningful experience for all.'
              }
            </Text>
          </WhiteCard>
        </View>

        {/* Key Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {language === 'tamil' ? 'முக்கிய அம்சங்கள்' : 'Key Features'}
          </Text>
          
          <View style={styles.featuresGrid}>
            {features.map((feature, index) => (
              <View key={index} style={styles.featureCard}>
                <WhiteCard style={styles.featureContent}>
                  <Text style={styles.featureIcon}>{feature.icon}</Text>
                  <Text style={styles.featureTitle}>
                    {language === 'tamil' ? feature.titleTamil : feature.title}
                  </Text>
                  <Text style={styles.featureDescription}>
                    {language === 'tamil' ? feature.descriptionTamil : feature.description}
                  </Text>
                </WhiteCard>
              </View>
            ))}
          </View>
        </View>

        {/* Our Mission */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {language === 'tamil' ? 'எங்கள் நோக்கம்' : 'Our Mission'}
          </Text>
          
          <WhiteCard style={styles.card}>
            <View style={styles.missionContainer}>
              <Text style={styles.missionIcon}>🎯</Text>
              <Text style={styles.missionText}>
                {language === 'tamil' 
                  ? 'நாங்கள் தொழில்நுட்பத்தின் மூலம் ஆன்மீக சமுதாயங்களை மேம்படுத்த முயல்கிறோம். பாரம்பர்ய யாத்திரைகளை நவீன கருவிகளுடன் இணைத்து, ஒவ்வொரு பக்தரும் தங்கள் ஆன்மீக பயணத்தில் ஆதரவும் வழிகாட்டுதலும் பெற வேண்டும் என்பதே எங்கள் நோக்கம்.'
                  : 'We strive to enhance spiritual communities through technology. Our mission is to bridge traditional pilgrimage with modern tools, ensuring every devotee receives support and guidance in their spiritual journey.'
                }
              </Text>
            </View>
          </WhiteCard>
        </View>

        {/* Development Team */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {language === 'tamil' ? 'மேம்பாட்டு குழு' : 'Development Team'}
          </Text>
          
          {teamMembers.map((member, index) => (
            <View key={index} style={styles.teamMemberCard}>
              <WhiteCard style={styles.teamMemberContent}>
                <View style={styles.teamMemberHeader}>
                  <View style={styles.teamMemberAvatar}>
                    <Text style={styles.teamMemberAvatarText}>
                      {member.name.charAt(0)}
                    </Text>
                  </View>
                  <View style={styles.teamMemberInfo}>
                    <Text style={styles.teamMemberName}>{member.name}</Text>
                    <Text style={styles.teamMemberRole}>
                      {language === 'tamil' ? member.roleTamil : member.role}
                    </Text>
                  </View>
                </View>
                <Text style={styles.teamMemberDescription}>
                  {language === 'tamil' ? member.descriptionTamil : member.description}
                </Text>
              </WhiteCard>
            </View>
          ))}
        </View>

        {/* Social Links */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {language === 'tamil' ? 'எங்களைத் தொடர்பு கொள்ளுங்கள்' : 'Connect With Us'}
          </Text>
          
          <WhiteCard style={styles.card}>
            <TouchableOpacity 
              style={styles.socialLink}
              onPress={() => openURL('mailto:contact@palani.com')}
            >
              <Text style={styles.socialIcon}>✉️</Text>
              <View style={styles.socialContent}>
                <Text style={styles.socialTitle}>
                  {language === 'tamil' ? 'மின்னஞ்சல்' : 'Email'}
                </Text>
                <Text style={styles.socialValue}>contact@palani.com</Text>
              </View>
              <Text style={styles.socialArrow}>→</Text>
            </TouchableOpacity>

            <View style={styles.socialDivider} />

            <TouchableOpacity 
              style={styles.socialLink}
              onPress={() => openURL('https://www.palani.com')}
            >
              <Text style={styles.socialIcon}>🌐</Text>
              <View style={styles.socialContent}>
                <Text style={styles.socialTitle}>
                  {language === 'tamil' ? 'வலைத்தளம்' : 'Website'}
                </Text>
                <Text style={styles.socialValue}>www.palani.com</Text>
              </View>
              <Text style={styles.socialArrow}>→</Text>
            </TouchableOpacity>

            <View style={styles.socialDivider} />

            <TouchableOpacity 
              style={styles.socialLink}
              onPress={() => openURL('tel:+91XXXXXXXXXX')}
            >
              <Text style={styles.socialIcon}>📞</Text>
              <View style={styles.socialContent}>
                <Text style={styles.socialTitle}>
                  {language === 'tamil' ? 'தொலைபேசி' : 'Phone'}
                </Text>
                <Text style={styles.socialValue}>+91-XXXX-XXXXXX</Text>
              </View>
              <Text style={styles.socialArrow}>→</Text>
            </TouchableOpacity>
          </WhiteCard>
        </View>

        {/* Legal Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {language === 'tamil' ? 'சட்டப்பூர்வ தகவல்' : 'Legal Information'}
          </Text>
          
          <WhiteCard style={styles.card}>
            <TouchableOpacity style={styles.legalLink}>
              <Text style={styles.legalText}>
                {language === 'tamil' ? 'தனியுரிமைக் கொள்கை' : 'Privacy Policy'}
              </Text>
              <Text style={styles.legalArrow}>→</Text>
            </TouchableOpacity>

            <View style={styles.legalDivider} />

            <TouchableOpacity style={styles.legalLink}>
              <Text style={styles.legalText}>
                {language === 'tamil' ? 'சேவை விதிமுறைகள்' : 'Terms of Service'}
              </Text>
              <Text style={styles.legalArrow}>→</Text>
            </TouchableOpacity>

            <View style={styles.legalDivider} />

            <TouchableOpacity style={styles.legalLink}>
              <Text style={styles.legalText}>
                {language === 'tamil' ? 'ஓப்பன் சோர்ஸ் உரிமங்கள்' : 'Open Source Licenses'}
              </Text>
              <Text style={styles.legalArrow}>→</Text>
            </TouchableOpacity>
          </WhiteCard>
        </View>

        {/* Copyright */}
        <View style={styles.section}>
          <WhiteCard style={styles.copyrightCard}>
            <Text style={styles.copyrightText}>
              © 2024 Palani Pathayathirai
            </Text>
            <Text style={styles.copyrightSubtext}>
              {language === 'tamil' 
                ? 'பக்தியுடன் உருவாக்கப்பட்டது'
                : 'Developed with devotion'
              }
            </Text>
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
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  logoText: {
    fontSize: 40,
  },
  appName: {
    fontSize: fonts.sizes.xxl,
    fontWeight: fonts.weights.bold,
    color: colors.white,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  appTagline: {
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
  card: {
    padding: spacing.lg,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  infoLabel: {
    fontSize: fonts.sizes.md,
    color: colors.gray.medium,
    fontWeight: fonts.weights.medium,
  },
  infoValue: {
    fontSize: fonts.sizes.md,
    color: colors.gray.dark,
    fontWeight: fonts.weights.semibold,
  },
  infoDivider: {
    height: 1,
    backgroundColor: colors.gray.light,
    marginVertical: spacing.sm,
  },
  aboutText: {
    fontSize: fonts.sizes.md,
    color: colors.gray.dark,
    lineHeight: 24,
    textAlign: 'justify',
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featureCard: {
    width: '48%',
    marginBottom: spacing.md,
  },
  featureContent: {
    padding: spacing.md,
    height: 140,
    alignItems: 'center',
  },
  featureIcon: {
    fontSize: 28,
    marginBottom: spacing.sm,
  },
  featureTitle: {
    fontSize: fonts.sizes.sm,
    fontWeight: fonts.weights.bold,
    color: colors.gray.dark,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  featureDescription: {
    fontSize: fonts.sizes.xs,
    color: colors.gray.medium,
    textAlign: 'center',
    lineHeight: 14,
  },
  missionContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  missionIcon: {
    fontSize: 24,
    marginRight: spacing.md,
    marginTop: spacing.xs,
  },
  missionText: {
    flex: 1,
    fontSize: fonts.sizes.md,
    color: colors.gray.dark,
    lineHeight: 22,
    textAlign: 'justify',
  },
  teamMemberCard: {
    marginBottom: spacing.md,
  },
  teamMemberContent: {
    padding: spacing.lg,
  },
  teamMemberHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  teamMemberAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary.start,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  teamMemberAvatarText: {
    fontSize: 20,
    fontWeight: fonts.weights.bold,
    color: colors.white,
  },
  teamMemberInfo: {
    flex: 1,
  },
  teamMemberName: {
    fontSize: fonts.sizes.md,
    fontWeight: fonts.weights.bold,
    color: colors.gray.dark,
    marginBottom: spacing.xs,
  },
  teamMemberRole: {
    fontSize: fonts.sizes.sm,
    color: colors.primary.start,
    fontWeight: fonts.weights.medium,
  },
  teamMemberDescription: {
    fontSize: fonts.sizes.sm,
    color: colors.gray.medium,
    lineHeight: 18,
  },
  socialLink: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  socialIcon: {
    fontSize: 20,
    marginRight: spacing.md,
  },
  socialContent: {
    flex: 1,
  },
  socialTitle: {
    fontSize: fonts.sizes.sm,
    color: colors.gray.medium,
    marginBottom: spacing.xs,
  },
  socialValue: {
    fontSize: fonts.sizes.md,
    color: colors.gray.dark,
    fontWeight: fonts.weights.medium,
  },
  socialArrow: {
    fontSize: 16,
    color: colors.gray.medium,
  },
  socialDivider: {
    height: 1,
    backgroundColor: colors.gray.light,
    marginVertical: spacing.xs,
  },
  legalLink: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  legalText: {
    fontSize: fonts.sizes.md,
    color: colors.gray.dark,
    fontWeight: fonts.weights.medium,
  },
  legalArrow: {
    fontSize: 16,
    color: colors.gray.medium,
  },
  legalDivider: {
    height: 1,
    backgroundColor: colors.gray.light,
  },
  copyrightCard: {
    alignItems: 'center',
    padding: spacing.lg,
  },
  copyrightText: {
    fontSize: fonts.sizes.md,
    color: colors.gray.dark,
    fontWeight: fonts.weights.semibold,
    marginBottom: spacing.xs,
  },
  copyrightSubtext: {
    fontSize: fonts.sizes.sm,
    color: colors.gray.medium,
    fontStyle: 'italic',
  },
  bottomSpacer: {
    height: 100,
  },
});