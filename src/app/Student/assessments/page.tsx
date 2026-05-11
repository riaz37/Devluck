"use client";

import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/Student/DashboardLayout";
import { useStudentAssessmentHandler } from "@/hooks/studentapihandler/useStudentAssessmentHandler";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import DecryptedText from "@/components/ui/DecryptedText";
import { AssessmentCard } from "@/components/Student/AssessmentCard";
import { SearchAndFilterAndViewBar } from "@/components/common/SearchAndFilterAndViewBar";
import { Pagination } from "@/components/common/Pagination";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/common/DataTable";
import { StatsCard } from "@/components/common/stats-card";
import { CheckCircle2, Clock3, FileCheck, Lock, PlayCircle, RotateCcw } from "lucide-react";
import { StatsCardSkeleton } from "@/components/common/Skeleton/StatsCardSkeleton";
import { AssessmentCardSkeleton } from "@/components/Student/Skeleton/AssessmentCardSkeleton";
import { ErrorState } from "@/components/common/ErrorState";
import { EmptyState } from "@/components/common/EmptyState";
import { AssessmentItem, AssessmentStatus } from "@/types/assessment";
import { toast } from "sonner";
import SyncLoader from "react-spinners/SyncLoader";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type TabMode = "all" | "public" | "private";
type FilterStatus = AssessmentStatus;

// ✅ No "all" — just real statuses
const FILTER_STATUSES: FilterStatus[] = [
  "not_started",
  "in_progress",
  "evaluating",
  "completed",
  "expired",
];

const STATUS_CLASSES: Record<AssessmentStatus, string> = {
  not_started: "bg-muted text-muted-foreground",
  in_progress:  "bg-yellow-500/10 text-yellow-600",
  evaluating:   "bg-blue-500/10 text-blue-600",
  completed:    "bg-green-500/10 text-green-600",
  expired:      "bg-red-500/10 text-red-600",
};

const STATUS_LABELS: Record<AssessmentStatus, string> = {
  not_started: "Not Started",
  in_progress:  "In Progress",
  evaluating:   "Evaluating",
  completed:    "Completed",
  expired:      "Expired",
};

const REPORT_ELIGIBLE = new Set(["evaluating", "completed"]);

