import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown, FadeIn } from "react-native-reanimated";
import { Colors } from "@/constants/colors";
import { useTheme } from "@/context/ThemeContext";
import { useApp } from "@/context/AppContext";
import { Circle } from "@/context/AppContext";

function CircleCard({ circle, onRemove }: { circle: Circle; onRemove: () => void }) {
  return (
    <Animated.View entering={FadeInDown.duration(300)}>
      <View style={styles.circleCard}>
        <View style={styles.circleAvatar}>
          <Text style={styles.circleInitial}>{circle.memberName.charAt(0).toUpperCase()}</Text>
        </View>
        <View style={styles.circleInfo}>
          <Text style={styles.circleMemberName}>{circle.memberName}</Text>
          <Text style={styles.circleGroup}>{circle.name}</Text>
        </View>
        <View style={styles.circleStreakWrap}>
          <Ionicons name="flame" size={14} color={Colors.gold} />
          <Text style={styles.circleStreak}>{circle.streak}</Text>
        </View>
        <Pressable
          style={styles.removeBtn}
          onPress={() => {
            Alert.alert("Remove member", `Remove ${circle.memberName} from your circle?`, [
              { text: "Cancel", style: "cancel" },
              {
                text: "Remove",
                style: "destructive",
                onPress: onRemove,
              },
            ]);
          }}
        >
          <Ionicons name="close-circle-outline" size={20} color={Colors.textMuted} />
        </Pressable>
      </View>
    </Animated.View>
  );
}

