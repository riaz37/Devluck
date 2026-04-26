"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";

interface PostAcceptContractChoiceModalProps {
  isOpen: boolean;
  applicantName?: string;
  onClose: () => void;
  onCreateContract: () => void;
  onUseTemplate: () => void;
}

export default function PostAcceptContractChoiceModal({
  isOpen,
  applicantName,
  onClose,
  onCreateContract,
  onUseTemplate,
}: PostAcceptContractChoiceModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Applicant accepted</DialogTitle>

          <DialogDescription>
            {applicantName
              ? `${applicantName} has been accepted. Would you like to create a contract?`
              : "Applicant has been accepted. Would you like to create a contract?"}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 flex flex-wrap gap-2 justify-end">
          <Button onClick={onCreateContract}>
            Create Contract
          </Button>

          <Button variant="outline" onClick={onUseTemplate}>
            Use Template
          </Button>

          <Button variant="ghost" onClick={onClose}>
            Later
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}