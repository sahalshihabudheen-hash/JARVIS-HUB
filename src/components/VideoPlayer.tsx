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
    <div className="space-y-4">
      {/* Server Selector */}
      <div className="flex flex-wrap gap-2">
        <span className="text-sm text-muted-foreground self-center mr-2">Server:</span>
        {videoServers.map((s) => (
          <Button
            key={s.id}
            variant={s.id === currentServer ? "default" : "outline"}
            size="sm"
            onClick={() => handleServerChange(s.id)}
            className={cn(
              s.id === currentServer && "hover-glow"
            )}
          >
            {s.name}
          </Button>
        ))}
      </div>

      {/* Video Player */}
      <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-card">
        <iframe
          key={`${currentServer}-${tmdbId}-${season}-${episode}`}
          src={embedUrl}
          className="absolute inset-0 w-full h-full"
          allowFullScreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        />
      </div>
    </div>
  );
};

export default VideoPlayer;
