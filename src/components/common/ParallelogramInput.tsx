"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type Props = {
  label: string;
  placeholder: string;
  value: string|number;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  type?: "text" | "email" | "password" | "number" | "textarea";
};  
   
export const ParallelogramInput = ({
  label,
  placeholder,
  value,
  onChange,
  onBlur,
  type = "text",
}: Props) => {
  return (
    <div className="flex flex-col gap-2 w-full">
      {/* Label (shadcn style) */}
      <label className="text-sm font-medium text-muted-foreground">
        {label}
      </label>

      {/* Input */}
      {type === "textarea" ? (
        <Textarea
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          className="resize-none"
        />
      ) : (
        <Input
          type={type}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
        />
      )}
    </div>
  );
};