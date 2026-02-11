import * as React from "react";
import { cn } from "@/lib/utils";

interface ToggleGroupProps {
  value: string;
  options: { label: string; value: string }[];
  onChange: (value: string) => void;
}

export function ToggleGroup({ value, options, onChange }: ToggleGroupProps) {
  return (
    <div className="flex flex-wrap gap-2 rounded-full bg-white/80 p-1 shadow-card">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            "rounded-full px-4 py-2 text-xs font-semibold transition",
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
