"use client";
import { useParams, useRouter } from "next/navigation";
import DashboardLayout from "@/components/Company/DashboardLayout";
import { useTopCompanyHandler } from "@/hooks/companyapihandler/useTopCompanyHandler";
import { useReviewHandler } from "@/hooks/companyapihandler/useReviewHandler";
import { useState, useEffect } from "react";
import { useDocumentHandler } from "@/hooks/companyapihandler/useDocumentHandler";
import { ArrowLeft, MapPin, Phone} from "lucide-react";
import { motion } from "framer-motion";
import EmployeeCard from "@/components/common/employee-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { LoadingState } from "@/components/common/LoadingState";
import EmptyStateFeedback from "@/components/common/EmptyStateFeedback";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type UploadItem = {
    id: string;
    fileName: string;
    fileUrl: string;
    fileType: string;
    preview?: string;
};

export default function TopCompanyPage() {

    const router = useRouter();
    const params = useParams();
    const { companyId } = params;
    const { topCompany, loading, error, getTopCompanyById } = useTopCompanyHandler();
    const { reviews: companyReviews, getReviews } = useReviewHandler();
    const { documents, getDocuments } = useDocumentHandler();
    const [files, setFiles] = useState<UploadItem[]>([]);
    const [viewingFile, setViewingFile] = useState<UploadItem | null>(null);
    const safeCompanyId =Array.isArray(companyId) ? companyId[0] : companyId;
    const company = topCompany;
    const reviews = companyReviews;

    /* =========================
        FETCH DATA
    ========================= */
    useEffect(() => {
        if (companyId && typeof companyId === 'string') {
            getTopCompanyById(companyId).then((data) => {
                console.log('Company data loaded:', data);
                console.log('Addresses:', data.addresses);
                if (data.addresses && data.addresses.length > 0) {
                    console.log('First address details:', {
                        id: data.addresses[0].id,
                        name: data.addresses[0].name,
                        tag: data.addresses[0].tag,
                        address: data.addresses[0].address,
                        phoneNumber: data.addresses[0].phoneNumber
                    });
                }
                console.log('Programs:', data.programs);
            }).catch((err) => {
                console.error('Failed to load company details:', err);
                toast.error('Failed to load company details:');
            });
            getReviews(companyId);
        }
    }, [companyId, getTopCompanyById, getReviews]);

    useEffect(() => {
        if (companyId && typeof companyId === "string") {
            getTopCompanyById(companyId);
            getReviews(companyId);
            getDocuments(companyId); // ✅ pass companyId here
        }
    }, [companyId, getTopCompanyById, getReviews, getDocuments]);


    /* =========================
        MAP DOCUMENTS → UI
    ========================= */
    useEffect(() => {
        if (!documents) return;

        const mapped: UploadItem[] = documents.map((doc) => ({
            id: doc.id,
            fileName: doc.fileName,
            fileUrl: doc.fileUrl,
            fileType: doc.fileType,
            preview: doc.fileType.startsWith("image/")
                ? doc.fileUrl
                : undefined,
        }));

        setFiles(mapped);
    }, [documents]);

    /* =========================
        VIEW / DOWNLOAD HELPERS
    ========================= */
    const openFile = (file: UploadItem) => {
        if (file.fileType === 'application/pdf') {
            window.open(`https://docs.google.com/viewer?url=${encodeURIComponent(file.fileUrl)}`, "_blank", "noopener,noreferrer");
        } else {
            window.open(file.fileUrl, "_blank", "noopener,noreferrer");
        }
    };

    const downloadFile = async (file: UploadItem) => {
        const response = await fetch(file.fileUrl);
        const blob = await response.blob();

        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = file.fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };



    if (loading) {
        return (
            <DashboardLayout>
            <div className="flex h-screen items-center justify-center">
                <LoadingState label="Fetching Data..." />
            </div>
            </DashboardLayout>
        );
    }

        if (error || !company) {
        return (
            <DashboardLayout>
            <EmptyStateFeedback
                type={error ? "error" : "notfound"}
                title={error || "Company Not Found"}
                description={
                error
                    ? "Something went wrong while loading the company."
                    : "We couldn't find a company with this ID."
                }
                id={!error ? safeCompanyId  : undefined}
            />
            </DashboardLayout>
        );
        }

    return (
        <DashboardLayout>
<div className={`relative w-full min-h-[1000px] p-4 transform md:scale-[0.96] md:origin-top`}>  
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
                    

<div className="space-y-6">

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.4, ease: "easeOut" }}
  whileHover={{ y: -4 }}
