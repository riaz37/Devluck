"use client";

import { motion } from "framer-motion";
import {
  MoreVertical,
  PencilLine,
  Trash2,
  Fingerprint,
  MapPin,
  Briefcase,
  Edit2,
  Target,
  CalendarClock,
  DollarSign,
} from "lucide-react";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { InfoItem } from "../common/info-item";
import { ContractTemplate } from "@/hooks/companyapihandler/useContractTemplateHandler";
import { cn } from "@/lib/utils";



/* ---------------- TYPES ---------------- */

interface ContractCardTempletateProps {
  contract: ContractTemplate;
  onEdit: (contract: ContractTemplate) => void;
  onDelete?: (contract: ContractTemplate) => void;
}

/* ---------------- COMPONENT ---------------- */

export function ContractCardTempletate({
  contract,
  onEdit,
  onDelete,
}: ContractCardTempletateProps) {

    const truncate = (text?: string, max = 40) =>
    text ? (text.length > max ? text.slice(0, max) + "..." : text) : "N/A";

    return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
      className="w-full h-full"
    >
      <Card className="h-full flex flex-col rounded-2xl shadow-sm hover:shadow-md transition-all">

        {/* HEADER */}
        <CardHeader className="flex flex-row items-start justify-between gap-3">
                    {/* LEFT SIDE */}
          <div className="space-y-1 min-w-0">

            <CardTitle className="text-base font-semibold truncate">
               {truncate(contract.name)}
            </CardTitle>

            <CardDescription className="text-xs text-muted-foreground break-words line-clamp-2 whitespace-normal">
             {truncate(contract.contractTitle)}
            </CardDescription>

          </div>

          {/* RIGHT SIDE */}
          <div className="flex items-start gap-2 shrink-0">

            {/* BADGES */}
            <div className="flex flex-col items-end gap-1">
              <Badge variant="secondary" className="flex items-center gap-1 text-[10px]">
                <Fingerprint className="h-3 w-3" />
                {(contract.id || contract.id)?.slice(0, 6)}
              </Badge>
              <Badge
                className={cn(
                  "flex items-center gap-1 text-[10px]",
                  contract.status === "Active"
                    ? "bg-green-100 text-green-700 hover:bg-green-100"
                    : contract.status === "Inactive"
                    ? "bg-red-100 text-red-600 hover:bg-red-100"
                    : "bg-blue-100 text-blue-600 hover:bg-blue-100"
                )}
              >
                <Target className="h-3 w-3" />
                {contract.status}
              </Badge>
            </div>

            {/* MENU */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild >
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(contract)}>
                  <PencilLine className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>

                {onDelete && (
                  <DropdownMenuItem
                    className="text-red-500"
                    onClick={() => onDelete(contract)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                )}

              </DropdownMenuContent>
            </DropdownMenu>
      
          </div>

        
        </CardHeader>

          <CardContent className="space-y-1 flex-1">
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 justify-items-center">

              <InfoItem
                label="Salary"
                value={contract.salaryDisplay || "N/A"}
     
              />

              <InfoItem
                label="Duration"
                value={contract.duration || "N/A"}
                icon={<CalendarClock className="h-4 w-4" />}
              />

              <InfoItem
                label="Location"
                value={contract.workLocation || "Remote"}
                icon={<MapPin className="h-4 w-4" />}
              />

            </div>
          </CardContent>

        {/* FOOTER */}
        <CardFooter className="mt-auto">
          <Button
            onClick={() => onEdit(contract)}
            className="w-full justify-between rounded-lg"
          >
            Edit Contract Templates
            <Edit2 className="h-4 w-4" />
          </Button>
        </CardFooter>

      </Card>
    </motion.div>
  );
}