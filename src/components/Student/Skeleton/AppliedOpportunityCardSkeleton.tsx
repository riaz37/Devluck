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

export function AppliedOpportunityCardSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
      className="w-full h-full"
    >
      <Card className="rounded-2xl shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 overflow-hidden">

        {/* ── CARD HEADER ─────────────────────────── */}
        <CardHeader className="pt-4 pb-0 px-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              {/* Company logo */}
              <div className="h-12 w-12 shrink-0 ring-2 ring-muted rounded-full overflow-hidden">
                <Skeleton className="h-full w-full" />
              </div>

              {/* Title + company */}
              <div className="min-w-0 flex-1 space-y-1">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-3.5 w-32" />
              </div>
            </div>

            {/* MENU */}
            <div className="h-8 w-8 p-2 rounded-md">
              <Skeleton className="h-5 w-5" />
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
          <div className="space-y-2 pt-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-px flex-1" />
              <Skeleton className="h-3.5 w-44" />
              <Skeleton className="h-px flex-1" />
            </div>
            <div className="rounded-lg border px-4 py-3">
              <Skeleton className="h-4 w-full mb-1" />
              <Skeleton className="h-4 w-4/5" />
            </div>
          </div>
        </CardContent>

        {/* FOOTER */}
        <CardFooter className="px-4 pt-3 pb-4 flex gap-2">
          <Skeleton className="h-10 flex-1 rounded-md" />
          <Skeleton className="h-10 flex-1 rounded-md" />
        </CardFooter>
      </Card>
    </motion.div>
  );
}