>
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
              src={company.image || company.logo || ""}
              className="object-cover w-full h-full"
            />

            <AvatarFallback className="bg-primary/10 text-primary font-bold text-xl w-full h-full flex items-center justify-center">
              {company.name?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>

          {/* HOVER OVERLAY */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
            {company.name}
          </div>
        </motion.div>
      </div>
    </div>
    {/* ================= PROFILE INFO ================= */}
    <div className="pt-14 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
      {/* LEFT SIDE */}
      <div className="space-y-2 w-full">
        {/* NAME + STATUS + RANK */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-3xl font-bold">
              {company?.name || "Company Name"}
            </h1>

            <Badge className="bg-emerald-500/10 text-emerald-600">
              {company?.status || "Pending"}
            </Badge>
          </div>
        </div>
        {/* DESCRIPTION */}
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-5">
          {company.description|| "No company description available"}
        </p>
      </div>
    </div>
  </div>
</motion.div>

{/* ================= ROW 2 ================= */}
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">

<div className="grid grid-rows-1 lg:grid-rows-2 gap-6 items-stretch">

  {/* ================= ADDRESSES ================= */}
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, ease: "easeOut" }}
    whileHover={{ y: -4 }}
  >
    <Card className="rounded-2xl border shadow-sm hover:shadow-md transition-all h-full flex flex-col">

      <CardHeader className="border-b bg-muted/20">
        <CardTitle>Addresses</CardTitle>
        <CardDescription>
          Company locations & contact details
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1 min-h-0">
        {company?.addresses?.length ? (
          <div className="space-y-4 overflow-y-auto pr-2">

            {company.addresses.map((a, index) => (
              <div
                key={index}
                className="rounded-xl border bg-muted/30 p-3 space-y-2 hover:bg-muted/50 transition"
              >

                <p className="text-sm font-medium">
                  {a.name} {a.tag && (
                    <span className="text-xs text-muted-foreground">
                      ({a.tag})
                    </span>
                  )}
                </p>

                <div className="flex items-start gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4 mt-0.5" />
                  <span>{a.address}</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="w-4 h-4" />
                  <span>{a.phoneNumber}</span>
                </div>

              </div>
            ))}

          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
            No addresses added yet
          </div>
        )}
      </CardContent>

    </Card>
  </motion.div>

  {/* ================= PROFILE RANKING ================= */}
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, ease: "easeOut", delay: 0.05 }}
    whileHover={{ y: -4 }}
  >
    <Card className="rounded-2xl border shadow-sm hover:shadow-md transition-all h-full flex flex-col">

      <CardHeader className="border-b bg-muted/20">
        <CardTitle>Profile Ranking</CardTitle>
        <CardDescription>
          Overall profile strength & completion
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col items-center justify-center flex-1 space-y-6">

        {/* BIG SCORE */}
        <div className="text-6xl font-bold tracking-tight text-muted-foreground">
          {company?.profileRanking ?? "N/A"}
        </div>

        {/* PROGRESS */}
        <div className="w-full space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              Profile Completion
            </span>
            <span className="font-medium">
              {company?.progress || 0}%
            </span>
          </div>

          <Progress value={company?.progress || 0} />
        </div>

      </CardContent>

    </Card>
  </motion.div>

</div>

{/* ================= EMPLOYEES ================= */}
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.4, ease: "easeOut" }}
  whileHover={{ y: -4 }}
