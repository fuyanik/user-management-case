"use client";

import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, id, ...props }, ref) => {
    const inputId = id || props.name;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-[#1d1d1f] mb-2"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "w-full px-4 py-3 bg-white border border-[#d2d2d7] rounded-xl text-[#1d1d1f] placeholder-[#86868b]",
            "focus:outline-none focus:ring-2 focus:ring-[#0071e3]/30 focus:border-[#0071e3]",
            "transition-all duration-200",
            error && "border-[#ff3b30] focus:ring-[#ff3b30]/30 focus:border-[#ff3b30]",
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-2 text-sm text-[#ff3b30]">{error}</p>
        )}
        {helperText && !error && (
          <p className="mt-2 text-sm text-[#86868b]">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
