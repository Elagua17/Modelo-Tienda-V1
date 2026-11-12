"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Product } from "@/types";
import { useStore } from "@/store/useStore";
import { formatPrice } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  ShoppingBag,
  Check,
  Star,
  AlertCircle,
  Sparkles,
  Droplet,
  FileDown,
  MessageCircle,
} from "lucide-react";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { generateProductManualPdf } from "@/lib/manualPdfGenerator";
import { buildWhatsAppManualUrl } from "@/lib/whatsapp";

interface ProductCardProps {
  product: Product;
  onOpenDetails?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onOpenDetails,
}) => {
  const { addToCart } = useStore();
  const [added, setAdded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  };

  const handleDownloadManual = (e: React.MouseEvent) => {
    e.stopPropagation();
    generateProductManualPdf({ product });
  };

  const handleSendManualWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = buildWhatsAppManualUrl({ product });
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const isLowStock = product.stock > 0 && product.stock <= 10;
  const isOutOfStock = product.stock === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      onClick={() => onOpenDetails?.(product)}
      className="group relative bg-white rounded-3xl p-4 sm:p-5 border border-slate-100 hover:border-sky-200/80 shadow-soft hover:shadow-card transition-all duration-300 flex flex-col justify-between cursor-pointer"
    >
      {/* Top Badges & Alerts */}
      <div>
        <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-slate-50 mb-4 flex items-center justify-center">
          {!imageError ? (
            <Image
              src={product.image}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-tr from-sky-100/80 via-teal-50 to-slate-100 flex flex-col items-center justify-center p-4 text-center">
              <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-600 flex items-center justify-center mb-2">
                <Droplet className="w-6 h-6 text-teal-600" />
              </div>
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                {product.category}
              </span>
              <span className="text-[10px] text-slate-400 mt-1 line-clamp-1">
                Aqua-Pure Química Certificada
              </span>
            </div>
          )}

          {/* Badges superiores flotantes */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
            {product.badge && (
              <Badge
                variant={
                  product.badge === "Bestseller"
                    ? "success"
                    : product.badge === "Premium"
                    ? "sky"
                    : "warning"
                }
                size="sm"
                className="backdrop-blur-md shadow-sm font-semibold"
              >
                {product.badge === "Bestseller" && (
                  <Sparkles className="w-3 h-3 mr-1" />
                )}
                {product.badge}
              </Badge>
            )}

            {product.isHazardous && (
              <span
                className="inline-flex items-center gap-1 bg-amber-500/90 text-slate-950 text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-sm shadow-sm"
                title="Manejo químico con guantes"
              >
                <AlertCircle className="w-3 h-3" />
                Uso Técnico
              </span>
            )}
          </div>

          {/* Rating flotante */}
          <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm border border-slate-100 text-xs font-semibold text-slate-700">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>{product.rating.toFixed(1)}</span>
            <span className="text-[10px] text-slate-400 font-normal">
              ({product.reviewsCount})
            </span>
          </div>
        </div>

        {/* Categoría & Dosificación sutil */}
        <div className="flex items-center justify-between text-xs text-sky-600 font-semibold mb-1.5 uppercase tracking-wider">
          <span>{product.category}</span>
          <span className="text-slate-400 text-[11px] font-normal flex items-center gap-1 lowercase">
            <Droplet className="w-3 h-3 text-sky-400" />
            {product.dosage.slice(0, 22)}...
          </span>
        </div>

        {/* Título de Producto */}
        <h3 className="text-sm sm:text-base font-semibold text-slate-900 group-hover:text-teal-700 transition-colors line-clamp-2 leading-snug mb-2">
          {product.name}
        </h3>

        {/* Descripción corta */}
        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-3">
          {product.description}
        </p>

        {/* Botones de Manual de Uso: Descargar PDF + Mandar al WhatsApp */}
        <div className="grid grid-cols-2 gap-1.5 mb-3">
          <button
            type="button"
            onClick={handleDownloadManual}
            className="inline-flex items-center justify-center gap-1 py-1.5 px-2 rounded-xl bg-sky-50/80 hover:bg-sky-100 text-sky-800 text-[11px] font-semibold border border-sky-200/70 transition-colors"
            title="Descargar Manual de Uso en PDF"
          >
            <FileDown className="w-3.5 h-3.5 text-sky-600 flex-shrink-0" />
            <span className="truncate">Manual PDF</span>
          </button>

          <button
            type="button"
            onClick={handleSendManualWhatsApp}
            className="inline-flex items-center justify-center gap-1 py-1.5 px-2 rounded-xl bg-emerald-50/80 hover:bg-emerald-100 text-emerald-800 text-[11px] font-semibold border border-emerald-200/70 transition-colors"
            title="Enviar Manual de Uso por WhatsApp"
          >
            <MessageCircle className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
            <span className="truncate">Manual al WSP</span>
          </button>
        </div>
      </div>

      {/* Footer de Tarjeta: Precios, Stock y Botón CTA */}
      <div className="pt-3 border-t border-slate-100">
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-xl sm:text-2xl font-black text-teal-600 tracking-tight">
            {formatPrice(product.price)}
          </span>
          {product.originalPrice && (
            <span className="text-xs text-slate-400 line-through">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="text-[11px]">
            {isOutOfStock ? (
              <span className="text-rose-600 font-medium">
                Sin stock disponible
              </span>
            ) : isLowStock ? (
              <span className="text-amber-600 font-medium animate-pulse">
                ¡Solo {product.stock} restantes!
              </span>
            ) : (
              <span className="text-emerald-700 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Stock ({product.stock})
              </span>
            )}
          </div>

          <Button
            size="sm"
            variant={added ? "secondary" : "primary"}
            disabled={isOutOfStock}
            onClick={handleAddToCart}
            className="flex-shrink-0"
          >
            {added ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span>¡Agregado!</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-4 h-4" />
                <span>Agregar</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </motion.div>
  );
};
