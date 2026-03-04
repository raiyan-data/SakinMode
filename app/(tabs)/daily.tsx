import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  Share,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "@/constants/colors";
import { useTheme } from "@/context/ThemeContext";
import { useApp } from "@/context/AppContext";
import {
  getTodayContent,
  getTodayState,
  saveTodayState,
  TodayContent,
  TodayState,
} from "@/services/dailyRotationService";

const ACTION_ICONS: Record<string, string> = {
  prayer: "hand-left-outline",
  charity: "heart-outline",
  knowledge: "book-outline",
  character: "sparkles-outline",
  community: "people-outline",
};

const ACTION_COLORS: Record<string, string> = {
  prayer: Colors.tealLight,
  charity: Colors.gold,
  knowledge: "#7C9FE0",
  character: Colors.success,
  community: "#D08CFA",
};

function AyahSection({
  content,
  todayState,
  onReflect,
}: {
  content: TodayContent;
  todayState: TodayState;
  onReflect: () => void;
}) {
  const handleReflect = () => {
    if (todayState.reflected) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onReflect();
  };

  return (
    <Animated.View entering={FadeInDown.delay(100).duration(500)}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionBadge}>
          <Ionicons name="book" size={14} color={Colors.tealLight} />
          <Text style={styles.sectionBadgeText}>Today's Ayah</Text>
        </View>
      </View>
      <LinearGradient
        colors={[Colors.tealMuted, Colors.navyMid]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.ayahCard}
      >
        <Text style={styles.arabicText}>{content.ayah.arabic}</Text>
        <View style={styles.ayahDivider} />
        <Text style={styles.translationText}>"{content.ayah.ayah}"</Text>
        <Text style={styles.sourceText}>
          {content.ayah.surah} ({content.ayah.verse})
        </Text>
      </LinearGradient>
      <View style={styles.reflectionCard}>
        <View style={styles.reflectionHeader}>
          <Ionicons name="leaf-outline" size={14} color={Colors.success} />
          <Text style={styles.reflectionLabel}>Reflection</Text>
        </View>
        <Text style={styles.reflectionText}>{content.ayah.reflection}</Text>
      </View>
      <Pressable
        style={[
          styles.reflectBtn,
          todayState.reflected && styles.reflectBtnDone,
        ]}
        onPress={handleReflect}
        disabled={todayState.reflected}
      >
        <Ionicons
          name={todayState.reflected ? "checkmark-circle" : "sparkles"}
          size={18}
          color={todayState.reflected ? Colors.success : Colors.textPrimary}
        />
        <Text
          style={[
            styles.reflectBtnText,
            todayState.reflected && styles.reflectBtnTextDone,
          ]}
        >
          {todayState.reflected ? "Reflected" : "I Reflected Today"}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

function ActionSection({
  content,
  todayState,
  onComplete,
}: {
  content: TodayContent;
  todayState: TodayState;
  onComplete: () => void;
}) {
  const cat = content.action.category;
  const iconName = ACTION_ICONS[cat] || "star-outline";
  const accentColor = ACTION_COLORS[cat] || Colors.teal;

  const handleComplete = () => {
    if (todayState.actionCompleted) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onComplete();
  };

  return (
    <Animated.View entering={FadeInDown.delay(200).duration(500)}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionBadge}>
          <Ionicons name="flash" size={14} color={Colors.gold} />
          <Text style={[styles.sectionBadgeText, { color: Colors.gold }]}>
            Today's Action
          </Text>
        </View>
        {todayState.actionStreak > 0 && (
          <View style={styles.streakPill}>
            <Ionicons name="flame" size={12} color={Colors.gold} />
            <Text style={styles.streakPillText}>
              {todayState.actionStreak}
            </Text>
          </View>
        )}
      </View>
      <View style={[styles.actionCard, { borderColor: accentColor + "44" }]}>
        <View
          style={[
            styles.actionIconWrap,
            { backgroundColor: accentColor + "22" },
          ]}
        >
          <Ionicons name={iconName as any} size={22} color={accentColor} />
        </View>
        <Text style={styles.actionText}>{content.action.action}</Text>
        <Text style={styles.actionCategory}>
          {cat.charAt(0).toUpperCase() + cat.slice(1)}
        </Text>
        <Pressable
          style={[
            styles.actionBtn,
            todayState.actionCompleted && styles.actionBtnDone,
            {
              borderColor: todayState.actionCompleted
                ? Colors.success + "55"
                : accentColor + "55",
            },
          ]}
          onPress={handleComplete}
          disabled={todayState.actionCompleted}
        >
          <Ionicons
            name={
              todayState.actionCompleted
                ? "checkmark-circle"
                : "checkmark-circle-outline"
            }
            size={18}
            color={
              todayState.actionCompleted ? Colors.success : accentColor
            }
          />
          <Text
            style={[
              styles.actionBtnText,
              {
                color: todayState.actionCompleted
                  ? Colors.success
                  : accentColor,
              },
            ]}
          >
            {todayState.actionCompleted ? "Completed" : "Mark Complete"}
          </Text>
        </Pressable>
      </View>
    </Animated.View>
  );
}

