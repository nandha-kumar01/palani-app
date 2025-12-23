import AsyncStorage from '@react-native-async-storage/async-storage';
import { TrackingSession, WalkRoute } from './advancedLocationService';

export interface UserStats {
  totalDistance: number; // meters
  totalDuration: number; // seconds
  totalWalks: number;
  totalElevationGain: number; // meters
  totalCalories: number;
  totalSteps: number;
  averageSpeed: number; // km/h
  favoriteRoute?: string;
  longestWalk: number; // meters
  fastestPace: number; // km/h
  streakDays: number;
  lastWalkDate?: string;
  firstWalkDate?: string;
  achievements: string[];
  weeklyGoal: number; // meters
  monthlyGoal: number; // meters
  yearlyGoal: number; // meters
}

export interface DailyProgress {
  date: string; // YYYY-MM-DD format
  distance: number;
  duration: number;
  walks: number;
  calories: number;
  steps: number;
  elevationGain: number;
  routes: string[];
  weather?: string;
  mood?: 'excellent' | 'good' | 'average' | 'tired' | 'exhausted';
  notes?: string;
}

export interface WeeklyInsight {
  weekStart: string; // YYYY-MM-DD format
  totalDistance: number;
  totalDuration: number;
  totalWalks: number;
  averageSpeed: number;
  goalProgress: number; // percentage
  bestDay: string;
  improvementAreas: string[];
  accomplishments: string[];
  nextWeekSuggestions: string[];
}

export interface MonthlyReport {
  month: string; // YYYY-MM format
  totalDistance: number;
  totalDuration: number;
  totalWalks: number;
  averageSpeed: number;
  goalProgress: number;
  streakDays: number;
  topRoutes: Array<{ routeId: string; count: number; name: string }>;
  challenges: Array<{
    id: string;
    name: string;
    description: string;
    target: number;
    achieved: number;
    completed: boolean;
  }>;
  milestones: Array<{
    type: 'distance' | 'duration' | 'frequency' | 'elevation';
    milestone: string;
    achievedDate: string;
  }>;
  healthMetrics: {
    avgCaloriesPerWalk: number;
    avgStepsPerWalk: number;
    fitnessImprovement: number; // percentage
    enduranceScore: number;
  };
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'distance' | 'frequency' | 'speed' | 'elevation' | 'exploration' | 'social' | 'spiritual';
  requirement: {
    type: 'total_distance' | 'single_walk' | 'consecutive_days' | 'route_completion' | 'speed_average' | 'elevation_gain';
    value: number;
    unit: string;
  };
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  reward?: {
    type: 'badge' | 'title' | 'unlock';
    value: string;
  };
  unlockedAt?: string;
  progress?: number; // 0-100
}

export interface Challenge {
  id: string;
  name: string;
  description: string;
  type: 'daily' | 'weekly' | 'monthly' | 'seasonal';
  category: 'distance' | 'frequency' | 'exploration' | 'social' | 'spiritual';
  target: number;
  unit: string;
  startDate: string;
  endDate: string;
  progress: number;
  participants: number;
  reward?: string;
  isActive: boolean;
  isCompleted: boolean;
  completedAt?: string;
}

export interface ProgressGoal {
  id: string;
  type: 'distance' | 'frequency' | 'duration' | 'elevation';
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  target: number;
  unit: string;
  current: number;
  startDate: string;
  isActive: boolean;
  reminders: boolean;
  reminderTime?: string; // HH:mm format
}

export interface HealthMetric {
  date: string;
  restingHeartRate?: number;
  weight?: number;
  bodyFatPercentage?: number;
  vo2Max?: number;
  sleepQuality?: number; // 1-10 scale
  energyLevel?: number; // 1-10 scale
  stressLevel?: number; // 1-10 scale
  hydration?: number; // liters
  meditation?: number; // minutes
}

class AnalyticsService {
  private static instance: AnalyticsService;
  private userStats: UserStats | null = null;
  private dailyProgress: Map<string, DailyProgress> = new Map();
  private achievements: Achievement[] = [];
  private challenges: Challenge[] = [];
  private goals: ProgressGoal[] = [];
  private healthMetrics: Map<string, HealthMetric> = new Map();

  private constructor() {
    this.initializeAchievements();
    this.initializeChallenges();
    this.loadUserData();
  }

