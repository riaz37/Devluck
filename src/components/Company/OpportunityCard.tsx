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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
  CalendarClock,
} from "lucide-react";

import { OpportunityUI } from "@/types/opportunity";
import { InfoItem } from "../common/info-item";

interface OpportunityCardProps {
  job?: OpportunityUI;
  onClick?: () => void;
  actions?: {
    onEdit?: () => void;
    onDelete?: () => void;
  };
}

export function OpportunityCard({ job, onClick,actions }: OpportunityCardProps) {
  if (!job) {
    return (
      <Card className="h-full flex items-center justify-center p-6 text-muted-foreground">
        No opportunity data available
      </Card>
    );
  }

  const truncate = (text?: string, max = 40) =>
    text ? (text.length > max ? text.slice(0, max) + "..." : text) : "N/A";

  const formatAllowance = (allowance?: string, currency?: string) => {
    if (!allowance) return "N/A";

    const symbolMap: Record<string, string> = {
      USD: "$",
      EUR: "€",
      SAR: "SAR",
    };

    const symbol = currency ? symbolMap[currency] || currency : "";
    return `${symbol} ${allowance}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
      className="w-full h-full"
    >
      <Card className="h-full flex flex-col rounded-2xl shadow-sm hover:shadow-md transition-all">


        <CardHeader className="flex flex-row items-start justify-between gap-3">

          {/* LEFT SIDE */}
          <div className="space-y-1 min-w-0">

            <CardTitle className="text-base font-semibold truncate">
              {truncate(job.jobName || job.title)}
            </CardTitle>

            <CardDescription className="text-xs text-muted-foreground break-words line-clamp-2 whitespace-normal">
              {job.description
                ? truncate(job.description, 120)
                : "No description available."}
            </CardDescription>

          </div>

          {/* RIGHT SIDE */}
          <div className="flex items-start gap-2 shrink-0">

            {/* BADGES */}
            <div className="flex flex-col items-end gap-1">
              <Badge variant="secondary" className="flex items-center gap-1 text-[10px]">
                <Fingerprint className="h-3 w-3" />
                {job.jobNumber || "—"}
              </Badge>

              <Badge variant="outline" className="flex items-center gap-1 text-[10px]">
                <Target className="h-3 w-3" />
                {job.jobtype || "N/A"}
              </Badge>
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
                    <DropdownMenuItem
                      className="text-red-500"
                      onClick={actions.onDelete}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </CardHeader>

        {/* CONTENT */}
        <CardContent className="space-y-1 flex-1">

          {/* INFO GRID */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 justify-items-center">

            <InfoItem
              label="Country"
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
            />

            <InfoItem
              label="Allowance"
              value={formatAllowance(job.allowance, job.currency)}
            />

          </div>
        </CardContent>

        {/* FOOTER */}
        <CardFooter className="mt-auto">
          <Button
            onClick={onClick}
            className="w-full justify-between rounded-lg cursor-pointer"
          >
            View Details
            <Eye className="h-4 w-4" />
          </Button>
        </CardFooter>

      </Card>
    </motion.div>
  );
}