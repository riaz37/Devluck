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

export function ApplicantCardSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2, transition: { duration: 0.15 } }}
      transition={{ type: "spring", stiffness: 280, damping: 24 }}
      className="w-full max-w-sm mx-auto"
    >
      <Card className="rounded-2xl border bg-card shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">

        {/* ── CARD HEADER ─────────────────────────────── */}
        <CardHeader className="pb-0 pt-4 px-4">
          <div className="flex items-start justify-between gap-2">
            {/* Avatar + name + email */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-12 w-12 shrink-0 ring-2 ring-muted rounded-full overflow-hidden">
                <Skeleton className="h-full w-full" />
              </div>

              <div className="min-w-0 space-y-1">
                <Skeleton className="h-5 w-32" />
                <div className="flex items-center gap-1">
                  <Skeleton className="h-3 w-3 rounded-full" />
                  <Skeleton className="h-3.5 w-24" />
                </div>
              </div>
            </div>

            {/* Kebab menu Skeleton */}
            <div className="h-8 w-8 shrink-0 rounded-full -mr-1 -mt-1">
              <Skeleton className="h-full w-full rounded-full" />
            </div>
          </div>
        </CardHeader>

        {/* ── CARD CONTENT ────────────────────────────── */}
        <CardContent className="px-4 pt-4 pb-0 space-y-3">
          {/* Status + ID row */}
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-20 rounded-md" />
            <Skeleton className="h-6 w-24 rounded-md" />
          </div>

          <Separator />

          {/* Meta stats grid */}
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col items-center justify-center rounded-lg bg-muted/50 px-3 py-2.5 gap-0.5">
              <div className="flex items-center gap-1">
                <Skeleton className="h-3 w-3 rounded-full" />
                <Skeleton className="h-3 w-16" />
              </div>
              <Skeleton className="h-4.5 w-16" />
            </div>

            <div className="flex flex-col items-center justify-center rounded-lg bg-muted/50 px-3 py-2.5 gap-0.5">
              <div className="flex items-center gap-1">
                <Skeleton className="h-3 w-3 rounded-full" />
                <Skeleton className="h-3 w-12" />
              </div>
              <Skeleton className="h-4.5 w-12" />
            </div>
          </div>
        </CardContent>

        {/* ── CARD FOOTER ─────────────────────────────── */}
        <CardFooter className="px-4 pt-3 pb-4">
          <Skeleton className="h-10 w-full rounded-md" />
        </CardFooter>
      </Card>
    </motion.div>
  );
}