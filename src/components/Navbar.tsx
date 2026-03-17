import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Search, Menu, X, Film, Tv, Sparkles, Heart, User, Shield, History } from "lucide-react";
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

const Navbar = () => {
  const { isActive: isTutorialActive } = useTutorial();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
    }
  };

  const navLinks = [
    { to: "/", label: "Home", icon: null },
    { to: "/movies", label: "Movies", icon: Film },
    { to: "/tv", label: "TV Shows", icon: Tv },
    { to: "/anime", label: "Anime", icon: Sparkles },
    { to: "/watchlist", label: "Watchlist", icon: Heart },
    { to: "/history", label: "History", icon: History },
    ...(user?.isAdmin || user?.email?.toLowerCase() === "admin@gmail.com" ? [{ to: "/admin", label: "Admin", icon: Shield }] : []),
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 p-3 md:p-4">
      <div className={cn(
        "container mx-auto px-4 md:px-6 rounded-2xl transition-all duration-300 border",
        isScrolled
          ? "bg-background/40 backdrop-blur-xl border-white/10 shadow-lg shadow-black/20"
          : "bg-background/20 backdrop-blur-md border-white/5",
        isTutorialActive && "pointer-events-none"
      )}>
        <div className="flex items-center justify-between h-14 md:h-16">
          {/* Logo */}
          <Link to="/" id="navbar-logo" className="flex items-center gap-3 group shrink-0">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500/20 blur-lg rounded-full animate-pulse group-hover:bg-blue-500/40 transition-all" />
              <img 
                src={branding.appLogo} 
                alt="App Logo" 
                className="relative w-11 h-11 md:w-12 md:h-12 object-cover rounded-full border border-white/10 shadow-2xl group-hover:scale-105 transition-all duration-300"
              />
            </div>
            <div className="flex flex-col -space-y-1.5 hidden sm:flex">
              <span className="text-xl md:text-2xl font-display font-black tracking-tighter text-white group-hover:text-blue-400 transition-colors">
                JARVIS
              </span>
              <span className="text-xs md:text-sm font-display font-black tracking-[0.3em] text-blue-500 group-hover:text-white transition-colors">
                HUB
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div id="navbar-links" className="hidden lg:flex items-center gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={cn(
                  "flex items-center gap-2 text-[13px] font-bold uppercase tracking-widest px-4 py-2 rounded-full transition-all duration-300",
                  location.pathname === link.to
                    ? "bg-white/10 text-white shadow-[0_0_20px_rgba(255,255,255,0.05)] border border-white/10"
                    : link.to === "/admin" 
                      ? "text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                      : "text-white/50 hover:text-white hover:bg-white/5"
                )}
              >
                {link.icon && <link.icon className="w-4 h-4" />}
                <span>{link.label}</span>
              </Link>
            ))}
          </div>

          {/* Search and Mobile Menu */}
          <div className="flex items-center gap-2 md:gap-4">
            <form onSubmit={handleSearch} id="navbar-search" className="hidden md:flex items-center group">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-blue-500 transition-colors" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search Neural Database..."
                  className="w-44 xl:w-64 pl-11 pr-5 py-2.5 bg-white/[0.03] border border-white/5 rounded-full text-[13px] placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 focus:bg-white/[0.07] transition-all"
                />
              </div>
            </form>
            
            {user ? (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  id="settings-btn"
                  className="hidden md:flex rounded-full hover:bg-white/10"
                  onClick={() => navigate("/settings")}
                >
                  <Settings className="w-5 h-5" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full hover-glow">
                      <Avatar className="h-10 w-10 border-2 border-primary/20">
                        <AvatarFallback className="bg-primary/10 text-primary uppercase">
                          {user.name?.substring(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 glass border-white/10" align="end">
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.name}</p>
                        <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-white/10" />
                    
                    {(user.email?.toLowerCase() === "admin@gmail.com" || user.isAdmin) && (
                      <DropdownMenuItem onClick={() => navigate("/admin")} className="cursor-pointer text-blue-400 hover:bg-blue-400/10 focus:text-blue-400">
                        <Settings className="mr-2 h-4 w-4" />
                        Admin Dashboard
                      </DropdownMenuItem>
                    )}

                    <DropdownMenuItem onClick={() => navigate("/watchlist")} className="cursor-pointer hover:bg-white/5">
                      <Heart className="mr-2 h-4 w-4" />
                      Watchlist
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/history")} className="cursor-pointer hover:bg-white/5">
                      <History className="mr-2 h-4 w-4" />
                      Watch History
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/settings")} className="cursor-pointer hover:bg-white/5">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-white/10" />
                    <DropdownMenuItem onClick={logout} className="cursor-pointer text-red-400 hover:bg-red-400/10 focus:text-red-400">
                      <LogOut className="mr-2 h-4 w-4" />
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  id="settings-btn-alt"
                  className="hidden md:flex rounded-full hover:bg-white/10"
                  onClick={() => navigate("/settings")}
                >
                  <Settings className="w-5 h-5" />
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  className="hidden md:flex items-center gap-2 rounded-full px-4 hover-glow"
                  onClick={() => navigate("/auth")}
                >
                  <User className="w-4 h-4" />
                  Sign In
                </Button>
              </div>
            )}

            {/* Mobile Settings Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => navigate("/settings")}
            >
              <Settings className="w-5 h-5" />
            </Button>

            {/* Mobile Search Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => navigate("/search")}
            >
              <Search className="w-5 h-5" />
            </Button>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-3 border-t border-white/10 animate-fade-in">
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={cn(
                    "flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200",
                    location.pathname === link.to
                      ? "bg-white/15 text-foreground"
                      : link.to === "/admin"
                        ? "text-blue-400 hover:bg-blue-400/10"
                        : "text-muted-foreground hover:bg-white/10 hover:text-foreground"
                  )}
                >
                  {link.icon && <link.icon className="w-5 h-5" />}
                  {link.label}
                </Link>
              ))}
              <div className="pt-2">
                {user ? (
                  <>
                    <Button
                      variant="outline"
                      className="w-full flex items-center justify-center gap-2 rounded-xl h-12 border-red-400/20 text-red-400 hover:bg-red-400/10"
                      onClick={logout}
                    >
                      <LogOut className="w-5 h-5" />
                      Log out of Hub
                    </Button>
                  </>
                ) : (
                  <Button
                    className="w-full flex items-center justify-center gap-2 rounded-xl h-12 hover-glow"
                    onClick={() => navigate("/auth")}
                  >
                    <User className="w-5 h-5" />
                    Sign In
                  </Button>
                )}
                <Button
                  variant="ghost"
                  className="w-full mt-1 flex items-center justify-center gap-2 rounded-xl h-12 hover:bg-white/5 text-muted-foreground"
                  onClick={() => navigate("/settings")}
                >
                  <Settings className="w-5 h-5" />
                  Settings & Calibration
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
