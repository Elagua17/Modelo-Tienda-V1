"use client";

import React from "react";
import { useStore } from "@/store/useStore";
import { formatPrice } from "@/lib/utils";
import {
  Wallet,
  Clock,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Calculator,
} from "lucide-react";

export const MetricsOverview: React.FC = () => {
  const { products, orders } = useStore();

  // Filtrar órdenes según su estado en el Kanban
  const confirmedOrders = orders.filter(
    (o) => o.status === "confirmed" && o.paymentConfirmed
  );
  const pendingOrders = orders.filter((o) => o.status === "pending");
  const cancelledOrders = orders.filter((o) => o.status === "cancelled");

  // CAJA REAL: Dinero efectivamente cobrado de pedidos confirmados
  const realCashBox = confirmedOrders.reduce((acc, o) => acc + o.total, 0);

  // CAJA ESTIMATIVA: Dinero en pedidos pendientes por cobrar + Proyección Total
  const pendingCashBox = pendingOrders.reduce((acc, o) => acc + o.total, 0);
  const totalProjectedCashBox = realCashBox + pendingCashBox;

  const lowStockProducts = products.filter((p) => p.stock > 0 && p.stock <= 10);
  const outOfStockProducts = products.filter((p) => p.stock === 0);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {/* 1. CAJA REAL (DINERO CONFIRMADO CON PAGO VERIFICADO) */}
      <div className="bg-gradient-to-br from-emerald-600 to-teal-700 p-5 rounded-3xl text-white shadow-lg shadow-teal-700/15 relative overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-100">
            Caja Real (Cobrado)
          </span>
          <div className="w-9 h-9 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center text-white">
            <Wallet className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl sm:text-3xl font-black tracking-tight">
          {formatPrice(realCashBox)}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-emerald-100 font-medium mt-2">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
          <span>{confirmedOrders.length} pedidos con pago confirmado</span>
        </div>
      </div>

      {/* 2. CAJA ESTIMATIVA (PENDIENTE DE COBRO + PROYECCIÓN TOTAL) */}
      <div className="bg-white p-5 rounded-3xl border-2 border-amber-200/80 shadow-soft hover:shadow-card transition-all">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800">
            Caja Estimativa (Por Cobrar)
          </span>
          <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl sm:text-3xl font-black text-amber-600 tracking-tight">
          {formatPrice(pendingCashBox)}
        </div>
        <div className="flex items-center justify-between text-xs mt-2 pt-2 border-t border-slate-100">
          <span className="text-slate-500">
            {pendingOrders.length} pendientes
          </span>
          <span className="font-bold text-teal-700">
            Proyección: {formatPrice(totalProjectedCashBox)}
          </span>
        </div>
      </div>

      {/* 3. FLUJO DE ÓRDENES KANBAN */}
      <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-soft hover:shadow-card transition-all">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Estado de Pedidos
          </span>
          <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-black text-slate-900 tracking-tight">
          {orders.length}{" "}
          <span className="text-xs font-normal text-slate-400">
            órdenes totales
          </span>
        </div>
        <div className="flex items-center gap-2 text-[11px] font-semibold mt-2">
          <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
            ✓ {confirmedOrders.length} OK
          </span>
          <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
            ⏳ {pendingOrders.length} Pend.
          </span>
          <span className="text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md">
            ✕ {cancelledOrders.length} Canc.
          </span>
        </div>
      </div>

      {/* 4. STOCK CRÍTICO E INVENTARIO */}
      <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-soft hover:shadow-card transition-all">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Alertas de Inventario
          </span>
          <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-black text-slate-900 tracking-tight">
          {lowStockProducts.length + outOfStockProducts.length}{" "}
          <span className="text-xs font-normal text-slate-400">
            ítems críticos
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-2">
          {lowStockProducts.length} con stock bajo • {outOfStockProducts.length}{" "}
          agotados
        </p>
      </div>
    </div>
  );
};
