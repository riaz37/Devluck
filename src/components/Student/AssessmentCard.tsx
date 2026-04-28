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
} from "lucide-react";
import { AssessmentItem } from "@/types/assessment";

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

  return (
    <Card className="rounded-2xl border shadow-sm hover:shadow-md transition-all hover:-translate-y-1">

      {/* HEADER */}
      <CardHeader className="pb-3">
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

          <Badge variant="secondary" className="capitalize">
            {status || "not_started"}
          </Badge>
        </div>
      </CardHeader>

      {/* CONTENT */}
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          {isCompleted
            ? "This assessment is completed."
            : isEvaluating
            ? "Your assessment is being evaluated."
            : "Continue your assessment when you're ready."}
        </p>
      </CardContent>

      {/* FOOTER */}
      <CardFooter>
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