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

const Index = () => {
  const { user } = useAuth();
  const [location, setLocation] = useState<{ country: string; country_name: string; region: string } | null>(null);

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
    queryFn: () => getNowPlayingMovies(1, location?.country),
  });

  const { data: upcoming, isLoading: upcomingLoading } = useQuery({
    queryKey: ["upcoming", location?.country],
    queryFn: () => getUpcomingMovies(1, location?.country),
  });

  // Region specific content (e.g., Malayalam for Kerala)
  const isKerala = location?.region?.toLowerCase().includes("kerala");
  
  const { data: regionalNow, isLoading: regionalLoading } = useQuery({
    queryKey: ["regionalNow", isKerala ? "ml" : "none"],
    queryFn: () => fetch("https://api.themoviedb.org/3/discover/movie?api_key=4e44d9029b1270a757cddc766a1bcb63&with_original_language=ml&sort_by=popularity.desc").then(res => res.json()),
    enabled: isKerala,
  });

  const { data: regionalUpcoming } = useQuery({
    queryKey: ["regionalUpcoming", isKerala ? "ml" : "none"],
    queryFn: () => fetch("https://api.themoviedb.org/3/discover/movie?api_key=4e44d9029b1270a757cddc766a1bcb63&with_original_language=ml&primary_release_date.gte=" + new Date().toISOString().split('T')[0]).then(res => res.json()),
    enabled: isKerala,
  });

  // Genre specific queries for personalized hub
  const { data: actionMovies } = useQuery({
    queryKey: ["genreAction"],
    queryFn: () => discoverMovies(28), // 28 is Action
    enabled: !!user,
  });

  const { data: sciFiMovies } = useQuery({
    queryKey: ["genreSciFi"],
    queryFn: () => discoverMovies(878), // 878 is Sci-Fi
    enabled: !!user,
  });

  const { data: thrillerMovies } = useQuery({
    queryKey: ["genreThriller"],
    queryFn: () => discoverMovies(53), // 53 is Thriller
    enabled: !!user,
  });

  const { data: animationMovies } = useQuery({
    queryKey: ["genreAnimation"],
    queryFn: () => discoverMovies(16), // 16 is Animation
    enabled: !!user,
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
          
          {isKerala && (
            <>
              <MediaRow
                title="🔥 Hot in Kerala"
                items={regionalNow?.results || []}
                mediaType="movie"
                isLoading={regionalLoading}
              />
              <MediaRow
                title="🆕 Upcoming in Kerala"
                items={regionalUpcoming?.results || []}
                mediaType="movie"
              />
            </>
          )}

          <MediaRow
            title="Trending Now"
            items={trending?.slice(5) || []}
            isLoading={trendingLoading}
          />
          
          <MediaRow
            title={location?.country === "IN" ? "⚡ Now Playing in India" : `Hot in ${location?.country_name || 'Your Area'}`}
            items={nowPlaying?.results || []}
            mediaType="movie"
            isLoading={nowPlayingLoading}
          />

          <MediaRow
            title={location?.country === "IN" ? "📅 Upcoming in India" : `Upcoming in ${location?.country_name || 'Your Area'}`}
            items={upcoming?.results || []}
            mediaType="movie"
            isLoading={upcomingLoading}
          />

          {user && (
            <>
              <MediaRow
                title="Combat & Action Protocols"
                items={actionMovies?.results || []}
                mediaType="movie"
              />
              <MediaRow
                title="Cybernetic & Sci-Fi Realities"
                items={sciFiMovies?.results || []}
                mediaType="movie"
              />
              <MediaRow
                title="Infiltration & Thriller Operations"
                items={thrillerMovies?.results || []}
                mediaType="movie"
              />
              <MediaRow
                title="Holographic & Animated Data"
                items={animationMovies?.results || []}
                mediaType="movie"
              />
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
