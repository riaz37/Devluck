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
import { motion } from "framer-motion";
import { Mail, Fingerprint, Eye, Trophy, MapPin, Target } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

export type ApplicantStatus = "pending" | "accepted" | "rejected";

export interface Applicant {
  applicantId: string;
  name: string;
  image?: string | null;
  email?: string | null;
  profileRanking?: number | null;
  profileComplete?: number | null;
  availability?: string | null;
  status?: string | null;
}

type TopStudentCardProps = {
  applicant: Applicant;
  onClick?: () => void;
};

export function TopStudentCard({ applicant, onClick }: TopStudentCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2, transition: { duration: 0.15 } }}
      transition={{ type: "spring", stiffness: 280, damping: 24 }}
      className="w-full max-w-sm mx-auto"
    >
      <Card className="rounded-2xl border bg-card shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">

        {/* ── CARD HEADER ─────────────────────────────── */}
        <CardHeader className="pb-0 pt-4 px-4">
          <div className="flex items-start justify-between gap-2">

            {/* Avatar + name + email */}
            <div className="flex items-center gap-3 min-w-0">
              <Avatar className="h-12 w-12 shrink-0 ring-2 ring-muted">
                <AvatarImage
                  src={applicant.image || undefined}
                  className="object-cover"
                />
                <AvatarFallback className="bg-primary/10 text-primary font-semibold text-base">
                  {applicant.name?.charAt(0)?.toUpperCase() ?? "U"}
                </AvatarFallback>
              </Avatar>

              <div className="min-w-0">
                <CardTitle className="text-base font-semibold leading-tight truncate">
                  {applicant.name}
                </CardTitle>
                <CardDescription className="flex items-center gap-1 mt-0.5 text-xs truncate">
                  <Mail className="h-3 w-3 shrink-0" />
                  <span className="truncate">{applicant.email}</span>
                </CardDescription>
              </div>
            </div>


          </div>
        </CardHeader>

        {/* ── CARD CONTENT ────────────────────────────── */}
        <CardContent className="px-4 pt-4 pb-0 space-y-3">

          {/* Status + ID row */}
          <div className="flex items-center justify-between">
            {/* Status badge */}
            <Badge className="shrink-0 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20  capitalize">
              {applicant.status ?? "active"}
            </Badge>

            <div className="flex items-center gap-1 text-[11px] text-muted-foreground font-mono bg-muted px-2 py-0.5 rounded-md">
              <Fingerprint className="h-3 w-3" />
              {(applicant.applicantId || "").slice(0, 8)}
            </div>
          </div>

          <Separator />

          {/* Meta stats */}
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col items-center justify-center rounded-lg bg-muted/50 px-3 py-2.5 gap-0.5">
              <div className="flex items-center gap-1 text-muted-foreground text-[11px]">
                <MapPin className="h-3 w-3" />
                <span>Availability</span>
              </div>
              <p className="text-sm font-semibold text-foreground truncate max-w-full">
                {applicant.availability ?? "N/A"}
              </p>
            </div>

            <div className="flex flex-col items-center justify-center rounded-lg bg-muted/50 px-3 py-2.5 gap-0.5">
              <div className="flex items-center gap-1 text-muted-foreground text-[11px]">
                <Trophy className="h-3 w-3" />
                <span>Ranking</span>
              </div>
              <p className="text-sm font-semibold text-foreground">
                {applicant.profileRanking ?? "N/A"}
              </p>
            </div>
          </div>

        </CardContent>

        {/* ── CARD FOOTER ─────────────────────────────── */}
        <CardFooter className="px-4 pt-3 pb-4">
          <Button
            onClick={onClick}
            className="w-full justify-between group"
          >
            <span>View Profile</span>
            <Eye className="h-4 w-4 transition-transform duration-150 group-hover:scale-110" />
          </Button>
        </CardFooter>

      </Card>
    </motion.div>
  );
}