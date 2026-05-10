"use client";

import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import {
  MapPin,
  DollarSign,
  Calendar,
  Eye,
  Fingerprint,
  Briefcase,
  Target,
} from "lucide-react";

import { MappedOpportunity } from "@/types/opportunity-s";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { InfoItem } from "../common/info-item";
import { cn } from "@/lib/utils";

interface OpportunityCardProps {
  opportunity: MappedOpportunity;
  onClick?: () => void;
  onApply?: () => void;
  isApplying?: boolean;
  hasApplied?: boolean;
}

export function OpportunityCard({
  opportunity,
  onClick,
  onApply,
  isApplying,
  hasApplied,
}: OpportunityCardProps) {
  const truncate = (text?: string, max = 36) =>
    text
      ? text.length > max
        ? text.slice(0, max) + "..."
        : text
      : "N/A";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
      className="h-full"
    >
      <Card className="overflow-hidden rounded-2xl border-border/60 shadow-sm hover:shadow-md transition-shadow h-full flex flex-col">

        {/* HEADER */}
        <CardHeader className="flex flex-row items-start justify-between gap-3">

          {/* LEFT */}
          <div className="flex items-center gap-3 min-w-0">

            <Avatar className="h-11 w-11 ring-2 ring-muted shadow-sm shrink-0">

              {opportunity.companyLogo ? (
                <img
                  src={opportunity.companyLogo}
                  alt={opportunity.company}
                  className="h-full w-full object-cover rounded-full"
                />
              ) : (
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                  {opportunity.company?.charAt(0)?.toUpperCase() || "C"}
                </AvatarFallback>
              )}

            </Avatar>

            <div className="min-w-0 space-y-1">
              <CardTitle className="text-base font-semibold truncate">
                {truncate(opportunity.opportunityTitle, 28)}
              </CardTitle>

              <CardDescription className="truncate text-xs">
                {truncate(opportunity.company, 22)}
              </CardDescription>

            </div>

          </div>
            {/* RIGHT */}
            <div className="flex flex-col items-end gap-2 shrink-0">

              {/* ID */}
              <Badge
                variant="secondary"
                className="rounded-full text-[10px] px-2 py-1"
              >
                <Fingerprint className="h-3 w-3 mr-1" />
                {opportunity.opportunityId.slice(0, 8)}
              </Badge>

              {/* TYPE BADGE */}
              <span
                className={cn(
                  "inline-flex items-center gap-1 px-2 py-[2px] rounded-full text-[10px] font-medium",
                  opportunity.jobType === "Full-time"
                    ? "bg-emerald-100 text-emerald-700"
                    : opportunity.jobType === "Part-time"
                    ? "bg-blue-100 text-blue-700"
                    : opportunity.jobType === "Internship"
                    ? "bg-purple-100 text-purple-700"
                    : "bg-muted text-muted-foreground"
                )}
              >
                <Target className="h-3 w-3" />
                {opportunity.jobType || "N/A"}
              </span>

            </div>

        </CardHeader>

        {/* CONTENT */}
        <CardContent className="flex-1 space-y-2">

          {/* INFO ROW */}
          <div className="grid grid-cols-4 items-center text-center gap-1">
            <InfoItem
              label="Location"
              value={opportunity.location || "N/A"}
              icon={<MapPin className="h-4 w-4" />}
            />

            <InfoItem
              label="Salary"
              value={opportunity.salary || "N/A"}
            />

            <InfoItem
              label="Start Date"
              value={opportunity.startDate || "N/A"}
              icon={<Calendar className="h-4 w-4" />}
            />

            <InfoItem
              label="Duration"
              value={opportunity.timeLength || "N/A"}
            />

          </div>

          {/* DESCRIPTION */}
          <div className="space-y-3">

            <div className="flex items-center gap-2">
              <span className="h-px flex-1 bg-border/60" />

              <span className="text-[10px] uppercase tracking-widest text-muted-foreground whitespace-nowrap">
                Opportunity Description
              </span>

              <span className="h-px flex-1 bg-border/60" />
            </div>

            <div className="rounded-lg border border-border/40 bg-muted/20 px-3 py-2">

              <p
                className={cn(
                  "text-sm leading-6 line-clamp-2 min-h-[2.5rem]",
                  opportunity.jobDescription
                    ? "text-foreground"
                    : "text-muted-foreground italic"
                )}
              >
                {opportunity.jobDescription?.trim()
                  ? opportunity.jobDescription
                  : "No job description available."}
              </p>

            </div>
          </div>

        </CardContent>

        {/* FOOTER */}
        <CardFooter className="flex gap-2">

          <Button
            onClick={onClick}
            variant="outline"
            className="flex-1 justify-between rounded-lg"
          >
            Details
            <Eye className="w-4 h-4" />
          </Button>

          <Button
            onClick={onApply}
            disabled={isApplying || hasApplied}
            className="flex-1 rounded-lg"
          >
            {hasApplied
              ? "Applied"
              : isApplying
              ? "Applying..."
              : "Apply"}
          </Button>

        </CardFooter>

      </Card>
    </motion.div>
  );
}