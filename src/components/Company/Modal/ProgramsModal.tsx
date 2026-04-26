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


interface ProgramsData {
  Program: string[];
}

interface ProgramsModalProps {
  Program?: string[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ProgramsData) => void;
}

const ProgramsModal: React.FC<ProgramsModalProps> = ({
  Program,
  isOpen,
  onClose,
  onSave,
}) => {
  const [programText, setProgramText] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const incoming = Program ?? [];
    setProgramText(incoming.join(", "));
  }, [Program, isOpen]);

  const handleSubmit = async () => {
    setLoading(true);

    try {
      const parsed = Array.from(
        new Set(
          programText
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        )
      );

      await onSave({ Program: parsed });
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
            {Program ? "Edit Program" : "Add Program"}
          </DialogTitle>

          <DialogDescription>
            {Program
              ? "Update the details of this company program."
              : "Add a new program to showcase what your company offers."}
          </DialogDescription>
        </DialogHeader>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="flex flex-col gap-3">

            <ParallelogramInput
              label="Programs Name"
              placeholder="Ex: Internship, Full-time, Part-time"
              value={programText}
              onChange={(e) => setProgramText(e.target.value)}
            />

            <p className="text-xs text-muted-foreground">
              Add multiple programs separated by commas
            </p>

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
            ) : Program ? (
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

export default ProgramsModal;