// src/app/Student/dashboard/page.tsx
"use client";
import DashboardLayout from "@/components/Student/DashboardLayout";
import {
  ArrowUpRight, Calendar, Clock, DollarSign, FileText,
  Mail, PlayCircle, Star, Trophy, XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useStudentProfileHandler } from "@/hooks/studentapihandler/useStudentProfileHandler";
import { useStudentOpportunityHandler } from "@/hooks/studentapihandler/useStudentOpportunityHandler";
import { useStudentDashboardHandler } from "@/hooks/studentapihandler/useStudentDashboardHandler";
import { useStudentProfileReview } from "@/hooks/common/useStudentProfileReview";
import { useGlobalRankingHandler } from "@/hooks/common/useGlobalRankingHandler";
import { useEffect, useMemo, useRef, useState } from "react";
import { useStudentApplicationHandler } from "@/hooks/studentapihandler/useStudentApplicationHandler";
import { ScrollArea } from "@/components/ui/scroll-area";
import { StatsCard } from "@/components/common/stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { OpportunityDashbordCard } from "@/components/Student/OpportunityDashbordCard";
import { StatsCardSkeleton } from "@/components/common/Skeleton/StatsCardSkeleton";
import { MappedOpportunity } from "@/types/opportunity-s";

/* =========================================================
 * TYPES
 * ======================================================= */

interface InterviewData {
  interviewDate?: string;
  interviewTime: string;
  meetingLink: string;
  notes: string;
}

interface DisplayInterview extends InterviewData {
  id: string;
  opportunity: string;
}

/* =========================================================
 * PAGE
 * ======================================================= */

