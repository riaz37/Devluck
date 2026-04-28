// src/app/Student/dashboard/page.tsx
"use client";
import DashboardLayout from "@/components/Student/DashboardLayout";
import { ArrowUpRight, Calendar, Clock, DollarSign, FileText, Mail, PlayCircle, Settings, Star, User, X, XCircle } from 'lucide-react';
import { useRouter } from "next/navigation";
import { useStudentProfileHandler } from "@/hooks/studentapihandler/useStudentProfileHandler";
import { useStudentOpportunityHandler } from "@/hooks/studentapihandler/useStudentOpportunityHandler";
import { useStudentDashboardHandler } from "@/hooks/studentapihandler/useStudentDashboardHandler";
import { useStudentProfileReview } from "@/hooks/common/useStudentProfileReview";
import { useEffect, useMemo, useState } from "react";
import { CircleLoader, SyncLoader } from "react-spinners";
import { useStudentApplicationHandler } from "@/hooks/studentapihandler/useStudentApplicationHandler";
import { createPortal } from "react-dom";
import { ScrollArea } from "@/components/ui/scroll-area";
import { StatsCard } from "@/components/common/stats-card";
import { Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { OpportunityDashbordCard } from "@/components/Student/OpportunityDashbordCard";


export default function DashboardPage() {
    // State for modal
    const [isInterviewPopupOpen, setIsInterviewPopupOpen] = useState(false);
    const [selectedInterview, setSelectedInterview] = useState<InterviewData & { opportunity: string } | null>(null);

    // Handle open/close
    const handleOpenInterviewPopup = (interview: InterviewData & { opportunity: string }) => {
      setSelectedInterview(interview);
      setIsInterviewPopupOpen(true);
    };
    const handleCloseInterviewPopup = () => {
      setSelectedInterview(null);
      setIsInterviewPopupOpen(false);
    };
    // Interface
    interface InterviewData {
      interviewDate?: string;
      interviewTime: string;
      meetingLink: string;
      notes: string;
    }

    // Add opportunity name for display
    interface DisplayInterview extends InterviewData {
      id: string;
      opportunity: string;
    }

    // State
    const [interviews, setInterviews] = useState<DisplayInterview[]>([]);
    const [interviewsLoading, setInterviewsLoading] = useState(true);

  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [toastVisible, setToastVisible] = useState(false);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  };
  const truncateTextFlex = (text: string | undefined, maxLength: number = 24) => {
    if (!text) return "N/A";
    return text.length > maxLength ? text.slice(0, maxLength) + ".." : text;
  };
  const {
    profile,
    profileLoading,
    getProfile,
    experiences,
    experienceLoading,
    getExperiences,
    educations,
    educationLoading,
    getEducations,
    skills,
    skillsLoading,
    getSkills,
    portfolios,
    portfolioLoading,
    getPortfolios,
  } = useStudentProfileHandler();

  const {
    opportunities,
    loading: opportunitiesLoading,
    listOpportunities,
  } = useStudentOpportunityHandler();

  const {
    stats,
    loading: statsLoading,
    getDashboardStats,
    getUpcomingInterviews
  } = useStudentDashboardHandler();

  const { reviews, loading: reviewsLoading, getStudentReviews } = useStudentProfileReview();

  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileData] = await Promise.all([
          getProfile(),
          getExperiences(),
          getEducations(),
          getSkills(),
          listOpportunities(1, 4),
          getDashboardStats()
        ]);
        if (profileData?.id) {
          await Promise.all([
            getStudentReviews(profileData.id),
            getUpcomingInterviews(profileData.id)
              .then((apiInterviews) => {
                const mappedInterviews: DisplayInterview[] = apiInterviews.map((interview) => {
                  const interviewDateObj = interview.interviewAt ? new Date(interview.interviewAt) : null;
                  return {
                    id: interview.id,
                    opportunity: interview.opportunity?.title || "Unknown Opportunity",
                    interviewDate: interviewDateObj ? interviewDateObj.toLocaleDateString() : "N/A",
                    interviewTime: interviewDateObj
                      ? interviewDateObj.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                      : "N/A",
                    meetingLink: interview.meetingLink || "",
                    notes: interview.notes || "",
                  };
                });
                setInterviews(mappedInterviews);
              })
          ]);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        showToast("Failed to load dashboard data.", "error");
      } finally {
        setInterviewsLoading(false);
      }
    };
    fetchData();
  }, [getProfile, getExperiences, getEducations, getSkills, listOpportunities, getDashboardStats, getStudentReviews, getUpcomingInterviews]);

  const mappedOpportunities = useMemo(() => {
    if (!opportunities || !Array.isArray(opportunities)) {
      return [];
    }
    return opportunities.map((opp) => ({
      id: opp.id,
      applicantId: 0,
      contractTitle: opp.title,
      company: opp.company?.name || "Unknown Company",
      salary: opp.allowance ? `${opp.currency} ${opp.allowance}` : "Not specified",
      workProgress: Math.floor(Math.random() * 100),
      opportunityStatus: "Applied" as const,
      opportunityFrom: "Company" as const,
      deadline: opp.startDate ? new Date(opp.startDate).toLocaleDateString() : "Not specified",
      startDate: opp.startDate ? new Date(opp.startDate).toLocaleDateString() : "Not specified",
      endDate: "Not specified",
      status: "Running" as const,
      applicantIds: [],
      companyId: opp.companyId || "",
      skills: opp.skills || [],
      benefits: opp.benefits || [],
      keyResponsibilities: opp.keyResponsibilities || [],
      whyYoullLoveWorkingHere: opp.whyYouWillLoveWorkingHere || [],
      jobDescription: opp.details || "",
      jobType: (opp.type === "Full-time" || opp.type === "Part-time" || opp.type === "Contract") 
        ? opp.type 
        : "Full-time" as "Full-time" | "Part-time" | "Contract",
      location: opp.location || "Not specified",
    }));
  }, [opportunities]);

  const totalOpportunities = stats?.totalOpportunities ?? 0;
  const totalApplied = stats?.totalApplied ?? 0;
  const totalRejected = stats?.totalRejected ?? 0;
  const upcomingInterviews = interviews.length;

  const isLoading =
  profileLoading ||
  experienceLoading ||
  educationLoading ||
  skillsLoading ||
  opportunitiesLoading ||
  statsLoading;

  // ✅ Hooks FIRST
  const { checkApplicationExists } = useStudentApplicationHandler();
  const [appliedMap, setAppliedMap] = useState<Record<string, boolean>>({});

  // ✅ Now opportunities exists
  useEffect(() => {
    const checkAll = async () => {
      if (!opportunities?.length) return;

      const results: Record<string, boolean> = {};

      await Promise.all(
        opportunities.map(async (opp) => {
          try {
            const applied = await checkApplicationExists(opp.id);
            results[opp.id] = applied;
          } catch {
            results[opp.id] = false;
          }
        })
      );

      setAppliedMap(results);
    };

    checkAll();
  }, [opportunities, checkApplicationExists]);

  const opportunitiesStats = useMemo(() => {
    const formatValue = (val: number) =>
      opportunitiesLoading ? (
        <SyncLoader size={8} color="#D4AF37" />
      ) : (
        <span className={val === 0 ? "text-muted-foreground" : ""}>
          {val.toString()}
        </span>
      );

    return [
      {
        key: "all",
        title: "All Opportunities",
        subtitle: "Total available opportunities",
        icon: <FileText className="w-5 h-5 text-primary" />,
        iconColor: "#6366F1",
        value: formatValue(totalOpportunities),
      },
      {
        key: "applied",
        title: "Total Applied",
        subtitle: "Applications submitted",
        icon: <PlayCircle className="w-5 h-5 text-emerald-500" />,
        iconColor: "#10B981",
        value: formatValue(totalApplied),
      },
      {
        key: "interview",
        title: "Upcoming Interview",
        subtitle: "Scheduled interviews",
        icon: <Clock className="w-5 h-5 text-blue-500" />,
        iconColor: "#3B82F6",
        value: formatValue(upcomingInterviews),
      },
      {
        key: "rejected",
        title: "Total Rejected",
        subtitle: "Declined applications",
        icon: <XCircle className="w-5 h-5 text-amber-500" />,
        iconColor: "#F59E0B",
        value: formatValue(totalRejected),
      },
    ];
  }, [
    opportunitiesLoading,
    totalOpportunities,
    totalApplied,
    totalRejected,
    upcomingInterviews,
  ]);

  const isActive = profile?.status === "active";
  const formatDate = (date?: string) =>
  date
    ? new Date(date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "—";

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">

          {/* TOP SECTION */}
          <div className="flex flex-col lg:flex-row gap-6 w-full">

            {/* LEFT PROFILE (WIDER) */}
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

            {/* RIGHT STATS (SMALLER) */}
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

          {/* ================= MID SECTION ================= */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* LEFT SIDE (HUGE AREA → 8/12) */}
            <div className="lg:col-span-8">

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="p-4 space-y-3">

                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                    <Skeleton className="h-4 w-2/3" />

                  </Card>
                ))}

              </div>

            </div>

            {/* RIGHT SIDE (SMALL SIDEBAR → 4/12) */}
            <div className="lg:col-span-4 space-y-4">

              <Skeleton className="h-6 w-40" />

              <div className="space-y-4">

                {Array.from({ length: 2 }).map((_, i) => (
                  <Card key={i} className="p-4 space-y-4 rounded-2xl">

                    {/* HEADER */}
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

                    {/* BADGES */}
                    <div className="flex gap-2">
                      <Skeleton className="h-5 w-16" />
                      <Skeleton className="h-5 w-20" />
                      <Skeleton className="h-5 w-14" />
                    </div>

                    {/* PROGRESS */}
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Skeleton className="h-3 w-12" />
                        <Skeleton className="h-3 w-10" />
                      </div>
                      <Skeleton className="h-2 w-full" />
                    </div>

                    {/* FOOTER */}
                    <div className="flex justify-between">
                      <Skeleton className="h-3 w-20" />
                      <Skeleton className="h-3 w-20" />
                    </div>

                    {/* BUTTON */}
                    <Skeleton className="h-9 w-full rounded-lg" />

                  </Card>
                ))}

              </div>

            </div>

          </div>


        </div>
      </DashboardLayout>
    );
  }


  return (
    <DashboardLayout>
<div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
          {/* FRAME 254 */}
          <div className="flex flex-col lg:flex-row gap-6 w-full">

            {/* LEFT SIDE */}
            <Card className="p-0 rounded-2xl border  shadow-sm">      {/* Subtle top accent line */}
              <div className="p-8">
                {/* HEADER SECTION */}
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                  <div className="flex items-center gap-5">
                    <div className="relative">
                      <Avatar className="h-20 w-20 ring-4 ring-background shadow-xl">
                        <AvatarImage src={profile?.image || ""} className="object-cover" />
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xl">
                          {profile?.name?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>

                      <div
                        className={`absolute bottom-1 right-1 h-4 w-4 rounded-full border-2 border-background ${
                          isActive ? "bg-emerald-500" : "bg-slate-400"
                        }`}
                      />
                    </div>

                    {/* NAME + INFO */}
                    <div className="space-y-1">

                      {/* NAME + BADGE + SETTINGS */}
                      <div className="flex flex-col md:flex-row md:items-center md:gap-3">

                        {/* NAME */}
                        <h2 className="text-2xl font-bold tracking-tight text-foreground">
                          {profile?.name}
                        </h2>

                        {/* BADGE + SETTINGS */}
                        <div className="flex items-center gap-2 mt-2 md:mt-0">
                          
                          <Badge
                            variant="secondary"
                            className={`rounded-full px-3 py-0.5 text-[10px] uppercase tracking-wider font-bold border ${
                              isActive
                                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                                : "bg-slate-100 text-slate-500 border-slate-200"
                            }`}
                          >
                            {profile?.status || "offline"}
                          </Badge>
                        </div>
                      </div>

                      {/* EMAIL */}
                      <div className="flex items-center gap-2 text-muted-foreground font-medium text-sm hover:text-primary transition-colors cursor-pointer">
                        <Mail className="h-3.5 w-3.5" />
                        {profile?.email || "No contact provided"}
                      </div>

                    </div>
                  </div>

                  {/* QUICK ACTIONS / PERCENTAGE CIRCLE */}
                  <div className="hidden lg:flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Applicant Rank</p>
                      <p className="text-3xl font-black text-primary leading-none">
                        {profile?.profileRanking ?? "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* STATS STRIP - New minimalist layout */}
                <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: "Member Since", value: formatDate(profile?.createdAt), icon: Calendar },
                    { label: "Last Update", value: formatDate(profile?.updatedAt), icon: Clock},
                    { label: "Salary Expectation", value: profile?.salaryExpectation ? `$${profile.salaryExpectation}` : "N/A", icon: DollarSign },
                    { label: "Availability", value: profile?.availability || "N/A", icon: Calendar },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className="flex flex-col gap-1 p-4 rounded-2xl bg-secondary/30 border border-border/50 hover:bg-secondary/50 transition-colors"
                    >
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <stat.icon className="h-3.5 w-3.5" />
                        <span className="text-[11px] font-bold uppercase tracking-tighter">
                          {stat.label}
                        </span>
                      </div>

                      <p className="text-base font-semibold text-foreground tracking-tight">
                        {stat.value}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-8 space-y-4">
                  {/* DESCRIPTION */}
                  <div className="relative">
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 hover:line-clamp-none transition-all duration-300">
                      "{profile?.description || "Applicant description not found."}"
                    </p>
                  </div>

                  <Separator className="bg-border/40" />

                  {/* PROGRESS SECTION */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-end">
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-widest text-foreground">Profile Completion</h4>
                        <p className="text-[10px] text-muted-foreground">Detailed evaluation pending</p>
                      </div>
                      <span className="text-sm font-black text-primary">{profile?.profileComplete ?? 0}%</span>
                    </div>
                    <Progress 
                      value={profile?.profileComplete ?? 0} 
                      className="h-1.5 bg-secondary" 
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* RIGHT SIDE - STATS GRID */}
            <div className="
              flex-1
              grid
              grid-cols-1 sm:grid-cols-2
              gap-4
              auto-rows-fr
            ">

            {opportunitiesStats.map((stat) => (
              <StatsCard
                key={stat.key}
                title={stat.title}
                value={stat.value}
                subtitle={stat.subtitle}
                icon={stat.icon}
                iconColor={stat.iconColor}
                className="h-full"
              />
            ))}

            </div>

          </div>
        
        {/* Frame 267 */}
        <div className="flex flex-col sm:flex-row w-full gap-10 sm:gap-15 mt-10 ">

          {/* Frame 266 */}
          <div className="flex-[8] flex flex-col gap-6 px-4 sm:px-0  ">
                  {/* Skills Parallelogram Card */}
                  <div className="flex flex-col items-center justify-center gap-10">
                    {/* Row 1 */}
                    <div className=" grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
                        {/* EXPERIENCE */}
                        <Card className="w-full sm:max-w-[360px] sm:min-w-[340px] rounded-2xl shadow-sm flex flex-col max-h-[260px]">

                          {/* HEADER */}
                          <CardHeader className="pb-2">
                            <CardTitle className="text-lg font-semibold">
                              Experience Summary
                            </CardTitle>
                          </CardHeader>

                          {/* CONTENT */}
                          <CardContent className="flex-1 overflow-hidden">
                            <ScrollArea className="h-full pr-3">

                              {experienceLoading ? (
                                <p className="text-sm text-muted-foreground py-4">
                                  Loading experience...
                                </p>
                              ) : experiences?.length ? (

                                <div className="space-y-3">

                                  {experiences.map((exp) => (
                                    <div
                                      key={exp.id}
                                      className="p-3 rounded-xl border bg-muted/30 w-full"
                                    >

                                      {/* ROLE */}
                                      <div className="flex items-center gap-2">

                                        {/* diamond icon (same vibe as your SVG) */}
                                        <div className="w-2.5 h-2.5 rotate-45 bg-primary shrink-0" />

                                        <h4 className="text-sm font-semibold break-words">
                                          {truncateTextFlex(exp.role, 25)}
                                        </h4>
                                      </div>

                                      {/* COMPANY + DATE */}
                                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1 flex-wrap">

                                        <span>
                                          {truncateTextFlex(exp.companyName, 14)}
                                        </span>

                                        {/* small separator diamond */}
                                        <div className="w-1.5 h-1.5 rotate-45 bg-muted-foreground" />

                                        <span>
                                          {exp.startDate && exp.endDate
                                            ? `${exp.startDate} - ${exp.endDate}`
                                            : exp.startDate || exp.endDate || "No dates"}
                                        </span>

                                      </div>

                                      {/* DESCRIPTION */}
                                      <p className="text-xs text-muted-foreground mt-2 break-words">
                                        {truncateTextFlex(exp.description, 80)}
                                      </p>

                                    </div>
                                  ))}

                                </div>

                              ) : (
                                <p className="text-sm text-muted-foreground py-4">
                                  No experience info available.
                                </p>
                              )}

                            </ScrollArea>
                          </CardContent>

                        </Card>
                        {/* EDUCATION */}
                        <Card className="w-full sm:max-w-[360px] sm:min-w-[340px] rounded-2xl shadow-sm flex flex-col max-h-[260px]">

                          {/* HEADER */}
                          <CardHeader className="pb-2">
                            <CardTitle className="text-lg font-semibold">
                              Education Summary
                            </CardTitle>
                          </CardHeader>

                          {/* CONTENT */}
                          <CardContent className="flex-1 overflow-hidden">
                            <ScrollArea className="h-full pr-3">

                              {educationLoading ? (
                                <p className="text-sm text-muted-foreground py-4">
                                  Loading education...
                                </p>
                              ) : educations?.length ? (

                                <div className="space-y-3">

                                  {educations.map((edu) => (
                                    <div
                                      key={edu.id}
                                      className="p-3 rounded-xl border bg-muted/30 w-full"
                                    >

                                      {/* MAJOR */}
                                      <div className="flex items-center gap-2">

                                        {/* diamond icon (same as old SVG vibe) */}
                                        <div className="w-2.5 h-2.5 rotate-45 bg-primary shrink-0" />

                                        <h4 className="text-sm font-semibold break-words">
                                          {truncateTextFlex(edu.major, 25)}
                                        </h4>
                                      </div>

                                      {/* SCHOOL + DATE */}
                                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1 flex-wrap">

                                        <span>
                                          {truncateTextFlex(edu.name, 25)}
                                        </span>

                                        {/* separator diamond */}
                                        <div className="w-1.5 h-1.5 rotate-45 bg-muted-foreground" />

                                        <span>
                                          {edu.startDate && edu.endDate
                                            ? `${edu.startDate} - ${edu.endDate}`
                                            : edu.startDate || edu.endDate || "No dates"}
                                        </span>

                                      </div>

                                      {/* DESCRIPTION */}
                                      <p className="text-xs text-muted-foreground mt-2 break-words">
                                        {truncateTextFlex(edu.description, 80)}
                                      </p>

                                    </div>
                                  ))}

                                </div>

                              ) : (
                                <p className="text-sm text-muted-foreground py-4">
                                  No education info available.
                                </p>
                              )}

                            </ScrollArea>
                          </CardContent>

                        </Card>
                      </div>
            
                    {/* Row 2 */}
                    <div className=" grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
                      {/* SKILLS */}
                      <Card className="w-full sm:max-w-[360px] sm:min-w-[340px]  shadow-sm rounded-2xl flex flex-col max-h-[300px]">

                        {/* HEADER */}
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg font-semibold">
                            Skill Summary
                          </CardTitle>
                        </CardHeader>

                        {/* CONTENT */}
                        <CardContent className="flex-1 overflow-hidden">
                          <ScrollArea className="h-full pr-3">

                            {skillsLoading ? (
                              <p className="text-sm text-muted-foreground py-4">
                                Loading skills...
                              </p>
                            ) : skills?.length ? (
                              <div className="flex flex-wrap gap-2">
                                {skills.map((skill) => (
                                  <span
                                    key={skill.id}
                                    className="text-sm px-3 py-1 rounded-md border bg-muted text-foreground"
                                  >
                                    {truncateTextFlex(skill.name, 15)}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-muted-foreground">
                                No skills info available.
                              </p>
                            )}

                          </ScrollArea>
                        </CardContent>

                      </Card>

                      {/* Portfolio Card */}
                      <Card className="rounded-2xl w-full sm:max-w-[360px] sm:min-w-[340px]  shadow-sm border  flex flex-col max-h-[300px]">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg font-semibold">Portfolio</CardTitle>
                        </CardHeader>

                        <CardContent className="flex-1 overflow-hidden">
                          <ScrollArea className="h-full pr-3">
                            {portfolios?.length ? (
                              <div className="space-y-4">
                                {portfolios.map((port: any) => (
                                  <div
                                    key={port.id}
                                    className="p-3 rounded-xl border bg-muted/30 w-full"
                                  >
                                    {/* Top row */}
                                    <div className="flex items-start gap-2 min-w-0">
                                      <div className="w-2 h-2 mt-1 rotate-45 bg-primary shrink-0" />

                                      <p className="text-sm font-medium break-words whitespace-normal">
                                        {truncateTextFlex(port.name, 25)}
                                      </p>
                                    </div>

                                    {/* Link */}
                                    {port.link ? (
                                      <a
                                        href={port.link.startsWith("http") ? port.link : `https://${port.link}`}
                                        target="_blank"
                                        className="block text-xs text-primary hover:underline mt-1 break-all"
                                      >
                                        {truncateTextFlex(port.link, 50)}
                                      </a>
                                    ) : (
                                      <p className="text-xs text-muted-foreground mt-1">N/A</p>
                                    )}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-muted-foreground">
                                No portfolio available
                              </p>
                            )}
                          </ScrollArea>
                        </CardContent>
                      </Card>
            
            

                    </div>
                    {/* Row 3 */}
                    <div className=" grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">


                      {/* ───────────────────── REVIEWS ───────────────────── */}
                      <Card className="rounded-2xl sm:max-w-[360px] sm:min-w-[340px] shadow-sm border max-h-[300px] flex flex-col">

                        {/* HEADER */}
                        <CardHeader className="flex flex-row items-center justify-between">
                          <CardTitle className="text-lg font-semibold">Reviews</CardTitle>
                        </CardHeader>

                        {/* CONTENT */}
                        <CardContent className="flex-1 overflow-hidden">
                          <ScrollArea className="h-full pr-2">
                            {reviewsLoading ? (
                              <p className="text-sm text-muted-foreground">Loading...</p>
                            ) : reviews.length === 0 ? (
                              <p className="text-sm text-muted-foreground">
                                No reviews yet
                              </p>
                            ) : (
                              <div className="space-y-3">
                                {reviews.map((review) => (
                                  <div
                                    key={review.id}
                                    className="p-3 rounded-xl border bg-muted/30 w-full"
                                  >
                                    {/* top row */}
                                    <div className="flex flex-wrap justify-between gap-3">

                                      {/* LEFT SIDE */}
                                      <div className="flex items-center gap-3 min-w-0">
                                        <Avatar className="w-8 h-8 shrink-0">
                                          <AvatarImage src={review.reviewerImage ?? undefined} />
                                          <AvatarFallback>
                                            {review.reviewerName?.charAt(0)}
                                          </AvatarFallback>
                                        </Avatar>

                                        <div className="min-w-0">
                                          <p className="text-sm font-medium truncate">
                                            {review.reviewerName}
                                          </p>
                                          <p className="text-xs text-muted-foreground">
                                            {review.dateReviewed}
                                          </p>
                                        </div>
                                      </div>

                                      {/* STARS */}
                                      <div className="flex gap-1 shrink-0">
                                        {Array.from({ length: 5 }).map((_, i) => (
                                          <Star
                                            key={i}
                                            className={`w-4 h-4 ${
                                              i < review.rating
                                                ? "fill-yellow-400 text-yellow-400"
                                                : "text-muted-foreground"
                                            }`}
                                          />
                                        ))}
                                      </div>
                                    </div>

                                    {/* TEXT */}
                                    <p className="text-sm text-muted-foreground mt-2 break-words whitespace-normal">
                                      {review.reviewText}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            )}
                          </ScrollArea>
                        </CardContent>
                      </Card>

                      {/* Upcoming Interviews Card */}
                        <Card className="w-full sm:max-w-[360px] sm:min-w-[340px] rounded-2xl shadow-sm border flex flex-col max-h-[300px]">

                          <CardHeader className="pb-2">
                            <CardTitle className="text-lg font-semibold">
                              Upcoming Interviews
                            </CardTitle>
                          </CardHeader>

                          <CardContent className="flex-1 overflow-hidden">
                            <ScrollArea className="h-full pr-3">

                              {interviewsLoading ? (
                                <p className="text-sm text-muted-foreground py-4">
                                  Loading interviews...
                                </p>

                              ) : interviews.length > 0 ? (

                                <div className="space-y-3">

                                  {interviews.map((interview) => (
                                    <div
                                      key={interview.id}
                                      className="flex items-center justify-between gap-3 p-3 rounded-xl border bg-muted/30 hover:bg-muted/50 transition"
                                    >

                                      {/* LEFT */}
                                      <div className="flex items-center gap-3 min-w-0">

                                        {/* Icon */}
                                          <div className="w-4 h-4 rotate-45 bg-primary" />
                                       
                                        {/* Text */}
                                        <div className="flex flex-col min-w-0">
                                          <span className="text-sm font-semibold truncate">
                                            {interview.opportunity}
                                          </span>

                                          <span className="text-xs text-muted-foreground">
                                            {interview.interviewDate} • {interview.interviewTime}
                                          </span>
                                        </div>

                                      </div>

                                      {/* RIGHT ACTION */}
                                      <Button
                                        size="sm"
                                        onClick={() => handleOpenInterviewPopup(interview)}
                                      >
                                        Details
                                      </Button>

                                    </div>
                                  ))}

                                </div>

                              ) : (
                                <p className="text-sm text-muted-foreground py-4">
                                  No upcoming interviews.
                                </p>
                              )}

                            </ScrollArea>
                          </CardContent>
                        </Card>

                    </div>
                  </div>
          </div>

         {/* Frame 240 */}
    <div className="flex-[4]">
      <Card className="rounded-2xl border shadow-sm h-full">

        {/* HEADER */}
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold">
            Recent Opportunities
          </CardTitle>
        </CardHeader>

        {/* CONTENT */}
        <CardContent className="p-0">
          <ScrollArea className="h-[800px] w-full px-4 pb-4">

            <div className="grid grid-cols-1 gap-4">

              {opportunitiesLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-32 w-full rounded-xl" />
                  ))}
                </div>
              ) : mappedOpportunities.length > 0 ? (
                mappedOpportunities.map((opp) => (
                  <div key={opp.id} className="w-full">
                    <OpportunityDashbordCard
                      contract={opp}
                      applied={appliedMap[opp.id]}
                      onClick={() =>
                        router.push(`/Student/dashboard/${opp.id}`)
                      }
                    />
                  </div>
                ))
              ) : (
                <div className="text-sm text-muted-foreground py-10 text-center">
                  No opportunities available.
                </div>
              )}

            </div>

          </ScrollArea>
        </CardContent>

      </Card>
    </div>



        </div>
      </div>
  
      <Dialog open={isInterviewPopupOpen} onOpenChange={setIsInterviewPopupOpen}>
        <DialogContent className="max-w-lg">

          {/* HEADER */}
          <DialogHeader>
            <DialogTitle>
              {selectedInterview?.opportunity}
            </DialogTitle>
          </DialogHeader>

          {/* BODY */}
          {selectedInterview && (
            <div className="space-y-4">

              {/* INFO */}
              <div className="text-sm text-muted-foreground space-y-1">
                <p>
                  <span className="font-medium text-foreground">Date:</span>{" "}
                  {selectedInterview.interviewDate} @ {selectedInterview.interviewTime}
                </p>

                <p>
                  <span className="font-medium text-foreground">Meeting Link:</span>{" "}
                  {selectedInterview.meetingLink ? (
                    <a
                      href={selectedInterview.meetingLink}
                      target="_blank"
                      className="text-primary hover:underline break-all"
                    >
                      {selectedInterview.meetingLink}
                    </a>
                  ) : (
                    "N/A"
                  )}
                </p>
              </div>

              <Separator />

              {/* NOTES */}
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
