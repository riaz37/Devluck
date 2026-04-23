"use client";

import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type LoadingStateProps = {
  label?: string;
  className?: string;
};

export function LoadingState({ 
  label = "Gathering your data...", 
  className 
}: LoadingStateProps) {
  return (
    <div  
      className={cn(
        "flex min-h-[400px] w-full flex-col items-center justify-center rounded-3xl  backdrop-blur-[2px] p-8 animate-in fade-in duration-700",
        className
      )}
    >
      {/* ANIMATED ICON WITH GLOW */}
      <div className="relative mb-6">
        {/* Outer Glow Ring */}
        <div className="absolute inset-0 h-16 w-16 scale-150 bg-primary/20 blur-2xl rounded-full animate-pulse" />
        
        {/* Main Spinner */}
        <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-xl bg-background border border-border/50 shadow-sm">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      </div>

      {/* LOADING TEXT */}
      <div className="flex flex-col items-center gap-2">
        <p className="text-sm font-medium tracking-wide text-foreground animate-pulse">
          {label}
        </p>
        
        {/* Subtle Progress bar simulation */}
        <div className="h-1 w-32 overflow-hidden rounded-full bg-muted">
          <div className="h-full w-full origin-left bg-primary/40 animate-loading-bar" />
        </div>
      </div>
    </div>
  );
}