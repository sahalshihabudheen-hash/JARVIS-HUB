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
import NotFound from "./pages/NotFound";
import { AuthProvider } from "./context/AuthContext";
import { TutorialProvider } from "./context/TutorialContext";
import { AdminProvider } from "./context/AdminContext";
import JarvisTutorial from "./components/JarvisTutorial";
import Admin from "./pages/Admin";
import Maintenance from "./components/Maintenance";
import { useAdmin } from "./context/AdminContext";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
    },
  },
});

import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

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
              <JarvisTutorial />
              <Toaster />
              <Sonner />
              <Routes>
                <Route path="/auth" element={<Auth />} />
              
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
                <Route path="/admin" element={<Admin />} />
              </Route>
  
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </TutorialProvider>
    </AuthProvider>
    </AdminProvider>
  </QueryClientProvider>
);

export default App;
