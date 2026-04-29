import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  Flame,
  Eye,
  Star,
  User,
  Tag,
  Play,
  Search,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { addToAdultHistory } from "@/lib/adult-history";
import { searchVideos } from "@/lib/hub";
import AdultCard from "@/components/AdultCard";

interface VideoDetails {
  title: string;
  pornstars: string[];
  tags: string[];
  views: number | string;
  rating: string | number;
  thumbnail?: string;
  default_thumb?: string;
  duration?: string;
}

/* ── Actress Avatar Card ───────────────────────────────────────────── */
function ActressCard({
  name,
  thumb,
  onSearch,
}: {
  name: string;
  thumb: string;
  onSearch: (name: string) => void;
}) {
  return (
    <button
      onClick={() => onSearch(name)}
      className="group flex flex-col items-center gap-3 transition-all duration-300 hover:-translate-y-1"
    >
      <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-2 border-white/10 group-hover:border-pink-500/60 transition-all duration-300 shadow-xl shadow-black/60">
        <img
          src={`/api/image?url=${encodeURIComponent(thumb)}`}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = "none";
          }}
        />
        {/* Play-on-hover overlay */}
        <div className="absolute inset-0 bg-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Search className="w-5 h-5 text-white drop-shadow" />
        </div>
      </div>
      <span className="text-[11px] font-bold text-white/70 group-hover:text-pink-400 transition-colors text-center line-clamp-1 max-w-[80px]">
        {name}
      </span>
    </button>
  );
}

