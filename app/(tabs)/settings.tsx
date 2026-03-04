import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TextInput,
  Pressable,
  Platform,
  ActivityIndicator,
  Alert,
  Linking,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import Constants from "expo-constants";
import { useApp } from "@/context/AppContext";
import { useCommunity } from "@/context/CommunityContext";
import { useTheme, ThemeColors } from "@/context/ThemeContext";
import { Colors } from "@/constants/colors";
import { requestNotificationPermission } from "@/services/notificationService";
import { ThemeMode, AppLanguage } from "@/context/AppContext";

const LANGUAGES: { code: AppLanguage; label: string; nativeLabel: string }[] = [
  { code: "en", label: "English", nativeLabel: "English" },
  { code: "ar", label: "Arabic", nativeLabel: "\u0627\u0644\u0639\u0631\u0628\u064A\u0629" },
  { code: "ur", label: "Urdu", nativeLabel: "\u0627\u0631\u062F\u0648" },
  { code: "fr", label: "French", nativeLabel: "Fran\u00E7ais" },
  { code: "tr", label: "Turkish", nativeLabel: "T\u00FCrk\u00E7e" },
  { code: "ms", label: "Malay", nativeLabel: "Bahasa Melayu" },
];


function getDynamicStyles(c: ThemeColors) {
  return {
    sectionCard: { backgroundColor: c.navyLight, borderColor: c.separator },
    sectionCardTitle: { color: c.textPrimary },
    sectionCardBody: { borderTopColor: c.separator },
    sectionIconWrap: { backgroundColor: c.tealMuted + "44" },
    settingLabel: { color: c.textPrimary },
    settingSub: { color: c.textMuted },
    fieldLabel: { color: c.textSecondary },
    fieldHint: { color: c.textMuted },
    chip: { backgroundColor: c.navyMid, borderColor: c.separator },
    chipActive: { backgroundColor: c.tealMuted, borderColor: c.teal },
    chipText: { color: c.textMuted },
    chipTextActive: { color: c.textPrimary },
    divider: { backgroundColor: c.separator },
    input: { backgroundColor: c.navyMid, color: c.textPrimary, borderColor: c.separator },
  };
}

const CALC_METHODS: { id: number; label: string }[] = [
  { id: 1, label: "University of Islamic Sciences, Karachi" },
  { id: 2, label: "Islamic Society of North America (ISNA)" },
  { id: 3, label: "Muslim World League" },
  { id: 4, label: "Umm Al-Qura University, Makkah" },
  { id: 5, label: "Egyptian General Authority" },
  { id: 7, label: "Institute of Geophysics, Tehran" },
  { id: 8, label: "Gulf Region" },
  { id: 9, label: "Kuwait" },
  { id: 10, label: "Qatar" },
  { id: 11, label: "Majlis Ugama Islam Singapura" },
  { id: 12, label: "UOIF (France)" },
  { id: 13, label: "JAKIM (Malaysia)" },
  { id: 14, label: "Tunisia" },
  { id: 15, label: "Turkey (Diyanet)" },
];

function SettingRow({
  icon,
  label,
  subtitle,
  children,
  color,
}: {
  icon: string;
  label: string;
  subtitle?: string;
  children: React.ReactNode;
  color?: string;
}) {
  return (
    <View style={styles.settingRow}>
      <View style={styles.settingLeft}>
        <Ionicons name={icon as any} size={20} color={color || Colors.tealLight} />
        <View style={styles.settingLabelWrap}>
          <Text style={styles.settingLabel}>{label}</Text>
          {subtitle ? <Text style={styles.settingSub}>{subtitle}</Text> : null}
        </View>
      </View>
      {children}
    </View>
  );
}

function NavRow({ icon, label, onPress, color, subtitle }: { icon: string; label: string; onPress: () => void; color?: string; subtitle?: string }) {
  return (
    <Pressable style={styles.navRow} onPress={onPress}>
      <View style={styles.settingLeft}>
        <Ionicons name={icon as any} size={20} color={color || Colors.tealLight} />
        <View style={styles.settingLabelWrap}>
          <Text style={styles.settingLabel}>{label}</Text>
          {subtitle ? <Text style={styles.settingSub}>{subtitle}</Text> : null}
        </View>
      </View>
      <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
    </Pressable>
  );
}

