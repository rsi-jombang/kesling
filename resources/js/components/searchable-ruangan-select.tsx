import * as React from "react";
import { Check, ChevronsUpDown, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

interface Ruangan {
  id: number;
  nama_ruangan: string;
}

interface SearchableRuanganSelectProps {
  ruangans: Ruangan[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  error?: boolean;
  id?: string;
}

export function SearchableRuanganSelect({
  ruangans,
  value,
  onValueChange,
  placeholder = "Pilih ruangan...",
  error,
  id,
}: SearchableRuanganSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");

  const filteredRuangans = React.useMemo(() => {
    if (!search) return ruangans;
    return ruangans.filter((r) =>
      r.nama_ruangan.toLowerCase().includes(search.toLowerCase())
    );
  }, [ruangans, search]);

  const selectedRuangan = React.useMemo(
    () => ruangans.find((r) => r.id.toString() === value),
    [ruangans, value]
  );

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          id={id}
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between font-normal h-10 bg-transparent hover:bg-transparent text-left",
            !value && "text-muted-foreground",
            error && "border-destructive ring-destructive/20"
          )}
        >
          <span className="truncate">
            {selectedRuangan ? selectedRuangan.nama_ruangan : placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        className="w-[var(--radix-dropdown-menu-trigger-width)] p-0" 
        align="start"
      >
        <div className="flex flex-col">
          <div className="flex items-center border-b px-3 py-2 gap-2 sticky top-0 bg-popover z-10">
            <Search className="h-4 w-4 shrink-0 opacity-50" />
            <Input
              placeholder="Cari ruangan..."
              className="h-8 border-none focus-visible:ring-0 px-0 bg-transparent"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
            {search && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6" 
                onClick={() => setSearch("")}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
          
          <div className="max-h-64 overflow-y-auto p-1">
            {filteredRuangans.length > 0 ? (
              filteredRuangans.map((r) => (
                <div
                  key={r.id}
                  className={cn(
                    "relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
                    value === r.id.toString() && "bg-accent/50"
                  )}
                  onClick={() => {
                    onValueChange(r.id.toString());
                    setOpen(false);
                    setSearch("");
                  }}
                >
                  <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                    {value === r.id.toString() && (
                      <Check className="h-4 w-4" />
                    )}
                  </span>
                  {r.nama_ruangan}
                </div>
              ))
            ) : (
              <div className="py-6 text-center text-sm text-muted-foreground">
                Tidak ada ruangan ditemukan.
              </div>
            )}
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
