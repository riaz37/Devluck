"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  Eye,
  CircleCheck,
  Shield,
  ShieldCheck,
  ShieldAlert,
  FileText,
  User,
  MoreVertical,
  Fingerprint,
  Edit,
  Trash2,
  ExternalLink,
  Link2,
  Download,
  Search,
  AlertCircle,
  Link,
  File,
} from "lucide-react";

import { cn } from "@/lib/utils";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoadingState } from "../common/LoadingState";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Progress } from "../ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

/* =========================================================
 * TYPES
 * ======================================================= */

export type ContractStage = "running" | "evaluation" | "completed" | "disputed";
export type ContractStatus = "Running" | "Completed" | "Disputed" | "Evaluation" | string;

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

export interface ContractCardData {
  id: string;
  contractNumber: string;
  shortContractId: string;
  studentName: string;
  studentImage?: string;
  studentEmail?: string;
  contractTitle: string;
  contractStatus: ContractStatus;
  currentStage: ContractStage;
  startDate: string;
  endDate: string;
  duration?: string;
  createdAt?: string;
  updatedAt?: string;
  currency: string;
  monthlyAllowance?: number;
  salary?: number | null;
  salaryDisplay: string;
  workProgress: number;
  workLocation?: string;
  note?: string;
  hasReport?: boolean;
  reportsCount?: number;
  badgeLabel?: string;
  isActive?: boolean;
}

export interface ContractCardProps {
  contract: ContractCardData;
  hasReport?: boolean;
  reports?: ContractReport[];
  reportLoading?: boolean;
  onOpenReport?: (id: string) => Promise<void> | void;
  onSaveProgress?: (id: string, workProgress: number) => Promise<void>;
  progressSaving?: boolean;
  onAction?: (
    action: "details" | "edit" | "delete" | "dispute",
    id: string
  ) => void;
}

/* =========================================================
 * CONSTANTS
 * ======================================================= */

const STAGES = [
  { id: "running",    label: "Running", Icon: Clock },
  { id: "evaluation", label: "Student Report",  Icon: FileText },
  { id: "completed",  label: "Completed",    Icon: CircleCheck },
  { id: "disputed",   label: "Issue",   Icon: AlertCircle },
] as const;

const STAGE_CONFIG: Record<
  ContractStage,
  {
    accent: string;
    badge: string;
    dot: string;
    label: string;
    progressBar: string;
    primaryBtn: string;
    avatarColor: string;
  }
> = {
  running: {
    accent: "bg-emerald-100 border-emerald-200 dark:bg-emerald-950",
    badge:       "bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
    dot:         "bg-emerald-500",
    label:       "Running",
    progressBar: "bg-foreground",
    primaryBtn:  "bg-foreground text-background hover:opacity-85",
    avatarColor: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  },
  evaluation: {
    accent: "bg-blue-100 border-blue-200 dark:bg-blue-950",
    badge:       "bg-blue-50 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
    dot:         "bg-blue-500",
    label:       "In Review",
    progressBar: "bg-blue-500",
    primaryBtn:  "bg-foreground text-background hover:opacity-85",
    avatarColor: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  },
  completed: {
    accent: "bg-zinc-100 border-zinc-200 dark:bg-zinc-900",
    badge:       "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
    dot:         "bg-zinc-400",
    label:       "Completed",
    progressBar: "bg-zinc-400",
    primaryBtn:  "bg-foreground text-background hover:opacity-85",
    avatarColor: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
  },
  disputed: {
    accent: "bg-red-100 border-red-200 dark:bg-red-950",
    badge:       "bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-300",
    dot:         "bg-red-500",
    label:       "Disputed",
    progressBar: "bg-red-500",
    primaryBtn:  "bg-red-500 text-white hover:bg-red-600",
    avatarColor: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300",
  },
};

/* =========================================================
 * HELPERS
 * ======================================================= */

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

function openReportFile(fileUrl: string, fileName?: string, fileType?: string) {
  const lowerName = (fileName || "").toLowerCase();
  const lowerUrl  = (fileUrl  || "").toLowerCase();
  const isPdf =
    fileType === "application/pdf" ||
    lowerName.endsWith(".pdf") ||
    lowerUrl.includes(".pdf");

  if (isPdf) {
    window.open(
      `https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}`,
      "_blank",
      "noopener,noreferrer"
    );
    return;
  }
  window.open(fileUrl, "_blank", "noopener,noreferrer");
}

