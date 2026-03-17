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
  ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAdmin } from "@/context/AdminContext";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

const UserManagement = () => {
  const { users, refreshData, toggleAdmin, deleteUser } = useAdmin();
  const { user: currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         u.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filter === "all") return matchesSearch;
    if (filter === "online") return matchesSearch && u.status === "online";
    if (filter === "offline") return matchesSearch && u.status === "offline";
    if (filter === "phone") return matchesSearch && u.device === "Phone";
    if (filter === "desktop") return matchesSearch && u.device === "Desktop PC";
    return matchesSearch;
  });

  const stats = {
    total: users.length,
    online: users.filter(u => u.status === "online").length,
    offline: users.filter(u => u.status === "offline").length,
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
              className="group relative flex items-center bg-[#111111] border border-white/5 p-4 rounded-2xl transition-all duration-300 hover:bg-[#161616] hover:border-white/10"
            >
              {/* User Identity Column */}
              <div className="flex items-center gap-4 min-w-[280px]">
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-white/5 flex items-center justify-center overflow-hidden">
                    {u.photoURL ? (
                      <img src={u.photoURL} alt={u.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-lg font-bold text-blue-400">
                        {(u.name?.[0] || u.email[0]).toUpperCase()}
                      </span>
                    )}
                  </div>
                  {u.status === "online" && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-green-500 border-2 border-[#111] shadow-[0_0_8px_#22c55e]" />
                  )}
                </div>
                <div>
                  <h4 className="text-[15px] font-bold text-white leading-tight flex items-center gap-2">
                    {u.name || u.email.split('@')[0]}
                  </h4>
                  <p className="text-[12px] text-white/40 mt-0.5">{u.email}</p>
                  <p className="text-[11px] text-green-500/80 font-medium mt-0.5">Online now</p>
                </div>
              </div>

              {/* Location Information Column */}
              <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-8 items-center px-4">
                
                {/* Geo & ISP */}
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2 text-[13px] text-white/90 font-bold">
                    <span className="text-white/20">📍</span>
                    <p>{u.location?.split(',')[0] || "Malappuram"}, {u.location?.split(',')[1] || "Kerala"}</p>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-white/40 font-medium pl-5">
                    <p>India</p>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-white/20 font-bold pl-5 uppercase tracking-wider">
                    <Activity className="w-3 h-3 opacity-50" />
                    {u.isp || "BSNL Internet"}
                  </div>
                </div>

                {/* Device & OS */}
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2 text-[13px] text-white/90 font-bold">
                    {u.device === "Phone" ? <Smartphone className="w-4 h-4 text-blue-500" /> : <Monitor className="w-4 h-4 text-yellow-500" />}
                    <p>{u.device || "Desktop PC"}</p>
                  </div>
                  <p className="text-[11px] text-white/40 font-medium pl-6">
                    {u.os || "Windows 10/11 Desktop"} • {u.browser?.split('/')[0] || "Firefox"}
                  </p>
                </div>

                {/* Status Badges */}
                <div className="flex items-center gap-3">
                  {(isOwner || isAdmin) && (
                    <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20 hover:bg-yellow-500/20 text-[10px] font-bold h-6 px-3 rounded-full flex items-center gap-1.5 uppercase tracking-wider">
                      <Shield className="w-3 h-3" />
                      {isOwner ? "Owner" : "Admin"}
                    </Badge>
                  )}
                  <Badge className="bg-teal-500/10 text-teal-500 border-teal-500/20 hover:bg-teal-500/20 text-[10px] font-bold h-6 px-3 rounded-full uppercase tracking-wider">
                    Verified
                  </Badge>
                </div>
              </div>

              {/* Actions Right Side */}
              <div className="flex items-center gap-1 pr-2">
                {/* Admin Toggle (Current User can't toggle themselves) */}
                {u.email !== currentUser?.email && !isOwner && (
                  <Button 
                    variant="ghost" 
                    onClick={() => toggleAdmin(u.email, u.isAdmin)}
                    className={cn(
                      "h-9 px-3 rounded-full transition-all border border-white/5",
                      u.isAdmin ? "bg-white/5 text-white/90" : "bg-transparent text-white/20"
                    )}
                  >
                    <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider">
                      <Shield className="w-3.5 h-3.5" />
                      Admin
                    </div>
                  </Button>
                )}
                
                <Button variant="ghost" size="icon" className="w-9 h-9 rounded-full text-white/20 hover:text-white hover:bg-white/5">
                  <Key className="w-4 h-4" />
                </Button>
                
                {u.email !== currentUser?.email && !isOwner && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => deleteUser(u.email)}
                    className="w-9 h-9 rounded-full text-white/20 hover:text-red-500 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}

                <div className="w-10 h-10 flex items-center justify-center opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all cursor-default">
                  {u.countryCode === "IN" || !u.countryCode ? "🇮🇳" : "🌐"}
                </div>
              </div>
            </div>
          );
        })}

        {filteredUsers.length === 0 && (
          <div className="flex flex-col items-center justify-center py-32 border border-white/5 rounded-3xl bg-white/[0.01]">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
               <Users className="w-6 h-6 text-white/10" />
            </div>
            <p className="text-white/20 text-[11px] font-bold uppercase tracking-widest">No matching records found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;
