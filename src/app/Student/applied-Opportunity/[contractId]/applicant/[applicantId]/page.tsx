"use client";
import {useEffect, useState } from "react";
import {useParams, useRouter } from "next/navigation";
import DashboardLayout from "@/components/Student/DashboardLayout";
import { useGlobalRankingHandler } from "@/hooks/common/useGlobalRankingHandler";
import { useTopStudentsHandler } from "@/hooks/studentapihandler/useTopStudentsHandler";
import {ArrowLeft, Calendar,DollarSign, FileText, Layers, Mail, Plus,Star, Trophy } from "lucide-react";
import { useStudentProfileReview } from "@/hooks/common/useStudentProfileReview";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { LoadingState } from "@/components/common/LoadingState";
import EmptyStateFeedback from "@/components/common/EmptyStateFeedback";
import ReviewModal from "@/components/Student/Modal/ReviewModal";
export default function ApplicantPage() {
  const truncateTextFlex = (
    text: string | null | undefined,
    maxLength: number = 24
  ) => {
    if (!text) return "N/A";
    return text.length > maxLength ? text.slice(0, maxLength) + ".." : text;
  };
  const { reviews, loading: reviewsLoading, getStudentReviews, createStudentReview } = useStudentProfileReview();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReviews, setEditingReviews] = useState<any>(null);
  const params = useParams();
  const { applicantId } = params;
  const { student: applicant, loading, error, getTopStudentById } = useTopStudentsHandler();
  const { ranking: applicantRanking, getStudentGlobalRankingByStudentId } = useGlobalRankingHandler();

  useEffect(() => {
    if (applicant?.id) {
        getStudentGlobalRankingByStudentId(applicant?.id);
    }
  }, [applicant?.id]);
  
  const isActive = applicant?.status === "active";
  const router = useRouter();
  const handleSaveReview = async (data: { rating: number; comment: string; id?: string }) => {
    try {
      if (applicantId && typeof applicantId === 'string') {
        await createStudentReview(applicantId, { rating: data.rating, comment: data.comment });
      }
      toast.success("Review added successfully 🎉");
      setIsModalOpen(false);
      setEditingReviews(null);
    } catch (error) {
      toast.error("Failed to add review. Please try again.");
    }
  };

  useEffect(() => {
    if (applicantId && typeof applicantId === 'string') {
      getTopStudentById(applicantId);
      getStudentReviews(applicantId);
    }
  }, [applicantId]);

  if (loading) {
    return (
      <DashboardLayout>
      <div className="flex h-screen items-center justify-center">
        <LoadingState label="Fetching Data..." />
      </div>
    </DashboardLayout>
    );
  }

  if (error || !applicant) {
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
          id={!applicant ? normalizedId : undefined}
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
      {/* FACEBOOK STYLE APPLICANT HEADER */}
      <div className="rounded-2xl overflow-hidden ">

        {/* COVER */}
          <div className="h-[220px] w-full rounded-2xl overflow-hidden">
            <img
              src="/default-cover.svg"
              className="w-full h-full object-cover"
            />
          </div>

        {/* CONTENT */}
        <div className="sm:px-6 px-2 pb-6 relative">

          {/* TOP ROW */}
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 -mt-8">

            {/* LEFT */}
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 w-full">

              {/* AVATAR */}
              <div className="relative bg-white h-24 w-24 rounded-full ">
                <Avatar className="h-24 w-24 ring-4 ring-background shadow-xl">
                  <AvatarImage src={applicant?.image || ""} className="object-cover" />
                  <AvatarFallback className="bg-primary/10 text-primary font-bold text-xl">
                    {applicant?.name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>

                <div
                  className={`absolute bottom-2 right-2 h-4 w-4 rounded-full border-2 border-background ${
                    isActive ? "bg-emerald-500" : "bg-slate-400"
                  }`}
                />
              </div>

              {/* NAME + INFO */}
              <div className="pb-2 space-y-1">
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-bold">{applicant?.name}</h2>

                  <Badge
                    className={`text-[10px] uppercase font-bold ${
                      isActive
                        ? "bg-emerald-500/10 text-emerald-600"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {applicant?.status || "offline"}
                  </Badge>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-3.5 w-3.5" />
                  {applicant?.email || "No contact provided"}
                </div>
              </div>
            </div>

            {/* RANK */}
            <div className="bg-primary/20 p-3 rounded-2xl text-center min-w-[120px]">
              <p className="text-[10px] uppercase font-bold tracking-tighter text-primary/60 mb-1">
                Expert Score
              </p>
              <div className="flex items-center justify-center gap-2">
                <Trophy className="w-5 h-5 text-primary" />
                <span className="text-3xl font-black text-primary">
                  {applicantRanking?.globalRank ?? "N/A"}
                </span>
              </div>
            </div>
          </div>

          {/* ================= STATS + PROGRESS ================= */}
          <div className="mt-8 flex flex-col lg:flex-row gap-6">

            {/* STATS */}
            <div className="grid grid-cols-2 md:grid-cols-2 gap-4 flex-1">
              {[
                {
                  label: "Salary Expectation",
                  value: applicant?.salaryExpectation
                    ? `$${applicant.salaryExpectation}`
                    : "N/A",
                  icon: DollarSign,
                },
                {
                  label: "Availability",
                  value: applicant?.availability || "N/A",
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
            <div className="w-full lg:w-[600px] p-4 rounded-xl border bg-muted/30 flex flex-col justify-center">
              <div className="flex justify-between mb-2">
                <span className="text-xs font-bold uppercase">
                  Profile Completion
                </span>
                <span className="text-sm font-bold text-primary">
                  {applicant?.profileComplete ?? 0}%
                </span>
              </div>

              <Progress
                value={applicant?.profileComplete ?? 0}
                className="h-2"
              />
            </div>
          </div>

          {/* DESCRIPTION */}
          <div className="mt-6">
            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-3">
              Professional Summary
            </h3>

            <p className="text-sm text-muted-foreground leading-relaxed">
              {applicant?.description || "Applicant description not found."}
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
                    {applicant?.languages?.length ? (
                      applicant.languages.map((lang: any) => (
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
                <ScrollArea className="h-full pr-3">

                  {applicant?.skills?.length ? (
                    <div className="flex flex-wrap gap-2">
                      {applicant.skills.map((skill) => (
                        <span
                          key={skill}
                          className="text-sm px-3 py-1 rounded-md border bg-muted"
                        >
                          {truncateTextFlex(skill, 15)}
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
                  {applicant?.experiences?.length ? (
                    <div className="space-y-4">
                      {applicant.experiences.map((exp: any) => (
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
                {applicant?.educations?.length ? (
                  <div className="space-y-4">
                    {applicant.educations.map((edu: any) => (
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
                {applicant?.portfolios?.length ? (
                  <div className="space-y-4">
                    {applicant.portfolios.map((port: any) => (
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
                              <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
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
                                    ? "fill-primary text-primary"
                                    : "fill-muted-foreground text-muted-foreground"
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
