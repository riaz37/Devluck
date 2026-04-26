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


interface PortfolioData {
  id?: string;
  name: string;
  link: string;
}

interface PortfolioModalProps {
  portfolio?: PortfolioData | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: PortfolioData) => void;
}

const PortfolioModal: React.FC<PortfolioModalProps> = ({
  portfolio,
  isOpen,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<PortfolioData>({
    name: "",
    link: "",
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (portfolio) setFormData(portfolio);
    else setFormData({ name: "", link: "" });
  }, [portfolio, isOpen]);

  const handleInputChange = (field: keyof PortfolioData, value: string) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error("Error saving portfolio:", error);
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
            {portfolio ? "Edit Portfolio" : "Add Portfolio"}
          </DialogTitle>

          <DialogDescription>
            {portfolio
              ? "Update your project links such as GitHub, LinkedIn, and live demo URLs."
              : "Add your project and include links like GitHub, LinkedIn, or a live demo to showcase your work."}
          </DialogDescription>
        </DialogHeader>

        {/* Body */}
        <form
          id="portfolioForm"
          onSubmit={handleSubmit}
          className="flex-1 flex flex-col gap-4 px-6 py-4 overflow-y-auto"
        >
          <ParallelogramInput
            label="Name"
            placeholder="Enter portfolio name"
            value={formData.name}
            onChange={(e) =>
              handleInputChange("name", e.target.value)
            }
          />

          <ParallelogramInput
            label="Link"
            placeholder="Enter portfolio link"
            value={formData.link}
            onChange={(e) =>
              handleInputChange("link", e.target.value)
            }
          />
        </form>

        {/* Footer */}
        <DialogFooter className="px-6 pb-6 flex gap-2">
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>

          <Button type="submit" form="portfolioForm" disabled={loading}>
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : portfolio ? (
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

export default PortfolioModal;