function SectionCard({
  icon,
  title,
  expanded,
  onToggle,
  children,
  testID,
}: {
  icon: string;
  title: string;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  testID?: string;
}) {
  return (
    <View style={styles.sectionCard}>
      <Pressable testID={testID} style={styles.sectionCardHeader} onPress={onToggle}>
        <View style={styles.sectionCardLeft}>
          <View style={styles.sectionIconWrap}>
            <Ionicons name={icon as any} size={18} color={Colors.teal} />
          </View>
          <Text style={styles.sectionCardTitle}>{title}</Text>
        </View>
        <Ionicons name={expanded ? "chevron-up" : "chevron-down"} size={18} color={Colors.textMuted} />
      </Pressable>
      {expanded && <View style={styles.sectionCardBody}>{children}</View>}
    </View>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { settings, updateSettings, refreshPrayerTimes, streak, prayerTimes, clearAllData } = useApp();
  const { profile, updateProfile, clearCommunityData } = useCommunity();
  const { colors } = useTheme();

  const [expanded, setExpanded] = useState<string>("prayer");
  const [cityInput, setCityInput] = useState(settings.city);
  const [cityLoading, setCityLoading] = useState(false);
  const [cityError, setCityError] = useState<string | null>(null);
  const [displayNameInput, setDisplayNameInput] = useState(profile?.displayName || "");
  const [showLangPicker, setShowLangPicker] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [toastVisible, setToastVisible] = useState(false);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : 0;

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2000);
  }, []);

  const toggleSection = (key: string) => {
    setExpanded((prev) => (prev === key ? "" : key));
  };

  const handleCitySubmit = useCallback(async () => {
    if (!cityInput.trim()) return;
    setCityLoading(true);
    setCityError(null);
    try {
      await updateSettings({ city: cityInput.trim() });
      await refreshPrayerTimes();
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      showToast("Location updated");
    } catch {
      setCityError("City not found. Try another spelling.");
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setCityLoading(false);
    }
  }, [cityInput, updateSettings, refreshPrayerTimes, showToast]);

  const handleToggle = useCallback(
    async (key: keyof typeof settings, val: boolean) => {
      await Haptics.selectionAsync();
      if (key === "notificationsEnabled" && val) {
        const granted = await requestNotificationPermission();
        if (!granted) {
          Alert.alert("Permission required", "Enable notifications in your device settings.");
          return;
        }
      }
      await updateSettings({ [key]: val });
      showToast("Settings saved");
    },
    [settings, updateSettings, showToast]
  );

  const handleSelect = useCallback(
    async (key: keyof typeof settings, val: number) => {
      await Haptics.selectionAsync();
      await updateSettings({ [key]: val });
      showToast("Settings saved");
    },
    [updateSettings, showToast]
  );

  const handleSendFeedback = useCallback(async () => {
    await Haptics.selectionAsync();
    const appVersion = Constants.expoConfig?.version || "1.1";
    const subject = encodeURIComponent(`SalahLock Feedback - v${appVersion}`);
    const body = encodeURIComponent(`\n\nApp Version: ${appVersion}\nPlatform: ${Platform.OS}`);
    const url = `mailto:support@salahlock.app?subject=${subject}&body=${body}`;
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        Alert.alert("Email Not Available", "Please email support@salahlock.app with your feedback.");
      }
    } catch {
      Alert.alert("Email Not Available", "Please email support@salahlock.app with your feedback.");
    }
  }, []);

  const handleResetOnboarding = useCallback(() => {
    Alert.alert(
      "Reset Onboarding",
      "Are you sure you want to restart setup? The welcome screens will appear on next launch.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          onPress: async () => {
            await updateSettings({ onboardingCompleted: false });
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            showToast("Onboarding reset. Restart to see it.");
          },
        },
      ]
    );
  }, [updateSettings, showToast]);

  const handleDeleteAccount = useCallback(() => {
    Alert.alert(
      "Delete Account",
      "This will remove all your local data including prayer records, streaks, and community profile. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await clearAllData();
            if (clearCommunityData) await clearCommunityData();
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            showToast("All data cleared");
          },
        },
      ]
    );
  }, [clearAllData, clearCommunityData, showToast]);

  const handleThemeChange = useCallback(
    async (mode: ThemeMode) => {
      await Haptics.selectionAsync();
      await updateSettings({ themeMode: mode, darkMode: mode === "dark" });
      showToast("Theme updated");
    },
    [updateSettings, showToast]
  );

  const handleLanguageChange = useCallback(
    async (lang: AppLanguage) => {
      await Haptics.selectionAsync();
      await updateSettings({ language: lang });
      setShowLangPicker(false);
      showToast("Language saved");
    },
    [updateSettings, showToast]
  );

  const currentLang = LANGUAGES.find((l) => l.code === (settings.language || "en")) || LANGUAGES[0];

  const ds = getDynamicStyles(colors);

  return (
    <View style={[styles.container, { paddingTop: topPad, backgroundColor: colors.navy }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: botPad + 120 }}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>Settings</Text>
        </View>

        <View style={[styles.profileCard, { backgroundColor: colors.navyLight, borderColor: colors.goldMuted + "55" }]}>
          <View style={styles.profileIconWrap}>
            <Ionicons name="person" size={28} color={Colors.gold} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.profileName}>{profile?.displayName || "My Prayer Profile"}</Text>
            <Text style={styles.profileStats}>
              {streak} day streak {settings.city ? `· ${settings.city}` : ""}
            </Text>
          </View>
        </View>

        <View style={styles.sections}>
          {/* SECTION 1 — Prayer & Lock */}
          <SectionCard
            testID="section-prayer"
            icon="time-outline"
            title="Prayer & Lock"
            expanded={expanded === "prayer"}
            onToggle={() => toggleSection("prayer")}
          >
            <Text style={styles.fieldLabel}>Calculation Method</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.methodScroll}>
              <View style={styles.methodRow}>
                {CALC_METHODS.map((m) => (
                  <Pressable
                    key={m.id}
                    style={[styles.methodChip, settings.calculationMethod === m.id && styles.methodChipActive]}
                    onPress={() => handleSelect("calculationMethod", m.id)}
                  >
                    <Text
                      style={[styles.methodChipText, settings.calculationMethod === m.id && styles.methodChipTextActive]}
                      numberOfLines={1}
                    >
                      {m.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>

            <Divider />

            <SettingRow icon="lock-closed-outline" label="Auto prayer lock" subtitle="Lock device during prayer time">
              <Switch
                value={settings.lockEnabled}
                onValueChange={(v) => handleToggle("lockEnabled", v)}
                trackColor={{ false: Colors.separator, true: Colors.teal }}
                thumbColor={Colors.white}
              />
            </SettingRow>

            {settings.lockEnabled && (
              <>
                <Text style={styles.fieldLabel}>Lock duration</Text>
                <View style={styles.chipRow}>
                  {[5, 7, 10].map((dur) => (
                    <Pressable
                      key={dur}
                      style={[styles.chip, settings.lockDuration === dur && styles.chipActive]}
                      onPress={() => handleSelect("lockDuration", dur)}
                    >
                      <Text style={[styles.chipText, settings.lockDuration === dur && styles.chipTextActive]}>
                        {dur} min
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </>
            )}

            <Divider />

            <SettingRow icon="key-outline" label="Emergency unlock" subtitle="Allow limited emergency unlock uses">
              <Switch
                value={settings.emergencyUnlockEnabled}
                onValueChange={(v) => handleToggle("emergencyUnlockEnabled", v)}
                trackColor={{ false: Colors.separator, true: Colors.teal }}
                thumbColor={Colors.white}
              />
            </SettingRow>

            <Divider />

            <Text style={styles.fieldLabel}>Pre-prayer reminder</Text>
            <View style={styles.chipRow}>
              {[5, 10, 15].map((min) => (
                <Pressable
                  key={min}
                  style={[styles.chip, settings.prePrayerMinutes === min && styles.chipActive]}
                  onPress={() => handleSelect("prePrayerMinutes", min)}
                >
                  <Text style={[styles.chipText, settings.prePrayerMinutes === min && styles.chipTextActive]}>
                    {min}m before
                  </Text>
                </Pressable>
              ))}
            </View>

            <Divider />

            <SettingRow icon="volume-mute-outline" label="Silent mode during prayer" subtitle="Mute notifications while praying">
              <Switch
                value={settings.silentDuringPrayer}
                onValueChange={(v) => handleToggle("silentDuringPrayer", v)}
                trackColor={{ false: Colors.separator, true: Colors.teal }}
                thumbColor={Colors.white}
              />
            </SettingRow>
          </SectionCard>

          {/* SECTION 2 — Location & Community */}
          <SectionCard
            testID="section-location"
            icon="location-outline"
            title="Location & Community"
            expanded={expanded === "location"}
            onToggle={() => toggleSection("location")}
          >
            <Text style={styles.fieldLabel}>City / Location</Text>
            <Text style={styles.fieldHint}>Enter a city for prayer times. Leave empty to use GPS.</Text>
            <View style={styles.cityRow}>
              <TextInput
                style={styles.cityInput}
                value={cityInput}
                onChangeText={setCityInput}
                placeholder="e.g. New York, London, Cairo"
                placeholderTextColor={Colors.textMuted}
                returnKeyType="done"
                onSubmitEditing={handleCitySubmit}
                autoCorrect={false}
              />
              <Pressable
                style={[styles.cityBtn, cityLoading && { opacity: 0.6 }]}
                onPress={handleCitySubmit}
                disabled={cityLoading}
              >
                {cityLoading ? (
                  <ActivityIndicator size="small" color={Colors.textPrimary} />
                ) : (
                  <Ionicons name="search" size={18} color={Colors.textPrimary} />
                )}
              </Pressable>
            </View>
            {cityError && <Text style={styles.cityError}>{cityError}</Text>}
            {prayerTimes.length > 0 && (
              <Text style={styles.citySuccess}>{prayerTimes.length} prayer times loaded</Text>
            )}

            <Divider />

            <Text style={styles.fieldLabel}>Community Space Preference</Text>
            <Text style={styles.fieldHint}>Controls which groups and content you see</Text>
            <View style={styles.chipRow}>
              {(["general", "brothers", "sisters"] as const).map((pref) => {
                const current = profile?.communityPreference || "general";
                return (
                  <Pressable
                    key={pref}
                    style={[styles.chip, current === pref && styles.chipActive]}
                    onPress={async () => {
                      await Haptics.selectionAsync();
                      await updateProfile({ communityPreference: pref });
                    }}
                  >
                    <Text style={[styles.chipText, current === pref && styles.chipTextActive]}>
                      {pref.charAt(0).toUpperCase() + pref.slice(1)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Divider />

            <Text style={styles.fieldLabel}>Discovery Radius</Text>
            <View style={styles.chipRow}>
              {[10, 25, 50, 100].map((r) => (
                <Pressable
                  key={r}
                  style={[styles.chip, settings.discoveryRadius === r && styles.chipActive]}
                  onPress={() => handleSelect("discoveryRadius", r)}
                >
                  <Text style={[styles.chipText, settings.discoveryRadius === r && styles.chipTextActive]}>
                    {r} km
                  </Text>
                </Pressable>
              ))}
            </View>

            <Divider />

            <SettingRow icon="eye-outline" label="Visible in group discovery" subtitle="Others can find you in nearby groups">
              <Switch
                value={settings.visibleInDiscovery}
                onValueChange={(v) => handleToggle("visibleInDiscovery", v)}
                trackColor={{ false: Colors.separator, true: Colors.teal }}
                thumbColor={Colors.white}
              />
            </SettingRow>
          </SectionCard>

          {/* SECTION 3 — Notifications & Reminders */}
          <SectionCard
            testID="section-notifications"
            icon="notifications-outline"
            title="Notifications & Reminders"
            expanded={expanded === "notifications"}
            onToggle={() => toggleSection("notifications")}
          >
            <SettingRow icon="notifications-outline" label="Prayer reminders">
              <Switch
                value={settings.notificationsEnabled}
                onValueChange={(v) => handleToggle("notificationsEnabled", v)}
                trackColor={{ false: Colors.separator, true: Colors.teal }}
                thumbColor={Colors.white}
              />
            </SettingRow>

            <Divider />

            <SettingRow icon="book-outline" label="Daily ayah reminder">
              <Switch
                value={settings.dailyAyahReminder}
                onValueChange={(v) => handleToggle("dailyAyahReminder", v)}
                trackColor={{ false: Colors.separator, true: Colors.teal }}
                thumbColor={Colors.white}
              />
            </SettingRow>

            <SettingRow icon="reader-outline" label="Hadith reminder">
              <Switch
                value={settings.hadithReminder}
                onValueChange={(v) => handleToggle("hadithReminder", v)}
                trackColor={{ false: Colors.separator, true: Colors.teal }}
                thumbColor={Colors.white}
              />
            </SettingRow>

            <Divider />

            <SettingRow icon="people-outline" label="Group reminders">
              <Switch
                value={settings.groupReminders}
                onValueChange={(v) => handleToggle("groupReminders", v)}
                trackColor={{ false: Colors.separator, true: Colors.teal }}
                thumbColor={Colors.white}
              />
            </SettingRow>

            <SettingRow icon="calendar-outline" label="Event notifications">
              <Switch
                value={settings.eventNotifications}
                onValueChange={(v) => handleToggle("eventNotifications", v)}
                trackColor={{ false: Colors.separator, true: Colors.teal }}
                thumbColor={Colors.white}
              />
            </SettingRow>

            <SettingRow icon="megaphone-outline" label="Masjid announcements">
              <Switch
                value={settings.masjidAnnouncements}
                onValueChange={(v) => handleToggle("masjidAnnouncements", v)}
                trackColor={{ false: Colors.separator, true: Colors.teal }}
                thumbColor={Colors.white}
              />
            </SettingRow>

            <SettingRow icon="flame-outline" label="Streak reminders" subtitle="Stay motivated to keep your streak">
              <Switch
                value={settings.streakReminders}
                onValueChange={(v) => handleToggle("streakReminders", v)}
                trackColor={{ false: Colors.separator, true: Colors.teal }}
                thumbColor={Colors.white}
              />
            </SettingRow>

            <Divider />

            <SettingRow icon="moon-outline" label="Quiet hours" subtitle={settings.quietHoursEnabled ? `${settings.quietHoursStart} – ${settings.quietHoursEnd}` : "Off"}>
              <Switch
                value={settings.quietHoursEnabled}
                onValueChange={(v) => handleToggle("quietHoursEnabled", v)}
                trackColor={{ false: Colors.separator, true: Colors.teal }}
                thumbColor={Colors.white}
              />
            </SettingRow>

            {settings.quietHoursEnabled && (
              <View style={styles.quietHoursRow}>
                <View style={styles.quietHoursField}>
                  <Text style={styles.quietLabel}>Start</Text>
                  <TextInput
                    style={styles.timeInput}
                    value={settings.quietHoursStart}
                    onChangeText={(v) => updateSettings({ quietHoursStart: v })}
                    placeholder="22:00"
                    placeholderTextColor={Colors.textMuted}
                    maxLength={5}
                  />
                </View>
                <View style={styles.quietHoursField}>
                  <Text style={styles.quietLabel}>End</Text>
                  <TextInput
                    style={styles.timeInput}
                    value={settings.quietHoursEnd}
                    onChangeText={(v) => updateSettings({ quietHoursEnd: v })}
                    placeholder="06:00"
                    placeholderTextColor={Colors.textMuted}
                    maxLength={5}
                  />
                </View>
              </View>
            )}
          </SectionCard>

          {/* SECTION 4 — Account & Privacy */}
          <SectionCard
            testID="section-account"
            icon="person-outline"
            title="Account & Privacy"
            expanded={expanded === "account"}
            onToggle={() => toggleSection("account")}
          >
            <Text style={styles.fieldLabel}>Display Name</Text>
            <View style={styles.cityRow}>
              <TextInput
                style={styles.cityInput}
                value={displayNameInput}
                onChangeText={setDisplayNameInput}
                placeholder="Your display name"
                placeholderTextColor={Colors.textMuted}
                maxLength={30}
                onBlur={() => {
                  if (displayNameInput.trim() && displayNameInput.trim() !== profile?.displayName) {
                    updateProfile({ displayName: displayNameInput.trim() });
                  }
                }}
                returnKeyType="done"
                onSubmitEditing={() => {
                  if (displayNameInput.trim() && displayNameInput.trim() !== profile?.displayName) {
                    updateProfile({ displayName: displayNameInput.trim() });
                  }
                }}
              />
            </View>

            <Divider />

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Account Type</Text>
              <View style={styles.accountBadge}>
                <Ionicons
                  name={profile?.accountType === "masjid" ? "business" : "person"}
                  size={14}
                  color={Colors.teal}
                />
                <Text style={styles.accountBadgeText}>
                  {profile?.accountType === "masjid" ? "Masjid" : "Personal"}
                </Text>
              </View>
            </View>

            <Divider />

            <SettingRow icon="moon" label="Ramadan Mode" color={Colors.gold}>
              <Switch
                value={settings.ramadanManualToggle ? settings.ramadanMode : false}
                onValueChange={async (v) => {
                  await updateSettings({ ramadanManualToggle: true, ramadanMode: v });
                  Haptics.selectionAsync();
                }}
                trackColor={{ false: Colors.separator, true: Colors.gold }}
                thumbColor={Colors.white}
              />
            </SettingRow>
            <Text style={styles.fieldHint}>Auto-detects Ramadan dates. Toggle for manual override.</Text>

            <Divider />

            <NavRow
              icon="people-outline"
              label="Accountability Circles"
              subtitle="Share prayer streaks with friends"
              onPress={() => { router.push("/circles"); Haptics.selectionAsync(); }}
            />

            <Divider />

            <NavRow
              icon="flag-outline"
              label="Report a Group"
              subtitle="Report inappropriate content"
              onPress={() => Alert.alert("Report", "Report feature will be available in a future update.")}
              color={Colors.textMuted}
            />

            <Divider />

            <Pressable
              style={styles.dangerRow}
              onPress={handleDeleteAccount}
            >
              <Ionicons name="trash-outline" size={18} color={Colors.danger} />
              <Text style={styles.dangerText}>Delete Account Data</Text>
            </Pressable>
          </SectionCard>

          {/* SECTION 5 — App Experience */}
          <SectionCard
            testID="section-experience"
            icon="color-palette-outline"
            title="App Experience"
            expanded={expanded === "experience"}
            onToggle={() => toggleSection("experience")}
          >
            <Text style={styles.fieldLabel}>Theme</Text>
            <View style={styles.chipRow}>
              {([
                { val: "light" as ThemeMode, label: "Light", icon: "sunny-outline" },
                { val: "dark" as ThemeMode, label: "Dark", icon: "moon-outline" },
                { val: "system" as ThemeMode, label: "System", icon: "phone-portrait-outline" },
              ]).map((opt) => (
                <Pressable
                  key={opt.val}
                  style={[styles.chip, (settings.themeMode || "dark") === opt.val && styles.chipActive]}
                  onPress={() => handleThemeChange(opt.val)}
                >
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                    <Ionicons
                      name={opt.icon as any}
                      size={14}
                      color={(settings.themeMode || "dark") === opt.val ? Colors.textPrimary : Colors.textMuted}
                    />
                    <Text style={[styles.chipText, (settings.themeMode || "dark") === opt.val && styles.chipTextActive]}>
                      {opt.label}
                    </Text>
                  </View>
                </Pressable>
              ))}
            </View>

            <Divider />

            <Text style={styles.fieldLabel}>Font Size</Text>
            <View style={styles.chipRow}>
              {[
                { val: 0, label: "Small" },
                { val: 1, label: "Default" },
                { val: 2, label: "Large" },
              ].map((opt) => (
                <Pressable
                  key={opt.val}
                  style={[styles.chip, settings.fontSize === opt.val && styles.chipActive]}
                  onPress={() => handleSelect("fontSize", opt.val)}
                >
                  <Text style={[styles.chipText, settings.fontSize === opt.val && styles.chipTextActive]}>
                    {opt.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Divider />

            <NavRow
              icon="language-outline"
              label="Language"
              subtitle={currentLang.label}
              onPress={() => {
                Haptics.selectionAsync();
                setShowLangPicker(!showLangPicker);
              }}
            />
            {showLangPicker && (
              <View style={styles.langPickerWrap}>
                {LANGUAGES.map((lang) => (
                  <Pressable
                    key={lang.code}
                    style={[
                      styles.langOption,
                      (settings.language || "en") === lang.code && styles.langOptionActive,
                    ]}
                    onPress={() => handleLanguageChange(lang.code)}
                  >
                    <Text
                      style={[
                        styles.langOptionText,
                        (settings.language || "en") === lang.code && styles.langOptionTextActive,
                      ]}
                    >
                      {lang.label}
                    </Text>
                    <Text
                      style={[
                        styles.langOptionNative,
                        (settings.language || "en") === lang.code && styles.langOptionTextActive,
                      ]}
                    >
                      {lang.nativeLabel}
                    </Text>
                    {(settings.language || "en") === lang.code && (
                      <Ionicons name="checkmark" size={18} color={Colors.teal} />
                    )}
                  </Pressable>
                ))}
              </View>
            )}

            <Divider />

            <NavRow
              icon="refresh-outline"
              label="Reset Onboarding"
              subtitle="Re-run the initial setup"
              onPress={handleResetOnboarding}
            />

            <Divider />

            <NavRow
              icon="chatbubble-ellipses-outline"
              label="Send Feedback"
              subtitle="support@salahlock.app"
              onPress={handleSendFeedback}
            />

            <Divider />

            <View style={styles.aboutSection}>
              <View style={styles.aboutIconWrap}>
                <Ionicons name="moon" size={20} color={Colors.gold} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.aboutTitle}>SalahLock</Text>
                <Text style={styles.aboutVersion}>Version {Constants.expoConfig?.version || "1.1"}</Text>
                <Text style={styles.aboutDesc}>
                  Prayer times via Aladhan API. Built with love for the ummah.
                </Text>
              </View>
            </View>
          </SectionCard>
        </View>
      </ScrollView>
      {toastVisible && (
        <View style={toastStyles.toastWrap}>
          <View style={toastStyles.toast}>
            <Ionicons name="checkmark-circle" size={16} color="#FFFFFF" />
            <Text style={toastStyles.toastText}>{toastMsg}</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.navy },
  header: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16 },
  title: { fontSize: 28, fontFamily: "Inter_700Bold", color: Colors.textPrimary },
  profileCard: {
    marginHorizontal: 20,
    backgroundColor: Colors.navyLight,
    borderRadius: 20,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    borderWidth: 1,
    borderColor: Colors.goldMuted + "55",
    marginBottom: 12,
  },
  profileIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.goldMuted + "33",
    alignItems: "center",
    justifyContent: "center",
  },
  profileName: { fontSize: 16, fontFamily: "Inter_600SemiBold", color: Colors.textPrimary },
  profileStats: { fontSize: 13, fontFamily: "Inter_400Regular", color: Colors.gold, marginTop: 2 },
  sections: { paddingHorizontal: 20, gap: 10 },
  sectionCard: {
    backgroundColor: Colors.navyLight,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.separator,
    overflow: "hidden",
  },
  sectionCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  sectionCardLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  sectionIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: Colors.tealMuted + "44",
    alignItems: "center",
    justifyContent: "center",
  },
  sectionCardTitle: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: Colors.textPrimary,
  },
  sectionCardBody: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.separator,
    paddingTop: 14,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  navRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  settingLeft: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  settingLabelWrap: { flex: 1 },
  settingLabel: { fontSize: 15, fontFamily: "Inter_500Medium", color: Colors.textPrimary },
  settingSub: { fontSize: 12, fontFamily: "Inter_400Regular", color: Colors.textMuted, marginTop: 1 },
  divider: { height: 1, backgroundColor: Colors.separator, marginVertical: 12 },
  fieldLabel: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: Colors.textSecondary, marginBottom: 8 },
  fieldHint: { fontSize: 12, fontFamily: "Inter_400Regular", color: Colors.textMuted, marginBottom: 10 },
  chipRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  chip: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: Colors.navyMid,
    borderWidth: 1,
    borderColor: Colors.separator,
  },
  chipActive: { backgroundColor: Colors.tealMuted, borderColor: Colors.teal },
  chipText: { fontSize: 13, fontFamily: "Inter_500Medium", color: Colors.textMuted },
  chipTextActive: { color: Colors.textPrimary },
  methodScroll: { marginBottom: 4 },
  methodRow: { flexDirection: "row", gap: 8, paddingRight: 16 },
  methodChip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: Colors.navyMid,
    borderWidth: 1,
    borderColor: Colors.separator,
  },
  methodChipActive: { backgroundColor: Colors.tealMuted, borderColor: Colors.teal },
  methodChipText: { fontSize: 12, fontFamily: "Inter_500Medium", color: Colors.textMuted, maxWidth: 180 },
  methodChipTextActive: { color: Colors.textPrimary },
  cityRow: { flexDirection: "row", gap: 10, alignItems: "center" },
  cityInput: {
    flex: 1,
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
  cityBtn: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: Colors.teal,
    alignItems: "center",
    justifyContent: "center",
  },
  cityError: { fontSize: 12, fontFamily: "Inter_400Regular", color: Colors.danger, marginTop: 8 },
  citySuccess: { fontSize: 12, fontFamily: "Inter_400Regular", color: Colors.success, marginTop: 8 },
  quietHoursRow: { flexDirection: "row", gap: 12, marginTop: 8 },
  quietHoursField: { flex: 1, gap: 4 },
  quietLabel: { fontSize: 12, fontFamily: "Inter_500Medium", color: Colors.textMuted },
  timeInput: {
    backgroundColor: Colors.navyMid,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    fontFamily: "Inter_500Medium",
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.separator,
    textAlign: "center",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  infoLabel: { fontSize: 15, fontFamily: "Inter_500Medium", color: Colors.textPrimary },
  accountBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.tealMuted + "44",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  accountBadgeText: { fontSize: 13, fontFamily: "Inter_500Medium", color: Colors.tealLight },
  dangerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 8,
  },
  dangerText: { fontSize: 15, fontFamily: "Inter_500Medium", color: Colors.danger },
  aboutSection: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
  },
  aboutIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.goldMuted + "33",
    alignItems: "center",
    justifyContent: "center",
  },
  aboutTitle: { fontSize: 16, fontFamily: "Inter_700Bold", color: Colors.textPrimary },
  aboutVersion: { fontSize: 12, fontFamily: "Inter_500Medium", color: Colors.gold, marginTop: 2 },
  aboutDesc: { fontSize: 12, fontFamily: "Inter_400Regular", color: Colors.textMuted, marginTop: 4, lineHeight: 18 },
  langPickerWrap: {
    marginTop: 8,
    backgroundColor: Colors.navyMid,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.separator,
    overflow: "hidden",
  },
  langOption: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.separator,
  },
  langOptionActive: {
    backgroundColor: Colors.tealMuted + "44",
  },
  langOptionText: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    color: Colors.textPrimary,
    flex: 1,
  },
  langOptionNative: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: Colors.textMuted,
    marginRight: 10,
  },
  langOptionTextActive: {
    color: Colors.tealLight,
  },
});

const toastStyles = StyleSheet.create({
  toastWrap: {
    position: "absolute",
    bottom: 100,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 999,
  },
  toast: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.teal,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  toastText: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    color: "#FFFFFF",
  },
});
