import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useTutorial } from "@/context/TutorialContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { 
  User, 
  Shield, 
  RefreshCcw, 
  Trash2, 
  ChevronRight, 
  Globe,
  Settings as SettingsIcon,
  CreditCard,
  MessageSquare,
  Lock,
  Eye,
  Bell
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const Settings = () => {
  const { user, logout, updateProfile, resetPassword } = useAuth();
  const { startTutorial, selectedGenres, updateSelectedGenres } = useTutorial();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("profile");
  const [isUpdating, setIsUpdating] = useState(false);
  const [userName, setUserName] = useState(user?.name || "");

  // Profile Update Logic
  const handleUpdateName = async () => {
    if (!userName.trim()) return;
    setIsUpdating(true);
    try {
      await updateProfile({ name: userName });
      toast.success("Profile name updated.");
    } catch (e) {
      toast.error("Failed to update name.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    
    setIsUpdating(true);
    try {
      const { ref, uploadBytes, getDownloadURL } = await import("firebase/storage");
      const { storage } = await import("@/lib/firebase");
      
      const storageRef = ref(storage, `avatars/${user.email}_${Date.now()}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      
      await updateProfile({ photoURL: url });
      toast.success("Avatar updated successfully!");
    } catch (e) {
      console.error(e);
      toast.error("Avatar upload failed.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePasswordReset = async () => {
    try {
      await resetPassword();
      toast.success("Password reset email sent!");
    } catch (e) {
      toast.error("Failed to send reset email.");
    }
  };

  const isGoogleUser = user?.photoURL?.includes("googleusercontent.com");
  // ... rest of the component ...
  const genres = [
    { id: 28, name: "Action", icon: "⚔️" },
    { id: 878, name: "Sci-Fi", icon: "🚀" },
    { id: 27, name: "Horror", icon: "👻" },
    { id: 35, name: "Comedy", icon: "😂" },
    { id: 53, name: "Thriller", icon: "🔪" },
    { id: 10749, name: "Romance", icon: "❤️" },
    { id: 18, name: "Drama", icon: "🎭" },
    { id: 16, name: "Animation", icon: "🎨" },
    { id: 14, name: "Fantasy", icon: "🔮" },
    { id: 9648, name: "Mystery", icon: "🔍" },
  ];

  const toggleGenre = (genreId: number) => {
    if (selectedGenres.includes(genreId)) {
      updateSelectedGenres(selectedGenres.filter(id => id !== genreId));
    } else {
      updateSelectedGenres([...selectedGenres, genreId]);
    }
  };

  const clearData = () => {
    localStorage.removeItem("user_selected_genres");
    localStorage.removeItem("jarvis_tutorial_complete");
    localStorage.removeItem("user_regional_focus");
    updateSelectedGenres([]);
    toast.success("Protocol data wiped successfully.");
  };

  const regionalOptions = [
    { id: "auto", name: "Auto-Detect", icon: <Globe className="w-4 h-4" /> },
    { id: "kerala", name: "Kerala (Malayalam)", icon: "🥥" },
    { id: "tamilnadu", name: "Tamil Nadu (Tamil)", icon: "🕉️" },
    { id: "karnataka", name: "Karnataka (Kannada)", icon: "🏰" },
    { id: "maharashtra", name: "Maharashtra (Marathi)", icon: "🚩" },
    { id: "bengal", name: "West Bengal (Bengali)", icon: "🐅" },
    { id: "north_india", name: "North India (Hindi)", icon: "🕉️" },
  ];

  const currentFocus = localStorage.getItem("user_regional_focus") || "auto";

  const setRegionalFocus = (id: string) => {
    localStorage.setItem("user_regional_focus", id);
    toast.success(`Regional focus set to ${id.replace('_', ' ')}`);
    window.location.reload(); // Reload to refresh queries
  };

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "calibration", label: "Calibration", icon: RefreshCcw },
    { id: "security", label: "Security", icon: Shield },
    { id: "general", label: "General", icon: SettingsIcon },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />

      <main className="flex-grow pt-24 pb-12">
        <div className="container max-w-5xl">
          <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-display font-bold uppercase tracking-tighter mb-2">
                Central <span className="text-primary">Settings</span>
              </h1>
              <p className="text-muted-foreground text-lg">
                Manage your terminal configuration and security protocols.
              </p>
            </div>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-[250px_1fr] gap-8">
            {/* Sidebar Tabs */}
            <aside className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 border",
                    activeTab === tab.id
                      ? "bg-primary/20 border-primary text-primary shadow-[0_0_20px_rgba(34,211,238,0.1)]"
                      : "bg-white/5 border-white/5 text-muted-foreground hover:bg-white/10"
                  )}
                >
                  <tab.icon className="w-5 h-5" />
                  <span className="font-bold uppercase tracking-widest text-xs">{tab.label}</span>
                </button>
              ))}
            </aside>

            {/* Content Area */}
            <div className="glass border-white/10 rounded-3xl p-6 md:p-10 min-h-[500px] animate-fade-in relative overflow-hidden">
               <div className="absolute top-0 right-0 p-10 opacity-[0.03] pointer-events-none">
                  <SettingsIcon className="w-64 h-64" />
               </div>

               {activeTab === "profile" && (
                 <div className="space-y-8 relative z-10">
                   <div className="flex flex-col md:flex-row items-center gap-8">
                     <div className="relative group">
                       <div className="w-32 h-32 rounded-3xl bg-primary/10 border-2 border-primary/20 flex items-center justify-center text-4xl font-display font-bold text-primary overflow-hidden shadow-2xl transition-transform group-hover:scale-105">
                         {user?.photoURL ? (
                           <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover" />
                         ) : (
                           user?.name?.substring(0, 2).toUpperCase()
                         )}
                       </div>
                       <label className="absolute -bottom-2 -right-2 w-10 h-10 rounded-xl bg-primary text-black flex items-center justify-center cursor-pointer hover:bg-white transition-colors shadow-xl">
                         <SettingsIcon className="w-5 h-5" />
                         <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} disabled={isUpdating} />
                       </label>
                     </div>
                     
                     <div className="flex-1 space-y-4 text-center md:text-left">
                       <div>
                         <div className="flex items-center gap-3 justify-center md:justify-start">
                           <input 
                             value={userName}
                             onChange={(e) => setUserName(e.target.value)}
                             className="text-2xl font-bold bg-transparent border-b border-white/20 focus:border-primary outline-none px-2 py-1 w-full max-w-[300px]"
                           />
                           <Button 
                             size="sm" 
                             onClick={handleUpdateName} 
                             disabled={isUpdating || userName === user?.name}
                             className="rounded-lg h-8 px-4"
                           >
                             Update
                           </Button>
                         </div>
                         <p className="text-muted-foreground mt-1">{user?.email}</p>
                       </div>
                       
                       <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                         <span className="px-3 py-1 bg-green-500/10 text-green-500 text-[10px] font-bold uppercase tracking-wider rounded-full border border-green-500/20">
                           {user?.isAdmin ? "Owner Status Active" : "Member Protocol Active"}
                         </span>
                         {isGoogleUser && (
                           <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider rounded-full border border-primary/20">
                             Google Authenticated
                           </span>
                         )}
                       </div>
                     </div>
                   </div>

                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-4">
                         <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                            <Globe className="w-5 h-5" />
                         </div>
                         <div>
                            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold italic">Location</p>
                            <p className="text-sm font-bold">{user?.location || "Detecting..."}</p>
                         </div>
                      </div>
                      <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-4">
                         <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500">
                            <Shield className="w-5 h-5" />
                         </div>
                         <div>
                            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold italic">ISP Path</p>
                            <p className="text-sm font-bold truncate max-w-[150px]">{user?.isp || "Identifying..."}</p>
                         </div>
                      </div>
                   </div>

                   <div className="pt-6 border-t border-white/10 flex flex-wrap gap-4">
                      {!isGoogleUser && (
                        <Button onClick={handlePasswordReset} variant="outline" className="rounded-xl border-primary/20 text-primary hover:bg-primary/10">
                           Reset Password Protocol
                        </Button>
                      )}
                      <Button onClick={logout} variant="outline" className="rounded-xl border-red-500/20 text-red-500 hover:bg-red-500/10">
                         Disconnect Hub Session
                      </Button>
                   </div>
                 </div>
               )}

               {activeTab === "calibration" && (
                 <div className="space-y-8 relative z-10">
                   <div>
                     <h3 className="text-xl font-bold uppercase tracking-tighter mb-2 flex items-center gap-2">
                        <RefreshCcw className="w-5 h-5 text-primary" />
                        System Re-Initialization
                     </h3>
                     <p className="text-muted-foreground text-sm mb-6">
                        Re-initialize the JARVIS assistant to refresh your knowledge of the terminal's security protocols.
                     </p>
                      <Button 
                        onClick={() => {
                          localStorage.removeItem("jarvis_tutorial_complete");
                          toast.success("Navigating home — tutorial will start shortly.");
                          navigate("/");
                          // Force page reload so module-level intro flag resets
                          setTimeout(() => window.location.reload(), 100);
                        }}
                        className="rounded-xl px-8 py-6 hover-glow text-lg font-bold uppercase tracking-tighter"
                      >
                        Replay Tutorial
                        <ChevronRight className="w-5 h-5 ml-2" />
                     </Button>
                   </div>


                   <div className="pt-8 border-t border-white/10">
                     <h3 className="text-xl font-bold uppercase tracking-tighter mb-4 flex items-center gap-2">
                        ⭐ Genre Calibration
                        <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full ml-2">Dynamic</span>
                     </h3>
                     <p className="text-muted-foreground text-sm mb-6">
                        Update your preferred data streams to re-configure your home dashboard.
                     </p>
                     
                     <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                        {genres.map((g) => (
                           <button
                             key={g.id}
                             onClick={() => toggleGenre(g.id)}
                             className={cn(
                               "flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all duration-300",
                               selectedGenres.includes(g.id) 
                                 ? "bg-primary/20 border-primary shadow-[0_0_20px_rgba(34,211,238,0.2)]" 
                                 : "bg-white/5 border-white/10 hover:border-white/20"
                             )}
                           >
                             <span className="text-2xl">{g.icon}</span>
                             <span className="text-[10px] font-bold uppercase tracking-widest">{g.name}</span>
                           </button>
                         ))}
                     </div>
                   </div>
                 </div>
               )}

               {activeTab === "security" && (
                 <div className="space-y-8 relative z-10">
                   <div className="space-y-6">
                      <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl">
                         <div className="flex items-center gap-4">
                            <Lock className="w-5 h-5 text-primary" />
                            <div>
                               <p className="font-bold">Stealth Shield</p>
                               <p className="text-xs text-muted-foreground text-balance">Anti-redirection script active during playback.</p>
                            </div>
                         </div>
                         <div className="w-12 h-6 bg-primary/20 rounded-full border border-primary/40 flex items-center px-1">
                            <div className="w-4 h-4 bg-primary rounded-full shadow-[0_0_10px_rgba(34,211,238,0.8)] ml-auto" />
                         </div>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl">
                         <div className="flex items-center gap-4">
                            <Eye className="w-5 h-5 text-primary" />
                            <div>
                               <p className="font-bold">Privacy Scrubber</p>
                               <p className="text-xs text-muted-foreground">Automatically clears watch history on session end.</p>
                            </div>
                         </div>
                         <div className="w-12 h-6 bg-white/10 rounded-full border border-white/20 flex items-center px-1">
                            <div className="w-4 h-4 bg-white/40 rounded-full" />
                         </div>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl">
                         <div className="flex items-center gap-4">
                            <Globe className="w-5 h-5 text-primary" />
                            <div>
                               <p className="font-bold">Location Masking</p>
                               <p className="text-xs text-muted-foreground">Currently showing results based on: {localStorage.getItem("user_location") || "Auto"}</p>
                            </div>
                         </div>
                         <div className="w-12 h-6 bg-primary/20 rounded-full border border-primary/40 flex items-center px-1">
                            <div className="w-4 h-4 bg-primary rounded-full shadow-[0_0_10px_rgba(34,211,238,0.8)] ml-auto" />
                         </div>
                      </div>
                   </div>
                 </div>
               )}

               {activeTab === "general" && (
                 <div className="space-y-8 relative z-10">
                    <div className="space-y-6">
                        <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl">
                           <div className="flex items-center gap-4">
                              <Bell className="w-5 h-5 text-primary" />
                              <div>
                                 <p className="font-bold">System Notifications</p>
                                 <p className="text-xs text-muted-foreground">Protocol alerts and JARVIS messages.</p>
                              </div>
                           </div>
                           <div className="w-12 h-6 bg-primary/20 rounded-full border border-primary/40 flex items-center px-1">
                              <div className="w-4 h-4 bg-primary rounded-full shadow-[0_0_10px_rgba(34,211,238,0.8)] ml-auto" />
                           </div>
                        </div>

                        <div className="pt-6 border-t border-white/10">
                           <h3 className="text-xl font-bold uppercase tracking-tighter mb-4 text-red-400">
                              ⚠️ Danger Zone
                           </h3>
                           <p className="text-muted-foreground text-sm mb-6">
                              Wiping terminal data will reset your training progress and delete all cached preferences.
                           </p>
                           <Button 
                              onClick={clearData}
                              variant="destructive"
                              className="rounded-xl px-6 bg-red-500/20 border border-red-500/40 text-red-500 hover:bg-red-500/30"
                           >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Wipe All Terminal Data
                           </Button>
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

export default Settings;
