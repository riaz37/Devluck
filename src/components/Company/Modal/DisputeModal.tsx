"use client";

import { useEffect, useState, useCallback } from "react";
import { Loader2, File } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

import { useDisputeHandler } from "@/hooks/companyapihandler/useDisputeHandler";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface DisputeModalProps {
  contractId: string;
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

type ActionType = "view" | "accept" | "reject";

export default function DisputeModal({
  contractId,
  open,
  onClose,
  onSuccess,
}: DisputeModalProps) {
  const {
    dispute,
    loading,
    error,
    getDisputeByContractId,
    resolveDispute,
    rejectDispute,
  } = useDisputeHandler();

  const [actionType, setActionType] = useState<ActionType>("view");
  const [resolution, setResolution] = useState("");
  const [newContractStatus, setNewContractStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // 🔥 SAME VALIDATION SYSTEM AS CORPORATE MODAL
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isFormValid, setIsFormValid] = useState(false);

  /* ---------------- VALIDATION (SAME AS CORPORATE) ---------------- */
  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    // Resolution validation (min 10 chars)
    const trimmedResolution = resolution.trim();
    if (!trimmedResolution) {
      newErrors.resolution = "Resolution is required";
    } else if (trimmedResolution.length < 10) {
      newErrors.resolution = "Resolution must be at least 10 characters";
    }

    // Contract status validation (only for accept)
    if (actionType === "accept" && !newContractStatus) {
      newErrors.contractStatus = "Contract status is required";
    }

    setErrors(newErrors);
    setIsFormValid(Object.keys(newErrors).length === 0);
    return Object.keys(newErrors).length === 0;
  }, [resolution, newContractStatus, actionType]);

  useEffect(() => {
    if (!open || !contractId) return;

    setActionType("view");
    setResolution("");
    setNewContractStatus("");
    setSubmitError(null);
    
    // Reset validation
    setErrors({});
    setTouched({});
    setIsFormValid(false);

    getDisputeByContractId(contractId).catch(console.error);
  }, [open, contractId]);

  // 🔥 Auto-validate after data changes (SAME AS CORPORATE)
  useEffect(() => {
    if (!open || actionType === "view") return;
    const timeout = setTimeout(validateForm, 200);
    return () => clearTimeout(timeout);
  }, [resolution, newContractStatus, actionType, open, validateForm]);

  const handleResolutionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setTouched((prev) => ({ ...prev, resolution: true }));
    setResolution(value);
  };

  const handleContractStatusChange = (value: string) => {
    setTouched((prev) => ({ ...prev, contractStatus: true }));
    setNewContractStatus(value);
  };

  const handleAccept = () => {
    setActionType("accept");
    setResolution("");
    setNewContractStatus("");
    setErrors({});
    setTouched({});
    setIsFormValid(false);
    setSubmitError(null);
  };

  const handleReject = () => {
    setActionType("reject");
    setResolution("");
    setErrors({});
    setTouched({});
    setIsFormValid(false);
    setSubmitError(null);
  };

  const handleBack = () => {
    setActionType("view");
    setResolution("");
    setNewContractStatus("");
    setErrors({});
    setTouched({});
    setIsFormValid(false);
    setSubmitError(null);
  };

  const handleSubmitAccept = async () => {
    setTouched({ resolution: true, contractStatus: true });

    if (!validateForm()) {
      setSubmitError("Please fix the errors above");
      return;
    }

    if (!dispute) return;

    setSubmitting(true);
    setSubmitError(null);

    try {
      await resolveDispute(dispute.id, resolution.trim(), newContractStatus);
      onSuccess?.();
      onClose();
    } catch (err: any) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitReject = async () => {
    setTouched({ resolution: true });

    if (!validateForm()) {
      setSubmitError("Please fix the errors above");
      return;
    }

    if (!dispute) return;

    setSubmitting(true);
    setSubmitError(null);

    try {
      await rejectDispute(dispute.id, resolution.trim());
      onSuccess?.();
      onClose();
    } catch (err: any) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // 🔥 Character counter (SAME AS CORPORATE - 0/10)
  const resolutionCharCount = resolution.trim().length;
  const resolutionIsValid = resolutionCharCount >= 10;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <DialogHeader>
          <DialogTitle>
            {actionType === "view"
              ? "Dispute Details"
              : actionType === "accept"
              ? "Accept Dispute"
              : "Reject Dispute"}
          </DialogTitle>

          <DialogDescription>
            {actionType === "view"
              ? "Review dispute information and status."
              : actionType === "accept"
              ? "Provide a resolution and select the contract outcome."
              : "Explain why you are rejecting this dispute."}
          </DialogDescription>
        </DialogHeader>

        {/* BODY */}
        <div className="space-y-4 py-2">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-10 text-center space-y-3">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Loading dispute details...
              </p>
            </div>
          ) : error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950 p-4 text-center space-y-2">
              <div className="flex justify-center">
                <File className="w-5 h-5 text-red-500" />
              </div>
              <p className="text-sm font-medium text-red-700 dark:text-red-300">
                Something went wrong
              </p>
              <p className="text-xs text-red-600 dark:text-red-400">
                {error}
              </p>
            </div>
          ) : !dispute ? (
            <div className="rounded-lg border border-border bg-muted/30 p-5 text-center space-y-2">
              <File className="w-5 h-5 mx-auto text-muted-foreground" />
              <p className="text-sm font-medium text-foreground">
                No dispute found
              </p>
              <p className="text-xs text-muted-foreground">
                This contract has no active dispute.
              </p>
            </div>
          ) : (
            <>
              {/* VIEW MODE */}
              {actionType === "view" && (
                <CardContent className="p-4 space-y-4">
                  <div className="rounded-lg border border-border/50 bg-muted/20 p-3 space-y-1">
                    <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
                      Reason
                    </p>
                    <p className="text-sm text-foreground leading-relaxed">
                      {dispute.reason}
                    </p>
                  </div>

                  {dispute.note && (
                    <div className="rounded-lg border border-border/50 bg-muted/20 p-3 space-y-1">
                      <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
                        Note
                      </p>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {dispute.note}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-between rounded-lg border border-border/50 bg-muted/10 p-3">
                    <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
                      Status
                    </p>
                    <Badge variant="secondary" className="text-xs">
                      {dispute.status}
                    </Badge>
                  </div>
                </CardContent>
              )}

              {/* ACCEPT MODE */}
              {actionType === "accept" && (
                <div className="space-y-4">
                  <Alert className="border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950">
                    <AlertDescription className="text-emerald-700 dark:text-emerald-300">
                      You are accepting this dispute. Define a resolution and final contract outcome.
                    </AlertDescription>
                  </Alert>

                  {/* RESOLUTION */}
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-widest text-muted-foreground">
                      Resolution Message *
                    </Label>
                    <div className="relative">
                      <Textarea
                        rows={4}
                        placeholder="Write a clear resolution for both parties... (minimum 10 characters)"
                        value={resolution}
                        onChange={handleResolutionChange}
                        className={`resize-none transition-all ${
                          touched.resolution && errors.resolution
                            ? "border-red-500 focus:border-red-500 ring-1 ring-red-200"
                            : ""
                        }`}
                      />
                      {/* 🔥 COUNTER (SAME AS CORPORATE) */}
                      <div className="absolute bottom-2 right-3 text-sm font-bold">
                        <span 
                          className={`${
                            resolutionIsValid 
                              ? "text-green-600" 
                              : "text-red-600"
                          }`}
                        >
                          {resolutionCharCount}/10
                        </span>
                      </div>
                    </div>
                    {touched.resolution && errors.resolution && (
                      <p className="text-xs text-red-600 mt-1 pl-2">
                        {errors.resolution}
                      </p>
                    )}
                  </div>

                  {/* STATUS */}
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-widest text-muted-foreground">
                      Final Contract Status *
                    </Label>
                    <Select value={newContractStatus} onValueChange={handleContractStatusChange}>
                      <SelectTrigger className={`h-10 w-full transition-all ${
                        touched.contractStatus && errors.contractStatus
                          ? "border-red-500 focus:border-red-500 ring-1 ring-red-200"
                          : ""
                      }`}>
                        <SelectValue placeholder="Select final status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Running">Running</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                        <SelectItem value="Cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    {touched.contractStatus && errors.contractStatus && (
                      <p className="text-xs text-red-600 mt-1 pl-2">
                        {errors.contractStatus}
                      </p>
                    )}
                  </div>

                  {submitError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                      <p className="text-sm text-red-800">{submitError}</p>
                    </div>
                  )}
                </div>
              )}

              {/* REJECT MODE */}
              {actionType === "reject" && (
                <div className="space-y-4">
                  <Alert className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950">
                    <AlertDescription className="text-red-700 dark:text-red-300">
                      Rejecting this dispute will restore the contract automatically and notify both parties.
                    </AlertDescription>
                  </Alert>

                  {/* REASON */}
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-widest text-muted-foreground">
                      Rejection Reason *
                    </Label>
                    <div className="relative">
                      <Textarea
                        placeholder="Explain why this dispute is being rejected... (minimum 10 characters)"
                        value={resolution}
                        onChange={handleResolutionChange}
                        rows={4}
                        className={`resize-none transition-all ${
                          touched.resolution && errors.resolution
                            ? "border-red-500 focus:border-red-500 ring-1 ring-red-200"
                            : ""
                        }`}
                      />
                      {/* 🔥 COUNTER (SAME AS CORPORATE) */}
                      <div className="absolute bottom-2 right-3 text-sm font-bold">
                        <span 
                          className={`${
                            resolutionIsValid 
                              ? "text-green-600" 
                              : "text-red-600"
                          }`}
                        >
                          {resolutionCharCount}/10
                        </span>
                      </div>
                    </div>
                    {touched.resolution && errors.resolution && (
                      <p className="text-xs text-red-600 mt-1 pl-2">
                        {errors.resolution}
                      </p>
                    )}
                  </div>

                  {submitError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                      <p className="text-sm text-red-800">{submitError}</p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* FOOTER */}
        <DialogFooter className="flex gap-2">
          {actionType === "view" ? (
            <>
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
              {dispute && (
                <>
                  <Button className="bg-destructive/90 hover:bg-destructive/80" onClick={handleReject}>
                    Reject
                  </Button>
                  <Button onClick={handleAccept}>
                    Accept
                  </Button>
                </>
              )}
            </>
          ) : (
            <>
              <Button variant="outline" onClick={handleBack}>
                Back
              </Button>
              <Button
                disabled={submitting || !isFormValid}
                variant="default"
                className={cn(
                  "transition-all",
                  submitting || !isFormValid ? "opacity-50 cursor-not-allowed" : "",
                  actionType === "reject" && "bg-destructive/90 hover:bg-destructive/80"
                )}
                onClick={
                  actionType === "accept"
                    ? handleSubmitAccept
                    : handleSubmitReject
                }
              >
                {submitting ? (
                  <Loader2 className="animate-spin w-4 h-4" />
                ) : actionType === "accept" ? (
                  "Confirm Accept"
                ) : (
                  "Confirm Reject"
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}