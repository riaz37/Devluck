// src/app/Student/contract/page.tsx
"use client";
import { useRouter } from "next/navigation";
import { useState, useMemo,useEffect } from "react";
import DashboardLayout from "@/components/Student/DashboardLayout";

import { useStudentContractHandler } from "@/hooks/studentapihandler/useStudentContractHandler";
import { motion } from "framer-motion";
import DecryptedText from "@/components/ui/DecryptedText";
import {FileSearch} from 'lucide-react';

import { EmptyState } from "@/components/common/EmptyState";
import { SearchAndFilterAndViewBar } from "@/components/common/SearchAndFilterAndViewBar";
import { Pagination } from "@/components/common/Pagination";
import { toast } from "sonner";
import { LoadingState } from "@/components/common/LoadingState";
import { ErrorState } from "@/components/common/ErrorState";
import { ContractStatus, MappedContract } from "@/types/contract-s";
import { cn } from "@/lib/utils";
import { DataTable } from "@/components/common/DataTable";
import { ContractCard } from "@/components/Student/ContractCard";
import DisputeModal from "@/components/Student/Modal/DisputeModal";
import { ContractCardSkeleton } from "@/components/Student/Skeleton/ContractCardSkeleton";


export default function ContractListPage() {
/* ──────────────────────────────────────────────
  State
────────────────────────────────────────────── */
      const CONTRACT_STATUSES: ContractStatus[] = ["Running", "Completed", "Disputed"];
      const [selectedContractStatus, setSelectedContractStatus] = useState<ContractStatus[]>([]);
      const [showApplicants, setShowApplicants] = useState(true);
      const router = useRouter();
      const [searchQuery, setSearchQuery] = useState("");
      const [currentPage, setCurrentPage] = useState(1);
      const [isModalOpen, setIsModalOpen] = useState(false);
      const [selectedContractId, setSelectedContractId] = useState<string>("");
      const toContractStatus = (status: string): ContractStatus => {
        switch (status.toLowerCase()) {
          case "running":
            return "Running";
          case "completed":
            return "Completed";
          case "dispute":
          case "disputed":
            return "Disputed";
          default:
            return "Running"; // fallback safety
        }
      };

/* ──────────────────────────────────────────────
  Data Hook 
────────────────────────────────────────────── */
      const { 
        contracts, 
        loading: contractsLoading, 
        error: contractsError, 
        listContracts 
      } = useStudentContractHandler();

/* ──────────────────────────────────────────────
  Mapping
────────────────────────────────────────────── */
      const mappedContracts = useMemo(() => {
        if (!contracts || !Array.isArray(contracts)) {
          return [];
        }
        return contracts.map((contract) => {
          const statusMap: Record<string, string> = {
            'running': 'Running',
            'completed': 'Completed',
            'dispute': 'Dispute',
            'cancelled': 'Cancelled'
          };
          
          // Format salary
          let salaryDisplay = 'Not specified';
          if (contract.monthlyAllowance !== null && contract.monthlyAllowance !== undefined) {
            const formattedAmount = typeof contract.monthlyAllowance === 'number' 
              ? contract.monthlyAllowance.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
              : contract.monthlyAllowance;
            salaryDisplay = `${contract.currency || ''} ${formattedAmount}/month`.trim();
          }
          
          // Format started at date
          const startedAt = contract.createdDate ? new Date(contract.createdDate).toLocaleDateString() : 'Not specified';
          
          return {
            id: contract.id,
            applicantId: 0,
            contractTitle: contract.contractTitle,
            company: contract.company?.name || 'Unknown Company',
            jobType: contract.duration || 'Not specified',
            location: contract.workLocation || 'Not specified',
            workProgress: 0,
            startDate: contract.createdDate ? new Date(contract.createdDate).toLocaleDateString() : 'Not specified',
            endDate: contract.duration || 'Not specified',
            status: toContractStatus(contract.status), // ✅ FIXED
            salary: salaryDisplay,
            startedAt: startedAt,
          };
        });
      }, [contracts]);

/* ──────────────────────────────────────────────
  Effects
────────────────────────────────────────────── */
    useEffect(() => {
      listContracts(1, 1000).catch(console.error);
    }, [listContracts]);
/* ──────────────────────────────────────────────
     Filtering
────────────────────────────────────────────── */
      const filteredApplicants = useMemo(() => {
        return mappedContracts.filter(contract => {
          // Search filter
          const searchMatch =
            !searchQuery.trim() ||
            contract.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
            contract.jobType.toLowerCase().includes(searchQuery.toLowerCase()) ||
            contract.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
            contract.contractTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
            contract.startDate.toLowerCase().includes(searchQuery.toLowerCase()) ||
            contract.endDate.toLowerCase().includes(searchQuery.toLowerCase());
  
          // Contract status filter
          const contractMatch =
            selectedContractStatus.length === 0 || // empty = no filter
            selectedContractStatus.includes(contract.status as "Running" | "Completed"|"Disputed");
  
          return searchMatch && contractMatch;
        });
      }, [mappedContracts, searchQuery, selectedContractStatus]);
/* ──────────────────────────────────────────────
     Pagination
────────────────────────────────────────────── */
      const [itemsPerPage, setItemsPerPage] = useState(6); // default 6 for desktop

      useEffect(() => {
        const updateItemsPerPage = () => {
          if (window.innerWidth < 640) { // mobile
            setItemsPerPage(5);
          } else {
            setItemsPerPage(6); // desktop
          }
        };

        updateItemsPerPage(); // run once on mount
        window.addEventListener("resize", updateItemsPerPage); // run on resize

        return () => window.removeEventListener("resize", updateItemsPerPage);
      }, []);

      const totalPages = Math.ceil(filteredApplicants.length / itemsPerPage);
      
      const paginatedApplicants = filteredApplicants.slice(
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

/* ──────────────────────────────────────────────
     table 
────────────────────────────────────────────── */

      const contractColumns = [
        {
          header: "Contract ID",
          cell: (row: MappedContract) => row.id.slice(-8),
        },
        {
          header: "Company",
          cell: (row: MappedContract) => row.company,
        },
        {
          header: "Title",
          cell: (row: MappedContract) => row.contractTitle,
        },
        {
          header: "Started",
          cell: (row: MappedContract) => row.startedAt,
        },
        {
          header: "Salary",
          cell: (row: MappedContract) => row.salary,
        },
        {
          header: "Status",
          cell: (row: MappedContract) => (
            <span
              className={cn(
                "px-2 py-1 rounded text-xs font-semibold",
                row.status === "Running" && "bg-green-100 text-green-600",
                row.status === "Completed" && "bg-red-100 text-red-600",
                row.status === "Disputed" && "bg-yellow-100 text-yellow-600"
              )}
            >
              {row.status}
            </span>
          ),
        },
      ];
  
return (
  <DashboardLayout>
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Title */}
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
            Manage and track all active, completed, and disputed contracts in one place.
          </p>
        </div>

      </header>

      {/* Main Column */}
      <div className="flex flex-col gap-6">
        {/* Search and Filters Row */}
        <SearchAndFilterAndViewBar
          searchQuery={searchQuery}
          setSearchQuery={(value) => {
            setSearchQuery(value);
            setCurrentPage(1);
          }}
          viewMode={showApplicants ? "list" : "grid"}
          setViewMode={(mode) => setShowApplicants(mode === "grid")}
          selectedStatuses={selectedContractStatus}
          toggleStatus={(status) => {
            setSelectedContractStatus((prev) =>
              prev.includes(status)
                ? prev.filter((s) => s !== status)
                : [...prev, status]
            );
            setCurrentPage(1);
          }}
          availableStatuses={CONTRACT_STATUSES}
          placeholder="Search contracts..."
          filterLabel="Contract Status"
        />
    

           {contractsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <ContractCardSkeleton key={i} />
              ))}
            </div>
        ) : contractsError ? (
                    <ErrorState 
                      icon={<FileSearch className="h-10 w-10text-red-500" />}
                      title="Something went wrong"
                      description={contractsError || "Unable to load contracts. Please try again."}
                    />
        ) : filteredApplicants.length === 0 ? (
                    <EmptyState
                      icon={<FileSearch className="h-10 w-10 text-muted-foreground" />}
                      title="No contracts assigned"
                      description="You don’t have any active contracts yet. Once a company assigns you one, it will appear here."
                    />
        ) : (
          <>
            {showApplicants && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {paginatedApplicants.map((contract, index) => (
                  <ContractCard
                    key={contract.id || index}
                    contract={contract}
                    onDetails={() =>
                      router.push(`/Student/contract/${contract.id}`)
                    }
                    onDispute={() => {
                      setSelectedContractId(contract.id);
                      setIsModalOpen(true);
                    }}
                  />
                ))}
              </div>
            )}
          </>
        )}


         {/* Contracts Grid */}
          {!showApplicants && !contractsLoading && !contractsError && filteredApplicants.length > 0 &&  (
            <DataTable<MappedContract>
              data={paginatedApplicants}
              columns={contractColumns}
              getId={(row) => row.id}
              onRowClick={(row) =>
                router.push(`/Student/contract/${row.id}`)
              }
              actions={{
                type: "menu",
                items: [
                  {
                    label: "Details",
                    onClick: (row) =>
                      router.push(`/Student/contract/${row.id}`),
                  },
                  {
                    label: "Dispute",
                    onClick: (row) => {
                      setSelectedContractId(row.id);
                      setIsModalOpen(true);
                    },
                    hidden: (row) => row.status === "Disputed",
                  },
                ],
              }}
            />
          )}

      </div>
    </div>
    {/* Pagination */}
       <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        visiblePages={visiblePages}
        loading={contractsLoading}
        error={contractsError}
        onPageChange={goToPage}
        onPrevious={goToPrevious}
        onNext={goToNext}
      />
      <DisputeModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          contractId={selectedContractId}
          onSuccess={() => {
            // Refresh contracts after successful dispute
            const statusFilter = selectedContractStatus.length > 0 ? selectedContractStatus[0].toLowerCase() : undefined;
            listContracts(1, 1000, statusFilter).catch(console.error);
            toast.success("Dispute submitted successfully!");
        }}
      />

  </DashboardLayout>
);
}