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
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

import {
  MapPin,
  Briefcase,
  Building2,
  DollarSign,
  TrendingUp,
  Calendar,
  Eye,
  Fingerprint,
  Activity,
} from "lucide-react";
import { MappedOpportunity } from "@/types/opportunity-s";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

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
  hasApplied
}: OpportunityCardProps) {
  const truncate = (text?: string, max = 30) =>
    text ? (text.length > max ? text.slice(0, max) + "..." : text) : "N/A";

  return (
    <Card className="rounded-2xl shadow-sm hover:shadow-md transition-all hover:-translate-y-1">

      {/* HEADER */}
      <CardHeader className="flex flex-row items-center justify-between">

        {/* LEFT SIDE: IMAGE + TEXT */}
        <div className="flex items-center gap-3">

          {/* IMAGE (AVATAR STYLE) */}
          <Avatar className="h-10 w-10 ring-2 ring-background shadow-sm flex-shrink-0">
            <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm">
              {opportunity.company?.charAt(0)?.toUpperCase() || "C"}
            </AvatarFallback>
          </Avatar>

            {/* TEXT */}
            <div className="space-y-1">
            <CardTitle className="text-base font-semibold">
                {truncate(opportunity.contractTitle)}
            </CardTitle>

            <CardDescription className="flex items-center gap-2">
                {truncate(opportunity.company, 18)}
            </CardDescription>
            </div>

        </div>

        {/* Top meta */}
        <div className="flex items-center justify-between">
            <Badge variant="secondary" className="flex items-center gap-1 text-xs">
            <Fingerprint className="h-3 w-3" />
            {opportunity.opportunityId.slice(0, 8)}
            </Badge>
        </div>
      </CardHeader>

      {/* CONTENT */}
      <CardContent className="space-y-4">

        {/* Badges */}
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">
            {opportunity.jobType}
          </Badge>

          <Badge variant="outline" className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {truncate(opportunity.location, 12)}
          </Badge>

          <Badge variant="outline" className="flex items-center gap-1">
            <DollarSign className="w-3 h-3" />
            {truncate(opportunity.salary, 10)}
          </Badge>
        </div>

        <Separator />

        {/* Description */}
        <p className="text-sm text-muted-foreground break-words">
        {truncate(opportunity.jobDescription, 150)}
        </p>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Match</span>
            <span className="font-medium">
              {opportunity.workProgress ?? 0}%
            </span>
          </div>

          <Progress value={opportunity.workProgress ?? 0} className="h-2" />
        </div>

        {/* Footer info */}
        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {opportunity.deadline}
          </div>

          <div className="flex items-center gap-1">
           <Activity className="h-3.5 w-3.5" />
            {opportunity.status}
          </div>
        </div>

      </CardContent>

      {/* FOOTER */}
        <CardFooter className="flex gap-2">
        <Button
            onClick={onClick}
            variant="outline"
            className="flex-1"
        >
            Details
            <Eye className="w-4 h-4" />
        </Button>

        <Button
        onClick={onApply}
        disabled={isApplying || hasApplied}
        className="flex-1"
        >
        {hasApplied ? "Applied" : isApplying ? "Applying..." : "Apply"}
        </Button>
        </CardFooter>

    </Card>
  );
}