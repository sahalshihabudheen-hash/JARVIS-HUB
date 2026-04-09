import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Play, Star, Clock, Calendar, Heart, Bell } from "lucide-react";
import Navbar from "@/components/Navbar";
import MediaRow from "@/components/MediaRow";
import Footer from "@/components/Footer";
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

  const isReleased = movie.release_date ? new Date(movie.release_date) <= new Date() : true;
  const releaseStatus = movie.status || (isReleased ? "Released" : "Upcoming");
  const trailers = movie.videos?.results?.filter(v => v.type === "Trailer" && v.site === "YouTube") || [];
  
  const handleNotify = () => {
    toast.success(`You will be notified when ${movie.title} is released!`);
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
              <div className="flex flex-wrap gap-4 mt-8">
                {isReleased ? (
                  <Link to={`/watch/movie/${movie.id}`}>
                    <Button size="lg" className="hover-glow bg-primary text-black font-semibold rounded-full px-8 shadow-[0_0_20px_rgba(34,211,238,0.4)]">
                      <Play className="w-5 h-5 mr-2 fill-current" />
                      Watch Now
                    </Button>
                  </Link>
                ) : (
                  <Button size="lg" onClick={handleNotify} className="hover-glow bg-purple-500 text-white font-semibold rounded-full px-8 shadow-[0_0_20px_rgba(168,85,247,0.4)]">
                    <Bell className="w-5 h-5 mr-2" />
                    Notify when launched
                  </Button>
                )}
                
                <Button
                  size="lg"
                  variant="outline"
                  onClick={handleWatchlist}
                  className={`rounded-full px-6 border-white/10 glass ${inWatchlist ? "text-red-500 border-red-500/30 bg-red-500/10" : "text-white hover:bg-white/10"}`}
                >
                  <Heart className={`w-5 h-5 mr-2 ${inWatchlist ? "fill-red-500" : ""}`} />
                  {inWatchlist ? "In Watchlist" : "Add to Watchlist"}
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

      {/* Similar */}
      <div className="container pb-16">
        <MediaRow
          title="More Like This"
          items={similar || []}
          mediaType="movie"
        />
      </div>
      <Footer />
    </div>
  );
};

export default MovieDetails;
