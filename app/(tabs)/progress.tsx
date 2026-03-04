import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
  Pressable,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withTiming,
  FadeInDown,
} from "react-native-reanimated";
import { useApp } from "@/context/AppContext";
import { Colors } from "@/constants/colors";
import { useTheme } from "@/context/ThemeContext";
import { PrayerRecord, PrayerName, PRAYER_NAMES, getTodayDateKey } from "@/constants/prayers";

function StatCard({
  icon,
  label,
  value,
  color,
  sub,
}: {
  icon: string;
  label: string;
  value: string;
  color: string;
  sub?: string;
}) {
  return (
    <View style={[styles.statCard, { borderColor: color + "44" }]}>
      <Ionicons name={icon as any} size={20} color={color} />
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
      {sub && <Text style={styles.statSub}>{sub}</Text>}
    </View>
  );
}

function DayCell({ record, dayLabel }: { record: PrayerRecord | null; dayLabel: string }) {
  const count = record ? Object.values(record.prayers).filter(Boolean).length : 0;
  const isToday = record?.date === getTodayDateKey();
  return (
    <View style={styles.dayCell}>
      <View
        style={[
          styles.dayCellDot,
          {
            backgroundColor:
              count >= 5 ? Colors.success : count > 0 ? Colors.teal : Colors.separator,
            borderWidth: isToday ? 2 : 0,
            borderColor: Colors.gold,
          },
        ]}
      />
      <Text style={[styles.dayCellLabel, isToday && { color: Colors.gold }]}>{dayLabel}</Text>
    </View>
  );
}

function WeekGrid({ records }: { records: PrayerRecord[] }) {
  const last14 = useMemo(() => {
    const result = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      const label = i === 0 ? "T" : d.toLocaleDateString("en-US", { weekday: "narrow" });
      const rec = records.find((r) => r.date === key) || null;
      result.push({ key, label, rec });
    }
    return result;
  }, [records]);

  return (
    <View style={styles.weekGrid}>
      {last14.map((item) => (
        <DayCell key={item.key} record={item.rec} dayLabel={item.label} />
      ))}
    </View>
  );
}

function PrayerBar({ name, count, total }: { name: PrayerName; count: number; total: number }) {
  const pct = total === 0 ? 0 : Math.min(1, count / total);
  const width = useSharedValue(0);
  React.useEffect(() => {
    width.value = withDelay(300, withTiming(pct, { duration: 900 }));
  }, [pct]);
  const animStyle = useAnimatedStyle(() => ({ width: `${width.value * 100}%` as any }));
  const color = pct >= 0.8 ? Colors.success : pct >= 0.5 ? Colors.teal : Colors.gold;

  return (
    <View style={styles.barRow}>
      <Text style={styles.barLabel}>{name}</Text>
      <View style={styles.barTrack}>
        <Animated.View style={[styles.barFill, animStyle, { backgroundColor: color }]} />
      </View>
      <Text style={styles.barCount}>{count}/{total}</Text>
    </View>
  );
}

