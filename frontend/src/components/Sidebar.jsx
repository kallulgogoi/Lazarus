import { Search, Activity, Shield, Loader2 } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";
import { Avatar, AvatarFallback } from "./ui/avatar";

const Sidebar = ({
  patients,
  onSelect,
  selectedId,
  searchQuery,
  setSearchQuery,
  lastElementRef,
}) => {
  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <aside className="w-full sm:w-80 h-full border-r bg-card flex flex-col overflow-hidden">
      <div className="p-6 border-b shrink-0">
        <div className="flex items-center gap-2 mb-6 text-primary">
          <Activity className="h-5 w-5" />
          <h2 className="font-bold text-lg uppercase tracking-widest">
            Registry
          </h2>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Filter Identities..."
            className="pl-9 h-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <ScrollArea className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-2">
          {patients.map((patient, index) => (
            <Button
              key={`${patient.ghost_id}-${index}`}
              variant={selectedId === patient.ghost_id ? "default" : "ghost"}
              className={`w-full justify-start h-auto p-4 transition-all ${
                selectedId === patient.ghost_id
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              }`}
              onClick={() => onSelect(patient)}
            >
              <div className="flex items-start gap-3 w-full">
                <Avatar className="h-10 w-10 border shadow-sm shrink-0">
                  <AvatarFallback
                    className={
                      selectedId === patient.ghost_id
                        ? "bg-primary-foreground/20"
                        : "bg-muted"
                    }
                  >
                    {getInitials(patient.decoded_name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 text-left overflow-hidden">
                  <div className="flex items-center justify-between mb-1 gap-2">
                    <p className="font-bold text-sm truncate">
                      {patient.decoded_name}
                    </p>
                    <Badge
                      variant={
                        selectedId === patient.ghost_id
                          ? "secondary"
                          : "outline"
                      }
                      className="text-[9px] font-mono shrink-0"
                    >
                      {patient.ghost_id}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-xs opacity-70">
                    <span>{patient.age}y</span>
                    <span>•</span>
                    <span className="truncate">{patient.ward}</span>
                  </div>
                </div>
              </div>
            </Button>
          ))}

          <div
            ref={lastElementRef}
            className="h-10 w-full flex items-center justify-center opacity-50"
          >
            {patients.length > 0 && (
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
            )}
          </div>
        </div>
      </ScrollArea>

      <div className="p-4 border-t bg-muted/20 shrink-0">
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground uppercase tracking-widest font-black">
          <Shield className="h-3 w-3 text-primary" />
          <span>Project Lazarus</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
