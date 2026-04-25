"use client";

import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function ContractCardSkeleton() {
  return (
    <Card className="rounded-2xl shadow-sm">
      
      {/* HEADER */}
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        
        <div className="space-y-2 w-full">
          <Skeleton className="h-4 w-3/5" />
          <Skeleton className="h-3 w-2/5" />
        </div>

        <Skeleton className="h-8 w-8 rounded-md" />
      </CardHeader>

      {/* CONTENT */}
      <CardContent className="flex flex-col gap-4">

        {/* TOP BADGES */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-5 w-24 rounded-full" />
        </div>

        {/* DIVIDER */}
        <Skeleton className="h-px w-full" />

        {/* INFO GRID */}
        <div className="grid grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </div>

        {/* DIVIDER */}
        <Skeleton className="h-px w-full" />

        {/* PROGRESS */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-10" />
          </div>

          <Skeleton className="h-2 w-full" />
        </div>
      </CardContent>

      {/* FOOTER BUTTON */}
      <CardFooter>
        <Skeleton className="h-10 w-full rounded-md" />
      </CardFooter>

    </Card>
  );
}