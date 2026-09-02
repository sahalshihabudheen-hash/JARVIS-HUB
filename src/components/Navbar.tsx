import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Search, X, Film, Tv, Sparkles, Heart, User, Shield, History, Flame, Newspaper, LogOut, Settings, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { useAuth } from "@/context/AuthContext";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "./ui/dropdown-menu";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { useTutorial } from "@/context/TutorialContext";
import { useAdmin } from "@/context/AdminContext";

const Navbar = () => {
  const { isActive: isTutorialActive, startTutorial } = useTutorial();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  const { user, logout } = useAuth();
  const { branding } = useAdmin();

  const isAdultMode = location.pathname.startsWith("/adult") || location.pathname.startsWith("/hub/watch") || location.pathname.startsWith("/watch/adult");

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);


  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setIsSearchExpanded(false);
    }
  };

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/movies", label: "Movies" },
    { to: "/tv", label: "TV Shows" },
    { to: "/anime", label: "Anime" },
    { to: "/news", label: "News" },
    { to: "/downloads", label: "Downloads" },
    { to: "/watchlist", label: "Watchlist" },
    { to: "/history", label: "History" },
    ...(user?.hasAdultAccess || user?.isAdmin || user?.email?.toLowerCase() === "admin@gmail.com" || user?.email?.toLowerCase() === "superadmin@gmail.com" ? [{ to: "/adult", label: "Adult" }] : []),
    ...(user?.isAdmin || user?.email?.toLowerCase() === "admin@gmail.com" || user?.email?.toLowerCase() === "superadmin@gmail.com" ? [{ to: "/admin", label: "Admin" }] : []),
  ];

  // Core tabs shown in mobile bottom nav
  const HomeIconSVG = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[22px] h-[22px]">
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  );

  const mobileBottomTabs = [
    { to: "/",          label: "Home",   Icon: HomeIconSVG },
    { to: "/movies",    label: "Movies", Icon: Film },
    { to: "/search",    label: "Search", Icon: Search },
    { to: "/tv",        label: "TV",     Icon: Tv },
    { to: "/watchlist", label: "Saved",  Icon: Heart },
  ];



  return (
    <>
      {/* Top Navbar */}
      <nav className="fixed top-4 left-0 right-0 z-50 px-4 md:px-6 flex justify-center pointer-events-none select-none">
        <div className={cn(
          "pointer-events-auto w-full max-w-7xl rounded-[2.5rem] transition-all duration-700 border relative group/nav",
          isScrolled
            ? "bg-background/40 backdrop-blur-3xl border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.4)] py-2 px-4 md:px-6"
            : "bg-background/20 backdrop-blur-2xl border-white/5 shadow-2xl py-3 px-5 md:px-8",
          isAdultMode && "border-red-500/20 shadow-red-500/5",
          isTutorialActive && "pointer-events-none"
        )}>
          {/* Cute Prism Border Effect */}
          <div className="absolute inset-0 rounded-[2.5rem] opacity-0 group-hover/nav:opacity-100 transition-opacity duration-1000 pointer-events-none overflow-hidden">
            <div className="absolute inset-[-100%] bg-[conic-gradient(from_0deg,transparent_0,rgba(59,130,246,0.1)_25%,transparent_50%,rgba(168,85,247,0.1)_75%,transparent_100%)] animate-[spin_8s_linear_infinite]" />
          </div>

          <div className="flex items-center justify-between gap-4 relative z-10">
            
            {/* Logo Section */}
            <Link id="navbar-logo" to="/" className="flex items-center gap-2 group shrink-0 relative">
              <div className="relative">
                <img 
                  src={branding.appLogo} 
                  alt="App Logo" 
                  className={cn(
                    "relative object-cover rounded-xl transition-all duration-500",
                    isScrolled ? "w-8 h-8" : "w-9 h-9"
                  )}
                />
              </div>
              <div className="flex flex-col -space-y-1 hidden sm:flex">
                <span className="font-display font-bold tracking-tight text-white text-lg">
                  JARVIS
                </span>
              </div>
            </Link>

            {/* Centered Navigation Pills (Desktop) */}
            <div id="navbar-links" className={cn(
              "hidden lg:flex items-center flex-1 justify-center transition-all duration-500",
              isSearchExpanded ? "opacity-0 pointer-events-none scale-95" : "opacity-100 scale-100"
            )}>
              <div className="flex items-center gap-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={cn(
                      "flex items-center gap-2 text-sm font-medium px-5 py-2.5 rounded-full transition-all duration-300 relative group",
                      location.pathname === link.to
                        ? "text-white bg-white/10"
                        : "text-white/60 hover:text-white hover:bg-white/5"
                    )}
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      {link.label}
                    </span>
                    {location.pathname === link.to && (
                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full translate-y-2" />
                    )}
                  </Link>
                ))}
                
                <button
                  onClick={() => {
                    navigate("/");
                    setTimeout(startTutorial, 500);
                  }}
                  className="flex items-center gap-2 text-sm font-medium px-5 py-2.5 rounded-full text-blue-400/60 hover:text-blue-400 hover:bg-blue-500/5 transition-all duration-300"
                >
                  Help
                </button>
              </div>
            </div>

            {/* Right Section: Search & Auth */}
            <div className="flex items-center gap-2 relative z-10">

              {/* Adult exit (xl desktop only) */}
              {isAdultMode && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="hidden xl:flex rounded-full bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 text-[10px] font-bold uppercase tracking-widest px-4 h-9"
                  onClick={() => navigate("/")}
                >
                  Exit
                </Button>
              )}

              {/* Search */}
              <div
                id="navbar-search"
                className={cn(
                  "flex items-center transition-all duration-500 overflow-hidden bg-white/5 rounded-full border border-white/10 shadow-inner",
                  isSearchExpanded ? "w-44 sm:w-64 px-1" : "w-10 md:w-11"
                )}
              >
                {isSearchExpanded ? (
                  <form onSubmit={handleSearch} className="flex-1 flex items-center h-10 md:h-11 px-2">
                    <Search className="w-4 h-4 text-blue-400 shrink-0 mr-2" />
                    <input
                      autoFocus
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onBlur={() => !searchQuery && setIsSearchExpanded(false)}
                      placeholder="Search..."
                      className="w-full bg-transparent border-none focus:outline-none focus:ring-0 text-white text-xs placeholder:text-white/30"
                    />
                    <button type="button" onClick={() => setIsSearchExpanded(false)} className="text-white/40 hover:text-white">
                      <X className="w-4 h-4" />
                    </button>
                  </form>
                ) : (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-10 h-10 md:w-11 md:h-11 rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-all duration-300"
                    onClick={() => setIsSearchExpanded(true)}
                  >
                    <Search className="w-4 h-4 md:w-5 md:h-5" />
                  </Button>
                )}
              </div>

              {/* Desktop profile dropdown */}
              <div className="hidden lg:flex items-center gap-2">
                {user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        id="settings-btn"
                        variant="ghost"
                        className={cn(
                          "relative h-11 w-11 rounded-full border-2 transition-all p-0 overflow-hidden shadow-xl hover:scale-105 active:scale-95 duration-300",
                          isAdultMode ? "border-red-500/40 hover:border-red-500" : "border-blue-500/40 hover:border-blue-500"
                        )}
                      >
                        <Avatar className="h-full w-full">
                          <AvatarFallback className={cn("text-white font-bold uppercase text-sm", isAdultMode ? "bg-gradient-to-br from-red-600 to-orange-500" : "bg-gradient-to-br from-blue-600 via-indigo-500 to-purple-600")}>
                            {user.name?.substring(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-60 glass border-white/10 mt-3 rounded-[1.5rem] shadow-2xl p-1.5" align="end">
                      <DropdownMenuLabel className="font-normal p-3">
                        <p className="text-sm font-bold">{user.name}</p>
                        <p className="text-[10px] text-white/40 mt-1 uppercase tracking-widest">{user.email}</p>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator className="bg-white/10 mx-1" />
                      <div className="grid gap-1 mt-1">
                        {(user.isAdmin || user.email?.toLowerCase() === "admin@gmail.com" || user.email?.toLowerCase() === "superadmin@gmail.com") && (
                          <DropdownMenuItem onClick={() => navigate("/admin")} className="cursor-pointer text-blue-400 hover:bg-blue-500/20 py-3 focus:text-blue-400 rounded-xl px-3">
                            <Shield className="mr-3 h-4 w-4" /><span className="font-bold text-xs uppercase tracking-wider">Admin Panel</span>
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => navigate("/watchlist")} className="cursor-pointer hover:bg-white/10 py-3 rounded-xl px-3">
                          <Heart className="mr-3 h-4 w-4 text-pink-400" /><span className="font-bold text-xs uppercase tracking-wider">My Watchlist</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate("/history")} className="cursor-pointer hover:bg-white/10 py-3 rounded-xl px-3">
                          <History className="mr-3 h-4 w-4 text-purple-400" /><span className="font-bold text-xs uppercase tracking-wider">History</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate("/settings")} className="cursor-pointer hover:bg-white/10 py-3 rounded-xl px-3">
                          <Settings className="mr-3 h-4 w-4 text-gray-400" /><span className="font-bold text-xs uppercase tracking-wider">Settings</span>
                        </DropdownMenuItem>
                      </div>
                      <DropdownMenuSeparator className="bg-white/10 mx-1" />
                      <DropdownMenuItem onClick={logout} className="cursor-pointer text-red-400 hover:bg-red-500/20 py-3 focus:text-red-400 rounded-xl px-3 mt-1 mb-1">
                        <LogOut className="mr-3 h-4 w-4" /><span className="font-bold text-xs uppercase tracking-wider">Log out</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Button
                    className="rounded-full bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 hover:scale-105 active:scale-95 text-white font-bold uppercase tracking-widest text-[10px] px-7 h-11 border-none shadow-[0_5px_20px_rgba(59,130,246,0.4)]"
                    onClick={() => navigate("/auth")}
                  >
                    <User className="w-4 h-4 mr-2" />Sign In
                  </Button>
                )}
              </div>

              {/* Mobile profile avatar */}
              <div className="lg:hidden flex items-center">
                {user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className={cn(
                          "relative h-9 w-9 rounded-full border-2 p-0 overflow-hidden shadow-lg active:scale-90 transition-all duration-300",
                          isAdultMode ? "border-red-500/40" : "border-blue-500/30"
                        )}
                      >
                        <Avatar className="h-full w-full">
                          <AvatarFallback className={cn("text-white font-bold uppercase text-xs", isAdultMode ? "bg-gradient-to-br from-red-600 to-orange-500" : "bg-gradient-to-br from-blue-600 via-indigo-500 to-purple-600")}>
                            {user.name?.substring(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56 glass border-white/10 mt-3 rounded-[1.5rem] shadow-2xl p-1.5" align="end">
                      <DropdownMenuLabel className="font-normal p-3">
                        <p className="text-sm font-bold">{user.name}</p>
                        <p className="text-[10px] text-white/40 mt-1 uppercase tracking-widest">{user.email}</p>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator className="bg-white/10 mx-1" />
                      <div className="grid gap-1 mt-1">
                        {(user.isAdmin || user.email?.toLowerCase() === "admin@gmail.com" || user.email?.toLowerCase() === "superadmin@gmail.com") && (
                          <DropdownMenuItem onClick={() => navigate("/admin")} className="cursor-pointer text-blue-400 hover:bg-blue-500/20 py-2.5 focus:text-blue-400 rounded-xl px-3">
                            <Shield className="mr-3 h-4 w-4" /><span className="font-bold text-xs uppercase tracking-wider">Admin Panel</span>
                          </DropdownMenuItem>
                        )}
                        {(user.hasAdultAccess || user.isAdmin || user.email?.toLowerCase() === "admin@gmail.com" || user.email?.toLowerCase() === "superadmin@gmail.com") && (
                          <DropdownMenuItem onClick={() => { (window as any).__jarvis_internal = true; navigate("/adult/catalog"); }} className="cursor-pointer text-red-400 hover:bg-red-500/20 py-2.5 focus:text-red-400 rounded-xl px-3">
                            <Flame className="mr-3 h-4 w-4" /><span className="font-bold text-xs uppercase tracking-wider">Adult Zone</span>
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => navigate("/anime")} className="cursor-pointer hover:bg-white/10 py-2.5 rounded-xl px-3">
                          <Sparkles className="mr-3 h-4 w-4 text-indigo-400" /><span className="font-bold text-xs uppercase tracking-wider">Anime</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate("/history")} className="cursor-pointer hover:bg-white/10 py-2.5 rounded-xl px-3">
                          <History className="mr-3 h-4 w-4 text-purple-400" /><span className="font-bold text-xs uppercase tracking-wider">History</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate("/downloads")} className="cursor-pointer hover:bg-white/10 py-2.5 rounded-xl px-3">
                          <Download className="mr-3 h-4 w-4 text-green-400" /><span className="font-bold text-xs uppercase tracking-wider">Downloads</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate("/news")} className="cursor-pointer hover:bg-white/10 py-2.5 rounded-xl px-3">
                          <Newspaper className="mr-3 h-4 w-4 text-yellow-400" /><span className="font-bold text-xs uppercase tracking-wider">News</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate("/settings")} className="cursor-pointer hover:bg-white/10 py-2.5 rounded-xl px-3">
                          <Settings className="mr-3 h-4 w-4 text-gray-400" /><span className="font-bold text-xs uppercase tracking-wider">Settings</span>
                        </DropdownMenuItem>
                      </div>
                      <DropdownMenuSeparator className="bg-white/10 mx-1" />
                      <DropdownMenuItem onClick={logout} className="cursor-pointer text-red-400 hover:bg-red-500/20 py-2.5 focus:text-red-400 rounded-xl px-3 mt-1 mb-1">
                        <LogOut className="mr-3 h-4 w-4" /><span className="font-bold text-xs uppercase tracking-wider">Log out</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Button
                    size="sm"
                    className="rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-[10px] px-4 h-9 border-none shadow-lg"
                    onClick={() => navigate("/auth")}
                  >
                    Sign In
                  </Button>
                )}
              </div>

            </div>
          </div>
        </div>
      </nav>

      {/* ══ MOBILE BOTTOM NAV BAR ══ */}
      {!isTutorialActive && (
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 pointer-events-none select-none">
          <div
            className={cn(
              "pointer-events-auto mx-3 mb-3 rounded-[2rem] border backdrop-blur-3xl shadow-[0_-4px_30px_rgba(0,0,0,0.5)]",
              isAdultMode
                ? "bg-[#0c0101]/85 border-red-500/20"
                : "bg-background/70 border-white/10"
            )}
          >
            <div className="flex items-center justify-around px-2 py-1.5">
              {mobileBottomTabs.map(({ to, label, Icon }) => {
                const isActive = to === "/" ? location.pathname === "/" : location.pathname.startsWith(to);
                return (
                  <Link
                    key={to}
                    to={to}
                    className={cn(
                      "flex flex-col items-center gap-0.5 py-2 px-3 rounded-2xl transition-all duration-300 active:scale-90 min-w-[52px]",
                      isActive
                        ? isAdultMode ? "text-red-400 bg-red-500/10" : "text-blue-400 bg-blue-500/10"
                        : "text-white/40"
                    )}
                  >
                    <div className="relative flex items-center justify-center">
                      <Icon className="w-[22px] h-[22px]" />
                      {isActive && (
                        <span className={cn("absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full", isAdultMode ? "bg-red-400" : "bg-blue-400")} />
                      )}
                    </div>
                    <span className={cn("text-[9px] font-bold uppercase tracking-wider leading-none mt-0.5", isActive ? "opacity-100" : "opacity-50")}>
                      {label}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </nav>
      )}
    </>
  );
};

export default Navbar;
