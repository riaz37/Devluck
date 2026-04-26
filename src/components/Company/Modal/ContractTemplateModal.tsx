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


// Types
interface ContractData {
  name: string;
  contractTitle: string;
  currency: string;
  duration: string;
  monthlyAllowance?: string;
  workLocation: "Hybrid" | "Remote" | "Onsite";
  status: "Active" | "Inactive" | "Draft";
}

interface ContractModalProps {
  contract?: ContractData | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ContractData) => Promise<void> | void;
}

const ContractModal: React.FC<ContractModalProps> = ({
  contract,
  isOpen,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<ContractData>({
    name: "",
    contractTitle: "",
    currency: "",
    duration: "",
    monthlyAllowance: "",
    workLocation: "Hybrid",
    status: "Active",
  });

  const [loading, setLoading] = useState(false);

  // reset + fill when open
  useEffect(() => {
    if (!isOpen) return;

    if (contract) {
      setFormData({
        name: contract.name || "",
        contractTitle: contract.contractTitle || "",
        currency: contract.currency || "",
        duration: contract.duration || "",
        monthlyAllowance: contract.monthlyAllowance ?? "",
        workLocation: contract.workLocation || "Hybrid",
        status: contract.status || "Active",
      });
    } else {
      setFormData({
        name: "",
        contractTitle: "",
        currency: "",
        duration: "",
        monthlyAllowance: "",
        workLocation: "Hybrid",
        status: "Active",
      });
    }
  }, [contract, isOpen]);

  const handleInputChange = (field: keyof ContractData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error("Failed to save contract:", error);
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
            {contract ? "Edit Template" : "Create Template"}
          </DialogTitle>

          <DialogDescription>
            {contract
              ? "Update this contract template to adjust default terms and structure."
              : "Create a reusable contract template to speed up contract creation."}
          </DialogDescription>
        </DialogHeader>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="flex flex-col gap-4">

          <ParallelogramInput
            label="Template Name"
            placeholder="Enter template name"
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
          />

          <ParallelogramInput
            label="Contract Title"
            placeholder="Enter contract title"
            value={formData.contractTitle}
            onChange={(e) =>
              handleInputChange("contractTitle", e.target.value)
            }
          />

          <ParallelogramSelect
            label="Duration"
            placeholder="Select duration"
            value={formData.duration}
            options={["1 month", "3 months", "6 months", "12 months"]}
            onChange={(val) => handleInputChange("duration", val)}
          />

          <ParallelogramSelect
            label="Work Location"
            placeholder="Select location"
            value={formData.workLocation}
            options={["Hybrid", "Remote", "Onsite"]}
            onChange={(val) =>
              handleInputChange(
                "workLocation",
                val as ContractData["workLocation"]
              )
            }
          />

          <ParallelogramInput
            label="Monthly Allowance"
            placeholder="Enter amount"
            value={formData.monthlyAllowance || ""}
            onChange={(e) =>
              handleInputChange("monthlyAllowance", e.target.value)
            }
          />

          <ParallelogramSelect
            label="Currency"
            placeholder="Select currency"
            value={formData.currency}
            options={["USD", "EUR", "GBP", "SAR", "AED"]}
            onChange={(val) => handleInputChange("currency", val)}
          />

          <ParallelogramSelect
            label="Status"
            placeholder="Select status"
            value={formData.status}
            options={["Active", "Inactive", "Draft"]}
            onChange={(val) =>
              handleInputChange("status", val as ContractData["status"])
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
            ) : contract ? (
              "Update"
            ) : (
              "Confirm"
            )}
          </Button>

        </DialogFooter>

      </DialogContent>
    </Dialog>
  );
};

export default ContractModal;