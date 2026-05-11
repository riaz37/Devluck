"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, LayoutGrid, List, X, ChevronDown, SlidersHorizontal,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command, CommandEmpty, CommandGroup, CommandInput,
  CommandItem, CommandList,
} from "@/components/ui/command";

type ViewMode = "grid" | "list";

interface SearchAndViewBarProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  placeholder?: string;
  // Optional filter props for future expansion
  availableStatuses?: string[];
  selectedStatuses?: string[];
  toggleStatus?: (status: string) => void;
  filterLabel?: string;
}

export function SearchAndViewBar({
  searchQuery,
  setSearchQuery,
  viewMode,
  setViewMode,
  placeholder = "Search opportunities...",
  availableStatuses = [],
  selectedStatuses = [],
  toggleStatus,
  filterLabel = "Filter by status",
}: SearchAndViewBarProps) {
  const [open, setOpen] = React.useState(false);
  const [isFocused, setIsFocused] = React.useState(false);

  const activeFilters = selectedStatuses.filter((s) => s !== "All");
  const isFiltering = activeFilters.length > 0;

  return (
    <div className="flex flex-col gap-3 w-full">

      {/* ── TOP ROW ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full">

        {/* Search — full width on mobile, fixed on desktop */}
        <div className="relative w-full sm:w-120 shrink-0">
          <Search className={cn(
            "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors z-10 pointer-events-none",
            searchQuery || isFocused ? "text-primary" : "text-muted-foreground"
          )} />
          <Input
            value={searchQuery}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={placeholder}
            className="h-10 pl-9 pr-8 rounded-lg text-sm w-full"
          />
          <AnimatePresence>
            {searchQuery && (
              <motion.button
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.7 }}
                transition={{ duration: 0.12 }}
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-sm p-0.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Spacer — only on sm+ */}
        <div className="hidden sm:flex flex-1" />

        {/* Filter + separator + view toggle */}
        <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto shrink-0">

          {/* Filter popover (optional - only shows if statuses provided) */}
          {availableStatuses?.length ? (
            <>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                      "h-10 px-3 gap-1.5 rounded-lg text-sm font-medium flex-1 sm:flex-none justify-center",
                      isFiltering && "border-primary/40 bg-primary/5 text-primary hover:bg-primary/10"
                    )}
                  >
                    <SlidersHorizontal className="h-3.5 w-3.5" />
                    <span>Filter</span>
                    {isFiltering && (
                      <div className="h-4 min-w-4 px-1 text-[10px] rounded-sm bg-primary text-primary-foreground flex items-center justify-center">
                        {activeFilters.length}
                      </div>
                    )}
                    <ChevronDown className={cn(
                      "h-3 w-3 opacity-50 transition-transform duration-200 ml-1",
                      open && "rotate-180"
                    )} />
                  </Button>
                </PopoverTrigger>

                <PopoverContent
                  align="end"
                  onOpenAutoFocus={(e) => e.preventDefault()}
                  className="w-52 p-0 rounded-xl"
                >
                  <Command>
                    <CommandInput placeholder="Search..." className="h-9 text-sm" />
                    <CommandList>
                      <CommandEmpty className="py-4 text-center text-sm text-muted-foreground">
                        No options found.
                      </CommandEmpty>
                      <CommandGroup heading={filterLabel}>
                        {availableStatuses.map((status) => {
                          const isSelected = selectedStatuses?.includes(status);
                          return (
                            <CommandItem
                              key={status}
                              value={status}
                              onSelect={() => toggleStatus?.(status)}
                              className="flex items-center justify-between cursor-pointer text-sm"
                            >
                              <span>{status}</span>
                              <div className={cn(
                                "h-3.5 w-3.5 rounded-sm transition-all",
                                isSelected ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                              )} />
                            </CommandItem>
                          );
                        })}
                      </CommandGroup>

                      {isFiltering && (
                        <>
                          <Separator className="mx-2 my-1 w-auto" />
                          <div className="p-1.5">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => { toggleStatus?.("All"); setOpen(false); }}
                              className="w-full h-7 text-xs text-muted-foreground hover:text-destructive justify-center"
                            >
                              Clear all filters
                            </Button>
                          </div>
                        </>
                      )}
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>

              <Separator orientation="vertical" className="h-8 hidden sm:block" />
            </>
          ) : null}

          {/* View toggle */}
          <div className="flex items-center h-10 rounded-lg border bg-muted/40 p-1 gap-1 flex-1 sm:flex-none">
            <button
              onClick={() => setViewMode("grid")}
              className={cn(
                "flex items-center justify-center gap-1 px-2.5 py-1.5 h-full rounded-md transition-all duration-150 text-xs font-medium min-w-0 flex-1",
                viewMode === "grid"
                  ? "bg-background shadow-sm text-foreground border border-border/50"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
              aria-label="Grid view"
            >
              <LayoutGrid className="h-3.5 w-3.5 flex-shrink-0 flex-shrink" />
              <span >Cards</span>
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "flex items-center justify-center gap-1 px-2.5 py-1.5 h-full rounded-md transition-all duration-150 text-xs font-medium min-w-0 flex-1",
                viewMode === "list"
                  ? "bg-background shadow-sm text-foreground border border-border/50"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
              aria-label="List view"
            >
              <List className="h-3.5 w-3.5 flex-shrink-0" />
              <span >List</span>
            </button>
          </div>

        </div>
      </div>

    </div>
  );
}