  public static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  // Initialize predefined achievements
  private initializeAchievements(): void {
    this.achievements = [
      // Distance Achievements
      {
        id: 'first_step',
        name: 'First Steps',
        description: 'Complete your first pilgrimage walk',
        icon: '👣',
        category: 'distance',
        requirement: { type: 'single_walk', value: 100, unit: 'meters' },
        rarity: 'common',
        reward: { type: 'badge', value: 'Beginner Walker' },
      },
      {
        id: 'kilometer_walker',
        name: 'Kilometer Walker',
        description: 'Walk a total distance of 10 kilometers',
        icon: '🚶‍♂️',
        category: 'distance',
        requirement: { type: 'total_distance', value: 10000, unit: 'meters' },
        rarity: 'common',
      },
      {
        id: 'marathon_pilgrim',
        name: 'Marathon Pilgrim',
        description: 'Complete a 42km pilgrimage in a single journey',
        icon: '🏃‍♂️',
        category: 'distance',
        requirement: { type: 'single_walk', value: 42000, unit: 'meters' },
        rarity: 'epic',
        reward: { type: 'title', value: 'Marathon Pilgrim' },
      },
      
      // Frequency Achievements
      {
        id: 'daily_devotee',
        name: 'Daily Devotee',
        description: 'Walk for 7 consecutive days',
        icon: '📅',
        category: 'frequency',
        requirement: { type: 'consecutive_days', value: 7, unit: 'days' },
        rarity: 'uncommon',
      },
      {
        id: 'faithful_follower',
        name: 'Faithful Follower',
        description: 'Walk for 30 consecutive days',
        icon: '🙏',
        category: 'frequency',
        requirement: { type: 'consecutive_days', value: 30, unit: 'days' },
        rarity: 'rare',
        reward: { type: 'unlock', value: 'Premium Routes' },
      },
      {
        id: 'devoted_walker',
        name: 'Devoted Walker',
        description: 'Complete 100 pilgrimage walks',
        icon: '💯',
        category: 'frequency',
        requirement: { type: 'total_distance', value: 100, unit: 'walks' },
        rarity: 'epic',
      },

      // Speed Achievements
      {
        id: 'steady_pace',
        name: 'Steady Pace',
        description: 'Maintain an average speed of 5 km/h',
        icon: '⚡',
        category: 'speed',
        requirement: { type: 'speed_average', value: 5, unit: 'km/h' },
        rarity: 'uncommon',
      },

      // Elevation Achievements
      {
        id: 'hill_climber',
        name: 'Hill Climber',
        description: 'Gain 500 meters of elevation in a single walk',
        icon: '⛰️',
        category: 'elevation',
        requirement: { type: 'elevation_gain', value: 500, unit: 'meters' },
        rarity: 'rare',
      },

      // Exploration Achievements
      {
        id: 'route_explorer',
        name: 'Route Explorer',
        description: 'Complete 5 different pilgrimage routes',
        icon: '🗺️',
        category: 'exploration',
        requirement: { type: 'route_completion', value: 5, unit: 'routes' },
        rarity: 'uncommon',
      },

      // Spiritual Achievements
      {
        id: 'sunrise_seeker',
        name: 'Sunrise Seeker',
        description: 'Complete 10 walks during sunrise hours (5-7 AM)',
        icon: '🌅',
        category: 'spiritual',
        requirement: { type: 'total_distance', value: 10, unit: 'sunrise_walks' },
        rarity: 'rare',
      },
    ];
  }

  // Initialize predefined challenges
  private initializeChallenges(): void {
    const now = new Date();
    const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const yearStart = new Date(now.getFullYear(), 0, 1);

    this.challenges = [
      {
        id: 'weekly_distance',
        name: 'Weekly Distance Goal',
        description: 'Walk 20 kilometers this week',
        type: 'weekly',
        category: 'distance',
        target: 20000,
        unit: 'meters',
        startDate: weekStart.toISOString(),
        endDate: new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        progress: 0,
        participants: 127,
        reward: 'Spiritual Badge',
        isActive: true,
        isCompleted: false,
      },
      {
        id: 'monthly_walks',
        name: 'Monthly Devotion',
        description: 'Complete 15 walks this month',
        type: 'monthly',
        category: 'frequency',
        target: 15,
        unit: 'walks',
        startDate: monthStart.toISOString(),
        endDate: new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString(),
        progress: 0,
        participants: 89,
        reward: 'Devoted Pilgrim Title',
        isActive: true,
        isCompleted: false,
      },
      {
        id: 'seasonal_exploration',
        name: 'Seasonal Explorer',
        description: 'Visit 10 different temples this season',
        type: 'seasonal',
        category: 'exploration',
        target: 10,
        unit: 'temples',
        startDate: yearStart.toISOString(),
        endDate: new Date(now.getFullYear(), 11, 31).toISOString(),
        progress: 0,
        participants: 234,
        reward: 'Temple Explorer Badge',
        isActive: true,
        isCompleted: false,
      },
    ];
  }

