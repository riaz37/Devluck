import { Skeleton } from "@/components/ui/skeleton";

export function ProfileSkeleton() {
  return (
              <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
                  {/* ================= PROFILE HEADER SKELETON ================= */}
                  <div className="space-y-2">
                      {/* COVER SKELETON */}
                      <div className="relative">
                          <div className="h-[220px] w-full rounded-2xl overflow-hidden">
                              <Skeleton className="w-full h-full" />
                          </div>
  
                          {/* AVATAR SKELETON */}
                          <div className="absolute -bottom-12 left-6">
                              <div className="w-28 h-28 rounded-full border-4 border-white bg-white shadow-md overflow-hidden">
                                  <Skeleton className="w-full h-full" />
                              </div>
                          </div>
                      </div>
  
                      {/* PROFILE INFO SKELETON */}
                      <div className="pt-14 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
                          <div className="space-y-3 w-full">
                              {/* NAME + BADGES */}
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                  <div className="flex flex-wrap items-center gap-2">
                                      <Skeleton className="h-9 w-48 sm:w-72" />
                                      <Skeleton className="h-7 w-20" />
                                      <Skeleton className="h-6 w-24" />
                                  </div>
                                  <Skeleton className="h-9 w-32 sm:w-36" />
                              </div>
                              {/* DESCRIPTION */}
                              <Skeleton className="h-24 w-full" />
                          </div>
                      </div>
                  </div>
  
                  {/* ================= SECOND ROW SKELETON ================= */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="grid grid-rows-1 lg:grid-rows-2 gap-6 items-stretch">
                          
                          {/* ADDRESSES CARD SKELETON */}
                          <div className="h-full flex flex-col">
                              <div className="p-6 pb-2 space-y-2">
                                  <div className="flex items-center justify-between">
                                      <div className="space-y-1">
                                          <Skeleton className="h-5 w-32" />
                                          <Skeleton className="h-4 w-48" />
                                      </div>
                                      <Skeleton className="h-8 w-16" />
                                  </div>
                              </div>
                              <div className="flex-1 p-6 pt-0 space-y-3">
                                  <Skeleton className="h-12 w-full" />
                                  <Skeleton className="h-12 w-full" />
                                  <Skeleton className="h-12 w-4/5" />
                              </div>
                          </div>
  
                          {/* RANKING CARD SKELETON */}
                          <div className="h-full flex flex-col">
                              <div className="p-6 pb-2 space-y-1">
                                  <Skeleton className="h-5 w-24" />
                                  <Skeleton className="h-4 w-56" />
                              </div>
                              <div className="flex-1 p-6 pt-0 flex flex-col items-center justify-center space-y-6">
                                  <Skeleton className="h-20 w-20 rounded-full" />
                                  <div className="w-full space-y-3">
                                      <div className="flex justify-between">
                                          <Skeleton className="h-4 w-16" />
                                          <Skeleton className="h-4 w-12" />
                                      </div>
                                      <Skeleton className="h-3 w-full" />
                                  </div>
                              </div>
                          </div>
                      </div>
  
                      {/* EMPLOYEES CARD SKELETON */}
                      <div className="h-full flex flex-col">
                          <div className="p-6 pb-2 space-y-1">
                              <div className="flex items-center justify-between">
                                  <Skeleton className="h-6 w-32" />
                                  <span className="text-sm text-muted-foreground font-normal">
                                      <Skeleton className="h-4 w-12 inline-block" />
                                  </span>
                              </div>
                              <Skeleton className="h-4 w-48" />
                          </div>
                          <div className="flex-1 p-6 pt-0">
                              <div className="flex gap-4">
                                  <Skeleton className="w-[260px] h-32 rounded-xl" />
                                  <Skeleton className="w-[260px] h-32 rounded-xl" />
                              </div>
                          </div>
                      </div>
  
                      {/* PROGRAMS CARD SKELETON */}
                      <div className="h-full flex flex-col">
                          <div className="p-6 pb-2 space-y-1">
                              <div className="flex items-center justify-between">
                                  <div className="space-y-1">
                                      <Skeleton className="h-5 w-28" />
                                      <Skeleton className="h-4 w-44" />
                                  </div>
                                  <Skeleton className="h-8 w-20" />
                              </div>
                          </div>
                          <div className="flex-1 p-6 flex flex-col items-center justify-center space-y-6">
                              <Skeleton className="h-20 w-20 rounded-full mx-auto" />
                              <Skeleton className="h-[180px] w-full rounded-xl" />
                              <div className="w-full space-y-2">
                                  <Skeleton className="h-6 w-16 mx-auto" />
                                  <Skeleton className="h-6 w-16 mx-auto" />
                                  <Skeleton className="h-6 w-20 mx-auto" />
                              </div>
                          </div>
                      </div>
                  </div>
  
                  {/* ================= BOTTOM ROW SKELETON ================= */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      
                      {/* DOCUMENTS CARD SKELETON */}
                      <div className="flex flex-col">
                          <div className="p-6 pb-2 space-y-1">
                              <Skeleton className="h-5 w-24" />
                              <Skeleton className="h-4 w-44" />
                          </div>
                          <div className="p-6 pt-0 space-y-4">
                              <Skeleton className="h-[140px] w-full rounded-xl" />
                              <Skeleton className="h-8 w-24" />
                              <div className="space-y-3">
                                  <Skeleton className="h-20 w-full rounded-xl" />
                                  <Skeleton className="h-20 w-full rounded-xl" />
                              </div>
                          </div>
                      </div>
  
                      {/* REVIEWS CARD SKELETON */}
                      <div className="flex flex-col">
                          <div className="p-6 pb-2 space-y-1">
                              <Skeleton className="h-5 w-20" />
                              <Skeleton className="h-4 w-48" />
                          </div>
                          <div className="p-6 pt-0">
                              <div className="space-y-3">
                                  <div className="flex gap-3 p-3 rounded-xl">
                                      <Skeleton className="h-9 w-9 rounded-full" />
                                      <div className="flex-1 space-y-2">
                                          <div className="flex items-center justify-between">
                                              <Skeleton className="h-4 w-24" />
                                              <Skeleton className="h-4 w-16" />
                                          </div>
                                          <Skeleton className="h-3 w-full" />
                                          <Skeleton className="h-4 w-3/4" />
                                      </div>
                                  </div>
                                  <div className="flex gap-3 p-3 rounded-xl">
                                      <Skeleton className="h-9 w-9 rounded-full" />
                                      <div className="flex-1 space-y-2">
                                          <div className="flex items-center justify-between">
                                              <Skeleton className="h-4 w-24" />
                                              <Skeleton className="h-4 w-16" />
                                          </div>
                                          <Skeleton className="h-3 w-full" />
                                          <Skeleton className="h-4 w-3/4" />
                                      </div>
                                  </div>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
      );
}