// src/app/Student/applied-Opportunity/page.tsx
"use client";
import { useRouter } from "next/navigation";
import { useState, useMemo, useEffect } from "react";
import DashboardLayout from "@/components/Student/DashboardLayout";
import { useStudentApplicationHandler } from "@/hooks/studentapihandler/useStudentApplicationHandler";
import { useStudentAssessmentHandler } from "@/hooks/studentapihandler/useStudentAssessmentHandler";
import { motion } from "framer-motion";
import { SyncLoader } from "react-spinners";
import DecryptedText from "@/components/ui/DecryptedText";
import {Clock,FileSearch, FileText, PauseCircle, PlayCircle, XCircle} from 'lucide-react';
import { StatsCard } from "@/components/common/stats-card";
import { SearchAndFilterAndViewBar } from "@/components/common/SearchAndFilterAndViewBar";
import { Pagination } from "@/components/common/Pagination";

import { toast } from "sonner";
import { EmptyState } from "@/components/common/EmptyState";


import { DataTable } from "@/components/common/DataTable";
import { cn } from "@/lib/utils";
import { ErrorState } from "@/components/common/ErrorState";
import { LoadingState } from "@/components/common/LoadingState";
import { BackendApplicationStatus, MappedOpportunity, OpportunityStatus, StatusFilter } from "@/types/opportunity-s";
import { AssessmentReport } from "@/hooks/companyapihandler/questions-mock-api";
import { AssessmentItem } from "@/types/assessment";

import { AppliedOpportunityCard } from "@/components/Student/AppliedOpportunityCard";
import { SelectionBar } from "@/components/Student/SelectionBar-w";
import { ConfirmWithdrawDialog } from "@/components/Student/ConfirmWithdrawDialog";
import ReportModal from "@/components/Company/Modal/ReportModal";
import { StatsCardSkeleton } from "@/components/common/Skeleton/StatsCardSkeleton";
import { AppliedOpportunityCardSkeleton } from "@/components/Student/Skeleton/AppliedOpportunityCardSkeleton";

const STATUS_MAP: Record<BackendApplicationStatus, OpportunityStatus> = {
  pending: "Applied",
  accepted: "Upcoming Interview",
  rejected: "Rejected",
  withdrawn: "Withdrawn",
};

