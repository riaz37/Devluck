"use client";

import React from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function OpportunityCardSkeleton() {
  return (
    <Card className="h-full flex flex-col rounded-2xl shadow-sm">

      {/* HEADER */}
      <CardHeader className="flex flex-row items-start justify-between gap-3">

        {/* LEFT */}
        <div className="space-y-2 flex-1 min-w-0">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-4/5" />
        </div>

        {/* RIGHT BADGES + MENU */}
        <div className="flex items-start gap-2">

          <div className="flex flex-col items-end gap-2">
            <Skeleton className="h-5 w-14" />
            <Skeleton className="h-5 w-12" />
          </div>

          <Skeleton className="h-7 w-7 rounded-md" />
        </div>

      </CardHeader>

      {/* CONTENT */}
      <CardContent className="flex-1">

        {/* INFO GRID */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 justify-items-center">

          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2 text-center">
              <Skeleton className="h-3 w-14 mx-auto" />
              <Skeleton className="h-4 w-20 mx-auto" />
            </div>
          ))}

        </div>

      </CardContent>

      {/* FOOTER */}
      <CardFooter className="mt-auto">
        <Skeleton className="h-10 w-full rounded-lg" />
      </CardFooter>

    </Card>
  );
}