# JARVIS HUB - Implementation Plan for Tomorrow

## 1. Advanced Genre Selection (Adult Page)
- [ ] Implement a more robust genre discovery system.
- [ ] Add "Top Studios" and "Popular Tags" as dedicated horizontal scroll rows.
- [ ] Create a "Genre Hub" modal or expanded section for easier browsing.

## 2. Ultra-Precise Location Detection
- [ ] Enhance `getUserLocation` to include more detailed ISP/Region data.
- [ ] Implement a fallback to Browser Geolocation (with user permission) for city-level precision if requested.
- [ ] Refine the localized banner to be more prominent and interactive.

## 3. Native/State Content Integration
- [ ] **State-Specific Rows:** If the user is in **Kerala**, automatically inject a "Malayalam / Kerala Specials" row at the top.
- [ ] Implement logic to automatically translate location names into local content search queries (e.g., "Kerala" -> "Malayalam").
- [ ] Add regional language support for localized section headers.

## 4. Special Adult History
- [ ] Create a dedicated "Incognito History" or "Adult History" tracking system.
- [ ] Ensure adult watch progress is stored separately from standard movies/TV.
- [ ] Implement a "Private Mode" toggle to enable/disable history tracking for premium content.

## 5. UI/UX Polish
- [ ] Improve the loading state for the dynamic Actress section.
- [ ] Add "Watch Later" support for Adult videos.
## 6. Direct Download Core (Final Fix)
- [ ] Implement a server-side proxy or high-fidelity scraper to get direct MP4 links.
- [ ] Remove all external mirror redirects to ensure 100% "on-site" download experience.
- [ ] Finalize the progress bar logic to represent real data transmission speeds.
- [ ] Implement multi-node fallback to ensure "Media Unavailable" errors are zeroed out.

---
*Created on 2026-04-28*
