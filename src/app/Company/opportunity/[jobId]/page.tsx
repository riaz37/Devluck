"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/Company/DashboardLayout";
import { useOpportunityHandler } from "@/hooks/companyapihandler/useOpportunityHandler";
import { useCompanyApplicationHandler } from "@/hooks/companyapihandler/useCompanyApplicationHandler";
import { User,FileText, Users, ClipboardList, Trash2, Check, Eye, FileSearch, Flag, Calendar, ArrowLeft } from 'lucide-react';
import React from "react";
import { AssessmentReport } from "@/hooks/companyapihandler/questions-mock-api";
import EmptyStateFeedback from "@/components/common/EmptyStateFeedback";
import { LoadingState } from "@/components/common/LoadingState";
import { IconTabs, TabItem } from "@/components/common/TabItem";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DescriptionComponent } from "@/components/common/DescriptionComponent";
import { DataTable } from "@/components/common/DataTable";
import { ErrorState } from "@/components/common/ErrorState";
import { SearchAndViewBar } from "@/components/common/SearchAndViewBar";
import { EmptyState } from "@/components/common/EmptyState";
import { mapApplicant } from "@/lib/mappers/applicant.mapper";
import { Applicant, ApplicantStatus } from "@/types/applicant";
import { Pagination } from "@/components/common/Pagination";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCompanyAssessmentHandler } from "@/hooks/companyapihandler/useCompanyAssessmentHandler";
import { useCompanyInterviewHandler } from "@/hooks/companyapihandler/useCompanyInterviewHandler";
import { useCompanyBillingHandler } from "@/hooks/companyapihandler/useCompanyBillingHandler";
import { useQuestionHandler } from "@/hooks/companyapihandler/useQuestionHandler";
import type { ContractTemplate } from "@/hooks/companyapihandler/useContractTemplateHandler";
import { ApplicantCard } from "@/components/Company/ApplicantCard";
import AssessmentModal, { AssessmentData, AssessmentQuestion } from "@/components/Company/Modal/AssessmentModel";
import { SelectionBar1 } from "@/components/Company/SelectionBar";
import AssignInterviewModal from "@/components/Company/Modal/AssignInterviewModal";
import ReportModal from "@/components/Company/Modal/ReportModal";
import CandidateModal from "@/components/Company/Modal/CandidateModal";
import PostAcceptContractChoiceModal from "@/components/Company/Modal/PostAcceptContractChoiceModal";
import ContractTemplatePickerModal from "@/components/Company/Modal/ContractTemplatePickerModal";
import ContractModal from "@/components/Company/Modal/ContractModal";


