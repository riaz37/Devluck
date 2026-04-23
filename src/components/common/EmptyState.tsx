"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

type EmptyStateProps = {
  title: string;
  description: string;
  icon?: ReactNode;
  action?: ReactNode; // Added slot for a CTA button
  className?: string;
};   

export function EmptyState({
  title,
  description,
  icon,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div 
      className={cn(
        "flex min-h-[300px] w-full flex-col items-center justify-center rounded-3xl  p-8 text-center animate-in fade-in zoom-in-95 duration-500",
        className
      )}
    >
      {/* ICON WITH GLOW */}
      {icon && (
        <div className="relative mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/80 text-muted-foreground ">
          <div className="absolute inset-0 bg-primary/5 blur-xl rounded-full" />
          <div className="relative z-10 scale-125">
             {icon}
          </div>
        </div>
      )}

      {/* TEXT CONTENT */}
      <div className="max-w-[280px] space-y-2">
        <h3 className="text-xl font-bold tracking-tight text-foreground">
          {title}
        </h3>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>

      {/* OPTIONAL ACTION BUTTON */}
      {action && (
        <div className="mt-6">
          {action}
        </div>
      )}
    </div>
  );
}