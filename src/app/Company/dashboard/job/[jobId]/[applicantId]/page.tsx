"use client";
import { useState, useEffect, useMemo} from "react";
import { useRouter, useParams } from "next/navigation";
import DashboardLayout from "@/components/Company/DashboardLayout";
import { useCompanyApplicationHandler } from "@/hooks/companyapihandler/useCompanyApplicationHandler";
import {Activity, ArrowLeft, Calendar, DollarSign, FileText, Layers, Mail, Plus, Star, Trophy } from "lucide-react";

import { useStudentProfileReview } from "@/hooks/common/useStudentProfileReview";
import EmptyStateFeedback from "@/components/common/EmptyStateFeedback";
import { LoadingState } from "@/components/common/LoadingState";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import ReviewModal from "@/components/Company/Modal/ReviewModal";
import { motion } from "framer-motion";

export default function ApplicantPage() {

  const { reviews, loading: reviewsLoading, getStudentReviews, createStudentReview } = useStudentProfileReview();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReviews, setEditingReviews] = useState<any>(null);

  const handleSaveReview = async (data: { rating: number; comment: string; id?: string }) => {
    try {
      if (applicantId && typeof applicantId === "string") {
        await createStudentReview(applicantId, {
          rating: data.rating,
          comment: data.comment,
        });
      }

      toast.success("Review added successfully 🎉");

      setIsModalOpen(false);
      setEditingReviews(null);
    } catch (error) {
      toast.error("Failed to add review. Please try again.");
    }
  };

  const truncateTextFlex = (
    text: string | null | undefined,
    maxLength: number = 24
  ) => {
    if (!text) return "N/A";
    return text.length > maxLength ? text.slice(0, maxLength) + ".." : text;
  };
  const router = useRouter();
  const params = useParams();
  const { applicantId } = params;
  const {
    student,
    loading,
    error,
    getStudentProfileById,
  } = useCompanyApplicationHandler();

    const mappedStudent = useMemo(() => {
    if (!student) return null;

    return {
      id: student.id,
      name: student.name ?? "Unknown",
      description: student.description ?? "No description available",
      status: student.status ?? "pending",
      availability: student.availability ?? "N/A",
      profileRanking: student.profileRanking ?? 0,
      profileComplete: student.profileComplete ?? 0,

      email: (student as any)?.email ?? "—",

      image: (student as any)?.image ?? "/images/default-avatar.png",
      salaryExpectation: (student as any)?.salaryExpectation ?? null,
      skills: student.skills ?? [],
      experiences: student.experiences ?? [],
      educations: student.educations ?? [],
      languages: student.languages ?? [],
      portfolios: student.portfolios ?? [],
    };
  }, [student]);

  const s = mappedStudent;
  const isActive = s?.status === "active";

  useEffect(() => {
    const fetchData = async () => {
      try {
        await getStudentProfileById(applicantId as string);
        await getStudentReviews(applicantId as string);
      } catch (error) {
        console.error("Error fetching student profile:", error);
        toast.error("Error fetching student profile:");
      }
    };
    if (applicantId) {
      fetchData();
    }
  }, [getStudentProfileById, applicantId]);


  if (loading) {
    return (
      <DashboardLayout>
      <div className="flex h-screen items-center justify-center">
        <LoadingState label="Fetching Data..." />
      </div>
    </DashboardLayout>
    );
  }