export default function JobDetailPage() {
  const toAssessmentData = (rawOpportunity: any): AssessmentData | null => {
    if (!rawOpportunity) return null;
    const rawFitProfile = rawOpportunity.fitProfile;
    const parsedFitProfile =
      typeof rawFitProfile === "string"
        ? (() => {
            try {
              return JSON.parse(rawFitProfile);
            } catch {
              return null;
            }
          })()
        : rawFitProfile && typeof rawFitProfile === "object"
          ? rawFitProfile
          : null;

    const hasAssessmentData =
      Boolean(parsedFitProfile) &&
      (
        (Array.isArray(parsedFitProfile?.dimensions) && parsedFitProfile.dimensions.length > 0) ||
        (Array.isArray(parsedFitProfile?.selected_dimensions) && parsedFitProfile.selected_dimensions.length > 0) ||
        (Array.isArray(parsedFitProfile?.skills) && parsedFitProfile.skills.length > 0) ||
        (Array.isArray(parsedFitProfile?.values) && parsedFitProfile.values.length > 0) ||
        Boolean(parsedFitProfile?.mission?.trim?.()) ||
        Boolean(parsedFitProfile?.communicationNorms?.trim?.()) ||
        Boolean(parsedFitProfile?.traitsWanted?.trim?.()) ||
        Boolean(parsedFitProfile?.traitsNotWanted?.trim?.()) ||
        Boolean(parsedFitProfile?.goalsNext3Months?.trim?.()) ||
        Boolean(parsedFitProfile?.roleType) ||
        Boolean(parsedFitProfile?.role_type) ||
        Boolean(parsedFitProfile?.seniorityLevel) ||
        Boolean(parsedFitProfile?.seniority)
      );

    if (!hasAssessmentData) return null;

    return {
      numberOfQuestions: Number(rawOpportunity.questionCount || 10),
      dimensions: Array.isArray(parsedFitProfile?.selected_dimensions)
        ? parsedFitProfile.selected_dimensions
        : Array.isArray(parsedFitProfile?.dimensions)
          ? parsedFitProfile.dimensions
          : [],
      companyStyle: (rawOpportunity.companyStyle || "Startup") as AssessmentData["companyStyle"],
      opportunityVisibility: (rawOpportunity.visibility || "Public") as AssessmentData["opportunityVisibility"],
      roleType: (parsedFitProfile?.role_type || parsedFitProfile?.roleType || "general") as AssessmentData["roleType"],
      seniorityLevel: (parsedFitProfile?.seniority || parsedFitProfile?.seniorityLevel || "mid") as AssessmentData["seniorityLevel"],
      mission: parsedFitProfile?.mission || "",
      communicationNorms: parsedFitProfile?.communicationNorms || "",
      traitsWanted: parsedFitProfile?.traitsWanted || "",
      traitsNotWanted: parsedFitProfile?.traitsNotWanted || "",
      goalsNext3Months: parsedFitProfile?.goalsNext3Months || "",
      skills: Array.isArray(parsedFitProfile?.skills) ? parsedFitProfile.skills : [],
      values: Array.isArray(parsedFitProfile?.values) ? parsedFitProfile.values : [],
      selectedSector: parsedFitProfile?.sector || "",
      questionMode: (rawOpportunity.questionMode || "dynamic") as AssessmentData["questionMode"],
      applicationCloseAt: rawOpportunity.applicationCloseAt || "",
      assessmentDeadlineHours: Number(rawOpportunity.assessmentDeadlineHours || 72),
    };
  };
  
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
      getOpportunityById,
      updateOpportunity
    } = useOpportunityHandler();
  
    const {
      getApplicationsForOpportunity,
      updateApplicationStatus,
      checkApplicantExistsForOpportunity,
      error: applicationsError,
      loading: applicationsLoading
    } = useCompanyApplicationHandler();
    const { getSubscriptionStatus } = useCompanyBillingHandler();
    const { sendAssessmentInvite, getCandidates, getReport } = useCompanyAssessmentHandler();
    const { assignInterview } = useCompanyInterviewHandler();
    const { getQuestions, bulkUpdateQuestions } = useQuestionHandler();
    const [questionCountOptions, setQuestionCountOptions] = useState<number[]>([5, 10]);
    const [customQuestions, setCustomQuestions] = useState<AssessmentQuestion[]>([]);

    const validateInviteCandidate = useCallback(
      async (email: string) => {
        if (!jobId) return { exists: false };
        const result = await checkApplicantExistsForOpportunity(jobId as string, email);
        return { exists: result.exists, name: result.student?.name };
      },
      [jobId, checkApplicantExistsForOpportunity]
    );
  
    useEffect(() => {
      if (jobId) {
        getOpportunityById(jobId as string).catch(console.error);
      }
    }, [jobId, getOpportunityById]);

    useEffect(() => {
      const loadQuestions = async () => {
        if (!jobId) return;
        try {
          const loaded = await getQuestions(jobId as string);
          setCustomQuestions(
            loaded.map((q) => ({
              id: q.id,
              question: q.question,
              type: q.type,
              dimension: (q as any).dimension || "technical",
              evaluationHint: (q as any).evaluationHint || (q as any).evaluation_hint || "",
              options: q.options || [],
              isRequired: q.isRequired,
            }))
          );
        } catch {
          setCustomQuestions([]);
        }
      };
      loadQuestions();
    }, [jobId, getQuestions]);

    useEffect(() => {
      getSubscriptionStatus()
        .then((data) => {
          setQuestionCountOptions(
            Array.isArray(data.questionCountOptions) && data.questionCountOptions.length > 0
              ? data.questionCountOptions
              : [5, 10]
          );
        })
        .catch(() => {
          setQuestionCountOptions([5, 10]);
        });
    }, [getSubscriptionStatus]);
  
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
  
  
 

      const [showReportModal, setShowReportModal] = useState(false);
      const [selectedReport, setSelectedReport] = useState<AssessmentReport | null>(null);
      const [selectedSessionId, setSelectedSessionId] = useState<string>("");
      const [reportNotice, setReportNotice] = useState<string | null>(null);

    const [isAssessmentModalOpen, setAssessmentModalOpen] = useState(false);
    const [editingAssessment, setEditingAssessment] = useState<AssessmentData | null>(null);
    const currentAssessment = editingAssessment || toAssessmentData(opportunity);

    
    //Interview pop up logic
    const [showInterviewModal, setShowInterviewModal] = useState(false)
    const [selectedApplicant, setSelectedApplicant] = useState<any>(null)
    const openInterviewModal = (applicant: any) => {
      setSelectedApplicant(applicant)
      setShowInterviewModal(true)
    }

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
    const openPostAcceptFlow = (applicationId: string) => {
      const applicant = applicants.find((item) => item.applicationId === applicationId);
      if (!applicant) return;
      setAcceptedApplicantForContract(applicant);
      setShowPostAcceptChoiceModal(true);
    };
    const openReportModal = async (applicant: any) => {
      try {
        if (!jobId) return;
        setReportNotice(null);
        setSelectedApplicant(applicant);

        const candidatesData = await getCandidates(jobId as string);
        const candidates = candidatesData?.candidates || [];

        const emailMatches = candidates.filter(
          (c: any) =>
            c?.email &&
            applicant?.email &&
            String(c.email).toLowerCase() === String(applicant.email).toLowerCase()
        );

        const nameMatches = candidates.filter(
          (c: any) =>
            c?.name &&
            applicant?.name &&
            String(c.name).toLowerCase() === String(applicant.name).toLowerCase()
        );

        const candidatePool = emailMatches.length > 0 ? emailMatches : nameMatches;
        const statusRank = (status: string) => {
          const normalized = String(status || "").toLowerCase();
          if (normalized === "completed") return 4;
          if (normalized === "evaluating") return 3;
          if (normalized === "submitted") return 2;
          if (normalized === "in_progress") return 1;
          return 0;
        };

        const matchedCandidate = candidatePool
          .slice()
          .sort((a: any, b: any) => {
            const aHasReport = Boolean(a?.report_json);
            const bHasReport = Boolean(b?.report_json);
            if (aHasReport !== bHasReport) return aHasReport ? -1 : 1;
            const rankDiff = statusRank(b?.session_status) - statusRank(a?.session_status);
            if (rankDiff !== 0) return rankDiff;
            const aCreated = new Date(a?.created_at || 0).getTime();
            const bCreated = new Date(b?.created_at || 0).getTime();
            return bCreated - aCreated;
          })[0];

        const sessionId = matchedCandidate?.session_id;

        if (!sessionId) {
          setReportNotice("Assessment not taken yet for this candidate.");
          return;
        }

        const report = await getReport(sessionId);
        if (!report) {
          setReportNotice("Assessment not taken yet for this candidate.");
          return;
        }

        setSelectedReport(report);
        setSelectedSessionId(sessionId);
        setShowReportModal(true);
      } catch {
        setReportNotice("Assessment not taken yet for this candidate.");
      }
    };