>
  <Card className="rounded-2xl border shadow-sm hover:shadow-lg transition-all duration-300 h-full flex flex-col">

    <CardHeader className="shrink-0">
      <CardTitle className="flex items-center justify-between">
        Current Employees
        <span className="text-sm text-muted-foreground font-normal">
          {company?.employees?.length || 0} total
        </span>
      </CardTitle>

      <CardDescription>
        Active employees & assignments overview
      </CardDescription>
    </CardHeader>

    <CardContent className="flex-1 min-h-0">

      {company?.employees?.length ? (
        <ScrollArea className="w-full h-full">

          <div className="flex gap-4 items-start pb-2">

            {company.employees.map((employee, index) => {
              const student = employee.student;

              return (
                <div
                  className="w-[260px]"
                >
                  <EmployeeCard
                    showMenu={false}
          applicant={{
                        applicantId: student?.id || employee.id,
                        contractTitle: employee.contractTitle,
                         contractStatus: employee.status,
                         progress: employee.progress != null ? String(employee.progress) : "0",
                        profileComplete: student?.profileComplete ?? 0,
                         contractNumber: employee.contractNumber,
                          availability: student?.availability,
                           student: {
                                    id: student?.id || employee.id,
                                    name: student?.name || "Null",
                                    image: student?.image,
                                    profileComplete: student?.profileComplete ?? 0,
                                    status: student?.status,
                                    availability: student?.availability,
                                    },
                    }} 
                    onView={() =>
                      router.push(
                        `/Student/top-company/${companyId}/applicant/${student?.id}`
                      )
                    }
                  />
                </div>
              );
            })}

          </div>

          <ScrollBar orientation="horizontal" />
        </ScrollArea>

      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="h-full flex items-center justify-center text-sm text-muted-foreground"
        >
          No employees available
        </motion.div>
      )}

    </CardContent>
  </Card>
</motion.div>

  {/* ================= PROGRAMS ================= */}
    <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, ease: "easeOut" }}
    whileHover={{ y: -4 }}
    >
    <Card className="rounded-2xl border shadow-sm hover:shadow-lg transition-all duration-300 h-full flex flex-col">

        <CardHeader className="shrink-0">
        <CardTitle className="flex items-center justify-between">
            Programs
            <span className="text-sm font-medium text-muted-foreground">
            Overview
            </span>
        </CardTitle>
        <CardDescription>Distribution & breakdown</CardDescription>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col items-center justify-between gap-6">

        {/* COUNT (animated) */}
        <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="text-5xl font-bold tracking-tight"
        >
            {company?.programs?.length || 0}
        </motion.div>

        {/* PIE */}
        <div className="w-full h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
            <PieChart>
                <Pie
                data={
                    company?.programs?.length
                    ? company.programs.map((p: any) => ({
                        name: p?.name || p,
                        value: 1,
                        }))
                    : [{ name: "Empty", value: 1 }]
                }
                dataKey="value"
                innerRadius={50}
                outerRadius={75}
                stroke="none"
                >
                {(company?.programs?.length
                    ? company.programs
                    : [{ name: "Empty" }]
                ).map((_: any, i: number) => (
                    <Cell
                    key={i}
                    fill={`hsl(${(i * 55) % 360}, 75%, 60%)`}
                    />
                ))}
                </Pie>
                <Tooltip />
            </PieChart>
            </ResponsiveContainer>
        </div>

        {/* LEGEND */}
        <ScrollArea className="w-full h-[120px]">
            {company?.programs?.length ? (
            <div className="flex flex-wrap gap-2 justify-center">
                {company.programs.map((p: any, i: number) => (
                <motion.div
                    key={i}
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.2 }}
                >
                    <Badge
                    variant="secondary"
                    className="px-3 py-1 text-xs"
                    >
                    {p?.name || p}
                    </Badge>
                </motion.div>
                ))}
            </div>
            ) : (
            <div className="text-xs text-muted-foreground text-center py-6">
                No programs available
            </div>
            )}
        </ScrollArea>

        </CardContent>
    </Card>
    </motion.div>

