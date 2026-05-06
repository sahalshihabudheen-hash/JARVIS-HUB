import * as React from "react";
import { useNavigate } from "react-router-dom";
import {
  Calculator,
  Calendar,
  CreditCard,
  Settings,
  Smile,
  User,
  Search,
  Film,
  Tv,
  Flame,
  History,
  Shield,
  LayoutDashboard,
  Sparkles,
} from "lucide-react";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { useAuth } from "@/context/AuthContext";

export function CommandPalette() {
  const [open, setOpen] = React.useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const runCommand = React.useCallback((command: () => void) => {
    setOpen(false);
    command();
  }, []);

  return (
    <>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a protocol or search content..." />
        <CommandList className="max-h-[450px]">
          <CommandEmpty>No protocols found.</CommandEmpty>
          <CommandGroup heading="System Navigation">
            <CommandItem onSelect={() => runCommand(() => navigate("/"))}>
              <Sparkles className="mr-2 h-4 w-4 text-blue-400" />
              <span>Jarvis Mainframe</span>
              <CommandShortcut>⌘H</CommandShortcut>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => navigate("/movies"))}>
              <Film className="mr-2 h-4 w-4" />
              <span>Cinema Protocols</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => navigate("/tv"))}>
              <Tv className="mr-2 h-4 w-4" />
              <span>TV Transmission</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => navigate("/anime"))}>
              <Flame className="mr-2 h-4 w-4 text-orange-400" />
              <span>Anime Realities</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => navigate("/search"))}>
              <Search className="mr-2 h-4 w-4" />
              <span>Search Node</span>
              <CommandShortcut>⌘S</CommandShortcut>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Personal Archive">
            <CommandItem onSelect={() => runCommand(() => navigate("/"))}>
              <History className="mr-2 h-4 w-4" />
              <span>History (Home)</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => navigate("/watchlist"))}>
              <History className="mr-2 h-4 w-4" />
              <span>Watchlist</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => navigate("/settings"))}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Neural Settings</span>
              <CommandShortcut>⌘P</CommandShortcut>
            </CommandItem>
          </CommandGroup>
          
          {(user?.isAdmin || user?.email?.toLowerCase() === "admin@gmail.com") && (
            <>
              <CommandSeparator />
              <CommandGroup heading="Admin Terminal">
                <CommandItem onSelect={() => runCommand(() => navigate("/admin"))}>
                  <LayoutDashboard className="mr-2 h-4 w-4 text-yellow-400" />
                  <span>Admin Dashboard</span>
                </CommandItem>
                <CommandItem onSelect={() => runCommand(() => navigate("/adult"))}>
                  <Shield className="mr-2 h-4 w-4 text-red-400" />
                  <span>Adult Hub Access</span>
                </CommandItem>
              </CommandGroup>
            </>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
