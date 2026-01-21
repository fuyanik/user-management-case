"use client";

import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface BadgeProps {
  children: ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "info";
  className?: string;
}

export function Badge({ children, variant = "default", className }: BadgeProps) {
  const variants = {
    default: "bg-[#f5f5f7] text-[#6e6e73]",
    success: "bg-[#34c759]/10 text-[#248a3d]",
    warning: "bg-[#ff9500]/10 text-[#c93400]",
    danger: "bg-[#ff3b30]/10 text-[#d70015]",
    info: "bg-[#0071e3]/10 text-[#0071e3]",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
