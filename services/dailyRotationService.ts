import AsyncStorage from "@react-native-async-storage/async-storage";
import { AYAHS, HADITHS, DAILY_ACTIONS, AyahEntry, HadithEntry, DailyAction } from "@/constants/ayahs";

const STORAGE_KEY_ROTATION = "salahlock_daily_rotation";
const STORAGE_KEY_TODAY_STATE = "salahlock_today_state";
const STORAGE_KEY_TODAY_CONTENT = "salahlock_today_content_cache";

interface RotationState {
  recentAyahIds: number[];
  recentHadithIds: number[];
  recentActionIds: number[];
}

interface CachedContent {
  date: string;
  ayahId: number;
  hadithId: number;
  actionId: number;
}

export interface TodayContent {
  date: string;
  ayah: AyahEntry;
  hadith: HadithEntry;
  action: DailyAction;
}

export interface TodayState {
  date: string;
  reflected: boolean;
  actionCompleted: boolean;
  hadithSaved: boolean;
  totalReflections: number;
  actionStreak: number;
  lastActionDate: string;
}

const DEFAULT_TODAY_STATE: TodayState = {
  date: "",
  reflected: false,
  actionCompleted: false,
  hadithSaved: false,
  totalReflections: 0,
  actionStreak: 0,
  lastActionDate: "",
};

function getDateKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function seededRandom(seed: number): number {
  let s = seed;
  s = ((s >>> 0) * 1103515245 + 12345) >>> 0;
  return (s & 0x7fffffff) / 0x7fffffff;
}

function getNoRepeatWindow(poolSize: number): number {
  return Math.min(Math.floor(poolSize * 0.8), 90);
}

function pickFromPool<T extends { id: number }>(
  items: T[],
  recentIds: number[],
  daySeed: number,
  maxRecent: number
): T {
  const trimmedRecent = recentIds.slice(-maxRecent);
  const available = items.filter((i) => !trimmedRecent.includes(i.id));
  const pool = available.length > 0 ? available : items;
  const idx = Math.abs(Math.floor(seededRandom(daySeed) * pool.length)) % pool.length;
  return pool[idx];
}

export async function getTodayContent(): Promise<TodayContent> {
  const today = getDateKey();

  try {
    const cachedRaw = await AsyncStorage.getItem(STORAGE_KEY_TODAY_CONTENT);
    if (cachedRaw) {
      const cached: CachedContent = JSON.parse(cachedRaw);
      if (cached.date === today) {
        const ayah = AYAHS.find((a) => a.id === cached.ayahId) || AYAHS[0];
        const hadith = HADITHS.find((h) => h.id === cached.hadithId) || HADITHS[0];
        const action = DAILY_ACTIONS.find((a) => a.id === cached.actionId) || DAILY_ACTIONS[0];
        return { date: today, ayah, hadith, action };
      }
    }
  } catch {}

  const daySeed = new Date().getFullYear() * 1000 + Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  );

  let rotation: RotationState = { recentAyahIds: [], recentHadithIds: [], recentActionIds: [] };
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY_ROTATION);
    if (raw) rotation = JSON.parse(raw);
  } catch {}

  const ayahWindow = getNoRepeatWindow(AYAHS.length);
  const hadithWindow = getNoRepeatWindow(HADITHS.length);
  const actionWindow = getNoRepeatWindow(DAILY_ACTIONS.length);

  const ayah = pickFromPool(AYAHS, rotation.recentAyahIds, daySeed, ayahWindow);
  const hadith = pickFromPool(HADITHS, rotation.recentHadithIds, daySeed + 7919, hadithWindow);
  const action = pickFromPool(DAILY_ACTIONS, rotation.recentActionIds, daySeed + 104729, actionWindow);

  const newRotation: RotationState = {
    recentAyahIds: [...rotation.recentAyahIds.filter((id) => id !== ayah.id), ayah.id].slice(-ayahWindow),
    recentHadithIds: [...rotation.recentHadithIds.filter((id) => id !== hadith.id), hadith.id].slice(-hadithWindow),
    recentActionIds: [...rotation.recentActionIds.filter((id) => id !== action.id), action.id].slice(-actionWindow),
  };

  try {
    await AsyncStorage.multiSet([
      [STORAGE_KEY_ROTATION, JSON.stringify(newRotation)],
      [STORAGE_KEY_TODAY_CONTENT, JSON.stringify({ date: today, ayahId: ayah.id, hadithId: hadith.id, actionId: action.id } as CachedContent)],
    ]);
  } catch {}

  return { date: today, ayah, hadith, action };
}

export async function getTodayState(): Promise<TodayState> {
  const today = getDateKey();
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY_TODAY_STATE);
    if (raw) {
      const state: TodayState = { ...DEFAULT_TODAY_STATE, ...JSON.parse(raw) };
      if (state.date !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yKey = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, "0")}-${String(yesterday.getDate()).padStart(2, "0")}`;
        const streakContinues = state.lastActionDate === yKey && state.actionCompleted;
        return {
          ...DEFAULT_TODAY_STATE,
          date: today,
          totalReflections: state.totalReflections,
          actionStreak: streakContinues ? state.actionStreak : 0,
          lastActionDate: state.lastActionDate,
        };
      }
      return state;
    }
  } catch {}
  return { ...DEFAULT_TODAY_STATE, date: today };
}

export async function saveTodayState(state: TodayState): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY_TODAY_STATE, JSON.stringify(state));
  } catch {}
}
