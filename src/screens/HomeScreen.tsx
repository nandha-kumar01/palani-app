import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "../components/WebLinearGradient";
import BottomNavigation from "../components/BottomNavigation";
import { useApp } from "../context/AppContext";
import { useLanguage } from "../context/LanguageContext";
import { quotesData } from "../data/mockData";
import { getRandomQuote } from "../utils/helpers";

export default function HomeScreen({ navigation }: any) {
  const { user } = useApp();
  const { language, t } = useLanguage();
  const [dailyQuote, setDailyQuote] = useState(
    getRandomQuote(quotesData, language === "ta" ? "tamil" : "english")
  );
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    setGreeting(getGreeting());
    setDailyQuote(
      getRandomQuote(quotesData, language === "ta" ? "tamil" : "english")
    );
  }, [language, user]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t("goodMorning");
    if (hour < 17) return t("goodAfternoon");
    return t("goodEvening");
  };

  const quickAccessItems = [
    { id: "music", title: t("music"), icon: "🎵", screen: "Music" },
    { id: "gallery", title: t("gallery"), icon: "📷", screen: "Gallery" },
    { id: "madangal", title: t("madangal"), icon: "🏕️", screen: "Madangal" },
    { id: "annadhanam", title: t("annadhanam"), icon: "🍽️", screen: "Annadhanam" },
    { id: "quotes", title: t("quotes"), icon: "💭", screen: "Quotes" },
    { id: "temple", title: t("temple"), icon: "🏛️", screen: "Temple" },
  ];

  const handleMusicPress = () => {
    navigation.navigate("Music");
  };

  const handleTemplePress = () => {
    navigation.navigate("Temple");
  };

  const devAccessItems = [
    { id: "navtest", title: "Navigation Test", icon: "⚡", screen: "NavigationTest" },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* ---- Modern Clean Header ---- */}
      <View style={styles.headerContainer}>
        <View style={styles.leftHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.name ? user.name.charAt(0).toUpperCase() : '🙏'}
            </Text>
          </View>
          <View>
            <Text style={styles.welcomeText}>Welcome 👋</Text>
            <Text style={styles.userName}>
              {user?.name || t("devotee")}
            </Text>
          </View>
        </View>

        <View style={styles.rightHeader}>
          <TouchableOpacity>
            <Ionicons name="search-outline" size={24} color="#1f2937" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.bellWrapper}>
            <Ionicons name="notifications-outline" size={24} color="#1f2937" />
            <View style={styles.dot} />
          </TouchableOpacity>
        </View>
      </View>


      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Action Buttons */}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.actionCardSmall}
            onPress={() => navigation.navigate("LiveTracking")}
          >
            <Text style={styles.actionIconSmall}>🚶‍♂️</Text>
            <Text style={styles.actionTitleSmall}>{t("startJourney")}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCardSmall}
            onPress={() => navigation.navigate("GroupWalk")}
          >
            <Text style={styles.actionIconSmall}>👥</Text>
            <Text style={styles.actionTitleSmall}>{t("joinGroup")}</Text>
          </TouchableOpacity>
        </View>

      

        {/* Features */}
        <Text style={styles.sectionTitle}>{t("exploreFeaturesTitle")}</Text>
        <View style={styles.featuresGrid}>
          {quickAccessItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.featureCard}
              onPress={() => {
                if (item.id === "music") {
                  handleMusicPress();
                } else if (item.id === "temple") {
                  handleTemplePress();
                } else {
                  console.log(`🎵 Navigating to: ${item.screen}`);
                  navigation.navigate(item.screen);
                }
              }}
            >
              <Text style={styles.featureIcon}>{item.icon}</Text>
              <Text style={styles.featureText}>{item.title}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Quote */}
        <TouchableOpacity 
          style={styles.quoteCard}
          onPress={() => navigation.navigate("Quotes")}
        >
          <Text style={styles.quoteEmoji}>💬</Text>
          <Text style={styles.quoteText}>{dailyQuote?.text}</Text>
          <Text style={styles.quoteAuthor}>– {dailyQuote?.author}</Text>
        </TouchableOpacity>
      </ScrollView>

      <BottomNavigation navigation={navigation} activeTab="home" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },

  // ---- Header ----
  headerContainer: {
    backgroundColor: "#fff",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 10,
    elevation: 3,
  },
  leftHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 10,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  welcomeText: {
    fontSize: 13,
    color: "#6b7280",
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  rightHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  bellWrapper: { position: "relative" },
  dot: {
    position: "absolute",
    right: 0,
    top: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ef4444",
  },

  // ---- Greeting Box ----
  greetingBox: {
    marginTop: 5,
    paddingVertical: 35,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  greetingText: {
    fontSize: 22,
    color: "#fff",
    fontWeight: "700",
    marginBottom: 6,
  },
  subText: { color: "#f5f5f5", fontSize: 15 },

  // ---- Body ----
  scrollContent: {
    padding: 20,
    paddingBottom: 120,
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  actionCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    marginHorizontal: 5,
    paddingVertical: 25,
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
  },
  actionCardSmall: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    marginHorizontal: 5,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
  },
  actionIcon: { fontSize: 32, marginBottom: 5 },
  actionIconSmall: { fontSize: 26, marginBottom: 4 },
  actionTitle: {
    fontSize: 16,
    color: "#333",
    fontWeight: "600",
  },
  actionTitleSmall: {
    fontSize: 14,
    color: "#333",
    fontWeight: "600",
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 15,
    marginTop: 10,
  },
  featuresGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  featureCard: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 20,
    alignItems: "center",
    marginBottom: 15,
    elevation: 2,
  },
  featureIcon: { fontSize: 24, marginBottom: 8 },
  featureText: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  quoteCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginTop: 20,
    alignItems: "center",
    elevation: 2,
  },
  quoteEmoji: { fontSize: 28, marginBottom: 10 },
  quoteText: {
    fontSize: 15,
    color: "#444",
    fontStyle: "italic",
    textAlign: "center",
    marginBottom: 10,
  },
  quoteAuthor: {
    fontSize: 13,
    color: "#777",
  },
});
