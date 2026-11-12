"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useStore } from "@/store/useStore";
import { loginSchema, LoginFormData } from "@/lib/validations";
import { LoginRateLimiter } from "@/lib/security";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import {
  Lock,
  ShieldCheck,
  Droplets,
  AlertCircle,
  KeyRound,
  ArrowLeft,
  CheckCircle,
} from "lucide-react";
import { motion } from "framer-motion";

export default function AdminLoginPage() {
  const router = useRouter();
  const { loginAdmin, verifyAdminSession, adminUser } = useStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lockoutTime, setLockoutTime] = useState<number | null>(null);

  // Redirigir si ya tiene sesión válida activa
  useEffect(() => {
    if (verifyAdminSession()) {
      router.push("/admin");
    }
  }, [router, verifyAdminSession]);

  // Chequeo periódico de bloqueo por Rate Limit
  useEffect(() => {
    const interval = setInterval(() => {
      const check = LoginRateLimiter.checkLimit();
      if (!check.allowed && check.remainingSeconds) {
        setLockoutTime(check.remainingSeconds);
      } else {
        setLockoutTime(null);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleFillDemoCredentials = () => {
    setEmail("admin@aquapure.com");
    setPassword("AquaSecure2026!");
    setErrors({});
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // 1. Validar contra el Rate Limiter
    const rateCheck = LoginRateLimiter.checkLimit();
    if (!rateCheck.allowed) {
      setErrors({
        general: `Sistema protegido contra ataques de fuerza bruta. Reintenta en ${rateCheck.remainingSeconds} segundos.`,
      });
      return;
    }

    // 2. Validación de esquema con Zod
    const validation = loginSchema.safeParse({ email, password });
    if (!validation.success) {
      const newErrors: { email?: string; password?: string } = {};
      validation.error.issues.forEach((issue) => {
        const field = issue.path[0] as "email" | "password";
        newErrors[field] = issue.message;
      });
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const result = loginAdmin(validation.data.email, validation.data.password);
      setIsSubmitting(false);

      if (result.success) {
        router.push("/admin");
      } else {
        setErrors({ general: result.error });
      }
    }, 450); // Simular latencia criptográfica
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-teal-700 font-medium mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Volver a la Tienda</span>
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-card border border-slate-100 space-y-6"
      >
        {/* Header con Sello de Seguridad */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center mx-auto shadow-sm">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Acceso al Panel de Control
          </h1>
          <p className="text-xs text-slate-400">
            Autenticación Mock JWT con Protección Anti-Fuerza Bruta
          </p>
        </div>

        {/* Demo Credentials Pill */}
        <div className="bg-sky-50/80 rounded-2xl p-3.5 border border-sky-100 space-y-2">
          <div className="flex items-center justify-between text-xs text-sky-900 font-semibold">
            <span className="flex items-center gap-1">
              <KeyRound className="w-3.5 h-3.5 text-sky-600" />
              Credenciales para Evaluación de Portfolio:
            </span>
          </div>
          <p className="text-[11px] text-slate-600 font-mono">
            Usuario: <strong>admin@aquapure.com</strong>
            <br />
            Password: <strong>AquaSecure2026!</strong>
          </p>
          <button
            type="button"
            onClick={handleFillDemoCredentials}
            className="w-full text-[11px] font-bold text-sky-700 bg-white hover:bg-sky-100 py-1.5 rounded-xl border border-sky-200 transition-colors"
          >
            Autocompletar Credenciales (1 Clic)
          </button>
        </div>

        {/* Errores Generales / Bloqueo de Rate Limit */}
        {errors.general && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2 text-xs text-rose-800">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
            <span>{errors.general}</span>
          </div>
        )}

        {lockoutTime && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-center text-xs text-amber-900 font-semibold animate-pulse">
            Acceso temporalmente pausado: espera {lockoutTime} segundos.
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleLogin} className="space-y-4">
          <Input
            label="Correo Electrónico Administrador *"
            type="email"
            placeholder="admin@aquapure.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
            disabled={!!lockoutTime || isSubmitting}
          />

          <Input
            label="Contraseña Criptográfica *"
            type="password"
            placeholder="••••••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            disabled={!!lockoutTime || isSubmitting}
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isSubmitting}
            disabled={!!lockoutTime}
            className="w-full font-bold shadow-md shadow-teal-600/20"
          >
            <span>Iniciar Sesión Protegida</span>
          </Button>
        </form>

        <div className="pt-2 border-t border-slate-100 text-center">
          <div className="inline-flex items-center gap-1.5 text-[11px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-500" />
            <span>Emisión de Mock JWT con firma de verificación</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
