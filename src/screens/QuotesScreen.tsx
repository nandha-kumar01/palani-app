import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator, Share, Platform } from 'react-native';
import { LinearGradient } from '../components/WebLinearGradient';
import { colors, fonts, spacing } from '../utils/theme';
import { apiHelper } from '../utils/apiHelper';
import { apiService } from '../services/api';
import { quotesData } from '../data/mockData';
import { useLanguage } from '../context/LanguageContext';

interface Quote {
  _id: string;
  text: string;
  author: string;
  category: string;
  language: string;
  tags?: string[];
  isActive: boolean;
  createdAt: string;
}

interface QuotesScreenProps {
  navigation: any;
}

export default function QuotesScreen({ navigation }: QuotesScreenProps) {
  const { language } = useLanguage();
  const [allQuotes, setAllQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const quotes = allQuotes.filter(quote => {
    const quoteLang = quote.language.toLowerCase();
    if (language === 'ta') {
      return quoteLang === 'tamil' || quoteLang === 'ta';
    } else {
      return quoteLang === 'english' || quoteLang === 'en';
    }
  });

  console.log('🔍 Total quotes:', allQuotes.length);
  console.log('🌐 Current language:', language);
  console.log('✨ Filtered quotes:', quotes.length);
  if (quotes.length > 0) {
    console.log('📄 First quote:', quotes[0].text.substring(0, 50));
  }

  const fetchQuotes = async () => {
    try {
      setLoading(true);
      // Prefer apiService (adds admin token)
      const response = await apiService.getQuotes(1, 200);
      console.log('📝 Quotes API Response:', JSON.stringify(response).substring(0, 300));

      let quotesArray: any[] = [];
      if (Array.isArray(response)) {
        quotesArray = response;
      } else if (response.quotes && Array.isArray(response.quotes)) {
        quotesArray = response.quotes;
      } else if (response.data && Array.isArray(response.data)) {
        quotesArray = response.data;
      } else if (response.data && response.data.quotes && Array.isArray(response.data.quotes)) {
        quotesArray = response.data.quotes;
      } else if (response.result && Array.isArray(response.result)) {
        quotesArray = response.result;
      }

      if (!quotesArray || quotesArray.length === 0) {
        console.warn('No quotes returned from API, falling back to local mockData');
        // Map mockData to expected shape
        quotesArray = quotesData.map((q) => ({
          _id: q.id || String(Math.random()),
          text: q.text,
          author: q.author,
          category: q.category || 'general',
          language: q.language,
          isActive: true,
          createdAt: new Date().toISOString(),
        }));
      }

      setAllQuotes(quotesArray || []);
      setCurrentIndex(0);
    } catch (error) {
      console.error('❌ Error fetching quotes:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchQuotes();
  }, []);

  useEffect(() => {
    setCurrentIndex(0);
  }, [language]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchQuotes();
  };

  const handleNext = () => {
    setCurrentIndex(prev => (prev + 1) % quotes.length);
  };

  const handlePrevious = () => {
    setCurrentIndex(prev => (prev - 1 + quotes.length) % quotes.length);
  };

  const handleShare = async () => {
    const currentQuote = quotes[currentIndex];
    if (currentQuote) {
      try {
        await Share.share({ message: `"${currentQuote.text}"\n\n- ${currentQuote.author}` });
      } catch (error) {
        console.error('Error sharing quote:', error);
      }
    }
  };

  const currentQuote = quotes[currentIndex];

  if (loading) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={[colors.primary.start, colors.primary.end]} style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{language === 'ta' ? '🌟 முருகன் மேற்கோள்கள்' : '🌟 Murugan Quotes'}</Text>
        </LinearGradient>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary.start} />
          <Text style={styles.loadingText}>{language === 'ta' ? 'மேற்கோள்களை ஏற்றுகிறது...' : 'Loading quotes...'}</Text>
        </View>
      </View>
    );
  }

  if (!currentQuote || quotes.length === 0) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={[colors.primary.start, colors.primary.end]} style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{language === 'ta' ? '🌟 முருகன் மேற்கோள்கள்' : '🌟 Murugan Quotes'}</Text>
        </LinearGradient>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📝</Text>
          <Text style={styles.emptyText}>
            {language === 'ta' ? 'இந்த மொழியில் மேற்கோள்கள் இல்லை' : 'No quotes available in this language'}
          </Text>
          <Text style={styles.emptySubText}>
            Total quotes in DB: {allQuotes.length} | Language: {language}
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
        <Text style={styles.headerTitle}>{language === 'ta' ? '🌟 முருகன் மேற்கோள்கள்' : '🌟 Murugan Quotes'}</Text>
      </LinearGradient>
      <View style={styles.content}>
        <View style={styles.contentContainer}>
          <View style={styles.quoteCard}>
          <LinearGradient colors={['#FFF5E6', '#FFFFFF']} style={styles.quoteGradient}>
            <View style={styles.quoteIconContainer}><Text style={styles.leftQuote}>"</Text></View>
            <Text style={styles.quoteText}>{currentQuote.text}</Text>
            <View style={styles.authorContainer}>
              <View style={styles.authorLine} />
              <Text style={styles.authorText}>{currentQuote.author}</Text>
            </View>
            {currentQuote.category && (<View style={styles.categoryBadge}><Text style={styles.categoryText}>📚 {currentQuote.category}</Text></View>)}
            <View style={styles.quoteIconContainerRight}><Text style={styles.rightQuote}>"</Text></View>
          </LinearGradient>
        </View>
        <View style={styles.controlsContainer}>
          <View style={styles.navigationRow}>
            <TouchableOpacity style={styles.navButton} onPress={handlePrevious}><Text style={styles.navButtonText}>←</Text></TouchableOpacity>
            <View style={styles.counterContainer}>
              <Text style={styles.counterText}>{currentIndex + 1}</Text>
              <Text style={styles.counterDivider}>/</Text>
              <Text style={styles.counterTotal}>{quotes.length}</Text>
            </View>
            <TouchableOpacity style={styles.navButton} onPress={handleNext}><Text style={styles.navButtonText}>→</Text></TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
            <Text style={styles.shareButtonText}>{language === 'ta' ? '📤 பகிர்' : '📤 Share'}</Text>
          </TouchableOpacity>
        </View>
          <View style={styles.quoteListContainer}>
            <Text style={styles.listTitle}>{language === 'ta' ? 'மற்ற மேற்கோள்கள்' : 'Other Quotes'}</Text>
            <ScrollView style={styles.quoteListScroll} showsVerticalScrollIndicator={false}>
              <View style={styles.quoteList}>
                {quotes.map((quote, index) => (
                  <TouchableOpacity 
                    key={quote._id} 
                    style={[styles.listItem, index === currentIndex && styles.listItemActive]} 
                    onPress={() => setCurrentIndex(index)}
                  >
                    <View style={styles.listItemLeft}>
                      <View style={[styles.listItemNumber, index === currentIndex && styles.listItemNumberActive]}>
                        <Text style={[styles.listItemNumberText, index === currentIndex && styles.listItemNumberTextActive]}>
                          {index + 1}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.listItemContent}>
                      <Text style={styles.listItemText} numberOfLines={2}>{quote.text}</Text>
                      <Text style={styles.listItemAuthor} numberOfLines={1}>- {quote.author}</Text>
                    </View>
                    {index === currentIndex && (
                      <View style={styles.listItemCheck}>
                        <Text style={styles.listItemCheckText}>✓</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { paddingTop: Platform.OS === 'ios' ? 50 : 40, paddingHorizontal: spacing.lg, paddingBottom: spacing.lg, flexDirection: 'row', alignItems: 'center' },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255, 255, 255, 0.25)', justifyContent: 'center', alignItems: 'center', marginRight: spacing.md },
  backButtonText: { fontSize: 24, color: '#fff', marginLeft: -2 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#fff', flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: spacing.md, fontSize: 16, color: colors.gray.medium },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.xl },
  emptyIcon: { fontSize: 60, marginBottom: spacing.lg },
  emptyText: { fontSize: 18, color: colors.gray.medium, textAlign: 'center' },
  emptySubText: { fontSize: 14, color: colors.gray.medium, textAlign: 'center', marginTop: spacing.md },
  content: { flex: 1 },
  contentContainer: { padding: spacing.lg, flex: 1 },
  quoteCard: { borderRadius: 20, overflow: 'hidden', marginBottom: spacing.xl, ...Platform.select({ ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12 }, android: { elevation: 6 } }) },
  quoteGradient: { padding: spacing.xl, paddingTop: spacing.xl * 1.5, paddingBottom: spacing.xl * 1.5, position: 'relative' },
  quoteIconContainer: { position: 'absolute', top: 10, left: 10 },
  leftQuote: { fontSize: 80, color: colors.primary.start, opacity: 0.2, fontWeight: '700', lineHeight: 80 },
  quoteText: { fontSize: 20, lineHeight: 32, color: colors.gray.dark, textAlign: 'center', fontWeight: '500', marginBottom: spacing.xl, fontStyle: 'italic' },
  authorContainer: { alignItems: 'center', marginTop: spacing.md },
  authorLine: { width: 60, height: 3, backgroundColor: colors.primary.start, borderRadius: 2, marginBottom: spacing.sm },
  authorText: { fontSize: 16, color: colors.primary.start, fontWeight: '700' },
  categoryBadge: { alignSelf: 'center', backgroundColor: 'rgba(255, 140, 0, 0.1)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginTop: spacing.md, borderWidth: 1, borderColor: 'rgba(255, 140, 0, 0.3)' },
  categoryText: { fontSize: 13, color: colors.primary.start, fontWeight: '600' },
  quoteIconContainerRight: { position: 'absolute', bottom: 10, right: 10 },
  rightQuote: { fontSize: 80, color: colors.primary.start, opacity: 0.2, fontWeight: '700', lineHeight: 80 },
  controlsContainer: { marginBottom: spacing.xl },
  navigationRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md },
  navButton: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', marginHorizontal: spacing.md, ...Platform.select({ ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 }, android: { elevation: 3 } }) },
  navButtonText: { fontSize: 28, color: colors.primary.start, fontWeight: '700' },
  counterContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderRadius: 20, ...Platform.select({ ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 }, android: { elevation: 2 } }) },
  counterText: { fontSize: 20, fontWeight: '700', color: colors.primary.start },
  counterDivider: { fontSize: 16, color: colors.gray.medium, marginHorizontal: spacing.xs },
  counterTotal: { fontSize: 16, color: colors.gray.medium, fontWeight: '600' },
  shareButton: { backgroundColor: colors.primary.start, paddingVertical: 14, borderRadius: 12, alignItems: 'center', ...Platform.select({ ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4 }, android: { elevation: 4 } }) },
  shareButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  quoteListContainer: { flex: 1, marginBottom: spacing.xl },
  listTitle: { fontSize: 18, fontWeight: '700', color: colors.gray.dark, marginBottom: spacing.md },
  quoteListScroll: { flex: 1 },
  quoteList: { backgroundColor: '#fff', borderRadius: 12, overflow: 'hidden', ...Platform.select({ ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4 }, android: { elevation: 2 } }) },
  listItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.md, paddingHorizontal: spacing.md, borderBottomWidth: 1, borderBottomColor: '#f0f0f0', backgroundColor: '#fff' },
  listItemActive: { backgroundColor: '#FFF5E6', borderLeftWidth: 3, borderLeftColor: colors.primary.start },
  listItemLeft: { marginRight: spacing.md },
  listItemNumber: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center' },
  listItemNumberActive: { backgroundColor: colors.primary.start },
  listItemNumberText: { fontSize: 14, fontWeight: '700', color: colors.gray.medium },
  listItemNumberTextActive: { color: '#fff' },
  listItemContent: { flex: 1, paddingRight: spacing.sm },
  listItemText: { fontSize: 14, color: colors.gray.dark, lineHeight: 20, marginBottom: 4, fontStyle: 'italic' },
  listItemAuthor: { fontSize: 12, color: colors.primary.start, fontWeight: '600' },
  listItemCheck: { width: 24, height: 24, borderRadius: 12, backgroundColor: colors.primary.start, justifyContent: 'center', alignItems: 'center', marginLeft: spacing.sm },
  listItemCheckText: { color: '#fff', fontSize: 12, fontWeight: '700' },
});