function HadithSection({
  content,
  todayState,
  onSave,
}: {
  content: TodayContent;
  todayState: TodayState;
  onSave: () => void;
}) {
  const handleShare = async () => {
    Haptics.selectionAsync();
    try {
      await Share.share({
        message: `"${content.hadith.hadith}" — ${content.hadith.source}\n\nShared from SalahLock`,
      });
    } catch {}
  };

  const handleSave = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSave();
  };

  return (
    <Animated.View entering={FadeInDown.delay(300).duration(500)}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionBadge}>
          <Ionicons
            name="chatbubble-ellipses"
            size={14}
            color="#D08CFA"
          />
          <Text style={[styles.sectionBadgeText, { color: "#D08CFA" }]}>
            Today's Hadith
          </Text>
        </View>
      </View>
      <LinearGradient
        colors={["#2A1A3E", Colors.navyMid]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.hadithCard}
      >
        <Text style={styles.hadithText}>"{content.hadith.hadith}"</Text>
        <Text style={styles.hadithSource}>
          — {content.hadith.source}
        </Text>
      </LinearGradient>
      <View style={styles.reflectionCard}>
        <View style={styles.reflectionHeader}>
          <Ionicons name="leaf-outline" size={14} color={Colors.success} />
          <Text style={styles.reflectionLabel}>Reflection</Text>
        </View>
        <Text style={styles.reflectionText}>
          {content.hadith.reflection}
        </Text>
      </View>
      <View style={styles.hadithActions}>
        <Pressable
          style={[
            styles.hadithActionBtn,
            todayState.hadithSaved && styles.hadithActionBtnActive,
          ]}
          onPress={handleSave}
        >
          <Ionicons
            name={todayState.hadithSaved ? "bookmark" : "bookmark-outline"}
            size={16}
            color={
              todayState.hadithSaved ? Colors.gold : Colors.textSecondary
            }
          />
          <Text
            style={[
              styles.hadithActionText,
              todayState.hadithSaved && { color: Colors.gold },
            ]}
          >
            {todayState.hadithSaved ? "Saved" : "Save"}
          </Text>
        </Pressable>
        <Pressable style={styles.hadithActionBtn} onPress={handleShare}>
          <Ionicons
            name="share-outline"
            size={16}
            color={Colors.textSecondary}
          />
          <Text style={styles.hadithActionText}>Share</Text>
        </Pressable>
      </View>
    </Animated.View>
  );
}

