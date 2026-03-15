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
import { cn } from "@/lib/utils";

const UserManagement = () => {
  const { users, refreshData } = useAdmin();
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
    total: 45, // Hardcoded for fidelity to screenshot
    online: 9,
    offline: 36,
    phone: 14,
    desktop: 5,
    laptop: 1,
    vpn: 0
  };

  const filterTabs = [
    { id: 'all', label: 'All', count: stats.total, color: 'bg-yellow-500' },
    { id: 'online', label: 'Online', count: stats.online, color: 'bg-green-500' },
    { id: 'offline', label: 'Offline', count: stats.offline, color: 'bg-white/20' },
    { id: 'phone', label: 'Phone', count: stats.phone, icon: Smartphone },
    { id: 'desktop', label: 'Desktop PC', count: stats.desktop, icon: Monitor },
    { id: 'laptop', label: 'Laptop', count: stats.laptop, icon: Laptop },
    { id: 'vpn', label: 'VPN', count: stats.vpn, icon: Shield },
  ];

  return (
    <div className="space-y-8 animate-fade-in max-w-6xl mx-auto">
      {/* Header Info */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
            <Users className="text-yellow-500 w-6 h-6" />
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
              className="bg-[#111] border-white/5 pl-11 focus-visible:ring-yellow-500 rounded-xl h-12 text-sm text-white/80"
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
                    ? "bg-[#ffd700] text-black shadow-lg shadow-yellow-500/10" 
                    : "text-white/40 hover:text-white/70 hover:bg-white/5"
                )}
              >
                {t.icon && <t.icon className="w-3.5 h-3.5" />}
                {t.label} ({t.count})
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
      <div className="space-y-1.5">
        {filteredUsers.map((u) => (
          <div key={u.id} className="group flex items-center gap-4 bg-[#111]/60 backdrop-blur-md border border-white/5 p-4 py-3 rounded-2xl hover:bg-[#111] hover:border-white/10 transition-all">
            
            {/* User Meta (Avatar + Status) */}
            <div className="relative shrink-0">
              <div className="w-[50px] h-[50px] rounded-full bg-[#1a1c23] flex items-center justify-center border border-white/10 overflow-hidden ring-1 ring-white/5">
                {u.name ? (
                  <span className="text-sm font-black text-white/80">{u.name[0]}</span>
                ) : (
                  <span className="text-sm font-black text-white/30">{u.email[0].toUpperCase()}</span>
                )}
              </div>
              <div className={cn(
                "absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-[#0a0a0a]",
                u.status === "online" ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" : "bg-white/20"
              )} />
            </div>

            {/* Grid Layout for Info */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              
              {/* Identity */}
              <div className="md:col-span-3">
                <h4 className="text-[14px] font-black text-white/90 leading-none">
                  {u.name || u.email.split('@')[0].toUpperCase()}
                </h4>
                <p className="text-[11px] text-red-500 font-medium mt-1 truncate max-w-[140px]">{u.email}</p>
                <span className="text-[10px] text-green-500 font-bold mt-1 block">Online now</span>
              </div>

              {/* Location */}
              <div className="md:col-span-3">
                <div className="flex items-start gap-2 text-[12px] text-white/70 font-bold">
                  <span className="opacity-30 mt-0.5">📍</span> 
                  <div>
                    <p>{u.location.split(',')[0]}, {u.location.split(',')[1]}</p>
                    <p className="text-[10px] text-white/30 font-normal mt-0.5">{u.location.split(',')[2]}</p>
                  </div>
                </div>
                <p className="text-[10px] text-white/30 mt-1 flex items-center gap-1 pl-4">
                  <span className="text-[8px] opacity-40 italic">▸</span> {u.isp}
                </p>
              </div>

              {/* Device */}
              <div className="md:col-span-3">
                <div className="flex items-center gap-2 text-[12px] text-white/70 font-bold">
                  {u.device === "Phone" ? <Smartphone className="w-3.5 h-3.5 opacity-30" /> : <Monitor className="w-3.5 h-3.5 opacity-30" />}
                  {u.device}
                </div>
                <p className="text-[10px] text-white/30 mt-1 pl-5 font-medium">{u.os} • {u.browser}</p>
              </div>

              {/* Role & Badges */}
              <div className="md:col-span-3 flex items-center gap-2 justify-end md:justify-start">
                {u.isAdmin && (
                  <div className="flex items-center gap-1 bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 rounded-full px-2 py-0.5">
                    <Shield className="w-2.5 h-2.5" />
                    <span className="text-[9px] font-black uppercase tracking-tighter">Admin</span>
                  </div>
                )}
                {u.isVerified && (
                  <div className="bg-green-500/10 text-green-500 border border-green-500/20 rounded-full px-2 py-0.5">
                    <span className="text-[9px] font-black uppercase tracking-tighter">Verified</span>
                  </div>
                )}
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-3 pr-2">
              <button className="text-[11px] font-bold text-red-500/60 hover:text-red-500 transition-colors uppercase tracking-widest">
                Revoke
              </button>
              <Button variant="ghost" size="icon" className="w-8 h-8 rounded-lg text-white/20 hover:text-white hover:bg-white/5">
                <Key className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="w-8 h-8 rounded-lg text-red-500/20 hover:text-red-500 hover:bg-red-500/5">
                <Trash2 className="w-4 h-4" />
              </Button>
              
              {/* Flag Mockup */}
              <div className="w-[32px] h-[22px] bg-black/40 rounded border border-white/5 flex items-center justify-center text-[12px] grayscale hover:grayscale-0 transition-all ml-2">
                🇮🇳
              </div>
            </div>
          </div>
        ))}
        {filteredUsers.length === 0 && (
          <div className="text-center py-20 border-2 border-dashed border-white/5 rounded-3xl">
            <p className="text-white/20 text-sm">No users found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;
