import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Flame, Loader2, AlertCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const WatchHub = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  const [hlsUrl, setHlsUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const isOwner = user?.email?.toLowerCase() === "admin@gmail.com";
    if (!user || (!user.hasAdultAccess && !user.isAdmin && !isOwner)) {
      navigate("/");
    }
  }, [user, navigate]);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);

    // Call our server-side API to extract the video URL
    // This bypasses ISP blocks because Vercel fetches from the source, not the user's browser
    fetch(`/api/player?id=${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setError("Could not load this video. Please try another.");
        } else {
          setHlsUrl(data.hls || null);
          setStreamUrl(data.mp4High || data.mp4Low || null);
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Connection error. Please try again.");
        setLoading(false);
      });
  }, [id]);

  if (!id) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="container">
          <Button
            variant="ghost"
            className="mb-6 hover:bg-white/5 -ml-4"
            onClick={() => navigate(-1)}
          >
            <ChevronLeft className="w-5 h-5 mr-2" />
            Back to Catalog
          </Button>

          <div className="flex flex-col gap-8">
            {/* Player Container */}
            <div className="w-full aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl border border-white/5 relative flex items-center justify-center">
              {loading ? (
                <div className="flex flex-col items-center gap-4 text-white/50">
                  <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
                  <p className="text-sm font-medium">Loading secure stream...</p>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center gap-4 text-white/50 px-8 text-center">
                  <AlertCircle className="w-10 h-10 text-red-400" />
                  <p className="text-sm font-medium text-red-400">{error}</p>
                  <Button 
                    onClick={() => navigate(-1)} 
                    className="bg-blue-600 hover:bg-blue-500 rounded-full px-6 mt-2"
                  >
                    Go Back & Try Another
                  </Button>
                </div>
              ) : streamUrl || hlsUrl ? (
                <video
                  key={id}
                  controls
                  autoPlay
                  className="w-full h-full rounded-3xl"
                  src={streamUrl || undefined}
                  crossOrigin="anonymous"
                >
                  {hlsUrl && <source src={hlsUrl} type="application/x-mpegURL" />}
                  {streamUrl && <source src={streamUrl} type="video/mp4" />}
                  Your browser does not support the video tag.
                </video>
              ) : (
                <div className="flex flex-col items-center gap-4 text-white/50">
                  <AlertCircle className="w-10 h-10 text-yellow-400" />
                  <p className="text-sm">No stream available for this video.</p>
                </div>
              )}
            </div>

            {/* Video Info */}
            <div className="bg-card p-8 rounded-3xl border border-white/10 shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-1.5 bg-blue-500/20 rounded-lg">
                  <Flame className="w-4 h-4 text-blue-500" />
                </div>
                <span className="text-xs font-bold text-blue-500 uppercase tracking-widest">Premium Content</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-display font-bold text-white mb-4">
                Playing Content #{id}
              </h1>
              <div className="mt-6 pt-6 border-t border-white/5 text-muted-foreground text-sm leading-relaxed">
                <p>
                  Streaming securely through JARVIS HUB. 
                  Your connection is fully protected. 
                  Please ensure you are over 18 years of age.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default WatchHub;
