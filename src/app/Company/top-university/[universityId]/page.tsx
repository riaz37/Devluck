"use client";

import DashboardLayout from "@/components/Company/DashboardLayout";
import { useRouter, useParams } from "next/navigation";
import { useEffect} from "react";
import { useUniversityHandler } from "@/hooks/companyapihandler/useUniversityHandler";
import {ArrowLeft, Fingerprint, Mail, MapPin, Phone} from "lucide-react";
import { LoadingState } from "@/components/common/LoadingState";
import EmptyStateFeedback from "@/components/common/EmptyStateFeedback";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";


export default function TopUniversityPage() {
    const router = useRouter();
    const params = useParams(); 
    const { universityId } = params;
    const { university, loading, error, getUniversityById } = useUniversityHandler();

    useEffect(() => {
      if (universityId && typeof universityId === 'string') {
        getUniversityById(universityId).catch((err) => {
          console.error('Failed to load university details:', err);
          toast.error("Failed to load university details.");
        });
      }
    }, [universityId, getUniversityById]);
const studentData = [
  { name: "UG", value: university?.ugStudents ?? 0 },
  { name: "PG", value: university?.pgStudents ?? 0 },
];

const COLORS = ["#3b82f6", "#a855f7"];

    if (loading) {
      return (
        <DashboardLayout>
            <div className="flex h-screen items-center justify-center">
                <LoadingState label="Fetching Data..." />
            </div>
        </DashboardLayout>
      );
    }

    if (error || !university) {
        const normalizedId = Array.isArray(universityId)
            ? universityId[0]
            : universityId;

        return (
            <DashboardLayout>
            <EmptyStateFeedback
                type={error ? "error" : "notfound"}
                title={
                error
                    ? "Something went wrong"
                    : "University Not Found"
                }
                description={
                error
                    ? "Please try again later."
                    : "No university found with this ID."
                }
                id={!university ? normalizedId : undefined}
            />
            </DashboardLayout>
        );
        }
  return (
      <DashboardLayout>
          <div className="w-full max-w-6xl mx-auto space-y-6 p-4">
  
          {/* BACK BUTTON */}
          <Button
              variant="outline"
              size="sm"
              onClick={() => router.back()}
              className="gap-2 cursor-pointer"
          >
              <ArrowLeft className="w-4 h-4" />
              Back
          </Button>

            <div className="space-y-3">
                {/* ================= COVER ================= */}
                <div className="relative">
                {/* COVER IMAGE */}
                <div className="h-[220px] w-full rounded-2xl overflow-hidden">
                    <img
                    src="/default-cover.svg"
                    className="w-full h-full object-cover"
                    />
                </div>
                {/* ================= AVATAR ================= */}
                <div className="absolute -bottom-12 left-6">
                    <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="relative w-30 h-30 rounded-full border-2 border-background bg-white shadow-md overflow-hidden cursor-pointer group flex items-center justify-center"
                    >
                    <Avatar className="w-full h-full">
                        <AvatarImage
                        src={university.image || ""}
                        className="object-cover w-full h-full"
                        />

                        <AvatarFallback className="bg-primary/10 text-primary font-bold text-xl w-full h-full flex items-center justify-center">
                        {university.name?.charAt(0) || "U"}
                        </AvatarFallback>
                    </Avatar>

                    {/* HOVER OVERLAY */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                        {university.name}
                    </div>
                    </motion.div>
                </div>
                </div>
                {/* ================= PROFILE INFO ================= */}
                <div className="pt-14 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
                {/* LEFT SIDE */}
                <div className="space-y-2 w-full">
                    {/* NAME + STATUS + RANK */}
                        <div className="flex items-start justify-between flex-wrap gap-3">

                        {/* ================= LEFT ================= */}
                        <div className="flex items-center gap-3 flex-wrap">
                            <h1 className="text-3xl font-bold">
                            {university?.name || "University Name"}
                            </h1>
                        </div>

                        {/* ================= RIGHT ================= */}
                        <div className="flex items-center gap-2 flex-wrap justify-end">

                            <Badge variant="secondary">
                                <Fingerprint className="h-2.5 w-2.5" />
                                {university?.id?.slice(-6)}
                            </Badge>

                            <Badge variant="outline">
                            QS Rank: #{university?.qsWorldRanking ?? "N/A"}
                            </Badge>

                            <Badge variant="outline">
                            Students: {university?.totalStudents ?? 0}
                            </Badge>

                        </div>

                        </div>
                    {/* DESCRIPTION */}
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-5">
                    {university?.description || "No description available"}
                    </p>
                </div>
                </div>
            </div>
  
          {/* ================= DASHBOARD GRID ================= */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
  
              {/* LEFT SIDE (Programs + Rankings) */}
              <div className="lg:col-span-2 space-y-6">
  
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* ================= CONTACT INFO ================= */}
                <Card>
                    <CardHeader>
                    <CardTitle>Contact Information</CardTitle>
                    </CardHeader>

                    <CardContent className="space-y-3 text-sm">

                    <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        <span className="truncate">{university?.address}</span>
                    </div>

                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="w-4 h-4" />
                        <span className="truncate">{university?.phoneNumber}</span>
                    </div>

                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="w-4 h-4" />
                        <span className="truncate">{university?.email}</span>
                    </div>

                    </CardContent>
                </Card>

                {/* ================= PROGRAMS ================= */}
                    <Card>
                    <CardHeader>
                        <CardTitle>Programs</CardTitle>
                    </CardHeader>

                    <CardContent>
                        <ScrollArea className="h-[80px] w-full pr-2">

                        <div className="flex flex-wrap gap-2">
                            {university?.programs?.length ? (
                            university.programs.map((p: string, i: number) => (
                                <Badge key={i} variant="secondary">
                                {p}
                                </Badge>
                            ))
                            ) : (
                            <p className="text-sm text-muted-foreground">
                                No programs available
                            </p>
                            )}
                        </div>

                        </ScrollArea>
                    </CardContent>

                    </Card>

                </div>
  
                  {/* RANKINGS */}
                  <Card>
                  <CardHeader>
                      <CardTitle>Rankings</CardTitle>
                  </CardHeader>
  
                  <CardContent className="space-y-3">
  
                      {[
                      { label: "QS World", value: university?.qsWorldRanking },
                      { label: "Subject", value: university?.qsRankingBySubject },
                      { label: "Sustainability", value: university?.qsSustainabilityRanking },
                      ].map((r, i) => (
                      <div
                          key={i}
                          className="flex items-center justify-between rounded-lg border p-4"
                      >
                          <div>
                          <p className="text-sm font-medium">{r.label}</p>
                          <p className="text-xs text-muted-foreground">
                              Global Ranking
                          </p>
                          </div>
  
                          <div className="text-xl font-bold">
                          #{r.value ?? "N/A"}
                          </div>
                      </div>
                      ))}
  
                  </CardContent>
                  </Card>
  
              </div>
              {/* RIGHT SIDE (STATS FULL HEIGHT) */}
              <div className="lg:col-span-1">
                  <Card className="rounded-2xl shadow-sm">
                      <CardHeader>
                          <CardTitle>University Workforce Overview</CardTitle>
                      </CardHeader>
  
                      <CardContent className="space-y-6">
  
                          {/* ================= TOP SUMMARY ================= */}
                          <div className="grid grid-cols-3 gap-4">
  
                          <div className="p-4 rounded-xl border bg-muted/30 text-center">
                              <p className="text-xs text-muted-foreground">Students</p>
                              <p className="text-xl font-bold">
                              {university?.totalStudents?.toLocaleString() ?? 0}
                              </p>
                          </div>
  
                          <div className="p-4 rounded-xl border bg-muted/30 text-center">
                              <p className="text-xs text-muted-foreground">Doctors</p>
                              <p className="text-xl font-bold">
                              {university?.totalDoctors?.toLocaleString() ?? 0}
                              </p>
                          </div>
  
                          <div className="p-4 rounded-xl border bg-muted/30 text-center">
                              <p className="text-xs text-muted-foreground">Staff</p>
                              <p className="text-xl font-bold">
                              {university?.staff?.toLocaleString() ?? 0}
                              </p>
                          </div>
  
                          </div>
  
                          {/* ================= PIE SECTION (FIXED LAYOUT) ================= */}
                          <div className="flex items-center justify-between gap-6">
  
                          {/* LEFT TEXT */}
                          <div className="space-y-2">
                              <h3 className="font-semibold">Students Breakdown</h3>
  
                              <div className="text-sm text-muted-foreground">
                              UG: {university?.ugStudents?.toLocaleString() ?? 0}
                              </div>
  
                              <div className="text-sm text-muted-foreground">
                              PG: {university?.pgStudents?.toLocaleString() ?? 0}
                              </div>
  
                              <div className="text-xs text-muted-foreground">
                              Total: {university?.totalStudents?.toLocaleString() ?? 0}
                              </div>
                          </div>
  
                          {/* CENTER PIE (NOW BIGGER + FOCUSED) */}
                          <div className="flex items-center justify-center w-[180px] h-[180px]">
                              <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                  <Pie
                                  data={studentData}
                                  dataKey="value"
                                  innerRadius={55}
                                  outerRadius={75}
                                  paddingAngle={5}
                                  >
                                  {studentData.map((_, i) => (
                                      <Cell key={i} fill={COLORS[i]} />
                                  ))}
                                  </Pie>
                              </PieChart>
                              </ResponsiveContainer>
                          </div>
  
                          </div>
  
                          {/* ================= PROGRESS SECTION ================= */}
                          <div className="space-y-4 pt-2 border-t">
  
                          <div>
                              <div className="flex justify-between text-sm mb-1">
                              <span className="text-muted-foreground">Students Capacity</span>
                              <span className="font-medium">
                                  {Math.round(((university?.totalStudents ?? 0) / 38000) * 100)}%
                              </span>
                              </div>
                              <Progress
                              value={Math.min(((university?.totalStudents ?? 0) / 38000) * 100, 100)}
                              />
                          </div>
  
                          <div>
                              <div className="flex justify-between text-sm mb-1">
                              <span className="text-muted-foreground">Doctors Capacity</span>
                              <span className="font-medium">
                                  {Math.round(((university?.totalDoctors ?? 0) / 2500) * 100)}%
                              </span>
                              </div>
                              <Progress
                              value={Math.min(((university?.totalDoctors ?? 0) / 2500) * 100, 100)}
                              />
                          </div>
  
                          <div>
                              <div className="flex justify-between text-sm mb-1">
                              <span className="text-muted-foreground">Staff Capacity</span>
                              <span className="font-medium">
                                  {Math.round(((university?.staff ?? 0) / 2500) * 100)}%
                              </span>
                              </div>
                              <Progress
                              value={Math.min(((university?.staff ?? 0) / 2500) * 100, 100)}
                              />
                          </div>
  
                          </div>
  
                      </CardContent>
                  </Card>
              </div>
          </div>
          </div>
  
      </DashboardLayout>
    );
  }
  