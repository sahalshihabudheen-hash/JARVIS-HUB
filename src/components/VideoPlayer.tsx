import { useState, useEffect, useRef } from "react";
import { setupProgressListener } from "@/lib/vidlink";
import { ShieldAlert, Play, RefreshCcw } from "lucide-react";
import { videoServers, getDefaultServer, setDefaultServer } from "@/lib/servers";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

import { useTutorial } from "@/context/TutorialContext";

interface VideoPlayerProps {
  type: "movie" | "tv";
  tmdbId: number;
  imdbId?: string;
  season?: number;
  episode?: number;
  lang?: string;
}

const VideoPlayer = ({ type, tmdbId, imdbId, season, episode, lang }: VideoPlayerProps) => {
  const { isActive, step, nextStep } = useTutorial();
  const [currentServer, setCurrentServer] = useState(getDefaultServer());
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(err => {
        console.error(`Error trying to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  const sendPlayerCommand = (command: string) => {
    if (!iframeRef.current?.contentWindow) return;
    const win = iframeRef.current.contentWindow;
    // Broadcast standard play/pause commands to the iframe
    win.postMessage(command, '*');
    win.postMessage({ type: command }, '*');
    win.postMessage({ cmd: command }, '*');
    win.postMessage({ event: 'command', func: command }, '*');
    win.postMessage(JSON.stringify({ event: 'command', func: command }), '*');
  };

  useEffect(() => {
    // For Malayalam content, prioritize Indian Mirror if no preference set
    if (lang === 'ml' && !localStorage.getItem("preferredServer")) {
       setCurrentServer("vidsrcin");
    }
  }, [lang]);
  const [showOverlay, setShowOverlay] = useState(true);
  const [shieldActive, setShieldActive] = useState(false);
  const [isAutoSearching, setIsAutoSearching] = useState(false);
  const [sandboxEnabled, setSandboxEnabled] = useState(false);

  // Auto-set Indian Mirror for Malayalam content
  useEffect(() => {
    if (lang === "ml" && currentServer === "superembed") {
      setCurrentServer("vidsrcin");
      toast.info("Malayalam stream detected — Prioritizing Indian Mirror.");
    }
  }, [lang]);

  // Block popup ads from embedded video servers
  useEffect(() => {
    setupProgressListener();
    
    const originalOpen = window.open;
    window.open = (url?: string | URL, target?: string, ...rest: any[]) => {
      const blockedDomains = [
        'sexytalk', 'adsterra', 'propellerads', 'popcash',
        'popads', 'casino', 'betting', 'adult', 'porn', 'xxx',
        'click.php', 'redirect', 'exoclick', 'trafficjunky'
      ];
      const urlStr = String(url || '');
      const isAdDomain = blockedDomains.some(d => urlStr.toLowerCase().includes(d));
      if (isAdDomain) {
        console.warn('[JARVIS AD SHIELD] Blocked popup:', urlStr);
        return null;
      }
      return originalOpen(url as any, target, ...rest);
    };
    return () => { window.open = originalOpen; };
  }, []);

  // Auto-Search Mode Logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAutoSearching && showOverlay) {
      interval = setInterval(() => {
        cycleMirror();
      }, 10000); // Try next source every 10s
    }
    return () => clearInterval(interval);
  }, [isAutoSearching, showOverlay, currentServer]);

  const handleServerChange = (serverId: string) => {
    setCurrentServer(serverId);
    setDefaultServer(serverId);
    setShowOverlay(true);
    setShieldActive(false);
  };

  const cycleMirror = () => {
    const currentIndex = videoServers.findIndex((s) => s.id === currentServer);
    const nextIndex = (currentIndex + 1) % videoServers.length;
    handleServerChange(videoServers[nextIndex].id);
    toast.success(`Scanning Mirror ${nextIndex + 1}: ${videoServers[nextIndex].name}`, {
      duration: 2000
    });
  };

  const server = videoServers.find((s) => s.id === currentServer) || videoServers[0];
  const embedUrl =
    type === "movie"
      ? server.getMovieUrl(tmdbId, imdbId, lang)
      : server.getTVUrl(tmdbId, season || 1, episode || 1, imdbId, lang);

  return (
    <div className="space-y-6">
      {/* Control Panel (Top) */}
      <div className="glass border border-white/10 p-4 rounded-2xl space-y-4">
          {/* Source Selection Feedback */}
          <div className="bg-black/40 border border-white/5 p-5 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 backdrop-blur-md mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_8px_#3b82f6]" />
                <h4 className="text-sm font-bold uppercase tracking-wider text-white/90">Signal Status: {videoServers.find(s => s.id === currentServer)?.name}</h4>
              </div>
              <p className="text-xs text-white/40 leading-relaxed max-w-md">
                If the content is blocked or missing, try switching to **INDIAN Mirror** (best for Malayalam content) or use the specialized launch button to bypass browser security protocols.
              </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              <Button 
                variant="outline"
                className="bg-transparent border-blue-500/30 hover:bg-blue-500/20 text-blue-400 font-bold h-11 px-6 rounded-xl flex items-center gap-2 group transition-all"
                onClick={() => window.open(embedUrl, '_blank')}
              >
                <div className="w-2 h-2 rounded-full bg-blue-500 group-hover:animate-ping" />
                LAUNCH EXTERNAL NODE
              </Button>

              <button 
                onClick={() => setIsAutoSearching(!isAutoSearching)}
                className={cn(
                  "flex items-center gap-3 px-6 h-11 rounded-xl font-bold text-xs uppercase tracking-[0.2em] transition-all duration-500 border relative overflow-hidden group",
                  isAutoSearching 
                    ? "bg-red-500/10 border-red-500/50 text-red-500" 
                    : "bg-cyan-500/10 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 hover:border-cyan-500/50"
                )}
              >
                {isAutoSearching ? (
                  <>
                    <RefreshCcw className="w-4 h-4 animate-spin" />
                    STOP AUTO-SEARCHING
                  </>
                ) : (
                  <>
                    <RefreshCcw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-700" />
                    STABILIZE SIGNAL (AUTO-SCAN)
                  </>
                )}
              </button>
            </div>
          </div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          <div className="flex flex-col gap-2 relative w-full xl:w-auto">
            <div className="flex flex-wrap gap-1.5 backdrop-blur-md bg-white/5 p-2 rounded-xl border border-white/5">
              {videoServers.slice(0, 8).map((s) => (
                <Button
                  key={s.id}
                  variant={s.id === currentServer ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    handleServerChange(s.id);
                    if (isActive && step === 4) nextStep();
                  }}
                  className={cn(
                    "rounded-md px-3 h-7 text-[10px] font-bold uppercase tracking-tight transition-all duration-300",
                    s.id === currentServer ? "bg-primary text-black hover-glow" : "hover:bg-white/5 border-white/10"
                  )}
                >
                  {s.name.split(' ')[0]}
                </Button>
              ))}
            </div>
            
            <div className="flex flex-wrap gap-1.5 opacity-60 hover:opacity-100 transition-opacity">
              {videoServers.slice(8).map((s) => (
                <Button
                  key={s.id}
                  variant={s.id === currentServer ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleServerChange(s.id)}
                  className={cn(
                    "rounded-md px-2 h-6 text-[9px] font-bold uppercase tracking-tight transition-all duration-300",
                    s.id === currentServer ? "bg-primary text-black" : "hover:bg-white/5 border-white/5"
                  )}
                >
                  {s.name.includes('.') ? s.name.split('.')[1] : s.name.split(' ')[0]}
                </Button>
              ))}
            </div>

            <Button
              onClick={() => setIsAutoSearching(!isAutoSearching)}
              variant="outline"
              size="sm"
              className={cn(
                "mt-2 w-full font-black uppercase text-[10px] tracking-widest h-9 transition-all duration-500",
                isAutoSearching 
                  ? "bg-red-500/20 border-red-500 text-red-500 hover:bg-red-500/30" 
                  : "bg-primary/20 border-primary/40 text-primary hover:bg-primary hover:text-black shadow-[0_0_20px_rgba(34,211,238,0.2)]"
              )}
            >
              <RefreshCcw className={cn("w-3.5 h-3.5 mr-2", isAutoSearching && "animate-spin")} />
              {isAutoSearching ? "STOP AUTO-SEARCHING" : "STABILIZE SIGNAL (AUTO-SCAN)"}
            </Button>
          </div>
        </div>
      </div>

      {/* Video Player Container */}
      <div 
        ref={containerRef}
        className="relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/5 group"
      >
        <iframe
          ref={iframeRef}
          key={`${currentServer}-${tmdbId}-${season}-${episode}-sandbox-${sandboxEnabled}`}
          src={embedUrl}
          className="absolute inset-0 w-full h-full"
          allowFullScreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          {...(sandboxEnabled ? { sandbox: "allow-same-origin allow-scripts allow-forms allow-presentation" } : {})}
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
        
        {/* Remote Control Panel Overlay (visible specifically when shield is active or hovered) */}
        {!showOverlay && (
          <div className={cn(
            "absolute bottom-4 right-4 z-50 flex items-center gap-3 px-4 py-2 rounded-xl bg-black/80 backdrop-blur-xl border border-white/10 transition-all duration-300 shadow-xl",
            shieldActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto"
          )}>
            <div className="text-[10px] text-white/50 uppercase tracking-wider font-semibold mr-2 hidden sm:block">
              {shieldActive ? "Shield Active" : "Shield Standby"}
            </div>
            <button
              onClick={toggleFullScreen}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors group/btn relative bg-white/5 border border-white/10 hover:border-white/30"
              title="Toggle Fullscreen"
            >
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"/></svg>
              <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover/btn:opacity-100 whitespace-nowrap">Fullscreen</span>
            </button>
          </div>
        )}
      </div>

      {/* Shield Controls */}
      <div className="flex flex-col sm:flex-row justify-center items-center gap-4 relative">

        <Button
          id="shield-toggle-btn"
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

        <Button
          variant={sandboxEnabled ? "default" : "outline"}
          size="sm"
          onClick={() => setSandboxEnabled(!sandboxEnabled)}
          className={cn(
            "rounded-full px-6 transition-all duration-500",
            sandboxEnabled ? "bg-green-500/20 text-green-400 border-green-500/50 hover:bg-green-500/30 shadow-[0_0_15px_rgba(34,197,94,0.2)]" : "bg-white/5 text-white/50 border-white/10 hover:text-white"
          )}
          title="Force block all popups (May cause some servers to show a 'Disable Sandbox' error)"
        >
          {sandboxEnabled ? (
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
              HARD ADBLOCK: ON
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
              HARD ADBLOCK: OFF
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
