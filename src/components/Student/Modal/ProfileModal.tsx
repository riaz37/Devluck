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



interface ProfileData {
  id?: string;
  name: string;
  email: string;
  description: string;
  availability: string;
  salaryExpectation?: string;
  image?: string;
}

interface ProfileModalProps {
  profile?: ProfileData | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ProfileData) => void;
}

// ✅ KEEPED EXACTLY AS REQUESTED
const ParallelogramFileInput = ({
  label,
  image,
  onChange,
}: {
  label: string;
  image?: string;
  onChange: (file: File | null) => void;
}) => {
  const defaultImage = "/default-avatar.svg";
  const [preview, setPreview] = useState<string | null>(image || null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    if (selectedFile) {
      setPreview(URL.createObjectURL(selectedFile));
    } else if (image) {
      setPreview(image);
    } else {
      setPreview(null);
    }
  }, [image, selectedFile]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setSelectedFile(file);
      onChange(file);
    }
  };

  return (
    <div className="flex flex-col items-center gap-2 w-[175px] h-[204px] relative">
      <label className="relative w-[144px] h-[144px] flex items-center justify-center cursor-pointer">
        {/* Dashed circle */}
        <div className="absolute w-[144px] h-[144px] border-2 border-dashed border-[var(--color-text-secondary)] rounded-full flex items-center justify-center z-10">
          {/* Camera icon + label always visible on top */}
          <div className="flex flex-col items-center justify-center gap-1 text-center z-20 pointer-events-none">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" clipRule="evenodd" d="M16.0001 13.6667C16.2653 13.6667 16.5197 13.7721 16.7072 13.9596C16.8947 14.1472 17.0001 14.4015 17.0001 14.6667V16.3334H18.6667C18.932 16.3334 19.1863 16.4388 19.3739 16.6263C19.5614 16.8138 19.6667 17.0682 19.6667 17.3334C19.6667 17.5986 19.5614 17.853 19.3739 18.0405C19.1863 18.228 18.932 18.3334 18.6667 18.3334H17.0001V20.0001C17.0001 20.2653 16.8947 20.5196 16.7072 20.7072C16.5197 20.8947 16.2653 21.0001 16.0001 21.0001C15.7349 21.0001 15.4805 20.8947 15.293 20.7072C15.1054 20.5196 15.0001 20.2653 15.0001 20.0001V18.3334H13.3334C13.0682 18.3334 12.8138 18.228 12.6263 18.0405C12.4388 17.853 12.3334 17.5986 12.3334 17.3334C12.3334 17.0682 12.4388 16.8138 12.6263 16.6263C12.8138 16.4388 13.0682 16.3334 13.3334 16.3334H15.0001V14.6667C15.0001 14.4015 15.1054 14.1472 15.293 13.9596C15.4805 13.7721 15.7349 13.6667 16.0001 13.6667Z" fill="white"/>
            <path fillRule="evenodd" clipRule="evenodd" d="M13.0374 28.0001H18.9627C23.1241 28.0001 25.2054 28.0001 26.7001 27.0201C27.345 26.5974 27.9004 26.0519 28.3347 25.4147C29.3334 23.9481 29.3334 21.9041 29.3334 17.8187C29.3334 13.7321 29.3334 11.6894 28.3347 10.2227C27.9005 9.58554 27.345 9.04006 26.7001 8.6174C25.7401 7.98673 24.5374 7.7614 22.6961 7.6814C21.8174 7.6814 21.0614 7.02806 20.8894 6.1814C20.758 5.56122 20.4164 5.00544 19.9225 4.608C19.4287 4.21055 18.8127 3.99581 18.1787 4.00006H13.8214C12.5041 4.00006 11.3694 4.9134 11.1107 6.1814C10.9387 7.02806 10.1827 7.6814 9.30408 7.6814C7.46408 7.7614 6.26141 7.98806 5.30008 8.6174C4.65557 9.04015 4.10058 9.58563 3.66675 10.2227C2.66675 11.6894 2.66675 13.7321 2.66675 17.8187C2.66675 21.9041 2.66675 23.9467 3.66541 25.4147C4.09741 26.0494 4.65208 26.5947 5.30008 27.0201C6.79475 28.0001 8.87608 28.0001 13.0374 28.0001ZM21.3334 17.3334C21.3334 18.7479 20.7715 20.1044 19.7713 21.1046C18.7711 22.1048 17.4146 22.6667 16.0001 22.6667C14.5856 22.6667 13.229 22.1048 12.2288 21.1046C11.2287 20.1044 10.6667 18.7479 10.6667 17.3334C10.6667 15.9189 11.2287 14.5624 12.2288 13.5622C13.229 12.562 14.5856 12.0001 16.0001 12.0001C17.4146 12.0001 18.7711 12.562 19.7713 13.5622C20.7715 14.5624 21.3334 15.9189 21.3334 17.3334ZM24.0001 12.3334C23.7349 12.3334 23.4805 12.4388 23.293 12.6263C23.1054 12.8138 23.0001 13.0682 23.0001 13.3334C23.0001 13.5986 23.1054 13.853 23.293 14.0405C23.4805 14.228 23.7349 14.3334 24.0001 14.3334H25.3334C25.5986 14.3334 25.853 14.228 26.0405 14.0405C26.2281 13.853 26.3334 13.5986 26.3334 13.3334C26.3334 13.0682 26.2281 12.8138 26.0405 12.6263C25.853 12.4388 25.5986 12.3334 25.3334 12.3334H24.0001Z" fill="white"/>
            </svg>

            <span className="text-xs text-[var(--color-text-secondary)]">{label}</span>
          </div>
        </div>

        <img
          src={preview || defaultImage}
          alt="Preview"
          className="absolute w-[128px] h-[128px] rounded-full object-cover z-0"
        />

        {/* Hidden file input */}
        <input
          type="file"
          accept="image/*"
          className="absolute w-full h-full opacity-0 cursor-pointer rounded-full z-30"
          onChange={handleFileChange}
        />
      </label>

      {/* Allowed file types */}
      <span className="text-xs text-center text-[var(--color-text-secondary)]">
        Allowed *.jpeg, *.jpg, *.png, *.gif
        Max size of 3.1 MB
      </span>
    </div>
  );
};  

