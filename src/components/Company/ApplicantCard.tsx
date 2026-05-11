"use client";

import { motion } from "framer-motion";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreVertical,
  Mail,
  Calendar,
  Eye,
  Trophy,
  Flag,
  Mic,
  Fingerprint,
  Clock3,
  CheckCircle2,
  XCircle,
  Target,
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

const STATUS_STYLES: Record<ApplicantStatus, { badge: string; dot: string }> = {
  pending:  { badge: "bg-amber-100  text-amber-700  border-amber-200",  dot: "bg-amber-400"  },
  accepted: { badge: "bg-emerald-100 text-emerald-700 border-emerald-200", dot: "bg-emerald-400" },
  rejected: { badge: "bg-red-100    text-red-700    border-red-200",    dot: "bg-red-400"    },
};

export function ApplicantCard({
  applicant,
  onClick,
  onStatusChange,
  onAssignInterview,
  onReport,
}: ApplicantCardProps) {
  const assessmentStatus = applicant.assessmentStatus || "not_started";
  const normalizedAssessment = String(assessmentStatus).toLowerCase();
  const canViewReport = ["completed", "evaluating", "submitted"].includes(normalizedAssessment);
  const assessmentLabel =
    normalizedAssessment === "not_started"
      ? "Assessment not taken"
      : normalizedAssessment.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  const status = ((applicant.status || "pending").toLowerCase() as ApplicantStatus);
  const { badge: badgeStyle, dot: dotStyle } = STATUS_STYLES[status] ?? STATUS_STYLES.pending;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2, transition: { duration: 0.15 } }}
      transition={{ type: "spring", stiffness: 280, damping: 24 }}
      className="w-full max-w-sm mx-auto"
    >
      <Card className="rounded-2xl border bg-card shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">

        {/* ── CARD HEADER ─────────────────────────────── */}
        <CardHeader className="pb-0 pt-4 px-4">
          <div className="flex items-start justify-between gap-2">

            {/* Avatar + name + email */}
            <div className="flex items-center gap-3 min-w-0">
              <Avatar className="h-12 w-12 shrink-0 ring-2 ring-muted">
                <AvatarImage src={applicant.image || undefined} className="object-cover" />
                <AvatarFallback className="bg-primary/10 text-primary font-semibold text-base">
                  {applicant.name?.charAt(0)?.toUpperCase() ?? "U"}
                </AvatarFallback>
              </Avatar>

              <div className="min-w-0">
                <CardTitle className="text-base font-semibold leading-tight truncate">
                  {applicant.name}
                </CardTitle>
                <CardDescription className="flex items-center gap-1 mt-0.5 text-xs truncate">
                  <Mail className="h-3 w-3 shrink-0" />
                  <span className="truncate">{applicant.email}</span>
                </CardDescription>
              </div>
            </div>

            {/* Kebab menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0 rounded-full -mr-1 -mt-1">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-[160px]">
                {applicant.status !== "pending" && (
                  <DropdownMenuItem onClick={() => onStatusChange?.(applicant.applicationId!, "pending")}>
                    <Clock3 className="h-4 w-4 mr-2 text-amber-500" />
                    Mark Pending
                  </DropdownMenuItem>
                )}
                {applicant.status !== "accepted" && (
                  <DropdownMenuItem onClick={() => onStatusChange?.(applicant.applicationId!, "accepted")}>
                    <CheckCircle2 className="h-4 w-4 mr-2 text-emerald-500" />
                    Accept
                  </DropdownMenuItem>
                )}
                {applicant.status !== "rejected" && (
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => onStatusChange?.(applicant.applicationId!, "rejected")}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </DropdownMenuItem>
                )}

                {(onAssignInterview || onReport) && <DropdownMenuSeparator />}

                {onAssignInterview && (
                  <DropdownMenuItem onClick={() => onAssignInterview(applicant)}>
                    <Mic className="h-4 w-4 mr-2" />
                    Assign Interview
                  </DropdownMenuItem>
                )}
                {onReport && canViewReport && (
                  <DropdownMenuItem onClick={() => onReport(applicant)}>
                    <Flag className="h-4 w-4 mr-2" />
                    View Report
                  </DropdownMenuItem>
                )}
                {onReport && !canViewReport && (
                  <DropdownMenuItem disabled>
                    <Flag className="h-4 w-4 mr-2 opacity-40" />
                    {assessmentLabel}
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        {/* ── CARD CONTENT ────────────────────────────── */}
        <CardContent className="px-4 pt-4 pb-0 space-y-3">

          {/* Status + ID row */}
          <div className="flex items-center justify-between">
            <Badge
              variant="outline"
              className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-0.5 ${badgeStyle}`}
            >
              <Target className={`h-3.5 w-3.5`} />
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>

            <div className="flex items-center gap-1 text-[11px] text-muted-foreground font-mono bg-muted px-2 py-0.5 rounded-md">
              <Fingerprint className="h-3 w-3" />
              {(applicant.applicantId || "").slice(0, 8)}
            </div>
          </div>

          <Separator />

          {/* Meta stats */}
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col items-center justify-center rounded-lg bg-muted/50 px-3 py-2.5 gap-0.5">
              <div className="flex items-center gap-1 text-muted-foreground text-[11px]">
                <Calendar className="h-3 w-3" />
                <span>Applied</span>
              </div>
              <p className="text-sm font-semibold text-foreground">
                {applicant.appliedAt
                  ? new Date(applicant.appliedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "2-digit",
                    })
                  : "—"}
              </p>
            </div>

            <div className="flex flex-col items-center justify-center rounded-lg bg-muted/50 px-3 py-2.5 gap-0.5">
              <div className="flex items-center gap-1 text-muted-foreground text-[11px]">
                <Trophy className="h-3 w-3" />
                <span>Ranking</span>
              </div>
              <p className="text-sm font-semibold text-foreground">
                {applicant.profileRanking ?? "N/A"}
              </p>
            </div>
          </div>

        </CardContent>

        {/* ── CARD FOOTER ─────────────────────────────── */}
        <CardFooter className="px-4 pt-3 pb-4">
          <Button
            onClick={() => onClick?.(applicant)}
            className="w-full justify-between group"
            variant="default"
          >
            <span>View Profile</span>
            <Eye className="h-4 w-4 transition-transform duration-150 group-hover:scale-110" />
          </Button>
        </CardFooter>

      </Card>
    </motion.div>
  );
}