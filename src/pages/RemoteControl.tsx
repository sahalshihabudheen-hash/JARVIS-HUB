import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX, 
  Search,
  Power,
  Smartphone,
  Tv
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSearchParams } from "react-router-dom";
import { doc, onSnapshot, setDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";

const RemoteControl = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [command, setCommand] = useState<string>("");
  const [deviceConnected, setDeviceConnected] = useState(false);
  const [currentMedia, setCurrentMedia] = useState<any>(null);

  const sessionParam = searchParams.get("session");
  const remoteId = sessionParam ? `remote_${sessionParam}` : (user ? `remote_${user.uid}` : null);

  useEffect(() => {
    if (!remoteId) {
      navigate("/auth");
      return;
    }

    const remoteDoc = doc(db, "remotes", remoteId);
    const unsub = onSnapshot(remoteDoc, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setDeviceConnected(data.online || false);
        setCurrentMedia(data.nowPlaying || null);
      }
    });

    // Mark remote as online
    setDoc(remoteDoc, { online: true, lastSeen: Date.now() }, { merge: true });

    return () => {
      unsub();
      updateDoc(remoteDoc, { online: false });
    };
  }, [remoteId, navigate]);

  const sendCommand = async (cmd: string, data?: any) => {
    if (!remoteId) return;
    const remoteDoc = doc(db, "remotes", remoteId);
    await updateDoc(remoteDoc, {
      lastCommand: cmd,
      commandData: data || {},
      timestamp: Date.now()
    });
    toast.success(`Protocol ${cmd.toUpperCase()} Dispatched`);
  };

  if (!remoteId) return null;

  return (
    <div className="min-h-screen bg-[#020202] text-white p-6 flex flex-col items-center justify-center font-sans">
      {/* HUD Header */}
      <div className="w-full max-w-md flex items-center justify-between mb-12">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/20 rounded-xl border border-blue-500/30">
            <Smartphone className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h1 className="text-xs font-black uppercase tracking-[0.3em] text-white/40">Neural Link</h1>
            <p className="text-sm font-bold text-white">REMOTE NODE ACTIVE</p>
          </div>
        </div>
        <div className={cn(
          "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2",
          deviceConnected ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"
        )}>
          <div className={cn("w-1.5 h-1.5 rounded-full", deviceConnected ? "bg-green-500 animate-pulse" : "bg-red-500")} />
          {deviceConnected ? "Linked" : "Offline"}
        </div>
      </div>

      {/* Now Playing HUD */}
      <div className="w-full max-w-md aspect-video mb-12 rounded-3xl bg-white/[0.02] border border-white/5 flex flex-col items-center justify-center relative overflow-hidden group">
         <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
         {currentMedia ? (
           <>
             <Tv className="w-12 h-12 text-white/10 mb-4" />
             <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 mb-1">Broadcasting</p>
             <h2 className="text-xl font-display font-black text-center px-6 italic">{currentMedia.title}</h2>
           </>
         ) : (
           <p className="text-white/20 font-bold uppercase tracking-widest text-xs italic">Awaiting Media Sync...</p>
         )}
      </div>

      {/* Controls Grid */}
      <div className="w-full max-w-md grid grid-cols-3 gap-6 mb-12">
        <Button 
          variant="outline" 
          size="lg" 
          className="h-20 rounded-3xl border-white/10 bg-white/5 hover:bg-white/10"
          onClick={() => sendCommand("seek", { amount: -10 })}
        >
          <SkipBack className="w-6 h-6" />
        </Button>
        <Button 
          variant="outline" 
          size="lg" 
          className="h-20 rounded-3xl border-white/10 bg-white/5 hover:bg-white/10"
          onClick={() => sendCommand("toggle_play")}
        >
          <Play className="w-8 h-8 fill-current" />
        </Button>
        <Button 
          variant="outline" 
          size="lg" 
          className="h-20 rounded-3xl border-white/10 bg-white/5 hover:bg-white/10"
          onClick={() => sendCommand("seek", { amount: 10 })}
        >
          <SkipForward className="w-6 h-6" />
        </Button>

        <Button 
          variant="outline" 
          size="lg" 
          className="h-20 rounded-3xl border-white/10 bg-white/5 hover:bg-white/10"
          onClick={() => sendCommand("volume_down")}
        >
          <VolumeX className="w-6 h-6" />
        </Button>
        <Button 
          variant="outline" 
          size="lg" 
          className="h-20 rounded-3xl border-white/10 bg-white/5 hover:bg-white/10 flex flex-col gap-1"
          onClick={() => sendCommand("volume_up")}
        >
          <Volume2 className="w-6 h-6" />
        </Button>
        <Button 
          variant="outline" 
          size="lg" 
          className="h-20 rounded-3xl border-red-500/20 bg-red-500/10 hover:bg-red-500/20 text-red-500"
          onClick={() => sendCommand("close_player")}
        >
          <Power className="w-6 h-6" />
        </Button>
      </div>

      {/* Search Input */}
      <div className="w-full max-w-md relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-blue-400 transition-colors" />
        <Input 
          placeholder="Transmit search query..."
          className="h-16 pl-12 rounded-3xl bg-white/5 border-white/10 focus:ring-blue-500/50 font-bold text-sm"
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              sendCommand("search", { query: command });
              setCommand("");
            }
          }}
        />
      </div>

      <p className="mt-12 text-[10px] font-black uppercase tracking-[0.4em] text-white/10">Neural Interface v1.0.4</p>
    </div>
  );
};

export default RemoteControl;

const cn = (...classes: any[]) => classes.filter(Boolean).join(" ");
