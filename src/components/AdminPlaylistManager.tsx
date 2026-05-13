import { useState, useEffect } from "react";
import { 
  Plus, 
  Trash2, 
  Edit2, 
  Search, 
  LayoutList, 
  Film, 
  Check, 
  X,
  GripVertical
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { db } from "@/lib/firebase";
import { 
  collection, 
  addDoc, 
  deleteDoc, 
  doc, 
  updateDoc, 
  onSnapshot, 
  query, 
  orderBy,
  Timestamp
} from "firebase/firestore";
import { cn } from "@/lib/utils";

interface PlaylistItem {
  id: string;
  title: string;
  poster_path: string;
  media_type: 'movie' | 'tv';
}

interface Playlist {
  id: string;
  name: string;
  description: string;
  items: PlaylistItem[];
  createdAt: any;
  isActive: boolean;
}

const AdminPlaylistManager = () => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // New Playlist State
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  
  // Search state for adding items to playlist
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedItems, setSelectedItems] = useState<PlaylistItem[]>([]);

  useEffect(() => {
    const q = query(collection(db, "playlists"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Playlist));
      setPlaylists(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    try {
      const API_KEY = "3fd2be3d0c73ad2a66d788414a306859"; // TMDB Key from existing project context
      const response = await fetch(
        `https://api.themoviedb.org/3/search/multi?api_key=${API_KEY}&query=${encodeURIComponent(searchQuery)}`
      );
      const data = await response.json();
      setSearchResults(data.results.filter((r: any) => r.media_type !== 'person'));
    } catch (error) {
      toast.error("Search failed");
    }
  };

  const toggleItemSelection = (item: any) => {
    const exists = selectedItems.find(i => i.id === item.id.toString());
    if (exists) {
      setSelectedItems(selectedItems.filter(i => i.id !== item.id.toString()));
    } else {
      setSelectedItems([...selectedItems, {
        id: item.id.toString(),
        title: item.title || item.name,
        poster_path: item.poster_path,
        media_type: item.media_type
      }]);
    }
  };

  const createPlaylist = async () => {
    if (!newName.trim()) {
      toast.error("Playlist name is required");
      return;
    }

    try {
      await addDoc(collection(db, "playlists"), {
        name: newName,
        description: newDesc,
        items: selectedItems,
        isActive: true,
        createdAt: Timestamp.now()
      });
      toast.success("Playlist created successfully");
      resetForm();
    } catch (error) {
      toast.error("Failed to create playlist");
    }
  };

  const deletePlaylist = async (id: string) => {
    if (!confirm("Are you sure you want to delete this playlist?")) return;
    try {
      await deleteDoc(doc(db, "playlists", id));
      toast.success("Playlist deleted");
    } catch (error) {
      toast.error("Failed to delete playlist");
    }
  };

  const toggleStatus = async (playlist: Playlist) => {
    try {
      await updateDoc(doc(db, "playlists", playlist.id), {
        isActive: !playlist.isActive
      });
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const resetForm = () => {
    setIsAdding(false);
    setEditingId(null);
    setNewName("");
    setNewDesc("");
    setSelectedItems([]);
    setSearchQuery("");
    setSearchResults([]);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center">
            <LayoutList className="text-blue-500 w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-black italic tracking-tighter text-white">PLAYLIST <span className="text-blue-500">ENGINE</span></h2>
            <p className="text-xs text-white/30 uppercase tracking-[0.2em] font-bold">Manage curated collections</p>
          </div>
        </div>
        
        <Button 
          onClick={() => setIsAdding(true)}
          className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl px-6 font-black uppercase tracking-widest text-[10px] h-12"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Collection
        </Button>
      </div>

      {/* Add/Edit Modal (Simulated) */}
      {isAdding && (
        <div className="bg-[#111] border border-white/10 rounded-3xl p-8 animate-in slide-in-from-top-4 duration-500">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-3 block">Collection Identity</label>
                <Input 
                  placeholder="e.g. Marvel Cinematic Universe" 
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="bg-black/40 border-white/5 focus:border-blue-500/50 h-14 rounded-2xl font-bold text-white"
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-3 block">Briefing (Optional)</label>
                <textarea 
                  placeholder="Describe this collection..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full bg-black/40 border-white/5 focus:border-blue-500/50 rounded-2xl p-4 font-medium text-white min-h-[120px] outline-none"
                />
              </div>

              <div className="pt-4 flex gap-4">
                <Button 
                  onClick={createPlaylist}
                  className="flex-1 bg-white text-black hover:bg-blue-500 hover:text-white rounded-2xl h-14 font-black uppercase tracking-widest text-[11px]"
                >
                  Deploy Collection
                </Button>
                <Button 
                  variant="outline"
                  onClick={resetForm}
                  className="bg-transparent border-white/10 text-white/40 hover:text-white rounded-2xl h-14 px-8 font-black uppercase tracking-widest text-[11px]"
                >
                  Abort
                </Button>
              </div>
            </div>

            <div className="space-y-6">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-3 block">Payload Injection ({selectedItems.length})</label>
              
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                  <Input 
                    placeholder="Search TMDB Core..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="bg-black/40 border-white/5 pl-12 h-14 rounded-2xl font-bold text-white"
                  />
                </div>
                <Button 
                  onClick={handleSearch}
                  className="bg-blue-600 hover:bg-blue-500 h-14 w-14 rounded-2xl"
                >
                  <Search className="w-5 h-5" />
                </Button>
              </div>

              <div className="max-h-[300px] overflow-y-auto pr-2 space-y-2 scrollbar-thin">
                {searchResults.length > 0 ? (
                  searchResults.map((item: any) => {
                    const isSelected = selectedItems.some(i => i.id === item.id.toString());
                    return (
                      <div 
                        key={item.id} 
                        className={cn(
                          "flex items-center gap-4 p-3 rounded-2xl border transition-all cursor-pointer group",
                          isSelected ? "bg-blue-500/20 border-blue-500/50" : "bg-white/5 border-white/5 hover:border-white/10"
                        )}
                        onClick={() => toggleItemSelection(item)}
                      >
                        <img 
                          src={`https://image.tmdb.org/t/p/w92${item.poster_path}`} 
                          className="w-10 h-14 rounded-lg object-cover"
                          onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/92x138?text=NO+IMG'; }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-white truncate">{item.title || item.name}</p>
                          <p className="text-[10px] text-white/30 uppercase font-black">{item.media_type} • {item.release_date?.split('-')[0] || item.first_air_date?.split('-')[0] || 'N/A'}</p>
                        </div>
                        {isSelected ? (
                          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        ) : (
                          <Plus className="w-5 h-5 text-white/20 group-hover:text-white transition-colors" />
                        )}
                      </div>
                    );
                  })
                ) : searchQuery && (
                  <p className="text-center py-10 text-white/20 text-xs font-bold uppercase tracking-widest">No results found</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Playlists List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {playlists.map((playlist) => (
          <div key={playlist.id} className="bg-[#111] border border-white/5 rounded-3xl p-6 group hover:border-blue-500/30 transition-all shadow-xl">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                  <Film className="w-6 h-6 text-white/40" />
                </div>
                <div>
                  <h3 className="text-lg font-black italic text-white group-hover:text-blue-400 transition-colors">{playlist.name}</h3>
                  <p className="text-[10px] text-white/20 font-black uppercase tracking-widest">{playlist.items.length} Elements Linked</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => toggleStatus(playlist)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all",
                    playlist.isActive 
                      ? "bg-green-500/10 border-green-500/20 text-green-500" 
                      : "bg-white/5 border-white/10 text-white/30"
                  )}
                >
                  {playlist.isActive ? "Active" : "Disabled"}
                </button>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => deletePlaylist(playlist.id)}
                  className="w-8 h-8 rounded-lg hover:bg-red-500/20 hover:text-red-500 text-white/10"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <p className="text-sm text-white/40 line-clamp-2 mb-6 font-medium">
              {playlist.description || "No briefing provided for this collection."}
            </p>

            <div className="flex -space-x-3 overflow-hidden mb-6">
              {playlist.items.slice(0, 5).map((item, idx) => (
                <div key={idx} className="w-10 h-14 rounded-xl border-2 border-[#111] overflow-hidden bg-black shrink-0 shadow-lg">
                  <img 
                    src={`https://image.tmdb.org/t/p/w92${item.poster_path}`} 
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/92x138?text=NO+IMG'; }}
                  />
                </div>
              ))}
              {playlist.items.length > 5 && (
                <div className="w-10 h-14 rounded-xl border-2 border-[#111] bg-white/5 flex items-center justify-center shrink-0">
                  <span className="text-[10px] font-bold text-white/40">+{playlist.items.length - 5}</span>
                </div>
              )}
            </div>

            <div className="pt-6 border-t border-white/5 flex items-center justify-between">
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/10">
                Created {playlist.createdAt?.toDate ? playlist.createdAt.toDate().toLocaleDateString() : 'Recently'}
              </span>
              <Button variant="link" className="text-blue-500 text-[10px] font-black uppercase tracking-widest p-0 h-auto">
                Modify Payload →
              </Button>
            </div>
          </div>
        ))}

        {playlists.length === 0 && !loading && !isAdding && (
          <div className="col-span-full py-32 flex flex-col items-center justify-center bg-[#111] border border-white/5 border-dashed rounded-[3rem]">
            <LayoutList className="w-16 h-16 text-white/5 mb-6" />
            <h3 className="text-xl font-bold text-white/20 uppercase tracking-widest">No Active Collections</h3>
            <p className="text-xs text-white/10 mt-2">Initialize the first collection to populate the frontend</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPlaylistManager;
