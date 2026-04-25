// src/app/Company/opportunity/page.tsx
"use client";
import DashboardLayout from "@/components/Company/DashboardLayout";
import {  Briefcase, Edit, Eye, FilePlus2, FileSearch, GraduationCap, Sparkles, Trash2, Users } from 'lucide-react';
import { useState, useMemo,useEffect } from "react";
import { useRouter } from "next/navigation";
import { useOpportunityHandler } from "@/hooks/companyapihandler/useOpportunityHandler";
import { motion } from "framer-motion";
import { SyncLoader } from "react-spinners";
import DecryptedText from "@/components/ui/DecryptedText";
import React from "react";
import { StatsCard } from "@/components/common/stats-card";
import { EmptyState } from "@/components/common/EmptyState";
import { SearchAndViewBar } from "@/components/common/SearchAndViewBar";
import { toast } from "sonner";
import { Pagination } from "@/components/common/Pagination";
import { OpportunityData, OpportunityUI } from "@/types/opportunity";
import { ConfirmDeleteDialog } from "@/components/common/ConfirmDeleteDialog";
import { SelectionBar } from "@/components/common/SelectionBar";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/common/LoadingState";
import { ErrorState } from "@/components/common/ErrorState";
import { cn } from "@/lib/utils";
import { DataTable } from "@/components/common/DataTable";
import { OpportunityCard } from "@/components/Company/OpportunityCard";
import { Skeleton } from "@/components/ui/skeleton";
import { OpportunityCardSkeleton } from "@/components/Company/Skeleton/OpportunityCardSkeleton";
import { StatsCardSkeleton } from "@/components/common/Skeleton/StatsCardSkeleton";



/* ──────────────────────────────────────────────
   Main Opportunity Page Component
────────────────────────────────────────────── */
export default function OpportunityPage() {

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
  const [opportunityToDelete, setopportunityToDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [showApplicants, setShowApplicants] = useState(true);
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOpportunity, setEditingOpportunity] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteMode, setDeleteMode] = useState<"single" | "multiple">("single");


  /* ──────────────────────────────────────────────
     Data Hook
  ────────────────────────────────────────────── */
  const {
    opportunities,
    loading,
    error,
    clearError,
    listOpportunities,
    createOpportunity,
    updateOpportunity,
    deleteOpportunity,
  } = useOpportunityHandler();
  /* ──────────────────────────────────────────────
     Effects
  ────────────────────────────────────────────── */
  useEffect(() => {
    listOpportunities(1, 1000).catch(() => {
      toast.error("Failed to load opportunities");
    });
  }, [listOpportunities]);

  useEffect(() => {
    function updateItemsPerPage(): void {
      setItemsPerPage(window.innerWidth < 640 ? 5 : 9);
    }

    updateItemsPerPage();
    window.addEventListener("resize", updateItemsPerPage);

    return () => window.removeEventListener("resize", updateItemsPerPage);
  }, []);

  /* ──────────────────────────────────────────────
     Mapping
  ────────────────────────────────────────────── */
  const mappedJobs: OpportunityUI[] = useMemo(() => {
    if (!opportunities || !Array.isArray(opportunities)) {
      return []
    }
    return opportunities.map((opp, index) => ({
      id: opp.id,
      jobNumber: opp.id.substring(0, 8) || String(index + 1),
      jobName: opp.title,
      country: opp.location || "Not specified",
      jobtype: opp.type,
      title: opp.title,
      type: opp.type,
      timeLength: opp.timeLength,
      currency: opp.currency,
      allowance: opp.allowance,
      location: opp.location,
      description: opp.details || opp.description || "",
      startDate: opp.startDate ? new Date(opp.startDate).toISOString().split('T')[0] : undefined,
      skills: opp.skills || [],
      whyYouWillLoveWorkingHere: opp.whyYouWillLoveWorkingHere || [],
      benefits: opp.benefits || [],
      keyResponsibilities: opp.keyResponsibilities || [],
      numberOfApplicants: String(opp.applicantCount ?? 0)
    }))
  }, [opportunities])

  /* ──────────────────────────────────────────────
     Save
  ────────────────────────────────────────────── */
  async function handleSave(data: OpportunityData): Promise<void> {
    try {
      if (editingOpportunity?.id) {
        await updateOpportunity(editingOpportunity.id, data);
        toast.success("Opportunity updated successfully");
      } else {
        await createOpportunity(data);
        toast.success("Opportunity created successfully");
      }

      await listOpportunities(1, 1000);

      setIsModalOpen(false);
      setEditingOpportunity(null);
    } catch {
      toast.error("Failed to save opportunity");
    }
  }

  /* ──────────────────────────────────────────────
      Delete
  ────────────────────────────────────────────── */
  async function handleDelete(): Promise<void> {
    if (!opportunityToDelete) return;

    try {
      await deleteOpportunity(opportunityToDelete);
      toast.success("Opportunity deleted successfully");
      await listOpportunities(1, 1000);
    } catch {
      toast.error("Failed to delete opportunity");
    } finally {
      setDeleteConfirmOpen(false);
      setopportunityToDelete(null);
    }
  }

