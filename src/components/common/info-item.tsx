"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

type InfoItemProps = {
  label: string;
  value: string | number | ReactNode;
  icon?: ReactNode;
  highlight?: boolean;
};

export function InfoItem({
  label,
  value,
  icon,
  highlight = false,
}: InfoItemProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg bg-muted/50 px-3 py-2.5 gap-0.5 min-w-0 w-full">
      {/* LABEL + ICON */}
      <div className="flex items-center gap-1 text-muted-foreground text-[11px]">
        {icon}
        <span>{label}</span>
      </div>
      
      {/* VALUE */}
      <p 
        className={cn(
          "text-sm font-semibold truncate max-w-full text-center",
          highlight ? "text-primary" : "text-foreground"
        )}
      >
        {value ?? "N/A"}
      </p>
    </div>
  );
}