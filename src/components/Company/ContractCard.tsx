"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  MoreVertical,
  Clock,
  Search,
  CheckCircle2,
  ShieldAlert,
  Fingerprint,
  Calendar,
  Activity,
  Trash2,
  Eye,
  Edit,
  FileText,
  ExternalLink,
  Link2,
  Download,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { cn } from "@/lib/utils";
import { InfoItem } from "../common/info-item";
import { LoadingState } from "../common/LoadingState";
import EmptyStateFeedback from "../common/EmptyStateFeedback";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";
import { ScrollArea } from "../ui/scroll-area";
import { Slider } from "../ui/slider";
/* =========================================================
 * TYPES
 * ======================================================= */

export type ContractStage =
  | "running"
  | "evaluation"
  | "completed"
  | "disputed";

export type ContractStatus =
  | "Running"
  | "Completed"
  | "Disputed"
  | "Evaluation"
  | string;

export interface ReportLink {
  title: string;
  url: string;
}

export interface ReportFile {
  fileName: string;
  fileUrl: string;
  fileType?: string;
  mimeType?: string;
}

export interface ContractReport {
  report: string;
  links: ReportLink[];
  files: ReportFile[];
  createdAt?: string;
}

/* =========================================================
 * CONTRACT CARD MODEL
 * ======================================================= */

export interface ContractCardData {
  /* =====================================================
   * IDS
   * =================================================== */

  id: string;

  contractNumber: string;

  shortContractId: string;

  /* =====================================================
   * STUDENT
   * =================================================== */

  studentName: string;

  studentImage?: string;

  studentEmail?: string;

  /* =====================================================
   * CONTRACT
   * =================================================== */

  contractTitle: string;

  contractStatus: ContractStatus;

  currentStage: ContractStage;

  /* =====================================================
   * DATES
   * =================================================== */

  startDate: string;

  endDate: string;

  duration?: string;

  createdAt?: string;

  updatedAt?: string;

  /* =====================================================
   * FINANCIAL
   * =================================================== */

  currency: string;

  monthlyAllowance?: number;

  salary?: number | null;

  salaryDisplay: string;

  /* =====================================================
   * PROGRESS
   * =================================================== */

  workProgress: number;

  /* =====================================================
   * LOCATION
   * =================================================== */

  workLocation?: string;

  /* =====================================================
   * NOTES
   * =================================================== */

  note?: string;

  /* =====================================================
   * REPORTS
   * =================================================== */

  hasReport?: boolean;

  reportsCount?: number;

  /* =====================================================
   * UI / META
   * =================================================== */

  badgeLabel?: string;

  isActive?: boolean;
}

/* =========================================================
 * COMPONENT PROPS
 * ======================================================= */

export interface ContractCardProps {
  contract: ContractCardData;

  hasReport?: boolean;

  reports?: ContractReport[];

  reportLoading?: boolean;

  onOpenReport?: (
    id: string
  ) => Promise<void> | void;

  onSaveProgress?: (
    id: string,
    workProgress: number
  ) => Promise<void>;

  progressSaving?: boolean;

  onAction?: (
    action:
      | "details"
      | "edit"
      | "delete"
      | "dispute",
    id: string
  ) => void;
}

