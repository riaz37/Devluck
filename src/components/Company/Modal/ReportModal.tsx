"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AssessmentReport, Dimension } from "@/hooks/companyapihandler/questions-mock-api";
import { AlertTriangle, Flag } from "lucide-react";
import { motion } from "framer-motion";

interface Props {
  report: AssessmentReport | null;
  sessionId: string;
  isOpen: boolean;
  onClose: () => void;
  onFullReport: () => void;
}

const DIM_COLORS: Record<Dimension, string> = {
  technical_execution: "#7C3AED",
  communication: "#059669",
  personality: "#D97706",
  work_ethic: "#DC2626",
  motivation: "#2563EB",
};

export default function ReportModal({
  report,
  isOpen,
  onClose,
  onFullReport,
}: Props) {
  if (!report) return null;

  const scoreColor =
    report.overall_score >= 7
      ? "#10B981"
      : report.overall_score >= 5
      ? "#D97706"
      : "#DC2626";

  const formatDim = (d: string) =>
    d.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="
          w-[calc(100%-24px)] 
          max-w-[640px] 
          max-h-[90vh] 
          flex flex-col
          p-0
        "
      >
        {/* Header */}
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>Assessment Report</DialogTitle>

          <DialogDescription>
            View detailed performance results, scores, and AI-generated insights for this assessment.
          </DialogDescription>
        </DialogHeader>

        {/* Content */}
        {/* Scrollable Content ONLY */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="flex flex-col gap-4">
          
          {/* Score */}
          <div className="flex items-center gap-4">
            <div
              className="w-16 h-16 flex items-center justify-center rounded-full border-4 text-lg font-bold"
              style={{ borderColor: scoreColor, color: scoreColor }}
            >
              {report.overall_score.toFixed(1)}
            </div>

            <div>
              <div className="text-sm font-semibold">
                Overall Score
              </div>
              <div className="text-xs text-muted-foreground">
                {report.total_answered}/{report.total_questions} answered ·{" "}
                {report.total_evaluated} evaluated
              </div>
            </div>
          </div>

          {/* Dimensions */}
          <div className="flex flex-col gap-4">
            {Object.entries(report.dimensions).map(([dim, data]) => {
              const key = dim as Dimension;
              const pct = (data.score / 10) * 100;

              return (
                <div key={dim} className="flex items-center gap-3">
                  
                  <span
                    className="w-[140px] text-sm font-medium"
                    style={{ color: DIM_COLORS[key] }}
                  >
                    {formatDim(dim)}
                  </span>

                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ type: "spring", stiffness: 80, damping: 18 }}
                      className="h-full rounded-full"
                      style={{
                        backgroundColor: DIM_COLORS[key],
                      }}
                    />
                    
                  </div>

                  <span className="text-sm font-medium">
                    {data.score.toFixed(1)}
                  </span>
                </div>
              );
            })}
          </div>

          {/* AI Warning */}
          {report.ai_signals.likely_used_ai && (
            <div className="flex items-center gap-2 text-sm text-yellow-600 bg-yellow-100 px-3 py-2 rounded-md">
              <AlertTriangle className="w-4 h-4" />
              <span>
                AI usage suspected —{" "}
                {report.ai_signals.surface_level_answers} surface-level answers
              </span>
            </div>
          )}

          {/* Flags */}
          {report.red_flags.length > 0 && (
            <div className="text-sm">
              <div className="flex items-center gap-1 font-semibold mb-1">
                <Flag className="w-4 h-4 text-red-500" />
                Top Flags:
              </div>
              <ul className="list-disc pl-5 mt-1">
                {report.red_flags.slice(0, 3).map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
        </div>

        {/* Footer */}
        <DialogFooter className="px-6 pb-6 flex gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>

          <Button onClick={onFullReport}>
            Full Report
          </Button>
        </DialogFooter>

      </DialogContent>
    </Dialog>
  );
}