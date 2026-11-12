export type ProductSpecificCategory =
  | "cloros"
  | "alguicidas"
  | "clarificadores"
  | "ph"
  | "robots"
  | "medicion"
  | "accesorios";

export type ProductCategory = "all" | ProductSpecificCategory;

export interface TechnicalSheet {
  composition?: string;
  recommendedPh?: string;
  securityPrecautions: string[];
  stepByStepGuide: string[];
  frequency: string;
  disposalNotes?: string;
}

export interface DosageCalculatorRule {
  unit: "pastillas" | "ml" | "gr" | "horas" | "unidades";
  baseRatio: number; // ej: 1 pastilla
  perLiters: number; // ej: 20000 litros
  frequencyDescription: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  category: ProductSpecificCategory;
  price: number;
  originalPrice?: number;
  stock: number;
  description: string;
  usageGuide: string;
  dosage: string; // ej: "100g cada 10.000 litros semanales"
  image: string;
  rating: number;
  reviewsCount: number;
  badge?: "Bestseller" | "Eco-Friendly" | "Premium" | "Oferta";
  isHazardous?: boolean; // Advertencia química
  hasManual?: boolean;
  technicalSheet?: TechnicalSheet;
  dosageRule?: DosageCalculatorRule;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface GeoCoordinates {
  lat: number;
  lng: number;
  label?: string;
}

export interface ShippingConfig {
  baseCost: number; // Costo fijo establecido por el admin
  costPerKm: number; // Costo por km establecido por el admin
  storeLocation: GeoCoordinates; // Punto de partida (tienda/depósito)
  storeAddress: string; // Dirección del local para retiro físico gratis
}

export type DeliveryMethod = "pickup" | "delivery";

export interface CustomerOrderData {
  fullName: string;
  phone: string;
  deliveryMethod: DeliveryMethod;
  address?: string; // Opcional (retiro físico gratis o referencia de entrega)
  location?: GeoCoordinates;
  mapsUrl?: string; // Link de Google Maps que llega al WhatsApp
  distanceKm?: number;
  notes?: string;
}

export type OrderStatus = "pending" | "confirmed" | "cancelled";

export interface Order {
  id: string;
  createdAt: string;
  confirmedAt?: string;
  items: CartItem[];
  customer: CustomerOrderData;
  deliveryMethod: DeliveryMethod;
  distanceKm: number;
  subtotal: number;
  shippingCost: number;
  total: number;
  status: OrderStatus;
  paymentConfirmed: boolean;
}

export interface AdminMetrics {
  realCashBox: number; // Caja Real: suma de pedidos confirmados con pago
  estimatedCashBox: number; // Caja Estimativa: suma de pedidos pendientes
  projectedTotalBox: number; // Suma Real + Estimativa
  ordersCount: number;
  lowStockCount: number;
  popularCategory: string;
}

export interface AdminUser {
  id: string;
  email: string;
  role: "superadmin" | "admin" | "viewer";
  token?: string;
}
