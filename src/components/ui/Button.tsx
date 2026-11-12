"use client";

import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends HTMLMotionProps<"button"> {
  variant?: "primary" | "secondary" | "outline" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium transition-all duration-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none select-none active:scale-[0.98]";

    const sizeStyles = {
      sm: "text-xs px-3.5 py-2 gap-1.5",
      md: "text-sm px-5 py-2.5 gap-2",
      lg: "text-base px-6 py-3.5 gap-2.5",
    };

    const variantStyles = {
      // Verde / Turquesa para CTA principal
      primary:
        "bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-md shadow-teal-700/15 hover:from-teal-500 hover:to-emerald-500 hover:shadow-lg hover:shadow-teal-600/25 focus:ring-teal-500 border border-teal-500/20",
      // Azul Celeste para elementos secundarios
      secondary:
        "bg-sky-50 text-sky-700 hover:bg-sky-100/80 active:bg-sky-200/70 border border-sky-200/60 focus:ring-sky-400",
      outline:
        "bg-white text-slate-700 border border-slate-200 hover:border-sky-300 hover:bg-sky-50/50 hover:text-sky-900 focus:ring-sky-400",
      danger:
        "bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 hover:text-rose-800 focus:ring-rose-400",
      ghost:
        "text-slate-600 hover:text-teal-700 hover:bg-slate-100/70 focus:ring-slate-300",
    };

    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: disabled || isLoading ? 1 : 1.015 }}
        whileTap={{ scale: disabled || isLoading ? 1 : 0.985 }}
        disabled={disabled || isLoading}
        className={cn(baseStyles, sizeStyles[size], variantStyles[variant], className)}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin text-current" />}
        {children}
      </motion.button>
    );
  }
);

Button.displayName = "Button";
