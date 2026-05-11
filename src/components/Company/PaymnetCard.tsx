"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import {
  Fingerprint,
  Eye,
  DollarSign,
  Activity,
  MapPin,
  Clock,
  Calendar,
  TrendingUp,
  StickyNote,
  Target,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { cn } from "@/lib/utils";
import { InfoItem } from "../common/info-item";

type ContractStatus = "Running" | "Completed" | "Disputed" | string;

type PaymentCardProps = {
  contract: {
    id: string;
    name: string;
    contractTitle: string;
    salary?: number | null;
    createdAt?: string;
    currency?: string;
    status?: string;
    studentImage?: string;
    duration?: string;
    note?: string;
    workProgress?: number;
    companyId?: string;
    createdDate?: string;
    student?: { image?: string } | null;
  };
  onClick?: () => void;
};

const statusConfig: Record<
  string,
  { badge: string; dot: string; label: string }
> = {
  Running: {
    badge:
      "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200/50",
    dot: "bg-blue-500",
    label: "Running",
  },

  Completed: {
    badge:
      "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200/50",
    dot: "bg-emerald-500",
    label: "Completed",
  },

  Disputed: {
    badge:
      "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200/50",
    dot: "bg-rose-500",
    label: "Disputed",
  },
};

function getStatusConfig(status?: string) {
  return statusConfig[status ?? ""] ?? {
    badge: "bg-zinc-100 text-zinc-600 border-zinc-200",
    dot: "bg-zinc-400",
    label: status ?? "Unknown",
  };
}

export function PaymentCard({ contract, onClick }: PaymentCardProps) {
  const s = getStatusConfig(contract.status);
  const avatarSrc = contract.studentImage || contract.student?.image || undefined;
  const progress = Math.min(Math.max(contract.workProgress ?? 0, 0), 100);

  const formatCompactNumber = (value: number) => {
    if (value >= 1_000_000) {
      return `${(value / 1_000_000).toFixed(1)}M`;
    }
    if (value >= 1_000) {
      return `${(value / 1_000).toFixed(1)}K`;
    }
    return value.toString();
  };

  const formattedSalary =
    contract.salary != null
      ? `${contract.currency ?? ""} ${formatCompactNumber(contract.salary)}`.trim()
      : null;


  const displayDate = contract.createdAt ?? contract.createdDate;
  const formattedDate = displayDate
    ? new Date(displayDate).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2, transition: { duration: 0.15 } }}
      transition={{ type: "spring", stiffness: 280, damping: 24 }}
      className="w-full max-w-sm mx-auto"
    >
      <Card className="rounded-2xl border bg-card shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">

        {/* ── CARD HEADER ─────────────────────────── */}
        <CardHeader className="pt-4 pb-0 px-4">
          <div className="flex items-start justify-between gap-2">

            {/* Avatar + name + title */}
            <div className="flex items-center gap-3 min-w-0">
              <Avatar className="h-12 w-12 shrink-0 ring-2 ring-muted">
                <AvatarImage src={avatarSrc} alt={contract.name} className="object-cover" />
                <AvatarFallback className="bg-primary/10 text-primary font-semibold text-base">
                  {contract.name?.charAt(0)?.toUpperCase() ?? "U"}
                </AvatarFallback>
              </Avatar>

              <div className="min-w-0">
                <CardTitle className="text-base font-semibold leading-tight truncate">
                  {contract.name}
                </CardTitle>
                <CardDescription className="text-xs truncate mt-0.5">
                  {contract.contractTitle}
                </CardDescription>
              </div>
            </div>


          </div>
        </CardHeader>

        {/* ── CARD CONTENT ────────────────────────── */}
        <CardContent className="px-4 pt-4 pb-0 space-y-3">

          <div className="flex items-center justify-between">
            {/* Status badge */}
            <Badge
              variant="outline"
              className={`shrink-0 flex items-center gap-1.5 text-xs font-medium px-2.5 py-0.5 ${s.badge}`}
            >
              <Target className="h-3 w-3" />
              {s.label}
            </Badge>

            {/* ID chip */}
            <div className="flex items-center gap-1 text-[11px] text-muted-foreground font-mono bg-muted px-2 py-0.5 rounded-md">
              <Fingerprint className="h-3 w-3" />
              {contract.id?.slice(0, 8)}
            </div>

          </div>

          <Separator />

          {/* Salary + Duration + Created At */}
          <div className="grid grid-cols-3 gap-2">
            <InfoItem
              label="Salary"
              value={formattedSalary ?? "N/A"}
              icon={<DollarSign className="h-3 w-3" />}
            />
              <InfoItem
                label="Duration"
                value={
                  contract.duration
                    ? `${contract.duration} ${Number(contract.duration) === 1 ? "month" : "months"}`
                    : "N/A"
                }
                icon={<Clock className="h-3 w-3" />}
              />
            <InfoItem
              label="Created"
              value={formattedDate ?? "N/A"}
              icon={<Calendar className="h-3 w-3" />}
            />
          </div>

          {/* Contract Progress */}
          {contract.workProgress != null && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="flex items-center gap-1 text-muted-foreground">
                  Contract Progress
                </span>
                <span className="font-semibold text-foreground">{progress}%</span>
              </div>
              <Progress value={progress} className="h-1.5" />
            </div>
          )}

          {/* ───────── NOTE ───────── */}
          <div className=" space-y-2">

            <div className="flex items-center gap-2">
              <span className="h-px flex-1 bg-border" />

              <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                Contract Notes
              </span>

              <span className="h-px flex-1 bg-border" />
            </div>

            <div className="rounded-lg border bg-muted/30 px-3 py-2">

              <p
                className={cn(
                  "text-sm leading-6 line-clamp-2 min-h-[3rem]",
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

        {/* ── CARD FOOTER ─────────────────────────── */}
        <CardFooter className="px-4 pt-3 pb-4">
          <Button onClick={onClick} className="w-full justify-between group">
            <span>View Payment</span>
            <Eye className="h-4 w-4 transition-transform duration-150 group-hover:scale-110" />
          </Button>
        </CardFooter>

      </Card>
    </motion.div>
  );
}