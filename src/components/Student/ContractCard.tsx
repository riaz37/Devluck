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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MappedContract } from "@/types/contract-s";

interface ContractCardProps {
  contract: MappedContract;
  onDetails?: () => void;
  onDispute?: () => void;
}

const STATUS_STYLES: Record<string, string> = {
  Running:   "bg-emerald-50 text-emerald-700 ",
  Completed: "bg-blue-50   text-blue-700   ",
  Disputed:  "bg-rose-50  text-rose-700 ",
};

const PROGRESS_BAR: Record<string, string> = {
  Running:   "bg-emerald-500",
  Completed: "bg-blue-500",
  Disputed:  "bg-rose-500",
};

export function ContractCard({ contract, onDetails, onDispute }: ContractCardProps) {
  const truncate = (text?: string, max = 36) =>
    text ? (text.length > max ? text.slice(0, max) + "…" : text) : "N/A";

  const initials = contract.company?.name
    ?.split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase() ?? "C";

  const progress = contract.workProgress ?? 0;
  const statusStyle = STATUS_STYLES[contract.status] ?? "bg-muted text-muted-foreground";
  const barColor = PROGRESS_BAR[contract.status] ?? "bg-primary";

  return (
    <Card className="rounded-2xl border shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">

      {/* ── HEADER ── */}
      <CardHeader className="pb-3">
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
            <div className="space-y-1 min-w-0">

              <CardTitle className="text-base font-semibold break-words line-clamp-1">
                {truncate(contract.contractTitle, 25)}
              </CardTitle>
              
              <CardDescription className="truncate flex items-center gap-2">

                <span className="truncate">
                  {truncate(contract.company?.name ?? "Unknown", 20)}
                </span>

                <span className="text-muted-foreground">•</span>

                <span className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                  <Fingerprint className="h-3 w-3" />
                  {contract.id.slice(0, 8)}
                </span>

              </CardDescription>

            </div>
          </div>

          {/* Status + menu */}
          <div className="flex items-center gap-2 shrink-0">
            <Badge
              className={cn("text-[11px] font-medium px-2.5 py-0.5 flex items-center gap-1", statusStyle)}
            >
              <Target className="h-3 w-3" />
              {contract.status}
            </Badge>

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
        </div>
      </CardHeader>

      <CardContent className="pt-4 space-y-4">

        {/* ── METRICS ROW ── */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-muted/50 rounded-lg px-3 py-2.5">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">Salary</p>
            <p className="text-sm font-semibold truncate">{contract.salary || "N/A"}</p>
          </div>
          <div className="rounded-lg px-3 py-2.5">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">Start</p>
            <p className="text-sm font-medium truncate">{contract.startDate}</p>
          </div>
          <div className="rounded-lg px-3 py-2.5">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">Duration</p>
            <p className="text-sm font-medium truncate">
              {contract.durationMonths} month{contract.durationMonths !== 1 ? "s" : ""}
            </p>
          </div>
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
      <CardFooter className="pt-0">
        <Button onClick={onDetails} className="w-full justify-between" size="sm">
          View Contract
          <Eye className="h-3.5 w-3.5" />
        </Button>
      </CardFooter>
    </Card>
  );
}