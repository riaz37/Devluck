"use client";

import React, { useState, useRef, useEffect } from "react";
import { Loader2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";

import { useCompanyApplicationHandler } from "@/hooks/companyapihandler/useCompanyApplicationHandler";
import { useContractHandler } from "@/hooks/companyapihandler/useContractHandler";
import { useOpportunityHandler } from "@/hooks/companyapihandler/useOpportunityHandler";
import { ParallelogramSelect } from "@/components/common/ParallelogramSelect";
import { ParallelogramEmailAutocomplete } from "@/components/common/ParallelogramEmailAutocomplete";
import { ParallelogramInput } from "@/components/common/ParallelogramInput";
import DatePickerField from "@/components/common/DatePickerField";

/* ---------------- Types ---------------- */

interface ContractData {
  email: string;
  name: string;
  contractTitle: string;
  durationValue: number;
  contractStatus: string;
  startDate: string;
  salary?: string;
  note?: string;
  opportunityId?: string;
  currency: string;
}

interface ContractModalProps {
  contract?: ContractData | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ContractData) => void;
}

/* ---------------- Main Component ---------------- */

const ContractModal1: React.FC<ContractModalProps> = ({
  contract,
  isOpen,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<ContractData>({
    email: "",
    name: "",
    contractTitle: "",
    durationValue: 0,
    startDate: "",
    salary: "",
    note: "",
    contractStatus: "",
    opportunityId: "",
    currency: "USD",
  });

  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [validatingEmail, setValidatingEmail] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [emailSuggestions, setEmailSuggestions] = useState<Array<{ email: string; id: string; name: string }>>([]);
  const [isSearchingEmail, setIsSearchingEmail] = useState(false);
  const validationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { searchUserByEmail } = useCompanyApplicationHandler();
  const { createContract, updateContract } = useContractHandler();
  const { opportunities, listOpportunities } = useOpportunityHandler();

  useEffect(() => {
    if (isOpen) {
      listOpportunities(1, 1000).catch(console.error);
    }
  }, [isOpen, listOpportunities]);

  useEffect(() => {
    if (contract) {
      setFormData({
        email: contract.email || "",
        name: contract.name || "",
        contractTitle: contract.contractTitle || "",
        durationValue: contract.durationValue || 0,
        startDate: contract.startDate || "",
        salary: contract.salary || "",
        note: contract.note || "",
        contractStatus: contract.contractStatus || "",
        opportunityId: contract.opportunityId || "",
        currency: "USD",
      });
      setEmailError(null);
    } else {
      setFormData({
        email: "",
        name: "",
        contractTitle: "",
        durationValue: 0,
        startDate: "",
        salary: "",
        note: "",
        contractStatus: "",
        opportunityId: "",
        currency: "USD",
      });
    }
    setSubmitError(null);
    setEmailError(null);
  }, [contract, isOpen]);

  const handleInputChange = (field: keyof ContractData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (field === "email") {
      if (validationTimeoutRef.current) clearTimeout(validationTimeoutRef.current);
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

      setEmailError(null);

      const email = value.trim();

      if (email.length < 1) {
        setEmailSuggestions([]);
        setIsSearchingEmail(false);
        setValidatingEmail(false);
        return;
      }

      // 1. AUTOCOMPLETE (fast, no validation)
      setIsSearchingEmail(true);
      searchTimeoutRef.current = setTimeout(async () => {
        try {
          const res = await searchUserByEmail(email);
          setEmailSuggestions(res || []);
        } catch {
          setEmailSuggestions([]);
        } finally {
          setIsSearchingEmail(false);
        }
      }, 200);

      // 2. VALIDATION (only when looks like real email)
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (emailRegex.test(email)) {
        setValidatingEmail(true);
        validationTimeoutRef.current = setTimeout(async () => {
          try {
            const res = await searchUserByEmail(email);
            const exists = res?.some(
              (u: any) => u.email.toLowerCase() === email.toLowerCase()
            );
            if (!exists) {
              setEmailError("User does not exist or is not a student");
            } else {
              setEmailError(null);
            }
          } catch {
            setEmailError("User validation failed");
          } finally {
            setValidatingEmail(false);
          }
        }, 500);
      }
    }
  };

  const handleEmailSuggestionSelect = (email: string, name: string) => {
    setFormData((prev) => ({
      ...prev,
      email: email,
      name: name || prev.name
    }));
    setEmailSuggestions([]);
    setEmailError(null);
  };

  useEffect(() => {
    return () => {
      if (validationTimeoutRef.current) {
        clearTimeout(validationTimeoutRef.current);
      }
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

// Update the handleSubmit function in your component:

const handleSubmit = async (e?: React.FormEvent) => {
  if (e) {
    e.preventDefault();
  }

  const isEditing = !!(contract as any)?.id;

  // Email validation only required for new contracts
  if (!isEditing && (emailError || validatingEmail)) {
    return;
  }

  // Validation - email only required for new contracts
  if (!isEditing && !formData.email.trim()) {
    setSubmitError("Email is required for new contracts");
    return;
  }

  if (!formData.name.trim() || !formData.contractTitle.trim() || !formData.durationValue || !formData.contractStatus) {
    setSubmitError("Please fill in all required fields");
    return;
  }

  setLoading(true);
  setSubmitError(null);

  try {
    if (isEditing) {
      // Update existing contract
      const contractId = (contract as any).id;
      const contractData = {
        contractTitle: formData.contractTitle,
        name: formData.name.trim(),
        email: formData.email.trim() || undefined,
        duration: formData.durationValue ? `${formData.durationValue} months` : undefined,
        salary: formData.salary ? parseFloat(formData.salary) : undefined,
        note: formData.note?.trim() || undefined,
        status: formData.contractStatus
      };

      await updateContract(contractId, contractData);
    } else {
      // Create new contract - FIXED: duration as string
      const contractNumber = `CNT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      const contractData = {
        contractTitle: formData.contractTitle,
        email: formData.email.trim(),
        name: formData.name.trim(),
        inContractNumber: contractNumber,
        inContractList: [],
        currency: formData.currency,
        duration: `${formData.durationValue} months`, // ✅ FIXED: Convert number to string
        monthlyAllowance: 0,
        salary: formData.salary ? parseFloat(formData.salary) : 0, // ✅ Also fixed salary undefined
        workLocation: "",
        note: formData.note?.trim() || undefined,
        status: formData.contractStatus,
        opportunityId: formData.opportunityId || undefined
      };

      await createContract(contractData);
    }

    onSave(formData);
    onClose();
  } catch (error: any) {
    setSubmitError(error.message || (isEditing ? "Failed to update contract" : "Failed to create contract"));
  } finally {
    setLoading(false);
  }
};

  return (
    <Dialog open={isOpen} onOpenChange={(v) => !v && onClose()}>
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
            {contract ? "Edit Contract" : "Create Contract"}
          </DialogTitle>
          <DialogDescription>
            {contract
              ? "Update contract terms such as salary, duration, or conditions."
              : "Create a new contract to define terms between the company and the candidate."}
          </DialogDescription>
        </DialogHeader>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {/* Error Display */}
          {submitError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800">{submitError}</p>
            </div>
          )}

          {/* Opportunity */}
          <ParallelogramSelect
            label="Opportunity"
            placeholder="Select opportunity"
            value={
              formData.opportunityId
                ? opportunities.find((opp) => opp.id === formData.opportunityId)?.title || ""
                : ""
            }
            options={opportunities.map((opp) => opp.title)}
            onChange={(value) => {
              const selectedOpp = opportunities.find((opp) => opp.title === value);
              handleInputChange("opportunityId", selectedOpp?.id || "");
            }}
          />

          {/* Email */}
          <div className="flex flex-col gap-1">
            <ParallelogramEmailAutocomplete
              label="Email"
              placeholder="Enter student email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              suggestions={emailSuggestions}
              isLoading={isSearchingEmail}
              onSuggestionSelect={handleEmailSuggestionSelect}
            />
            {validatingEmail && (
              <p className="text-xs text-gray-500 ml-5">Checking user...</p>
            )}
            {emailError && (
              <p className="text-xs text-red-500 ml-5">{emailError}</p>
            )}
          </div>

          {/* Name */}
          <ParallelogramInput
            label="Name"
            placeholder="Enter applicant name"
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
          />

          {/* Contract Title */}
          <ParallelogramInput
            label="Contract Title"
            placeholder="Enter contract title"
            value={formData.contractTitle}
            onChange={(e) => handleInputChange("contractTitle", e.target.value)}
          />

          {/* Status */}
          <ParallelogramSelect
            label="Contract Status"
            placeholder="Select contract status"
            value={formData.contractStatus}
            options={["Running", "Completed"]}
            onChange={(val) => handleInputChange("contractStatus", val)}
          />

          {/* Salary & Currency */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ParallelogramInput
              label="Salary"
              placeholder="Enter salary amount"
              type="number"
              value={formData.salary ?? ""}
              onChange={(e) => handleInputChange("salary", e.target.value)}
            />
            <ParallelogramSelect
              label="Currency"
              placeholder="Select currency"
              value={formData.currency}
              options={["USD", "EUR", "SAR"]}
              onChange={(val) => handleInputChange("currency", val)}
            />
          </div>

          {/* Start Date */}
          <DatePickerField
            label="Start Date"
            value={formData.startDate}
            onChange={(val) => handleInputChange("startDate", val)}
          />

          {/* Duration */}
          <ParallelogramInput
            label="Duration (in months)"
            placeholder="Enter number of months"
            type="number"
            value={formData.durationValue.toString()}
            onChange={(e) => {
              const numValue = parseInt(e.target.value) || 0;
              handleInputChange("durationValue", numValue.toString());
            }}
          />

          {/* Note */}
          <ParallelogramInput
            label="Note"
            placeholder="Optional note"
            value={formData.note ?? ""}
            onChange={(e) => handleInputChange("note", e.target.value)}
          />
        </div>

        {/* Footer */}
        <DialogFooter className="px-6 pb-6 flex gap-2">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Saving...
              </>
            ) : contract ? (
              "Update Contract"
            ) : (
              "Create Contract"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ContractModal1;