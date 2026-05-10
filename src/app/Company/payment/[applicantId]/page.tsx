// src/app/Company/payment/[contractId]/page.tsx
"use client";
import { useState, useMemo, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import DashboardLayout from "@/components/Company/DashboardLayout";
import { AlertCircle, ArrowUpRight, Clock3, DollarSign, File, FilePlus2, User, Wallet } from 'lucide-react';
import { useParams } from "next/navigation";
import PaymentModal from "@/components/Company/Modal/PaymentModal";
import { useContractHandler } from "@/hooks/companyapihandler/useContractHandler";
import { usePaymentHandler } from "@/hooks/companyapihandler/usePaymentHandler";
import { motion } from "framer-motion";
import { CircleLoader, SyncLoader } from "react-spinners";
import DecryptedText from "@/components/ui/DecryptedText";
import { StatsCard } from "@/components/common/stats-card";
import { StatsCardSkeleton } from "@/components/common/Skeleton/StatsCardSkeleton";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/common/EmptyState";
import { Pagination } from "@/components/common/Pagination";
import { LoadingState } from "@/components/common/LoadingState";
import { ErrorState } from "@/components/common/ErrorState";
import { toast } from "sonner";
import { ConfirmDeleteDialog } from "@/components/common/ConfirmDeleteDialog";
import { SelectionBar } from "@/components/common/SelectionBar";
import { SearchAndFilterBar } from "@/components/common/SearchAndFilter";
import { DataTable } from "@/components/common/DataTable";


interface Payment {
  id: string;
  applicantName: string;
  contractId?: string;
  nextPayment: string;
  monthlyAllowance?: string;
  note?: string;
  paymentStatus: string;
  applicantId?: string | null;
  transferId?: string | null;
  workLocation?: string | null;
  method?: string | null;
  companyId: string;
  createdAt: string;
  updatedAt: string;
}


    const ITEMS_PER_PAGE = 6;
export default function PaymentPage() {
    const [bulkDelete, setBulkDelete] = useState(false);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const handleSelect = (id: string, checked: boolean) => {
      setSelectedIds((prev) =>
        checked ? [...prev, id] : prev.filter((x) => x !== id)
      );
    };

    // ---------------modal popup--------
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPayment, setEditingPayment] = useState<any>(null);
    const [selectedContract, setSelectedContract] = useState<any>(null);
    //-----------------------------------
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [paymentToDelete, setPaymentToDelete] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);
    
    const params = useParams<{ applicantId: string }>();
    const contractId = params.applicantId;

    const { getContractById, listLoading: contractLoading } = useContractHandler();
    const { listPayments: fetchPayments, deletePayment: deletePaymentApi, getPaymentStats,error } = usePaymentHandler();
    const [contract, setContract] = useState<any>(null);
    const [payments, setPayments] = useState<any[]>([]);
    const [paymentStats, setPaymentStats] = useState<{ totalPaid: { amount: number; count: number }; pending: { amount: number; count: number }; due: { amount: number; count: number } } | null>(null);
    const [statsLoading, setStatsLoading] = useState(true);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const contractData = await getContractById(contractId);
                setContract(contractData);
                setSelectedContract({
                    id: contractData.id,
                    name: contractData.name,
                    inContractNumber: contractData.inContractNumber,
                    salary: contractData.salary,
                    currency: contractData.currency,
                });

                try {
                    const contractUuid = contractData.id;
                    const [paymentsResponse, statsResponse] = await Promise.all([
                        fetchPayments(1, 100, undefined, undefined, contractUuid),
                        getPaymentStats(contractUuid)
                    ]);
                    setPayments(paymentsResponse.items);
                    setPaymentStats(statsResponse);
                } catch (error) {
                    console.error("Failed to fetch payments or stats:", error);
                    toast.error("Failed to fetch payments or stats. Please try again.");
                    setPayments([]);
                    setPaymentStats(null);
                } finally {
                    setStatsLoading(false);
                }
            } catch (error) {
                console.error("Failed to fetch contract:", error);
                toast.error("Failed to fetch contract. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        if (contractId) {
            fetchData();
        }
    }, [contractId, getContractById, fetchPayments]);


    //---------------------filter----------------------------------
    type PaymentStatus = "Pending" | "Due" | "Paid" | "All";

    const PAYMENT_STATUSES: PaymentStatus[] = ["Pending", "Due", "Paid", "All"];

    const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<PaymentStatus[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    // 🔍 Filter payments
    const filteredPayments = useMemo(() => {
        return payments.filter(payment => {
            // Search filter
            const searchMatch =
            !searchQuery.trim() ||
            (payment.applicantName && payment.applicantName.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (payment.contractId && payment.contractId.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (payment.transferId && payment.transferId.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (payment.monthlyAllowance && payment.monthlyAllowance.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (payment.note && payment.note.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (payment.paymentStatus && payment.paymentStatus.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (payment.nextPayment && payment.nextPayment.toLowerCase().includes(searchQuery.toLowerCase()));

            // Payment status filter
            const paymentMatch =
            selectedPaymentStatus.length === 0 ||
            selectedPaymentStatus.includes("All") ||
            (payment.paymentStatus && selectedPaymentStatus.includes(payment.paymentStatus as "Pending" | "Due" | "Paid"));

            return searchMatch && paymentMatch;
        });
    }, [payments, searchQuery, selectedPaymentStatus]);

        // 📄 Pagination
        const totalPages = Math.ceil(filteredPayments.length / ITEMS_PER_PAGE);

        const paginatedPayments = filteredPayments.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
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



const formatCurrency = (amount: number) => {
  if (statsLoading) {
    return <SyncLoader size={8} color="#D4AF37" />;
  }

  const formatted = `${amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ${contract?.currency || "SAR"}`;

  return (
    <span style={{ color: amount === 0 ? "gray" : "inherit" }}>
      {formatted}
    </span>
  );
};

    
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
              text={`Payment - ${contract?.name || "Loading..."}`}
              speed={40}
              maxIterations={20}
              className="revealed"
              parentClassName="inline-block"
            />
          </motion.h1>

          <p className="text-muted-foreground mt-1">
            Manage and track payments for this contract.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-3"
        >
          <Button
            size="lg"
            disabled={!contract}
            className={cn(
              "rounded-[var(--radius)] px-6 font-bold transition-all duration-300",
              "bg-primary text-primary-foreground",
              "hover:bg-primary/90 hover:scale-[1.03] active:scale-[0.98]",
              "shadow-[0_8px_20px_-4px_oklch(var(--primary)/0.2)]",
              "border border-primary/10"
            )}
            onClick={() => {
              if (!contract) return;

              setEditingPayment(null);
              setSelectedContract({
                id: contract.id,
                name: contract.name,
                inContractNumber: contract.inContractNumber,
                salary: contract.salary,
                currency: contract.currency,
              });
              setIsModalOpen(true);
            }}
          >
            <FilePlus2 className="mr-2 h-5 w-5 stroke-[2.5]" />
            Create Payment
          </Button>
        </motion.div>
      </header>
      
      {/* Top row: 3 cards */}
      <div className="grid grid-cols-1 sm:grid-cols-1 xl:grid-cols-3 gap-4 mb-8 ">
        {statsLoading ? (
          <>
            <StatsCardSkeleton className="w-full" />
            <StatsCardSkeleton className="w-full" />
            <StatsCardSkeleton className="w-full" />
          </>
        ) : (
          <>
            <StatsCard
              title="Total Paid"
              value={formatCurrency(paymentStats?.totalPaid.amount || 0)}
              subtitle={`${paymentStats?.totalPaid.count || 0} payments`}
              icon={<Wallet className="h-5 w-5" />}
              iconColor="#22C55E"
              className="w-full"
            />

            <StatsCard
              title="Pending Payment"
              value={formatCurrency(paymentStats?.pending.amount || 0)}
              subtitle={`${paymentStats?.pending.count || 0} pending`}
              icon={<Clock3 className="h-5 w-5" />}
              iconColor="#F59E0B"
              className="w-full"
            />

            <StatsCard
              title="Due"
              value={formatCurrency(paymentStats?.due.amount || 0)}
              subtitle={`${paymentStats?.due.count || 0} due`}
              icon={<AlertCircle className="h-5 w-5" />}
              iconColor="#EF4444"
              className="w-full"
            />
          </>
        )}
      </div>

      {/* Main Column */}
      <div className="flex flex-col gap-6">
        {/* Search and Filters Row */}
       <SearchAndFilterBar
          searchQuery={searchQuery}
          setSearchQuery={(value) => {
            setSearchQuery(value);
            setCurrentPage(1);
          }}
          selectedStatuses={selectedPaymentStatus}
          toggleStatus={(status) => {
            if (status === ("All" as any)) {
              setSelectedPaymentStatus([
                "Pending",
                "Due",
                "Paid",
                "All",
              ]);
            } else {
              setSelectedPaymentStatus((prev) =>
                prev.includes(status)
                  ? prev.filter(
                      (s) => s !== status && s !== "All"
                    )
                  : [
                      ...prev.filter(
                        (s) => s !== "All"
                      ),
                      status,
                    ]
              );
            }
          }}
          availableStatuses={PAYMENT_STATUSES}
          placeholder="Search payments..."
          filterLabel="Payment Status"
        />
        <SelectionBar
          selectedCount={selectedIds.length}
          isVisible={selectedIds.length > 0}
          onClearSelection={() => setSelectedIds([])}
          onDeleteClick={() => {
            setBulkDelete(true);
            setDeleteConfirmOpen(true);
          }}
        />

        {/* Loading State */}
        {loading && (
          <LoadingState  />
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="flex justify-center py-12 mt-25">
            <ErrorState
              icon={<DollarSign size={40} className="text-red-500" />}
              title="Failed to load payments"
              description={error || "Something went wrong. Please try again."}
            />
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && paginatedPayments.length === 0 && (
          <div className="flex items-center justify-center py-10 mt-25">
          <EmptyState
            icon={<DollarSign size={40} />}
            title="No paymnets found"
            description="Create your first paymnets to get started"
          />
          </div>
        )}

        {/* Payments Grid */}
        {!loading && !error && paginatedPayments.length > 0 && (
          <div className="flex flex-col gap-2 mt-4">
            <DataTable<Payment>
              data={paginatedPayments}
              getId={(row) => row.id!}
              selectable={true}
              selectedIds={selectedIds}
              onSelect={setSelectedIds}
              onRowClick={(row) => {
                setEditingPayment(row);
                setSelectedContract(null);
                setIsModalOpen(true);
              }}
              columns={[
                {
                  header: "Payment Date",
                  cell: (row: Payment) => (
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold">
                        {row.nextPayment || "N/A"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Payment Date
                      </span>
                    </div>
                  ),
                },

                {
                  header: "Monthly Allowance",
                  cell: (row: Payment) => (
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold">
                        {row.monthlyAllowance || "N/A"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Monthly Allowance
                      </span>
                    </div>
                  ),
                },

                {
                  header: "Transfer ID",
                  cell: (row: Payment) => (
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold">
                        {row.transferId || "N/A"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Transfer ID
                      </span>
                    </div>
                  ),
                },



                {
                  header: "Status",
                  cell: (row: Payment) => (
                    <div
                      className={cn(
                        "px-3 py-1 rounded-full text-xs font-semibold w-fit",
                        row.paymentStatus === "Paid" &&
                          "bg-[#D3FCD2] text-[#22C55E]",
                        row.paymentStatus === "Due" &&
                          "bg-[#FFDCDC] text-[#FF4D4F]",
                        row.paymentStatus === "Pending" &&
                          "bg-[#FFF4CC] text-[#F59E0B]"
                      )}
                    >
                      {row.paymentStatus || "N/A"}
                    </div>
                  ),
                },
                                {
                  header: "Note",
                  cell: (row: Payment) => (
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold">
                        {row.note || "N/A"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Note
                      </span>
                    </div>
                  ),
                },
              ]}

              actions={{
                type: "menu",
                items: [
                  {
                    label: "Edit",
                    onClick: (row) => {
                      setEditingPayment(row);
                      setSelectedContract(null);
                      setIsModalOpen(true);
                    },
                  },
                  {
                    label: "Delete",
                    variant: "destructive",
                    onClick: (row) => {
                      setSelectedIds((prev) =>
                        prev.filter((id) => id !== row.id)
                      );
                      setPaymentToDelete(row.id ?? null);
                      setDeleteConfirmOpen(true);
                    },
                  },
                ],
              }}
            />
          </div>
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

      <PaymentModal
        isOpen={isModalOpen}
        payment={editingPayment}
        contract={selectedContract}
        onClose={() => {
          setIsModalOpen(false);
          setEditingPayment(null);

          if (contract) {
            setSelectedContract({
              id: contract.id,
              name: contract.name,
              inContractNumber: contract.inContractNumber,
              salary: contract.salary,
              currency: contract.currency,
            });
          }
        }}
        onSave={async (data) => {
          setIsModalOpen(false);
          setEditingPayment(null);

          try {
            if (contract) {
              const contractUuid = contract.id;

              const [paymentsResponse, statsResponse] =
                await Promise.all([
                  fetchPayments(
                    1,
                    100,
                    undefined,
                    undefined,
                    contractUuid
                  ),
                  getPaymentStats(contractUuid),
                ]);

              setPayments(paymentsResponse.items);
              setPaymentStats(statsResponse);
              setCurrentPage(1);
            }

            const isUpdate = !!editingPayment;

            toast.success(
              isUpdate
                ? "Payment updated successfully"
                : "Payment created successfully"
            );
          } catch (error) {
            console.error(
              "Failed to refresh payments:",
              error
            );

            toast.error(
              "Payment processed but refresh failed"
            );
          }
        }}
      />


    <ConfirmDeleteDialog
      isOpen={deleteConfirmOpen}
      onOpenChange={(open) => {
        setDeleteConfirmOpen(open);

        if (!open) {
          setPaymentToDelete(null);
          setBulkDelete(false);
        }
      }}
      title="Delete Payment"
      description="Are you sure you want to delete this payment? This action cannot be undone."
      isDeleting={deleting}
      onConfirm={async () => {
        setDeleting(true);

        try {
          if (bulkDelete) {
            await Promise.all(
              selectedIds.map((id) => deletePaymentApi(id))
            );

            setSelectedIds([]);
            setBulkDelete(false);

            toast.success(
              "Selected payments deleted successfully"
            );
          } else {
            if (!paymentToDelete) return;

            await deletePaymentApi(paymentToDelete);

            toast.success("Payment deleted successfully");
          }

          if (contract) {
            const contractUuid = contract.id;

            const [paymentsResponse, statsResponse] =
              await Promise.all([
                fetchPayments(
                  1,
                  100,
                  undefined,
                  undefined,
                  contractUuid
                ),
                getPaymentStats(contractUuid),
              ]);

            setPayments(paymentsResponse.items);
            setPaymentStats(statsResponse);

            const newTotalPages = Math.ceil(
              paymentsResponse.items.length /
                ITEMS_PER_PAGE
            );

            if (currentPage > newTotalPages) {
              setCurrentPage(
                newTotalPages > 0
                  ? newTotalPages
                  : 1
              );
            }
          }

          setDeleteConfirmOpen(false);
          setPaymentToDelete(null);
        } catch (error) {
          console.error(
            "Failed to delete payment(s):",
            error
          );

          toast.error(
            "Failed to delete payment(s). Please try again."
          );
        } finally {
          setDeleting(false);
        }
      }}
    />


  </DashboardLayout>
);
}