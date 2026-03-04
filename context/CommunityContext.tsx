import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  CommunityProfile,
  CommunityPreference,
  Group,
  GroupReminder,
  CommunityEvent,
  Announcement,
  getCommunityProfile,
  createCommunityProfile,
  saveCommunityProfile,
  getMyGroups,
  discoverGroups,
  createGroup as createGroupService,
  joinGroupByInvite,
  leaveGroup as leaveGroupService,
  getGroupReminders,
  sendGroupReminder,
  getUpcomingEvents,
  createEvent as createEventService,
  rsvpEvent as rsvpEventService,
  markInterested as markInterestedService,
  getLocalAnnouncements,
  createAnnouncement as createAnnouncementService,
  GroupType,
  AccountType,
} from "@/services/communityService";
import { useApp } from "./AppContext";

interface CommunityContextValue {
  profile: CommunityProfile | null;
  profileLoading: boolean;
  myGroups: Group[];
  nearbyGroups: Group[];
  events: CommunityEvent[];
  announcements: Announcement[];
  setupProfile: (displayName: string, preference: CommunityPreference) => Promise<void>;
  updateProfile: (updates: Partial<CommunityProfile>) => Promise<void>;
  refreshGroups: () => Promise<void>;
  refreshEvents: () => Promise<void>;
  refreshAnnouncements: () => Promise<void>;
  createGroup: (name: string, description: string, groupType: GroupType) => Promise<Group>;
  joinGroup: (inviteCode: string) => Promise<{ success: boolean; error?: string }>;
  leaveGroup: (groupId: string) => Promise<void>;
  loadReminders: (groupId: string) => Promise<GroupReminder[]>;
  sendReminder: (groupId: string, message: string) => Promise<{ success: boolean; error?: string }>;
  createEvent: (title: string, description: string, locationName: string, dateTime: string) => Promise<CommunityEvent>;
  rsvpEvent: (eventId: string) => Promise<void>;
  markInterested: (eventId: string) => Promise<void>;
  createAnnouncement: (title: string, message: string) => Promise<Announcement>;
  clearCommunityData: () => Promise<void>;
}

const CommunityContext = createContext<CommunityContextValue | null>(null);