const handleActionDelete = async () => {
  setDeleting(true);
  try {
    if (selectedIds.length > 0) {
      // 🔥 BULK DELETE
      await Promise.all(selectedIds.map((id) => deleteOpportunity(id)));
      setSelectedIds([]);
      toast.success("Selected opportunities deleted successfully");
    } else if (opportunityToDelete) {
      // 🔥 SINGLE DELETE
      await deleteOpportunity(opportunityToDelete);
      toast.success("Opportunity deleted successfully");
    }

    await listOpportunities(1, 1000);
    setDeleteConfirmOpen(false);
    setopportunityToDelete(null);
  } catch (error) {
    console.error("Delete failed:", error);
    toast.error("Failed to delete opportunity");
  } finally {
    setDeleting(false);
  }
};

/* ──────────────────────────────────────────────
     Filtering
  ────────────────────────────────────────────── */
  const filteredJobs = useMemo(() => {
    if (!searchQuery.trim()) return mappedJobs;

    const q = searchQuery.toLowerCase();

    return mappedJobs.filter(
      (job) =>
        job.jobName.toLowerCase().includes(q) ||
        job.country.toLowerCase().includes(q) ||
        job.jobtype.toLowerCase().includes(q)
    );
  }, [searchQuery, mappedJobs]);

  // 📄 Pagination
  const [itemsPerPage, setItemsPerPage] = useState(9); // default 10 for desktop

  useEffect(() => {
    const updateItemsPerPage = () => {
      if (window.innerWidth < 640) { // mobile
        setItemsPerPage(5);
      } else {
        setItemsPerPage(9); // desktop
      }
    };

    updateItemsPerPage(); // run once on mount
    window.addEventListener("resize", updateItemsPerPage); // run on resize

    return () => window.removeEventListener("resize", updateItemsPerPage);
  }, []);

  const totalPages = Math.ceil(filteredJobs.length / itemsPerPage);

  const paginatedJobs = filteredJobs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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

  const totalOpportunities = opportunities.length;

  const totalApplicants = opportunities.reduce(
    (sum, opp) => sum + (opp.applicantCount ?? 0),
    0
  );

  const internshipCount = opportunities.filter(
    opp => opp.type?.toLowerCase().includes("intern")
  ).length;

  const jobCount = opportunities.filter(
    opp => opp.type?.toLowerCase().includes("job")
  ).length;

  const recentOpportunities = opportunities.filter(opp => {
    const created = new Date(opp.createdAt).getTime();
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return created >= sevenDaysAgo;
  }).length;

  const opportunityStats = useMemo(() => {

   return [
  {
    title: "Total Opportunities",
    value: totalOpportunities,
    subtitle: "All created opportunities",
    icon: <Briefcase className="w-5 h-5" />,
    iconColor: "#6366F1", // indigo (system / core)
  },
  {
    title: "Total Applicants",
    value: totalApplicants,
    subtitle: "Across all opportunities",
    icon: <Users className="w-5 h-5" />,
    iconColor: "#0EA5E9", // blue (users / info)
  },
  {
    title: "Internships",
    value: internshipCount,
    subtitle: "Internship positions",
    icon: <GraduationCap className="w-5 h-5" />,
    iconColor: "#A855F7", // purple (education / learning)
  },
  {
    title: "New This Week",
    value: recentOpportunities,
    subtitle: "Created in last 7 days",
    icon: <Sparkles className="w-5 h-5" />,
    iconColor: "#F59E0B", // amber (new / activity)
  },
];
  }, [
    totalOpportunities,
    totalApplicants,
    internshipCount,
    recentOpportunities,
  ]);


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
                text="Opportunities"
                speed={40}
                maxIterations={20}
                className="revealed"
                parentClassName="inline-block"
              />
            </motion.h1>
            <p className="text-muted-foreground mt-1">
              Manage and track your active job postings.
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
                // Uses the primary gold from your CSS for the fill
                "bg-primary text-primary-foreground",
                // Hover state: subtle scaling and brightness shift
                "hover:bg-primary/90 hover:scale-[1.03] active:scale-[0.98]",
                // Dynamic Shadow: utilizes the primary variable with 20% opacity for a themed glow
                "shadow-[0_8px_20px_-4px_oklch(var(--primary)/0.2)]",
                "border border-primary/10"
              )}
              onClick={() => {
                router.push("/Company/opportunity/create-opportunity");
              }}
            >
              <FilePlus2 className="mr-2 h-5 w-5 stroke-[2.5]" />
              Create Opportunity
            </Button>
          </motion.div>
        </header>

        {/* STATS */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => (
                <StatsCardSkeleton key={i} />
                ))
              : opportunityStats.map((stat, i) => (
                  <motion.div
                    key={stat.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <StatsCard
                      title={stat.title}
                      value={stat.value}
                      subtitle={stat.subtitle}
                      icon={stat.icon}
                      iconColor={stat.iconColor}
                    />
                  </motion.div>
                ))}
          </section>

        {/* Jobs Section */}
      
          {/* Main column */}
          <div className="flex flex-col gap-6">
            <SearchAndViewBar
              searchQuery={searchQuery}
              setSearchQuery={(val: React.SetStateAction<string>) => {
                setSearchQuery(val);
                setCurrentPage(1);
              }}
              viewMode={showApplicants ? "list" : "grid"}
              setViewMode={(mode) => setShowApplicants(mode === "grid")}
              placeholder="Search opportunities..."
            />

                  <SelectionBar
                    isVisible={selectedIds.length > 0 && !showApplicants}
                    selectedCount={selectedIds.length}
                    onClearSelection={() => setSelectedIds([])}
                    onDeleteClick={() => {
                      setDeleteMode("multiple");
                      setopportunityToDelete(null); // Signal bulk delete
                      setDeleteConfirmOpen(true);
                    }}
                  />


            {/* Applicants Grid */}
            {showApplicants && (
              <>
                {loading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <OpportunityCardSkeleton key={i} />
                    ))}
                  </div>
                ) : error ? (
                    <ErrorState 
                      title="Failed to load" 
                      description={error} 
                      onRetry={() => listOpportunities(1, 1000)}
                    />
               ) : paginatedJobs.length === 0 ? (
                <EmptyState
                  title="No opportunities found"
                  description="Your search didn't match any jobs, or you haven't created one yet."
                  icon={<FileSearch className="h-10 w-10 text-muted-foreground" />}
                  action={
                    <Button onClick={() => setIsModalOpen(true)} variant="outline" className="rounded-xl">
                      Create First Opportunity
                    </Button>
                  }
                />
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {paginatedJobs.map((job, index) => (
                      <OpportunityCard
                        key={job.id || index}
                        job={job}
                        onClick={() =>
                          router.push(`/Company/opportunity/${job.id || job.jobNumber}`)
                        }
                        actions={{
                          onEdit: () =>
                            router.push(
                              `/Company/opportunity/create-opportunity?id=${
                                job.id || job.jobNumber
                              }`
                            ),

                          onDelete: () => {
                            setDeleteMode("single");
                            setSelectedIds((prev) =>
                              prev.filter((id) => id !== job.id)
                            );
                            setopportunityToDelete(job.id ?? null);
                            setDeleteConfirmOpen(true);
                          },
                        }}
                      />
                    ))}
                  </div>
                )}
              </>
            )}


          {/* Contracts Grid */}
        {!showApplicants && (
           <>
            {loading ? (
              <LoadingState label="Fetching opportunities..." />
            ) : error ? (
              <ErrorState
                title="Failed to load"
                description={error}
                onRetry={() => listOpportunities(1, 1000)}
              />
            ) : paginatedJobs.length === 0 ? (
              <EmptyState
                title="No opportunities found"
                description="Your search didn't match any jobs, or you haven't created one yet."
                icon={<FileSearch className="h-10 w-10 text-muted-foreground" />}
                action={
                  <Button
                    onClick={() => setIsModalOpen(true)}
                    variant="outline"
                    className="rounded-xl"
                  >
                    Create First Opportunity
                  </Button>
                }
              />
            ) : (
           <DataTable
              data={paginatedJobs}
              getId={(job) => job.id || job.jobNumber}
              selectedIds={selectedIds}
              onSelect={setSelectedIds}
              onRowClick={(job) =>
                router.push(`/Company/opportunity/${job.id || job.jobNumber}`)
              }
              selectable   // 👈 THIS HANDLES EVERYTHING

              columns={[
                {
                  header: "ID",
                  cell: (job: any) => job.jobNumber,
                },
                {
                  header: "Opportunity Name",
                  cell: (job: any) => job.jobName,
                },
                {
                  header: "Opportunity Type",
                  cell: (job: any) => job.jobtype,
                },
                {
                  header: "Location",
                  cell: (job: any) => job.country,
                },
                {
                  header: "Amount Paid",
                  cell: (job: any) =>
                    job.allowance
                      ? `${job.allowance} ${job.currency}`
                      : "N/A",
                },
              ]}

              actions={{
                type: "menu",
                items: [
                  {
                    label: "View",
                    icon: <Eye className="w-4 h-4" />,
                    onClick: (job) =>
                      router.push(
                        `/Company/opportunity/${job.id || job.jobNumber}`
                      ),
                  },
                  {
                    label: "Edit",
                    icon: <Edit className="w-4 h-4" />,
                    onClick: (job) => {
                      router.push(
                        `/Company/opportunity/create-opportunity?id=${job.id || job.jobNumber}`
                      );
                    },
                  },
                  {
                    label: "Delete",
                    icon: <Trash2 className="w-4 h-4" />,
                    variant: "destructive",
                    onClick: (job) => {
                      setDeleteMode("single");
                      setSelectedIds((prev) =>
                        prev.filter((id) => id !== (job.id || job.jobNumber))
                      );
                      setopportunityToDelete(job.id ?? null);
                      setDeleteConfirmOpen(true);
                    },
                  },
                ],
              }}
            />
            )}
          </>
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


      <ConfirmDeleteDialog
        isOpen={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        onConfirm={handleActionDelete}
        isDeleting={deleting}
        title={
          deleteMode === "multiple"
            ? "Delete Multiple Opportunities"
            : "Delete Opportunity"
        }
        description={
          deleteMode === "multiple"
            ? `You are about to delete ${selectedIds.length} opportunities. This action cannot be undone.`
            : "You are about to delete this opportunity. This action is permanent and cannot be undone."
        }
      />

    </DashboardLayout>
  );
}