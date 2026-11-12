"use client";

import React, { useState } from "react";
import { useStore } from "@/store/useStore";
import { Product } from "@/types";
import { formatPrice } from "@/lib/utils";
import { generateProductManualPdf } from "@/lib/manualPdfGenerator";
import { buildWhatsAppManualUrl } from "@/lib/whatsapp";
import {
  Calculator,
  Droplets,
  Sparkles,
  ShoppingBag,
  Check,
  X,
  FileDown,
  Info,
  Layers,
  ChevronDown,
  MessageCircle,
} from "lucide-react";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import { motion, AnimatePresence } from "framer-motion";

interface PoolVolumeCalculatorProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PoolVolumeCalculator: React.FC<PoolVolumeCalculatorProps> = ({
  isOpen,
  onClose,
}) => {
  const { products, addToCart } = useStore();

  const [shape, setShape] = useState<"rectangular" | "circular">("rectangular");
  const [length, setLength] = useState<number>(8); // metros
  const [width, setWidth] = useState<number>(4); // metros
  const [depth, setDepth] = useState<number>(1.5); // profundidad promedio
  const [diameter, setDiameter] = useState<number>(4.5); // metros (circular)

  // Selector del Producto Específico a Calcular
  // Filtramos los productos que pertenezcan a químicos o tengan manual
  const chemicalProducts = (products || []).filter(
    (p) =>
      p.category === "cloros" ||
      p.category === "alguicidas" ||
      p.category === "clarificadores" ||
      p.category === "ph" ||
      p.hasManual
  );

  const [selectedProductId, setSelectedProductId] = useState<string>(
    chemicalProducts[0]?.id || "prod-01"
  );
  const [addedSuccess, setAddedSuccess] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  // Asegurar selección válida si cambia el catálogo
  React.useEffect(() => {
    if (chemicalProducts.length > 0 && !chemicalProducts.some((p) => p.id === selectedProductId)) {
      setSelectedProductId(chemicalProducts[0].id);
    }
  }, [chemicalProducts, selectedProductId]);

  // Cálculo de Litros / Metros Cúbicos
  const liters = Math.max(
    1000,
    Math.round(
      shape === "rectangular"
        ? (length || 1) * (width || 1) * (depth || 1) * 1000
        : Math.PI * Math.pow((diameter || 1) / 2, 2) * (depth || 1) * 1000
    )
  );

  // Producto actualmente seleccionado con fallback seguro
  const selectedProduct =
    chemicalProducts.find((p) => p.id === selectedProductId) ||
    chemicalProducts[0] ||
    products[0];

  // Cálculo de Dosis personalizada según la regla del producto
  const calculateExactDosage = (product: Product, currentLiters: number) => {
    if (!product) return { text: "Dosificación estándar", unitsToAdd: 1 };

    if (product.dosageRule) {
      const { unit, baseRatio, perLiters } = product.dosageRule;
      const amount = Math.round(((currentLiters / perLiters) * baseRatio) * 10) / 10;

      let unitsToAdd = 1;
      if (unit === "pastillas") {
        unitsToAdd = Math.max(1, Math.ceil(amount));
        return {
          text: `${amount} pastilla(s) (${amount * 200}g)`,
          unitsToAdd,
          details: `Colocar en boya flotante para desinfección continua en ${currentLiters.toLocaleString("es-AR")} L.`,
        };
      }
      if (unit === "ml") {
        unitsToAdd = 1;
        return {
          text: `${amount} ml`,
          unitsToAdd,
          details: `Diluir previamente en balde y distribuir por los bordes.`,
        };
      }
      if (unit === "gr") {
        unitsToAdd = 1;
        return {
          text: `${amount} gramos`,
          unitsToAdd,
          details: `Baja aprox. 0.2 unidades de pH para ${currentLiters.toLocaleString("es-AR")} litros de agua.`,
        };
      }
    }

    // Fallback predictivo por categoría
    if (product.category === "cloros") {
      const tabs = Math.max(1, Math.ceil(currentLiters / 20000));
      return {
        text: `${tabs} pastilla(s) de 200g semanales`,
        unitsToAdd: 1,
        details: "Mantenimiento semanal continuo",
      };
    }
    if (product.category === "alguicidas") {
      const ml = Math.round((currentLiters / 50000) * 200);
      return {
        text: `${ml} ml preventivo`,
        unitsToAdd: 1,
        details: "Aplicar cada 15 días o post lluvia",
      };
    }
    if (product.category === "clarificadores") {
      const ml = Math.round((currentLiters / 40000) * 250);
      return {
        text: `${ml} ml decantador`,
        unitsToAdd: 1,
        details: "Aplicar al atardecer y dejar reposar 8 horas sin filtrar",
      };
    }

    return {
      text: product.dosage,
      unitsToAdd: 1,
      details: product.usageGuide,
    };
  };

  const dosageResult = selectedProduct
    ? calculateExactDosage(selectedProduct, liters)
    : { text: "Dosificación estándar", unitsToAdd: 1 };

  const handleAddToCart = () => {
    if (!selectedProduct) return;
    addToCart(selectedProduct, dosageResult.unitsToAdd || 1);
    setAddedSuccess(true);
    setTimeout(() => {
      setAddedSuccess(false);
      onClose();
    }, 1200);
  };

  const handleDownloadPersonalizedManual = () => {
    if (!selectedProduct) return;
    setDownloadingPdf(true);
    try {
      generateProductManualPdf({
        product: selectedProduct,
        customLiters: liters,
        calculatedDosage: dosageResult.text,
      });
    } catch (err) {
      console.error("Error al generar PDF:", err);
    } finally {
      setTimeout(() => setDownloadingPdf(false), 800);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
      />

      {/* Modal Dialog */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl z-10 max-h-[92vh] overflow-y-auto space-y-6 border border-slate-100"
      >
        {/* Cabecera */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center shadow-sm">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                Calculadora de Dosis de Piscinas & Manual Personalizado
              </h3>
              <p className="text-xs text-slate-400">
                Selecciona tu producto químico y obtén la proporción exacta en litros
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. SELECCIÓN DE FORMA & MEDIDAS DE LA PISCINA */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
              1. Medidas de tu Espejo de Agua
            </label>
            <div className="flex p-0.5 bg-slate-100 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => setShape("rectangular")}
                className={`px-3 py-1 rounded-lg transition-all ${
                  shape === "rectangular"
                    ? "bg-white text-teal-800 shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Rectangular
              </button>
              <button
                type="button"
                onClick={() => setShape("circular")}
                className={`px-3 py-1 rounded-lg transition-all ${
                  shape === "circular"
                    ? "bg-white text-teal-800 shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Circular
              </button>
            </div>
          </div>

          {shape === "rectangular" ? (
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                  Largo (m)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="1"
                  value={length}
                  onChange={(e) => setLength(parseFloat(e.target.value) || 0)}
                  className="w-full text-center py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-400"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                  Ancho (m)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="1"
                  value={width}
                  onChange={(e) => setWidth(parseFloat(e.target.value) || 0)}
                  className="w-full text-center py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-400"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                  Profundidad (m)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0.5"
                  max="4"
                  value={depth}
                  onChange={(e) => setDepth(parseFloat(e.target.value) || 0)}
                  className="w-full text-center py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-400"
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                  Diámetro (m)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="1"
                  value={diameter}
                  onChange={(e) => setDiameter(parseFloat(e.target.value) || 0)}
                  className="w-full text-center py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-400"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                  Profundidad Media (m)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0.5"
                  value={depth}
                  onChange={(e) => setDepth(parseFloat(e.target.value) || 0)}
                  className="w-full text-center py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-400"
                />
              </div>
            </div>
          )}

          {/* Badge de Volumen Total */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-sky-50/60 border border-sky-100 text-xs">
            <span className="text-sky-900 font-medium">Volumen de Agua Estimado:</span>
            <span className="text-base font-black text-sky-800">
              {liters.toLocaleString("es-AR")} Litros ({(liters / 1000).toFixed(1)} m³)
            </span>
          </div>
        </div>

        {/* 2. SELECTOR DEL PRODUCTO A CALCULAR */}
        <div className="space-y-3 pt-2 border-t border-slate-100">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
            2. Elige el Producto Químico a Dosificar
          </label>

          <div className="relative">
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full appearance-none bg-white border border-slate-200 hover:border-sky-300 rounded-2xl px-4 py-3 text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 pr-10 cursor-pointer shadow-sm transition-colors"
            >
              {chemicalProducts.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — ({formatPrice(p.price)})
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          {/* Píldoras rápidas de productos principales */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            {chemicalProducts.slice(0, 4).map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedProductId(p.id)}
                className={`text-[11px] px-3 py-1 rounded-xl font-medium border flex-shrink-0 transition-all ${
                  selectedProductId === p.id
                    ? "bg-teal-50 text-teal-800 border-teal-300 font-bold"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                }`}
              >
                {p.category.toUpperCase()}: {p.name.split(" ")[0]} {p.name.split(" ")[1]}
              </button>
            ))}
          </div>
        </div>

        {/* 3. RESULTADO DE CÁLCULO & RECOMENDACIÓN TÉCNICA */}
        {selectedProduct && (
          <div className="bg-gradient-to-br from-teal-50/80 via-white to-sky-50/80 rounded-2xl p-5 border border-teal-200/80 shadow-soft space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-teal-700 block">
                  Dosis Calculada para {liters.toLocaleString("es-AR")} Litros
                </span>
                <div className="text-2xl font-black text-teal-800 tracking-tight mt-0.5">
                  {dosageResult.text}
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs text-slate-400 block">Precio Producto</span>
                <span className="text-lg font-black text-slate-900">
                  {formatPrice(selectedProduct.price)}
                </span>
              </div>
            </div>

            <div className="p-3 bg-white/90 rounded-xl border border-teal-100 text-xs space-y-1 text-slate-600">
              <p className="font-semibold text-slate-800">
                Modo de Aplicación Recomendado:
              </p>
              <p className="text-[11px] leading-relaxed">
                {selectedProduct.technicalSheet?.stepByStepGuide?.[0] || selectedProduct.usageGuide}
              </p>
              {selectedProduct.technicalSheet?.recommendedPh && (
                <p className="text-[11px] text-teal-800 font-medium pt-1">
                  • pH óptimo de actuación: {selectedProduct.technicalSheet.recommendedPh}
                </p>
              )}
            </div>

            {/* BOTONES DE ACCIÓN: MANUAL PDF + MANUAL AL WHATSAPP + AÑADIR AL CARRITO */}
            <div className="space-y-2.5 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleDownloadPersonalizedManual}
                  disabled={downloadingPdf}
                  className="font-bold border-sky-300 text-sky-800 hover:bg-sky-100"
                >
                  <FileDown className="w-4 h-4 text-sky-600 mr-1" />
                  <span>
                    {downloadingPdf ? "Generando PDF..." : "Descargar Manual PDF"}
                  </span>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={() => {
                    const url = buildWhatsAppManualUrl({
                      product: selectedProduct,
                      customLiters: liters,
                      calculatedDosage: dosageResult.text,
                    });
                    window.open(url, "_blank", "noopener,noreferrer");
                  }}
                  className="font-bold border-emerald-300 text-emerald-800 bg-emerald-50/70 hover:bg-emerald-100"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-600 mr-1" />
                  <span>Mandar Manual al WSP</span>
                </Button>
              </div>

              <Button
                variant="primary"
                size="md"
                onClick={handleAddToCart}
                className="w-full font-bold shadow-md shadow-teal-600/20"
              >
                {addedSuccess ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-300 mr-1" />
                    <span>¡Añadido al Carrito!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4 mr-1" />
                    <span>Añadir Producto al Carrito</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
