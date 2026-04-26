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
import { ParallelogramInput } from "@/components/common/ParallelogramInput";


interface CorporateData {
  description: string;
  id?: string;
}

interface CorporateModalProps {
  Corporate?: CorporateData | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CorporateData) => void;
}

const CorporateModal: React.FC<CorporateModalProps> = ({
  Corporate,
  isOpen,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<CorporateData>({
    description: "",
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (Corporate) setFormData(Corporate);
    else setFormData({ description: "" });
  }, [Corporate, isOpen]);

  const handleInputChange = (field: keyof CorporateData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      await onSave(formData);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
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
          <DialogTitle>
            {Corporate ? "Edit Corporate Description" : "Add Corporate Description"}
          </DialogTitle>

          <DialogDescription>
            {Corporate
              ? "Update the description for this corporate entity."
              : "Add a description to define this corporate entity."}
          </DialogDescription>
        </DialogHeader>

        {/* Scrollable Content ONLY */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="flex flex-col gap-4">
            <ParallelogramInput
              label="Description"
              placeholder="Enter description"
              value={formData.description}
              type="textarea"
              onChange={(e) =>
                handleInputChange("description", e.target.value)
              }
            />

          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="px-6 pb-6 flex gap-2">
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>

          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : Corporate ? (
              "Update"
            ) : (
              "Add"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CorporateModal;