"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { TimePicker } from "@/components/common/TimePicker";


/* ================================
   TYPES
================================ */
interface InterviewData {
  interviewDate?: string;
  interviewTime: string;
  meetingLink: string;
  notes: string;
}

interface AssignInterviewModalProps {
  interview?: InterviewData | null;
  isOpen: boolean;
  onClose: () => void;
  onAssign: (data: InterviewData) => void;
}

/* ================================
   SAFE DATE FORMAT (FIX TIMEZONE BUG)
================================ */
const formatDateSafe = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

/* ================================
   COMPONENT
================================ */
export default function AssignInterviewModal({
  interview,
  isOpen,
  onClose,
  onAssign,
}: AssignInterviewModalProps) {
  const [formData, setFormData] = useState<InterviewData>({
    interviewDate: "",
    interviewTime: "12:00 AM",
    meetingLink: "",
    notes: "",
  });

  const [loading, setLoading] = useState(false);

  /* ================================
     RESET / LOAD DATA
  ================================= */
  useEffect(() => {
    if (interview) {
      setFormData(interview);
    } else if (isOpen) {
      setFormData({
        interviewDate: "",
        interviewTime: "12:00 AM",
        meetingLink: "",
        notes: "",
      });
    }
  }, [interview, isOpen]);

  const handleChange = (field: keyof InterviewData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.interviewDate || !formData.interviewTime || !formData.meetingLink.trim()) {
      return;
    }
    setLoading(true);
    try {
      await onAssign(formData);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  /* ================================
     UI
  ================================= */
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
          <DialogTitle>
            {interview ? "Edit Interview" : "Assign Interview"}
          </DialogTitle>

          <DialogDescription>
            {interview
              ? "Update interview details such as schedule, interviewer, or notes."
              : "Assign an interview to a candidate by selecting the role, time, and interviewer."}
          </DialogDescription>
        </DialogHeader>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="flex flex-col gap-4">

          {/* ================= DATE ================= */}
          <div className="space-y-2">
            <Label>Interview Date</Label>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left"
                >
                  {formData.interviewDate
                    ? format(new Date(formData.interviewDate + "T00:00:00"), "PPP")
                    : "Select date"}
                </Button>
              </PopoverTrigger>

              <PopoverContent className="w-auto p-2 rounded-xl border bg-background shadow-lg">
                <Calendar
                  mode="single"
                    selected={
                      formData.interviewDate
                        ? new Date(formData.interviewDate + "T00:00:00")
                        : undefined
                    }
                  onSelect={(date) =>
                    handleChange(
                      "interviewDate",
                      date ? formatDateSafe(date) : ""
                    )
                  }
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* ================= TIME ================= */}
          <div className="space-y-2">
            <Label>Interview Time</Label>

            <TimePicker
              value={formData.interviewTime}
              onChange={(val: string) =>
                handleChange("interviewTime", val)
              }
            />
          </div>

          {/* ================= LINK ================= */}
          <div className="space-y-2">
            <Label>Meeting Link / Location</Label>
            <Input
              placeholder="Zoom / Google Meet / Office"
              value={formData.meetingLink}
              onChange={(e) =>
                handleChange("meetingLink", e.target.value)
              }
            />
          </div>

          {/* ================= NOTES ================= */}
          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea
              placeholder="Notes for interviewer"
              value={formData.notes}
              onChange={(e) =>
                handleChange("notes", e.target.value)
              }
            />
          </div>
        </div>
      </div>

        {/* FOOTER */}
        <DialogFooter className="px-6 pb-6 flex gap-2">

          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>

          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving
              </>
            ) : interview ? (
              "Update"
            ) : (
              "Assign"
            )}
          </Button>

        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}