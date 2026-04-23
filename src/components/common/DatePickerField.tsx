"use client";

import React from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DatePickerFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

const DatePickerField: React.FC<DatePickerFieldProps> = ({
  label,
  value,
  onChange,
}) => {
  const date = value ? new Date(value) : undefined;

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium">{label}</span>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="justify-start w-full">
            {date ? format(date, "PPP") : "Select date"}
          </Button>
        </PopoverTrigger>
  
        <PopoverContent className="w-auto">
          <Calendar
            mode="single"
            selected={date}
            captionLayout="dropdown"
            onSelect={(val) => {
              if (val instanceof Date) {
                const year = val.getFullYear();
                const month = String(val.getMonth() + 1).padStart(2, "0");
                const day = String(val.getDate()).padStart(2, "0");

                onChange(`${year}-${month}-${day}`);
              }
            }}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default DatePickerField;