"use client";

import { motion } from "framer-motion";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreVertical,
  Mail,
  Calendar,
  TrendingUp,
  ArrowRight,
  User,
  CheckCircle2,
  XCircle,
  Clock3,
  BarChart3,
  Eye,
  Trophy,
  Flag,
  Mic,
  Fingerprint,
} from "lucide-react";

import type { Applicant, ApplicantStatus } from "@/types/applicant";
import { InfoItem } from "../common/info-item";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

type ApplicantCardProps = {
  applicant: Applicant;

  onClick?: (applicant: Applicant) => void;

  onStatusChange?: (id: string, status: ApplicantStatus) => void;

  onAssignInterview?: (applicant: Applicant) => void;
  onReport?: (applicant: Applicant) => void;
};
export function ApplicantCard({
  applicant,
  onClick,
  onStatusChange,
  onAssignInterview,
  onReport,
}: ApplicantCardProps) {
  const assessmentStatus = applicant.assessmentStatus || "not_started";
  const normalizedAssessmentStatus = String(assessmentStatus).toLowerCase();
  const canViewReport = ["completed", "evaluating", "submitted"].includes(normalizedAssessmentStatus);
  const assessmentStatusLabel =
    normalizedAssessmentStatus === "not_started"
      ? "Assessment not taken"
      : normalizedAssessmentStatus
          .replace(/_/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase());
  const status =
  ((applicant.status || "pending").toLowerCase() as ApplicantStatus) || "pending";
  const statusStyles: Record<ApplicantStatus, string> = {
    pending:
      "bg-yellow-100 text-yellow-700 ",
    accepted:
      "bg-green-100 text-green-700 ",
    rejected:
      "bg-red-100 text-red-700 ",
  };
return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
      className="w-full max-w-sm mx-auto"
    >
      <Card className="relative p-2 overflow-hidden rounded-xl border  shadow-sm hover:shadow-md transition-all">
        <div className="relative  flex flex-col items-center justify-center">

          {/* LEFT TOP (ID + STATUS) */}
          <div className="absolute left-1 top-1 z-10 flex flex-col gap-1">
            <div className="flex items-center gap-1 bg-black/40 text-white px-2 py-0.5 rounded-md text-[10px] backdrop-blur">
              <Fingerprint className="h-2.5 w-2.5" />
              {(applicant.applicantId || "").slice(0, 6)}
            </div>

            <Badge className={statusStyles[status] || statusStyles.pending}>
              {status}
            </Badge>
          </div>

          {/* RIGHT TOP (MENU) */}
          <div className="absolute right-1 top-1 z-10">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 rounded-full  backdrop-blur flex items-center justify-center transition"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="min-w-[150px]">
                {/* PENDING (hide if already rejected/accepted if you want stricter rules) */}
                {applicant.status !== "pending" && (
                  <DropdownMenuItem
                    onClick={() =>
                      onStatusChange?.(applicant.applicationId!, "pending")
                    }
                  >
                    <Clock3 className="h-4 w-4 mr-2" />
                    Pending
                  </DropdownMenuItem>
                )}

                {/* ACCEPT */}
                  {applicant.status !== "accepted" && (
                    <DropdownMenuItem
                      onClick={() =>
                        onStatusChange?.(applicant.applicationId!, "accepted")
                      }
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2 text-emerald-500" />
                      Accept
                    </DropdownMenuItem>
                  )}

                  {/* ❌ REJECT (HIDE WHEN ALREADY REJECTED) */}
                  {applicant.status !== "rejected" && (
                    <DropdownMenuItem
                      className="text-red-500"
                      onClick={() =>
                        onStatusChange?.(applicant.applicationId!, "rejected")
                      }
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </DropdownMenuItem>
                  )}
                 {/* DIVIDER */}
                {(onAssignInterview || onReport) && (
                  <div className="my-1 border-t" />
                )}

                  {/* OPTIONAL ACTIONS */}
                {onAssignInterview && (
                  <DropdownMenuItem onClick={() => onAssignInterview(applicant)}>
                    <Mic className="h-4 w-4 mr-2" />
                     Assign Interview
                  </DropdownMenuItem>
                )}

                  {onReport && canViewReport && (
                  <DropdownMenuItem onClick={() => onReport(applicant)}>
                    <Flag className="h-4 w-4 mr-2" />
                       Report
                  </DropdownMenuItem>
                )}
                  {onReport && !canViewReport && (
                    <DropdownMenuItem disabled>
                      Assessment: {assessmentStatusLabel}
                    </DropdownMenuItem>
                  )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* AVATAR */}
          <Avatar className="h-50 w-50 ring-2 ring-background shadow-sm mt-6">
            <AvatarImage
              src={applicant.image || undefined}
              className="object-cover"
            />
            <AvatarFallback className="bg-primary/10 text-primary font-bold text-xl">
              {applicant.name?.charAt(0)?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>

        </div>

        <CardHeader className="space-y-2">

          <div className=" text-center space-y-1">
            {/* NAME */}
            <CardTitle className="text-xl font-semibold tracking-tight leading-tight">
              {applicant.name}
            </CardTitle>

            {/* EMAIL (secondary) */}
            <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
              <Mail className="h-3 w-3" />
              <span className="truncate max-w-[180px]">{applicant.email}</span>
            </div>
          </div>

          {/* META ROW */}
            <div className="flex items-center justify-between pt-2">
              
              <InfoItem
                label="Applied"
                value={
                  applicant.appliedAt
                    ? new Date(applicant.appliedAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "2-digit",
                      })
                    : "—"
                }
                icon={<Calendar className="h-3.5 w-3.5" />}
              />

              <InfoItem
                label="Ranking"
                value={`${applicant.profileRanking || "N/A"}`}
                icon={<Trophy className="h-3.5 w-3.5" />}
                highlight
              />

            </div>

        </CardHeader>

        {/* FOOTER */}
        <CardFooter className="p-0 pt-0">
          <Button
            onClick={() => onClick?.(applicant)}
            className="w-full justify-between"
          >
            View Profile
            <Eye className="h-4 w-4" />
          </Button>
        </CardFooter>

      </Card>
    </motion.div>
  );
}