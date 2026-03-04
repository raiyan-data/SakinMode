import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { PrayerTime, PrayerRecord, PrayerName, getTodayDateKey } from "@/constants/prayers";
import {
  fetchPrayerTimesByCoords,
  fetchPrayerTimesByCity,
  getNextPrayer,
  getCurrentPrayer,
} from "@/services/prayerService";
import {
  requestNotificationPermission,
  schedulePrePrayerNotifications,
  scheduleMissedPrayerReminder,
} from "@/services/notificationService";
import { isRamadan } from "@/services/ramadanService";

const STORAGE_KEYS = {
  PRAYER_RECORDS: "salahlock_prayer_records",
  SETTINGS: "salahlock_settings",
  CACHED_PRAYERS: "salahlock_cached_prayers",
  EMERGENCY_UNLOCKS: "salahlock_emergency_unlocks",
  FOCUS_STATS: "salahlock_focus_stats",
  RAMADAN_DATA: "salahlock_ramadan_data",
  CIRCLES: "salahlock_circles",
};

export type ThemeMode = "light" | "dark" | "system";
export type AppLanguage = "en" | "ar" | "ur" | "fr" | "tr" | "ms";

export interface Settings {
  city: string;
  notificationsEnabled: boolean;
  prePrayerMinutes: number;
  lockDuration: number;
  darkMode: boolean;
  lockEnabled: boolean;
  ramadanMode: boolean;
  ramadanManualToggle: boolean;
  calculationMethod: number;
  emergencyUnlockEnabled: boolean;
  silentDuringPrayer: boolean;
  discoveryRadius: number;
  visibleInDiscovery: boolean;
  dailyAyahReminder: boolean;
  hadithReminder: boolean;
  groupReminders: boolean;
  eventNotifications: boolean;
  masjidAnnouncements: boolean;
  streakReminders: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
  fontSize: number;
  themeMode: ThemeMode;
  language: AppLanguage;
  onboardingCompleted: boolean;
}

const DEFAULT_SETTINGS: Settings = {
  city: "",
  notificationsEnabled: true,
  prePrayerMinutes: 10,
  lockDuration: 10,
  darkMode: true,
  lockEnabled: true,
  ramadanMode: false,
  ramadanManualToggle: false,
  calculationMethod: 2,
  emergencyUnlockEnabled: true,
  silentDuringPrayer: false,
  discoveryRadius: 25,
  visibleInDiscovery: true,
  dailyAyahReminder: true,
  hadithReminder: true,
  groupReminders: true,
  eventNotifications: true,
  masjidAnnouncements: true,
  streakReminders: true,
  quietHoursEnabled: false,
  quietHoursStart: "22:00",
  quietHoursEnd: "06:00",
  fontSize: 1,
  themeMode: "dark",
  language: "en",
  onboardingCompleted: false,
};

export interface FocusStats {
  totalMinutesBlocked: number;
  totalLockSessions: number;
  lastUpdated: string;
}

export interface RamadanData {
  fastDays: string[];
  quranJuzRead: number[];
  taraweehDays: string[];
}

export interface Circle {
  id: string;
  name: string;
  memberName: string;
  streak: number;
  joinedDate: string;
}

const DEFAULT_FOCUS: FocusStats = { totalMinutesBlocked: 0, totalLockSessions: 0, lastUpdated: "" };
const DEFAULT_RAMADAN: RamadanData = { fastDays: [], quranJuzRead: [], taraweehDays: [] };

