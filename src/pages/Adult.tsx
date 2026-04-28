import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import AdultCard from "@/components/AdultCard";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { searchVideos } from "@/lib/hub";
import { Search, Flame, Eye, EyeOff, LayoutGrid, X, Star, ShieldAlert, Zap, Filter, Globe, History, Play, Trash2 } from "lucide-react";
import { getAdultHistory, clearAdultHistory, AdultHistoryItem } from "@/lib/adult-history";

import { useAuth } from "@/context/AuthContext";
import { getUserLocation } from "@/lib/tmdb";
import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

const Adult = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState("all");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const resultsRef = useRef<HTMLDivElement>(null);

  const scrollToResults = () => {
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
  };
  const [isBlurred, setIsBlurred] = useState(true);
  const [privateMode, setPrivateMode] = useState(() => localStorage.getItem("adult_private_mode") === "true");
  const [showGenreHub, setShowGenreHub] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(() => !localStorage.getItem("adult_onboarding_done"));
  const [preferredGenres, setPreferredGenres] = useState<string[]>(() => {
    const saved = localStorage.getItem("adult_preferred_genres");
    return saved ? JSON.parse(saved) : [];
  });
  const [source, setSource] = useState<"pornhub" | "redtube" | "eporner">("pornhub");
  const [adultHistory, setAdultHistory] = useState<AdultHistoryItem[]>([]);

  useEffect(() => {
    setAdultHistory(getAdultHistory());
  }, []);



  useEffect(() => {

    localStorage.setItem("adult_private_mode", privateMode.toString());
  }, [privateMode]);


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
    queryKey: ["adult-videos", source, query, page],
    queryFn: async () => {
      return searchVideos(query, page, source);
    },
  });


  const { data: regionalData } = useQuery({
    queryKey: ["regional-stars", location],
    queryFn: () => {
      const searchTerm = location.toLowerCase().includes("kerala") ? "Malayalam" : (location.split(',')[0] || "Indian");
      return searchVideos(`${searchTerm} pornstar`, 1);
    },
    enabled: !!location,
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
    scrollToResults();
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
    { label: "Malayalam", value: "malayalam" },
  ];

  const breastSizes = [
    { label: "Flat",        value: "flat chested",  icon: "(·)(·)",  accent: "text-sky-400    border-sky-500/30    hover:bg-sky-500/10" },
    { label: "Small",       value: "small tits",    icon: "(°)(°)",  accent: "text-blue-400   border-blue-500/30   hover:bg-blue-500/10" },
    { label: "Medium",      value: "medium tits",   icon: "(o)(o)",  accent: "text-green-400  border-green-500/30  hover:bg-green-500/10" },
    { label: "Big",         value: "big tits",      icon: "(O)(O)",  accent: "text-yellow-400 border-yellow-500/30 hover:bg-yellow-500/10" },
    { label: "Huge",        value: "huge tits",     icon: "(0)(0)",  accent: "text-orange-400 border-orange-500/30 hover:bg-orange-500/10" },
    { label: "Extra Huge",  value: "gigantic tits", icon: "(@)(@)",  accent: "text-red-400    border-red-500/30    hover:bg-red-500/10" },
    { label: "Natural",     value: "natural tits",  icon: "(u)(u)",  accent: "text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10" },
    { label: "Implants",    value: "fake tits",     icon: "(Q)(Q)",  accent: "text-purple-400 border-purple-500/30 hover:bg-purple-500/10" },
  ];


  const topActresses = [
    { name: "Mia Khalifa", id: "mia-khalifa" },
    { name: "Lana Rhoades", id: "lana-rhoades" },
    { name: "Abella Danger", id: "abella-danger" },
    { name: "Angela White", id: "angela-white" },
    { name: "Riley Reid", id: "riley-reid" },
    { name: "Eva Elfie", id: "eva-elfie" },
    { name: "Sweetie Fox", id: "sweetie-fox" },
    { name: "Dani Daniels", id: "dani-daniels" },
    { name: "Lena Paul", id: "lena-paul" },
    { name: "Adriana Chechik", id: "adriana-chechik" },
    { name: "Brandi Love", id: "brandi-love" },
    { name: "Madison Ivy", id: "madison-ivy" },
  ];

  const topStudios = [
    { name: "Brazzers", logo: "BZ" },
    { name: "TeamSkeet", logo: "TS" },
    { name: "Digital Playground", logo: "DP" },
    { name: "Reality Kings", logo: "RK" },
    { name: "Naughty America", logo: "NA" },
    { name: "BangBros", logo: "BB" },
    { name: "Vixen", logo: "VX" },
    { name: "Blacked", logo: "BL" },
    { name: "Tushy", logo: "TS" },
  ];

  const popularTags = [
    "Step Sister", "Public", "POV", "Creampie", "Threesome", "Deepthroat", "VR Porn", "Hentai", "Ebony", "Interracial"
  ];

  const onboardingGenres = [
    "Teen", "Milf", "Amateur", "Brazzers", "Japanese", "Indian", "Anal", "Blowjob", "Lesbian", "Threesome", "POV", "Ebony"
  ];

  const handleFinishOnboarding = () => {
    localStorage.setItem("adult_onboarding_done", "true");
    localStorage.setItem("adult_preferred_genres", JSON.stringify(preferredGenres));
    setShowOnboarding(false);
    if (preferredGenres.length > 0) {
      setQuery(preferredGenres[0]);
    }
  };

  const togglePreferredGenre = (genre: string) => {
    setPreferredGenres(prev => 
      prev.includes(genre) ? prev.filter(g => g !== genre) : [...prev, genre]
    );
  };



  const videos = data?.videos?.map((v: any) => ({
    id: v.video_id,
    title: v.title,
    url: v.url,
    thumbnail: v.default_thumb,
    duration: v.duration,
    views: typeof v.views === "number" ? v.views.toLocaleString() : (v.views || ""),
    rating: v.rating,
    added: v.publish_date,
    pornstars: v.pornstars || [],
    source,
  })) || [];

  // Extract unique pornstars from current page videos and find their representative thumb
  const uniqueNames = Array.from(new Set(videos.flatMap((v: any) => v.pornstars)));
  const usedThumbs = new Set<string>();
  
  const currentPagePornstars = uniqueNames.map(name => {
    // Try to find a unique video where the name is in the title (solo/featured)
    let representativeVideo = videos.find((v: any) => 
      v.pornstars.includes(name) && 
      v.title.toLowerCase().includes(name.toLowerCase()) && 
      !usedThumbs.has(v.thumbnail)
    );
    
    // Fallback 1: Any unique video thumbnail they appear in
    if (!representativeVideo) {
      representativeVideo = videos.find((v: any) => v.pornstars.includes(name) && !usedThumbs.has(v.thumbnail));
    }

    // Fallback 2: Just any video thumbnail they appear in (even if already used)
    if (!representativeVideo) {
      representativeVideo = videos.find((v: any) => v.pornstars.includes(name));
    }

    if (representativeVideo) {
      usedThumbs.add(representativeVideo.thumbnail);
      return {
        name,
        id: name.toLowerCase().replace(/\s+/g, '-'),
        thumb: representativeVideo.thumbnail
      };
    }
    return null;
  }).filter((star): star is any => star !== null).slice(0, 18);

  const regionalVideos = regionalData?.videos || [];
  const regionalUniqueNames = Array.from(new Set(regionalVideos.flatMap((v: any) => v.pornstars)));
  const regionalStars = regionalUniqueNames.map(name => {
    const v = regionalVideos.find((v: any) => v.pornstars.includes(name));
    return v ? { name, id: name.toLowerCase().replace(/\s+/g, '-'), thumb: v.default_thumb } : null;
  }).filter(s => s !== null).slice(0, 9);


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

            <div className="flex items-center gap-2">
              <div className="flex bg-white/5 p-1 rounded-full border border-white/10 mr-2">
                {[
                  { id: "pornhub", label: "PH", color: "bg-orange-500" },
                  { id: "redtube", label: "RT", color: "bg-red-600" },
                  { id: "eporner", label: "EP", color: "bg-blue-600" }
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSource(s.id as any)}
                    className={cn(
                      "px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all",
                      source === s.id ? `${s.color} text-white shadow-lg` : "text-white/40 hover:text-white/60"
                    )}
                  >
                    {s.label}
                  </button>
                ))}
              </div>

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

              <Button
                variant="outline"
                size="sm"
                onClick={() => setPrivateMode(!privateMode)}
                className={`rounded-full border-white/10 px-6 h-10 ${privateMode ? 'bg-purple-600/20 text-purple-400 border-purple-500/30' : 'bg-white/5 text-white/60'}`}
              >
                <ShieldAlert className={`w-4 h-4 mr-2 ${privateMode ? 'text-purple-400' : 'text-muted-foreground'}`} />
                {privateMode ? "Private: ON" : "Private: OFF"}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowGenreHub(true)}
                className="rounded-full border-white/10 px-6 h-10 bg-white/5 text-white/60 hover:bg-white/10"
              >
                <LayoutGrid className="w-4 h-4 mr-2" /> Genre Hub
              </Button>
            </div>



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
                  const searchTerm = location.toLowerCase().includes("kerala") ? "Malayalam" : location;
                  setQuery(`${searchTerm} porn`);
                  setPage(1);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="relative z-10 bg-blue-600 hover:bg-blue-700 rounded-full px-8 h-12 font-bold shadow-[0_0_20px_rgba(37,99,235,0.4)]"
              >
                See Kerala Porn Videos
              </Button>

            </div>
          )}

          {/* Preferred Genres Hub (if selected) */}
          {preferredGenres.length > 0 && !showOnboarding && (
            <div className="mb-8 p-4 rounded-2xl bg-white/5 border border-white/10">
              <div className="flex items-center justify-between mb-4 px-2">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-blue-400">Personalized Protocols</h3>
                <Button variant="ghost" size="xs" onClick={() => setShowOnboarding(true)} className="text-[10px] text-white/40">Adjust Interests</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {preferredGenres.map(genre => (
                  <Button 
                    key={genre} 
                    variant={query === genre ? "default" : "outline"}
                    size="sm"
                    onClick={() => { setQuery(genre); setPage(1); }}
                    className="rounded-full h-8 text-xs bg-blue-500/10 border-blue-500/20 hover:bg-blue-500/20"
                  >
                    {genre}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Recently Watched Row — always visible */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6 px-1">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/20 rounded-xl shadow-[0_0_15px_rgba(168,85,247,0.2)]">
                  <History className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <h3 className="text-xl font-display font-bold text-white uppercase italic tracking-tighter">Recently Viewed</h3>
                  <p className="text-[10px] font-bold text-purple-500/60 uppercase tracking-widest mt-0.5">
                    {privateMode ? "Incognito Mode ON — Not Tracking" : `${adultHistory.length} video${adultHistory.length !== 1 ? "s" : ""} in your archive`}
                  </p>
                </div>
              </div>
              {adultHistory.length > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => {
                    if (confirm("Purge incognito history?")) {
                      clearAdultHistory();
                      setAdultHistory([]);
                    }
                  }}
                  className="text-[10px] font-bold text-white/20 hover:text-red-400 transition-colors uppercase tracking-widest"
                >
                  <Trash2 className="w-3 h-3 mr-2" />
                  Clear Archive
                </Button>
              )}
            </div>

            {adultHistory.length === 0 ? (
              <div className="flex items-center gap-6 p-6 rounded-2xl border border-dashed border-white/10 bg-white/[0.02]">
                <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
                  <History className="w-7 h-7 text-purple-500/40" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white/30 uppercase tracking-widest">No videos watched yet</p>
                  <p className="text-xs text-white/20 mt-1">
                    {privateMode 
                      ? "Turn off Incognito Mode to start tracking your history." 
                      : "Videos you watch will appear here automatically."}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                {adultHistory.map((item) => (
                  <div key={item.id} className="flex-shrink-0 w-64 group relative">
                    <div className={cn(
                      "relative aspect-video rounded-2xl overflow-hidden border border-white/5 transition-all duration-300 group-hover:border-purple-500/30",
                      isBlurred ? "blur-md hover:blur-none" : ""
                    )}>
                      <img 
                        src={`/api/image?url=${encodeURIComponent(item.thumbnail)}`} 
                        alt={item.title} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
                      <button 
                        onClick={() => navigate(`/hub/watch/${item.id}`)}
                        className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-[2px]"
                      >
                        <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center shadow-lg shadow-purple-900/40">
                          <Play className="w-5 h-5 text-white fill-current ml-1" />
                        </div>
                      </button>
                      {item.duration && (
                        <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/60 text-[10px] font-bold text-white backdrop-blur-md border border-white/10">
                          {item.duration}
                        </div>
                      )}
                    </div>
                    <h4 className="mt-3 text-[11px] font-bold text-white/60 line-clamp-1 group-hover:text-purple-400 transition-colors uppercase tracking-wide">{item.title}</h4>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Regional Actresses Section */}
          {location && (
            <div className="mb-12">
              <div className="flex items-center justify-between mb-6 px-1">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-500/20 rounded-xl">
                    <Star className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <h3 className="text-xl font-display font-bold text-white">Actresses near {location.split(',')[0]}</h3>
                    <p className="text-[10px] font-bold text-green-500/60 uppercase tracking-widest mt-0.5">Regional Performer Protocol</p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setQuery(`${location.split(',')[0]} pornstar`)}
                  className="text-xs font-bold text-white/40 hover:text-white"
                >
                  View All
                </Button>
              </div>
              
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-9 gap-4 md:gap-6">
                {regionalStars.length > 0 ? (
                  regionalStars.map((star) => (
                    <button
                      key={`reg-${star.id}`}
                      onClick={() => {
                        setQuery(star.name);
                        setPage(1);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="group flex flex-col items-center gap-3 transition-all duration-300 hover:-translate-y-1"
                    >
                      <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden border-2 border-green-500/20 group-hover:border-green-500/50 transition-all duration-300">
                        <img src={star.thumb} alt={star.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-green-500/10 group-hover:bg-transparent transition-colors" />
                      </div>
                      <span className="text-[10px] font-bold text-white/60 group-hover:text-green-400 transition-colors text-center line-clamp-1">{star.name}</span>
                    </button>
                  ))
                ) : (
                  [...Array(9)].map((_, i) => (
                    <div key={i} className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 md:w-20 md:h-20 rounded-full shimmer bg-white/5" />
                      <div className="h-3 w-12 bg-white/5 rounded shimmer" />
                    </div>
                  ))
                )}
              </div>

            </div>
          )}


          {/* Top Studios Row */}
          <div className="mb-12 overflow-hidden">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/30 mb-6 ml-1">Featured Networks</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-4">
              {topStudios.map((studio) => (
                <button
                  key={studio.name}
                  onClick={() => {
                    setQuery(studio.name);
                    setPage(1);
                  }}
                  className="relative h-20 rounded-2xl bg-[#0a0a0a] border border-white/5 hover:border-blue-500/30 transition-all duration-500 group overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className="text-2xl font-black text-white/5 group-hover:text-blue-500/20 transition-all duration-700 uppercase italic scale-150">{studio.logo}</span>
                  <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-white/40 group-hover:text-white transition-colors uppercase tracking-widest z-10">{studio.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* ═══════════════════════════════════════
               UNIFIED DISCOVERY & FILTER PANEL
          ═══════════════════════════════════════ */}
          <div className="mb-12 rounded-3xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">

            {/* ── Row 1: Category Pills ── */}
            <div className="px-6 pt-6 pb-5 border-b border-white/5">
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/25 mb-3">Categories</p>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => { setQuery(cat.value); setSearchInput(""); setPage(1); scrollToResults(); }}
                    className={cn(
                      "px-4 h-9 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all duration-200",
                      query === cat.value
                        ? "bg-blue-600 border-transparent text-white shadow-[0_0_16px_rgba(37,99,235,0.45)]"
                        : "bg-transparent border-white/8 text-white/40 hover:bg-white/8 hover:text-white/80"
                    )}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* ── Row 2: Trending Tags ── */}
            <div className="px-6 py-5 border-b border-white/5">
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/25 mb-3">Trending Tags</p>
              <div className="flex flex-wrap gap-2">
                {popularTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => { setQuery(tag); setPage(1); scrollToResults(); }}
                    className={cn(
                      "px-3 h-7 rounded-lg text-[11px] font-medium border transition-all",
                      query === tag
                        ? "bg-pink-600/20 border-pink-500/50 text-pink-400"
                        : "bg-transparent border-white/8 text-white/35 hover:border-pink-500/40 hover:bg-pink-500/8 hover:text-pink-300"
                    )}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>

            {/* ── Row 3: Asian + TeamSkeet side by side ── */}
            <div className="px-6 py-5 border-b border-white/5 flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/25 mb-3">Asian</p>
                <div className="flex flex-wrap gap-2">
                  {asianGenres.map((genre) => (
                    <button
                      key={genre.value}
                      onClick={() => { setQuery(genre.value); setPage(1); scrollToResults(); }}
                      className={cn(
                        "px-3 h-7 rounded-lg text-[11px] font-bold border transition-all",
                        query === genre.value
                          ? "bg-white text-black border-transparent"
                          : "bg-transparent border-white/8 text-white/40 hover:bg-white/8 hover:text-white"
                      )}
                    >
                      {genre.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/25 mb-3">TeamSkeet Series</p>
                <div className="flex flex-wrap gap-2">
                  {teamSkeetShows.map((show) => (
                    <button
                      key={show.value}
                      onClick={() => { setQuery(show.value); setPage(1); scrollToResults(); }}
                      className={cn(
                        "px-3 h-7 rounded-lg text-[11px] font-bold border transition-all",
                        query === show.value
                          ? "bg-blue-600/30 border-blue-500/50 text-blue-300"
                          : "bg-transparent border-white/8 text-white/40 hover:bg-blue-500/8 hover:text-blue-300"
                      )}
                    >
                      {show.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Row 4: Breast Size Filter ── */}
            <div className="px-6 py-5">
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/25 mb-3">Body Type — Breast Size</p>
              <div className="flex flex-wrap gap-2">
                {breastSizes.map((bs) => {
                  const isActive = query === bs.value;
                  return (
                    <button
                      key={bs.value}
                      onClick={() => { setQuery(bs.value); setSearchInput(bs.label); setPage(1); scrollToResults(); }}
                      className={cn(
                        "flex items-center gap-2 pl-2 pr-4 h-9 rounded-xl border text-xs font-bold transition-all duration-200",
                        isActive
                          ? "bg-white/12 border-white/25 text-white"
                          : `bg-transparent border-white/8 text-white/45 ${bs.accent}`
                      )}
                    >
                      {/* ASCII breast icon in mono font */}
                      <span
                        className={cn(
                          "font-mono text-[11px] tracking-tighter leading-none px-1.5 py-0.5 rounded-md",
                          isActive ? "bg-white/10 text-white" : "bg-white/5 text-white/30"
                        )}
                      >
                        {bs.icon}
                      </span>
                      {bs.label}
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Grid Header */}
          <div ref={resultsRef} className="flex items-center justify-between mb-8 scroll-mt-28">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500/20 rounded-xl">
                <Zap className="w-5 h-5 text-orange-500" />
              </div>
              <h2 className="text-2xl font-display font-bold">
                {query === "all" ? "Trending Right Now" : `Results for "${query}"`}
              </h2>
            </div>
            <div className="flex items-center gap-2 text-xs font-medium text-white/40">
              <Filter className="w-4 h-4" />
              <span>Sorted by Popularity</span>
            </div>
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

          {/* Dynamic Page Actresses */}
          {currentPagePornstars.length > 0 && (
            <div className="mt-20">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-pink-500/20 rounded-xl">
                  <Flame className="w-6 h-6 text-pink-500" />
                </div>
                <h2 className="text-2xl md:text-3xl font-display font-bold">Actresses on this Page</h2>
              </div>
              
              {isLoading ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-9 gap-4 md:gap-6">
                  {[...Array(9)].map((_, i) => (
                    <div key={i} className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 md:w-24 md:h-24 rounded-full shimmer bg-white/5" />
                      <div className="h-3 w-12 bg-white/5 rounded shimmer" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-9 gap-4 md:gap-6">
                  {currentPagePornstars.map((star) => (

                  <button
                    key={star.id}
                    onClick={() => {
                      setQuery(star.name);
                      setSearchInput(star.name);
                      setPage(1);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="group flex flex-col items-center gap-3 transition-all duration-300 hover:-translate-y-1"
                  >
                    <div className="relative w-16 h-16 md:w-24 md:h-24 rounded-full overflow-hidden border-2 border-white/5 group-hover:border-pink-500/50 transition-all duration-300 shadow-xl shadow-black/40">
                      <img
                        src={star.thumb}
                        alt={star.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <span className="text-[10px] md:text-xs font-bold text-white/80 group-hover:text-pink-400 transition-colors text-center line-clamp-1">
                      {star.name}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        </div>
      </main>

      {/* Genre Hub Modal */}
      {showGenreHub && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in p-4">
          <div className="max-w-4xl w-full bg-card/95 border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-xl">
                  <LayoutGrid className="w-5 h-5 text-blue-500" />
                </div>
                <h2 className="text-xl font-display font-bold">Genre Discovery Hub</h2>
              </div>
              <button 
                onClick={() => setShowGenreHub(false)}
                className="p-2 rounded-full hover:bg-white/5 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-8 overflow-y-auto custom-scrollbar space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Popular Categories */}
                <div>
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-blue-400 mb-4">Core Categories</h3>
                  <div className="flex flex-col gap-1">
                    {categories.slice(0, 10).map(cat => (
                      <button 
                        key={cat.value} 
                        onClick={() => { setQuery(cat.value); setShowGenreHub(false); setPage(1); }}
                        className="text-left py-2 px-3 rounded-lg hover:bg-white/5 transition-colors text-sm font-medium"
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Studios & Networks */}
                <div>
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-purple-400 mb-4">Studios & Networks</h3>
                  <div className="flex flex-col gap-1">
                    {topStudios.map(studio => (
                      <button 
                        key={studio.name} 
                        onClick={() => { setQuery(studio.name); setShowGenreHub(false); setPage(1); }}
                        className="text-left py-2 px-3 rounded-lg hover:bg-white/5 transition-colors text-sm font-medium"
                      >
                        {studio.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Global & Ethnic */}
                <div>
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-pink-400 mb-4">Global Content</h3>
                  <div className="flex flex-col gap-1">
                    {asianGenres.map(genre => (
                      <button 
                        key={genre.value} 
                        onClick={() => { setQuery(genre.value); setShowGenreHub(false); setPage(1); }}
                        className="text-left py-2 px-3 rounded-lg hover:bg-white/5 transition-colors text-sm font-medium"
                      >
                        {genre.label}
                      </button>
                    ))}
                    <div className="h-px bg-white/5 my-2" />
                    {["European", "Russian", "Latina", "French", "British", "Czech"].map(g => (
                      <button 
                        key={g} 
                        onClick={() => { setQuery(g); setShowGenreHub(false); setPage(1); }}
                        className="text-left py-2 px-3 rounded-lg hover:bg-white/5 transition-colors text-sm font-medium"
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Trending Tags Grid */}
              <div className="pt-4">
                 <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/40 mb-4">Trending Discoveries</h3>
                 <div className="flex flex-wrap gap-2">
                    {popularTags.concat(["Reality", "Virtual Reality", "Parody", "Cartoon", "Cosplay"]).map(tag => (
                      <button 
                        key={tag} 
                        onClick={() => { setQuery(tag); setShowGenreHub(false); setPage(1); }}
                        className="px-3 py-1.5 rounded-full bg-white/5 border border-white/5 hover:border-white/20 text-xs transition-all"
                      >
                        #{tag}
                      </button>
                    ))}
                 </div>
              </div>
            </div>
            
            <div className="p-6 bg-white/[0.02] border-t border-white/5 flex justify-center">
               <p className="text-[10px] text-muted-foreground italic">Use the search bar for specific performers or titles</p>
            </div>
          </div>
        </div>
      )}

      {/* Onboarding Modal */}
      {showOnboarding && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 backdrop-blur-md animate-fade-in p-4">

          <div className="max-w-xl w-full bg-card border border-white/10 rounded-[2.5rem] p-10 shadow-3xl text-center space-y-8">
            <div className="space-y-3">
              <div className="mx-auto w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center mb-6">
                <Flame className="w-8 h-8 text-blue-500" />
              </div>
              <h2 className="text-3xl font-display font-bold text-white">Initialize Your Feed</h2>
              <p className="text-muted-foreground text-sm max-w-sm mx-auto">Select your preferred genres to customize your premium JARVIS HUB experience.</p>
            </div>

            <div className="flex flex-wrap justify-center gap-3">
              {onboardingGenres.map(genre => (
                <button
                  key={genre}
                  onClick={() => togglePreferredGenre(genre)}
                  className={cn(
                    "px-5 py-2.5 rounded-full text-xs font-bold transition-all border",
                    preferredGenres.includes(genre)
                      ? "bg-blue-600 border-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]"
                      : "bg-white/5 border-white/10 text-white/40 hover:bg-white/10 hover:border-white/20"
                  )}
                >
                  {genre}
                </button>
              ))}
            </div>

            <div className="pt-4">
              <Button 
                onClick={handleFinishOnboarding}
                disabled={preferredGenres.length === 0}
                className="w-full bg-blue-600 hover:bg-blue-700 h-14 rounded-2xl font-bold text-lg shadow-[0_0_30px_rgba(37,99,235,0.3)] disabled:opacity-50"
              >
                Initialize Experience
              </Button>
              <p className="text-[10px] text-white/20 mt-4 uppercase tracking-[0.2em] font-black">Secure • Private • Encrypted</p>
            </div>
          </div>
        </div>
      )}

      <Footer />


    </div>
  );
};

export default Adult;
