import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, Outlet, useNavigate, useLocation } from "react-router-dom";
import { lazy, Suspense, useEffect, useRef } from "react";
import { AuthProvider } from "./context/AuthContext";
import { TutorialProvider } from "./context/TutorialContext";
import { AdminProvider } from "./context/AdminContext";
import { useAuth } from "./context/AuthContext";
import { useAdmin } from "./context/AdminContext";
import { toast } from "sonner";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "./lib/firebase";
import { getRemoteSessionId } from "./lib/utils";
import Maintenance from "./components/Maintenance";

// ── Lazy-loaded pages (each becomes its own JS chunk) ─────────────────────────
const Index           = lazy(() => import("./pages/Index"));
const Movies          = lazy(() => import("./pages/Movies"));
const TVShows         = lazy(() => import("./pages/TVShows"));
const Anime           = lazy(() => import("./pages/Anime"));
const Search          = lazy(() => import("./pages/Search"));
const MovieDetails    = lazy(() => import("./pages/MovieDetails"));
const TVDetails       = lazy(() => import("./pages/TVDetails"));
const WatchPage       = lazy(() => import("./pages/WatchPage"));
const Watchlist       = lazy(() => import("./pages/Watchlist"));
const Auth            = lazy(() => import("./pages/Auth"));
const Settings        = lazy(() => import("./pages/Settings"));
const History         = lazy(() => import("./pages/History"));
const Downloads       = lazy(() => import("./pages/Downloads"));
const News            = lazy(() => import("./pages/News"));
const Admin           = lazy(() => import("./pages/Admin"));
const NotFound        = lazy(() => import("./pages/NotFound"));
const RemoteControl   = lazy(() => import("./pages/RemoteControl"));
const WatchHub        = lazy(() => import("./pages/WatchHub"));

// Adult section — heaviest pages, all lazy
const AdultCatalog    = lazy(() => import("./pages/AdultCatalog"));
const AdultSelection  = lazy(() => import("./pages/AdultSelection"));
const EasternPremium  = lazy(() => import("./pages/EasternPremium"));
const AdultAIGenerator = lazy(() => import("./pages/AdultAIGenerator"));
const AdultAICompanion = lazy(() => import("./pages/AdultAICompanion"));
const AdultVR         = lazy(() => import("./pages/AdultVR"));
const AdultLiveCams   = lazy(() => import("./pages/AdultLiveCams"));

// Lazy-loaded heavy components
const JarvisTutorial  = lazy(() => import("./components/JarvisTutorial"));
const CommandPalette  = lazy(() => import("./components/CommandPalette").then(m => ({ default: m.CommandPalette })));
const JarvisOrb       = lazy(() => import("./components/JarvisOrb"));
const VerificationBanner = lazy(() => import("./components/VerificationBanner"));

// ── QueryClient — optimised cache to reduce re-fetches ────────────────────────
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 10,       // 10 min (was 5)
      gcTime: 1000 * 60 * 30,          // keep in memory 30 min
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      retry: 1,                         // was default 3
    },
  },
});

// ── Minimal page-transition fallback ─────────────────────────────────────────
const PageFallback = () => (
  <div className="min-h-screen bg-[#080808] flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 animate-pulse" />
      <div className="text-[10px] text-white/20 uppercase tracking-widest font-black">Loading...</div>
    </div>
  </div>
);

// ── Stealth double-ESC handler ────────────────────────────────────────────────
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
          document.querySelectorAll("video, audio").forEach((media: any) => {
            media.pause();
            media.muted = true;
          });
          document.title = "System Update | JARVIS Hub";
          navigate("/", { replace: true });
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

// ── Remote control listener ───────────────────────────────────────────────────
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
        window.dispatchEvent(new CustomEvent("jarvis-remote-cmd", { detail: { cmd, data } }));
        break;
      default:
        console.log("Unknown remote command:", cmd);
    }
  };

  return null;
};

// ── Protected route wrapper ───────────────────────────────────────────────────
const ProtectedLayout = () => {
  const { user } = useAuth();
  const { isMaintenanceMode } = useAdmin();
  if (!user) return <Navigate to="/auth" replace />;
  if (isMaintenanceMode && !user.isAdmin && !user.canBypassMaintenance) return <Maintenance />;
  return <Outlet />;
};

// ── App ───────────────────────────────────────────────────────────────────────
const App = () => (
  <QueryClientProvider client={queryClient}>
    <AdminProvider>
      <AuthProvider>
        <TutorialProvider>
          <TooltipProvider>
            <BrowserRouter>
              <div className="relative min-h-screen">
                {/* Lightweight static background — no animated gradients */}
                <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(37,99,235,0.04),transparent_50%)] pointer-events-none -z-10" />

                <StealthManager />
                <RemoteListener />

                {/* Heavy UI components lazy loaded */}
                <Suspense fallback={null}>
                  <CommandPalette />
                  <JarvisTutorial />
                  <JarvisOrb />
                  <VerificationBanner />
                </Suspense>

                <Toaster />
                <Sonner />

                <Suspense fallback={<PageFallback />}>
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
                      <Route path="/downloads" element={<Downloads />} />
                      <Route path="/news" element={<News />} />
                      <Route path="/admin" element={<Admin />} />
                      <Route path="/hub/watch/:id" element={<WatchHub />} />
                      <Route path="/watch/adult/:id" element={<WatchHub />} />

                      {/* Adult Zone */}
                      <Route path="/adult" element={<Navigate to="/adult/catalog" replace />} />
                      <Route path="/adult/catalog" element={<AdultCatalog />} />
                      <Route path="/adult/eastern" element={<EasternPremium />} />
                      <Route path="/adult/ai" element={<AdultAIGenerator />} />
                      <Route path="/adult/companion" element={<AdultAICompanion />} />
                      <Route path="/adult/vr" element={<AdultVR />} />
                      <Route path="/adult/live" element={<AdultLiveCams />} />
                    </Route>

                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </div>
            </BrowserRouter>
          </TooltipProvider>
        </TutorialProvider>
      </AuthProvider>
    </AdminProvider>
  </QueryClientProvider>
);

export default App;
