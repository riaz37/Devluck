"use client";

import React from "react";
import { Card, CardHeader, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function ApplicantCardSkeleton() {
  return (
    <Card className="relative p-2 overflow-hidden rounded-xl border shadow-sm">

      {/* TOP SECTION */}
      <div className="relative flex flex-col items-center justify-center">

        {/* LEFT BADGES */}
        <div className="absolute left-1 top-1 flex flex-col gap-2">
          <Skeleton className="h-5 w-14 rounded-md" />
          <Skeleton className="h-5 w-16 rounded-md" />
        </div>

        {/* MENU */}
        <div className="absolute right-1 top-1">
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>

        {/* AVATAR */}
        <Skeleton className="h-24 w-24 sm:h-28 sm:w-28 mt-6 rounded-full" />

      </div>

      {/* HEADER */}
      <CardHeader className="space-y-3">

        {/* NAME */}
        <div className="text-center space-y-2">
          <Skeleton className="h-5 w-32 mx-auto" />
          <Skeleton className="h-3 w-40 mx-auto" />
        </div>

        {/* META ROW */}
        <div className="flex items-center justify-between pt-2">
          <div className="space-y-2">
            <Skeleton className="h-3 w-14" />
            <Skeleton className="h-4 w-20" />
          </div>

          <div className="space-y-2 text-right">
            <Skeleton className="h-3 w-12 ml-auto" />
            <Skeleton className="h-4 w-10 ml-auto" />
          </div>
        </div>

      </CardHeader>

      {/* FOOTER */}
      <CardFooter className="p-0 pt-0">
        <Skeleton className="h-10 w-full rounded-lg" />
      </CardFooter>

    </Card>
  );
}