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
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

export function ContractCardSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2, transition: { duration: 0.15 } }}
      transition={{ type: "spring", stiffness: 280, damping: 24 }}
      className="w-full"
    >
      <Card className="rounded-2xl border bg-card shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">

        {/* ── HEADER ── */}
        <CardHeader className="pb-0 pt-4 px-4">
          <div className="flex items-start justify-between gap-3">
            {/* Avatar + title */}
            <div className="flex items-center gap-3 min-w-0 flex-1">
              {/* IMAGE */}
              <div className="h-10 w-10 ring-2 ring-background shadow-sm bg-muted/50 shrink-0 rounded-full overflow-hidden">
                <Skeleton className="h-full w-full" />
              </div>

              {/* TEXT */}
              <div className="min-w-0 space-y-0.5">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-3.5 w-32" />
              </div>
            </div>

            <div className="h-7 w-7 rounded-full">
              <Skeleton className="h-4 w-4" />
            </div>
          </div>
        </CardHeader>

        <CardContent className="px-4 pt-4 pb-0 space-y-3">
          {/* STATUS + ID - HORIZONTAL LAYOUT */}
          <div className="flex items-center justify-between">
            {/* Status badge - LEFT */}
            <div className="h-6 w-20 rounded-md">
              <Skeleton className="h-full w-full rounded-md" />
            </div>

            {/* ID chip - RIGHT */}
            <div className="h-6 w-24 rounded-md">
              <Skeleton className="h-full w-full rounded-md" />
            </div>
          </div>

          <Separator />

          {/* ── METRICS ROW ── 3-column grid */}
          <div className="grid grid-cols-3 gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-1">
                <Skeleton className="h-3 w-12" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>

          {/* PROGRESS BAR */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-8" />
            </div>
            <Progress className="h-2">
              <Skeleton className="h-full w-full bg-muted" />
            </Progress>
          </div>

          {/* NOTES SECTION */}
          <div className="space-y-3 pt-3 border-t border-border/30">
            <div className="flex items-center gap-2">
              <Skeleton className="h-px flex-1" />
              <Skeleton className="h-3.5 w-28" />
              <Skeleton className="h-px flex-1" />
            </div>
            <div className="rounded-lg border px-4 py-3">
              <Skeleton className="h-4 w-full mb-1" />
              <Skeleton className="h-4 w-4/5" />
            </div>
          </div>
        </CardContent>

        {/* ── FOOTER ── */}
        <CardFooter className="px-4 pt-3 pb-4">
          <Skeleton className="h-9 w-full rounded-md" />
        </CardFooter>
      </Card>
    </motion.div>
  );
}