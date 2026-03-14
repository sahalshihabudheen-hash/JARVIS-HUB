import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import MediaCard from "@/components/MediaCard";
import { Button } from "@/components/ui/button";
import { getPopularTVShows, getTopRatedTVShows, getTVGenres, discoverTV } from "@/lib/tmdb";

type Category = "popular" | "top_rated" | "genre";

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
      return discoverTV(selectedGenre, page);
    }
    switch (category) {
      case "top_rated": return getTopRatedTVShows(page);
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
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="container">
          <h1 className="text-3xl md:text-4xl font-display font-bold mb-8">TV Shows</h1>

          {/* Categories */}
          <div className="flex flex-wrap gap-2 mb-6">
            {categories.map((cat) => (
              <Button
                key={cat.key}
                variant={category === cat.key ? "default" : "outline"}
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
          <div className="flex flex-wrap gap-2 mb-8">
            {genres?.map((genre) => (
              <Button
                key={genre.id}
                variant={selectedGenre === genre.id ? "default" : "secondary"}
                size="sm"
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
              <div className="flex justify-center gap-4 mt-12">
                <Button
                  variant="outline"
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                >
                  Previous
                </Button>
                <span className="flex items-center text-muted-foreground">
                  Page {page} of {data?.total_pages || 1}
                </span>
                <Button
                  variant="outline"
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
    </div>
  );
};

export default TVShows;
