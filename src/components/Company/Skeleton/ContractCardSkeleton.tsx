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
import { motion } from "framer-motion";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";


export function ContractCardSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 280, damping: 22 }}
      className="w-full max-w-[720px] mx-auto"
    >
      <Card className="overflow-hidden rounded-2xl border-border/60 shadow-sm hover:shadow-md transition-shadow">

        {/* ───────── HEADER ───────── */}
        <CardHeader className="flex flex-row items-start justify-between space-y-0 px-6 pt-5 pb-4">
          <div className="space-y-1.5 min-w-0 pr-4 flex-1">
            <Skeleton className="h-6 w-3/4" />
            <div className="flex items-center gap-3">
              <Skeleton className="h-3.5 w-10" />
              <Skeleton className="h-2 w-2 rounded-full" />
              <div className="flex items-center gap-1.5 space-x-1">
                <div className="h-6 w-6 rounded-full">
                  <Skeleton className="h-full w-full rounded-full" />
                </div>
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
          </div>

          {/* Kebab menu */}
          <div className="h-8 w-8 rounded-full">
            <Skeleton className="h-full w-full rounded-full" />
          </div>
        </CardHeader>

        {/* ───────── STAGE TRACKER ───────── */}
        <div className="relative flex items-center w-full px-6 py-4">
          {/* Background connector line */}
          <div className="absolute left-6 right-6 h-px bg-muted top-1/2 z-0" />
          
          {Array.from({ length: 4 }).map((_, i) => (
            <React.Fragment key={i}>
              <div className="flex flex-col items-center gap-1.5 flex-1 relative z-10">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-3 w-12" />
              </div>
              {i !== 3 && (
                <div className="flex-1 h-px mx-1.5 mb-4 bg-muted/50 z-0" />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* ───────── BODY ───────── */}
        <CardContent className="p-0">
          {/* Stats Grid */}
          <div className="px-4 pt-4 pb-2 grid grid-cols-2 gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-1">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>

          {/* Progress */}
          <div className="px-6 py-2 space-y-2">
            <div className="flex justify-between text-[11px]">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3 w-8" />
            </div>
            <Progress className="h-1.5">
              <Skeleton className="h-full w-full bg-muted" />
            </Progress>
          </div>

          {/* ───────── NOTE ───────── */}
          <div className="px-6 pt-4 pb-3 space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-px flex-1" />
              <Skeleton className="h-3.5 w-28" />
              <Skeleton className="h-px flex-1" />
            </div>
            <div className="rounded-lg border px-3 py-2">
              <Skeleton className="h-4 w-full mb-1" />
              <Skeleton className="h-4 w-4/5" />
            </div>
          </div>
        </CardContent>

        {/* ───────── FOOTER ───────── */}
        <CardFooter className="px-6 py-3.5 flex gap-2">
          <Skeleton className="h-10 flex-1 rounded-lg" />
          <Skeleton className="h-10 flex-1 rounded-lg" />
        </CardFooter>
      </Card>
    </motion.div>
  );
}