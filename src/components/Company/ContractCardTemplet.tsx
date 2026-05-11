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
import { Separator } from "../ui/separator";



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

    const truncate = (text?: string, max = 50) =>
    text ? (text.length > max ? text.slice(0, max) + "..." : text) : "N/A";

    return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
      className="w-full h-full"
    >
      <Card className="rounded-2xl border bg-card shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">

        {/* HEADER */}
        <CardHeader className="pb-0 pt-4 px-4">
        <div className="flex items-start justify-between gap-2">
          {/* LEFT SIDE */}
          <div className="min-w-0">
            <CardTitle className="text-base font-semibold truncate">
               {truncate(contract.name)}
            </CardTitle>
            <CardDescription className="flex items-center gap-1 mt-0.5 text-xs truncate">
             {truncate(contract.contractTitle)}
            </CardDescription>
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

          <CardContent className="px-4 pt-4 pb-0 space-y-3">

              {/* STATUS + ID - HORIZONTAL LAYOUT */}
              <div className="flex items-center justify-between mb-4">
                {/* Status badge - LEFT */}
                <Badge
                  className={cn(
                    "shrink-0 flex items-center gap-1.5 text-xs font-medium px-2.5 py-0.5 border",

                    contract.status === "Active" &&
                      "bg-green-100 text-green-700 ",

                    contract.status === "Inactive" &&
                      "bg-red-100 text-red-600 ",

                    contract.status === "Draft" &&
                      "bg-blue-100 text-blue-600 ",

                    "hover:bg-muted/50"
                  )}
                >
                  <Target className="h-3 w-3" />
                  {contract.status}
                </Badge>

                {/* ID chip - RIGHT */}
                <div className="flex items-center gap-1 text-[11px] text-muted-foreground font-mono bg-muted px-2 py-0.5 rounded-md">
                  <Fingerprint className="h-3 w-3" />
                  {contract.id?.slice(0, 8) || "N/A"}
                </div>
              </div>

              <Separator />

            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 justify-items-center">

              <InfoItem
                label="Salary"
                value={contract.salaryDisplay || "N/A"}
                icon={<DollarSign className="h-4 w-4" />}
     
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
        <CardFooter className="px-4 pt-3 pb-4">
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