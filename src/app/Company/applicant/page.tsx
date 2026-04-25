// src/app/Company/applicant/page.tsx
"use client";
import {useRouter } from "next/navigation";
import { useState, useMemo,useEffect } from "react";
import { Check,Eye,FileSearch,Trash2} from 'lucide-react';
import DashboardLayout from "@/components/Company/DashboardLayout";
import { useCompanyApplicationHandler } from "@/hooks/companyapihandler/useCompanyApplicationHandler";
import {motion } from "framer-motion";
import DecryptedText from "@/components/ui/DecryptedText";
import React from "react";

import { Applicant, ApplicantStatus } from "@/types/applicant";
import { toast } from "sonner";
import { SearchAndViewBar } from "@/components/common/SearchAndViewBar";
import { ErrorState } from "@/components/common/ErrorState";
import { LoadingState } from "@/components/common/LoadingState";
import { Pagination } from "@/components/common/Pagination";
import { EmptyState } from "@/components/common/EmptyState";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTable } from "@/components/common/DataTable";
import { Badge } from "@/components/ui/badge"; // conflict

import { ApplicantCard } from "@/components/Company/ApplicantCard";
import { SelectionBar1 } from "@/components/Company/SelectionBar";
import ContractModal from "@/components/Company/Modal/ContractModal";
import ContractTemplatePickerModal from "@/components/Company/Modal/ContractTemplatePickerModal";
import PostAcceptContractChoiceModal from "@/components/Company/Modal/PostAcceptContractChoiceModal";
import { ContractTemplate } from "@/types/contractTemplate";
import { Skeleton } from "@/components/ui/skeleton";
import { ApplicantCardSkeleton } from "@/components/Company/Skeleton/ApplicantCardSkeleton";

export default function ApplicantPage() {

  /* ──────────────────────────────────────────────
     State
  ────────────────────────────────────────────── */
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [showApplicants, setShowApplicants] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const [applicants, setApplicants] = useState<Applicant[]>([]);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkUpdating, setBulkUpdating] = useState(false);

  const statusStyles: Record<ApplicantStatus, string> = {
    pending:
      "bg-yellow-100 text-yellow-700 ",
    accepted:
      "bg-green-100 text-green-700 ",
    rejected:
      "bg-red-100 text-red-700 ",
  };

  /* ──────────────────────────────────────────────
     Mapping
  ────────────────────────────────────────────── */
function mapApplicant(app: any, index: number): Applicant {
  const student = app.student;

  const applicantId = student?.id || app.id;
  const truncatedId = applicantId.slice(-3);

  return {
    applicantId,
    applicationId: app.id,
    truncatedId,

    transferId: `316400ACZ${String(index + 1).padStart(2, "0")}`,

    name: student?.name || "Unknown",
    appliedAt: app.appliedAt,

    experience: "N/A",
    education: "N/A",
    language: "N/A",

    portfolio: {
      github: "",
      linkedin: "",
    },

    skills: [],
    description: student?.description || "",

    profileRanking: student?.profileRanking || 0,
    profileComplete: student?.profileComplete || 0,

    status: (app.status as ApplicantStatus) ?? "pending",

    salaryPaid: "$0",
    salaryExpectation: student?.salaryExpectation ?? null,

    startDate: "",
    endDate: "",

    workProgress: 0,

    contractStatus: "",
    contractTitle: "",

    paymentStatus: "",

    availability: student?.availability || "Remote",

    image: student?.image || "",
    image1: "/images/A11.jpeg",

    city: "",
    email: student?.email || "—",
  };
}

