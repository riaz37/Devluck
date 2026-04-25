"use client";
import { useState, useMemo, useRef, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import DashboardLayout from "@/components/Company/DashboardLayout";

import { useContractHandler } from "@/hooks/companyapihandler/useContractHandler";
import { usePaymentHandler } from "@/hooks/companyapihandler/usePaymentHandler";
import { api } from "@/lib/api";
import { AlertCircle, ArrowLeft, Calendar, Clock, CreditCard, DollarSign, FileText, Layers, Mail, Plus, Star, Trophy, UserCheck,  } from "lucide-react";
import { SyncLoader } from "react-spinners";

import { useStudentProfileReview } from "@/hooks/common/useStudentProfileReview";
import { LoadingState } from "@/components/common/LoadingState";
import EmptyStateFeedback from "@/components/common/EmptyStateFeedback";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CardContent, CardDescription, CardHeader, CardTitle,Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatsCard } from "@/components/common/stats-card";
import ReviewModal from "@/components/Company/Modal/ReviewModal";
import { motion } from "framer-motion";
interface Payment {
  id: string;
  applicantName: string;
  contractId?: string;
  nextPayment: string;
  monthlyAllowance?: string;
  note?: string;
  paymentStatus: string;
  applicantId?: string | null;
  transferId?: string | null;
  workLocation?: string | null;
  method?: string | null;
  companyId: string;
  createdAt: string;
  updatedAt: string;
}

