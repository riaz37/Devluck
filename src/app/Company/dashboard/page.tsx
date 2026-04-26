"use client";
import React, { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Briefcase, CheckCircle, Clock, File, Users } from 'lucide-react';
import { toast } from "sonner";

// UI Components
import DashboardLayout from "@/components/Company/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { StatsCard } from "@/components/common/stats-card";


import DecryptedText from "@/components/ui/DecryptedText";

// State Components (Your provided components)
import { LoadingState } from "@/components/common/LoadingState";
import { ErrorState } from "@/components/common/ErrorState";
import { EmptyState } from "@/components/common/EmptyState";

// Hooks
import { useOpportunityHandler } from "@/hooks/companyapihandler/useOpportunityHandler";
import { useCompanyApplicationHandler } from "@/hooks/companyapihandler/useCompanyApplicationHandler";
import SyncLoader from "react-spinners/SyncLoader";
import { OpportunityUI } from "@/types/opportunity";
import { OpportunityCard } from "@/components/Company/OpportunityCard";
import { ApplicantCard } from "@/components/Company/DashboardApplicantCard";
import { Skeleton } from "@/components/ui/skeleton";
import { ApplicantCardSkeleton } from "@/components/Company/Skeleton/ApplicantCardSkeleton";
import { OpportunityCardSkeleton } from "@/components/Company/Skeleton/OpportunityCardSkeleton";
import { StatsCardSkeleton } from "@/components/common/Skeleton/StatsCardSkeleton";
import { DashboardApplicantCardSkeleton } from "@/components/Company/Skeleton/DashboardApplicantCardSkeleton";