/* ──────────────────────────────────────────────
    Data Hook 
  ────────────────────────────────────────────── */
  const {
    error,
    loading,
    getAllApplications,
    updateApplicationStatus,
  } = useCompanyApplicationHandler();

  /* ──────────────────────────────────────────────
      Effects
  ────────────────────────────────────────────── */
    useEffect(() => {
    const fetchApplicants = async () => {
      try {
        const response = await getAllApplications(1, 100);

        const mapped = response.items.map(mapApplicant);

        // remove duplicates by applicantId
        const unique = Array.from(
          new Map(mapped.map((a) => [a.applicantId, a])).values()
        );

        setApplicants(unique);
      } catch (error: unknown) {
        console.error(error);
        toast.error("Failed to load applicants");
        setApplicants([]);
      }
    };

    fetchApplicants();
  }, [getAllApplications]);

  /* ──────────────────────────────────────────────
      Handlers
  ────────────────────────────────────────────── */
    const handleStatusChange = async (
    applicationId: string,
    newStatus: ApplicantStatus
  ) => {
    try {
      await updateApplicationStatus(applicationId, newStatus);

      // 👇 trigger accept flow if needed
      if (newStatus === "accepted") {
        openPostAcceptFlow(applicationId);
      }

      const response = await getAllApplications(1, 100);

      const mapped = response.items.map(mapApplicant);

      const unique = Array.from(
        new Map(mapped.map((a) => [a.applicantId, a])).values()
      );

      setApplicants(unique);

      toast.success(`Status updated to ${newStatus}`);
    } catch (error: unknown) {
      console.error(error);
      toast.error("Failed to update status");
    }
  };
    const handleBulkStatusChange = async (newStatus: ApplicantStatus) => {
    if (bulkUpdating) return;

    const idsToUpdate = [...selectedIds];

    setSelectedIds([]);
    setBulkUpdating(true);

    try {
      const selectedApplicants = applicants.filter(
        (app) =>
          idsToUpdate.includes(app.applicantId) && app.applicationId
      );

      await Promise.all(
        selectedApplicants.map((app) =>
          updateApplicationStatus(app.applicationId!, newStatus)
        )
      );

      const response = await getAllApplications(1, 100);

      const mapped = response.items.map(mapApplicant);

      const unique = Array.from(
        new Map(mapped.map((a) => [a.applicantId, a])).values()
      );

      setApplicants(unique);

      toast.success(
        `Updated ${idsToUpdate.length} applicants to ${newStatus}`
      );
    } catch (error: unknown) {
      console.error(error);
      toast.error("Bulk update failed");
    } finally {
      setBulkUpdating(false);
    }
  };
  /* ──────────────────────────────────────────────
     Selection
  ────────────────────────────────────────────── */
    const handleSelect = (id: string, checked: boolean) => {
    setSelectedIds((prev) =>
      checked ? [...prev, id] : prev.filter((x) => x !== id)
    );
  };

  /* ──────────────────────────────────────────────
     Filtering
  ────────────────────────────────────────────── */
    const filteredApplicants = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return applicants.filter((a) => {
      if (!q) return true;

      return (
        a.name.toLowerCase().includes(q) ||
        a.applicantId.slice(-3).includes(q) ||
        (a.appliedAt
          ? new Date(a.appliedAt).toLocaleDateString().includes(q)
          : false)
      );
    });
  }, [searchQuery, applicants]);

     // 📄 Pagination
        const [itemsPerPage, setItemsPerPage] = useState(10); // default 10 for desktop

        useEffect(() => {
          const updateItemsPerPage = () => {
            if (window.innerWidth < 640) { // mobile
              setItemsPerPage(5);
            } else {
              setItemsPerPage(8); // desktop
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

    //Candidate detail pop up logic
    const [showCandidateModal, setShowCandidateModal] = useState(false);
    const [showPostAcceptChoiceModal, setShowPostAcceptChoiceModal] = useState(false);
    const [showTemplatePickerModal, setShowTemplatePickerModal] = useState(false);
    const [showContractModal, setShowContractModal] = useState(false);
    const [acceptedApplicantForContract, setAcceptedApplicantForContract] = useState<any | null>(null);
    const [prefilledContractData, setPrefilledContractData] = useState<any | null>(null);
    const buildContractPrefill = (applicant: any, template?: ContractTemplate | null) => ({
      email: applicant?.email || "",
      name: applicant?.name || "",
      contractTitle: template?.contractTitle || "",
      Contract: template?.duration || "",
      startDate: "",
      endDate: "",
      salary: template?.monthlyAllowance || "",
      note: template?.content || "",
      contractStatus: "Running",
    });
    const openPostAcceptFlow = (applicationId: string) => {
      const applicant = applicants.find((item) => item.applicationId === applicationId);
      if (!applicant) return;
      setAcceptedApplicantForContract(applicant);
      setShowPostAcceptChoiceModal(true);
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
                text="Applicants"
                speed={40}
                maxIterations={20}
                className="revealed"
                parentClassName="inline-block"
              />
            </motion.h1>
            <p className="text-muted-foreground mt-1">
              Review and manage incoming applications.
            </p>
          </div>

        </header>

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


                         <SelectionBar1
                           selectedCount={selectedIds.length}
                           isVisible={selectedIds.length > 0 && !showApplicants && !bulkUpdating}
                           onClear={() => setSelectedIds([])}
                           onAccept={() => handleBulkStatusChange("accepted")}
                           onReject={() => handleBulkStatusChange("rejected")}
                           onPending={() => handleBulkStatusChange("pending")}
                         />

          {/* Error State */}
          {error && (
                    <ErrorState 
                      title="Failed to load" 
                      description={error} 
                      onRetry={() => getAllApplications(1, 1000)}
                    />
          )}

            
           {/* Loading State */}
          {loading && !error && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <ApplicantCardSkeleton key={i} />
              ))}
            </div>
          )}

           {/* Applicants Grid */}
            {!loading && !error && showApplicants && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">          
             {paginatedApplicants.length > 0 ? (
              paginatedApplicants.map((applicant) => (
                <ApplicantCard
                  key={applicant.applicantId}
                  applicant={applicant}
                  onClick={() => router.push(`/Company/applicant/${applicant.applicantId}`)}
                  onStatusChange={handleStatusChange}
                />
              ))
            ) : (
              <div className="col-span-5 text-center py-12 text-gray-600 mt-25">                                      
              <EmptyState
                icon={<FileSearch className="h-10 w-10 text-muted-foreground" />}
                title="No applicants found"
                description="No students have applied yet"
              />
              </div>
            )}
          </div>
          )}

         {/* Contracts Grid */}
          {!loading && !error && !showApplicants && (
            <DataTable
              data={paginatedApplicants}
              getId={(a) => a.applicantId}
              selectedIds={selectedIds}
              onSelect={setSelectedIds}
              columns={[
                {
                  header: (
                    <Checkbox
                      checked={
                        selectedIds.length > 0 &&
                        selectedIds.length === paginatedApplicants.length
                      }
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedIds(
                            paginatedApplicants.map((a) => a.applicantId)
                          );
                        } else {
                          setSelectedIds([]);
                        }
                      }}
                    />
                  ),
                  cell: (a: any) => (
                    <Checkbox
                      checked={selectedIds.includes(a.applicantId)}
                      onCheckedChange={(v) =>
                        handleSelect(a.applicantId, !!v)
                      }
                    />
                  ),
                },

                {
                  header: "ID",
                  cell: (a: any) => a.applicantId,
                },
                {
                  header: "Name",
                  cell: (a: any) => a.name,
                },
                {
                  header: "Email",
                  cell: (a: any) => a.email,
                },
                {
                  header: "Applied Date",
                  cell: (a: any) =>
                    new Date(a.appliedAt).toLocaleDateString(),
                },
                {
                  header: "Status",
                  cell: (a: any) => {
                    const status = a.status as ApplicantStatus;

                    return (
                      <Badge
                        className={`border ${statusStyles[status]}`}
                      >
                        {status}
                      </Badge>
                    );
                  },
                },
              ]}

              actions={{
                type: "menu",
                items: [
                  {
                    label: "View",
                    icon: <Eye />,
                    onClick: (a) =>
                      router.push(`/Company/applicant/${a.applicantId}`),
                  },
                  {
                    label: "Accept",
                    icon: <Check />,
                    onClick: (a) =>
                      handleStatusChange(a.applicationId!, "accepted"),
                  },
                  {
                    label: "Reject",
                    icon: <Trash2 />,
                    variant: "destructive",
                    onClick: (a) =>
                      handleStatusChange(a.applicationId!, "rejected"),
                  },
                ],
              }}
            />
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
<PostAcceptContractChoiceModal
  isOpen={showPostAcceptChoiceModal}
  applicantName={acceptedApplicantForContract?.name}
  onClose={() => {
    setShowPostAcceptChoiceModal(false);
    setAcceptedApplicantForContract(null);
  }}
  onCreateContract={() => {
    if (!acceptedApplicantForContract) return;
    setPrefilledContractData(buildContractPrefill(acceptedApplicantForContract));
    setShowPostAcceptChoiceModal(false);
    setShowContractModal(true);
  }}
  onUseTemplate={() => {
    setShowPostAcceptChoiceModal(false);
    setShowTemplatePickerModal(true);
  }}
/>
<ContractTemplatePickerModal
  isOpen={showTemplatePickerModal}
  onClose={() => {
    setShowTemplatePickerModal(false);
    setAcceptedApplicantForContract(null);
  }}
  onSelectTemplate={(template) => {
    if (!acceptedApplicantForContract) return;
    setPrefilledContractData(buildContractPrefill(acceptedApplicantForContract, template));
    setShowTemplatePickerModal(false);
    setShowContractModal(true);
  }}
/>
<ContractModal
  isOpen={showContractModal}
  contract={prefilledContractData}
  onClose={() => {
    setShowContractModal(false);
    setPrefilledContractData(null);
    setAcceptedApplicantForContract(null);
  }}
  onSave={async () => {
    setShowContractModal(false);
    setPrefilledContractData(null);
    setAcceptedApplicantForContract(null);
  }}
/>
    </DashboardLayout>
  );
}