const assessmentContent = (
  <div className="space-y-6">
    {/* ACTION BAR */}
    <div className="flex flex-wrap gap-3">
      {!currentAssessment ? (
        <Button
          variant="secondary"
          onClick={() => {
            setEditingAssessment(null);
            setAssessmentModalOpen(true);
          }}
        >
          Create Assessment
        </Button>
      ) : null}

      {currentAssessment ? (
        <Button variant="outline" onClick={() => setShowCandidateModal(true)}>
          Invite Candidate
        </Button>
      ) : null}

    </div>

    {!currentAssessment ? (
      <div className="flex h-[300px] items-center justify-center">
        <EmptyState
          icon={<User size={40} />}
          title="No assessment configured"
          description="No assessment found for this opportunity."
        />
      </div>
    ) : (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT - MAIN INFO */}
        <div className="lg:col-span-2 space-y-6">

          {/* Mission */}
          <Card>
            <CardHeader>
              <p className="text-sm text-muted-foreground">Mission</p>
              <p className="font-medium">
                {currentAssessment.mission || "No mission defined"}
              </p>
            </CardHeader>
          </Card>

          {/* Context */}
          <Card>
            <CardHeader>
              <p className="text-sm font-medium">Role Context</p>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Company</p>
                <p className="font-medium">{currentAssessment.companyStyle || "No company provided"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Role</p>
                <p className="font-medium">{currentAssessment.roleType || "No role selected"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Seniority</p>
                <p className="font-medium">{currentAssessment.seniorityLevel || "Not specified"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Visibility</p>
                <p className="font-medium">
                  {currentAssessment.opportunityVisibility || "Not set"}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Traits */}
          <Card>
            <CardHeader>
              <p className="text-sm font-medium">Candidate Traits</p>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>
                <span className="text-muted-foreground">Wanted:</span>{" "}
                <span className="font-medium">
                  {currentAssessment.traitsWanted || "No preferred traits defined"}
                </span>
              </p>
              <p>
                <span className="text-muted-foreground">Not Wanted:</span>{" "}
                <span className="font-medium">
                  {currentAssessment.traitsNotWanted || "No restricted traits defined"}
                </span>
              </p>
            </CardContent>
          </Card>

          {/* GOALS */}
          <Card>
            <CardHeader>
              <p className="text-sm font-medium">Goals (3 Months)</p>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-medium">
                {currentAssessment.goalsNext3Months || "No goals defined for the next 3 months"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT - SETTINGS */}
        <div className="space-y-6">

          {/* CONFIG */}
          <Card>
            <CardHeader>
              <p className="text-sm font-medium">Configuration</p>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="text-muted-foreground">Questions</p>
                <p className="font-medium">
                  {currentAssessment.numberOfQuestions ?? "No questions defined"}
                </p>
              </div>

              <div>
                <p className="text-muted-foreground">Communication</p>
                <p className="font-medium">
                  {currentAssessment.communicationNorms || "No communication norms set"}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* TAGS STACK */}
          <Card>
            <CardHeader>
              <p className="text-sm font-medium">Evaluation</p>
            </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Dimensions</p>

                  <div className="flex flex-wrap gap-2">
                    {currentAssessment.dimensions?.length ? (
                      currentAssessment.dimensions.map((d, i) => (
                        <Badge key={i} variant="secondary">
                          {d}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-muted-foreground italic text-sm">
                        No dimensions defined
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground mb-2">Skills</p>

                  <div className="flex flex-wrap gap-2">
                    {currentAssessment.skills?.length ? (
                      currentAssessment.skills.map((s, i) => (
                        <Badge key={i}>{s}</Badge>
                      ))
                    ) : (
                      <span className="text-muted-foreground italic text-sm">
                        No skills added
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground mb-2">Values</p>

                  <div className="flex flex-wrap gap-2">
                    {currentAssessment.values?.length ? (
                      currentAssessment.values.map((v, i) => (
                        <Badge key={i} variant="outline">
                          {v}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-muted-foreground italic text-sm">
                        No values defined
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
          </Card>
        </div>
      </div>
    )}
  </div>
);
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
                   <LoadingState label="Fetching applicants ..." />
                   )}
   
                   {/* Applicants Grid */}
                     {!applicationsLoading && !applicationsError && showApplicants && (
                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">  
                     {paginatedApplicants.length > 0 ? (
                       paginatedApplicants.map((applicant) => (
                        <ApplicantCard
                          key={applicant.applicationId}
                          applicant={applicant}
                          onClick={() =>
                            router.push(
                              `/Company/dashboard/job/${jobId}/${applicant.applicationId}`
                            )
                          }
                          onStatusChange={handleStatusChange}
                          onAssignInterview={(applicant) => openInterviewModal(applicant)}
                          onReport={(applicant) => {
                            openReportModal(applicant);
                          }}
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
                            handleStatusChange(a.applicationId!, "accepted"),
                          hidden: (a) => a.status === "accepted",
                        },

                        {
                          label: "Reject",
                          icon: <Trash2 />,
                          variant: "destructive",
                          onClick: (a) =>
                            handleStatusChange(a.applicationId!, "rejected"),
                          hidden: (a) => a.status === "rejected",
                        },

                        {
                          label: "Assign Interview",
                          icon: <Calendar />,
                          onClick: (a) => openInterviewModal(a),
                        },

                        {
                          label: "Report",
                          icon: <Flag />,
                          onClick: (a) => {
                            openReportModal(a);
                          },
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

    const tabs: TabItem[] = [
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
            name: "Assessment",
            value: "assessment",
            icon: ClipboardList,
            content: assessmentContent,
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
      <div className="px-4 sm:px-6 lg:px-8 py-6">
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
      {reportNotice && (
        <div className="mb-3 rounded-md border border-yellow-200 bg-yellow-50 px-3 py-2 text-sm text-yellow-800">
          {reportNotice}
        </div>
      )}
          <IconTabs tabs={tabs} defaultValue="description" />
      </div>
<AssessmentModal
  assessment={currentAssessment}
  isOpen={isAssessmentModalOpen}
  questionCountOptions={questionCountOptions}
  initialQuestions={customQuestions}
  onClose={() => setAssessmentModalOpen(false)}
  onSave={async (data, questions) => {
    if (!jobId) return;
    await updateOpportunity(jobId as string, {
      companyStyle: data.companyStyle,
      questionCount: data.numberOfQuestions,
      visibility: data.opportunityVisibility,
      questionMode: data.questionMode,
      applicationCloseAt: data.applicationCloseAt || null,
      assessmentDeadlineHours: data.assessmentDeadlineHours,
      hasAssessment: true,
      fitProfile: {
        sector: data.selectedSector || undefined,
        selected_dimensions: data.dimensions,
        role_type: data.roleType,
        seniority: data.seniorityLevel,
        dimensions: data.dimensions,
        roleType: data.roleType,
        seniorityLevel: data.seniorityLevel,
        mission: data.mission,
        communicationNorms: data.communicationNorms,
        traitsWanted: data.traitsWanted,
        traitsNotWanted: data.traitsNotWanted,
        goalsNext3Months: data.goalsNext3Months,
        skills: data.skills,
        values: data.values,
      },
    } as any);
    await bulkUpdateQuestions(
      jobId as string,
      questions.map((q, index) => ({
        id: q.id,
        question: q.question,
        type: q.type,
        dimension: q.dimension,
        evaluationHint: q.evaluationHint || "",
        options: q.options || [],
        isRequired: q.isRequired ?? false,
        order: index,
      }))
    );
    const refreshedQuestions = await getQuestions(jobId as string);
    setCustomQuestions(
      refreshedQuestions.map((q) => ({
        id: q.id,
        question: q.question,
        type: q.type,
        dimension: (q as any).dimension || "technical",
        evaluationHint: (q as any).evaluationHint || (q as any).evaluation_hint || "",
        options: q.options || [],
        isRequired: q.isRequired,
      }))
    );
    setEditingAssessment(data);
    await getOpportunityById(jobId as string);
    setAssessmentModalOpen(false);
  }}
/>
<AssignInterviewModal
  isOpen={showInterviewModal}
  onClose={() => setShowInterviewModal(false)}
  onAssign={async (data) => {
    if (!jobId || !selectedApplicant?.applicantId) return;
    await assignInterview({
      opportunityId: jobId as string,
      studentId: selectedApplicant.applicantId,
      applicationId: selectedApplicant.applicationId,
      interviewDate: data.interviewDate || "",
      interviewTime: data.interviewTime,
      meetingLink: data.meetingLink,
      notes: data.notes
    });
    setShowInterviewModal(false)
  }}
/>

<ReportModal
  isOpen={showReportModal && Boolean(selectedReport)}
  report={selectedReport as AssessmentReport}
  sessionId={selectedSessionId}
  onClose={() => {
    setShowReportModal(false);
    setSelectedReport(null);
    setSelectedSessionId("");
  }}
  onFullReport={() => {
    setShowReportModal(false);
    if (!selectedSessionId) return;
    router.push(`/Company/opportunity/${jobId}/${selectedApplicant.applicantId}/assessment/${selectedSessionId}`);
  }}
/>
<CandidateModal
  isOpen={showCandidateModal}
  onClose={() => setShowCandidateModal(false)}
  appliedCandidates={applicants
    .filter((a) => Boolean(a.email && a.email !== "—"))
    .map((a) => ({ email: String(a.email), name: a.name }))}
  onValidateEmail={validateInviteCandidate}
  onInvite={async (data) => {
    if (!jobId) return;
    await sendAssessmentInvite(jobId as string, data);
    setShowCandidateModal(false);
  }}
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
