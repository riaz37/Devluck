"use client";

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
import { Badge } from "@/components/ui/badge";

export function ContractCardTemplateSkeleton() {
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
              <div className="flex items-center gap-1">
                <Skeleton className="h-3 w-3 rounded-full" />
                <Skeleton className="h-3.5 w-32" />
              </div>
            </div>

            {/* MENU */}
            <div className="h-7 w-7 rounded-full">
              <Skeleton className="h-full w-full rounded-full" />
            </div>
          </div>
        </CardHeader>

        <CardContent className="px-4 pt-4 pb-0 space-y-3">
          {/* STATUS + ID - HORIZONTAL LAYOUT */}
          <div className="flex items-center justify-between mb-4">
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

          {/* INFO GRID */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 justify-items-center">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-1 w-full max-w-[120px]">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
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