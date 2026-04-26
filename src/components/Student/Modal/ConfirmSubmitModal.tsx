"use client";

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
import { Loader2 } from "lucide-react";

interface ConfirmSubmitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

const ConfirmSubmitModal = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
}: ConfirmSubmitModalProps) => {
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
          <DialogTitle>Confirm Submission</DialogTitle>

          <DialogDescription>
            Please confirm that you want to submit this. Once submitted, changes may not be editable.
          </DialogDescription>
        </DialogHeader>

        {/* Content */}
        <div className="flex-1 px-6 py-4 text-sm space-y-3">
          <h3 className="text-lg font-bold text-[var(--color-text-primary)]">
            Ready to Submit Your Application?
          </h3>

          <p className="text-[var(--color-text-primary)]">
            Please take a final moment to:
          </p>

          <ul className="list-disc pl-5 space-y-1 text-[var(--color-text-secondary)]">
            <li>Ensure all required fields (*) are filled</li>
            <li>Review your answers for accuracy</li>
            <li>Confirm your contact information</li>
          </ul>
        </div>

        {/* Footer */}
        <DialogFooter className="px-6 pb-6 flex gap-2">
          <DialogClose asChild>
            <Button variant="outline" disabled={isLoading}>
              Cancel
            </Button>
          </DialogClose>

          <Button onClick={onConfirm} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Confirm"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmSubmitModal;