"use client";

import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function AssessmentCardSkeleton() {
  return (
    <Card className="rounded-2xl shadow-sm border">
      
      {/* HEADER */}
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          
          <div className="space-y-2 w-full">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>

          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      </CardHeader>

      {/* CONTENT */}
      <CardContent className="space-y-4">
        
        <div className="flex gap-2 flex-wrap">
          <Skeleton className="h-5 w-24 rounded-full" />
          <Skeleton className="h-5 w-28 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>

        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />

      </CardContent>

      {/* FOOTER */}
      <CardFooter>
        <Skeleton className="h-10 w-full rounded-lg" />
      </CardFooter>

    </Card>
  );
}