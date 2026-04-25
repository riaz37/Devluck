"use client";

import { Card, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

export function PaymentCardSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full max-w-sm mx-auto"
    >
      <Card className="relative p-4 overflow-hidden rounded-xl border shadow-sm">

        {/* ID + STATUS */}
        <div className="absolute left-2 top-2 flex items-center gap-2">
          <Skeleton className="h-4 w-16 rounded-md" />
        </div>

        <div className="absolute right-2 top-2">
          <Skeleton className="h-5 w-20 rounded-md" />
        </div>

        {/* IMAGE */}
        <div className="flex justify-center mt-6">
          <Skeleton className="h-50 w-50 rounded-full" />
        </div>

        {/* HEADER */}
        <CardHeader className="space-y-4 text-center">

          {/* NAME */}
          <div className="space-y-2">
            <Skeleton className="h-5 w-40 mx-auto" />
            <Skeleton className="h-3 w-32 mx-auto" />
          </div>

          {/* META */}
          <div className="flex items-center justify-between pt-2 gap-4">

            <div className="space-y-2 w-full">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-4 w-20" />
            </div>

            <div className="space-y-2 w-full">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-4 w-20" />
            </div>

          </div>

        </CardHeader>

      </Card>
    </motion.div>
  );
}