"use client";

import { motion } from "framer-motion";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Fingerprint,
  Eye,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

type ApplicantCardProps = {
  studentName: string;
  studentNumber: string;
  imageUrl?: string;
  onClick?: () => void;
};

export function ApplicantCard({
  studentName,
  studentNumber,
  imageUrl,
  onClick,
}: ApplicantCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
      className="w-full max-w-sm mx-auto"
    >
      <Card className="relative p-2 overflow-hidden rounded-xl border shadow-sm hover:shadow-md transition-all">

        {/* ID BADGE (top-right) */}
        <div className="absolute left-2 top-2 z-10">
          <div className="flex items-center gap-1 bg-black/40 text-white px-1.5 py-0.5 rounded-md text-[10px] backdrop-blur">
            <Fingerprint className="h-2.5 w-2.5" />
            {studentNumber}
          </div>
        </div>

        {/* AVATAR */}
        <div className="flex flex-col items-center text-center space-y-1 mt-6 mb-2">
          <Avatar className="h-30 w-30 ring-2 ring-background shadow-sm mb-2">
            <AvatarImage
              src={imageUrl || undefined}
              className="object-cover"
            />

            <AvatarFallback className="bg-primary/10 text-primary font-bold text-xl">
              {studentName?.charAt(0)?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>

          {/* NAME */}
          <div className="flex items-center gap-2 text-sm font-medium">
            <span className="truncate">{studentName}</span>
          </div>


        </div>

        {/* FOOTER */}
        <CardFooter className="p-0 pt-0">
          <Button
            onClick={onClick}
            size="sm"
            className="w-full gap-2 cursor-pointer"
          >
            <Eye className="h-4 w-4" />
            View Profile

          </Button>
        </CardFooter>

      </Card>
    </motion.div>
  );
}