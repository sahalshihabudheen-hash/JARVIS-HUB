import { useParams, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Flame, Eye, Star } from "lucide-react";
import { getPornhubEmbedUrl } from "@/lib/pornhub";
import { useAuth } from "@/context/AuthContext";

const WatchAdult = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const isOwner = user?.email?.toLowerCase() === "admin@gmail.com";
    if (!user || (!user.hasAdultAccess && !user.isAdmin && !isOwner)) {
      navigate("/");
    }
  }, [user, navigate]);

  if (!id) return null;

  const embedUrl = getPornhubEmbedUrl(id);


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
            <div className="w-full aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl border border-white/5 relative group">
              <iframe
                src={embedUrl}
                className="w-full h-full"
                allowFullScreen
                frameBorder="0"
                scrolling="no"
              ></iframe>
            </div>

            {/* Video Info Overlay/Details */}
            <div className="bg-card p-8 rounded-3xl border border-white/10 shadow-xl">
              <div className="flex flex-col md:flex-row justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-1.5 bg-blue-500/20 rounded-lg">
                      <Flame className="w-4 h-4 text-blue-500" />
                    </div>
                    <span className="text-xs font-bold text-blue-500 uppercase tracking-widest">Premium Content</span>
                  </div>
                  <h1 className="text-2xl md:text-3xl font-display font-bold text-white mb-4">
                    Playing Content #{id}
                  </h1>
                </div>

                <div className="flex flex-wrap gap-4 items-start">
                  <div className="bg-white/5 px-4 py-2 rounded-2xl border border-white/10 flex items-center gap-2">
                    <Eye className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Views Tracked</span>
                  </div>
                  <div className="bg-white/5 px-4 py-2 rounded-2xl border border-white/10 flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-400" />
                    <span className="text-sm font-medium">Top Rated</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-white/5 text-muted-foreground text-sm leading-relaxed">
                <p>
                  You are watching premium adult entertainment powered by RedTube. 
                  Enjoy a seamless viewing experience directly on JARVIS HUB. 
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

export default WatchAdult;
