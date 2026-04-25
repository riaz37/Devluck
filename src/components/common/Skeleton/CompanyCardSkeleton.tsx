"use client";

import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

export function CompanyCardSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full max-w-sm mx-auto"
    >
      <Card className="relative p-2 overflow-hidden rounded-xl border shadow-sm">

        {/* TOP BADGE + MENU */}
        <div className="absolute left-3 top-3">
          <Skeleton className="h-5 w-20 rounded-md" />
        </div>

        <div className="absolute right-3 top-3">
          <Skeleton className="h-8 w-8 rounded-full" />
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

          <div className="space-y-3">
            <div className="space-y-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-4 w-full" />
            </div>

            <div className="space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>

        </CardContent>

        {/* FOOTER */}
        <CardFooter className="p-0 pt-0">
          <Skeleton className="h-10 w-full rounded-md" />
        </CardFooter>

      </Card>
    </motion.div>
  );
}