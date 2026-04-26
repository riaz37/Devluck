"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,

  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Briefcase, Eye, Fingerprint, HomeIcon, Mail } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";


export default function EmployeeCard({
  applicant,
  showMenu = false, // disabled
  onView,
}: any) {
  const router = useRouter();

return (
  <Card className="relative p-2 overflow-hidden rounded-xl border  shadow-sm hover:shadow-md transition-all">
    
    {/* IMAGE SECTION */}
    <div className="relative  flex flex-col items-center justify-center">
      {/* LEFT BADGE (ID) */}
      <div className="absolute left-1 top-1 z-10 flex flex-col gap-1">
        <Badge
          variant="secondary"
          className="flex items-center gap-1 bg-black/50 text-white backdrop-blur border-0"
        >
          <Fingerprint className="h-3 w-3" />
          {applicant.applicantId?.slice(0, 8)}
        </Badge>
      </div>

      {/* RIGHT BADGE (AVAILABILITY) */}
      {applicant.availability && (
        <div className="absolute right-1 top-1 z-10">
          <Badge
            variant="secondary"
            className="flex items-center gap-1 bg-black/50 text-white backdrop-blur border-0"
          >
            <HomeIcon className="h-3 w-3" />
            {applicant.availability}
          </Badge>
        </div>
      )}

                    {/* AVATAR */}
          <Avatar className="h-50 w-50 ring-2 ring-background shadow-sm mt-6">
            <AvatarImage
              src={applicant.student?.image || undefined}
              className="object-cover"
            />
            <AvatarFallback className="bg-primary/10 text-primary font-bold text-xl">
              {applicant.student?.name?.charAt(0)?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
    </div>


    {/* BODY */}
    <CardHeader className="space-y-2">
          <div className=" text-center">
            {/* NAME */}
            <CardTitle className="text-xl font-semibold tracking-tight leading-tight">
              {applicant.student?.name || "Unknown Candidate"}
            </CardTitle>
          </div>
    </CardHeader>

    {/* PROGRESS */}
    <CardContent className="space-y-2">
      <Progress value={applicant.profileComplete || 0} className="h-1.5" />

      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
        <span>Profile completion</span>
        <span className="font-medium text-foreground">
          {applicant.profileComplete || 0}%
        </span>
      </div>
    </CardContent>

    {/* FOOTER */}
    <CardFooter className="p-0 pt-0">
      <Button
        size="sm"
        className="w-full justify-between"
        onClick={() =>
          onView
            ? onView()
            : router.push(`/Company/profile/${applicant.student?.id}`)
        }
      >
        View Profile
        <Eye className="h-4 w-4" />
      </Button>
    </CardFooter>
  </Card>
);
}