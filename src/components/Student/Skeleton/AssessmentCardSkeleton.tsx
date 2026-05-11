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
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

export function AssessmentCardSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2, transition: { duration: 0.15 } }}
      transition={{ type: "spring", stiffness: 280, damping: 24 }}
      className="w-full"
    >
      <Card className="rounded-2xl border bg-card shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">

        {/* HEADER */}
        <CardHeader className="pt-4 pb-0 px-4">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1 min-w-0 flex-1">
              <Skeleton className="h-5 w-48" />
              <div className="flex items-center gap-2 text-xs">
                <Skeleton className="h-3 w-3 rounded-full" />
                <Skeleton className="h-3.5 w-24" />
              </div>
            </div>
            <div className="h-6 w-24 rounded-full">
              <Skeleton className="h-full w-full rounded-full" />
            </div>
          </div>
        </CardHeader>

        {/* CONTENT */}
        <CardContent className="px-4 pt-4 pb-0 space-y-3">
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-5/6" />
        </CardContent>

        {/* FOOTER */}
        <CardFooter className="px-4 pt-3 pb-4">
          <Skeleton className="h-10 w-full rounded-md" />
        </CardFooter>
      </Card>
    </motion.div>
  );
}