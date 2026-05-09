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
} from "lucide-react";

import { Avatar, AvatarFallback } from "../ui/avatar";
import { InfoItem } from "../common/info-item";

interface CardContract {
  id: string | number;
  contractTitle: string;
  company?: string;
  salary?: string;
  workProgress?: number;
  opportunityStatus?: string;
  location?: string;
  deadline?: string;
}

interface OpportunityDashbordCardProps {
  contract: CardContract;
  applied?: boolean;
  onClick?: () => void;
}

export function OpportunityDashbordCard({
  contract,
  applied,
  onClick,
}: OpportunityDashbordCardProps) {
  const truncate = (text?: string, max = 32) =>
    text ? (text.length > max ? text.slice(0, max) + "..." : text) : "N/A";

  return (
      <Card className="rounded-2xl shadow-sm hover:shadow-md ">

      {/* HEADER */}
      <CardHeader className="flex flex-row items-start justify-between gap-3">

        {/* LEFT */}
        <div className="flex items-center gap-3 min-w-0">

          <Avatar className="h-11 w-11 ring-2 ring-muted shadow-sm">
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {contract.company?.charAt(0)?.toUpperCase() || "C"}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 space-y-1">
            <CardTitle className="text-base font-semibold leading-tight truncate">
              {truncate(contract.contractTitle)}
            </CardTitle>

            <CardDescription className="text-xs text-muted-foreground truncate">
              {truncate(contract.company, 22)}
            </CardDescription>
          </div>

        </div>

        {/* META */}
        <Badge
          variant="secondary"
          className="flex items-center gap-1 text-[11px] px-2 py-1 rounded-full shrink-0"
        >
          <Fingerprint className="h-3 w-3" />
          {String(contract.id).slice(0, 8)}
        </Badge>

      </CardHeader>

      {/* CONTENT */}
      <CardContent className="space-y-4">

        {/* INFO GRID (MATCHED STYLE) */}
        <div className="grid grid-cols-2 gap-3 pt-1">

          <div className="w-full">
            <InfoItem
              label="Type"
              value={contract.opportunityStatus || "Contract"}
              icon={<Briefcase className="h-3.5 w-3.5" />}
            />
          </div>

          <div className="w-full">
            <InfoItem
              label="Location"
              value={contract.location || "N/A"}
              icon={<MapPin className="h-3.5 w-3.5" />}
            />
          </div>

          <div className="w-full">
            <InfoItem
              label="Deadline"
              value={contract.deadline || "No deadline"}
              icon={<Calendar className="h-3.5 w-3.5" />}
            />
          </div>

          <div className="w-full">
            <InfoItem
              label="Salary"
              value={contract.salary || "N/A"}
              icon={<DollarSign className="h-3.5 w-3.5" />}
            />
          </div>

        </div>

      </CardContent>

      {/* FOOTER */}
      <CardFooter className="flex gap-2 pt-2">

        <Button
          onClick={onClick}
          variant={applied ? "default" : "secondary"}
          className="w-full justify-between"
        >
          {applied ? "Applied - View Details" : "Apply Now - View Details"}
          <Eye className="w-4 h-4 ml-1" />
        </Button>

      </CardFooter>

    </Card>
  );
}