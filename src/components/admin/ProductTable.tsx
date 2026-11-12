"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Product } from "@/types";
import { useStore } from "@/store/useStore";
import { formatPrice } from "@/lib/utils";
import {
  Edit3,
  Trash2,
  Plus,
  Minus,
  Search,
  PlusCircle,
  AlertTriangle,
  CheckCircle2,
  MessageCircle,
  FileDown,
} from "lucide-react";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import { sanitizeInput } from "@/lib/security";
import { buildWhatsAppManualUrl } from "@/lib/whatsapp";
import { generateProductManualPdf } from "@/lib/manualPdfGenerator";

interface ProductTableProps {
  onOpenCreate: () => void;
  onOpenEdit: (product: Product) => void;
}

export const ProductTable: React.FC<ProductTableProps> = ({
  onOpenCreate,
  onOpenEdit,
}) => {
  const { products, deleteProduct, updateStock } = useStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (id: string) => {
    deleteProduct(id);
    setDeleteConfirmId(null);
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-soft overflow-hidden">
      {/* Table Toolbar */}
      <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">Catálogo & Stock en Tiempo Real</h3>
          <p className="text-xs text-slate-400">
            CRUD en memoria sincronizado con persistencia segura ofuscada
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(sanitizeInput(e.target.value))}
              placeholder="Filtrar por nombre o categoría..."
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400"
            />
          </div>

          <Button
            size="sm"
            variant="primary"
            onClick={onOpenCreate}
            className="flex-shrink-0 font-bold"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Nuevo Producto</span>
          </Button>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50/70 border-b border-slate-100 text-slate-500 uppercase tracking-wider font-semibold">
            <tr>
              <th className="py-3 px-5">Producto</th>
              <th className="py-3 px-4">Categoría</th>
              <th className="py-3 px-4">Precio</th>
              <th className="py-3 px-4">Stock</th>
              <th className="py-3 px-4">Estado</th>
              <th className="py-3 px-5 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredProducts.map((p) => {
              const isLowStock = p.stock > 0 && p.stock <= 10;
              const isOutOfStock = p.stock === 0;

              return (
                <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-5">
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0 flex items-center justify-center text-[10px] text-teal-700 font-bold">
                        <Image
                          src={p.image}
                          alt={p.name}
                          fill
                          className="object-cover"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = "none";
                          }}
                        />
                        <span>AQ</span>
                      </div>
                      <div className="max-w-xs">
                        <span className="font-semibold text-slate-900 block truncate">
                          {p.name}
                        </span>
                        <span className="text-[11px] text-slate-400 truncate block">
                          {p.dosage}
                        </span>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <Badge variant="sky" size="sm" className="capitalize">
                      {p.category}
                    </Badge>
                  </td>

                  <td className="py-3.5 px-4 font-bold text-teal-700">
                    {formatPrice(p.price)}
                  </td>

                  {/* Stock con Control In-line (+ / -) */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => updateStock(p.id, p.stock - 1)}
                        disabled={p.stock <= 0}
                        className="w-5 h-5 rounded-md border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-100 disabled:opacity-30"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-8 text-center font-bold text-slate-800">
                        {p.stock}
                      </span>
                      <button
                        onClick={() => updateStock(p.id, p.stock + 1)}
                        className="w-5 h-5 rounded-md border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-100"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    {isOutOfStock ? (
                      <Badge variant="danger" size="sm">
                        Agotado
                      </Badge>
                    ) : isLowStock ? (
                      <Badge variant="warning" size="sm">
                        Crítico ({p.stock})
                      </Badge>
                    ) : (
                      <Badge variant="success" size="sm">
                        En Stock
                      </Badge>
                    )}
                  </td>

                  {/* Botones de Acción */}
                  <td className="py-3.5 px-5 text-right">
                    {deleteConfirmId === p.id ? (
                      <div className="inline-flex items-center gap-1">
                        <span className="text-[11px] text-rose-600 font-semibold mr-1">
                          ¿Borrar?
                        </span>
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="px-2 py-1 bg-rose-600 text-white rounded-lg text-[10px] font-bold hover:bg-rose-700"
                        >
                          Sí
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          className="px-2 py-1 bg-slate-200 text-slate-700 rounded-lg text-[10px] hover:bg-slate-300"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => generateProductManualPdf({ product: p })}
                          className="p-1.5 text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                          title="Descargar Manual PDF"
                        >
                          <FileDown className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const url = buildWhatsAppManualUrl({ product: p });
                            window.open(url, "_blank", "noopener,noreferrer");
                          }}
                          className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="Enviar Manual de Uso por WhatsApp"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onOpenEdit(p)}
                          className="p-1.5 text-slate-400 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors"
                          title="Editar producto"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(p.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Eliminar producto"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
