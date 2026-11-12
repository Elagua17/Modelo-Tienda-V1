import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { DeliveryMethod, GeoCoordinates, ShippingConfig } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Calcula la distancia en kilómetros entre dos coordenadas geográficas (Fórmula de Haversine)
 * con factor de corrección urbana (1.2x) para aproximar el recorrido real en calles.
 */
export function calculateDistanceKm(from: GeoCoordinates, to: GeoCoordinates): number {
  const R = 6371; // Radio de la Tierra en km
  const dLat = ((to.lat - from.lat) * Math.PI) / 180;
  const dLng = ((to.lng - from.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((from.lat * Math.PI) / 180) *
      Math.cos((to.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const straightDistance = R * c;
  const roadEstimated = straightDistance * 1.2;
  return Math.max(0.5, Math.round(roadEstimated * 10) / 10);
}

/**
 * Calcula el costo de envío según los parámetros establecidos por el Administrador:
 * Costo Fijo + (Kilómetros * Costo por Km)
 */
export function calculateShippingCost(
  distanceKm: number,
  config: ShippingConfig,
  deliveryMethod: DeliveryMethod
): number {
  if (deliveryMethod === "pickup") return 0;
  const rawCost = config.baseCost + distanceKm * config.costPerKm;
  return Math.round(rawCost);
}

/**
 * Genera el enlace oficial de ubicación de Google Maps a partir de coordenadas
 */
export function buildGoogleMapsUrl(coords: GeoCoordinates): string {
  return `https://www.google.com/maps?q=${coords.lat.toFixed(6)},${coords.lng.toFixed(6)}`;
}
