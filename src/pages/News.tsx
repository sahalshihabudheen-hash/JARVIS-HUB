import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { cn } from "@/lib/utils";
import {
  Newspaper,
  Tv,
  ExternalLink,
  RefreshCw,
  Clock,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// ── Types ───────────────────────────────────────────────────────────
interface Article {
  id: string;
  title: string;
  description: string;
  image: string;
  link: string;
  source: string;
  region: string;
  pubDate: string;
}

// ── Helpers ─────────────────────────────────────────────────────────
function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function proxyImg(url: string) {
  if (!url) return "";
  return `/api/image?url=${encodeURIComponent(url)}`;
}

// ── News Card ────────────────────────────────────────────────────────
function NewsCard({ 
  article, 
  featured = false, 
  onOpen 
}: { 
  article: Article; 
  featured?: boolean;
  onOpen: (a: Article) => void;
}) {
  const [imgErr, setImgErr] = useState(false);

  return (
    <div
      onClick={() => onOpen(article)}
      className={cn(
        "group flex flex-col rounded-2xl overflow-hidden border border-white/5 bg-card transition-all duration-300 cursor-pointer",
        "hover:border-blue-500/30 hover:shadow-[0_8px_32px_rgba(37,99,235,0.15)] hover:-translate-y-1",
        featured && "md:flex-row md:h-72"
      )}
    >
      {/* Thumbnail */}
      <div
        className={cn(
          "relative overflow-hidden bg-white/5 shrink-0",
          featured ? "md:w-[450px] h-48 md:h-full" : "aspect-video"
        )}
      >
        {article.image && !imgErr ? (
          <img
            src={proxyImg(article.image)}
            alt={article.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={() => setImgErr(true)}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500/10 to-purple-500/10">
            <Newspaper className="w-12 h-12 text-white/10" />
          </div>
        )}
        {/* Source badge */}
        <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-sm text-[9px] font-black uppercase tracking-widest text-white/70 border border-white/10">
          {article.source}
        </div>
      </div>

      {/* Content */}
      <div className={cn("flex flex-col justify-between p-4 gap-3", featured && "md:p-8")}>
        <div className="space-y-3">
          <p className="text-[10px] font-black uppercase tracking-widest text-blue-400">OTT News Update</p>
          <h3
            className={cn(
              "font-display font-bold text-white group-hover:text-blue-400 transition-colors leading-tight",
              featured ? "text-xl md:text-3xl" : "text-sm line-clamp-3"
            )}
          >
            {article.title}
          </h3>
          {article.description && (
            <p className={cn(
              "text-white/40 text-xs leading-relaxed",
              featured ? "line-clamp-3" : "line-clamp-2"
            )}>
              {article.description}
            </p>
          )}
        </div>
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-1.5 text-white/25 text-[10px] font-bold">
            <Clock className="w-3 h-3" />
            <span>{timeAgo(article.pubDate)}</span>
          </div>
          <div className="flex items-center gap-1 text-blue-400 text-[10px] font-black uppercase tracking-widest group-hover:underline">
            <span>Read Summary</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────
const News = () => {
  const [page, setPage] = useState(1);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ["news", "ott", page],
    queryFn: async () => {
      const res = await fetch(`/api/news?category=ott&page=${page}`);
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    staleTime: 1000 * 60 * 10, // 10 min
  });

  const articles: Article[] = data?.articles || [];
  const featured = articles[0];
  const rest = articles.slice(1);
  const totalPages = Math.ceil((data?.total || 0) / (data?.perPage || 20));

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="container max-w-7xl">

          {/* ── Header ── */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-600 rounded-2xl shadow-[0_0_30px_rgba(37,99,235,0.4)]">
                <Tv className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-5xl font-display font-bold tracking-tight">OTT Spotlight</h1>
                <p className="text-xs font-bold text-white/30 uppercase tracking-[0.2em] mt-1">
                  Exclusive Streaming Releases · Netflix · Prime · Disney+
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isFetching}
              className="rounded-full border-white/10 bg-white/5 text-white/50 hover:bg-white/10 h-10 px-6"
            >
              <RefreshCw className={cn("w-4 h-4 mr-2", isFetching && "animate-spin")} />
              Refresh Feed
            </Button>
          </div>

          {/* ── Loading ── */}
          {isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="rounded-2xl overflow-hidden bg-white/5 border border-white/5 p-4">
                  <div className="aspect-video shimmer bg-white/5 rounded-xl mb-4" />
                  <div className="space-y-3">
                    <div className="h-4 w-full bg-white/5 rounded shimmer" />
                    <div className="h-3 w-3/4 bg-white/5 rounded shimmer" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── Error ── */}
          {error && !isLoading && (
            <div className="text-center py-24 bg-white/5 rounded-3xl border border-white/10 max-w-2xl mx-auto">
              <Tv className="w-16 h-16 text-white/10 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-white">Trouble connecting to feed</h2>
              <p className="text-white/30 text-sm mt-2">We couldn't load the latest OTT news right now.</p>
              <Button onClick={() => refetch()} className="mt-8 bg-blue-600 rounded-full px-10 h-12 font-bold shadow-lg shadow-blue-600/20">
                Try Again
              </Button>
            </div>
          )}

          {/* ── Articles ── */}
          {!isLoading && !error && articles.length > 0 && (
            <>
              {/* Featured top article */}
              {featured && page === 1 && (
                <div className="mb-10">
                  <NewsCard article={featured} featured onOpen={setSelectedArticle} />
                </div>
              )}

              {/* Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {(page === 1 ? rest : articles).map((article) => (
                  <NewsCard key={article.id} article={article} onOpen={setSelectedArticle} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-16">
                  <Button
                    variant="outline"
                    onClick={() => { setPage(p => p - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    disabled={page === 1}
                    className="rounded-full px-8 h-12 border-white/10 hover:bg-white/5 transition-all"
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" /> Previous
                  </Button>
                  <span className="text-sm font-black text-white/40 bg-white/5 px-6 py-3 rounded-full border border-white/10">
                    {page} <span className="text-white/10 mx-1">/</span> {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => { setPage(p => p + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    disabled={page >= totalPages}
                    className="rounded-full px-8 h-12 border-white/10 hover:bg-white/5 transition-all"
                  >
                    Next <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              )}
            </>
          )}

          {/* ── Empty ── */}
          {!isLoading && !error && articles.length === 0 && (
            <div className="text-center py-24 bg-white/5 rounded-3xl border border-white/10">
              <Tv className="w-12 h-12 text-white/10 mx-auto mb-4" />
              <p className="text-white/30 font-bold uppercase tracking-widest text-sm">No OTT news available at this moment</p>
            </div>
          )}

        </div>
      </main>

      {/* ── News Reader Modal ────────────────────────────────────────── */}
      <Dialog open={!!selectedArticle} onOpenChange={() => setSelectedArticle(null)}>
        <DialogContent className="max-w-2xl bg-black/95 backdrop-blur-xl border-white/10 p-0 overflow-hidden rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)]">
          {selectedArticle && (
            <div className="flex flex-col">
              {/* Header Image */}
              <div className="relative aspect-video w-full">
                {selectedArticle.image ? (
                  <img 
                    src={proxyImg(selectedArticle.image)} 
                    alt={selectedArticle.title} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-blue-600/10 flex items-center justify-center">
                    <Tv className="w-20 h-20 text-white/5" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                <button 
                  onClick={() => setSelectedArticle(null)}
                  className="absolute top-4 right-4 p-2 rounded-full bg-black/50 text-white/70 hover:text-white backdrop-blur-md transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="absolute bottom-4 left-6">
                  <span className="px-3 py-1 rounded-full bg-blue-600 text-[10px] font-black uppercase tracking-widest text-white shadow-lg">
                    {selectedArticle.source}
                  </span>
                </div>
              </div>

              {/* Scrollable Content */}
              <div className="p-8 pb-10 space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-white/30 text-[11px] font-bold uppercase tracking-wider">
                    <Clock className="w-3 h-3" />
                    <span>Published {timeAgo(selectedArticle.pubDate)}</span>
                  </div>
                  <DialogTitle className="text-2xl md:text-3xl font-display font-bold leading-tight text-white">
                    {selectedArticle.title}
                  </DialogTitle>
                </div>

                <div className="space-y-6">
                  <p className="text-white/70 text-base leading-relaxed font-medium">
                    {selectedArticle.description}
                  </p>
                  
                  <div className="p-6 rounded-2xl bg-white/5 border border-white/5 space-y-4">
                    <p className="text-white/40 text-xs font-bold uppercase tracking-widest leading-relaxed">
                      This is a news summary provided by JARVIS Hub. To read the complete investigative report and all details, please visit the official source.
                    </p>
                    <a 
                      href={selectedArticle.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-blue-400 font-black text-xs uppercase tracking-widest hover:underline group"
                    >
                      Read full coverage on {selectedArticle.source}
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default News;
