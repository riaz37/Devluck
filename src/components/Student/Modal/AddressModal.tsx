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


interface AddressData {
  name: string;
  tag: string;
  address: string;
  phoneNumber: string;
  id?: string;
}

interface AddressModalProps {
  Address?: AddressData | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: AddressData) => void;
}

const AddressModal: React.FC<AddressModalProps> = ({
  Address,
  isOpen,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<AddressData>({
    name: "",
    tag: "",
    address: "",
    phoneNumber: "",
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (Address) setFormData(Address);
    else setFormData({ name: "", tag: "", address: "", phoneNumber: "" });
  }, [Address, isOpen]);

  const handleInputChange = (field: keyof AddressData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      await onSave(formData);
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
            {Address ? "Edit Address" : "Add Address"}
          </DialogTitle>

          <DialogDescription>
            {Address
              ? "Update your address details below. Make sure the information is accurate."
              : "Add a new address so we can use it for delivery and billing purposes."}
          </DialogDescription>
        </DialogHeader>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="flex flex-col gap-4">

            <ParallelogramInput
              label="Name"
              placeholder="Enter address name (e.g., Headquarters)"
              value={formData.name}
              onChange={(e) =>
                handleInputChange("name", e.target.value)
              }
            />

            <ParallelogramInput
              label="Tag"
              placeholder="Enter tag (e.g., Office, Branch)"
              value={formData.tag}
              onChange={(e) =>
                handleInputChange("tag", e.target.value)
              }
            />

            <ParallelogramInput
              label="Address"
              placeholder="Enter full address"
              value={formData.address}
              onChange={(e) =>
                handleInputChange("address", e.target.value)
              }
              type="textarea" // 🔥 important for multi-line
            />

            <ParallelogramInput
              label="Phone Number"
              placeholder="Enter phone number"
              value={formData.phoneNumber}
              onChange={(e) =>
                handleInputChange("phoneNumber", e.target.value)
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
            ) : Address ? (
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

export default AddressModal;