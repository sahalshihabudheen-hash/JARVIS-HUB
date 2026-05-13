import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Movies from "./pages/Movies";
import TVShows from "./pages/TVShows";
import Anime from "./pages/Anime";
import Search from "./pages/Search";
import MovieDetails from "./pages/MovieDetails";
import TVDetails from "./pages/TVDetails";
import WatchPage from "./pages/WatchPage";
import Watchlist from "./pages/Watchlist";
import Auth from "./pages/Auth";
import Settings from "./pages/Settings";
import History from "./pages/History";
import AdultSelection from "./pages/AdultSelection";
import AdultCatalog from "./pages/AdultCatalog";
import EasternPremium from "./pages/EasternPremium";
import WatchHub from "./pages/WatchHub";
import News from "./pages/News";
import Downloads from "./pages/Downloads";
import AdultGames from "./pages/AdultGames";
import NotFound from "./pages/NotFound";
import RemoteControl from "./pages/RemoteControl";
import { AuthProvider } from "./context/AuthContext";
import { TutorialProvider } from "./context/TutorialContext";
import { AdminProvider } from "./context/AdminContext";
import JarvisTutorial from "./components/JarvisTutorial";
import { CommandPalette } from "./components/CommandPalette";
import Admin from "./pages/Admin";
import Maintenance from "./components/Maintenance";
import { useAdmin } from "./context/AdminContext";
import VerificationBanner from "./components/VerificationBanner";
import JarvisOrb from "./components/JarvisOrb";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
    },
  },
});

import { Navigate, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "./lib/firebase";
import { getRemoteSessionId } from "./lib/utils";

const StealthManager = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const lastEscPress = useRef<number>(0);
  const isFirstLoad = useRef(true);

  useEffect(() => {
    if (isFirstLoad.current) {
      isFirstLoad.current = false;
    } else {
      (window as any).__jarvis_internal = true;
    }
  }, [location.pathname]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        const now = Date.now();
        if (now - lastEscPress.current < 500) {
          // Double tap detected - Protocol Alpha
          
          // Mute and pause any HTML5 media elements
          document.querySelectorAll("video, audio").forEach((media: any) => {
            media.pause();
            media.muted = true;
          });

          // Change tab identity
          document.title = "System Update | JARVIS Hub";
          
          // Navigate to home
          navigate("/", { replace: true });

          // Sonner toast (imported via Toaster)
          toast.info("Stealth Protocol Alpha Active", {
            description: "Redirected to secure terminal.",
            duration: 5000,
          });
        }
        lastEscPress.current = now;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navigate]);

  return null;
};

const RemoteListener = () => {
  const navigate = useNavigate();
  const lastTimestamp = useRef<number | null>(null);

  useEffect(() => {
    const sessionId = getRemoteSessionId();
    const remoteDoc = doc(db, "remotes", `remote_${sessionId}`);
    const unsub = onSnapshot(remoteDoc, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data.lastCommand && data.timestamp) {
          if (lastTimestamp.current === null) {
            lastTimestamp.current = data.timestamp;
          } else if (data.timestamp !== lastTimestamp.current) {
            lastTimestamp.current = data.timestamp;
            handleRemoteCommand(data.lastCommand, data.commandData);
          }
        }
      }
    });

    // Mark display as online for the remote to see
    setDoc(remoteDoc, { online: true, lastHeartbeat: Date.now() }, { merge: true });

    return () => unsub();
  }, [navigate]);

  const handleRemoteCommand = (cmd: string, data: any) => {
    switch (cmd) {
      case "search":
        if (data.query) {
          toast.info(`Remote Protocol: Searching for ${data.query}`);
          navigate(`/search?q=${encodeURIComponent(data.query)}`);
        }
        break;
      case "navigate":
        if (data.path) navigate(data.path);
        break;
      case "close_player":
        navigate(-1);
        break;
      case "toggle_play":
      case "seek":
      case "volume_up":
      case "volume_down":
        // Dispatch to window for WatchPage to catch
        window.dispatchEvent(new CustomEvent("jarvis-remote-cmd", { detail: { cmd, data } }));
        break;
      default:
        console.log("Unknown remote command:", cmd);
    }
  };

  return null;
};

const ProtectedLayout = () => {
  const { user } = useAuth();
  const { isMaintenanceMode } = useAdmin();

  if (!user) return <Navigate to="/auth" replace />;
  
  if (isMaintenanceMode && !user.isAdmin) {
    return <Maintenance />;
  }

  return <Outlet />;
};


const App = () => (
  <QueryClientProvider client={queryClient}>
    <AdminProvider>
      <AuthProvider>
        <TutorialProvider>
          <TooltipProvider>
            <BrowserRouter>
              <div className="relative min-h-screen">
                {/* Global Aesthetic Layer */}
                <div className="fixed inset-0 mesh-gradient opacity-10 pointer-events-none -z-10" />
                <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(37,99,235,0.05),transparent_50%)] pointer-events-none -z-10" />
                
                <StealthManager />
                <RemoteListener />
                <CommandPalette />
                <JarvisTutorial />
                <JarvisOrb />
                <VerificationBanner />
                <Toaster />
                <Sonner />
                <Routes>
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/remote" element={<RemoteControl />} />
                
                {/* Protected Routes */}
                <Route element={<ProtectedLayout />}>
                  <Route path="/" element={<Index />} />
                  <Route path="/movies" element={<Movies />} />
                  <Route path="/tv" element={<TVShows />} />
                  <Route path="/anime" element={<Anime />} />
                  <Route path="/search" element={<Search />} />
                  <Route path="/watchlist" element={<Watchlist />} />
                  <Route path="/movie/:id" element={<MovieDetails />} />
                  <Route path="/tv/:id" element={<TVDetails />} />
                  <Route path="/watch/:type/:id" element={<WatchPage />} />
                  <Route path="/watch/:type/:id/:season/:episode" element={<WatchPage />} />
                   <Route path="/settings" element={<Settings />} />
                  <Route path="/history" element={<History />} />
                  <Route path="/adult" element={<AdultSelection />} />
                  <Route path="/adult/catalog" element={<AdultCatalog />} />
                  <Route path="/adult/eastern" element={<EasternPremium />} />
                  <Route path="/adult/games" element={<AdultGames />} />
                  <Route path="/adult/games/:id" element={<AdultGames />} />
                  <Route path="/news" element={<News />} />
                  <Route path="/downloads" element={<Downloads />} />
                  <Route path="/hub/watch/:id" element={<WatchHub />} />
                  <Route path="/watch/adult/:id" element={<WatchHub />} />
                  <Route path="/admin" element={<Admin />} />
                </Route>
    
                <Route path="*" element={<NotFound />} />
              </Routes>
              </div>
            </BrowserRouter>
          </TooltipProvider>
        </TutorialProvider>
      </AuthProvider>
    </AdminProvider>
  </QueryClientProvider>
);

export default App;
