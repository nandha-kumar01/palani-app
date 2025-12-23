import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Platform,
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

interface GroupWalkScreenProps {
  navigation: any;
}

export default function GroupWalkScreen({ navigation }: GroupWalkScreenProps) {
  const { language } = useLanguage();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const response = await apiHelper.get('/groups?includeMembers=true&includeInactive=true');
      console.log('👥 Groups API Response:', response);
      
      if (response.groups) {
        setGroups(response.groups);
        console.log('✅ Groups loaded:', response.groups.length);
      }
    } catch (error) {
      console.error('❌ Error fetching groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchGroups();
    setRefreshing(false);
  };

  const handleGroupPress = (group: Group) => {
    navigation.navigate('GroupWalkDetail', { group });
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

  const renderGroupItem = ({ item }: { item: Group }) => {
    const status = getStatusBadge(item.pathayathiraiStatus);
    const memberProgress = (item.memberCount / item.maxMembers) * 100;

    return (
      <TouchableOpacity
        style={styles.groupCard}
        onPress={() => handleGroupPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.groupHeader}>
          <View style={styles.groupIconContainer}>
            <Text style={styles.groupIcon}>👥</Text>
          </View>
          <View style={styles.groupHeaderContent}>
            <Text style={styles.groupName} numberOfLines={2}>
              {item.name}
            </Text>
            <View style={[styles.statusBadge, { backgroundColor: status.color + '20', borderColor: status.color }]}>
              <Text style={styles.statusIcon}>{status.icon}</Text>
              <Text style={[styles.statusText, { color: status.color }]}>{status.text}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.groupDescription} numberOfLines={3}>
          {item.description}
        </Text>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statIcon}>👤</Text>
            <Text style={styles.statValue}>{item.memberCount}/{item.maxMembers}</Text>
            <Text style={styles.statLabel}>{language === 'ta' ? 'உறுப்பினர்கள்' : 'Members'}</Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statItem}>
            <Text style={styles.statIcon}>🚶</Text>
            <Text style={styles.statValue}>{item.activeMemberCount}</Text>
            <Text style={styles.statLabel}>{language === 'ta' ? 'செயலில்' : 'Active'}</Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statItem}>
            <Text style={styles.statIcon}>🕉️</Text>
            <Text style={styles.statValue}>{item.groupStats.templesVisited}</Text>
            <Text style={styles.statLabel}>{language === 'ta' ? 'கோவில்கள்' : 'Temples'}</Text>
          </View>
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${memberProgress}%` }]} />
          </View>
          <Text style={styles.progressText}>
            {Math.round(memberProgress)}% {language === 'ta' ? 'நிரம்பியது' : 'Filled'}
          </Text>
        </View>

        <View style={styles.joinButtonContainer}>
          <LinearGradient colors={[colors.primary.start, colors.primary.end]} style={styles.joinButton}>
            <Text style={styles.joinButtonText}>
              {language === 'ta' ? '🚀 இணையுங்கள்' : '🚀 Join Group'}
            </Text>
          </LinearGradient>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={[colors.primary.start, colors.primary.end]} style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {language === 'ta' ? '👥 குழு நடை' : '👥 Group Walk'}
          </Text>
        </LinearGradient>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary.start} />
          <Text style={styles.loadingText}>
            {language === 'ta' ? 'குழுக்களை ஏற்றுகிறது...' : 'Loading groups...'}
          </Text>
        </View>
      </View>
    );
  }

  if (groups.length === 0) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={[colors.primary.start, colors.primary.end]} style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {language === 'ta' ? '👥 குழு நடை' : '👥 Group Walk'}
          </Text>
        </LinearGradient>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>👥</Text>
          <Text style={styles.emptyText}>
            {language === 'ta' ? 'குழுக்கள் இல்லை' : 'No groups found'}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={[colors.primary.start, colors.primary.end]} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {language === 'ta' ? '👥 குழு நடை' : '👥 Group Walk'}
        </Text>
        <View style={styles.headerBadge}>
          <Text style={styles.headerBadgeText}>{groups.length}</Text>
        </View>
      </LinearGradient>

      <FlatList
        data={groups}
        renderItem={renderGroupItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary.start]}
          />
        }
      />
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
  headerBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  headerBadgeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: 16,
    color: colors.gray.medium,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: spacing.lg,
  },
  emptyText: {
    fontSize: 18,
    color: colors.gray.medium,
    textAlign: 'center',
  },
  listContainer: {
    padding: spacing.md,
  },
  groupCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  groupHeader: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  groupIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFF5E6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  groupIcon: {
    fontSize: 28,
  },
  groupHeaderContent: {
    flex: 1,
  },
  groupName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.gray.dark,
    marginBottom: spacing.xs,
    lineHeight: 22,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  groupDescription: {
    fontSize: 14,
    color: colors.gray.medium,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: spacing.md,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    marginBottom: spacing.md,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary.start,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: colors.gray.medium,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#e0e0e0',
  },
  progressContainer: {
    marginBottom: spacing.md,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary.start,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: colors.gray.medium,
    textAlign: 'center',
  },
  joinButtonContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  joinButton: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  joinButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});