import { CartItem, CustomerOrderData, Product, ShippingConfig } from "@/types";
import { formatPrice } from "./utils";

export const WHATSAPP_PHONE_NUMBER =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "5491100000000"; // Configurar en .env.local (no expuesto en repo público)

interface GenerateOrderWhatsAppProps {
  orderId: string;
  items: CartItem[];
  customer: CustomerOrderData;
  shippingConfig: ShippingConfig;
  distanceKm: number;
  subtotal: number;
  shippingCost: number;
  total: number;
}

/**
 * Compila el pedido con formato limpio, link de ubicación en Google Maps y cálculo de envío por km
 */
export function buildWhatsAppCheckoutUrl({
  orderId,
  items,
  customer,
  shippingConfig,
  distanceKm,
  subtotal,
  shippingCost,
  total,
}: GenerateOrderWhatsAppProps): string {
  const itemsText = items
    .map(
      (item, idx) =>
        `${idx + 1}. *${item.product.name}*\n   ▸ Cantidad: ${item.quantity}u × ${formatPrice(
          item.product.price
        )} = *${formatPrice(item.product.price * item.quantity)}*`
    )
    .join("\n\n");

  const isPickup = customer.deliveryMethod === "pickup";

  const deliveryDetails = isPickup
    ? `🏪 *Modalidad:* Retiro Físico en Local (¡GRATIS!)\n📍 *Punto de Retiro:* ${shippingConfig.storeAddress}`
    : `🚚 *Modalidad:* Envío a Domicilio por Ubicación\n📏 *Distancia Calculada:* ${distanceKm.toFixed(
        1
      )} km (Tarifa: ${formatPrice(shippingConfig.baseCost)} fijo + ${formatPrice(
        shippingConfig.costPerKm
      )}/km)${
        customer.address ? `\n🏠 *Dirección / Ref:* ${customer.address}` : ""
      }\n🗺️ *Ubicación en Mapa (GPS):*\n${
        customer.mapsUrl || "https://www.google.com/maps"
      }`;

  const message = `🌊 *NUEVO PEDIDO AQUA-PURE POOLS*
═════════════════════════
🆔 *Orden:* #${orderId}
📅 *Fecha:* ${new Date().toLocaleDateString("es-AR")}

🛒 *PRODUCTOS SOLICITADOS:*
${itemsText}

═════════════════════════
💰 *RESUMEN DE PAGO:*
• Subtotal Productos: ${formatPrice(subtotal)}
• Envío (${isPickup ? "Retiro en Local" : `${distanceKm.toFixed(1)} km`}): ${
    shippingCost === 0 ? "¡GRATIS!" : formatPrice(shippingCost)
  }
• *TOTAL A PAGAR: ${formatPrice(total)}*

═════════════════════════
👤 *DATOS DEL CLIENTE & ENTREGA:*
• *Nombre y Apellido:* ${customer.fullName}
• *Teléfono:* ${customer.phone}
${deliveryDetails}
${customer.notes ? `📝 *Notas:* ${customer.notes}\n` : ""}
═════════════════════════
💬 *¡Hola! Envío mi pedido para confirmar disponibilidad y coordinar el pago.*`;

  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${WHATSAPP_PHONE_NUMBER}?text=${encodedMessage}`;
}

interface GenerateManualWhatsAppProps {
  product: Product;
  targetPhone?: string;
  customLiters?: number;
  calculatedDosage?: string;
}

/**
 * Genera un enlace URI de WhatsApp con el Manual de Uso y Ficha Técnica completa del producto
 */
export function buildWhatsAppManualUrl({
  product,
  targetPhone,
  customLiters,
  calculatedDosage,
}: GenerateManualWhatsAppProps): string {
  const steps =
    product.technicalSheet?.stepByStepGuide || [
      "Verificar que el pH del agua esté entre 7.2 y 7.6.",
      product.usageGuide,
      "Mantener el sistema de filtrado o recirculación activo según indicación.",
    ];

  const precautions =
    product.technicalSheet?.securityPrecautions || [
      "Manipular en lugar ventilado y evitar contacto ocular directo.",
      "No mezclar con otros químicos concentrados en el mismo recipiente.",
      "Mantener fuera del alcance de niños y mascotas.",
    ];

  const stepsFormatted = steps.map((s, i) => `${i + 1}️⃣ ${s}`).join("\n");
  const precautionsFormatted = precautions.map((p) => `⚠️ ${p}`).join("\n");

  const customCalculationBlock =
    customLiters && calculatedDosage
      ? `\n🎯 *CÁLCULO PERSONALIZADO PARA TU PISCINA:*\n• Volumen de agua: *${customLiters.toLocaleString(
          "es-AR"
        )} Litros*\n• Dosis Exacta a Aplicar: *${calculatedDosage}*\n`
      : "";

  const message = `📘 *MANUAL DE USO OFICIAL — AQUA-PURE POOLS*
═════════════════════════
🧪 *Producto:* ${product.name}
🏷️ *Categoría:* ${product.category.toUpperCase()}
💧 *Dosificación Estándar:* ${product.dosage}
${customCalculationBlock}
🔬 *ESPECIFICACIONES TÉCNICAS:*
• *Composición:* ${product.technicalSheet?.composition || "Fórmula de alta pureza certificada"}
• *pH Óptimo del Agua:* ${product.technicalSheet?.recommendedPh || "7.2 a 7.6"}
• *Frecuencia:* ${product.technicalSheet?.frequency || "Según requerimiento periódico"}

📋 *MODO DE APLICACIÓN PASO A PASO:*
${stepsFormatted}

🛡️ *PRECAUCIONES DE SEGURIDAD:*
${precautionsFormatted}

═════════════════════════
🌊 *Aqua-Pure Pools — Ingeniería y Cuidado del Agua*`;

  const encoded = encodeURIComponent(message);
  const cleanPhone = targetPhone ? targetPhone.replace(/[^\d]/g, "") : "";

  if (cleanPhone.length >= 8) {
    return `https://wa.me/${cleanPhone}?text=${encoded}`;
  }
  return `https://api.whatsapp.com/send?text=${encoded}`;
}
