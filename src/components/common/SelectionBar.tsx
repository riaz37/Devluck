"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, X, Fingerprint } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SelectionBarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onDeleteClick: () => void;
  isVisible: boolean;
  className?: string;
}
   
export function SelectionBar({
  selectedCount,
  onClearSelection,
  onDeleteClick,
  isVisible,
  className,
}: SelectionBarProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 80, x: "-50%", opacity: 0, scale: 0.95 }}
          animate={{ y: 0, x: "-50%", opacity: 1, scale: 1 }}
          exit={{ y: 80, x: "-50%", opacity: 0, scale: 0.95 }}
          transition={{ type: "spring", damping: 20, stiffness: 120 }}
          className={cn(
            "fixed bottom-10 left-1/2 z-50 w-fit min-w-[340px]",
            className
          )}
        >
          <div
            className={cn(
              "relative flex items-center justify-between gap-8 px-4 py-2.5",
              "bg-card ",
              "rounded-xl shadow-sm",
            )}
          >
            {/* LEFT: Selection Context */}
            <div className="flex items-center gap-4 pl-2">
              <div className="relative">
                <span className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-xl bg-primary text-primary-foreground text-[11px] font-black",
                  "shadow-[0_4px_12px_oklch(var(--primary)/0.3)] transition-transform duration-300 group-hover:scale-110"
                )}>
                  {selectedCount}
                </span>
                <Fingerprint className="absolute -top-1 -right-1 h-3 w-3 text-primary-foreground/40" />
              </div>
              
              <div className="flex flex-col">
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 leading-none mb-1">
                  Bulk Actions
                </span>
                <span className="text-xs font-bold text-foreground tracking-tight">
                  Items Selected
                </span>
              </div>
            </div>

            {/* RIGHT: Actions Grid */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearSelection}
                className={cn(
                  "h-10 w-10 p-0 rounded-xl border border-transparent transition-all",
                  "text-muted-foreground/60",
                  "hover:bg-primary/10 hover:text-primary hover:border-primary/30 cursor-pointer",
                )}
              >
                <X className="w-4 h-4 transition-colors" />
              </Button>

              <Button
                variant="destructive"
                size="sm"
                onClick={onDeleteClick}
                className={cn(
                  "h-10 px-5 rounded-xl gap-2.5 font-black text-[10px] uppercase tracking-widest transition-all",
                  "bg-destructive hover:bg-destructive/90",
                  "shadow-[0_4px_12px_oklch(var(--destructive)/0.2)] hover:shadow-[0_8px_20px_oklch(var(--destructive)/0.3)] hover:scale-[1.02] cursor-pointer",
                  "active:scale-95"
                )}
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete
              </Button>
            </div>


          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}