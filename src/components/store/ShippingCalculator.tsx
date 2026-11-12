"use client";

import React, { useState } from "react";
import { useStore } from "@/store/useStore";
import {
  calculateDistanceKm,
  calculateShippingCost,
  buildGoogleMapsUrl,
  formatPrice,
} from "@/lib/utils";
import {
  Truck,
  MapPin,
  Navigation,
  Store,
  ExternalLink,
  CheckCircle2,
  Compass,
} from "lucide-react";
import { GeoCoordinates } from "@/types";

const QUICK_LOCATIONS: GeoCoordinates[] = [
  { lat: -34.5152, lng: -58.4885, label: "Vicente López / Olivos" },
  { lat: -34.4721, lng: -58.5142, label: "San Isidro / Acassuso" },
  { lat: -34.4021, lng: -58.6492, label: "Nordelta / Tigre" },
  { lat: -34.5592, lng: -58.4565, label: "Belgrano / Núñez (CABA)" },
  { lat: -34.5885, lng: -58.4105, label: "Palermo / Recoleta (CABA)" },
  { lat: -34.4412, lng: -58.8145, label: "Pilar / Del Viso" },
  { lat: -34.6512, lng: -58.6214, label: "Morón / Castelar (Oeste)" },
  { lat: -34.7615, lng: -58.3975, label: "Lomas / Adrogué (Sur)" },
];

