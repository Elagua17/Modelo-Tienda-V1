"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Product } from "@/types";
import { useStore } from "@/store/useStore";
import { formatPrice } from "@/lib/utils";
import {
  X,
  ShoppingBag,
  Check,
  Star,
  ShieldAlert,
  Droplet,
  Sparkles,
  Plus,
  Minus,
  FileDown,
  MessageCircle,
  Send,
} from "lucide-react";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import { motion } from "framer-motion";
import { generateProductManualPdf } from "@/lib/manualPdfGenerator";
import { buildWhatsAppManualUrl } from "@/lib/whatsapp";
import { sanitizeInput } from "@/lib/security";

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
}) => {
  const { addToCart } = useStore();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [targetWhatsAppPhone, setTargetWhatsAppPhone] = useState("");

  if (!product) return null;

  const handleAdd = () => {
    addToCart(product, qty);
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      onClose();
    }, 1200);
  };

  const handleSendManualWhatsApp = () => {
    const url = buildWhatsAppManualUrl({
      product,
      targetPhone: targetWhatsAppPhone,
    });
    window.open(url, "_blank", "noopener,noreferrer");
  };

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

      {/* Modal Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-2xl bg-white rounded-3xl overflow-hidden shadow-2xl z-10 max-h-[90vh] flex flex-col border border-slate-100"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/80 hover:bg-white text-slate-500 hover:text-slate-800 shadow-md backdrop-blur-sm transition-colors"
          aria-label="Cerrar modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="overflow-y-auto flex-1 p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Imagen Principal */}
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 flex items-center justify-center">
              {!imageError ? (
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-tr from-sky-100 via-teal-50 to-slate-100 flex flex-col items-center justify-center p-6 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-teal-500/10 text-teal-600 flex items-center justify-center mb-3">
                    <Droplet className="w-8 h-8 text-teal-600" />
                  </div>
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    {product.category}
                  </span>
                  <span className="text-xs text-slate-400 mt-1">
                    Garantía de Pureza Aqua-Pure
                  </span>
                </div>
              )}
              {product.badge && (
                <div className="absolute top-3 left-3">
                  <Badge variant="success" size="md" className="shadow-sm">
                    {product.badge}
                  </Badge>
                </div>
              )}
            </div>

            {/* Información Principal */}
            <div className="flex flex-col justify-between space-y-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-sky-600 block mb-1">
                  Categoría: {product.category}
                </span>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
                  {product.name}
                </h2>

                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center text-amber-400">
                    <Star className="w-4 h-4 fill-amber-400" />
                    <span className="text-xs font-bold text-slate-800 ml-1">
                      {product.rating.toFixed(1)}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400">
                    • {product.reviewsCount} opiniones verificadas
                  </span>
                </div>

                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-2xl font-black text-teal-600 tracking-tight">
                    {formatPrice(product.price)}
                  </span>
                  {product.originalPrice && (
                    <span className="text-sm text-slate-400 line-through">
                      {formatPrice(product.originalPrice)}
                    </span>
                  )}
                </div>
              </div>

              {/* Selector de Cantidad & CTA */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">
                    Cantidad a comprar:
                  </span>
                  <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50">
                    <button
                      onClick={() => setQty(Math.max(1, qty - 1))}
                      className="p-2 text-slate-500 hover:text-teal-700"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-3 text-xs font-bold text-slate-800">
                      {qty}
                    </span>
                    <button
                      onClick={() => setQty(Math.min(product.stock, qty + 1))}
                      disabled={qty >= product.stock}
                      className="p-2 text-slate-500 hover:text-teal-700 disabled:opacity-30"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <Button
                  size="lg"
                  variant="primary"
                  onClick={handleAdd}
                  disabled={product.stock === 0}
                  className="w-full font-bold shadow-md shadow-teal-600/20"
                >
                  {added ? (
                    <>
                      <Check className="w-5 h-5 text-emerald-300" />
                      <span>¡Añadido al Carrito!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-5 h-5" />
                      <span>
                        Añadir al Carrito ({formatPrice(product.price * qty)})
                      </span>
                    </>
                  )}
                </Button>

                {/* Botón Descargar PDF */}
                <Button
                  size="sm"
                  variant="secondary"
                  type="button"
                  onClick={() => generateProductManualPdf({ product })}
                  className="w-full font-semibold border-sky-200 text-sky-800 hover:bg-sky-50"
                >
                  <FileDown className="w-4 h-4 text-sky-600 mr-1.5" />
                  <span>Descargar Manual de Uso en PDF</span>
                </Button>
              </div>
            </div>
          </div>

          {/* CAJA DE ENVÍO DE MANUAL DE USO AL WHATSAPP */}
          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                Enviar Manual de Uso de este Producto por WhatsApp
              </span>
              <span className="text-[10px] font-semibold bg-white text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">
                Ficha Completa
              </span>
            </div>
            <p className="text-[11px] text-emerald-800/80">
              Ingresa tu número para recibir la guía paso a paso en tu teléfono o
              pulsa enviar para elegir el contacto directamente en WhatsApp:
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="tel"
                value={targetWhatsAppPhone}
                onChange={(e) =>
                  setTargetWhatsAppPhone(sanitizeInput(e.target.value))
                }
                placeholder="Opcional: +54 9 11 1234 5678"
                className="flex-1 text-xs bg-white rounded-xl px-3.5 py-2 border border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800"
              />
              <Button
                type="button"
                size="sm"
                variant="primary"
                onClick={handleSendManualWhatsApp}
                className="font-bold bg-emerald-600 hover:bg-emerald-500"
              >
                <Send className="w-3.5 h-3.5 mr-1" />
                <span>Mandar Manual al WhatsApp</span>
              </Button>
            </div>
          </div>

          {/* Especificaciones Técnicas & Guía de Dosificación */}
          <div className="space-y-4 pt-4 border-t border-slate-100 text-xs text-slate-600">
            <div>
              <h4 className="font-bold text-slate-900 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-teal-600" />
                Descripción del Producto
              </h4>
              <p className="leading-relaxed text-slate-600">
                {product.description}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-sky-50/50 p-4 rounded-2xl border border-sky-100">
              <div>
                <strong className="text-sky-900 block font-semibold mb-1 flex items-center gap-1">
                  <Droplet className="w-3.5 h-3.5 text-sky-600" />
                  Dosificación Sugerida
                </strong>
                <p className="text-slate-600">{product.dosage}</p>
                {product.technicalSheet?.recommendedPh && (
                  <p className="text-[11px] text-teal-700 font-medium mt-1">
                    pH Óptimo: {product.technicalSheet.recommendedPh}
                  </p>
                )}
              </div>

              <div>
                <strong className="text-sky-900 block font-semibold mb-1">
                  Modo de Aplicación
                </strong>
                <p className="text-slate-600">{product.usageGuide}</p>
                {product.technicalSheet?.composition && (
                  <p className="text-[11px] text-slate-500 mt-1">
                    Comp: {product.technicalSheet.composition}
                  </p>
                )}
              </div>
            </div>

            {/* Pasos Detallados del Manual Técnico */}
            {product.technicalSheet?.stepByStepGuide && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2">
                <strong className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                  Instrucciones del Manual Técnico
                </strong>
                <ol className="space-y-1.5 list-decimal list-inside text-[11px] text-slate-600">
                  {product.technicalSheet.stepByStepGuide.map((step, idx) => (
                    <li key={idx} className="leading-relaxed">
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {product.isHazardous && (
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/60 flex items-start gap-2 text-amber-800">
                <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Advertencia de Seguridad:</strong> Manipular con
                  guantes y en lugar ventilado. Mantener fuera del alcance de
                  niños y mascotas.
                </span>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
