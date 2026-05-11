"use client";

import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { Separator } from "@/components/ui/separator";

export function CompanyCardSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 280, damping: 24 }}
      className="w-full max-w-sm mx-auto"
    >
      <Card className="rounded-2xl border bg-card shadow-sm overflow-hidden">

        {/* ── CARD HEADER ─────────────────────────── */}
        <CardHeader className="pt-4 pb-0 px-4">
          <div className="flex items-center gap-3">
            {/* Logo Skeleton */}
            <div className="h-12 w-12 shrink-0 ring-2 ring-muted rounded-full">
              <Skeleton className="h-full w-full rounded-full" />
            </div>

            {/* Name + email Skeleton */}
            <div className="min-w-0 flex-1 space-y-1">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-3.5 w-24" />
            </div>
          </div>
        </CardHeader>

        {/* ── CARD CONTENT ────────────────────────── */}
        <CardContent className="px-4 pt-4 pb-0 space-y-3">
          {/* ID + Rank row Skeleton */}
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-20 rounded-md" />
            <Skeleton className="h-6 w-24 rounded-md" />
          </div>

          <Separator />

          {/* Location row Skeleton */}
          <div className="flex items-center gap-2.5 rounded-lg bg-muted/50 px-3 py-2.5">
            <Skeleton className="h-5 w-5 rounded-full" />
            <div className="min-w-0 flex-1 space-y-1">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-4.5 w-full" />
            </div>
          </div>

          {/* Phone row Skeleton */}
          <div className="flex items-center gap-2.5 rounded-lg bg-muted/50 px-3 py-2.5">
            <Skeleton className="h-5 w-5 rounded-full" />
            <div className="min-w-0 flex-1 space-y-1">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-4.5 w-28" />
            </div>
          </div>
        </CardContent>

        {/* ── CARD FOOTER ─────────────────────────── */}
        <CardFooter className="px-4 pt-3 pb-4">
          <Skeleton className="h-10 w-full rounded-md" />
        </CardFooter>
      </Card>
    </motion.div>
  );
}