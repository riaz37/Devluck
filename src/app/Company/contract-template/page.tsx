"use client";
import DashboardLayout from "@/components/Company/DashboardLayout";
import {Clock, Edit, FilePlus2, FileSearch, FileText, PauseCircle, PlayCircle, Trash2 } from 'lucide-react';
import { useState, useMemo, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ContractStatus, ContractTemplate, useContractTemplateHandler } from "@/hooks/companyapihandler/useContractTemplateHandler";
import { motion } from "framer-motion";
import {SyncLoader } from "react-spinners";
import DecryptedText from "@/components/ui/DecryptedText";
import { StatsCard } from "@/components/common/stats-card";
import { cn } from "@/lib/utils";
import { SearchAndFilterAndViewBar } from "@/components/common/SearchAndFilterAndViewBar";
import { SelectionBar } from "@/components/common/SelectionBar";
import { LoadingState } from "@/components/common/LoadingState";
import { ErrorState } from "@/components/common/ErrorState";
import { EmptyState } from "@/components/common/EmptyState";
import { Pagination } from "@/components/common/Pagination";
import { ConfirmDeleteDialog } from "@/components/common/ConfirmDeleteDialog";
import { toast } from "sonner";
import { DataTable } from "@/components/common/DataTable";
import { ContractCardTempletate } from "@/components/Company/ContractCardTemplet";
import ContractModal from "@/components/Company/Modal/ContractTemplateModal";
import { StatsCardSkeleton } from "@/components/common/Skeleton/StatsCardSkeleton";
import { ContractCardTemplateSkeleton } from "@/components/Company/Skeleton/ContractCardTemplateSkeleton";



/* ──────────────────────────────────────────────
   Main contract-template Page Component
────────────────────────────────────────────── */

