import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Play, Star, Clock, Calendar, Heart } from "lucide-react";
import Navbar from "@/components/Navbar";
import MediaRow from "@/components/MediaRow";
import { Button } from "@/components/ui/button";
import { getMovieDetails, getSimilar, getBackdropUrl, getImageUrl } from "@/lib/tmdb";
import { isInWatchlist, toggleWatchlist } from "@/lib/watchlist";
import { toast } from "sonner";

const MovieDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const movieId = parseInt(id || "0");
  const [inWatchlist, setInWatchlist] = useState(false);

  useEffect(() => {
    if (movieId) {
      setInWatchlist(isInWatchlist(movieId, "movie"));
    }
  }, [movieId]);

  const { data: movie, isLoading } = useQuery({
    queryKey: ["movie", movieId],
    queryFn: () => getMovieDetails(movieId),
    enabled: !!movieId,
  });

  const { data: similar } = useQuery({
    queryKey: ["similarMovies", movieId],
    queryFn: () => getSimilar("movie", movieId),
    enabled: !!movieId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="h-[60vh] shimmer" />
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Movie not found</h1>
          <Button onClick={() => navigate("/")}>Go Home</Button>
        </div>
      </div>
    );
  }

  const year = movie.release_date?.split("-")[0];
  const runtime = movie.runtime ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m` : null;

  const handleWatchlist = () => {
    const added = toggleWatchlist({
      id: movie.id,
      type: "movie",
      title: movie.title,
      poster_path: movie.poster_path,
      backdrop_path: movie.backdrop_path,
      vote_average: movie.vote_average,
      release_date: movie.release_date,
    });
    setInWatchlist(added);
    toast.success(added ? "Added to watchlist" : "Removed from watchlist");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative min-h-[70vh] pt-20">
        {/* Background */}
        <div className="absolute inset-0">
          <img
            src={getBackdropUrl(movie.backdrop_path)}
            alt={movie.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-background/40" />
          <div className="absolute inset-0 gradient-hero" />
        </div>

        {/* Content */}
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
            {/* Poster */}
            <div className="flex-shrink-0 w-64 mx-auto md:mx-0">
              <img
                src={getImageUrl(movie.poster_path, "w500")}
                alt={movie.title}
                className="w-full rounded-xl shadow-card"
              />
            </div>

            {/* Info */}
            <div className="flex-1">
              <h1 className="text-3xl md:text-5xl font-display font-bold mb-4">
                {movie.title}
              </h1>

              {movie.tagline && (
                <p className="text-lg text-highlight italic mb-4">{movie.tagline}</p>
              )}

              {/* Meta */}
              <div className="flex flex-wrap items-center gap-4 mb-6">
                {movie.vote_average > 0 && (
                  <div className="flex items-center gap-1">
                    <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                    <span className="font-medium">{movie.vote_average.toFixed(1)}</span>
                  </div>
                )}
                {year && (
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>{year}</span>
                  </div>
                )}
                {runtime && (
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>{runtime}</span>
                  </div>
                )}
              </div>

              {/* Genres */}
              <div className="flex flex-wrap gap-2 mb-6">
                {movie.genres?.map((genre) => (
                  <span
                    key={genre.id}
                    className="px-3 py-1 rounded-full bg-secondary text-sm"
                  >
                    {genre.name}
                  </span>
                ))}
              </div>

              {/* Overview */}
              <p className="text-muted-foreground leading-relaxed mb-8 max-w-2xl">
                {movie.overview}
              </p>

              {/* Actions */}
              <div className="flex flex-wrap gap-4">
                <Link to={`/watch/movie/${movie.id}`}>
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

      {/* Similar */}
      <div className="container pb-16">
        <MediaRow
          title="More Like This"
          items={similar || []}
          mediaType="movie"
        />
      </div>
    </div>
  );
};

export default MovieDetails;
