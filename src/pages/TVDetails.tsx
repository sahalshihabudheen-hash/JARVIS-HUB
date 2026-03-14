import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Play, Star, Calendar, Tv, Heart } from "lucide-react";
import Navbar from "@/components/Navbar";
import MediaRow from "@/components/MediaRow";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getTVDetails, getSeasonDetails, getSimilar, getBackdropUrl, getImageUrl } from "@/lib/tmdb";
import { cn } from "@/lib/utils";
import { isInWatchlist, toggleWatchlist } from "@/lib/watchlist";
import { toast } from "sonner";

const TVDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const tvId = parseInt(id || "0");
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [inWatchlist, setInWatchlist] = useState(false);

  useEffect(() => {
    if (tvId) {
      setInWatchlist(isInWatchlist(tvId, "tv"));
    }
  }, [tvId]);

  const { data: show, isLoading } = useQuery({
    queryKey: ["tv", tvId],
    queryFn: () => getTVDetails(tvId),
    enabled: !!tvId,
  });

  const { data: seasonData } = useQuery({
    queryKey: ["season", tvId, selectedSeason],
    queryFn: () => getSeasonDetails(tvId, selectedSeason),
    enabled: !!tvId && selectedSeason > 0,
  });

  const { data: similar } = useQuery({
    queryKey: ["similarTV", tvId],
    queryFn: () => getSimilar("tv", tvId),
    enabled: !!tvId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="h-[60vh] shimmer" />
      </div>
    );
  }

  if (!show) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Show not found</h1>
          <Button onClick={() => navigate("/")}>Go Home</Button>
        </div>
      </div>
    );
  }

  const year = show.first_air_date?.split("-")[0];
  const validSeasons = show.seasons?.filter(s => s.season_number > 0) || [];

  const handleWatchlist = () => {
    const added = toggleWatchlist({
      id: show.id,
      type: "tv",
      title: show.name,
      poster_path: show.poster_path,
      backdrop_path: show.backdrop_path,
      vote_average: show.vote_average,
      first_air_date: show.first_air_date,
    });
    setInWatchlist(added);
    toast.success(added ? "Added to watchlist" : "Removed from watchlist");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative min-h-[60vh] pt-20">
        <div className="absolute inset-0">
          <img
            src={getBackdropUrl(show.backdrop_path)}
            alt={show.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-background/40" />
          <div className="absolute inset-0 gradient-hero" />
        </div>

        <div className="container relative z-10 py-16">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="mb-6 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-shrink-0 w-64 mx-auto md:mx-0">
              <img
                src={getImageUrl(show.poster_path, "w500")}
                alt={show.name}
                className="w-full rounded-xl shadow-card"
              />
            </div>

            <div className="flex-1">
              <h1 className="text-3xl md:text-5xl font-display font-bold mb-4">
                {show.name}
              </h1>

              {show.tagline && (
                <p className="text-lg text-highlight italic mb-4">{show.tagline}</p>
              )}

              <div className="flex flex-wrap items-center gap-4 mb-6">
                {show.vote_average > 0 && (
                  <div className="flex items-center gap-1">
                    <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                    <span className="font-medium">{show.vote_average.toFixed(1)}</span>
                  </div>
                )}
                {year && (
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>{year}</span>
                  </div>
                )}
                {show.number_of_seasons && (
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Tv className="w-4 h-4" />
                    <span>{show.number_of_seasons} Seasons</span>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                {show.genres?.map((genre) => (
                  <span
                    key={genre.id}
                    className="px-3 py-1 rounded-full bg-secondary text-sm"
                  >
                    {genre.name}
                  </span>
                ))}
              </div>

              <p className="text-muted-foreground leading-relaxed mb-8 max-w-2xl">
                {show.overview}
              </p>

              <div className="flex flex-wrap gap-4">
                <Link to={`/watch/tv/${show.id}/1/1`}>
                  <Button size="lg" className="hover-glow">
                    <Play className="w-5 h-5 mr-2 fill-current" />
                    Watch Now
                  </Button>
                </Link>
                <Button
                  size="lg"
                  variant="secondary"
                  onClick={handleWatchlist}
                  className={inWatchlist ? "text-highlight" : ""}
                >
                  <Heart className={`w-5 h-5 mr-2 ${inWatchlist ? "fill-highlight" : ""}`} />
                  {inWatchlist ? "In Watchlist" : "Add to Watchlist"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Episodes */}
      <div className="container py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-display font-bold">Episodes</h2>
          
          {validSeasons.length > 0 && (
            <Select
              value={selectedSeason.toString()}
              onValueChange={(val) => setSelectedSeason(parseInt(val))}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {validSeasons.map((season) => (
                  <SelectItem key={season.season_number} value={season.season_number.toString()}>
                    Season {season.season_number}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <div className="grid gap-3">
          {seasonData?.episodes?.map((episode) => (
            <Link
              key={episode.id}
              to={`/watch/tv/${tvId}/${episode.season_number}/${episode.episode_number}`}
              className={cn(
                "group flex gap-4 p-4 rounded-xl bg-card hover:bg-secondary/50 transition-colors"
              )}
            >
              <div className="relative flex-shrink-0 w-40 aspect-video rounded-lg overflow-hidden bg-secondary">
                {episode.still_path ? (
                  <img
                    src={getImageUrl(episode.still_path, "w300")}
                    alt={episode.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Tv className="w-8 h-8 text-muted-foreground" />
                  </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-background/50">
                  <Play className="w-8 h-8 text-foreground fill-current" />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm text-highlight font-medium">
                    Episode {episode.episode_number}
                  </span>
                  {episode.runtime && (
                    <span className="text-xs text-muted-foreground">
                      {episode.runtime} min
                    </span>
                  )}
                </div>
                <h3 className="font-medium truncate group-hover:text-highlight transition-colors">
                  {episode.name}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                  {episode.overview || "No description available."}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Similar */}
      <div className="container pb-16">
        <MediaRow
          title="More Like This"
          items={similar || []}
          mediaType="tv"
        />
      </div>
    </div>
  );
};

export default TVDetails;
