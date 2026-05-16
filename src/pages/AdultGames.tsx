import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Gamepad2, Play, ChevronLeft, ExternalLink, Zap, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

const ADULT_GAMES = [
  {
    id: "harem-hotel",
    title: "Harem Hotel",
    thumb: "https://img.itch.zone/aW1nLzQ4MjIzNzkucG5n/315x250%23c/4%2BJ2fM.png",
    description: "Manage your own hotel and interact with beautiful staff members.",
    tags: ["Management", "3D", "Dating Sim"],
    url: "/play/harem-hotel", // GameEngine
    views: "2.4M",
    rating: "98%"
  },
  {
    id: "summertime-saga",
    title: "Summertime Saga",
    thumb: "https://img.itch.zone/aW1nLzg3MTgwNTguanBn/315x250%23c/8s3bZl.jpg",
    description: "A high-quality visual novel dating sim with an expansive story.",
    tags: ["Visual Novel", "2D", "Story"],
    url: "/play/summertime-saga",
    views: "8.1M",
    rating: "99%"
  },
  {
    id: "waifu-hub",
    title: "Waifu Hub",
    thumb: "https://img.itch.zone/aW1nLzIyMDgxNTguanBn/315x250%23c/hY6O1g.jpg",
    description: "Interview girls for your agency in this fun, interactive experience.",
    tags: ["Anime", "Simulation"],
    url: "/play/waifu-hub",
    views: "1.2M",
    rating: "92%"
  },
  {
    id: "breeding-season",
    title: "Breeding Season",
    thumb: "https://img.itch.zone/aW1nLzEzNTk0MDIucG5n/315x250%23c/7xJg9K.png",
    description: "Farm management and breeding simulator.",
    tags: ["Management", "Farming"],
    url: "/play/breeding-season",
    views: "3.5M",
    rating: "95%"
  },
  {
    id: "camp-pinewood",
    title: "Camp Pinewood",
    thumb: "https://images.unsplash.com/photo-1533630654593-b222d5d44449?w=800&auto=format&fit=crop",
    description: "Welcome to summer camp! Meet the counselors and campers.",
    tags: ["Visual Novel", "Comedy"],
    url: "/play/camp-pinewood",
    views: "5.2M",
    rating: "96%"
  },
  {
    id: "milfy-city",
    title: "Milfy City",
    thumb: "https://images.unsplash.com/photo-1449844908441-8829872d2607?w=800&auto=format&fit=crop",
    description: "Navigate city life and meet interesting local women.",
    tags: ["3D", "Sandbox"],
    url: "/play/milfy-city",
    views: "4.8M",
    rating: "94%"
  },
  {
    id: "eternum",
    title: "Eternum",
    thumb: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&auto=format&fit=crop",
    description: "Dive into a groundbreaking virtual reality server.",
    tags: ["Sci-Fi", "Mystery"],
    url: "/play/eternum",
    views: "6.1M",
    rating: "99%"
  },
  {
    id: "treasure-of-nadia",
    title: "Treasure of Nadia",
    thumb: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop",
    description: "Follow your father's footsteps in the treasure hunting business.",
    tags: ["Adventure", "Puzzle"],
    url: "/play/treasure-of-nadia",
    views: "7.3M",
    rating: "97%"
  },
  {
    id: "being-a-dik",
    title: "Being a DIK",
    thumb: "https://images.unsplash.com/photo-1541535881962-3bb380b08458?w=800&auto=format&fit=crop",
    description: "Navigate college life, fraternities, and relationships.",
    tags: ["College", "Drama"],
    url: "/play/being-a-dik",
    views: "9.2M",
    rating: "98%"
  },
  {
    id: "my-cute-roommate",
    title: "My Cute Roommate",
    thumb: "https://images.unsplash.com/photo-1518779578993-ec3579fee39f?w=800&auto=format&fit=crop",
    description: "Move in with your high school friend in the city.",
    tags: ["Comedy", "Romance"],
    url: "/play/my-cute-roommate",
    views: "3.9M",
    rating: "91%"
  }
];

