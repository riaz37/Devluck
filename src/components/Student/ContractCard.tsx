"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Eye,
  MoreVertical,
  FileText,
  AlertCircle,
  Fingerprint,
  StickyNote,
  Target,
  DollarSign,
  Calendar,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MappedContract } from "@/types/contract-s";
import { InfoItem } from "../common/info-item";

interface ContractCardProps {
  contract: MappedContract;
  onDetails?: () => void;
  onDispute?: () => void;
}


export function ContractCard({ contract, onDetails, onDispute }: ContractCardProps) {
  const truncate = (text?: string, max = 36) =>
    text ? (text.length > max ? text.slice(0, max) + "…" : text) : "N/A";

  return (
    <Card className="rounded-2xl border bg-card shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">

      {/* ── HEADER ── */}
      <CardHeader className="pb-0 pt-4 px-4">
        <div className="flex items-start justify-between gap-3">

          {/* Avatar + title */}
          <div className="flex items-center gap-3">

            {/* IMAGE */}
            <Avatar className="h-10 w-10 ring-2 ring-background shadow-sm bg-primary/10 shrink-0">

              {contract.company?.logoUrl ? (
                <AvatarImage
                  src={contract.company.logoUrl}
                  alt={contract.company.name}
                  className="object-cover"
                />
              ) : null}

              <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm">
                {contract.company?.name?.charAt(0)?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>

            {/* TEXT */}
            <div className="min-w-0">

              <CardTitle className="text-[17px] font-medium leading-snug truncate">
                {truncate(contract.contractTitle, 35)}
              </CardTitle>
              
              <CardDescription className="flex items-center gap-1 mt-0.5 text-xs truncate">
                  <span className="truncate">
                    {truncate(contract.company?.name ?? "Unknown", 20)}
                  </span>
              </CardDescription>

            </div>
          </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground">
                  <MoreVertical className="h-4 w-4" />
                  <span className="sr-only">Options</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem onClick={onDetails}>
                  <FileText className="h-3.5 w-3.5 mr-2" /> Details
                </DropdownMenuItem>
                {contract.status !== "Disputed" && (
                  <>
                    <DropdownMenuItem onClick={onDispute} className="text-destructive focus:text-destructive">
                      <AlertCircle className="h-3.5 w-3.5 mr-2" /> Dispute
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

      </CardHeader>

      <CardContent className="px-4 pt-4 pb-0 space-y-3">
        {/* STATUS + ID - HORIZONTAL LAYOUT */}
        <div className="flex items-center justify-between">
          
          {/* Status badge - LEFT */}
          <Badge
            className={cn(
              "shrink-0 flex items-center gap-1.5 text-xs font-medium px-2.5 py-0.5 ",
              contract.status === "Running" && "bg-blue-100 text-blue-700 ",
              contract.status === "Completed" && "bg-emerald-100 text-emerald-700 ", 
              contract.status === "Disputed" && "bg-rose-100 text-rose-700 ",
              "hover:bg-muted/50"
            )}
          >
            <Target className="h-3 w-3" />
            {contract.status}
          </Badge>

          {/* ID chip - RIGHT */}
          <div className="flex items-center gap-1 text-[11px] text-muted-foreground font-mono bg-muted px-2 py-0.5 rounded-md">
            <Fingerprint className="h-3 w-3" />
            {contract.id.slice(0, 8)}
          </div>
        </div>

        <Separator />
          {/* ── METRICS ROW ── */}
          <div className="grid grid-cols-3 gap-2">
            <InfoItem
              label="Salary"
              value={contract.salary || "N/A"}
              icon={<DollarSign className="h-4 w-4" />}

            />

            <InfoItem
              label="Start"
              value={contract.startDate || "N/A"}
              icon={<Calendar className="h-4 w-4" />}
            />

            <InfoItem
              label="Duration"
              value={`${contract.durationMonths ?? 0} month${
                contract.durationMonths !== 1 ? "s" : ""
              }`}
              icon={<Clock className="h-4 w-4" />}
            />
          </div>

        {/* PROGRESS BAR */}
        <div className="space-y-1.5 pt-1">
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

        {/* NOTES SECTION */}
        <div className="space-y-3 pt-3 border-t border-border/30">
          <div className="flex items-center gap-2">
            <span className="h-px flex-1 bg-border/60" />
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground whitespace-nowrap">
              Contract Notes
            </span>
            <span className="h-px flex-1 bg-border/60" />
          </div>
          
          <div className="rounded-lg border border-border/40 bg-muted/20 px-4 py-3">
            <p className={cn(
              "text-sm leading-6 line-clamp-2 min-h-[3rem]",
              contract.note?.trim()
                ? "text-foreground"
                : "text-muted-foreground italic"
            )}>
              {contract.note?.trim()
                ? contract.note
                : "No notes provided for this contract."}
            </p>
          </div>
        </div>

      </CardContent>

      {/* ── FOOTER ── */}
      <CardFooter className="px-4 pt-3 pb-4">
        <Button onClick={onDetails} className="w-full justify-between" size="sm">
          View Contract
          <Eye className="h-3.5 w-3.5" />
        </Button>
      </CardFooter>
    </Card>
  );
}