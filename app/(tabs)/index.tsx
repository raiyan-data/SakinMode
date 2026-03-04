import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Platform,
  RefreshControl,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Location from "expo-location";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withTiming,
  Easing,
  interpolate,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { useApp } from "@/context/AppContext";
import { Colors } from "@/constants/colors";
import { useTheme } from "@/context/ThemeContext";
import {
  PrayerName,
  PrayerTime,
  formatCountdown,
  PRAYER_ICONS,
} from "@/constants/prayers";

function useCountdown(targetMs: number | null) {
  const [secs, setSecs] = useState(0);
  useEffect(() => {
    if (targetMs === null) return;
    const tick = () => {
      const diff = Math.max(0, Math.floor((targetMs - Date.now()) / 1000));
      setSecs(diff);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetMs]);
  return secs;
}

function PulseDot() {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  useEffect(() => {
    scale.value = withRepeat(
      withTiming(1.5, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
    opacity.value = withRepeat(
      withTiming(0.2, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);
  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));
  return (
    <Animated.View style={[styles.pulseDot, style]} />
  );
}

function NextPrayerCard({
  nextPrayer,
  countdown,
}: {
  nextPrayer: PrayerTime;
  countdown: number;
}) {
  const iconInfo = PRAYER_ICONS[nextPrayer.name];
  return (
    <LinearGradient
      colors={[Colors.tealMuted, Colors.navyMid]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.nextCard}
    >
      <View style={styles.nextCardTop}>
        <View style={styles.nextLabelRow}>
          <PulseDot />
          <Text style={styles.nextLabel}>NEXT PRAYER</Text>
        </View>
        <Ionicons name={iconInfo.icon as any} size={24} color={iconInfo.color} />
      </View>
      <Text style={styles.nextPrayerName}>{nextPrayer.name}</Text>
      <Text style={styles.nextPrayerTime}>{nextPrayer.time}</Text>
      <View style={styles.countdownRow}>
        <Text style={styles.countdownText}>{formatCountdown(countdown)}</Text>
        <Text style={styles.countdownSub}>until adhan</Text>
      </View>
    </LinearGradient>
  );
}

function PrayerRow({
  prayer,
  prayed,
  onMark,
  isNext,
}: {
  prayer: PrayerTime;
  prayed: boolean;
  onMark: () => void;
  isNext: boolean;
}) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  const iconInfo = PRAYER_ICONS[prayer.name];
  const isPast = prayer.timestamp < Date.now();
  const handlePress = () => {
    scale.value = withSpring(0.94, {}, () => {
      scale.value = withSpring(1);
    });
    onMark();
  };
  return (
    <Animated.View style={[styles.prayerRow, isNext && styles.prayerRowNext, animStyle]}>
      <View style={[styles.prayerIconWrap, { backgroundColor: iconInfo.color + "22" }]}>
        <Ionicons name={iconInfo.icon as any} size={20} color={iconInfo.color} />
      </View>
      <View style={styles.prayerInfo}>
        <Text style={[styles.prayerName, isPast && !prayed && styles.prayerNamePast]}>
          {prayer.name}
        </Text>
        <Text style={styles.prayerTimeText}>{prayer.time}</Text>
      </View>
      {isNext && <View style={styles.nextBadge}><Text style={styles.nextBadgeText}>NEXT</Text></View>}
      <Pressable
        onPress={handlePress}
        style={[styles.prayedBtn, prayed && styles.prayedBtnActive]}
        disabled={prayed}
      >
        <Ionicons
          name={prayed ? "checkmark-circle" : "checkmark-circle-outline"}
          size={28}
          color={prayed ? Colors.success : Colors.textMuted}
        />
      </Pressable>
    </Animated.View>
  );
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { prayerTimes, prayerLoading, prayerError, nextPrayer, todayRecord, markPrayed, refreshPrayerTimes, settings } = useApp();
  const { colors } = useTheme();
  const [locError, setLocError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const hasFetched = useRef(false);

  const countdown = useCountdown(nextPrayer?.timestamp ?? null);

  const fetchWithLocation = useCallback(async () => {
    setLocError(null);
    if (settings.city) {
      await refreshPrayerTimes();
      return;
    }
    const perm = await Location.requestForegroundPermissionsAsync();
    if (!perm.granted) {
      setLocError("Location permission denied. Set a city in Settings.");
      return;
    }
    const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
    await refreshPrayerTimes(loc.coords.latitude, loc.coords.longitude);
  }, [refreshPrayerTimes, settings.city]);

  useEffect(() => {
    if (!hasFetched.current && prayerTimes.length === 0) {
      hasFetched.current = true;
      fetchWithLocation();
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchWithLocation();
    setRefreshing(false);
  }, [fetchWithLocation]);

  const handleMark = useCallback(async (name: PrayerName) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await markPrayed(name);
  }, [markPrayed]);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : 0;

  const prayedCount = Object.values(todayRecord.prayers).filter(Boolean).length;

  return (
    <View style={[styles.container, { paddingTop: topPad, backgroundColor: colors.navy }]}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.gold} />
        }
        contentContainerStyle={{ paddingBottom: botPad + 120 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Text style={styles.dateText}>{getTodayFormatted()}</Text>
          </View>
          <View style={styles.progressCircle}>
            <Text style={styles.progressNum}>{prayedCount}</Text>
            <Text style={styles.progressDen}>/5</Text>
          </View>
        </View>

        {/* Next Prayer Card */}
        {prayerLoading ? (
          <View style={styles.loadingCard}>
            <ActivityIndicator color={Colors.gold} size="large" />
            <Text style={styles.loadingText}>Fetching prayer times...</Text>
          </View>
        ) : prayerError || locError ? (
          <View style={styles.errorCard}>
            <Ionicons name="location-outline" size={32} color={Colors.danger} />
            <Text style={styles.errorText}>{prayerError || locError}</Text>
            <Pressable style={styles.retryBtn} onPress={fetchWithLocation}>
              <Text style={styles.retryBtnText}>Try Again</Text>
            </Pressable>
          </View>
        ) : nextPrayer ? (
          <NextPrayerCard nextPrayer={nextPrayer} countdown={countdown} />
        ) : (
          <View style={styles.errorCard}>
            <Ionicons name="moon-outline" size={32} color={Colors.gold} />
            <Text style={styles.errorText}>All prayers complete for today. See you tomorrow.</Text>
          </View>
        )}

        {/* Prayer List */}
        {prayerTimes.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Today's Prayers</Text>
            {prayerTimes.map((p) => (
              <PrayerRow
                key={p.name}
                prayer={p}
                prayed={!!todayRecord.prayers[p.name]}
                onMark={() => handleMark(p.name)}
                isNext={nextPrayer?.name === p.name}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 6) return "Assalamu Alaikum";
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  if (h < 20) return "Good Evening";
  return "Good Night";
}

function getTodayFormatted() {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.navy,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 12,
  },
  greeting: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    color: Colors.textPrimary,
  },
  dateText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
    marginTop: 2,
  },
  progressCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: Colors.teal,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  progressNum: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    color: Colors.gold,
  },
  progressDen: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: Colors.textSecondary,
    marginTop: 4,
  },
  loadingCard: {
    marginHorizontal: 20,
    height: 180,
    borderRadius: 20,
    backgroundColor: Colors.navyLight,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  loadingText: {
    color: Colors.textSecondary,
    fontFamily: "Inter_400Regular",
    fontSize: 14,
  },
  errorCard: {
    marginHorizontal: 20,
    borderRadius: 20,
    backgroundColor: Colors.navyLight,
    padding: 24,
    alignItems: "center",
    gap: 12,
  },
  errorText: {
    color: Colors.textSecondary,
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    textAlign: "center",
  },
  retryBtn: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: Colors.tealMuted,
    borderWidth: 1,
    borderColor: Colors.teal,
  },
  retryBtnText: {
    color: Colors.textPrimary,
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
  },
  nextCard: {
    marginHorizontal: 20,
    borderRadius: 24,
    padding: 20,
    overflow: "hidden",
  },
  nextCardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  nextLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.success,
  },
  nextLabel: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    color: Colors.textSecondary,
    letterSpacing: 1.2,
  },
  nextPrayerName: {
    fontSize: 36,
    fontFamily: "Inter_700Bold",
    color: Colors.textPrimary,
    marginTop: 4,
  },
  nextPrayerTime: {
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
    marginTop: 2,
  },
  countdownRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 8,
    marginTop: 16,
  },
  countdownText: {
    fontSize: 32,
    fontFamily: "Inter_700Bold",
    color: Colors.gold,
    fontVariant: ["tabular-nums"],
  },
  countdownSub: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: Colors.textSecondary,
    letterSpacing: 1,
    marginBottom: 12,
    textTransform: "uppercase",
  },
  prayerRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.navyLight,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.separator,
    gap: 12,
  },
  prayerRowNext: {
    borderColor: Colors.teal,
    backgroundColor: Colors.tealMuted,
  },
  prayerIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  prayerInfo: {
    flex: 1,
  },
  prayerName: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: Colors.textPrimary,
  },
  prayerNamePast: {
    color: Colors.textMuted,
  },
  prayerTimeText: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
    marginTop: 2,
  },
  nextBadge: {
    backgroundColor: Colors.teal + "44",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: Colors.teal,
  },
  nextBadgeText: {
    fontSize: 9,
    fontFamily: "Inter_700Bold",
    color: Colors.tealLight,
    letterSpacing: 0.8,
  },
  prayedBtn: {
    padding: 2,
  },
  prayedBtnActive: {},
});
