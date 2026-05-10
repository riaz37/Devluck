"use client";
import { useRouter } from "next/navigation";
import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import DashboardLayout from "@/components/Company/DashboardLayout";
import { AlertCircle, CheckCircle, CheckCircle2, Currency, Edit, Eye, File, FilePlus2, FileText, MoreHorizontal, PlayCircle, Trash2 } from 'lucide-react';
import { useContractHandler } from "@/hooks/companyapihandler/useContractHandler";
import { useCompanyContractProgressHandler } from "@/hooks/companyapihandler/useCompanyContractProgressHandler";
import { motion } from "framer-motion";
import { SyncLoader } from "react-spinners";
import DecryptedText from "@/components/ui/DecryptedText";
import DisputeModal from "@/components/Company/Modal/DisputeModal";
import { Pagination } from "@/components/common/Pagination";
import { StatsCard } from "@/components/common/stats-card";
import { SearchAndFilterAndViewBar } from "@/components/common/SearchAndFilterAndViewBar";
import { SelectionBar } from "@/components/common/SelectionBar";
import { EmptyState } from "@/components/common/EmptyState";
import { LoadingState } from "@/components/common/LoadingState";
import { ErrorState } from "@/components/common/ErrorState";
import { cn } from "@/lib/utils";
import { ContractStatus, MappedContract } from "@/types/contract";
import { toast } from "sonner";
import { ConfirmDeleteDialog } from "@/components/common/ConfirmDeleteDialog";
import { DataTable } from "@/components/common/DataTable";
import { Button } from "@/components/ui/button";
import { ContractCard } from "@/components/Company/ContractCard";
import ContractModal from "@/components/Company/Modal/ContractModal";
import { StatsCardSkeleton } from "@/components/common/Skeleton/StatsCardSkeleton";
import { ContractCardSkeleton } from "@/components/Company/Skeleton/ContractCardSkeleton";

