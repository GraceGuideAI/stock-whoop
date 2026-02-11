import * as React from "react";
import { cn } from "@/lib/utils";

interface ToggleGroupProps {
  value: string;
  options: { label: string; value: string }[];
  onChange: (value: string) => void;
}

export function ToggleGroup({ value, options, onChange }: ToggleGroupProps) {
  return (
    <div className="flex w-full gap-1.5 overflow-x-auto rounded-full bg-white/80 p-1 shadow-card sm:w-auto sm:gap-2">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={cn(
            "shrink-0 rounded-full px-3 py-2 text-xs font-semibold transition sm:px-4",
            value === option.value
              ? "bg-ink text-white"
              : "bg-transparent text-ink hover:bg-ink/10"
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
