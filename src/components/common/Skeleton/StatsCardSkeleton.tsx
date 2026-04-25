"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface StatsCardSkeletonProps {
  className?: string;
}

export function StatsCardSkeleton({ className }: StatsCardSkeletonProps) {
  return (
    <Card className={className}>

      {/* HEADER */}
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <Skeleton className="h-4 w-24" />

        {/* ICON */}
        <Skeleton className="h-8 w-8 rounded-md" />
      </CardHeader>

      {/* CONTENT */}
      <CardContent>
        {/* VALUE */}
        <Skeleton className="h-7 w-16" />

        {/* SUBTITLE */}
        <Skeleton className="h-3 w-32 mt-2" />
      </CardContent>

    </Card>
  );
}