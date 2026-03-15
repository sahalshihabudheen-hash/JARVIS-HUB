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
  const { branding, updateBranding, activityLog } = useAdmin();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("app");
  
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
    { id: "playlists", label: "Playlists", icon: Music },
    { id: "games", label: "Games", icon: Gamepad2, badge: "1" },
    { id: "keys", label: "Keys", icon: Key },
    { id: "maint", label: "Maint.", icon: Wrench },
    { id: "app", label: "App", icon: Settings },
  ];

  const handleSave = (key: string, value: string, fieldName: string) => {
    updateBranding({ [key]: value });
    toast.success(`${fieldName} updated successfully`, {
      style: { background: "#1a1a1a", border: "1px solid #ffd700", color: "#ffd700" }
    });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setLogoPreview(url);
      updateBranding({ appLogo: url });
      toast.success("App Logo updated successfully", {
        style: { background: "#1a1a1a", border: "1px solid #ffd700", color: "#ffd700" }
      });
    }
  };

  if (user?.email?.toLowerCase() !== "admin@gmail.com") {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans">
      <Navbar />
      
      <main className="container max-w-6xl mx-auto pt-28 pb-20 px-4">
        
        {/* Navigation Tabs Bar */}
        <div className="bg-[#1a1a1a]/80 backdrop-blur-md border border-white/5 p-1.5 rounded-2xl mb-12 flex flex-wrap gap-1 shadow-2xl sticky top-24 z-40">
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
              <tab.icon className={cn("w-4 h-4", activeTab === tab.id ? "text-[#ffd700]" : "text-inherit")} />
              <span className="text-sm font-medium">{tab.label}</span>
              {tab.badge && (
                <span className="bg-green-500 text-black text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {tab.badge}
                </span>
              )}
              {activeTab === tab.id && (
                <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-8 h-1 bg-[#ffd700] rounded-full shadow-[0_0_10px_#ffd700]" />
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="space-y-8 min-h-[500px]">
          
          {activeTab === "users" && <UserManagement />}

          {activeTab === "activity" && (
            <div className="bg-[#111111] border border-white/5 rounded-2xl p-6 md:p-8 shadow-2xl animate-fade-in max-w-4xl mx-auto">
              <div className="flex items-center gap-4 mb-6 relative">
                <div className="w-10 h-10 rounded-lg bg-[#ffd700]/10 flex items-center justify-center">
                  <ActivityIcon className="text-[#ffd700] w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-white/90">Viewing Activity</h2>
                  <p className="text-sm text-white/40 mt-1">See what users are watching</p>
                </div>
              </div>

              <div className="space-y-4 mt-8">
                {activityLog.map((activity) => {
                  const date = new Date(activity.timestamp);
                  const now = new Date();
                  const diffMs = now.getTime() - date.getTime();
                  const diffMins = Math.floor(diffMs / 60000);
                  const timeDisplay = diffMins < 1 ? "Just now" : diffMins < 60 ? `${diffMins}m ago` : `${Math.floor(diffMins/60)}h ago`;

                  return (
                    <div key={activity.id} className="flex items-center justify-between p-4 rounded-2xl bg-black/40 border border-white/5 hover:border-white/10 transition-all group">
                      <div className="flex items-center gap-5">
                        <img 
                          src={activity.mediaPoster} 
                          alt={activity.mediaTitle} 
                          className="w-14 h-14 object-cover rounded-xl shadow-lg group-hover:scale-105 transition-transform"
                        />
                        <div>
                          <h4 className="text-[15px] font-bold text-white/90">{activity.mediaTitle}</h4>
                          <p className="text-xs text-white/30 mt-0.5 capitalize">{activity.mediaType} Stream</p>
                        </div>
                      </div>
                      <div className="text-right flex flex-col items-end">
                        <span className="text-[14px] font-bold text-[#ffd700] hover:underline cursor-pointer">{activity.userEmail}</span>
                        <span className="text-[11px] text-white/20 mt-1 uppercase tracking-widest">{timeDisplay}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === "app" && (
            <div className="animate-fade-in space-y-8">
              {/* Branding Section */}
              <div className="bg-[#111111] border border-white/5 rounded-2xl p-6 md:p-8 shadow-2xl">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-10 h-10 rounded-lg bg-[#ffd700]/10 flex items-center justify-center">
                    <ImageIcon className="text-[#ffd700] w-5 h-5" />
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
                        className="bg-[#050505] border-white/10 focus-visible:ring-[#ffd700] rounded-xl h-11"
                      />
                      <Button 
                        className="shrink-0 bg-[#ffd700] hover:bg-[#ffed4a] text-black h-11 w-11 rounded-xl p-0"
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
                        className="bg-[#050505] border-white/10 focus-visible:ring-[#ffd700] rounded-xl h-11"
                      />
                      <Button 
                        className="shrink-0 bg-[#ffd700] hover:bg-[#ffed4a] text-black h-11 w-11 rounded-xl p-0"
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
                  <div className="w-10 h-10 rounded-lg bg-[#ffd700]/10 flex items-center justify-center">
                    <FileText className="text-[#ffd700] w-5 h-5" />
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
                        className="bg-[#050505] border-white/10 focus-visible:ring-[#ffd700] rounded-xl h-11"
                      />
                      <Button 
                        className="shrink-0 bg-[#ffd700] hover:bg-[#ffed4a] text-black h-11 w-11 rounded-xl p-0"
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
                        className="bg-[#050505] border-white/10 focus-visible:ring-[#ffd700] rounded-xl h-11"
                      />
                      <Button 
                        className="shrink-0 bg-[#ffd700] hover:bg-[#ffed4a] text-black h-11 w-11 rounded-xl p-0"
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

          {/* Placeholder for other tabs */}
          {["playlists", "games", "keys", "maint"].includes(activeTab) && (
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
