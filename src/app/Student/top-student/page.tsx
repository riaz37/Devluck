// src/app/Student/top-student/page.tsx
"use client";
import { useRouter } from "next/navigation";
import { useState,useEffect } from "react";
import DashboardLayout from "@/components/Student/DashboardLayout";
import { useGlobalRankingHandler } from "@/hooks/common/useGlobalRankingHandler";
import { motion } from "framer-motion";
import DecryptedText from "@/components/ui/DecryptedText";

import { FileSearch } from "lucide-react";
import { Pagination } from "@/components/common/Pagination";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { ApplicantCardSkeleton } from "@/components/Company/Skeleton/ApplicantCardSkeleton";
import { TopApplicantCard } from "@/components/Student/TopApplicantCard";

export default function ApplicantPage() {
  const router = useRouter();
  const {
    rankings,
    loading,
    error,
    totalPages,
    page,
    listStudentGlobalRankings,
  } = useGlobalRankingHandler();

  const [itemsPerPage, setItemsPerPage] = useState(8);
  const [currentPage, setCurrentPage] = useState(1);

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
    listStudentGlobalRankings({
      page: currentPage,
      limit: itemsPerPage
    });
  }, [currentPage, itemsPerPage, listStudentGlobalRankings]);

  // pagination handlers (IMPORTANT FIX)
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const goToPrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
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
                text="Top Students"
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
                      onRetry={() =>
                        listStudentGlobalRankings({
                          page: currentPage,
                          limit: itemsPerPage
                        })
                      }
                    />
              )}

              {/* Empty State */}
               {!loading && !error && rankings.length === 0 && (
                <EmptyState
                  icon={<FileSearch className="h-10 w-10 text-muted-foreground" />}
                  title="No students found"
                  description="Top student data will appear here once activity is recorded."
                />
              )}

              {/* GRID */}
            {!loading && !error && rankings.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {rankings.map((row) => (
                  <TopApplicantCard
                    key={row.studentId}
                    applicant={{
                      id: row.student.id,
                      name: row.student.name,
                      email: row.student.email,
                      image: row.student.image,
                      availability: row.student.availability,
                      profileRanking: row.globalRank,
                      profileComplete: row.student.profileComplete,
                      salaryExpectation: row.student.salaryExpectation,
                    }}
                    onClick={() =>
                      router.push(`/Student/top-student/${row.student.id}`)
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