export default function ProgressScreen() {
  const insets = useSafeAreaInsets();
  const { streak, allRecords, todayRecord, focusStats, missedPrayers, isRamadanActive } = useApp();
  const { colors } = useTheme();

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : 0;

  const stats = useMemo(() => {
    const totalDays = allRecords.length;
    const perfectDays = allRecords.filter(
      (r) => Object.values(r.prayers).filter(Boolean).length >= 5
    ).length;
    const totalPrayers = allRecords.reduce(
      (sum, r) => sum + Object.values(r.prayers).filter(Boolean).length,
      0
    );
    const prayerCounts: Record<PrayerName, number> = {
      Fajr: 0,
      Dhuhr: 0,
      Asr: 0,
      Maghrib: 0,
      Isha: 0,
    };
    for (const rec of allRecords) {
      for (const name of PRAYER_NAMES) {
        if (rec.prayers[name]) prayerCounts[name]++;
      }
    }

    const last7 = allRecords.slice(0, 7);
    const weeklyPrayed = last7.reduce(
      (sum, r) => sum + Object.values(r.prayers).filter(Boolean).length,
      0
    );
    const weeklyPct = last7.length === 0 ? 0 : Math.round((weeklyPrayed / (last7.length * 5)) * 100);

    const estimatedSaved = Math.round(focusStats.totalMinutesBlocked * 0.7);

    return { totalDays, perfectDays, totalPrayers, prayerCounts, weeklyPct, estimatedSaved };
  }, [allRecords, focusStats]);

  const todayCount = Object.values(todayRecord.prayers).filter(Boolean).length;

  return (
    <View style={[styles.container, { paddingTop: topPad, backgroundColor: colors.navy }]}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: botPad + 120 }}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Progress</Text>
          {isRamadanActive && (
            <Pressable
              style={styles.ramadanBadge}
              onPress={() => { router.push("/ramadan"); Haptics.selectionAsync(); }}
            >
              <Ionicons name="moon" size={14} color={Colors.gold} />
              <Text style={styles.ramadanBadgeText}>Ramadan</Text>
              <Ionicons name="chevron-forward" size={12} color={Colors.gold} />
            </Pressable>
          )}
        </View>

        {/* Missed prayers warning */}
        {missedPrayers.length > 0 && (
          <Animated.View entering={FadeInDown.duration(400)} style={styles.missedCard}>
            <Ionicons name="alert-circle-outline" size={18} color={Colors.gold} />
            <Text style={styles.missedText}>
              {missedPrayers.length === 1
                ? `${missedPrayers[0]} passed without being marked`
                : `${missedPrayers.join(", ")} passed without confirmation`}
            </Text>
          </Animated.View>
        )}

        {/* Streak */}
        <View style={styles.streakCard}>
          <View style={styles.streakIconWrap}>
            <Ionicons name="flame" size={32} color={Colors.gold} />
          </View>
          <View>
            <Text style={styles.streakNum}>{streak}</Text>
            <Text style={styles.streakLabel}>day streak</Text>
          </View>
          <View style={styles.streakRight}>
            <Text style={styles.streakSub}>Today: {todayCount}/5 prayers</Text>
          </View>
        </View>

        {/* Focus Score */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.section}>
          <Text style={styles.sectionTitle}>Focus Score</Text>
          <View style={styles.focusGrid}>
            <StatCard
              icon="lock-closed"
              label="Minutes blocked"
              value={String(focusStats.totalMinutesBlocked)}
              color={Colors.tealLight}
              sub={`${focusStats.totalLockSessions} sessions`}
            />
            <StatCard
              icon="hourglass-outline"
              label="Distraction saved"
              value={`${stats.estimatedSaved}m`}
              color={Colors.success}
              sub="est. distraction time"
            />
            <StatCard
              icon="trending-up"
              label="Weekly consistency"
              value={`${stats.weeklyPct}%`}
              color={stats.weeklyPct >= 80 ? Colors.success : Colors.gold}
              sub="last 7 days"
            />
          </View>
        </Animated.View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <StatCard icon="calendar-outline" label="Days tracked" value={String(stats.totalDays)} color={Colors.tealLight} />
          <StatCard icon="star-outline" label="Perfect days" value={String(stats.perfectDays)} color={Colors.gold} />
          <StatCard icon="checkmark-circle-outline" label="Total prayers" value={String(stats.totalPrayers)} color={Colors.success} />
        </View>

        {/* 14-day grid */}
        <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.section}>
          <Text style={styles.sectionTitle}>Last 14 Days</Text>
          <View style={styles.card}>
            <WeekGrid records={allRecords} />
            <View style={styles.legend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: Colors.success }]} />
                <Text style={styles.legendText}>All 5</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: Colors.teal }]} />
                <Text style={styles.legendText}>Partial</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: Colors.separator }]} />
                <Text style={styles.legendText}>None</Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Prayer breakdown */}
        {stats.totalDays > 0 && (
          <Animated.View entering={FadeInDown.delay(300).duration(400)} style={styles.section}>
            <Text style={styles.sectionTitle}>Prayer Breakdown</Text>
            <View style={styles.card}>
              {PRAYER_NAMES.map((name) => (
                <PrayerBar
                  key={name}
                  name={name}
                  count={stats.prayerCounts[name]}
                  total={stats.totalDays}
                />
              ))}
            </View>
          </Animated.View>
        )}

        {/* Quick links */}
        <Animated.View entering={FadeInDown.delay(400).duration(400)} style={styles.section}>
          <Text style={styles.sectionTitle}>Features</Text>
          <View style={styles.card}>
            <Pressable
              style={styles.linkRow}
              onPress={() => { router.push("/ramadan"); Haptics.selectionAsync(); }}
            >
              <Ionicons name="moon" size={20} color={Colors.gold} />
              <Text style={styles.linkText}>Ramadan Mode</Text>
              <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
            </Pressable>
            <View style={styles.divider} />
            <Pressable
              style={styles.linkRow}
              onPress={() => { router.push("/circles"); Haptics.selectionAsync(); }}
            >
              <Ionicons name="people" size={20} color={Colors.tealLight} />
              <Text style={styles.linkText}>Accountability Circles</Text>
              <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
            </Pressable>
          </View>
        </Animated.View>

        {allRecords.length === 0 && focusStats.totalLockSessions === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="bar-chart-outline" size={48} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>No data yet</Text>
            <Text style={styles.emptyText}>Start tracking your prayers from the Home tab</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.navy },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
  },
  title: { fontSize: 28, fontFamily: "Inter_700Bold", color: Colors.textPrimary },
  ramadanBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.goldMuted + "33",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: Colors.goldMuted,
  },
  ramadanBadgeText: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: Colors.gold },
  missedCard: {
    marginHorizontal: 20,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: Colors.goldMuted + "22",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.goldMuted + "55",
  },
  missedText: {
    flex: 1,
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: Colors.gold,
    lineHeight: 18,
  },
  streakCard: {
    marginHorizontal: 20,
    backgroundColor: Colors.navyLight,
    borderRadius: 20,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    borderWidth: 1,
    borderColor: Colors.goldMuted + "55",
  },
  streakIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.goldMuted + "33",
    alignItems: "center",
    justifyContent: "center",
  },
  streakNum: { fontSize: 36, fontFamily: "Inter_700Bold", color: Colors.gold },
  streakLabel: { fontSize: 13, fontFamily: "Inter_400Regular", color: Colors.textSecondary },
  streakRight: { flex: 1, alignItems: "flex-end" },
  streakSub: { fontSize: 13, fontFamily: "Inter_500Medium", color: Colors.textSecondary },
  section: { marginTop: 20, paddingHorizontal: 20 },
  sectionTitle: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    color: Colors.textSecondary,
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 10,
  },
  focusGrid: { flexDirection: "row", gap: 10 },
  statsRow: { flexDirection: "row", paddingHorizontal: 20, gap: 10, marginTop: 12 },
  statCard: {
    flex: 1,
    backgroundColor: Colors.navyLight,
    borderRadius: 16,
    padding: 12,
    alignItems: "center",
    gap: 5,
    borderWidth: 1,
  },
  statValue: { fontSize: 20, fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 9, fontFamily: "Inter_400Regular", color: Colors.textSecondary, textAlign: "center" },
  statSub: { fontSize: 9, fontFamily: "Inter_400Regular", color: Colors.textMuted, textAlign: "center" },
  card: {
    backgroundColor: Colors.navyLight,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.separator,
  },
  weekGrid: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 4 },
  dayCell: { alignItems: "center", gap: 6 },
  dayCellDot: { width: 20, height: 20, borderRadius: 6 },
  dayCellLabel: { fontSize: 9, fontFamily: "Inter_500Medium", color: Colors.textMuted },
  legend: { flexDirection: "row", justifyContent: "center", gap: 16, marginTop: 14 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 11, fontFamily: "Inter_400Regular", color: Colors.textSecondary },
  barRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 },
  barLabel: { width: 60, fontSize: 13, fontFamily: "Inter_500Medium", color: Colors.textSecondary },
  barTrack: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.separator,
    overflow: "hidden",
  },
  barFill: { height: 8, borderRadius: 4 },
  barCount: { width: 34, fontSize: 12, fontFamily: "Inter_400Regular", color: Colors.textMuted, textAlign: "right" },
  linkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 8,
  },
  linkText: { flex: 1, fontSize: 15, fontFamily: "Inter_500Medium", color: Colors.textPrimary },
  divider: { height: 1, backgroundColor: Colors.separator, marginVertical: 6 },
  emptyState: { alignItems: "center", paddingTop: 60, gap: 12 },
  emptyTitle: { fontSize: 18, fontFamily: "Inter_600SemiBold", color: Colors.textSecondary },
  emptyText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: Colors.textMuted,
    textAlign: "center",
    paddingHorizontal: 40,
  },
});
