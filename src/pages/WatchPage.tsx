import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ChevronLeft, ChevronRight, Download, Play, Tv } from "lucide-react";
import Navbar from "@/components/Navbar";
import VideoPlayer from "@/components/VideoPlayer";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { getMovieDetails, getTVDetails, getSeasonDetails, getImageUrl } from "@/lib/tmdb";
import { useAuth } from "@/context/AuthContext";
import { useAdmin } from "@/context/AdminContext";
import { cn } from "@/lib/utils";
import { saveWatchProgressCloud } from "@/lib/vidlink";

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
  
  const mediaId = parseInt(id || "0");
  const seasonNum = parseInt(season || "1");
  const episodeNum = parseInt(episode || "1");
  const isTV = type === "tv";

  const [selectedLang, setSelectedLang] = useState<string | undefined>(undefined);

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

      // 2. Initial add/update to history
      const updateHistory = (incrementalWatched: number = 0) => {
        try {
          const historyKey = user?.uid ? `vidLinkProgress_${user.uid}` : "vidLinkProgress";
          const historyStr = localStorage.getItem(historyKey);
          const historyObj = historyStr ? JSON.parse(historyStr) : {};
          const mediaKey = `${content.id}`;
          
          // Determine duration in seconds (fallback: current episode runtime > show default runtime > 30m/120m)
          const durationMins = movie?.runtime || currentEpisode?.runtime || (isTV ? (show?.episode_run_time?.[0] || 30) : 120);
          const durationSecs = durationMins * 60;

          const existingProgress = historyObj[mediaKey]?.progress || {
            watched: 0,
            duration: durationSecs
          };

          const newWatched = Math.min((existingProgress.watched || 0) + incrementalWatched, durationSecs);
          
          historyObj[mediaKey] = {
            ...historyObj[mediaKey],
            id: content.id,
            type: type as "movie" | "tv",
            title: title,
            poster_path: content.poster_path || "",
            backdrop_path: content.backdrop_path || "",
            last_season_watched: isTV ? String(seasonNum) : undefined,
            last_episode_watched: isTV ? String(episodeNum) : undefined,
            isAnimation: content.genres?.some(g => g.id === 16) || content.genre_ids?.includes(16),
            progress: {
              watched: newWatched,
              duration: durationSecs
            },
            last_updated: Date.now()
          };

          // For TV shows, also update individual episode progress
          if (isTV) {
            const episodeKey = `s${seasonNum}e${episodeNum}`;
            if (!historyObj[mediaKey].show_progress) {
              historyObj[mediaKey].show_progress = {};
            }
            
            const existingEpisodeProgress = historyObj[mediaKey].show_progress[episodeKey]?.progress || {
              watched: 0,
              duration: durationSecs
            };

            historyObj[mediaKey].show_progress[episodeKey] = {
              season: String(seasonNum),
              episode: String(episodeNum),
              progress: {
                watched: Math.min((existingEpisodeProgress.watched || 0) + incrementalWatched, durationSecs),
                duration: durationSecs
              }
            };
          }
          
          localStorage.setItem(historyKey, JSON.stringify(historyObj));

          // Sync to Cloud if logged in
          if (user?.uid) {
            saveWatchProgressCloud(user.uid, historyObj[mediaKey]);
          }
        } catch (e) {
          console.error("Failed to save history", e);
        }
      };

      // Initial update (0 increment)
      updateHistory(0);

      // Start interval to track progress (every 30 seconds)
      const interval = setInterval(() => {
        if (document.visibilityState === 'visible') {
          updateHistory(30);
        }
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [content?.id, episodeNum, user, title, type, isTV, seasonNum, currentEpisode, movie?.runtime, show?.episode_run_time]);

  return (
    <div className="min-h-screen bg-background">
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

          {/* Player */}
          <VideoPlayer
            type={type as "movie" | "tv"}
            tmdbId={mediaId}
            imdbId={movie?.imdb_id || show?.external_ids?.imdb_id}
            season={seasonNum}
            episode={episodeNum}
            lang={selectedLang || content?.original_language}
            onLangChange={(l) => setSelectedLang(l)}
          />

          {/* TV Navigation */}
          {isTV && (
            <div className="mt-6">
              {/* More Episodes Heading */}
              <div className="mt-12 mb-6 flex items-center justify-between">
                <h2 className="text-xl md:text-2xl font-display font-bold">Episodes</h2>
                <div className="h-px flex-1 bg-white/10 mx-6 hidden sm:block" />
              </div>

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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {episodes.map((ep) => (
                  <Link
                    key={ep.id}
                    to={`/watch/tv/${mediaId}/${seasonNum}/${ep.episode_number}`}
                    className={cn(
                      "group relative flex flex-col rounded-xl overflow-hidden bg-card border border-white/5 transition-all duration-300 hover:scale-[1.02] hover:bg-secondary/50",
                      ep.episode_number === episodeNum 
                        ? "ring-2 ring-primary bg-primary/5" 
                        : "hover:shadow-xl hover:shadow-primary/5"
                    )}
                  >
                    <div className="relative aspect-video overflow-hidden bg-secondary">
                      {ep.still_path ? (
                        <img
                          src={getImageUrl(ep.still_path, "w300")}
                          alt={ep.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-secondary/50">
                          <Tv className="w-8 h-8 text-muted-foreground opacity-50" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80" />
                      
                      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-white px-1.5 py-0.5 rounded bg-primary/80 backdrop-blur-sm">
                            EP {ep.episode_number}
                          </span>
                          {ep.runtime && (
                            <span className="text-[10px] text-white/90 font-medium">
                              {ep.runtime}m
                            </span>
                          )}
                        </div>
                      </div>

                      {ep.episode_number === episodeNum ? (
                        <div className="absolute inset-0 flex items-center justify-center bg-primary/20 backdrop-blur-[1px]">
                          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/50">
                            <Play className="w-5 h-5 text-white fill-current" />
                          </div>
                        </div>
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                          <Play className="w-8 h-8 text-white fill-current" />
                        </div>
                      )}
                    </div>
                    
                    <div className="p-3">
                      <h3 className={cn(
                        "text-sm font-semibold line-clamp-1 transition-colors",
                        ep.episode_number === episodeNum ? "text-primary" : "group-hover:text-primary"
                      )}>
                        {ep.name}
                      </h3>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-1 leading-relaxed">
                        {ep.overview || "No description available for this episode."}
                      </p>
                    </div>
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
