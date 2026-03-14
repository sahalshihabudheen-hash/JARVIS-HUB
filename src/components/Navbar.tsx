import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Search, Menu, X, Film, Tv, Sparkles, Heart, User } from "lucide-react";
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

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

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
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 p-3 md:p-4">
      <div className={cn(
        "container mx-auto px-4 md:px-6 rounded-2xl transition-all duration-300 border",
        isScrolled
          ? "bg-background/40 backdrop-blur-xl border-white/10 shadow-lg shadow-black/20"
          : "bg-background/20 backdrop-blur-md border-white/5"
      )}>
        <div className="flex items-center justify-between h-14 md:h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <img 
              src="/JARVIS2.gif" 
              alt="JARVIS Logo" 
              className="w-10 h-10 md:w-12 md:h-12 object-cover rounded-full group-hover:shadow-[0_0_15px_hsl(var(--primary))] transition-all duration-300"
            />
            <span className="text-xl md:text-2xl font-display font-bold tracking-tighter text-gradient group-hover:drop-shadow-[0_0_8px_hsl(var(--primary))] transition-all hidden sm:block">
              JARVIS<span className="text-foreground ml-1">HUB</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={cn(
                  "flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-full transition-all duration-200",
                  location.pathname === link.to
                    ? "bg-white/15 text-foreground backdrop-blur-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/10"
                )}
              >
                {link.icon && <link.icon className="w-4 h-4" />}
                {link.label}
              </Link>
            ))}
          </div>

          {/* Search and Mobile Menu */}
          <div className="flex items-center gap-3">
            <form onSubmit={handleSearch} className="hidden md:flex items-center">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search movies, shows..."
                  className="w-56 lg:w-72 pl-10 pr-4 py-2 bg-secondary/50 border border-border/50 rounded-full text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                />
              </div>
            </form>
            
            {user ? (
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
                  <DropdownMenuItem onClick={() => navigate("/watchlist")} className="cursor-pointer hover:bg-white/5">
                    <Heart className="mr-2 h-4 w-4" />
                    Watchlist
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
            ) : (
              <Button
                variant="default"
                size="sm"
                className="hidden md:flex items-center gap-2 rounded-full px-4 hover-glow"
                onClick={() => navigate("/auth")}
              >
                <User className="w-4 h-4" />
                Sign In
              </Button>
            )}

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
                      : "text-muted-foreground hover:bg-white/10 hover:text-foreground"
                  )}
                >
                  {link.icon && <link.icon className="w-5 h-5" />}
                  {link.label}
                </Link>
              ))}
              <div className="pt-2">
                {user ? (
                  <Button
                    variant="outline"
                    className="w-full flex items-center justify-center gap-2 rounded-xl h-12 border-red-400/20 text-red-400 hover:bg-red-400/10"
                    onClick={logout}
                  >
                    <LogOut className="w-5 h-5" />
                    Log out of Hub
                  </Button>
                ) : (
                  <Button
                    className="w-full flex items-center justify-center gap-2 rounded-xl h-12 hover-glow"
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

export default Navbar;