export default function StudentAssessmentsPage() {
  const router = useRouter();

  const { listAssessments, startAssessment, startAssessmentFromInvite } =
    useStudentAssessmentHandler();

  /* ───────── STATE ───────── */
  const [tab, setTab]                     = useState<TabMode>("all");
  const [items, setItems]                 = useState<AssessmentItem[]>([]);
  const [loading, setLoading]             = useState(true);
  const [startingKey, setStartingKey]     = useState<string | null>(null);
  const [error, setError]                 = useState<string | null>(null);
  const [showGrid, setShowGrid]           = useState(true);
  const [searchQuery, setSearchQuery]     = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState<FilterStatus[]>([]); // ✅ empty = all
  const [currentPage, setCurrentPage]     = useState(1);

  const ITEMS_PER_PAGE = 6;

  /* ───────── STABLE REF for listAssessments ───────── */
  const listRef = useRef(listAssessments);
  useEffect(() => { listRef.current = listAssessments; }, [listAssessments]);

  /* ───────── FETCH on tab change ───────── */
  useEffect(() => {
    let mounted = true;

    const load = async () => {
      // ✅ Reset filters/search/page on tab switch
      setSelectedStatuses([]);
      setSearchQuery("");
      setCurrentPage(1);
      setLoading(true);
      setError(null);

      try {
        const data = await listRef.current(tab);
        if (!mounted) return;
        setItems(data || []);
        toast.success("Assessments loaded");
      } catch (err: unknown) {
        if (!mounted) return;
        const message = err instanceof Error ? err.message : "Failed to fetch assessments";
        setError(message);
        toast.error(message);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => { mounted = false; };
  }, [tab]); // ✅ only tab — listRef handles the function stability

  /* ───────── NORMALIZE ───────── */
  const normalizedItems = useMemo(() =>
    items.map((item) => {
      const status = String(
        item.sessionStatus || item.assessmentStatus || "not_started"
      ).toLowerCase() as AssessmentStatus;

      return {
        ...item,
        assessmentStatus: status,
        cardStatus: REPORT_ELIGIBLE.has(status) ? "completed" : "pending",
      };
    }),
  [items]);

  /* ───────── FILTER ───────── */
  const filteredItems = useMemo(() =>
    normalizedItems.filter((item: any) => {
      const title = (item.opportunity?.title || "Assessment").toLowerCase();
      const matchesSearch = title.includes(searchQuery.toLowerCase());

      const itemStatus = (item.assessmentStatus ?? "not_started") as AssessmentStatus;

      // ✅ Empty selectedStatuses = no filter = show all
      const matchesStatus =
        selectedStatuses.length === 0 ||
        selectedStatuses.includes(itemStatus);

      return matchesSearch && matchesStatus;
    }),
  [normalizedItems, searchQuery, selectedStatuses]);

  /* ───────── PAGINATION ───────── */
  const totalPages = Math.max(1, Math.ceil(filteredItems.length / ITEMS_PER_PAGE));

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredItems.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredItems, currentPage]);

  const visiblePages = Array.from({ length: totalPages }, (_, i) => i + 1);

  /* ───────── HANDLERS ───────── */

  // ✅ No "all" logic needed — empty array means all
  const toggleStatus = useCallback((status: FilterStatus) => {
    setCurrentPage(1);
    setSelectedStatuses((prev) => {
      if (prev.includes(status)) {
        return prev.filter((x) => x !== status); // deselect → empty = show all
      }
      return [...prev, status];
    });
  }, []);

  const clearAllFilters = useCallback(() => {
    setSelectedStatuses([]);
    setSearchQuery("");
    setCurrentPage(1);
  }, []);

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  }, []);

  const goToPage     = (page: number) => setCurrentPage(page);
  const goToPrevious = () => setCurrentPage((p) => Math.max(p - 1, 1));
  const goToNext     = () => setCurrentPage((p) => Math.min(p + 1, totalPages));

  const handleStart = async (item: AssessmentItem) => {
    const key =
      item.inviteToken ||
      item.applicationId ||
      item.sessionId ||
      item.opportunity?.id;

    if (!key) return;

    setStartingKey(key);
    const toastId = toast.loading("Starting assessment...");

    try {
      let sessionId = item.sessionId;

      if (!sessionId) {
        if (item.source === "private" && item.inviteToken) {
          const res = await startAssessmentFromInvite(item.inviteToken);
          sessionId = res.sessionId;
        } else if (item.source === "public" && item.applicationId) {
          const res = await startAssessment(item.applicationId);
          sessionId = res.sessionId;
        }
      }

      if (!sessionId) {
        toast.error("Failed to start assessment", { id: toastId });
        return;
      }

      toast.success("Assessment started", { id: toastId });

      const sourceParam = item.source === "private" ? "&source=invite" : "";
      router.push(
        `/Student/applied-Opportunity/${item.opportunity?.id || "assessment"}/assessment?sessionId=${sessionId}${sourceParam}`
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      toast.error(message, { id: toastId });
    } finally {
      setStartingKey(null);
    }
  };

  /* ───────── STATS ───────── */
  const formatValue = (val: number) =>
    loading ? (
      <SyncLoader size={8} color="#D4AF37" />
    ) : (
      <span className={val === 0 ? "text-muted-foreground" : ""}>{val}</span>
    );

  const countByStatus = (status: AssessmentStatus) =>
    items.filter((x) =>
      String(x.sessionStatus || x.assessmentStatus || "").toLowerCase() === status
    ).length;

  const statCards = [
    {
      title: "Total",
      value: formatValue(items.length),
      subtitle: "All assessments",
      icon: <FileCheck className="h-5 w-5" />,
    },
    {
      title: "In Progress",
      value: formatValue(countByStatus("in_progress")),
      subtitle: "Currently active",
      icon: <Clock3 className="h-5 w-5" />,
    },
    {
      title: "Completed",
      value: formatValue(countByStatus("completed")),
      subtitle: "Finished tests",
      icon: <CheckCircle2 className="h-5 w-5" />,
    },
    {
      title: "Expired",
      value: formatValue(countByStatus("expired")),
      subtitle: "Time expired",
      icon: <Lock className="h-5 w-5" />,
    },
  ];

  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 lg:px-6 py-6 space-y-8">

        {/* HEADER */}
        <header className="space-y-6">
          <div>
            <motion.h1
              className="text-3xl font-bold tracking-tight text-foreground"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <DecryptedText
                text="Assessments"
                speed={40}
                maxIterations={20}
                className="revealed"
                parentClassName="inline-block"
              />
            </motion.h1>
            <p className="text-muted-foreground mt-1">
              Track and manage public and private assessments with real-time status updates.
            </p>
          </div>

          {/* STATS */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => <StatsCardSkeleton key={i} />)
              : statCards.map((stat, i) => (
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
                    />
                  </motion.div>
                ))
            }
          </section>
        </header>

        {/* TABS */}
        <Tabs
          value={tab}
          onValueChange={(value) => {
            setTab(value as TabMode);
            setCurrentPage(1);
          }}
        >
          <TabsList className="grid w-fit grid-cols-3">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="public">Public</TabsTrigger>
            <TabsTrigger value="private">Private</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* SEARCH + FILTER */}
        <SearchAndFilterAndViewBar
          searchQuery={searchQuery}
          setSearchQuery={handleSearchChange}
          viewMode={showGrid ? "grid" : "list"}
          setViewMode={(mode) => setShowGrid(mode === "grid")}
          selectedStatuses={selectedStatuses}
          toggleStatus={toggleStatus as (status: string) => void}
          availableStatuses={FILTER_STATUSES}   // ✅ no "all" chip
          placeholder="Search assessments..."
          filterLabel="Assessment Status"
          clearAllFilters={clearAllFilters} // ✅ Add this prop
        />

        {/* CONTENT */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <AssessmentCardSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <ErrorState
            title="Failed to load assessments"
            description={error}
            onRetry={() => window.location.reload()}
          />
        ) : filteredItems.length === 0 ? (
          <EmptyState
            title="No assessments found"
            description="There are no assessments matching the selected filter."
            icon={<FileCheck className="h-6 w-6" />}
          />
        ) : (
          <>
            {/* GRID */}
            {showGrid ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {paginatedItems.map((item: any) => {
                  const key =
                    item.inviteToken ||
                    item.applicationId ||
                    item.sessionId ||
                    item.opportunity?.id;

                  return (
                    <AssessmentCard
                      key={key}
                      item={item}
                      isStarting={startingKey === key}
                      onStart={() => handleStart(item)}
                    />
                  );
                })}
              </div>
            ) : (
              /* TABLE */
              <DataTable
                data={paginatedItems}
                getId={(row: any) =>
                  row.inviteToken ||
                  row.applicationId ||
                  row.sessionId ||
                  row.opportunity?.id
                }
                columns={[
                  {
                    header: "Assessment Title",
                    cell: (row: any) => (
                      <div className="font-medium">
                        {row.opportunity?.title || "Assessment"}
                      </div>
                    ),
                  },
                  {
                    header: "Assessment Type",
                    cell: (row: any) => (
                      <Badge
                        className={
                          row.source === "private"
                            ? "bg-muted text-muted-foreground "
                            : "bg-primary/10 text-primary "
                        }
                      >
                        {row.source === "private" ? "Private" : "Public"}
                      </Badge>
                    ),
                  },
                  {
                    header: "Assessment Status",
                    cell: (row: any) => {
                      const status = (row.assessmentStatus ?? "not_started") as AssessmentStatus;
                      return (
                        <Badge className={STATUS_CLASSES[status]}>
                          {STATUS_LABELS[status]}
                        </Badge>
                      );
                    },
                  },
                  {
                    header: "Assessment Report",
                    cell: (row: any) => {
                      const status = String(
                        row.sessionStatus || row.assessmentStatus || ""
                      ).toLowerCase();

                      const canView = row.hasReport || REPORT_ELIGIBLE.has(status);

                      return (
                        <Badge variant={canView ? "default" : "outline"}>
                          {canView ? "Available" : "Pending"}
                        </Badge>
                      );
                    },
                  },
                  {
                    header: "Action",
                    cell: (row: any) => {
                      const status = String(row.assessmentStatus || "").toLowerCase();

                      const isCompleted = status === "completed";
                      const isEvaluating = status === "evaluating";
                      const isInProgress = status === "in_progress";
                      const isExpired = Boolean((row as any).isExpired) || !row.canStart;

                      const isDisabled = isCompleted || isEvaluating || isExpired;

                      const getButtonLabel = () => {
                        if (isCompleted) return "Completed";
                        if (isEvaluating) return "Evaluating";
                        if (isExpired) return "Expired";
                        if (isInProgress || row.sessionId) return "Resume";
                        return "Start";
                      };

                      const getIcon = () => {
                        if (isExpired) return null;
                        if (isInProgress || row.sessionId)
                          return <RotateCcw className="h-3.5 w-3.5" />;
                        return <PlayCircle className="h-3.5 w-3.5" />;
                      };

                      const key =
                        row.inviteToken || row.applicationId || row.sessionId || row.opportunity?.id;

                      const isThisStarting = startingKey === key;

                      return (
                        <Button
                          size="sm"
                          variant={
                            isDisabled
                              ? "secondary"
                              : isInProgress
                                ? "outline"
                                : "default"
                          }
                          disabled={isDisabled || isThisStarting}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!isDisabled) handleStart(row);
                          }}
                          className={cn("min-w-[85px] h-8 gap-1")}
                        >
                          {isThisStarting ? (
                            <>
                              <SyncLoader size={4} color="currentColor" />
                              Starting...
                            </>
                          ) : (
                            <>
                              {getIcon()}
                              {getButtonLabel()}
                            </>
                          )}
                        </Button>
                      );
                    },
                  }
                ]}
              />
            )}

            {/* PAGINATION */}
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
          </>
        )}
      </div>
    </DashboardLayout>
  );
}