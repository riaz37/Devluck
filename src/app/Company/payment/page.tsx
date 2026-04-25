// src/app/Company/payment/page.tsx
"use client";
import {useRouter } from "next/navigation";
import { useState, useMemo, useRef, useEffect } from "react";
import DashboardLayout from "@/components/Company/DashboardLayout";
import { AlertTriangle,Clock, DollarSign, Pause, Sparkles } from 'lucide-react';
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
import { PaymnetCard } from "@/components/Company/PaymnetCard";
import { StatsCardSkeleton } from "@/components/common/Skeleton/StatsCardSkeleton";
import { PaymentCardSkeleton } from "@/components/Company/Skeleton/PaymentCardSkeleton";



const ITEMS_PER_PAGE = 8;
export default function PaymentPage() {
    const menuRef = useRef<HTMLDivElement>(null);

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

    //--------------------------------Action menu--------------------------
    const [menuOpen, setMenuOpen] = useState(false);
    const [menuPos, setMenuPos] = useState<{ top: number; left: number } | null>(null);
    // ---------------------------------------------------------------------

    //---------------------filter----------------------------------
    type ContractStatus = "Running" | "Completed" | "All";

    const CONTRACT_STATUSES: ContractStatus[] = ["Running", "Completed", "All"];

    const [selectedContractStatus, setSelectedContractStatus] = useState<ContractStatus[]>([]);
    const [showApplicants, setShowApplicants] = useState(true);
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    const { contracts, loading, listContracts } = useContractHandler();
    const [totalContracts, setTotalContracts] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
      const fetchContracts = async () => {
        try {
          const statusFilter = selectedContractStatus.length > 0 && !selectedContractStatus.includes("All") 
            ? selectedContractStatus[0] 
            : undefined;
          
          const response = await listContracts(currentPage, ITEMS_PER_PAGE, searchQuery || undefined, statusFilter);
          setTotalContracts(response.total);
          setTotalPages(response.totalPages);
        } catch (err) {
          console.error("Failed to fetch contracts:", err);
          toast.error("Failed to fetch contracts. Please try again.");
        }
      };

      fetchContracts();
    }, [currentPage, searchQuery, selectedContractStatus, listContracts]);

    // 🔍 Filter contracts
    const filteredContracts = useMemo(() => {
      return contracts.filter(contract => {
        // Search filter
        const searchMatch =
          !searchQuery.trim() ||
          contract.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          contract.contractTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
          contract.inContractNumber.toLowerCase().includes(searchQuery.toLowerCase());

        // Contract status filter
        const contractMatch =
          selectedContractStatus.length === 0 || // empty = no filter
          selectedContractStatus.includes("All") || // All = include all
          selectedContractStatus.includes(contract.status as "Running" | "Completed");

        return searchMatch && contractMatch;
      });
    }, [contracts, searchQuery, selectedContractStatus]);


    
    // 📄 Pagination
    const paginatedContracts = filteredContracts;
    
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


    const { payments,  error, listPayments } = usePaymentHandler();

  // Fetch all payments and contracts on mount
  useEffect(() => {
    const fetchData = async () => {
      await listPayments(1, 1000); // get all payments
      await listContracts(1, 8); // get all contracts
    };
    fetchData();
  }, [listPayments, listContracts]);

  // Refresh payments when page becomes visible or focused (user navigates back)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        listPayments(1, 1000);
      }
    };

    const handleFocus = () => {
      listPayments(1, 1000);
    };

    if (typeof window !== 'undefined') {
      document.addEventListener('visibilitychange', handleVisibilityChange);
      window.addEventListener('focus', handleFocus);

      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        window.removeEventListener('focus', handleFocus);
      };
    }
  }, [listPayments]);

  const formatValue = (val: number, suffix?: string) =>
    loading ? (
      <SyncLoader size={8} color="#D4AF37" />
    ) : (
      <span style={{ color: val === 0 ? "gray" : "inherit" }}>
        {val.toLocaleString()} {suffix ?? ""}
      </span>
    );

  // Compute totals dynamically
  const stats = useMemo(() => {
    const totalPaid = payments
      .filter(p => p.paymentStatus === "Paid")
      .reduce((sum, p) => sum + parseFloat(p.monthlyAllowance || "0"), 0);

    const pendingPayment = payments
      .filter(p => p.paymentStatus === "Pending")
      .reduce((sum, p) => sum + parseFloat(p.monthlyAllowance || "0"), 0);

    const due = payments
      .filter(p => p.paymentStatus === "Due")
      .reduce((sum, p) => sum + parseFloat(p.monthlyAllowance || "0"), 0);

    const hold = payments.filter(p => p.paymentStatus === "Hold").length;

    return [
      {
        title: "Total Paid",
        value: formatValue(totalPaid, "USD"),
        subtitle: loading
          ? "Loading..."
          : `${payments.filter(p => p.paymentStatus === "Paid").length}+ this week`,
        icon: <Sparkles className="w-5 h-5" />,
        iconColor: "#F59E0B",
      },
      {
        title: "Pending Payment",
        value: formatValue(pendingPayment, "USD"),
        subtitle: loading
          ? "Loading..."
          : `${payments.filter(p => p.paymentStatus === "Pending").length}% growth`,
        icon: <Clock className="w-5 h-5" />,
        iconColor: "#3B82F6",
      },
      {
        title: "Due",
        value: formatValue(due, "USD"),
        subtitle: loading
          ? "Loading..."
          : `${payments.filter(p => p.paymentStatus === "Due").length}% growth`,
        icon: <AlertTriangle className="w-5 h-5" />,
        iconColor: "#EF4444",
      },
      {
        title: "Hold",
        value: formatValue(hold, "USD"),
        subtitle: loading
          ? "Loading..."
          : `${hold} this week`,
        icon: <Pause className="w-5 h-5" />,
        iconColor: "#8B5CF6",
      },
    ];
  }, [payments, loading]);