export function CommunityProvider({ children }: { children: ReactNode }) {
  const { settings } = useApp();
  const [profile, setProfile] = useState<CommunityProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [myGroups, setMyGroups] = useState<Group[]>([]);
  const [nearbyGroups, setNearbyGroups] = useState<Group[]>([]);
  const [events, setEvents] = useState<CommunityEvent[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    setProfileLoading(true);
    try {
      const p = await getCommunityProfile();
      setProfile(p);
      if (p) {
        await Promise.all([
          loadMyGroups(p),
          loadNearbyGroups(p),
          loadEvents(p.city, p.communityPreference),
          loadAnnouncements(p.city, p.communityPreference),
        ]);
      }
    } catch {}
    setProfileLoading(false);
  }

  async function loadMyGroups(p: CommunityProfile) {
    const groups = await getMyGroups(p.userId);
    setMyGroups(groups);
  }

  async function loadNearbyGroups(p: CommunityProfile) {
    const groups = await discoverGroups(p.city, p.communityPreference, p.userId);
    setNearbyGroups(groups);
  }

  async function loadEvents(city: string, preference: CommunityPreference = "general") {
    const evts = await getUpcomingEvents(city, preference);
    setEvents(evts);
  }

  async function loadAnnouncements(city: string, preference: CommunityPreference = "general") {
    const anns = await getLocalAnnouncements(city, preference);
    setAnnouncements(anns);
  }

  const setupProfile = useCallback(async (displayName: string, preference: CommunityPreference) => {
    const city = settings.city || "Unknown";
    const p = await createCommunityProfile(displayName, city, preference);
    setProfile(p);
  }, [settings.city]);

  const updateProfileCb = useCallback(async (updates: Partial<CommunityProfile>) => {
    if (!profile) return;
    const updated = { ...profile, ...updates };
    await saveCommunityProfile(updated);
    setProfile(updated);
    if (updates.communityPreference || updates.city) {
      await Promise.all([
        loadNearbyGroups(updated),
        loadEvents(updated.city, updated.communityPreference),
        loadAnnouncements(updated.city, updated.communityPreference),
      ]);
    }
  }, [profile]);

  const refreshGroups = useCallback(async () => {
    if (!profile) return;
    const updated = { ...profile, city: settings.city || profile.city };
    if (updated.city !== profile.city) {
      await saveCommunityProfile(updated);
      setProfile(updated);
    }
    await Promise.all([loadMyGroups(updated), loadNearbyGroups(updated)]);
  }, [profile, settings.city]);

  const refreshEvents = useCallback(async () => {
    const city = profile?.city || settings.city || "";
    const pref = profile?.communityPreference || "general";
    await loadEvents(city, pref);
  }, [profile, settings.city]);

  const refreshAnnouncements = useCallback(async () => {
    const city = profile?.city || settings.city || "";
    const pref = profile?.communityPreference || "general";
    await loadAnnouncements(city, pref);
  }, [profile, settings.city]);

  const createGroupCb = useCallback(async (name: string, description: string, groupType: GroupType) => {
    if (!profile) throw new Error("Profile required");
    const group = await createGroupService(name, description, profile.city, groupType, profile.userId);
    await refreshGroups();
    return group;
  }, [profile, refreshGroups]);

  const joinGroupCb = useCallback(async (inviteCode: string) => {
    if (!profile) return { success: false, error: "Profile required" };
    const result = await joinGroupByInvite(inviteCode, profile.userId);
    if (result.success) await refreshGroups();
    return result;
  }, [profile, refreshGroups]);

  const leaveGroupCb = useCallback(async (groupId: string) => {
    if (!profile) return;
    await leaveGroupService(groupId, profile.userId);
    await refreshGroups();
  }, [profile, refreshGroups]);

  const loadReminders = useCallback(async (groupId: string) => {
    return await getGroupReminders(groupId);
  }, []);

  const sendReminderCb = useCallback(async (groupId: string, message: string) => {
    if (!profile) return { success: false, error: "Profile required" };
    const result = await sendGroupReminder(groupId, profile.userId, profile.displayName, message);
    return result;
  }, [profile]);

  const createEventCb = useCallback(async (title: string, description: string, locationName: string, dateTime: string) => {
    if (!profile) throw new Error("Profile required");
    const event = await createEventService(title, description, locationName, profile.city, dateTime, profile.userId, profile.displayName, profile.accountType);
    await refreshEvents();
    return event;
  }, [profile, refreshEvents]);

  const rsvpEventCb = useCallback(async (eventId: string) => {
    if (!profile) return;
    await rsvpEventService(eventId, profile.userId);
    await refreshEvents();
  }, [profile, refreshEvents]);

  const markInterestedCb = useCallback(async (eventId: string) => {
    if (!profile) return;
    await markInterestedService(eventId, profile.userId);
    await refreshEvents();
  }, [profile, refreshEvents]);

  const createAnnouncementCb = useCallback(async (title: string, message: string) => {
    if (!profile) throw new Error("Profile required");
    const ann = await createAnnouncementService(title, message, profile.userId, profile.displayName, profile.accountType, profile.city);
    await refreshAnnouncements();
    return ann;
  }, [profile, refreshAnnouncements]);

  const clearCommunityData = useCallback(async () => {
    await AsyncStorage.multiRemove([
      "salahlock_community_groups",
      "salahlock_community_events",
      "salahlock_community_announcements",
      "salahlock_community_profile",
    ]);
    setProfile(null);
    setMyGroups([]);
    setNearbyGroups([]);
    setEvents([]);
    setAnnouncements([]);
  }, []);

  const value = useMemo<CommunityContextValue>(() => ({
    profile,
    profileLoading,
    myGroups,
    nearbyGroups,
    events,
    announcements,
    setupProfile,
    updateProfile: updateProfileCb,
    refreshGroups,
    refreshEvents,
    refreshAnnouncements,
    createGroup: createGroupCb,
    joinGroup: joinGroupCb,
    leaveGroup: leaveGroupCb,
    loadReminders,
    sendReminder: sendReminderCb,
    createEvent: createEventCb,
    rsvpEvent: rsvpEventCb,
    markInterested: markInterestedCb,
    createAnnouncement: createAnnouncementCb,
    clearCommunityData,
  }), [
    profile, profileLoading, myGroups, nearbyGroups, events, announcements,
    setupProfile, updateProfileCb, refreshGroups, refreshEvents, refreshAnnouncements,
    createGroupCb, joinGroupCb, leaveGroupCb, loadReminders, sendReminderCb,
    createEventCb, rsvpEventCb, markInterestedCb, createAnnouncementCb, clearCommunityData,
  ]);

  return <CommunityContext.Provider value={value}>{children}</CommunityContext.Provider>;
}

export function useCommunity() {
  const ctx = useContext(CommunityContext);
  if (!ctx) throw new Error("useCommunity must be used within CommunityProvider");
  return ctx;
}
