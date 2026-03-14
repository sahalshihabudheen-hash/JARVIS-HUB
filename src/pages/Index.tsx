import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { X, ShieldAlert } from "lucide-react";
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
  const [location, setLocation] = useState<{ 
    country: string; 
    country_name: string; 
    region: string;
    languages: string;
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

  // Region specific content (e.g., Malayalam for Kerala)
  const isKerala = location?.region?.toLowerCase().includes("kerala");
  
  const { data: regionalNow, isLoading: regionalLoading } = useQuery({
    queryKey: ["regionalNow", location?.country, location?.region, localStorage.getItem("user_regional_focus")],
    queryFn: () => {
      const manualFocus = localStorage.getItem("user_regional_focus") || "auto";
      const isIndia = location?.country === "IN" || manualFocus !== "auto";
      const regionName = manualFocus !== "auto" ? manualFocus : (location?.region?.toLowerCase() || "");
      
      const params: Record<string, string> = {
        sort_by: "popularity.desc",
        include_adult: "false"
      };

      if (isIndia || manualFocus !== "auto") {
        params.with_origin_country = "IN";
        if (regionName.includes("kerala")) params.with_original_language = "ml";
        else if (regionName.includes("tamil")) params.with_original_language = "ta";
        else if (regionName.includes("telugu") || regionName.includes("andhra")) params.with_original_language = "te";
        else if (regionName.includes("karnataka")) params.with_original_language = "kn";
        else if (regionName.includes("bengal")) params.with_original_language = "bn";
        else if (regionName.includes("maharashtra")) params.with_original_language = "mr";
        else params.with_original_language = "hi";
      } else {
        params.with_origin_country = location?.country;
        const detectedLanguages = location?.languages?.split(',') || [];
        const localLang = detectedLanguages.find(l => !l.startsWith('en'))?.split('-')[0];
        if (localLang) params.with_original_language = localLang;
      }
      
      return discoverMovies(params);
    },
    enabled: !!location,
  });

  const { data: regionalUpcoming, isLoading: regionalUpcomingLoading } = useQuery({
    queryKey: ["regionalUpcoming", location?.country, location?.region, localStorage.getItem("user_regional_focus")],
    queryFn: () => {
      const manualFocus = localStorage.getItem("user_regional_focus") || "auto";
      const isIndia = location?.country === "IN" || manualFocus !== "auto";
      const regionName = manualFocus !== "auto" ? manualFocus : (location?.region?.toLowerCase() || "");
      
      const params: Record<string, string> = {
        sort_by: "popularity.desc",
        include_adult: "false",
        "primary_release_date.gte": new Date().toISOString().split('T')[0]
      };

      if (isIndia || manualFocus !== "auto") {
        params.with_origin_country = "IN";
        if (regionName.includes("kerala")) params.with_original_language = "ml";
        else if (regionName.includes("tamil")) params.with_original_language = "ta";
        else if (regionName.includes("telugu") || regionName.includes("andhra")) params.with_original_language = "te";
        else if (regionName.includes("karnataka")) params.with_original_language = "kn";
        else if (regionName.includes("bengal")) params.with_original_language = "bn";
        else if (regionName.includes("maharashtra")) params.with_original_language = "mr";
        else params.with_original_language = "hi";
      } else {
        params.with_origin_country = location?.country;
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
  const personalizedQueries = selectedGenres
    .filter(id => ![28, 878, 53, 16].includes(id)) // Filter already included ones
    .map(id => {
      return useQuery({
        queryKey: ["genre", id],
        queryFn: () => discoverMovies({ with_genres: id.toString() }),
        enabled: selectedGenres.includes(id),
      });
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
  const isKeralaFocus = regionLabel.toLowerCase().includes("kerala");
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Ad Blocker Warning Popup */}
      {showAdWarning && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
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
        <HeroSection items={trending || []} isLoading={trendingLoading} />
        
        <div className="container mx-auto -mt-20 relative z-10">
          <ContinueWatching />
          
          {(location?.region || manualFocus !== "auto") && (
            <>
              <MediaRow
                title={isKeralaFocus ? "🔥 Malayalam Blockbusters" : `🔥 Top in ${regionLabel}`}
                items={regionalNow?.results || []}
                mediaType="movie"
                isLoading={regionalLoading}
              />
              <MediaRow
                title={isKeralaFocus ? "🆕 Upcoming Malayalam Cinema" : `🆕 Upcoming in ${regionLabel}`}
                items={regionalUpcoming?.results || []}
                mediaType="movie"
                isLoading={regionalUpcomingLoading}
              />
            </>
          )}

          {/* Worldwide row moved up for better global context after local focus */}
          <MediaRow
            title="🌍 Worldwide Most Anticipated"
            items={worldwideUpcoming?.results || []}
            mediaType="movie"
            isLoading={worldwideLoading}
          />

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
      <JarvisTutorial />
    </div>
  );
};

export default Index;
