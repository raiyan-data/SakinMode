import { PrayerName, PrayerTime, PRAYER_NAMES, parseTimeToToday } from "@/constants/prayers";

const ALADHAN_BASE = "https://api.aladhan.com/v1";

export interface AladhanTimings {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Sunset: string;
  Maghrib: string;
  Isha: string;
  Imsak: string;
  Midnight: string;
  [key: string]: string;
}

export async function fetchPrayerTimesByCoords(
  lat: number,
  lon: number
): Promise<PrayerTime[]> {
  const url = `${ALADHAN_BASE}/timings?latitude=${lat}&longitude=${lon}&method=2`;
  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to fetch prayer times");
  const data = await response.json();
  return parsePrayerTimes(data.data.timings);
}

export async function fetchPrayerTimesByCity(
  city: string,
  country: string = "US"
): Promise<PrayerTime[]> {
  const url = `${ALADHAN_BASE}/timingsByCity?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}&method=2`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch prayer times for ${city}`);
  const data = await response.json();
  if (data.code !== 200) throw new Error(data.status || "Invalid city");
  return parsePrayerTimes(data.data.timings);
}

function parsePrayerTimes(timings: AladhanTimings): PrayerTime[] {
  const prayerTimes: PrayerTime[] = [];
  for (const name of PRAYER_NAMES) {
    const rawTime = timings[name];
    if (!rawTime) continue;
    const cleaned = rawTime.replace(/\s*\(.*\)/, "");
    const [hourStr, minStr] = cleaned.split(":");
    const hour = parseInt(hourStr, 10);
    const min = parseInt(minStr, 10);
    const now = new Date();
    const dt = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, min, 0);
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    const ampm = hour < 12 ? "AM" : "PM";
    const timeStr = `${displayHour}:${String(min).padStart(2, "0")} ${ampm}`;
    prayerTimes.push({
      name,
      time: timeStr,
      timestamp: dt.getTime(),
    });
  }
  return prayerTimes;
}

export function getNextPrayer(prayers: PrayerTime[]): PrayerTime | null {
  const now = Date.now();
  const upcoming = prayers.filter((p) => p.timestamp > now);
  return upcoming.length > 0 ? upcoming[0] : null;
}

export function getCurrentPrayer(prayers: PrayerTime[]): PrayerTime | null {
  const now = Date.now();
  const passed = prayers.filter((p) => p.timestamp <= now);
  return passed.length > 0 ? passed[passed.length - 1] : null;
}