async function downloadReportFile(fileUrl: string, fileName?: string) {
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
}

/* =========================================================
 * SUB-COMPONENTS
 * ======================================================= */

function StatItem({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">
        {label}
      </span>
      <span className="text-[13px] font-medium text-foreground leading-tight">
        {value}
      </span>
    </div>
  );
}

function StageTracker({
  currentStage,
  hasReport,
}: {
  currentStage: ContractStage;
  hasReport?: boolean;
}) {
  const currentIndex = STAGES.findIndex(
    (s) => s.id === currentStage
  );

  const isDisputed =
    currentStage === "disputed";

  return (
    <div className="flex items-center w-full px-6 py-4">
      {STAGES.map((stage, i) => {
        const { Icon } = stage;

        const isActive =
          stage.id === currentStage ||
          (hasReport &&
            stage.id === "evaluation");

        const isPast = i < currentIndex;
        const isLast =
          i === STAGES.length - 1;

        const cfg =
          STAGE_CONFIG[stage.id];

        return (
          <React.Fragment key={stage.id}>
            <div className="flex flex-col items-center gap-1.5">

              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center border transition-all duration-200",

                  // ACTIVE → stage color
                  isActive &&
                    `${cfg.accent} border-transparent text-white scale-105`,

                  // PAST
                  isPast &&
                    !isActive &&
                    "bg-muted border-border text-muted-foreground",

                  // FUTURE
                  !isActive &&
                    !isPast &&
                    "bg-background border-border text-muted-foreground"
                )}
              >
               <Icon
                  className={cn(
                    "w-3.5 h-3.5 transition-colors",
                    isActive
                      ? stage.id === "running"
                        ? "text-emerald-700 dark:text-emerald-300"
                        : stage.id === "evaluation"
                        ? "text-sky-700 dark:text-sky-300"
                        : stage.id === "completed"
                        ? "text-zinc-700 dark:text-zinc-300"
                        : "text-rose-700 dark:text-rose-300"
                      : "text-muted-foreground"
                  )}
                />
              </div>

              <span
                className={cn(
                  "text-[10px] whitespace-nowrap transition-colors",
                  isActive
                    ? "text-foreground font-medium"
                    : "text-muted-foreground"
                )}
              >
                {stage.label}
              </span>
            </div>

            {!isLast && (
              <div
                className={cn(
                  "flex-1 h-px mx-1.5 mb-4 transition-colors duration-300",
                  isPast
                    ? "bg-border"
                    : "bg-border/40"
                )}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

/* =========================================================
 * REPORT MODAL
 * ======================================================= */

interface ReportModalProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  contract: ContractCardData;
  reports: ContractReport[];
  reportLoading: boolean;
  selectedReportIndex: number;
  setSelectedReportIndex: (i: number) => void;
  showProgressEditor: boolean;
  setShowProgressEditor: (v: boolean) => void;
  progressInput: string;
  setProgressInput: (v: string) => void;
  progressSaving: boolean;
  onSaveProgress?: (id: string, progress: number) => Promise<void>;
}

function ReportModal({
  open,
  onOpenChange,
  contract,
  reports,
  reportLoading,
  selectedReportIndex,
  setSelectedReportIndex,
  showProgressEditor,
  setShowProgressEditor,
  progressInput,
  setProgressInput,
  progressSaving,
  onSaveProgress,
}: ReportModalProps) {
  const selectedReport = reports[selectedReportIndex] || null;

  const handleSaveProgress = async () => {
    const parsed = Number(progressInput);
    if (!Number.isFinite(parsed) || parsed < 0 || parsed > 100) return;
    await onSaveProgress?.(contract.id, parsed);
    setShowProgressEditor(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg rounded-2xl p-0 overflow-hidden gap-0">

        {/* Modal header */}
        <div className="px-6 pt-6 pb-4 border-b border-border/50">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">
              Contract Report
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-0.5">
              Progress details, links, and attached files for this contract.
            </DialogDescription>
          </DialogHeader>
        </div>

        <ScrollArea className="max-h-[70vh]">
          <div className="px-6 py-5 space-y-6">

            {/* ── Loading ── */}
            {reportLoading ? (
              <div className="flex flex-col items-center justify-center py-10 space-y-2">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
                <p className="text-sm text-muted-foreground">
                  Loading report...
                </p>
              </div>
            ) : !selectedReport ? (

              /* ── Empty ── */
              <div className="flex flex-col items-center justify-center py-10 text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-1">
                  <FileText className="w-5 h-5 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-foreground">No report yet</p>
                <p className="text-xs text-muted-foreground max-w-[240px]">
                  This report will appear once the student submits their progress update.
                </p>
              </div>

            ) : (
              <>

                {/* ── Report switcher ── */}
                {reports.length > 1 && (
                  <div className="flex justify-center">
                    <Tabs
                      value={String(selectedReportIndex)}
                      onValueChange={(v) => setSelectedReportIndex(Number(v))}
                    >
                      <TabsList className="h-8">
                        {reports.map((_, index) => (
                          <TabsTrigger
                            key={index}
                            value={String(index)}
                            className="text-xs px-3"
                          >
                            Report {index + 1}
                          </TabsTrigger>
                        ))}
                      </TabsList>
                    </Tabs>
                  </div>
                )}

                {/* ── Report text ── */}
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-widest font-medium text-muted-foreground">
                    Progress report
                  </p>
                  {selectedReport.report?.trim() ? (
                    <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                      {selectedReport.report}
                    </p>
                  ) : (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <FileText className="w-4 h-4" />
                      <span>No report text submitted yet</span>
                    </div>
                  )}
                </div>

                {/* ── Links ── */}
                <div className="space-y-3">

                  {/* HEADER */}
                  <p className="text-xs uppercase tracking-wider font-medium text-muted-foreground flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Link2 className="w-3.5 h-3.5" />
                      Links
                    </span>

                    {selectedReport.links?.length ? (
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-md">
                        {selectedReport.links.length}
                      </span>
                    ) : null}
                  </p>

                  {/* LIST */}
                  {selectedReport.links?.length ? (
                    <div className="space-y-2 max-h-48 overflow-y-auto px-1">

                      {selectedReport.links.map((link, i) => (
                        <a
                          key={i}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="
                            group flex items-center gap-3
                            p-3 rounded-xl border bg-card
                            hover:bg-muted/40 hover:shadow-sm
                            transition-all duration-200
                          "
                        >

                          {/* ICON */}
                          <div className="
                            h-9 w-9 rounded-lg bg-muted
                            flex items-center justify-center
                            shrink-0
                          ">
                            <Link className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                          </div>

                          {/* CONTENT */}
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                              {link.title}
                            </p>

                            <p className="text-xs text-muted-foreground truncate">
                              {link.url.replace(/^https?:\/\//, "")}
                            </p>
                          </div>

                        </a>
                      ))}

                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No links added yet
                    </p>
                  )}

                </div>

                {/* ── Files ── */}
                <div className="space-y-3">
                  <p className="text-xs uppercase tracking-widest font-medium text-muted-foreground flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5" />
                      Files
                    </span>

                    {selectedReport.files?.length ? (
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-md">
                        {selectedReport.files.length}
                      </span>
                    ) : null}
                  </p>

                  {selectedReport.files?.length ? (
                    <div className="space-y-2 max-h-48 overflow-y-auto px-1">

                      {selectedReport.files.map((file, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: 8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.04 }}
                          className="
                            group flex items-center justify-between
                            rounded-xl border border-border/60
                            px-3 py-2.5 bg-card
                            hover:bg-muted/40 hover:shadow-sm
                            transition-all duration-200
                          "
                        >
                          {/* LEFT */}
                          <div className="flex items-center gap-3 min-w-0 flex-1">

                            <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                              <File className="w-4 h-4 text-muted-foreground" />
                            </div>

                            <div className="min-w-0 flex flex-col">
                              <p className="text-[13px] font-medium truncate max-w-[240px]">
                                {file.fileName.length > 36
                                  ? file.fileName.slice(0, 36) + "…"
                                  : file.fileName}
                              </p>

                              <p className="text-[11px] text-muted-foreground">
                                {file.fileType || "Unknown type"}
                              </p>
                            </div>

                          </div>

                          {/* ACTIONS (LOGIC UNCHANGED) */}
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">

                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 w-7 p-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                openReportFile(
                                  file.fileUrl,
                                  file.fileName,
                                  file.fileType
                                );
                              }}
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </Button>

                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                              onClick={(e) => {
                                e.stopPropagation();
                                downloadReportFile(file.fileUrl, file.fileName);
                              }}
                            >
                              <Download className="w-3.5 h-3.5" />
                            </Button>

                          </div>
                        </motion.div>
                      ))}

                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No files attached yet
                    </p>
                  )}
                </div>

                {/* ── Progress editor ── */}
                <div className="space-y-3 border-t border-border/50 pt-5">
                  <div className="flex items-center justify-between">
                    <p className="text-xs uppercase tracking-widest font-medium text-muted-foreground">
                      Contract progress
                    </p>
                    <span className="text-sm font-medium text-foreground">
                      {contract.workProgress ?? 0}%
                    </span>
                  </div>

                  <AnimatePresence mode="wait">
                    {showProgressEditor ? (
                      <motion.div
                        key="editor"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        className="space-y-3"
                      >
                        <Slider
                          value={[Number(progressInput || 0)]}
                          min={0}
                          max={100}
                          step={1}
                          onValueChange={(val) => setProgressInput(String(val[0]))}
                        />
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            min={0}
                            max={100}
                            value={progressInput}
                            onChange={(e) => setProgressInput(e.target.value)}
                            className="w-20 h-8 text-sm"
                          />
                          <Button
                            size="sm"
                            onClick={handleSaveProgress}
                            disabled={progressSaving}
                          >
                            {progressSaving ? "Saving…" : "Save"}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setShowProgressEditor(false)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="static"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <Button
                          onClick={() => setShowProgressEditor(true)}
                          className="w-full"
                        >
                          Update progress
                        </Button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

              </>
            )}
          </div>
        </ScrollArea>

      </DialogContent>
    </Dialog>
  );
}

/* =========================================================
 * MAIN COMPONENT
 * ======================================================= */

export function ContractCard({
  contract,
  onAction,
  hasReport = false,
  reports = [],
  reportLoading = false,
  onOpenReport,
  onSaveProgress,
  progressSaving = false,
}: ContractCardProps) {
  const [reportOpen, setReportOpen]                   = React.useState(false);
  const [showProgressEditor, setShowProgressEditor]   = React.useState(false);
  const [progressInput, setProgressInput]             = React.useState(String(contract.workProgress ?? 0));
  const [selectedReportIndex, setSelectedReportIndex] = React.useState(0);

  React.useEffect(() => {
    setProgressInput(String(contract.workProgress ?? 0));
  }, [contract.workProgress]);

  const cfg           = STAGE_CONFIG[contract.currentStage] ?? STAGE_CONFIG.running;
  const isDisputed    = contract.currentStage === "disputed";
  const canViewReport = Boolean(hasReport);

  const openReport = async () => {
    setReportOpen(true);
    await onOpenReport?.(contract.id);
    setSelectedReportIndex(0);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -2 }}
        transition={{ type: "spring", stiffness: 280, damping: 22 }}
        className="w-full max-w-[720px] mx-auto"
      >
        <Card className="overflow-hidden rounded-2xl border-border/60 shadow-sm hover:shadow-md transition-shadow">

          {/* ───────── HEADER ───────── */}
          <CardHeader className="flex flex-row items-start justify-between space-y-0 px-6 pt-5 pb-4">

            <div className="space-y-1.5 min-w-0 pr-4">
              <CardTitle className="text-[17px] font-medium leading-snug truncate">
                {contract.contractTitle}
              </CardTitle>

              <CardDescription className="flex items-center gap-3 text-[12px] text-muted-foreground">

                {/* Contract ID */}
                <div className="flex items-center gap-1">
                  <Fingerprint className="w-3 h-3 shrink-0" />
                  <span className="font-mono leading-none">
                    {contract.id.slice(0, 8)}
                  </span>
                </div>

                {/* Divider */}
                <span className="w-1 h-1 rounded-full bg-border shrink-0" />

                {/* Student */}
                <div className="flex items-center gap-1.5 min-w-0">

                  <Avatar className="w-6 h-6 shrink-0">
                    <AvatarImage
                      src={contract.studentImage}
                      alt={contract.studentName}
                    />

                    <AvatarFallback
                      className={cn("text-[9px] font-semibold", cfg.avatarColor)}
                    >
                      {getInitials(contract.studentName)}
                    </AvatarFallback>
                  </Avatar>

                  <span className="font-medium text-foreground truncate leading-none">
                    {contract.studentName}
                  </span>

                </div>

              </CardDescription>
            </div>

            {/* Actions */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground"
                >
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-44">

                {canViewReport && (
                  <DropdownMenuItem onClick={openReport}>
                    <FileText className="w-4 h-4 mr-2" />
                    Report
                  </DropdownMenuItem>
                )}

                <DropdownMenuItem
                  onClick={() =>
                    onAction?.("details", contract.id)
                  }
                >
                  <User className="w-4 h-4 mr-2" />
                  View Profile
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() =>
                    onAction?.("edit", contract.id)
                  }
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </DropdownMenuItem>

                {isDisputed && (
                  <DropdownMenuItem
                    onClick={() =>
                      onAction?.("dispute", contract.id)
                    }
                  >
                    <ShieldAlert className="w-4 h-4 mr-2" />
                    Resolve Dispute
                  </DropdownMenuItem>
                )}

                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() =>
                    onAction?.("delete", contract.id)
                  }
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardHeader>

          {/* ───────── STAGE TRACKER ───────── */}
            <StageTracker
              currentStage={contract.currentStage}
              hasReport={contract.hasReport}
            />

          {/* ───────── BODY ───────── */}
          <CardContent className="p-0">

            {/* Stats */}
            <div className=" px-6 py-2 grid grid-cols-4 gap-4">

              <StatItem
                label="Salary"
                value={contract.salaryDisplay || "N/A"}
              />

              <StatItem
                label="Duration"
                value={
                  contract.duration
                    ? `${contract.duration} ${
                        Number(contract.duration) === 1 ? "month" : "months"
                      }`
                    : "—"
                }
              />

              <StatItem
                label="Start"
                value={contract.startDate}
              />

              <StatItem
                label="End"
                value={contract.endDate}
              />
            </div>

            {/* Progress */}
            <div className=" px-6 py-2 space-y-2">

              <div className="flex justify-between text-[11px] text-muted-foreground">
                <span>Contract Progress</span>

                <span className="font-medium text-foreground">
                  {contract.workProgress ?? 0}%
                </span>
              </div>

              <Progress
                value={contract.workProgress ?? 0}
                className="h-1.5"
              />
            </div>


            {/* ───────── NOTE ───────── */}
            <div className="px-6 space-y-2">

              <div className="flex items-center gap-2">
                <span className="h-px flex-1 bg-border/60" />

                <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                  Contract Notes
                </span>

                <span className="h-px flex-1 bg-border/60" />
              </div>

              <div className="rounded-lg border border-border/40 bg-muted/20 px-3 py-2">

                <p
                  className={cn(
                    "text-sm leading-6 line-clamp-2 min-h-[2.5rem]",
                    contract.note
                      ? "text-foreground"
                      : "text-muted-foreground italic"
                  )}
                >
                  {contract.note || "No notes provided for this contract."}
                </p>

              </div>
            </div>
          </CardContent>

          <CardFooter className="px-6 py-3.5 flex gap-2">

            {isDisputed ? (
              <>
                <Button
                  onClick={() =>
                    onAction?.("dispute", contract.id)
                  }
                  className="flex-1 gap-2 bg-destructive/90 hover:bg-destructive/80 text-white"
                >
                  <AlertCircle className="w-3.5 h-3.5" />
                  Resolve Dispute
                </Button>

                {canViewReport && (
                  <Button
                    variant="secondary"
                    className="flex-1 gap-2"
                    onClick={openReport}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    View Report
                  </Button>
                )}
              </>
            ) : (
              <>
                <Button
                  className="flex-1 gap-2"
                  onClick={() =>
                    onAction?.("details", contract.id)
                  }
                >
                  <User className="w-3.5 h-3.5" />
                  View Profile
                </Button>

                {canViewReport && (
                  <Button
                    variant="secondary"
                    className="flex-1 gap-2"
                    onClick={openReport}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    View Report
                  </Button>
                )}
              </>
            )}
          </CardFooter>
        </Card>
      </motion.div>

      {/* ── Report modal ── */}
      <ReportModal
        open={reportOpen}
        onOpenChange={setReportOpen}
        contract={contract}
        reports={reports}
        reportLoading={reportLoading}
        selectedReportIndex={selectedReportIndex}
        setSelectedReportIndex={setSelectedReportIndex}
        showProgressEditor={showProgressEditor}
        setShowProgressEditor={setShowProgressEditor}
        progressInput={progressInput}
        setProgressInput={setProgressInput}
        progressSaving={progressSaving}
        onSaveProgress={onSaveProgress}
      />
    </>
  );
}