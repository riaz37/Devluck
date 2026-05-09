"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

import {
  MapPin,
  DollarSign,
  Calendar,
  Eye,
  Fingerprint,
  Briefcase,
} from "lucide-react";

import { MappedOpportunity } from "@/types/opportunity-s";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { InfoItem } from "../common/info-item";

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
  const truncate = (text?: string, max = 32) =>
    text ? (text.length > max ? text.slice(0, max) + "..." : text) : "N/A";

  return (
    <Card className="rounded-2xl shadow-sm hover:shadow-md transition-all hover:-translate-y-1">

      {/* HEADER */}
      <CardHeader className="flex flex-row items-start justify-between gap-3">

        {/* LEFT */}
        <div className="flex items-center gap-3 min-w-0">

          <Avatar className="h-11 w-11 ring-2 ring-muted shadow-sm">
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {opportunity.company?.charAt(0)?.toUpperCase() || "C"}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 space-y-1">
            <CardTitle className="text-base font-semibold leading-tight truncate">
              {truncate(opportunity.contractTitle)}
            </CardTitle>

            <CardDescription className="text-xs text-muted-foreground truncate">
              {truncate(opportunity.company, 22)}
            </CardDescription>
          </div>

        </div>

        {/* RIGHT META */}
        <Badge
          variant="secondary"
          className="flex items-center gap-1 text-[11px] px-2 py-1 rounded-full shrink-0"
        >
          <Fingerprint className="h-3 w-3" />
          {opportunity.opportunityId.slice(0, 8)}
        </Badge>

      </CardHeader>

      {/* CONTENT */}
      <CardContent className="space-y-4">
        {/* INFO GRID */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <div className="w-full">
            <InfoItem
              label="Type"
              value={opportunity.jobType}
              icon={<Briefcase className="h-3.5 w-3.5" />}
            />
          </div>

          <div className="w-full">
            <InfoItem
              label="Location"
              value={opportunity.location || "N/A"}
              icon={<MapPin className="h-3.5 w-3.5" />}
            />
          </div>

          <div className="w-full">
            <InfoItem
              label="Deadline"
              value={opportunity.deadline || "No deadline"}
              icon={<Calendar className="h-3.5 w-3.5" />}
            />
          </div>

          <div className="w-full">
            <InfoItem
              label="Salary"
              value={opportunity.salary || "N/A"}
              icon={<DollarSign className="h-3.5 w-3.5" />}
            />
          </div>
        </div>

        {/* DESCRIPTION */}
        <div className="rounded-xl border bg-muted/20 px-3 py-2">
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 min-h-[2.5rem]">
            {opportunity.jobDescription?.trim()
              ? opportunity.jobDescription
              : "No job description available for this opportunity."}
          </p>
        </div>

      </CardContent>

      {/* FOOTER */}
      <CardFooter className="flex gap-2 pt-2">

        <Button
          onClick={onClick}
          variant="outline"
          className="flex-1 "
        >
          Details
          <Eye className="w-4 h-4 ml-1" />
        </Button>

        <Button
          onClick={onApply}
          disabled={isApplying || hasApplied}
          className="flex-1 "
        >
          {hasApplied ? "Applied" : isApplying ? "Applying..." : "Apply"}
        </Button>

      </CardFooter>

    </Card>
  );
}