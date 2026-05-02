"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useMemo, useEffect } from "react";
import DashboardLayout from "@/components/Company/DashboardLayout";
import { useOpportunityHandler } from "@/hooks/companyapihandler/useOpportunityHandler";
import { useCompanyApplicationHandler } from "@/hooks/companyapihandler/useCompanyApplicationHandler";
import { Users, FileText, FileSearch, Eye, Check, Trash2, ArrowLeft, Flag } from 'lucide-react';
import React from "react";
import { IconTabs } from "@/components/common/TabItem";
import { DescriptionComponent } from "@/components/common/DescriptionComponent";
import { Pagination } from "@/components/common/Pagination";
import { SearchAndViewBar } from "@/components/common/SearchAndViewBar";
import { ErrorState } from "@/components/common/ErrorState";
import { LoadingState } from "@/components/common/LoadingState";
import { EmptyState } from "@/components/common/EmptyState";

import { DataTable } from "@/components/common/DataTable";
import { cn } from "@/lib/utils";
import { Applicant, ApplicantStatus } from "@/types/applicant";
import { mapApplicant } from "@/lib/mappers/applicant.mapper";
import EmptyStateFeedback from "@/components/common/EmptyStateFeedback";
import { Button } from "@/components/ui/button";
import { useCompanyAssessmentHandler } from "@/hooks/companyapihandler/useCompanyAssessmentHandler";
import { toast } from "sonner";
import { ApplicantCard } from "@/components/Company/ApplicantCard";
import { SelectionBar1 } from "@/components/Company/SelectionBar";
import { ContractTemplate } from "@/types/contractTemplate";
import ContractModal from "@/components/Company/Modal/ContractModal";
import ContractTemplatePickerModal from "@/components/Company/Modal/ContractTemplatePickerModal";
import PostAcceptContractChoiceModal from "@/components/Company/Modal/PostAcceptContractChoiceModal";
import { ApplicantCardSkeleton } from "@/components/Company/Skeleton/ApplicantCardSkeleton";


