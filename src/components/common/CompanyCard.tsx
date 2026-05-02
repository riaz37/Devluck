"use client";

import { motion } from "framer-motion";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  MoreVertical,
  Eye,
  Pencil,
  Trash2,
  MapPin,
  Phone,
  Fingerprint,
  Trophy,
} from "lucide-react";

import { InfoItem } from "./info-item";
import { TopCompany } from "@/types/company";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

type CompanyCardProps = {
  company: TopCompany;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  showMenu?: boolean;
};

export function CompanyCard({
  company,
  onClick,
  onEdit,
  onDelete,
  showMenu = true
}: CompanyCardProps) {

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
      className="w-full max-w-sm mx-auto"
    >
      <Card className="relative p-2 overflow-hidden rounded-xl border  shadow-sm hover:shadow-md transition-all">


        <div className="relative  flex flex-col items-center justify-center">

          {/* LEFT TOP (ID + STATUS) */}
          <div className="absolute left-3 top-3 z-10 flex flex-col gap-1">
            <div className="flex items-center gap-1 bg-black/40 text-white px-2 py-0.5 rounded-md text-[12px] backdrop-blur">
              <Fingerprint className="h-3 w-3" />
              {(company.id || "").slice(0, 8)}
            </div>


          </div>

          {/* RIGHT TOP (Rank) */}
          <div className="absolute right-3 top-3 z-10">
            {typeof company.globalRank === "number" && (
              <div className="flex items-center gap-1 bg-primary/80 text-primary-foreground px-2 py-0.5 rounded-md text-[12px] backdrop-blur">
                <Trophy className="h-3 w-3" />
                {`${company.globalRank}`}
              </div>
            )}
          </div>

          {/* AVATAR */}
          <Avatar className="h-50 w-50 ring-2 ring-background shadow-sm mt-6">
            <AvatarImage
              src={company.image ||company.logo|| undefined}
              className="object-cover"
            />
            <AvatarFallback className="bg-primary/10 text-primary font-bold text-xl">
              {company.name?.charAt(0)?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>

        </div>
          {/* HEADER */}
        <CardHeader className="flex items-center justify-center text-center">
          <CardTitle className="text-xl font-semibold tracking-tight leading-tight">
            {company.name}
          </CardTitle>
        </CardHeader>
        {/* CONTENT */}
        <CardContent className="space-y-2 text-sm text-muted-foreground">
                    {/* META ROW */}
            <div className="space-y-2">
              
              <InfoItem
                label="Location"
                value=                {
                  company.location ||
                  (company.addresses?.length
                    ? company.addresses[0]?.address
                    : null) ||
                  "No location"
                }
                icon={<MapPin className="h-3.5 w-3.5" />}
              />

              <InfoItem
                label="Phone number"
                value={company.phoneNumber|| "No Phonenumber"}
                icon={<Phone className="h-3.5 w-3.5" />}
                highlight
              />

            </div>
        </CardContent>

        {/* FOOTER */}
        <CardFooter className="p-0 pt-0">
          <Button onClick={onClick} className="w-full justify-between">
            View Company
            <Eye className="h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}