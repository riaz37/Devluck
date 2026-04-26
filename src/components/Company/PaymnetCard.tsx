"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { motion } from "framer-motion";
import { Mail, Fingerprint, Eye, Trophy, HomeIcon, BadgeCheck, DollarSign, Activity } from "lucide-react";
import { InfoItem } from "../common/info-item";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";



type PaymnetCardProps = {
  contract: {
    id: string;
    name: string;
    contractTitle: string;
    salary?: number | null;
    createdAt?: string;
    currency?: string;
    status?: string;
    studentImage?: string;
  };
  onClick?: () => void;
};

export function PaymnetCard({ contract,onClick }: PaymnetCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
      className="w-full max-w-sm mx-auto"
    >
      <Card className="relative p-4 overflow-hidden rounded-xl border shadow-sm hover:shadow-md transition-all">

        <div className="relative flex flex-col items-center justify-center">

          {/* LEFT TOP (ID) */}
          <div className="absolute left-1 top-1 z-10 flex flex-col gap-1">
            <div className="flex items-center gap-1 bg-black/40 text-white px-2 py-0.5 rounded-md text-[10px] backdrop-blur">
              <Fingerprint className="h-2.5 w-2.5" />
              {contract.id?.slice(0, 6)}
            </div>
          </div>

          {/* RIGHT TOP (STATUS) */}
          <div className="absolute right-1 top-1 z-10">
            <Badge
            className={`
                text-[12px]
                ${
                contract.status === "Running" &&
                "bg-[#D3FCD2] text-[#22C55E] hover:bg-[#D3FCD2]/80"
                }
                ${
                contract.status === "Completed" &&
                "bg-[#E0E0E0] text-[#666666] hover:bg-[#E0E0E0]/80"
                }
                ${
                contract.status === "Disputed" &&
                "bg-[#FFE2E2] text-[#DC2626] hover:bg-[#FFE2E2]/80"
                }
            `}
            >
            {contract.status}
            </Badge>
          </div>

          {/* AVATAR */}
          <Avatar className="h-50 w-50 ring-2 ring-background shadow-sm mt-6">
            <AvatarImage
              src={contract.studentImage || undefined}
              alt={contract.name}
              className="object-cover"
            />
            <AvatarFallback className="bg-primary/10 text-primary font-bold text-xl">
              {contract.name?.charAt(0)?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* HEADER */}
        <CardHeader className="space-y-2 text-center">

          <div className="space-y-1">
            <CardTitle className="text-xl font-semibold tracking-tight leading-tight">
              {contract.name}
            </CardTitle>

            <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">

              <span className="truncate max-w-[180px]">
                {contract.contractTitle}
              </span>
            </div>
          </div>

          {/* META */}
          <div className="flex items-center justify-between pt-2">

            <InfoItem
              label="Salary"
              value={
                contract.salary
                  ? `${contract.currency || ""} ${contract.salary}`
                  : "N/A"
              }
            />

            <InfoItem
              label="Status"
              value={contract.status || "Unknown"}
              icon={<Activity className="h-3.5 w-3.5" />}
              highlight
            />

          </div>

        </CardHeader>

                {/* FOOTER */}
        <CardFooter className="p-0 pt-0">
          <Button
            onClick={onClick}
            className="w-full gap-2"
          >
            <Eye className="h-4 w-4" />
            View Payment
          </Button>
        </CardFooter>

      </Card>
    </motion.div>
  );
}