</div>


  {/* ================= ROW 3 ================= */}
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, ease: "easeOut" }}
    whileHover={{ y: -4 }}
    >
        <Card className="rounded-2xl shadow-sm h-full flex flex-col">

            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    Documents
                    <span className="text-sm font-normal text-muted-foreground">
                    {files.length} files
                    </span>
                </CardTitle>
                <CardDescription>Uploaded company files</CardDescription>
            </CardHeader>

            <CardContent className="flex-1 min-h-0">

                {files.length === 0 ? (
                <div className="flex items-center justify-center h-[300px] text-sm text-muted-foreground">
                    No documents uploaded yet
                </div>
                ) : (
                <ScrollArea className="h-[420px] pr-2">

                    <div className="space-y-3">

                    {files.map((item) => (
                        <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-3 p-3 rounded-xl border bg-muted/40 hover:bg-muted/60 transition"
                        >

                        {/* PREVIEW */}
                        {item.preview ? (
                            <img
                            src={item.preview}
                            alt={item.fileName}
                            className="w-12 h-12 object-cover rounded-md"
                            />
                        ) : (
                            <div className="w-12 h-12 rounded-md bg-muted flex items-center justify-center text-xs font-semibold text-muted-foreground">
                            {item.fileType?.split("/")[1]?.toUpperCase() || "FILE"}
                            </div>
                        )}

                        {/* INFO */}
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate" title={item.fileName}>
                            {item.fileName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                            {item.fileType}
                            </p>
                        </div>

                        {/* ACTIONS */}
                        <div className="flex flex-col gap-2">
                            <Button size="sm" variant="secondary" onClick={() => openFile(item)}>
                            View
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => downloadFile(item)}>
                            Download
                            </Button>
                        </div>

                        </motion.div>
                    ))}

                    </div>

                </ScrollArea>
                )}

            </CardContent>
        </Card>
    </motion.div>
        <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, ease: "easeOut" }}
    whileHover={{ y: -4 }}
    >
    <Card className="rounded-2xl shadow-sm flex flex-col h-full">

    <CardHeader>
        <CardTitle>Reviews</CardTitle>
        <CardDescription>What students say about this company</CardDescription>
    </CardHeader>

    <CardContent className="flex-1 min-h-0">

        {reviews.length === 0 ? (
        <div className="flex items-center justify-center h-[300px] text-sm text-muted-foreground text-center">
            No reviews available yet
        </div>
        ) : (
        <ScrollArea className="h-[420px] pr-2">

            <div className="space-y-4">

            {reviews.map((review) => (
                <div
                key={review.id}
                className="flex flex-col gap-3 p-4 rounded-xl border bg-muted/30"
                >

                {/* TOP */}
                <div className="flex justify-between items-start">

                    {/* USER */}
                    <div className="flex items-center gap-3">
                    <img
                        src={review.studentImage || "/default-avatar.png"}
                        alt={review.name}
                        className="w-8 h-8 rounded-full object-cover"
                    />

                    <div>
                        <p className="text-sm font-medium">{review.name}</p>
                        <p className="text-xs text-muted-foreground">
                        {new Date(review.createdAt).toLocaleDateString()}
                        </p>
                    </div>
                    </div>

                    {/* STARS */}
                    <div className="flex gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <svg
                        key={i}
                        className={`w-4 h-4 ${
                            i < review.rating
                            ? "fill-yellow-400"
                            : "fill-muted-foreground/20"
                        }`}
                        viewBox="0 0 20 20"
                        >
                        <path d="M10 1.5l2.6 5.3 5.8.8-4.2 4.1 1 5.8L10 15.8 4.8 17.5l1-5.8L1.6 7.6l5.8-.8L10 1.5z" />
                        </svg>
                    ))}
                    </div>

                </div>

                {/* TEXT */}
                <p className="text-sm text-muted-foreground leading-relaxed">
                    {review.review}
                </p>

                </div>
            ))}

            </div>

        </ScrollArea>
        )}

    </CardContent>
    </Card>
    </motion.div>
</div>
         </div>    
                  
            </div>

            {viewingFile && (
                <div
                    onClick={() => setViewingFile(null)}
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: "rgba(0, 0, 0, 0.8)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 9999,
                        padding: "20px",
                    }}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            position: "relative",
                            width: "100%",
                            maxWidth: "1200px",
                            height: "90vh",
                            backgroundColor: "#fff",
                            borderRadius: "12px",
                            overflow: "hidden",
                            display: "flex",
                            flexDirection: "column",
                        }}
                    >
                        <div
                            style={{
                                padding: "16px",
                                borderBottom: "1px solid #E0E0E0",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                            }}
                        >
                            <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 600 }}>
                                {viewingFile.fileName}
                            </h3>
                            <button
                                onClick={() => setViewingFile(null)}
                                style={{
                                    background: "none",
                                    border: "none",
                                    fontSize: "24px",
                                    cursor: "pointer",
                                    padding: "0 8px",
                                }}
                            >
                                ×
                            </button>
                        </div>
                        <iframe
                            src={`https://docs.google.com/viewer?url=${encodeURIComponent(viewingFile.fileUrl)}&embedded=true`}
                            style={{
                                flex: 1,
                                border: "none",
                                width: "100%",
                            }}
                            title={viewingFile.fileName}
                        />
                    </div>
                </div>
            )}

        </DashboardLayout>
    );
}
