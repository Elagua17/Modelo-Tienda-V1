"use client";

import React, { useState, useEffect } from "react";
import { Product, ProductSpecificCategory } from "@/types";
import { productSchema, ProductFormData } from "@/lib/validations";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { X, ShieldAlert, Sparkles, Image as ImageIcon } from "lucide-react";
import { motion } from "framer-motion";

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ProductFormData, editId?: string) => void;
  initialProduct?: Product | null;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialProduct,
}) => {
  const [formData, setFormData] = useState<Partial<ProductFormData>>({
    name: "",
    category: "cloros",
    price: 0,
    originalPrice: undefined,
    stock: 10,
    description: "",
    usageGuide: "",
    dosage: "",
    image: "",
    badge: undefined,
    isHazardous: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialProduct) {
      setFormData({
        name: initialProduct.name,
        category: initialProduct.category,
        price: initialProduct.price,
        originalPrice: initialProduct.originalPrice,
        stock: initialProduct.stock,
        description: initialProduct.description,
        usageGuide: initialProduct.usageGuide,
        dosage: initialProduct.dosage,
        image: initialProduct.image,
        badge: initialProduct.badge,
        isHazardous: !!initialProduct.isHazardous,
      });
    } else {
      setFormData({
        name: "",
        category: "cloros",
        price: 15000,
        originalPrice: undefined,
        stock: 20,
        description: "",
        usageGuide: "",
        dosage: "",
        image:
          "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=900&q=80",
        badge: undefined,
        isHazardous: false,
      });
    }
    setErrors({});
  }, [initialProduct, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validación estricta con Zod
    const validation = productSchema.safeParse(formData);

    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.issues.forEach((issue) => {
        const path = issue.path[0] as string;
        if (!fieldErrors[path]) {
          fieldErrors[path] = issue.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    onSave(validation.data, initialProduct?.id);
    onClose();
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

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl z-10 max-h-[90vh] overflow-y-auto space-y-6 border border-slate-100"
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              {initialProduct ? "Editar Producto" : "Nuevo Producto Químico / Equipamiento"}
            </h3>
            <p className="text-xs text-slate-400">
              Validación Zod en tiempo real y sanitización de campos
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nombre del Producto *"
            placeholder="Ej: Cloro Granulado Rápida Disolución (10 Kg)"
            value={formData.name || ""}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            error={errors.name}
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Categoría *
              </label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value as ProductSpecificCategory })
                }
                className="w-full text-xs rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-400"
              >
                <option value="cloros">Cloros y Pastillas</option>
                <option value="alguicidas">Alguicidas</option>
                <option value="clarificadores">Clarificadores</option>
                <option value="ph">Reguladores de pH</option>
                <option value="robots">Robots Limpiafondos</option>
                <option value="medicion">Medición & Test</option>
                <option value="accesorios">Accesorios</option>
              </select>
              {errors.category && <p className="text-xs text-rose-600 mt-1">{errors.category}</p>}
            </div>

            <Input
              label="Precio (ARS) *"
              type="number"
              min="1"
              value={formData.price || ""}
              onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
              error={errors.price}
            />

            <Input
              label="Stock Disponible *"
              type="number"
              min="0"
              value={formData.stock ?? ""}
              onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
              error={errors.stock}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Precio Original / Antes (Opcional)"
              type="number"
              placeholder="Ej: 19500"
              value={formData.originalPrice ?? ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  originalPrice: e.target.value ? Number(e.target.value) : undefined,
                })
              }
              error={errors.originalPrice}
            />

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Distintivo / Badge
              </label>
              <select
                value={formData.badge || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    badge: (e.target.value ? e.target.value : undefined) as any,
                  })
                }
                className="w-full text-xs rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-400"
              >
                <option value="">Sin Badge</option>
                <option value="Bestseller">Bestseller</option>
                <option value="Premium">Premium</option>
                <option value="Eco-Friendly">Eco-Friendly</option>
                <option value="Oferta">Oferta</option>
              </select>
            </div>
          </div>

          <Input
            label="URL de Imagen (Unsplash u otra) *"
            placeholder="https://images.unsplash.com/..."
            value={formData.image || ""}
            onChange={(e) => setFormData({ ...formData, image: e.target.value })}
            error={errors.image}
            icon={<ImageIcon className="w-4 h-4" />}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Dosificación Sugerida *"
              placeholder="Ej: 1 pastilla cada 20.000 L semanal"
              value={formData.dosage || ""}
              onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
              error={errors.dosage}
            />
            <Input
              label="Guía Rápida de Aplicación *"
              placeholder="Ej: Colocar en boya flotante al atardecer"
              value={formData.usageGuide || ""}
              onChange={(e) => setFormData({ ...formData, usageGuide: e.target.value })}
              error={errors.usageGuide}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Descripción Comercial Completa *
            </label>
            <textarea
              rows={3}
              value={formData.description || ""}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Detalla los beneficios químicos, concentración de cloro activo, etc."
              className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-400 placeholder-slate-400"
            />
            {errors.description && (
              <p className="text-xs text-rose-600 mt-1">{errors.description}</p>
            )}
          </div>

          <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200">
            <input
              type="checkbox"
              id="isHazardous"
              checked={formData.isHazardous}
              onChange={(e) => setFormData({ ...formData, isHazardous: e.target.checked })}
              className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
            />
            <label htmlFor="isHazardous" className="text-xs text-slate-700 font-medium">
              Producto químico de manipulación técnica (muestra advertencia de seguridad)
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button variant="outline" size="sm" type="button" onClick={onClose}>
              Cancelar
            </Button>
            <Button variant="primary" size="sm" type="submit" className="font-bold">
              {initialProduct ? "Guardar Modificaciones" : "Crear y Publicar Producto"}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
