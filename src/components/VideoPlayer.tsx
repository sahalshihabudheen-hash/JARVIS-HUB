import { useState, useEffect } from "react";
import { setupProgressListener } from "@/lib/vidlink";
import { ShieldAlert, Play } from "lucide-react";
import { videoServers, getDefaultServer, setDefaultServer } from "@/lib/servers";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

import { TutorialPointer } from "./JarvisTutorial";
import { useTutorial } from "@/context/TutorialContext";

interface VideoPlayerProps {
  type: "movie" | "tv";
  tmdbId: number;
  season?: number;
  episode?: number;
}

const VideoPlayer = ({ type, tmdbId, season, episode }: VideoPlayerProps) => {
  const { isActive, step, nextStep } = useTutorial();
  const [currentServer, setCurrentServer] = useState(getDefaultServer());
  const [showOverlay, setShowOverlay] = useState(true);
  const [shieldActive, setShieldActive] = useState(false);

  useEffect(() => {
    setupProgressListener();
  }, []);

  const handleServerChange = (serverId: string) => {
    setCurrentServer(serverId);
    setDefaultServer(serverId);
    setShowOverlay(true);
    setShieldActive(false);
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
          
          <div className="flex flex-wrap gap-2 relative">
            <TutorialPointer 
              activeStep={4}
              onAction={nextStep}
              title="Protocol 3: Bandwidth Optimization"
              description="If a primary stream loop fails, switch to an alternative Mirror node to restore bandwidth."
              className="bottom-full left-1/2 -translate-x-1/2 mb-2"
            />
            {videoServers.map((s) => (
              <Button
                key={s.id}
                variant={s.id === currentServer ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  handleServerChange(s.id);
                  if (isActive && step === 4) nextStep();
                }}
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
      <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/5 group">
        <iframe
          key={`${currentServer}-${tmdbId}-${season}-${episode}`}
          src={embedUrl}
          className="absolute inset-0 w-full h-full"
          allowFullScreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        />

        {/* Ad-Block Overlay Shield (Initial) */}
        {showOverlay && (
          <div 
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 cursor-pointer group-hover:bg-black/60 transition-colors"
            onClick={() => {
              setShowOverlay(false);
              setShieldActive(true); // Automatically engage shield after first click
              if (isActive && step === 3) nextStep();
            }}
          >
            <TutorialPointer 
              activeStep={3}
              onAction={nextStep}
              title="Protocol 2: Secure Start"
              description="Player APIs are often unstable. My initializer will neutralize pop-up scripts before launch."
              className="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            />
            <div className="text-center animate-pulse-glow">
              <div className="w-20 h-20 rounded-full border-2 border-primary/50 flex items-center justify-center mb-4 mx-auto shadow-[0_0_30px_rgba(34,211,238,0.4)]">
                <div className="w-16 h-16 rounded-full border border-primary flex items-center justify-center bg-primary/5">
                  <Play className="w-8 h-8 text-primary fill-primary ml-1" />
                </div>
              </div>
              <p className="text-primary font-display font-semibold tracking-widest text-sm uppercase">
                Initialize Secure Stream
              </p>
            </div>
          </div>
        )}

        {/* Persistent Stealth Shield (Manual) */}
        {shieldActive && !showOverlay && (
          <div 
            className="absolute inset-0 z-40 bg-transparent cursor-default"
            title="Stealth Shield Active - No clicks allowed"
          />
        )}
      </div>

      {/* Shield Controls */}
      <div className="flex justify-center relative">
        <TutorialPointer 
          activeStep={5}
          onAction={nextStep}
          title="Protocol 4: Stealth Shield"
          description="Maintain 'Locked' status for maximum ad-interception. Toggle only when manual player control is required."
          className="bottom-full left-1/2 -translate-x-1/2 mb-4"
        />
        <Button
          variant={shieldActive ? "default" : "outline"}
          size="sm"
          onClick={() => {
            setShieldActive(!shieldActive);
            if (isActive && step === 5) nextStep();
          }}
          className={cn(
            "rounded-full px-6 transition-all duration-500",
            shieldActive ? "bg-red-500/20 text-red-400 border-red-500/50 hover:bg-red-500/30" : "bg-primary/10 text-primary border-primary/20"
          )}
        >
          {shieldActive ? (
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
              LOCK ENGAGED (No Ads Possible)
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
              ENGAGE STEALTH SHIELD
            </span>
          )}
        </Button>
      </div>

      <div className="pt-2 flex flex-col items-center gap-4">
        <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 max-w-2xl text-center">
          <ShieldAlert className="w-5 h-5 shrink-0" />
          <p className="text-xs font-medium leading-relaxed">
            <span className="font-bold">Protocol:</span> Use the <span className="text-white italic">Stealth Shield</span> to block all ad popups while watching. Unlock to pause.
          </p>
        </div>
        
        <div className="flex flex-col items-center gap-2 opacity-60">
          <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-semibold">
            Operational Optimization Tips:
          </p>
          <div className="flex gap-4 text-[9px] text-muted-foreground uppercase tracking-widest">
            <span className="flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-cyan-400" /> Use Brave Browser</span>
            <span className="flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-cyan-400" /> Install uBlock Origin</span>
            <span className="flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-cyan-400" /> Switch Mirrors if needed</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
