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
import { getEmbedUrl } from "@/lib/pornhub";
import { useAuth } from "@/context/AuthContext";
import { addToAdultHistory } from "@/lib/adult-history";
import { useTutorial } from "@/context/TutorialContext";

const GENRE_LABELS: Record<number, string> = {
  28: "Action",
  878: "Sci-Fi",
  27: "Horror",
  35: "Comedy",
  53: "Thriller",
  10749: "Romance",
  18: "Drama",
  16: "Animation",
  14: "Fantasy",
  9648: "Mystery",
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
    isp?: string;
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
        return discoverMovies({ region: "IN", sort_by: "popularity.desc" });
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
        return discoverMovies({ region: "IN", "primary_release_date.gte": new Date().toISOString().split('T')[0] });
      }
      return getUpcomingMovies(1, location?.country);
    },
    enabled: !!location,
  });

  // Advanced Region Detection Logic
  const getRegionalContext = () => {
    const focusKey = user?.uid ? `user_regional_focus_${user.uid}` : "user_regional_focus";
    const manualFocus = localStorage.getItem(focusKey) || "auto";
    const regionName = (location?.region || "").toLowerCase();
    const regionCode = (location?.region_code || "").toUpperCase();
    const cityName = (location?.city || "").toLowerCase();
    const countryCode = (location?.country || "IN").toUpperCase();
    const countryName = location?.country_name || "India";
    const browserLangs = navigator.languages || [navigator.language];
    
    // Determine target region (Manual override or Detected)
    let target = manualFocus !== "auto" ? manualFocus : regionName;
    if (manualFocus === "auto" && !target) target = regionCode;
    if (manualFocus === "auto" && !target) target = cityName;
    
    // Default Global Context
    const context = {
      title: countryName,
      accent: "Cinema Hub",
      language: location?.languages?.split(',')[0].split('-')[0] || "en",
      region: target ? (target.charAt(0).toUpperCase() + target.slice(1)) : countryName,
      stateCode: regionCode,
      isIndia: countryCode === "IN"
    };

    // Special Case: India (Language detection)
    if (context.isIndia) {
      context.title = "Indian";
      context.language = "hi"; // Default to Hindi for India if no specific state found
      
      const keralaCities = ["kochi", "trivandrum", "thiruvananthapuram", "calicut", "kozhikode", "thrissur", "kollam", "palakkad", "alappuzha", "kottayam", "malappuram", "kannur", "kasaragod"];
      const isMalayalamBrowser = browserLangs.some(l => l.toLowerCase().startsWith('ml'));
      
      if (target.includes("kerala") || regionCode === "KL" || keralaCities.includes(cityName) || isMalayalamBrowser) {
        context.title = "Malayalam";
        context.region = "Kerala";
        context.language = "ml";
      } else if (target.includes("tamil") || regionCode === "TN" || cityName.includes("chennai") || cityName.includes("madurai") || browserLangs.some(l => l.toLowerCase().startsWith('ta'))) {
        context.title = "Tamil";
        context.region = "Tamil Nadu";
        context.language = "ta";
      } else if (target.includes("telugu") || target.includes("andhra") || regionCode === "AP" || regionCode === "TG" || cityName.includes("hyderabad") || browserLangs.some(l => l.toLowerCase().startsWith('te'))) {
        context.title = "Telugu";
        context.region = "Andhra & Telangana";
        context.language = "te";
      }
    }

    return { ...context, isp: location?.isp };
  };

  const regionalContext = getRegionalContext();

  const { data: regionalNow, isLoading: regionalLoading } = useQuery({
    queryKey: ["regionalNow", location?.country, location?.region, location?.region_code, user?.uid ? `user_regional_focus_${user.uid}` : "user_regional_focus"],
    queryFn: () => {
      const focusKey = user?.uid ? `user_regional_focus_${user.uid}` : "user_regional_focus";
      const isIndia = location?.country === "IN" || localStorage.getItem(focusKey) !== "auto";
      
      const params: Record<string, string> = {
        sort_by: "popularity.desc",
        include_adult: "false"
      };

      if (isIndia) {
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
    queryKey: ["regionalUpcoming", location?.country, location?.region, location?.region_code, user?.uid ? `user_regional_focus_${user.uid}` : "user_regional_focus"],
    queryFn: () => {
      const focusKey = user?.uid ? `user_regional_focus_${user.uid}` : "user_regional_focus";
      const isIndia = location?.country === "IN" || localStorage.getItem(focusKey) !== "auto";
      
      const params: Record<string, string> = {
        sort_by: "popularity.desc",
        include_adult: "false",
        "primary_release_date.gte": new Date().toISOString().split('T')[0]
      };

      if (isIndia) {
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
    <div className="min-h-screen bg-background relative pt-4">
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
          <div className="pb-8">
            <ContinueWatching />
          </div>

          {/* Precise Location Banner */}
          {location && !location.latitude && (
            <div className="mx-4 p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 animate-fade-in">
              <div className="flex items-center gap-3">
                <ShieldAlert className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm font-medium text-white">Personalize for {location.city || location.region || location.country_name}?</p>
                  <p className="text-xs text-white/50">Enable location for better local content recommendations.</p>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="rounded-full border-white/20 hover:bg-white/10"
                onClick={() => {
                  getUserLocation(true).then(setLocation);
                }}
              >
                Enable
              </Button>
            </div>
          )}

          {/* REGIONAL CINEMA HUB */}
          {location && (
            <div className="space-y-4 py-4 px-4 overflow-hidden bg-white/2 bg-gradient-to-b from-white/[0.02] to-transparent rounded-3xl mx-4">
               <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                  <h2 className="text-xl md:text-2xl font-bold text-white">
                    {regionalContext.title} Cinema
                  </h2>

                  {location?.country === "IN" && regionalContext.language === "hi" && (
                    <div className="flex flex-wrap items-center gap-2">
                       {[
                         { id: "kerala", label: "Malayalam" },
                         { id: "tamil", label: "Tamil" },
                         { id: "telugu", label: "Telugu" },
                       ].map((r) => (
                         <button
                           key={r.id}
                           onClick={() => {
                             const focusKey = user?.uid ? `user_regional_focus_${user.uid}` : "user_regional_focus";
                             localStorage.setItem(focusKey, r.id);
                             window.location.reload();
                           }}
                           className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-[10px] font-bold uppercase transition-all"
                         >
                           {r.label}
                         </button>
                       ))}
                    </div>
                  )}
               </div>

               <div id="regional-cinema-row">
                 <MediaRow
                    title="Current Blockbusters"
                    items={regionalNow?.results || []}
                    mediaType="movie"
                    isLoading={regionalLoading}
                  />
                </div>
                
                <MediaRow
                  title="New Releases"
                  items={regionalUpcoming?.results || []}
                  mediaType="movie"
                  isLoading={regionalUpcomingLoading}
                />
            </div>
          )}
          
          {/* SPECIAL COLLECTIONS SECTION */}
          <div className="pt-4 px-4 md:px-0">
             <MediaRow
                title="Global Trending"
                items={trending || []}
                mediaType="movie"
                isLoading={trendingLoading}
              />

             <MediaRow
                title="Most Anticipated"
                items={worldwideUpcoming?.results || []}
                mediaType="movie"
                isLoading={worldwideLoading}
              />
          </div>

          {/* Hide/De-prioritize broader India row if user wants strict local focus */}
          {!isKeralaFocus && (
            <MediaRow
              title={location ? `⚡ Trending in ${location.region ? `${location.region}, ${location.country_name}` : location.country_name}` : "Trending Now"}
              items={nowPlaying?.results || []}
              mediaType="movie"
              isLoading={nowPlayingLoading}
            />
          )}

          {!isKeralaFocus && (
            <MediaRow
              title={location ? `📅 Upcoming in ${location.region ? `${location.region}, ${location.country_name}` : location.country_name}` : "Upcoming Releases"}
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
