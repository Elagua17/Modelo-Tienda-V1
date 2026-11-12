"use client";

import React, { useState, useEffect } from "react";
import { useStore } from "@/store/useStore";
import { formatPrice } from "@/lib/utils";
import { shippingConfigSchema } from "@/lib/validations";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import {
  Truck,
  MapPin,
  Store,
  Check,
  Calculator,
  DollarSign,
} from "lucide-react";

export const ShippingSettingsCard: React.FC = () => {
  const { shippingConfig, updateShippingConfig } = useStore();

  const [baseCost, setBaseCost] = useState(shippingConfig.baseCost);
  const [costPerKm, setCostPerKm] = useState(shippingConfig.costPerKm);
  const [storeAddress, setStoreAddress] = useState(shippingConfig.storeAddress);
  const [testKm, setTestKm] = useState<number>(12);
  const [savedNotice, setSavedNotice] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setBaseCost(shippingConfig.baseCost);
    setCostPerKm(shippingConfig.costPerKm);
    setStoreAddress(shippingConfig.storeAddress);
  }, [shippingConfig]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const validation = shippingConfigSchema.safeParse({
      baseCost,
      costPerKm,
      storeAddress,
    });

    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.issues.forEach((issue) => {
        const key = issue.path[0] as string;
        fieldErrors[key] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    updateShippingConfig(validation.data);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-soft p-6 sm:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Parametrización de Envíos (Costo Fijo + Costo por Km)
            </h3>
            <p className="text-xs text-slate-400">
              Define la fórmula de cobro automático que se aplica cuando el
              cliente marca su ubicación en el mapa
            </p>
          </div>
        </div>
        <div className="text-xs font-mono bg-sky-50 text-sky-800 px-3 py-1.5 rounded-xl border border-sky-200 font-semibold">
          Fórmula: {formatPrice(baseCost)} + (Km × {formatPrice(costPerKm)})
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulario de Configuración de Tarifas */}
        <form onSubmit={handleSave} className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Costo Fijo de Salida (ARS) *"
              type="number"
              min="0"
              step="100"
              value={baseCost}
              onChange={(e) => setBaseCost(Number(e.target.value))}
              error={errors.baseCost}
              helperText="Cargo base por despacho de vehículo"
              icon={<DollarSign className="w-4 h-4" />}
            />

            <Input
              label="Costo por Kilómetro Recorrido (ARS / km) *"
              type="number"
              min="0"
              step="50"
              value={costPerKm}
              onChange={(e) => setCostPerKm(Number(e.target.value))}
              error={errors.costPerKm}
              helperText="Se multiplica por los km del mapa del cliente"
              icon={<MapPin className="w-4 h-4" />}
            />
          </div>

          <Input
            label="Dirección de Sucursal para Retiro Físico Gratis *"
            value={storeAddress}
            onChange={(e) => setStoreAddress(e.target.value)}
            error={errors.storeAddress}
            helperText="Se informa automáticamente cuando el cliente elige Retiro Físico ($0)"
            icon={<Store className="w-4 h-4" />}
          />

          <div className="flex items-center justify-end gap-3 pt-2">
            {savedNotice && (
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                ¡Tarifas actualizadas en tiempo real!
              </span>
            )}
            <Button type="submit" variant="primary" size="md" className="font-bold">
              Guardar Parámetros de Envío
            </Button>
          </div>
        </form>

        {/* Simulador Rápido de Tarifas para el Administrador */}
        <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700">
            <Calculator className="w-4 h-4 text-teal-600" />
            <span>Simulador de Envío Admin</span>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-500 block mb-1">
              Probar distancia en kilómetros (km):
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                step="0.5"
                value={testKm}
                onChange={(e) => setTestKm(Math.max(0, Number(e.target.value)))}
                className="w-24 text-center py-1.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-400"
              />
              <span className="text-xs text-slate-500">km de recorrido</span>
            </div>
          </div>

          <div className="p-3 bg-white rounded-xl border border-teal-200 space-y-1 text-xs">
            <span className="text-[10px] font-bold uppercase text-slate-400 block">
              Total Envío para {testKm} km:
            </span>
            <div className="text-xl font-black text-teal-700">
              {formatPrice(Math.round(baseCost + testKm * costPerKm))}
            </div>
            <span className="text-[10px] text-slate-400 block">
              ({formatPrice(baseCost)} fijo +{" "}
              {formatPrice(Math.round(testKm * costPerKm))} por distancia)
            </span>
          </div>

          <div className="space-y-1 text-[11px] text-slate-500 pt-1 border-t border-slate-200">
            <div className="flex justify-between">
              <span>• Retiro Físico en Local:</span>
              <strong className="text-emerald-700">¡GRATIS! ($0)</strong>
            </div>
            <div className="flex justify-between">
              <span>• Radio 5 km:</span>
              <strong className="text-slate-700">
                {formatPrice(baseCost + 5 * costPerKm)}
              </strong>
            </div>
            <div className="flex justify-between">
              <span>• Radio 15 km:</span>
              <strong className="text-slate-700">
                {formatPrice(baseCost + 15 * costPerKm)}
              </strong>
            </div>
            <div className="flex justify-between">
              <span>• Radio 30 km:</span>
              <strong className="text-slate-700">
                {formatPrice(baseCost + 30 * costPerKm)}
              </strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
