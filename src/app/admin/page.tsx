"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useStore } from "@/store/useStore";
import { Product } from "@/types";
import { ProductFormData } from "@/lib/validations";
import { MetricsOverview } from "@/components/admin/MetricsOverview";
import { ProductTable } from "@/components/admin/ProductTable";
import { ProductModal } from "@/components/admin/ProductModal";
import { OrdersTable } from "@/components/admin/OrdersTable";
import { StatisticsPanel } from "@/components/admin/StatisticsPanel";
import { ShippingSettingsCard } from "@/components/admin/ShippingSettingsCard";
import { Button } from "@/components/ui/Button";
import {
  ShieldCheck,
  LogOut,
  ArrowLeft,
  Package,
  ShoppingBag,
  Cpu,
  Key,
  ExternalLink,
  BarChart3,
  Truck,
  Columns,
} from "lucide-react";

export default function AdminDashboardPage() {
  const router = useRouter();
  const {
    adminUser,
    adminToken,
    logoutAdmin,
    verifyAdminSession,
    addProduct,
    updateProduct,
    hydrateStore,
    orders,
  } = useStore();

  const [activeTab, setActiveTab] = useState<
    "orders" | "stats" | "catalog" | "shipping" | "security"
  >("orders");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  // Verificación estricta de Protected Route
  useEffect(() => {
    hydrateStore();
    const isValid = verifyAdminSession();
    if (!isValid) {
      router.push("/admin/login");
    } else {
      setIsLoadingAuth(false);
    }
  }, [router, verifyAdminSession, hydrateStore]);

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold text-slate-500">
            Verificando firma de token JWT y sesión administrativa...
          </p>
        </div>
      </div>
    );
  }

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleSaveProduct = (data: ProductFormData, editId?: string) => {
    const formattedData: Partial<Product> = {
      ...data,
      badge: (data.badge || undefined) as Product["badge"],
    };
    if (editId) {
      updateProduct(editId, formattedData);
    } else {
      addProduct(formattedData as Omit<Product, "id" | "slug">);
    }
  };

  const handleLogout = () => {
    logoutAdmin();
    router.push("/admin/login");
  };

  const pendingCount = orders.filter((o) => o.status === "pending").length;

  return (
    <div className="min-h-screen bg-slate-50/50 pb-16">
      {/* Top Navbar del Admin */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-100 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 gap-4">
            {/* Logo y Breadcrumb */}
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700 hover:bg-teal-100 transition-colors"
                title="Volver a la tienda"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-900">
                    Panel de Control Aqua-Pure
                  </h1>
                  <span className="bg-emerald-50 text-emerald-700 font-bold text-[10px] uppercase px-2 py-0.5 rounded-full border border-emerald-200">
                    JWT Verificado
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Sesión activa:{" "}
                  <span className="text-slate-700 font-semibold">
                    {adminUser?.email}
                  </span>{" "}
                  (Rol: {adminUser?.role})
                </p>
              </div>
            </div>

            {/* Logout y Tienda */}
            <div className="flex items-center gap-2">
              <Link
                href="/"
                className="hidden sm:inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-teal-700 font-semibold px-3 py-2 rounded-xl hover:bg-slate-50 transition-colors"
              >
                <span>Ver Tienda en Vivo</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              </Link>

              <Button
                variant="danger"
                size="sm"
                onClick={handleLogout}
                className="font-semibold"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Cerrar Sesión</span>
              </Button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 sm:gap-2 border-t border-slate-100 pt-1 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTab("orders")}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-bold border-b-2 whitespace-nowrap transition-all ${
                activeTab === "orders"
                  ? "border-teal-600 text-teal-700"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <Columns className="w-4 h-4" />
              <span>Kanban, Cajas & Histórico ({orders.length})</span>
              {pendingCount > 0 && (
                <span className="bg-amber-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">
                  {pendingCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("stats")}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-bold border-b-2 whitespace-nowrap transition-all ${
                activeTab === "stats"
                  ? "border-teal-600 text-teal-700"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <BarChart3 className="w-4 h-4 text-emerald-600" />
              <span>Estadísticas & Ganancias Históricas</span>
            </button>

            <button
              onClick={() => setActiveTab("shipping")}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-bold border-b-2 whitespace-nowrap transition-all ${
                activeTab === "shipping"
                  ? "border-teal-600 text-teal-700"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <Truck className="w-4 h-4 text-sky-600" />
              <span>Tarifas de Envío (Fijo + Km)</span>
            </button>

            <button
              onClick={() => setActiveTab("catalog")}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-bold border-b-2 whitespace-nowrap transition-all ${
                activeTab === "catalog"
                  ? "border-teal-600 text-teal-700"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Catálogo & Stock</span>
            </button>

            <button
              onClick={() => setActiveTab("security")}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-bold border-b-2 whitespace-nowrap transition-all ${
                activeTab === "security"
                  ? "border-teal-600 text-teal-700"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-sky-500" />
              <span>Auditoría Seguridad</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Métricas Superiores (Caja Real vs Caja Estimativa) */}
        <MetricsOverview />

        {/* Vistas por Pestaña */}
        {activeTab === "orders" && <OrdersTable />}

        {activeTab === "stats" && <StatisticsPanel />}

        {activeTab === "shipping" && <ShippingSettingsCard />}

        {activeTab === "catalog" && (
          <ProductTable
            onOpenCreate={handleOpenCreate}
            onOpenEdit={handleOpenEdit}
          />
        )}

        {activeTab === "security" && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-soft space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Panel de Diagnóstico & Endurecimiento Criptográfico
                </h3>
                <p className="text-xs text-slate-400">
                  Inspección técnica de los mecanismos de seguridad frontend en
                  ejecución
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                  <Key className="w-4 h-4 text-teal-600" />
                  <span>Token JWT Activo (RFC 7519 Mock)</span>
                </div>
                <p className="text-[11px] font-mono break-all bg-white p-3 rounded-xl border border-slate-200 text-slate-600">
                  {adminToken || "No hay token emitido"}
                </p>
                <p className="text-[11px] text-slate-500">
                  Firmado con clave HMAC simulada. Claims: <strong>sub</strong>,{" "}
                  <strong>email</strong>, <strong>role</strong>,{" "}
                  <strong>iat</strong>, <strong>exp</strong>.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Mecanismo Anti-Tamper LocalStorage</span>
                </div>
                <div className="text-xs space-y-1.5 text-slate-600">
                  <p>
                    ✓ <strong>Hash de Integridad (Checksum):</strong> Si el
                    usuario altera precios, cajas o stock desde DevTools, la
                    verificación falla y se restaura el estado íntegro.
                  </p>
                  <p>
                    ✓ <strong>Ofuscación Reversible:</strong> Base64 URL-safe
                    con Salting rotativo contra lectura directa.
                  </p>
                  <p>
                    ✓ <strong>Sanitización DOMPurify:</strong> Previene
                    inyecciones XSS en el buscador, notas y nombres.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modal de Creación / Edición */}
      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveProduct}
        initialProduct={editingProduct}
      />
    </div>
  );
}
