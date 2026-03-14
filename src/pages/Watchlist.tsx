import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Heart, Trash2, Play } from "lucide-react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { getWatchlist, removeFromWatchlist, WatchlistItem } from "@/lib/watchlist";
import { getImageUrl } from "@/lib/tmdb";

const Watchlist = () => {
  const [items, setItems] = useState<WatchlistItem[]>([]);

  useEffect(() => {
    setItems(getWatchlist());
  }, []);

  const handleRemove = (id: number, type: "movie" | "tv") => {
    removeFromWatchlist(id, type);
    setItems(getWatchlist());
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container pt-24 pb-16">
        <div className="flex items-center gap-3 mb-8">
          <Heart className="w-8 h-8 text-highlight fill-highlight" />
          <h1 className="text-3xl md:text-4xl font-display font-bold">My Watchlist</h1>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-20">
            <Heart className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Your watchlist is empty</h2>
            <p className="text-muted-foreground mb-6">
              Save movies and shows to watch later
            </p>
            <Link to="/">
              <Button>Browse Content</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {items.map((item) => {
              const linkPath = item.type === "movie" ? `/movie/${item.id}` : `/tv/${item.id}`;
              const watchPath = item.type === "movie" ? `/watch/movie/${item.id}` : `/tv/${item.id}`;
              const year = (item.release_date || item.first_air_date || "").split("-")[0];

              return (
                <div key={`${item.type}-${item.id}`} className="group relative">
                  <Link to={linkPath} className="block rounded-xl overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-card-hover">
                    <div className="relative aspect-[2/3] bg-secondary">
                      <img
                        src={getImageUrl(item.poster_path)}
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        loading="lazy"
                      />
                      
                      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <div className="w-14 h-14 rounded-full bg-foreground flex items-center justify-center shadow-glow transform scale-75 group-hover:scale-100 transition-transform duration-300">
                          <Play className="w-6 h-6 text-background fill-current ml-1" />
                        </div>
                      </div>

                      <div className="absolute top-2 left-2 px-2 py-1 rounded-md bg-highlight/90 text-background text-xs font-medium uppercase">
                        {item.type === "tv" ? "TV" : "Movie"}
                      </div>
                    </div>

                    <div className="p-3 bg-card">
                      <h3 className="font-medium text-sm truncate group-hover:text-highlight transition-colors">
                        {item.title}
                      </h3>
                      {year && (
                        <p className="text-xs text-muted-foreground mt-1">{year}</p>
                      )}
                    </div>
                  </Link>

                  <button
                    onClick={() => handleRemove(item.id, item.type)}
                    className="absolute top-2 right-2 p-2 rounded-full bg-background/80 text-destructive opacity-0 group-hover:opacity-100 transition-all hover:bg-destructive hover:text-destructive-foreground z-10"
                    title="Remove from watchlist"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default Watchlist;
