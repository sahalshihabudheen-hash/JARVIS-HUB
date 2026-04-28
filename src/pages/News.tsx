import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { cn } from "@/lib/utils";
import {
  Newspaper,
  Tv,
  Globe,
  Clapperboard,
  Film,
  MapPin,
  ExternalLink,
  RefreshCw,
  Clock,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

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
function NewsCard({ article, featured = false }: { article: Article; featured?: boolean }) {
  const [imgErr, setImgErr] = useState(false);

  return (
    <a
      href={article.link}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "group flex flex-col rounded-2xl overflow-hidden border border-white/5 bg-card transition-all duration-300",
        "hover:border-blue-500/30 hover:shadow-[0_8px_32px_rgba(37,99,235,0.15)] hover:-translate-y-1",
        featured && "md:flex-row md:h-64"
      )}
    >
      {/* Thumbnail */}
      <div
        className={cn(
          "relative overflow-hidden bg-white/5 shrink-0",
          featured ? "md:w-96 h-48 md:h-full" : "aspect-video"
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
            <Clapperboard className="w-12 h-12 text-white/10" />
          </div>
        )}
        {/* Source badge */}
        <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-sm text-[9px] font-black uppercase tracking-widest text-white/70 border border-white/10">
          {article.source}
        </div>
      </div>

      {/* Content */}
      <div className={cn("flex flex-col justify-between p-4 gap-3", featured && "md:p-6")}>
        <div>
          <h3
            className={cn(
              "font-display font-bold text-white group-hover:text-blue-400 transition-colors leading-snug",
              featured ? "text-xl md:text-2xl" : "text-sm line-clamp-3"
            )}
          >
            {article.title}
          </h3>
          {article.description && (
            <p className="text-white/40 text-xs mt-2 line-clamp-2 leading-relaxed">
              {article.description}
            </p>
          )}
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-white/25 text-[10px] font-bold">
            <Clock className="w-3 h-3" />
            <span>{timeAgo(article.pubDate)}</span>
          </div>
          <div className="flex items-center gap-1 text-blue-400/60 text-[10px] font-bold group-hover:text-blue-400 transition-colors">
            <span>Read more</span>
            <ExternalLink className="w-3 h-3" />
          </div>
        </div>
      </div>
    </a>
  );
}

// ── Category tabs ────────────────────────────────────────────────────
const TABS = [
  { id: "all",        label: "All News",   icon: Newspaper },
  { id: "ott",        label: "OTT",        icon: Tv },
  { id: "regional",   label: "Regional",   icon: MapPin },
  { id: "bollywood",  label: "Bollywood",  icon: Film },
  { id: "hollywood",  label: "Hollywood",  icon: Globe },
];

// ── Main Page ────────────────────────────────────────────────────────
const News = () => {
  const [category, setCategory] = useState("all");
  const [page, setPage] = useState(1);

  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ["news", category, page],
    queryFn: async () => {
      const res = await fetch(`/api/news?category=${category}&page=${page}`);
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    staleTime: 1000 * 60 * 10, // 10 min
  });

  const articles: Article[] = data?.articles || [];
  const featured = articles[0];
  const rest = articles.slice(1);
  const totalPages = Math.ceil((data?.total || 0) / (data?.perPage || 20));

  const handleTab = (id: string) => {
    setCategory(id);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="container max-w-7xl">

          {/* ── Header ── */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-500/20 rounded-2xl shadow-[0_0_20px_rgba(37,99,235,0.2)]">
                <Newspaper className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-display font-bold">Entertainment News</h1>
                <p className="text-[11px] font-bold text-white/30 uppercase tracking-widest mt-0.5">
                  OTT releases · Regional cinema · Streaming updates
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isFetching}
              className="rounded-full border-white/10 bg-white/5 text-white/50 hover:bg-white/10 self-start md:self-auto"
            >
              <RefreshCw className={cn("w-4 h-4 mr-2", isFetching && "animate-spin")} />
              Refresh
            </Button>
          </div>

          {/* ── Category Tabs ── */}
          <div className="flex flex-wrap gap-2 mb-10">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTab(tab.id)}
                  className={cn(
                    "flex items-center gap-2 px-5 h-10 rounded-full text-xs font-bold uppercase tracking-wider border transition-all duration-200",
                    category === tab.id
                      ? "bg-blue-600 border-transparent text-white shadow-[0_0_20px_rgba(37,99,235,0.4)]"
                      : "bg-white/5 border-white/8 text-white/40 hover:bg-white/10 hover:text-white"
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* ── Loading ── */}
          {isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="rounded-2xl overflow-hidden">
                  <div className="aspect-video shimmer bg-white/5" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 w-full bg-white/5 rounded shimmer" />
                    <div className="h-3 w-3/4 bg-white/5 rounded shimmer" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── Error ── */}
          {error && !isLoading && (
            <div className="text-center py-24 bg-white/5 rounded-3xl border border-white/10">
              <Newspaper className="w-12 h-12 text-white/10 mx-auto mb-4" />
              <h2 className="text-lg font-bold text-white/40">Could not load news</h2>
              <p className="text-white/20 text-sm mt-2">Check your internet connection or try again.</p>
              <Button onClick={() => refetch()} className="mt-6 bg-blue-600 rounded-full px-8">
                Retry
              </Button>
            </div>
          )}

          {/* ── Articles ── */}
          {!isLoading && !error && articles.length > 0 && (
            <>
              {/* Featured top article */}
              {featured && page === 1 && (
                <div className="mb-8">
                  <p className="text-[9px] font-black uppercase tracking-[0.25em] text-blue-400/50 mb-3">Top Story</p>
                  <NewsCard article={featured} featured />
                </div>
              )}

              {/* Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {(page === 1 ? rest : articles).map((article) => (
                  <NewsCard key={article.id} article={article} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-12">
                  <Button
                    variant="outline"
                    onClick={() => { setPage(p => p - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    disabled={page === 1}
                    className="rounded-full px-6 border-white/10"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" /> Previous
                  </Button>
                  <span className="text-sm font-bold text-white/40 bg-white/5 px-4 py-2 rounded-full border border-white/10">
                    {page} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => { setPage(p => p + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    disabled={page >= totalPages}
                    className="rounded-full px-6 border-white/10"
                  >
                    Next <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              )}
            </>
          )}

          {/* ── Empty ── */}
          {!isLoading && !error && articles.length === 0 && (
            <div className="text-center py-24 bg-white/5 rounded-3xl border border-white/10">
              <Newspaper className="w-12 h-12 text-white/10 mx-auto mb-4" />
              <p className="text-white/30 font-bold uppercase tracking-widest">No news found for this category</p>
            </div>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default News;
