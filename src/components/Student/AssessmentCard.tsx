"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import {
  PlayCircle,
  RotateCcw,
  Lock,
  Globe,
  Target,
} from "lucide-react";
import { AssessmentItem, AssessmentStatus } from "@/types/assessment";

interface AssessmentCardProps {
  item: AssessmentItem;
  isStarting?: boolean;
  onStart?: () => void;
}

export function AssessmentCard({
  item,
  isStarting,
  onStart,
}: AssessmentCardProps) {
  const status = String(item.assessmentStatus || "").toLowerCase();

  const isCompleted = status === "completed";
  const isEvaluating = status === "evaluating";
  const isInProgress = status === "in_progress";
  const isExpired = Boolean((item as any).isExpired) || !item.canStart;

  const title = item.opportunity?.title || "Assessment";

  const isDisabled = isCompleted || isEvaluating || isExpired;

  const getButtonLabel = () => {
    if (isCompleted) return "Completed";
    if (isEvaluating) return "Evaluating";
    if (isExpired) return "You can't take this assignment anymore";
    if (isInProgress) return "Resume";
    if (item.sessionId) return "Resume";
    return "Start";
  };

  const getIcon = () => {
    if (isExpired) return null;
    if (isInProgress || item.sessionId) return <RotateCcw className="h-4 w-4" />;
    return <PlayCircle className="h-4 w-4" />;
  };

  const icon = getIcon();

  const statusClasses: Record<AssessmentStatus, string> = {
  not_started: "bg-muted text-muted-foreground ",
  in_progress: "bg-yellow-500/10 text-yellow-600 ",
  evaluating: "bg-blue-500/10 text-blue-600 ",
  completed: "bg-green-500/10 text-green-600 ",
  expired: "bg-red-500/10 text-red-600 ",
  };

  return (
    <Card className="rounded-2xl border bg-card shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">

      {/* HEADER */}
      <CardHeader className="pt-4 pb-0 px-4">
        <div className="flex items-start justify-between gap-3">

          <div className="space-y-1 min-w-0">
            <CardTitle className="text-base font-semibold truncate">
              {title}
            </CardTitle>

            <CardDescription className="flex items-center gap-2 text-xs">
              {item.source === "private" ? (
                <>
                  <Lock className="h-3 w-3" />
                  Private Assessment
                </>
              ) : (
                <>
                  <Globe className="h-3 w-3" />
                  Public Assessment
                </>
              )}
            </CardDescription>
          </div>
          <Badge
            className={`capitalize flex items-center gap-1 ${statusClasses[status as AssessmentStatus]}`}
          >
            <Target className="h-3 w-3" />
            {status || "not_started"}
          </Badge>
        </div>
      </CardHeader>

      {/* CONTENT */}
      <CardContent className="px-4 pt-4 pb-0 space-y-3">
        <p className="text-sm text-muted-foreground">
          {isCompleted
            ? "This assessment is completed."
            : isExpired
            ? "This assessment has expired."
            : isInProgress
            ? "Your assessment is in progress. Continue where you left off."
            : isEvaluating
            ? "Your assessment is being evaluated."
            : isDisabled
            ? "This assessment is currently disabled."
            : "Continue your assessment when you're ready."}
        </p>
      </CardContent>

      {/* FOOTER */}
      <CardFooter className="px-4 pt-3 pb-4">
        <Button
          onClick={isDisabled ? undefined : onStart}
          disabled={isDisabled || isStarting}
          className="w-full justify-between"
        >
          {isStarting ? (
            "Starting..."
          ) : (
            <>
              {getButtonLabel()}
              {icon}
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}