  // Load user data from storage
  private async loadUserData(): Promise<void> {
    try {
      // Load user stats
      const statsData = await AsyncStorage.getItem('user_stats');
      if (statsData) {
        this.userStats = JSON.parse(statsData);
      } else {
        this.userStats = this.createDefaultUserStats();
        await this.saveUserStats();
      }

      // Load daily progress
      const progressData = await AsyncStorage.getItem('daily_progress');
      if (progressData) {
        const progressArray: DailyProgress[] = JSON.parse(progressData);
        progressArray.forEach(progress => {
          this.dailyProgress.set(progress.date, progress);
        });
      }

      // Load goals
      const goalsData = await AsyncStorage.getItem('progress_goals');
      if (goalsData) {
        this.goals = JSON.parse(goalsData);
      }

      // Load health metrics
      const healthData = await AsyncStorage.getItem('health_metrics');
      if (healthData) {
        const healthArray: HealthMetric[] = JSON.parse(healthData);
        healthArray.forEach(metric => {
          this.healthMetrics.set(metric.date, metric);
        });
      }

      // Update achievement progress
      this.updateAchievementProgress();
    } catch (error) {
      console.error('Failed to load user data:', error);
    }
  }

  private createDefaultUserStats(): UserStats {
    return {
      totalDistance: 0,
      totalDuration: 0,
      totalWalks: 0,
      totalElevationGain: 0,
      totalCalories: 0,
      totalSteps: 0,
      averageSpeed: 0,
      longestWalk: 0,
      fastestPace: 0,
      streakDays: 0,
      achievements: [],
      weeklyGoal: 10000, // 10km
      monthlyGoal: 50000, // 50km
      yearlyGoal: 500000, // 500km
    };
  }

  // Recording walks and updating statistics
  public async recordWalk(session: TrackingSession): Promise<void> {
    try {
      if (!this.userStats) return;

      const date = new Date(session.startTime).toISOString().split('T')[0];

      // Update user stats
      this.userStats.totalDistance += session.distance;
      this.userStats.totalDuration += session.duration;
      this.userStats.totalWalks += 1;
      this.userStats.totalElevationGain += session.elevationGain;
      this.userStats.totalCalories += session.calories || 0;
      this.userStats.totalSteps += session.steps || 0;
      this.userStats.lastWalkDate = date;
      
      if (!this.userStats.firstWalkDate) {
        this.userStats.firstWalkDate = date;
      }

      if (session.distance > this.userStats.longestWalk) {
        this.userStats.longestWalk = session.distance;
      }

      if (session.averageSpeed > this.userStats.fastestPace) {
        this.userStats.fastestPace = session.averageSpeed;
      }

      // Calculate overall average speed
      if (this.userStats.totalDuration > 0) {
        this.userStats.averageSpeed = (this.userStats.totalDistance / this.userStats.totalDuration) * 3.6;
      }

      // Update daily progress
      const existingProgress = this.dailyProgress.get(date) || {
        date,
        distance: 0,
        duration: 0,
        walks: 0,
        calories: 0,
        steps: 0,
        elevationGain: 0,
        routes: [],
      };

      existingProgress.distance += session.distance;
      existingProgress.duration += session.duration;
      existingProgress.walks += 1;
      existingProgress.calories += session.calories || 0;
      existingProgress.steps += session.steps || 0;
      existingProgress.elevationGain += session.elevationGain;

      if (session.routeId && !existingProgress.routes.includes(session.routeId)) {
        existingProgress.routes.push(session.routeId);
      }

      this.dailyProgress.set(date, existingProgress);

      // Update streak
      this.updateStreak();

      // Update challenge progress
      this.updateChallengeProgress(session);

      // Check for new achievements
      await this.checkAchievements();

      // Save all data
      await Promise.all([
        this.saveUserStats(),
        this.saveDailyProgress(),
        this.saveChallenges(),
      ]);

    } catch (error) {
      console.error('Failed to record walk:', error);
    }
  }

