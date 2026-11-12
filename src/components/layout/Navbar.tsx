"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useStore } from "@/store/useStore";
import {
  ShoppingBag,
  Search,
  ShieldCheck,
  Lock,
  Menu,
  X,
  Droplets,
  Calculator,
  SlidersHorizontal,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { sanitizeInput } from "@/lib/security";

interface NavbarProps {
  onOpenCalculator?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenCalculator }) => {
  const {
    cart,
    setIsCartOpen,
    searchQuery,
    setSearchQuery,
    adminUser,
  } = useStore();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const totalCartItems = mounted
    ? cart.reduce((acc, item) => acc + item.quantity, 0)
    : 0;

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Sanitización inmediata del input para prevenir XSS
    const sanitized = sanitizeInput(e.target.value);
    setSearchQuery(sanitized);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-slate-100 transition-all">
      {/* Top Banner de Ciberseguridad & Confianza */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 py-1.5 px-4 text-center text-[11px] text-teal-200/90 font-medium tracking-wide flex items-center justify-center gap-2">
        <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
        <span>Entorno Protegido: Validación Criptográfica en Cliente • Checkout Seguro Vía WhatsApp</span>
        <span className="hidden sm:inline text-teal-400/50">•</span>
        <span className="hidden sm:inline text-teal-300">Envíos a todo el país en 24/48hs</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Logo & Marca */}
          <Link href="/" className="flex items-center gap-3 group focus:outline-none">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-400 to-teal-500 flex items-center justify-center text-white shadow-md shadow-sky-500/20 group-hover:scale-105 transition-transform">
              <Droplets className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <div className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-1.5">
                <span>AQUA</span>
                <span className="text-teal-600 font-extrabold">PURE</span>
              </div>
              <p className="text-[10px] uppercase tracking-widest text-sky-600 font-semibold">
                Pool Care & Tech
              </p>
            </div>
          </Link>

          {/* Barra de Búsqueda Sanitizada (Desktop) */}
          <div className="hidden md:flex flex-1 max-w-md mx-6">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-sky-500">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Buscar cloro, alguicidas, robots, pH..."
                className="w-full bg-slate-50/80 hover:bg-slate-50 focus:bg-white text-xs sm:text-sm pl-10 pr-4 py-2.5 rounded-full border border-slate-200 hover:border-sky-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all placeholder-slate-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 text-xs"
                >
                  Limpiar
                </button>
              )}
            </div>
          </div>

          {/* Enlaces y Acciones */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Calculador de Volumen & Químicos */}
            {onOpenCalculator && (
              <button
                onClick={onOpenCalculator}
                className="hidden lg:flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-teal-700 px-3 py-2 rounded-xl hover:bg-sky-50 transition-colors"
                title="Calcular dosis química para tu piscina"
              >
                <Calculator className="w-4 h-4 text-sky-500" />
                <span>Calculadora de Dosis</span>
              </button>
            )}

            {/* Acceso Admin */}
            <Link
              href="/admin"
              className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-teal-700 px-2.5 py-1.5 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">
                {adminUser ? "Admin Panel" : "Acceso Admin"}
              </span>
            </Link>

            {/* Carrito Lateral Trigger */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 rounded-2xl bg-teal-50 hover:bg-teal-100/70 border border-teal-200/60 text-teal-800 transition-all focus:outline-none focus:ring-2 focus:ring-teal-500/30 flex items-center gap-2"
              aria-label="Abrir Carrito de Compras"
            >
              <ShoppingBag className="w-5 h-5 text-teal-700" />
              <span className="hidden sm:inline text-xs font-bold text-teal-800">Carrito</span>
              <AnimatePresence>
                {totalCartItems > 0 && (
                  <motion.span
                    key="cart-badge"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-emerald-600 text-white text-[11px] font-extrabold flex items-center justify-center shadow-md shadow-emerald-600/30 border-2 border-white"
                  >
                    {totalCartItems}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>

            {/* Mobile Menu Trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 focus:outline-none"
              aria-label="Abrir Menú"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Búsqueda en Mobile */}
        <div className="md:hidden pb-3">
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-sky-500">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Buscar productos químicos, robots..."
              className="w-full bg-slate-50 text-sm pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none"
            />
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-slate-100 bg-white px-4 py-4 space-y-3"
          >
            {onOpenCalculator && (
              <button
                onClick={() => {
                  onOpenCalculator();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-sky-50 text-sky-800 text-sm font-semibold"
              >
                <span className="flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-sky-600" />
                  Calculadora de Dosis de Químicos
                </span>
                <span className="text-xs bg-white px-2 py-0.5 rounded text-sky-700">Abrir</span>
              </button>
            )}
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 p-3 rounded-xl hover:bg-slate-50 text-sm text-slate-700 font-medium"
            >
              <Lock className="w-4 h-4 text-slate-500" />
              <span>{adminUser ? "Ir al Panel de Administración" : "Acceso Administrador (Demo)"}</span>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
