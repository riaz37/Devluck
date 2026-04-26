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


interface SkillsData {
  skills: string[];
}

interface SkillsModalProps {
  skills?: string[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: SkillsData) => void;
}

const SkillsModal: React.FC<SkillsModalProps> = ({
  skills,
  isOpen,
  onClose,
  onSave,
}) => {
  const [inputValue, setInputValue] = useState("");

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setInputValue((skills ?? []).join(", "));
  }, [skills, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);

    const skillsArray = Array.from(
      new Set(
        inputValue
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      )
    );

    try {
      await onSave({ skills: skillsArray });
      onClose();
    } catch (error) {
      console.error(error);
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
            {skills ? "Edit Skills" : "Add Skills"}
          </DialogTitle>

          <DialogDescription>
            {skills
              ? "Update your technical and professional skills."
              : "Add your technical and professional skills such as React, Node.js, or UI/UX design."}
          </DialogDescription>
        </DialogHeader>

        {/* Body */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 flex flex-col gap-4 px-6 py-4 overflow-y-auto"
        >
          <ParallelogramInput
            label="Skills Name"
            placeholder="Ex: HTML, CSS, PHP"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />

          <span className="text-xs text-muted-foreground">
            Add multiple skills separated by comma
          </span>
        </form>

        {/* Footer */}
        <DialogFooter className="px-6 pb-6 flex gap-2">
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>

          <Button type="submit" onClick={handleSubmit} disabled={loading}>
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : skills ? (
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

export default SkillsModal;