export default function ContractListPage() {
  // =========================
  // Modals / UI State
  // =========================
  const [selectedContractId, setSelectedContractId] = useState<string | null>(null);
  const [disputeModalOpen, setDisputeModalOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContract, setEditingContract] = useState<any>(null);

  // =========================
  // Selection / Bulk Actions
  // =========================
  const [bulkDelete, setBulkDelete] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // =========================
  // Pagination / View / Filters
  // =========================
  const itemsPerPage = 6;
  const [currentPage, setCurrentPage] = useState(1);
  const [showApplicants, setShowApplicants] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const CONTRACT_STATUSES: ContractStatus[] = ["All", "Running", "Completed", "Disputed"];
  const [selectedContractStatus, setSelectedContractStatus] = useState<ContractStatus[]>(["All"]);

  const router = useRouter();

  // =========================
  // API / Data - ✅ FIXED TO USE HOOK STATS
  // =========================
  const {
    contracts: allContracts,
    contractStatsData,     // ✅ NOW FROM HOOK
    listLoading,
    statsLoading,
    actionLoading,
    error,
    listContracts,
    getContractStats,
    updateContract,
    deleteContract,
    refetch,
  } = useContractHandler();

  const {
    getContractProgressReports,
    updateContractProgress,
    loading: reportLoading,
    updating: progressSaving
  } = useCompanyContractProgressHandler();

  const [reportByContractId, setReportByContractId] = useState<Record<string, any>>({});

  // =========================
  // Delete State
  // =========================
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [contractToDelete, setContractToDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  /* ───────── MAPPING - ✅ FULLY FIXED ───────── */
  const mappedContracts: MappedContract[] = useMemo(() => {
    return allContracts.map((contract) => {
      const contractStartDate = new Date(contract.createdDate || contract.createdAt);
      const durationMonths = Number(contract.duration?.match(/\d+/)?.[0] || 0);
      const contractEndDate = new Date(contractStartDate);
      contractEndDate.setMonth(contractEndDate.getMonth() + durationMonths);
      const formatCompactNumber = (value: number | string) => {
        const num = Number(value);

        if (Number.isNaN(num)) return "N/A";

        if (num >= 1_000_000) {
          return `${(num / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
        }

        if (num >= 1_000) {
          return `${(num / 1_000).toFixed(1).replace(/\.0$/, "")}k`;
        }

        return num.toString();
      };
      const contractNumber = contract.inContractNumber || contract.id;
      const shortContractId = contractNumber.length > 4 ? contractNumber.slice(-4) : contractNumber;
      const salaryDisplay = contract.monthlyAllowance
        ? `${contract.currency || "USD"} ${formatCompactNumber(contract.monthlyAllowance)}`
        : contract.salary
        ? `${contract.currency || "USD"} ${formatCompactNumber(contract.salary)}`
        : "N/A";

      const normalizedStatus = contract.status?.toLowerCase();
      const currentStage = normalizedStatus === "completed" ? "completed" 
        : normalizedStatus === "running" ? "running"
        : normalizedStatus === "disputed" ? "disputed" : "evaluation";

      return {
        id: contract.id, 
        contractNumber, 
        shortContractId,
        studentName: contract.name || "Unknown Student",
        studentImage: contract.student?.image ?? undefined, // ✅ FIXED: null → undefined
        contractTitle: contract.contractTitle || "Untitled Contract",
        contractStatus: contract.status,
        currentStage,
        startDate: contractStartDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        endDate: contractEndDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        createdAt: contract.createdAt,
        updatedAt: contract.updatedAt,
        currency: contract.currency || "USD",
        monthlyAllowance: contract.monthlyAllowance ?? undefined, // ✅ FIXED: removed trailing comma
        salary: contract.salary ?? undefined,
        salaryDisplay,
        workProgress: typeof contract.workProgress === "number" ? contract.workProgress : 0,
        hasReport: Boolean(contract.hasReport),
        duration: contract.duration || "N/A",
        workLocation: contract.workLocation || "Not specified",
        note: contract.note || "",
        raw: contract,
      };
    });
  }, [allContracts]);

  const filteredContracts = useMemo(() => {
    let filtered = mappedContracts;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((contract) =>
        contract.studentName.toLowerCase().includes(query) ||
        contract.contractTitle.toLowerCase().includes(query) ||
        contract.contractNumber.toLowerCase().includes(query) ||
        contract.salaryDisplay.toLowerCase().includes(query)
      );
    }

    if (selectedContractStatus.length > 0 && !selectedContractStatus.includes("All")) {
      filtered = filtered.filter((contract) => 
        selectedContractStatus.includes(contract.contractStatus as ContractStatus)
      );
    }

    return filtered;
  }, [mappedContracts, searchQuery, selectedContractStatus]);

  // ✅ Client-side pagination
  const totalFiltered = filteredContracts.length;
  const totalFilteredPages = Math.ceil(totalFiltered / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedContracts = filteredContracts.slice(startIndex, endIndex);

  /* ───────── FETCH DATA - ✅ SIMPLIFIED ───────── */
  const listContractsRef = useRef(listContracts);
  const getContractStatsRef = useRef(getContractStats);
  
  useEffect(() => { listContractsRef.current = listContracts; }, [listContracts]);
  useEffect(() => { getContractStatsRef.current = getContractStats; }, [getContractStats]);

  const fetchData = useCallback(async () => {
    try {
      await Promise.all([
        listContractsRef.current(1, 1000, ""), 
        getContractStatsRef.current(),
      ]);
    } catch (err) {
      console.error("Failed to fetch data:", err);
    }
  }, [listContractsRef, getContractStatsRef]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /* ───────── RESET PAGE ON FILTER CHANGE ───────── */
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedContractStatus]);

  /* ───────── ACTIONS ───────── */
  const toggleStatus = useCallback((status: ContractStatus) => {
    setSelectedContractStatus((prev) => {
      if (status === "All") return ["All"];
      const filtered = prev.filter((s) => s !== "All");
      if (filtered.includes(status)) {
        const next = filtered.filter((s) => s !== status);
        return next.length === 0 ? ["All"] : next;
      }
      return [...filtered, status];
    });
  }, []);

  const handleContractAction = useCallback((action: string, id: string) => {
    const originalContract = allContracts.find((c) => c.id === id);
    if (!originalContract) return;

    switch (action) {
      case "details":
        router.push(`/Company/contract-list/${id}`);
        break;
      case "delete":
        setSelectedIds((prev) => prev.filter((x) => x !== id));
        setContractToDelete(id);
        setDeleteConfirmOpen(true);
        break;
      case "dispute":
        setSelectedContractId(originalContract.id);
        setDisputeModalOpen(true);
        break;
      case "edit": {
        const createdDate = new Date(originalContract.createdDate || originalContract.createdAt);
        const durationMonths = originalContract.duration ? parseInt(originalContract.duration.split(" ")[0]) : 0;
        const endDate = new Date(createdDate);
        endDate.setMonth(endDate.getMonth() + durationMonths);

        setEditingContract({
          email: (originalContract as any).email || "",
          name: originalContract.name || "",
          contractTitle: originalContract.contractTitle || "",
          durationValue: originalContract.duration || "",
          startDate: createdDate.toISOString().split("T")[0],
          endDate: endDate.toISOString().split("T")[0],
          currency: originalContract.currency,
          salary: originalContract.salary
            ? originalContract.salary.toString()
            : originalContract.monthlyAllowance
            ? originalContract.monthlyAllowance.toString()
            : "",
          note: originalContract.note || "",
          contractStatus: originalContract.status || "",
          id: originalContract.id,
        });
        setIsModalOpen(true);
        break;
      }
      default:
        console.warn(`Unhandled action: ${action}`);
    }
  }, [allContracts, router]);

  const handleOpenReport = useCallback(async (contractId: string) => {
    try {
      const payload = await getContractProgressReports(contractId);
      const latestReport = payload.reports?.[0];
      setReportByContractId((prev) => ({
        ...prev,
        [contractId]: {
          reports: (payload.reports || []).map((report: any) => ({
            report: report.report,
            links: Array.isArray(report.links) ? report.links : [],
            files: Array.isArray(report.files)
              ? report.files.map((file: any) => ({
                  fileName: file.fileName,
                  fileUrl: file.fileUrl,
                  fileType: file.fileType || file.mimeType || ""
                }))
              : [],
            createdAt: report.createdAt
          })),
          hasReport: Boolean(latestReport),
          workProgress: payload.contract?.workProgress ?? 0
        }
      }));
    } catch (err: any) {
      toast.error(err?.message || "Failed to load report");
    }
  }, [getContractProgressReports]);

  const handleSaveProgress = useCallback(async (contractId: string, workProgress: number) => {
    try {
      await updateContractProgress(contractId, workProgress);
      toast.success("Contract progress updated");
      setReportByContractId((prev) => ({
        ...prev,
        [contractId]: { ...(prev[contractId] || {}), workProgress }
      }));
      await fetchData();
    } catch (err: any) {
      toast.error(err?.message || "Failed to update progress");
    }
  }, [updateContractProgress, fetchData]);

  /* ───────── PAGINATION HELPERS ───────── */
  const goToPage = (page: number) => setCurrentPage(Math.min(Math.max(page, 1), totalFilteredPages || 1));
  const goToPrevious = () => setCurrentPage((p) => Math.max(1, p - 1));
  const goToNext = () => setCurrentPage((p) => Math.min(totalFilteredPages || 1, p + 1));

  const VISIBLE_PAGES = 5;
  const startPage = useMemo(() => Math.max(1, Math.min(currentPage, totalFilteredPages - VISIBLE_PAGES + 1)), [currentPage, totalFilteredPages]);
  const endPage = useMemo(() => Math.min(totalFilteredPages, startPage + VISIBLE_PAGES - 1), [startPage, totalFilteredPages]);
  const visiblePages = useMemo(() => Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i), [startPage, endPage]);

  const filteredCountInfo = useMemo(() => {
    if (listLoading) return "Loading...";
    if (totalFiltered === 0) return "No contracts match your filters";
    return `${totalFiltered} contract${totalFiltered !== 1 ? 's' : ''}`;
  }, [totalFiltered, listLoading]);

  /* ───────── STATS UI - ✅ NOW USES HOOK DATA ───────── */
  const contractStats = useMemo(() => {
    const formatValue = (val: number) =>
      statsLoading ? <SyncLoader size={8} color="#D4AF37" /> 
        : <span style={{ color: val === 0 ? "gray" : "inherit" }}>{val}</span>;

    return [
      { title: "Total Contracts", value: formatValue(contractStatsData.total), subtitle: "All contracts in the system", color: "text-zinc-500", bg: "bg-zinc-500/10", icon: <FileText className="w-5 h-5 text-zinc-500" /> },
      { title: "Running", value: formatValue(contractStatsData.running), subtitle: "Currently active contracts", color: "text-blue-500", bg: "bg-blue-500/10", icon: <PlayCircle className="w-5 h-5 text-blue-500" /> },
      { title: "Completed", value: formatValue(contractStatsData.completed), subtitle: "Finished contracts", color: "text-emerald-500", bg: "bg-emerald-500/10", icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" /> },
      { title: "Disputed", value: formatValue(contractStatsData.other), subtitle: "Contracts with other status", color: "text-rose-500", bg: "bg-rose-500/10", icon: <AlertCircle className="w-5 h-5 text-rose-500" /> },
    ];
  }, [contractStatsData, statsLoading]);

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {/* HEADER */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <motion.h1 className="text-3xl font-bold tracking-tight text-foreground" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
              <DecryptedText text="Contracts" speed={40} maxIterations={20} className="revealed" parentClassName="inline-block" />
            </motion.h1>
              <p className="text-muted-foreground mt-1">
                Create, organize, and manage your contracts.
              </p>
          </div>
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-3">
            <Button size="lg" disabled={actionLoading} className={cn("rounded-[var(--radius)] px-6 font-bold transition-all duration-300 bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-[1.03] active:scale-[0.98] shadow-[0_8px_20px_-4px_oklch(var(--primary)/0.2)] border border-primary/10")} onClick={() => { setEditingContract(null); setIsModalOpen(true); }}>
              <FilePlus2 className="mr-2 h-5 w-5 stroke-[2.5]" />
              Create Contract
            </Button>
          </motion.div>
        </header>

        {/* STATS */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsLoading ? Array.from({ length: 4 }).map((_, i) => <StatsCardSkeleton key={i} />) : contractStats.map((stat, i) => (
            <motion.div key={stat.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <StatsCard title={stat.title} value={stat.value} subtitle={stat.subtitle} icon={stat.icon} iconColor={stat.color} />
            </motion.div>
          ))}
        </section>

        {/* MAIN CONTENT */}
        <div className="flex flex-col gap-6">
          <SearchAndFilterAndViewBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            viewMode={showApplicants ? "grid" : "list"}
            setViewMode={(mode) => setShowApplicants(mode === "grid")}
            availableStatuses={CONTRACT_STATUSES}
            selectedStatuses={selectedContractStatus}
            toggleStatus={toggleStatus}
            placeholder="Search contracts..."
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
                {Array.from({ length: 6 }).map((_, i) => <ContractCardSkeleton key={i} />)}
              </div>
            ) : error ? (
              <ErrorState title="Unable to load contracts" description={error || "We couldn't fetch contract data right now."} onRetry={fetchData} />
            ) : paginatedContracts.length === 0 ? (
              <EmptyState
                icon={<File size={40} />}
                title="No contracts match your filters"
                description="Try adjusting your search or status filters."
                action={
                  <div className="flex gap-2">
                    <Button onClick={() => { setSearchQuery(""); setSelectedContractStatus(["All"]); }} variant="outline" className="rounded-xl">Clear Filters</Button>
                    <Button onClick={() => { setEditingContract(null); setIsModalOpen(true); }} className="rounded-xl">Create Contract</Button>
                  </div>
                }
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {paginatedContracts.map((contract) => (
                  <ContractCard
                    key={contract.id}
                    contract={contract}
                    hasReport={Boolean(contract.hasReport)}
                    reports={reportByContractId[contract.id]?.reports ?? []}
                    reportLoading={reportLoading}
                    progressSaving={progressSaving}
                    onOpenReport={handleOpenReport}
                    onSaveProgress={handleSaveProgress}
                    onAction={handleContractAction}
                  />
                ))}
              </div>
            )
          )}

          {/* TABLE VIEW */}
          {!showApplicants && (
            listLoading ? <LoadingState label="Fetching contracts..." /> : error ? (
              <ErrorState title="Unable to load contracts" description={error || "We couldn't fetch contract data right now."} onRetry={fetchData} />
            ) : paginatedContracts.length === 0 ? (
              <EmptyState
                icon={<File size={40} />}
                title="No contracts match your filters"
                description="Try adjusting your search or status filters."
                action={
                  <div className="flex gap-2">
                    <Button onClick={() => { setSearchQuery(""); setSelectedContractStatus(["All"]); }} variant="outline" className="rounded-xl">Clear Filters</Button>
                    <Button onClick={() => { setEditingContract(null); setIsModalOpen(true); }} className="rounded-xl">Create Contract</Button>
                  </div>
                }
              />
            ) : (
              <DataTable
                data={paginatedContracts}
                getId={(a) => a.id}
                selectedIds={selectedIds.filter(id => paginatedContracts.some(t => t.id === id))}
                onSelect={setSelectedIds}
                selectable
                onRowClick={(a) => handleContractAction("details", a.id)}
                columns={[
                  {
                    header: "StudentName & CO-ID",
                    cell: (a: MappedContract) => (
                      <div className="flex flex-col">
                        <span>{a.studentName}</span>
                        <span className="text-xs text-muted-foreground">CO-ID-{a.id}</span>
                      </div>
                    ),
                  },
                  { header: "Contract Title", cell: (a: MappedContract) => a.contractTitle?.slice(0, 25) ?? "N/A" },
                  { header: "Salary", cell: (a: MappedContract) => a.salaryDisplay ?? "N/A" },
                  { header: "Period", cell: (a: MappedContract) => `${a.startDate ?? "N/A"} — ${a.endDate ?? "N/A"}` },
                  {
                    header: "Contract Status",
                    cell: (a: MappedContract) => {
                      const statusClass = cn(
                        "px-3 py-1 rounded-full text-xs font-semibold",
                        a.contractStatus === "Running" &&
                          "bg-blue-500/10 text-blue-600 dark:text-blue-400",
                        a.contractStatus === "Completed" &&
                          "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
                        a.contractStatus === "Disputed" &&
                          "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                      );

                      return (
                        <span className={statusClass}>
                          {a.contractStatus || "N/A"}
                        </span>
                      );
                    },
                  },
                ]}
                actions={{
                  type: "menu" as const,
                  items: [
                    { icon: <Eye className="w-4 h-4" />, label: "Details", onClick: (a) => handleContractAction("details", a.id) },
                    { icon: <Edit className="w-4 h-4" />, label: "Edit", onClick: (a) => handleContractAction("edit", a.id) },
                    { label: "Dispute", icon: <Edit className="w-4 h-4" />, hidden: (a) => a.contractStatus !== "Disputed", onClick: (a) => handleContractAction("dispute", a.id) },
                    { label: "Delete", icon: <Trash2 className="w-4 h-4" />, variant: "destructive" as const, onClick: (a) => handleContractAction("delete", a.id) },
                  ],
                }}
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

        {/* MODALS */}
        <ContractModal
          isOpen={isModalOpen}
          contract={editingContract}
          onClose={() => { setIsModalOpen(false); setEditingContract(null); }}
          onSave={async (data) => {
            try {
              setIsModalOpen(false);
              setEditingContract(null);
              setCurrentPage(1);
              await fetchData();
              toast.success(editingContract?.id ? "Contract updated successfully!" : "Contract created successfully!");
            } catch {
              toast.error("Failed to save contract");
            }
          }}
        />

        <ConfirmDeleteDialog
          isOpen={deleteConfirmOpen}
          onOpenChange={(open) => {
            setDeleteConfirmOpen(open);
            if (!open) { setContractToDelete(null); setBulkDelete(false); }
          }}
          isDeleting={deleting}
          title={bulkDelete ? "Delete Selected Contracts" : "Delete Contract"}
          description="This action cannot be undone."
          onConfirm={async () => {
            setDeleting(true);
            try {
              if (bulkDelete && selectedIds.length > 0) {
                await Promise.all(selectedIds.map(id => deleteContract(id)));
                toast.success(`${selectedIds.length} contracts deleted`);
                setSelectedIds([]);
              } else if (contractToDelete) {
                await deleteContract(contractToDelete);
                toast.success("Contract deleted");
              }
              setDeleteConfirmOpen(false);
              setContractToDelete(null);
              setBulkDelete(false);
              await fetchData();
            } catch {
              toast.error("Failed to delete contract(s)");
            } finally {
              setDeleting(false);
            }
          }}
        />

        <DisputeModal
          contractId={selectedContractId || ''}
          open={disputeModalOpen}
          onClose={() => setDisputeModalOpen(false)}
          onSuccess={async () => {
            setDisputeModalOpen(false);
            toast.success('Dispute action completed');
            await fetchData();
          }}
        />
      </div>
    </DashboardLayout>
  );
}