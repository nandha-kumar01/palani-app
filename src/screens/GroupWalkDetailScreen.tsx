import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
  Share,
} from 'react-native';
import { LinearGradient } from '../components/WebLinearGradient';
import { colors, spacing } from '../utils/theme';
import { useLanguage } from '../context/LanguageContext';
import { apiHelper } from '../utils/apiHelper';

interface Group {
  _id: string;
  name: string;
  description: string;
  createdBy: {
    _id: string;
    name: string;
    email: string;
    phone: string;
  };
  members: any[];
  isActive: boolean;
  maxMembers: number;
  pathayathiraiStatus: string;
  totalGroupDistance: number;
  createdAt: string;
  updatedAt: string;
  memberCount: number;
  activeMemberCount: number;
  groupStats: {
    averageDistance: number;
    templesVisited: number;
    activeMembers: number;
  };
}

interface GroupWalkDetailScreenProps {
  navigation: any;
  route: {
    params: {
      group: Group;
    };
  };
}

export default function GroupWalkDetailScreen({ navigation, route }: GroupWalkDetailScreenProps) {
  const { language } = useLanguage();
  const { group } = route.params;
  const [joining, setJoining] = useState(false);
  const [joined, setJoined] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'ta' ? 'ta-IN' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    const statusMap: any = {
      not_started: { text: language === 'ta' ? 'தொடங்கவில்லை' : 'Not Started', color: '#95a5a6', icon: '⏸️' },
      active: { text: language === 'ta' ? 'செயலில்' : 'Active', color: '#27ae60', icon: '🟢' },
      completed: { text: language === 'ta' ? 'முடிந்தது' : 'Completed', color: '#3498db', icon: '✅' },
      paused: { text: language === 'ta' ? 'இடைநிறுத்தப்பட்டது' : 'Paused', color: '#f39c12', icon: '⏸️' },
    };
    return statusMap[status] || statusMap.not_started;
  };

  const handleJoinGroup = async () => {
    try {
      setJoining(true);
      
      console.log('🚀 Joining group:', group._id);
      
      // Simulate API call with delay (Backend API endpoint not ready yet)
      // TODO: Replace with actual API call when backend endpoint is available:
      // const response = await apiHelper.post(`/groups/${group._id}/join`, {});
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulated success response
      const response = { success: true, message: 'Successfully joined group' };
      
      console.log('✅ Join group response:', response);
      
      if (response.success) {
        setJoined(true);
        Alert.alert(
          language === 'ta' ? '🎉 வெற்றி!' : '🎉 Success!',
          language === 'ta' 
            ? 'நீங்கள் வெற்றிகரமாக குழுவில் சேர்ந்துவிட்டீர்கள்!\n\n(குறிப்பு: இது UI டெமோ ஆகும். Backend API தயாராக உள்ளபோது உண்மையான தரவு சேமிக்கப்படும்.)' 
            : 'You have successfully joined the group!\n\n(Note: This is a UI demo. Data will be saved when backend API is ready.)',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      } else {
        throw new Error(response.message || 'Failed to join group');
      }
    } catch (error: any) {
      console.error('❌ Error joining group:', error);
      Alert.alert(
        language === 'ta' ? '❌ பிழை' : '❌ Error',
        error.message || (language === 'ta' 
          ? 'குழுவில் சேர முடியவில்லை. மீண்டும் முயற்சிக்கவும்.'
          : 'Failed to join group. Please try again.'),
        [{ text: 'OK' }]
      );
    } finally {
      setJoining(false);
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${group.name}\n\n${group.description}\n\n🙏 வெற்றிவேல் முருகனுக்கு அரோகரா!`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const status = getStatusBadge(group.pathayathiraiStatus);
  const memberProgress = (group.memberCount / group.maxMembers) * 100;

  return (
    <View style={styles.container}>
      <LinearGradient colors={[colors.primary.start, colors.primary.end]} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {language === 'ta' ? '👥 குழு விவரங்கள்' : '👥 Group Details'}
        </Text>
        <TouchableOpacity onPress={handleShare} style={styles.shareButton}>
          <Text style={styles.shareButtonText}>📤</Text>
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Group Icon & Title */}
        <View style={styles.titleSection}>
          <View style={styles.groupIconLarge}>
            <Text style={styles.groupIconText}>👥</Text>
          </View>
          <Text style={styles.groupName}>{group.name}</Text>
          <View style={[styles.statusBadgeLarge, { backgroundColor: status.color + '20', borderColor: status.color }]}>
            <Text style={styles.statusIcon}>{status.icon}</Text>
            <Text style={[styles.statusText, { color: status.color }]}>{status.text}</Text>
          </View>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statCardIcon}>👤</Text>
            <Text style={styles.statCardValue}>{group.memberCount}</Text>
            <Text style={styles.statCardLabel}>
              {language === 'ta' ? 'உறுப்பினர்கள்' : 'Members'}
            </Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statCardIcon}>🎯</Text>
            <Text style={styles.statCardValue}>{group.maxMembers}</Text>
            <Text style={styles.statCardLabel}>
              {language === 'ta' ? 'அதிகபட்சம்' : 'Max Limit'}
            </Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statCardIcon}>🚶</Text>
            <Text style={styles.statCardValue}>{group.activeMemberCount}</Text>
            <Text style={styles.statCardLabel}>
              {language === 'ta' ? 'செயலில்' : 'Active'}
            </Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statCardIcon}>🕉️</Text>
            <Text style={styles.statCardValue}>{group.groupStats.templesVisited}</Text>
            <Text style={styles.statCardLabel}>
              {language === 'ta' ? 'கோவில்கள்' : 'Temples'}
            </Text>
          </View>
        </View>

        {/* Progress Section */}
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>
              {language === 'ta' ? '📊 குழு நிரம்பு நிலை' : '📊 Group Capacity'}
            </Text>
            <Text style={styles.progressPercentage}>{Math.round(memberProgress)}%</Text>
          </View>
          <View style={styles.progressBarLarge}>
            <View style={[styles.progressFillLarge, { width: `${memberProgress}%` }]} />
          </View>
          <Text style={styles.progressInfo}>
            {group.maxMembers - group.memberCount} {language === 'ta' ? 'இடங்கள் உள்ளன' : 'spots available'}
          </Text>
        </View>

        {/* Description Section */}
        <View style={styles.descriptionSection}>
          <Text style={styles.sectionTitle}>
            {language === 'ta' ? '📝 விவரம்' : '📝 Description'}
          </Text>
          <View style={styles.quoteMarkLeft}>
            <Text style={styles.quoteText}>"</Text>
          </View>
          <Text style={styles.description}>{group.description}</Text>
          <View style={styles.quoteMarkRight}>
            <Text style={styles.quoteText}>"</Text>
          </View>
        </View>

        {/* Organizer Info */}
        <View style={styles.organizerSection}>
          <Text style={styles.sectionTitle}>
            {language === 'ta' ? '👤 ஏற்பாட்டாளர்' : '👤 Organizer'}
          </Text>
          <View style={styles.organizerCard}>
            <View style={styles.organizerIcon}>
              <Text style={styles.organizerIconText}>👨‍💼</Text>
            </View>
            <View style={styles.organizerInfo}>
              <Text style={styles.organizerName}>{group.createdBy.name}</Text>
              <Text style={styles.organizerContact}>📞 {group.createdBy.phone}</Text>
              <Text style={styles.organizerContact}>✉️ {group.createdBy.email}</Text>
            </View>
          </View>
        </View>

        {/* Created Date */}
        <View style={styles.dateSection}>
          <Text style={styles.dateLabel}>
            {language === 'ta' ? '📅 உருவாக்கப்பட்ட தேதி' : '📅 Created Date'}
          </Text>
          <Text style={styles.dateValue}>{formatDate(group.createdAt)}</Text>
        </View>

        {/* Join Button */}
        {!joined ? (
          <TouchableOpacity
            style={styles.joinButtonContainer}
            onPress={handleJoinGroup}
            disabled={joining || group.memberCount >= group.maxMembers}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={
                joining || group.memberCount >= group.maxMembers
                  ? ['#95a5a6', '#7f8c8d']
                  : [colors.primary.start, colors.primary.end]
              }
              style={styles.joinButtonLarge}
            >
              <Text style={styles.joinButtonIcon}>
                {joining ? '⏳' : group.memberCount >= group.maxMembers ? '🔒' : '🚀'}
              </Text>
              <Text style={styles.joinButtonTextLarge}>
                {joining
                  ? (language === 'ta' ? 'சேர்கிறது...' : 'Joining...')
                  : group.memberCount >= group.maxMembers
                  ? (language === 'ta' ? 'குழு நிரம்பியுள்ளது' : 'Group Full')
                  : (language === 'ta' ? 'குழுவில் சேர்' : 'Join This Group')}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        ) : (
          <View style={styles.joinedSection}>
            <Text style={styles.joinedIcon}>✅</Text>
            <Text style={styles.joinedText}>
              {language === 'ta' ? 'நீங்கள் இந்த குழுவில் சேர்ந்துவிட்டீர்கள்!' : 'You have joined this group!'}
            </Text>
          </View>
        )}

        {/* Blessing Section */}
        <View style={styles.blessingSection}>
          <Text style={styles.blessingIcon}>🙏</Text>
          <Text style={styles.blessingText}>
            {language === 'ta'
              ? 'வெற்றிவேல் முருகனுக்கு அரோகரா!'
              : 'Vetri Vel Muruganukku Arohara!'}
          </Text>
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
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  backButtonText: {
    fontSize: 24,
    color: '#fff',
    marginLeft: -2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    flex: 1,
  },
  shareButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareButtonText: {
    fontSize: 20,
  },
  content: {
    flex: 1,
  },
  titleSection: {
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  groupIconLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFF5E6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  groupIconText: {
    fontSize: 40,
  },
  groupName: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.gray.dark,
    textAlign: 'center',
    marginBottom: spacing.md,
    lineHeight: 28,
  },
  statusBadgeLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 16,
    borderWidth: 1,
  },
  statusIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.md,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
    margin: '1%',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  statCardIcon: {
    fontSize: 32,
    marginBottom: spacing.xs,
  },
  statCardValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary.start,
    marginBottom: 4,
  },
  statCardLabel: {
    fontSize: 12,
    color: colors.gray.medium,
    textAlign: 'center',
  },
  progressSection: {
    backgroundColor: '#fff',
    padding: spacing.lg,
    marginHorizontal: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.md,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.gray.dark,
  },
  progressPercentage: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary.start,
  },
  progressBarLarge: {
    height: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  progressFillLarge: {
    height: '100%',
    backgroundColor: colors.primary.start,
    borderRadius: 6,
  },
  progressInfo: {
    fontSize: 14,
    color: colors.gray.medium,
    textAlign: 'center',
  },
  descriptionSection: {
    backgroundColor: '#fff',
    padding: spacing.lg,
    marginHorizontal: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.md,
    position: 'relative',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.gray.dark,
    marginBottom: spacing.md,
  },
  quoteMarkLeft: {
    position: 'absolute',
    top: 40,
    left: 10,
  },
  quoteMarkRight: {
    position: 'absolute',
    bottom: 10,
    right: 10,
  },
  quoteText: {
    fontSize: 50,
    color: colors.primary.start,
    opacity: 0.15,
    fontWeight: '700',
    lineHeight: 50,
  },
  description: {
    fontSize: 15,
    lineHeight: 24,
    color: colors.gray.dark,
    fontStyle: 'italic',
    paddingHorizontal: spacing.sm,
  },
  organizerSection: {
    backgroundColor: '#fff',
    padding: spacing.lg,
    marginHorizontal: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.md,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  organizerCard: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  organizerIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFF5E6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  organizerIconText: {
    fontSize: 30,
  },
  organizerInfo: {
    flex: 1,
  },
  organizerName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.gray.dark,
    marginBottom: 4,
  },
  organizerContact: {
    fontSize: 13,
    color: colors.gray.medium,
    marginBottom: 2,
  },
  dateSection: {
    backgroundColor: '#fff',
    padding: spacing.lg,
    marginHorizontal: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.md,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  dateLabel: {
    fontSize: 14,
    color: colors.gray.medium,
    marginBottom: spacing.xs,
  },
  dateValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary.start,
  },
  joinButtonContainer: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    borderRadius: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  joinButtonLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
  },
  joinButtonIcon: {
    fontSize: 24,
    marginRight: spacing.sm,
  },
  joinButtonTextLarge: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  joinedSection: {
    backgroundColor: '#d4edda',
    padding: spacing.lg,
    marginHorizontal: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: spacing.md,
    borderWidth: 2,
    borderColor: '#28a745',
  },
  joinedIcon: {
    fontSize: 40,
    marginBottom: spacing.sm,
  },
  joinedText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#155724',
    textAlign: 'center',
  },
  blessingSection: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    backgroundColor: '#FFF5E6',
    marginHorizontal: spacing.md,
    borderRadius: 16,
    marginBottom: spacing.xl,
    borderWidth: 2,
    borderColor: 'rgba(255, 140, 0, 0.2)',
  },
  blessingIcon: {
    fontSize: 40,
    marginBottom: spacing.sm,
  },
  blessingText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary.start,
    textAlign: 'center',
  },
});
