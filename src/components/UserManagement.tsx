import { useState } from "react";
import { 
  Users, 
  Activity, 
  Smartphone, 
  Monitor, 
  Laptop, 
  Shield, 
  CheckCircle2, 
  Trash2, 
  Key, 
  RefreshCw, 
  Search,
  ChevronDown,
  Gamepad2,
  Flame
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAdmin } from "@/context/AdminContext";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

const UserManagement = () => {
  const { users, refreshData, toggleAdmin, deleteUser, resetUserPassword, setUserPassword, toggleAdultAccess } = useAdmin();
  const { user: currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [editingPassword, setEditingPassword] = useState<{ email: string, value: string } | null>(null);

  const isActuallyOnline = (u: any) => {
    if (u.status !== "online") return false;
    if (u.email === currentUser?.email) return true;
    if (!u.lastSeen) return true;
    
    try {
      // FireStore timestamp to JS Date
      const lastSeenDate = u.lastSeen?.toDate ? u.lastSeen.toDate() : new Date(u.lastSeen);
      const diffMs = Math.abs(new Date().getTime() - lastSeenDate.getTime());
      return diffMs < 180000; // 3 minutes threshold
    } catch (e) {
      return u.status === "online";
    }
  };

  const filteredUsers = users.filter(u => {
    if (!u || !u.email) return false;
    
    const name = u.name || "";
    const email = u.email || "";
    const location = u.location || "";
    const isp = u.isp || "";

    const matchesSearch = email.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         isp.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filter === "all") return matchesSearch;
    if (filter === "online") return matchesSearch && isActuallyOnline(u);
    if (filter === "offline") return matchesSearch && !isActuallyOnline(u);
    if (filter === "phone") return matchesSearch && u.device === "Phone";
    if (filter === "desktop") return matchesSearch && u.device === "Desktop PC";
    return matchesSearch;
  });

  const stats = {
    total: users.length,
    online: users.filter(u => isActuallyOnline(u)).length,
    offline: users.filter(u => !isActuallyOnline(u)).length,
    phone: users.filter(u => u.device === "Phone").length,
    desktop: users.filter(u => u.device === "Desktop PC").length,
    laptop: users.filter(u => u.device === "Laptop").length,
    vpn: users.filter(u => u.device === "VPN").length
  };

  const filterTabs = [
    { id: 'all', label: 'All', count: stats.total, color: 'bg-blue-500' },
    { id: 'online', label: 'Online', count: stats.online, color: 'bg-green-500' },
    { id: 'offline', label: 'Offline', count: stats.offline, color: 'bg-white/20' },
    { id: 'phone', label: 'Phone', count: stats.phone, icon: Smartphone },
    { id: 'desktop', label: 'Desktop PC', count: stats.desktop, icon: Monitor },
    { id: 'laptop', label: 'Laptop', count: stats.laptop, icon: Laptop },
    { id: 'vpn', label: 'VPN', count: stats.vpn, icon: Shield },
  ];

  const getUserType = (u: any) => {
    if (u.email === "admin@gmail.com") return "OWNER";
    if (u.isAdmin) return "ADMIN";
    return "MEMBER";
  };

  const getTypeStyles = (type: string) => {
    switch (type) {
      case "OWNER": return { 
        color: "cyan", 
        glow: "rgba(6,182,212,0.15)", 
        border: "border-cyan-500/20", 
        text: "text-cyan-400",
        gradient: "from-cyan-400 via-cyan-300 to-blue-500"
      };
      case "ADMIN": return { 
        color: "blue", 
        glow: "rgba(59,130,246,0.15)", 
        border: "border-blue-500/20", 
        text: "text-blue-400",
        gradient: "from-blue-400 via-blue-300 to-indigo-500"
      };
      default: return { 
        color: "green", 
        glow: "rgba(34,197,94,0.15)", 
        border: "border-green-500/10", 
        text: "text-green-400",
        gradient: "from-green-400 via-emerald-400 to-teal-500"
      };
    }
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-6xl mx-auto pb-20">
      {/* Header Info */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
            <Users className="text-blue-500 w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Registered Users</h2>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-sm text-white/40">{stats.total} total users • {stats.online} online</span>
            </div>
          </div>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={refreshData}
          className="bg-[#1a1a1a] border-white/10 hover:bg-white/5 text-white/70 h-10 px-6 rounded-xl"
        >
          Refresh
        </Button>
      </div>

      {/* Modern Search & Filters Bar */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[300px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
            <Input 
              placeholder="Search by name, email, location, ISP..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-[#111] border-white/5 pl-11 focus-visible:ring-blue-500 rounded-xl h-12 text-sm text-white/80"
            />
          </div>
          
          <div className="flex flex-wrap items-center gap-1.5 bg-[#111] p-1.5 rounded-2xl border border-white/5">
            {filterTabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setFilter(t.id)}
                className={cn(
                  "flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap",
                  filter === t.id 
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/10" 
                    : "text-white/40 hover:text-white/70 hover:bg-white/5"
                )}
              >
                {t.icon && <t.icon className="w-3.5 h-3.5" />}
                {t.label} {t.count > 0 && `(${t.count})`}
              </button>
            ))}
            
            <button className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-white/40 hover:text-white/70 hover:bg-white/5 border-l border-white/5 ml-1">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              All Countries
              <ChevronDown className="w-3 h-3" />
            </button>
          </div>
        </div>
        
        <p className="text-[11px] text-white/20 uppercase tracking-[0.15em] font-bold px-1">
          Showing {filteredUsers.length} of {stats.total} users
        </p>
      </div>

      {/* Users Detailed List */}
      <div className="space-y-3">
        {filteredUsers.map((u) => {
          const type = getUserType(u);
          const isOwner = type === "OWNER";
          const isAdmin = type === "ADMIN";
          return (
            <div 
              key={u.id} 
              className="group relative bg-[#111111] border border-white/5 p-4 md:p-6 rounded-[2rem] transition-all duration-300 hover:bg-[#161616] hover:border-white/10 hover:shadow-2xl hover:shadow-blue-500/5 flex flex-col md:flex-row md:items-center gap-6"
            >
              {/* 1. Identity Column */}
              <div className="flex items-center gap-4 md:w-[25%] shrink-0">
                <div className="relative">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-white/5 flex items-center justify-center overflow-hidden">
                    {u.photoURL ? (
                      <img src={u.photoURL} alt={u.name || "User"} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xl font-bold text-blue-400">
                        {(u.name?.[0] || u.email?.[0] || "?").toUpperCase()}
                      </span>
                    )}
                  </div>
                  {isActuallyOnline(u) && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-green-500 border-4 border-[#111] shadow-[0_0_10px_#22c55e]" />
                  )}
                </div>
                <div className="min-w-0">
                  <h4 className="text-[16px] font-bold text-white leading-none flex items-center gap-2 truncate">
                    {u.name || (u.email ? u.email.split('@')[0] : "Unknown User")}
                  </h4>
                  <p className="text-[12px] text-white/40 mt-1.5 truncate">{u.email || "No Protocol ID"}</p>
                  <div className="mt-2">
                    {isActuallyOnline(u) ? (
                      <Badge className="bg-green-500/10 text-green-500 border-green-500/20 text-[9px] h-5 px-2 rounded-full uppercase tracking-tighter">
                        Online
                      </Badge>
                    ) : (
                      <Badge className="bg-white/5 text-white/30 border-white/5 text-[9px] h-5 px-2 rounded-full uppercase tracking-tighter">
                        Offline
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* 2. Location & ISP Column */}
              <div className="flex flex-col gap-1 md:w-[20%] shrink-0">
                <div className="flex items-center gap-2">
                  <span className="text-xl leading-none">
                    {u.countryCode === "IN" || !u.countryCode ? "🇮🇳" : u.countryCode.replace(/./g, char => String.fromCodePoint(char.charCodeAt(0) + 127397))}
                  </span>
                  <p className="text-[13px] font-bold text-white/80 truncate">
                    {u.location?.split(',')[0] || "Kerala"}, {u.location?.split(',')[1] || "India"}
                  </p>
                </div>
                <p className="text-[11px] text-blue-400/60 font-bold uppercase tracking-wider pl-8 truncate">
                  {u.isp || "BSNL Internet"}
                </p>
              </div>

              {/* 3. Device & Technology Column */}
              <div className="flex-1 min-w-0">
                <div className="grid grid-cols-1 gap-2">
                  {u.sessions && Object.keys(u.sessions).length > 0 ? (
                    Object.entries(u.sessions).slice(0, 1).map(([id, session]: [string, any]) => {
                      const isSessionOnline = isActuallyOnline({ ...u, lastSeen: session.lastSeen });
                      return (
                        <div key={id} className={cn(
                          "flex items-center gap-3 p-2.5 rounded-2xl border transition-all",
                          isSessionOnline ? "bg-blue-500/5 border-blue-500/20" : "bg-white/[0.02] border-white/5"
                        )}>
                          <div className={cn(
                            "w-9 h-9 rounded-xl flex items-center justify-center border shrink-0",
                            isSessionOnline ? "bg-blue-500/20 border-blue-500/20 text-blue-400" : "bg-white/5 border-white/5 text-white/20"
                          )}>
                            {session.device === "Phone" ? <Smartphone className="w-4 h-4" /> : <Monitor className="w-4 h-4" />}
                          </div>
                          <div className="min-w-0">
                            <p className="text-[12px] font-black uppercase tracking-widest text-white/80">
                              {session.device || "Desktop PC"}
                            </p>
                            <p className="text-[10px] text-white/30 font-bold uppercase truncate">
                              {session.os || "OS"} · {session.browser || "Browser"}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="flex items-center gap-3 p-2.5 rounded-2xl border bg-white/[0.02] border-white/5">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center border bg-white/5 border-white/5 text-white/20">
                        {u.device === "Phone" ? <Smartphone className="w-4 h-4" /> : <Monitor className="w-4 h-4" />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[12px] font-black uppercase tracking-widest text-white/80">
                          {u.device || "Desktop PC"}
                        </p>
                        <p className="text-[10px] text-white/30 font-bold uppercase truncate">
                          {u.os || "Windows"} · {u.browser?.split('/')[0] || "Firefox"}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 4. Badges & Roles */}
              <div className="flex flex-wrap items-center gap-2 md:w-[15%] justify-end md:justify-start">
                {isOwner && (
                  <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20 text-[10px] font-bold h-6 rounded-full px-3 uppercase tracking-tighter">
                    Owner
                  </Badge>
                )}
                {isAdmin && (
                  <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-[10px] font-bold h-6 rounded-full px-3 uppercase tracking-tighter">
                    Admin
                  </Badge>
                )}
                <Badge className={cn(
                  "text-[10px] font-bold h-6 rounded-full px-3 uppercase tracking-tighter",
                  u.emailVerified ? "bg-teal-500/10 text-teal-400 border-teal-500/20" : "bg-red-500/5 text-red-500/40 border-red-500/10"
                )}>
                  {u.emailVerified ? "Verified" : "Unverified"}
                </Badge>
              </div>

              {/* 5. Actions Column */}
              <div className="flex items-center gap-1.5 md:w-[15%] justify-end">
                {u.email !== currentUser?.email && !isOwner && (
                  <>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => toggleAdultAccess(u.email, !!u.hasAdultAccess)}
                      className={cn(
                        "w-9 h-9 rounded-xl transition-all border",
                        u.hasAdultAccess ? "bg-red-500/10 text-red-400 border-red-500/20" : "bg-white/5 text-white/20 border-white/5"
                      )}
                    >
                      <Flame className="w-4 h-4" />
                    </Button>

                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => toggleAdmin(u.email, u.isAdmin)}
                      className={cn(
                        "w-9 h-9 rounded-xl transition-all border",
                        u.isAdmin ? "bg-blue-500/10 text-blue-400 border-blue-500/20" : "bg-white/5 text-white/20 border-white/5"
                      )}
                    >
                      <Shield className="w-4 h-4" />
                    </Button>

                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => deleteUser(u.email)}
                      className="w-9 h-9 rounded-xl text-white/20 hover:text-red-500 hover:bg-red-500/10 border border-white/5 hover:border-red-500/20"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </>
                )}
                
                {currentUser?.email === "admin@gmail.com" && (
                  <div className="relative group/pass">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => setEditingPassword(editingPassword?.email === u.email ? null : { email: u.email, value: u.password || "" })}
                      className={cn(
                        "w-9 h-9 rounded-xl transition-all border",
                        editingPassword?.email === u.email ? "bg-blue-500 text-white border-blue-500" : "bg-white/5 text-white/20 border-white/5"
                      )}
                    >
                      <Key className="w-4 h-4" />
                    </Button>
                    {editingPassword?.email === u.email && (
                      <div className="absolute right-0 bottom-full mb-3 w-48 p-3 bg-[#1a1a1a] border border-white/10 rounded-2xl shadow-2xl z-50 animate-in fade-in slide-in-from-bottom-2">
                        <Input 
                          autoFocus
                          placeholder="New Pass"
                          value={editingPassword.value}
                          onChange={(e) => setEditingPassword({ ...editingPassword, value: e.target.value })}
                          className="h-9 text-xs bg-black/40 border-white/10 mb-2 rounded-lg"
                        />
                        <Button 
                          className="w-full h-8 text-[10px] font-bold uppercase bg-blue-600 hover:bg-blue-500 rounded-lg"
                          onClick={() => {
                            setUserPassword(u.email, editingPassword.value);
                            setEditingPassword(null);
                          }}
                        >
                          Update Key
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {filteredUsers.length === 0 && (
          <div className="flex flex-col items-center justify-center py-32 border border-white/5 rounded-3xl bg-white/[0.01]">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
               <Users className="w-6 h-6 text-white/10" />
            </div>
            <p className="text-white/20 text-[11px] font-bold uppercase tracking-widest">
              {users.length === 0 ? "No users registered in system protocol" : "No matching records found"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;