// Main payment Modal Component
const ProfileModal: React.FC<ProfileModalProps> = ({
  profile,
  isOpen,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<ProfileData>({
    name: "",
    email: "",
    description: "",
    availability: "",
    salaryExpectation: "",
  });

  const availabilityOptions = ["Hybrid", "Remote", "Onsite"];

  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

   useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || "",
        email: (profile as any).email || "",
        description: profile.description || "",
        availability: profile.availability || "",
        salaryExpectation: (profile as any).salaryExpectation ? String((profile as any).salaryExpectation) : ""
      });
    } else {
      setFormData({ name: "", email: "", description: "", availability: "", salaryExpectation: "" });
    }
  }, [profile, isOpen]);


  const handleInputChange = (field: keyof ProfileData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const uploadImageToCloudinary = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('image', file);

    const token = localStorage.getItem('devluck_token');
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/upload/image`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to upload image');
    }

    const data = await response.json();
    return data.data.url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || formData.email.trim() === '') {
      alert('Email is required');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email.trim())) {
      alert('Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      let imageUrl = formData.image || profile?.image;

      if (selectedFile) {
        setUploadingImage(true);
        try {
          imageUrl = await uploadImageToCloudinary(selectedFile);
        } catch (error: any) {
          console.error("Error uploading image:", error);
          alert(`Failed to upload image: ${error.message}`);
          setUploadingImage(false);
          setLoading(false);
          return;
        } finally {
          setUploadingImage(false);
        }
      }

      await onSave({ ...formData, image: imageUrl });
      onClose();
    } catch (error) {
      console.error("Error saving profile:", error);
    } finally {
      setLoading(false);
    }
  };


  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[calc(100%-24px)] max-w-[640px] max-h-[90vh] flex flex-col p-0">
        
        {/* Header */}
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>
            {profile ? "Edit Profile" : "Create Profile"}
          </DialogTitle>

          <DialogDescription>
            {profile
              ? "Update your profile information such as name, bio, and details."
              : "Create a new profile with your basic information."}
          </DialogDescription>
        </DialogHeader>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="flex flex-col gap-4">

            <div className="flex justify-center">
              <ParallelogramFileInput
                label="Profile Photo"
                image={profile?.image || formData.image}
                onChange={(file) => {
                  if (file) {
                    setSelectedFile(file);
                    setFormData((prev) => ({
                      ...prev,
                      image: URL.createObjectURL(file),
                    }));
                  } else {
                    setSelectedFile(null);
                  }
                }}
              />
            </div>

            <ParallelogramInput
              label="Name"
              placeholder="Enter your name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
            />

            <ParallelogramInput
              label="Email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
            />

            <ParallelogramSelect
              label="Availability"
              placeholder="Select availability"
              value={formData.availability}
              options={availabilityOptions}
              onChange={(value) => handleInputChange("availability", value)}
            />

            <ParallelogramInput
              label="Salary Expectation"
              placeholder="Enter expected salary"
              value={formData.salaryExpectation || ""}
              type="number"
              onChange={(e) =>
                handleInputChange("salaryExpectation", e.target.value)
              }
            />

            <ParallelogramInput
              label="About Me"
              placeholder="Write something about yourself"
              value={formData.description}
              type="textarea"
              onChange={(e) =>
                handleInputChange("description", e.target.value)
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
            ) : profile ? (
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

export default ProfileModal;