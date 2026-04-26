"use client";

import React, { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogDescription,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";

import { useStudentDisputeHandler } from "@/hooks/studentapihandler/useStudentDisputeHandler";
import { ParallelogramInput } from "@/components/common/ParallelogramInput";
import { ParallelogramSelect } from "@/components/common/ParallelogramSelect";


interface ContractDispute {
  reason: string;
  note: string;
}

interface ContractDisputeModalProps {
  isOpen: boolean;
  onClose: () => void;
  contractId: string;
  onSuccess?: () => void;
}

const DisputeModal: React.FC<ContractDisputeModalProps> = ({
  isOpen,
  onClose,
  contractId,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<ContractDispute>({
    reason: "",
    note: "",
  });

  const { createDispute, loading } = useStudentDisputeHandler();

  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData({ reason: "", note: "" });
      setSubmitError(null);
      setSubmitSuccess(false);
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    if (!formData.reason?.trim()) {
      setSubmitError("Please provide a reason for the dispute");
      return;
    }

    try {
      await createDispute(contractId, {
        reason: formData.reason,
        note: formData.note || undefined,
      });

      setSubmitSuccess(true);

      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 1500);
    } catch (err: any) {
      setSubmitError(err.message || "Failed to file dispute");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
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
          <DialogTitle>Send Contract Dispute</DialogTitle>

          <DialogDescription>
            Report an issue with this contract. The dispute will be reviewed by the company or system admin.
          </DialogDescription>
        </DialogHeader>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="flex flex-col gap-4">

            <ParallelogramSelect
              label="Select Reason"
              placeholder="Choose dispute reason"
              value={formData.reason}
              options={[
                "Payment Issue",
                "Contract Terms",
                "Work Scope Disagreement",
                "Delay / Deadline Issue",
                "Other",
              ]}
              onChange={(value) =>
                setFormData((prev) => ({ ...prev, reason: value }))
              }
            />

            <ParallelogramInput
              label="Note"
              placeholder="Write your dispute details here..."
              value={formData.note}
              type="textarea"
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  note: e.target.value,
                }))
              }
            />

            {/* Error */}
            {submitError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                {submitError}
              </div>
            )}

            {/* Success */}
            {submitSuccess && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-600">
                ✓ Dispute filed successfully! The company will be notified.
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="px-6 pb-6 flex gap-2">
          <DialogClose asChild>
            <Button variant="outline" disabled={loading || submitSuccess}>
              Cancel
            </Button>
          </DialogClose>

          <Button
            onClick={handleSubmit}
            disabled={loading || submitSuccess}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : submitSuccess ? (
              "Sent"
            ) : (
              "Send"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DisputeModal;