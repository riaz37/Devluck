"use client";

import { motion } from "framer-motion";
import {
  MapPin,
  Users,
  Fingerprint,
  Eye,
  DollarSign,
  Briefcase,
  TypeIcon,
  Target,
  Trash2,
  Edit,
  MoreVertical,
  Clock,
} from "lucide-react";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { InfoItem } from "../common/info-item";
import { OpportunityUI } from "@/types/opportunity";
import { cn } from "@/lib/utils";

interface OpportunityCardProps {
  job?: OpportunityUI;
  onClick?: () => void;
  actions?: {
    onEdit?: () => void;
    onDelete?: () => void;
  };
}

export function OpportunityCard({ job, onClick, actions }: OpportunityCardProps) {
  if (!job) {
    return (
      <Card className="h-full flex items-center justify-center p-6 text-muted-foreground">
        No opportunity data available
      </Card>
    );
  }

  const truncate = (text?: string, max = 50) =>
    text ? (text.length > max ? text.slice(0, max) + "..." : text) : "N/A";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
      className="w-full h-full"
    >
      <Card className="rounded-2xl border bg-card shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">

        {/* HEADER */}
        <CardHeader className="pb-0 pt-4 px-4">
          <div className="flex items-start justify-between gap-2">
            {/* LEFT SIDE */}
            <div className="min-w-0">
              <CardTitle className="text-base font-semibold truncate">
                {truncate(job.jobName || job.title)}
              </CardTitle>
              <CardDescription className="flex items-center gap-3 mt-0.5 text-[12px] text-muted-foreground">
                {/* ID */}
                <div className="flex items-center gap-1">
                  <Fingerprint className="w-3 h-3 shrink-0" />
                  <span className="font-mono leading-none">
                    {job.jobNumber}
                  </span>
                </div>
                <span className="w-1 h-1 rounded-full bg-border shrink-0" />
                {/* TYPE BADGE */}
                <span
                  className={cn(
                    "inline-flex items-center gap-1 px-2 py-[2px] rounded-full text-[10px] font-medium",
                    job.jobtype === "Internship"
                      ? "bg-purple-100 text-purple-700"
                      : job.jobtype === "Full-time"
                      ? "bg-green-100 text-green-700"
                      : job.jobtype === "Part-time"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-gray-100 text-gray-600"
                  )}
                >
                  <Target className="h-3 w-3" />
                  {job.jobtype || "N/A"}
                </span>
              </CardDescription>
            </div>

            {/* MENU */}
            {actions && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {actions.onEdit && (
                    <DropdownMenuItem onClick={actions.onEdit}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                  )}
                  {actions.onDelete && (
                    <DropdownMenuItem className="text-red-500" onClick={actions.onDelete}>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </CardHeader>

        <CardContent className="px-4 pt-4 pb-0 space-y-3">
          {/* INFO GRID */}
          <div className="grid grid-cols-2 gap-4">
            <InfoItem
              label="Availability"
              value={job.country || "N/A"}
              icon={<MapPin className="h-4 w-4" />}
            />
            <InfoItem
              label="Applicants"
              value={job.numberOfApplicants || "0"}
              icon={<Users className="h-4 w-4" />}
            />
            <InfoItem
              label="Duration"
              value={job.timeLength || "N/A"}
              icon={<Clock className="h-4 w-4" />}
            />
            <InfoItem
              label="Allowance"
              value={job.salaryDisplay || "N/A"}
              icon={<DollarSign className="h-4 w-4" />}
            />
          </div>

          {/* NOTE SECTION */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="h-px flex-1 bg-border/60" />
              <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground whitespace-nowrap">
                Opportunity Description
              </span>
              <span className="h-px flex-1 bg-border/60" />
            </div>
            <div className="rounded-lg border border-border/40 bg-muted/20 px-3 py-2">
              <p
                className={cn(
                  "text-sm leading-6 line-clamp-2 min-h-[2.5rem]",
                  job.description ? "text-foreground" : "text-muted-foreground italic"
                )}
              >
                {job.description || "No description provided."}
              </p>
            </div>
          </div>
        </CardContent>

        {/* FOOTER */}
        <CardFooter className="px-4 pt-3 pb-4">
          <Button
            onClick={onClick}
            className="w-full justify-between rounded-lg"
          >
            View Details
            <Eye className="h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}