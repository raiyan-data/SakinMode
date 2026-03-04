import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSpring,
  Easing,
  FadeIn,
  FadeInDown,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { useApp } from "@/context/AppContext";
import { Colors } from "@/constants/colors";
import { useTheme } from "@/context/ThemeContext";

function CrescentMoon() {
  const pulse = useSharedValue(1);
  useEffect(() => {
    pulse.value = withRepeat(
      withTiming(1.08, { duration: 2500, easing: Easing.inOut(Easing.sine) }),
      -1,
      true
    );
  }, []);
  const style = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));
  return (
    <Animated.View style={style}>
      <Ionicons name="moon" size={72} color={Colors.gold} />
    </Animated.View>
  );
}

export default function LockScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { nextPrayer, currentPrayer, settings, emergencyUnlocksToday, useEmergencyUnlock, setIsLocked, recordLockSession, markPrayed } = useApp();
  const [secondsLeft, setSecondsLeft] = useState(settings.lockDuration * 60);
  const [unlockDelay, setUnlockDelay] = useState(0);
  const [isUnlockPending, setIsUnlockPending] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const unlockIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lockedMinutes = useRef(settings.lockDuration);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  const prayerName = currentPrayer?.name || nextPrayer?.name || "Prayer";

  useEffect(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    intervalRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(intervalRef.current!);
          handleComplete();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (unlockIntervalRef.current) clearInterval(unlockIntervalRef.current);
    };
  }, []);

  const handleComplete = useCallback(async () => {
    setIsLocked(false);
    await recordLockSession(lockedMinutes.current);
    router.replace({ pathname: "/after-prayer", params: { prayer: prayerName } });
  }, [setIsLocked, recordLockSession, prayerName]);

  const startUnlockDelay = useCallback(() => {
    if (emergencyUnlocksToday >= 2) {
      Alert.alert("No unlocks remaining", "You have used all your emergency unlocks for today.");
      return;
    }
    setIsUnlockPending(true);
    setUnlockDelay(5);
    unlockIntervalRef.current = setInterval(() => {
      setUnlockDelay((d) => {
        if (d <= 1) {
          clearInterval(unlockIntervalRef.current!);
          setIsUnlockPending(false);
          return 0;
        }
        return d - 1;
      });
    }, 1000);
  }, [emergencyUnlocksToday]);

  const confirmEmergencyUnlock = useCallback(() => {
    Alert.alert(
      "Emergency Unlock",
      `${2 - emergencyUnlocksToday} emergency unlock${(2 - emergencyUnlocksToday) !== 1 ? "s" : ""} remaining today. Are you sure?`,
      [
        {
          text: "Cancel",
          style: "cancel",
          onPress: () => {
            setIsUnlockPending(false);
            setUnlockDelay(0);
          },
        },
        {
          text: "Unlock",
          style: "destructive",
          onPress: () => {
            const success = useEmergencyUnlock();
            if (success) {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
              clearInterval(intervalRef.current!);
              router.back();
            }
          },
        },
      ]
    );
  }, [emergencyUnlocksToday, useEmergencyUnlock]);

  const pct = secondsLeft / (settings.lockDuration * 60);
  const minutes = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const remaining = 2 - emergencyUnlocksToday;

  return (
    <LinearGradient
      colors={[Colors.navy, "#071220", Colors.navy]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.container, { paddingTop: topPad, paddingBottom: botPad }]}
    >
      <Animated.View entering={FadeIn.duration(600)} style={styles.inner}>
        {/* Crescent + Title */}
        <Animated.View entering={FadeInDown.delay(100).duration(600)} style={styles.topSection}>
          <CrescentMoon />
          <Text style={styles.salahText}>It's time for Salah</Text>
          <Text style={styles.prayerNameText}>{prayerName} Time</Text>
        </Animated.View>

        {/* Timer ring */}
        <Animated.View entering={FadeInDown.delay(300).duration(600)} style={styles.timerSection}>
          <View style={styles.timerRing}>
            <Text style={styles.timerText}>
              {String(minutes).padStart(2, "0")}:{String(secs).padStart(2, "0")}
            </Text>
            <Text style={styles.timerLabel}>remaining</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${pct * 100}%` }]} />
          </View>
        </Animated.View>

        {/* Message */}
        <Animated.View entering={FadeInDown.delay(500).duration(600)} style={styles.messageCard}>
          <Ionicons name="leaf-outline" size={18} color={Colors.success} />
          <Text style={styles.messageText}>
            Step away from the screen. Face the qibla. Allah is waiting.
          </Text>
        </Animated.View>

        {/* Emergency unlock flow */}
        <Animated.View entering={FadeInDown.delay(700).duration(600)} style={styles.emergencySection}>
          {remaining > 0 ? (
            isUnlockPending && unlockDelay === 0 ? (
              <Pressable style={styles.confirmBtn} onPress={confirmEmergencyUnlock}>
                <Ionicons name="warning" size={16} color={Colors.danger} />
                <Text style={styles.confirmBtnText}>Confirm emergency unlock</Text>
              </Pressable>
            ) : isUnlockPending ? (
              <View style={styles.delayBtn}>
                <Text style={styles.delayBtnText}>
                  Please wait {unlockDelay}s before unlocking...
                </Text>
              </View>
            ) : (
              <Pressable style={styles.emergencyBtn} onPress={startUnlockDelay}>
                <Ionicons name="warning-outline" size={16} color={Colors.danger} />
                <Text style={styles.emergencyText}>
                  Emergency Unlock ({remaining} remaining)
                </Text>
              </Pressable>
            )
          ) : (
            <View style={styles.noUnlockMsg}>
              <Ionicons name="lock-closed" size={14} color={Colors.textMuted} />
              <Text style={styles.noUnlockText}>No emergency unlocks remaining today</Text>
            </View>
          )}
        </Animated.View>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 28,
    paddingVertical: 24,
  },
  topSection: { alignItems: "center", gap: 16, marginTop: 20 },
  salahText: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    color: Colors.textSecondary,
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  prayerNameText: {
    fontSize: 34,
    fontFamily: "Inter_700Bold",
    color: Colors.textPrimary,
    textAlign: "center",
  },
  timerSection: { width: "100%", alignItems: "center", gap: 24 },
  timerRing: {
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 2,
    borderColor: Colors.teal,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.tealMuted + "22",
  },
  timerText: {
    fontSize: 46,
    fontFamily: "Inter_700Bold",
    color: Colors.gold,
    fontVariant: ["tabular-nums"],
  },
  timerLabel: { fontSize: 13, fontFamily: "Inter_400Regular", color: Colors.textSecondary },
  progressTrack: {
    width: "100%",
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.separator,
    overflow: "hidden",
  },
  progressFill: {
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.teal,
  },
  messageCard: {
    backgroundColor: Colors.navyLight,
    borderRadius: 16,
    padding: 18,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.separator,
    width: "100%",
  },
  messageText: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  emergencySection: { alignItems: "center", width: "100%" },
  emergencyBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.danger + "55",
    backgroundColor: Colors.danger + "11",
  },
  emergencyText: { fontSize: 13, fontFamily: "Inter_500Medium", color: Colors.danger },
  delayBtn: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.textMuted + "44",
    backgroundColor: Colors.navyLight,
  },
  delayBtnText: { fontSize: 13, fontFamily: "Inter_400Regular", color: Colors.textMuted },
  confirmBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.danger,
    backgroundColor: Colors.danger + "22",
  },
  confirmBtnText: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: Colors.danger },
  noUnlockMsg: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  noUnlockText: { fontSize: 13, fontFamily: "Inter_400Regular", color: Colors.textMuted },
});
