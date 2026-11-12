"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useStore } from "@/store/useStore";
import {
  formatPrice,
  calculateDistanceKm,
  calculateShippingCost,
  buildGoogleMapsUrl,
} from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  MapPin,
  Store,
  User,
  Phone,
} from "lucide-react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { ShippingCalculator } from "./ShippingCalculator";
import { checkoutSchema } from "@/lib/validations";
import { buildWhatsAppCheckoutUrl } from "@/lib/whatsapp";
import confetti from "canvas-confetti";

export const CartDrawer: React.FC = () => {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    deliveryMethod,
    setDeliveryMethod,
    customerLocation,
    shippingConfig,
    createOrder,
  } = useStore();

  const [step, setStep] = useState<"cart" | "checkout" | "success">("cart");
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    address: "",
    notes: "",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [createdOrderUrl, setCreatedOrderUrl] = useState<string>("");
  const [lastOrderTotal, setLastOrderTotal] = useState<number>(0);

  const subtotal = cart.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0
  );

  const distanceKm = calculateDistanceKm(
    shippingConfig.storeLocation,
    customerLocation
  );
  const shippingCost = calculateShippingCost(
    distanceKm,
    shippingConfig,
    deliveryMethod
  );
  const grandTotal = subtotal + shippingCost;
  const googleMapsLink = buildGoogleMapsUrl(customerLocation);

  const handleInputChange = (
    field: "fullName" | "phone" | "address" | "notes",
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleProceedToCheckout = () => {
    if (cart.length === 0) return;
    setStep("checkout");
  };

  const handleFinalizeWhatsAppPurchase = (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Validación estricta con Zod y sanitización anti-XSS
    const validation = checkoutSchema.safeParse({
      ...formData,
      deliveryMethod,
    });

    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.issues.forEach((issue) => {
        const path = issue.path[0] as string;
        if (!fieldErrors[path]) {
          fieldErrors[path] = issue.message;
        }
      });
      setFormErrors(fieldErrors);
      return;
    }

    const validated = validation.data;
    const orderId = `AQ-${Math.floor(100000 + Math.random() * 900000)}`;

    const customerData = {
      fullName: validated.fullName,
      phone: validated.phone,
      deliveryMethod: validated.deliveryMethod,
      address: validated.address || "",
      location:
        validated.deliveryMethod === "delivery" ? customerLocation : undefined,
      mapsUrl:
        validated.deliveryMethod === "delivery" ? googleMapsLink : undefined,
      distanceKm: validated.deliveryMethod === "delivery" ? distanceKm : 0,
      notes: validated.notes || "",
    };

    // 2. Compilar Orden en estado "pending" (suma a Caja Estimativa hasta confirmar pago en Kanban)
    const newOrder = {
      id: orderId,
      createdAt: new Date().toISOString(),
      items: [...cart],
      customer: customerData,
      deliveryMethod: validated.deliveryMethod,
      distanceKm: validated.deliveryMethod === "delivery" ? distanceKm : 0,
      subtotal,
      shippingCost,
      total: grandTotal,
      status: "pending" as const,
      paymentConfirmed: false,
    };

    // 3. Persistir Orden en LocalStorage Ofuscado
    createOrder(newOrder);

    // 4. Generar URI Codificada de WhatsApp con Link de Google Maps
    const waUrl = buildWhatsAppCheckoutUrl({
      orderId,
      items: cart,
      customer: customerData,
      shippingConfig,
      distanceKm: validated.deliveryMethod === "delivery" ? distanceKm : 0,
      subtotal,
      shippingCost,
      total: grandTotal,
    });

    setCreatedOrderUrl(waUrl);
    setLastOrderTotal(grandTotal);
    setStep("success");

    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
        colors: ["#0d9488", "#38bdf8", "#10b981", "#0284c7"],
      });
    } catch {
      // Ignorar si no está soportado
    }

    clearCart();
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-10"
          >
            {/* Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-teal-50 flex items-center justify-center text-teal-700">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    {step === "cart" && "Tu Carrito & Cálculo de Envío"}
                    {step === "checkout" && "Datos para tu Pedido"}
                    {step === "success" && "¡Pedido Listo para Enviar!"}
                  </h2>
                  <p className="text-[11px] text-slate-400 font-medium">
                    {step === "cart" && `${cart.length} producto(s) en la orden`}
                    {step === "checkout" &&
                      "Retiro gratis o envío con ubicación en mapa"}
                    {step === "success" &&
                      "Registrado en sistema • Derivar a WhatsApp"}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsCartOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                aria-label="Cerrar carrito"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Contenido Dinámico por Pasos */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              {/* PASO 1: LISTADO DE PRODUCTOS + MAPA DE ENVÍO */}
              {step === "cart" && (
                <>
                  {cart.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center py-16 text-slate-400 space-y-3">
                      <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-300">
                        <ShoppingBag className="w-8 h-8" />
                      </div>
                      <p className="text-sm font-semibold text-slate-700">
                        Tu carrito está vacío
                      </p>
                      <p className="text-xs text-slate-400 max-w-xs">
                        Explora nuestro catálogo de químicos, clarificadores y
                        robots para tu piscina.
                      </p>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setIsCartOpen(false)}
                        className="mt-2"
                      >
                        Ver Catálogo
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {cart.map((item) => (
                        <div
                          key={item.product.id}
                          className="flex items-center gap-3.5 p-3 rounded-2xl border border-slate-100 hover:border-sky-200 transition-colors bg-white shadow-sm"
                        >
                          <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-slate-50 flex-shrink-0 flex items-center justify-center">
                            <Image
                              src={item.product.image}
                              alt={item.product.name}
                              fill
                              className="object-cover"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = "none";
                              }}
                            />
                            <div className="text-[10px] text-teal-700 font-bold uppercase">
                              Aqua
                            </div>
                          </div>

                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-semibold text-slate-800 truncate">
                              {item.product.name}
                            </h4>
                            <p className="text-xs font-bold text-teal-700 mt-0.5">
                              {formatPrice(item.product.price)}
                            </p>

                            <div className="flex items-center gap-2 mt-2">
                              <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50/50">
                                <button
                                  onClick={() =>
                                    updateCartQuantity(
                                      item.product.id,
                                      item.quantity - 1
                                    )
                                  }
                                  className="p-1 hover:text-teal-700 text-slate-500"
                                  aria-label="Disminuir cantidad"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="px-2 text-xs font-bold text-slate-800">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() =>
                                    updateCartQuantity(
                                      item.product.id,
                                      item.quantity + 1
                                    )
                                  }
                                  disabled={item.quantity >= item.product.stock}
                                  className="p-1 hover:text-teal-700 text-slate-500 disabled:opacity-30"
                                  aria-label="Aumentar cantidad"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>

                              <button
                                onClick={() => removeFromCart(item.product.id)}
                                className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                                title="Eliminar del carrito"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="text-xs font-black text-slate-900">
                              {formatPrice(item.product.price * item.quantity)}
                            </span>
                          </div>
                        </div>
                      ))}

                      {/* Calculadora de Envíos con Mapa Interactivo y Retiro Físico */}
                      <ShippingCalculator />
                    </div>
                  )}
                </>
              )}

              {/* PASO 2: FORMULARIO SIMPLIFICADO (NOMBRE, TELÉFONO, MODALIDAD & MAPA) */}
              {step === "checkout" && (
                <form
                  id="checkout-form"
                  onSubmit={handleFinalizeWhatsAppPurchase}
                  className="space-y-4"
                >
                  <div className="bg-emerald-50/60 p-3 rounded-xl border border-emerald-100 flex items-start gap-2 text-xs text-emerald-800">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>
                      Completa solo tu <strong>Nombre</strong> y{" "}
                      <strong>Teléfono</strong>. Si elegiste envío, tu ubicación
                      del mapa llegará como link directo al WhatsApp.
                    </span>
                  </div>

                  <Input
                    label="Nombre y Apellido *"
                    placeholder="Ej: Martín Rodríguez"
                    value={formData.fullName}
                    onChange={(e) =>
                      handleInputChange("fullName", e.target.value)
                    }
                    error={formErrors.fullName}
                    icon={<User className="w-4 h-4" />}
                  />

                  <Input
                    label="Número de Teléfono / WhatsApp *"
                    placeholder="Ej: +54 9 11 4567 8901"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    error={formErrors.phone}
                    icon={<Phone className="w-4 h-4" />}
                  />

                  {/* Selector y Mapa de Entrega también disponible aquí */}
                  <ShippingCalculator />

                  {/* Dirección escrita: Opcional */}
                  <Input
                    label={
                      deliveryMethod === "pickup"
                        ? "Dirección (Opcional — Retiras en Local Gratis)"
                        : "Dirección Escrita / Referencia (Opcional — Ya enviamos el Link del Mapa)"
                    }
                    placeholder={
                      deliveryMethod === "pickup"
                        ? "No requerida para retiro en sucursal"
                        : "Ej: Calle Las Heras 1240, Portón blanco (Opcional)"
                    }
                    value={formData.address}
                    onChange={(e) =>
                      handleInputChange("address", e.target.value)
                    }
                    error={formErrors.address}
                  />

                  <Input
                    label="Notas o Aclaraciones (Opcional)"
                    placeholder="Ej: Horario de preferencia o timbre"
                    value={formData.notes}
                    onChange={(e) => handleInputChange("notes", e.target.value)}
                    error={formErrors.notes}
                  />
                </form>
              )}

              {/* PASO 3: CONFIRMACIÓN Y DERIVACIÓN A WHATSAPP */}
              {step === "success" && (
                <div className="text-center py-8 space-y-5">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-slate-900">
                      ¡Pedido Registrado Correctamente!
                    </h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      Tu orden fue ingresada en nuestra{" "}
                      <strong>Caja Estimativa / Tablero Kanban</strong>. Pulsa el
                      botón debajo para enviar el pedido con el link de tu
                      ubicación por WhatsApp.
                    </p>
                  </div>

                  <div className="p-4 bg-teal-50 rounded-2xl border border-teal-200/70 text-left space-y-2 text-xs">
                    <div className="flex justify-between font-semibold text-teal-900">
                      <span>Total del Pedido:</span>
                      <span className="text-base font-black text-teal-700">
                        {formatPrice(lastOrderTotal)}
                      </span>
                    </div>
                    <p className="text-teal-700/80 text-[11px]">
                      {deliveryMethod === "pickup"
                        ? `Modalidad: Retiro Físico Gratis en ${shippingConfig.storeAddress}`
                        : `Modalidad: Envío a Domicilio (${distanceKm.toFixed(
                            1
                          )} km) con enlace GPS de Google Maps incluido.`}
                    </p>
                  </div>

                  <div className="space-y-2 pt-2">
                    <a
                      href={createdOrderUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-600/30 transition-all text-sm"
                    >
                      <span>Enviar Pedido a WhatsApp Ahora</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setStep("cart");
                        setIsCartOpen(false);
                      }}
                      className="w-full"
                    >
                      Cerrar y Seguir Navegando
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Footer con Resumen Financiero y Acciones */}
            {step !== "success" && cart.length > 0 && (
              <div className="p-5 border-t border-slate-100 bg-slate-50/50 space-y-3">
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-500">
                    <span>Subtotal Productos:</span>
                    <span className="font-semibold text-slate-700">
                      {formatPrice(subtotal)}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>
                      {deliveryMethod === "pickup"
                        ? "Entrega (Retiro Físico en Local):"
                        : `Envío por Mapa (${distanceKm.toFixed(1)} km):`}
                    </span>
                    <span className="font-semibold text-teal-700">
                      {shippingCost === 0
                        ? "¡GRATIS!"
                        : formatPrice(shippingCost)}
                    </span>
                  </div>
                  <div className="flex justify-between text-base font-extrabold text-slate-900 pt-2 border-t border-slate-200">
                    <span>Total Final:</span>
                    <span className="text-lg text-teal-600">
                      {formatPrice(grandTotal)}
                    </span>
                  </div>
                </div>

                {step === "cart" && (
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={handleProceedToCheckout}
                    className="w-full font-bold shadow-md shadow-teal-600/20"
                  >
                    <span>Continuar con mis Datos</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                )}

                {step === "checkout" && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="md"
                      type="button"
                      onClick={() => setStep("cart")}
                      className="w-1/3"
                    >
                      Atrás
                    </Button>
                    <Button
                      variant="primary"
                      size="md"
                      type="submit"
                      form="checkout-form"
                      className="w-2/3 font-bold"
                    >
                      <span>Finalizar por WhatsApp</span>
                      <ExternalLink className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