/* ── Main Component ────────────────────────────────────────────────── */
const WatchHub = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [details, setDetails] = useState<VideoDetails | null>(null);
  const [relatedVideos, setRelatedVideos] = useState<any[]>([]);
  const [relatedLoading, setRelatedLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const source = searchParams.get("source") || "pornhub";
  const hasFetchedRelated = useRef(false);

  useEffect(() => {
    const isOwner = user?.email?.toLowerCase() === "admin@gmail.com";
    if (!user || (!user.hasAdultAccess && !user.isAdmin && !isOwner)) {
      navigate("/");
    }
  }, [user, navigate]);

  /* Fetch video details */
  useEffect(() => {
    if (!id) return;
    hasFetchedRelated.current = false;

    fetch(`/api/video?id=${id}&source=${source}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.video) {
          setDetails(data.video);

          addToAdultHistory({
            id: id,
            title: data.video.title || `Content #${id}`,
            thumbnail: data.video.default_thumb || data.video.thumbnail || "",
            duration: data.video.duration || "",
            source: source,
          }, user?.uid);
        }
      })
      .catch((err) => console.error("Failed to fetch video details:", err));
  }, [id, source]);

  /* Fetch related videos once details arrive */
  useEffect(() => {
    if (!details || hasFetchedRelated.current) return;
    hasFetchedRelated.current = true;

    const keyword =
      details.pornstars?.[0] ||
      details.tags?.[0] ||
      "popular";

    setRelatedLoading(true);
    searchVideos(keyword, 1, source)
      .then((data) => {
        const all = (data?.videos || [])
          .filter((v: any) => v.video_id !== id)
          .slice(0, 8)
          .map((v: any) => ({
            id: v.video_id,
            title: v.title,
            url: v.url,
            thumbnail: v.default_thumb,
            duration: v.duration,
            views: typeof v.views === "number" ? v.views.toLocaleString() : v.views,
            rating: v.rating,
            source,
          }));
        setRelatedVideos(all);
      })
      .catch(console.error)
      .finally(() => setRelatedLoading(false));
  }, [details, id, source]);

  if (!id) return null;

  let embedUrl = "";
  if (source === "pornhub") embedUrl = `https://www.pornhub.com/embed/${id}`;
  else if (source === "redtube") embedUrl = `https://embed.redtube.com/?id=${id}`;
  else if (source === "eporner") embedUrl = `https://www.eporner.com/embed/${id}/`;

  const videoThumb =
    details?.default_thumb || details?.thumbnail || "";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="container max-w-7xl">
          <Button
            variant="ghost"
            className="mb-6 hover:bg-white/5 -ml-4"
            onClick={() => navigate(-1)}
          >
            <ChevronLeft className="w-5 h-5 mr-2" />
            Back to Catalog
          </Button>

          <div className="flex flex-col gap-8">
            {/* ── Player ── */}
            <div className="w-full aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl border border-white/5 relative">
              <iframe
                src={embedUrl}
                className="absolute inset-0 w-full h-full border-0"
                allowFullScreen
                scrolling="no"
                allow="autoplay; encrypted-media; picture-in-picture"
                sandbox="allow-forms allow-scripts allow-pointer-lock allow-same-origin allow-presentation allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation"
              />
            </div>

            {/* ── Player Navigation Tip ── */}
            <div className="bg-blue-600/10 border border-blue-500/20 p-4 rounded-2xl flex items-start gap-3 shadow-lg shadow-blue-600/5">
              <div className="p-1.5 bg-blue-600 rounded-lg shrink-0">
                <ExternalLink className="w-4 h-4 text-white" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-white uppercase tracking-wider">Stay on JARVIS Hub</p>
                <p className="text-xs text-white/50 leading-relaxed">
                  The thumbnails <span className="text-blue-400 font-bold">inside</span> the player are external ads. To watch more and stay on our site, please use the <span className="text-blue-400 font-bold">Related Videos</span> catalog below.
                </p>
                </div>
              </div>
            </div>

            {/* ── Related Videos Section ── */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-500/20 rounded-xl shadow-[0_0_15px_rgba(37,99,235,0.15)]">
                  <Flame className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <h2 className="text-2xl font-display font-bold text-white">
                    Up Next
                  </h2>
                  <p className="text-[10px] font-bold text-blue-400/50 uppercase tracking-widest mt-0.5">
                    More from JARVIS Catalog
                  </p>
                </div>
              </div>

              {relatedLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="flex flex-col gap-3">
                      <div className="aspect-video rounded-xl shimmer bg-white/5" />
                      <div className="h-4 w-3/4 bg-white/5 rounded shimmer" />
                      <div className="h-3 w-1/2 bg-white/5 rounded shimmer" />
                    </div>
                  ))}
                </div>
              ) : relatedVideos.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {relatedVideos.map((video) => (
                    <AdultCard key={video.id} video={video} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-white/5 rounded-3xl border border-white/10">
                  <Play className="w-10 h-10 text-white/10 mx-auto mb-3" />
                  <p className="text-white/30 text-sm font-bold uppercase tracking-widest">
                    No related videos found
                  </p>
                </div>
              )}
            </div>

            {/* ── Video Info Card ── */}
            <div className="bg-card p-8 rounded-3xl border border-white/10 shadow-xl mb-8">
              {/* Header row */}
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-blue-500/20 rounded-lg">
                    <Flame className="w-4 h-4 text-blue-500" />
                  </div>
                  <span className="text-xs font-bold text-blue-500 uppercase tracking-widest">
                    Premium Content
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                    <Eye className="w-4 h-4 text-white/40" />
                    <span className="text-sm font-bold text-white/60">
                      {details?.views || "Tracked"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20">
                    <Star className="w-4 h-4 text-blue-400" />
                    <span className="text-sm font-bold text-blue-400">
                      {details?.rating ? `${details.rating}%` : "Top Rated"}
                    </span>
                  </div>
                </div>
              </div>

              <h1 className="text-2xl md:text-3xl font-display font-bold text-white mb-4">
                {details?.title || `Playing Content #${id}`}
              </h1>

              {/* Tags Section */}
              {details?.tags && details.tags.length > 0 && (
                <div className="mt-6 pt-6 border-t border-white/5">
                  <h3 className="text-sm font-bold text-white/40 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Tag className="w-4 h-4" />
                    Categories &amp; Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {details.tags.map((tag) => (
                      <Button
                        key={tag}
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          navigate(`/adult?search=${encodeURIComponent(tag)}`)
                        }
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
                  You are watching premium adult entertainment powered by JARVIS
                  HUB. Enjoy a seamless viewing experience directly on your
                  device. Please ensure you are over 18 years of age.
                </p>
              </div>
            </div>

            {/* ── Actress Cards Section ── */}
            {details?.pornstars && details.pornstars.length > 0 && (
              <div className="bg-card rounded-3xl border border-white/10 shadow-xl overflow-hidden">
                {/* Section header */}
                <div className="px-8 pt-8 pb-6 border-b border-white/5 flex items-center gap-3">
                  <div className="p-2 bg-pink-500/20 rounded-xl shadow-[0_0_15px_rgba(236,72,153,0.2)]">
                    <User className="w-5 h-5 text-pink-500" />
                  </div>
                  <div>
                    <h2 className="text-xl font-display font-bold text-white">
                      Featured Actresses
                    </h2>
                    <p className="text-[10px] font-bold text-pink-400/50 uppercase tracking-widest mt-0.5">
                      {details.pornstars.length} performer
                      {details.pornstars.length !== 1 ? "s" : ""} in this video
                    </p>
                  </div>
                </div>

                <div className="p-8">
                  <div className="flex flex-wrap gap-6 md:gap-8">
                    {details.pornstars.map((name) => (
                      <ActressCard
                        key={name}
                        name={name}
                        thumb={videoThumb}
                        onSearch={(n) =>
                          navigate(`/adult?search=${encodeURIComponent(n)}`)
                        }
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default WatchHub;