export default function ContractListPage() {

      const [bulkWithdraw, setBulkWithdraw] = useState(false);
      const [selectedIds, setSelectedIds] = useState<string[]>([]);
      const handleSelect = (id: string, checked: boolean) => {
        setSelectedIds((prev) =>
          checked ? [...prev, id] : prev.filter((x) => x !== id)
        );
      };
      const [confirmOpen, setConfirmOpen] = useState(false);
      const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null);
      const [confirmType, setConfirmType] = useState<"withdraw" | "delete">("withdraw");

      const STATUS_STYLE: Record<OpportunityStatus, string> = {
        "Applied": "text-blue-600 bg-blue-100",
        "Upcoming Interview": "text-green-600 bg-green-100",
        "Rejected": "text-red-600 bg-red-100",
        "Withdrawn": "text-gray-600 bg-gray-100",
      };

      const handleConfirmAction = async () => {
        try {
          if (bulkWithdraw && selectedIds.length > 0) {
            // Bulk withdraw all selected IDs
            setWithdrawingApplicationId("bulk"); // optional placeholder for loading state
            await Promise.all(selectedIds.map(id => withdrawApplication(id)));
            toast.success(`${selectedIds.length} applications withdrawn successfully!`);
            setSelectedIds([]); // clear selection
          } else {
            // Single withdraw or delete
            if (!selectedApplicationId) return;

            if (confirmType === "withdraw") {
              setWithdrawingApplicationId(selectedApplicationId);
              await withdrawApplication(selectedApplicationId);
              toast.success("Application withdrawn successfully!");
              
            } else {
              await deleteApplication(selectedApplicationId);
              toast.success("Application deleted successfully!");
            }
          }

          // Refresh the applications list
          await getApplications(1, 1000);
        } catch (err: any) {
        toast.error(err.message || "Action failed");
        } finally {
          setWithdrawingApplicationId(null);
          setConfirmOpen(false);
          setSelectedApplicationId(null);
          setBulkWithdraw(false);
        }
      };
       const { 
        applications, 
        loading: applicationsLoading, 
        error: applicationsError, 
        getApplications,
        withdrawApplication,
        deleteApplication 
      } = useStudentApplicationHandler();

      const [withdrawingApplicationId, setWithdrawingApplicationId] = useState<string | null>(null);
      const [startingAssessmentKey, setStartingAssessmentKey] = useState<string | null>(null);
      const { listAssessments, startAssessment, startAssessmentFromInvite } = useStudentAssessmentHandler();
      const [assessmentItems, setAssessmentItems] = useState<AssessmentItem[]>([]);


      useEffect(() => {
        getApplications(1, 1000).catch(console.error);
      }, [getApplications]);
      useEffect(() => {
        listAssessments("all")
          .then((data) => setAssessmentItems(data || []))
          .catch(() => setAssessmentItems([]));
      }, [listAssessments]);

      const handleWithdraw = async (applicationId: string) => {
        try {
          setWithdrawingApplicationId(applicationId);
          await withdrawApplication(applicationId);
          toast.success("Application withdrawn successfully!");
          await getApplications(1, 1000);
        } catch (err: any) {
          toast.error(err.message || "Failed to withdraw application");
        } finally {
          setWithdrawingApplicationId(null);
        }
      };

      const handleDelete = async (applicationId: string) => {
        try {
          await deleteApplication(applicationId);
          toast.success("Application deleted successfully!");
          await getApplications(1, 1000);
        } catch (err: any) {
          toast.error(err.message || "Failed to delete application");
        }
      };

      const mappedApplications = useMemo<MappedOpportunity[]>(() => {
        if (!Array.isArray(applications)) return [];
        const assessmentByApplicationId = new Map<string, AssessmentItem>();
        const assessmentByOpportunityId = new Map<string, AssessmentItem>();
        assessmentItems.forEach((item) => {
          if (item.applicationId) assessmentByApplicationId.set(item.applicationId, item);
          if (item.opportunity?.id) assessmentByOpportunityId.set(item.opportunity.id, item);
        });

        const toDate = (d?: string) =>
          d ? new Date(d).toLocaleDateString() : "Not specified";

        return applications.map((app, index) => {
          const opp = app.opportunity ?? {};
          const assessment =
            assessmentByApplicationId.get(app.id) ||
            assessmentByOpportunityId.get(app.opportunityId);
          const rawAssessmentStatus = String(
            assessment?.sessionStatus || assessment?.assessmentStatus || ""
          ).toLowerCase();
          const hasSession = Boolean(assessment?.sessionId);
          const canStartAssessment = Boolean(assessment?.canStart);

          return {
            id: index + 1,
            originalId: app.id,
            applicantId: 0,

            contractTitle: opp.title || "Unknown Opportunity",
            company: opp.company?.name || "Unknown Company",
            salary: opp.allowance
              ? `${opp.currency || "USD"} ${opp.allowance}`
              : "Not specified",

            jobType: opp.type ?? "Full-time",
            location: opp.location || "Not specified",

            jobDescription: opp.details || "",

            workProgress: Math.floor(Math.random() * 100),

            deadline: toDate(opp.startDate),
            startDate: toDate(opp.startDate),
            endDate: "Not specified",

            status: "Running",

            applicantIds: [],
            companyId: opp.companyId || "",

            opportunityStatus: STATUS_MAP[app.status] ?? "Applied",

            opportunityFrom: "Company",

            skills: opp.skills ?? [],
            benefits: opp.benefits ?? [],
            keyResponsibilities: opp.keyResponsibilities ?? [],
            whyYoullLoveWorkingHere: opp.whyYouWillLoveWorkingHere ?? [],

            originalStatus: app.status,
            appliedAt: toDate(app.appliedAt),

            opportunityId: app.opportunityId,
            hasAssessment: Boolean(opp.hasAssessment),
            assessmentSource: assessment?.source,
            assessmentStatus: assessment?.assessmentStatus ?? undefined,
            sessionStatus: assessment?.sessionStatus || null,
            sessionId: assessment?.sessionId || null,
            inviteToken: assessment?.inviteToken || null,
            canStartAssessment,
            assessmentBlockedReason: (assessment as any)?.isExpired
              ? "Assessment deadline passed"
              : !assessment?.canStart
                ? "Assessment cannot be started right now"
                : null,
          };
        });
      }, [applications, assessmentItems]);
      const handleAssessmentAction = async (row: MappedOpportunity) => {
        const actionKey =
          row.originalId || row.sessionId || row.opportunityId;
        if (!actionKey) return;
        setStartingAssessmentKey(actionKey);
        const toastId = toast.loading("Starting assessment...");
        try {
          let sessionId = row.sessionId || null;
          if (!sessionId) {
            if (row.assessmentSource === "private" && row.inviteToken) {
              const res = await startAssessmentFromInvite(row.inviteToken);
              sessionId = res.sessionId;
            } else if (row.originalId) {
              const res = await startAssessment(row.originalId);
              sessionId = res.sessionId;
            }
          }
          if (!sessionId) {
            toast.error("Failed to start assessment", { id: toastId });
            return;
          }
          toast.success("Assessment started", { id: toastId });
          const sourceParam = row.assessmentSource === "private" ? "&source=invite" : "";
          router.push(
            `/Student/applied-Opportunity/${row.opportunityId}/assessment?sessionId=${sessionId}${sourceParam}`
          );
        } catch (err: unknown) {
          const message =
            err instanceof Error ? err.message : "Something went wrong";
          toast.error(message, { id: toastId });
        } finally {
          setStartingAssessmentKey(null);
        }
      };
      const getAssessmentActionLabel = (row: MappedOpportunity) => {
        const status = String(row.assessmentStatus || row.sessionStatus || "").toLowerCase();
        if (!row.hasAssessment) return null;
        if (status === "completed" || status === "evaluating") return "Assessment Completed";
        if (!row.canStartAssessment) return row.assessmentBlockedReason || "Assessment unavailable";
        if (status === "in_progress" || row.sessionId) return "Resume Assessment";
        return "Start Assessment";
      };

      const getCount = (status: OpportunityStatus) =>
        mappedApplications.filter((c) => c.opportunityStatus === status).length;

      const allCount = mappedApplications.length;
      const appliedCount = getCount("Applied");
      const upcomingCount = getCount("Upcoming Interview");
      const rejectedCount = getCount("Rejected");


    //---------------------filter----------------------------------
      const OPPORTUNITY_STATUSES: OpportunityStatus[] = [
        "Applied",
        "Upcoming Interview",
        "Rejected",
        "Withdrawn",
      ];
      const FILTER_STATUSES: (OpportunityStatus | "All")[] = [
        "All",
        ...OPPORTUNITY_STATUSES,
      ];
  

            const [selectedStatuses, setSelectedStatuses] = useState<StatusFilter[]>(["All"]);

      const toggleStatus = (status: StatusFilter) => {
        // ✅ CLICK "ALL" → select everything
        if (status === "All") {
          setSelectedStatuses((prev) =>
            prev.length === OPPORTUNITY_STATUSES.length
              ? ["All"] // already full → keep All
              : OPPORTUNITY_STATUSES // select everything
          );
          setCurrentPage(1);
          return;
        }

        setSelectedStatuses((prev) => {
          const withoutAll = prev.filter((s) => s !== "All");

          let updated: StatusFilter[];

          if (withoutAll.includes(status)) {
            updated = withoutAll.filter((s) => s !== status);
          } else {
            updated = [...withoutAll, status];
          }

          // ✅ if nothing selected → fallback to ALL
          if (updated.length === 0) return ["All"];

          return updated;
        });

        setCurrentPage(1);
      };

            const [showApplicants, setShowApplicants] = useState(true);
            const router = useRouter();
            const [searchQuery, setSearchQuery] = useState("");
            const [currentPage, setCurrentPage] = useState(1);
        
            // 🔍 Filter applicants
            const isAll =
            selectedStatuses.includes("All") ||
            selectedStatuses.length === OPPORTUNITY_STATUSES.length;

      const filteredApplicants = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();

        return mappedApplications.filter((c) => {
          const statusMatch =
            isAll || selectedStatuses.includes(c.opportunityStatus);

          if (!statusMatch) return false;

          if (!q) return true;

          return (
            c.contractTitle.toLowerCase().includes(q) ||
            c.location.toLowerCase().includes(q) ||
            c.jobType.toLowerCase().includes(q) ||
            c.company.toLowerCase().includes(q)
          );
        });
      }, [mappedApplications, searchQuery, selectedStatuses, isAll]);
  
  
      // 📄 Pagination
      const [itemsPerPage, setItemsPerPage] = useState(6); // default 6 for desktop
      useEffect(() => {
        const updateItemsPerPage = () => {
          if (window.innerWidth < 640) { // mobile
            setItemsPerPage(4);
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


      const stats = useMemo(() => {
        const formatValue = (val: number) =>
          applicationsLoading ? (
            <SyncLoader size={8} color="#D4AF37" />
          ) : (
            <span className={val === 0 ? "text-muted-foreground" : ""}>
              {val.toString()}
            </span>
          );

        return [
          {
            title: "All Opportunities",
            value: formatValue(allCount),
            subtitle: "Total available opportunities",
            icon: <FileText className="w-5 h-5 text-primary" />,
            color: "primary",
          },
          {
            title: "Total Applied",
            value: formatValue(appliedCount),
            subtitle: "Applications submitted",
            icon: <PlayCircle className="w-5 h-5 text-emerald-500" />,
            color: "emerald",
          },
          {
            title: "Upcoming Interview",
            value: formatValue(upcomingCount),
            subtitle: "Scheduled interviews",
            icon: <Clock className="w-5 h-5 text-blue-500" />,
            color: "blue",
          },
          {
            title: "Total Rejected",
            value: formatValue(rejectedCount),
            subtitle: "Declined applications",
            icon: <PauseCircle className="w-5 h-5 text-amber-500" />,
            color: "amber",
          },
        ];
      }, [applicationsLoading, allCount, appliedCount, upcomingCount, rejectedCount]);
  


return (
  <DashboardLayout>
  <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
    {/* Title */}
    {/* ================= HEADER SECTION ================= */}
    <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">

      {/* LEFT SIDE */}
      <div>
        <motion.h1
          className="text-3xl font-bold tracking-tight text-foreground"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <DecryptedText
            text="Applied Opportunities"
            speed={40}
            maxIterations={20}
            className="revealed"
            parentClassName="inline-block"
          />
        </motion.h1>

        <p className="text-muted-foreground mt-1">
          Track your applications, interviews, and progress in one place.
        </p>
      </div>

    </header>

     {/* Top row: 4 cards */}
        {/* STATS */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {applicationsLoading
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
                      iconColor={stat.color}
                    />
                  </motion.div>
                ))}
          </section>


 




      {/* Main Column */}
      <div className="flex flex-col gap-6">
        {/* Search and Filters Row */}
        <SearchAndFilterAndViewBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
                  viewMode={showApplicants ? "list" : "grid"}
                  setViewMode={(mode) => setShowApplicants(mode === "grid")}
          selectedStatuses={selectedStatuses}
          toggleStatus={toggleStatus}
          availableStatuses={FILTER_STATUSES}   // ✅ FIX
          placeholder="applied-Opportunities..."
          filterLabel="Application Status"
        />

        <SelectionBar
          selectedCount={selectedIds.length}
          isVisible={selectedIds.length > 0 && !showApplicants}
          onClearSelection={() => setSelectedIds([])}
          onDeleteClick={() => {
            setBulkWithdraw(true);
            setConfirmOpen(true);
          }}
        />

            {applicationsLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-3 gap-4 mb-8 place-items-stretch">
                {Array.from({ length: 6 }).map((_, i) => (
                  <AppliedOpportunityCardSkeleton key={i} />
                ))}
              </div>
        ) : applicationsError ? (
                    <ErrorState
                      icon={<FileSearch className="h-10 w-10 text-red-500" />}
                      title="Something went wrong"
                      description={applicationsError || "Unable to load applied opportunities. Please try again."}
                    />
        ) : filteredApplicants.length === 0 ? (
                        <EmptyState
                          icon={<FileSearch className="h-10 w-10 text-muted-foreground" />}
                          title="No applied opportunities found"
                          description="Create your first opportunity to get started"
                        />
        ) : showApplicants && (
          <div className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-3 gap-4 mb-8 place-items-stretch">
            {paginatedApplicants.map((contract, index) => (
              <AppliedOpportunityCard
                key={contract.originalId || index}
                applicant={contract}
                onClick={() => {
                  if (contract.opportunityId) {
                    router.push(`/Student/applied-Opportunity/${contract.opportunityId}?from=applied`);
                  }
                }}
                onWithdraw={() => {
                  setSelectedIds(prev => prev.filter(id => id !== contract.originalId));
                  setSelectedApplicationId(contract.originalId ?? null);
                  setConfirmType("withdraw");
                  setConfirmOpen(true);
                }}
                isWithdrawing={withdrawingApplicationId !== null}
                onAssessmentAction={
                  getAssessmentActionLabel(contract)
                    ? () => handleAssessmentAction(contract)
                    : undefined
                }
                assessmentActionLabel={getAssessmentActionLabel(contract) || undefined}
                isAssessmentActionLoading={
                  startingAssessmentKey === (contract.originalId || contract.sessionId || contract.opportunityId)
                }
                assessmentActionDisabled={
                  !contract.canStartAssessment ||
                  ["Assessment Completed", "Assessment Unavailable"].includes(
                    getAssessmentActionLabel(contract) || ""
                  )
                }
              />
            ))}
          </div>
        )}

        {/* Contracts Grid */}
        {!showApplicants && !applicationsLoading && !applicationsError && filteredApplicants.length > 0 && (
          <>
            
            <DataTable
              data={paginatedApplicants}
              getId={(row) => row.originalId!}
              selectable
              selectedIds={selectedIds}
              onSelect={(ids) => setSelectedIds(ids)}
              onRowClick={(row) => {
                if (row.opportunityId) {
                  router.push(
                    `/Student/applied-Opportunity/${row.opportunityId}?from=applied`
                  );
                }
              }}
              columns={[
              {
                header: "Application ID",
                cell: (row: MappedOpportunity) => row.id ?? "N/A",
              },
              {
                header: "Company",
                cell: (row: MappedOpportunity) => row.company ?? "N/A",
              },
              {
                header: "Title",
                cell: (row: MappedOpportunity) => row.contractTitle ?? "N/A",
              },
              {
                header: "Applied At",
                cell: (row: MappedOpportunity) => row.appliedAt ?? "Not specified",
              },
              {
                header: "Status",
                cell: (row: MappedOpportunity) => {
                  const status = row.opportunityStatus;

                  return (
                    <span
                      className={cn(
                        "px-2 py-1 rounded text-xs font-semibold",
                        STATUS_STYLE[status] ?? "text-muted-foreground bg-muted"
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
                    label: "Details",
                    icon: <FileText className="w-4 h-4" />,
                    onClick: (row) => {
                      if (row.opportunityId) {
                        router.push(
                          `/Student/applied-Opportunity/${row.opportunityId}?from=applied`
                        );
                      }
                    },
                  },
                  {
                    label: "Start/Resume Assessment",
                    icon: <PlayCircle className="w-4 h-4" />,
                    hidden: (row) => !getAssessmentActionLabel(row),
                    onClick: (row) => handleAssessmentAction(row),
                  },
                  {
                    label: "Withdraw",
                    icon: <XCircle className="w-4 h-4" />,
                    variant: "destructive",
                    hidden: (row) => row.originalStatus === "withdrawn",
                    onClick: (row) => {
                      setSelectedIds((prev) =>
                        prev.filter((id) => id !== row.originalId)
                      );
                      setSelectedApplicationId(row.originalId ?? null);
                      setConfirmType("withdraw");
                      setConfirmOpen(true);
                    },
                  },
                ],
              }}
            />
           
          </>
        )}

    
      </div>
    </div>

    {/* Pagination */}
       <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        visiblePages={visiblePages}
        loading={applicationsLoading}
        error={applicationsError}
        onPageChange={goToPage}
        onPrevious={goToPrevious}
        onNext={goToNext}
      />

    <ConfirmWithdrawDialog
      isOpen={confirmOpen}
      onOpenChange={setConfirmOpen}
      title={
        confirmType === "withdraw"
          ? "Withdraw Application"
          : "Delete Application"
      }
      description={
        confirmType === "withdraw"
          ? "Are you sure you want to withdraw this application? This action cannot be undone."
          : "Are you sure you want to delete this application? This action cannot be undone."
      }
      isWithdraw={confirmType === "withdraw" ? withdrawingApplicationId !== null : false}
      onConfirm={handleConfirmAction}
    />



  </DashboardLayout>
);
}