interface AppContextValue {
  prayerTimes: PrayerTime[];
  prayerLoading: boolean;
  prayerError: string | null;
  nextPrayer: PrayerTime | null;
  currentPrayer: PrayerTime | null;
  todayRecord: PrayerRecord;
  streak: number;
  allRecords: PrayerRecord[];
  settings: Settings;
  emergencyUnlocksToday: number;
  isLocked: boolean;
  focusStats: FocusStats;
  ramadanData: RamadanData;
  circles: Circle[];
  missedPrayers: PrayerName[];
  isRamadanActive: boolean;
  markPrayed: (prayer: PrayerName) => Promise<void>;
  updateSettings: (s: Partial<Settings>) => Promise<void>;
  refreshPrayerTimes: (lat?: number, lon?: number) => Promise<void>;
  useEmergencyUnlock: () => boolean;
  setIsLocked: (v: boolean) => void;
  recordLockSession: (minutes: number) => Promise<void>;
  markFastDay: (date: string) => Promise<void>;
  toggleJuzRead: (juz: number) => Promise<void>;
  markTaraweeh: (date: string) => Promise<void>;
  addCircle: (name: string, memberName: string) => Promise<void>;
  removeCircle: (id: string) => Promise<void>;
  clearAllData: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [prayerTimes, setPrayerTimes] = useState<PrayerTime[]>([]);
  const [prayerLoading, setPrayerLoading] = useState(false);
  const [prayerError, setPrayerError] = useState<string | null>(null);
  const [todayRecord, setTodayRecord] = useState<PrayerRecord>({
    date: getTodayDateKey(),
    prayers: {},
  });
  const [streak, setStreak] = useState(0);
  const [allRecords, setAllRecords] = useState<PrayerRecord[]>([]);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [emergencyUnlocksToday, setEmergencyUnlocksToday] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [focusStats, setFocusStats] = useState<FocusStats>(DEFAULT_FOCUS);
  const [ramadanData, setRamadanData] = useState<RamadanData>(DEFAULT_RAMADAN);
  const [circles, setCircles] = useState<Circle[]>([]);

  const nextPrayer = useMemo(() => getNextPrayer(prayerTimes), [prayerTimes]);
  const currentPrayer = useMemo(() => getCurrentPrayer(prayerTimes), [prayerTimes]);

  const isRamadanActive = useMemo(() => {
    if (settings.ramadanManualToggle) return settings.ramadanMode;
    return isRamadan();
  }, [settings.ramadanMode, settings.ramadanManualToggle]);

  const missedPrayers = useMemo<PrayerName[]>(() => {
    const now = Date.now();
    return prayerTimes
      .filter((p) => p.timestamp < now && !todayRecord.prayers[p.name])
      .map((p) => p.name);
  }, [prayerTimes, todayRecord]);

  useEffect(() => {
    loadStoredData();
  }, []);

