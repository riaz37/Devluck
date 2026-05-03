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
  DollarSign,
  ArrowRight,
  Trash2,
  Activity,
  Briefcase,
  Eye,
  Edit,
} from "lucide-react";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { cn } from "@/lib/utils";
import { InfoItem } from "../common/info-item";


type ContractStage = "running" | "evaluation" | "completed" | "disputed";

interface ContractCardProps {
  contract: {
    id: string;
    title: string;
    salaryValue: string | number;
    startDate: string;
    endDate: string;
    status: string;
    currency:string;
    currentStage: ContractStage;
  };
  onAction?: (action: string, id: string) => void;
}

export function ContractCard({ contract, onAction }: ContractCardProps) {
  const stages = [
    { id: "running", label: "Running", icon: Clock },
    { id: "evaluation", label: "Review", icon: Search },
    { id: "completed", label: "Done", icon: CheckCircle2 },
    { id: "disputed", label: "Issue", icon: ShieldAlert },
  ] as const;

  const currentIndex = stages.findIndex(s => s.id === contract.currentStage);

  const isDisputed = contract.currentStage === "disputed";
  const isCompleted = contract.currentStage === "completed";

  const formatCurrency = (amount: string | number, currency: string = "USD") => {
    if (amount === undefined || amount === null || amount === "") return "N/A";

    // remove commas, spaces, and non-numeric symbols
    const cleaned = String(amount).replace(/[^0-9.-]/g, "");

    const num = Number(cleaned);
    if (isNaN(num)) return "N/A";

    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(num);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      className="w-full max-w-[760px] mx-auto"
    >
      <Card className="h-full flex flex-col rounded-2xl shadow-sm hover:shadow-md transition-all">

        <CardHeader className="flex flex-row items-start justify-between gap-3">
          {/* LEFT SIDE */}
          <div className="space-y-1 min-w-0">

            <CardTitle className="text-base font-semibold truncate">
              {contract.title}
            </CardTitle>

            <CardDescription className="text-xs text-muted-foreground break-words line-clamp-2 whitespace-normal">
              <div className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {contract.startDate} → {contract.endDate}
              </div>
            </CardDescription>

          </div>
          
          {/* RIGHT SIDE */}
          <div className="flex items-start gap-2 shrink-0">

            <div className="flex flex-col items-end gap-1">
              <Badge variant="secondary" className="flex items-center gap-1 text-[10px]">
                <Fingerprint className="h-3 w-3" />
                  {contract.id.slice(0, 8)}
              </Badge>

              <Badge
                variant="secondary"
                className={cn(
                  "text-[10px] font-medium",
                  isDisputed && "text-red-500",
                  isCompleted && "text-emerald-500"
                )}
              >
                {contract.status}
              </Badge>
            </div>

            {/* MENU (RESTORED) */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild >
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-48">

                <DropdownMenuItem onClick={() => onAction?.("details", contract.id)}>
                  <Eye className="h-4 w-4 mr-2" />
                  Details
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
        <CardContent className="space-y-3 flex-1">

          {/* STEPPER (clean Apple style) */}
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 right-0 h-[1px] bg-muted top-1/2" />

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
                          active
                            ? "bg-black text-white dark:bg-white dark:text-black"
                            : "bg-white dark:bg-zinc-900 text-muted-foreground"
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

          {/* DATA */}
          <div className="grid grid-cols-2 gap-4 text-sm">

<InfoItem
  label="Budget"
  value={formatCurrency(contract.salaryValue, contract.currency)}
/>

            <InfoItem
              label="Status"
              value={contract.currentStage}
              icon={<Activity className="h-3.5 w-3.5" />}
            />

          </div>

        </CardContent>
        {/* FOOTER */}
        <CardFooter className="mt-auto">
          <Button
            onClick={() => onAction?.("details", contract.id)}
            className="w-full justify-between"
          >
            View Applicant Profile
            <Eye className="h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}