export default function CirclesScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { circles, addCircle, removeCircle, streak } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [memberName, setMemberName] = useState("");
  const [groupName, setGroupName] = useState("");

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : 0;

  const handleAdd = async () => {
    if (!memberName.trim()) {
      Alert.alert("Name required", "Please enter a member name.");
      return;
    }
    await addCircle(groupName.trim() || "My Circle", memberName.trim());
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setMemberName("");
    setGroupName("");
    setShowForm(false);
  };

  return (
    <View style={[styles.container, { paddingTop: topPad, backgroundColor: colors.navy }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: botPad + 40, paddingHorizontal: 20 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color={Colors.textSecondary} />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Accountability Circles</Text>
            <Text style={styles.subtitle}>Private streak sharing with friends</Text>
          </View>
          <Pressable
            style={styles.addBtn}
            onPress={() => { setShowForm((v) => !v); Haptics.selectionAsync(); }}
          >
            <Ionicons name={showForm ? "close" : "add"} size={22} color={Colors.textPrimary} />
          </Pressable>
        </View>

        {/* My streak card */}
        <Animated.View entering={FadeIn.duration(400)}>
          <View style={styles.myStreakCard}>
            <View style={styles.myStreakLeft}>
              <Ionicons name="person-circle" size={40} color={Colors.tealLight} />
              <View>
                <Text style={styles.myStreakName}>You</Text>
                <Text style={styles.myStreakSub}>Your streak</Text>
              </View>
            </View>
            <View style={styles.myStreakRight}>
              <Ionicons name="flame" size={18} color={Colors.gold} />
              <Text style={styles.myStreakNum}>{streak}</Text>
              <Text style={styles.myStreakDays}>days</Text>
            </View>
          </View>
        </Animated.View>

        {/* Add form */}
        {showForm && (
          <Animated.View entering={FadeInDown.duration(300)} style={styles.formCard}>
            <Text style={styles.formTitle}>Add Circle Member</Text>
            <TextInput
              style={styles.input}
              placeholder="Member's name"
              placeholderTextColor={Colors.textMuted}
              value={memberName}
              onChangeText={setMemberName}
              autoCorrect={false}
            />
            <TextInput
              style={styles.input}
              placeholder="Circle name (optional)"
              placeholderTextColor={Colors.textMuted}
              value={groupName}
              onChangeText={setGroupName}
              autoCorrect={false}
            />
            <Text style={styles.formNote}>
              Note: This is a local tracker. Streak counts are simulated for demo purposes.
            </Text>
            <Pressable style={styles.submitBtn} onPress={handleAdd}>
              <Text style={styles.submitBtnText}>Add Member</Text>
            </Pressable>
          </Animated.View>
        )}

        {/* Circle members */}
        {circles.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Circle ({circles.length})</Text>
            {circles.map((circle) => (
              <CircleCard
                key={circle.id}
                circle={circle}
                onRemove={() => removeCircle(circle.id)}
              />
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={52} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>No circle members yet</Text>
            <Text style={styles.emptyText}>
              Add friends to share your prayer streak. Only streak counts are shared — no rankings.
            </Text>
            <Pressable
              style={styles.emptyBtn}
              onPress={() => { setShowForm(true); Haptics.selectionAsync(); }}
            >
              <Ionicons name="add" size={16} color={Colors.textPrimary} />
              <Text style={styles.emptyBtnText}>Add first member</Text>
            </Pressable>
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
    gap: 12,
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
  addBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.tealMuted,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.teal,
  },
  title: { fontSize: 20, fontFamily: "Inter_700Bold", color: Colors.textPrimary },
  subtitle: { fontSize: 12, fontFamily: "Inter_400Regular", color: Colors.textSecondary, marginTop: 1 },
  myStreakCard: {
    backgroundColor: Colors.navyLight,
    borderRadius: 20,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: Colors.teal + "44",
    marginBottom: 16,
  },
  myStreakLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  myStreakName: { fontSize: 16, fontFamily: "Inter_600SemiBold", color: Colors.textPrimary },
  myStreakSub: { fontSize: 12, fontFamily: "Inter_400Regular", color: Colors.textSecondary },
  myStreakRight: { flexDirection: "row", alignItems: "baseline", gap: 4 },
  myStreakNum: { fontSize: 28, fontFamily: "Inter_700Bold", color: Colors.gold },
  myStreakDays: { fontSize: 13, fontFamily: "Inter_400Regular", color: Colors.textSecondary },
  formCard: {
    backgroundColor: Colors.navyLight,
    borderRadius: 20,
    padding: 20,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.separator,
    marginBottom: 16,
  },
  formTitle: { fontSize: 16, fontFamily: "Inter_600SemiBold", color: Colors.textPrimary },
  input: {
    backgroundColor: Colors.navyMid,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.separator,
  },
  formNote: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: Colors.textMuted,
    fontStyle: "italic",
    lineHeight: 18,
  },
  submitBtn: {
    backgroundColor: Colors.teal,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  submitBtnText: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: Colors.white },
  section: { marginTop: 8 },
  sectionTitle: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    color: Colors.textSecondary,
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 10,
  },
  circleCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.navyLight,
    borderRadius: 16,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.separator,
    gap: 12,
  },
  circleAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.tealMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  circleInitial: { fontSize: 18, fontFamily: "Inter_700Bold", color: Colors.tealLight },
  circleInfo: { flex: 1 },
  circleMemberName: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: Colors.textPrimary },
  circleGroup: { fontSize: 12, fontFamily: "Inter_400Regular", color: Colors.textSecondary, marginTop: 2 },
  circleStreakWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.goldMuted + "33",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  circleStreak: { fontSize: 16, fontFamily: "Inter_700Bold", color: Colors.gold },
  removeBtn: { padding: 4 },
  emptyState: { alignItems: "center", paddingTop: 60, gap: 12 },
  emptyTitle: { fontSize: 18, fontFamily: "Inter_600SemiBold", color: Colors.textSecondary },
  emptyText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: Colors.textMuted,
    textAlign: "center",
    paddingHorizontal: 20,
    lineHeight: 22,
  },
  emptyBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 16,
    backgroundColor: Colors.tealMuted,
    borderWidth: 1,
    borderColor: Colors.teal,
    marginTop: 8,
  },
  emptyBtnText: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: Colors.textPrimary },
});
