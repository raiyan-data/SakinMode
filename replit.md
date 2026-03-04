# SalahLock — Islamic Prayer Productivity App

## Overview
SalahLock is an Islamic productivity app that helps Muslims maintain consistent daily prayer habits. It shows real-time prayer times, tracks streaks, provides daily Quranic verses and hadiths, and includes a focus lock screen during prayer times.

## Architecture
- **Frontend**: Expo / React Native (Expo Router file-based routing)
- **Backend**: Express.js server on port 5000 (serves landing page + API)
- **State**: AsyncStorage for all persistence (no cloud DB required)
- **Prayer Times**: Aladhan API (https://api.aladhan.com)
- **Notifications**: expo-notifications (local scheduled)

## Key Features

### Core MVP
- **Prayer Times** — GPS-based or city-based prayer time fetching via Aladhan API
- **Countdown Timer** — Live countdown to next prayer
- **Prayer Tracking** — "I prayed" buttons with daily streak counting
- **Lock Screen** — Fullscreen lock during prayer time with countdown timer
- **Today Experience** — Dynamic daily content: ayah (Arabic + translation), hadith, daily action with rotation system

### Feature Expansion (v1.1)
- **Smart Pre-Prayer Notifications** — Scheduled alerts 5/10/15 minutes before each prayer
- **Missed Prayer Detection** — Detects prayers that passed without confirmation, shown on Progress screen
- **After-Prayer Screen** — "Alhamdulillah" completion screen with dhikr counter + reflection
- **Intentional Unlock Flow** — 5-second delay before emergency unlock activates
- **Focus Score Dashboard** — Tracks total minutes blocked, distraction time saved, weekly consistency %
- **Ramadan Mode** — Auto-detects Ramadan dates; tracks fasts, Taraweeh, Quran juz; Suhoor/Iftar times
- **Accountability Circles** — Local prayer streak sharing with friends
- **Community Tab** — Local Muslim community system: groups, events, announcements with city-based + preference-based filtering

## File Structure
```
app/
  (tabs)/
    _layout.tsx       — Tab navigation (5 tabs: Home, Progress, Today, Community, Settings)
    index.tsx         — Home: prayer times, countdown, marking prayers
    progress.tsx      — Progress: streak, focus score, 14-day grid, prayer breakdown
    daily.tsx         — Today: daily ayah, action, hadith, progress, community pulse
    community.tsx     — Community: local groups, events, announcements
    settings.tsx      — Settings: 5-section accordion (Prayer & Lock, Location & Community, Notifications, Account, App Experience)
  _layout.tsx         — Root layout with providers (AppProvider + CommunityProvider)
  lock.tsx            — Fullscreen prayer lock screen
  after-prayer.tsx    — Post-prayer completion screen with dhikr counter
  ramadan.tsx         — Ramadan mode: fasts, Taraweeh, Quran tracker, 30-day calendar
  circles.tsx         — Accountability Circles: add/remove members, view streaks

context/
  AppContext.tsx       — Central state: prayers, settings (themeMode, language, onboardingCompleted), streaks, Ramadan, circles, clearAllData
  CommunityContext.tsx — Community state: profile, groups, events, announcements, clearCommunityData
  ThemeContext.tsx     — ThemeProvider: light/dark/system modes, dynamic color palette, useTheme() hook

services/
  prayerService.ts    — Aladhan API integration
  notificationService.ts — Local notification scheduling
  ramadanService.ts   — Ramadan date detection utilities
  dailyRotationService.ts — Date-based content rotation with 80%-pool non-repeat + caching
  communityService.ts — Community data layer (AsyncStorage, Firestore-migration ready)

constants/
  colors.ts           — Islamic-inspired dark color palette (navy/teal/gold)
  prayers.ts          — Prayer names, icons, formatting utilities
  ayahs.ts            — 95 ayahs (with Arabic), 35 hadiths, 45 daily actions
```

## Community System
- **Data**: AsyncStorage-based with collection-like structure (groups, events, announcements)
- **Identity**: Separate community profile with display name + preference
- **Segmentation**: brothers/sisters/general — filters groups, events, announcements
- **Groups**: Create, join via invite code, discover nearby, send reminders (3/day limit, 280 chars)
- **Events**: Create, RSVP, mark interested, city-filtered, sorted by upcoming date
- **Announcements**: Masjid accounts can post; visible across preference when from masjid
- **Location**: City-based filtering using settings.city; all content filtered by user's city

## Color Palette (Islamic-inspired dark theme)
- Navy: `#0D1B2A` (background)
- Teal: `#1A6B5E` (primary accent)
- Gold: `#C9954A` (highlights, streaks)
- Success: `#52B788` (completed prayers)

## Workflows
- **Start Backend**: `npm run server:dev` — Express on port 5000
- **Start Frontend**: `npm run expo:dev` — Expo on port 8081

## User Preferences
- Dark Islamic-inspired theme
- No emojis — vector icons only
- Arabic text preserved in dhikr counter

## Dependencies
- expo-notifications@~0.32.16 (local notifications)
- expo-location (GPS prayer times)
- expo-linear-gradient (card gradients)
- react-native-reanimated (animations)
- @tanstack/react-query (async state)
- @react-native-async-storage/async-storage (persistence)