  private updateStreak(): void {
    if (!this.userStats) return;

    let streak = 0;
    const today = new Date();
    let currentDate = new Date(today);

    while (true) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const progress = this.dailyProgress.get(dateStr);
      
      if (progress && progress.walks > 0) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }

    this.userStats.streakDays = streak;
  }

  private updateChallengeProgress(session: TrackingSession): void {
    const now = new Date();

    this.challenges.forEach(challenge => {
      if (!challenge.isActive || challenge.isCompleted) return;
      
      const startDate = new Date(challenge.startDate);
      const endDate = new Date(challenge.endDate);
      
      if (now >= startDate && now <= endDate) {
        switch (challenge.category) {
          case 'distance':
            challenge.progress += session.distance;
            break;
          case 'frequency':
            challenge.progress += 1;
            break;
          case 'exploration':
            if (session.routeId) {
              // This would need more complex tracking of unique routes/temples
              challenge.progress += 1;
            }
            break;
        }

        if (challenge.progress >= challenge.target) {
          challenge.isCompleted = true;
          challenge.completedAt = now.toISOString();
        }
      }
    });
  }

  private async checkAchievements(): Promise<void> {
    if (!this.userStats) return;

    for (const achievement of this.achievements) {
      if (achievement.unlockedAt) continue; // Already unlocked

      let achieved = false;

      switch (achievement.requirement.type) {
        case 'total_distance':
          achieved = this.userStats.totalDistance >= achievement.requirement.value;
          break;
        case 'single_walk':
          achieved = this.userStats.longestWalk >= achievement.requirement.value;
          break;
        case 'consecutive_days':
          achieved = this.userStats.streakDays >= achievement.requirement.value;
          break;
        case 'speed_average':
          achieved = this.userStats.averageSpeed >= achievement.requirement.value;
          break;
        case 'elevation_gain':
          achieved = this.userStats.totalElevationGain >= achievement.requirement.value;
          break;
        case 'route_completion':
          // Count unique routes from daily progress
          const uniqueRoutes = new Set<string>();
          this.dailyProgress.forEach(progress => {
            progress.routes.forEach(route => uniqueRoutes.add(route));
          });
          achieved = uniqueRoutes.size >= achievement.requirement.value;
          break;
      }

      if (achieved) {
        achievement.unlockedAt = new Date().toISOString();
        this.userStats.achievements.push(achievement.id);
        
        // Show achievement notification
        console.log(`🏆 Achievement Unlocked: ${achievement.name}`);
      } else {
        // Update progress
        achievement.progress = this.calculateAchievementProgress(achievement);
      }
    }
  }

  private calculateAchievementProgress(achievement: Achievement): number {
    if (!this.userStats) return 0;

    let current = 0;
    const target = achievement.requirement.value;

    switch (achievement.requirement.type) {
      case 'total_distance':
        current = this.userStats.totalDistance;
        break;
      case 'single_walk':
        current = this.userStats.longestWalk;
        break;
      case 'consecutive_days':
        current = this.userStats.streakDays;
        break;
      case 'speed_average':
        current = this.userStats.averageSpeed;
        break;
      case 'elevation_gain':
        current = this.userStats.totalElevationGain;
        break;
      case 'route_completion':
        const uniqueRoutes = new Set<string>();
        this.dailyProgress.forEach(progress => {
          progress.routes.forEach(route => uniqueRoutes.add(route));
        });
        current = uniqueRoutes.size;
        break;
    }

    return Math.min(100, Math.round((current / target) * 100));
  }

  private updateAchievementProgress(): void {
    this.achievements.forEach(achievement => {
      if (!achievement.unlockedAt) {
        achievement.progress = this.calculateAchievementProgress(achievement);
      }
    });
  }

  // Analytics and insights
  public getWeeklyInsight(weekStart?: Date): WeeklyInsight {
    const start = weekStart || this.getWeekStart(new Date());
    const dates = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(start);
      date.setDate(date.getDate() + i);
      return date.toISOString().split('T')[0];
    });

    let totalDistance = 0;
    let totalDuration = 0;
    let totalWalks = 0;
    let bestDistance = 0;
    let bestDay = '';

    dates.forEach(date => {
      const progress = this.dailyProgress.get(date);
      if (progress) {
        totalDistance += progress.distance;
        totalDuration += progress.duration;
        totalWalks += progress.walks;

        if (progress.distance > bestDistance) {
          bestDistance = progress.distance;
          bestDay = date;
        }
      }
    });

    const averageSpeed = totalDuration > 0 ? (totalDistance / totalDuration) * 3.6 : 0;
    const goalProgress = this.userStats ? (totalDistance / this.userStats.weeklyGoal) * 100 : 0;

    return {
      weekStart: start.toISOString().split('T')[0],
      totalDistance,
      totalDuration,
      totalWalks,
      averageSpeed,
      goalProgress: Math.min(100, goalProgress),
      bestDay,
      improvementAreas: this.generateImprovementAreas(totalDistance, totalWalks, averageSpeed),
      accomplishments: this.generateAccomplishments(totalDistance, totalWalks, goalProgress),
      nextWeekSuggestions: this.generateWeeklySuggestions(totalDistance, totalWalks),
    };
  }

  public getMonthlyReport(month?: string): MonthlyReport {
    const targetMonth = month || new Date().toISOString().substring(0, 7);
    const [year, monthNum] = targetMonth.split('-').map(Number);
    
    let totalDistance = 0;
    let totalDuration = 0;
    let totalWalks = 0;
    const routeCounts = new Map<string, number>();
    let streakDays = 0;

    // Calculate stats for the month
    const daysInMonth = new Date(year, monthNum, 0).getDate();
    for (let day = 1; day <= daysInMonth; day++) {
      const date = `${targetMonth}-${day.toString().padStart(2, '0')}`;
      const progress = this.dailyProgress.get(date);
      
      if (progress) {
        totalDistance += progress.distance;
        totalDuration += progress.duration;
        totalWalks += progress.walks;

        progress.routes.forEach(routeId => {
          routeCounts.set(routeId, (routeCounts.get(routeId) || 0) + 1);
        });

        if (progress.walks > 0) {
          streakDays++;
        }
      }
    }

    const averageSpeed = totalDuration > 0 ? (totalDistance / totalDuration) * 3.6 : 0;
    const goalProgress = this.userStats ? (totalDistance / this.userStats.monthlyGoal) * 100 : 0;

    // Top routes
    const topRoutes = Array.from(routeCounts.entries())
      .map(([routeId, count]) => ({ routeId, count, name: `Route ${routeId}` }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      month: targetMonth,
      totalDistance,
      totalDuration,
      totalWalks,
      averageSpeed,
      goalProgress: Math.min(100, goalProgress),
      streakDays,
      topRoutes,
      challenges: this.getChallengesForPeriod(targetMonth),
      milestones: this.getMilestonesForPeriod(targetMonth),
      healthMetrics: this.calculateHealthMetrics(targetMonth),
    };
  }

  // Utility functions
  private getWeekStart(date: Date): Date {
    const start = new Date(date);
    start.setDate(date.getDate() - date.getDay());
    start.setHours(0, 0, 0, 0);
    return start;
  }

  private generateImprovementAreas(distance: number, walks: number, speed: number): string[] {
    const areas: string[] = [];
    
    if (walks < 3) {
      areas.push('Try to walk more frequently - aim for at least 3 walks per week');
    }
    if (speed < 4) {
      areas.push('Consider improving your walking pace for better fitness benefits');
    }
    if (distance < 10000) {
      areas.push('Gradually increase your weekly distance for enhanced endurance');
    }
    
    return areas;
  }

  private generateAccomplishments(distance: number, walks: number, goalProgress: number): string[] {
    const accomplishments: string[] = [];
    
    if (goalProgress >= 100) {
      accomplishments.push('🎉 Exceeded your weekly distance goal!');
    } else if (goalProgress >= 75) {
      accomplishments.push('💪 Great progress towards your weekly goal!');
    }
    
    if (walks >= 5) {
      accomplishments.push('🚶‍♂️ Excellent consistency with 5+ walks this week');
    }
    
    if (distance > 20000) {
      accomplishments.push('⭐ Impressive weekly distance - over 20km!');
    }
    
    return accomplishments;
  }

  private generateWeeklySuggestions(distance: number, walks: number): string[] {
    const suggestions: string[] = [];
    
    if (walks < 4) {
      suggestions.push('Try to add one more walk to your routine next week');
    }
    
    if (distance < 15000) {
      suggestions.push('Consider exploring a longer route to increase your distance');
    }
    
    suggestions.push('Mix different routes to keep your walks interesting');
    suggestions.push('Consider walking with a friend for motivation');
    
    return suggestions;
  }

  private getChallengesForPeriod(period: string): any[] {
    // This would return challenges specific to the period
    return this.challenges.filter(challenge => 
      challenge.startDate.startsWith(period) || challenge.endDate.startsWith(period)
    );
  }

  private getMilestonesForPeriod(period: string): any[] {
    // This would return milestones achieved in the period
    return [];
  }

  private calculateHealthMetrics(period: string): any {
    // Calculate health metrics for the period
    return {
      avgCaloriesPerWalk: 150,
      avgStepsPerWalk: 2500,
      fitnessImprovement: 5,
      enduranceScore: 75,
    };
  }

  // Getters
  public getUserStats(): UserStats | null {
    return this.userStats;
  }

  public getDailyProgress(date: string): DailyProgress | null {
    return this.dailyProgress.get(date) || null;
  }

  public getRecentProgress(days: number = 7): DailyProgress[] {
    const recent: DailyProgress[] = [];
    const today = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const progress = this.dailyProgress.get(dateStr);
      
      if (progress) {
        recent.push(progress);
      } else {
        recent.push({
          date: dateStr,
          distance: 0,
          duration: 0,
          walks: 0,
          calories: 0,
          steps: 0,
          elevationGain: 0,
          routes: [],
        });
      }
    }
    
    return recent;
  }

  public getAchievements(): Achievement[] {
    return this.achievements;
  }

  public getUnlockedAchievements(): Achievement[] {
    return this.achievements.filter(a => a.unlockedAt);
  }

  public getProgressAchievements(): Achievement[] {
    return this.achievements.filter(a => !a.unlockedAt && (a.progress || 0) > 0);
  }

  public getChallenges(): Challenge[] {
    return this.challenges;
  }

  public getActiveChallenges(): Challenge[] {
    return this.challenges.filter(c => c.isActive && !c.isCompleted);
  }

  public getGoals(): ProgressGoal[] {
    return this.goals;
  }

  // Storage functions
  private async saveUserStats(): Promise<void> {
    if (this.userStats) {
      await AsyncStorage.setItem('user_stats', JSON.stringify(this.userStats));
    }
  }

  private async saveDailyProgress(): Promise<void> {
    const progressArray = Array.from(this.dailyProgress.values());
    await AsyncStorage.setItem('daily_progress', JSON.stringify(progressArray));
  }

  private async saveChallenges(): Promise<void> {
    await AsyncStorage.setItem('challenges', JSON.stringify(this.challenges));
  }

  // Goal management
  public async setGoal(goal: Omit<ProgressGoal, 'id' | 'current'>): Promise<void> {
    const newGoal: ProgressGoal = {
      ...goal,
      id: Date.now().toString(),
      current: 0,
    };
    
    this.goals.push(newGoal);
    await AsyncStorage.setItem('progress_goals', JSON.stringify(this.goals));
  }

  public async updateGoalProgress(): Promise<void> {
    if (!this.userStats) return;

    this.goals.forEach(goal => {
      if (!goal.isActive) return;

      const now = new Date();
      const startDate = new Date(goal.startDate);
      
      switch (goal.type) {
        case 'distance':
          if (goal.period === 'daily') {
            const today = now.toISOString().split('T')[0];
            const todayProgress = this.dailyProgress.get(today);
            goal.current = todayProgress?.distance || 0;
          } else if (goal.period === 'weekly') {
            const weekStart = this.getWeekStart(now);
            const weekInsight = this.getWeeklyInsight(weekStart);
            goal.current = weekInsight.totalDistance;
          }
          // Add other periods as needed
          break;
      }
    });

    await AsyncStorage.setItem('progress_goals', JSON.stringify(this.goals));
  }

  // Health metrics
  public async recordHealthMetric(date: string, metric: Partial<HealthMetric>): Promise<void> {
    const existing = this.healthMetrics.get(date) || { date };
    const updated = { ...existing, ...metric };
    
    this.healthMetrics.set(date, updated);
    
    const metricsArray = Array.from(this.healthMetrics.values());
    await AsyncStorage.setItem('health_metrics', JSON.stringify(metricsArray));
  }

  public getHealthMetric(date: string): HealthMetric | null {
    return this.healthMetrics.get(date) || null;
  }
}

export default AnalyticsService.getInstance();