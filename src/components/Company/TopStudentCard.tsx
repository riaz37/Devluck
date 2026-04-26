"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { motion } from "framer-motion";
import { Mail,Fingerprint, Eye, Trophy, Calendar, HomeIcon, MapPin } from "lucide-react";
import { InfoItem } from "../common/info-item";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

export type ApplicantStatus = "pending" | "accepted" | "rejected";

export interface Applicant {
  applicantId: string;
  name: string;
  image?: string | null;
  email?: string | null;
  profileRanking?: number | null;
  profileComplete?: number | null;
  availability?: string | null
  status?: string | null
}

type TopStudentCardProps = {
  applicant: Applicant;
  onClick?: () => void;
};

export function TopStudentCard({
  applicant,
  onClick,
}: TopStudentCardProps) {

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
          <div className="absolute left-1 top-1 z-10 flex flex-col gap-1">
            <div className="flex items-center gap-1 bg-black/40 text-white px-2 py-0.5 rounded-md text-[10px] backdrop-blur">
              <Fingerprint className="h-2.5 w-2.5" />
              {(applicant.applicantId || "").slice(0, 6)}
            </div>


          </div>

          {/* RIGHT TOP (MENU) */}
          <div className="absolute right-1 top-1 z-10">
            <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20">
              {applicant.status}
            </Badge>
          </div>

          {/* AVATAR */}
          <Avatar className="h-50 w-50 ring-2 ring-background shadow-sm mt-6">
            <AvatarImage
              src={applicant.image || undefined}
              className="object-cover"
            />
            <AvatarFallback className="bg-primary/10 text-primary font-bold text-xl">
              {applicant.name?.charAt(0)?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>

        </div>

        <CardHeader className="space-y-2">

          <div className=" text-center space-y-1">
            {/* NAME */}
            <CardTitle className="text-xl font-semibold tracking-tight leading-tight">
              {applicant.name}
            </CardTitle>

            {/* EMAIL (secondary) */}
            <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
              <Mail className="h-3 w-3" />
              <span className="truncate max-w-[180px]">{applicant.email}</span>
            </div>
          </div>

          {/* META ROW */}
            <div className="flex items-center justify-between pt-2">
              
              <InfoItem
                label="Applied"
                value={applicant.availability ?? "N/A"}
                icon={<MapPin className="h-4 w-4" />}
              />

              <InfoItem
                label="Ranking"
                value={`${applicant.profileRanking || "N/A"}`}
                icon={<Trophy className="h-3.5 w-3.5" />}
                highlight
              />

            </div>

        </CardHeader>

        {/* FOOTER */}
        <CardFooter className="p-0 pt-0">
          <Button
            onClick={onClick}
            className="w-full justify-between"
          >
            View Profile
            <Eye className="h-4 w-4" />
          </Button>
        </CardFooter>

      </Card>
    </motion.div>
  );
}