export default function ContractTemplatePage() {
  const menuRef = useRef<HTMLDivElement>(null);

    /* ───────── STATE ───────── */
    const [menuOpen, setMenuOpen] = useState(false);
    const [bulkDelete, setBulkDelete] = useState(false);

    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState("");

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalTemplates, setTotalTemplates] = useState(0);

    const [showApplicants, setShowApplicants] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [statsLoading, setStatsLoading] = useState(true);

    const [stats, setStats] = useState({
      total: 0,
      active: 0,
      inactive: 0,
      draft: 0,
      latestActive: null as string | null,
      latestInactive: null as string | null,
      latestDraft: null as string | null,
      latest: null as string | null,
    });

    const [selectedContractStatus, setSelectedContractStatus] = useState<
      (ContractStatus | "All")[]
    >([]);

    const [editingContract, setEditingContract] =
      useState<ContractTemplate | null>(null);

    const [templateToDelete, setTemplateToDelete] =
      useState<ContractTemplate | null>(null);

    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const formatDate = (dateString: string) => {
      if (!dateString) return "N/A";
      const date = new Date(dateString);
      return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
    };

    const itemsPerPage = 6;

    const contractColumns = useMemo(
      () => [
        {
          header: "Template Name",
          cell: (c: ContractTemplate) => (
            <div className="text-sm font-medium">{c.name}</div>
          ),
        },
        {
          header: "Allowance",
          cell: (c: ContractTemplate) => (
            <div className="text-sm">
              {c.monthlyAllowance} {c.currency}
            </div>
          ),
        },
        {
          header: "Duration",
          cell: (c: ContractTemplate) => (
            <div className="text-sm">{c.duration}</div>
          ),
        },
        {
          header: "Location",
          cell: (c: ContractTemplate) => (
            <div className="text-sm">{c.workLocation}</div>
          ),
        },
        {
          header: "Title",
          cell: (c: ContractTemplate) => (
            <div className="text-sm">{c.contractTitle}</div>
          ),
        },
        {
          header: "Status",
          cell: (c: ContractTemplate) => (
            <span
              className={cn(
                "text-xs px-2 py-1 rounded-md font-medium",
                c.status === "Active"
                  ? "bg-green-100 text-green-700"
                  : c.status === "Inactive"
                  ? "bg-red-100 text-red-600"
                  : "bg-blue-100 text-blue-600"
              )}
            >
              {c.status}
            </span>
          ),
        },
      ],
      []
    );

    const contractActions = {
      type: "menu" as const,
      items: [
        {
          label: "Edit",
          icon: <Edit className="w-4 h-4" />,
          onClick: (c: ContractTemplate) => {
            setEditingContract(c);
            setIsModalOpen(true);
          },
        },
        {
          label: "Delete",
          icon: <Trash2 className="w-4 h-4" />,
          variant: "destructive" as const,
          onClick: (c: ContractTemplate) => {
            setTemplateToDelete(c);
            setDeleteConfirmOpen(true);
          },
        },
      ],
    };

    /* ───────── HOOKS FROM HANDLER ───────── */

    const {
      createContractTemplate,
      updateContractTemplate,
      deleteContractTemplate,
      listContractTemplates,
      getContractTemplateStats,
      contractTemplates,
      loading,
      error,
    } = useContractTemplateHandler();



  /* ───────── EFFECTS ───────── */

    const fetchStats = async () => {
      setStatsLoading(true);
      try {
        const data = await getContractTemplateStats();
        setStats(data);
      } catch (err) {
        console.error("Failed to fetch stats:", err);
      } finally {
        setStatsLoading(false);
      }
    };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {


    fetchStats();
  }, [getContractTemplateStats]);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const res = await listContractTemplates(
          currentPage,
          itemsPerPage,
          searchQuery
        );

        setTotalPages(res.totalPages ?? 1);
        setTotalTemplates(res.total ?? 0);
      } catch (err) {
        console.error("Failed to fetch templates:", err);
      }
    };

    fetchTemplates();
  }, [currentPage, searchQuery, listContractTemplates]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedContractStatus]);



  const CONTRACT_STATUSES: ContractStatus[] = ["Active", "Inactive", "Draft"];


   /* ───────── HANDLERS ───────── */

  const handleSelect = (id: string, checked: boolean) => {
    setSelectedIds((prev) =>
      checked ? [...prev, id] : prev.filter((x) => x !== id)
    );
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const goToPrevious = () =>
    setCurrentPage((p) => Math.max(1, p - 1));

  const goToNext = () =>
    setCurrentPage((p) => Math.min(totalPages, p + 1));

  const handleToggleStatus = (status: ContractStatus | "All") => {
    setSelectedContractStatus((prev) => {
      // If clicking ALL → reset or select all
      if (status === "All") {
        return prev.includes("All")
          ? []
          : ["All", ...CONTRACT_STATUSES];
      }

      const isSelected = prev.includes(status);

      if (isSelected) {
        const updated = prev.filter(
          (s) => s !== status && s !== "All"
        );

        return updated;
      }

      return [...prev.filter((s) => s !== "All"), status];
    });
  };

  /* ───────── DERIVED DATA ───────── */

  const filteredTemplates = useMemo(() => {
    if (
      selectedContractStatus.length === 0 ||
      selectedContractStatus.includes("All")
    ) {
      return contractTemplates;
    }

    return contractTemplates.filter((template) =>
      selectedContractStatus.some(
        (status) =>
          template.status?.toLowerCase() === status.toLowerCase()
      )
    );
  }, [contractTemplates, selectedContractStatus]);

/* ───────── PAGINATION LOGIC ───────── */

  const VISIBLE_PAGES = 5;
  const startPage = useMemo(() => {
    return Math.max(
      1,
      Math.min(currentPage, totalPages - VISIBLE_PAGES + 1)
    );
  }, [currentPage, totalPages]);

  const endPage = useMemo(() => {
    return Math.min(totalPages, startPage + VISIBLE_PAGES - 1);
  }, [startPage, totalPages]);

  const visiblePages = useMemo(() => {
    return Array.from(
      { length: endPage - startPage + 1 },
      (_, i) => startPage + i
    );
  }, [startPage, endPage]);

  const showPlus = endPage < totalPages;

  /* ───────── STATS UI ───────── */

    const templateStats = useMemo(() => {
      const formatValue = (val: number) =>
        statsLoading ? (
          <SyncLoader size={8} color="#D4AF37" />
        ) : (
          <span style={{ color: val === 0 ? "gray" : "inherit" }}>
            {val.toString()}
          </span>
        );

      return [
  {
    title: "Total Templates",
    value: formatValue(stats.total),
    subtitle: statsLoading
      ? "Loading..."
      : stats.latest
      ? `Last: ${formatDate(stats.latest)}`
      : "No templates yet",
    icon: <FileText className="w-5 h-5 text-primary" />,
  },

  {
    title: "Active",
    value: formatValue(stats.active),
    subtitle: statsLoading
      ? "Loading..."
      : stats.latestActive
      ? `Last: ${formatDate(stats.latestActive)}`
      : stats.active > 0
      ? "No date available"
      : "No active templates",
    icon: <PlayCircle className="w-5 h-5 text-emerald-500" />,
  },

  {
    title: "Inactive",
    value: formatValue(stats.inactive),
    subtitle: statsLoading
      ? "Loading..."
      : stats.latestInactive
      ? `Last: ${formatDate(stats.latestInactive)}`
      : stats.inactive > 0
      ? "No date available"
      : "No inactive templates",
    icon: <PauseCircle className="w-5 h-5 text-red-500" />,
  },

  {
    title: "Draft (Pending)",
    value: formatValue(stats.draft),
    subtitle: statsLoading
      ? "Loading..."
      : stats.latestDraft
      ? `Last: ${formatDate(stats.latestDraft)}`
      : stats.draft > 0
      ? "No date available"
      : "No draft templates",
    icon: <Clock className="w-5 h-5 text-amber-500" />,
  },
];
    }, [stats, statsLoading]);
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
                text="Contract Templates"
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
                setEditingContract(null);
                setIsModalOpen(true);
              }}
            >
              <FilePlus2 className="mr-2 h-5 w-5 stroke-[2.5]" />
              Create Contract Template
            </Button>
          </motion.div>
        </header>

        {/* Top row: 4 cards */}
        {/* STATS */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => (
                <StatsCardSkeleton key={i} />
                ))
              : templateStats.map((stat, i) => (
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
                    />
                  </motion.div>
                ))}
          </section>

          {/* Main column */}
          <div className="flex flex-col gap-6">
            <SearchAndFilterAndViewBar
                searchQuery={searchQuery}
                setSearchQuery={(value) => {
                  setSearchQuery(value);
                  setCurrentPage(1);
                }}
                            viewMode={showApplicants ? "list" : "grid"}
                            setViewMode={(mode) => setShowApplicants(mode === "grid")}
                selectedStatuses={selectedContractStatus}
                toggleStatus={handleToggleStatus}
                availableStatuses={["All", ...CONTRACT_STATUSES]}
                placeholder="Search contracts..."
                filterLabel="Contract Status"
              />

            <SelectionBar
              selectedCount={selectedIds.length}
              isVisible={selectedIds.length > 0 && !showApplicants}
              onClearSelection={() => setSelectedIds([])}
              onDeleteClick={() => {
                setBulkDelete(true);
                setDeleteConfirmOpen(true);
              }}
            />

           {/* Contracts Grid: Card view */}
            {showApplicants && (
              loading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <ContractCardTemplateSkeleton key={i} />
                    ))}
                  </div>
              ) : error ? (
                <ErrorState
                  title="Failed to load contracts template"
                  description={
                    error || "We couldn’t fetch contract template data right now. Please try again."
                  }
                  onRetry={() => listContractTemplates(1, 1000)}
                />
              ) : filteredTemplates.length === 0 ? (
                <EmptyState
                  title="No contract template found"
                  description="No contracts template have been created or assigned yet."
                  icon={<FileSearch className="h-10 w-10 text-muted-foreground" />}
                  action={
                    <Button
                      onClick={() => setIsModalOpen(true)}
                      variant="outline"
                      className="rounded-xl"
                    >
                      Create First  Contract Template
                    </Button>
                  }
                />
              ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 ">
                  {filteredTemplates.map((contract, index) => (
                    <ContractCardTempletate
                      key={contract.id || index}
                      contract={contract}
                      onEdit={(contract) => {
                        setEditingContract(contract);
                        setIsModalOpen(true);
                      }}
                      onDelete={(contract) => {
                        setSelectedIds(contract);
                        setTemplateToDelete(contract);
                        setDeleteConfirmOpen(true);
                      }}
                    />
                  ))}
                </div>
              )
            )}

            
        {/* Contracts Grid: Row view */}
        {!showApplicants && (
          loading ? (
            <LoadingState label="Fetching contract templates..." />
          ) : error ? (
                <ErrorState
                  title="Failed to load contracts template"
                  description={
                    error || "We couldn’t fetch contract template data right now. Please try again."
                  }
                  onRetry={() => listContractTemplates(1, 1000)}
                />
                ) : filteredTemplates.length === 0 ? (
                <EmptyState
                  title="No contract template found"
                  description="No contracts template have been created or assigned yet."
                  icon={<FileSearch className="h-10 w-10 text-muted-foreground" />}
                  action={
                    <Button
                      onClick={() => setIsModalOpen(true)}
                      variant="outline"
                      className="rounded-xl"
                    >
                      Create First  Contract Template
                    </Button>
                  }
                />
          ) : (
<DataTable
  data={filteredTemplates}
  columns={contractColumns}
  getId={(c) => c.id!}
  selectable
  selectedIds={selectedIds}
  onSelect={setSelectedIds}
  onRowClick={(c) => {
    setEditingContract(c);
    setIsModalOpen(true);
  }}
  actions={contractActions}
/>
          )
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

      {/* Next */}
      <ContractModal
        isOpen={isModalOpen}
        contract={editingContract}
        onClose={() => {
          setIsModalOpen(false);
          setEditingContract(null);
        }}
        onSave={async (data) => {
          try {
            if (editingContract?.id) {
              await updateContractTemplate(editingContract.id, data);
              toast.success("Opportunity updated successfully");
            } else {
              await createContractTemplate(data);
              toast.success("Opportunity created successfully");
            }

            await Promise.all([
              listContractTemplates(currentPage, itemsPerPage, searchQuery),
              fetchStats(),
            ]);

            setIsModalOpen(false);
            setEditingContract(null);
          } catch (error) {
            toast.error("Failed to save opportunity");
            console.error(error);
          }
        }}
      />


    <ConfirmDeleteDialog
  isOpen={deleteConfirmOpen}
  onOpenChange={(open) => {
    setDeleteConfirmOpen(open);

    if (!open) {
      setTemplateToDelete(null);
      setBulkDelete(false);
    }
  }}
  isDeleting={deleting}
  title={bulkDelete ? "Delete Selected Templates" : "Delete Template"}
  description={
    bulkDelete
      ? "Are you sure you want to delete all selected templates? This action cannot be undone."
      : "Are you sure you want to delete this template? This action cannot be undone."
  }
  onConfirm={async () => {
    if (bulkDelete && selectedIds.length === 0) return;

    setDeleting(true);

    try {
      if (bulkDelete) {
        await Promise.all(
          selectedIds.map((id) => deleteContractTemplate(id))
        );

        toast.success(
          `${selectedIds.length} contract templates deleted successfully`
        );

        setSelectedIds([]);
      } else {
        if (!templateToDelete) return;

        const id =
          typeof templateToDelete === "string"
            ? templateToDelete
            : templateToDelete?.id;

        if (!id) return;
        await deleteContractTemplate(id);

        toast.success("Contract template deleted successfully");
      }

      setDeleteConfirmOpen(false);
      setTemplateToDelete(null);
      setBulkDelete(false);

      await Promise.all([
        listContractTemplates(currentPage, itemsPerPage, searchQuery),
        fetchStats(),
      ]);
    } catch (error) {
      console.error("Delete failed:", error);

      toast.error(
        "Failed to delete contract template(s). Please try again."
      );
    } finally {
      setDeleting(false);
    }
  }}
/>

    </DashboardLayout>
  );
}