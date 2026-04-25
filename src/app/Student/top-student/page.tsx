// src/app/Student/top-student/page.tsx
"use client";
import { useRouter } from "next/navigation";
import { useState,useEffect } from "react";
import DashboardLayout from "@/components/Student/DashboardLayout";
import { useTopStudentsHandler } from "@/hooks/studentapihandler/useTopStudentsHandler";
import { motion } from "framer-motion";
import DecryptedText from "@/components/ui/DecryptedText";

import { FileSearch, User } from "lucide-react";
import { Pagination } from "@/components/common/Pagination";
import { EmptyState } from "@/components/common/EmptyState";
import { LoadingState } from "@/components/common/LoadingState";
import { ErrorState } from "@/components/common/ErrorState";
import { ApplicantCardSkeleton } from "@/components/Company/Skeleton/ApplicantCardSkeleton";
import { TopApplicantCard } from "@/components/Student/TopApplicantCard";

export default function ApplicantPage() {
  const router = useRouter();
  const {
    students,
    loading,
    error,
    totalPages,
    currentPage,
    getTopStudents,
  } = useTopStudentsHandler();

  const [itemsPerPage, setItemsPerPage] = useState(8);

  // responsive page size
  useEffect(() => {
    const updateItemsPerPage = () => {
      setItemsPerPage(window.innerWidth < 640 ? 5 : 8);
    };

    updateItemsPerPage();
    window.addEventListener("resize", updateItemsPerPage);

    return () => window.removeEventListener("resize", updateItemsPerPage);
  }, []);

  // fetch data
  useEffect(() => {
    getTopStudents(currentPage, itemsPerPage);
  }, [currentPage, itemsPerPage]);

  // pagination handlers (IMPORTANT FIX)
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      getTopStudents(page, itemsPerPage);
    }
  };

  const goToPrevious = () => {
    if (currentPage > 1) {
      getTopStudents(currentPage - 1, itemsPerPage);
    }
  };

  const goToNext = () => {
    if (currentPage < totalPages) {
      getTopStudents(currentPage + 1, itemsPerPage);
    }
  };

  // pagination window
  const VISIBLE_PAGES = 5;

  const startPage = Math.max(
    1,
    Math.min(currentPage, totalPages - VISIBLE_PAGES + 1)
  );

  const endPage = Math.min(totalPages, startPage + VISIBLE_PAGES - 1);

  const visiblePages = Array.from(
    { length: endPage - startPage + 1 },
    (_, i) => startPage + i
  );

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {/* HEADER SECTION */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <motion.h1
              className="text-3xl font-bold tracking-tight text-foreground"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <DecryptedText
                text="Top students"
                speed={40}
                maxIterations={20}
                className="revealed"
                parentClassName="inline-block"
              />
            </motion.h1>

            <p className="text-muted-foreground mt-1">
              Discover the highest performing students based on activity and profile strength.
            </p>
          </div>
        </header>
        
     
        {/* Main column */}
        <div className="flex flex-col gap-6">
              {/* Loading State */}
              {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <ApplicantCardSkeleton key={i} />
              ))}
            </div>
              )}

              {/* Error State */}
              {!loading && error && (
                    <ErrorState 
                      title="Failed to load" 
                      description={error} 
                      onRetry={() => getTopStudents(1, 1000)}
                    />
              )}

              {/* Empty State */}
               {!loading && !error && students.length === 0 && (
                <EmptyState
                  icon={<FileSearch className="h-10 w-10 text-muted-foreground" />}
                  title="No applicants found"
                  description="No students have applied yet"
                />
              )}

              {/* GRID */}
            {!loading && !error && students.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {students.map((student) => (
                  <TopApplicantCard
                    key={student.id}
                    applicant={student}
                    onClick={() =>
                      router.push(`/Student/top-student/${student.id}`)
                    }
                  />
                ))}
              </div>
            )}

        </div>
      </div>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        visiblePages={visiblePages}
        loading={loading}
        error={error}
        onPageChange={goToPage}
        onPrevious={goToPrevious}
        onNext={goToNext}
      />

    </DashboardLayout>
  );
}