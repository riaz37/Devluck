"use client";

import React from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function ContractCardSkeleton() {
  return (
    <Card className="h-full flex flex-col rounded-2xl shadow-sm">

      {/* HEADER */}
      <CardHeader className="flex flex-row items-start justify-between gap-3">

        {/* LEFT */}
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-3 w-4/5" />
        </div>

        {/* RIGHT BADGES */}
        <div className="space-y-2">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-12" />
        </div>

      </CardHeader>

      {/* CONTENT */}
      <CardContent className="space-y-5 flex-1">

        {/* STEPPER */}
        <div className="relative flex items-center justify-between">
          <div className="absolute left-0 right-0 h-[1px] bg-muted top-1/2" />

          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton
              key={i}
              className="h-8 w-8 rounded-full relative z-10"
            />
          ))}
        </div>

        {/* INFO GRID */}
        <div className="grid grid-cols-2 gap-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-4 w-24" />
            </div>
          ))}
        </div>

      </CardContent>

      {/* FOOTER */}
      <CardFooter>
        <Skeleton className="h-10 w-full rounded-lg" />
      </CardFooter>

    </Card>
  );
}