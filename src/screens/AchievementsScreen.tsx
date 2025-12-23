import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { LinearGradient } from '../components/WebLinearGradient';
import { WhiteCard } from '../components/GlassCard';
import BottomNavigation from '../components/BottomNavigation';
import { colors, fonts, spacing, borderRadius } from '../utils/theme';
import { useApp } from '../context/AppContext';

interface Achievement {
  id: string;
  title: string;
  titleTamil: string;
  description: string;
  descriptionTamil: string;
  icon: string;
  category: 'walking' | 'devotion' | 'community' | 'milestone';
  progress: number;
  maxProgress: number;
  unlocked: boolean;
  unlockedDate?: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  points: number;
}

interface AchievementsScreenProps {
  navigation: any;
}

export default function AchievementsScreen({ navigation }: AchievementsScreenProps) {
  const { language } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  const achievements: Achievement[] = [
    {
      id: '1',
      title: 'First Steps',
      titleTamil: 'முதல் அடிகள்',
      description: 'Complete your first pilgrimage walk',
      descriptionTamil: 'உங்கள் முதல் யாத்திரை நடைப்பயணத்தை முடிக்கவும்',
      icon: '👣',
      category: 'walking',
      progress: 1,
      maxProgress: 1,
      unlocked: true,
      unlockedDate: '2024-10-15',
      rarity: 'common',
      points: 50,
    },
    {
      id: '2',
      title: 'Early Bird',
      titleTamil: 'விடியல் பறவை',
      description: 'Start a walk before 6 AM',
      descriptionTamil: 'காலை 6 மணிக்கு முன் நடைபயணம் தொடங்கவும்',
      icon: '🌅',
      category: 'walking',
      progress: 3,
      maxProgress: 5,
      unlocked: false,
      rarity: 'common',
      points: 75,
    },
    {
      id: '3',
      title: 'Devotee\'s Heart',
      titleTamil: 'பக்தனின் இதயம்',
      description: 'Complete 10 temple visits',
      descriptionTamil: '10 கோவில் வருகைகளை முடிக்கவும்',
      icon: '🙏',
      category: 'devotion',
      progress: 7,
      maxProgress: 10,
      unlocked: false,
      rarity: 'rare',
      points: 150,
    },
    {
      id: '4',
      title: 'Distance Walker',
      titleTamil: 'தூர நடைப்பயணி',
      description: 'Walk a total of 100 KM',
      descriptionTamil: 'மொத்தம் 100 கிமீ நடக்கவும்',
      icon: '🚶‍♂️',
      category: 'milestone',
      progress: 85,
      maxProgress: 100,
      unlocked: false,
      rarity: 'epic',
      points: 300,
    },
    {
      id: '5',
      title: 'Community Leader',
      titleTamil: 'சமூகத் தலைவர்',
      description: 'Lead 5 group walks',
      descriptionTamil: '5 குழு நடைப்பயணங்களை வழிநடத்தவும்',
      icon: '👥',
      category: 'community',
      progress: 2,
      maxProgress: 5,
      unlocked: false,
      rarity: 'rare',
      points: 200,
    },
    {
      id: '6',
      title: 'Legendary Pilgrim',
      titleTamil: 'பாரம்பர்ய யாத்திரிகர்',
      description: 'Complete 50 pilgrimage walks',
      descriptionTamil: '50 யாத்திரை நடைப்பயணங்களை முடிக்கவும்',
      icon: '🏆',
      category: 'milestone',
      progress: 12,
      maxProgress: 50,
      unlocked: false,
      rarity: 'legendary',
      points: 1000,
    },
    {
      id: '7',
      title: 'Daily Devotion',
      titleTamil: 'தினசரி பக்தி',
      description: 'Visit temple for 7 consecutive days',
      descriptionTamil: 'தொடர்ந்து 7 நாட்கள் கோவிலுக்கு வருகை தரவும்',
      icon: '📿',
      category: 'devotion',
      progress: 5,
      maxProgress: 7,
      unlocked: false,
      rarity: 'rare',
      points: 175,
    },
    {
      id: '8',
      title: 'Helper\'s Spirit',
      titleTamil: 'உதவும் ஆன்மா',
      description: 'Help organize 3 community events',
      descriptionTamil: '3 சமுதாய நிகழ்வுகளை ஒழுங்கமைக்க உதவவும்',
      icon: '🤝',
      category: 'community',
      progress: 1,
      maxProgress: 3,
      unlocked: false,
      rarity: 'epic',
      points: 250,
    },
  ];

  const categories = [
    { id: 'all', title: 'All', titleTamil: 'அனைத்தும்', icon: '🏅' },
    { id: 'walking', title: 'Walking', titleTamil: 'நடைப்பயணம்', icon: '🚶‍♂️' },
    { id: 'devotion', title: 'Devotion', titleTamil: 'பக்தி', icon: '🙏' },
    { id: 'community', title: 'Community', titleTamil: 'சமூகம்', icon: '👥' },
    { id: 'milestone', title: 'Milestones', titleTamil: 'மைல்கல்கள்', icon: '🏆' },
  ];

  const filteredAchievements = selectedCategory === 'all' 
    ? achievements 
    : achievements.filter(achievement => achievement.category === selectedCategory);

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalPoints = achievements.filter(a => a.unlocked).reduce((sum, a) => sum + a.points, 0);

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return colors.gray.medium;
      case 'rare': return '#3498db';
      case 'epic': return '#9b59b6';
      case 'legendary': return '#f1c40f';
      default: return colors.gray.medium;
    }
  };

  const getRarityText = (rarity: string) => {
    const texts = {
      common: { en: 'Common', ta: 'பொது' },
      rare: { en: 'Rare', ta: 'அரிய' },
      epic: { en: 'Epic', ta: 'வீரம்' },
      legendary: { en: 'Legendary', ta: 'புராணம்' },
    };
    return language === 'tamil' ? texts[rarity as keyof typeof texts]?.ta : texts[rarity as keyof typeof texts]?.en;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return language === 'tamil' 
      ? date.toLocaleDateString('ta-IN')
      : date.toLocaleDateString('en-IN');
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
            {language === 'tamil' ? 'சாதனைகள்' : 'Achievements'}
          </Text>
          
          {/* Stats Summary */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{unlockedCount}</Text>
              <Text style={styles.statLabel}>
                {language === 'tamil' ? 'திறக்கப்பட்டது' : 'Unlocked'}
              </Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{achievements.length}</Text>
              <Text style={styles.statLabel}>
                {language === 'tamil' ? 'மொத்தம்' : 'Total'}
              </Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{totalPoints}</Text>
              <Text style={styles.statLabel}>
                {language === 'tamil' ? 'புள்ளிகள்' : 'Points'}
              </Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content}>
        {/* Category Filter */}
        <View style={styles.section}>
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
        </View>

        {/* Achievements Grid */}
        <View style={styles.section}>
          <View style={styles.achievementsGrid}>
            {filteredAchievements.map((achievement) => (
              <TouchableOpacity key={achievement.id} style={styles.achievementCard}>
                <WhiteCard style={{
                  ...styles.achievementContent,
                  ...(achievement.unlocked ? styles.achievementUnlocked : {}),
                  ...(!achievement.unlocked ? styles.achievementLocked : {})
                }}>
                  <View style={styles.achievementHeader}>
                    <View style={[
                      styles.iconContainer,
                      { backgroundColor: achievement.unlocked ? getRarityColor(achievement.rarity) : colors.gray.light }
                    ]}>
                      <Text style={{
                        ...styles.achievementIcon,
                        ...(!achievement.unlocked ? styles.achievementIconLocked : {})
                      }}>
                        {achievement.icon}
                      </Text>
                    </View>
                    
                    {achievement.unlocked && (
                      <View style={[styles.rarityBadge, { backgroundColor: getRarityColor(achievement.rarity) }]}>
                        <Text style={styles.rarityText}>
                          {getRarityText(achievement.rarity)}
                        </Text>
                      </View>
                    )}
                  </View>

                  <Text style={{
                    ...styles.achievementTitle,
                    ...(!achievement.unlocked ? styles.achievementTitleLocked : {})
                  }}>
                    {language === 'tamil' ? achievement.titleTamil : achievement.title}
                  </Text>

                  <Text style={{
                    ...styles.achievementDescription,
                    ...(!achievement.unlocked ? styles.achievementDescriptionLocked : {})
                  }}>
                    {language === 'tamil' ? achievement.descriptionTamil : achievement.description}
                  </Text>

                  {/* Progress Bar */}
                  {!achievement.unlocked && (
                    <View style={styles.progressContainer}>
                      <View style={styles.progressBar}>
                        <View style={[
                          styles.progressFill,
                          { width: `${(achievement.progress / achievement.maxProgress) * 100}%` }
                        ]} />
                      </View>
                      <Text style={styles.progressText}>
                        {achievement.progress}/{achievement.maxProgress}
                      </Text>
                    </View>
                  )}

                  {/* Points and Date */}
                  <View style={styles.achievementFooter}>
                    <View style={styles.pointsContainer}>
                      <Text style={styles.pointsIcon}>⭐</Text>
                      <Text style={{
                        ...styles.pointsText,
                        ...(!achievement.unlocked ? styles.pointsTextLocked : {})
                      }}>
                        {achievement.points}
                      </Text>
                    </View>
                    
                    {achievement.unlocked && achievement.unlockedDate && (
                      <Text style={styles.unlockedDate}>
                        {formatDate(achievement.unlockedDate)}
                      </Text>
                    )}
                  </View>
                </WhiteCard>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Achievement Summary */}
        <View style={styles.section}>
          <WhiteCard style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>
              {language === 'tamil' ? 'சாதனை சுருக்கம்' : 'Achievement Summary'}
            </Text>
            
            <View style={styles.summaryStats}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>
                  {language === 'tamil' ? 'முன்னேற்றம்:' : 'Progress:'}
                </Text>
                <Text style={styles.summaryValue}>
                  {Math.round((unlockedCount / achievements.length) * 100)}%
                </Text>
              </View>
              
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>
                  {language === 'tamil' ? 'அடுத்த இலக்கு:' : 'Next Goal:'}
                </Text>
                <Text style={styles.summaryValue}>
                  {achievements.find(a => !a.unlocked)?.title || 
                   (language === 'tamil' ? 'அனைத்தும் முடிந்தது!' : 'All Complete!')}
                </Text>
              </View>
            </View>
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
    marginBottom: spacing.lg,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: fonts.sizes.lg,
    fontWeight: fonts.weights.bold,
    color: colors.white,
  },
  statLabel: {
    fontSize: fonts.sizes.xs,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: spacing.xs,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: spacing.lg,
  },
  content: {
    flex: 1,
  },
  section: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
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
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  achievementCard: {
    width: '48%',
    marginBottom: spacing.md,
  },
  achievementContent: {
    padding: spacing.md,
    height: 280,
  },
  achievementUnlocked: {
    borderWidth: 2,
    borderColor: colors.success,
  },
  achievementLocked: {
    opacity: 0.7,
  },
  achievementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  achievementIcon: {
    fontSize: 24,
  },
  achievementIconLocked: {
    opacity: 0.5,
  },
  rarityBadge: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  rarityText: {
    fontSize: fonts.sizes.xs,
    color: colors.white,
    fontWeight: fonts.weights.bold,
  },
  achievementTitle: {
    fontSize: fonts.sizes.md,
    fontWeight: fonts.weights.bold,
    color: colors.gray.dark,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  achievementTitleLocked: {
    color: colors.gray.medium,
  },
  achievementDescription: {
    fontSize: fonts.sizes.sm,
    color: colors.gray.medium,
    textAlign: 'center',
    marginBottom: spacing.sm,
    lineHeight: 18,
  },
  achievementDescriptionLocked: {
    color: colors.gray.light,
  },
  progressContainer: {
    marginBottom: spacing.sm,
  },
  progressBar: {
    height: 6,
    backgroundColor: colors.gray.light,
    borderRadius: 3,
    marginBottom: spacing.xs,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary.start,
    borderRadius: 3,
  },
  progressText: {
    fontSize: fonts.sizes.xs,
    color: colors.gray.medium,
    textAlign: 'center',
  },
  achievementFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 'auto',
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pointsIcon: {
    fontSize: 14,
    marginRight: spacing.xs,
  },
  pointsText: {
    fontSize: fonts.sizes.sm,
    fontWeight: fonts.weights.medium,
    color: colors.primary.start,
  },
  pointsTextLocked: {
    color: colors.gray.medium,
  },
  unlockedDate: {
    fontSize: fonts.sizes.xs,
    color: colors.gray.medium,
  },
  summaryCard: {
    padding: spacing.lg,
  },
  summaryTitle: {
    fontSize: fonts.sizes.lg,
    fontWeight: fonts.weights.bold,
    color: colors.gray.dark,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  summaryStats: {
    marginTop: spacing.sm,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  summaryLabel: {
    fontSize: fonts.sizes.md,
    color: colors.gray.medium,
  },
  summaryValue: {
    fontSize: fonts.sizes.md,
    fontWeight: fonts.weights.medium,
    color: colors.gray.dark,
  },
  bottomSpacer: {
    height: 100,
  },
});