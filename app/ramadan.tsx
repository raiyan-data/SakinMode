import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "@/constants/colors";
import { useTheme } from "@/context/ThemeContext";
import { useApp } from "@/context/AppContext";
import { getTodayDateKey } from "@/constants/prayers";
import { getRamadanDay, getRamadanProgress, getSuggestedJuz } from "@/services/ramadanService";

function RamadanStat({ label, value, icon, color }: { label: string; value: string | number; icon: string; color: string }) {
  return (
    <View style={[styles.statCard, { borderColor: color + "44" }]}>
      <Ionicons name={icon as any} size={20} color={color} />
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export default function RamadanScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { ramadanData, markFastDay, toggleJuzRead, markTaraweeh, nextPrayer, prayerTimes } = useApp();
  const today = getTodayDateKey();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : 0;

  const ramadanDay = getRamadanDay() ?? 1;
  const progress = getRamadanProgress();
  const hasFastedToday = ramadanData.fastDays.includes(today);
  const hasTaraweehToday = ramadanData.taraweehDays.includes(today);

  // Find Iftar time (Maghrib) and Suhoor (Fajr)
  const fajr = prayerTimes.find((p) => p.name === "Fajr");
  const maghrib = prayerTimes.find((p) => p.name === "Maghrib");

  return (
    <View style={[styles.container, { paddingTop: topPad, backgroundColor: colors.navy }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: botPad + 40 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color={Colors.textSecondary} />
          </Pressable>
          <View>
            <Text style={styles.title}>Ramadan Mode</Text>
            <Text style={styles.subtitle}>Day {ramadanDay} of 30</Text>
          </View>
        </View>

        {/* Progress bar */}
        <Animated.View entering={FadeInDown.duration(400)} style={styles.section}>
          <LinearGradient colors={[Colors.tealMuted, Colors.navyMid]} style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressTitle}>Ramadan Progress</Text>
              <Text style={styles.progressPct}>{Math.round(progress * 100)}%</Text>
            </View>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
            </View>
            <View style={styles.timesRow}>
              {fajr && (
                <View style={styles.timeChip}>
                  <Ionicons name="moon-outline" size={14} color={Colors.textSecondary} />
                  <Text style={styles.timeChipText}>Suhoor ends {fajr.time}</Text>
                </View>
              )}
              {maghrib && (
                <View style={styles.timeChip}>
                  <Ionicons name="sunny-outline" size={14} color={Colors.gold} />
                  <Text style={[styles.timeChipText, { color: Colors.gold }]}>Iftar {maghrib.time}</Text>
                </View>
              )}
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Stats */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)}>
          <View style={styles.statsRow}>
            <RamadanStat icon="restaurant-outline" label="Days fasted" value={ramadanData.fastDays.length} color={Colors.gold} />
            <RamadanStat icon="book-outline" label="Juz read" value={ramadanData.quranJuzRead.length} color={Colors.tealLight} />
            <RamadanStat icon="moon" label="Taraweeh" value={ramadanData.taraweehDays.length} color="#9B7FD4" />
          </View>
        </Animated.View>

        {/* Today's checklist */}
        <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Checklist</Text>
          <View style={styles.card}>
            <Pressable
              style={styles.checkRow}
              onPress={() => { markFastDay(today); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
            >
              <View style={[styles.checkbox, hasFastedToday && styles.checkboxDone]}>
                {hasFastedToday && <Ionicons name="checkmark" size={14} color={Colors.white} />}
              </View>
              <View style={styles.checkInfo}>
                <Text style={styles.checkLabel}>Fasted today</Text>
                <Text style={styles.checkSub}>Mark your fast for {today}</Text>
              </View>
              <Ionicons name="restaurant-outline" size={18} color={Colors.gold} />
            </Pressable>

            <View style={styles.divider} />

            <Pressable
              style={styles.checkRow}
              onPress={() => { markTaraweeh(today); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
            >
              <View style={[styles.checkbox, hasTaraweehToday && styles.checkboxDone]}>
                {hasTaraweehToday && <Ionicons name="checkmark" size={14} color={Colors.white} />}
              </View>
              <View style={styles.checkInfo}>
                <Text style={styles.checkLabel}>Prayed Taraweeh</Text>
                <Text style={styles.checkSub}>Night prayer attendance</Text>
              </View>
              <Ionicons name="moon" size={18} color="#9B7FD4" />
            </Pressable>
          </View>
        </Animated.View>

        {/* Quran tracker */}
        <Animated.View entering={FadeInDown.delay(300).duration(400)} style={styles.section}>
          <Text style={styles.sectionTitle}>Quran — 30 Juz</Text>
          <Text style={styles.sectionSub}>{getSuggestedJuz(ramadanDay)} suggested today</Text>
          <View style={styles.juzGrid}>
            {Array.from({ length: 30 }, (_, i) => i + 1).map((juz) => {
              const done = ramadanData.quranJuzRead.includes(juz);
              return (
                <Pressable
                  key={juz}
                  style={[styles.juzCell, done && styles.juzCellDone]}
                  onPress={() => { toggleJuzRead(juz); Haptics.selectionAsync(); }}
                >
                  <Text style={[styles.juzNum, done && styles.juzNumDone]}>{juz}</Text>
                </Pressable>
              );
            })}
          </View>
        </Animated.View>

        {/* Ramadan calendar */}
        <Animated.View entering={FadeInDown.delay(400).duration(400)} style={styles.section}>
          <Text style={styles.sectionTitle}>30-Day Calendar</Text>
          <View style={styles.card}>
            <View style={styles.calendarGrid}>
              {Array.from({ length: 30 }, (_, i) => {
                const d = new Date(2026, 1, 18 + i);
                const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
                const fasted = ramadanData.fastDays.includes(key);
                const taraweeh = ramadanData.taraweehDays.includes(key);
                const isToday = key === today;
                const isFuture = d > new Date();
                return (
                  <View
                    key={key}
                    style={[
                      styles.calDay,
                      fasted && styles.calDayFasted,
                      isToday && styles.calDayToday,
                      isFuture && styles.calDayFuture,
                    ]}
                  >
                    <Text style={[styles.calDayNum, isToday && { color: Colors.gold }]}>{i + 1}</Text>
                    {taraweeh && <View style={styles.calDot} />}
                  </View>
                );
              })}
            </View>
            <View style={styles.calLegend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendBox, { backgroundColor: Colors.teal }]} />
                <Text style={styles.legendText}>Fasted</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendBox, { backgroundColor: Colors.gold, width: 6, height: 6, borderRadius: 3 }]} />
                <Text style={styles.legendText}>Taraweeh</Text>
              </View>
            </View>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.navy },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.navyLight,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.separator,
  },
  title: { fontSize: 24, fontFamily: "Inter_700Bold", color: Colors.textPrimary },
  subtitle: { fontSize: 13, fontFamily: "Inter_400Regular", color: Colors.gold, marginTop: 2 },
  section: { paddingHorizontal: 20, marginBottom: 20 },
  sectionTitle: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    color: Colors.textSecondary,
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  sectionSub: { fontSize: 12, fontFamily: "Inter_400Regular", color: Colors.gold, marginBottom: 10 },
  progressCard: { borderRadius: 20, padding: 20, gap: 14 },
  progressHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  progressTitle: { fontSize: 16, fontFamily: "Inter_600SemiBold", color: Colors.textPrimary },
  progressPct: { fontSize: 20, fontFamily: "Inter_700Bold", color: Colors.gold },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.navyLight + "88",
    overflow: "hidden",
  },
  progressFill: { height: 6, borderRadius: 3, backgroundColor: Colors.gold },
  timesRow: { flexDirection: "row", gap: 12 },
  timeChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.navyLight + "66",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  timeChipText: { fontSize: 12, fontFamily: "Inter_500Medium", color: Colors.textSecondary },
  statsRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 4,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.navyLight,
    borderRadius: 16,
    padding: 14,
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
  },
  statValue: { fontSize: 22, fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 10, fontFamily: "Inter_400Regular", color: Colors.textSecondary, textAlign: "center" },
  card: {
    backgroundColor: Colors.navyLight,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.separator,
  },
  checkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 6,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.textMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxDone: { backgroundColor: Colors.success, borderColor: Colors.success },
  checkInfo: { flex: 1 },
  checkLabel: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: Colors.textPrimary },
  checkSub: { fontSize: 12, fontFamily: "Inter_400Regular", color: Colors.textSecondary, marginTop: 2 },
  divider: { height: 1, backgroundColor: Colors.separator, marginVertical: 10 },
  juzGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  juzCell: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: Colors.navyLight,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.separator,
  },
  juzCellDone: { backgroundColor: Colors.tealMuted, borderColor: Colors.teal },
  juzNum: { fontSize: 13, fontFamily: "Inter_500Medium", color: Colors.textMuted },
  juzNumDone: { color: Colors.textPrimary },
  calendarGrid: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  calDay: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: Colors.navyMid,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  calDayFasted: { backgroundColor: Colors.tealMuted },
  calDayToday: { borderWidth: 1, borderColor: Colors.gold },
  calDayFuture: { opacity: 0.35 },
  calDayNum: { fontSize: 11, fontFamily: "Inter_500Medium", color: Colors.textSecondary },
  calDot: {
    position: "absolute",
    bottom: 3,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.gold,
  },
  calLegend: { flexDirection: "row", gap: 16, marginTop: 12 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  legendBox: { width: 12, height: 12, borderRadius: 3, backgroundColor: Colors.teal },
  legendText: { fontSize: 11, fontFamily: "Inter_400Regular", color: Colors.textSecondary },
});
