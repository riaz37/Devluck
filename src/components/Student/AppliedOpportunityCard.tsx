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
} from "lucide-react";

import { Avatar, AvatarFallback } from "../ui/avatar";
import { InfoItem } from "../common/info-item";
import { MappedOpportunity } from "@/types/application";




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

  const getStatusColor = () => {
    switch (applicant.originalStatus) {
      case "pending":
        return "text-blue-600 bg-blue-100";
      case "accepted":
        return "text-green-600 bg-green-100";
      case "rejected":
        return "text-red-600 bg-red-100";
      case "withdrawn":
        return "text-gray-600 bg-gray-100";
      default:
        return "bg-muted text-muted-foreground";
    }
  };
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
      
      {/* HEADER */}
      <CardHeader className="flex flex-row items-start justify-between pb-2">
        <div className="flex items-center gap-3">
          {/* IMAGE */}
          <Avatar className="h-10 w-10 ring-2 ring-background shadow-sm bg-primary/10 shrink-0">
            <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm">
              {applicant.company?.charAt(0)?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>

          {/* TEXT */}
          <div className="space-y-1 min-w-0">
            <CardTitle className="text-base font-semibold truncate">
              {truncate(applicant.contractTitle, 20)}
            </CardTitle>

            <CardDescription className="truncate">
              {truncate(applicant.company, 20)}
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
      </CardHeader>

      {/* CONTENT */}
      <CardContent className="space-y-3">

        {/* STATUS */}
        <div className="flex items-center justify-between">
          <Badge className={getStatusColor()}>
            {applicant.opportunityStatus}
          </Badge>

          <Badge variant="secondary" className="flex items-center gap-1 text-xs">
            <Fingerprint className="h-3 w-3" />
            {applicant.originalId.slice(0, 8)}
          </Badge>
        </div>

        <Separator />


          {/* INFO GRID */}
          <div className="grid grid-cols-2 gap-3">

            {/* When user applied */}
            <InfoItem
              label="Applied On"
              value={truncate(applicant.appliedAt, 12)}
              icon={<Calendar className="w-4 h-4" />}
            />

            {/* Salary */}
            <InfoItem
              label="Salary"
              value={truncate(applicant.salary, 12)}
              icon={<DollarSign className="w-4 h-4" />}
            />

            {/* Job Location (better than "Availability") */}
            <InfoItem
              label="Location"
              value={truncate(applicant.location, 12)}
              icon={<MapPin className="w-4 h-4" />}
            />

            {/* Opportunity Start Date (not applicant start date) */}
            <InfoItem
              label="Start Date"
              value={truncate(applicant.startDate, 12)}
              icon={<CalendarCheck className="w-4 h-4" />}
            />
          </div>


      </CardContent>

      {/* FOOTER */}
      <CardFooter className="flex gap-2">
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