function ProgressModule({
  todayState,
  weeklyPct,
}: {
  todayState: TodayState;
  weeklyPct: number;
}) {
  return (
    <Animated.View entering={FadeInDown.delay(400).duration(500)}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionBadge}>
          <Ionicons name="trending-up" size={14} color={Colors.success} />
          <Text style={[styles.sectionBadgeText, { color: Colors.success }]}>
            Your Progress
          </Text>
        </View>
      </View>
      <View style={styles.progressGrid}>
        <View style={styles.progressItem}>
          <Ionicons name="flame" size={20} color={Colors.gold} />
          <Text style={[styles.progressValue, { color: Colors.gold }]}>
            {todayState.actionStreak}
          </Text>
          <Text style={styles.progressLabel}>Day Streak</Text>
        </View>
        <View style={[styles.progressItem, styles.progressItemMid]}>
          <Ionicons
            name="analytics"
            size={20}
            color={weeklyPct >= 80 ? Colors.success : Colors.tealLight}
          />
          <Text
            style={[
              styles.progressValue,
              {
                color:
                  weeklyPct >= 80 ? Colors.success : Colors.tealLight,
              },
            ]}
          >
            {weeklyPct}%
          </Text>
          <Text style={styles.progressLabel}>Weekly</Text>
        </View>
        <View style={styles.progressItem}>
          <Ionicons name="sparkles" size={20} color="#D08CFA" />
          <Text style={[styles.progressValue, { color: "#D08CFA" }]}>
            {todayState.totalReflections}
          </Text>
          <Text style={styles.progressLabel}>Reflections</Text>
        </View>
      </View>
    </Animated.View>
  );
}

function CommunityPulse() {
  const base = 2847;
  const dayOffset =
    Math.floor(
      (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) /
        86400000
    ) * 17;
  const count = base + (dayOffset % 1200);

  return (
    <Animated.View
      entering={FadeInDown.delay(500).duration(500)}
      style={styles.communityCard}
    >
      <View style={styles.communityRow}>
        <View style={styles.communityDot} />
        <Text style={styles.communityText}>
          {count.toLocaleString()} Muslims reflected today
        </Text>
      </View>
      <Text style={styles.communitySubtext}>
        You are never alone on this path
      </Text>
    </Animated.View>
  );
}

