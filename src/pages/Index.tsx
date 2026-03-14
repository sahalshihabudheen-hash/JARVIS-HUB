import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { X, ShieldAlert } from "lucide-react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import MediaRow from "@/components/MediaRow";
import ContinueWatching from "@/components/ContinueWatching";
import JarvisTutorial from "@/components/JarvisTutorial";
import { Button } from "@/components/ui/button";
import { 
  getTrending, 
  getPopularMovies, 
  getPopularTVShows, 
  getTopRatedMovies,
  getNowPlayingMovies,
  getUpcomingMovies
} from "@/lib/tmdb";

const Index = () => {
  const { data: trending, isLoading: trendingLoading } = useQuery({
    queryKey: ["trending"],
    queryFn: () => getTrending("all", "week"),
  });

  const { data: popularMovies, isLoading: moviesLoading } = useQuery({
    queryKey: ["popularMovies"],
    queryFn: () => getPopularMovies(),
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
    queryKey: ["nowPlaying"],
    queryFn: () => getNowPlayingMovies(),
  });

  const { data: upcoming, isLoading: upcomingLoading } = useQuery({
    queryKey: ["upcoming"],
    queryFn: () => getUpcomingMovies(),
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
          
          <MediaRow
            title="Trending Now"
            items={trending?.slice(5) || []}
            isLoading={trendingLoading}
          />
          
          <MediaRow
            title="Now Playing"
            items={nowPlaying?.results || []}
            mediaType="movie"
            isLoading={nowPlayingLoading}
          />
          
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
          
          <MediaRow
            title="Coming Soon"
            items={upcoming?.results || []}
            mediaType="movie"
            isLoading={upcomingLoading}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 py-8 border-t border-border">
        <div className="container mx-auto px-4 text-center space-y-2">
          <p className="text-muted-foreground text-sm">
            © 2024 JARVIS HUB. All rights reserved. Powered by VidLink & TMDB.
          </p>
          <p className="text-muted-foreground/60 text-xs">
            Administered by Shiha
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
