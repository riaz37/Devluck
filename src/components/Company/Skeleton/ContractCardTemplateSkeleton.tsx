"use client";

import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

export function ContractCardTemplateSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full h-full"
    >
      <Card className="h-full flex flex-col rounded-2xl shadow-sm">

        {/* HEADER */}
        <CardHeader className="flex flex-row items-start justify-between gap-3">

          {/* LEFT */}
          <div className="space-y-2 w-full">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-1/2" />
          </div>

          {/* RIGHT (BADGES + MENU) */}
          <div className="flex flex-col items-end gap-2">
            <Skeleton className="h-5 w-20 rounded-md" />
            <Skeleton className="h-5 w-16 rounded-md" />

          </div>

        </CardHeader>

        {/* CONTENT GRID */}
        <CardContent className="flex-1">
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4">

            <div className="space-y-2">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-4 w-20" />
            </div>

            <div className="space-y-2">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-4 w-24" />
            </div>

            <div className="space-y-2">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-4 w-20" />
            </div>

          </div>
        </CardContent>

        {/* FOOTER */}
        <CardFooter className="mt-auto">
          <Skeleton className="h-10 w-full rounded-lg" />
        </CardFooter>

      </Card>
    </motion.div>
  );
}