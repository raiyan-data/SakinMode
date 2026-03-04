import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { PrayerTime } from "@/constants/prayers";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function requestNotificationPermission(): Promise<boolean> {
  if (Platform.OS === "web") return false;
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === "granted") return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

export async function schedulePrePrayerNotifications(
  prayers: PrayerTime[],
  minutesBefore: number = 10,
  enabled: boolean = true
): Promise<void> {
  if (Platform.OS === "web" || !enabled) return;
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    const now = Date.now();
    for (const prayer of prayers) {
      const notifyAt = prayer.timestamp - minutesBefore * 60 * 1000;
      if (notifyAt > now) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: `${prayer.name} is approaching`,
            body: "Prayer time is approaching — begin wrapping up.",
            data: { type: "pre-prayer", prayer: prayer.name },
          },
          trigger: { date: new Date(notifyAt) } as any,
        });
      }
      if (prayer.timestamp > now) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: `Time for ${prayer.name}`,
            body: `Allahu Akbar — ${prayer.name} time has begun.`,
            data: { type: "prayer-time", prayer: prayer.name },
          },
          trigger: { date: new Date(prayer.timestamp) } as any,
        });
      }
    }
  } catch (e) {
    console.warn("schedulePrePrayerNotifications error:", e);
  }
}

export async function scheduleMissedPrayerReminder(
  prayerName: string,
  delayMinutes: number = 30
): Promise<void> {
  if (Platform.OS === "web") return;
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "A gentle reminder",
        body: `Did you get a chance to pray ${prayerName}? It's okay — Allah's mercy is vast. Don't miss the next one.`,
        data: { type: "missed-prayer", prayer: prayerName },
      },
      trigger: { seconds: delayMinutes * 60, repeats: false } as any,
    });
  } catch (e) {
    console.warn("scheduleMissedPrayerReminder error:", e);
  }
}

export async function scheduleSuhoorReminder(suhoorTime: number): Promise<void> {
  if (Platform.OS === "web") return;
  try {
    const notifyAt = suhoorTime - 20 * 60 * 1000;
    if (notifyAt <= Date.now()) return;
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Suhoor time",
        body: "Rise for suhoor — eat and make intention for your fast today.",
        data: { type: "suhoor" },
      },
      trigger: { date: new Date(notifyAt) } as any,
    });
  } catch (e) {
    console.warn("scheduleSuhoorReminder error:", e);
  }
}

export async function scheduleIftarReminder(iftarTime: number): Promise<void> {
  if (Platform.OS === "web") return;
  try {
    const notifyAt = iftarTime - 5 * 60 * 1000;
    if (notifyAt <= Date.now()) return;
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Iftar in 5 minutes",
        body: "Prepare to break your fast. Allahumma inni laka sumtu...",
        data: { type: "iftar" },
      },
      trigger: { date: new Date(notifyAt) } as any,
    });
  } catch (e) {
    console.warn("scheduleIftarReminder error:", e);
  }
}
