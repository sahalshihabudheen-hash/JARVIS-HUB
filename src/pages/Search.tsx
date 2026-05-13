import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Search as SearchIcon } from "lucide-react";
import Navbar from "@/components/Navbar";
import MediaCard from "@/components/MediaCard";
import Footer from "@/components/Footer";
import { searchMulti, MediaItem } from "@/lib/tmdb";
import { useAuth } from "@/context/AuthContext";
import { saveSearchHistory } from "@/lib/vidlink";

const Search = () => {
  const { user } = useAuth();
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

  useEffect(() => {
    if (debouncedQuery.length > 2 && user?.uid) {
      saveSearchHistory(user.uid, debouncedQuery);
    }
  }, [debouncedQuery, user?.uid]);

  const results = data?.results?.filter(
    (item: MediaItem) => item.media_type === "movie" || item.media_type === "tv"
  ) || [];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="container">
          {/* Search Input */}
          <div className="max-w-3xl mx-auto mb-16">
            <div className="relative group">
              <SearchIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-white/20 group-focus-within:text-primary transition-colors" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search movies, TV shows, anime..."
                className="w-full pl-16 pr-8 py-6 bg-white/5 border border-white/10 rounded-full text-xl placeholder:text-white/20 focus:outline-none focus:bg-white/10 focus:border-primary/50 transition-all shadow-2xl"
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
      <Footer />
    </div>
  );
};

export default Search;
