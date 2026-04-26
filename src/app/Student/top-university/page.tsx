// src/app/Student/top-university/page.tsx
"use client";
import {useRouter } from "next/navigation";
import { useState, useMemo, useRef, useEffect } from "react";
import DashboardLayout from "@/components/Student/DashboardLayout";
import { useUniversityHandler, University } from "@/hooks/companyapihandler/useUniversityHandler";
import { ArrowUpRight, Eye, File, FileSearch, Pencil, Trash2, User } from 'lucide-react';
import { motion } from "framer-motion";
import DecryptedText from "@/components/ui/DecryptedText";
import { Pagination } from "@/components/common/Pagination";
import { SearchAndViewBar } from "@/components/common/SearchAndViewBar";
import { LoadingState } from "@/components/common/LoadingState";
import { ErrorState } from "@/components/common/ErrorState";
import { UniversityCard } from "@/components/common/UniversityCard";
import { EmptyState } from "@/components/common/EmptyState";
import { toast } from "sonner";
import { DataTable } from "@/components/common/DataTable";
import { UniversityCardSkeleton } from "@/components/common/Skeleton/UniversityCardSkeleton";

export default function TopUniversityPage() {
  const router = useRouter();
  const {
    universities,
    loading,
    error,
    getUniversities,
  } = useUniversityHandler();

  const [showUniversities, setShowUniversities] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const updateItemsPerPage = () => {
      if (window.innerWidth < 640) {
        setItemsPerPage(4);
      } else {
        setItemsPerPage(6);
      }
    };

    updateItemsPerPage();
    window.addEventListener("resize", updateItemsPerPage);
    return () => window.removeEventListener("resize", updateItemsPerPage);
  }, []);

  useEffect(() => {
    const fetchUniversities = async () => {
      try {
        const response = await getUniversities(currentPage, itemsPerPage, searchQuery, 'name');
        setTotalPages(response.totalPages);
      } catch (err) {
        console.error('Failed to fetch universities:', err);
        toast.error('Failed to fetch universities:');
      }
    };
    fetchUniversities();
  }, [currentPage, itemsPerPage, searchQuery, getUniversities]);

  const paginatedUniversities = universities;

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




  return (
      <DashboardLayout>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {/* =====================
            Page Title
        ====================== */}
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
                text="Universities"
                speed={40}
                maxIterations={20}
                className="revealed"
                parentClassName="inline-block"
              />
            </motion.h1>

            <p className="text-muted-foreground mt-1">
              Manage and track all registered universities.
            </p>
          </div>


        </header>

        {/* =====================
            Main Column
        ====================== */}
        <div className="flex flex-col gap-6">

          {/* =====================
              Search + Actions Row
          ====================== */}
          <SearchAndViewBar
            searchQuery={searchQuery}
            setSearchQuery={(value) => {
              setSearchQuery(value);
              setCurrentPage(1); // keep your pagination reset
            }}
                        viewMode={showUniversities ? "list" : "grid"}
                        setViewMode={(mode) => setShowUniversities(mode === "grid")}
            placeholder="Search Universities..."
          />

          {/* =====================
              universities Grid
          ====================== */}
            {/* Loading State */}
            {loading && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3  gap-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <UniversityCardSkeleton key={i} />
                    ))}
                  </div>
            )}
            {/* Error State */}
            {!loading && error && (
              <ErrorState
                title="Failed to load universities"
                description={error}
                onRetry={() => getUniversities}
              />
            )}
            {/* Empty State */}
            {!loading && !error && paginatedUniversities.length === 0 && (
              <EmptyState
                title="No universities found"
                description="Your search didn't match any jobs, or you haven't created one yet."
                icon={<FileSearch className="h-10 w-10 text-muted-foreground" />}
              />
            )}
          {!loading && !error && paginatedUniversities.length > 0 && showUniversities && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3  gap-4">

              {paginatedUniversities.map((university, index) => (
                <UniversityCard
                  key={index}
                  university={university}
                  onClick={() =>
                    router.push(
                      `/Student/top-university/${university.id}`
                    )
                  }
                  showMenu={false}
                />
              ))}
            </div>
          )}

          {/* =====================
              universities List
          ====================== */}
          {!loading && !error && paginatedUniversities.length > 0 && !showUniversities && (
           <>
            <DataTable
              data={paginatedUniversities}
              getId={(u) => u.id}
              selectable={false}
              onRowClick={(u) =>
                router.push(`/Student/top-university/${u.id}`)
              }

              actions={{
                type: "button",
                label: "View",
                onClick: (u) =>
                  router.push(`/Student/top-university/${u.id}`),
              }}

              columns={[
                {
                  header: "ID",
                  cell: (u: University) => `UN-${u.id.slice(-3)}`,
                },
                {
                  header: "Name",
                  cell: (u: University) => u.name,
                },
                {
                  header: "Phone",
                  cell: (u: University) => u.phoneNumber ?? "N/A",
                },
                {
                  header: "Address",
                  cell: (u: University) => u.address ?? "N/A",
                },
                {
                  header: "Ranking",
                  cell: (u: University) => u.qsWorldRanking ?? "N/A",
                },
              ]}
            />
            </>
          )}
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