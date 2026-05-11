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
  Calendar,
  Eye,
  Fingerprint,
  Activity,
  Briefcase,
  DollarSign,
  Target,
  Clock,
  Users,
} from "lucide-react";

import { Avatar, AvatarFallback } from "../ui/avatar";
import { InfoItem } from "../common/info-item";
import { MappedOpportunity } from "@/types/opportunity-s";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface OpportunityDashbordCardProps {
  opportunity: MappedOpportunity;
  applied?: boolean;
  onClick?: () => void;
}

export function OpportunityDashbordCard({
  opportunity,
  applied,
  onClick,
}: OpportunityDashbordCardProps) {
  const truncate = (text?: string, max = 50) =>
    text ? (text.length > max ? text.slice(0, max) + "..." : text) : "N/A";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
      className="w-full h-full"
    >
      <Card className="rounded-2xl border bg-card shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden h-full flex flex-col">

        {/* HEADER */}
        <CardHeader className="pb-0 pt-4 px-4">
            {/* LEFT SIDE */}
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
                  {truncate(opportunity.opportunityTitle, 50)}
                </CardTitle>
                <CardDescription className="truncate text-xs">
                  {truncate(opportunity.company, 30)}
                </CardDescription>
              </div>
            </div>


  
        </CardHeader>

        {/* CONTENT */}
        <CardContent className="px-4 pt-4 pb-0 space-y-3">
                      {/* RIGHT SIDE */}
            <div className="flex items-center justify-between mb-4">
                            {/* TYPE BADGE */}
              <Badge
                className={cn(
                  "shrink-0 flex items-center gap-1.5 text-xs font-medium px-2.5 py-0.5 ",
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
              </Badge>
                {/* ID chip - RIGHT */}
                <div className="flex items-center gap-1 text-[11px] text-muted-foreground font-mono bg-muted px-2 py-0.5 rounded-md">
                  <Fingerprint className="h-3 w-3" />
                  {opportunity.opportunityId?.slice(0, 8) || "N/A"}
                </div>


            </div>
             <Separator />
          {/* INFO GRID */}
          <div className="grid grid-cols-2 gap-4">
            <InfoItem
              label="Location"
              value={opportunity.location || "N/A"}
              icon={<MapPin className="h-4 w-4" />}
            />
            <InfoItem
              label="Salary"
              value={opportunity.salary || "N/A"}
              icon={<DollarSign className="h-4 w-4" />}
            />
            <InfoItem
              label="Start Date"
              value={opportunity.startDate || "N/A"}
              icon={<Calendar className="h-4 w-4" />}
            />
            <InfoItem
              label="Duration"
              value={opportunity.timeLength || "N/A"}
              icon={<Clock className="h-4 w-4" />}
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
        <CardFooter className="px-4 pt-3 pb-4">
          <Button
            onClick={onClick}
            variant={applied ? "default" : "secondary"}
            className="w-full justify-between rounded-lg"
          >
            {applied ? "Applied - View Details" : "Apply Now - View Details"}
            <Eye className="w-4 h-4 ml-1" />
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}