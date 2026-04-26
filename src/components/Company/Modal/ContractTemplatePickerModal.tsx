"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useContractTemplateHandler, ContractTemplate } from "@/hooks/companyapihandler/useContractTemplateHandler";

interface ContractTemplatePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: ContractTemplate) => void;
}

export default function ContractTemplatePickerModal({
  isOpen,
  onClose,
  onSelectTemplate,
}: ContractTemplatePickerModalProps) {
  const { contractTemplates, loading, listContractTemplates } =
    useContractTemplateHandler();

  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(
    null
  );

  useEffect(() => {
    if (!isOpen) return;
    listContractTemplates(1, 1000).catch(() => undefined);
  }, [isOpen, listContractTemplates]);

  const selectedTemplate =
    contractTemplates.find((t) => t.id === selectedTemplateId) || null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl">
        {/* Header */}
        <DialogHeader>
          <DialogTitle>Choose contract template</DialogTitle>
          <DialogDescription>
            Select a template to prefill contract details.
          </DialogDescription>
        </DialogHeader>

        {/* Content */}
        <div className="mt-2 max-h-72 space-y-2 overflow-y-auto">
          {loading ? (
            <p className="text-sm text-muted-foreground">
              Loading templates...
            </p>
          ) : contractTemplates.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No templates available.
            </p>
          ) : (
            contractTemplates.map((template) => (
              <button
                key={template.id}
                type="button"
                onClick={() => setSelectedTemplateId(template.id)}
                className={`w-full rounded-md border p-3 text-left transition ${
                  selectedTemplateId === template.id
                    ? "border-primary bg-primary/5"
                    : "border-border"
                }`}
              >
                <p className="font-medium">{template.name}</p>
                <p className="text-sm text-muted-foreground">
                  {template.contractTitle}
                </p>
              </button>
            ))
          )}
        </div>

        {/* Actions */}
        <div className="mt-4 flex gap-2 justify-end">
          <Button
            disabled={!selectedTemplate}
            onClick={() => {
              if (!selectedTemplate) return;
              onSelectTemplate(selectedTemplate);
            }}
          >
            Continue
          </Button>

          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}