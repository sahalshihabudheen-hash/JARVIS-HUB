import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Play, Star, Calendar, Tv, Heart, Bell, Share2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import MediaRow from "@/components/MediaRow";
import Footer from "@/components/Footer";
import SeoMetadata from "@/components/SeoMetadata";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getTVDetails, getSeasonDetails, getSimilar, getBackdropUrl, getImageUrl } from "@/lib/tmdb";
import { cn } from "@/lib/utils";
import { isInWatchlist, toggleWatchlist } from "@/lib/watchlist";
import { toast } from "sonner";

const TVDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const tvId = parseInt(id || "0");
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [inWatchlist, setInWatchlist] = useState(false);

  useEffect(() => {
    if (tvId) {
      setInWatchlist(isInWatchlist(tvId, "tv", user?.uid));
    }
  }, [tvId, user?.uid]);

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
    }, user?.uid);
    setInWatchlist(added);
    toast.success(added ? "Added to watchlist" : "Removed from watchlist");
  };

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      toast.success("Link copied! Share it with your friends.");
    }).catch(() => {
      toast.error("Failed to copy link");
    });
  };

  const isReleased = show.first_air_date ? new Date(show.first_air_date) <= new Date() : true;
  const releaseStatus = show.status || (isReleased ? "Released" : "Upcoming");
  const trailers = show.videos?.results?.filter(v => v.type === "Trailer" && v.site === "YouTube") || [];
  
  const handleNotify = () => {
    toast.success(`You will be notified when ${show.name} is released!`);
  };

  return (
    <div className="min-h-screen bg-background">
      <SeoMetadata 
        title={show.name}
        description={show.overview}
        image={getImageUrl(show.poster_path, "w780")}
        type="video.tv_show"
      />
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

              <div className="flex flex-wrap gap-4 mt-8">
                {isReleased && validSeasons.length > 0 ? (
                  <Link to={`/watch/tv/${show.id}/1/1`}>
                    <Button size="lg" className="hover-glow bg-primary text-black font-semibold rounded-full px-8 shadow-[0_0_20px_rgba(34,211,238,0.4)]">
                      <Play className="w-5 h-5 mr-2 fill-current" />
                      Watch Now
                    </Button>
                  </Link>
                ) : !isReleased ? (
                  <Button size="lg" onClick={handleNotify} className="hover-glow bg-purple-500 text-white font-semibold rounded-full px-8 shadow-[0_0_20px_rgba(168,85,247,0.4)]">
                    <Bell className="w-5 h-5 mr-2" />
                    Notify when launched
                  </Button>
                ) : null}
                
                <Button
                  size="lg"
                  variant="outline"
                  onClick={handleWatchlist}
                  className={`rounded-full px-6 border-white/10 glass ${inWatchlist ? "text-red-500 border-red-500/30 bg-red-500/10" : "text-white hover:bg-white/10"}`}
                >
                  <Heart className={`w-5 h-5 mr-2 ${inWatchlist ? "fill-red-500" : ""}`} />
                  {inWatchlist ? "In Watchlist" : "Add to Watchlist"}
                </Button>

                <Button
                  size="lg"
                  variant="outline"
                  onClick={handleShare}
                  className="rounded-full px-6 border-white/10 glass text-white hover:bg-white/10"
                >
                  <Share2 className="w-5 h-5 mr-2" />
                  Share Show
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trailers Section */}
      {trailers.length > 0 && (
        <section className="container py-12 border-t border-white/5">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-1.5 h-6 bg-primary rounded-full shadow-[0_0_10px_rgba(34,211,238,0.8)]"></div>
            <h2 className="text-2xl font-display font-bold">Trailers & Clips</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trailers.slice(0, 3).map((trailer) => (
              <div key={trailer.id} className="relative aspect-video rounded-xl overflow-hidden glass border border-white/5 group">
                <iframe
                  src={`https://www.youtube.com/embed/${trailer.key}?modestbranding=1&rel=0`}
                  title={trailer.name}
                  className="w-full h-full"
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                />
              </div>
            ))}
          </div>
        </section>
      )}

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

      {/* Cast Section */}
      {show.credits?.cast && show.credits.cast.length > 0 && (
        <section className="container py-12 border-t border-white/5">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-1.5 h-6 bg-cyan-500 rounded-full shadow-[0_0_10px_rgba(34,211,238,0.8)]"></div>
            <h2 className="text-2xl font-display font-bold">Series Cast</h2>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-hide">
            {show.credits.cast.slice(0, 12).map((actor) => (
              <div key={actor.id} className="flex-shrink-0 w-28 group">
                <div className="w-28 h-28 rounded-full overflow-hidden border-2 border-white/5 mb-3 group-hover:border-primary/50 transition-all duration-300 shadow-xl">
                  <img
                    src={getImageUrl(actor.profile_path, "w185")}
                    alt={actor.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <p className="text-sm font-bold text-white text-center line-clamp-1">{actor.name}</p>
                <p className="text-[10px] text-muted-foreground text-center line-clamp-1">{actor.character}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Similar */}
      <div className="container pb-16">
        <MediaRow
          title="More Like This"
          items={similar || []}
          mediaType="tv"
        />
      </div>
      <Footer />
    </div>
  );
};

export default TVDetails;
