"use client";

import * as React from "react";
import { X, ChevronDown, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export type Option = {
  value: string;
  label: string;
};

interface MultiSelectProps {
  options: Option[];
  selected: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  maxDisplayed?: number;
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Select options...",
  maxDisplayed = 3,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [internalSelected, setInternalSelected] = React.useState<string[]>(selected);

  // Update internal state when external selected prop changes
  React.useEffect(() => {
    setInternalSelected(selected);
  }, [selected]);

  // Reset search query when popover closes
  React.useEffect(() => {
    if (!open) {
      setSearchQuery("");
    }
  }, [open]);

  const handleUnselect = (value: string, e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    const newSelected = internalSelected.filter((item) => item !== value);
    setInternalSelected(newSelected);
    onChange(newSelected);
  };

  const handleSelect = (value: string) => {
    let newSelected: string[];
    if (internalSelected.includes(value)) {
      newSelected = internalSelected.filter((item) => item !== value);
    } else {
      newSelected = [...internalSelected, value];
    }
    setInternalSelected(newSelected);
    onChange(newSelected);
  };

  const filteredOptions = options.filter((option) => {
    if (searchQuery === "") return true;
    return option.label.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Get display badges
  const displaySelected = internalSelected.slice(0, maxDisplayed);
  const remainingCount = internalSelected.length - maxDisplayed;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button type="button" className="w-full">
          <div className="w-full border border-input rounded-md">
            <div className="flex flex-wrap gap-1 p-2 items-center min-h-[2.5rem]">
              {internalSelected.length === 0 && (
                <div className="text-muted-foreground flex items-center justify-between w-full">
                  <span>{placeholder}</span>
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </div>
              )}
              {displaySelected.map((value) => (
                <Badge
                  key={value}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  {options.find((opt) => opt.value === value)?.label || value}
                  <div
                    className="hover:bg-secondary rounded-full cursor-pointer"
                    onClick={(e) => handleUnselect(value, e)}
                  >
                    <X className="h-3 w-3" />
                  </div>
                </Badge>
              ))}
              {remainingCount > 0 && (
                <Badge variant="secondary">+{remainingCount} more</Badge>
              )}
              {internalSelected.length > 0 && (
                <div className="ml-auto pl-2">
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </div>
              )}
            </div>
          </div>
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[var(--radix-popover-trigger-width)] p-2">
        <div className="flex flex-col gap-2">
          <input
            type="text"
            placeholder="Search options..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          />
          <div className="max-h-[300px] overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                No options found.
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                {filteredOptions.map((option) => {
                  const isSelected = internalSelected.includes(option.value);
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        handleSelect(option.value);
                      }}
                      className="flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
                    >
                      <div
                        className={`flex h-4 w-4 items-center justify-center rounded-sm border ${
                          isSelected
                            ? "bg-primary border-primary text-primary-foreground"
                            : "border-input"
                        }`}
                      >
                        {isSelected && <Check className="h-3 w-3" />}
                      </div>
                      {option.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
} 