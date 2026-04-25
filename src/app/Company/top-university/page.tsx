// src/app/Company/top-university/page.tsx
"use client";
import {useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/Company/DashboardLayout";
import { useUniversityHandler, University } from "@/hooks/companyapihandler/useUniversityHandler";
import {FilePlus2, FileSearch} from 'lucide-react';
import { motion } from "framer-motion";
import DecryptedText from "@/components/ui/DecryptedText";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SearchAndViewBar } from "@/components/common/SearchAndViewBar";
import { SelectionBar } from "@/components/common/SelectionBar";
import { Pagination } from "@/components/common/Pagination";
import { ConfirmDeleteDialog } from "@/components/common/ConfirmDeleteDialog";
import { LoadingState } from "@/components/common/LoadingState";
import { ErrorState } from "@/components/common/ErrorState";
import { toast } from "sonner";
import { UniversityCard } from "@/components/common/UniversityCard";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTable } from "@/components/common/DataTable";
import UniversityModal from "@/components/Company/Modal/UniversityModal";
import { UniversityCardSkeleton } from "@/components/common/Skeleton/UniversityCardSkeleton";


export default function TopUniversityPage() {
    const router = useRouter();
    /* ──────────────────────────────────────────────
     Selection
  ────────────────────────────────────────────── */
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const handleSelect = (id: string, checked: boolean) => {
    setSelectedIds((prev) =>
      checked ? [...prev, id] : prev.filter((x) => x !== id)
    );
  };
    /* ──────────────────────────────────────────────
     State
  ────────────────────────────────────────────── */
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [universityToDelete, setUniversityToDelete] = useState<University | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUniversity, setEditingUniversity] = useState<any>(null);
  const [showUniversities, setShowUniversities] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);
  const [totalPages, setTotalPages] = useState(1);

   /* ──────────────────────────────────────────────
     Data Hook
  ────────────────────────────────────────────── */

  const {
    universities,
    loading,
    error,
    getUniversities,
    createUniversity,
    deleteUniversity,
    updateUniversity,
    clearError
  } = useUniversityHandler();

    /* ──────────────────────────────────────────────
     Effects
  ────────────────────────────────────────────── */

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
        toast.error("Failed to fetch universities");
      }
    };
    fetchUniversities();
  }, [currentPage, itemsPerPage, searchQuery, getUniversities]);

    /* ──────────────────────────────────────────────
     Save
  ────────────────────────────────────────────── */

  const handleSave = async (data: any) => {
    try {
      if (editingUniversity) {
        await updateUniversity(editingUniversity.id, data);
      } else {
        await createUniversity(data);
      }
      setIsModalOpen(false);
      setEditingUniversity(null);
      await getUniversities(currentPage, itemsPerPage, searchQuery, 'name');
    } catch (err) {
      console.error('Failed to save university:', err);
      toast.error("Failed to save university");
    }
  };
  /* ──────────────────────────────────────────────
  Pagination
  ────────────────────────────────────────────── */
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

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-3"
          >
            <Button
              size="lg"
              className={cn(
                "rounded-[var(--radius)] px-6 font-bold transition-all duration-300",
                "bg-primary text-primary-foreground",
                "hover:bg-primary/90 hover:scale-[1.03] active:scale-[0.98]",
                "shadow-[0_8px_20px_-4px_oklch(var(--primary)/0.2)]",
                "border border-primary/10"
              )}
              onClick={() => {
                setEditingUniversity(null);
                setIsModalOpen(true);
              }}
            >
              <FilePlus2 className="mr-2 h-5 w-5 stroke-[2.5]" />
              Create University
            </Button>
          </motion.div>
        </header>

        {/* =====================
            Main Column
        ====================== */}
        <div className="flex flex-col gap-6">

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

            <SelectionBar
              selectedCount={selectedIds.length}
              isVisible={selectedIds.length > 0 && !showUniversities}
              onClearSelection={() => setSelectedIds([])}
              onDeleteClick={() => {
                setUniversityToDelete(null);
                setDeleteConfirmOpen(true);
              }}
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
                title="Failed to load"
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
                action={
                  <Button
                    onClick={() => setIsModalOpen(true)}
                    variant="outline"
                    className="rounded-xl"
                  >
                    Create First University
                  </Button>
                }
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
                      `/Company/top-university/${university.id}`
                    )
                  }
                  onEdit={() => {
                    setEditingUniversity(university);
                    setIsModalOpen(true);
                  }}
                  onDelete={() => {
                    setSelectedIds((prev) =>
                      prev.filter((id) => id !== university.id)
                    );
                    setUniversityToDelete(university ?? null);
                    setDeleteConfirmOpen(true);
                  }}
                />
              ))}
            </div>
          )}

          {/* =====================
              universities List
          ====================== */}
          {!loading && !error && paginatedUniversities.length > 0 && !showUniversities && (
            <DataTable
            data={paginatedUniversities}
            columns={[
              {
                header: (
                  <Checkbox
                    checked={
                      selectedIds.length > 0 &&
                      selectedIds.length === paginatedUniversities.length
                    }
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedIds(paginatedUniversities.map((a) => a.id));
                      } else {
                        setSelectedIds([]);
                      }
                    }}
                  />
                ),
                cell: (u: University) => (
                  <Checkbox
                    checked={selectedIds.includes(u.id!)}
                    onCheckedChange={(checked) =>
                      handleSelect(u.id!, !!checked)
                    }
                  />
                ),
              },

              {
                header: "ID",
                cell: (u: University) => u.id,
              },
              {
                header: "University Name",
                cell: (u: University) => u.name,
              },
              {
                header: "Phone Number",
                cell: (u: University) => u.phoneNumber,
              },
              {
                header: "Address",
                cell: (u: University) => u.address,
              },
              {
                header: "World Ranking",
                cell: (u: University) => u.qsWorldRanking,
              },
            ]}
            getId={(u) => u.id}
            selectedIds={selectedIds}
            onSelect={setSelectedIds}
            onRowClick={(u) =>
              router.push(`/Company/top-university/${u.id}`)
            }
           actions={{
              type: "menu",
              items: [
                {
                  label: "View",
                  onClick: (u: University) => {
                    router.push(`/Company/top-university/${u.id}`);
                  },
                },
                {
                  label: "Edit",
                  onClick: (u: University) => {
                    setEditingUniversity(u);
                    setIsModalOpen(true);
                  },
                },
                {
                  label: "Delete",
                  variant: "destructive",
                  onClick: (u: University) => {
                    setSelectedIds((prev) =>
                      prev.filter((id) => id !== u.id)
                    );
                    setUniversityToDelete(u);
                    setDeleteConfirmOpen(true);
                  },
                },
              ],
            }}
          />
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
      <UniversityModal
        isOpen={isModalOpen}
        university={editingUniversity}
        onClose={() => {
          setIsModalOpen(false);
          setEditingUniversity(null);
          clearError();
        }}
        onSave={async (data) => {
          try {
            await handleSave(data);
            toast.success(`University ${editingUniversity ? "updated" : "created"} successfully`);
          } catch (err) {
            console.error(err);
            toast.error(`Failed to ${editingUniversity ? "update" : "create"} university`);
          }
        }}
      />

    <ConfirmDeleteDialog
      isOpen={deleteConfirmOpen}
      onOpenChange={(open) => {
        setDeleteConfirmOpen(open);

        if (!open) {
          setUniversityToDelete(null);
          setSelectedIds([]);
        }
      }}
      title="Delete University"
      description="Are you sure you want to delete this university? This action cannot be undone."
      isDeleting={deleting}
      onConfirm={async () => {
        setDeleting(true);
        try {
          if (universityToDelete) {
            // ✅ Single delete
            await deleteUniversity(universityToDelete.id);
          } else if (selectedIds.length > 0) {
            // ✅ Bulk delete
            await Promise.all(
              selectedIds.map((id) => deleteUniversity(id))
            );
            setSelectedIds([]);
          }

          toast.success("University(s) deleted successfully");

          setDeleteConfirmOpen(false);
          setUniversityToDelete(null);
        } catch (error) {
          console.error("Delete failed:", error);

        toast.error("Failed to delete university(s)");
        } finally {
          setDeleting(false);
        }
      }}
    />

    </DashboardLayout>

  );
}