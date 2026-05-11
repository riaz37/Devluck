"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

import {
  MoreVertical,
  FileText,
  XCircle,
  Eye,
  Calendar,
  Building2,
  DollarSign,
  PlayCircle,
  RotateCcw,
  Fingerprint,
  MapIcon,
  CalendarCheck,
  MapPin,
  Briefcase,
  Activity,
  Target,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { InfoItem } from "../common/info-item";
import { MappedOpportunity } from "@/types/application";
import { cn } from "@/lib/utils";

/* ── single meta cell ── */
function MetaCell({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-muted/50 rounded-lg px-2.5 py-2">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5 flex items-center gap-1">
        {icon}
        {label}
      </p>
      <p className="text-xs font-medium text-foreground truncate">{value}</p>
    </div>
  );
}


interface AppliedOpportunityCardProps {
  applicant: MappedOpportunity;
  onClick?: () => void;
  onWithdraw?: () => void;
  isWithdrawing?: boolean;
  onAssessmentAction?: () => void;
  assessmentActionLabel?: string;
  isAssessmentActionLoading?: boolean;
  assessmentActionDisabled?: boolean;
}

export const AppliedOpportunityCard = ({
  applicant,
  onClick,
  onWithdraw,
  isWithdrawing,
  onAssessmentAction,
  assessmentActionLabel,
  isAssessmentActionLoading,
  assessmentActionDisabled,
}: AppliedOpportunityCardProps) => {
  const truncate = (text?: string, max = 22) =>
    text ? (text.length > max ? text.slice(0, max) + "…" : text) : "N/A";

  const getAssessmentActionColor = () => {
    const label = String(assessmentActionLabel || "").toLowerCase();
    if (label.includes("resume")) {
      return "bg-blue-100 text-blue-700 border border-blue-200 hover:bg-blue-100";
    }
    if (label.includes("start")) {
      return "bg-emerald-100 text-emerald-700 border border-emerald-200 hover:bg-emerald-100";
    }
    if (label.includes("completed")) {
      return "bg-green-100 text-green-700 border border-green-200 hover:bg-green-100";
    }
    if (label.includes("deadline")) {
      return "bg-red-100 text-red-700 border border-red-200 hover:bg-red-100";
    }
    if (label.includes("unavailable") || label.includes("cannot")) {
      return "bg-amber-100 text-amber-700 border border-amber-200 hover:bg-amber-100";
    }
    return "bg-muted text-muted-foreground border border-border";
  };

  return (
    <Card className="rounded-2xl shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5">
      
      {/* ── CARD HEADER ─────────────────────────── */}
      <CardHeader className="pt-4 pb-0 px-4">
        <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">

          {/* Company logo */}
          <Avatar className="h-12 w-12 shrink-0 ring-2 ring-muted rounded-full">
            {applicant.companyLogo && (
              <AvatarImage
                src={applicant.companyLogo}
                alt={applicant.company}
                className="object-cover"
              />
            )}
            <AvatarFallback className="bg-primary/10 text-primary font-semibold text-base rounded-full">
              {applicant.company?.charAt(0)?.toUpperCase() ?? "C"}
            </AvatarFallback>
          </Avatar>

          {/* Title + company */}
          <div className="min-w-0 flex-1">
            <CardTitle className="text-base font-semibold leading-tight truncate">
              {applicant.opportunityTitle}
            </CardTitle>
            <CardDescription className="text-xs truncate mt-0.5">
              {applicant.company}
            </CardDescription>
          </div>

        </div>

        {/* MENU */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-2 rounded-md hover:bg-muted cursor-pointer">
              <MoreVertical className="w-5 h-5" />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onClick}>
              <FileText className="w-4 h-4 mr-2" />
              Details
            </DropdownMenuItem>
            {assessmentActionLabel && (
              <DropdownMenuItem
                onClick={onAssessmentAction}
                disabled={isAssessmentActionLoading || assessmentActionDisabled || !onAssessmentAction}
              >
                {assessmentActionLabel.toLowerCase().includes("resume") ? (
                  <RotateCcw className="w-4 h-4 mr-2" />
                ) : (
                  <PlayCircle className="w-4 h-4 mr-2" />
                )}
                {isAssessmentActionLoading ? "Starting..." : assessmentActionLabel}
              </DropdownMenuItem>
            )}

            <DropdownMenuItem
              onClick={onWithdraw}
              className="text-red-600 focus:text-red-600"
              disabled={isWithdrawing}
            >
              <XCircle className="w-4 h-4 mr-2" />
              Withdraw
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        </div>
      </CardHeader>

      {/* CONTENT */}
      <CardContent className="px-4 pt-4 pb-0 space-y-3">
          {/* TYPE BADGE + ID CHIP */}
          <div className="flex items-center justify-between mb-4">
            {/* TYPE BADGE */}
            <Badge
              className={cn(
                "shrink-0 flex items-center gap-1.5 text-xs font-medium px-2.5 py-0.5 ",
                
                // Object conditional - ONLY ONE matches
                {
                  "bg-blue-100 text-blue-700  !important": applicant.opportunityStatus === "Applied",
                  "bg-emerald-100 text-emerald-700  !important": applicant.opportunityStatus === "Upcoming Interview",
                  "bg-red-100 text-red-700  !important": applicant.opportunityStatus === "Rejected",
                  "bg-gray-100 text-gray-700 !important": applicant.opportunityStatus === "Withdrawn",
                },
                
                // Fallback - only applies if NO status matches
                applicant.opportunityStatus ? "" : "bg-muted/50 text-muted-foreground "
              )}
            >
              <Target className="h-3 w-3" />
              {applicant.opportunityStatus ?? "N/A"}
            </Badge>
            
            {/* ID CHIP - RIGHT */}
            <div className="flex items-center gap-1 text-[11px] text-muted-foreground font-mono bg-muted px-2.5 py-0.5 rounded-md">
              <Fingerprint className="h-3 w-3" />
              {applicant.opportunityId?.slice(0, 8) || "N/A"}
            </div>
          </div>

        <Separator />
        {/* INFO GRID - 6 items, 2 rows */}
        <div className="grid grid-cols-2 gap-4">
          
          {/* Row 1 */}
          <InfoItem
            label="Applied On"
            value={truncate(applicant.appliedAt || "N/A", 12)}
            icon={<Calendar className="w-4 h-4" />}
          />
         
          <InfoItem
            label="Salary"
            value={truncate(applicant.salary || "N/A", 12)}
            icon={<DollarSign className="w-4 h-4" />}
          />

          {/* Row 2 */}
          <InfoItem
            label="Job Type"
            value={truncate(applicant.jobType || "N/A", 12)}
            icon={<Briefcase className="w-4 h-4" />}
          />

          <InfoItem
            label="Location"
            value={applicant.location || "N/A"}
            icon={<MapPin className="w-4 h-4" />}
          />

        </div>

        {/* DESCRIPTION */}
        <div className="space-y-2 pt-2 ">
          <div className="flex items-center gap-2">
            <span className="h-px flex-1 bg-border/60" />
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground whitespace-nowrap">
              Opportunity Description
            </span>
            <span className="h-px flex-1 bg-border/60" />
          </div>

          <div className="rounded-lg border border-border/40 bg-muted/20 px-4 py-3">
            <p className={cn(
              "text-sm leading-6 line-clamp-2 min-h-[3rem]",
              applicant.jobDescription?.trim()
                ? "text-foreground"
                : "text-muted-foreground/70 italic"
            )}>
              {applicant.jobDescription?.trim() 
                ? applicant.jobDescription 
                : "No opportunity description available."}
            </p>
          </div>
        </div>
      </CardContent>

      {/* FOOTER */}
      <CardFooter className="px-4 pt-3 pb-4 flex gap-2">
        {assessmentActionLabel ? (
          <Button
            onClick={onAssessmentAction}
            className={`flex-1 justify-between cursor-pointer ${getAssessmentActionColor()}`}
            disabled={isAssessmentActionLoading || assessmentActionDisabled || !onAssessmentAction}
            variant="secondary"
          >
            {isAssessmentActionLoading ? "Starting..." : assessmentActionLabel}
            {assessmentActionLabel.toLowerCase().includes("resume") ? (
              <RotateCcw className="w-4 h-4" />
            ) : (
              <PlayCircle className="w-4 h-4" />
            )}
          </Button>
        ) : null}
        <Button
          onClick={onClick}
          className="flex-1 justify-between cursor-pointer"
        >
          Details
          <Eye className="w-4 h-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};