  async function loadStoredData() {
    try {
      const [recordsRaw, settingsRaw, cachedPrayersRaw, unlockRaw, focusRaw, ramadanRaw, circlesRaw] =
        await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.PRAYER_RECORDS),
          AsyncStorage.getItem(STORAGE_KEYS.SETTINGS),
          AsyncStorage.getItem(STORAGE_KEYS.CACHED_PRAYERS),
          AsyncStorage.getItem(STORAGE_KEYS.EMERGENCY_UNLOCKS),
          AsyncStorage.getItem(STORAGE_KEYS.FOCUS_STATS),
          AsyncStorage.getItem(STORAGE_KEYS.RAMADAN_DATA),
          AsyncStorage.getItem(STORAGE_KEYS.CIRCLES),
        ]);

      const parsedSettings: Settings = settingsRaw
        ? { ...DEFAULT_SETTINGS, ...JSON.parse(settingsRaw) }
        : DEFAULT_SETTINGS;
      setSettings(parsedSettings);

      if (cachedPrayersRaw) setPrayerTimes(JSON.parse(cachedPrayersRaw));

      const today = getTodayDateKey();
      const records: PrayerRecord[] = recordsRaw ? JSON.parse(recordsRaw) : [];
      setAllRecords(records);
      const todayRec = records.find((r) => r.date === today) || { date: today, prayers: {} };
      setTodayRecord(todayRec);
      setStreak(computeStreak(records));

      if (unlockRaw) {
        const { date, count } = JSON.parse(unlockRaw);
        setEmergencyUnlocksToday(date === today ? count : 0);
      }

      if (focusRaw) setFocusStats(JSON.parse(focusRaw));
      if (ramadanRaw) setRamadanData(JSON.parse(ramadanRaw));
      if (circlesRaw) setCircles(JSON.parse(circlesRaw));
    } catch (e) {
      console.error("loadStoredData error", e);
    }
  }

  function computeStreak(records: PrayerRecord[]): number {
    let s = 0;
    const checkDate = new Date();
    const today = getTodayDateKey();
    for (let i = 0; i < 365; i++) {
      const key = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, "0")}-${String(checkDate.getDate()).padStart(2, "0")}`;
      const rec = records.find((r) => r.date === key);
      if (!rec) {
        if (key === today) {
          checkDate.setDate(checkDate.getDate() - 1);
          continue;
        }
        break;
      }
      const count = Object.values(rec.prayers).filter(Boolean).length;
      if (count >= 5) s++;
      else if (key !== today) break;
      checkDate.setDate(checkDate.getDate() - 1);
    }
    return s;
  }

  const refreshPrayerTimes = useCallback(
    async (lat?: number, lon?: number) => {
      setPrayerLoading(true);
      setPrayerError(null);
      try {
        let times: PrayerTime[];
        if (lat !== undefined && lon !== undefined) {
          times = await fetchPrayerTimesByCoords(lat, lon);
        } else {
          const s = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
          const parsed: Settings = s ? { ...DEFAULT_SETTINGS, ...JSON.parse(s) } : DEFAULT_SETTINGS;
          if (parsed.city) {
            times = await fetchPrayerTimesByCity(parsed.city);
          } else {
            throw new Error("No location available");
          }
        }
        setPrayerTimes(times);
        await AsyncStorage.setItem(STORAGE_KEYS.CACHED_PRAYERS, JSON.stringify(times));

        const s = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
        const parsed: Settings = s ? { ...DEFAULT_SETTINGS, ...JSON.parse(s) } : DEFAULT_SETTINGS;
        if (parsed.notificationsEnabled) {
          const granted = await requestNotificationPermission();
          if (granted) {
            await schedulePrePrayerNotifications(times, parsed.prePrayerMinutes, true);
          }
        }
      } catch (e: any) {
        setPrayerError(e.message || "Failed to load prayer times");
      } finally {
        setPrayerLoading(false);
      }
    },
    []
  );

  const markPrayed = useCallback(
    async (prayer: PrayerName) => {
      const today = getTodayDateKey();
      const updated: PrayerRecord = {
        date: today,
        prayers: { ...todayRecord.prayers, [prayer]: true },
      };
      setTodayRecord(updated);
      const newRecords = allRecords.filter((r) => r.date !== today);
      newRecords.push(updated);
      newRecords.sort((a, b) => b.date.localeCompare(a.date));
      setAllRecords(newRecords);
      setStreak(computeStreak(newRecords));
      await AsyncStorage.setItem(STORAGE_KEYS.PRAYER_RECORDS, JSON.stringify(newRecords));
    },
    [todayRecord, allRecords]
  );

  const updateSettings = useCallback(
    async (s: Partial<Settings>) => {
      const updated = { ...settings, ...s };
      setSettings(updated);
      await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
    },
    [settings]
  );

  const useEmergencyUnlock = useCallback(() => {
    if (emergencyUnlocksToday >= 2) return false;
    const newCount = emergencyUnlocksToday + 1;
    setEmergencyUnlocksToday(newCount);
    const today = getTodayDateKey();
    AsyncStorage.setItem(
      STORAGE_KEYS.EMERGENCY_UNLOCKS,
      JSON.stringify({ date: today, count: newCount })
    );
    setIsLocked(false);
    return true;
  }, [emergencyUnlocksToday]);

  const recordLockSession = useCallback(
    async (minutes: number) => {
      const updated: FocusStats = {
        totalMinutesBlocked: focusStats.totalMinutesBlocked + minutes,
        totalLockSessions: focusStats.totalLockSessions + 1,
        lastUpdated: getTodayDateKey(),
      };
      setFocusStats(updated);
      await AsyncStorage.setItem(STORAGE_KEYS.FOCUS_STATS, JSON.stringify(updated));
    },
    [focusStats]
  );

  const markFastDay = useCallback(
    async (date: string) => {
      const updated = {
        ...ramadanData,
        fastDays: ramadanData.fastDays.includes(date)
          ? ramadanData.fastDays.filter((d) => d !== date)
          : [...ramadanData.fastDays, date],
      };
      setRamadanData(updated);
      await AsyncStorage.setItem(STORAGE_KEYS.RAMADAN_DATA, JSON.stringify(updated));
    },
    [ramadanData]
  );

  const toggleJuzRead = useCallback(
    async (juz: number) => {
      const updated = {
        ...ramadanData,
        quranJuzRead: ramadanData.quranJuzRead.includes(juz)
          ? ramadanData.quranJuzRead.filter((j) => j !== juz)
          : [...ramadanData.quranJuzRead, juz],
      };
      setRamadanData(updated);
      await AsyncStorage.setItem(STORAGE_KEYS.RAMADAN_DATA, JSON.stringify(updated));
    },
    [ramadanData]
  );

  const markTaraweeh = useCallback(
    async (date: string) => {
      const updated = {
        ...ramadanData,
        taraweehDays: ramadanData.taraweehDays.includes(date)
          ? ramadanData.taraweehDays.filter((d) => d !== date)
          : [...ramadanData.taraweehDays, date],
      };
      setRamadanData(updated);
      await AsyncStorage.setItem(STORAGE_KEYS.RAMADAN_DATA, JSON.stringify(updated));
    },
    [ramadanData]
  );

  const addCircle = useCallback(
    async (name: string, memberName: string) => {
      const newCircle: Circle = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        name,
        memberName,
        streak: Math.floor(Math.random() * 15),
        joinedDate: getTodayDateKey(),
      };
      const updated = [...circles, newCircle];
      setCircles(updated);
      await AsyncStorage.setItem(STORAGE_KEYS.CIRCLES, JSON.stringify(updated));
    },
    [circles]
  );

  const removeCircle = useCallback(
    async (id: string) => {
      const updated = circles.filter((c) => c.id !== id);
      setCircles(updated);
      await AsyncStorage.setItem(STORAGE_KEYS.CIRCLES, JSON.stringify(updated));
    },
    [circles]
  );

  const clearAllData = useCallback(async () => {
    await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
    setPrayerTimes([]);
    setTodayRecord({ date: getTodayDateKey(), prayers: {} });
    setStreak(0);
    setAllRecords([]);
    setSettings(DEFAULT_SETTINGS);
    setEmergencyUnlocksToday(0);
    setIsLocked(false);
    setFocusStats(DEFAULT_FOCUS);
    setRamadanData(DEFAULT_RAMADAN);
    setCircles([]);
  }, []);

  const value = useMemo<AppContextValue>(
    () => ({
      prayerTimes,
      prayerLoading,
      prayerError,
      nextPrayer,
      currentPrayer,
      todayRecord,
      streak,
      allRecords,
      settings,
      emergencyUnlocksToday,
      isLocked,
      focusStats,
      ramadanData,
      circles,
      missedPrayers,
      isRamadanActive,
      markPrayed,
      updateSettings,
      refreshPrayerTimes,
      useEmergencyUnlock,
      setIsLocked,
      recordLockSession,
      markFastDay,
      toggleJuzRead,
      markTaraweeh,
      addCircle,
      removeCircle,
      clearAllData,
    }),
    [
      prayerTimes,
      prayerLoading,
      prayerError,
      nextPrayer,
      currentPrayer,
      todayRecord,
      streak,
      allRecords,
      settings,
      emergencyUnlocksToday,
      isLocked,
      focusStats,
      ramadanData,
      circles,
      missedPrayers,
      isRamadanActive,
      markPrayed,
      updateSettings,
      refreshPrayerTimes,
      useEmergencyUnlock,
      recordLockSession,
      markFastDay,
      toggleJuzRead,
      markTaraweeh,
      addCircle,
      removeCircle,
      clearAllData,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
