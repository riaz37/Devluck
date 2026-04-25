"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

export function OpportunityCardSkeleton() {
  return (
    <Card className="rounded-2xl shadow-sm">

      {/* HEADER */}
      <CardHeader className="flex flex-row items-center justify-between">

        {/* LEFT SIDE */}
        <div className="flex items-center gap-3">

          <Skeleton className="h-10 w-10 rounded-full" />

          <div className="space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-28" />
          </div>

        </div>

        {/* BADGE */}
        <Skeleton className="h-5 w-20 rounded-full" />

      </CardHeader>

      {/* CONTENT */}
      <CardContent className="space-y-4">

        {/* BADGES */}
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-5 w-24 rounded-full" />
        </div>

        <Separator />

        {/* DESCRIPTION */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-11/12" />
        </div>

        {/* PROGRESS */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-3 w-10" />
          </div>
          <Skeleton className="h-2 w-full" />
        </div>

        {/* FOOTER INFO */}
        <div className="grid grid-cols-2 gap-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-20" />
        </div>

      </CardContent>

      {/* FOOTER BUTTONS */}
      <div className="flex gap-2 p-4 pt-0">
        <Skeleton className="h-10 flex-1 rounded-md" />
        <Skeleton className="h-10 flex-1 rounded-md" />
      </div>

    </Card>
  );
}