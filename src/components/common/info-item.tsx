"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

type InfoItemProps = {
  label: string;
  value: string | number;
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
    <div className="space-y-1 px-1">
      {/* LABEL */}
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>

      {/* VALUE ROW */}
      <div
        className={cn(
          "flex items-center gap-2 transition-colors",
          highlight ? "text-primary" : "text-foreground"
        )}
      >
        {/* ICON */}
        {icon && (
          <div className="flex items-center justify-center text-muted-foreground">
            {icon}
          </div>
        )}

        {/* VALUE */}
        <span className="text-sm font-medium tracking-tight text-foreground">
          {value}
        </span>
      </div>
    </div>
  );
}