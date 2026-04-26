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
import { ParallelogramSelect } from "@/components/common/ParallelogramSelect";



interface LanguageData {
  id?: string;
  name: string;
  level: string;
}

interface LanguageModalProps {
  language?: LanguageData | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: LanguageData) => void;
}

const LanguageModal: React.FC<LanguageModalProps> = ({
  language,
  isOpen,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<LanguageData>({
    name: "",
    level: "",
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (language) setFormData(language);
    else setFormData({ name: "", level: "" });
  }, [language, isOpen]);

  const handleInputChange = (field: keyof LanguageData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (err) {
      console.error("Error saving language:", err);
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
            {language ? "Edit Language" : "Add Language"}
          </DialogTitle>

          <DialogDescription>
            {language
              ? "Update language name and proficiency level."
              : "Add a language you speak and specify your proficiency level."}
          </DialogDescription>
        </DialogHeader>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-4">

          <ParallelogramSelect
            label="Level"
            placeholder="Select level"
            value={formData.level}
            options={["Basic", "Conversational", "Fluent", "Native"]}
            onChange={(value) => handleInputChange("level", value)}
          />

          <ParallelogramInput
            label="Language Name"
            placeholder="Enter language name"
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
          />

        </div>

        {/* Footer */}
        <DialogFooter className="px-6 pb-6 flex gap-2">
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>

          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : language ? (
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

export default LanguageModal;