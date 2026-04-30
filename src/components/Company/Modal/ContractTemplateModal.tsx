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

/* ---------------- Types ---------------- */

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

  const [durationValue, setDurationValue] = useState<number>(1);
  const [durationUnit, setDurationUnit] = useState<"day" | "month" | "year">("month");

  /* ---------------- Build duration ---------------- */

  const buildDuration = () =>
    `${durationValue} ${durationUnit}${durationValue > 1 ? "s" : ""}`;

  /* ---------------- Load / Reset ---------------- */

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

      // ✅ parse duration safely
      if (contract.duration) {
        const match = contract.duration.match(/(\d+)\s*(day|month|year)s?/i);

        if (match) {
          setDurationValue(Number(match[1]));
          setDurationUnit(match[2].toLowerCase() as any);
        }
      }
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

      setDurationValue(1);
      setDurationUnit("month");
    }
  }, [contract, isOpen]);

  /* ---------------- Input handler ---------------- */

  const handleInputChange = (field: keyof ContractData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  /* ---------------- Submit ---------------- */

  const handleSubmit = async () => {
    setLoading(true);

    try {
      const payload: ContractData = {
        ...formData,
        duration: buildDuration(), // ✅ FINAL FIX
      };

      await onSave(payload);
      onClose();
    } catch (error) {
      console.error("Failed to save contract:", error);
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- UI ---------------- */

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[calc(100%-24px)] max-w-[640px] max-h-[90vh] flex flex-col p-0">

        <DialogHeader className="px-6 pt-6">
          <DialogTitle>
            {contract ? "Edit Template" : "Create Template"}
          </DialogTitle>

          <DialogDescription>
            {contract
              ? "Update this contract template."
              : "Create a reusable contract template."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">

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

          {/* Duration */}
          <div className="flex gap-3">
            <ParallelogramInput
              label="Duration"
              placeholder="Enter number"
              type="number"
              value={durationValue}
              onChange={(e) => setDurationValue(Number(e.target.value))}
            />

            <ParallelogramSelect
              label="Unit"
              placeholder="Unit"
              value={durationUnit}
              options={["day", "month", "year"]}
              onChange={(val) =>
                setDurationUnit(val as "day" | "month" | "year")
              }
            />
          </div>

          <ParallelogramSelect
            label="Work Location"
            placeholder="Select location"
            value={formData.workLocation}
            options={["Hybrid", "Remote", "Onsite"]}
            onChange={(val) =>
              handleInputChange("workLocation", val)
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
            onChange={(val) =>
              handleInputChange("currency", val)
            }
          />

          <ParallelogramSelect
            label="Status"
            placeholder="Select status"
            value={formData.status}
            options={["Active", "Inactive", "Draft"]}
            onChange={(val) =>
              handleInputChange("status", val)
            }
          />
        </div>

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