const contractColumns = [
  {
    header: "Name",
    cell: (row: any) => (
      <div className="font-medium">{row.name}</div>
    ),
  },
  {
    header: "Contract",
    cell: (row: any) => (
      <div className="text-sm">{row.contractTitle}</div>
    ),
  },
  {
    header: "Salary",
    cell: (row: any) => (
      <div>
        {row.salary ? `${row.salary} ${row.currency}` : "N/A"}
      </div>
    ),
  },
  {
    header: "Transfer ID",
    cell: (row: any) => row.inContractNumber,
  },
  {
    header: "Note",
    cell: (row: any) => (
      <div className="max-w-[200px] truncate">
        {row.note || "N/A"}
      </div>
    ),
  },
  {
    header: "Status",
    cell: (row: any) => (
      <Badge
        className={`
          text-[12px]
          ${
            row.status === "Running" &&
            "bg-[#D3FCD2] text-[#22C55E]"
          }
          ${
            row.status === "Completed" &&
            "bg-[#E0E0E0] text-[#666666]"
          }
          ${
            row.status === "Disputed" &&
            "bg-[#FFE2E2] text-[#DC2626]"
          }
        `}
      >
        {row.status}
      </Badge>
    ),
  },
];
return (
  <DashboardLayout>
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Page Title */}
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
                text="Payment"
                speed={40}
                maxIterations={20}
                className="revealed"
                parentClassName="inline-block"
              />
            </motion.h1>
            <p className="text-muted-foreground mt-1">
              Manage and track your paymnets.
            </p>
          </div>

        </header>
      
        {/* STATS */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => (
                <StatsCardSkeleton key={i} />
                ))
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

      {/* Main Column */}
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
              setSelectedContractStatus(["Running", "Completed", "All"]);
            } else {
              setSelectedContractStatus((prev) =>
                prev.includes(status)
                  ? prev.filter((s) => s !== status && s !== "All")
                  : [...prev.filter((s) => s !== "All"), status]
              );
            }
          }}
          availableStatuses={CONTRACT_STATUSES}
          placeholder="Search payments..."
          filterLabel="Contract Status"
        />

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4  ">
          {Array.from({ length: 8 }).map((_, i) => (
            <PaymentCardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="flex justify-center py-12 mt-25">
          <ErrorState
            icon={<DollarSign size={40} className="text-red-500" />}
            title="Failed to load paymnets"
            description={error || "Something went wrong. Please try again."}
          />
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && paginatedContracts.length === 0 && (
        <div className="flex items-center justify-center py-10 mt-25">
          <EmptyState
            icon={<DollarSign size={40} />}
            title="No paymnets found"
            description="Create your first paymnets to get started"
          />
        </div>
      )}

      {/* Contracts Grid */}
      {!loading &&  !error &&  paginatedContracts.length > 0 && showApplicants && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4  ">
          {paginatedContracts.map((contract) => (
            <PaymnetCard
              key={contract.id}
              contract={{
                id: contract.id,
                name: contract.name,
                contractTitle: contract.contractTitle,
                salary: contract.salary || null,
                createdAt: contract.createdAt,
                currency: contract.currency,
                status: contract.status,
                studentImage: (contract as any).student?.image,
              }}
            />
          ))}
        </div>
      )}

         {/* Contracts Table */}
        {!loading && !error && paginatedContracts.length > 0 && !showApplicants && (
          <DataTable
            data={paginatedContracts}
            columns={contractColumns}
            getId={(row) => row.id}
          />
        )}

      </div>
    </div>

    {/* Pagination */}
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