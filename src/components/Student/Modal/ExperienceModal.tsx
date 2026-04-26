"use client";

import React, { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";

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
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ParallelogramInput } from "@/components/common/ParallelogramInput";
import DatePickerField from "@/components/common/DatePickerField";


interface ExperienceData {
  companyName: string;
  role: string;
  startDate: string;
  endDate: string;
  description: string;
  id?: string;
}

interface ExperienceModalProps {
  experience?: ExperienceData | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ExperienceData) => void;
}



const ExperienceModal: React.FC<ExperienceModalProps> = ({
  experience,
  isOpen,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<ExperienceData>({
    companyName: "",
    role: "",
    startDate: "",
    endDate: "",
    description: "",
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (experience) setFormData(experience);
    else
      setFormData({
        companyName: "",
        role: "",
        startDate: "",
        endDate: "",
        description: "",
      });
  }, [experience, isOpen]);

  const handleInputChange = (field: keyof ExperienceData, value: string) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error("Error saving experience:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[calc(100%-24px)] max-w-[640px] max-h-[90vh] flex flex-col p-0">

        {/* Header */}
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>
            {experience ? "Edit Experience" : "Add Experience"}
          </DialogTitle>

          <DialogDescription>
            {experience
              ? "Update your work experience details such as role, company, and duration."
              : "Add your work experience including role, company, and employment period."}
          </DialogDescription>
        </DialogHeader>

        {/* Body */}
        <form
          id="experienceForm"
          onSubmit={handleSubmit}
          className="flex-1 flex flex-col gap-4 px-6 py-4 overflow-y-auto"
        >
          <ParallelogramInput
            label="Company Name"
            placeholder="Enter company name"
            value={formData.companyName}
            onChange={(e) =>
              handleInputChange("companyName", e.target.value)
            }
          />

          <ParallelogramInput
            label="Role"
            placeholder="Enter role"
            value={formData.role}
            onChange={(e) => handleInputChange("role", e.target.value)}
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

          <Button type="submit" form="experienceForm" disabled={loading}>
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : experience ? (
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

export default ExperienceModal;