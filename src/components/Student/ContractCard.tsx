"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import {
  MoreVertical,
  FileText,
  XCircle,
  Calendar,
  DollarSign,
  MapPin,
  Briefcase,
  Eye,
  Fingerprint,
  BadgeCheck,
  TrendingUp,
  Clock,
  Activity,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";


import { Button } from "@/components/ui/button";
import { InfoItem } from "../common/info-item";
import { cn } from "@/lib/utils";

interface ContractCardProps {
  contract: {
    id: string;
    applicantId: number;

    contractTitle: string;
    company: string;
    location: string;

    workProgress: number;

    startDate: string; // formatted display date

    durationMonths: number;

    status: string;

    salary: string;

    note?: string;
  };

  onDetails?: () => void;
  onDispute?: () => void;
}

export function ContractCard({
  contract,
  onDetails,
  onDispute,
}: ContractCardProps) {
  const truncate = (text?: string, max = 24) =>
    text ? (text.length > max ? text.slice(0, max) + "…" : text) : "N/A";

const getStatusStyles = () => {
  switch (contract.status) {
    case "Running":
      return "bg-green-100 text-green-600 border-green-200";
    case "Completed":
      return "bg-blue-100 text-blue-600 border-blue-200";
    case "Disputed":
      return "bg-yellow-100 text-yellow-600 border-yellow-200";
    default:
      return "bg-muted text-muted-foreground";
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "Running":
      return <Activity className="h-3 w-3" />;
    case "Completed":
      return <CheckCircle2 className="h-3 w-3" />;
    case "Disputed":
      return <AlertTriangle className="h-3 w-3" />;
    default:
      return null;
  }
};

  return (
    <Card className="rounded-2xl shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5">
      <CardHeader className="flex flex-row items-start justify-between pb-2">
        <div className="space-y-1">
          <CardTitle className="text-base font-semibold leading-tight">
            {truncate(contract.contractTitle,35)}
          </CardTitle>

          <CardDescription>
            {truncate(contract.company, 24)}
          </CardDescription>
        </div>

        {/* RIGHT SIDE ACTIONS */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-1 rounded-md hover:bg-muted">
                <MoreVertical className="w-5 h-5" />
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onDetails}>
                <FileText className="w-4 h-4 mr-2" />
                Details
              </DropdownMenuItem>

              {contract.status !== "Disputed" && (
                <DropdownMenuItem onClick={onDispute}>
                  <XCircle className="w-4 h-4 mr-2 text-destructive" />
                  Dispute
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
      </CardHeader>

      <CardContent className="space-y-3">
          {/* STATUS + ID */}
          <div className="flex items-center justify-between">
          <Badge
            variant="outline"
            className={cn(
              "flex items-center gap-1 text-[10px] font-medium uppercase tracking-wide",
              getStatusStyles()
            )}
          >
            {getStatusIcon(contract.status)}
            {contract.status}
          </Badge>

          <Badge variant="secondary" className="flex items-center gap-1 text-xs">
            <Fingerprint className="h-3 w-3" />
            {contract.id.slice(0, 8)}
          </Badge>

          </div>
        {/* TOP GRID */}
        <div className="grid grid-cols-2 gap-4 rounded-xl border bg-muted/20 p-4">

          <InfoItem
            label="Salary"
            value={truncate(contract.salary, 12)}
            highlight
          />

          <InfoItem
            label="Start Date"
            value={contract.startDate}
            icon={<Calendar className="h-3.5 w-3.5" />}
          />

          <InfoItem
            label="Duration"
            value={`${contract.durationMonths} month${contract.durationMonths > 1 ? "s" : ""}`}
            icon={<Clock className="h-3.5 w-3.5" />}
          />

          {/* SHADCN PROGRESS */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                Progress
              </p>

              <span className="text-xs font-semibold text-foreground">
                {contract.workProgress ?? 0}%
              </span>
            </div>

            <Progress value={contract.workProgress ?? 0} className="h-2" />
          </div>

        </div>

        {/* NOTE */}
        <div className="space-y-2">

          <div className="flex items-center gap-2">
            <span className="h-px flex-1 bg-border" />

            <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
              Contract Notes
            </span>

            <span className="h-px flex-1 bg-border" />
          </div>

          <div
            className={cn(
              "px-1 text-sm leading-relaxed min-h-[2.5rem]",
              contract.note ? "text-foreground" : "text-muted-foreground italic"
            )}
          >
            <p className="line-clamp-2 whitespace-pre-wrap">
              {contract.note || "No notes provided for this contract."}
            </p>
          </div>

        </div>

      </CardContent>

      {/* FOOTER */}
        <CardFooter >
            <Button
                onClick={onDetails}
                className="w-full justify-between cursor-pointer"
            >
                View Contract
                <Eye className="h-4 w-4" />
            </Button>
        </CardFooter>
    </Card>
  );
}