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
import DatePickerField from "@/components/common/DatePickerField";
import { ParallelogramInput } from "@/components/common/ParallelogramInput";



interface EducationData {
  name: string;
  major: string;
  startDate: string;
  endDate: string;
  description: string;
  id?: string;
}

interface EducationModalProps {
  education?: EducationData | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: EducationData) => void;
}

const EducationModal: React.FC<EducationModalProps> = ({
  education,
  isOpen,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<EducationData>({
    name: "",
    major: "",
    startDate: "",
    endDate: "",
    description: "",
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (education) setFormData(education);
    else
      setFormData({
        name: "",
        major: "",
        startDate: "",
        endDate: "",
        description: "",
      });
  }, [education, isOpen]);

  const handleInputChange = (field: keyof EducationData, value: string) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error("Error saving education:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="w-[calc(100%-24px)] max-w-[640px] max-h-[90vh] flex flex-col p-0">

        {/* Header */}
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>
            {education ? "Edit Education" : "Add Education"}
          </DialogTitle>

          <DialogDescription>
            {education
              ? "Update your education details such as degree, institution, and dates."
              : "Add your education background including degree, institution, and graduation year."}
          </DialogDescription>
        </DialogHeader>

        {/* Body */}
        <form
          id="educationForm"
          onSubmit={handleSubmit}
          className="flex-1 flex flex-col gap-4 px-6 py-4 overflow-y-auto"
        >
          <ParallelogramInput
            label="University Name"
            placeholder="Enter university name"
            value={formData.name}
            onChange={(e) =>
              handleInputChange("name", e.target.value)
            }
          />

          <ParallelogramInput
            label="Major"
            placeholder="Enter major"
            value={formData.major}
            onChange={(e) =>
              handleInputChange("major", e.target.value)
            }
          />

          <ParallelogramInput
            label="Description"
            placeholder="Enter description"
            value={formData.description}
            onChange={(e) =>
              handleInputChange("description", e.target.value)
            }
          />

          {/* ShadCN Date Pickers */}
          <DatePickerField
            label="Start Date"
            value={formData.startDate}
            onChange={(v) => handleInputChange("startDate", v)}
          />

          <DatePickerField
            label="End Date"
            value={formData.endDate}
            onChange={(v) => handleInputChange("endDate", v)}
          />
        </form>

        {/* Footer */}
        <DialogFooter className="px-6 pb-6 flex gap-2">
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>

          <Button type="submit" form="educationForm" disabled={loading}>
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : education ? (
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

export default EducationModal;