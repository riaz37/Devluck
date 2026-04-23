"use client";

import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCcw } from "lucide-react";
import { cn } from "@/lib/utils";

type ErrorStateProps = {
  title?: string;
  description?: string;
  icon?: ReactNode;
  onRetry?: () => void;
  className?: string;
};
   
export function ErrorState({
  title = "Something went wrong",
  description = "We encountered an error while fetching your data.",
  icon,
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "flex min-h-[400px] w-full flex-col items-center justify-center  p-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-500",
        className
      )}
    >
      {/* ERROR ICON WITH SOFT GLOW */}
      <div className="relative mb-6 flex h-16 w-16 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
        <div className="absolute inset-0 bg-destructive/5 blur-2xl rounded-full" />
        <div className="relative z-10">
          {icon || <AlertCircle className="h-10 w-10" />}
        </div>
      </div>

      {/* TEXT CONTENT */}
      <div className="max-w-[320px] space-y-2">
        <h3 className="text-xl font-bold tracking-tight text-foreground">
          {title}
        </h3>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>

      {/* RETRY ACTION */}
      {onRetry && (
        <Button
          variant="destructive"
          size="lg"
          className="mt-8 px-8 shadow-lg shadow-destructive/20 transition-all hover:scale-105 active:scale-95"
          onClick={onRetry}
        >
          <RefreshCcw className="mr-2 h-4 w-4" />
          Try Again
        </Button>
      )}
    </div>
  );
}