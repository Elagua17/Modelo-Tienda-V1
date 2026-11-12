import React from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Lock,
  Droplets,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
  Sparkles,
} from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-slate-100 text-slate-600 pt-16 pb-12 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-slate-100">
          {/* Columna 1: Marca & Visión */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-400 to-teal-500 flex items-center justify-center text-white shadow-sm">
                <Droplets className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold tracking-tight text-slate-900">
                AQUA<span className="text-teal-600">PURE</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Especialistas en ingeniería del agua, químicos de alta pureza y equipamiento inteligente para piscinas residenciales y olímpicas.
            </p>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200/50 w-fit">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Garantía de Pureza 100% Certificada</span>
            </div>
          </div>

          {/* Columna 2: Categorías Rápidas */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Tratamiento de Agua
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <span className="text-slate-500 hover:text-teal-700 cursor-pointer transition-colors">
                  Cloros de Acción Prolongada
                </span>
              </li>
              <li>
                <span className="text-slate-500 hover:text-teal-700 cursor-pointer transition-colors">
                  Alguicidas & Fungicidas de Choque
                </span>
              </li>
              <li>
                <span className="text-slate-500 hover:text-teal-700 cursor-pointer transition-colors">
                  Clarificadores & Floculantes Gel
                </span>
              </li>
              <li>
                <span className="text-slate-500 hover:text-teal-700 cursor-pointer transition-colors">
                  Reguladores de pH Plus & Minus
                </span>
              </li>
              <li>
                <span className="text-slate-500 hover:text-teal-700 cursor-pointer transition-colors">
                  Robots & Limpiafondos Autónomos
                </span>
              </li>
            </ul>
          </div>

          {/* Columna 3: Arquitectura & Ciberseguridad */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-sky-500" />
              <span>Ciberseguridad Frontend</span>
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Prototipo de alta gama con endurecimiento de seguridad:
            </p>
            <ul className="space-y-1.5 text-[11px] text-slate-500 font-mono">
              <li className="flex items-center gap-1 text-slate-700">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Zod Input Schema Validation
              </li>
              <li className="flex items-center gap-1 text-slate-700">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span>
                DOMPurify Anti-XSS Sanitization
              </li>
              <li className="flex items-center gap-1 text-slate-700">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-500"></span>
                Anti-Tamper Obfuscated Storage
              </li>
              <li className="flex items-center gap-1 text-slate-700">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                Mock JWT & Rate Limiting Guard
              </li>
            </ul>
          </div>

          {/* Columna 4: Contacto & Checkout WhatsApp */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Atención & Envíos
            </h4>
            <div className="space-y-2 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-sky-500" />
                <span>+54 9 11 0000-0000 (WhatsApp Demo)</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-sky-500" />
                <span>consultas@aquapure.com</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-sky-500" />
                <span>Buenos Aires, Argentina</span>
              </div>
            </div>
            <Link
              href="/admin/login"
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-teal-600 transition-colors pt-2"
            >
              <Lock className="w-3 h-3" />
              <span>Panel de Control (Portfolio Demo)</span>
            </Link>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p suppressHydrationWarning>© 2026 Aqua-Pure Pools. Diseñado con Next.js, Tailwind CSS & Framer Motion.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Sistema Operativo 100% Cliente
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
