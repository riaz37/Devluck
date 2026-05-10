"use client";

import DashboardLayout from "@/components/Company/DashboardLayout";
import { Clock, Edit, FilePlus2, FileSearch, FileText, PauseCircle, PlayCircle, Trash2 } from 'lucide-react';
import { useState, useMemo, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ContractStatus, ContractTemplate, useContractTemplateHandler } from "@/hooks/companyapihandler/useContractTemplateHandler";
import { motion } from "framer-motion";
import { SyncLoader } from "react-spinners";
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

export default function ContractTemplatePage() {
  /* ───────── STATE ───────── */
  const [bulkDelete, setBulkDelete] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTemplates, setTotalTemplates] = useState(0);
  const [showApplicants, setShowApplicants] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
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
  const [selectedContractStatus, setSelectedContractStatus] = useState<(ContractStatus | "All")[]>([]);
  const [editingContract, setEditingContract] = useState<ContractTemplate | null>(null);
  const [templateToDelete, setTemplateToDelete] = useState<ContractTemplate | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const itemsPerPage = 6;
  const CONTRACT_STATUSES: ContractStatus[] = ["Active", "Inactive", "Draft"];

  const {
    createContractTemplate,
    updateContractTemplate,
    deleteContractTemplate,
    listContractTemplates,
    getContractTemplateStats,
    contractTemplates: allContractTemplates, // ✅ Renamed to clarify
    listLoading,
    statsLoading,
    actionLoading,
    error,
    refetch,
  } = useContractTemplateHandler();

  /* ───────── CLIENT-SIDE FILTERING & PAGINATION ───────── */
  const filteredTemplates = useMemo(() => {
    let filtered = [...allContractTemplates];

    // ✅ Client-side search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((template) =>
        template.name.toLowerCase().includes(query) ||
        template.contractTitle.toLowerCase().includes(query) ||
        template.salaryDisplay?.toLowerCase().includes(query) ||
        template.duration.toLowerCase().includes(query)
      );
    }

    // ✅ Client-side status filtering
    if (selectedContractStatus.length > 0 && !selectedContractStatus.includes("All")) {
      const statusFilters = selectedContractStatus as ContractStatus[];
      filtered = filtered.filter((template) => statusFilters.includes(template.status));
    }

    return filtered;
  }, [allContractTemplates, searchQuery, selectedContractStatus]);

  // ✅ Client-side pagination
  const totalFiltered = filteredTemplates.length;
  const totalFilteredPages = Math.ceil(totalFiltered / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedTemplates = filteredTemplates.slice(startIndex, endIndex);

  /* ───────── STABLE REFS for fetchData ───────── */
  const listContractTemplatesRef = useRef(listContractTemplates);
  const getContractTemplateStatsRef = useRef(getContractTemplateStats);
  useEffect(() => { listContractTemplatesRef.current = listContractTemplates; }, [listContractTemplates]);
  useEffect(() => { getContractTemplateStatsRef.current = getContractTemplateStats; }, [getContractTemplateStats]);

  /* ───────── FETCH RAW DATA ONLY (page 1, no filters) ───────── */
  const fetchData = useMemo(() => async () => {
    try {
      const [templatesRes, statsRes] = await Promise.all([
        // ✅ Fetch ALL templates (page 1, large pageSize for client filtering)
        listContractTemplatesRef.current(1, 1000, ""), // Large pageSize for client-side
        getContractTemplateStatsRef.current(),
      ]);

      setTotalTemplates(templatesRes.total ?? 0);
      setStats(statsRes);
    } catch (err) {
      console.error("Failed to fetch data:", err);
    }
  }, []);

  /* ───────── MAIN EFFECT - Fetch raw data once ───────── */
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /* ───────── FILTER/SEARCH RESET ───────── */
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedContractStatus]);

  /* ───────── HELPERS ───────── */
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  };

  const columns = useMemo(() => [
    {
      header: "Template Name",
      cell: (c: ContractTemplate) => <div className="text-sm font-medium">{c.name}</div>,
    },
    {
      header: "Allowance",
      cell: (c: ContractTemplate) => (
        <div className="text-sm">{c.salaryDisplay || `${c.monthlyAllowance || "N/A"} ${c.currency}`}</div>
      ),
    },
    {
      header: "Duration",
      cell: (c: ContractTemplate) => <div className="text-sm">{c.duration}</div>,
    },
    {
      header: "Location",
      cell: (c: ContractTemplate) => <div className="text-sm">{c.workLocation}</div>,
    },
    {
      header: "Contract Title",
      cell: (c: ContractTemplate) => <div className="text-sm">{c.contractTitle}</div>,
    },
    {
      header: "Template Status",
      cell: (c: ContractTemplate) => (
        <span className={cn(
          "px-3 py-1 rounded-full text-xs font-semibold",
          c.status === "Active" ? "bg-green-100 text-green-700"
          : c.status === "Inactive" ? "bg-red-100 text-red-600"
          : "bg-blue-100 text-blue-600"
        )}>
          {c.status}
        </span>
      ),
    },
  ], []);

  const contractActions = {
    type: "menu" as const,
    items: [
      {
        label: "Edit",
        icon: <Edit className="w-4 h-4" />,
        onClick: (c: ContractTemplate) => { setEditingContract(c); setIsModalOpen(true); },
      },
      {
        label: "Delete",
        icon: <Trash2 className="w-4 h-4" />,
        variant: "destructive" as const,
        onClick: (c: ContractTemplate) => { setTemplateToDelete(c); setDeleteConfirmOpen(true); },
      },
    ],
  };

  const goToPage = (page: number) => setCurrentPage(Math.min(Math.max(page, 1), totalFilteredPages || 1));
  const goToPrevious = () => setCurrentPage((p) => Math.max(1, p - 1));
  const goToNext = () => setCurrentPage((p) => Math.min(totalFilteredPages || 1, p + 1));

  const handleToggleStatus = (status: ContractStatus | "All") => {
    setSelectedContractStatus((prev) => {
      if (status === "All") return prev.includes("All") ? [] : ["All"];
      const isSelected = prev.includes(status);
      if (isSelected) return prev.filter((s) => s !== status && s !== "All");
      return [...prev.filter((s) => s !== "All"), status];
    });
  };

  /* ───────── PAGINATION WINDOWS ───────── */
  const VISIBLE_PAGES = 5;
  const startPage = useMemo(() => Math.max(1, Math.min(currentPage, totalFilteredPages - VISIBLE_PAGES + 1)), [currentPage, totalFilteredPages]);
  const endPage = useMemo(() => Math.min(totalFilteredPages, startPage + VISIBLE_PAGES - 1), [startPage, totalFilteredPages]);
  const visiblePages = useMemo(() => Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i), [startPage, endPage]);

  /* ───────── STATS UI ───────── */
  const templateStats = useMemo(() => {
    const formatValue = (val: number) =>
      statsLoading
        ? <SyncLoader size={8} color="#D4AF37" />
        : <span style={{ color: val === 0 ? "gray" : "inherit" }}>{val.toString()}</span>;

    return [
      {
        title: "Total Templates",
        value: formatValue(stats.total),
        subtitle: statsLoading ? "Loading..." : stats.latest ? `Last: ${formatDate(stats.latest)}` : "No templates yet",
        icon: <FileText className="w-5 h-5 text-primary" />,
      },
      {
        title: "Active",
        value: formatValue(stats.active),
        subtitle: statsLoading ? "Loading..." : stats.latestActive ? `Last: ${formatDate(stats.latestActive)}` : stats.active > 0 ? "No date available" : "No active templates",
        icon: <PlayCircle className="w-5 h-5 text-emerald-500" />,
      },
      {
        title: "Inactive",
        value: formatValue(stats.inactive),
        subtitle: statsLoading ? "Loading..." : stats.latestInactive ? `Last: ${formatDate(stats.latestInactive)}` : stats.inactive > 0 ? "No date available" : "No inactive templates",
        icon: <PauseCircle className="w-5 h-5 text-red-500" />,
      },
      {
        title: "Draft (Pending)",
        value: formatValue(stats.draft),
        subtitle: statsLoading ? "Loading..." : stats.latestDraft ? `Last: ${formatDate(stats.latestDraft)}` : stats.draft > 0 ? "No date available" : "No draft templates",
        icon: <Clock className="w-5 h-5 text-amber-500" />,
      },
    ];
  }, [stats, statsLoading]);

  // ✅ Show filtered count
  const filteredCountInfo = useMemo(() => {
    if (listLoading) return "Loading...";
    if (totalFiltered === 0) return "No templates match your filters";
    return `${totalFiltered} template${totalFiltered !== 1 ? 's' : ''}`;
  }, [totalFiltered, listLoading]);

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">

        {/* HEADER */}
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
              Manage and track your contract templates.
            </p>
          </div>

          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-3">
            <Button
              size="lg"
              disabled={actionLoading}
              className={cn(
                "rounded-[var(--radius)] px-6 font-bold transition-all duration-300",
                "bg-primary text-primary-foreground",
                "hover:bg-primary/90 hover:scale-[1.03] active:scale-[0.98]",
                "shadow-[0_8px_20px_-4px_oklch(var(--primary)/0.2)]",
                "border border-primary/10"
              )}
              onClick={() => { setEditingContract(null); setIsModalOpen(true); }}
            >
              <FilePlus2 className="mr-2 h-5 w-5 stroke-[2.5]" />
              {actionLoading ? "Creating..." : "Create Contract Template"}
            </Button>
          </motion.div>
        </header>

        {/* STATS */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsLoading ? (
            Array.from({ length: 4 }).map((_, i) => <StatsCardSkeleton key={i} />)
          ) : (
            templateStats.map((stat, i) => (
              <motion.div key={stat.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <StatsCard title={stat.title} value={stat.value} subtitle={stat.subtitle} icon={stat.icon} />
              </motion.div>
            ))
          )}
        </section>

        {/* MAIN CONTENT */}
        <div className="flex flex-col gap-6">
          <SearchAndFilterAndViewBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            viewMode={showApplicants ? "list" : "grid"}
            setViewMode={(mode) => setShowApplicants(mode === "grid")}
            selectedStatuses={selectedContractStatus}
            toggleStatus={handleToggleStatus}
            availableStatuses={["All", ...CONTRACT_STATUSES] as (ContractStatus | "All")[]}
            placeholder="Search contracts..."
            filterLabel="Contract Status"
          />

          <SelectionBar
            selectedCount={selectedIds.length}
            isVisible={selectedIds.length > 0 && !showApplicants}
            onClearSelection={() => setSelectedIds([])}
            onDeleteClick={() => { setBulkDelete(true); setDeleteConfirmOpen(true); }}
          />

          {/* GRID VIEW */}
          {showApplicants && (
            listLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => <ContractCardTemplateSkeleton key={i} />)}
              </div>
            ) : error ? (
              <ErrorState title="Failed to load contract templates" description={error} onRetry={fetchData} />
            ) : paginatedTemplates.length === 0 ? (
              <EmptyState
                title="No contract templates match your filters"
                description="Try adjusting your search or status filters."
                icon={<FileSearch className="h-10 w-10 text-muted-foreground" />}
                action={
                  <div className="flex gap-2">
                    <Button onClick={() => { setSearchQuery(""); setSelectedContractStatus(["All"]); }} variant="outline" className="rounded-xl">
                      Clear Filters
                    </Button>
                    <Button onClick={() => setIsModalOpen(true)} className="rounded-xl">
                      Create Template
                    </Button>
                  </div>
                }
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {paginatedTemplates.map((contract) => (
                  <ContractCardTempletate
                    key={contract.id}
                    contract={contract}
                    onEdit={(c) => { setEditingContract(c); setIsModalOpen(true); }}
                    onDelete={(c) => { setTemplateToDelete(c); setDeleteConfirmOpen(true); }}
                  />
                ))}
              </div>
            )
          )}

          {/* TABLE VIEW */}
          {!showApplicants && (
            listLoading ? (
              <LoadingState label="Fetching contract templates..." />
            ) : error ? (
              <ErrorState title="Failed to load contract templates" description={error} onRetry={fetchData} />
            ) : paginatedTemplates.length === 0 ? (
              <EmptyState
                title="No contract templates match your filters"
                description="Try adjusting your search or status filters."
                icon={<FileSearch className="h-10 w-10 text-muted-foreground" />}
                action={
                  <div className="flex gap-2">
                    <Button onClick={() => { setSearchQuery(""); setSelectedContractStatus(["All"]); }} variant="outline" className="rounded-xl">
                      Clear Filters
                    </Button>
                    <Button onClick={() => setIsModalOpen(true)} className="rounded-xl">
                      Create Template
                    </Button>
                  </div>
                }
              />
            ) : (
              <DataTable
                data={paginatedTemplates}
                columns={columns}
                getId={(c) => c.id}
                selectable
                selectedIds={selectedIds.filter(id => paginatedTemplates.some(t => t.id === id))} // ✅ Filter selected for current page
                onSelect={(ids) => setSelectedIds(ids)}
                onRowClick={(c) => { setEditingContract(c); setIsModalOpen(true); }}
                actions={contractActions}
              />
            )
          )}
        </div>

        {/* PAGINATION */}
        {totalFilteredPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalFilteredPages}
            visiblePages={visiblePages}
            loading={listLoading}
            error={error}
            onPageChange={goToPage}
            onPrevious={goToPrevious}
            onNext={goToNext}
          />
        )}

        {/* CREATE / EDIT MODAL */}
        <ContractModal
          isOpen={isModalOpen}
          contract={editingContract}
          onClose={() => { setIsModalOpen(false); setEditingContract(null); }}
          onSave={async (data) => {
            try {
              if (editingContract?.id) {
                await updateContractTemplate(editingContract.id, data);
                toast.success("Contract template updated successfully");
              } else {
                await createContractTemplate(data);
                toast.success("Contract template created successfully");
              }
              setIsModalOpen(false);
              setEditingContract(null);
              await fetchData(); // ✅ Refetch raw data
            } catch {
              toast.error("Failed to save contract template");
            }
          }}
        />

        {/* DELETE DIALOG */}
        <ConfirmDeleteDialog
          isOpen={deleteConfirmOpen}
          onOpenChange={(open) => {
            setDeleteConfirmOpen(open);
            if (!open) { setTemplateToDelete(null); setBulkDelete(false); }
          }}
          isDeleting={actionLoading}
          title={bulkDelete ? "Delete Selected Templates" : "Delete Template"}
          description={
            bulkDelete
              ? "Are you sure you want to delete all selected templates? This action cannot be undone."
              : "Are you sure you want to delete this template? This action cannot be undone."
          }
          onConfirm={async () => {
            if (bulkDelete && selectedIds.length === 0) return;
            try {
              if (bulkDelete) {
                await Promise.all(selectedIds.map((id) => deleteContractTemplate(id)));
                toast.success(`${selectedIds.length} contract templates deleted successfully`);
                setSelectedIds([]);
              } else {
                if (templateToDelete?.id) {
                  await deleteContractTemplate(templateToDelete.id);
                  toast.success("Contract template deleted successfully");
                }
              }

              setDeleteConfirmOpen(false);
              setTemplateToDelete(null);
              setBulkDelete(false);
              await fetchData(); // ✅ Refetch raw data
            } catch {
              toast.error("Failed to delete contract template(s). Please try again.");
            }
          }}
        />
      </div>
    </DashboardLayout>
  );
}