const AdultGames = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  useEffect(() => {
    // Prevent direct access
    if (!(window as any).__jarvis_internal) {
      navigate("/", { replace: true });
      return;
    }

    const isOwner = user?.email?.toLowerCase() === "admin@gmail.com" || user?.email?.toLowerCase() === "superadmin@gmail.com";
    if (!user || (!user.hasAdultAccess && !user.isAdmin && !isOwner)) {
      navigate("/");
    }
  }, [user, navigate]);

  const activeGame = ADULT_GAMES.find(g => g.id === id);

  if (id && !activeGame) {
    return (
      <div className="min-h-screen bg-[#020202] text-white flex items-center justify-center">
        <h1 className="text-2xl font-bold">Game Not Found</h1>
        <Button onClick={() => navigate("/adult/games")} className="ml-4">Go Back</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020202] text-white font-sans selection:bg-blue-500/30">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_-20%,rgba(59,130,246,0.1),transparent_70%)]" />
      </div>

      <Navbar />

      <main className="container max-w-7xl mx-auto pt-32 pb-20 px-6 relative z-10">
        
        {/* Render Player if a game is selected */}
        {activeGame ? (
          <div className="animate-in fade-in zoom-in-95 duration-500">
            <div className="flex items-center justify-between mb-8">
              <Button
                variant="ghost"
                className="hover:bg-white/5 -ml-4 rounded-xl px-4 h-11 text-white/50 hover:text-white transition-all"
                onClick={() => navigate("/adult/games")}
              >
                <ChevronLeft className="w-5 h-5 mr-2" />
                Return to Game Hub
              </Button>
              
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20">
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">Engine Active</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-8">
              {/* Cinematic Player Container */}
              <div className="relative group/player max-w-5xl mx-auto w-full">
                <div className="absolute inset-0 bg-blue-600/20 blur-[100px] rounded-full opacity-50 group-hover/player:opacity-70 transition-opacity duration-1000" />
                <div className="relative aspect-[16/10] bg-black rounded-[2.5rem] overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.8)] border border-white/10 group-hover/player:border-blue-500/30 transition-all duration-700">
                  <iframe
                    src={activeGame.url}
                    className="absolute inset-0 w-full h-full border-0"
                    allowFullScreen
                    scrolling="no"
                    sandbox="allow-forms allow-scripts allow-pointer-lock allow-same-origin"
                  />
                </div>
              </div>

              {/* Game Info Card */}
              <div className="bg-card p-8 rounded-3xl border border-white/10 shadow-xl max-w-5xl mx-auto w-full">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-blue-500/20 rounded-lg">
                      <Gamepad2 className="w-4 h-4 text-blue-500" />
                    </div>
                    <span className="text-xs font-bold text-blue-500 uppercase tracking-widest">
                      Interactive Simulation
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20">
                      <Star className="w-4 h-4 text-blue-400" />
                      <span className="text-sm font-bold text-blue-400">
                        {activeGame.rating}
                      </span>
                    </div>
                  </div>
                </div>

                <h1 className="text-2xl md:text-3xl font-display font-bold text-white mb-2">
                  {activeGame.title}
                </h1>
                <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                  {activeGame.description}
                </p>

                <div className="flex flex-wrap gap-2 pt-6 border-t border-white/5">
                  {activeGame.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-white/5 text-white/40 text-[10px] font-bold uppercase tracking-wider h-7 px-3 flex items-center"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Render Catalog */
          <div className="animate-in fade-in duration-700">
            <div className="flex flex-col items-center text-center mb-16">
              <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 mb-6">
                <Gamepad2 className="w-4 h-4 text-blue-400" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400">Interactive Portal</span>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-display font-black tracking-tighter italic mb-4">
                ADULT <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">GAMES</span>
              </h1>
              <p className="max-w-xl text-white/40 text-sm md:text-base font-medium">
                Play premium HTML5 adult games directly in your browser. No downloads required.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {ADULT_GAMES.map(game => (
                <div key={game.id} className="group relative rounded-[2rem] bg-white/5 border border-white/10 overflow-hidden hover:border-blue-500/50 transition-all duration-500 hover:-translate-y-2">
                  <div className="aspect-[4/3] relative overflow-hidden">
                    <img 
                      src={game.thumb} 
                      alt={game.title} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent opacity-80" />
                    
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/40 backdrop-blur-sm">
                      <button 
                        onClick={() => navigate(`/adult/games/${game.id}`)}
                        className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center shadow-[0_0_40px_rgba(37,99,235,0.8)] hover:scale-110 active:scale-95 transition-all"
                      >
                        <Play className="w-8 h-8 text-white fill-current ml-1" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-6 relative">
                    <h4 className="text-xl font-bold text-white mb-2">{game.title}</h4>
                    <p className="text-xs text-white/50 line-clamp-2 mb-4">{game.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {game.tags.map(tag => (
                        <span key={tag} className="px-2 py-1 rounded-md bg-white/5 text-[9px] font-bold uppercase tracking-widest text-white/40">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default AdultGames;
