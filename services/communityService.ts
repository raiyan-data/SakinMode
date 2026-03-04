import AsyncStorage from "@react-native-async-storage/async-storage";

const KEYS = {
  GROUPS: "salahlock_community_groups",
  MY_GROUPS: "salahlock_my_groups",
  EVENTS: "salahlock_community_events",
  ANNOUNCEMENTS: "salahlock_community_announcements",
  COMMUNITY_PROFILE: "salahlock_community_profile",
};

export type CommunityPreference = "brothers" | "sisters" | "general";
export type GroupType = "general" | "brothers" | "sisters";
export type AccountType = "user" | "masjid";

export interface CommunityProfile {
  userId: string;
  displayName: string;
  city: string;
  communityPreference: CommunityPreference;
  accountType: AccountType;
  createdAt: string;
}

export interface Group {
  groupId: string;
  groupName: string;
  description: string;
  city: string;
  groupType: GroupType;
  creatorId: string;
  memberList: string[];
  memberCount: number;
  inviteCode: string;
  maxMembers: number;
  createdAt: string;
}

export interface GroupReminder {
  reminderId: string;
  groupId: string;
  senderId: string;
  senderName: string;
  message: string;
  timestamp: string;
}

export interface CommunityEvent {
  eventId: string;
  title: string;
  description: string;
  locationName: string;
  city: string;
  dateTime: string;
  organizerId: string;
  organizerName: string;
  organizerType: AccountType;
  visibility: CommunityPreference;
  attendeesCount: number;
  rsvpList: string[];
  interestedList: string[];
  createdAt: string;
}

export interface Announcement {
  announcementId: string;
  title: string;
  message: string;
  authorId: string;
  authorName: string;
  authorType: AccountType;
  visibility: CommunityPreference;
  city: string;
  createdAt: string;
}

function generateId(): string {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

function generateInviteCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export async function getCommunityProfile(): Promise<CommunityProfile | null> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.COMMUNITY_PROFILE);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function saveCommunityProfile(profile: CommunityProfile): Promise<void> {
  await AsyncStorage.setItem(KEYS.COMMUNITY_PROFILE, JSON.stringify(profile));
}

export async function createCommunityProfile(
  displayName: string,
  city: string,
  preference: CommunityPreference
): Promise<CommunityProfile> {
  const profile: CommunityProfile = {
    userId: generateId(),
    displayName,
    city,
    communityPreference: preference,
    accountType: "user",
    createdAt: new Date().toISOString(),
  };
  await saveCommunityProfile(profile);
  return profile;
}

export async function getAllGroups(): Promise<Group[]> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.GROUPS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

async function saveAllGroups(groups: Group[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.GROUPS, JSON.stringify(groups));
}

