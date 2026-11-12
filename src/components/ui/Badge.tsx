import React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps {
  children: React.ReactNode;
  variant?: "success" | "sky" | "warning" | "danger" | "neutral";
  className?: string;
  size?: "sm" | "md";
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "sky",
  className,
  size = "md",
}) => {
  const baseStyles = "inline-flex items-center font-medium rounded-full transition-colors";

  const sizeStyles = {
    sm: "px-2 py-0.5 text-[11px]",
    md: "px-2.5 py-1 text-xs",
  };

  const variantStyles = {
    // Éxito / CTA verde turquesa
    success: "bg-emerald-50 text-emerald-700 border border-emerald-200/60",
    // Celeste característico
    sky: "bg-sky-50 text-sky-700 border border-sky-200/70",
    warning: "bg-amber-50 text-amber-700 border border-amber-200/60",
    danger: "bg-rose-50 text-rose-700 border border-rose-200/60",
    neutral: "bg-slate-100 text-slate-700 border border-slate-200",
  };

  return (
    <span className={cn(baseStyles, sizeStyles[size], variantStyles[variant], className)}>
      {children}
    </span>
  );
};
