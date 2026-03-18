import { useState, useRef } from "react";
import { 
  Image as ImageIcon, 
  Save, 
  Activity as ActivityIcon, 
  Type, 
  FileText, 
  Users, 
  Music, 
  Gamepad2, 
  Key, 
  Wrench, 
  Settings 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Navigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAdmin } from "@/context/AdminContext";
import { useAuth } from "@/context/AuthContext";
import UserManagement from "@/components/UserManagement";
import { cn } from "@/lib/utils";

const Admin = () => {
  const { branding, updateBranding, activityLog, isMaintenanceMode, toggleMaintenanceMode } = useAdmin();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("users");
  
  // App Branding State
  const [appName, setAppName] = useState(branding.appName);
  const [tagline, setTagline] = useState(branding.tagline);
  const [copyright, setCopyright] = useState(branding.copyrightText);
  const [poweredBy, setPoweredBy] = useState(branding.poweredBy);
  const [logoPreview, setLogoPreview] = useState(branding.appLogo);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const tabs = [
    { id: "users", label: "Users", icon: Users },
    { id: "activity", label: "Activity", icon: ActivityIcon },
    { id: "maint", label: "Maint.", icon: Wrench },
    { id: "app", label: "App", icon: Settings },
  ];

  const handleSave = (key: string, value: string, fieldName: string) => {
    updateBranding({ [key]: value });
    toast.success(`${fieldName} updated successfully`, {
      style: { background: "#1a1a1a", border: "1px solid #3b82f6", color: "#3b82f6" }
    });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setLogoPreview(url);
      updateBranding({ appLogo: url });
      toast.success("App Logo updated successfully", {
        style: { background: "#1a1a1a", border: "1px solid #3b82f6", color: "#3b82f6" }
      });
    }
  };

  if (user?.email?.toLowerCase() !== "admin@gmail.com" && !user?.isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans">
      <Navbar />
      
      <main className="container max-w-6xl mx-auto pt-28 pb-20 px-4">
        
        {/* Navigation Tabs Bar */}
        <div className="bg-[#1a1a1a]/80 backdrop-blur-md border border-white/5 p-1.5 rounded-2xl mb-12 flex flex-wrap justify-center gap-1 shadow-2xl sticky top-24 z-40">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 relative group",
                activeTab === tab.id 
                  ? "bg-white/10 text-white shadow-lg" 
                  : "text-white/40 hover:text-white/70 hover:bg-white/5"
              )}
            >
              <tab.icon className={cn("w-4 h-4", activeTab === tab.id ? "text-blue-500" : "text-inherit")} />
              <span className="text-sm font-medium">{tab.label}</span>
              {activeTab === tab.id && (
                <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-8 h-1 bg-blue-500 rounded-full shadow-[0_0_10px_#3b82f6]" />
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="space-y-8 min-h-[500px]">
          
          {activeTab === "users" && <UserManagement />}

          {activeTab === "activity" && (
            <div className="bg-[#111111] border border-white/5 rounded-2xl p-6 md:p-8 shadow-2xl animate-fade-in max-w-4xl mx-auto">
              <div className="flex items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <ActivityIcon className="text-blue-500 w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold tracking-tight text-white/90">Live Activity Stream</h2>
                    <p className="text-sm text-white/40 mt-0.5">Real-time viewing log from all users</p>
                  </div>
                </div>
                {activityLog.length > 0 && (
                  <div className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest">
                    {activityLog.length} entries
                  </div>
                )}
              </div>

              <div className="space-y-3">
                {activityLog.length > 0 ? (
                  activityLog.map((activity) => {
                    const timestamp = activity.timestamp as any;
                    const date = timestamp?.toDate ? timestamp.toDate() : (timestamp ? new Date(timestamp) : null);
                    const now = new Date();
                    const diffMs = date ? now.getTime() - date.getTime() : NaN;
                    const diffMins = Math.floor(diffMs / 60000);
                    const timeDisplay = isNaN(diffMins) 
                      ? "Recently" 
                      : diffMins < 1 
                        ? "Just now" 
                        : diffMins < 60 
                          ? `${diffMins}m ago` 
                          : diffMins < 1440 
                            ? `${Math.floor(diffMins/60)}h ago`
                            : `${Math.floor(diffMins/1440)}d ago`;
                    const fullTime = date ? date.toLocaleString("en-IN", { 
                      dateStyle: "medium", timeStyle: "short" 
                    }) : "Unknown time";

                    return (
                      <div key={activity.id} className="flex items-center gap-4 p-4 rounded-2xl bg-black/40 border border-white/5 hover:border-blue-500/20 hover:bg-white/[0.03] transition-all group">
                        {/* Poster */}
                        <div className="w-14 h-20 rounded-xl overflow-hidden bg-white/5 shrink-0 border border-white/5 shadow-lg group-hover:scale-105 transition-transform">
                          {activity.mediaPoster ? (
                            <img 
                              src={activity.mediaPoster} 
                              alt={activity.mediaTitle} 
                              className="w-full h-full object-cover"
                              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ActivityIcon className="w-5 h-5 text-white/10" />
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-[15px] font-bold text-white truncate">{activity.mediaTitle}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={cn(
                              "text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border",
                              activity.mediaType === "movie" 
                                ? "bg-blue-500/10 border-blue-500/30 text-blue-400" 
                                : "bg-purple-500/10 border-purple-500/30 text-purple-400"
                            )}>
                              {activity.mediaType}
                            </span>
                            <span className="text-xs text-white/30 font-medium truncate">{activity.userEmail}</span>
                          </div>
                          <p className="text-[10px] text-white/20 mt-1 font-mono" title={fullTime}>{fullTime}</p>
                        </div>

                        {/* Time badge */}
                        <div className="shrink-0 text-right">
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/5 border border-white/5">
                            <div className={cn(
                              "w-1.5 h-1.5 rounded-full",
                              diffMins < 5 ? "bg-green-500 animate-pulse" : "bg-white/20"
                            )} />
                            <span className="text-[11px] font-bold text-white/50 uppercase tracking-widest">{timeDisplay}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="py-20 flex flex-col items-center justify-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center">
                      <ActivityIcon className="w-7 h-7 text-white/10" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold text-white/20 uppercase tracking-widest">No Activity Yet</p>
                      <p className="text-xs text-white/10 mt-1">Activity will appear here when users start watching content</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "app" && (
            <div className="animate-fade-in space-y-8">
              {/* Branding Section */}
              <div className="bg-[#111111] border border-white/5 rounded-2xl p-6 md:p-8 shadow-2xl">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <ImageIcon className="text-blue-500 w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold tracking-tight text-white/90">App Branding</h2>
                    <p className="text-sm text-white/40 mt-1">Change the app logo, name, and tagline</p>
                  </div>
                </div>

                <div className="space-y-8">
                  <div>
                    <label className="text-sm font-medium text-white/60 mb-3 block">App Logo</label>
                    <div className="flex items-center gap-6">
                      <div className="w-20 h-20 rounded-xl bg-black border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                        <img src={logoPreview} alt="App Logo" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleLogoUpload} />
                        <Button 
                          variant="outline" 
                          className="bg-transparent border-white/10 hover:bg-white/5 text-sm h-9 px-4 rounded-lg mb-2"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <ImageIcon className="w-4 h-4 mr-2" />
                          Upload Logo
                        </Button>
                        <p className="text-[10px] text-white/30 uppercase tracking-widest">PNG, JPG, GIF, WebP — Max 5MB</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-white/60 mb-2">
                      <Type className="w-4 h-4" /> App Name
                    </label>
                    <div className="flex gap-3">
                      <Input 
                        value={appName}
                        onChange={(e) => setAppName(e.target.value)}
                        className="bg-[#050505] border-white/10 focus-visible:ring-blue-500 rounded-xl h-11"
                      />
                      <Button 
                        className="shrink-0 bg-blue-600 hover:bg-blue-500 text-white h-11 w-11 rounded-xl p-0"
                        onClick={() => handleSave('appName', appName, 'App Name')}
                      >
                        <Save className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-white/60 mb-2 block">Tagline</label>
                    <div className="flex gap-3">
                      <Input 
                        value={tagline}
                        onChange={(e) => setTagline(e.target.value)}
                        className="bg-[#050505] border-white/10 focus-visible:ring-blue-500 rounded-xl h-11"
                      />
                      <Button 
                        className="shrink-0 bg-blue-600 hover:bg-blue-500 text-white h-11 w-11 rounded-xl p-0"
                        onClick={() => handleSave('tagline', tagline, 'Tagline')}
                      >
                        <Save className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Section */}
              <div className="bg-[#111111] border border-white/5 rounded-2xl p-6 md:p-8 shadow-2xl">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <FileText className="text-blue-500 w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold tracking-tight text-white/90">Footer</h2>
                    <p className="text-sm text-white/40 mt-1">Customize the footer text</p>
                  </div>
                </div>
                <div className="space-y-6">
                  <div>
                    <label className="text-sm font-medium text-white/60 mb-2 block">Copyright Text</label>
                    <div className="flex gap-3">
                      <Input 
                        value={copyright}
                        onChange={(e) => setCopyright(e.target.value)}
                        className="bg-[#050505] border-white/10 focus-visible:ring-blue-500 rounded-xl h-11"
                      />
                      <Button 
                        className="shrink-0 bg-blue-600 hover:bg-blue-500 text-white h-11 w-11 rounded-xl p-0"
                        onClick={() => handleSave('copyrightText', copyright, 'Copyright Text')}
                      >
                        <Save className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-white/60 mb-2 block">Powered By</label>
                    <div className="flex gap-3">
                      <Input 
                        value={poweredBy}
                        onChange={(e) => setPoweredBy(e.target.value)}
                        className="bg-[#050505] border-white/10 focus-visible:ring-blue-500 rounded-xl h-11"
                      />
                      <Button 
                        className="shrink-0 bg-blue-600 hover:bg-blue-500 text-white h-11 w-11 rounded-xl p-0"
                        onClick={() => handleSave('poweredBy', poweredBy, 'Powered By Text')}
                      >
                        <Save className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "maint" && (
            <div className="bg-[#111111] border border-white/5 rounded-2xl p-6 md:p-8 shadow-2xl animate-fade-in max-w-2xl mx-auto">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Wrench className="text-blue-500 w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-white/90">Maintenance Protocols</h2>
                  <p className="text-sm text-white/40 mt-1">Control system-wide access and upgrades</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className={cn(
                  "p-6 rounded-2xl border transition-all duration-500",
                  isMaintenanceMode 
                    ? "bg-blue-500/10 border-blue-500/20 shadow-[0_0_20px_rgba(59,130,246,0.05)]" 
                    : "bg-black/20 border-white/5"
                )}>
                  <div className="flex items-center justify-between gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className={cn("font-bold text-lg", isMaintenanceMode ? "text-blue-500" : "text-white")}>
                          System Maintenance
                        </h3>
                        {isMaintenanceMode && (
                          <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_8px_#3b82f6]" />
                        )}
                      </div>
                      <p className="text-sm text-white/40 leading-relaxed">
                        When active, all non-admin users will see the "Under Maintenance" screen. Administrators will still have full access to the interface to perform tests or updates.
                      </p>
                    </div>
                    
                    <button 
                      onClick={toggleMaintenanceMode}
                      className={cn(
                        "relative w-16 h-8 rounded-full transition-all duration-300 overflow-hidden shrink-0",
                        isMaintenanceMode ? "bg-blue-500 shadow-[0_0_15px_#3b82f6]" : "bg-white/10"
                      )}
                    >
                      <div className={cn(
                        "absolute top-1 bottom-1 w-6 bg-white rounded-full transition-all duration-300 shadow-lg",
                        isMaintenanceMode ? "left-9" : "left-1"
                      )} />
                    </button>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10 flex items-start gap-3">
                  <Settings className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                  <p className="text-[11px] text-blue-400/80 font-medium leading-relaxed">
                    Maintenance mode is synced in real-time via JARVIS Neural Core. Once toggled, all active sessions worldwide will be redirected instantly without requiring a page refresh.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Placeholder for other tabs */}
          {["playlists"].includes(activeTab) && (
            <div className="flex flex-col items-center justify-center py-40 bg-[#111] border border-white/5 rounded-3xl animate-fade-in">
              <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
                <Wrench className="w-10 h-10 text-white/20" />
              </div>
              <h3 className="text-xl font-bold text-white/80 capitalize">{activeTab} module</h3>
              <p className="text-white/30 text-sm mt-1">System interface under development</p>
            </div>
          )}
        </div>

      </main>
      
      <Footer />
    </div>
  );
};

export default Admin;
