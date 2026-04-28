import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import AdultCard from "@/components/AdultCard";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { searchVideos } from "@/lib/hub";
import { Search, Flame, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getUserLocation } from "@/lib/tmdb";
import { MapPin } from "lucide-react";

const Adult = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState("all");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const [isBlurred, setIsBlurred] = useState(true);

  const [location, setLocation] = useState<string>("");

  useEffect(() => {
    const isOwner = user?.email?.toLowerCase() === "admin@gmail.com";
    if (!user || (!user.hasAdultAccess && !user.isAdmin && !isOwner)) {
      navigate("/");
    }

    // Fetch Location
    getUserLocation().then(data => {
      if (data) {
        const stateStr = data.region || "";
        const countryStr = data.country_name || "";
        const fullLocation = stateStr && countryStr ? `${stateStr}, ${countryStr}` : (stateStr || countryStr);
        setLocation(fullLocation);
      }
    });
  }, [user, navigate]);

  const [searchParams] = useSearchParams();
  const searchParam = searchParams.get("search");

  useEffect(() => {
    if (searchParam) {
      setQuery(searchParam);
      setSearchInput(searchParam);
      setPage(1);
    }
  }, [searchParam]);

  const { data, isLoading, error } = useQuery({
    queryKey: ["pornhub-videos", query, page],
    queryFn: () => searchVideos(query, page),
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setQuery(searchInput.trim());
      setPage(1);
    } else {
      setQuery("all");
      setPage(1);
    }
  };

  const categories = [
    { label: "All", value: "all" },
    { label: "Full Length", value: "full length" },
    { label: "TeamSkeet", value: "teamskeet" },
    { label: "Brazzers", value: "brazzers" },
    { label: "Popular", value: "popular" },
    { label: "Anal", value: "anal" },
    { label: "Amateur", value: "amateur" },
    { label: "BDSM", value: "bdsm" },
    { label: "Big Tits", value: "big tits" },
    { label: "Blowjob", value: "blowjob" },
    { label: "Cumshot", value: "cumshot" },
    { label: "Handjob", value: "handjob" },
    { label: "Hardcore", value: "hardcore" },
    { label: "Lesbian", value: "lesbian" },
    { label: "Milf", value: "milf" },
    { label: "Pornstar", value: "pornstar" },
    { label: "Solo", value: "solo" },
    { label: "Teen", value: "teen" },
  ];

  const teamSkeetShows = [
    { label: "Hijab Hookup", value: 'teamskeet "hijab hookup" full movie' },
    { label: "Perv Dad", value: 'teamskeet "perv dad" full movie' },
    { label: "Shoplyfter", value: 'teamskeet "shoplyfter" full movie' },
    { label: "Family Strokes", value: 'teamskeet "family strokes" full movie' },
    { label: "BFFs", value: 'teamskeet "bffs" full movie' },
    { label: "Deeper", value: 'teamskeet "deeper" full movie' },
    { label: "Sis Loves Me", value: 'teamskeet "sis loves me" full movie' },
  ];

  const asianGenres = [
    { label: "Japanese", value: "japanese" },
    { label: "Chinese", value: "chinese" },
    { label: "Korean", value: "korean" },
    { label: "Asian", value: "asian" },
    { label: "Thai", value: "thai" },
    { label: "Indian", value: "indian" },
  ];

  const videos = data?.videos?.map((v: any) => ({
    id: v.video_id,
    title: v.title,
    url: v.url,
    thumbnail: v.default_thumb,
    duration: v.duration,
    views: v.views.toLocaleString(),
    rating: v.rating,
    added: v.publish_date
  })) || [];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="container">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-xl">
                <Flame className="w-6 h-6 text-blue-500" />
              </div>
              <h1 className="text-3xl md:text-4xl font-display font-bold">Premium Entertainment</h1>
            </div>
            
            <form onSubmit={handleSearch} className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search thousands of videos..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-10 bg-white/5 border-white/10 rounded-full focus:ring-blue-500/50"
              />
            </form>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsBlurred(!isBlurred)}
              className={`rounded-full border-white/10 px-6 h-10 ${isBlurred ? 'bg-blue-600/10 text-blue-400 border-blue-500/30' : 'bg-white/5 text-white/60'}`}
            >
              {isBlurred ? (
                <><Eye className="w-4 h-4 mr-2" /> Show Thumbs</>
              ) : (
                <><EyeOff className="w-4 h-4 mr-2" /> Hide Thumbs</>
              )}
            </Button>
          </div>

          {/* Location Banner */}
          {location && (
            <div className="mb-8 p-6 rounded-3xl bg-blue-600/10 border border-blue-500/20 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative group">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                <MapPin className="w-32 h-32 text-blue-500" />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-blue-400" />
                  <span className="text-xs font-bold uppercase tracking-widest text-blue-400">Localized Feed</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-display font-bold">Porn in {location}</h2>
                <p className="text-muted-foreground mt-2 max-w-lg">We've customized your feed with content popular in your region. Enjoy premium entertainment from around the globe.</p>
              </div>
              <Button 
                onClick={() => {
                  setQuery(`${location} porn`);
                  setPage(1);
                }}
                className="relative z-10 bg-blue-600 hover:bg-blue-700 rounded-full px-8 h-12 font-bold shadow-[0_0_20px_rgba(37,99,235,0.4)]"
              >
                Browse Regional
              </Button>
            </div>
          )}

          {/* Categories */}
          <div className="flex flex-wrap gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((cat) => (
              <Button
                key={cat.value}
                variant={query === cat.value ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setQuery(cat.value);
                  setSearchInput("");
                  setPage(1);
                }}
                className={`rounded-full whitespace-nowrap ${query === cat.value ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
              >
                {cat.label}
              </Button>
            ))}
          </div>

          {/* TeamSkeet Sub-categories */}
          {query.toLowerCase().includes("teamskeet") && (
            <div className="flex flex-wrap gap-2 mb-8 animate-in fade-in slide-in-from-top-2 duration-500">
              <div className="w-full text-xs font-bold text-blue-500/60 uppercase tracking-widest mb-1 ml-1">TeamSkeet Network Shows</div>
              {teamSkeetShows.map((show) => (
                <Button
                  key={show.value}
                  variant={query === show.value ? "default" : "outline"}
                  size="xs"
                  onClick={() => {
                    setQuery(show.value);
                    setPage(1);
                  }}
                  className={`rounded-xl text-[10px] h-8 ${query === show.value ? 'bg-blue-600/20 text-blue-400 border-blue-500/50 hover:bg-blue-600/30' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}
                >
                  {show.label}
                </Button>
              ))}
            </div>
          )}

          {/* Asian Genres Sub-categories */}
          <div className="flex flex-wrap gap-2 mb-8 animate-in fade-in slide-in-from-top-2 duration-500">
            <div className="w-full text-xs font-bold text-white/30 uppercase tracking-widest mb-1 ml-1">Explore Asian Categories</div>
            {asianGenres.map((genre) => (
              <Button
                key={genre.value}
                variant={query === genre.value ? "default" : "outline"}
                size="xs"
                onClick={() => {
                  setQuery(genre.value);
                  setPage(1);
                }}
                className={`rounded-xl text-[10px] h-8 ${query === genre.value ? 'bg-white text-black' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}
              >
                {genre.label}
              </Button>
            ))}
          </div>

          {/* Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="flex flex-col gap-3">
                  <div className="aspect-video rounded-xl shimmer bg-white/5" />
                  <div className="h-4 w-3/4 bg-white/5 rounded shimmer" />
                  <div className="h-3 w-1/2 bg-white/5 rounded shimmer" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/10">
              <h2 className="text-xl font-medium text-red-400">Connection Error</h2>
              <p className="text-muted-foreground mt-2 max-w-md mx-auto">We couldn't connect to the content provider. This might be due to regional restrictions or a temporary outage.</p>
              <Button onClick={() => window.location.reload()} className="mt-6 bg-blue-600 hover:bg-blue-700 rounded-full px-8">
                Try Reconnecting
              </Button>
            </div>
          ) : videos.length === 0 ? (
            <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/10">
              <h2 className="text-xl font-medium">No results found</h2>
              <p className="text-muted-foreground mt-2">Try searching for something else or browse categories.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {videos.map((video) => (
                  <div key={video.id} className={isBlurred ? "blur-xl hover:blur-none transition-all duration-500" : ""}>
                    <AdultCard video={video} />
                  </div>
                ))}
              </div>

              {/* Pagination */}
              <div className="flex justify-center items-center gap-6 mt-12">
                <Button
                  variant="outline"
                  disabled={page === 1}
                  onClick={() => {
                    setPage(p => p - 1);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="rounded-full px-6"
                >
                  Previous
                </Button>
                <span className="text-muted-foreground text-sm font-bold bg-white/5 px-4 py-2 rounded-full border border-white/10">
                  PAGE {page}
                </span>
                <Button
                  variant="outline"
                  onClick={() => {
                    setPage(p => p + 1);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="rounded-full px-6"
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

export default Adult;