export async function getMyGroupIds(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.MY_GROUPS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

async function saveMyGroupIds(ids: string[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.MY_GROUPS, JSON.stringify(ids));
}

export async function createGroup(
  name: string,
  description: string,
  city: string,
  groupType: GroupType,
  creatorId: string,
  maxMembers: number = 50
): Promise<Group> {
  const group: Group = {
    groupId: generateId(),
    groupName: name,
    description,
    city,
    groupType,
    creatorId,
    memberList: [creatorId],
    memberCount: 1,
    inviteCode: generateInviteCode(),
    maxMembers,
    createdAt: new Date().toISOString(),
  };
  const all = await getAllGroups();
  all.push(group);
  await saveAllGroups(all);
  const myIds = await getMyGroupIds();
  myIds.push(group.groupId);
  await saveMyGroupIds(myIds);
  return group;
}

export async function joinGroupByInvite(
  inviteCode: string,
  userId: string
): Promise<{ success: boolean; group?: Group; error?: string }> {
  const all = await getAllGroups();
  const group = all.find((g) => g.inviteCode.toUpperCase() === inviteCode.toUpperCase());
  if (!group) return { success: false, error: "Group not found. Check the invite code." };
  if (group.memberList.includes(userId)) return { success: false, error: "You are already a member." };
  if (group.memberCount >= group.maxMembers) return { success: false, error: "Group is full." };
  group.memberList.push(userId);
  group.memberCount = group.memberList.length;
  await saveAllGroups(all);
  const myIds = await getMyGroupIds();
  if (!myIds.includes(group.groupId)) {
    myIds.push(group.groupId);
    await saveMyGroupIds(myIds);
  }
  return { success: true, group };
}

export async function leaveGroup(groupId: string, userId: string): Promise<void> {
  const all = await getAllGroups();
  const group = all.find((g) => g.groupId === groupId);
  if (group) {
    group.memberList = group.memberList.filter((id) => id !== userId);
    group.memberCount = group.memberList.length;
    await saveAllGroups(all);
  }
  const myIds = await getMyGroupIds();
  await saveMyGroupIds(myIds.filter((id) => id !== groupId));
}

export async function discoverGroups(
  city: string,
  preference: CommunityPreference,
  userId: string
): Promise<Group[]> {
  const all = await getAllGroups();
  return all.filter((g) => {
    const cityMatch = g.city.toLowerCase().trim() === city.toLowerCase().trim();
    const typeMatch = preference === "general" || g.groupType === "general" || g.groupType === preference;
    const notMember = !g.memberList.includes(userId);
    const notFull = g.memberCount < g.maxMembers;
    return cityMatch && typeMatch && notMember && notFull;
  });
}

export async function getMyGroups(userId: string): Promise<Group[]> {
  const all = await getAllGroups();
  const myIds = await getMyGroupIds();
  return all.filter((g) => myIds.includes(g.groupId) || g.memberList.includes(userId));
}

function getRemindersKey(groupId: string): string {
  return `salahlock_reminders_${groupId}`;
}

export async function getGroupReminders(groupId: string): Promise<GroupReminder[]> {
  try {
    const raw = await AsyncStorage.getItem(getRemindersKey(groupId));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function sendGroupReminder(
  groupId: string,
  senderId: string,
  senderName: string,
  message: string
): Promise<{ success: boolean; error?: string }> {
  if (message.length > 280) return { success: false, error: "Message too long (280 chars max)." };
  const reminders = await getGroupReminders(groupId);
  const today = new Date().toISOString().split("T")[0];
  const todayReminders = reminders.filter(
    (r) => r.senderId === senderId && r.timestamp.startsWith(today)
  );
  if (todayReminders.length >= 3) return { success: false, error: "Daily reminder limit reached (3/day)." };
  const reminder: GroupReminder = {
    reminderId: generateId(),
    groupId,
    senderId,
    senderName,
    message,
    timestamp: new Date().toISOString(),
  };
  reminders.unshift(reminder);
  const trimmed = reminders.slice(0, 100);
  await AsyncStorage.setItem(getRemindersKey(groupId), JSON.stringify(trimmed));
  return { success: true };
}

export async function getAllEvents(): Promise<CommunityEvent[]> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.EVENTS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function createEvent(
  title: string,
  description: string,
  locationName: string,
  city: string,
  dateTime: string,
  organizerId: string,
  organizerName: string,
  organizerType: AccountType,
  visibility: CommunityPreference = "general"
): Promise<CommunityEvent> {
  const event: CommunityEvent = {
    eventId: generateId(),
    title,
    description,
    locationName,
    city,
    dateTime,
    organizerId,
    organizerName,
    organizerType,
    visibility,
    attendeesCount: 0,
    rsvpList: [],
    interestedList: [],
    createdAt: new Date().toISOString(),
  };
  const all = await getAllEvents();
  all.push(event);
  await AsyncStorage.setItem(KEYS.EVENTS, JSON.stringify(all));
  return event;
}

export async function rsvpEvent(eventId: string, userId: string): Promise<void> {
  const all = await getAllEvents();
  const event = all.find((e) => e.eventId === eventId);
  if (!event) return;
  if (event.rsvpList.includes(userId)) {
    event.rsvpList = event.rsvpList.filter((id) => id !== userId);
  } else {
    event.rsvpList.push(userId);
    event.interestedList = event.interestedList.filter((id) => id !== userId);
  }
  event.attendeesCount = event.rsvpList.length;
  await AsyncStorage.setItem(KEYS.EVENTS, JSON.stringify(all));
}

export async function markInterested(eventId: string, userId: string): Promise<void> {
  const all = await getAllEvents();
  const event = all.find((e) => e.eventId === eventId);
  if (!event) return;
  if (event.interestedList.includes(userId)) {
    event.interestedList = event.interestedList.filter((id) => id !== userId);
  } else {
    event.interestedList.push(userId);
    event.rsvpList = event.rsvpList.filter((id) => id !== userId);
    event.attendeesCount = event.rsvpList.length;
  }
  await AsyncStorage.setItem(KEYS.EVENTS, JSON.stringify(all));
}

export async function getUpcomingEvents(city: string, preference: CommunityPreference = "general"): Promise<CommunityEvent[]> {
  const all = await getAllEvents();
  const now = new Date().toISOString();
  return all
    .filter((e) => {
      const cityMatch = e.city.toLowerCase().trim() === city.toLowerCase().trim();
      const timeMatch = e.dateTime >= now;
      const visMatch = !e.visibility || e.visibility === "general" || e.visibility === preference || preference === "general";
      return cityMatch && timeMatch && visMatch;
    })
    .sort((a, b) => a.dateTime.localeCompare(b.dateTime));
}

export async function getAllAnnouncements(): Promise<Announcement[]> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.ANNOUNCEMENTS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function createAnnouncement(
  title: string,
  message: string,
  authorId: string,
  authorName: string,
  authorType: AccountType,
  city: string,
  visibility: CommunityPreference = "general"
): Promise<Announcement> {
  const announcement: Announcement = {
    announcementId: generateId(),
    title,
    message,
    authorId,
    authorName,
    authorType,
    visibility,
    city,
    createdAt: new Date().toISOString(),
  };
  const all = await getAllAnnouncements();
  all.unshift(announcement);
  await AsyncStorage.setItem(KEYS.ANNOUNCEMENTS, JSON.stringify(all.slice(0, 50)));
  return announcement;
}

export async function getLocalAnnouncements(city: string, preference: CommunityPreference = "general"): Promise<Announcement[]> {
  const all = await getAllAnnouncements();
  return all.filter((a) => {
    const cityMatch = a.city.toLowerCase().trim() === city.toLowerCase().trim();
    const visMatch = !a.visibility || a.visibility === "general" || a.visibility === preference || preference === "general" || a.authorType === "masjid";
    return cityMatch && visMatch;
  });
}