export default function JobDetailPage() {

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkUpdating, setBulkUpdating] = useState(false);

   const handleBulkStatusChange = async (
    newStatus: "pending" | "accepted" | "rejected"
  ) => {
    if (selectedIds.length === 0) return;
  
    setBulkUpdating(true);
  
    try {
      await Promise.all(
        selectedIds.map((id) => updateApplicationStatus(id, newStatus))
      );
  
      const response = await getApplicationsForOpportunity(jobId as string, 1, 100);
  
      const transformedApplicants = response.items.map((app, index) =>
        mapApplicant(app, index)
      );
  
      setApplicants(transformedApplicants);
      setSelectedIds([]);
    } catch (error) {
      console.error("Bulk status update failed", error);
    } finally {
      setBulkUpdating(false);
    }
  };

  const { jobId } = useParams();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showApplicants, setShowApplicants] = useState(true);
  const [applicants, setApplicants] = useState<Applicant[]>([]);

  const {
    opportunity,
    loading,
    error,
    getOpportunityById
  } = useOpportunityHandler();

  const {
    getApplicationsForOpportunity,
    updateApplicationStatus,
    error: applicationsError,
    loading: applicationsLoading
  } = useCompanyApplicationHandler();
  const { getCandidates } = useCompanyAssessmentHandler();

  useEffect(() => {
    if (jobId) {
      getOpportunityById(jobId as string).catch(console.error);
    }
  }, [jobId, getOpportunityById]);

  useEffect(() => {
    const fetchApplicants = async () => {
      if (!jobId) return;

      try {
        const response = await getApplicationsForOpportunity(
          jobId as string,
          1,
          100
        );

        const transformedApplicants = response.items.map(mapApplicant);

        setApplicants(transformedApplicants);
      } catch (error) {
        console.error("Failed to fetch applicants:", error);
        setApplicants([]);
      }
    };

    fetchApplicants();
  }, [jobId, getApplicationsForOpportunity]);

    const handleStatusChange = async (
      applicationId: string,
      newStatus: ApplicantStatus
    ) => {
      try {
        await updateApplicationStatus(applicationId, newStatus);
        if (newStatus === "accepted") {
          openPostAcceptFlow(applicationId);
        }
  
        const response = await getApplicationsForOpportunity(
          jobId as string,
          1,
          100
        );
  
        const transformedApplicants = response.items.map(mapApplicant);
  
        setApplicants(transformedApplicants);
      } catch (error) {
        console.error("Failed to update application status:", error);
      }
    };

  const filteredApplicants = useMemo(() => {
    if (!searchQuery.trim()) return applicants;

    return applicants.filter(applicant =>
      applicant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      applicant.experience.toLowerCase().includes(searchQuery.toLowerCase()) ||
      applicant.education.toLowerCase().includes(searchQuery.toLowerCase()) ||
      applicant.language.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, applicants]);

 // 📄 Pagination
const [itemsPerPage, setItemsPerPage] = useState(10); // default 10 for desktop

useEffect(() => {
  const updateItemsPerPage = () => {
    if (window.innerWidth < 640) { // mobile
      setItemsPerPage(5);
    } else {
      setItemsPerPage(10); // desktop
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

const normalizeAssessmentStatus = (status?: string) => {
  if (!status) return "not_started";
  return String(status).toLowerCase();
};

const canViewReportByStatus = (status?: string) => {
  const normalized = normalizeAssessmentStatus(status);
  return normalized === "completed" || normalized === "evaluating" || normalized === "submitted";
};

const getAssessmentStatusLabel = (status?: string) => {
  const normalized = normalizeAssessmentStatus(status);
  if (normalized === "not_started") return "Assessment not taken";
  return normalized.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
};

const openReportPage = async (applicant: Applicant) => {
  try {
    if (!jobId) return;
    const candidatesData = await getCandidates(jobId as string);
    const candidates = candidatesData?.candidates || [];

    const matchedByEmail = candidates.find(
      (c: any) =>
        c?.email &&
        applicant?.email &&
        String(c.email).toLowerCase() === String(applicant.email).toLowerCase()
    );

    const matchedByName = candidates.find(
      (c: any) =>
        !matchedByEmail &&
        c?.name &&
        applicant?.name &&
        String(c.name).toLowerCase() === String(applicant.name).toLowerCase()
    );

    const matchedCandidate = matchedByEmail || matchedByName;
    const sessionId = matchedCandidate?.session_id;
    if (!sessionId) {
      toast.error("Assessment not taken yet for this candidate.");
      return;
    }

    router.push(`/Company/opportunity/${jobId}/${applicant.applicantId}/assessment/${sessionId}`);
  } catch {
    toast.error("Assessment not taken yet for this candidate.");
  }
};


    const openPostAcceptFlow = (applicationId: string) => {
      const applicant = applicants.find((item) => item.applicationId === applicationId);
      if (!applicant) return;
      setAcceptedApplicantForContract(applicant);
      setShowPostAcceptChoiceModal(true);
    };


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
      opportunityId: typeof jobId === "string" ? jobId : "",
    });



const candidatesContent = (
 <div>
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
                {applicationsError && (
                  <ErrorState
                    title="Failed to load"
                    description={error ?? "Something went wrong"}
                     onRetry={() => getApplicationsForOpportunity}
                  />
                )}

                {/* Loading State */}
                {applicationsLoading && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <ApplicantCardSkeleton key={i} />
                    ))}
                  </div>
                )}

                {/* Applicants Grid */}
                  {!applicationsLoading && !applicationsError && showApplicants && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">  
                  {paginatedApplicants.length > 0 ? (
                    paginatedApplicants.map((applicant) => (
                      <ApplicantCard
                        key={applicant.applicantId}
                        applicant={applicant}
                        onClick={() => router.push(`/Company/dashboard/job/${jobId}/${applicant.applicantId}`)}
                        onStatusChange={handleStatusChange}
                        onReport={(a) => openReportPage(a)}
                      />
                    ))
                  ) : (
                    <div className="col-span-5 text-center ">                                      
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
              {!applicationsLoading && !applicationsError && !showApplicants && (
                paginatedApplicants.length > 0 ? (
               <DataTable
                  data={paginatedApplicants}
                  getId={(a) => a.applicationId!}
                  selectable
                  selectedIds={selectedIds}
                  onSelect={setSelectedIds}
                  columns={[
                    {
                      header: "ID",
                      cell: (a: any) => a.truncatedId || a.applicantId?.slice(-3),
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
                        a.appliedAt ? new Date(a.appliedAt).toLocaleDateString() : "N/A",
                    },
                    {
                      header: "Salary",
                      cell: (a: any) =>
                        a.salaryExpectation ? `$${a.salaryExpectation.toLocaleString()}` : "N/A",
                    },
                    {
                      header: "Status",
                      cell: (a: any) => {
                        const status = a.status;

                        return (
                          <span
                            className={cn(
                              "px-3 py-1 rounded text-xs font-semibold",
                              status === "accepted" && "bg-green-100 text-green-700",
                              status === "rejected" && "bg-red-100 text-red-700",
                              status === "pending" && "bg-yellow-100 text-yellow-700"
                            )}
                          >
                            {status}
                          </span>
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
                          router.push(`/Company/dashboard/job/${jobId}/${a.applicantId}`),
                      },
                      {
                        label: "Accept",
                        icon: <Check />,
                        onClick: (a) =>
                          handleStatusChange(a.applicationId!, "accepted")
                      },
                      {
                        label: "Reject",
                        icon: <Trash2 />,
                        variant: "destructive",
                        onClick: (a) =>
                          handleStatusChange(a.applicationId!, "rejected"),
                      },
                      {
                        label: "Report",
                        icon: <Flag />,
                        onClick: (a) => openReportPage(a),
                        hidden: (a) => !canViewReportByStatus(a.assessmentStatus),
                      },
                      {
                        label: (a: any) => `Assessment: ${getAssessmentStatusLabel(a.assessmentStatus)}`,
                        icon: <Flag />,
                        onClick: () => {},
                        hidden: (a) => canViewReportByStatus(a.assessmentStatus),
                      },
                    ],
                  }}
                />
                ) : (
                    <EmptyState
                      icon={<FileSearch className="h-10 w-10 text-muted-foreground" />}
                      title="No applicants found"
                      description="No students have applied yet"
                    />
                )
              )}

            </div>
    {/* Pagination */}
    <Pagination
      currentPage={currentPage}
      totalPages={totalPages}
      visiblePages={visiblePages}
      onPageChange={goToPage}
      onPrevious={goToPrevious}
      onNext={goToNext}
      loading={applicationsLoading}
      error={applicationsError}
    />
          </div>
);
        const tabs = [
          {
            name: "Description",
            value: "description",
            icon: FileText,
            content: (
              <DescriptionComponent
                opportunity={opportunity}
              />
            ),
          },
          {
            name: "Applied Candidates",
            value: "candidates",
            icon: Users,
            content: candidatesContent,
          },
        ];


  if (loading) {
    return (
      <DashboardLayout>
         <div className="flex h-screen items-center justify-center">
          <LoadingState label="Fetching Data..." />
        </div>
      </DashboardLayout>
    );
  }

    if (error || !opportunity) {
    return (
      <DashboardLayout>
        <EmptyStateFeedback
          type={error ? "error" : "notfound"}
          title={
            error
              ? "Something went wrong"
              : "Opportunity Not Found"
          }
          description={
            error
              ? "Please try again later."
              : "The opportunity you're looking for doesn't exist."
          }
          id={!error ? jobId as string : undefined}
        />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
                            {/* BACK BUTTON */}
      <Button
        variant="outline"
        size="sm"
        className="mb-2 gap-2"
        onClick={() => router.back()}
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </Button> 
        <IconTabs tabs={tabs} defaultValue="description" />
      </div>
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
  