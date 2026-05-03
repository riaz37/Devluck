"use client"



import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"

import {
  MapPin,
  DollarSign,
  Calendar,
  Eye,
  TrendingUp,
  Fingerprint,
  Activity,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { InfoItem } from "../common/info-item"

interface CardContract {
  id: string | number
  contractTitle: string
  company?: string
  salary?: string
  workProgress?: number
  opportunityStatus?: string
  location?: string
  deadline?: string
}

interface OpportunityDashbordCardProps {
  contract: CardContract
  applied?: boolean
  onClick?: () => void
}

export function OpportunityDashbordCard({
  contract,
  applied,
  onClick,
}: OpportunityDashbordCardProps) {

  const truncate = (text?: string, max = 30) =>
    text ? (text.length > max ? text.slice(0, max) + "..." : text) : "N/A"

  return (
      <Card className="rounded-2xl shadow-sm hover:shadow-md ">

        {/* HEADER */}
        <CardHeader className="flex flex-row items-center justify-between">

          {/* LEFT */}
          <div className="flex items-center gap-3">

          {/* COMPANY AVATAR */}
          <Avatar className="h-10 w-10 ring-2 ring-background shadow-sm flex-shrink-0">
            <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm">
              {contract.company?.charAt(0)?.toUpperCase() || "C"}
            </AvatarFallback>
          </Avatar>

            <div>
              <CardTitle className="text-base font-semibold">
                {truncate(contract.contractTitle)}
              </CardTitle>

              <CardDescription>
                {truncate(contract.company, 18)}
              </CardDescription>
            </div>

          </div>

          {/* RIGHT BADGE */}


        </CardHeader>

        {/* CONTENT */}
        <CardContent className="space-y-4">

          {/* BADGES */}
          <div className="flex flex-wrap gap-2">

            <Badge variant="secondary" className="text-xs flex items-center gap-1 ">
              <Fingerprint className="w-3 h-3" />
              {String(contract.id).slice(0, 8)}
            </Badge>

            <Badge variant="outline" className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {truncate(contract.location, 12)}
            </Badge>

            <Badge variant="outline" className="flex items-center gap-1">
              {truncate(contract.salary, 10)}
            </Badge>

          </div>

          <Separator />

          {/* PROGRESS */}
          <div className="space-y-2">

            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Match</span>
              <span className="font-medium">
                {contract.workProgress ?? 0}%
              </span>
            </div>

            <Progress value={contract.workProgress ?? 0} className="h-2" />

          </div>

          <div className="flex justify-between gap-2">

            <InfoItem
              label="Deadline"
              value={contract.deadline || "No deadline"}
              icon={<Calendar className="h-3.5 w-3.5" />}
            />

            <InfoItem
              label="Application Status"
              value={
                <Badge variant={applied ? "default" : "outline"}>
                  {applied ? "Applied" : "Not Applied"}
                </Badge>
              }
              icon={<Activity className="h-3.5 w-3.5" />}

            />

          </div>

        </CardContent>

        {/* FOOTER */}
        <CardFooter className="flex gap-2">
          <Button
            onClick={onClick}
            variant={applied ? "default" : "secondary"}
            className="w-full justify-between cursor-pointer"
          >
            {applied ? "Applied - View Details" : "Apply Now - View Details"}
            <Eye className="w-4 h-4" />
          </Button>
        </CardFooter>

      </Card>
  )
}