"use client";
import { FileText, FileImage, File, Users, Phone, MapPin, Camera, CameraIcon, CameraOff, LucideCamera, Trophy, AlertCircle, CheckCircle2, UploadCloud, UploadCloudIcon, LucideUploadCloud, FolderUp, Star } from "lucide-react";
import DashboardLayout from "@/components/Company/DashboardLayout";
import { useEffect, useRef, useState } from "react";
import { useCompanyProfileHandler } from "@/hooks/companyapihandler/useCompanyProfileHandler";
import { useProgramHandler } from "@/hooks/companyapihandler/useProgramHandler";
import { useReviewHandler } from "@/hooks/companyapihandler/useReviewHandler";
import { useDocumentHandler } from "@/hooks/companyapihandler/useDocumentHandler";
import { useCompanyGlobalRankingHandler } from "@/hooks/common/useCompanyGlobalRankingHandler";
import { api } from "@/lib/api";
import {  Download, Eye,MoreVertical, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import React from "react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { EmptyState } from "@/components/common/EmptyState";
import { LoadingState } from "@/components/common/LoadingState";
import EmployeeCard from "@/components/common/employee-card";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import CorporateModal from "@/components/Company/Modal/CorporateModal";
import ProgramsModal from "@/components/Company/Modal/ProgramsModal";
import AddressModal from "@/components/Company/Modal/AddressModal";
import { Skeleton } from "@/components/ui/skeleton";
import { ProfileSkeleton } from "@/components/Company/Skeleton/ProfileSkeleton";


type UploadItem = {
    id?: string;
    file?: File;
    fileName?: string;
    fileUrl?: string;
    fileType?: string;
    preview?: string;
    progress: number;
    uploading: boolean;
    error?: string;
};

const MAX_FILE_SIZE_MB = 5;
const MAX_FILES = 5;
export default function TopCompanyPage() {
    const { profile, profileLoading, getProfile, updateProfile, uploadLogo, uploadLogoLoading, uploadLogoError, employees, employeesLoading, getEmployees } = useCompanyProfileHandler();
    const {
    ranking: companyRanking,
    loading: rankingLoading,getCompanyGlobalRankingByCompanyId
    } = useCompanyGlobalRankingHandler();
    const { programs, loading: programsLoading, getPrograms,deleteProgram } = useProgramHandler();
    const { reviews: companyReviews, loading: reviewsLoading, getReviews } = useReviewHandler();
    const { documents, documentsLoading, getDocuments, uploadDocument, deleteDocument } = useDocumentHandler();
    const company = profile ;

    useEffect(() => {
    if (profile?.id) {
        getCompanyGlobalRankingByCompanyId(profile.id);
    }
    }, [profile?.id]);

    useEffect(() => {
        getProfile();
        getPrograms();
        getEmployees();
        getReviews();
        getDocuments();
    }, [getProfile, getPrograms, getEmployees, getReviews, getDocuments]);


    // ============= file upload (Section 1) ==============
    const [files, setFiles] = useState<UploadItem[]>([]);
    const uploadingFiles = useRef<Set<string>>(new Set());
    const [deletingFiles, setDeletingFiles] = useState<Set<number>>(new Set());
    const [clearingAll, setClearingAll] = useState(false);
    const [dragging, setDragging] = useState(false);


    useEffect(() => {
        if (documents) {
            const mappedFiles: UploadItem[] = documents.map((doc, index) => ({
                id: doc.id,
                fileName: doc.fileName,
                fileUrl: doc.fileUrl,
                fileType: doc.fileType,
                preview: doc.fileType.startsWith('image/') ? doc.fileUrl : undefined,
                progress: 100,
                uploading: false
            }));
            setFiles(mappedFiles);
        }
    }, [documents]);



    const getFileIcon = (fileType?: string) => {
    if (!fileType) return <File className="w-4 h-4" />;

    if (fileType.startsWith("image/")) {
        return <FileImage className="w-4 h-4 text-blue-500" />;
    }

    if (fileType === "application/pdf") {
        return <FileText className="w-4 h-4 text-red-500" />;
    }

    return <File className="w-4 h-4 text-muted-foreground" />;
    };

    const formatFileName = (name: string, max = 18) => {
    if (!name) return "unknown";
    if (name.length <= max) return name;

    const extIndex = name.lastIndexOf(".");
    const ext = extIndex !== -1 ? name.slice(extIndex) : "";

    return name.slice(0, max - ext.length - 3) + "..." + ext;
    };


    const clearAll = async () => {
        setClearingAll(true);
        for (const file of files) {
            if (file.id) {
                try {
                    await deleteDocument(file.id);
                } catch (error) {
                }
            }
        }
        setFiles([]);
        setClearingAll(false);
    };

    const uploadFile = async (file: File, index: number) => {
        const fileKey = `${file.name}-${file.size}-${file.lastModified}`;
        if (uploadingFiles.current.has(fileKey)) {
            return;
        }

        uploadingFiles.current.add(fileKey);
        try {
            setFiles((prev) =>
                prev.map((f, i) =>
                    i === index ? { ...f, uploading: true, error: undefined } : f
                )
            );

            const document = await uploadDocument(file, (progress) => {
                setFiles((prev) =>
                    prev.map((f, i) =>
                        i === index ? { ...f, progress } : f
                    )
                );
            });

            setFiles((prev) =>
                prev.map((f, i) =>
                    i === index
                        ? {
                            id: document.id,
                            fileName: document.fileName,
                            fileUrl: document.fileUrl,
                            fileType: document.fileType,
                            preview: document.fileType.startsWith('image/') ? document.fileUrl : undefined,
                            progress: 100,
                            uploading: false
                        }
                        : f
                )
            );
        } catch (error) {
            setFiles((prev) =>
                prev.map((f, i) =>
                    i === index
                        ? {
                            ...f,
                            uploading: false,
                            progress: 0,
                            error: "Upload failed. Retry."
                        }
                        : f
                )
            );
        } finally {
            uploadingFiles.current.delete(fileKey);
        }
    };

    const handleFiles = (incoming: File[]) => {
        if (files.length + incoming.length > MAX_FILES) {
                
            return;
        }

        incoming.forEach((file) => {
            if (
                !file.type.startsWith("image/") &&
                file.type !== "application/pdf"
            ) {
                toast.error("Only images and PDFs allowed");
                return;
            }

            if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
                toast.error(`Max file size ${MAX_FILE_SIZE_MB}MB`);
                return;
            }

            const item: UploadItem = {
                file,
                preview: file.type.startsWith("image/")
                    ? URL.createObjectURL(file)
                    : undefined,
                progress: 0,
                uploading: false,
            };

            setFiles((prev) => {
                const index = prev.length;
                setTimeout(() => uploadFile(file, index), 100);
                return [...prev, item];
            });
        });
    };

    const removeFile = async (index: number) => {
        const fileItem = files[index];

        setDeletingFiles(prev => new Set(prev).add(index));

        try {
            if (fileItem.id) {
                 await deleteDocument(fileItem.id);
            }

            setFiles(prev => prev.filter((_, i) => i !== index));

        } catch (error) {
             console.error("Delete failed", error);
        } finally {
             setDeletingFiles(prev => {
                 const newSet = new Set(prev);
                 newSet.delete(index);
                 return newSet;
            });
        }
    };

    const openFile = (file: UploadItem) => {
        if (!file.fileUrl) return;

        if (file.fileType === "application/pdf") {
            window.open(
                `https://docs.google.com/viewer?url=${encodeURIComponent(file.fileUrl)}`,
                "_blank",
                "noopener,noreferrer"
            );
        } else {
            window.open(file.fileUrl, "_blank", "noopener,noreferrer");
        }
    };

    const downloadFile = async (file: UploadItem) => {
        if (!file.fileUrl) return;

        try {
            const response = await fetch(file.fileUrl);
            const blob = await response.blob();

            const url = URL.createObjectURL(blob);

            const a = document.createElement("a");
            a.href = url;
            a.download = file.fileName || "file";
            document.body.appendChild(a);
            a.click();

            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (err) {
            window.open(file.fileUrl, "_blank");
        }
    };



    /* -----------------------------
        Image HANDLER
    ------------------------------ */
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const next = profile?.logoUrl || profile?.logo || null;
        if (next !== imagePreview) {
            setImagePreview(next);
        }
    }, [profile?.logoUrl, profile?.logo, imagePreview]);

    const handleImageClick = () => {
        fileInputRef.current?.click();
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const validTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
        const maxSize = 3 * 1024 * 1024; // 3MB

        if (!validTypes.includes(file.type)) {
            toast.error("Only JPG, JPEG, PNG, and WEBP images are allowed");
            return;
        }

        if (file.size > maxSize) {
            toast.error("Image size must be less than 3MB");
            return;
        }

        setImagePreview(URL.createObjectURL(file));

        try {
            await uploadLogo(file);
           toast.success("Logo updated successfully");
        } catch (err) {
            toast.error(uploadLogoError || "Failed to upload logo");
        }
    };

    /* -----------------------------
        Model logic
    ------------------------------ */
    const [isModalOpen1, setIsModalOpen1] = useState(false);
    const [editingCorporate, setEditingCorporate] = useState<any>(null);

    const [isModalOpen2, setIsModalOpen2] = useState(false);
    const [editingProgram, setEditingProgram] = useState<any>(null);

    const [isModalOpen3, setIsModalOpen3] = useState(false);
    const [editingAddress, setEditingAddress] = useState<any>(null);

    const pageLoading = profileLoading || programsLoading || reviewsLoading || documentsLoading;

    if (pageLoading) {
        return (
            <DashboardLayout>
                <ProfileSkeleton/>
            </DashboardLayout>
        );
    }
    
    return (
        <DashboardLayout>
<div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">

        {/* ================= PROFILE HEADER ================= */}
        <div className="space-y-2">

  {/* ================= COVER ================= */}
  <div className="relative">

    <div className="h-[220px] w-full rounded-2xl overflow-hidden">
      <img
        src="/default-cover.svg"
        className="w-full h-full object-cover"
      />
    </div>

    {/* ================= AVATAR (WITH HOVER ANIMATION) ================= */}
        <div className="absolute -bottom-12 left-6">
        <div
            onClick={() => fileInputRef.current?.click()}
            className="relative w-28 h-28 rounded-full border-4 border-white bg-white shadow-md overflow-hidden cursor-pointer group"
        >
            <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleImageUpload}
            className="hidden"
            />

            {/* AVATAR */}
            <Avatar className="w-full h-full">
            <AvatarImage
                src={imagePreview || undefined}
                className="object-cover w-full h-full"
            />

            <AvatarFallback className="bg-primary/10 text-primary font-bold text-xl w-full h-full flex items-center justify-center">
                {company?.name?.charAt(0) || "U"}
            </AvatarFallback>
            </Avatar>

            {/* FIRST TIME EMPTY STATE OVERLAY */}
            {!imagePreview && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 text-primary">
                <Camera className="w-6 h-6 mb-1" />
                <span className="text-[10px] font-medium">Add Image</span>
            </div>
            )}

            {/* HOVER OVERLAY */}
            {imagePreview && (
            <div className="absolute inset-0 gap-2 flex items-center justify-center bg-black/40 text-primary text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                <LucideCamera className="w-6 h-6 mb-1" />
                Change
            </div>
            )}
        </div>
        </div>

  </div>

  {/* ================= PROFILE INFO ================= */}
    <div className="pt-14 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">

    {/* LEFT */}
    <div className="space-y-3 w-full">

        {/* TOP ROW (responsive) */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

        {/* NAME + BADGES */}
        <div className="flex flex-wrap items-center gap-2">

            <h1 className="text-2xl sm:text-3xl font-bold break-words">
            {company?.name || "Company Name"}
            </h1>

            <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20">
            {company?.status || "Pending"}
            </Badge>

            <Badge variant="outline" className="text-xs whitespace-nowrap">
            {rankingLoading
                ? "Loading..."
                : companyRanking
                ? `Rank #${companyRanking.globalRank}`
                : "Rank N/A"}
            </Badge>

        </div>

        {/* BUTTON */}
        <div className="flex justify-start sm:justify-end">
            <Button
            variant="outline"
            size="sm"
            className="transition hover:scale-[1.02] w-full sm:w-auto"
            onClick={() => {
                setEditingCorporate({
                description: profile?.corporate || "",
                });
                setIsModalOpen1(true);
            }}
            >
            Edit Description
            </Button>
        </div>

        </div>

        {/* DESCRIPTION */}
        <p className="text-sm text-muted-foreground line-clamp-5">
        {profile?.corporate || "Add company description here..."}
        </p>

    </div>
    </div>

</div>

     {/* ================= SECOND ROW ================= */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        <div className="grid grid-rows-1 lg:grid-rows-2 gap-6 items-stretch">
            {/* ================= ADDRESSES ================= */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                whileHover={{ y: -4 }}
            >
            <Card className="rounded-2xl border shadow-sm hover:shadow-md transition-all h-full flex flex-col">

            {/* HEADER */}
            <CardHeader className=" flex flex-row items-center justify-between">
                <div>
                <CardTitle>Address</CardTitle>
                <CardDescription>
                    Company locations & contact details
                </CardDescription>
                </div>

                <Button
                    size="sm"
                    variant="outline"

                onClick={() => {
                    const existing = profile?.addresses?.[0];

                    if (existing) {
                    setEditingAddress({
                        id: existing.id,
                        name: existing.name,
                        tag: existing.tag,
                        address: existing.address,
                        phoneNumber: existing.phoneNumber,
                    });
                    } else {
                    setEditingAddress(null);
                    }

                    setIsModalOpen3(true);
                }}
                >
                {profile?.addresses?.length ? "Edit" : "Add"}
                </Button>
            </CardHeader>

            {/* CONTENT */}
            <CardContent className="flex-1 min-h-0">

                {profile?.addresses?.length ? (
                <div className="space-y-4 overflow-y-auto pr-2 max-h-[320px]">

                    {profile.addresses.map((a: any, i: number) => (
                    <div
                        key={a.id || `address-${i}`} // ✅ FIXED: Unique key
                        className="rounded-xl border bg-muted/30 p-4 space-y-2 hover:bg-muted/50 transition"
                    >

                        {/* NAME + TAG */}
                        <p className="text-sm font-semibold text-foreground">
                        {a.name}{" "}
                        {a.tag && (
                            <span className="text-xs text-muted-foreground font-normal">
                            ({a.tag})
                            </span>
                        )}
                        </p>

                        {/* ADDRESS */}
                        <div className="flex items-start gap-2 text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4 mt-0.5" />
                        <span>{a.address}</span>
                        </div>

                        {/* PHONE */}
                        {a.phoneNumber && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Phone className="w-4 h-4" />
                            <span>{a.phoneNumber}</span>
                        </div>
                        )}

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
            <CardHeader>
                <CardTitle>Global Rank</CardTitle>
                <CardDescription>
                Overall profile strength & completion
                </CardDescription>
            </CardHeader>

            <CardContent className="flex flex-col items-center justify-center flex-1 space-y-6">

                {/* BIG PROGRESS NUMBER */}
                <div className="flex items-center gap-2 text-6xl font-bold tracking-tight text-primary">
                <Trophy className="w-10 h-10 text-primary" />
                {companyRanking ? companyRanking.globalRank : "N/A"}
                </div>

                {/* PROGRESS BAR */}
                <div className="w-full space-y-2">

                <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                    Completion
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

            {/* ================= HEADER ================= */}
            <CardHeader className="shrink-0">
                <CardTitle className="flex items-center justify-between">
                Current Employees

                <span className="text-sm text-muted-foreground font-normal">
                    {employees?.length || 0} total
                </span>
                </CardTitle>

                <CardDescription>
                Active employees & assignments overview
                </CardDescription>
            </CardHeader>

            {/* ================= CONTENT ================= */}
            <CardContent className="flex-1 min-h-0">

                {employeesLoading ? (

                <LoadingState label="Fetching employees..." />

                ) : employees?.length > 0 ? (

                <ScrollArea className="w-full">

                    {/* ROW */}
                    <div className="flex gap-4 pb-2">

                    {employees.map((employee, index) => {
                        const student = employee.student;

                        return (
                        <div key={student?.id || employee.id || `emp-${index}`}
                        className="w-[260px]"
                        >
                            <EmployeeCard
                            showMenu={false}
                            applicant={{
                                applicantId: student?.id || employee.id,
                                contractTitle: employee.contractTitle,
                                contractStatus: employee.status,
                                profileComplete: student?.profileComplete ?? 0,
                                availability: student?.availability,
                                student: {
                                id: student?.id || employee.id,
                                name: student?.name || "Employee",
                                image: student?.image,
                                availability: student?.availability,
                                },
                            }}
                            />

                        </div>
                        );
                    })}

                    </div>

                    <ScrollBar orientation="horizontal" />

                </ScrollArea>

                ) : (

                <EmptyState
                    title="No employees yet"
                    description="No team members are assigned to this company."
                    icon={<Users className="h-10 w-10 text-muted-foreground" />}
                />

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

  {/* ================= HEADER ================= */}
  <CardHeader className="flex flex-row items-center justify-between space-y-0 shrink-0">

    <div>
      <CardTitle className="text-base font-semibold tracking-tight">
        Active Programs
      </CardTitle>

      <CardDescription>
        Manage company programs and tags
      </CardDescription>
    </div>

    <Button
      size="sm"
      variant="outline"
      onClick={() => setIsModalOpen2(true)}
    >
      Add more
    </Button>

  </CardHeader>

  {/* ================= CONTENT ================= */}
  <CardContent className="flex-1 flex flex-col items-center justify-between gap-6">

    {/* COUNT */}
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="text-5xl font-bold tracking-tight"
    >
      {programs?.length || 0}
    </motion.div>

    {/* PIE CHART */}
    <div className="w-full h-[180px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={
              programs?.length
                ? programs.map((p: any) => ({
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
            {(programs?.length ? programs : [{ name: "Empty" }]).map(
              (_: any, i: number) => (
                <Cell
                  key={`program-${i}`} // ✅ FIXED: Unique key
                  fill={`hsl(${(i * 55) % 360}, 75%, 60%)`}
                />
              )
            )}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>

    {/* LEGEND (ShadCN ScrollArea) */}
    <ScrollArea className="w-full h-[120px]">
    {programs?.length ? (
        <div className="flex flex-wrap gap-2 justify-center">
        {programs.map((p: any, i: number) => (
            <motion.div
            key={p?.id || p || `program-${i}`}
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-1"
            >
            <Badge variant="secondary" className="px-3 py-1 text-xs flex items-center gap-2">
                {typeof p === "object" ? p.name : p}

                {/* DELETE BUTTON */}
                <button
                onClick={() => deleteProgram(p?.id)}
                className="ml-1 text-red-500 hover:text-red-700"
                >
                <Trash2 size={14} />
                </button>
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

    {/* ================= ROW: EMPLOYEES + DOCUMENTS ================= */}
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, ease: "easeOut" }}
    whileHover={{ y: -4 }}
    >
  {/* ================= DOCUMENTS ================= */}
  <Card className="rounded-2xl shadow-sm hover:shadow-md transition-shadow">

    <CardHeader>
      <CardTitle className="text-base font-semibold tracking-tight">
        Documents
      </CardTitle>
      <CardDescription>
        Upload and manage company files
      </CardDescription>
    </CardHeader>

    <CardContent className="space-y-4">

    <div
    onClick={() => document.getElementById("file-input-2")?.click()}
    onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
    }}
    onDragLeave={() => setDragging(false)}
    onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        handleFiles(Array.from(e.dataTransfer.files));
    }}
    className={`
        group relative h-[140px] rounded-xl border border-dashed
        flex flex-col items-center justify-center cursor-pointer
        transition-all duration-300 ease-out

        ${dragging 
        ? "border-primary bg-primary/5 shadow-md scale-[1.01]" 
        : "border-muted-foreground/30 bg-muted/20 hover:bg-muted/40 hover:border-primary/40"
        }
    `}
    >
    
    {/* INPUT */}
    <Input
        id="file-input-2"
        type="file"
        multiple
        accept="image/*,application/pdf"
        className="hidden"
        onChange={(e) =>
        e.target.files && handleFiles(Array.from(e.target.files))
        }
    />

  {/* ICON */}
  <div
    className={`
      mb-2 transition-all duration-300
      ${dragging ? "text-primary scale-110" : "text-muted-foreground"}
      group-hover:text-primary group-hover:scale-110
    `}
  >
    <FolderUp className="w-10 h-10" />
  </div>

    {/* TEXT */}
    <p className="text-sm font-medium text-foreground">
        {dragging ? "Drop files here..." : "Drop or click to upload"}
    </p>

    <p className="text-xs text-muted-foreground mt-1">
        PNG, JPG, PDF up to 5MB
    </p>

    {/* GLOW EFFECT */}
    <div
        className={`
        absolute inset-0 rounded-xl pointer-events-none transition-opacity duration-300
        ${dragging ? "opacity-100" : "opacity-0"}
        bg-gradient-to-r from-primary/10 via-transparent to-primary/10
        `}
    />
    </div>

      {/* CLEAR ALL */}
      {files.length > 0 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearAll}
          disabled={clearingAll}
          className="text-red-500 hover:text-red-600"
        >
          {clearingAll ? "Deleting..." : "Delete all"}
        </Button>
      )}

      {/* FILE LIST */}
      <ScrollArea className="h-[200px] pr-2">

      {/* ================= DOCUMENTS LIST ================= */}
        <div className="space-y-3">
        

        {files?.length ? (
            files.map((item, index) => (
            <AnimatePresence 
            key={item.id || `file-${index}`}   // ✅ FIX HERE
             mode="popLayout">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, x: -20 }}
                    transition={{ duration: 0.2 }}
                >
                    <Card
                    className={`
                        relative overflow-hidden w-full p-4 flex flex-col sm:sm:flex-row sm:items-center gap-3 sm:gap-4 transition-all duration-300`}
                    >
                    {/* DELETING OVERLAY */}
                    {deletingFiles.has(index) && (
                        <div className="absolute inset-0 bg-background/70 backdrop-blur-sm flex items-center justify-center z-20">
                        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground animate-pulse">
                            <Trash2 className="w-4 h-4" />
                            Deleting...
                        </div>
                        </div>
                    )}

                    {/* LEFT SIDE: ICON & INFO */}
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="relative w-12 h-12 shrink-0 rounded-md bg-muted flex items-center justify-center overflow-hidden border">
                        {item.preview ? (
                            <img src={item.preview} className="w-full h-full object-cover" alt="preview" />
                        ) : (
                            getFileIcon(item.fileType)
                        )}
                        </div>

                        <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-semibold truncate text-foreground">
                            {formatFileName(item.fileName || "Unknown File")}
                            </p>
                            {item.progress === 100 && (
                            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                                Complete
                            </span>
                            )}
                        </div>

                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{item.progress}%</span>
                            <span>•</span>
                            <span className="uppercase">{item.fileType?.split('/')[1] || 'File'}</span>
                        </div>

                        <Progress 
                            value={item.progress} 
                            className={`h-1.5 transition-all ${item.progress === 100 ? "bg-emerald-100 [&>div]:bg-emerald-500" : ""}`} 
                        />

                        {item.error && (
                            <div className="flex items-center gap-1 text-[10px] text-destructive font-medium mt-1">
                            <AlertCircle className="w-3 h-3" />
                            {item.error}
                            </div>
                        )}
                        </div>
                    </div>

                    {/* RIGHT SIDE: ACTIONS */}
                    <div className="flex items-center justify-end">
                        <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted">
                            <MoreVertical className="w-4 h-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem onClick={() => openFile(item)}>
                            <Eye className="w-4 h-4 mr-2" /> View Document
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => downloadFile(item)}>
                            <Download className="w-4 h-4 mr-2" /> Download
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                            className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                            onClick={() => removeFile(index)}
                            >
                            <Trash2 className="w-4 h-4 mr-2" /> Delete File
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                    </Card>
                </motion.div>
            </AnimatePresence>
            ))
        ) : (
            <p className="text-sm text-muted-foreground">
            No documents uploaded
            </p>
        )}

        </div>

      </ScrollArea>

    </CardContent>
  </Card>
  </motion.div>

    {/* ================= REVIEWS ================= */}
            <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, ease: "easeOut" }}
    whileHover={{ y: -4 }}
    >
    <Card className="rounded-2xl shadow-sm hover:shadow-md transition-shadow">

    <CardHeader>
        <CardTitle className="text-base font-semibold tracking-tight">
        Reviews
        </CardTitle>
        <CardDescription>
        What people say about your company
        </CardDescription>
    </CardHeader>

    <CardContent>

        <ScrollArea className="h-[340px] pr-2">

        <div className="space-y-3">

            {companyReviews?.length ? (
            companyReviews.map((r) => (
                <div
                key={r.id}
                className="flex gap-3 p-3 rounded-xl border bg-card hover:bg-muted/40 transition"
                >

                {/* AVATAR */}
                <Avatar className="h-9 w-9 shrink-0">
                    <AvatarImage src={r.studentImage} />
                    <AvatarFallback>
                    {r.name?.[0]}
                    </AvatarFallback>
                </Avatar>

                {/* CONTENT */}
                <div className="flex-1 min-w-0 space-y-1">

                    {/* HEADER */}
                    <div className="flex items-center justify-between gap-2">

                    <p className="text-sm font-medium truncate">
                        {r.name}
                    </p>

                    {/* STARS */}
                    <div className="flex gap-0.5 text-xs">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < r.rating
                                    ? "fill-primary text-primary"
                                    : "fill-muted-foreground text-muted-foreground"
                                }`}
                              />
                            ))}
                    </div>

                    </div>

                    {/* DATE */}
                    <p className="text-xs text-muted-foreground">
                    {new Date(r.createdAt).toLocaleDateString()}
                    </p>

                    {/* REVIEW TEXT */}
                    <p className="text-sm text-muted-foreground line-clamp-4">
                    {r.review}
                    </p>

                </div>

                </div>
            ))
            ) : (
            <p className="text-sm text-muted-foreground">
                No reviews yet
            </p>
            )}

        </div>

        </ScrollArea>

    </CardContent>

    </Card>
    </motion.div>
    </div>
   
                

            </div>

            <CorporateModal
                isOpen={isModalOpen1}
                Corporate={editingCorporate}
                onClose={() => setIsModalOpen1(false)}
                onSave={async (data) => {
                    await updateProfile({ corporate: data.description });
                    setIsModalOpen1(false);
                }}
            />
            <ProgramsModal
                isOpen={isModalOpen2}
                Program={editingProgram}
                onClose={() => setIsModalOpen2(false)}
                onSave={async (data) => {
                    await api.post('/company/programs/add', { programs: data.Program });
                    await getPrograms();
                    await getProfile();
                    setIsModalOpen2(false);
                }}
            />
            <AddressModal
                isOpen={isModalOpen3}
                Address={editingAddress}
                onClose={() => setIsModalOpen3(false)}
                onSave={async (data) => {
                    await api.post('/api/company/addresses', {
                        name: data.name,
                        tag: data.tag || "Primary",
                        address: data.address,
                        phoneNumber: data.phoneNumber,
                    });
                    await getProfile();
                    setIsModalOpen3(false);
                }}
            />


        </DashboardLayout>
    );
}