"use client";

import React, { useMemo, useState, useEffect, useRef } from "react";
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
import { Input } from "@/components/ui/input";

interface CandidateData {
  email?: string;
  name?: string;
}

interface CandidateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInvite: (data: CandidateData) => Promise<void> | void;
  appliedCandidates: Array<{ email: string; name?: string }>;
  onValidateEmail: (email: string) => Promise<{ exists: boolean; name?: string }>;
}

const isValidEmail = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const CandidateModal: React.FC<CandidateModalProps> = ({
  isOpen,
  onClose,
  onInvite,
  appliedCandidates,
  onValidateEmail,
}) => {
  const [formData, setFormData] = useState<CandidateData>({
    email: "",
    name: "",
  });
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validating, setValidating] = useState(false);
  const lastValidatedEmailRef = useRef<string>("");

  const handleInputChange = (field: keyof CandidateData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // reset when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({ email: "", name: "" });
      setQuery("");
      setDebouncedQuery("");
      setError(null);
      setValidating(false);
      lastValidatedEmailRef.current = "";
    }
  }, [isOpen]);

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedQuery(query.trim().toLowerCase());
    }, 250);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    const email = formData.email?.trim() || "";
    const normalizedEmail = email.toLowerCase();

    if (!email || !isValidEmail(email)) {
      lastValidatedEmailRef.current = "";
      return;
    }

    if (lastValidatedEmailRef.current === normalizedEmail) {
      return;
    }

    const t = setTimeout(async () => {
      try {
        setValidating(true);
        const result = await onValidateEmail(email);
        lastValidatedEmailRef.current = normalizedEmail;
        if (!result.exists) {
          setError("Invitation can only be sent to candidates who applied to this opportunity.");
          return;
        }
        setError(null);
        if (result.name && !formData.name) {
          setFormData((prev) => ({ ...prev, name: result.name || "" }));
        }
      } catch {
        setError("Could not validate candidate right now.");
      } finally {
        setValidating(false);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [formData.email, onValidateEmail]);

  const normalizedCandidates = useMemo(
    () =>
      appliedCandidates
        .map((c) => ({
          email: (c.email || "").trim(),
          name: (c.name || "").trim(),
        }))
        .filter((c) => c.email),
    [appliedCandidates]
  );

  const allowedEmails = normalizedCandidates.map((c) => c.email.toLowerCase());

  const filteredCandidates = useMemo(() => {
    if (!debouncedQuery) return normalizedCandidates.slice(0, 8);
    return normalizedCandidates.filter(
      (c) =>
        c.email.toLowerCase().includes(debouncedQuery) ||
        c.name.toLowerCase().includes(debouncedQuery)
    );
  }, [normalizedCandidates, debouncedQuery]);

  const isAppliedCandidateEmail = (email: string) => {
    const normalized = email.trim().toLowerCase();
    return allowedEmails.includes(normalized);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      if (!formData.email || !isValidEmail(formData.email)) {
        setError("Please enter a valid candidate email");
        return;
      }

      if (!isAppliedCandidateEmail(formData.email)) {
        setError("Invitation can only be sent to candidates who applied to this opportunity.");
        return;
      }

      await onInvite({
        email: formData.email.trim(),
        name: formData.name?.trim(),
      });

      onClose();
    } catch (err) {
      console.error(err);
      setError("Something went wrong");
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
          <DialogTitle>Select Candidate</DialogTitle>
          <DialogDescription>
            Select a candidate for this private assessment. Only who already applied to this opportunity will be shown.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto px-6 py-4">
        <div className="mb-4 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-900">
          Invitation can be sent only to candidates who already applied to this opportunity.
        </div>

        {/* Error */}
        {error && (
          <p className="text-xs text-red-500 text-center">{error}</p>
        )}

        {/* Content */}

          <div className="flex flex-col gap-4">

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-muted-foreground">
              Candidate Search
            </label>
            <Input
              placeholder="Type candidate email or name"
              value={query}
              onChange={(e) => {
                const next = e.target.value;
                setQuery(next);
                const exactMatch = normalizedCandidates.find(
                  (c) => c.email.toLowerCase() === next.trim().toLowerCase()
                );
                if (exactMatch) {
                  setFormData({ email: exactMatch.email, name: exactMatch.name || "" });
                } else {
                  setFormData((prev) => ({ ...prev, email: next }));
                }
              }}
            />
            <div className="max-h-44 overflow-y-auto rounded-md border">
              {filteredCandidates.length === 0 ? (
                <div className="px-3 py-2 text-xs text-muted-foreground">
                  No applied candidates found for this search.
                </div>
              ) : (
                filteredCandidates.map((c) => (
                  <button
                    key={c.email}
                    type="button"
                    className="w-full px-3 py-2 text-left text-sm hover:bg-muted"
                    onClick={() => {
                      setQuery(c.email);
                      setFormData({ email: c.email, name: c.name || "" });
                    }}
                  >
                    <div className="font-medium">{c.email}</div>
                    {c.name ? (
                      <div className="text-xs text-muted-foreground">{c.name}</div>
                    ) : null}
                  </button>
                ))
              )}
            </div>
          </div>


          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="px-6 pb-6 flex gap-2">

          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>

          <Button onClick={handleSubmit} disabled={loading || validating || appliedCandidates.length === 0}>
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : validating ? (
              "Checking..."
            ) : (
              "Send Invite"
            )}
          </Button>

        </DialogFooter>

      </DialogContent>
    </Dialog>
  );
};

export default CandidateModal;