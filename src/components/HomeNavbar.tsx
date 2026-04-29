import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Search, Menu, X, Film, Tv, Sparkles, Heart, User, Shield, History, Flame, Newspaper } from "lucide-react";
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
import { LogOut, Settings } from "lucide-react";
import { useTutorial } from "@/context/TutorialContext";
import { useAdmin } from "@/context/AdminContext";

const HomeNavbar = () => {
  const { isActive: isTutorialActive } = useTutorial();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { branding } = useAdmin();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setIsSearchExpanded(false);
    }
  };

  const navLinks = [
    { to: "/", label: "Home", icon: null },
    { to: "/movies", label: "Movies", icon: Film },
    { to: "/tv", label: "TV Shows", icon: Tv },
    { to: "/anime", label: "Anime", icon: Sparkles },
    { to: "/news", label: "News", icon: Newspaper },
    ...(user?.hasAdultAccess || user?.isAdmin || user?.email?.toLowerCase() === "admin@gmail.com" ? [{ to: "/adult", label: "Adult", icon: Flame }] : []),
  ];

  return (
    <nav className="fixed top-4 left-0 right-0 z-50 px-4 md:px-8 flex justify-center pointer-events-none">
      {/* 
        Floating Pill Design: The navbar itself is a floating pill.
        pointer-events-none on parent allows clicking through to items underneath, 
        but we restore pointer-events-auto on the actual pill.
      */}
      <div className={cn(
        "pointer-events-auto w-full max-w-5xl rounded-[2.5rem] transition-all duration-500 border overflow-hidden",
        isScrolled
          ? "bg-background/60 backdrop-blur-3xl border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.5)] shadow-blue-500/10 py-2 px-4 md:px-6"
          : "bg-background/30 backdrop-blur-xl border-white/5 shadow-2xl py-3 px-5 md:px-8",
        isTutorialActive && "pointer-events-none"
      )}>
        <div className="flex items-center justify-between">
          
          {/* Logo Section */}
          <Link to="/" className="flex items-center gap-3 group shrink-0 relative z-10">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full group-hover:bg-blue-500/40 transition-all duration-500" />
              <img 
                src={branding.appLogo} 
                alt="App Logo" 
                className={cn(
                  "relative object-cover rounded-full border border-white/20 shadow-2xl transition-all duration-500",
                  isScrolled ? "w-10 h-10 group-hover:scale-105" : "w-12 h-12 group-hover:scale-110"
                )}
              />
            </div>
            <div className="flex flex-col -space-y-1 hidden sm:flex">
              <span className={cn(
                "font-display font-black tracking-tighter text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-purple-400 transition-all duration-300",
                isScrolled ? "text-xl" : "text-2xl"
              )}>
                JARVIS
              </span>
              <span className="text-[10px] font-display font-black tracking-[0.4em] text-blue-500 group-hover:text-purple-400 transition-colors">
                HUB
              </span>
            </div>
          </Link>

          {/* Centered Navigation Pills (Desktop) */}
          <div className={cn(
            "hidden lg:flex items-center absolute left-1/2 -translate-x-1/2 bg-white/5 p-1.5 rounded-full border border-white/10 shadow-inner backdrop-blur-md transition-all duration-300",
            isSearchExpanded ? "opacity-0 pointer-events-none scale-95" : "opacity-100 scale-100"
          )}>
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={cn(
                  "flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.15em] px-4 py-2 rounded-full transition-all duration-300 relative overflow-hidden group",
                  location.pathname === link.to
                    ? "text-white shadow-md"
                    : "text-white/50 hover:text-white"
                )}
              >
                {/* Active Background Glow */}
                {location.pathname === link.to && (
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600/80 to-purple-600/80 rounded-full z-0" />
                )}
                {/* Hover Background Glow */}
                {location.pathname !== link.to && (
                  <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 rounded-full z-0 transition-colors" />
                )}
                
                <span className="relative z-10 flex items-center gap-1.5">
                  {link.icon && <link.icon className="w-3.5 h-3.5" />}
                  {link.label}
                </span>
              </Link>
            ))}
          </div>

          {/* Right Section: Search & Auth */}
          <div className="flex items-center gap-2 md:gap-4 relative z-10">
            {/* Search Toggle / Input */}
            <div className={cn(
              "flex items-center transition-all duration-300 overflow-hidden bg-white/5 rounded-full border border-white/10",
              isSearchExpanded ? "w-48 md:w-64 px-1" : "w-10 md:w-11"
            )}>
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
                  className="w-10 h-10 md:w-11 md:h-11 rounded-full text-white/50 hover:text-white hover:bg-white/10"
                  onClick={() => setIsSearchExpanded(true)}
                >
                  <Search className="w-4 h-4 md:w-5 md:h-5" />
                </Button>
              )}
            </div>

            {/* Auth / Settings Desktop */}
            <div className="hidden lg:flex items-center gap-2">
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-11 w-11 rounded-full border-2 border-blue-500/30 hover:border-blue-500 transition-all p-0 overflow-hidden shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                      <Avatar className="h-full w-full">
                        <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white font-bold uppercase text-sm">
                          {user.name?.substring(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 glass border-white/10 mt-2 rounded-2xl" align="end">
                    <DropdownMenuLabel className="font-normal py-3">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-bold leading-none">{user.name}</p>
                        <p className="text-xs leading-none text-white/50 mt-1">{user.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-white/10" />
                    
                    {(user.email?.toLowerCase() === "admin@gmail.com" || user.isAdmin) && (
                      <DropdownMenuItem onClick={() => navigate("/admin")} className="cursor-pointer text-blue-400 hover:bg-blue-500/20 py-2.5 focus:text-blue-400 rounded-xl mx-1">
                        <Shield className="mr-2 h-4 w-4" />
                        Admin Dashboard
                      </DropdownMenuItem>
                    )}

                    <DropdownMenuItem onClick={() => navigate("/watchlist")} className="cursor-pointer hover:bg-white/10 py-2.5 rounded-xl mx-1">
                      <Heart className="mr-2 h-4 w-4 text-pink-400" />
                      Watchlist
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/history")} className="cursor-pointer hover:bg-white/10 py-2.5 rounded-xl mx-1">
                      <History className="mr-2 h-4 w-4 text-purple-400" />
                      History
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/settings")} className="cursor-pointer hover:bg-white/10 py-2.5 rounded-xl mx-1">
                      <Settings className="mr-2 h-4 w-4 text-gray-400" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-white/10" />
                    <DropdownMenuItem onClick={logout} className="cursor-pointer text-red-400 hover:bg-red-500/20 py-2.5 focus:text-red-400 rounded-xl mx-1 mb-1">
                      <LogOut className="mr-2 h-4 w-4" />
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button
                  variant="default"
                  className="rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold uppercase tracking-widest text-[10px] px-6 h-11 border-none shadow-[0_0_20px_rgba(59,130,246,0.4)] hover:shadow-[0_0_30px_rgba(59,130,246,0.6)] transition-all"
                  onClick={() => navigate("/auth")}
                >
                  <User className="w-4 h-4 mr-2" />
                  Sign In
                </Button>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <div className="lg:hidden flex items-center">
              <Button
                variant="ghost"
                size="icon"
                className="w-10 h-10 rounded-full text-white/50 hover:text-white hover:bg-white/10 bg-white/5 border border-white/10"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="lg:hidden mt-4 pt-4 border-t border-white/10 animate-fade-in pb-2">
            <div className="flex flex-col gap-1.5">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 font-bold",
                    location.pathname === link.to
                      ? "bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-white border border-blue-500/30"
                      : "text-white/50 hover:bg-white/10 hover:text-white"
                  )}
                >
                  {link.icon && <link.icon className={cn("w-5 h-5", location.pathname === link.to ? "text-blue-400" : "")} />}
                  {link.label}
                </Link>
              ))}
              
              <div className="mt-4 pt-4 border-t border-white/10">
                {user ? (
                  <>
                    <Link to="/watchlist" className="flex items-center gap-3 px-4 py-3 rounded-2xl text-white/50 hover:bg-white/10 hover:text-white font-bold transition-all">
                      <Heart className="w-5 h-5 text-pink-400" /> Watchlist
                    </Link>
                    <Link to="/history" className="flex items-center gap-3 px-4 py-3 rounded-2xl text-white/50 hover:bg-white/10 hover:text-white font-bold transition-all">
                      <History className="w-5 h-5 text-purple-400" /> History
                    </Link>
                    <Link to="/settings" className="flex items-center gap-3 px-4 py-3 rounded-2xl text-white/50 hover:bg-white/10 hover:text-white font-bold transition-all">
                      <Settings className="w-5 h-5 text-gray-400" /> Settings
                    </Link>
                    <Button
                      variant="outline"
                      className="w-full mt-2 flex items-center justify-center gap-2 rounded-2xl h-12 border-red-500/30 text-red-400 hover:bg-red-500/20 font-bold uppercase tracking-widest text-xs"
                      onClick={logout}
                    >
                      <LogOut className="w-4 h-4" />
                      Log out
                    </Button>
                  </>
                ) : (
                  <Button
                    className="w-full flex items-center justify-center gap-2 rounded-2xl h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold uppercase tracking-widest border-none shadow-lg"
                    onClick={() => navigate("/auth")}
                  >
                    <User className="w-5 h-5" />
                    Sign In
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default HomeNavbar;
