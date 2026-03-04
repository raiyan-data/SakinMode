import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "@/constants/colors";
import { useTheme } from "@/context/ThemeContext";
import { useCommunity } from "@/context/CommunityContext";
import { CommunityPreference, GroupType, Group, GroupReminder } from "@/services/communityService";

type SectionTab = "groups" | "events" | "announcements";

export default function CommunityScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const {
    profile,
    profileLoading,
    myGroups,
    nearbyGroups,
    events,
    announcements,
    setupProfile,
    refreshGroups,
    refreshEvents,
    refreshAnnouncements,
    createGroup,
    joinGroup,
    leaveGroup,
    loadReminders,
    sendReminder,
    createEvent,
    rsvpEvent,
    markInterested,
    createAnnouncement,
  } = useCommunity();

  const [activeTab, setActiveTab] = useState<SectionTab>("groups");
  const [refreshing, setRefreshing] = useState(false);
  const webTopInset = Platform.OS === "web" ? 67 : 0;

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refreshGroups(), refreshEvents(), refreshAnnouncements()]);
    setRefreshing(false);
  }, [refreshGroups, refreshEvents, refreshAnnouncements]);

  if (profileLoading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top + webTopInset, backgroundColor: colors.navy }]}>
        <View style={styles.loadingCenter}>
          <ActivityIndicator size="large" color={Colors.gold} />
        </View>
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={[styles.container, { paddingTop: insets.top + webTopInset, backgroundColor: colors.navy }]}>
        <ProfileSetup onSetup={setupProfile} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top + webTopInset, backgroundColor: colors.navy }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Community</Text>
        <Text style={styles.headerSubtitle}>{profile.city}</Text>
      </View>

      <View style={styles.tabBar}>
        {(["groups", "events", "announcements"] as SectionTab[]).map((tab) => (
          <TouchableOpacity
            key={tab}
            testID={`tab-${tab}`}
            style={[styles.tabItem, activeTab === tab && styles.tabItemActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Ionicons
              name={tab === "groups" ? "people" : tab === "events" ? "calendar" : "megaphone"}
              size={16}
              color={activeTab === tab ? Colors.gold : Colors.textMuted}
            />
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        style={styles.scrollContent}
        contentContainerStyle={{ paddingBottom: Platform.OS === "web" ? 118 : 100 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.gold} />
        }
        showsVerticalScrollIndicator={false}
      >
        {activeTab === "groups" && (
          <GroupsSection
            myGroups={myGroups}
            nearbyGroups={nearbyGroups}
            profile={profile}
            onCreate={createGroup}
            onJoin={joinGroup}
            onLeave={leaveGroup}
            onLoadReminders={loadReminders}
            onSendReminder={sendReminder}
          />
        )}
        {activeTab === "events" && (
          <EventsSection
            events={events}
            profile={profile}
            onCreate={createEvent}
            onRsvp={rsvpEvent}
            onInterested={markInterested}
          />
        )}
        {activeTab === "announcements" && (
          <AnnouncementsSection
            announcements={announcements}
            profile={profile}
            onCreate={createAnnouncement}
          />
        )}
      </ScrollView>
    </View>
  );
}

function ProfileSetup({ onSetup }: { onSetup: (name: string, pref: CommunityPreference) => Promise<void> }) {
  const [name, setName] = useState("");
  const [preference, setPreference] = useState<CommunityPreference>("general");
  const [loading, setLoading] = useState(false);

  const handleSetup = async () => {
    if (!name.trim()) {
      Alert.alert("Name Required", "Please enter a display name.");
      return;
    }
    setLoading(true);
    await onSetup(name.trim(), preference);
    setLoading(false);
  };

  return (
    <View style={styles.setupContainer}>
      <Ionicons name="people-circle" size={64} color={Colors.teal} />
      <Text style={styles.setupTitle}>Join Your Community</Text>
      <Text style={styles.setupSubtitle}>
        Connect with Muslims in your area for prayer reminders, events, and community support.
      </Text>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Display Name</Text>
        <TextInput
          testID="profile-name-input"
          style={styles.textInput}
          value={name}
          onChangeText={setName}
          placeholder="Your name"
          placeholderTextColor={Colors.textMuted}
          maxLength={30}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Community Space</Text>
        <View style={styles.preferenceRow}>
          {(["general", "brothers", "sisters"] as CommunityPreference[]).map((pref) => (
            <TouchableOpacity
              key={pref}
              testID={`pref-${pref}`}
              style={[styles.prefButton, preference === pref && styles.prefButtonActive]}
              onPress={() => setPreference(pref)}
            >
              <Text style={[styles.prefText, preference === pref && styles.prefTextActive]}>
                {pref.charAt(0).toUpperCase() + pref.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity
        testID="setup-continue-btn"
        style={[styles.primaryButton, loading && styles.buttonDisabled]}
        onPress={handleSetup}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={Colors.navy} />
        ) : (
          <Text style={styles.primaryButtonText}>Continue</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

function GroupsSection({
  myGroups,
  nearbyGroups,
  profile,
  onCreate,
  onJoin,
  onLeave,
  onLoadReminders,
  onSendReminder,
}: {
  myGroups: Group[];
  nearbyGroups: Group[];
  profile: any;
  onCreate: (name: string, desc: string, type: GroupType) => Promise<Group>;
  onJoin: (code: string) => Promise<{ success: boolean; error?: string }>;
  onLeave: (id: string) => Promise<void>;
  onLoadReminders: (id: string) => Promise<GroupReminder[]>;
  onSendReminder: (id: string, msg: string) => Promise<{ success: boolean; error?: string }>;
}) {
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
  const [reminders, setReminders] = useState<Record<string, GroupReminder[]>>({});
  const [reminderText, setReminderText] = useState("");

  const handleExpandGroup = async (groupId: string) => {
    if (expandedGroup === groupId) {
      setExpandedGroup(null);
      return;
    }
    setExpandedGroup(groupId);
    const r = await onLoadReminders(groupId);
    setReminders((prev) => ({ ...prev, [groupId]: r }));
  };

  const handleSendReminder = async (groupId: string) => {
    if (!reminderText.trim()) return;
    const result = await onSendReminder(groupId, reminderText.trim());
    if (result.success) {
      setReminderText("");
      const r = await onLoadReminders(groupId);
      setReminders((prev) => ({ ...prev, [groupId]: r }));
    } else {
      Alert.alert("Limit Reached", result.error || "Could not send reminder.");
    }
  };

  return (
    <View>
      <View style={styles.sectionActions}>
        <TouchableOpacity
          testID="create-group-btn"
          style={styles.actionChip}
          onPress={() => { setShowCreate(!showCreate); setShowJoin(false); }}
        >
          <Ionicons name="add-circle-outline" size={16} color={Colors.teal} />
          <Text style={styles.actionChipText}>Create</Text>
        </TouchableOpacity>
        <TouchableOpacity
          testID="join-group-btn"
          style={styles.actionChip}
          onPress={() => { setShowJoin(!showJoin); setShowCreate(false); }}
        >
          <Ionicons name="enter-outline" size={16} color={Colors.teal} />
          <Text style={styles.actionChipText}>Join</Text>
        </TouchableOpacity>
      </View>

      {showCreate && (
        <CreateGroupForm
          onSubmit={async (name, desc, type) => {
            await onCreate(name, desc, type);
            setShowCreate(false);
          }}
          onCancel={() => setShowCreate(false)}
        />
      )}

      {showJoin && (
        <JoinGroupForm
          onSubmit={async (code) => {
            const result = await onJoin(code);
            if (result.success) {
              setShowJoin(false);
              Alert.alert("Joined", "You have joined the group.");
            } else {
              Alert.alert("Error", result.error || "Could not join.");
            }
          }}
          onCancel={() => setShowJoin(false)}
        />
      )}

      {myGroups.length > 0 && (
        <View style={styles.subsection}>
          <Text style={styles.subsectionTitle}>My Groups</Text>
          {myGroups.map((group) => (
            <GroupCard
              key={group.groupId}
              group={group}
              isMember
              expanded={expandedGroup === group.groupId}
              onPress={() => handleExpandGroup(group.groupId)}
              onLeave={() => {
                Alert.alert("Leave Group", `Leave "${group.groupName}"?`, [
                  { text: "Cancel", style: "cancel" },
                  { text: "Leave", style: "destructive", onPress: () => onLeave(group.groupId) },
                ]);
              }}
              reminders={reminders[group.groupId] || []}
              reminderText={reminderText}
              onReminderChange={setReminderText}
              onSendReminder={() => handleSendReminder(group.groupId)}
            />
          ))}
        </View>
      )}

      {nearbyGroups.length > 0 && (
        <View style={styles.subsection}>
          <Text style={styles.subsectionTitle}>Nearby Groups</Text>
          {nearbyGroups.map((group) => (
            <GroupCard
              key={group.groupId}
              group={group}
              isMember={false}
              expanded={false}
              onPress={() => {
                Alert.alert("Join Group", `Join "${group.groupName}"?`, [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "Join",
                    onPress: async () => {
                      const result = await onJoin(group.inviteCode);
                      if (!result.success) Alert.alert("Error", result.error || "Could not join.");
                    },
                  },
                ]);
              }}
            />
          ))}
        </View>
      )}

      {myGroups.length === 0 && nearbyGroups.length === 0 && !showCreate && !showJoin && (
        <View style={styles.emptyState}>
          <Ionicons name="people-outline" size={48} color={Colors.textMuted} />
          <Text style={styles.emptyText}>No groups yet</Text>
          <Text style={styles.emptySubtext}>Create a group or join one with an invite code</Text>
        </View>
      )}
    </View>
  );
}

function GroupCard({
  group,
  isMember,
  expanded,
  onPress,
  onLeave,
  reminders,
  reminderText,
  onReminderChange,
  onSendReminder,
}: {
  group: Group;
  isMember: boolean;
  expanded: boolean;
  onPress: () => void;
  onLeave?: () => void;
  reminders?: GroupReminder[];
  reminderText?: string;
  onReminderChange?: (text: string) => void;
  onSendReminder?: () => void;
}) {
  const typeIcon = group.groupType === "brothers" ? "man" : group.groupType === "sisters" ? "woman" : "people";

  return (
    <View style={styles.card}>
      <TouchableOpacity testID={`group-${group.groupId}`} style={styles.cardHeader} onPress={onPress}>
        <View style={styles.cardHeaderLeft}>
          <View style={styles.groupIconContainer}>
            <Ionicons name={typeIcon} size={20} color={Colors.teal} />
          </View>
          <View style={styles.cardHeaderInfo}>
            <Text style={styles.cardTitle} numberOfLines={1}>{group.groupName}</Text>
            <Text style={styles.cardMeta}>
              {group.memberCount} member{group.memberCount !== 1 ? "s" : ""} · {group.groupType}
            </Text>
          </View>
        </View>
        {isMember && (
          <View style={styles.memberBadge}>
            <Text style={styles.memberBadgeText}>Joined</Text>
          </View>
        )}
      </TouchableOpacity>

      {group.description ? (
        <Text style={styles.cardDescription} numberOfLines={expanded ? undefined : 2}>
          {group.description}
        </Text>
      ) : null}

      {isMember && expanded && (
        <View style={styles.groupExpanded}>
          <View style={styles.inviteRow}>
            <Text style={styles.inviteLabel}>Invite Code:</Text>
            <Text style={styles.inviteCode}>{group.inviteCode}</Text>
          </View>

          <View style={styles.reminderSection}>
            <Text style={styles.reminderTitle}>Reminders</Text>
            <View style={styles.reminderInputRow}>
              <TextInput
                style={styles.reminderInput}
                value={reminderText}
                onChangeText={onReminderChange}
                placeholder="Share a beneficial reminder..."
                placeholderTextColor={Colors.textMuted}
                maxLength={280}
                multiline
              />
              <TouchableOpacity style={styles.sendButton} onPress={onSendReminder}>
                <Ionicons name="send" size={18} color={Colors.navy} />
              </TouchableOpacity>
            </View>

            {reminders && reminders.length > 0 ? (
              reminders.slice(0, 10).map((r) => (
                <View key={r.reminderId} style={styles.reminderItem}>
                  <Text style={styles.reminderSender}>{r.senderName}</Text>
                  <Text style={styles.reminderMessage}>{r.message}</Text>
                  <Text style={styles.reminderTime}>
                    {new Date(r.timestamp).toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </Text>
                </View>
              ))
            ) : (
              <Text style={styles.noReminders}>No reminders yet. Be the first to share.</Text>
            )}
          </View>

          {onLeave && (
            <TouchableOpacity style={styles.leaveButton} onPress={onLeave}>
              <Ionicons name="exit-outline" size={16} color={Colors.danger} />
              <Text style={styles.leaveText}>Leave Group</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

function CreateGroupForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (name: string, desc: string, type: GroupType) => Promise<void>;
  onCancel: () => void;
}) {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [groupType, setGroupType] = useState<GroupType>("general");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert("Name Required", "Please enter a group name.");
      return;
    }
    setLoading(true);
    await onSubmit(name.trim(), desc.trim(), groupType);
    setLoading(false);
  };

  return (
    <View style={styles.formCard}>
      <Text style={styles.formTitle}>Create Group</Text>
      <TextInput
        testID="group-name-input"
        style={styles.textInput}
        value={name}
        onChangeText={setName}
        placeholder="Group name"
        placeholderTextColor={Colors.textMuted}
        maxLength={50}
      />
      <TextInput
        style={[styles.textInput, styles.textArea]}
        value={desc}
        onChangeText={setDesc}
        placeholder="Description (optional)"
        placeholderTextColor={Colors.textMuted}
        maxLength={200}
        multiline
      />
      <View style={styles.typeRow}>
        {(["general", "brothers", "sisters"] as GroupType[]).map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.typeChip, groupType === t && styles.typeChipActive]}
            onPress={() => setGroupType(t)}
          >
            <Text style={[styles.typeChipText, groupType === t && styles.typeChipTextActive]}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.formActions}>
        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          testID="submit-create-group"
          style={[styles.submitButton, loading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color={Colors.navy} size="small" /> : <Text style={styles.submitButtonText}>Create</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
}

function JoinGroupForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (code: string) => Promise<void>;
  onCancel: () => void;
}) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  return (
    <View style={styles.formCard}>
      <Text style={styles.formTitle}>Join Group</Text>
      <TextInput
        testID="invite-code-input"
        style={styles.textInput}
        value={code}
        onChangeText={(t) => setCode(t.toUpperCase())}
        placeholder="Enter 6-digit invite code"
        placeholderTextColor={Colors.textMuted}
        maxLength={6}
        autoCapitalize="characters"
      />
      <View style={styles.formActions}>
        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          testID="submit-join-group"
          style={[styles.submitButton, loading && styles.buttonDisabled]}
          onPress={async () => {
            if (code.length < 6) {
              Alert.alert("Invalid Code", "Please enter a 6-character invite code.");
              return;
            }
            setLoading(true);
            await onSubmit(code);
            setLoading(false);
          }}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color={Colors.navy} size="small" /> : <Text style={styles.submitButtonText}>Join</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
}

function EventsSection({
  events,
  profile,
  onCreate,
  onRsvp,
  onInterested,
}: {
  events: any[];
  profile: any;
  onCreate: (title: string, desc: string, location: string, dateTime: string) => Promise<any>;
  onRsvp: (id: string) => Promise<void>;
  onInterested: (id: string) => Promise<void>;
}) {
  const [showCreate, setShowCreate] = useState(false);

  return (
    <View>
      <View style={styles.sectionActions}>
        <TouchableOpacity
          testID="create-event-btn"
          style={styles.actionChip}
          onPress={() => setShowCreate(!showCreate)}
        >
          <Ionicons name="add-circle-outline" size={16} color={Colors.teal} />
          <Text style={styles.actionChipText}>Create Event</Text>
        </TouchableOpacity>
      </View>

      {showCreate && (
        <CreateEventForm
          onSubmit={async (title, desc, loc, dt) => {
            await onCreate(title, desc, loc, dt);
            setShowCreate(false);
          }}
          onCancel={() => setShowCreate(false)}
        />
      )}

      {events.length > 0 ? (
        events.map((event) => (
          <View key={event.eventId} style={styles.card}>
            <View style={styles.eventHeader}>
              <View style={styles.eventDateBadge}>
                <Text style={styles.eventDateMonth}>
                  {new Date(event.dateTime).toLocaleDateString(undefined, { month: "short" })}
                </Text>
                <Text style={styles.eventDateDay}>
                  {new Date(event.dateTime).getDate()}
                </Text>
              </View>
              <View style={styles.eventInfo}>
                <Text style={styles.cardTitle}>{event.title}</Text>
                <Text style={styles.cardMeta}>{event.locationName} · {event.city}</Text>
                <Text style={styles.cardMeta}>
                  {new Date(event.dateTime).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
                  {event.organizerType === "masjid" ? " · Masjid" : ""}
                </Text>
              </View>
            </View>
            {event.description ? (
              <Text style={styles.cardDescription} numberOfLines={3}>{event.description}</Text>
            ) : null}
            <View style={styles.eventActions}>
              <TouchableOpacity
                style={[styles.eventButton, event.rsvpList?.includes(profile?.userId) && styles.eventButtonActive]}
                onPress={() => onRsvp(event.eventId)}
              >
                <Ionicons
                  name={event.rsvpList?.includes(profile?.userId) ? "checkmark-circle" : "checkmark-circle-outline"}
                  size={16}
                  color={event.rsvpList?.includes(profile?.userId) ? Colors.success : Colors.textSecondary}
                />
                <Text style={[styles.eventButtonText, event.rsvpList?.includes(profile?.userId) && styles.eventButtonTextActive]}>
                  Going ({event.attendeesCount || 0})
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.eventButton, event.interestedList?.includes(profile?.userId) && styles.eventButtonActive]}
                onPress={() => onInterested(event.eventId)}
              >
                <Ionicons
                  name={event.interestedList?.includes(profile?.userId) ? "star" : "star-outline"}
                  size={16}
                  color={event.interestedList?.includes(profile?.userId) ? Colors.gold : Colors.textSecondary}
                />
                <Text style={[styles.eventButtonText, event.interestedList?.includes(profile?.userId) && styles.eventButtonTextActive]}>
                  Interested
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="calendar-outline" size={48} color={Colors.textMuted} />
          <Text style={styles.emptyText}>No upcoming events</Text>
          <Text style={styles.emptySubtext}>Create an event for your community</Text>
        </View>
      )}
    </View>
  );
}

function CreateEventForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (title: string, desc: string, location: string, dateTime: string) => Promise<void>;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [location, setLocation] = useState("");
  const [dateStr, setDateStr] = useState("");
  const [loading, setLoading] = useState(false);

  return (
    <View style={styles.formCard}>
      <Text style={styles.formTitle}>Create Event</Text>
      <TextInput
        testID="event-title-input"
        style={styles.textInput}
        value={title}
        onChangeText={setTitle}
        placeholder="Event title"
        placeholderTextColor={Colors.textMuted}
        maxLength={100}
      />
      <TextInput
        style={[styles.textInput, styles.textArea]}
        value={desc}
        onChangeText={setDesc}
        placeholder="Description (optional)"
        placeholderTextColor={Colors.textMuted}
        maxLength={500}
        multiline
      />
      <TextInput
        style={styles.textInput}
        value={location}
        onChangeText={setLocation}
        placeholder="Location name (e.g., City Masjid)"
        placeholderTextColor={Colors.textMuted}
        maxLength={100}
      />
      <TextInput
        style={styles.textInput}
        value={dateStr}
        onChangeText={setDateStr}
        placeholder="Date & time (YYYY-MM-DD HH:MM)"
        placeholderTextColor={Colors.textMuted}
        maxLength={16}
      />
      <View style={styles.formActions}>
        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          testID="submit-create-event"
          style={[styles.submitButton, loading && styles.buttonDisabled]}
          onPress={async () => {
            if (!title.trim()) { Alert.alert("Required", "Please enter an event title."); return; }
            if (!dateStr.trim()) { Alert.alert("Required", "Please enter a date and time."); return; }
            const parsed = new Date(dateStr.replace(" ", "T"));
            if (isNaN(parsed.getTime())) { Alert.alert("Invalid Date", "Use format: YYYY-MM-DD HH:MM"); return; }
            setLoading(true);
            await onSubmit(title.trim(), desc.trim(), location.trim() || "TBA", parsed.toISOString());
            setLoading(false);
          }}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color={Colors.navy} size="small" /> : <Text style={styles.submitButtonText}>Create</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
}

function AnnouncementsSection({
  announcements,
  profile,
  onCreate,
}: {
  announcements: any[];
  profile: any;
  onCreate: (title: string, message: string) => Promise<any>;
}) {
  const [showCreate, setShowCreate] = useState(false);
  const isMasjid = profile?.accountType === "masjid";

  return (
    <View>
      {isMasjid && (
        <View style={styles.sectionActions}>
          <TouchableOpacity
            testID="create-announcement-btn"
            style={styles.actionChip}
            onPress={() => setShowCreate(!showCreate)}
          >
            <Ionicons name="add-circle-outline" size={16} color={Colors.teal} />
            <Text style={styles.actionChipText}>Post Announcement</Text>
          </TouchableOpacity>
        </View>
      )}

      {showCreate && (
        <CreateAnnouncementForm
          onSubmit={async (title, msg) => {
            await onCreate(title, msg);
            setShowCreate(false);
          }}
          onCancel={() => setShowCreate(false)}
        />
      )}

      {announcements.length > 0 ? (
        announcements.map((ann) => (
          <View key={ann.announcementId} style={styles.card}>
            <View style={styles.announcementHeader}>
              <Ionicons name="megaphone" size={18} color={Colors.gold} />
              <Text style={styles.cardTitle} numberOfLines={1}>{ann.title}</Text>
            </View>
            <Text style={styles.cardDescription}>{ann.message}</Text>
            <View style={styles.announcementFooter}>
              <Text style={styles.cardMeta}>
                {ann.authorName}{ann.authorType === "masjid" ? " (Masjid)" : ""}
              </Text>
              <Text style={styles.cardMeta}>
                {new Date(ann.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
              </Text>
            </View>
          </View>
        ))
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="megaphone-outline" size={48} color={Colors.textMuted} />
          <Text style={styles.emptyText}>No announcements</Text>
          <Text style={styles.emptySubtext}>
            {isMasjid ? "Post an announcement for your community" : "Announcements from local masjids will appear here"}
          </Text>
        </View>
      )}
    </View>
  );
}

function CreateAnnouncementForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (title: string, message: string) => Promise<void>;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  return (
    <View style={styles.formCard}>
      <Text style={styles.formTitle}>Post Announcement</Text>
      <TextInput
        style={styles.textInput}
        value={title}
        onChangeText={setTitle}
        placeholder="Title"
        placeholderTextColor={Colors.textMuted}
        maxLength={100}
      />
      <TextInput
        style={[styles.textInput, styles.textArea]}
        value={message}
        onChangeText={setMessage}
        placeholder="Message"
        placeholderTextColor={Colors.textMuted}
        maxLength={500}
        multiline
      />
      <View style={styles.formActions}>
        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.submitButton, loading && styles.buttonDisabled]}
          onPress={async () => {
            if (!title.trim() || !message.trim()) { Alert.alert("Required", "Fill in all fields."); return; }
            setLoading(true);
            await onSubmit(title.trim(), message.trim());
            setLoading(false);
          }}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color={Colors.navy} size="small" /> : <Text style={styles.submitButtonText}>Post</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.navy,
  },
  loadingCenter: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    color: Colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: Colors.textMuted,
    marginTop: 2,
  },
  tabBar: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginBottom: 8,
    backgroundColor: Colors.navyLight,
    borderRadius: 12,
    padding: 4,
  },
  tabItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  tabItemActive: {
    backgroundColor: Colors.navyMid,
  },
  tabText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: Colors.textMuted,
  },
  tabTextActive: {
    color: Colors.gold,
  },
  scrollContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  setupContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    gap: 16,
  },
  setupTitle: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    color: Colors.textPrimary,
    textAlign: "center",
    marginTop: 8,
  },
  setupSubtitle: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 22,
  },
  inputGroup: {
    width: "100%",
    gap: 8,
    marginTop: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: Colors.textSecondary,
  },
  textInput: {
    backgroundColor: Colors.navyLight,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.separator,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  preferenceRow: {
    flexDirection: "row",
    gap: 10,
  },
  prefButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: Colors.navyLight,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.separator,
  },
  prefButtonActive: {
    backgroundColor: Colors.tealMuted,
    borderColor: Colors.teal,
  },
  prefText: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    color: Colors.textMuted,
  },
  prefTextActive: {
    color: Colors.tealLight,
  },
  primaryButton: {
    width: "100%",
    backgroundColor: Colors.gold,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 12,
  },
  primaryButtonText: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: Colors.navy,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  sectionActions: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 12,
    marginTop: 4,
  },
  actionChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.navyLight,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.separator,
  },
  actionChipText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: Colors.tealLight,
  },
  subsection: {
    marginBottom: 16,
  },
  subsectionTitle: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: Colors.textSecondary,
    marginBottom: 10,
  },
  card: {
    backgroundColor: Colors.cardBg,
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.separator,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },
  groupIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.tealMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  cardHeaderInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: Colors.textPrimary,
  },
  cardMeta: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: Colors.textMuted,
    marginTop: 2,
  },
  cardDescription: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
    marginTop: 8,
    lineHeight: 20,
  },
  memberBadge: {
    backgroundColor: Colors.tealMuted,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  memberBadgeText: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    color: Colors.tealLight,
  },
  groupExpanded: {
    marginTop: 14,
    borderTopWidth: 1,
    borderTopColor: Colors.separator,
    paddingTop: 14,
  },
  inviteRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 14,
  },
  inviteLabel: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: Colors.textMuted,
  },
  inviteCode: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    color: Colors.gold,
    letterSpacing: 2,
  },
  reminderSection: {
    gap: 10,
  },
  reminderTitle: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: Colors.textSecondary,
  },
  reminderInputRow: {
    flexDirection: "row",
    gap: 8,
  },
  reminderInput: {
    flex: 1,
    backgroundColor: Colors.navy,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.separator,
    maxHeight: 80,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: Colors.teal,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-end",
  },
  reminderItem: {
    backgroundColor: Colors.navy,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.separator,
  },
  reminderSender: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    color: Colors.tealLight,
    marginBottom: 4,
  },
  reminderMessage: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: Colors.textPrimary,
    lineHeight: 20,
  },
  reminderTime: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: Colors.textMuted,
    marginTop: 6,
  },
  noReminders: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: Colors.textMuted,
    fontStyle: "italic",
    textAlign: "center",
    paddingVertical: 12,
  },
  leaveButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 14,
    alignSelf: "flex-start",
  },
  leaveText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: Colors.danger,
  },
  formCard: {
    backgroundColor: Colors.cardBg,
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: Colors.tealMuted,
    gap: 10,
  },
  formTitle: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  typeRow: {
    flexDirection: "row",
    gap: 8,
  },
  typeChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: Colors.navy,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.separator,
  },
  typeChipActive: {
    backgroundColor: Colors.tealMuted,
    borderColor: Colors.teal,
  },
  typeChipText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: Colors.textMuted,
  },
  typeChipTextActive: {
    color: Colors.tealLight,
  },
  formActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: Colors.navy,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.separator,
  },
  cancelButtonText: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    color: Colors.textMuted,
  },
  submitButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: Colors.teal,
    alignItems: "center",
  },
  submitButtonText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: Colors.white,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
    gap: 8,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: Colors.textSecondary,
  },
  emptySubtext: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: Colors.textMuted,
    textAlign: "center",
    maxWidth: 240,
  },
  eventHeader: {
    flexDirection: "row",
    gap: 14,
    alignItems: "flex-start",
  },
  eventDateBadge: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.tealMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  eventDateMonth: {
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
    color: Colors.tealLight,
    textTransform: "uppercase",
  },
  eventDateDay: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    color: Colors.textPrimary,
    marginTop: -2,
  },
  eventInfo: {
    flex: 1,
  },
  eventActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.separator,
    paddingTop: 12,
  },
  eventButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: Colors.navy,
    borderWidth: 1,
    borderColor: Colors.separator,
  },
  eventButtonActive: {
    borderColor: Colors.tealMuted,
  },
  eventButtonText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: Colors.textSecondary,
  },
  eventButtonTextActive: {
    color: Colors.tealLight,
  },
  announcementHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  announcementFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.separator,
    paddingTop: 8,
  },
});
