import { z } from "zod";
import { sanitizeInput } from "./security";

// ==========================================
// 1. ESQUEMA DE CHECKOUT / CLIENTE
// ==========================================
export const checkoutSchema = z.object({
  fullName: z
    .string()
    .min(3, "Ingresa tu nombre y apellido (mín. 3 caracteres)")
    .max(80, "Nombre demasiado extenso")
    .transform(sanitizeInput),
  phone: z
    .string()
    .min(8, "Ingresa un número de teléfono válido (mín. 8 dígitos)")
    .max(20, "Número demasiado extenso")
    .regex(/^[\d\s+\-()]+$/, "Formato de teléfono inválido (solo números, +, -, espacios)")
    .transform(sanitizeInput),
  deliveryMethod: z.enum(["pickup", "delivery"]),
  address: z
    .string()
    .max(180, "Dirección demasiado extensa")
    .optional()
    .transform((val) => (val ? sanitizeInput(val) : "")),
  notes: z
    .string()
    .max(250, "Las notas no pueden superar 250 caracteres")
    .optional()
    .transform((val) => (val ? sanitizeInput(val) : "")),
});

export type CheckoutFormData = z.infer<typeof checkoutSchema>;

// ==========================================
// 2. ESQUEMA DE CONFIGURACIÓN DE ENVÍOS (ADMIN)
// ==========================================
export const shippingConfigSchema = z.object({
  baseCost: z.coerce
    .number()
    .nonnegative("El costo fijo no puede ser negativo")
    .max(500000, "Valor excesivo"),
  costPerKm: z.coerce
    .number()
    .nonnegative("El costo por km no puede ser negativo")
    .max(100000, "Valor excesivo"),
  storeAddress: z
    .string()
    .min(4, "Ingresa la dirección del depósito/tienda")
    .max(150, "Dirección demasiado extensa")
    .transform(sanitizeInput),
});

export type ShippingConfigFormData = z.infer<typeof shippingConfigSchema>;

// ==========================================
// 3. ESQUEMA DE AUTENTICACIÓN ADMIN
// ==========================================
export const loginSchema = z.object({
  email: z
    .string()
    .email("Ingresa un correo con formato válido")
    .transform(sanitizeInput),
  password: z
    .string()
    .min(6, "La contraseña debe tener al menos 6 caracteres")
    .max(64, "Contraseña demasiado extensa"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// ==========================================
// 4. ESQUEMA DE CRUD DE PRODUCTO (ADMIN)
// ==========================================
export const productSchema = z.object({
  name: z
    .string()
    .min(4, "El nombre debe tener al menos 4 caracteres")
    .max(100, "Nombre demasiado largo")
    .transform(sanitizeInput),
  category: z.enum([
    "cloros",
    "alguicidas",
    "clarificadores",
    "ph",
    "robots",
    "medicion",
    "accesorios",
  ], {
    errorMap: () => ({ message: "Selecciona una categoría válida" }),
  }),
  price: z.coerce
    .number()
    .positive("El precio debe ser un número positivo mayor a 0"),
  originalPrice: z.coerce
    .number()
    .positive("Debe ser positivo")
    .optional(),
  stock: z.coerce
    .number()
    .int("El stock debe ser un entero")
    .nonnegative("El stock no puede ser negativo"),
  description: z
    .string()
    .min(10, "La descripción debe tener al menos 10 caracteres")
    .max(600, "Descripción muy extensa")
    .transform(sanitizeInput),
  usageGuide: z
    .string()
    .min(5, "Indica las instrucciones básicas de uso")
    .max(400, "Texto muy largo")
    .transform(sanitizeInput),
  dosage: z
    .string()
    .min(3, "Indica la dosificación recomendada")
    .max(120, "Dosificación muy extensa")
    .transform(sanitizeInput),
  image: z
    .string()
    .url("Ingresa una URL válida para la imagen")
    .transform(sanitizeInput),
  badge: z
    .enum(["Bestseller", "Eco-Friendly", "Premium", "Oferta", ""])
    .optional()
    .transform((val) => (val === "" || !val ? undefined : val)),
  isHazardous: z.boolean().default(false),
  hasManual: z.boolean().default(true),
});

export type ProductFormData = z.infer<typeof productSchema>;

// ==========================================
// 5. ESQUEMA DE BÚSQUEDA Y FILTROS
// ==========================================
export const searchSchema = z.object({
  query: z
    .string()
    .max(50, "Búsqueda demasiado extensa")
    .transform(sanitizeInput),
});
