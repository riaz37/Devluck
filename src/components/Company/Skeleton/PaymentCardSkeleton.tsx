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

export function PaymentCardSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2, transition: { duration: 0.15 } }}
      transition={{ type: "spring", stiffness: 280, damping: 24 }}
      className="w-full max-w-sm mx-auto"
    >
      <Card className="rounded-2xl border bg-card shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">

        {/* ── CARD HEADER ─────────────────────────── */}
        <CardHeader className="pt-4 pb-0 px-4">
          <div className="flex items-start justify-between gap-2">
            {/* Avatar + name + title */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-12 w-12 shrink-0 ring-2 ring-muted rounded-full overflow-hidden">
                <Skeleton className="h-full w-full" />
              </div>

              <div className="min-w-0 space-y-1">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-3.5 w-40" />
              </div>
            </div>
          </div>
        </CardHeader>

        {/* ── CARD CONTENT ────────────────────────── */}
        <CardContent className="px-4 pt-4 pb-0 space-y-3">
          <div className="flex items-center justify-between">
            {/* Status badge */}
            <div className="h-6 w-20 rounded-md">
              <Skeleton className="h-full w-full rounded-md" />
            </div>

            {/* ID chip */}
            <div className="h-6 w-24 rounded-md">
              <Skeleton className="h-full w-full rounded-md" />
            </div>
          </div>

          <Separator />

          {/* Salary + Duration + Created At - 3-column grid */}
          <div className="grid grid-cols-3 gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-1">
                <Skeleton className="h-3 w-12" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>

          {/* Contract Progress */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3 w-8" />
            </div>
            <Progress className="h-1.5">
              <Skeleton className="h-full w-full bg-muted" />
            </Progress>
          </div>

          {/* ───────── NOTE ───────── */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-px flex-1" />
              <Skeleton className="h-3.5 w-28" />
              <Skeleton className="h-px flex-1" />
            </div>
            <div className="rounded-lg border bg-muted/30 px-3 py-2">
              <Skeleton className="h-4 w-full mb-1" />
              <Skeleton className="h-4 w-4/5" />
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