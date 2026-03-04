import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withSpring,
  FadeIn,
  FadeInDown,
  FadeInUp,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "@/constants/colors";
import { useTheme } from "@/context/ThemeContext";
import { getTodayAyah } from "@/constants/ayahs";

const DHIKR_OPTIONS = [
  { arabic: "سُبْحَانَ اللّٰه", transliteration: "Subhanallah", meaning: "Glory be to Allah" },
  { arabic: "الحمد لله", transliteration: "Alhamdulillah", meaning: "Praise be to Allah" },
  { arabic: "اللّٰهُ أَكْبَر", transliteration: "Allahu Akbar", meaning: "Allah is the Greatest" },
];

// IMPORTANT: Each row is its own component so useAnimatedStyle is not called inside .map()
function DhikrRow({
  dhikr,
  idx,
  count,
  onPress,
}: {
  dhikr: (typeof DHIKR_OPTIONS)[0];
  idx: number;
  count: number;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    scale.value = withSpring(0.93, {}, () => {
      scale.value = withSpring(1);
    });
    onPress();
  };

  return (
    <Animated.View style={animStyle}>
      <Pressable style={[styles.dhikrRow, idx < DHIKR_OPTIONS.length - 1 && styles.dhikrRowBorder]} onPress={handlePress}>
        <View style={styles.dhikrInfo}>
          <Text style={styles.dhikrArabic}>{dhikr.arabic}</Text>
          <Text style={styles.dhikrTranslit}>{dhikr.transliteration}</Text>
        </View>
        <View style={styles.dhikrCountWrap}>
          <Text style={styles.dhikrCount}>{count}</Text>
          <Ionicons name="add-circle" size={28} color={Colors.tealLight} />
        </View>
      </Pressable>
    </Animated.View>
  );
}

function DhikrCounter() {
  const [counts, setCounts] = useState([0, 0, 0]);

  const handlePress = (idx: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCounts((prev) => {
      const next = [...prev];
      next[idx] = next[idx] + 1;
      return next;
    });
  };

  return (
    <View style={styles.dhikrContainer}>
      <Text style={styles.dhikrTitle}>Dhikr Counter</Text>
      {DHIKR_OPTIONS.map((dhikr, idx) => (
        <DhikrRow
          key={dhikr.transliteration}
          dhikr={dhikr}
          idx={idx}
          count={counts[idx]}
          onPress={() => handlePress(idx)}
        />
      ))}
    </View>
  );
}

export default function AfterPrayerScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { prayer } = useLocalSearchParams<{ prayer?: string }>();
  const [showReflection, setShowReflection] = useState(false);
  const ayah = getTodayAyah();

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const starScale = useSharedValue(0);
  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    starScale.value = withDelay(300, withSpring(1, { damping: 8, stiffness: 80 }));
  }, []);

  const starStyle = useAnimatedStyle(() => ({
    transform: [{ scale: starScale.value }],
  }));

  return (
    <LinearGradient
      colors={[Colors.navy, "#0A1520", Colors.navy]}
      style={[styles.container, { paddingTop: topPad }]}
    >
      <Pressable style={styles.dismissBtn} onPress={() => router.back()}>
        <Ionicons name="close" size={22} color={Colors.textMuted} />
      </Pressable>

      <Animated.View entering={FadeIn.duration(600)} style={styles.inner}>
        {/* Header */}
        <View style={styles.topSection}>
          <Animated.View style={[styles.moonWrap, starStyle]}>
            <Ionicons name="moon" size={56} color={Colors.gold} />
          </Animated.View>
          <Animated.Text entering={FadeInDown.delay(400).duration(600)} style={styles.alhamdulillah}>
            Alhamdulillah
          </Animated.Text>
          {prayer && (
            <Animated.Text entering={FadeInDown.delay(600).duration(600)} style={styles.prayerComplete}>
              {prayer} prayer complete
            </Animated.Text>
          )}
        </View>

        {/* Reflection toggle */}
        <Animated.View entering={FadeInDown.delay(800).duration(500)} style={styles.section}>
          <Pressable
            style={styles.reflectionToggle}
            onPress={() => {
              setShowReflection((v) => !v);
              Haptics.selectionAsync();
            }}
          >
            <Ionicons name="leaf-outline" size={16} color={Colors.success} />
            <Text style={styles.reflectionToggleText}>
              {showReflection ? "Hide" : "Show"} reflection
            </Text>
            <Ionicons
              name={showReflection ? "chevron-up" : "chevron-down"}
              size={14}
              color={Colors.textMuted}
            />
          </Pressable>

          {showReflection && (
            <Animated.View entering={FadeInDown.duration(300)} style={styles.reflectionCard}>
              <Text style={styles.reflectionQuote}>"{ayah.ayah}"</Text>
              <Text style={styles.reflectionSource}>— {ayah.surah} ({ayah.verse})</Text>
              <Text style={styles.reflectionText}>{ayah.reflection}</Text>
            </Animated.View>
          )}
        </Animated.View>

        {/* Dhikr counter */}
        <Animated.View entering={FadeInDown.delay(1000).duration(500)} style={{ width: "100%" }}>
          <DhikrCounter />
        </Animated.View>

        {/* Done button */}
        <Animated.View entering={FadeInUp.delay(1200).duration(400)}>
          <Pressable
            style={styles.doneBtn}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              router.back();
            }}
          >
            <Text style={styles.doneBtnText}>Done</Text>
          </Pressable>
        </Animated.View>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  dismissBtn: {
    position: "absolute",
    top: 60,
    right: 20,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.navyLight,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  inner: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 32,
    gap: 20,
  },
  topSection: { alignItems: "center", gap: 10 },
  moonWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.goldMuted + "33",
    alignItems: "center",
    justifyContent: "center",
  },
  alhamdulillah: {
    fontSize: 30,
    fontFamily: "Inter_700Bold",
    color: Colors.textPrimary,
  },
  prayerComplete: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
  },
  section: { width: "100%" },
  reflectionToggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: Colors.navyLight,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.separator,
  },
  reflectionToggleText: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    color: Colors.textSecondary,
  },
  reflectionCard: {
    marginTop: 8,
    backgroundColor: Colors.navyLight,
    borderRadius: 16,
    padding: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.separator,
  },
  reflectionQuote: {
    fontSize: 15,
    fontFamily: "Inter_500Medium",
    color: Colors.textPrimary,
    fontStyle: "italic",
    lineHeight: 22,
  },
  reflectionSource: { fontSize: 12, fontFamily: "Inter_400Regular", color: Colors.gold },
  reflectionText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  dhikrContainer: {
    backgroundColor: Colors.navyLight,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.separator,
    width: "100%",
  },
  dhikrTitle: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    color: Colors.textSecondary,
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  dhikrRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 2,
  },
  dhikrRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.separator,
  },
  dhikrInfo: { flex: 1 },
  dhikrArabic: { fontSize: 16, fontFamily: "Inter_600SemiBold", color: Colors.textPrimary },
  dhikrTranslit: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
    marginTop: 2,
  },
  dhikrCountWrap: { flexDirection: "row", alignItems: "center", gap: 10 },
  dhikrCount: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    color: Colors.gold,
    minWidth: 32,
    textAlign: "right",
  },
  doneBtn: {
    backgroundColor: Colors.teal,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 64,
  },
  doneBtnText: { fontSize: 16, fontFamily: "Inter_600SemiBold", color: Colors.white },
});
