"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

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
  const hasIcon = !!icon;

  return (
    <div className="flex flex-col gap-1.5 min-w-0 w-full">

      {/* LABEL */}
      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground leading-none">
        {label}
      </p>

      {/* VALUE ROW */}
      <div
        className={cn(
          "flex gap-1.5",
          hasIcon ? "items-center justify-start" : "items-center justify-center text-center",
          highlight ? "text-primary" : "text-foreground"
        )}
      >
        {hasIcon && (
          <span className="text-muted-foreground shrink-0 [&>svg]:h-3.5 [&>svg]:w-3.5">
            {icon}
          </span>
        )}

        <span className="text-sm font-semibold truncate leading-tight">
          {value ?? "N/A"}
        </span>
      </div>
    </div>
  );
}