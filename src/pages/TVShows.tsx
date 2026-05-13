import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import MediaCard from "@/components/MediaCard";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { getPopularTVShows, getTopRatedTVShows, getTVGenres, discoverTV } from "@/lib/tmdb";
import { cn } from "@/lib/utils";

type Category = "popular" | "top_rated" | "genre" | "malayalam" | "hindi" | "tamil";

const TVShows = () => {
  const [category, setCategory] = useState<Category>("popular");
  const [selectedGenre, setSelectedGenre] = useState<number | null>(null);
  const [page, setPage] = useState(1);

  const { data: genres } = useQuery({
    queryKey: ["tvGenres"],
    queryFn: getTVGenres,
  });

  const fetchFn = () => {
    if (category === "genre" && selectedGenre) {
      return discoverTV({ with_genres: selectedGenre.toString() }, page);
    }
    switch (category) {
      case "top_rated": return getTopRatedTVShows(page);
      case "malayalam": return discoverTV({ with_original_language: "ml" }, page);
      case "hindi": return discoverTV({ with_original_language: "hi" }, page);
      case "tamil": return discoverTV({ with_original_language: "ta" }, page);
      default: return getPopularTVShows(page);
    }
  };

  const { data, isLoading } = useQuery({
    queryKey: ["tvshows", category, selectedGenre, page],
    queryFn: fetchFn,
  });

  const categories = [
    { key: "popular", label: "Popular" },
    { key: "top_rated", label: "Top Rated" },
    { key: "malayalam", label: "Malayalam" },
    { key: "hindi", label: "Hindi" },
    { key: "tamil", label: "Tamil" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="container">
          <h1 className="text-3xl md:text-4xl font-display font-bold mb-8">TV Shows</h1>

          {/* Categories */}
          <div className="flex flex-wrap gap-3 mb-4">
            {categories.map((cat) => (
              <Button
                key={cat.key}
                variant={category === cat.key ? "default" : "secondary"}
                className={cn(
                  "rounded-full px-6 transition-all duration-300",
                  category === cat.key ? "bg-white text-black hover:bg-white/90" : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
                )}
                onClick={() => {
                  setCategory(cat.key as Category);
                  setSelectedGenre(null);
                  setPage(1);
                }}
              >
                {cat.label}
              </Button>
            ))}
          </div>

          {/* Genres */}
          <div className="flex flex-wrap gap-2 mb-10 pb-4 border-b border-white/5">
            {genres?.map((genre) => (
              <Button
                key={genre.id}
                variant="ghost"
                size="sm"
                className={cn(
                  "rounded-full px-4 py-1 h-auto text-[10px] font-bold uppercase tracking-wider transition-all",
                  selectedGenre === genre.id ? "bg-primary/20 text-primary border border-primary/20" : "text-white/40 hover:text-white hover:bg-white/5"
                )}
                onClick={() => {
                  setSelectedGenre(genre.id);
                  setCategory("genre");
                  setPage(1);
                }}
              >
                {genre.name}
              </Button>
            ))}
          </div>

          {/* Grid */}
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {[...Array(18)].map((_, i) => (
                <div key={i} className="aspect-[2/3] rounded-xl shimmer" />
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {data?.results?.map((show) => (
                  <MediaCard key={show.id} item={show} mediaType="tv" />
                ))}
              </div>

              {/* Pagination */}
              <div className="flex justify-center items-center gap-6 mt-16">
                <Button
                  variant="ghost"
                  className="rounded-full px-6 hover:bg-white/5 text-white/60 hover:text-white"
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                >
                  Previous
                </Button>
                <span className="text-sm font-medium text-white/40">
                  {page} / {data?.total_pages || 1}
                </span>
                <Button
                  variant="ghost"
                  className="rounded-full px-6 hover:bg-white/5 text-white/60 hover:text-white"
                  disabled={page >= (data?.total_pages || 1)}
                  onClick={() => setPage(p => p + 1)}
                >
                  Next
                </Button>
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TVShows;
