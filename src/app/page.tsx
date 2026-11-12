"use client";

import React, { useState, useEffect } from "react";
import { useStore } from "@/store/useStore";
import { Product } from "@/types";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { FilterBar } from "@/components/store/FilterBar";
import { ProductCard } from "@/components/store/ProductCard";
import { PoolVolumeCalculator } from "@/components/store/PoolVolumeCalculator";
import { ProductDetailModal } from "@/components/store/ProductDetailModal";
import { Button } from "@/components/ui/Button";
import {
  Droplets,
  Calculator,
  ShieldCheck,
  Truck,
  Sparkles,
  ArrowRight,
  Search,
  CheckCircle2,
  Lock,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function HomePage() {
  const {
    products,
    selectedCategory,
    searchQuery,
    sortBy,
    hydrateStore,
    setSearchQuery,
    setCategory,
  } = useStore();

  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Hidratar catálogo y carrito con verificación de integridad
  useEffect(() => {
    hydrateStore();
  }, [hydrateStore]);

  // Filtrado y Ordenamiento reactivo
  const filteredProducts = (products || [])
    .filter((product) => {
      const matchesCategory =
        selectedCategory === "all" || product.category === selectedCategory;
      const matchesSearch =
        !searchQuery ||
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === "price-asc") return a.price - b.price;
      if (sortBy === "price-desc") return b.price - a.price;
      if (sortBy === "name") return a.name.localeCompare(b.name);
      // popular
      return b.rating * b.reviewsCount - a.rating * a.reviewsCount;
    });

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Navbar con buscador y carrito */}
      <Navbar onOpenCalculator={() => setIsCalculatorOpen(true)} />

      {/* HERO SECTION MINIMALISTA & PREMIUM */}
      <section className="relative pt-12 pb-20 sm:pt-20 sm:pb-28 overflow-hidden bg-gradient-to-b from-sky-50/40 via-white to-white">
        {/* Elemento gráfico de agua sutil de fondo */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-200/25 via-teal-100/10 to-transparent pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge Superior */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-sky-200/80 shadow-soft text-xs font-semibold text-sky-800 mb-6"
          >
            <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></span>
            <span>Tratamiento Químico de Precisión & Tecnología de Filtrado</span>
          </motion.div>

          {/* Título Principal */}
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 tracking-tight leading-[1.1] max-w-4xl mx-auto"
          >
            El estándar definitivo en agua pura, cristalina y{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 via-sky-500 to-teal-500">
              saludable.
            </span>
          </motion.h1>

          {/* Descripción con amplio espacio en blanco */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 text-sm sm:text-base md:text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed font-normal"
          >
            Fórmulas de alta pureza, pastillas de triple acción prolongada y robots autónomos
            con envío express a domicilio y confirmación directa de compra vía WhatsApp.
          </motion.p>

          {/* Botones de Acción Principal (CTA) */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 max-w-md mx-auto"
          >
            <Button
              size="lg"
              variant="primary"
              onClick={() => {
                const catalogEl = document.getElementById("catalogo");
                catalogEl?.scrollIntoView({ behavior: "smooth" });
              }}
              className="w-full sm:w-auto font-bold shadow-lg shadow-teal-600/25 px-8"
            >
              <span>Explorar Catálogo</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>

            <Button
              size="lg"
              variant="secondary"
              onClick={() => setIsCalculatorOpen(true)}
              className="w-full sm:w-auto font-semibold px-6 border-sky-200"
            >
              <Calculator className="w-4 h-4 text-sky-600" />
              <span>Calculadora de Dosis</span>
            </Button>
          </motion.div>

          {/* Pillars de Confianza / Sellos */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-16 pt-10 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-6 text-left max-w-4xl mx-auto"
          >
            <div className="flex items-start gap-3.5 p-3 rounded-2xl hover:bg-slate-50/70 transition-colors">
              <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                  Pureza Química Activa 90%
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Mayor rendimiento por metro cúbico sin dejar residuos calcáreos.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-3 rounded-2xl hover:bg-slate-50/70 transition-colors">
              <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center flex-shrink-0">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                  Envíos 24/48hs & Retiro Gratis
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Calculador logístico transparente por código postal o zona.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-3 rounded-2xl hover:bg-slate-50/70 transition-colors">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                  Seguridad & WhatsApp Checkout
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Sin bases de datos vulnerables: pedido compilado y encriptado en cliente.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* SECCIÓN CATÁLOGO DE PRODUCTOS */}
      <section id="catalogo" className="py-12 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-1">
        {/* Cabecera del Catálogo */}
        <div className="mb-8 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-700">
            <Droplets className="w-4 h-4 text-sky-500" />
            <span>Línea Profesional de Productos</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Catálogo de Tratamiento y Mantenimiento
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
            Selecciona la categoría o busca por síntoma químico (agua turbia, algas, pH alto, etc.)
          </p>
        </div>

        {/* Filtros por Categoría & Ordenamiento */}
        <FilterBar />

        {/* Grid de Productos */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onOpenDetails={(p) => setSelectedProduct(p)}
              />
            ))}
          </div>
        ) : (
          /* Estado Vacío si no hay coincidencias */
          <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center max-w-md mx-auto space-y-4 shadow-soft">
            <div className="w-14 h-14 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center mx-auto">
              <Search className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">
                No encontramos productos coincidentes
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Intenta buscar con otros términos como &quot;cloro&quot;, &quot;alguicida&quot; o limpia los filtros.
              </p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setSearchQuery("");
                setCategory("all");
              }}
            >
              Restablecer Filtros
            </Button>
          </div>
        )}

        {/* BANNER INTERACTIVO IN-PAGE: CALCULADORA DE DOSIS */}
        <div className="mt-20 bg-gradient-to-r from-sky-50 via-teal-50 to-white rounded-3xl p-6 sm:p-10 border border-sky-100 shadow-soft flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left max-w-xl">
            <span className="text-[11px] font-bold uppercase tracking-wider text-teal-700 bg-teal-100/60 px-3 py-1 rounded-full">
              Herramienta Exclusiva para Clientes
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              ¿No sabes cuántos litros tiene tu piscina ni qué dosis aplicar?
            </h3>
            <p className="text-xs sm:text-sm text-slate-500">
              Nuestra calculadora estima la capacidad exacta en metros cúbicos y te recomienda el
              kit de cloro y alguicida ideal para toda la temporada.
            </p>
          </div>

          <Button
            size="lg"
            variant="primary"
            onClick={() => setIsCalculatorOpen(true)}
            className="flex-shrink-0 font-bold shadow-md shadow-teal-600/20"
          >
            <Calculator className="w-5 h-5 mr-1" />
            <span>Abrir Calculadora Gratuita</span>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <Footer />

      {/* Modales Interactivos */}
      <PoolVolumeCalculator
        isOpen={isCalculatorOpen}
        onClose={() => setIsCalculatorOpen(false)}
      />

      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  );
}
