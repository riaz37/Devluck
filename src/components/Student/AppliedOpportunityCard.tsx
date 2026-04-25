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
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

import {
  MoreVertical,
  FileText,
  XCircle,
  Eye,
  Calendar,
  Building2,
  DollarSign,
} from "lucide-react";
import { MappedOpportunity } from "@/types/opportunity-s";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";




interface AppliedOpportunityCardProps {
  applicant: MappedOpportunity;
  onClick?: () => void;
  onWithdraw?: () => void;
  isWithdrawing?: boolean;

  
}

export const AppliedOpportunityCard = ({
  applicant,
  onClick,
  onWithdraw,
  isWithdrawing,

}: AppliedOpportunityCardProps) => {
  const truncate = (text?: string, max = 22) =>
    text ? (text.length > max ? text.slice(0, max) + "…" : text) : "N/A";

  const getStatusColor = () => {
    switch (applicant.originalStatus) {
      case "pending":
        return "bg-blue-500/10 text-blue-600 border-blue-500/20";
      case "accepted":
        return "bg-green-500/10 text-green-600 border-green-500/20";
      case "rejected":
        return "bg-red-500/10 text-red-600 border-red-500/20";
      case "withdrawn":
        return "bg-gray-500/10 text-gray-600 border-gray-500/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <Card className="rounded-2xl shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5">
      
      {/* HEADER */}
      <CardHeader className="flex flex-row items-start justify-between pb-2">
        <div className="flex items-center gap-3">
          {/* IMAGE */}
          <Avatar className="h-10 w-10 ring-2 ring-background shadow-sm bg-primary/10 flex-shrink-0">
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
          <Badge variant="outline" className={getStatusColor()}>
            {applicant.opportunityStatus}
          </Badge>

          <Badge variant="secondary">
            ID: {applicant.originalId.slice(0, 8)}
          </Badge>
        </div>

        <Separator />

        {/* INFO */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-muted-foreground" />
            <span>{truncate(applicant.company, 12)}</span>
          </div>

          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-muted-foreground" />
            <span>{truncate(applicant.salary, 12)}</span>
          </div>

          <div className="flex items-center gap-2 col-span-2">
            <FileText className="w-4 h-4 text-muted-foreground" />
            <span>{truncate(applicant.jobDescription, 40)}</span>
          </div>
        </div>

        <Separator />

        {/* DEADLINE */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Deadline
          </span>
          <span>{applicant.deadline}</span>
        </div>

      </CardContent>

      {/* FOOTER */}
      <CardFooter className="flex gap-2">
        <Button
          onClick={onClick}
          className="flex-1 justify-between cursor-pointer"
        >
          View Details
          <Eye className="w-4 h-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};