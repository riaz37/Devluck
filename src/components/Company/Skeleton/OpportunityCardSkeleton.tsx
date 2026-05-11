"use client";

import React from "react";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";

export function OpportunityCardSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
      className="w-full h-full"
    >
      <Card className="rounded-2xl border bg-card shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">

        {/* HEADER */}
        <CardHeader className="pb-0 pt-4 px-4">
          <div className="flex items-start justify-between gap-2">
            {/* LEFT SIDE */}
            <div className="min-w-0 flex-1 space-y-1">
              <Skeleton className="h-5 w-48" />
              <div className="flex items-center gap-3 text-[12px]">
                {/* ID */}
                <div className="flex items-center gap-1">
                  <Skeleton className="h-3 w-3 rounded-full" />
                  <Skeleton className="h-3.5 w-16 font-mono" />
                </div>
                <Skeleton className="h-2 w-2 rounded-full" />
                {/* TYPE BADGE */}
                <div className="h-5 w-20 rounded-full">
                  <Skeleton className="h-full w-full rounded-full" />
                </div>
              </div>
            </div>

            {/* MENU */}
            <div className="h-7 w-7 rounded-full">
              <Skeleton className="h-full w-full rounded-full" />
            </div>
          </div>
        </CardHeader>

        <CardContent className="px-4 pt-4 pb-0 space-y-3">
          {/* INFO GRID */}
          <div className="grid grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-1">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>

          {/* NOTE SECTION */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Skeleton className="h-px flex-1" />
              <Skeleton className="h-3.5 w-36" />
              <Skeleton className="h-px flex-1" />
            </div>
            <div className="rounded-lg border px-3 py-2">
              <Skeleton className="h-4 w-full mb-1" />
              <Skeleton className="h-4 w-4/5" />
            </div>
          </div>
        </CardContent>

        {/* FOOTER */}
        <CardFooter className="px-4 pt-3 pb-4">
          <Skeleton className="h-10 w-full rounded-lg" />
        </CardFooter>
      </Card>
    </motion.div>
  );
}