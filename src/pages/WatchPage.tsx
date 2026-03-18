import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ChevronLeft, ChevronRight, Download } from "lucide-react";
import Navbar from "@/components/Navbar";
import VideoPlayer from "@/components/VideoPlayer";
import NetflixIntro from "@/components/NetflixIntro";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { getMovieDetails, getTVDetails, getSeasonDetails } from "@/lib/tmdb";
import { useAuth } from "@/context/AuthContext";
import { useAdmin } from "@/context/AdminContext";
import { cn } from "@/lib/utils";

const WatchPage = () => {
  const { type, id, season, episode } = useParams<{
    type: "movie" | "tv";
    id: string;
    season?: string;
    episode?: string;
  }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addActivity } = useAdmin();
  const [showIntro, setShowIntro] = useState(true);
  const [selectedLang, setSelectedLang] = useState<string | undefined>(undefined);
  
  const mediaId = parseInt(id || "0");
  const seasonNum = parseInt(season || "1");
  const episodeNum = parseInt(episode || "1");
  const isTV = type === "tv";

  const { data: movie } = useQuery({
    queryKey: ["movie", mediaId],
    queryFn: () => getMovieDetails(mediaId),
    enabled: type === "movie" && !!mediaId,
  });

  const { data: show } = useQuery({
    queryKey: ["tv", mediaId],
    queryFn: () => getTVDetails(mediaId),
    enabled: isTV && !!mediaId,
  });

  const { data: seasonData } = useQuery({
    queryKey: ["season", mediaId, seasonNum],
    queryFn: () => getSeasonDetails(mediaId, seasonNum),
    enabled: isTV && !!mediaId,
  });

  const content = movie || show;
  const title = movie?.title || show?.name || "Loading...";
  const episodes = seasonData?.episodes || [];
  const currentEpisode = episodes.find(e => e.episode_number === episodeNum);
  const hasNextEpisode = episodes.some(e => e.episode_number === episodeNum + 1);
  const hasPrevEpisode = episodeNum > 1;
  const validSeasons = show?.seasons?.filter(s => s.season_number > 0) || [];

  // Log activity and Add to Continue Watching History
  useEffect(() => {
    if (content) {
      // 1. Log Admin Activity
      if (user && user.email) {
        addActivity({
          userEmail: user.email,
          mediaTitle: isTV && currentEpisode 
            ? `${title} (S${seasonNum}, Ep${episodeNum}: ${currentEpisode.name})`
            : title,
          mediaType: type as "movie" | "tv",
          mediaPoster: `https://image.tmdb.org/t/p/w200${content.poster_path}`
        });
      }

      // 2. Force add to "Continue Watching" history (since non-Vidlink servers don't emit progress)
      try {
        const historyStr = localStorage.getItem("vidLinkProgress");
        const historyObj = historyStr ? JSON.parse(historyStr) : {};
        const historyKey = `${content.id}`;
        
        historyObj[historyKey] = {
          ...historyObj[historyKey], // Preserve any real progress if it previously existed
          id: content.id,
          type: type as "movie" | "tv",
          title: title,
          poster_path: content.poster_path || "",
          backdrop_path: content.backdrop_path || "",
          last_season_watched: isTV ? String(seasonNum) : undefined,
          last_episode_watched: isTV ? String(episodeNum) : undefined,
          progress: historyObj[historyKey]?.progress || {
            watched: 10, // 10% defaults so it appears in the list
            duration: 100 
          },
          last_updated: Date.now()
        };
        
        localStorage.setItem("vidLinkProgress", JSON.stringify(historyObj));
      } catch (e) {
        console.error("Failed to save history", e);
      }
    }
  }, [content?.id, episodeNum, user, title, type, isTV, seasonNum, currentEpisode]);

  return (
    <div className="min-h-screen bg-background">
      {showIntro && <NetflixIntro onComplete={() => setShowIntro(false)} />}
      <Navbar />

      <main className="pt-20 pb-16">
        <div className="container">
          {/* Back Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(isTV ? `/tv/${mediaId}` : `/movie/${mediaId}`)}
            className="mb-4 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Details
          </Button>

          {/* Title and Download */}
          <div className="mb-4 flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-display font-bold">
                {title}
              </h1>
              {isTV && currentEpisode && (
                <p className="text-muted-foreground mt-1">
                  Season {seasonNum}, Episode {episodeNum}: {currentEpisode.name}
                </p>
              )}
            </div>
            
            <Button 
              variant="outline" 
              className="shrink-0 bg-white/5 border-white/10 hover:bg-primary/20 hover:border-primary/50 text-white transition-all shadow-[0_0_15px_rgba(34,211,238,0.1)]"
              onClick={() => toast.info("To download: Play the video, and look for the download icon (⬇) inside the player controls at the bottom right.", { duration: 6000 })}
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </div>

          {/* Language Selector */}
          <div className="mb-6 flex flex-wrap items-center gap-3 p-4 glass border border-white/10 rounded-2xl">
            <div className="flex items-center gap-2 mr-4">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60">Signal Frequency:</span>
            </div>
            
            {[
              { id: "en", name: "English" },
              { id: "hi", name: "Hindi" },
              { id: "ml", name: "Malayalam" },
              { id: "ta", name: "Tamil" }
            ].map((lang) => (
              <Button
                key={lang.id}
                size="sm"
                variant={selectedLang === lang.id ? "default" : "outline"}
                onClick={() => setSelectedLang(lang.id)}
                className={cn(
                  "rounded-full px-5 h-8 text-[10px] font-bold uppercase tracking-widest transition-all duration-300",
                  selectedLang === lang.id ? "bg-primary text-black shadow-[0_0_20px_rgba(34,211,238,0.4)]" : "bg-white/5 border-white/10 hover:border-primary/50"
                )}
              >
                {lang.name}
              </Button>
            ))}
            
            <Button
              size="sm"
              variant={!selectedLang ? "default" : "outline"}
              onClick={() => setSelectedLang(undefined)}
              className={cn(
                "rounded-full px-5 h-8 text-[10px] font-bold uppercase tracking-widest transition-all duration-300 ml-auto",
                !selectedLang ? "bg-blue-500/20 text-blue-400 border-blue-500/50" : "bg-transparent border-white/10"
              )}
            >
              Original Mix
            </Button>
          </div>

          {/* Player */}
          <VideoPlayer
            type={type as "movie" | "tv"}
            tmdbId={mediaId}
            imdbId={movie?.imdb_id || show?.external_ids?.imdb_id}
            season={seasonNum}
            episode={episodeNum}
            lang={selectedLang || content?.original_language}
          />

          {/* TV Navigation */}
          {isTV && (
            <div className="mt-6">
              {/* Episode Navigation */}
              <div className="flex items-center justify-between mb-6">
                <Button
                  variant="outline"
                  disabled={!hasPrevEpisode}
                  onClick={() => navigate(`/watch/tv/${mediaId}/${seasonNum}/${episodeNum - 1}`)}
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>
                
                <span className="text-muted-foreground">
                  Episode {episodeNum} of {episodes.length}
                </span>
                
                <Button
                  variant="outline"
                  disabled={!hasNextEpisode}
                  onClick={() => navigate(`/watch/tv/${mediaId}/${seasonNum}/${episodeNum + 1}`)}
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>

              {/* Season Selector */}
              {validSeasons.length > 1 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {validSeasons.map((s) => (
                    <Button
                      key={s.season_number}
                      variant={s.season_number === seasonNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => navigate(`/watch/tv/${mediaId}/${s.season_number}/1`)}
                    >
                      Season {s.season_number}
                    </Button>
                  ))}
                </div>
              )}

              {/* Episode List */}
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                {episodes.map((ep) => (
                  <Link
                    key={ep.id}
                    to={`/watch/tv/${mediaId}/${seasonNum}/${ep.episode_number}`}
                    className={`p-3 rounded-lg text-center transition-colors ${
                      ep.episode_number === episodeNum
                        ? "gradient-primary text-primary-foreground"
                        : "bg-secondary hover:bg-secondary/80"
                    }`}
                  >
                    <span className="text-sm font-medium">Ep {ep.episode_number}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default WatchPage;
