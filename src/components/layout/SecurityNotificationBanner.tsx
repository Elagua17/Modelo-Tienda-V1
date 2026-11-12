"use client";

import React from "react";
import { useStore } from "@/store/useStore";
import { AlertTriangle, X, ShieldAlert } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const SecurityNotificationBanner: React.FC = () => {
  const { securityNotice, clearSecurityNotice } = useStore();

  return (
    <AnimatePresence>
      {securityNotice && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-amber-500 text-slate-900 border-b border-amber-600 px-4 py-2.5 shadow-md sticky top-0 z-50 text-xs sm:text-sm font-medium flex items-center justify-between"
        >
          <div className="flex items-center gap-2 max-w-5xl mx-auto">
            <ShieldAlert className="w-5 h-5 text-slate-950 flex-shrink-0" />
            <span>{securityNotice}</span>
          </div>
          <button
            onClick={clearSecurityNotice}
            className="p-1 hover:bg-amber-600/30 rounded-lg text-slate-900 focus:outline-none transition-colors"
            aria-label="Cerrar notificación"
          >
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