export default function DashboardPage() {
  // ── Interview modal ──────────────────────────────────────
  const [isInterviewPopupOpen, setIsInterviewPopupOpen] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState<DisplayInterview | null>(null);

  const handleOpenInterviewPopup  = (interview: DisplayInterview) => { setSelectedInterview(interview); setIsInterviewPopupOpen(true); };
  const handleCloseInterviewPopup = () => { setSelectedInterview(null); setIsInterviewPopupOpen(false); };

  // ── Interview state ──────────────────────────────────────
  const [interviews, setInterviews]             = useState<DisplayInterview[]>([]);
  const [interviewsLoading, setInterviewsLoading] = useState(true);

  // ── Helpers ──────────────────────────────────────────────
  const truncateTextFlex = (text: string | undefined, maxLength = 24) => {
    if (!text) return "N/A";
    return text.length > maxLength ? text.slice(0, maxLength) + ".." : text;
  };

  // ── Hooks ────────────────────────────────────────────────
  const {
    profile, profileLoading, getProfile,
    experiences, experienceLoading, getExperiences,
    educations, educationLoading, getEducations,
    skills, skillsLoading, getSkills,
    portfolios, portfolioLoading, getPortfolios,
  } = useStudentProfileHandler();

  const { opportunities, loading: opportunitiesLoading, listOpportunities } = useStudentOpportunityHandler();
  const { stats, loading: statsLoading, getDashboardStats, getUpcomingInterviews } = useStudentDashboardHandler();
  const { reviews, loading: reviewsLoading, getStudentReviews } = useStudentProfileReview();
  const { ranking: studentRanking, getStudentGlobalRankingByStudentId } = useGlobalRankingHandler();
  const { checkApplicationExists } = useStudentApplicationHandler();

  const router = useRouter();

  // ── FIX: guard against re-runs caused by unstable hook refs ──
  // useRef tracks whether the initial fetch has already fired.
  // Without this, listing hook functions in the dep array causes
  // the effect to re-run every render (new function reference = new effect).
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return; // ← prevents the double-load
    hasFetched.current = true;

    const fetchData = async () => {
      try {
        const [profileData] = await Promise.all([
          getProfile(),
          getExperiences(),
          getEducations(),
          getSkills(),
          getPortfolios(),
          listOpportunities(1, 4),
          getDashboardStats(),
        ]);

        if (profileData?.id) {
          await Promise.all([
            getStudentGlobalRankingByStudentId(profileData.id).catch(() => null),
            getStudentReviews(profileData.id),
            getUpcomingInterviews(profileData.id).then((apiInterviews) => {
              const mapped: DisplayInterview[] = apiInterviews.map((interview) => {
                const d = interview.interviewAt ? new Date(interview.interviewAt) : null;
                return {
                  id: interview.id,
                  opportunity: interview.opportunity?.title || "Unknown Opportunity",
                  interviewDate: d ? d.toLocaleDateString() : "N/A",
                  interviewTime: d ? d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "N/A",
                  meetingLink: interview.meetingLink || "",
                  notes: interview.notes || "",
                };
              });
              setInterviews(mapped);
            }),
          ]);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setInterviewsLoading(false);
      }
    };

    fetchData();
  }, []); // ← intentionally empty: run once on mount only

  // ── Applied map (also guarded) ───────────────────────────
  const appliedFetched = useRef(false);
  const [appliedMap, setAppliedMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!opportunities?.length || appliedFetched.current) return;
    appliedFetched.current = true; // ← guard: only run once per opportunities load

    const checkAll = async () => {
      const results: Record<string, boolean> = {};
      await Promise.all(
        opportunities.map(async (opp) => {
          try { results[opp.id] = await checkApplicationExists(opp.id); }
          catch { results[opp.id] = false; }
        })
      );
      setAppliedMap(results);
    };

    checkAll();
  }, [opportunities]); // ← opportunities is data (stable once set), checkApplicationExists excluded intentionally

  // ── Derived values ───────────────────────────────────────
  const totalOpportunities = stats?.totalOpportunities ?? 0;
  const totalApplied       = stats?.totalApplied       ?? 0;
  const totalRejected      = stats?.totalRejected      ?? 0;
  const upcomingInterviews = interviews.length;

  const isLoading =
    profileLoading || experienceLoading || educationLoading ||
    skillsLoading  || portfolioLoading  || opportunitiesLoading || statsLoading;

  const isActive = profile?.status === "active";

  const formatDate = (date?: string) =>
    date ? new Date(date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "—";

  // ── Mapped opportunities ─────────────────────────────────
  const mappedOpportunities = useMemo(() => {
    if (!opportunities || !Array.isArray(opportunities)) return [];

    return opportunities.map((opp, index): MappedOpportunity => {
      const formatCompactNumber = (value: number) => {
        if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
        if (value >= 1_000)     return `${(value / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
        return value.toString();
      };

      const allowanceValue     = opp.allowance ? `${opp.currency} ${formatCompactNumber(Number(opp.allowance))}` : "Not specified";
      const applicationStatus  = opp.applicationStatus?.status || "Not Applied";

      return {
        id: index + 1,
        originalId: opp.id,
        opportunityId: opp.id,
        applicantId: 0,
        opportunityTitle: opp.title,
        company: opp.company?.name || "Unknown Company",
        companyId: opp.companyId,
        companyLogo: opp.company?.logoUrl || opp.company?.logo,
        companyIndustry: opp.company?.industry || "Unknown",
        companyLocation: opp.company?.location || "Unknown",
        companyWebsite: opp.company?.website,
        salary: allowanceValue,
        currency: opp.currency,
        allowance: opp.allowance,
        jobType: (["Full-time", "Part-time", "Internship"].includes(opp.type) ? opp.type : "Full-time") as "Full-time" | "Part-time" | "Internship",
        location: opp.location || "Not specified",
        jobDescription: opp.details || "",
        timeLength: opp.timeLength,
        startDate: opp.startDate ? new Date(opp.startDate).toLocaleDateString() : "Not specified",
        endDate: opp.startDate
          ? new Date(new Date(opp.startDate).getTime() + Number(opp.timeLength?.replace(/\D/g, "")) * 30 * 24 * 60 * 60 * 1000).toLocaleDateString()
          : "Not specified",
        deadline: opp.startDate ? new Date(opp.startDate).toLocaleDateString() : "Not specified",
        status: applicationStatus,
        opportunityStatus: applicationStatus,
        opportunityFrom: "Company",
        workProgress: Math.floor(Math.random() * 100),
        hasAssessment: Boolean(opp.hasAssessment),
        assessmentDeadlineHours: opp.assessmentDeadlineHours,
        questionMode: opp.questionMode,
        fitProfile: opp.fitProfile,
        skills: opp.skills || [],
        benefits: opp.benefits || [],
        keyResponsibilities: opp.keyResponsibilities || [],
        whyYoullLoveWorkingHere: opp.whyYouWillLoveWorkingHere || [],
        applicationId: opp.applicationStatus?.applicationId,
        appliedAt: opp.applicationStatus?.appliedAt,
        applicantIds: [],
      };
    });
  }, [opportunities]);

  // ── Stats cards config ───────────────────────────────────
  const opportunitiesStats = useMemo(() => {
    const formatValue = (val?: number) => {
      const v = val ?? 0;
      return <span className={v === 0 ? "text-muted-foreground" : ""}>{v}</span>;
    };
    return [
      { key: "all",       title: "All Opportunities",  subtitle: "Total available opportunities", icon: <FileText   className="w-5 h-5 text-primary"      />, iconColor: "#6366F1", value: formatValue(totalOpportunities) },
      { key: "applied",   title: "Total Applied",       subtitle: "Applications submitted",        icon: <PlayCircle className="w-5 h-5 text-emerald-500"  />, iconColor: "#10B981", value: formatValue(totalApplied) },
      { key: "interview", title: "Upcoming Interview",  subtitle: "Scheduled interviews",          icon: <Clock      className="w-5 h-5 text-blue-500"     />, iconColor: "#3B82F6", value: formatValue(upcomingInterviews) },
      { key: "rejected",  title: "Total Rejected",      subtitle: "Declined applications",         icon: <XCircle    className="w-5 h-5 text-amber-500"    />, iconColor: "#F59E0B", value: formatValue(totalRejected) },
    ];
  }, [totalOpportunities, totalApplied, totalRejected, upcomingInterviews]);

  /* =========================================================
   * LOADING SKELETON
   * ======================================================= */
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
          <div className="flex flex-col lg:flex-row gap-6 w-full">
            <Card className="flex-[2] p-6 space-y-6">
              <div className="flex items-center gap-4">
                <Skeleton className="h-20 w-20 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-60" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-5 w-28" />
                  </div>
                ))}
              </div>
              <Skeleton className="h-1.5 w-full" />
            </Card>
            <div className="flex-[1] grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="p-5 space-y-3">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-3 w-32" />
                </Card>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="p-4 space-y-3">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-2/3" />
                </Card>
              ))}
            </div>
            <div className="lg:col-span-4 space-y-4">
              {Array.from({ length: 2 }).map((_, i) => (
                <Card key={i} className="p-4 space-y-4 rounded-2xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                    <Skeleton className="h-6 w-16 rounded-full" />
                  </div>
                  <div className="flex gap-2">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-5 w-14" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Skeleton className="h-3 w-12" />
                      <Skeleton className="h-3 w-10" />
                    </div>
                    <Skeleton className="h-2 w-full" />
                  </div>
                  <Skeleton className="h-9 w-full rounded-lg" />
                </Card>
              ))}
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  /* =========================================================
   * RENDER
   * ======================================================= */
  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">

        {/* ── TOP: Profile + Stats ── */}
        <div className="flex flex-col lg:flex-row gap-6 w-full">

          {/* Profile card */}
          <Card className="flex-[8] flex p-0 rounded-2xl border shadow-sm">
            <div className="p-4 sm:p-6 lg:p-8 w-full">

              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">

                  {/* Avatar */}
                  <div className="relative mx-auto sm:mx-0">
                    <Avatar className="h-16 w-16 sm:h-20 sm:w-20 ring-4 ring-background shadow-md">
                      <AvatarImage src={profile?.image || ""} className="object-cover" />
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold text-lg">
                        {profile?.name?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`absolute bottom-1 right-1 h-3 w-3 sm:h-4 sm:w-4 rounded-full border-2 border-background ${isActive ? "bg-emerald-500" : "bg-slate-400"}`} />
                  </div>

                  {/* Name + email */}
                  <div className="text-center sm:text-left space-y-2">
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                      <h2 className="text-xl sm:text-2xl font-bold break-words">{profile?.name}</h2>
                      <Badge variant="secondary" className={`text-[10px] uppercase font-bold ${isActive ? "bg-emerald-500/10 text-emerald-600" : "bg-muted text-muted-foreground"}`}>
                        {profile?.status || "offline"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-center sm:justify-start gap-2 text-muted-foreground text-sm">
                      <Mail className="h-3.5 w-3.5" />
                      <span className="truncate max-w-[220px]">{profile?.email || "No contact provided"}</span>
                    </div>
                  </div>
                </div>

                {/* Rank */}
                <div className="flex justify-center lg:justify-end">
                  <div className="bg-primary/10 px-4 py-2 rounded-xl text-center min-w-[110px]">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground">Applicant Rank</p>
                    <div className="flex items-center justify-center gap-2">
                      <Trophy className="w-5 h-5 text-primary" />
                      <span className="text-xl sm:text-2xl font-black text-primary">{studentRanking?.globalRank ?? "N/A"}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mini stats */}
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                {[
                  { label: "Member Since",       value: formatDate(profile?.createdAt),  icon: Calendar   },
                  { label: "Last Update",         value: formatDate(profile?.updatedAt),  icon: Clock      },
                  { label: "Salary Expectation",  value: profile?.salaryExpectation ? `$${profile.salaryExpectation}` : "N/A", icon: DollarSign },
                  { label: "Availability",        value: profile?.availability || "N/A",  icon: Calendar   },
                ].map((stat) => (
                  <div key={stat.label} className="p-3 sm:p-4 rounded-xl bg-secondary/30 border hover:bg-secondary/50 transition">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <stat.icon className="h-3.5 w-3.5" />
                      <span className="text-[10px] font-bold uppercase">{stat.label}</span>
                    </div>
                    <p className="text-sm sm:text-base font-semibold truncate">{stat.value}</p>
                  </div>
                ))}
              </div>

              {/* Description */}
              <div className="mt-6">
                <p className="text-sm text-muted-foreground leading-relaxed break-words whitespace-pre-wrap line-clamp-4">
                  {profile?.description || "Applicant description not found."}
                </p>
              </div>

              {/* Profile completion */}
              <div className="mt-6 space-y-2">
                <div className="flex justify-between">
                  <span className="text-xs font-bold uppercase">Profile Completion</span>
                  <span className="text-sm font-bold text-primary">{profile?.profileComplete ?? 0}%</span>
                </div>
                <Progress value={profile?.profileComplete ?? 0} className="h-2" />
              </div>

            </div>
          </Card>

          {/* Stats grid */}
          <div className="flex-[4] grid grid-cols-1 sm:grid-cols-2 gap-4 auto-rows-fr">
            {opportunitiesLoading
              ? Array.from({ length: 4 }).map((_, i) => <StatsCardSkeleton key={i} />)
              : opportunitiesStats.map((stat) => (
                  <StatsCard key={stat.key} title={stat.title} value={stat.value} subtitle={stat.subtitle} icon={stat.icon} iconColor={stat.iconColor} className="h-full" />
                ))}
          </div>

        </div>

        {/* ── MID: Cards + Opportunities ── */}
        <div className="flex flex-col sm:flex-row w-full gap-10 mt-10">

          {/* Left — 6 summary cards */}
          <div className="flex-[8]">
            <div className="flex flex-col items-center justify-center gap-6">

              {/* Row 1 — Experience + Education */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 w-full">

                {/* Experience */}
                <Card className="w-full sm:max-w-[400px] sm:min-w-[380px] rounded-2xl shadow-sm flex flex-col max-h-[260px]">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-semibold">Experience Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 overflow-hidden">
                    <ScrollArea className="h-full pr-3">
                      {experienceLoading ? (
                        <p className="text-sm text-muted-foreground py-4">Loading experience...</p>
                      ) : experiences?.length ? (
                        <div className="space-y-3">
                          {experiences.map((exp) => (
                            <div key={exp.id} className="p-3 rounded-xl border bg-muted/30 w-full">
                              <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rotate-45 bg-primary shrink-0" />
                                <h4 className="text-sm font-semibold break-words">{truncateTextFlex(exp.role, 25)}</h4>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1 flex-wrap">
                                <span>{truncateTextFlex(exp.companyName, 14)}</span>
                                <div className="w-1.5 h-1.5 rotate-45 bg-muted-foreground" />
                                <span>{exp.startDate && exp.endDate ? `${exp.startDate} - ${exp.endDate}` : exp.startDate || exp.endDate || "No dates"}</span>
                              </div>
                              <p className="text-xs text-muted-foreground mt-2 break-words">{truncateTextFlex(exp.description, 80)}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground py-4">No experience info available.</p>
                      )}
                    </ScrollArea>
                  </CardContent>
                </Card>

                {/* Education */}
                <Card className="w-full sm:max-w-[400px] sm:min-w-[380px] rounded-2xl shadow-sm flex flex-col max-h-[260px]">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-semibold">Education Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 overflow-hidden">
                    <ScrollArea className="h-full pr-3">
                      {educationLoading ? (
                        <p className="text-sm text-muted-foreground py-4">Loading education...</p>
                      ) : educations?.length ? (
                        <div className="space-y-3">  
                          {educations.map((edu) => (
                            <div key={edu.id} className="p-3 rounded-xl border bg-muted/30 w-full">
                              <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rotate-45 bg-primary shrink-0" />
                                <h4 className="text-sm font-semibold break-words">{truncateTextFlex(edu.major, 25)}</h4>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1 flex-wrap">
                                <span>{truncateTextFlex(edu.name, 25)}</span>
                                <div className="w-1.5 h-1.5 rotate-45 bg-muted-foreground" />
                                <span>{edu.startDate && edu.endDate ? `${edu.startDate} - ${edu.endDate}` : edu.startDate || edu.endDate || "No dates"}</span>
                              </div>
                              <p className="text-xs text-muted-foreground mt-2 break-words">{truncateTextFlex(edu.description, 80)}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground py-4">No education info available.</p>
                      )}
                    </ScrollArea>
                  </CardContent>
                </Card>

              </div>

              {/* Row 2 — Skills + Portfolio */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 w-full">

                {/* Skills */}
                <Card className="w-full sm:max-w-[400px] sm:min-w-[380px] shadow-sm rounded-2xl flex flex-col max-h-[260px]">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-semibold">Skill Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 overflow-hidden">
                    <ScrollArea className="h-full pr-3">
                      {skillsLoading ? (
                        <p className="text-sm text-muted-foreground py-4">Loading skills...</p>
                      ) : skills?.length ? (
                        <div className="flex flex-wrap gap-2">
                          {skills.map((skill) => (
                            <span key={skill.id} className="text-sm px-3 py-1 rounded-md border bg-muted text-foreground">
                              {truncateTextFlex(skill.name, 15)}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">No skills info available.</p>
                      )}
                    </ScrollArea>
                  </CardContent>
                </Card>

                {/* Portfolio */}
                <Card className="rounded-2xl w-full sm:max-w-[400px] sm:min-w-[380px] shadow-sm border flex flex-col max-h-[260px]">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-semibold">Portfolio</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 overflow-hidden">
                    <ScrollArea className="h-full pr-3">
                      {portfolios?.length ? (
                        <div className="space-y-4">
                          {portfolios.map((port: any) => (
                            <div key={port.id} className="p-3 rounded-xl border bg-muted/30 w-full">
                              <div className="flex items-start gap-2 min-w-0">
                                <div className="w-2 h-2 mt-1 rotate-45 bg-primary shrink-0" />
                                <p className="text-sm font-medium break-words whitespace-normal">{truncateTextFlex(port.name, 25)}</p>
                              </div>
                              {port.link ? (
                                <a href={port.link.startsWith("http") ? port.link : `https://${port.link}`} target="_blank" className="block text-xs text-primary hover:underline mt-1 break-all">
                                  {truncateTextFlex(port.link, 50)}
                                </a>
                              ) : (
                                <p className="text-xs text-muted-foreground mt-1">N/A</p>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">No portfolio available</p>
                      )}
                    </ScrollArea>
                  </CardContent>
                </Card>

              </div>

              {/* Row 3 — Reviews + Interviews */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 w-full">

                {/* Reviews */}
                <Card className="rounded-2xl sm:max-w-[400px] sm:min-w-[380px] shadow-sm border max-h-[260px] flex flex-col">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-lg font-semibold">Reviews</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 overflow-hidden">
                    <ScrollArea className="h-full pr-2">
                      {reviewsLoading ? (
                        <p className="text-sm text-muted-foreground">Loading...</p>
                      ) : reviews.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No reviews yet</p>
                      ) : (
                        <div className="space-y-3">
                          {reviews.map((review) => (
                            <div key={review.id} className="p-3 rounded-xl border bg-muted/30 w-full">
                              <div className="flex flex-wrap justify-between gap-3">
                                <div className="flex items-center gap-3 min-w-0">
                                  <Avatar className="w-8 h-8 shrink-0">
                                    <AvatarImage src={review.reviewerImage ?? undefined} />
                                    <AvatarFallback>{review.reviewerName?.charAt(0)}</AvatarFallback>
                                  </Avatar>
                                  <div className="min-w-0">
                                    <p className="text-sm font-medium truncate">{review.reviewerName}</p>
                                    <p className="text-xs text-muted-foreground">{review.dateReviewed}</p>
                                  </div>
                                </div>
                                <div className="flex gap-1 shrink-0">
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <Star key={i} className={`w-4 h-4 ${i < review.rating ? "fill-primary text-primary" : "fill-muted-foreground text-muted-foreground"}`} />
                                  ))}
                                </div>
                              </div>
                              <p className="text-sm text-muted-foreground mt-2 break-words whitespace-normal">{review.reviewText}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </ScrollArea>
                  </CardContent>
                </Card>

                {/* Upcoming Interviews */}
                <Card className="w-full sm:max-w-[400px] sm:min-w-[380px] rounded-2xl shadow-sm border flex flex-col max-h-[260px]">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-semibold">Upcoming Interviews</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 overflow-hidden">
                    <ScrollArea className="h-full pr-3">
                      {interviewsLoading ? (
                        <p className="text-sm text-muted-foreground py-4">Loading interviews...</p>
                      ) : interviews.length > 0 ? (
                        <div className="space-y-3">
                          {interviews.map((interview) => (
                            <div key={interview.id} className="flex items-center justify-between gap-3 p-3 rounded-xl border bg-muted/30 hover:bg-muted/50 transition">
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="w-4 h-4 rotate-45 bg-primary shrink-0" />
                                <div className="flex flex-col min-w-0">
                                  <span className="text-sm font-semibold truncate">{interview.opportunity}</span>
                                  <span className="text-xs text-muted-foreground">{interview.interviewDate} • {interview.interviewTime}</span>
                                </div>
                              </div>
                              <Button size="sm" onClick={() => handleOpenInterviewPopup(interview)}>Details</Button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground py-4">No upcoming interviews.</p>
                      )}
                    </ScrollArea>
                  </CardContent>
                </Card>

              </div>
            </div>
          </div>

          {/* Right — Recent Opportunities */}
          <div className="flex-[4]">
            <Card className="rounded-2xl border shadow-sm h-full">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-semibold">Recent Opportunities</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[800px] w-full px-4 pb-4">
                  <div className="grid grid-cols-1 gap-4">
                    {opportunitiesLoading ? (
                      <div className="space-y-3">
                        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32 w-full rounded-xl" />)}
                      </div>
                    ) : mappedOpportunities.length > 0 ? (
                      mappedOpportunities.map((opp) => (
                        <div key={opp.opportunityId} className="w-full">
                          <OpportunityDashbordCard
                            opportunity={opp}
                            applied={appliedMap[opp.opportunityId]}
                            onClick={() => router.push(`/Student/dashboard/${opp.opportunityId}`)}
                          />
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-muted-foreground py-10 text-center">No opportunities available.</div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

        </div>
      </div>

      {/* ── Interview detail modal ── */}
      <Dialog open={isInterviewPopupOpen} onOpenChange={setIsInterviewPopupOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedInterview?.opportunity}</DialogTitle>
          </DialogHeader>
          {selectedInterview && (
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground space-y-1">
                <p>
                  <span className="font-medium text-foreground">Date:</span>{" "}
                  {selectedInterview.interviewDate} @ {selectedInterview.interviewTime}
                </p>
                <p>
                  <span className="font-medium text-foreground">Meeting Link:</span>{" "}
                  {selectedInterview.meetingLink ? (
                    <a href={selectedInterview.meetingLink} target="_blank" className="text-primary hover:underline break-all">
                      {selectedInterview.meetingLink}
                    </a>
                  ) : "N/A"}
                </p>
              </div>
              <Separator />
              <div className="space-y-2">
                <p className="text-sm font-semibold">Notes</p>
                <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md border whitespace-pre-wrap">
                  {selectedInterview.notes || "No notes available."}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

    </DashboardLayout>
  );
}