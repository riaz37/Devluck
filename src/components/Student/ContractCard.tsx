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
} from "lucide-react";


import { Button } from "@/components/ui/button";
import { InfoItem } from "../common/info-item";

interface ContractCardProps {
  contract: {
    id: string;
    applicantId: number;
    contractTitle: string;
    company: string;
    jobType: string;
    location: string;
    note: string;
    startDate: string;
    endDate: string;
    status: string;
    salary: string;
    startedAt: string;
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

  return (
    <Card className="rounded-2xl shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle className="text-base font-semibold leading-tight">
            {truncate(contract.contractTitle)}
          </CardTitle>

          <CardDescription>
            {truncate(contract.company, 20)}
          </CardDescription>
        </div>

        {/* RIGHT SIDE ACTIONS */}
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="flex items-center gap-1 text-xs">
            <Fingerprint className="h-3 w-3" />
            {contract.id.slice(0, 8)}
          </Badge>

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
        </div>
      </CardHeader>

      {/* CONTENT */}
      <CardContent className="flex flex-col gap-3 flex-1">
        
        {/* Top meta */}
        <div className="flex items-center justify-between">


        </div>

        <Separator />

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-4">
          <InfoItem
            label="Start Date"
            value={contract.startedAt}
            icon={<Calendar className="w-4 h-4" />}
          />

          <InfoItem
            label="Duration"
            value={truncate(contract.endDate)}
            icon={<Calendar className="w-4 h-4" />}
          />

          <InfoItem
            label="Salary"
            value={truncate(contract.salary, 12)}
          />

          <InfoItem
            label="Status"
            value={
            <Badge
              variant="outline"
              className={getStatusStyles()}
              >
              {contract.status}
            </Badge>}
            icon={<BadgeCheck className="w-4 h-4" />}
          />


        </div>

        <Separator />
        {/* Description / Note */}
        <div className="space-y-1">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Note
          </p>

          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 break-words">
            {contract.note || "No note available"}
          </p>
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