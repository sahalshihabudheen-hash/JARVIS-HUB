import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import AdultCard from "@/components/AdultCard";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { searchVideos } from "@/lib/eporner";
import { Search } from "lucide-react";

const Adult = () => {
  const [query, setQuery] = useState("all");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = useQuery({
    queryKey: ["adult-videos", query, page],
    queryFn: () => searchVideos(query, page),
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setQuery(searchInput.trim());
      setPage(1);
    } else {
      setQuery("all");
      setPage(1);
    }
  };

  const categories = [
    { label: "All", value: "all" },
    { label: "Anal", value: "anal" },
    { label: "Amateur", value: "amateur" },
    { label: "BDSM", value: "bdsm" },
    { label: "Big Tits", value: "big tits" },
    { label: "Blowjob", value: "blowjob" },
    { label: "Cumshot", value: "cumshot" },
    { label: "Handjob", value: "handjob" },
    { label: "Hardcore", value: "hardcore" },
    { label: "Lesbian", value: "lesbian" },
    { label: "Milf", value: "milf" },
    { label: "Pornstar", value: "pornstar" },
    { label: "Solo", value: "solo" },
    { label: "Teen", value: "teen" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="container">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <h1 className="text-3xl md:text-4xl font-display font-bold">Adult Content</h1>
            
            <form onSubmit={handleSearch} className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search videos..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-10 bg-white/5 border-white/10 rounded-full"
              />
            </form>
          </div>

          {/* Categories */}
          <div className="flex flex-wrap gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((cat) => (
              <Button
                key={cat.value}
                variant={query === cat.value ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setQuery(cat.value);
                  setSearchInput("");
                  setPage(1);
                }}
                className="rounded-full whitespace-nowrap"
              >
                {cat.label}
              </Button>
            ))}
          </div>

          {/* Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="flex flex-col gap-3">
                  <div className="aspect-video rounded-xl shimmer" />
                  <div className="h-4 w-3/4 bg-white/5 rounded shimmer" />
                  <div className="h-3 w-1/2 bg-white/5 rounded shimmer" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <h2 className="text-xl font-medium text-red-400">Failed to load content</h2>
              <p className="text-muted-foreground mt-2">Please try again later.</p>
              <Button onClick={() => window.location.reload()} className="mt-4">
                Retry
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {data?.videos?.map((video) => (
                  <AdultCard key={video.id} video={video} />
                ))}
              </div>

              {/* Pagination */}
              {data && data.total_pages > 1 && (
                <div className="flex justify-center items-center gap-6 mt-12">
                  <Button
                    variant="outline"
                    disabled={page === 1}
                    onClick={() => {
                      setPage(p => p - 1);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="rounded-full"
                  >
                    Previous
                  </Button>
                  <span className="text-muted-foreground text-sm font-medium">
                    Page {page} of {data.total_pages}
                  </span>
                  <Button
                    variant="outline"
                    disabled={page >= data.total_pages}
                    onClick={() => {
                      setPage(p => p + 1);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="rounded-full"
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Adult;
