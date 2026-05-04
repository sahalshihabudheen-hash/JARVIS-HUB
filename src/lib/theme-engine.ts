/** 
 * JARVIS Neural Theme Engine
 * Maps TMDB Genre IDs to futuristic HSL palettes.
 */

export interface ThemePalette {
  primary: string; // HSL values only (e.g., "190 100% 50%")
  accent: string;
  glow: string;
}

export const GENRE_PALETTES: Record<number, ThemePalette> = {
  28: { primary: "0 100% 50%", accent: "20 100% 50%", glow: "0 100% 50%" }, // Action (Red)
  12: { primary: "35 100% 50%", accent: "50 100% 50%", glow: "35 100% 50%" }, // Adventure (Orange)
  16: { primary: "300 100% 60%", accent: "260 100% 70%", glow: "300 100% 60%" }, // Animation (Purple/Pink)
  35: { primary: "50 100% 50%", accent: "80 100% 50%", glow: "50 100% 50%" }, // Comedy (Yellow/Lime)
  80: { primary: "0 0% 40%", accent: "0 0% 100%", glow: "0 0% 60%" }, // Crime (Mono/Dark)
  27: { primary: "0 100% 20%", accent: "0 0% 100%", glow: "0 100% 30%" }, // Horror (Deep Red)
  10749: { primary: "330 100% 50%", accent: "300 100% 70%", glow: "330 100% 50%" }, // Romance (Pink)
  878: { primary: "185 100% 50%", accent: "200 100% 60%", glow: "185 100% 50%" }, // Sci-Fi (Cyan)
  18: { primary: "220 100% 50%", accent: "200 100% 50%", glow: "220 100% 50%" }, // Drama (Blue)
  14: { primary: "260 100% 60%", accent: "280 100% 50%", glow: "260 100% 60%" }, // Fantasy (Purple)
  9648: { primary: "160 100% 40%", accent: "180 100% 50%", glow: "160 100% 40%" }, // Mystery (Teal)
};

export const applyTheme = (palette: ThemePalette) => {
  const root = document.documentElement;
  root.style.setProperty("--jarvis-primary", palette.primary);
  root.style.setProperty("--jarvis-accent", palette.accent);
  root.style.setProperty("--jarvis-glow", palette.glow);
};

export const resetTheme = () => {
  const root = document.documentElement;
  root.style.setProperty("--jarvis-primary", "190 100% 50%");
  root.style.setProperty("--jarvis-accent", "280 100% 60%");
  root.style.setProperty("--jarvis-glow", "190 100% 50%");
};
