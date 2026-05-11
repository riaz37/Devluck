// src/app/Company/payment/page.tsx
"use client";
import { useRouter } from "next/navigation";
import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/Company/DashboardLayout";
import { AlertTriangle, Briefcase, Clock, DollarSign, File, FileCheckIcon, FileIcon, FileLineChart, Pause, Sparkles } from 'lucide-react';
import { useContractHandler } from "@/hooks/companyapihandler/useContractHandler";
import { usePaymentHandler } from "@/hooks/companyapihandler/usePaymentHandler";
import { motion } from "framer-motion";
import { SyncLoader } from "react-spinners";
import DecryptedText from "@/components/ui/DecryptedText";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { LoadingState } from "@/components/common/LoadingState";
import { SearchAndFilterAndViewBar } from "@/components/common/SearchAndFilterAndViewBar";
import { StatsCard } from "@/components/common/stats-card";
import { Pagination } from "@/components/common/Pagination";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/common/DataTable";
import { PaymentCard } from "@/components/Company/PaymnetCard";
import { StatsCardSkeleton } from "@/components/common/Skeleton/StatsCardSkeleton";
import { PaymentCardSkeleton } from "@/components/Company/Skeleton/PaymentCardSkeleton";
import { cn } from "@/lib/utils";

const ITEMS_PER_PAGE = 8;

