export const PRAYER_NAMES = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"] as const;
export type PrayerName = (typeof PRAYER_NAMES)[number];

export interface PrayerTime {
  name: PrayerName;
  time: string;
  timestamp: number;
}

export interface PrayerRecord {
  date: string;
  prayers: Partial<Record<PrayerName, boolean>>;
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function parseTimeToToday(timeStr: string): Date {
  const [time, period] = timeStr.split(" ");
  const [hourStr, minStr] = time.split(":");
  let hour = parseInt(hourStr, 10);
  const min = parseInt(minStr, 10);
  if (period === "PM" && hour !== 12) hour += 12;
  if (period === "AM" && hour === 12) hour = 0;
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, min, 0);
}

export function formatCountdown(seconds: number): string {
  if (seconds <= 0) return "00:00:00";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return [h, m, s].map((v) => String(v).padStart(2, "0")).join(":");
}

export function getTodayDateKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export const PRAYER_ICONS: Record<PrayerName, { icon: string; color: string }> = {
  Fajr: { icon: "moon-outline", color: "#6B8CAE" },
  Dhuhr: { icon: "sunny", color: "#E0B06B" },
  Asr: { icon: "partly-sunny", color: "#D4854A" },
  Maghrib: { icon: "cloudy-night", color: "#C05A6A" },
  Isha: { icon: "moon", color: "#7B6FA0" },
};
