"use client";

import React from "react";
import { useStore } from "@/store/useStore";
import { ProductCategory } from "@/types";
import { cn } from "@/lib/utils";
import { Droplets, Sparkles, Shield, Wrench, Activity, Bot, ChevronDown } from "lucide-react";

interface CategoryOption {
  id: ProductCategory;
  label: string;
  icon?: React.ReactNode;
}

const CATEGORIES: CategoryOption[] = [
  { id: "all", label: "Todos los Productos" },
  { id: "cloros", label: "Cloros y Pastillas", icon: <Sparkles className="w-3.5 h-3.5" /> },
  { id: "alguicidas", label: "Alguicidas de Choque", icon: <Droplets className="w-3.5 h-3.5" /> },
  { id: "clarificadores", label: "Clarificadores Floculantes" },
  { id: "ph", label: "Reguladores de pH", icon: <Activity className="w-3.5 h-3.5" /> },
  { id: "robots", label: "Robots Limpiafondos", icon: <Bot className="w-3.5 h-3.5" /> },
  { id: "medicion", label: "Kits de Medición", icon: <Shield className="w-3.5 h-3.5" /> },
  { id: "accesorios", label: "Mangueras & Accesorios", icon: <Wrench className="w-3.5 h-3.5" /> },
];

export const FilterBar: React.FC = () => {
  const {
    selectedCategory,
    setCategory,
    sortBy,
    setSortBy,
    products,
    searchQuery,
  } = useStore();

  const filteredCount = products.filter((p) => {
    const matchesCategory = selectedCategory === "all" || p.category === selectedCategory;
    const matchesSearch =
      !searchQuery ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  }).length;

  return (
    <div className="w-full space-y-4 mb-8">
      {/* Pills de Categorías Horizontales con scroll suave */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2 -mx-4 px-4 sm:mx-0 sm:px-0">
        {CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={cn(
                "flex-shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs sm:text-sm font-semibold transition-all duration-200 border select-none",
                isActive
                  ? "bg-teal-600 text-white border-teal-600 shadow-md shadow-teal-600/20"
                  : "bg-white text-slate-600 border-slate-200 hover:border-sky-300 hover:text-sky-900 hover:bg-sky-50/50"
              )}
            >
              {cat.icon}
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Barra de Control: Conteo de resultados + Ordenamiento */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs text-slate-500">
        <div>
          Mostrando <span className="font-bold text-slate-800">{filteredCount}</span> productos
          {selectedCategory !== "all" && (
            <span>
              {" "}
              en <span className="text-teal-700 font-semibold">{selectedCategory}</span>
            </span>
          )}
          {searchQuery && (
            <span>
              {" "}
              para &quot;<span className="text-slate-800 font-semibold">{searchQuery}</span>&quot;
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <label htmlFor="sortBy" className="text-slate-500 font-medium">
            Ordenar por:
          </label>
          <div className="relative">
            <select
              id="sortBy"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="appearance-none bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium rounded-xl px-3 py-1.5 pr-8 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-400 cursor-pointer text-xs transition-colors"
            >
              <option value="popular">Más destacados / Populares</option>
              <option value="price-asc">Menor precio primero</option>
              <option value="price-desc">Mayor precio primero</option>
              <option value="name">Nombre (A - Z)</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
          </div>
        </div>
      </div>
    </div>
  );
};
