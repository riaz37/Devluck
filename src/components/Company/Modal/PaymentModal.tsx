"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Loader2 } from "lucide-react";

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
  amount: number;
  currency: string;
  note?: string;
  paymentStatus: string;
}

interface PaymentFormData {
  id?: string;
  applicantName: string;
  contractId: string;
  nextPayment: string;
  amount: string;
  currency: string;
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

const PaymentModal: React.FC<PaymentModalProps> = ({
  payment,
  contract,
  isOpen,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<PaymentFormData>({
    applicantName: "",
    contractId: "",
    nextPayment: "",
    amount: "",
    currency: "USD",
    note: "",
    paymentStatus: "",
  });

  const [submitError, setSubmitError] = useState<string | null>(null);
  const { createPayment, updatePayment, loading } = usePaymentHandler();
  
  // Validation state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isFormValid, setIsFormValid] = useState(false);

  /* ---------------- Validation ---------------- */
  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    // Required fields
    if (!formData.applicantName.trim()) newErrors.applicantName = "Applicant name is required";
    if (!formData.contractId.trim()) newErrors.contractId = "Contract ID is required";
    if (!formData.amount.trim()) newErrors.amount = "Amount is required";
    if (!formData.currency) newErrors.currency = "Currency is required";
    if (!formData.paymentStatus) newErrors.paymentStatus = "Payment status is required";
    if (!formData.nextPayment) newErrors.nextPayment = "Payment date is required";

    const amountNum = Number(formData.amount);
    if (!Number.isFinite(amountNum) || amountNum <= 0) {
      newErrors.amount = "Enter valid positive amount";
    }

    setErrors(newErrors);
    setIsFormValid(Object.keys(newErrors).length === 0);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  useEffect(() => {
    if (payment) {
      setFormData({
        id: payment.id,
        applicantName: payment.applicantName || "",
        contractId: payment.contractId || "",
        nextPayment: payment.nextPayment || "",
        amount: String(payment.amount ?? ""),
        currency: payment.currency || contract?.currency || "USD",
        note: payment.note || "",
        paymentStatus: payment.paymentStatus || "",
      });
    } else if (contract && isOpen) {
      setFormData({
        applicantName: contract.name || "",
        contractId: contract.id || "",
        nextPayment: "",
        amount: contract.salary !== null && contract.salary !== undefined ? String(contract.salary) : "",
        currency: contract.currency || "USD",
        note: "",
        paymentStatus: "",
      });
    } else {
      setFormData({
        applicantName: "",
        contractId: "",
        nextPayment: "",
        amount: "",
        currency: contract?.currency || "USD",
        note: "",
        paymentStatus: "",
      });
    }
    
    // Reset validation
    setErrors({});
    setTouched({});
    setSubmitError(null);
    setIsFormValid(false);
  }, [payment, contract, isOpen]);

  // Auto-validate
  useEffect(() => {
    if (!isOpen) return;
    const timeout = setTimeout(validateForm, 200);
    return () => clearTimeout(timeout);
  }, [formData, isOpen, validateForm]);

  const handleInputChange = (field: keyof PaymentFormData, value: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    // Mark all fields touched
    setTouched({
      applicantName: true,
      contractId: true,
      nextPayment: true,
      amount: true,
      currency: true,
      paymentStatus: true,
    });

    if (!validateForm()) {
      setSubmitError("Please fill all required fields correctly");
      return;
    }

    try {
      const paymentData = {
        applicantName: formData.applicantName.trim(),
        contractId: formData.contractId.trim(),
        nextPayment: formData.nextPayment,
        amount: Number(formData.amount),
        currency: formData.currency,
        note: formData.note?.trim() || undefined,
        paymentStatus: formData.paymentStatus,
      };

      if (payment?.id) {
        await updatePayment(payment.id, paymentData);
      } else {
        await createPayment(paymentData);
      }
      
      onSave(paymentData);
      onClose();
    } catch (error: any) {
      setSubmitError(error.message || (payment?.id ? "Failed to update payment" : "Failed to create payment"));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[calc(100%-24px)] max-w-[640px] max-h-[90vh] flex flex-col p-0 overflow-hidden">
        {/* HEADER */}
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>{payment ? "Edit Payment" : "Create Payment"}</DialogTitle>
          <DialogDescription>
            {payment
              ? "Update payment details for this applicant's contract."
              : "Record a new payment for an applicant under an active contract."}
          </DialogDescription>
        </DialogHeader>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="flex flex-col gap-4">
            <ParallelogramInput
              label="Applicant Name *"
              placeholder="Enter applicant name"
              value={formData.applicantName}
              error={touched.applicantName && errors.applicantName || ""}
              onChange={(e) => handleInputChange("applicantName", e.target.value)}
            />

            <ParallelogramInput
              label="Contract ID *"
              placeholder="Enter contract ID"
              value={formData.contractId}
              error={touched.contractId && errors.contractId || ""}
              onChange={(e) => handleInputChange("contractId", e.target.value)}
            />

            <ParallelogramInput
              label="Amount *"
              placeholder="Enter amount (e.g., 5000)"
              value={formData.amount ?? ""}
              error={touched.amount && errors.amount || ""}
              onChange={(e) => handleInputChange("amount", e.target.value)}
            />

            <ParallelogramSelect
              label="Currency *"
              placeholder="Select currency"
              value={formData.currency}
              error={touched.currency && errors.currency || ""}
              options={["USD", "EUR", "SAR"]}
              onChange={(val) => handleInputChange("currency", val)}
            />

            <ParallelogramSelect
              label="Payment Status *"
              placeholder="Select payment status"
              value={formData.paymentStatus}
              error={touched.paymentStatus && errors.paymentStatus || ""}
              options={["Paid", "Due", "Pending"]}
              onChange={(val) => handleInputChange("paymentStatus", val)}
            />

            <DatePickerField
              label="Payment Date *"
              value={formData.nextPayment}
              error={touched.nextPayment && errors.nextPayment || ""}
              onChange={(val) => handleInputChange("nextPayment", val)}
            />

            <ParallelogramInput
              label="Note"
              type="textarea"
              placeholder="Optional note"
              value={formData.note ?? ""}
              onChange={(e) => handleInputChange("note", e.target.value)}
            />
          </div>

          {/* ERROR */}
          {submitError && (
            <div className="mt-4 bg-destructive/10 border border-destructive/20 rounded-md p-3">
              <p className="text-sm text-destructive">{submitError}</p>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <DialogFooter className="px-6 pb-6 flex gap-2">
          <DialogClose asChild>
            <Button variant="outline" className="flex-1" disabled={loading}>
              Cancel
            </Button>
          </DialogClose>

          <Button
            onClick={handleSubmit}
            disabled={loading || !isFormValid}
            className={`flex-1 transition-all ${
              loading || !isFormValid ? "opacity-50 cursor-not-allowed" : ""
            }`}
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
};

export default PaymentModal;