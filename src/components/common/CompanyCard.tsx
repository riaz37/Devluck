"use client";

import { motion } from "framer-motion";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Eye, MapPin, Phone, Fingerprint, Trophy } from "lucide-react";
import { TopCompany } from "@/types/company";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { cn } from "@/lib/utils";

type CompanyCardProps = {
  company: TopCompany;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  showMenu?: boolean;
};

export function CompanyCard({ company, onClick }: CompanyCardProps) {
  const location =
    company.location ||
    company.addresses?.[0]?.address ||
    null;

  const phone =
    company.phoneNumber ||
    company.addresses?.[0]?.phoneNumber ||
    null;

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
          <div className="flex items-center gap-3">

            {/* Logo */}
            <Avatar className="h-12 w-12 shrink-0 ring-2 ring-muted rounded-full">
              <AvatarImage
                src={company.image || company.logo || undefined}
                className="object-cover"
              />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold text-base">
                {company.name?.charAt(0)?.toUpperCase() ?? "C"}
              </AvatarFallback>
            </Avatar>

            {/* Name + email */}
            <div className="min-w-0 flex-1">
              <CardTitle className="text-base font-semibold leading-tight truncate">
                {company.name}
              </CardTitle>
              {company.email && (
                <CardDescription className="text-xs truncate mt-0.5">
                  {company.email}
                </CardDescription>
              )}
            </div>
          </div>
        </CardHeader>

        {/* ── CARD CONTENT ────────────────────────── */}
        <CardContent className="px-4 pt-4 pb-0 space-y-3">

          {/* ID + Rank row — always together, same visual weight */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-[11px] text-muted-foreground font-mono bg-muted px-2 py-0.5 rounded-md">
              <Fingerprint className="h-3 w-3 shrink-0" />
              {(company.id || "").slice(0, 8)}
            </div>

            {typeof company.globalRank === "number" && (
              <div className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-0.5 rounded-md text-[11px] font-semibold">
                <Trophy className="h-3 w-3 shrink-0" />
                Rank {company.globalRank}
              </div>
            )}
          </div>

          <Separator />

          {/* Location — full-width row */}
          <div className="flex items-center gap-2.5 rounded-lg bg-muted/50 px-3 py-2.5">
            <MapPin className="h-5 w-5 text-muted-foreground" />
            <div className="min-w-0">
              <p className="text-[11px] text-muted-foreground leading-none mb-0.5">Location</p>
              <p className="text-sm font-semibold text-foreground truncate">
                {location ?? "Not provided"}
              </p>
            </div>
          </div>

          {/* Phone — full-width row */}
          <div className="flex items-center gap-2.5 rounded-lg bg-muted/50 px-3 py-2.5">
            <Phone className="h-5 w-5 text-muted-foreground" />
            <div className="min-w-0">
              <p className="text-[11px] text-muted-foreground leading-none mb-0.5">Phone</p>
              <p className="text-sm font-semibold text-foreground truncate">
                {phone ?? "Not provided"}
              </p>
            </div>
          </div>

        </CardContent>

        {/* ── CARD FOOTER ─────────────────────────── */}
        <CardFooter className="px-4 pt-3 pb-4">
          <Button onClick={onClick} className="w-full justify-between group">
            <span>View Company</span>
            <Eye className="h-4 w-4 transition-transform duration-150 group-hover:scale-110" />
          </Button>
        </CardFooter>

      </Card>
    </motion.div>
  );
}