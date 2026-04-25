"use client";

import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

export function UniversityCardSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full max-w-sm mx-auto"
    >
      <Card className="relative p-2 overflow-hidden rounded-xl border shadow-sm">

        {/* TOP BADGE + MENU */}
        <div className="absolute left-2 top-2">
          <Skeleton className="h-5 w-24 rounded-md" />
        </div>

        <div className="absolute right-2 top-2">
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>

        {/* AVATAR */}
        <div className="flex justify-center mt-6">
          <Skeleton className="h-50 w-50 rounded-full" />
        </div>

        {/* HEADER */}
        <CardHeader className="text-center space-y-2">
          <Skeleton className="h-5 w-40 mx-auto" />
        </CardHeader>

        {/* CONTENT */}
        <CardContent className="space-y-4">

          {/* DESCRIPTION */}
          <div className="space-y-2">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-4/5" />
          </div>

          {/* INFO ITEMS */}
          <div className="space-y-3">
            <div className="space-y-2">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-4 w-32" />
            </div>

            <div className="space-y-2">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>

        </CardContent>

        {/* FOOTER */}
        <CardFooter className="p-0">
          <Skeleton className="h-10 w-full rounded-md" />
        </CardFooter>

      </Card>
    </motion.div>
  );
}