const ITEMS_PER_PAGE = 6;
export default function ApplicantPage() {
  const { reviews, loading: reviewsLoading, getStudentReviews, createStudentReview, toast: reviewToast, closeToast } = useStudentProfileReview();

  const [isModalOpen1, setIsModalOpen1] = useState(false);
  const [editingReviews, setEditingReviews] = useState<any>(null);

  const handleSaveReview = async (data: { rating: number; comment: string; id?: string }) => {
    if (student?.id) {
      await createStudentReview(student.id, { rating: data.rating, comment: data.comment });
    }
    setIsModalOpen1(false);
    setEditingReviews(null);
  };

  const truncateTextFlex = (
    text: string | null | undefined,
    maxLength: number = 24
  ) => {
    if (!text) return "N/A";
    return text.length > maxLength ? text.slice(0, maxLength) + ".." : text;
  };
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
          setMenuOpen(false);
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, []);
  const router = useRouter();
  const [bulkDelete, setBulkDelete] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const handleSelect = (id: string, checked: boolean) => {
    setSelectedIds((prev) =>
      checked ? [...prev, id] : prev.filter((x) => x !== id)
    );
  };



  const params = useParams<{ applicantId: string }>();
  const contractId = params.applicantId; // This is actually the contract ID
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // ------------------ States -------------------
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<any>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [contract, setContract] = useState<any>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [paymentStats, setPaymentStats] = useState<{ totalPaid: { amount: number; count: number }; pending: { amount: number; count: number }; due: { amount: number; count: number } } | null>(null);
  const [paymentsLoading, setPaymentsLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [contractLoading, setContractLoading] = useState(true);
  const [contractError, setContractError] = useState<string | null>(null);
  const [student, setStudent] = useState<any>(null);
  const [studentLoading, setStudentLoading] = useState(true);
  const [showApplicants, setShowApplicants] = useState(true);
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<PaymentStatus[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // ------------------ Hooks -------------------
  const { getContractById } = useContractHandler();
  const { listPayments, getPaymentStats, deletePayment, error: paymentError } = usePaymentHandler();

  // ------------------ Fetch Contract, Student Profile, and Payments -------------------
  useEffect(() => {
    const fetchData = async () => {
      if (!contractId) {
        setContractLoading(false);
        setContractError("Contract ID is missing");
        return;
      }

      try {
        setContractLoading(true);
        setContractError(null);
        setStudentLoading(true);

        // Fetch contract
        const contractData = await getContractById(contractId);
        setContract(contractData);

        // Fetch student profile with full data if studentId exists
        const contractWithStudentId = contractData as any;
        if (contractWithStudentId.studentId) {
          try {
            const studentResponse = await api.get<{ status: string; data: any }>(
              `/api/company/students/${contractWithStudentId.studentId}?fullProfile=true`
            );
            setStudent(studentResponse.data.data);
            await getStudentReviews(contractWithStudentId.studentId);
          } catch (error: any) {
            // Don't fail the whole page if student profile fails
          } finally {
            setStudentLoading(false);
          }
        } else {
          setStudentLoading(false);
        }

        // Fetch payments and stats for this contract
        setPaymentsLoading(true);
        setStatsLoading(true);
        try {
          const contractUuid = contractData.id;
          const [paymentsResponse, statsResponse] = await Promise.all([
            listPayments(1, 100, undefined, undefined, contractUuid),
            getPaymentStats(contractUuid)
          ]);
          setPayments(paymentsResponse.items);
          setPaymentStats(statsResponse);
        } catch (paymentError: any) {
          setPayments([]);
          setPaymentStats(null);
        } finally {
          setPaymentsLoading(false);
          setStatsLoading(false);
        }
      } catch (error: any) {
        setContractError(error.message || "Failed to fetch contract");
        setContract(null);
      } finally {
        setContractLoading(false);
      }
    };

    fetchData();
  }, [contractId, getContractById, listPayments, getPaymentStats]);



  // ------------------ Filtered Payments -------------------
  type PaymentStatus = "Pending" | "Due" | "Paid" | "All";
  const PAYMENT_STATUSES: PaymentStatus[] = ["Pending", "Due", "Paid", "All"];

  // Map API payments to match the expected format
  const mappedPayments = useMemo(() => {
    return payments.map((payment: any) => ({
      companyId: payment.companyId || "",         // Added
      createdAt: payment.createdAt || "",         // Added
      updatedAt: payment.updatedAt || "",         // Added
      id: payment.id,
      applicantId: payment.studentId || payment.applicantId || "",
      applicantName: payment.applicantName || "",
      contractId: payment.contractId || "",
      transferId: payment.transferId || "",
      nextPayment: payment.nextPayment || "",
      monthlyAllowance: payment.monthlyAllowance || "",
      method: payment.method || "",
      note: payment.note || "",
      workLocation: payment.workLocation || "",
      paymentStatus: payment.paymentStatus || "Pending"
    }));
  }, [payments]);

  const filteredPayments = useMemo(() => {
    return mappedPayments.filter(payment => {
      // Search filter
      const searchMatch =
        !searchQuery.trim() ||
        (payment.applicantId && payment.applicantId.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (payment.applicantName && payment.applicantName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (payment.contractId && payment.contractId.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (payment.transferId && payment.transferId.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (payment.method && payment.method.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (payment.workLocation && payment.workLocation.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (payment.monthlyAllowance && payment.monthlyAllowance.toString().toLowerCase().includes(searchQuery.toLowerCase())) ||
        (payment.note && payment.note.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (payment.paymentStatus && payment.paymentStatus.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (payment.nextPayment && payment.nextPayment.toLowerCase().includes(searchQuery.toLowerCase()));

      // Payment status filter
      const paymentMatch =
        selectedPaymentStatus.length === 0 ||
        selectedPaymentStatus.includes("All") ||
        selectedPaymentStatus.includes(payment.paymentStatus as "Pending" | "Due" | "Paid");

      return searchMatch && paymentMatch;
    });
  }, [mappedPayments, searchQuery, selectedPaymentStatus]);

  // Payments for this contract
  const applicantPayments = filteredPayments;

  // ------------------ Pagination -------------------
  const totalPages = Math.ceil(applicantPayments.length / ITEMS_PER_PAGE);
  const paginatedPayments = applicantPayments.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };
  const goToPrevious = () => {
    if (currentPage > 1) setCurrentPage(prev => prev - 1);
  };
  const goToNext = () => {
    if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
  };


    const VISIBLE_PAGES = 5;

    // Compute start and end of visible page range
    const startPage = Math.max(1, Math.min(currentPage, totalPages - VISIBLE_PAGES + 1));
    const endPage = Math.min(totalPages, startPage + VISIBLE_PAGES - 1);
    const visiblePages = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
    const showPlus = endPage < totalPages; // whether to show "+" button



    const formatCurrency = (amount: number) => {
      if (statsLoading) {
        return <SyncLoader size={8} color="#D4AF37" />;
      }

      const formatted = `${amount.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })} ${contract?.currency || "SAR"}`;

      return (
        <span style={{ color: amount === 0 ? "gray" : "inherit" }}>
          {formatted}
        </span>
      );
    };

  // ------------------ Modal Handlers -------------------
  const openModal = (payment: any) => {
    setEditingPayment(payment);
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setEditingPayment(null);
    setIsModalOpen(false);
  };
  const [expanded, setExpanded] = useState<string | null>(null);
  const isActive = student?.status === "active";

  if (contractLoading) {
    return (
      <DashboardLayout>
      <div className="flex h-screen items-center justify-center">
        <LoadingState label="Fetching Data..." />
      </div>
    </DashboardLayout>
    );
  }

  if (contractError || !contract) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[calc(100vh-80px)] items-center justify-center px-4">
        <EmptyStateFeedback
          type={contractError ? "error" : "notfound"}
          title={
            contractError
              ? "Error loading applicant profile"
              : "Applicant Not Found"
          }
          description={
            contractError
              ? "Something went wrong. Please try again."
              : "No applicant found with this ID."
          }
          id={!student ? contract : undefined}
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
<div className="rounded-2xl overflow-hidden bg-background border shadow-sm">
  {/* COVER IMAGE */}
  <div className="h-[220px] w-full relative">
    <img
      src="/default-cover.svg"
      className="w-full h-full object-cover"
      alt="Cover"
    />
  </div>

  {/* PROFILE CONTENT AREA */}
  <div className="px-6 pb-6 relative">
    
    {/* PROFILE ROW (Avatar overlap) */}
    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 -mt-8">
      {/* LEFT SIDE: AVATAR & BASIC INFO */}
      <div className="flex items-end gap-4">
              {/* AVATAR */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="relative w-30 h-30 cursor-pointer"
              >
                {/* Avatar circle */}
                <div className="relative w-full h-full rounded-full border-2 border-background bg-white shadow-md overflow-hidden flex items-center justify-center group">
                  <Avatar className="w-full h-full">
                    <AvatarImage src={student?.image || ""} className="object-cover w-full h-full" />
                    <AvatarFallback className="bg-primary/10 text-primary font-bold text-xl w-full h-full flex items-center justify-center">
                      {student?.name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>

                  {/* HOVER OVERLAY */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    {student?.name}
                  </div>
                </div>

                {/* STATUS DOT (OUTSIDE CLIP → FIXED) */}
                <div
                  className={`absolute bottom-1.5 right-3 z-20 h-4 w-4 rounded-full border-2 border-background ${
                    isActive ? "bg-emerald-500" : "bg-slate-400"
                  }`}
                />
              </motion.div>

        <div className="pb-2 space-y-1">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold">{student?.name}</h2>
            <Badge className={`text-[10px] uppercase font-bold ${isActive ? "bg-emerald-500/10 text-emerald-600" : "bg-muted text-muted-foreground"}`}>
              {student?.status || "offline"}
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Mail className="h-3.5 w-3.5" />
            {student?.email || "No contact provided"}
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: EXPERT SCORE */}
      <div className="bg-primary/10 p-3 rounded-2xl text-center min-w-[120px] border border-primary/20">
        <p className="text-[10px] uppercase font-bold tracking-tighter text-primary/60 mb-1">Expert Score</p>
        <div className="flex items-center justify-center gap-2">
          <Trophy className="w-5 h-5 text-primary" />
          <span className="text-3xl font-black text-primary">{student?.profileRanking}</span>
        </div>
      </div>
    </div>

    {/* ================= PAYMENT DETAILS SECTION ================= */}
    <div className="mt-10 pt-8 border-t">
      <div className="flex items-center justify-between mb-6">
        <div className="space-y-1">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-muted-foreground" />
            Payment Details
          </h3>
          <p className="text-xs text-muted-foreground">Financial overview and outstanding balances</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        <StatsCard
          title="Total Paid"
          value={formatCurrency(paymentStats?.totalPaid.amount || 0)}
          subtitle={statsLoading ? "Loading..." : `${paymentStats?.totalPaid.count || 0} payments`}
          icon={<DollarSign className="w-4 h-4" />}
          iconColor="#22C55E"
        />
        <StatsCard
          title="Pending Payment"
          value={formatCurrency(paymentStats?.pending.amount || 0)}
          subtitle={statsLoading ? "Loading..." : `${paymentStats?.pending.count || 0} pending`}
          icon={<Clock className="w-4 h-4" />}
          iconColor="#F59E0B"
        />
        <StatsCard
          title="Due"
          value={formatCurrency(paymentStats?.due.amount || 0)}
          subtitle={statsLoading ? "Loading..." : `${paymentStats?.due.count || 0} due`}
          icon={<AlertCircle className="w-4 h-4" />}
          iconColor="#EF4444"
        />
      </div>
    </div>

    {/* ================= APPLICANT OVERVIEW (STATS + PROGRESS) ================= */}
    <div className="mt-10 pt-8 border-t">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div className="space-y-1">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-muted-foreground" />
            Applicant Overview
          </h3>
          <p className="text-xs text-muted-foreground">Key recruitment metrics and profile status</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* QUICK STATS GRID */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1">
          {[
            { label: "Contracts", value: "N/A", icon: FileText },
            { label: "Applications", value: "N/A", icon: Layers },
            { 
              label: "Salary", 
              value: student?.salaryExpectation ? `$${student.salaryExpectation}` : "N/A", 
              icon: DollarSign 
            },
            { 
              label: "Availability", 
              value: student?.availability || "N/A", 
              icon: Calendar 
            },
          ].map((stat) => (
            <div key={stat.label} className="p-4 rounded-xl border bg-muted/30 hover:bg-muted/50 transition">
              <div className="flex items-center gap-2 text-muted-foreground">
                <stat.icon className="h-3.5 w-3.5" />
                <span className="text-[11px] font-bold uppercase">{stat.label}</span>
              </div>
              <p className="mt-1 text-sm font-semibold">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* COMPLETION PROGRESS */}
        <div className="w-full lg:w-[280px] p-4 rounded-xl border bg-muted/30 flex flex-col justify-center border-dashed">
          <div className="flex justify-between mb-2">
            <span className="text-xs font-bold uppercase">Profile Completion</span>
            <span className="text-sm font-bold text-primary">{student?.profileComplete ?? 0}%</span>
          </div>
          <Progress value={student?.profileComplete ?? 0} className="h-2" />
        </div>
      </div>
    </div>

    {/* ================= DESCRIPTION ================= */}
    <div className="mt-8">
      <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-3">Professional Summary</h3>
      <p className="text-sm text-muted-foreground leading-relaxed max-w-4xl">
        {student?.description || "Applicant description not found."}
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
                  setIsModalOpen1(true);
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
      isOpen={isModalOpen1}
      onClose={() => {
        setIsModalOpen1(false);
        setEditingReviews(null);
      }}
      onSave={handleSaveReview}
    />

    </DashboardLayout>
  );
}
