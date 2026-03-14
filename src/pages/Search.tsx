import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Search as SearchIcon } from "lucide-react";
import Navbar from "@/components/Navbar";
import MediaCard from "@/components/MediaCard";
import { searchMulti, MediaItem } from "@/lib/tmdb";

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
      if (query) {
        setSearchParams({ q: query });
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [query, setSearchParams]);

  const { data, isLoading } = useQuery({
    queryKey: ["search", debouncedQuery],
    queryFn: () => searchMulti(debouncedQuery),
    enabled: debouncedQuery.length > 2,
  });

  const results = data?.results?.filter(
    (item: MediaItem) => item.media_type === "movie" || item.media_type === "tv"
  ) || [];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="container">
          {/* Search Input */}
          <div className="max-w-2xl mx-auto mb-12">
            <div className="relative">
              <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-muted-foreground" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search movies, TV shows, anime..."
                className="w-full pl-14 pr-6 py-4 bg-secondary border border-border rounded-2xl text-lg placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                autoFocus
              />
            </div>
          </div>

          {/* Results */}
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="aspect-[2/3] rounded-xl shimmer" />
              ))}
            </div>
          ) : debouncedQuery.length > 2 && results.length > 0 ? (
            <>
              <h2 className="text-xl font-display font-bold mb-6">
                Results for "{debouncedQuery}"
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {results.map((item: MediaItem) => (
                  <MediaCard
                    key={item.id}
                    item={item}
                    mediaType={item.media_type}
                  />
                ))}
              </div>
            </>
          ) : debouncedQuery.length > 2 ? (
            <div className="text-center py-16">
              <h2 className="text-2xl font-display font-bold mb-2">No results found</h2>
              <p className="text-muted-foreground">
                Try a different search term
              </p>
            </div>
          ) : (
            <div className="text-center py-16">
              <SearchIcon className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
              <h2 className="text-2xl font-display font-bold mb-2">Search for content</h2>
              <p className="text-muted-foreground">
                Find your favorite movies, TV shows, and anime
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Search;
