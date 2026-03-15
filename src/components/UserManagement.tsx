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
      <div className="space-y-4">
        {filteredUsers.map((u) => {
          const type = getUserType(u);
          const styles = getTypeStyles(type);

          return (
            <div 
              key={u.id} 
              className={cn(
                "group relative flex items-center gap-4 bg-[#111]/40 backdrop-blur-xl border p-5 py-4 rounded-3xl transition-all duration-500 hover:scale-[1.01]",
                styles.border,
                type !== "MEMBER" ? `shadow-[0_0_20px_${styles.glow}]` : "",
                `hover:shadow-[0_0_30px_${styles.glow}]`
              )}
            >
              {/* Vertical Accent */}
              <div className={cn(
                "absolute left-0 top-1/2 -translate-y-1/2 w-1 h-12 rounded-r-full transition-all",
                u.isAdmin ? (type === "OWNER" ? "bg-cyan-500 shadow-[0_0_15px_#06b6d4]" : "bg-blue-500 shadow-[0_0_15px_#3b82f6]") : "bg-green-500 shadow-[0_0_15px_#22c55e]"
              )} />

              {/* User Meta (Avatar + Status) */}
              <div className="relative shrink-0 ml-2">
                <div className={cn(
                  "w-14 h-14 rounded-2xl flex items-center justify-center border overflow-hidden transition-transform duration-500 group-hover:rotate-3",
                  styles.border,
                  `bg-${styles.color}-500/5`
                )}>
                  {u.photoURL ? (
                    <img src={u.photoURL} alt={u.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className={cn(
                      "text-lg font-black",
                      styles.text
                    )}>
                      {(u.name?.[0] || u.email[0]).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className={cn(
                  "absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-4 border-[#0a0a0a]",
                  u.status === "online" ? "bg-green-500 shadow-[0_0_10px_#22c55e]" : "bg-white/10"
                )} />
              </div>

              {/* Info Grid */}
              <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                
                {/* Identity */}
                <div className="md:col-span-3">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className={cn(
                      "text-[16px] font-black tracking-tight leading-tight bg-gradient-to-r bg-clip-text text-transparent",
                      styles.gradient
                    )}>
                      {u.name || (u.email && u.email.split('@')[0])}
                    </h4>
                    {u.photoURL && <Badge className="bg-primary/20 text-primary border-none text-[8px] h-4 px-1">GOOGLE</Badge>}
                  </div>
                  <p className="text-[12px] text-white/40 font-medium truncate">{u.email}</p>
                  <div className="flex items-center gap-2 mt-2">
                     <span className={cn(
                       "flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-[9px] font-black uppercase tracking-widest",
                       styles.text,
                       styles.border,
                       `bg-${styles.color}-500/10`
                     )}>
                       {type === "OWNER" && <Shield className="w-3 h-3" />} {type}
                     </span>
                  </div>
                </div>

                {/* Geo & ISP */}
                <div className="md:col-span-3">
                  <div className="flex items-center gap-2.5 text-[13px] text-white/80 font-bold mb-1">
                    <span className="text-lg">📍</span>
                    <p>{u.location?.split(',')[0] || "Unknown City"}</p>
                  </div>
                  <p className="text-[10px] text-white/30 truncate pl-8 uppercase tracking-wider font-bold mb-0.5">
                    {u.isp || u.location?.split(',')[1] || "Detecting ISP..."}
                  </p>
                  {currentUser?.email === "admin@gmail.com" && (
                    <p className="text-[9px] text-cyan-400/60 font-mono pl-8 uppercase tracking-widest font-bold">
                      IP: {u.ip || "Detecting..."}
                    </p>
                  )}
                </div>

                {/* Hardware */}
                <div className="md:col-span-3">
                  <div className="flex items-center gap-2.5 text-[13px] text-white/80 font-bold mb-1">
                    {u.device === "Phone" ? <Smartphone className="w-4 h-4 text-white/40" /> : <Monitor className="w-4 h-4 text-white/40" />}
                    <p>{u.device}</p>
                  </div>
                  <p className="text-[10px] text-white/30 pl-7 font-bold uppercase tracking-widest">
                    {u.os?.split(' ')[0]} • {u.browser?.split('/')[0]}
                  </p>
                </div>

                {/* Metrics */}
                <div className="md:col-span-3 flex items-center justify-end pr-4">
                    <div className="text-right">
                      <p className="text-[10px] text-white/20 font-black uppercase tracking-tighter mb-1">Last Interaction</p>
                      <p className="text-[12px] text-white/60 font-bold">Just now</p>
                    </div>
                </div>

              </div>

              {/* Actions Panel */}
              <div className="flex items-center gap-2 pr-2 transition-all duration-300">
                 {/* Only Owner can toggle other admins */}
                 {type !== "OWNER" && (
                   <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => toggleAdmin(u.email, u.isAdmin)}
                    className={cn(
                      "w-10 h-10 rounded-xl bg-white/5 transition-all hover:bg-blue-500/10 hover:text-blue-500",
                      u.isAdmin ? "text-blue-500" : "text-white/20"
                    )}
                   >
                      <Shield className="w-4 h-4" />
                   </Button>
                 )}
                 
                 <Button 
                   variant="ghost" 
                   size="icon" 
                   onClick={() => deleteUser(u.email)}
                   className="w-10 h-10 rounded-xl bg-white/5 hover:bg-red-500/10 text-white/20 hover:text-red-500 transition-all"
                 >
                    <Trash2 className="w-4 h-4" />
                 </Button>
                 <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-xl grayscale hover:grayscale-0 transition-all cursor-default">
                   {u.countryCode === "IN" ? "🇮🇳" : "🌐"}
                 </div>
              </div>

            </div>
          );
        })}

        {filteredUsers.length === 0 && (
          <div className="flex flex-col items-center justify-center py-32 border-2 border-dashed border-white/5 rounded-[40px] bg-white/[0.01]">
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
               <Users className="w-8 h-8 text-white/10" />
            </div>
            <p className="text-white/20 text-sm font-bold uppercase tracking-widest">No active users located</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;