export default function DashboardPage() {
  const router = useRouter();

  const {
    opportunities = [],
    loading: opportunitiesLoading,
    getRecentOpportunities,
  } = useOpportunityHandler();

  const {
    applications = [],
    loading: applicationsLoading,
    getRecentApplicants,
    error,
  } = useCompanyApplicationHandler();

  useEffect(() => {
    const fetchData = async () => {
      try {
        await Promise.all([
          getRecentOpportunities(4),
          getRecentApplicants(4),
        ]);
      } catch (err) {
        toast.error("Failed to load dashboard data.");
      }
    };
    fetchData();
  }, [getRecentOpportunities, getRecentApplicants]);

  const mappedOpportunities = useMemo((): OpportunityUI[] => {
    if (!Array.isArray(opportunities)) return [];

    return opportunities.map((opp, index) => ({
      id: opp.id,
      jobNumber: opp.id.substring(0, 8) || String(index + 1),
      jobName: opp.title,
      country: opp.location || "Not specified",
      jobtype: opp.type,
      title: opp.title,
      type: opp.type,
      timeLength: opp.timeLength,
      currency: opp.currency,
      allowance: opp.allowance,
      location: opp.location,
      description: opp.details || opp.description || "",
      startDate: opp.startDate ? new Date(opp.startDate).toISOString().split('T')[0] : undefined,
      skills: opp.skills || [],
      whyYouWillLoveWorkingHere: opp.whyYouWillLoveWorkingHere || [],
      benefits: opp.benefits || [],
      keyResponsibilities: opp.keyResponsibilities || [],
      numberOfApplicants: String(opp.applicantCount ?? 0)
    }));
  }, [opportunities]);

  const uniqueApplications = useMemo(() => {
    if (!Array.isArray(applications)) return [];
    const studentMap = new Map();
    applications.forEach((app) => {
      const studentId = app.student?.id;
      if (!studentId) return;
      if (!studentMap.has(studentId) || new Date(app.appliedAt) > new Date(studentMap.get(studentId).appliedAt)) {
        studentMap.set(studentId, app);
      }
    });
    return Array.from(studentMap.values());
  }, [applications]);

  const dashboardLoading = opportunitiesLoading || applicationsLoading;



  const LoadingState = () => {
    return (
      <div className="space-y-10">


        <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">

          {/* OPPORTUNITIES */}
          <div className="xl:col-span-8 space-y-6">
            <Skeleton className="h-6 w-48" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <OpportunityCardSkeleton key={i} />
              ))}
            </div>
          </div>

          {/* APPLICANTS */}
          <div className="xl:col-span-4 space-y-6">
            <div className="flex justify-between items-center">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-6 w-10 rounded-full" />
            </div>

            <div className="rounded-3xl border p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <DashboardApplicantCardSkeleton key={i} />
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    )
  }

    const dashboardStats = useMemo(() => {
    const formatValue = (val: number) =>
      dashboardLoading ? (
        <SyncLoader size={8} color="#D4AF37" />
      ) : (
        <span style={{ color: val === 0 ? "gray" : "inherit" }}>
          {val}
        </span>
      );

  return [
    {
      title: "Opportunities",
      value: formatValue(opportunities.length),
      icon: <Briefcase className="w-5 h-5" />,
      iconColor: "#6366F1", // indigo
      subtitle: "Recently created",
    },
    {
      title: "Applications",
      value: formatValue(applications.length),
      icon: <Users className="w-5 h-5" />,
      iconColor: "#0EA5E9", // sky blue
      subtitle: "Total entries",
    },
    {
      title: "Pending",
      value: formatValue(
        applications.filter((a) => a.status === "pending").length
      ),
      icon: <Clock className="w-5 h-5" />,
      iconColor: "#F59E0B", // amber
      subtitle: "Needs review",
    },
    {
      title: "Accepted",
      value: formatValue(
        applications.filter((a) => a.status === "accepted").length
      ),
      icon: <CheckCircle className="w-5 h-5" />,
      iconColor: "#22C55E", // green
      subtitle: "Approved",
    },
  ];
  }, [
    opportunities.length,
    applications.length,
    applications,
    dashboardLoading
  ]);



  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        
        {/* HEADER */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-foreground">
              <DecryptedText text="Dashboard" speed={50} />
            </h1>
            <p className="text-muted-foreground mt-1">Check your latest recruitment activity.</p>
          </div>
        </header>

        {/* STATS */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardLoading
          ? Array.from({ length: 4 }).map((_, i) => (
            <StatsCardSkeleton key={i} />
            ))
          : dashboardStats.map((stat, i) => (
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



        {/* CONTENT STATES */}
        {dashboardLoading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState 
            icon={<File size={40} />} 
            description={error} 
            onRetry={() => window.location.reload()} 
          />
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
            
            {/* OPPORTUNITIES */}
            <div className="xl:col-span-8 space-y-6">
              <h2 className="text-2xl font-bold tracking-tight">Recent Opportunities</h2>
              {mappedOpportunities.length === 0 ? (
                <EmptyState 
                  title="No opportunities found" 
                  description="Create your first opportunity to start receiving candidate applications." 
                  icon={<Briefcase size={40} />} 
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {mappedOpportunities.map((job) => (
                    <OpportunityCard 
                    key={job.id}
                    job={job}
                    onClick={() => router.push(`/Company/dashboard/job/${job.id}`)}
              />
                  ))}
                </div>
              )}
            </div>

            {/* APPLICANTS */}
            <div className="xl:col-span-4 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold tracking-tight">Recent Students</h2>
                <Badge variant="secondary">{uniqueApplications.length}</Badge>
              </div>
              <div className="rounded-3xl border border-border/50 bg-muted/20 p-6">
                {uniqueApplications.length === 0 ? (
                  <EmptyState 
                    title="No applicants yet" 
                    description="Once candidates apply to your job postings, they will appear here." 
                    icon={<Users size={40} />} 
                  />
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {uniqueApplications.map((app) => (
                      <ApplicantCard
                        key={app.id}
                        studentName={app.student?.name || "Unknown"}
                        studentNumber={app.student?.id?.substring(0, 6) || "N/A"}
                        imageUrl={app.student?.image}
                        onClick={() => router.push(`/Company/dashboard/applicant/${app.student.id}`)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}