export function ContractCard({
  contract,
  onAction,
  hasReport = false,
  reports = [],
  reportLoading = false,
  onOpenReport,
  onSaveProgress,
  progressSaving = false
}: ContractCardProps) {
  const [reportOpen, setReportOpen] = React.useState(false);
  const [showProgressEditor, setShowProgressEditor] = React.useState(false);
  const [progressInput, setProgressInput] = React.useState<string>(String(contract.workProgress ?? 0));
  const [selectedReportIndex, setSelectedReportIndex] = React.useState(0);

  React.useEffect(() => {
    setProgressInput(String(contract.workProgress ?? 0));
  }, [contract.workProgress]);

  const stages = [
    { id: "running", label: "Running", icon: Clock },
    { id: "evaluation", label: "Review", icon: Search },
    { id: "completed", label: "Done", icon: CheckCircle2 },
    { id: "disputed", label: "Issue", icon: ShieldAlert },
  ] as const;

  const currentIndex = stages.findIndex(
    (s) => s.id === contract.currentStage
  );

  const isDisputed = contract.currentStage === "disputed";
  const isCompleted = contract.currentStage === "completed";

  const openReportFile = (fileUrl: string, fileName?: string, fileType?: string) => {
    const lowerName = (fileName || "").toLowerCase();
    const lowerUrl = (fileUrl || "").toLowerCase();
    const isPdf = fileType === "application/pdf" || lowerName.endsWith(".pdf") || lowerUrl.includes(".pdf");

    if (isPdf) {
      window.open(
        `https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}`,
        "_blank",
        "noopener,noreferrer"
      );
      return;
    }

    window.open(fileUrl, "_blank", "noopener,noreferrer");
  };

  const downloadReportFile = async (fileUrl: string, fileName?: string) => {
    try {
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName || "file";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      window.open(fileUrl, "_blank", "noopener,noreferrer");
    }
  };

  const openReport = async () => {
    setReportOpen(true);
    await onOpenReport?.(contract.id);
    setSelectedReportIndex(0);
  };

  const handleSaveProgress = async () => {
    const parsed = Number(progressInput);
    if (!Number.isFinite(parsed) || parsed < 0 || parsed > 100) return;
    await onSaveProgress?.(contract.id, parsed);
    setShowProgressEditor(false);
  };

  const selectedReport = reports[selectedReportIndex] || null;
  const canViewReport = Boolean(hasReport);
  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -2 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className="w-full max-w-[760px] mx-auto"
      >
        <Card className="rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col">

          {/* ================= HEADER ================= */}
          <CardHeader className="flex flex-row justify-between">

            <div className="space-y-1 min-w-0">

              <CardTitle className="text-base font-semibold truncate">
                {contract.contractTitle}
              </CardTitle>

              <CardDescription className="text-xs flex items-center gap-2 flex-wrap">

                <span className="flex items-center gap-1 text-muted-foreground">
                  <Fingerprint className="h-3 w-3" />
                  {contract.id.slice(0, 8)}
                </span>

                <span className="text-muted-foreground">•</span>

                <span className="font-medium text-foreground truncate">
                  {contract.studentName}
                </span>

              </CardDescription>

            </div>

            <div className="flex items-start gap-0.5">
              {/* MENU */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end">

                {canViewReport && (
                  <DropdownMenuItem onClick={openReport}>
                    <FileText className="h-4 w-4 mr-2" />
                    Report
                  </DropdownMenuItem>
                )}

                  <DropdownMenuItem onClick={() => onAction?.("details", contract.id)}>
                    <Eye className="h-4 w-4 mr-2" />
                    Profile
                  </DropdownMenuItem>

                  <DropdownMenuItem onClick={() => onAction?.("edit", contract.id)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>

                {isDisputed && (
                  <DropdownMenuItem onClick={() => onAction?.("dispute", contract.id)}>
                    <ShieldAlert className="h-4 w-4 mr-2" />
                    Resolve Dispute
                  </DropdownMenuItem>
                )}

                  <DropdownMenuItem
                    className="text-red-500"
                    onClick={() => onAction?.("delete", contract.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>

                </DropdownMenuContent>
              </DropdownMenu>

            </div>
          </CardHeader>

          {/* ================= BODY ================= */}
          <CardContent className="space-y-4 flex-1">

            {/* STEPPER */}
            <div className="flex justify-between relative">
              <div className="absolute top-1/2 w-full h-px bg-muted" />

            {stages.map((stage, i) => {
              const Icon = stage.icon;
              const active = i <= currentIndex;

              return (
                <TooltipProvider key={stage.id}>
                  <Tooltip>
                    <TooltipTrigger >
                      <div
                        className={cn(
                          "relative z-10 h-8 w-8 rounded-full flex items-center justify-center border transition",
                          "duration-200",
                          active
                            ? "bg-primary text-primary-foreground border-primary scale-110 shadow-sm"
                            : "bg-background text-muted-foreground border-border hover:bg-muted"
                        )}
                      >
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>{stage.label}</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              );
            })}
          </div>

            {/* INFO */}
            <div className="grid grid-cols-2 gap-4 text-sm">

              <InfoItem
                label="Salary Paid"
                value={contract.salaryDisplay || "N/A"}
              />

              <InfoItem
                label="Contract Status"
                value={
              <Badge
                className={cn(
                  "px-3 py-1 rounded-full text-xs font-semibold cursor-default ",
                  contract.contractStatus === "Running" &&
                    "bg-green-500/10 text-green-600 hover:bg-green-500/10",
                  contract.contractStatus === "Completed" &&
                    "bg-muted text-muted-foreground hover:bg-muted",
                  contract.contractStatus === "Disputed" &&
                    "bg-red-500/10 text-red-600 hover:bg-red-500/10"
                )}
              >
                {contract.contractStatus}
              </Badge>
                }
              />

              <InfoItem
                label="Start Date"
                value={contract.startDate}
                icon={<Calendar className="h-3.5 w-3.5" />}
              />

              <InfoItem
                label="End Date"
                value={contract.endDate}
                icon={<Calendar className="h-3.5 w-3.5" />}
              />

            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Contract Progress</span>
                <span>{contract.workProgress ?? 0}%</span>
              </div>
              <Progress value={contract.workProgress ?? 0} className="h-2" />
            </div>

          </CardContent>

          {/* ================= FOOTER ================= */}
          <CardFooter className="mt-auto flex gap-2">

            <Button
              className="flex-1 justify-between"
              onClick={() => onAction?.("details", contract.id)}
            >
              View Profile
              <Eye className="h-4 w-4" />
            </Button>

            {canViewReport && (
              <Button
                variant="outline"
                className="flex-1 justify-between"
                onClick={openReport}
              >
                View Report
                <FileText className="h-4 w-4" />
              </Button>
            )}

          </CardFooter>
        </Card>
      </motion.div>

      {/* ================= REPORT MODAL ================= */}
        <Dialog open={reportOpen} onOpenChange={setReportOpen}>
          <DialogContent className="max-w-lg">

            <DialogHeader>
              <DialogTitle>Contract Report</DialogTitle>

              <DialogDescription>
                View and manage the student’s submitted report, including progress details,
                links, and attached files for this contract.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-5">

              {/* ================= LOADING ================= */}
              {reportLoading ? (
                <LoadingState label="Loading contract report..." />
              ) : !selectedReport ? (
                /* ================= EMPTY STATE ================= */
              <div className="flex flex-col items-center justify-center py-10 text-center space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Student Report Not Available
                </p>

                <p className="text-xs text-muted-foreground">
                  This report will appear once the student submits their progress update.
                </p>
              </div>
              ) : (
                <>
                  {/* ================= REPORT SWITCHER ================= */}
                    {reports.length > 1 && (
                      <div className="w-full flex justify-center">
                        <Tabs
                          value={String(selectedReportIndex)}
                          onValueChange={(v) => setSelectedReportIndex(Number(v))}
                          className="w-fit"
                        >
                          <TabsList className="flex max-w-full overflow-x-auto gap-2 justify-center mx-auto px-2">
                            {reports.map((_, index) => (
                              <TabsTrigger
                                key={index}
                                value={String(index)}
                                className="text-xs px-3 whitespace-nowrap"
                              >
                                Report {index + 1}
                              </TabsTrigger>
                            ))}
                          </TabsList>
                        </Tabs>
                      </div>
                    )}

                    

                  {/* ================= REPORT CONTENT ================= */}
                    <div className="space-y-2">

                      {/* LABEL */}
                      <p className="text-sm font-medium">Progress Report</p>

                      {/* CONTENT */}
                      {selectedReport.report?.trim() ? (
                        <ScrollArea className="max-h-48 pr-3">
                          <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                            {selectedReport.report}
                          </p>
                        </ScrollArea>
                      ) : (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <FileText className="w-4 h-4" />
                          <span>No report submitted by the student yet</span>
                        </div>
                      )}

                    </div>

                  {/* ================= LINKS ================= */}
                  {/* LINKS */}
                  {selectedReport.links?.length ? (
                    <div className="space-y-3">

                      {/* Header */}
                      <div className="flex items-center gap-2">
                        <Link2 className="w-4 h-4 text-muted-foreground" />
                        <p className="text-xs font-semibold uppercase text-muted-foreground tracking-wide">
                          Links ({selectedReport.links.length})
                        </p>
                      </div>

                      {/* Scrollable List */}
                      <ScrollArea className="h-20 pr-3">
                        <div className="space-y-2">

                          {selectedReport.links.map((link, i) => (
                            <a
                              key={i}
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="
                                group flex items-start gap-3 rounded-lg border
                                px-3 py-2
                                transition-all duration-200 bg-card hover:bg-muted/40
                                hover:shadow-sm
                              "
                            >
                              {/* Icon */}
                              <div className="mt-0.5">
                                <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                              </div>

                              {/* Content */}
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                                  {link.title}
                                </p>

                                <p className="text-xs text-muted-foreground truncate">
                                  {link.url.replace(/^https?:\/\//, "")}
                                </p>
                              </div>
                            </a>
                          ))}

                        </div>
                      </ScrollArea>

                    </div>
                  ) : (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Link2 className="w-4 h-4" />
                    <span>No links added yet</span>
                  </div>
                  )}

                  {/* ================= FILES ================= */}
                  {/* FILES */}
                  {selectedReport.files?.length ? (
                    <div className="space-y-3">

                      {/* HEADER */}
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <FileText className="w-4 h-4 " />
                        Files ({selectedReport.files.length})
                      </h4>

                      {/* LIST */}
                      <ScrollArea className="h-20 pr-3">
                        <div className="space-y-2">

                          {selectedReport.files.map((file, i) => (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, x: 10 }}
                              animate={{ opacity: 1, x: 0 }}
                              className="group flex items-center justify-between gap-3 p-3 rounded-lg border bg-card hover:bg-muted/40 transition-all hover:shadow-sm"
                            >

                              {/* LEFT SIDE */}
                              <div className="flex items-center gap-3 min-w-0 flex-1">

                                {/* ICON */}
                                <div className="h-9 w-9 rounded-md bg-muted flex items-center justify-center flex-shrink-0">
                                  <FileText className="w-5 h-5 text-muted-foreground" />
                                </div>

                                {/* INFO */}
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm font-medium truncate max-w-[180px]">
                                    {file.fileName.length > 35
                                      ? file.fileName.slice(0, 35) + "..."
                                      : file.fileName}
                                  </p>

                                  <p className="text-xs text-muted-foreground truncate">
                                    {file.fileType || "Unknown file"}
                                  </p>
                                </div>

                              </div>

                              {/* ACTIONS */}
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">

                                {/* VIEW */}
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-8 w-8 p-0 hover:bg-accent"
                                  onClick={(e) => {
                                    e.stopPropagation();

                                    openReportFile(
                                      file.fileUrl,
                                      file.fileName,
                                      file.fileType
                                    );
                                  }}
                                >
                                  <ExternalLink className="w-4 h-4" />
                                </Button>

                                {/* DOWNLOAD */}
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                                  onClick={async (e) => {
                                    e.stopPropagation();

                                    downloadReportFile(file.fileUrl, file.fileName);
                                  }}
                                >
                                  <Download className="w-4 h-4" />
                                </Button>

                              </div>

                            </motion.div>
                          ))}

                        </div>
                      </ScrollArea>

                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <FileText className="w-4 h-4" />
                      <span>No files added yet</span>
                    </div>
                  )}

                  {/* ================= PROGRESS ================= */}
                  <div className="space-y-3 border-t pt-4">

                    {/* HEADER */}
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">Contract Progress</p>
                      <span className="text-sm text-muted-foreground">
                        {contract.workProgress ?? 0}%
                      </span>
                    </div>

                    {/* EDIT MODE */}
                    {showProgressEditor ? (
                      <div className="space-y-3">

                        {/* SLIDER (MAIN CONTROL) */}
                        <Slider
                          value={[Number(progressInput || 0)]}
                          min={0}
                          max={100}
                          step={1}
                          onValueChange={(val) => setProgressInput(String(val[0]))}
                        />

                        {/* ACTIONS */}
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            min={0}
                            max={100}
                            value={progressInput}
                            onChange={(e) => setProgressInput(e.target.value)}
                            className="w-24"
                          />

                          <Button
                            size="sm"
                            onClick={handleSaveProgress}
                            disabled={progressSaving}
                          >
                            {progressSaving ? "Saving..." : "Save"}
                          </Button>

                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setShowProgressEditor(false)}
                          >
                            Cancel
                          </Button>
                        </div>

                      </div>
                    ) : (
                      <Button
                        size="sm"
                        className="w-full"
                        onClick={() => setShowProgressEditor(true)}
                      >
                        Update Progress
                      </Button>
                    )}

                  </div>
                </>
              )}
            </div>

          </DialogContent>
        </Dialog>
    </>
  );
}