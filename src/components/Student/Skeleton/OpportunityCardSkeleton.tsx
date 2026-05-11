"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

export function OpportunityCardSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
      className="w-full h-full"
    >
      <Card className="rounded-2xl border bg-card shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden h-full flex flex-col">

        {/* HEADER */}
        <CardHeader className="pb-0 pt-4 px-4">
          <div className="flex items-start justify-between gap-2">
            {/* LEFT SIDE */}
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="h-11 w-11 ring-2 ring-muted shadow-sm shrink-0 rounded-full overflow-hidden">
                <Skeleton className="h-full w-full" />
              </div>

              <div className="min-w-0 space-y-1 flex-1">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-3.5 w-32" />
              </div>
            </div>
          </div>
        </CardHeader>

        {/* CONTENT */}
        <CardContent className="px-4 pt-4 pb-0 space-y-3">
          {/* TYPE BADGE + ID CHIP */}
          <div className="flex items-center justify-between mb-4">
            {/* TYPE BADGE */}
            <div className="h-6 w-24 rounded-full">
              <Skeleton className="h-full w-full rounded-full" />
            </div>
            
            {/* ID CHIP - RIGHT */}
            <div className="h-6 w-28 rounded-md">
              <Skeleton className="h-full w-full rounded-md" />
            </div>
          </div>

          <Separator />

          {/* INFO GRID - 2x2 */}
          <div className="grid grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-1">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>

          {/* DESCRIPTION */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Skeleton className="h-px flex-1" />
              <Skeleton className="h-3.5 w-44" />
              <Skeleton className="h-px flex-1" />
            </div>
            <div className="rounded-lg border px-3 py-2">
              <Skeleton className="h-4 w-full mb-1" />
              <Skeleton className="h-4 w-4/5" />
            </div>
          </div>
        </CardContent>

        {/* FOOTER */}
        <CardFooter className="px-4 pt-3 pb-4 gap-2">
          <Skeleton className="h-10 flex-1 rounded-lg" />
          <Skeleton className="h-10 flex-1 rounded-lg" />
        </CardFooter>
      </Card>
    </motion.div>
  );
}