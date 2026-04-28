import { useState } from "react";
import { 
  Users, 
  Search,
  Smartphone, 
  Monitor, 
  Shield, 
  Trash2, 
  Key, 
  Flame,
  Globe,
  RefreshCw,
  MoreVertical,
  CheckCircle2,
  XCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAdmin } from "@/context/AdminContext";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const UserManagement = () => {
  const { users, refreshData, toggleAdmin, deleteUser, setUserPassword, toggleAdultAccess } = useAdmin();
  const { user: currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
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
    return (u.email || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
           (u.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
           (u.location || "").toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-[1600px] mx-auto pb-20 px-4">
      {/* Top Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#0A0A0A] border border-white/5 p-6 rounded-[2rem] flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 mb-1">Total Users</p>
            <h3 className="text-3xl font-black text-white">{users.length}</h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
            <Users className="text-blue-500 w-6 h-6" />
          </div>
        </div>
        <div className="bg-[#0A0A0A] border border-white/5 p-6 rounded-[2rem] flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 mb-1">Active Now</p>
            <h3 className="text-3xl font-black text-green-500">{users.filter(u => isActuallyOnline(u)).length}</h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center border border-green-500/20">
            <RefreshCw className="text-green-500 w-6 h-6" />
          </div>
        </div>
        <div className="bg-[#0A0A0A] border border-white/5 p-4 rounded-[2rem] flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
            <Input 
              placeholder="Search User Protocol..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white/[0.03] border-none pl-11 rounded-xl h-12 text-sm focus-visible:ring-blue-500/50"
            />
          </div>
          <Button onClick={refreshData} variant="ghost" size="icon" className="w-12 h-12 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5">
            <RefreshCw className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-[#0A0A0A] border border-white/5 rounded-[2.5rem] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-white/30">User Protocol</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Geographic Data</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Active Terminal</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Security Status</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-white/30 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredUsers.map((u) => {
                const isOwner = u.email === "admin@gmail.com";
                const isOnline = isActuallyOnline(u);

                return (
                  <tr key={u.id} className="group hover:bg-white/[0.02] transition-colors">
                    {/* User Identity */}
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="relative shrink-0">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-white/5 flex items-center justify-center overflow-hidden">
                            {u.photoURL ? (
                              <img src={u.photoURL} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-lg font-bold text-blue-400">
                                {(u.name?.[0] || u.email?.[0] || "?").toUpperCase()}
                              </span>
                            )}
                          </div>
                          {isOnline && (
                            <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-green-500 border-2 border-[#0A0A0A] shadow-[0_0_8px_#22c55e]" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-[14px] font-bold text-white truncate max-w-[200px]">
                            {u.name || u.email?.split('@')[0]}
                          </h4>
                          <p className="text-[11px] text-white/30 truncate max-w-[200px]">{u.email}</p>
                          <div className="flex items-center gap-1.5 mt-1">
                            {isOnline && <span className="w-1 h-1 rounded-full bg-green-500 animate-pulse" />}
                            <span className={cn("text-[10px] font-bold uppercase tracking-wider", isOnline ? "text-green-500/80" : "text-white/20")}>
                              {isOnline ? "Active Connection" : "Offline"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Location */}
                    <td className="px-6 py-6">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="text-base">{u.countryCode === "IN" || !u.countryCode ? "🇮🇳" : "🌐"}</span>
                          <span className="text-[13px] font-bold text-white/80">{u.location?.split(',')[0] || "Kerala"}</span>
                        </div>
                        <p className="text-[10px] text-blue-400/60 font-black uppercase tracking-widest pl-6">{u.isp || "BSNL Internet"}</p>
                      </div>
                    </td>

                    {/* Device */}
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-3 bg-white/[0.03] border border-white/5 rounded-xl p-2 pr-4 w-fit">
                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/5 shrink-0">
                          {u.device === "Phone" ? <Smartphone className="w-4 h-4 text-cyan-400" /> : <Monitor className="w-4 h-4 text-yellow-400" />}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[11px] font-black uppercase text-white/90 leading-none mb-1">{u.device || "Desktop"}</p>
                          <p className="text-[9px] text-white/30 font-bold uppercase truncate">{u.os || "Win"} · {u.browser?.split('/')[0] || "Edge"}</p>
                        </div>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-6">
                      <div className="flex flex-wrap gap-2">
                        {isOwner && (
                          <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20 text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-tighter">
                            Root Owner
                          </Badge>
                        )}
                        {u.isAdmin && (
                          <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-tighter">
                            Admin Access
                          </Badge>
                        )}
                        {u.emailVerified ? (
                          <Badge className="bg-teal-500/10 text-teal-400 border-teal-500/20 text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-tighter flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Verified
                          </Badge>
                        ) : (
                          <Badge className="bg-red-500/10 text-red-500 border-red-500/20 text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-tighter flex items-center gap-1">
                            <XCircle className="w-3 h-3" /> Unverified
                          </Badge>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        {u.email !== currentUser?.email && !isOwner && (
                          <>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => toggleAdultAccess(u.email, !!u.hasAdultAccess)}
                              className={cn("w-9 h-9 rounded-xl border", u.hasAdultAccess ? "bg-red-500/10 text-red-400 border-red-500/20" : "bg-white/5 text-white/20 border-white/5")}
                            >
                              <Flame className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => toggleAdmin(u.email, !!u.isAdmin)}
                              className={cn("w-9 h-9 rounded-xl border", u.isAdmin ? "bg-blue-500/10 text-blue-400 border-blue-500/20" : "bg-white/5 text-white/20 border-white/5")}
                            >
                              <Shield className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="w-9 h-9 rounded-xl bg-white/5 border border-white/5 text-white/40">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-[#1A1A1A] border-white/10 rounded-2xl p-2 w-48 shadow-2xl">
                            {currentUser?.email === "admin@gmail.com" && (
                              <DropdownMenuItem 
                                onClick={() => setEditingPassword({ email: u.email, value: u.password || "" })}
                                className="rounded-xl focus:bg-blue-500/10 focus:text-blue-400 gap-3"
                              >
                                <Key className="w-4 h-4" /> Set Security Key
                              </DropdownMenuItem>
                            )}
                            {u.email !== currentUser?.email && !isOwner && (
                              <DropdownMenuItem 
                                onClick={() => deleteUser(u.email)}
                                className="rounded-xl focus:bg-red-500/10 focus:text-red-400 gap-3"
                              >
                                <Trash2 className="w-4 h-4" /> Delete Account
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="py-32 flex flex-col items-center justify-center text-center">
            <Users className="w-12 h-12 text-white/5 mb-4" />
            <h3 className="text-white/20 text-xs font-black uppercase tracking-[0.3em]">No Intelligence Records Found</h3>
          </div>
        )}
      </div>

      {/* Password Edit Modal */}
      {editingPassword && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#121212] border border-white/10 rounded-[2.5rem] p-8 w-full max-w-md shadow-2xl">
            <div className="w-16 h-16 rounded-[1.5rem] bg-blue-500/10 flex items-center justify-center border border-blue-500/20 mb-6 mx-auto">
              <Key className="text-blue-500 w-8 h-8" />
            </div>
            <h3 className="text-xl font-black text-white text-center mb-2">Update Security Protocol</h3>
            <p className="text-white/40 text-sm text-center mb-8 px-4">Set a new manual access key for {editingPassword.email}</p>
            
            <Input 
              autoFocus
              placeholder="New Access Key..."
              value={editingPassword.value}
              onChange={(e) => setEditingPassword({ ...editingPassword, value: e.target.value })}
              className="bg-white/5 border-white/10 h-12 rounded-xl mb-6 text-center text-lg font-bold focus:ring-blue-500/50"
            />
            
            <div className="grid grid-cols-2 gap-3">
              <Button variant="ghost" onClick={() => setEditingPassword(null)} className="rounded-xl h-12 text-white/40">Cancel</Button>
              <Button 
                onClick={() => {
                  setUserPassword(editingPassword.email, editingPassword.value);
                  setEditingPassword(null);
                }}
                className="bg-blue-600 hover:bg-blue-500 rounded-xl h-12 font-bold"
              >
                Sync Key
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