export default function DailyScreen() {
  const insets = useSafeAreaInsets();
  const { allRecords } = useApp();
  const { colors } = useTheme();
  const [content, setContent] = useState<TodayContent | null>(null);
  const [todayState, setTodayState] = useState<TodayState | null>(null);
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : 0;

  useEffect(() => {
    (async () => {
      const [c, s] = await Promise.all([getTodayContent(), getTodayState()]);
      setContent(c);
      setTodayState(s);
    })();
  }, []);

  const weeklyPct = React.useMemo(() => {
    const last7 = allRecords.slice(0, 7);
    if (last7.length === 0) return 0;
    const prayed = last7.reduce(
      (sum, r) => sum + Object.values(r.prayers).filter(Boolean).length,
      0
    );
    return Math.round((prayed / (last7.length * 5)) * 100);
  }, [allRecords]);

  const onReflect = useCallback(async () => {
    if (!todayState) return;
    const updated: TodayState = {
      ...todayState,
      reflected: true,
      totalReflections: todayState.totalReflections + 1,
    };
    setTodayState(updated);
    await saveTodayState(updated);
  }, [todayState]);

  const onActionComplete = useCallback(async () => {
    if (!todayState) return;
    const today = todayState.date;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yKey = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, "0")}-${String(yesterday.getDate()).padStart(2, "0")}`;
    const streakBase =
      todayState.lastActionDate === yKey ? todayState.actionStreak : 0;
    const updated: TodayState = {
      ...todayState,
      actionCompleted: true,
      actionStreak: streakBase + 1,
      lastActionDate: today,
    };
    setTodayState(updated);
    await saveTodayState(updated);
  }, [todayState]);

  const onSaveHadith = useCallback(async () => {
    if (!todayState) return;
    const updated: TodayState = {
      ...todayState,
      hadithSaved: !todayState.hadithSaved,
    };
    setTodayState(updated);
    await saveTodayState(updated);
  }, [todayState]);

  if (!content || !todayState) {
    return (
      <View style={[styles.container, { paddingTop: topPad, backgroundColor: colors.navy }]}>
        <View style={styles.loadingWrap}>
          <Ionicons name="book" size={32} color={Colors.textMuted} />
          <Text style={styles.loadingText}>
            Preparing your daily wisdom...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: topPad, backgroundColor: colors.navy }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: botPad + 120,
          paddingHorizontal: 20,
        }}
      >
        <Animated.View entering={FadeIn.duration(400)} style={styles.header}>
          <Text style={styles.title}>Today</Text>
          <Text style={styles.subtitle}>
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </Text>
        </Animated.View>

        <AyahSection
          content={content}
          todayState={todayState}
          onReflect={onReflect}
        />

        <ActionSection
          content={content}
          todayState={todayState}
          onComplete={onActionComplete}
        />

        <HadithSection
          content={content}
          todayState={todayState}
          onSave={onSaveHadith}
        />

        <ProgressModule todayState={todayState} weeklyPct={weeklyPct} />

        <CommunityPulse />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.navy },
  loadingWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: Colors.textMuted,
  },
  header: { paddingTop: 12, paddingBottom: 16 },
  title: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
    marginTop: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 20,
    marginBottom: 10,
  },
  sectionBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  sectionBadgeText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    color: Colors.tealLight,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  streakPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.goldMuted + "33",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.goldMuted + "66",
  },
  streakPillText: {
    fontSize: 12,
    fontFamily: "Inter_700Bold",
    color: Colors.gold,
  },
  ayahCard: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 12,
  },
  arabicText: {
    fontSize: 22,
    color: Colors.gold,
    textAlign: "right",
    lineHeight: 38,
    marginBottom: 12,
    fontWeight: "400" as const,
  },
  ayahDivider: {
    height: 1,
    backgroundColor: Colors.textMuted + "33",
    marginBottom: 12,
  },
  translationText: {
    fontSize: 17,
    fontFamily: "Inter_500Medium",
    color: Colors.textPrimary,
    lineHeight: 26,
    fontStyle: "italic",
  },
  sourceText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
    marginTop: 10,
  },
  reflectionCard: {
    backgroundColor: Colors.navyLight,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.separator,
    marginBottom: 12,
  },
  reflectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  reflectionLabel: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    color: Colors.success,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  reflectionText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  reflectBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.tealMuted,
    borderRadius: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: Colors.teal,
  },
  reflectBtnDone: {
    backgroundColor: Colors.success + "15",
    borderColor: Colors.success + "55",
  },
  reflectBtnText: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: Colors.textPrimary,
  },
  reflectBtnTextDone: { color: Colors.success },
  actionCard: {
    backgroundColor: Colors.navyLight,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    alignItems: "center",
    gap: 14,
  },
  actionIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  actionText: {
    fontSize: 16,
    fontFamily: "Inter_500Medium",
    color: Colors.textPrimary,
    textAlign: "center",
    lineHeight: 24,
  },
  actionCategory: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    color: Colors.textMuted,
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 14,
    borderWidth: 1,
  },
  actionBtnDone: { backgroundColor: Colors.success + "15" },
  actionBtnText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  hadithCard: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 12,
  },
  hadithText: {
    fontSize: 17,
    fontFamily: "Inter_500Medium",
    color: Colors.textPrimary,
    lineHeight: 26,
    fontStyle: "italic",
  },
  hadithSource: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
    marginTop: 12,
  },
  hadithActions: {
    flexDirection: "row",
    gap: 10,
  },
  hadithActionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: Colors.navyLight,
    borderRadius: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.separator,
  },
  hadithActionBtnActive: {
    borderColor: Colors.gold + "55",
    backgroundColor: Colors.goldMuted + "15",
  },
  hadithActionText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: Colors.textSecondary,
  },
  progressGrid: {
    flexDirection: "row",
    backgroundColor: Colors.navyLight,
    borderRadius: 20,
    paddingVertical: 20,
    borderWidth: 1,
    borderColor: Colors.separator,
  },
  progressItem: {
    flex: 1,
    alignItems: "center",
    gap: 6,
  },
  progressItemMid: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderLeftColor: Colors.separator,
    borderRightColor: Colors.separator,
  },
  progressValue: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
  },
  progressLabel: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
  },
  communityCard: {
    marginTop: 20,
    backgroundColor: Colors.navyLight,
    borderRadius: 16,
    padding: 18,
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: Colors.separator,
  },
  communityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  communityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.success,
  },
  communityText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: Colors.textPrimary,
  },
  communitySubtext: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
  },
});
