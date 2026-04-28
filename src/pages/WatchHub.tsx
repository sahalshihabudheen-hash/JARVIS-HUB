import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Flame, Eye, Star, User, Tag } from "lucide-react";
import { getEmbedUrl } from "@/lib/pornhub";
import { useAuth } from "@/context/AuthContext";
import { addToAdultHistory } from "@/lib/adult-history";

interface VideoDetails {
  title: string;
  pornstars: string[];
  tags: string[];
  views: number | string;
  rating: string | number;
  thumbnail?: string;
  duration?: string;
}

const WatchHub = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [details, setDetails] = useState<VideoDetails | null>(null);
  const [searchParams] = useSearchParams();
  const source = searchParams.get("source") || "pornhub";

  useEffect(() => {
    const isOwner = user?.email?.toLowerCase() === "admin@gmail.com";
    if (!user || (!user.hasAdultAccess && !user.isAdmin && !isOwner)) {
      navigate("/");
    }
  }, [user, navigate]);

  useEffect(() => {
    if (id) {
      fetch(`/api/video?id=${id}&source=${source}`)
        .then(res => res.json())
        .then(data => {
          if (data.video) {
            setDetails(data.video);
            
            // Add to adult history
            addToAdultHistory({
              id: id,
              title: data.video.title || `Content #${id}`,
              thumbnail: data.video.default_thumb || "",
              duration: data.video.duration || ""
            });
          }
        })
        .catch(err => console.error("Failed to fetch video details:", err));
    }
  }, [id, source]);

  if (!id) return null;

  let embedUrl = "";
  if (source === "pornhub") {
    embedUrl = `https://www.pornhub.com/embed/${id}`;
  } else if (source === "redtube") {
    embedUrl = `https://embed.redtube.com/?id=${id}`;
  } else if (source === "eporner") {
    embedUrl = `https://www.eporner.com/embed/${id}/`;
  }

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
            <div className="w-full aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl border border-white/5 relative">
              <iframe
                src={embedUrl}
                className="absolute inset-0 w-full h-full border-0"
                allowFullScreen
                scrolling="no"
                allow="autoplay; encrypted-media"
              />
            </div>

            {/* Video Info */}
            <div className="bg-card p-8 rounded-3xl border border-white/10 shadow-xl">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-blue-500/20 rounded-lg">
                    <Flame className="w-4 h-4 text-blue-500" />
                  </div>
                  <span className="text-xs font-bold text-blue-500 uppercase tracking-widest">Premium Content</span>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                    <Eye className="w-4 h-4 text-white/40" />
                    <span className="text-sm font-bold text-white/60">{details?.views || "Tracked"}</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20">
                    <Star className="w-4 h-4 text-blue-400" />
                    <span className="text-sm font-bold text-blue-400">{details?.rating ? `${details.rating}%` : "Top Rated"}</span>
                  </div>
                </div>
              </div>

              <h1 className="text-2xl md:text-3xl font-display font-bold text-white mb-4">
                {details?.title || `Playing Content #${id}`}
              </h1>

              {/* Pornstars Section */}
              {details?.pornstars && details.pornstars.length > 0 && (
                <div className="mt-8 pt-8 border-t border-white/5">
                  <h3 className="text-sm font-bold text-white/40 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Featured Performers
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {details.pornstars.map((star) => (
                      <Button
                        key={star}
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/adult?search=${encodeURIComponent(star)}`)}
                        className="rounded-full bg-white/5 border-white/10 hover:bg-blue-500/20 hover:border-blue-500/50 hover:text-blue-400 transition-all text-xs font-bold px-4"
                      >
                        {star}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Tags Section */}
              {details?.tags && details.tags.length > 0 && (
                <div className="mt-8 pt-8 border-t border-white/5">
                  <h3 className="text-sm font-bold text-white/40 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Tag className="w-4 h-4" />
                    Categories & Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {details.tags.map((tag) => (
                      <Button
                        key={tag}
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/adult?search=${encodeURIComponent(tag)}`)}
                        className="rounded-full bg-white/5 text-white/40 hover:text-white hover:bg-white/10 text-[10px] font-bold uppercase tracking-wider h-7 px-3"
                      >
                        {tag}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-8 pt-6 border-t border-white/5 text-muted-foreground text-sm leading-relaxed">
                <p>
                  You are watching premium adult entertainment powered by JARVIS HUB. 
                  Enjoy a seamless viewing experience directly on your device.
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
