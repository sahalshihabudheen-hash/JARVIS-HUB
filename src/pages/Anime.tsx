import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import MediaCard from "@/components/MediaCard";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { discoverTV, discoverMovies, SearchResult } from "@/lib/tmdb";

const ANIME_GENRE_ID = "16"; // Animation genre for both TV and Movies
const ANIME_KEYWORD = "210024"; // Anime keyword in TMDB

type AnimeCategory = "tv" | "movie" | "standard";

const Anime = () => {
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState<AnimeCategory>("tv");

  const fetchFn = () => {
    if (category === "tv") {
      return discoverTV({ 
        with_genres: ANIME_GENRE_ID,
        with_original_language: "ja"
      }, page);
    } else if (category === "movie") {
      return discoverMovies({ 
        with_genres: ANIME_GENRE_ID,
        with_original_language: "ja"
      }, page);
    } else {
      // Standard Animation (All countries)
      return discoverMovies({ 
        with_genres: ANIME_GENRE_ID
      }, page);
    }
  };

  const { data, isLoading } = useQuery<SearchResult>({
    queryKey: ["anime", category, page],
    queryFn: fetchFn,
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="container">
          <h1 className="text-3xl md:text-4xl font-display font-bold mb-2">Anime & Animation</h1>
          <p className="text-muted-foreground mb-6">Discover popular animated series and movies</p>

          <div className="flex flex-wrap gap-3 mb-10 pb-6 border-b border-white/5">
            {[
              { key: "tv", label: "Anime Series" },
              { key: "movie", label: "Anime Movies" },
              { key: "standard", label: "Standard Animation" },
            ].map((cat) => (
              <Button
                key={cat.key}
                variant={category === cat.key ? "default" : "secondary"}
                className={cn(
                  "rounded-full px-6 transition-all duration-300",
                  category === cat.key ? "bg-white text-black hover:bg-white/90" : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
                )}
                onClick={() => { setCategory(cat.key as AnimeCategory); setPage(1); }}
              >
                {cat.label}
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
                {data?.results?.map((anime) => (
                  <MediaCard 
                    key={anime.id} 
                    item={anime} 
                    mediaType={category === "tv" ? "tv" : "movie"} 
                  />
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

export default Anime;
