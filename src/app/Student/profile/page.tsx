// src/app/Student/profile/page.tsx
"use client";
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/Student/DashboardLayout";
import { useStudentProfileHandler } from "@/hooks/studentapihandler/useStudentProfileHandler";
import { useGlobalRankingHandler } from "@/hooks/common/useGlobalRankingHandler";
import {Calendar,Clock, DollarSign, Ellipsis,Mail,Plus,Settings, Star, Trash2, Trophy} from "lucide-react";
import { useStudentProfileReview } from "@/hooks/common/useStudentProfileReview";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { LoadingState } from "@/components/common/LoadingState";
import ProfileModal from "@/components/Student/Modal/ProfileModal";
import ExperienceModal from "@/components/Student/Modal/ExperienceModal";
import EducationModal from "@/components/Student/Modal/EducationModal";
import LanguageModal from "@/components/Student/Modal/LanguageModal";
import PortfolioModal from "@/components/Student/Modal/PortfolioModal";
import SkillsModal from "@/components/Student/Modal/SkillsModal";
import { ProfileSkeleton } from "@/components/Student/Skeleton/ProfileSkeleton";

export default function ApplicantPage() {

  const {
    profile,
    profileLoading,
    profileError,
    getProfile,
    createProfile,
    updateProfile,
    skills,
    skillsLoading,
    getSkills,
    addSkills,
    removeSkill,
    experiences,
    experienceLoading,
    getExperiences,
    createExperience,
    updateExperience,
    deleteExperience,
    educations,
    educationLoading,
    getEducations,
    createEducation,
    updateEducation,
    deleteEducation,
    languages,
    languageLoading,
    getLanguages,
    createLanguage,
    updateLanguage,
    deleteLanguage,
    portfolios,
    portfolioLoading,
    getPortfolios,
    createPortfolio,
    updatePortfolio,
    deletePortfolio,
  } = useStudentProfileHandler();

  const { reviews, loading: reviewsLoading, getStudentReviews } = useStudentProfileReview();
  const { ranking: studentRanking, getStudentGlobalRankingByStudentId } = useGlobalRankingHandler();

  const [isModalOpen1, setIsModalOpen1] = useState(false);
  const [editingProfile, setEditingProfile] = useState<any>(null);

  const [isModalOpen2, setIsModalOpen2] = useState(false);
  const [editingExperience, setEditingExperience] = useState<any>(null);

  const [isModalOpen3, setIsModalOpen3] = useState(false);
  const [editingEducation, setEditingEducation] = useState<any>(null);

  const [isModalOpen4, setIsModalOpen4] = useState(false);
  const [editingLanguage, setEditingLanguage] = useState<any>(null);

  const [isModalOpen5, setIsModalOpen5] = useState(false);
  const [editingPortfolio, setEditingPortfolio] = useState<any>(null);

  const [isModalOpen6, setIsModalOpen6] = useState(false);
  const [editingSkills, setEditingSkills] = useState<any>(null);

  const isActive = profile?.status === "active";
  const truncateTextFlex = (text: string | undefined, maxLength: number = 24) => {
    if (!text) return "N/A";
    return text.length > maxLength ? text.slice(0, maxLength) + ".." : text;
  };
  const formatDate = (date?: string) =>
  date
    ? new Date(date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "—";
  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        let profileData: any = null;
        try {
          profileData = await getProfile();
        } catch (error: any) {
          if (error.message.includes('not found') || error.message.includes('404')) {
            await createProfile({
              name: "New Student",
              description: "",
              availability: undefined,
              profileComplete: 0
            });
            profileData = await getProfile();
          }
        }

        await Promise.all([
          getSkills(),
          getExperiences(),
          getEducations(),
          getLanguages(),
          getPortfolios()
        ]);

        if (profileData?.id) {
          getStudentReviews(profileData.id);
          getStudentGlobalRankingByStudentId(profileData.id).catch(() => null);
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
      }
    };

    fetchData();
  }, []);

  

  // Loading state
  if (profileLoading && !profile) {
    return (
      <DashboardLayout>
        <ProfileSkeleton />
    </DashboardLayout>
    );
  }


  return (
    <DashboardLayout>
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      <div className="space-y-3">

        {/* ================= COVER ================= */}
        <div className="h-[220px] w-full rounded-2xl overflow-hidden">
          <img
            src="/default-cover.svg"
            className="w-full h-full object-cover"
          />
        </div>

          {/* ================= CONTENT ================= */}
          <div className="sm:px-6 px-2 pb-6 relative">

            {/* PROFILE ROW */}
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 -mt-10">
              {/* LEFT */}
              <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 w-full">

                {/* AVATAR */}
                <div className="relative bg-white  w-24 h-24 rounded-full">
                  <Avatar className="h-24 w-24 ring-4 ring-background shadow-xl">
                    <AvatarImage src={profile?.image || ""} />
                    <AvatarFallback className="bg-primary/10 text-primary font-bold text-xl">
                      {profile?.name?.charAt(0) || "U"}
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

                  <div className="flex items-center gap-3 flex-wrap">
                    <h2 className="text-2xl font-bold">{profile?.name}</h2>

                    <Badge
                      className={`text-[10px] uppercase font-bold ${
                        isActive
                          ? "bg-emerald-500/10 text-emerald-600"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {profile?.status || "offline"}
                    </Badge>

                    {/* SETTINGS BUTTON */}
                    <Button
                      size="icon"
                      onClick={() => {
                        setEditingProfile(profile);
                        setIsModalOpen1(true);
                      }}
                      className="h-7 w-7"
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-3.5 w-3.5" />
                    {profile?.email || "No contact provided"}
                  </div>
                </div>
              </div>

              {/* RIGHT: RANK */}
              <div className="bg-primary/10 p-3 rounded-2xl text-center min-w-[120px]">
                <p className="text-[10px] uppercase font-bold tracking-tighter text-primary/60 mb-1">
                  Expert Score
                </p>
                <div className="flex items-center justify-center gap-2">
                  <Trophy className="w-5 h-5 text-primary" />
                  <span className="text-3xl font-black text-primary">
                    {studentRanking?.globalRank ?? "N/A"}
                  </span>
                </div>
              </div>
            </div>

            {/* ================= STATS + PROGRESS ================= */}
            <div className="mt-8 flex flex-col lg:flex-row gap-6">

              {/* STATS */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1">
                {[
                  { label: "Member Since", value: formatDate(profile?.createdAt), icon: Calendar },
                  { label: "Last Update", value: formatDate(profile?.updatedAt), icon: Clock },
                  {
                    label: "Salary Expectation",
                    value: profile?.salaryExpectation ? `$${profile.salaryExpectation}` : "—",
                    icon: DollarSign,
                  },
                  {
                    label: "Availability",
                    value: profile?.availability || "—",
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
                    {profile?.profileComplete ?? 0}%
                  </span>
                </div>

                <Progress value={profile?.profileComplete ?? 0} className="h-2" />
              </div>
            </div>

            {/* ================= DESCRIPTION ================= */}
            <div className="mt-6">
              <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-2">
                Professional Summary
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {profile?.description || "Applicant description not found."}
              </p>
            </div>

          </div>
      </div>
       {/* grid system */}
      <div className="flex flex-col items-center justify-center mt-10 gap-10">
        {/* Row 1 */}
        <div className=" grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
          {/* Language Card */}
          <Card className="rounded-2xl w-full sm:max-w-[655px] sm:min-w-[580px] shadow-sm border flex flex-col max-h-[200px]">

            {/* HEADER */}
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="flex flex-col">
                <CardTitle className="text-lg font-semibold">
                  Languages
                </CardTitle>
                <CardDescription>
                  Languages the applicant can communicate in
                </CardDescription>
                </div>

              <Button
                size="sm"
                onClick={() => {
                  setEditingLanguage(null);
                  setIsModalOpen4(true);
                }}
              >
                Add
              </Button>
            </CardHeader>

            {/* CONTENT */}
            <CardContent className="flex-1 overflow-hidden">
              <ScrollArea className="h-full pr-3">

                {languageLoading ? (
                  <p className="text-sm text-muted-foreground py-4">
                    Loading languages...
                  </p>

                ) : languages?.length ? (
                  <div className="flex flex-wrap gap-2">

                    {languages.map((lang: any) => (
                      <div
                        key={lang.id}
                        className="flex items-center gap-1 bg-muted rounded-full px-3 py-1 text-xs"
                      >

                        {/* TEXT */}
                        <span className="font-medium">
                          {truncateTextFlex(lang.name, 20)}
                        </span>

                        <span className="text-muted-foreground">
                          ({lang.level})
                        </span>

                        {/* EDIT BUTTON */}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="icon" variant="ghost" className="h-6 w-6">
                                <Ellipsis className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent align="end" className="w-32">
                              
                              {/* EDIT */}
                              <DropdownMenuItem
                                onClick={() => {
                                  setEditingLanguage(lang);
                                  setIsModalOpen4(true);
                                }}
                              >
                                Edit
                              </DropdownMenuItem>

                              {/* DELETE */}
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => deleteLanguage(lang.id)}
                              >
                                Delete
                              </DropdownMenuItem>

                            </DropdownMenuContent>
                          </DropdownMenu>

                      </div>
                    ))}

                  </div>

                ) : (
                  <p className="text-sm text-muted-foreground py-4">
                    Add languages to showcase your communication skills.
                  </p>
                )}

              </ScrollArea>
            </CardContent>
          </Card>

          {/* Skills Card */}
         <Card className="rounded-2xl w-full sm:max-w-[655px] sm:min-w-[580px] shadow-sm border flex flex-col max-h-[200px]">
            <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex flex-col">
                <CardTitle className="text-lg font-semibold">Skills</CardTitle>
                <CardDescription>
                  Technical and professional competencies
                </CardDescription>
                </div>

              <Button
                size="sm"
                onClick={() => {
                  setEditingSkills(null);
                  setIsModalOpen6(true);
                }}
              >
                Add
              </Button>
            </CardHeader>

            <CardContent className="flex-1 overflow-hidden">
              <ScrollArea className="h-full pr-3 ">
                
                {skillsLoading ? (
                  <p className="text-sm text-muted-foreground">Loading skills...</p>

                ) : skills?.length ? (
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill) => (
                      <div
                        key={skill.id}
                        className="flex items-center gap-2 px-3 py-1 rounded-md border bg-muted"
                      >
                        <span className="text-sm">
                          {truncateTextFlex(skill.name, 15)}
                        </span>

                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeSkill(skill.id)}
                          className="h-7 px-2 text-xs shrink-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
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

            {/* HEADER */}
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="flex flex-col">
                <CardTitle className="text-lg font-semibold">Experience</CardTitle>

                <CardDescription>
                  Professional work history and previous roles
                </CardDescription>
                </div>
              

              <Button
                size="sm"
                onClick={() => {
                  setEditingExperience(null);
                  setIsModalOpen2(true);
                }}
              >
                Add
              </Button>
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

                    {experiences.map((exp: any) => (
                      <div
                        key={exp.id}
                        className="p-3 rounded-xl border bg-muted/30 w-full"
                      >

                        {/* TOP ROW */}
                        <div className="flex items-center justify-between gap-2">

                          {/* LEFT */}
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-2 h-2 rotate-45 bg-primary shrink-0" />

                            <p className="text-sm font-semibold truncate">
                              {truncateTextFlex(exp.role, 25)}
                            </p>
                          </div>

                          {/* EDIT BUTTON */}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="icon" variant="ghost" className="h-7 w-7">
                                <Ellipsis className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent align="end" className="w-32">

                              {/* EDIT */}
                              <DropdownMenuItem
                                onClick={() => {
                                  setEditingExperience(exp);
                                  setIsModalOpen2(true);
                                }}
                              >
                                Edit
                              </DropdownMenuItem>

                              {/* DELETE */}
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => deleteExperience(exp.id)}
                              >
                                Delete
                              </DropdownMenuItem>

                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        {/* COMPANY + DATE */}
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1 flex-wrap">
                          <span>{truncateTextFlex(exp.companyName, 25)}</span>

                          <span className="w-1 h-1 bg-muted-foreground rotate-45 inline-block" />

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
                    Add your work experience to showcase your background.
                  </p>
                )}

              </ScrollArea>
            </CardContent>
          </Card>

          {/* education */}
          <Card className="rounded-2xl w-full sm:max-w-[655px] sm:min-w-[580px] shadow-sm border  flex flex-col max-h-[300px]">
              {/* HEADER */}
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                {/* LEFT SIDE */}
                <div className="flex flex-col">
                <CardTitle className="text-lg font-semibold">Education</CardTitle>

                <CardDescription>
                  Academic background, degrees, and institutions attended
                </CardDescription>
                </div>
                
                  <Button
                    size="sm"
                    onClick={() => {
                      setEditingEducation(null);
                      setIsModalOpen3(true);
                    }}
                    className="gap-2"
                  >
                    Add
                  </Button>
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

                      {educations.map((edu: any) => (
                        <div
                          key={edu.id}
                          className="p-3 rounded-xl border bg-muted/30 w-full"
                        >

                          {/* TOP ROW */}
                          <div className="flex items-center justify-between">

                            {/* LEFT */}
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="w-2 h-2 rotate-45 bg-primary shrink-0" />

                              <p className="text-sm font-semibold truncate">
                                {truncateTextFlex(edu.major, 25)}
                              </p>
                            </div>

                            {/* EDIT BUTTON */}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button size="icon" variant="ghost" className="h-7 w-7">
                                  <Ellipsis className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>

                              <DropdownMenuContent align="end" className="w-32">

                                {/* EDIT */}
                                <DropdownMenuItem
                                  onClick={() => {
                                    setEditingEducation(edu);
                                    setIsModalOpen3(true);
                                  }}
                                >
                                  Edit
                                </DropdownMenuItem>

                                {/* DELETE */}
                                <DropdownMenuItem
                                  className="text-destructive focus:text-destructive"
                                  onClick={() => deleteEducation(edu.id)}
                                >
                                  Delete
                                </DropdownMenuItem>

                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>

                          {/* SCHOOL + DATE */}
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1 flex-wrap">
                            <span>{truncateTextFlex(edu.name, 25)}</span>

                            <span className="w-1 h-1 bg-muted-foreground rotate-45 inline-block" />

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
                      Complete this field — add your education history.
                    </p>
                  )}

                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Row 3 */}
          <div className=" grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
            {/* portfolio */}
            <Card className="rounded-2xl w-full sm:max-w-[655px] sm:min-w-[580px] shadow-sm border  flex flex-col max-h-[300px]">
              
              {/* Header */}
              <CardHeader className="pb-2 flex flex-row items-center justify-between">

                {/* LEFT SIDE */}
                <div className="flex flex-col">
                <CardTitle className="text-lg font-semibold">Portfolio</CardTitle>

                <CardDescription>
                  Projects, work samples, and links showcasing your experience
                </CardDescription>
                </div>
                  <Button
                    size="sm"
                    onClick={() => {
                      setEditingPortfolio(null);
                      setIsModalOpen5(true);
                    }}
                    className="gap-2"
                  >
                    Add
                  </Button>
              </CardHeader>

              {/* Content */}
              <CardContent className="flex-1 overflow-hidden">
                <ScrollArea className="h-full pr-3">
                  
                  {portfolioLoading ? (
                    <p className="text-sm text-muted-foreground py-4">
                      Loading portfolio...
                    </p>

                  ) : portfolios?.length ? (
                    <div className="space-y-3">
                      {portfolios.map((port: any) => (
                        <div
                          key={port.id}
                          className="p-3 rounded-xl border bg-muted/30 w-full"
                        >
                          {/* TOP ROW */}
                        <div className="flex items-center justify-between gap-2">

                          {/* LEFT */}
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-2 h-2 rotate-45 bg-primary shrink-0" />

                            <p className="text-sm font-medium truncate">
                              {truncateTextFlex(port.name, 25)}
                            </p>
                          </div>
                          {/* EDIT BUTTON */}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="icon" variant="ghost" className="h-7 w-7">
                                <Ellipsis className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent align="end" className="w-32">

                              {/* EDIT */}
                              <DropdownMenuItem
                                onClick={() => {
                                  setEditingPortfolio(port);
                                  setIsModalOpen5(true);
                                }}
                              >
                                Edit
                              </DropdownMenuItem>

                              {/* DELETE */}
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => deletePortfolio(port.id)}
                              >
                                Delete
                              </DropdownMenuItem>

                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                          {/* Link */}
                          {port.link ? (
                            <a
                              href={
                                port.link.startsWith("http")
                                  ? port.link
                                  : `https://${port.link}`
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block text-xs text-primary hover:underline mt-1 break-all"
                            >
                              {truncateTextFlex(port.link, 50)}
                            </a>
                          ) : (
                            <p className="text-xs text-muted-foreground mt-1">
                              N/A
                            </p>
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

            {/*REVIEWS card*/}
            <Card className="rounded-2xl w-full sm:max-w-[655px] sm:min-w-[580px] shadow-sm border  flex flex-col max-h-[300px]">

              {/* HEADER */}
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Reviews</CardTitle>
                <CardDescription>
                  Feedback and evaluations from clients or peers
                </CardDescription>
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
                          className="bg-muted/30 border rounded-xl p-4 w-full"
                        >

                          {/* TOP ROW */}
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">

                            {/* LEFT */}
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

                                {/* Mobile Stars */}
                                <div className="flex gap-1 sm:hidden">
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

                                <p className="text-xs text-muted-foreground">
                                  {review.dateReviewed}
                                </p>
                              </div>
                            </div>

                            {/* Desktop Stars */}
                            <div className="hidden sm:flex gap-1 shrink-0">
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
                          <p className="text-sm text-muted-foreground mt-2 break-words">
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
    <ProfileModal
      isOpen={isModalOpen1}
      profile={editingProfile}
      onClose={() => setIsModalOpen1(false)}
      onSave={async (data) => {
        await updateProfile({
          name: data.name,
          email: data.email,
          description: data.description,
          availability: data.availability || undefined,
          salaryExpectation: data.salaryExpectation ? parseFloat(data.salaryExpectation) : undefined,
          image: data.image || undefined
        });
        await getProfile();
      }}
    />
    <ExperienceModal
      isOpen={isModalOpen2}
      experience={editingExperience}
      onClose={() => {
        setEditingExperience(null);
        setIsModalOpen2(false);
      }}
      onSave={async (data) => {
        if (editingExperience?.id) {
          await updateExperience(editingExperience.id, {
            role: data.role,
            companyName: data.companyName,
            startDate: data.startDate,
            endDate: data.endDate,
            description: data.description
          });
        } else {
          await createExperience({
            role: data.role,
            companyName: data.companyName,
            startDate: data.startDate,
            endDate: data.endDate,
            description: data.description
          });
        }
        await getExperiences();
        await getProfile();
        setEditingExperience(null);
      }}
    />
    <EducationModal
      isOpen={isModalOpen3}
      education={editingEducation}
      onClose={() => {
        setEditingEducation(null);
        setIsModalOpen3(false);
      }}
      onSave={async (data) => {
        if (editingEducation?.id) {
          await updateEducation(editingEducation.id, {
            name: data.name,
            major: data.major,
            startDate: data.startDate,
            endDate: data.endDate,
            description: data.description
          });
        } else {
          await createEducation({
            name: data.name,
            major: data.major,
            startDate: data.startDate,
            endDate: data.endDate,
            description: data.description
          });
        }
        await getEducations();
        await getProfile();
        setEditingEducation(null);
      }}
    />
    <LanguageModal
      isOpen={isModalOpen4}
      language={editingLanguage}
      onClose={() => {
        setEditingLanguage(null);
        setIsModalOpen4(false);
      }}
      onSave={async (data) => {
        if (editingLanguage?.id) {
          await updateLanguage(editingLanguage.id, {
            name: data.name,
            level: data.level
          });
        } else {
          await createLanguage({
            name: data.name,
            level: data.level
          });
        }
        await getLanguages();
        await getProfile();
        setEditingLanguage(null);
      }}
    />
    <PortfolioModal
      isOpen={isModalOpen5}
      portfolio={editingPortfolio}
      onClose={() => {
        setEditingPortfolio(null);
        setIsModalOpen5(false);
      }}
      onSave={async (data) => {
        if (editingPortfolio?.id) {
          await updatePortfolio(editingPortfolio.id, {
            name: data.name,
            link: data.link
          });
        } else {
          await createPortfolio({
            name: data.name,
            link: data.link
          });
        }
        await getPortfolios();
        await getProfile();
        setEditingPortfolio(null);
      }}
    />
    <SkillsModal
      isOpen={isModalOpen6}
      skills={editingSkills}
      onClose={() => {
        setEditingSkills(null);
        setIsModalOpen6(false);
      }}
      onSave={async (data) => {
        if (Array.isArray(data.skills)) {
          await addSkills(data.skills);
        }
        await getSkills();
        await getProfile();
        setEditingSkills(null);
      }}
    />
    </DashboardLayout>
  );
}
