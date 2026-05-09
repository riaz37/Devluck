// src/app/Company/contract-list/page.tsx
"use client";
import {useRouter } from "next/navigation";
import { useState, useMemo,useEffect } from "react";
import DashboardLayout from "@/components/Company/DashboardLayout";
import { CheckCircle, CheckCircle2, Currency, Edit, Eye, File, FilePlus2, FileText, MoreHorizontal, PlayCircle, Trash2 } from 'lucide-react';

import { useContractHandler } from "@/hooks/companyapihandler/useContractHandler";
import { useCompanyContractProgressHandler } from "@/hooks/companyapihandler/useCompanyContractProgressHandler";
import { motion } from "framer-motion";
import { SyncLoader } from "react-spinners";
import DecryptedText from "@/components/ui/DecryptedText";
import DisputeModal from "@/components/Company/DisputeModal";
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
  const [deleteMode, setDeleteMode] = useState<"single" | "multiple">("single");
  // =========================
  // Selection / Bulk Actions
  // =========================
  const [bulkDelete, setBulkDelete] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  function handleSelect(id: string, checked: boolean) {
    setSelectedIds((prev) =>
      checked ? [...prev, id] : prev.filter((x) => x !== id)
    );
  }

  // =========================
  // Pagination / View
  // =========================
  const [itemsPerPage, setItemsPerPage] = useState(6);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    function updateItemsPerPage() {
      if (window.innerWidth < 640) {
        setItemsPerPage(5);
      } else {
        setItemsPerPage(6);
      }
    }

    updateItemsPerPage();
    window.addEventListener("resize", updateItemsPerPage);

    return () => window.removeEventListener("resize", updateItemsPerPage);
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [itemsPerPage]);

  // =========================
  // Filters
  // =========================
  const CONTRACT_STATUSES: ContractStatus[] = [
    "All",
    "Running",
    "Completed",
    "Disputed",
  ];

  const [selectedContractStatus, setSelectedContractStatus] =
    useState<ContractStatus[]>(["All"]);

  const [showApplicants, setShowApplicants] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const router = useRouter();

  // =========================
  // API / Data
  // =========================
  const {
    contracts,
    loading,
    error,
    listContracts,
    getContractStats,
    updateContract,
    deleteContract,
  } = useContractHandler();
  const {
    getContractProgressReports,
    updateContractProgress,
    loading: reportLoading,
    updating: progressSaving
  } = useCompanyContractProgressHandler();
  const [reportByContractId, setReportByContractId] = useState<Record<string, any>>({});

  const [totalContracts, setTotalContracts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [contractStatsData, setContractStatsData] = useState({
    total: 0,
    running: 0,
    completed: 0,
    other: 0,
  });

  const [statsLoading, setStatsLoading] = useState(true);

  // =========================
  // Delete State
  // =========================
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [contractToDelete, setContractToDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // =========================
  // Fetch Contracts
  // =========================
  useEffect(() => {
    async function fetchContracts() {
      try {
        const response = await listContracts(
          currentPage,
          itemsPerPage,
          searchQuery || undefined
        );

        setTotalContracts(response.total);
        setTotalPages(response.totalPages);
      } catch (err) {
        console.error("Failed to fetch contracts:", err);
        toast.error("Failed to fetch contracts");
      }
    }

    fetchContracts();
  }, [
    currentPage,
    searchQuery,
    selectedContractStatus,
    listContracts,
    itemsPerPage,
  ]);

  // =========================
  // Fetch Stats
  // =========================
  useEffect(() => {
    async function fetchStats() {
      setStatsLoading(true);
      try {
        const stats = await getContractStats();
        setContractStatsData(stats);
      } catch (err) {
        console.error("Failed to fetch contract stats:", err);
        toast.error("Failed to fetch contract stats");
      } finally {
        setStatsLoading(false);
      }
    }

    fetchStats();
  }, [getContractStats]);

  async function refreshStats() {
    setStatsLoading(true);
    try {
      const stats = await getContractStats();
      setContractStatsData(stats);
    } catch (err) {
      console.error("Failed to fetch contract stats:", err);
      toast.error("Failed to fetch contract stats");
    } finally {
      setStatsLoading(false);
    }
  }

  // =========================
  // Mapping
  // =========================
   const mappedContracts: MappedContract[] = useMemo(() => {
    return contracts.map((contract) => {
      /* =====================================================
      * DATES
      * ===================================================== */

      const contractStartDate = new Date(
        contract.createdDate || contract.createdAt
      );

      const durationMonths = Number(
        contract.duration?.match(/\d+/)?.[0] || 0
      );

      const contractEndDate = new Date(contractStartDate);

      contractEndDate.setMonth(
        contractEndDate.getMonth() + durationMonths
      );

      /* =====================================================
      * CONTRACT IDS
      * ===================================================== */

      const contractNumber =
        contract.inContractNumber || contract.id;

      const shortContractId =
        contractNumber.length > 4
          ? contractNumber.slice(-4)
          : contractNumber;

      /* =====================================================
      * SALARY
      * ===================================================== */

      const salaryDisplay = contract.monthlyAllowance
        ? `${contract.currency || "USD"} ${contract.monthlyAllowance}`
        : contract.salary
        ? `${contract.currency || "USD"} ${contract.salary}`
        : "N/A";
      /* =====================================================
      * STATUS → STAGE
      * ===================================================== */

      const normalizedStatus =
        contract.status?.toLowerCase();

      const currentStage =
        normalizedStatus === "completed"
          ? "completed"
          : normalizedStatus === "running"
          ? "running"
          : normalizedStatus === "disputed"
          ? "disputed"
          : "evaluation";

      /* =====================================================
      * RETURN
      * ===================================================== */

      return {
        /* =========================================
        * IDs
        * ======================================= */

        id: contract.id,
        contractNumber,
        shortContractId,

        /* =========================================
        * Student
        * ======================================= */

        studentName: contract.name || "Unknown Student",

        studentImage:
          contract.student?.image || undefined,

        /* =========================================
        * Contract
        * ======================================= */

        contractTitle:
          contract.contractTitle || "Untitled Contract",

        contractStatus: contract.status,
        currentStage,

        /* =========================================
        * Dates
        * ======================================= */

        startDate:
          contractStartDate.toLocaleDateString(
            "en-US",
            {
              month: "short",
              day: "numeric",
              year: "numeric",
            }
          ),

        endDate:
          contractEndDate.toLocaleDateString(
            "en-US",
            {
              month: "short",
              day: "numeric",
              year: "numeric",
            }
          ),

        createdAt: contract.createdAt,
        updatedAt: contract.updatedAt,

        /* =========================================
        * Finance
        * ======================================= */

        currency: contract.currency || "USD",

        monthlyAllowance:
          contract.monthlyAllowance ?? undefined,

        salary:
          contract.salary ?? undefined,

        salaryDisplay,

        /* =========================================
        * Progress
        * ======================================= */

        workProgress:
          typeof contract.workProgress === "number"
            ? contract.workProgress
            : 0,
        hasReport: Boolean(contract.hasReport),

        /* =========================================
        * Extra Details
        * ======================================= */

        duration: contract.duration || "N/A",

        workLocation:
          contract.workLocation || "Not specified",

        note: contract.note || "",

        /* =========================================
        * Raw Backup Data
        * ======================================= */

        raw: contract,
      };
    });
    
  }, [contracts]);

  // =========================
  // Filtering
  // =========================
  const filteredContracts = useMemo(() => {
    if (
      selectedContractStatus.length === 0 ||
      selectedContractStatus.includes("All")
    ) {
      return mappedContracts;
    }

    return mappedContracts.filter((contract) =>
      selectedContractStatus.some(
        (status) => contract.contractStatus === status
      )
    );
  }, [mappedContracts, selectedContractStatus]);

  function toggleStatus(status: ContractStatus) {
    setSelectedContractStatus((prev) => {
      if (status === "All") return ["All"];

      const filtered = prev.filter((s) => s !== "All");

      if (filtered.includes(status)) {
        const next = filtered.filter((s) => s !== status);
        return next.length === 0 ? ["All"] : next;
      } else {
        return [...filtered, status];
      }
    });
  }

  // =========================
  // Actions
  // =========================
  function handleContractAction(action: string, id: string) {
    const originalContract = contracts.find((c) => c.id === id);
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
        const createdDate = new Date(
          originalContract.createdDate || originalContract.createdAt
        );

        const durationMonths = originalContract.duration
          ? parseInt(originalContract.duration.split(" ")[0])
          : 0;

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
  }

  const handleOpenReport = async (contractId: string) => {
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
  };

  const handleSaveProgress = async (contractId: string, workProgress: number) => {
    try {
      await updateContractProgress(contractId, workProgress);
      toast.success("Contract progress updated");
      setReportByContractId((prev) => ({
        ...prev,
        [contractId]: {
          ...(prev[contractId] || {}),
          workProgress
        }
      }));
      await listContracts(currentPage, itemsPerPage, searchQuery || undefined);
      await refreshStats();
    } catch (err: any) {
      toast.error(err?.message || "Failed to update progress");
    }
  };

  // =========================
  // Pagination Helpers
  // =========================
  const paginatedApplicants = filteredContracts;

  function goToPage(page: number) {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  }

  function goToPrevious() {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  }

  function goToNext() {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  }

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

  const showPlus = endPage < totalPages;

  // =========================
  // Stats UI
  // =========================
  const contractStats = useMemo(() => {
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
    title: "Total Contracts",
    value: formatValue(contractStatsData.total),
    subtitle: "All contracts in the system",
    color: "text-zinc-500",
    bg: "bg-zinc-500/10",
    icon: <FileText className="w-5 h-5 text-zinc-500" />,
  },
  {
    title: "Running",
    value: formatValue(contractStatsData.running),
    subtitle: "Currently active contracts",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    icon: <PlayCircle className="w-5 h-5 text-blue-500" />,
  },
  {
    title: "Completed",
    value: formatValue(contractStatsData.completed),
    subtitle: "Finished contracts",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
  },
  {
    title: "Other",
    value: formatValue(contractStatsData.other),
    subtitle: "Contracts with other status",
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    icon: <MoreHorizontal className="w-5 h-5 text-amber-500" />,
  },
];
  }, [contractStatsData, statsLoading]);

  // =========================
  // JSX
  // =========================
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
                text="Contracts"
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
                setEditingContract(null); // clear previous data
                setIsModalOpen(true);
              }}
            >
              <FilePlus2 className="mr-2 h-5 w-5 stroke-[2.5]" />
              Create Contract 
            </Button>
          </motion.div>


        </header>
        {/* STATS */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => (
                <StatsCardSkeleton key={i} />
                ))
              : contractStats.map((stat, i) => (
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
                      iconColor={stat.color}
                    />
                  </motion.div>
                ))}
          </section>

      {/* Main Column */}
      <div className="flex flex-col gap-6">
        <SearchAndFilterAndViewBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          viewMode={showApplicants ? "grid" : "list"}
          setViewMode={(mode: "grid" | "list") => setShowApplicants(mode === "grid")}
          availableStatuses={CONTRACT_STATUSES}
          selectedStatuses={selectedContractStatus}
          toggleStatus={toggleStatus} // 👈 Change this from filteredContracts to toggleStatus
          placeholder="Search contracts..."
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

      {/* Applicants Grid */}
          {showApplicants && (
            <>
              {loading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3  gap-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <ContractCardSkeleton key={i} />
                    ))}
                  </div>
              ) : error ? (
                <ErrorState
                  title="Unable to load contracts"
                  description={
                    error || "We couldn’t fetch contract data right now. Please try again."
                  }
                  onRetry={() => listContracts(1, 1000)}
                />
              ) : paginatedApplicants.length === 0 ? (
                  <EmptyState
                    icon={<File size={40} />}
                    title="No contracts found"
                    description="No contracts have been created or assigned yet."
                    action={
                      <Button
                        onClick={() => {
                          setEditingContract(null);
                          setIsModalOpen(true);
                        }}
                        variant="outline"
                        className="rounded-xl"
                      >
                        Create Contract
                      </Button>
                    }
                  />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3  gap-4">
                  {paginatedApplicants.map((contract, index) => (
                    <ContractCard
                      key={contract.id}
                      contract={contract}
                      hasReport={Boolean(contract.hasReport)}
                      reports={
                        reportByContractId[contract.id]?.reports ?? []
                      }
                      reportLoading={reportLoading}
                      progressSaving={progressSaving}
                      onOpenReport={handleOpenReport}
                      onSaveProgress={handleSaveProgress}
                      onAction={handleContractAction}
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
      <LoadingState label="Fetching contracts..." />
    ) : error ? (
                <ErrorState
                  title="Unable to load contracts"
                  description={
                    error || "We couldn’t fetch contract data right now. Please try again."
                  }
                  onRetry={() => listContracts(1, 1000)}
                />
    ) : paginatedApplicants.length === 0 ? (
                  <EmptyState
                    icon={<File size={40} />}
                    title="No contracts found"
                    description="No contracts have been created or assigned yet."
                    action={
                      <Button
                        onClick={() => {
                          setEditingContract(null);
                          setIsModalOpen(true);
                        }}
                        variant="outline"
                        className="rounded-xl"
                      >
                        Create Contract
                      </Button>
                    }
                  />
    ) : (
      <DataTable
  data={paginatedApplicants}
  getId={(a) => a.id}
  selectedIds={selectedIds}
  onSelect={setSelectedIds}
  selectable
  onRowClick={(a) => handleContractAction("details", a.id)}
  columns={[
    {
      header: "Name & ID",
      cell: (a: MappedContract) => (
        <div className="flex flex-col">
          <span>{a.studentName}</span>
          <span className="text-xs text-muted-foreground">
            CO-ID-{a.id}
          </span>
        </div>
      ),
    },

    {
      header: "Contract",
      cell: (a: MappedContract) =>
        a.contractTitle?.slice(0, 25) ?? "N/A",
    },

    {
      header: "Paid",
      cell: (a: MappedContract) =>
        a.salaryDisplay ?? "N/A",
    },

    {
        header: "Period",
        cell: (a: MappedContract) =>
          `${a.startDate ?? "N/A"} — ${a.endDate ?? "N/A"}`,
      },

      {
        header: "Status",
        cell: (a: MappedContract) => {
          const statusClass = cn(
            "px-3 py-1 rounded-full text-xs font-semibold",
            a.contractStatus === "Running" &&
              "bg-green-500/10 text-green-600 ",
            a.contractStatus === "Completed" &&
              "bg-muted text-muted-foreground ",
            a.contractStatus === "Disputed" &&
              "bg-red-500/10 text-red-600 "
          );

          return <span className={statusClass}>{a.contractStatus ||"N/A"}</span>;
        },
      },
  ]}

actions={{
  type: "menu",
  items: [
    {
      icon: <Eye className="w-4 h-4" />,
      label: "Details",
      onClick: (a) => handleContractAction("details", a.id),
    },
    {
      icon: <Edit className="w-4 h-4" />,
      label: "Edit",
      onClick: (a) => handleContractAction("edit", a.id),
    },
    {
      label: "Dispute",
      icon: <Edit className="w-4 h-4" />,
      hidden: (a) => a.contractStatus !== "Disputed", // ✅ clean
      onClick: (a) => handleContractAction("dispute", a.id),
    },
    {
      label: "Delete",
      icon: <Trash2 className="w-4 h-4" />,
      variant: "destructive",
      onClick: (a) => handleContractAction("delete", a.id),
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

     <ContractModal
      isOpen={isModalOpen}
      contract={editingContract}
      onClose={() => {
        setIsModalOpen(false);
        setEditingContract(null);
      }}
      onSave={async (data) => {
        setIsModalOpen(false);
        const wasEditing = editingContract && (editingContract as any).id;
        setEditingContract(null);
        setCurrentPage(1);

        try {
          // Refresh both contract list and stats
          await Promise.all([
            listContracts(1, itemsPerPage, searchQuery || undefined),
            refreshStats(),
          ]);

          // Show toast depending on whether it's edit or create
          if (wasEditing) {
            toast.success("Contract updated successfully!"); 
          } else {
            toast.success("Contract created successfully!");
          }

        } catch (error) {
          console.error("Failed to save contract:", error);
          toast.error("Failed to save contract. Please try again."); 
        }
      }}
    />

<ConfirmDeleteDialog
  isOpen={deleteConfirmOpen}
  onOpenChange={(open) => {
    setDeleteConfirmOpen(open);
    if (!open) {
      setContractToDelete(null);
      setBulkDelete(false);
    }
  }}
  isDeleting={deleting}
  title="Delete Contract"
  description="Are you sure you want to delete this contract? This action cannot be undone."
  onConfirm={async () => {
    setDeleting(true);

    try {
      if (bulkDelete) {
        await Promise.all(selectedIds.map((id) => deleteContract(id)));
        setSelectedIds([]);
        setBulkDelete(false);
        toast.success("Selected contracts deleted successfully"); 
      } else {
        if (!contractToDelete) return;
        await deleteContract(contractToDelete);
        toast.success("Contract deleted successfully");
      }

      const statusFilter =
        selectedContractStatus.length > 0 &&
        !selectedContractStatus.includes("All")
          ? selectedContractStatus[0]
          : undefined;

      await Promise.all([
        listContracts(
          currentPage,
          itemsPerPage,
          searchQuery || undefined,
          statusFilter
        ),
        refreshStats(),
      ]);


      setDeleteConfirmOpen(false);
      setContractToDelete(null);
    } catch (error) {
      console.error("Delete failed:", error);
      toast.error("Failed to delete contract(s). Please try again.");
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
        toast.success('Dispute action completed successfully'); 

        try {
          const response = await listContracts(
            currentPage,
            itemsPerPage,
            searchQuery || undefined
          );
          setTotalContracts(response.total);
          setTotalPages(response.totalPages);
        } catch (err) {
          console.error("Failed to refresh contracts:", err);
          toast.error("Failed to refresh contracts. Please try again.");
        }
      }}
    />
  </DashboardLayout>
);
}