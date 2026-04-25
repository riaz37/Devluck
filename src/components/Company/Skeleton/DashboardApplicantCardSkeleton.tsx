"use client";

import React from "react";
import { Card, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function DashboardApplicantCardSkeleton() {
  return (
    <Card className="relative p-2 overflow-hidden rounded-xl border shadow-sm">

      {/* ID BADGE */}
      <div className="absolute left-2 top-2">
        <Skeleton className="h-5 w-16 rounded-md" />
      </div>

      {/* AVATAR + NAME */}
      <div className="flex flex-col items-center text-center space-y-3 mt-6 mb-2">

        <Skeleton className="h-24 w-24 sm:h-28 sm:w-28 rounded-full" />

        <Skeleton className="h-4 w-24" />

      </div>

      {/* FOOTER BUTTON */}
      <CardFooter className="p-0 pt-0">
        <Skeleton className="h-9 w-full rounded-lg" />
      </CardFooter>

    </Card>
  );
}