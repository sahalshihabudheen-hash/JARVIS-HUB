import { useState, useEffect } from "react";
import { setupProgressListener } from "@/lib/vidlink";
import { videoServers, getDefaultServer, setDefaultServer } from "@/lib/servers";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

interface VideoPlayerProps {
  type: "movie" | "tv";
  tmdbId: number;
  season?: number;
  episode?: number;
}

const VideoPlayer = ({ type, tmdbId, season, episode }: VideoPlayerProps) => {
  const [currentServer, setCurrentServer] = useState(getDefaultServer());

  useEffect(() => {
    setupProgressListener();
  }, []);

  const handleServerChange = (serverId: string) => {
    setCurrentServer(serverId);
    setDefaultServer(serverId);
  };

  const server = videoServers.find((s) => s.id === currentServer) || videoServers[0];
  const embedUrl =
    type === "movie"
      ? server.getMovieUrl(tmdbId)
      : server.getTVUrl(tmdbId, season || 1, episode || 1);

  return (
    <div className="space-y-6">
      {/* Control Panel (Top) */}
      <div className="glass border border-white/10 p-4 rounded-2xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Source Selection
            </h3>
            <p className="text-xs text-muted-foreground">
              If "Content Not Found" appears, please click **Mirror 1** or **Mirror 2**.
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {videoServers.map((s) => (
              <Button
                key={s.id}
                variant={s.id === currentServer ? "default" : "outline"}
                size="sm"
                onClick={() => handleServerChange(s.id)}
                className={cn(
                  "rounded-full px-4 transition-all duration-300",
                  s.id === currentServer ? "hover-glow shadow-[0_0_15px_rgba(34,211,238,0.4)]" : "hover:bg-white/5"
                )}
              >
                {s.name}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Video Player Container */}
      <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/5">
        <iframe
          key={`${currentServer}-${tmdbId}-${season}-${episode}`}
          src={embedUrl}
          className="absolute inset-0 w-full h-full"
          allowFullScreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        />
      </div>

      <div className="pt-2">
        <p className="text-[10px] text-muted-foreground uppercase tracking-widest text-center opacity-50">
          Note: All content is provided by non-affiliated third-party servers.
        </p>
      </div>
    </div>
  );
};

export default VideoPlayer;
