import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Gamepad2, Play, ChevronLeft, ExternalLink, Zap, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

const ADULT_GAMES = [
  // ── Top Tier ────────────────────────────────
  {
    id: "being-a-dik",
    title: "Being a DIK",
    thumb: "https://images.unsplash.com/photo-1541535881962-3bb380b08458?w=800&auto=format&fit=crop",
    description: "Navigate college life, fraternities, and relationships in this award-winning 3D visual novel.",
    tags: ["College", "Drama", "3D"],
    url: "/play/being-a-dik",
    views: "9.2M",
    rating: "98%"
  },
  {
    id: "summertime-saga",
    title: "Summertime Saga",
    thumb: "https://img.itch.zone/aW1nLzg3MTgwNTguanBn/315x250%23c/8s3bZl.jpg",
    description: "A high-quality visual novel dating sim with an expansive open-world story.",
    tags: ["Visual Novel", "2D", "Story"],
    url: "/play/summertime-saga",
    views: "8.1M",
    rating: "99%"
  },
  {
    id: "eternum",
    title: "Eternum",
    thumb: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&auto=format&fit=crop",
    description: "Dive into a groundbreaking sci-fi virtual reality server with stunning visuals.",
    tags: ["Sci-Fi", "Mystery", "3D"],
    url: "/play/eternum",
    views: "6.1M",
    rating: "99%"
  },
  {
    id: "treasure-of-nadia",
    title: "Treasure of Nadia",
    thumb: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop",
    description: "Follow your father's footsteps in a thrilling treasure hunting adventure.",
    tags: ["Adventure", "Puzzle", "3D"],
    url: "/play/treasure-of-nadia",
    views: "7.3M",
    rating: "97%"
  },
  // ── Newly Added ─────────────────────────────
  {
    id: "confined-with-goddesses",
    title: "Confined With Goddesses",
    thumb: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=800&auto=format&fit=crop",
    description: "Trapped in a fantasy realm with divine beings — build bonds and unlock their secrets.",
    tags: ["Fantasy", "Harem", "Visual Novel"],
    url: "/play/confined-with-goddesses",
    views: "4.7M",
    rating: "96%"
  },
  {
    id: "horny-tycoon",
    title: "Horny Tycoon",
    thumb: "https://images.unsplash.com/photo-1549637642-7dbb35deef81?w=800&auto=format&fit=crop",
    description: "Build your entertainment empire from the ground up. Hire, manage, and expand your business.",
    tags: ["Tycoon", "Management", "Simulation"],
    url: "/play/horny-tycoon",
    views: "3.8M",
    rating: "93%"
  },
  {
    id: "lewd-island",
    title: "Lewd Island",
    thumb: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&auto=format&fit=crop",
    description: "Stranded on a tropical island with survivors — build your colony and relationships.",
    tags: ["Survival", "Sandbox", "3D"],
    url: "/play/lewd-island",
    views: "2.9M",
    rating: "91%"
  },
  {
    id: "acting-lessons",
    title: "Acting Lessons",
    thumb: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=800&auto=format&fit=crop",
    description: "A heartfelt story about a film student and the actress that changes his life forever.",
    tags: ["Drama", "Romance", "Story"],
    url: "/play/acting-lessons",
    views: "5.1M",
    rating: "97%"
  },
  {
    id: "milf-next-door",
    title: "MILF Next Door",
    thumb: "https://images.unsplash.com/photo-1449844908441-8829872d2607?w=800&auto=format&fit=crop",
    description: "Your new neighbor is more interesting than expected. A slow-burn suburban story.",
    tags: ["Romance", "3D", "Comedy"],
    url: "/play/milf-next-door",
    views: "4.4M",
    rating: "94%"
  },
  {
    id: "girls-hostel",
    title: "Girls Hostel",
    thumb: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&auto=format&fit=crop",
    description: "You've accidentally been placed in the wrong hostel. What could go wrong?",
    tags: ["Comedy", "Slice of Life", "Anime"],
    url: "/play/girls-hostel",
    views: "3.2M",
    rating: "89%"
  },
  {
    id: "sisterly-lust",
    title: "Sisterly Lust",
    thumb: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&auto=format&fit=crop",
    description: "Reconnect with family you barely know in this taboo romance visual novel.",
    tags: ["Visual Novel", "Family Drama"],
    url: "/play/sisterly-lust",
    views: "5.8M",
    rating: "95%"
  },
  {
    id: "city-of-broken-dreamers",
    title: "City of Broken Dreamers",
    thumb: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800&auto=format&fit=crop",
    description: "A cyberpunk noir thriller with deep choices, factions, and stunning 3D renders.",
    tags: ["Cyberpunk", "Thriller", "3D"],
    url: "/play/city-of-broken-dreamers",
    views: "4.0M",
    rating: "96%"
  },
  {
    id: "harem-hotel",
    title: "Harem Hotel",
    thumb: "https://img.itch.zone/aW1nLzQ4MjIzNzkucG5n/315x250%23c/4%2BJ2fM.png",
    description: "Manage your own hotel and build relationships with its beautiful staff members.",
    tags: ["Management", "3D", "Dating Sim"],
    url: "/play/harem-hotel",
    views: "2.4M",
    rating: "98%"
  },
  {
    id: "milfy-city",
    title: "Milfy City",
    thumb: "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&auto=format&fit=crop",
    description: "Navigate city life and meet interesting local women in this open-world sim.",
    tags: ["3D", "Sandbox", "Open World"],
    url: "/play/milfy-city",
    views: "4.8M",
    rating: "94%"
  },
  {
    id: "waifu-hub",
    title: "Waifu Hub",
    thumb: "https://img.itch.zone/aW1nLzIyMDgxNTguanBn/315x250%23c/hY6O1g.jpg",
    description: "Interview anime girls for your agency in this fun, interactive simulation.",
    tags: ["Anime", "Simulation"],
    url: "/play/waifu-hub",
    views: "1.2M",
    rating: "92%"
  },
  {
    id: "camp-pinewood",
    title: "Camp Pinewood",
    thumb: "https://images.unsplash.com/photo-1533630654593-b222d5d44449?w=800&auto=format&fit=crop",
    description: "Welcome to summer camp! Meet the counselors and campers in this comedy adventure.",
    tags: ["Visual Novel", "Comedy"],
    url: "/play/camp-pinewood",
    views: "5.2M",
    rating: "96%"
  },
  {
    id: "my-cute-roommate",
    title: "My Cute Roommate",
    thumb: "https://images.unsplash.com/photo-1518779578993-ec3579fee39f?w=800&auto=format&fit=crop",
    description: "Move in with your high school friend in a big city and navigate new relationships.",
    tags: ["Comedy", "Romance", "Slice of Life"],
    url: "/play/my-cute-roommate",
    views: "3.9M",
    rating: "91%"
  },
  // ── More Top Games ───────────────────────────
  {
    id: "wild-life",
    title: "Wild Life",
    thumb: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&auto=format&fit=crop",
    description: "An open-world RPG set on an alien planet with stunning graphics and full freedom of exploration.",
    tags: ["RPG", "Open World", "3D"],
    url: "/play/wild-life",
    views: "6.4M",
    rating: "97%"
  },
  {
    id: "man-of-the-house",
    title: "Man of the House",
    thumb: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&auto=format&fit=crop",
    description: "Take charge of your household and build relationships with the women in your life.",
    tags: ["Simulation", "3D", "Romance"],
    url: "/play/man-of-the-house",
    views: "5.5M",
    rating: "95%"
  },
  {
    id: "halfway-house",
    title: "Halfway House",
    thumb: "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&auto=format&fit=crop",
    description: "You run a halfway house. Your tenants have stories — and secrets. A dark, emotional drama.",
    tags: ["Drama", "Mystery", "Visual Novel"],
    url: "/play/halfway-house",
    views: "3.1M",
    rating: "93%"
  },
  {
    id: "university-of-problems",
    title: "University of Problems",
    thumb: "https://images.unsplash.com/photo-1562774053-701939374585?w=800&auto=format&fit=crop",
    description: "Survive university life, pass exams, and juggle a cast of unforgettable characters.",
    tags: ["College", "Comedy", "Visual Novel"],
    url: "/play/university-of-problems",
    views: "2.7M",
    rating: "90%"
  },
  {
    id: "office-romance",
    title: "Office Romance",
    thumb: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&auto=format&fit=crop",
    description: "Love finds you at work. Navigate office politics, promotions, and passionate connections.",
    tags: ["Romance", "3D", "Slice of Life"],
    url: "/play/office-romance",
    views: "2.3M",
    rating: "88%"
  },
  {
    id: "stranded-in-space",
    title: "Stranded in Space",
    thumb: "https://images.unsplash.com/photo-1446776858070-70c3d5ed6758?w=800&auto=format&fit=crop",
    description: "Adrift in the cosmos with an AI companion — a sci-fi romance with branching choices.",
    tags: ["Sci-Fi", "Romance", "Visual Novel"],
    url: "/play/stranded-in-space",
    views: "1.9M",
    rating: "87%"
  },
  {
    id: "hero-party-must-fall",
    title: "Hero Party Must Fall",
    thumb: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&auto=format&fit=crop",
    description: "You're the villain's agent. Seduce and corrupt the hero's party before they reach the dungeon.",
    tags: ["Fantasy", "RPG", "Strategy"],
    url: "/play/hero-party-must-fall",
    views: "2.1M",
    rating: "92%"
  },
  {
    id: "sunshine-love",
    title: "Sunshine Love",
    thumb: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop",
    description: "A sunny coastal resort, two paths, and a summer you'll never forget.",
    tags: ["Visual Novel", "Romance", "3D"],
    url: "/play/sunshine-love",
    views: "3.4M",
    rating: "94%"
  },
  {
    id: "peasant-quest",
    title: "Peasant's Quest",
    thumb: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop",
    description: "Rise from peasant to legend in this medieval RPG loaded with humor, battles, and romance.",
    tags: ["RPG", "Fantasy", "Comedy"],
    url: "/play/peasant-quest",
    views: "4.6M",
    rating: "96%"
  },
  {
    id: "freeloading-family",
    title: "Freeloading Family",
    thumb: "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=800&auto=format&fit=crop",
    description: "Your extended family moves in. Chaos ensues in this heartfelt and hilarious visual novel.",
    tags: ["Family Drama", "Comedy", "Visual Novel"],
    url: "/play/freeloading-family",
    views: "3.7M",
    rating: "92%"
  },
  {
    id: "good-girl-gone-bad",
    title: "Good Girl Gone Bad",
    thumb: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&auto=format&fit=crop",
    description: "Play as Ashley — a shy good girl thrust into a world of temptation and difficult choices.",
    tags: ["Female Lead", "Drama", "Visual Novel"],
    url: "/play/good-girl-gone-bad",
    views: "4.2M",
    rating: "93%"
  },
  {
    id: "lust-academy",
    title: "Lust Academy",
    thumb: "https://images.unsplash.com/photo-1543269865-cbf427effbad?w=800&auto=format&fit=crop",
    description: "A magical university where secrets and spells go hand-in-hand with romance and mystery.",
    tags: ["Fantasy", "Magic", "Visual Novel"],
    url: "/play/lust-academy",
    views: "3.0M",
    rating: "90%"
  },
  {
    id: "desert-stalker",
    title: "Desert Stalker",
    thumb: "https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=800&auto=format&fit=crop",
    description: "A post-apocalyptic wasteland, a ruthless warlord, and the women who survive under his reign.",
    tags: ["Post-Apocalyptic", "Dark", "3D"],
    url: "/play/desert-stalker",
    views: "2.8M",
    rating: "91%"
  },
  {
    id: "timestamps",
    title: "Timestamps: Interrupted",
    thumb: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop",
    description: "Time loops, glitching realities, and a love story told across broken timelines.",
    tags: ["Sci-Fi", "Thriller", "Visual Novel"],
    url: "/play/timestamps",
    views: "2.0M",
    rating: "89%"
  },
  {
    id: "the-iron-trial",
    title: "The Iron Trial",
    thumb: "https://images.unsplash.com/photo-1536514072410-5019a3c69182?w=800&auto=format&fit=crop",
    description: "A fantasy war epic where your choices as a general shape the fate of kingdoms and hearts.",
    tags: ["Fantasy", "Strategy", "Epic"],
    url: "/play/the-iron-trial",
    views: "1.6M",
    rating: "88%"
  },
  {
    id: "corrupted-kingdoms",
    title: "Corrupted Kingdoms",
    thumb: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800&auto=format&fit=crop",
    description: "Inherit a kingdom. Discover magic. Build alliances with legendary creatures and rulers.",
    tags: ["Fantasy", "RPG", "Harem"],
    url: "/play/corrupted-kingdoms",
    views: "3.3M",
    rating: "94%"
  },
  {
    id: "our-fate",
    title: "Our Fate",
    thumb: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&auto=format&fit=crop",
    description: "A slow-burn romance between childhood friends reconnecting as adults. Emotional and heartfelt.",
    tags: ["Romance", "Drama", "Visual Novel"],
    url: "/play/our-fate",
    views: "2.2M",
    rating: "92%"
  },
  {
    id: "depraved-awakening",
    title: "Depraved Awakening",
    thumb: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&auto=format&fit=crop",
    description: "A detective thriller where noir atmosphere meets dark temptation at every turn.",
    tags: ["Noir", "Thriller", "Visual Novel"],
    url: "/play/depraved-awakening",
    views: "1.8M",
    rating: "87%"
  },
  {
    id: "zombie-retreat",
    title: "Zombie's Retreat",
    thumb: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=800&auto=format&fit=crop",
    description: "Survive the zombie apocalypse at a mountain retreat — with some unexpected company.",
    tags: ["Survival", "Comedy", "Visual Novel"],
    url: "/play/zombie-retreat",
    views: "2.5M",
    rating: "90%"
  },
  {
    id: "lust-epidemic",
    title: "Lust Epidemic",
    thumb: "https://images.unsplash.com/photo-1547941126-3d5322b218b0?w=800&auto=format&fit=crop",
    description: "Stranded at college after a storm hits. Only you and the women left on campus.",
    tags: ["Comedy", "Simulation", "Visual Novel"],
    url: "/play/lust-epidemic",
    views: "4.9M",
    rating: "95%"
  },
  {
    id: "family-man",
    title: "Family Man",
    thumb: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&auto=format&fit=crop",
    description: "Balancing family, work, and secret desires — a grounded suburban drama with deep choices.",
    tags: ["Drama", "Slice of Life", "3D"],
    url: "/play/family-man",
    views: "1.7M",
    rating: "86%"
  },
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