export const ShippingCalculator: React.FC = () => {
  const {
    deliveryMethod,
    setDeliveryMethod,
    customerLocation,
    setCustomerLocation,
    shippingConfig,
  } = useStore();

  const [locatingGps, setLocatingGps] = useState(false);
  const [gpsFeedback, setGpsFeedback] = useState<string | null>(null);

  const distanceKm = calculateDistanceKm(
    shippingConfig.storeLocation,
    customerLocation
  );
  const shippingCost = calculateShippingCost(
    distanceKm,
    shippingConfig,
    deliveryMethod
  );
  const googleMapsLink = buildGoogleMapsUrl(customerLocation);

  // Manejo de clic en el mapa interactivo (Bounding box Gran Buenos Aires & CABA: lat -34.35 a -34.80, lng -58.90 a -58.30)
  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const xRatio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const yRatio = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));

    // Mapeo proporcional a coordenadas reales de AMBA/CABA
    const minLat = -34.82;
    const maxLat = -34.35;
    const minLng = -58.9;
    const maxLng = -58.32;

    const clickedLat = Number((maxLat - yRatio * (maxLat - minLat)).toFixed(6));
    const clickedLng = Number((minLng + xRatio * (maxLng - minLng)).toFixed(6));

    setCustomerLocation({
      lat: clickedLat,
      lng: clickedLng,
      label: `Punto marcado en Mapa (${clickedLat.toFixed(4)}, ${clickedLng.toFixed(4)})`,
    });
  };

  // Posición porcentual del Pin del Cliente y de la Tienda dentro del lienzo del mapa
  const getMapPercent = (coords: GeoCoordinates) => {
    const minLat = -34.82;
    const maxLat = -34.35;
    const minLng = -58.9;
    const maxLng = -58.32;

    const x = ((coords.lng - minLng) / (maxLng - minLng)) * 100;
    const y = ((maxLat - coords.lat) / (maxLat - minLat)) * 100;
    return {
      x: Math.max(6, Math.min(94, x)),
      y: Math.max(8, Math.min(92, y)),
    };
  };

  const storePos = getMapPercent(shippingConfig.storeLocation);
  const clientPos = getMapPercent(customerLocation);

  const handleUseMyGPS = () => {
    if (typeof window === "undefined" || !("geolocation" in navigator)) {
      setGpsFeedback("Tu navegador no soporta geolocalización directa.");
      return;
    }

    setLocatingGps(true);
    setGpsFeedback(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCustomerLocation({
          lat: Number(pos.coords.latitude.toFixed(6)),
          lng: Number(pos.coords.longitude.toFixed(6)),
          label: "Mi Ubicación GPS Actual",
        });
        setLocatingGps(false);
        setGpsFeedback("¡Ubicación GPS detectada con éxito!");
        setTimeout(() => setGpsFeedback(null), 3500);
      },
      () => {
        setLocatingGps(false);
        setGpsFeedback(
          "No se pudo acceder al GPS. Haz clic directamente en el mapa para fijar tu punto."
        );
      },
      { enableHighAccuracy: true, timeout: 7000 }
    );
  };

  return (
    <div className="bg-sky-50/60 rounded-2xl p-4 border border-sky-100 space-y-3.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-900">
          <Truck className="w-4 h-4 text-sky-600" />
          <span>Modalidad de Entrega & Cálculo por Mapa</span>
        </div>
      </div>

      {/* Selector: Retiro Físico Gratis vs Envío a Domicilio */}
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setDeliveryMethod("pickup")}
          className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all ${
            deliveryMethod === "pickup"
              ? "bg-teal-600 text-white border-teal-600 shadow-md shadow-teal-600/20"
              : "bg-white text-slate-700 border-slate-200 hover:border-sky-300"
          }`}
        >
          <div className="flex items-center justify-between w-full mb-1">
            <Store
              className={`w-4 h-4 ${
                deliveryMethod === "pickup" ? "text-teal-200" : "text-teal-600"
              }`}
            />
            <span
              className={`text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                deliveryMethod === "pickup"
                  ? "bg-white/20 text-white"
                  : "bg-emerald-50 text-emerald-700"
              }`}
            >
              ¡GRATIS!
            </span>
          </div>
          <span className="text-xs font-bold">Retiro Físico</span>
          <span
            className={`text-[10px] ${
              deliveryMethod === "pickup" ? "text-teal-100" : "text-slate-400"
            }`}
          >
            En nuestro local sin cargo
          </span>
        </button>

        <button
          type="button"
          onClick={() => setDeliveryMethod("delivery")}
          className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all ${
            deliveryMethod === "delivery"
              ? "bg-teal-600 text-white border-teal-600 shadow-md shadow-teal-600/20"
              : "bg-white text-slate-700 border-slate-200 hover:border-sky-300"
          }`}
        >
          <div className="flex items-center justify-between w-full mb-1">
            <MapPin
              className={`w-4 h-4 ${
                deliveryMethod === "delivery" ? "text-teal-200" : "text-sky-600"
              }`}
            />
            <span
              className={`text-[10px] font-extrabold ${
                deliveryMethod === "delivery" ? "text-white" : "text-teal-700"
              }`}
            >
              {formatPrice(shippingCost)}
            </span>
          </div>
          <span className="text-xs font-bold">Envío a Domicilio</span>
          <span
            className={`text-[10px] ${
              deliveryMethod === "delivery" ? "text-teal-100" : "text-slate-400"
            }`}
          >
            Calculado por km en mapa
          </span>
        </button>
      </div>

      {/* Si elige Retiro Físico Gratis */}
      {deliveryMethod === "pickup" ? (
        <div className="p-3 bg-white rounded-xl border border-emerald-200/80 space-y-1.5 text-xs">
          <div className="flex items-center justify-between font-bold text-emerald-800">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Retiro en Sucursal Seleccionado
            </span>
            <span className="text-emerald-600 font-black">SIN COSTO ($0)</span>
          </div>
          <p className="text-[11px] text-slate-600">
            📍 <strong>Dirección de retiro:</strong> {shippingConfig.storeAddress}
          </p>
          <p className="text-[10px] text-slate-400">
            Horario de atención: Lunes a Sábados de 9:00 a 18:30 hs. No necesitas ingresar dirección de envío.
          </p>
        </div>
      ) : (
        /* Si elige Envío a Domicilio: Mapa Interactivo + GPS */
        <div className="space-y-3">
          {/* Botón GPS y Zonas Rápidas */}
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={handleUseMyGPS}
              disabled={locatingGps}
              className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-white hover:bg-sky-50 text-sky-700 font-bold text-xs border border-sky-200 shadow-sm transition-all"
            >
              <Navigation
                className={`w-3.5 h-3.5 text-sky-500 ${
                  locatingGps ? "animate-spin" : ""
                }`}
              />
              <span>
                {locatingGps
                  ? "Obteniendo coordenadas GPS..."
                  : "Usar mi ubicación GPS actual"}
              </span>
            </button>
          </div>

          {gpsFeedback && (
            <p className="text-[11px] font-medium text-teal-700 bg-teal-50 px-2.5 py-1.5 rounded-lg border border-teal-200">
              {gpsFeedback}
            </p>
          )}

          {/* MAPA INTERACTIVO VISUAL PARA MARCAR UBICACIÓN */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span className="font-semibold text-slate-700 flex items-center gap-1">
                <Compass className="w-3.5 h-3.5 text-teal-600" />
                Haz clic en el mapa para fijar tu ubicación de entrega:
              </span>
              <span className="font-bold text-teal-700">{distanceKm.toFixed(1)} km</span>
            </div>

            <div
              onClick={handleMapClick}
              className="relative w-full h-44 rounded-2xl overflow-hidden border-2 border-sky-200 hover:border-teal-400 cursor-crosshair bg-[#e8f4f8] shadow-inner select-none transition-colors"
              title="Haz clic en cualquier punto del mapa para establecer la ubicación de entrega"
            >
              {/* Fondo Cartográfico Estilizado (Río de la Plata + Trama Urbana + Autopistas) */}
              <svg
                viewBox="0 0 400 220"
                className="w-full h-full object-cover pointer-events-none"
                preserveAspectRatio="none"
              >
                {/* Tierra / Área Metropolitana */}
                <rect width="400" height="220" fill="#f1f5f9" />
                {/* Río de la Plata al Noreste */}
                <path
                  d="M 240,0 L 400,0 L 400,150 Q 340,115 295,75 Q 260,40 240,0 Z"
                  fill="#bae6fd"
                />
                {/* Cuadrícula de avenidas secundarias */}
                <g stroke="#e2e8f0" strokeWidth="1">
                  <line x1="0" y1="40" x2="400" y2="40" />
                  <line x1="0" y1="80" x2="400" y2="80" />
                  <line x1="0" y1="120" x2="400" y2="120" />
                  <line x1="0" y1="160" x2="400" y2="160" />
                  <line x1="60" y1="0" x2="60" y2="220" />
                  <line x1="130" y1="0" x2="130" y2="220" />
                  <line x1="200" y1="0" x2="200" y2="220" />
                  <line x1="270" y1="0" x2="270" y2="220" />
                  <line x1="340" y1="0" x2="340" y2="220" />
                </g>
                {/* Autopistas Principales (Panamericana, Gral Paz, Acceso Oeste) */}
                <path
                  d="M 320,120 Q 250,75 160,30 L 40,10"
                  stroke="#fed7aa"
                  strokeWidth="3.5"
                  fill="none"
                />
                <path
                  d="M 320,120 Q 220,135 80,145"
                  stroke="#fed7aa"
                  strokeWidth="3"
                  fill="none"
                />
                <path
                  d="M 275,90 Q 265,140 310,185"
                  stroke="#cbd5e1"
                  strokeWidth="2.5"
                  fill="none"
                />
                {/* Etiquetas de Referencia Geográfica en el Mapa */}
                <text x="155" y="25" fill="#64748b" fontSize="9" fontWeight="bold">
                  TIGRE / NORDELTA
                </text>
                <text x="45" y="48" fill="#64748b" fontSize="9" fontWeight="bold">
                  PILAR
                </text>
                <text x="220" y="65" fill="#0f766e" fontSize="9" fontWeight="bold">
                  SAN ISIDRO
                </text>
                <text x="275" y="115" fill="#475569" fontSize="9" fontWeight="bold">
                  CABA
                </text>
                <text x="115" y="140" fill="#64748b" fontSize="9" fontWeight="bold">
                  ZONA OESTE
                </text>
                <text x="255" y="195" fill="#64748b" fontSize="9" fontWeight="bold">
                  ZONA SUR
                </text>
              </svg>

              {/* Línea punteada de Ruta entre Tienda y Cliente */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                <line
                  x1={`${storePos.x}%`}
                  y1={`${storePos.y}%`}
                  x2={`${clientPos.x}%`}
                  y2={`${clientPos.y}%`}
                  stroke="#0d9488"
                  strokeWidth="2.5"
                  strokeDasharray="5,4"
                />
              </svg>

              {/* Pin de la Tienda / Depósito Central */}
              <div
                style={{ left: `${storePos.x}%`, top: `${storePos.y}%` }}
                className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10"
              >
                <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-md border-2 border-white">
                  <Store className="w-3 h-3 text-teal-400" />
                </div>
              </div>

              {/* Pin Interactivo del Cliente */}
              <div
                style={{ left: `${clientPos.x}%`, top: `${clientPos.y}%` }}
                className="absolute -translate-x-1/2 -translate-y-full pointer-events-none z-20 transition-all duration-200"
              >
                <div className="relative flex flex-col items-center">
                  <span className="bg-teal-700 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-md whitespace-nowrap mb-0.5">
                    Tu entrega ({distanceKm.toFixed(1)} km)
                  </span>
                  <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-lg border-2 border-white animate-bounce">
                    <MapPin className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Leyenda Inferior del Mapa */}
              <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-lg text-[10px] text-slate-600 border border-slate-200/80 pointer-events-none">
                <span>
                  📍 Coordenadas: {customerLocation.lat.toFixed(4)},{" "}
                  {customerLocation.lng.toFixed(4)}
                </span>
                <span className="font-bold text-teal-700">Clic para mover Pin</span>
              </div>
            </div>
          </div>

          {/* Selector Rápido de Localidades de Referencia */}
          <div>
            <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 block mb-1">
              O elige una zona rápida en el mapa:
            </label>
            <select
              value={customerLocation.label || ""}
              onChange={(e) => {
                const found = QUICK_LOCATIONS.find(
                  (loc) => loc.label === e.target.value
                );
                if (found) setCustomerLocation(found);
              }}
              className="w-full text-xs bg-white border border-sky-200 rounded-xl px-3 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-400"
            >
              <option value={customerLocation.label || ""}>
                {customerLocation.label || "Ubicación personalizada en el mapa"}
              </option>
              {QUICK_LOCATIONS.map((loc) => (
                <option key={loc.label} value={loc.label}>
                  {loc.label}
                </option>
              ))}
            </select>
          </div>

          {/* Desglose Financiero de la Tarifa (Costo Fijo + Costo por Km) */}
          <div className="p-3 bg-white rounded-xl border border-sky-200/80 space-y-1.5 text-xs">
            <div className="flex items-center justify-between text-slate-600">
              <span>Costo Fijo Base (Admin):</span>
              <span className="font-semibold text-slate-800">
                {formatPrice(shippingConfig.baseCost)}
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span>
                Distancia ({distanceKm.toFixed(1)} km ×{" "}
                {formatPrice(shippingConfig.costPerKm)}/km):
              </span>
              <span className="font-semibold text-slate-800">
                {formatPrice(Math.round(distanceKm * shippingConfig.costPerKm))}
              </span>
            </div>
            <div className="flex items-center justify-between pt-1.5 border-t border-slate-100 font-bold text-slate-900">
              <span>Costo Total de Envío:</span>
              <span className="text-teal-700 text-sm font-black">
                {formatPrice(shippingCost)}
              </span>
            </div>
            <div className="pt-1 flex items-center justify-between text-[11px]">
              <span className="text-slate-400">
                Link que se adjuntará al WhatsApp:
              </span>
              <a
                href={googleMapsLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sky-600 hover:text-sky-800 font-semibold underline"
              >
                <span>Ver en Google Maps</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
