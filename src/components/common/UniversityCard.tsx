"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  MoreVertical,
  MapPin,
  Phone,
  Eye,
  Pencil,
  Trash2,
  Fingerprint,
  Trophy,
} from "lucide-react";
import { motion } from "framer-motion";
import { University } from "@/hooks/companyapihandler/useUniversityHandler";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { cn } from "@/lib/utils";

type UniversityCardProps = {
  university: University;
  onEdit?: () => void;
  onDelete?: () => void;
  onClick?: () => void;
  showMenu?: boolean;
};

export function UniversityCard({
  university,
  onEdit,
  onDelete,
  onClick,
  showMenu = true,
}: UniversityCardProps) {
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
                src={university.image || undefined}
                className="object-cover"
              />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold text-base rounded-full">
                {university.name?.charAt(0)?.toUpperCase() ?? "U"}
              </AvatarFallback>
            </Avatar>

            {/* Name + description preview */}
            <div className="min-w-0 flex-1">
              <CardTitle className="text-base font-semibold leading-tight truncate">
                {university.name}
              </CardTitle>
              <CardDescription className="text-xs truncate mt-0.5">
                {university.website || "No website available"}
              </CardDescription>
            </div>

            {/* Kebab menu */}
            {showMenu && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 shrink-0 rounded-full -mr-1 -mt-1"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-[140px]">
                  <DropdownMenuItem onClick={onClick}>
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onEdit}>
                    <Pencil className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={onDelete}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </CardHeader>

        {/* ── CARD CONTENT ────────────────────────── */}
        <CardContent className="px-4 pt-4 pb-0 space-y-3">

          {/* ID + QS Rank row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-[11px] text-muted-foreground font-mono bg-muted px-2 py-0.5 rounded-md">
              <Fingerprint className="h-3 w-3 shrink-0" />
              {(university.id || "").slice(0, 8).toUpperCase()}
            </div>

            {university.qsWorldRanking != null && (
              <div className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-0.5 rounded-md text-[11px] font-semibold">
                <Trophy className="h-3 w-3 shrink-0" />
                QS {university.qsWorldRanking}
              </div>
            )}
          </div>

          <Separator />



          {/* Location row */}
          <div className="flex items-center gap-2.5 rounded-lg bg-muted/50 px-3 py-2.5">
            <MapPin className="h-5 w-5 text-muted-foreground" />
            <div className="min-w-0">
              <p className="text-[11px] text-muted-foreground leading-none mb-0.5">Location</p>
              <p className="text-sm font-semibold text-foreground truncate">
                {university.address || "No address added"}
              </p>
            </div>
          </div>

          {/* Phone row */}
          <div className="flex items-center gap-2.5 rounded-lg bg-muted/50 px-3 py-2.5">
            <Phone className="h-5 w-5 text-muted-foreground" />
            <div className="min-w-0">
              <p className="text-[11px] text-muted-foreground leading-none mb-0.5">Phone</p>
              <p className="text-sm font-semibold text-foreground truncate">
                {university.phoneNumber || "No phone number added"}
              </p>
            </div>
          </div>
          {/* ───────── DESCRIPTION ───────── */}
          <div className="space-y-2">

            <div className="flex items-center gap-2">
              <span className="h-px flex-1 bg-border/60" />

              <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                University Description
              </span>

              <span className="h-px flex-1 bg-border/60" />
            </div>

            <div className="rounded-lg border border-border/40 bg-muted/20 px-3 py-2">

              <p className={cn(
                "text-sm leading-6 line-clamp-2 min-h-[3rem]",
                university.description
                  ? "text-foreground"
                  : "text-muted-foreground italic"
              )}>
                {university.description || "No description provided for this university."}
              </p>

            </div>
          </div>
        </CardContent>

        {/* ── CARD FOOTER ─────────────────────────── */}
        <CardFooter className="px-4 pt-3 pb-4">
          <Button onClick={onClick} className="w-full justify-between group">
            <span>View University</span>
            <Eye className="h-4 w-4 transition-transform duration-150 group-hover:scale-110" />
          </Button>
        </CardFooter>

      </Card>
    </motion.div>
  );
}