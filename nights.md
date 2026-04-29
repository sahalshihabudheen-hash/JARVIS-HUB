# JARVIS HUB: Tomorrow's Roadmap 🚀

This document outlines the priority features to be implemented in the next phase of JARVIS HUB development.

## 🏁 Priority Phase 1: Interactive & Social

### 1. 👥 Watch Together (Social Sync)
- **Goal**: Enable users to watch content simultaneously with friends.
- **Features**: 
  - Unique "Party Links".
  - Playback synchronization (Play/Pause/Seek) across all participants.
  - Basic chat overlay for reactions.
- **Tech**: Firebase Realtime Database for ultra-low latency syncing.

### 2. 🤖 AI Smart Discovery (JARVIS Intelligence)
- **Goal**: Replace static search with a conversational assistant.
- **Features**:
  - Natural language search (e.g., "Malayalam thrillers on Netflix").
  - Contextual awareness (recommending based on time of day or current region).
- **Tech**: Integration with a light LLM or advanced fuzzy filtering logic.

### 3. 💬 Community Hub (Reviews & Comments)
- **Goal**: Foster a user community within the platform.
- **Features**:
  - Rating system (1-10 stars).
  - Threaded comment sections for Movies, TV Shows, and Adult videos.
  - "Verified Reviewer" badges for active users.
- **Tech**: Firestore collection for structured social data.

### 4. 🎭 Interactive "Genre Moods"
- **Goal**: Categorize content by emotional impact rather than just genre.
- **Features**:
  - Mood-based filtering (e.g., "Adrenaline," "Heartwarming," "Chill").
  - Dynamic UI background changes based on the selected mood.
- **Tech**: Custom tagging system within our existing metadata layer.

### 5. 📱 Hover-to-Preview (Netflix Aesthetic)
- **Goal**: Create a premium, interactive browsing experience.
- **Features**:
  - Cards automatically play a muted preview or trailer on hover.
  - Expanded card detail view on hover for quick info.
- **Tech**: Framer Motion for animations and lightweight video/GIF previews.

---

## 🔒 Priority Phase 2: Adult Hub Excellence

### 6. 🕵️‍♂️ Stealth Mode (Boss Key)
- **Goal**: Instant privacy toggle for the Adult Hub.
- **Features**: 
  - Hotkey (e.g., `Esc` x2) to instantly switch the view to a safe page (e.g., News or Home).
  - Browser tab title and icon change to something generic (e.g., "Research Tools") while active.

### 7. 👯‍♀️ Performer "Discovery" Hub
- **Goal**: Unified profiles for performers.
- **Features**:
  - Detailed profiles showing filmography across all sources (Pornhub, Redtube, Eporner).
  - "Follow" performer to get notifications of new releases.

### 8. 🔀 Smart Auto-Next (Binge Mode)
- **Goal**: Continuous playback experience.
- **Features**:
  - Countdown timer at the end of a video.
  - Automatically load the next most relevant video from the JARVIS recommendation engine.

### 9. 📉 Data Saver / 4K Quality Toggle
- **Goal**: Performance optimization based on connection.
- **Features**:
  - High/Low resolution thumbnail proxy toggle.
  - Option to load lightweight previews to save mobile data.

### 10. 🌓 Incognito History
- **Goal**: Private browsing within the private hub.
- **Features**:
  - A "Ghost Toggle" in the player.
  - When active, the video will not be saved to Cloud Watch History or Recently Viewed.

---
*Plan updated on April 29, 2026*
