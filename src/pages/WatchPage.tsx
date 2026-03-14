import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import VideoPlayer from "@/components/VideoPlayer";
import { Button } from "@/components/ui/button";
import { getMovieDetails, getTVDetails, getSeasonDetails } from "@/lib/tmdb";

const WatchPage = () => {
  const { type, id, season, episode } = useParams<{
    type: "movie" | "tv";
    id: string;
    season?: string;
    episode?: string;
  }>();
  const navigate = useNavigate();
  
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

          {/* Title */}
          <div className="mb-4">
            <h1 className="text-2xl md:text-3xl font-display font-bold">
              {title}
            </h1>
            {isTV && currentEpisode && (
              <p className="text-muted-foreground mt-1">
                Season {seasonNum}, Episode {episodeNum}: {currentEpisode.name}
              </p>
            )}
          </div>

          {/* Player */}
          <VideoPlayer
            type={type as "movie" | "tv"}
            tmdbId={mediaId}
            season={seasonNum}
            episode={episodeNum}
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
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
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
    </div>
  );
};

export default WatchPage;
