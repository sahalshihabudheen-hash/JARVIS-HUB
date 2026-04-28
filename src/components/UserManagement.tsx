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
  Search,
  ChevronDown,
  Gamepad2,
  Flame,
  Globe,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAdmin } from "@/context/AdminContext";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

const UserManagement = () => {
  const { users, refreshData, toggleAdmin, deleteUser, setUserPassword, toggleAdultAccess } = useAdmin();
  const { user: currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [editingPassword, setEditingPassword] = useState<{ email: string, value: string } | null>(null);

  const isActuallyOnline = (u: any) => {
    if (u.status !== "online") return false;
    if (u.email === currentUser?.email) return true;
    if (!u.lastSeen) return true;
    
    try {
      const lastSeenDate = u.lastSeen?.toDate ? u.lastSeen.toDate() : new Date(u.lastSeen);
      const diffMs = Math.abs(new Date().getTime() - lastSeenDate.getTime());
      return diffMs < 180000;
    } catch (e) {
      return u.status === "online";
    }
  };

  const filteredUsers = users.filter(u => {
    if (!u || !u.email) return false;
    const matchesSearch = 
      (u.email || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
      (u.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.location || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.isp || "").toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filter === "all") return matchesSearch;
    if (filter === "online") return matchesSearch && isActuallyOnline(u);
    if (filter === "phone") return matchesSearch && u.device === "Phone";
    if (filter === "desktop") return matchesSearch && u.device === "Desktop PC";
    return matchesSearch;
  });

  const stats = {
    total: users.length,
    online: users.filter(u => isActuallyOnline(u)).length,
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-[1600px] mx-auto pb-20 px-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0A0A0A] p-6 rounded-[2rem] border border-white/5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
            <Users className="text-blue-500 w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight">User Directory</h2>
            <p className="text-sm text-white/40">{stats.total} total accounts · {stats.online} active protocols</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
            <Input 
              placeholder="Search Intelligence..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white/[0.03] border-white/5 pl-11 rounded-xl h-11 text-sm"
            />
          </div>
          <Button onClick={refreshData} variant="outline" className="rounded-xl border-white/5 bg-white/5 h-11">
            Sync
          </Button>
        </div>
      </div>

      {/* User List Table Header (Desktop Only) */}
      <div className="hidden lg:grid grid-cols-[1.5fr_1fr_1.2fr_1fr_0.8fr] gap-4 px-8 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/20">
        <div>Identity & Profile</div>
        <div>Location & ISP</div>
        <div>Active Sessions</div>
        <div>Privileges</div>
        <div className="text-right">Actions</div>
      </div>

      {/* Users List */}
      <div className="space-y-3">
        {filteredUsers.map((u) => {
          const isOwner = u.email === "admin@gmail.com";
          const isAdmin = u.isAdmin;

          return (
            <div 
              key={u.id} 
              className="group bg-[#0D0D0D] border border-white/5 rounded-[2rem] p-4 lg:p-6 transition-all duration-300 hover:bg-[#111] hover:border-white/10 hover:shadow-2xl hover:shadow-blue-500/5"
            >
              <div className="flex flex-col lg:grid lg:grid-cols-[1.5fr_1fr_1.2fr_1fr_0.8fr] gap-6 items-center">
                
                {/* 1. Identity */}
                <div className="flex items-center gap-4 w-full">
                  <div className="relative shrink-0">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-white/5 flex items-center justify-center overflow-hidden">
                      {u.photoURL ? (
                        <img src={u.photoURL} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xl font-bold text-blue-400">
                          {(u.name?.[0] || u.email?.[0] || "?").toUpperCase()}
                        </span>
                      )}
                    </div>
                    {isActuallyOnline(u) && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-green-500 border-4 border-[#0D0D0D] shadow-[0_0_10px_#22c55e]" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-[16px] font-bold text-white truncate">
                      {u.name || u.email?.split('@')[0]}
                    </h4>
                    <p className="text-[12px] text-white/30 truncate mb-1">{u.email}</p>
                    <div className="flex items-center gap-2">
                      <Badge className={cn(
                        "text-[9px] h-5 px-2 rounded-md uppercase font-black tracking-tighter",
                        isActuallyOnline(u) ? "bg-green-500/10 text-green-500 border-green-500/20" : "bg-white/5 text-white/20 border-white/5"
                      )}>
                        {isActuallyOnline(u) ? "Online" : "Offline"}
                      </Badge>
                      <Badge className={cn(
                        "text-[9px] h-5 px-2 rounded-md uppercase font-black tracking-tighter",
                        u.emailVerified ? "bg-teal-500/10 text-teal-400 border-teal-500/20" : "bg-red-500/10 text-red-500 border-red-500/20"
                      )}>
                        {u.emailVerified ? "Verified" : "Unverified"}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* 2. Location */}
                <div className="flex flex-col gap-1 w-full lg:w-auto">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">
                      {u.countryCode === "IN" || !u.countryCode ? "🇮🇳" : "🌐"}
                    </span>
                    <p className="text-[13px] font-bold text-white/80">
                      {u.location?.split(',')[0] || "Kerala"}, India
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-blue-400/60 font-black uppercase tracking-widest pl-7">
                    <Globe className="w-3 h-3" />
                    {u.isp || "BSNL INTERNET"}
                  </div>
                </div>

                {/* 3. Session */}
                <div className="w-full">
                  <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-3 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/5 shrink-0">
                      {u.device === "Phone" ? <Smartphone className="w-5 h-5 text-cyan-400" /> : <Monitor className="w-5 h-5 text-yellow-400" />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[12px] font-black uppercase tracking-wider text-white/90">
                        {u.device || "Desktop PC"}
                      </p>
                      <p className="text-[10px] text-white/30 font-bold uppercase truncate">
                        {u.os || "Windows"} · {u.browser?.split('/')[0] || "Browser"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 4. Privileges */}
                <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
                  {isOwner && (
                    <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20 text-[10px] font-black h-7 px-3 rounded-full uppercase tracking-tighter">
                      Owner
                    </Badge>
                  )}
                  {isAdmin && (
                    <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-[10px] font-black h-7 px-3 rounded-full uppercase tracking-tighter">
                      Admin
                    </Badge>
                  )}
                  {u.hasAdultAccess && (
                    <Badge className="bg-red-500/10 text-red-500 border-red-500/20 text-[10px] font-black h-7 px-3 rounded-full uppercase tracking-tighter">
                      Adult+
                    </Badge>
                  )}
                </div>

                {/* 5. Actions */}
                <div className="flex items-center justify-end gap-2 w-full lg:w-auto">
                  {u.email !== currentUser?.email && !isOwner && (
                    <>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => toggleAdultAccess(u.email, !!u.hasAdultAccess)}
                        className={cn(
                          "w-10 h-10 rounded-xl transition-all border",
                          u.hasAdultAccess ? "bg-red-500/10 text-red-400 border-red-500/20" : "bg-white/5 text-white/20 border-white/5"
                        )}
                      >
                        <Flame className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => toggleAdmin(u.email, !!u.isAdmin)}
                        className={cn(
                          "w-10 h-10 rounded-xl transition-all border",
                          isAdmin ? "bg-blue-500/10 text-blue-400 border-blue-500/20" : "bg-white/5 text-white/20 border-white/5"
                        )}
                      >
                        <Shield className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => deleteUser(u.email)}
                        className="w-10 h-10 rounded-xl text-white/20 hover:text-red-500 hover:bg-red-500/10 border border-white/5"
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
                          "w-10 h-10 rounded-xl transition-all border",
                          editingPassword?.email === u.email ? "bg-blue-500 text-white" : "bg-white/5 text-white/20 border-white/5"
                        )}
                      >
                        <Key className="w-4 h-4" />
                      </Button>
                      {editingPassword?.email === u.email && (
                        <div className="absolute right-0 bottom-full mb-3 w-52 p-4 bg-[#1A1A1A] border border-white/10 rounded-2xl shadow-2xl z-50 animate-in fade-in slide-in-from-bottom-2">
                          <Input 
                            autoFocus
                            placeholder="Set Security Key"
                            value={editingPassword.value}
                            onChange={(e) => setEditingPassword({ ...editingPassword, value: e.target.value })}
                            className="h-10 text-xs bg-black/40 border-white/10 mb-2 rounded-xl"
                          />
                          <Button 
                            className="w-full h-9 text-[10px] font-black uppercase bg-blue-600 hover:bg-blue-500 rounded-xl"
                            onClick={() => {
                              setUserPassword(u.email, editingPassword.value);
                              setEditingPassword(null);
                            }}
                          >
                            Update Protocol
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

              </div>
            </div>
          );
        })}

        {filteredUsers.length === 0 && (
          <div className="flex flex-col items-center justify-center py-40 border border-white/5 rounded-[3rem] bg-white/[0.01]">
            <Users className="w-12 h-12 text-white/5 mb-4" />
            <p className="text-white/20 text-[11px] font-black uppercase tracking-[0.2em]">
              No matching records in database
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;
