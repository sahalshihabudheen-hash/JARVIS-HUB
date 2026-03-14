import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import MediaCard from "@/components/MediaCard";
import { Button } from "@/components/ui/button";
import { discoverTV, SearchResult } from "@/lib/tmdb";

const ANIME_GENRE_ID = 16; // Animation genre

const Anime = () => {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery<SearchResult>({
    queryKey: ["anime", page],
    queryFn: () => discoverTV(ANIME_GENRE_ID, page),
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="container">
          <h1 className="text-3xl md:text-4xl font-display font-bold mb-2">Anime</h1>
          <p className="text-muted-foreground mb-8">Discover popular animated series</p>

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
                  <MediaCard key={anime.id} item={anime} mediaType="tv" />
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

export default Anime;
