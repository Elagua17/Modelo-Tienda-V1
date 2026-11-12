"use client";

import React, { useState } from "react";
import { useStore } from "@/store/useStore";
import { Order, OrderStatus } from "@/types";
import { formatPrice } from "@/lib/utils";
import { buildWhatsAppManualUrl } from "@/lib/whatsapp";
import { sanitizeInput } from "@/lib/security";
import {
  ShoppingBag,
  ExternalLink,
  MapPin,
  Trash2,
  CheckCircle2,
  Clock,
  XCircle,
  Columns,
  List,
  Search,
  Wallet,
  MessageCircle,
  RotateCcw,
  Store,
  Truck,
} from "lucide-react";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";

export const OrdersTable: React.FC = () => {
  const {
    orders,
    updateOrderStatus,
    deleteOrder,
    updateOrderDistance,
    shippingConfig,
  } = useStore();

  const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | OrderStatus>("all");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Filtrado de órdenes
  const filteredOrders = orders.filter((order) => {
    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      order.id.toLowerCase().includes(q) ||
      order.customer.fullName.toLowerCase().includes(q) ||
      order.customer.phone.toLowerCase().includes(q) ||
      (order.customer.address || "").toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  // Cálculos de Cajas Financieras
  const pendingOrders = filteredOrders.filter((o) => o.status === "pending");
  const confirmedOrders = filteredOrders.filter(
    (o) => o.status === "confirmed"
  );
  const cancelledOrders = filteredOrders.filter(
    (o) => o.status === "cancelled"
  );

  const realCashTotal = orders
    .filter((o) => o.status === "confirmed" && o.paymentConfirmed)
    .reduce((acc, o) => acc + o.total, 0);

  const estimatedPendingTotal = orders
    .filter((o) => o.status === "pending")
    .reduce((acc, o) => acc + o.total, 0);

  const handleSendOrderManualsToClient = (order: Order) => {
    const firstProduct = order.items[0]?.product;
    if (!firstProduct) return;
    const url = buildWhatsAppManualUrl({
      product: firstProduct,
      targetPhone: order.customer.phone,
    });
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="space-y-6">
      {/* BARRA SUPERIOR DE DOBLE CAJA (CAJA REAL VS CAJA ESTIMATIVA) Y SELECTOR DE VISTA */}
      <div className="bg-white rounded-3xl border border-slate-100 p-5 sm:p-6 shadow-soft space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              Gestión de Pedidos: Tablero Kanban, Histórico & Arqueo de Cajas
            </h3>
            <p className="text-xs text-slate-400">
              Confirma pagos en el Kanban para transferir fondos de la Caja
              Estimativa a la Caja Real, o administra el histórico completo
            </p>
          </div>

          {/* Conmutador Kanban vs Listado Histórico */}
          <div className="flex items-center gap-2 self-start lg:self-auto bg-slate-100 p-1 rounded-2xl">
            <button
              type="button"
              onClick={() => setViewMode("kanban")}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                viewMode === "kanban"
                  ? "bg-white text-teal-800 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Columns className="w-4 h-4 text-teal-600" />
              <span>Tablero Kanban</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                viewMode === "list"
                  ? "bg-white text-teal-800 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <List className="w-4 h-4 text-sky-600" />
              <span>Listado Histórico ({orders.length})</span>
            </button>
          </div>
        </div>

        {/* Resumen Comparativo de las 2 Cajas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-slate-100">
          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 block">
                🟢 Caja Real (Pagos Confirmados)
              </span>
              <span className="text-xl font-black text-emerald-700">
                {formatPrice(realCashTotal)}
              </span>
            </div>
            <Wallet className="w-7 h-7 text-emerald-600/60" />
          </div>

          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 block">
                🟡 Caja Estimativa (Por Confirmar)
              </span>
              <span className="text-xl font-black text-amber-700">
                {formatPrice(estimatedPendingTotal)}
              </span>
            </div>
            <Clock className="w-7 h-7 text-amber-600/60" />
          </div>

          <div className="p-4 rounded-2xl bg-sky-50/70 border border-sky-200/80 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-sky-800 block">
                🔵 Proyección Total (Real + Estimado)
              </span>
              <span className="text-xl font-black text-sky-800">
                {formatPrice(realCashTotal + estimatedPendingTotal)}
              </span>
            </div>
            <CheckCircle2 className="w-7 h-7 text-sky-600/60" />
          </div>
        </div>

        {/* Buscador y Filtros */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(sanitizeInput(e.target.value))}
              placeholder="Buscar pedido por cliente, teléfono, #ID o dirección..."
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400"
            />
          </div>

          {viewMode === "list" && (
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {(["all", "pending", "confirmed", "cancelled"] as const).map(
                (st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                      statusFilter === st
                        ? "bg-teal-600 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {st === "all" && "Todos"}
                    {st === "pending" && "Pendientes"}
                    {st === "confirmed" && "Confirmados"}
                    {st === "cancelled" && "Cancelados"}
                  </button>
                )
              )}
            </div>
          )}
        </div>
      </div>

      {/* ===================================================================== */}
      {/* VISTA 1: TABLERO KANBAN DE PEDIDOS (PENDIENTES / CONFIRMADOS / CANCELADOS) */}
      {/* ===================================================================== */}
      {viewMode === "kanban" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* COLUMNA 1: PENDIENTES DE PAGO (CAJA ESTIMATIVA) */}
          <div className="bg-amber-50/40 rounded-3xl border border-amber-200/70 p-4 space-y-4 flex flex-col">
            <div className="flex items-center justify-between px-2 pt-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-amber-900">
                  Pendientes de Pago ({pendingOrders.length})
                </h4>
              </div>
              <span className="text-xs font-black text-amber-700 bg-amber-100/80 px-2.5 py-1 rounded-lg">
                {formatPrice(
                  pendingOrders.reduce((acc, o) => acc + o.total, 0)
                )}
              </span>
            </div>

            <div className="space-y-3 flex-1">
              {pendingOrders.length === 0 ? (
                <div className="text-center py-10 text-xs text-slate-400 bg-white/60 rounded-2xl border border-dashed border-amber-200">
                  No hay pedidos pendientes de confirmación
                </div>
              ) : (
                pendingOrders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-white rounded-2xl p-4 border border-amber-200/80 shadow-sm space-y-3 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="font-mono text-xs font-black text-teal-800">
                          #{order.id}
                        </span>
                        <h5 className="text-sm font-bold text-slate-900">
                          {order.customer.fullName}
                        </h5>
                        <p className="text-[11px] text-slate-500">
                          {order.customer.phone}
                        </p>
                      </div>
                      <Badge variant="warning" size="sm">
                        Pendiente Pago
                      </Badge>
                    </div>

                    {/* Productos del Pedido */}
                    <div className="text-[11px] bg-slate-50 p-2.5 rounded-xl space-y-1 text-slate-600">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between">
                          <span className="truncate max-w-[180px]">
                            {item.quantity}x {item.product.name}
                          </span>
                          <span className="font-semibold text-slate-800">
                            {formatPrice(item.product.price * item.quantity)}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Entrega & Link de Mapa */}
                    <div className="text-[11px] text-slate-600 space-y-1">
                      {order.deliveryMethod === "pickup" ? (
                        <div className="flex items-center gap-1 text-emerald-700 font-semibold">
                          <Store className="w-3.5 h-3.5" />
                          <span>Retiro Físico en Local (Gratis)</span>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-1 font-semibold text-sky-800">
                              <Truck className="w-3.5 h-3.5 text-sky-600" />
                              Envío ({order.distanceKm} km):{" "}
                              {formatPrice(order.shippingCost)}
                            </span>
                            {order.customer.mapsUrl && (
                              <a
                                href={order.customer.mapsUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-sky-600 hover:text-sky-800 font-bold underline"
                              >
                                <MapPin className="w-3 h-3" />
                                <span>Abrir Mapa</span>
                              </a>
                            )}
                          </div>
                          {order.customer.address && (
                            <p className="text-slate-500 truncate">
                              Ref: {order.customer.address}
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Total y Botones de Acción Kanban */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs text-slate-400">Total Orden:</span>
                      <span className="text-base font-black text-slate-900">
                        {formatPrice(order.total)}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() =>
                          updateOrderStatus(order.id, "confirmed", true)
                        }
                        className="col-span-2 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Confirmar Pago (A Caja Real)</span>
                      </button>

                      <a
                        href={`https://wa.me/${order.customer.phone.replace(
                          /[^\d]/g,
                          ""
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-1.5 px-2.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-800 font-semibold text-[11px] flex items-center justify-center gap-1"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>WhatsApp</span>
                      </a>

                      <button
                        type="button"
                        onClick={() =>
                          updateOrderStatus(order.id, "cancelled", false)
                        }
                        className="py-1.5 px-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-[11px] flex items-center justify-center gap-1"
                      >
                        <XCircle className="w-3 h-3" />
                        <span>Cancelar</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* COLUMNA 2: CONFIRMADOS CON PAGO VERIFICADO (CAJA REAL) */}
          <div className="bg-emerald-50/40 rounded-3xl border border-emerald-200/70 p-4 space-y-4 flex flex-col">
            <div className="flex items-center justify-between px-2 pt-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-emerald-900">
                  Confirmados • Pago OK ({confirmedOrders.length})
                </h4>
              </div>
              <span className="text-xs font-black text-emerald-700 bg-emerald-100/80 px-2.5 py-1 rounded-lg">
                {formatPrice(
                  confirmedOrders.reduce((acc, o) => acc + o.total, 0)
                )}
              </span>
            </div>

            <div className="space-y-3 flex-1">
              {confirmedOrders.length === 0 ? (
                <div className="text-center py-10 text-xs text-slate-400 bg-white/60 rounded-2xl border border-dashed border-emerald-200">
                  No hay pedidos confirmados en esta vista
                </div>
              ) : (
                confirmedOrders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-white rounded-2xl p-4 border border-emerald-200/80 shadow-sm space-y-3 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="font-mono text-xs font-black text-emerald-700">
                          #{order.id}
                        </span>
                        <h5 className="text-sm font-bold text-slate-900">
                          {order.customer.fullName}
                        </h5>
                        <p className="text-[11px] text-slate-500">
                          {order.customer.phone}
                        </p>
                      </div>
                      <Badge variant="success" size="sm">
                        ✓ Pago Confirmado
                      </Badge>
                    </div>

                    <div className="text-[11px] bg-slate-50 p-2.5 rounded-xl space-y-1 text-slate-600">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between">
                          <span className="truncate max-w-[180px]">
                            {item.quantity}x {item.product.name}
                          </span>
                          <span className="font-semibold text-slate-800">
                            {formatPrice(item.product.price * item.quantity)}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="text-[11px] text-slate-600">
                      {order.deliveryMethod === "pickup" ? (
                        <span className="text-emerald-700 font-semibold flex items-center gap-1">
                          <Store className="w-3.5 h-3.5" />
                          Retiro Físico en Local
                        </span>
                      ) : (
                        <div className="flex items-center justify-between">
                          <span>
                            🚚 Envío ({order.distanceKm} km):{" "}
                            {formatPrice(order.shippingCost)}
                          </span>
                          {order.customer.mapsUrl && (
                            <a
                              href={order.customer.mapsUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-sky-600 hover:text-sky-800 font-bold underline"
                            >
                              <MapPin className="w-3 h-3" />
                              <span>Ver Mapa</span>
                            </a>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] text-emerald-700 font-bold">
                        En Caja Real:
                      </span>
                      <span className="text-base font-black text-emerald-700">
                        {formatPrice(order.total)}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5 pt-1">
                      <button
                        type="button"
                        onClick={() => handleSendOrderManualsToClient(order)}
                        className="col-span-2 py-1.5 px-2.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 font-semibold text-[11px] flex items-center justify-center gap-1 border border-teal-200/60"
                      >
                        <MessageCircle className="w-3.5 h-3.5 text-teal-600" />
                        <span>Enviar Manual de Uso al WSP del Cliente</span>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          updateOrderStatus(order.id, "pending", false)
                        }
                        className="py-1.5 px-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-[10px] flex items-center justify-center gap-1"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Volver a Pendiente</span>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          updateOrderStatus(order.id, "cancelled", false)
                        }
                        className="py-1.5 px-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-[10px] flex items-center justify-center gap-1"
                      >
                        <XCircle className="w-3 h-3" />
                        <span>Cancelar</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* COLUMNA 3: CANCELADOS & PAPELERA */}
          <div className="bg-rose-50/30 rounded-3xl border border-rose-200/60 p-4 space-y-4 flex flex-col">
            <div className="flex items-center justify-between px-2 pt-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-rose-900">
                  Cancelados ({cancelledOrders.length})
                </h4>
              </div>
              <span className="text-xs font-bold text-rose-700 bg-rose-100/70 px-2.5 py-1 rounded-lg">
                Sin cargo en caja
              </span>
            </div>

            <div className="space-y-3 flex-1">
              {cancelledOrders.length === 0 ? (
                <div className="text-center py-10 text-xs text-slate-400 bg-white/60 rounded-2xl border border-dashed border-rose-200">
                  No hay pedidos cancelados
                </div>
              ) : (
                cancelledOrders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-white/90 rounded-2xl p-4 border border-rose-200/70 shadow-sm space-y-3 opacity-90"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="font-mono text-xs font-bold text-slate-400 line-through">
                          #{order.id}
                        </span>
                        <h5 className="text-sm font-bold text-slate-700">
                          {order.customer.fullName}
                        </h5>
                        <p className="text-[11px] text-slate-400">
                          {order.customer.phone}
                        </p>
                      </div>
                      <Badge variant="danger" size="sm">
                        Cancelado
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                      <span className="text-slate-400">Importe Anulado:</span>
                      <span className="font-bold text-slate-500 line-through">
                        {formatPrice(order.total)}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() =>
                          updateOrderStatus(order.id, "pending", false)
                        }
                        className="py-1.5 px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] flex items-center justify-center gap-1"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Reactivar</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => deleteOrder(order.id)}
                        className="py-1.5 px-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px] flex items-center justify-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Eliminar</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* VISTA 2: LISTADO HISTÓRICO DETALLADO DE PEDIDOS (TABLA CON ELIMINACIÓN) */}
      {/* ===================================================================== */}
      {viewMode === "list" && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/70 border-b border-slate-100 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3.5 px-5">Orden & Fecha</th>
                  <th className="py-3.5 px-4">Cliente & Teléfono</th>
                  <th className="py-3.5 px-4">Entrega & Mapa (Km)</th>
                  <th className="py-3.5 px-4">Productos</th>
                  <th className="py-3.5 px-4">Total & Caja</th>
                  <th className="py-3.5 px-4">Estado Kanban</th>
                  <th className="py-3.5 px-5 text-right">Acciones / Eliminar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-slate-50/60 transition-colors"
                  >
                    <td className="py-3.5 px-5 font-mono font-bold text-teal-800">
                      #{order.id}
                      <span className="block text-[10px] text-slate-400 font-sans font-normal">
                        {new Date(order.createdAt).toLocaleDateString("es-AR")}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-900 block">
                        {order.customer.fullName}
                      </span>
                      <a
                        href={`https://wa.me/${order.customer.phone.replace(
                          /[^\d]/g,
                          ""
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] text-sky-600 hover:underline font-medium"
                      >
                        {order.customer.phone}
                      </a>
                    </td>

                    <td className="py-3.5 px-4">
                      {order.deliveryMethod === "pickup" ? (
                        <Badge variant="neutral" size="sm">
                          🏪 Retiro Físico ($0)
                        </Badge>
                      ) : (
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] text-slate-500">
                              Km:
                            </span>
                            <input
                              type="number"
                              min="0"
                              step="0.5"
                              value={order.distanceKm}
                              onChange={(e) =>
                                updateOrderDistance(
                                  order.id,
                                  Number(e.target.value)
                                )
                              }
                              className="w-16 text-center py-0.5 px-1 bg-slate-50 border border-slate-200 rounded text-xs font-bold text-slate-800"
                              title="Ajustar km para recalcular envío con tarifa del Admin"
                            />
                            <span className="text-[11px] font-semibold text-teal-700">
                              ({formatPrice(order.shippingCost)})
                            </span>
                          </div>
                          {order.customer.mapsUrl && (
                            <a
                              href={order.customer.mapsUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] text-sky-600 hover:text-sky-800 font-semibold underline"
                            >
                              <MapPin className="w-3 h-3" />
                              <span>Ver Link de Mapa</span>
                            </a>
                          )}
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-800">
                        {order.items.reduce((acc, i) => acc + i.quantity, 0)}{" "}
                        u.
                      </span>
                      <span className="block text-[10px] text-slate-400 truncate max-w-[160px]">
                        {order.items
                          .map((i) => `${i.quantity}x ${i.product.name}`)
                          .join(", ")}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-black text-slate-900 text-sm block">
                        {formatPrice(order.total)}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Sub: {formatPrice(order.subtotal)}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <select
                        value={order.status}
                        onChange={(e) => {
                          const newSt = e.target.value as OrderStatus;
                          updateOrderStatus(
                            order.id,
                            newSt,
                            newSt === "confirmed"
                          );
                        }}
                        className={`text-xs font-bold rounded-xl px-2.5 py-1.5 border focus:outline-none cursor-pointer ${
                          order.status === "confirmed"
                            ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                            : order.status === "pending"
                            ? "bg-amber-50 text-amber-800 border-amber-200"
                            : "bg-rose-50 text-rose-800 border-rose-200"
                        }`}
                      >
                        <option value="pending">⏳ Pendiente (Estimativo)</option>
                        <option value="confirmed">
                          ✓ Confirmado (Caja Real)
                        </option>
                        <option value="cancelled">✕ Cancelado</option>
                      </select>
                    </td>

                    <td className="py-3.5 px-5 text-right">
                      {deleteConfirmId === order.id ? (
                        <div className="inline-flex items-center gap-1">
                          <span className="text-[10px] text-rose-600 font-bold mr-1">
                            ¿Eliminar?
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              deleteOrder(order.id);
                              setDeleteConfirmId(null);
                            }}
                            className="px-2 py-1 bg-rose-600 text-white rounded-lg text-[10px] font-bold hover:bg-rose-700"
                          >
                            Sí
                          </button>
                          <button
                            type="button"
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
                            onClick={() => handleSendOrderManualsToClient(order)}
                            className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
                            title="Enviar Manual de Uso al WhatsApp del cliente"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => setDeleteConfirmId(order.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Eliminar pedido del histórico"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
