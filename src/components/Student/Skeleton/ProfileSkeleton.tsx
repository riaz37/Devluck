import { Skeleton } from "@/components/ui/skeleton";

export function ProfileSkeleton() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      
      {/* ================= PROFILE HEADER ================= */}
      <div className="space-y-3">
        {/* COVER */}
        <div className="h-[220px] w-full rounded-2xl overflow-hidden">
          <Skeleton className="w-full h-full" />
        </div>

        {/* CONTENT */}
        <div className="sm:px-6 px-2 pb-6 relative">
          {/* PROFILE ROW */}
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 -mt-10">
            
            {/* LEFT */}
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 w-full">
              {/* AVATAR */}
                <div className="relative bg-white w-24 h-24 rounded-full border-4 border-white shadow-md">
                <Skeleton className="h-full w-full rounded-full object-cover" />
                {/* Status indicator skeleton */}
                <div className="absolute bottom-2 right-2">
                    <Skeleton className="h-4 w-4 rounded-full border-2 border-white shadow-sm" />
                </div>
                </div>

              {/* NAME + INFO */}
              <div className="pb-2 space-y-1">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-8 w-48" />
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-7 w-7" />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
            </div>

            {/* RIGHT: RANK */}
            <div className="bg-muted/30 p-3 rounded-2xl text-center min-w-[120px]">
              <Skeleton className="h-3 w-20 mx-auto mb-1" />
              <div className="flex items-center justify-center gap-2">
                <Skeleton className="h-5 w-5" />
                <Skeleton className="h-9 w-12" />
              </div>
            </div>
          </div>

          {/* ================= STATS + PROGRESS ================= */}
          <div className="mt-8 flex flex-col lg:flex-row gap-6">
            {/* STATS */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="p-4 rounded-xl border bg-muted/30">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                  <Skeleton className="h-4 w-full mt-1" />
                </div>
              ))}
            </div>

            {/* PROGRESS */}
            <div className="w-full lg:w-[280px] p-4 rounded-xl border bg-muted/30 flex flex-col justify-center">
              <div className="flex justify-between mb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-12" />
              </div>
              <Skeleton className="h-2 w-full" />
            </div>
          </div>

          {/* DESCRIPTION */}
          <div className="mt-6">
            <Skeleton className="h-4 w-32 mb-2" />
            <Skeleton className="h-16 w-full" />
          </div>
        </div>
      </div>

      {/* ================= GRID SYSTEM ================= */}
      <div className="flex flex-col items-center justify-center mt-10 gap-10">
        
        {/* Row 1: Languages + Skills */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
          <CardSkeleton title="Languages" />
          <CardSkeleton title="Skills" />
        </div>

        {/* Row 2: Experience + Education */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
          <CardSkeleton title="Experience" listItems={3} />
          <CardSkeleton title="Education" listItems={3} />
        </div>

        {/* Row 3: Portfolio + Reviews */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
          <CardSkeleton title="Portfolio" listItems={2} />
          <ReviewsCardSkeleton />
        </div>
      </div>
    </div>
  );
}

// Generic Card Skeleton
function CardSkeleton({ 
  title = "Card", 
  listItems = 2 
}: { 
  title?: string; 
  listItems?: number 
}) {
  return (
    <div className="rounded-2xl w-full shadow-sm border flex flex-col max-h-[200px]">
      {/* HEADER */}
      <div className="p-6 pb-2 flex items-center justify-between">
        <div className="space-y-1">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-4 w-44" />
        </div>
        <Skeleton className="h-8 w-16" />
      </div>

      {/* CONTENT */}
      <div className="flex-1 p-6 pt-0 overflow-hidden">
        <div className="space-y-3 h-full flex flex-col justify-center">
          {Array.from({ length: listItems }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-full rounded-md" />
          ))}
        </div>
      </div>
    </div>
  );
}

// Reviews Card Skeleton (Special layout)
function ReviewsCardSkeleton() {
  return (
    <div className="rounded-2xl w-full shadow-sm border flex flex-col max-h-[200px]">
      {/* HEADER */}
      <div className="p-6 pb-4 space-y-1">
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-4 w-48" />
      </div>

      {/* CONTENT */}
      <div className="flex-1 p-6 pt-0 overflow-hidden space-y-3">
        <div className="flex gap-3 p-3 rounded-xl bg-muted/30">
          <Skeleton className="h-8 w-8 rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24" />
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-4 w-4" />
                ))}
              </div>
            </div>
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
        <div className="flex gap-3 p-3 rounded-xl bg-muted/30">
          <Skeleton className="h-8 w-8 rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24" />
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-4 w-4" />
                ))}
              </div>
            </div>
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </div>
    </div>
  );
}