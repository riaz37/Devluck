// src/app/Company/top-applicant/page.tsx
"use client";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/Company/DashboardLayout";
import { useGlobalRankingHandler } from "@/hooks/common/useGlobalRankingHandler";
import { useState, useMemo,useEffect } from "react";
import { motion } from "framer-motion";
import { FileSearch } from 'lucide-react';
import DecryptedText from "@/components/ui/DecryptedText";
import { toast } from "sonner";
import { Pagination } from "@/components/common/Pagination";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { TopStudentCard } from "@/components/Company/TopStudentCard";
import { ApplicantCardSkeleton } from "@/components/Company/Skeleton/ApplicantCardSkeleton";
   

 
export default function TopApplicantPage() {
  const router = useRouter();
/* ──────────────────────────────────────────────
   State
────────────────────────────────────────────── */

  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(10);

/* ──────────────────────────────────────────────
  Data Hook
────────────────────────────────────────────── */
  const { rankings, loading, error, listStudentGlobalRankings, totalPages } = useGlobalRankingHandler();

/* ──────────────────────────────────────────────
  Effects
────────────────────────────────────────────── */
  useEffect(() => {
    listStudentGlobalRankings({
      page: currentPage,
      limit: itemsPerPage,
      search: searchQuery
    }).catch((err) => {
      console.error('Failed to load top applicants:', err);
      toast.error('Failed to load top applicants. Please try again later.');
    });
  }, [listStudentGlobalRankings, currentPage, itemsPerPage, searchQuery]);

  useEffect(() => {
    const updateItemsPerPage = () => {
      if (window.innerWidth < 640) {
        setItemsPerPage(6);
      } else {
        setItemsPerPage(8);
      }
    };
    updateItemsPerPage();
    window.addEventListener("resize", updateItemsPerPage);
    return () => window.removeEventListener("resize", updateItemsPerPage);
  }, []);

  /* ──────────────────────────────────────────────
     Filter
  ────────────────────────────────────────────── */

  const mappedApplicants = useMemo(() => {
    return rankings.map((row) => ({
      applicantId: row.student.id,
      name: row.student.name,
      image: row.student.image,
      email: row.student.email,
      status: "active",
      profileRanking: row.globalRank,
      profileComplete: row.student.profileComplete,
      availability: row.student.availability || "N/A",
    }));
  }, [rankings]);
  /* ──────────────────────────────────────────────
  Pagination
  ────────────────────────────────────────────── */
  const paginatedApplicants = mappedApplicants;

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const goToPrevious = () => {
    if (currentPage > 1) setCurrentPage(prev => prev - 1);
  };

  const goToNext = () => {
    if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
  };

  const VISIBLE_PAGES = 5;

  // Compute start and end of visible page range
  const startPage = Math.max(1, Math.min(currentPage, totalPages - VISIBLE_PAGES + 1));
  const endPage = Math.min(totalPages, startPage + VISIBLE_PAGES - 1);
  const visiblePages = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
  const showPlus = endPage < totalPages; // whether to show "+" button

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);


  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* HEADER SECTION */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">

        {/* LEFT SIDE */}
        <div>
          <motion.h1
            className="text-3xl font-bold tracking-tight text-foreground"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <DecryptedText
              text="Top Applicants"
              speed={40}
              maxIterations={20}
              className="revealed"
              parentClassName="inline-block"
            />
          </motion.h1>

          <p className="text-muted-foreground mt-1">
            Manage and track all top applicants in the system.
          </p>
        </div>



      </header>
        {/* =======================
            APPLIED STUDENTS GRID
        ======================== */}
            {/* Loading State */}
            {loading && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 ">
                {Array.from({ length: 8 }).map((_, i) => (
                  <ApplicantCardSkeleton key={i} />
                ))}
              </div>
            )}

            {/* Error State */}
            {!loading && error && (
              <ErrorState
                title="Failed to load Applicants"
                description={error}
                onRetry={() => listStudentGlobalRankings({ page: currentPage, limit: itemsPerPage, search: searchQuery })}
              />
            )}

            {/* Empty State */}
            {!loading && !error && paginatedApplicants.length === 0 && (
              <EmptyState
                title="No Applicants found"
                description="No applicants have applied to your opportunities yet."
                icon={<FileSearch className="h-10 w-10 text-muted-foreground" />}
               
              />
            )}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 ">
          {!loading && !error && paginatedApplicants.map((applicant) => (
            <TopStudentCard
              key={applicant.applicantId}
              applicant={applicant}
              onClick={() => router.push(`/Company/top-applicant/${applicant.applicantId}`)}
            />
            ))}
        </div>
      </div>
         {/* =====================
             Pagination
         ====================== */}
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
