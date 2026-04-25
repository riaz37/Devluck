"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

export function AppliedOpportunityCardSkeleton() {
  return (
    <Card className="rounded-2xl shadow-sm">

      {/* HEADER */}
      <CardHeader className="flex flex-row items-start justify-between pb-2">

        {/* LEFT SIDE (IMAGE + TEXT) */}
        <div className="flex items-center gap-3 min-w-0">

          {/* IMAGE */}
          <Skeleton className="h-10 w-10 rounded-full shrink-0" />

          {/* TEXT */}
          <div className="space-y-2 min-w-0">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-28" />
          </div>

        </div>

        {/* MENU ICON */}
        <Skeleton className="h-8 w-8 rounded-md shrink-0" />

      </CardHeader>

      {/* CONTENT */}
      <CardContent className="space-y-3">

        {/* STATUS ROW */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>

        <Separator />

        {/* INFO GRID */}
        <div className="grid grid-cols-2 gap-3">

          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className="h-4 w-20" />
          </div>

          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className="h-4 w-20" />
          </div>

          <div className="col-span-2 flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded-full shrink-0" />
            <Skeleton className="h-4 w-full" />
          </div>

        </div>

        <Separator />

        {/* DEADLINE */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className="h-4 w-20" />
          </div>

          <Skeleton className="h-4 w-24" />
        </div>

      </CardContent>

      {/* FOOTER */}
      <div className="p-4 pt-0">
        <Skeleton className="h-10 w-full rounded-md" />
      </div>

    </Card>
  );
}