if (error || !student) {
  const normalizedId = Array.isArray(applicantId)
    ? applicantId[0]
    : applicantId;

  return (
    <DashboardLayout>
      <div className="flex min-h-[calc(100vh-80px)] items-center justify-center px-4">
      <EmptyStateFeedback
        type={error ? "error" : "notfound"}
        title={
          error
            ? "Error loading applicant profile"
            : "Applicant Not Found"
        }
        description={
          error
            ? "Something went wrong. Please try again."
            : "No applicant found with this ID."
        }
        id={!student ? normalizedId : undefined}
      />
      </div>
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
        className="mb-4 gap-2"
        onClick={() => router.back()}
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </Button>  
    {/* FACEBOOK STYLE PROFILE HEADER */}
      <div className="rounded-2xl overflow-hidden ">

        {/* COVER IMAGE */}
          <div className="h-[220px] w-full rounded-2xl overflow-hidden">
            <img
              src="/default-cover.svg"
              className="w-full h-full object-cover"
            />
          </div>

        {/* PROFILE ROW (avatar overlaps cover like Facebook) */}
        <div className="px-6 pb-6 relative">
          
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 -mt-8">

            {/* LEFT SIDE */}
            <div className="flex items-end gap-4 ">

              {/* AVATAR */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="relative w-30 h-30 cursor-pointer"
              >
                {/* Avatar circle */}
                <div className="relative w-full h-full rounded-full border-2 border-background bg-white shadow-md overflow-hidden flex items-center justify-center group">
                  <Avatar className="w-full h-full">
                    <AvatarImage src={s?.image || ""} className="object-cover w-full h-full" />
                    <AvatarFallback className="bg-primary/10 text-primary font-bold text-xl w-full h-full flex items-center justify-center">
                      {s?.name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>

                  {/* HOVER OVERLAY */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    {s?.name}
                  </div>
                </div>

                {/* STATUS DOT (OUTSIDE CLIP → FIXED) */}
                <div
                  className={`absolute bottom-1.5 right-3 z-20 h-4 w-4 rounded-full border-2 border-background ${
                    isActive ? "bg-emerald-500" : "bg-slate-400"
                  }`}
                />
              </motion.div>

              {/* NAME + INFO */}
              <div className="pb-2 space-y-1 ">
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-bold">{s?.name}</h2>

                  <Badge
                    className={`text-[10px] uppercase font-bold ${
                      isActive
                        ? "bg-emerald-500/10 text-emerald-600"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {s?.status || "offline"}
                  </Badge>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-3.5 w-3.5" />
                  {s?.email || "No contact provided"}
                </div>
              </div>
            </div>

              {/* Ranking Widget */}
              <div className="bg-primary/20 p-2 rounded-2xl text-center min-w-[120px]">
                <p className="text-[10px] uppercase font-bold tracking-tighter text-primary/60 mb-1">Expert Score</p>
                <div className="flex items-center justify-center gap-2">
                    <Trophy className="w-5 h-5 text-primary" />
                    <span className="text-3xl font-black text-primary">{s?.profileRanking}</span>
                </div>
              </div>
          </div>

          {/* ================= STATS + PROGRESS ROW ================= */}
          <div className="mt-8 flex flex-col lg:flex-row gap-6">

            {/* STATS */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1">

              {[
                { label: "Contracts", value: "N/A", icon: FileText },
                { label: "Applications", value: "N/A", icon: Layers },
                {
                  label: "Salary Expectation",
                  value: s?.salaryExpectation ? `$${s.salaryExpectation}` : "N/A",
                  icon: DollarSign,
                },
                {
                  label: "Availability",
                  value: s?.availability || "N/A",
                  icon: Calendar,
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="p-4 rounded-xl border bg-muted/30 hover:bg-muted/50 transition"
                >
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <stat.icon className="h-3.5 w-3.5" />
                    <span className="text-[11px] font-bold uppercase">
                      {stat.label}
                    </span>
                  </div>

                  <p className="mt-1 text-sm font-semibold">{stat.value}</p>
                </div>
              ))}
            </div>

            {/* PROGRESS */}
            <div className="w-full lg:w-[280px] p-4 rounded-xl border bg-muted/30 flex flex-col justify-center">

              <div className="flex justify-between mb-2">
                <span className="text-xs font-bold uppercase">
                  Profile Completion
                </span>
                <span className="text-sm font-bold text-primary">
                  {s?.profileComplete ?? 0}%
                </span>
              </div>

              <Progress value={s?.profileComplete ?? 0} className="h-2" />
            </div>

          </div>

          {/* ================= DESCRIPTION ================= */}
          <div className="mt-6">
            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-3">Professional Summary</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {s?.description || "Applicant description not found."}
            </p>
          </div>
        </div>
      </div>

       {/* grid system */}
      <div className="flex flex-col items-center justify-center mt-10 gap-10">
        {/* Row 1 */}
        <div className=" grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
            {/* Language Card */}
            <Card className="rounded-2xl w-full sm:max-w-[655px] sm:min-w-[580px] shadow-sm border  flex flex-col max-h-[200px]">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">
                  Languages
                </CardTitle>
                <CardDescription>
                  Languages the applicant can communicate in
                </CardDescription>
              </CardHeader>

              <CardContent className="flex-1 overflow-hidden">
                <ScrollArea className="h-full pr-3">
                  <div className="flex flex-wrap gap-2">
                    {student?.languages?.length ? (
                      student.languages.map((lang: any) => (
                        <Badge key={lang.id} variant="secondary">
                          {truncateTextFlex(lang.name, 20)}
                          <span className="ml-2 text-xs text-muted-foreground">
                            {lang.level}
                          </span>
                        </Badge>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No languages available
                      </p>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* SKILLS */}
            <Card className="w-full max-w-[655px] shadow-sm rounded-2xl flex flex-col max-h-[200px]">

              <CardHeader>
                <CardTitle className="text-lg font-semibold">Skills</CardTitle>
                <CardDescription>
                  Technical and professional competencies
                </CardDescription>
              </CardHeader>

              <CardContent className="flex-1 overflow-hidden">
                {student?.skills?.length ? (
                  <ScrollArea className="h-full pr-2">
                    <div className="flex flex-wrap gap-2">
                      {student.skills.map((skillItem: any) => {
                        const name =
                          skillItem.skill?.name || skillItem.name || "Unknown";

                        return (
                          <Badge
                            key={skillItem.skill?.id || skillItem.skillId}
                            variant="secondary"
                            className="px-3 py-1 text-xs rounded-full"
                          >
                            {truncateTextFlex(name, 18)}
                          </Badge>
                        );
                      })}
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
                    No skills added yet
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

        {/* Row 2 */}
        <div className=" grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">

          {/* Experience Card */}
          <Card className="rounded-2xl w-full sm:max-w-[655px] sm:min-w-[580px] shadow-sm border  flex flex-col max-h-[300px]">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Experience</CardTitle>
                <CardDescription>
                  Professional work history and previous roles
                </CardDescription>
              </CardHeader>

              <CardContent className="flex-1 overflow-hidden">
                <ScrollArea className="h-full pr-3">
                  {student?.experiences?.length ? (
                    <div className="space-y-4">
                      {student.experiences.map((exp: any) => (
                        <div
                          key={exp.id}
                          className="p-3 rounded-xl border bg-muted/30 w-full"
                        >
                          {/* Role */}
                          <div className="flex items-start gap-2 min-w-0">
                            <div className="w-2 h-2 mt-1 rotate-45 bg-primary shrink-0" />

                            <p className="text-sm font-semibold break-words whitespace-normal">
                              {truncateTextFlex(exp.role, 30)}
                            </p>
                          </div>

                          {/* Company + Date */}
                          <p className="text-xs text-muted-foreground mt-1 break-words whitespace-normal">
                            {truncateTextFlex(exp.companyName, 30)} •{" "}
                            {exp.startDate} - {exp.endDate}
                          </p>

                          {/* Description */}
                          <p className="text-xs text-muted-foreground mt-2 break-words whitespace-normal">
                            {truncateTextFlex(exp.description, 80)}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No experience info available
                    </p>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>


          {/* Education */}
          <Card className="rounded-2xl w-full sm:max-w-[655px] sm:min-w-[580px] shadow-sm border  flex flex-col max-h-[300px]">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Education</CardTitle>
              <CardDescription>
                Academic background, degrees, and institutions attended
              </CardDescription>
            </CardHeader>

            <CardContent className="flex-1 overflow-hidden">
              <ScrollArea className="h-full pr-3">
                {student?.educations?.length ? (
                  <div className="space-y-4">
                    {student.educations.map((edu: any) => (
                      <div
                        key={edu.id}
                        className="p-3 rounded-xl border bg-muted/30 w-full"
                      >
                        {/* Major */}
                        <div className="flex items-start gap-2 min-w-0">
                          <div className="w-2 h-2 mt-1 rotate-45 bg-primary shrink-0" />

                          <p className="text-sm font-semibold break-words whitespace-normal">
                            {truncateTextFlex(edu.major, 30)}
                          </p>
                        </div>

                        {/* School + Date */}
                        <p className="text-xs text-muted-foreground mt-1 break-words whitespace-normal">
                          {truncateTextFlex(edu.name, 30)} • {edu.startDate} - {edu.endDate}
                        </p>

                        {/* Description */}
                        <p className="text-xs text-muted-foreground mt-2 break-words whitespace-normal">
                          {truncateTextFlex(edu.description, 80)}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No education info available
                  </p>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
          
        </div>

        {/* Row 3 */}
        <div className=" grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
          {/* Portfolio Card */}
          <Card className="rounded-2xl w-full sm:max-w-[655px] sm:min-w-[580px] shadow-sm border  flex flex-col max-h-[300px]">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Portfolio</CardTitle>

              <CardDescription>
                Projects, work samples, and links showcasing your experience
              </CardDescription>
            </CardHeader>

            <CardContent className="flex-1 overflow-hidden">
              <ScrollArea className="h-full pr-3">
                {student?.portfolios?.length ? (
                  <div className="space-y-4">
                    {student.portfolios.map((port: any) => (
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

              {/* ───────────────────── REVIEWS ───────────────────── */}
          <Card className="rounded-2xl sm:max-w-[655px] sm:min-w-[580px] shadow-sm border  max-h-[300px] flex flex-col">

            {/* HEADER */}
            <CardHeader className="flex flex-row items-center justify-between">

              {/* LEFT SIDE */}
              <div className="flex flex-col">
                <CardTitle className="text-lg font-semibold">
                  Reviews
                </CardTitle>

                <CardDescription>
                  Feedback and evaluations from clients or peers
                </CardDescription>
              </div>

              {/* RIGHT SIDE */}
              <Button
                size="sm"
                onClick={() => {
                  setEditingReviews(null);
                  setIsModalOpen(true);
                }}
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                Add
              </Button>

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
        </div>
      </div>

       </div>

    <ReviewModal
      review={editingReviews}
      isOpen={isModalOpen}
      onClose={() => {
        setIsModalOpen(false);
        setEditingReviews(null);
      }}
      onSave={handleSaveReview}
    />

    </DashboardLayout>
  );
}