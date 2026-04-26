"use client";

import React, { useState,useRef, useEffect } from "react";
import { Loader2, X } from "lucide-react";

import { usePaymentHandler } from "@/hooks/companyapihandler/usePaymentHandler";
import { ParallelogramInput } from "@/components/common/ParallelogramInput";
import { ParallelogramSelect } from "@/components/common/ParallelogramSelect";
import DatePickerField from "@/components/common/DatePickerField";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";


interface PaymentData {
  id?: string;
  applicantName: string;
  contractId: string;
  nextPayment: string;
  monthlyAllowance: string;
  note?: string;
  paymentStatus: string;
}
 
interface ContractData {
  id: string;
  name: string;
  inContractNumber: string;
  salary: number | null;
  currency: string;
}

interface PaymentModalProps {
  payment?: PaymentData | null;
  contract?: ContractData | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: PaymentData) => void;
}



// Main payment Modal Component
const PaymentModal: React.FC<PaymentModalProps> = ({
  payment,
  contract,
  isOpen,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<PaymentData>({
    applicantName: "",
    contractId: "",
    nextPayment: "",
    monthlyAllowance: "",
    note: "",
    paymentStatus: "",
  });

  const [submitError, setSubmitError] = useState<string | null>(null);
  const { createPayment, updatePayment, loading } = usePaymentHandler();

  useEffect(() => {
    if (payment) {
      setFormData({
        applicantName: payment.applicantName || "",
        contractId: payment.contractId || "",
        nextPayment: payment.nextPayment || "",
        monthlyAllowance: payment.monthlyAllowance || "",
        note: payment.note || "",
        paymentStatus: payment.paymentStatus || "",
      });
    } else if (contract && isOpen) {
      const allowance = contract.salary !== null && contract.salary !== undefined
        ? `${contract.salary} ${contract.currency || ""}` 
        : "";
      setFormData({
        applicantName: contract.name || "",
        contractId: contract.id || "",
        nextPayment: "",
        monthlyAllowance: allowance,
        note: "",
        paymentStatus: "",
      });
    } else if (!payment && !contract) {
      setFormData({
        applicantName: "",
        contractId: "",
        nextPayment: "",
        monthlyAllowance: "",
        note: "",
        paymentStatus: "",
      });
    }
  }, [payment, contract, isOpen]);


  const handleInputChange = (field: keyof PaymentData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!formData.applicantName.trim() || !formData.nextPayment || !formData.monthlyAllowance.trim() || !formData.paymentStatus) {
      setSubmitError("Please fill in all required fields");
      return;
    }

    try {
      const paymentData = {
        applicantName: formData.applicantName.trim(),
        contractId: formData.contractId.trim() || undefined,
        nextPayment: formData.nextPayment,
        monthlyAllowance: formData.monthlyAllowance.trim(),
        note: formData.note?.trim() || undefined,
        paymentStatus: formData.paymentStatus,
      };

      if (payment?.id) {
        await updatePayment(payment.id, paymentData);
      } else {
        await createPayment(paymentData);
      }
      onSave(formData);
      onClose();
    } catch (error: any) {
      setSubmitError(error.message || (payment?.id ? "Failed to update payment" : "Failed to create payment"));
    }
  };

  if (!isOpen) return null;

 return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>

      <DialogContent
        className="
          w-[calc(100%-24px)]
          max-w-[640px]
          max-h-[90vh]
          flex flex-col
          p-0
          overflow-hidden
        "
      >

        {/* HEADER */}
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>
            {payment ? "Edit Payment" : "Create Payment"}
          </DialogTitle>

          <DialogDescription>
            {payment
              ? "Update payment details for this applicant’s contract."
              : "Record a new payment for an applicant under an active contract."}
          </DialogDescription>
        </DialogHeader>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="flex flex-col gap-4">

            <ParallelogramInput
              label="Applicant Name"
              placeholder="Enter applicant name"
              value={formData.applicantName}
              onChange={(e) =>
                handleInputChange("applicantName", e.target.value)
              }
            />

            <ParallelogramInput
              label="Contract ID"
              placeholder="Enter contract ID"
              value={formData.contractId}
              onChange={(e) =>
                handleInputChange("contractId", e.target.value)
              }
            />

            <ParallelogramInput
              label="Monthly Allowance"
              placeholder="Enter monthly allowance"
              value={formData.monthlyAllowance ?? ""}
              onChange={(e) =>
                handleInputChange("monthlyAllowance", e.target.value)
              }
            />

            <ParallelogramSelect
              label="Payment Status"
              placeholder="Select payment status"
              value={formData.paymentStatus}
              options={["Paid", "Due", "Pending"]}
              onChange={(val) =>
                handleInputChange("paymentStatus", val)
              }
            />

            <DatePickerField
              label="Payment Date"
              value={formData.nextPayment}
              onChange={(val) =>
                handleInputChange("nextPayment", val)
              }
            />

            <ParallelogramInput
              label="Note"
              placeholder="Note"
              value={formData.note ?? ""}
              onChange={(e) =>
                handleInputChange("note", e.target.value)
              }
            />
          </div>

          {/* ERROR */}
          {submitError && (
            <div className="mt-4 bg-destructive/10 border border-destructive/20 rounded-md p-3">
              <p className="text-sm text-destructive">
                {submitError}
              </p>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <DialogFooter className="px-6 pb-6 flex gap-2">

          <DialogClose asChild>
            <Button variant="outline" className="flex-1">
              Cancel
            </Button>
          </DialogClose>

          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : payment ? (
              "Update"
            ) : (
              "Confirm"
            )}
          </Button>

        </DialogFooter>

      </DialogContent>
    </Dialog>
  );
}

export default PaymentModal;