export default function PaymentPage() {
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);

  // Action menu state
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState<{ top: number; left: number } | null>(null);

  // Filter state
  type ContractStatus = "Running" | "Completed"| "Disputed" | "All";
  const CONTRACT_STATUSES: ContractStatus[] = ["Running", "Completed", "Disputed", "All"];
  const [selectedContractStatus, setSelectedContractStatus] = useState<ContractStatus[]>([]);
  const [showApplicants, setShowApplicants] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Hooks
  const {
    contracts,
    contractStatsData,
    listLoading,
    statsLoading: contractsStatsLoading,
    error: contractError,
    listContracts,
    getContractStats
  } = useContractHandler();

  const {
    error: paymentError,
    listPayments,
    getCompanyPaymentStats
  } = usePaymentHandler();

  const [companyStats, setCompanyStats] = useState<{
    totalPaid: { amount: number; count: number };
    pending: { amount: number; count: number };
    due: { amount: number; count: number };
  } | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [totalContracts, setTotalContracts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // ✅ SINGLE DATA FETCHING - Fixed double loading
  const fetchInitialData = useCallback(async () => {
    setStatsLoading(true);
    try {
      await Promise.all([
        listPayments(1, 1000),
        getCompanyPaymentStats().then(setCompanyStats),
        getContractStats(), // This will populate contractStatsData
        listContracts(currentPage, ITEMS_PER_PAGE, searchQuery || undefined, 
          selectedContractStatus.length > 0 && !selectedContractStatus.includes("All") 
            ? selectedContractStatus[0] 
            : undefined
        ).then((response) => {
          setTotalContracts(response.total);
          setTotalPages(response.totalPages);
        })
      ]);
    } catch (err) {
      console.error("Failed to fetch initial data:", err);
      toast.error("Failed to load data. Please try again.");
    } finally {
      setStatsLoading(false);
    }
  }, [listPayments, getCompanyPaymentStats, getContractStats, listContracts, currentPage, searchQuery, selectedContractStatus]);

  // ✅ Initial load - only once
  useEffect(() => {
    fetchInitialData();
  }, []); // Empty dependency array = only on mount

  // ✅ Filter-based refetch - when filters change
  useEffect(() => {
    const statusFilter = selectedContractStatus.length > 0 && !selectedContractStatus.includes("All") 
      ? selectedContractStatus[0] 
      : undefined;
    
    listContracts(currentPage, ITEMS_PER_PAGE, searchQuery || undefined, statusFilter)
      .then((response) => {
        setTotalContracts(response.total);
        setTotalPages(response.totalPages);
      })
      .catch(err => {
        console.error("Failed to fetch filtered contracts:", err);
        toast.error("Failed to fetch contracts.");
      });
  }, [currentPage, searchQuery, selectedContractStatus, listContracts]);

  // ✅ Visibility change - lighter refresh
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // Only refresh stats and payments, not contracts (prevents double loading)
        Promise.all([
          listPayments(1, 1000),
          getCompanyPaymentStats().then(setCompanyStats)
        ]).catch(console.error);
      }
    };

    if (typeof window !== 'undefined') {
      document.addEventListener('visibilitychange', handleVisibilityChange);
      return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }
  }, [listPayments, getCompanyPaymentStats]);

  // Filter contracts client-side for display
  const filteredContracts = useMemo(() => {
    return contracts.filter(contract => {
      const searchMatch =
        !searchQuery.trim() ||
        contract.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contract.contractTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contract.inContractNumber.toLowerCase().includes(searchQuery.toLowerCase());

      const contractMatch =
        selectedContractStatus.length === 0 ||
        selectedContractStatus.includes("All") ||
        selectedContractStatus.includes(contract.status as "Running" | "Completed"| "Disputed");

      return searchMatch && contractMatch;
    });
  }, [contracts, searchQuery, selectedContractStatus]);

  const paginatedContracts = filteredContracts;

  // Pagination handlers
  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  }, [totalPages]);

  const goToPrevious = () => {
    if (currentPage > 1) setCurrentPage(prev => prev - 1);
  };

  const goToNext = () => {
    if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
  };

  const VISIBLE_PAGES = 5;
  const startPage = Math.max(1, Math.min(currentPage, totalPages - VISIBLE_PAGES + 1));
  const endPage = Math.min(totalPages, startPage + VISIBLE_PAGES - 1);
  const visiblePages = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);

  // Format stats values
  const formatValue = (val: number, suffix?: string) =>
    statsLoading ? (
      <SyncLoader size={8} color="#D4AF37" />
    ) : (
      <span style={{ color: val === 0 ? "gray" : "inherit" }}>
        {val.toLocaleString()} {suffix ?? ""}
      </span>
    );

  // ✅ Enhanced stats using both payment stats AND contract stats
  const stats = useMemo(() => {
    const totalPaid = companyStats?.totalPaid.amount || 0;
    const pendingPayment = companyStats?.pending.amount || 0;
    const due = companyStats?.due.amount || 0;
    const totalPaidCount = companyStats?.totalPaid.count || 0;
    const pendingCount = companyStats?.pending.count || 0;
    const dueCount = companyStats?.due.count || 0;
    const totalContractsCount = contractStatsData.total;

    return [
      {
        title: "Total Paid",
        value: formatValue(totalPaid, "USD"),
        subtitle: statsLoading ? "Loading..." : `${totalPaidCount} payments`,
        icon: <DollarSign className="w-5 h-5 " />,
        iconColor: "#10B981",
      },
      {
        title: "Pending Payment",
        value: formatValue(pendingPayment, "USD"),
        subtitle: statsLoading ? "Loading..." : `${pendingCount} pending`,
        icon: <Clock className="w-5 h-5" />,
        iconColor: "#3B82F6",
      },
      {
        title: "Due",
        value: formatValue(due, "USD"),
        subtitle: statsLoading ? "Loading..." : `${dueCount} due`,
        icon: <AlertTriangle className="w-5 h-5" />,
        iconColor: "#EF4444",
      },
      {
        title: "Total Contracts", // ✅ NEW - using contract stats
        value: formatValue(totalContractsCount, ""),
        subtitle: statsLoading ? "Loading..." : `${contractStatsData.running} running, ${contractStatsData.completed} completed`,
        icon: <FileIcon className="w-5 h-5" />,
        iconColor: "#F59E0B",
      },
    ];
  }, [companyStats, contractStatsData, statsLoading]);

  const statusConfig: Record<string, string> = {
    Running:
      "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200/50",
    Completed:
      "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200/50",
    Disputed:
      "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200/50",
  };

  // Contract table columns
  const contractColumns = [
    {
      header: "Applicant Name",
      cell: (row: any) => <div className="font-medium">{row.name}</div>,
    },
    {
      header: "Contract Title",
      cell: (row: any) => <div className="text-sm">{row.contractTitle}</div>,
    },
    {
      header: "Salary",
      cell: (row: any) => (
        <div>{row.salary ? `${row.salary} ${row.currency}` : "N/A"}</div>
      ),
    },
    {
      header: "Transfer ID",
      cell: (row: any) => row.inContractNumber,
    },
    {
      header: "Note",
      cell: (row: any) => (
        <div className="max-w-[200px] truncate">{row.note || "N/A"}</div>
      ),
    },
    {
      header: "Status",
      cell: (row: any) => (
        <Badge
          className={cn(
            "text-[12px] px-2.5 py-0.5 rounded-full font-medium border",
            statusConfig[row.status]
          )}
        >
          {row.status}
        </Badge>
      ),
    },
  ];

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Combined loading and error states
  const isLoading = listLoading || statsLoading || contractsStatsLoading;
  const hasError = contractError || paymentError;

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <motion.h1
              className="text-3xl font-bold tracking-tight text-foreground"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <DecryptedText
                text="Payments"
                speed={40}
                maxIterations={20}
                className="revealed"
                parentClassName="inline-block"
              />
            </motion.h1>
            <p className="text-muted-foreground mt-1">
              Manage and track your payments.
            </p>
          </div>
        </header>

        {/* Stats Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => <StatsCardSkeleton key={i} />)
            : stats.map((stat, i) => (
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

        {/* Main Content */}
        <div className="flex flex-col gap-6">
          <SearchAndFilterAndViewBar
            searchQuery={searchQuery}
            setSearchQuery={(value) => {
              setSearchQuery(value);
              setCurrentPage(1);
            }}
            viewMode={showApplicants ? "grid" : "list"}
            setViewMode={(mode: "grid" | "list") => setShowApplicants(mode === "grid")}
            selectedStatuses={selectedContractStatus}
            toggleStatus={(status) => {
              if (status === "All") {
                setSelectedContractStatus(["All"]); // ✅ FIXED: Just "All"
              } else {
                setSelectedContractStatus((prev) => {
                  // Remove "All" first
                  const filtered = prev.filter((s) => s !== "All");
                  
                  if (filtered.includes(status)) {
                    // Remove status
                    const next = filtered.filter((s) => s !== status);
                    return next.length === 0 ? ["All"] : next;
                  } else {
                    // Add status
                    return [...filtered, status];
                  }
                });
              }
              setCurrentPage(1); // ✅ Reset page
            }}
            availableStatuses={CONTRACT_STATUSES}
            placeholder="Search payments..."
            filterLabel="Contract Status"
          />

          {/* Loading State */}
          {isLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <PaymentCardSkeleton key={i} />
              ))}
            </div>
          )}

          {/* Error State */}
          {!isLoading && hasError && (
            <ErrorState
              icon={<DollarSign size={40} className="text-red-500" />}
              title="Failed to load payments"
              description={hasError || "Something went wrong. Please try again."}
            />
          )}

          {/* Empty State */}
          {!isLoading && !hasError && paginatedContracts.length === 0 && (
            <EmptyState
              icon={<DollarSign size={40} />}
              title="No payments found"
              description="Create your first payments to get started"
            />
          )}

          {/* Grid View */}
          {!isLoading && !hasError && paginatedContracts.length > 0 && showApplicants && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {paginatedContracts.map((contract) => (
              <PaymentCard
                key={contract.id}
                contract={{
                  id: contract.id,
                  name: contract.name,
                  contractTitle: contract.contractTitle,
                  salary: contract.salary || null,
                  createdAt: contract.createdAt,
                  currency: contract.currency,
                  status: contract.status,
                  duration: contract.duration,             // ✅ NEW
                  note: contract.note,                     // ✅ NEW
                  workProgress: contract.workProgress,     // ✅ NEW
                  companyId: contract.companyId, 
                  createdDate: contract.createdDate,       // ✅ NEW
                  studentImage: contract.student?.image,   // ✅ CLEANED UP
                  student: contract.student,               // ✅ FULL STUDENT OBJECT
                }}
                onClick={() => router.push(`/Company/payment/${contract.id}`)}
              />
              ))}
            </div>
          )}

          {/* Table View */}
          {!isLoading && !hasError && paginatedContracts.length > 0 && !showApplicants && (
            <DataTable
              data={paginatedContracts}
              columns={contractColumns}
              getId={(row) => row.id}
              actions={{
                type: "button",
                label: "View Payment",
                onClick: (contract: any) => router.push(`/Company/payment/${contract.id}`),
              }}
            />
          )}
        </div>
      </div>

      {/* Pagination */}
      {!isLoading && totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          visiblePages={visiblePages}
          loading={false}
          error={null}
          onPageChange={goToPage}
          onPrevious={goToPrevious}
          onNext={goToNext}
        />
      )}
    </DashboardLayout>
  );
}