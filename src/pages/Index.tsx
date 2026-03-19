import { useState, useEffect } from "react";
import { useQuery, useQueries } from "@tanstack/react-query";
import { X, ShieldAlert } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import MediaRow from "@/components/MediaRow";
import ContinueWatching from "@/components/ContinueWatching";
import JarvisTutorial from "@/components/JarvisTutorial";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { 
  getTrending, 
  getPopularMovies, 
  getPopularTVShows, 
  getTopRatedMovies,
  getNowPlayingMovies,
  getUpcomingMovies,
  getUserLocation,
  discoverMovies
} from "@/lib/tmdb";
import { useAuth } from "@/context/AuthContext";
import { useTutorial } from "@/context/TutorialContext";

const GENRE_LABELS: Record<number, string> = {
  28: "Combat & Action Protocols",
  878: "Cybernetic & Sci-Fi Realities",
  27: "Dark & Horror Encounters",
  35: "Humor & Comedy Modules",
  53: "Infiltration & Thriller Operations",
  10749: "Diplomacy & Romance Files",
  18: "Social & Drama Simulations",
  16: "Holographic & Animated Data",
  14: "Mystical & Fantasy Realms",
  9648: "Encrypted & Mystery Logs",
};

const Index = () => {
  const { user } = useAuth();
  const { selectedGenres } = useTutorial();
  const navigate = useNavigate();
  const [location, setLocation] = useState<{ 
    country: string; 
    country_name: string; 
    region: string;
    region_code: string;
    city: string;
    languages: string;
    latitude?: number;
    longitude?: number;
  } | null>(null);

  useEffect(() => {
    getUserLocation().then(setLocation);
  }, []);

  const { data: trending, isLoading: trendingLoading } = useQuery({
    queryKey: ["trending"],
    queryFn: () => getTrending("all", "week"),
  });

  const { data: popularMovies, isLoading: moviesLoading } = useQuery({
    queryKey: ["popularMovies", location?.country],
    queryFn: () => getPopularMovies(1, location?.country),
  });

  const { data: popularTV, isLoading: tvLoading } = useQuery({
    queryKey: ["popularTV"],
    queryFn: () => getPopularTVShows(),
  });

  const { data: topRated, isLoading: topRatedLoading } = useQuery({
    queryKey: ["topRatedMovies"],
    queryFn: () => getTopRatedMovies(),
  });

  const { data: nowPlaying, isLoading: nowPlayingLoading } = useQuery({
    queryKey: ["nowPlaying", location?.country],
    queryFn: () => {
      // If India, show strictly Indian content for this row
      if (location?.country === "IN") {
        return discoverMovies({ with_origin_country: "IN", region: "IN", sort_by: "popularity.desc" });
      }
      return getNowPlayingMovies(1, location?.country);
    },
    enabled: !!location,
  });

  const { data: upcoming, isLoading: upcomingLoading } = useQuery({
    queryKey: ["upcoming", location?.country],
    queryFn: () => {
      // If India, show strictly Indian content for this row
      if (location?.country === "IN") {
        return discoverMovies({ with_origin_country: "IN", region: "IN", "primary_release_date.gte": new Date().toISOString().split('T')[0] });
      }
      return getUpcomingMovies(1, location?.country);
    },
    enabled: !!location,
  });

  // Advanced Region Detection Logic
  const getRegionalContext = () => {
    const manualFocus = localStorage.getItem("user_regional_focus") || "auto";
    const regionName = (location?.region || "").toLowerCase();
    const regionCode = (location?.region_code || "").toUpperCase();
    const cityName = (location?.city || "").toLowerCase();
    const browserLangs = navigator.languages || [navigator.language];
    
    // Determine target region (Manual override or Detected)
    let target = manualFocus !== "auto" ? manualFocus : regionName;
    if (manualFocus === "auto" && !target) target = regionCode;
    if (manualFocus === "auto" && !target) target = cityName;
    
    // Explicitly handle generic/unspecified locations to show switcher
    const isGenericIndia = target === "IN" || target === "india" || target.includes("delhi") || target.includes("mumbai") || !target;

    const context = {
      title: "Indian",
      accent: "Cinema Hub",
      language: "hi",
      region: isGenericIndia ? "India" : (target.charAt(0).toUpperCase() + target.slice(1)), 
      stateCode: regionCode
    };

    // 1. Check for Kerala (High Priority as per User)
    const keralaCities = ["kochi", "trivandrum", "thiruvananthapuram", "calicut", "kozhikode", "thrissur", "kollam", "palakkad", "alappuzha", "kottayam", "malappuram", "kannur", "kasaragod"];
    const isMalayalamBrowser = browserLangs.some(l => l.toLowerCase().startsWith('ml'));
    
    if (target.includes("kerala") || regionCode === "KL" || keralaCities.includes(cityName) || isMalayalamBrowser) {
      context.title = "Malayalam";
      context.region = "Kerala";
      context.language = "ml";
    } 
    // 2. Check for Tamil Nadu
    else if (target.includes("tamil") || regionCode === "TN" || cityName.includes("chennai") || cityName.includes("madurai") || browserLangs.some(l => l.toLowerCase().startsWith('ta'))) {
      context.title = "Tamil";
      context.region = "Tamil Nadu";
      context.language = "ta";
    } 
    // 3. Other regions
    else if (target.includes("telugu") || target.includes("andhra") || regionCode === "AP" || regionCode === "TG" || cityName.includes("hyderabad") || browserLangs.some(l => l.toLowerCase().startsWith('te'))) {
      context.title = "Telugu";
      context.region = "Andhra & Telangana";
      context.language = "te";
    } else if (target.includes("karnataka") || regionCode === "KA") {
      context.title = "Kannada";
      context.region = "Karnataka";
      context.language = "kn";
    } else if (target.includes("bengal") || regionCode === "WB") {
      context.title = "Bengali";
      context.region = "West Bengal";
      context.language = "bn";
    } else if (target.includes("maharashtra") || regionCode === "MH") {
      context.title = "Marathi";
      context.region = "Maharashtra";
      context.language = "mr";
    } else if (target.includes("punjab") || regionCode === "PB") {
      context.title = "Punjabi";
      context.region = "Punjab";
      context.language = "pa";
    } else if (target.includes("gujarat") || regionCode === "GJ") {
      context.title = "Gujarati";
      context.region = "Gujarat";
      context.language = "gu";
    }

    return context;
  };

  const regionalContext = getRegionalContext();

  const { data: regionalNow, isLoading: regionalLoading } = useQuery({
    queryKey: ["regionalNow", location?.country, location?.region, location?.region_code, localStorage.getItem("user_regional_focus")],
    queryFn: () => {
      const isIndia = location?.country === "IN" || localStorage.getItem("user_regional_focus") !== "auto";
      
      const params: Record<string, string> = {
        sort_by: "popularity.desc",
        include_adult: "false"
      };

      if (isIndia) {
        params.with_origin_country = "IN";
        params.with_original_language = regionalContext.language;
      } else {
        params.with_origin_country = location?.country || "";
        const detectedLanguages = location?.languages?.split(',') || [];
        const localLang = detectedLanguages.find(l => !l.startsWith('en'))?.split('-')[0];
        if (localLang) params.with_original_language = localLang;
      }
      
      return discoverMovies(params);
    },
    enabled: !!location,
  });

  const { data: regionalUpcoming, isLoading: regionalUpcomingLoading } = useQuery({
    queryKey: ["regionalUpcoming", location?.country, location?.region, location?.region_code, localStorage.getItem("user_regional_focus")],
    queryFn: () => {
      const isIndia = location?.country === "IN" || localStorage.getItem("user_regional_focus") !== "auto";
      
      const params: Record<string, string> = {
        sort_by: "popularity.desc",
        include_adult: "false",
        "primary_release_date.gte": new Date().toISOString().split('T')[0]
      };

      if (isIndia) {
        params.with_origin_country = "IN";
        params.with_original_language = regionalContext.language;
      } else {
        params.with_origin_country = location?.country || "";
        const detectedLanguages = location?.languages?.split(',') || [];
        const localLang = detectedLanguages.find(l => !l.startsWith('en'))?.split('-')[0];
        if (localLang) params.with_original_language = localLang;
      }
      
      return discoverMovies(params);
    },
    enabled: !!location,
  });

  const { data: worldwideUpcoming, isLoading: worldwideLoading } = useQuery({
    queryKey: ["worldwideUpcoming"],
    queryFn: () => getUpcomingMovies(1), // No region = Worldwide
  });

  // Genre specific queries for personalized hub
  const { data: actionMovies } = useQuery({
    queryKey: ["genreAction"],
    queryFn: () => discoverMovies({ with_genres: "28" }),
    enabled: !!user || selectedGenres.includes(28),
  });

  const { data: sciFiMovies } = useQuery({
    queryKey: ["genreSciFi"],
    queryFn: () => discoverMovies({ with_genres: "878" }),
    enabled: !!user || selectedGenres.includes(878),
  });

  const { data: thrillerMovies } = useQuery({
    queryKey: ["genreThriller"],
    queryFn: () => discoverMovies({ with_genres: "53" }),
    enabled: !!user || selectedGenres.includes(53),
  });

  const { data: animationMovies } = useQuery({
    queryKey: ["genreAnimation"],
    queryFn: () => discoverMovies({ with_genres: "16" }),
    enabled: !!user || selectedGenres.includes(16),
  });

  // Dynamic rows based on tutorial choices
  const personalizedQueries = useQueries({
    queries: selectedGenres
      .filter(id => ![28, 878, 53, 16].includes(id)) // Filter already included ones
      .map(id => ({
        queryKey: ["genre", id],
        queryFn: () => discoverMovies({ with_genres: id.toString() }),
        enabled: selectedGenres.includes(id),
      }))
  });

  const [showAdWarning, setShowAdWarning] = useState(false);

  useEffect(() => {
    const dismissed = sessionStorage.getItem("ad-warning-dismissed");
    if (!dismissed) setShowAdWarning(true);
  }, []);

  const dismissWarning = () => {
    setShowAdWarning(false);
    sessionStorage.setItem("ad-warning-dismissed", "true");
  };

  const manualFocus = localStorage.getItem("user_regional_focus") || "auto";
  const regionLabel = manualFocus !== "auto" ? manualFocus : (location?.region || "");
  const cityLabel = location?.city || "";
  const isKeralaFocus = regionLabel.toLowerCase().includes("kerala");
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Ad Blocker Warning Popup */}
      {showAdWarning && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 animate-fade-in">
          <div className="mx-4 max-w-md w-full bg-card/95 backdrop-blur-xl border border-border rounded-2xl p-6 shadow-2xl">
            <div className="flex items-start gap-3 mb-4">
              <ShieldAlert className="w-6 h-6 text-yellow-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-display font-semibold text-lg text-foreground mb-1">Heads up!</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  It is recommended to use an ad blocker or Brave browser. You might see ads while playing your favorite movie — those ads come from the API's server side and not from us at JARVIS HUB.
                </p>
              </div>
            </div>
            <Button onClick={dismissWarning} className="w-full" size="sm">
              Got it
            </Button>
          </div>
        </div>
      )}
      
      <main>
        <HeroSection 
          items={
            regionalNow?.results && regionalNow.results.length > 0 
              ? [...regionalNow.results.slice(0, 5), ...(trending || [])] 
              : (trending || [])
          } 
          isLoading={trendingLoading || regionalLoading} 
        />
        
        <div className="container mx-auto -mt-20 relative z-10 space-y-12">
          <div id="watchlist-row pb-8">
            <ContinueWatching />
          </div>

          {/* REGIONAL CINEMA HUB - DYNAMIC BASED ON LOCATION */}
          {(location?.country === "IN" || regionalContext.language !== "hi") && (
            <div className="space-y-8 bg-blue-500/[0.02] border-y border-white/[0.02] py-10 -mx-4 px-4 overflow-hidden">
               <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-8 bg-blue-500 rounded-full" />
                    <h2 className="text-2xl font-display font-black uppercase tracking-tighter text-white">
                      {regionalContext.title} <span className="text-blue-500">Cinema Hub</span>
                    </h2>
                  </div>

                  {/* Quick Region Switcher if generic/Hindi is detected */}
                  {location?.country === "IN" && regionalContext.language === "hi" && (
                    <div className="flex flex-wrap items-center gap-2 animate-fade-in bg-white/[0.03] p-1.5 rounded-2xl border border-white/5">
                       <span className="text-[10px] font-black uppercase text-white/40 px-2">Focus on:</span>
                       {[
                         { id: "kerala", label: "Malayalam", icon: "🌴" },
                         { id: "tamil", label: "Tamil", icon: "🛕" },
                         { id: "telugu", label: "Telugu", icon: "🐘" },
                         { id: "karnataka", label: "Kannada", icon: "🏛️" },
                         { id: "bengal", label: "Bengali", icon: "🎨" },
                         { id: "maharashtra", label: "Marathi", icon: "🎭" },
                       ].map((r) => (
                         <button
                           key={r.id}
                           onClick={() => {
                             localStorage.setItem("user_regional_focus", r.id);
                             window.location.reload();
                           }}
                           className="px-3 py-1.5 rounded-xl bg-blue-500/10 border border-blue-500/20 hover:border-blue-500/50 hover:bg-blue-500/20 text-[10px] font-bold uppercase transition-all flex items-center gap-1.5 whitespace-nowrap"
                         >
                           <span>{r.icon}</span> {r.label}
                         </button>
                       ))}
                    </div>
                  )}
               </div>

               <MediaRow
                  title={`🔥 Current Blockbusters (${regionalContext.region})`}
                  items={regionalNow?.results || []}
                  mediaType="movie"
                  isLoading={regionalLoading}
                />
                
                <MediaRow
                  title={`${regionalContext.title} Evergreens`}
                  items={regionalNow?.results?.slice().reverse() || []}
                  mediaType="movie"
                  isLoading={regionalLoading}
                />

                <MediaRow
                  title={`🆕 New ${regionalContext.title} Releases`}
                  items={regionalUpcoming?.results || []}
                  mediaType="movie"
                  isLoading={regionalUpcomingLoading}
                />
            </div>
          )}
          
          {/* SPECIAL COLLECTIONS SECTION */}
          <div className="pt-8">
             <div className="flex items-center gap-3 mb-6 px-4">
                <div className="w-2 h-8 bg-yellow-500 rounded-full shadow-[0_0_15px_rgba(234,179,8,0.3)]" />
                <h2 className="text-2xl font-display font-black uppercase tracking-tighter text-white">
                  Special <span className="text-yellow-500">Global Collections</span>
                </h2>
             </div>
             
             <MediaRow
                title="🌍 worldwide Anticipated Operations"
                items={worldwideUpcoming?.results || []}
                mediaType="movie"
                isLoading={worldwideLoading}
              />

             <MediaRow
                title="📈 Global Trending Streams"
                items={trending || []}
                mediaType="movie"
                isLoading={trendingLoading}
              />
          </div>

          {/* Hide/De-prioritize broader India row if user wants strict local focus */}
          {!isKeralaFocus && (
            <MediaRow
              title={location?.country === "IN" ? "⚡ Indian Cinema Trends" : (location ? `⚡ Trending in ${location.country_name}` : "Trending Now")}
              items={nowPlaying?.results || []}
              mediaType="movie"
              isLoading={nowPlayingLoading}
            />
          )}

          {!isKeralaFocus && (
            <MediaRow
              title={location?.country === "IN" ? "📅 Upcoming Indian Releases" : (location ? `📅 Upcoming in ${location.country_name}` : "Upcoming Releases")}
              items={upcoming?.results || []}
              mediaType="movie"
              isLoading={upcomingLoading}
            />
          )}

          {(user || selectedGenres.length > 0) && (
            <>
              <MediaRow
                title={GENRE_LABELS[28]}
                items={actionMovies?.results || []}
                mediaType="movie"
              />
              <MediaRow
                title={GENRE_LABELS[878]}
                items={sciFiMovies?.results || []}
                mediaType="movie"
              />
              <MediaRow
                title={GENRE_LABELS[53]}
                items={thrillerMovies?.results || []}
                mediaType="movie"
              />
              <MediaRow
                title={GENRE_LABELS[16]}
                items={animationMovies?.results || []}
                mediaType="movie"
              />
              
              {selectedGenres
                .filter(id => ![28, 878, 53, 16].includes(id))
                .map((id, index) => (
                  <MediaRow
                    key={id}
                    title={GENRE_LABELS[id]}
                    items={personalizedQueries[index]?.data?.results || []}
                    mediaType="movie"
                  />
                ))}
            </>
          )}
          
          <MediaRow
            title="Popular Movies"
            items={popularMovies?.results || []}
            mediaType="movie"
            isLoading={moviesLoading}
          />
          
          <MediaRow
            title="Popular TV Shows"
            items={popularTV?.results || []}
            mediaType="tv"
            isLoading={tvLoading}
          />
          
          <MediaRow
            title="Top Rated"
            items={topRated?.results || []}
            mediaType="movie"
            isLoading={topRatedLoading}
          />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
