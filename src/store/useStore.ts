import { create } from "zustand";
import {
  Product,
  CartItem,
  ProductCategory,
  Order,
  OrderStatus,
  AdminUser,
  ShippingConfig,
  DeliveryMethod,
  GeoCoordinates,
} from "@/types";
import {
  INITIAL_PRODUCTS,
  DEFAULT_SHIPPING_CONFIG,
  INITIAL_ORDERS,
} from "@/data/mockProducts";
import {
  obfuscateData,
  deobfuscateData,
  generateMockJWT,
  verifyMockJWT,
  LoginRateLimiter,
} from "@/lib/security";
import { calculateDistanceKm, calculateShippingCost } from "@/lib/utils";

const STORAGE_KEY_PRODUCTS = "aqua_store_products_sec_v3";
const STORAGE_KEY_CART = "aqua_store_cart_sec_v3";
const STORAGE_KEY_ORDERS = "aqua_store_orders_sec_v3";
const STORAGE_KEY_SHIPPING = "aqua_store_shipping_sec_v3";
const STORAGE_KEY_AUTH = "aqua_store_admin_auth_v3";

interface StoreState {
  // Catálogo de Productos
  products: Product[];
  selectedCategory: ProductCategory;
  searchQuery: string;
  sortBy: "popular" | "price-asc" | "price-desc" | "name";

  // Carrito, Entrega y Mapa
  cart: CartItem[];
  isCartOpen: boolean;
  deliveryMethod: DeliveryMethod;
  customerLocation: GeoCoordinates;
  shippingConfig: ShippingConfig;

  // Órdenes e Histórico (Kanban & Cajas)
  orders: Order[];

  // Admin & Autenticación
  adminUser: AdminUser | null;
  adminToken: string | null;
  securityNotice: string | null;

  // Acciones de Catálogo & Filtros
  setCategory: (category: ProductCategory) => void;
  setSearchQuery: (query: string) => void;
  setSortBy: (sort: "popular" | "price-asc" | "price-desc" | "name") => void;

  // Acciones de Carrito & Envío por Mapa
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  setIsCartOpen: (isOpen: boolean) => void;
  setDeliveryMethod: (method: DeliveryMethod) => void;
  setCustomerLocation: (coords: GeoCoordinates) => void;
  updateShippingConfig: (newConfig: Partial<ShippingConfig>) => void;

  // Acciones de Pedidos (Histórico + Kanban + Cajas)
  createOrder: (order: Order) => void;
  updateOrderStatus: (
    orderId: string,
    status: OrderStatus,
    paymentConfirmed?: boolean
  ) => void;
  deleteOrder: (orderId: string) => void;
  updateOrderDistance: (orderId: string, newDistanceKm: number) => void;

  // Acciones de Admin (CRUD de Productos)
  addProduct: (productData: Omit<Product, "id" | "slug">) => void;
  updateProduct: (id: string, productData: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  updateStock: (id: string, newStock: number) => void;

  // Acciones de Autenticación
  loginAdmin: (
    email: string,
    password: string
  ) => { success: boolean; error?: string };
  logoutAdmin: () => void;
  verifyAdminSession: () => boolean;
  clearSecurityNotice: () => void;

  // Inicialización Segura
  hydrateStore: () => void;
}

export const useStore = create<StoreState>((set, get) => ({
  products: INITIAL_PRODUCTS,
  selectedCategory: "all",
  searchQuery: "",
  sortBy: "popular",

  cart: [],
  isCartOpen: false,
  deliveryMethod: "delivery",
  customerLocation: {
    lat: -34.5152,
    lng: -58.4885,
    label: "Vicente López / Zona Norte",
  },
  shippingConfig: DEFAULT_SHIPPING_CONFIG,

  orders: INITIAL_ORDERS,
  adminUser: null,
  adminToken: null,
  securityNotice: null,

  setCategory: (category) => set({ selectedCategory: category }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSortBy: (sortBy) => set({ sortBy }),

  addToCart: (product, quantity = 1) => {
    const { cart } = get();
    const existingIndex = cart.findIndex(
      (item) => item.product.id === product.id
    );

    let updatedCart: CartItem[];
    if (existingIndex > -1) {
      updatedCart = [...cart];
      const newQty = updatedCart[existingIndex].quantity + quantity;
      if (newQty <= product.stock) {
        updatedCart[existingIndex].quantity = newQty;
      }
    } else {
      updatedCart = [
        ...cart,
        { product, quantity: Math.min(quantity, product.stock) },
      ];
    }

    set({ cart: updatedCart, isCartOpen: true });

    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY_CART, obfuscateData(updatedCart));
    }
  },

  removeFromCart: (productId) => {
    const { cart } = get();
    const updatedCart = cart.filter((item) => item.product.id !== productId);
    set({ cart: updatedCart });
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY_CART, obfuscateData(updatedCart));
    }
  },

  updateCartQuantity: (productId, quantity) => {
    const { cart } = get();
    if (quantity <= 0) {
      get().removeFromCart(productId);
      return;
    }

    const updatedCart = cart.map((item) => {
      if (item.product.id === productId) {
        return {
          ...item,
          quantity: Math.min(quantity, item.product.stock),
        };
      }
      return item;
    });

    set({ cart: updatedCart });
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY_CART, obfuscateData(updatedCart));
    }
  },

  clearCart: () => {
    set({ cart: [] });
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY_CART);
    }
  },

  setIsCartOpen: (isCartOpen) => set({ isCartOpen }),

  setDeliveryMethod: (deliveryMethod) => set({ deliveryMethod }),

  setCustomerLocation: (customerLocation) => set({ customerLocation }),

  updateShippingConfig: (newConfig) => {
    const updated = { ...get().shippingConfig, ...newConfig };
    set({ shippingConfig: updated });
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY_SHIPPING, obfuscateData(updated));
    }
  },

  // Gestión de Pedidos, Kanban y Cajas
  createOrder: (order) => {
    const { orders } = get();
    const updatedOrders = [order, ...orders];
    set({ orders: updatedOrders });
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY_ORDERS, obfuscateData(updatedOrders));
    }
  },

  updateOrderStatus: (orderId, status, paymentConfirmed) => {
    const { orders } = get();
    const isConfirmed =
      paymentConfirmed !== undefined
        ? paymentConfirmed
        : status === "confirmed";

    const updatedOrders = orders.map((order) => {
      if (order.id !== orderId) return order;
      return {
        ...order,
        status,
        paymentConfirmed: status === "cancelled" ? false : isConfirmed,
        confirmedAt:
          status === "confirmed"
            ? order.confirmedAt || new Date().toISOString()
            : undefined,
      };
    });

    set({ orders: updatedOrders });
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY_ORDERS, obfuscateData(updatedOrders));
    }
  },

  deleteOrder: (orderId) => {
    const { orders } = get();
    const updatedOrders = orders.filter((o) => o.id !== orderId);
    set({ orders: updatedOrders });
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY_ORDERS, obfuscateData(updatedOrders));
    }
  },

  updateOrderDistance: (orderId, newDistanceKm) => {
    const { orders, shippingConfig } = get();
    const cleanKm = Math.max(0, Math.round(newDistanceKm * 10) / 10);
    const updatedOrders = orders.map((order) => {
      if (order.id !== orderId) return order;
      const newShippingCost = calculateShippingCost(
        cleanKm,
        shippingConfig,
        order.deliveryMethod
      );
      return {
        ...order,
        distanceKm: cleanKm,
        shippingCost: newShippingCost,
        total: order.subtotal + newShippingCost,
        customer: {
          ...order.customer,
          distanceKm: cleanKm,
        },
      };
    });

    set({ orders: updatedOrders });
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY_ORDERS, obfuscateData(updatedOrders));
    }
  },

  // CRUD Admin de Productos
  addProduct: (productData) => {
    const { products } = get();
    const id = `prod-${Date.now()}`;
    const slug = productData.name
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-");

    const newProduct: Product = {
      ...productData,
      id,
      slug,
      rating: 5.0,
      reviewsCount: 1,
      hasManual: true,
    };

    const updated = [newProduct, ...products];
    set({ products: updated });
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY_PRODUCTS, obfuscateData(updated));
    }
  },

  updateProduct: (id, productData) => {
    const { products } = get();
    const updated = products.map((p) =>
      p.id === id ? { ...p, ...productData } : p
    );
    set({ products: updated });
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY_PRODUCTS, obfuscateData(updated));
    }
  },

  deleteProduct: (id) => {
    const { products } = get();
    const updated = products.filter((p) => p.id !== id);
    set({ products: updated });
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY_PRODUCTS, obfuscateData(updated));
    }
  },

  updateStock: (id, newStock) => {
    const { products } = get();
    const updated = products.map((p) =>
      p.id === id ? { ...p, stock: Math.max(0, newStock) } : p
    );
    set({ products: updated });
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY_PRODUCTS, obfuscateData(updated));
    }
  },

  // Autenticación Mock
  loginAdmin: (email, password) => {
    const rateCheck = LoginRateLimiter.checkLimit();
    if (!rateCheck.allowed) {
      return {
        success: false,
        error: `Demasiados intentos fallidos por seguridad. Bloqueado por ${rateCheck.remainingSeconds} segundos.`,
      };
    }

    const ADMIN_EMAIL =
      process.env.NEXT_PUBLIC_ADMIN_EMAIL || "admin@aquapure.com";
    const ADMIN_PASS =
      process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "AquaSecure2026!";

    if (email.toLowerCase() === ADMIN_EMAIL && password === ADMIN_PASS) {
      LoginRateLimiter.reset();

      const user: AdminUser = {
        id: "usr-admin-01",
        email: ADMIN_EMAIL,
        role: "superadmin",
      };

      const token = generateMockJWT(user);
      user.token = token;

      set({ adminUser: user, adminToken: token });

      if (typeof window !== "undefined") {
        sessionStorage.setItem(STORAGE_KEY_AUTH, token);
      }

      return { success: true };
    }

    const failStatus = LoginRateLimiter.recordFailure();
    if (failStatus.locked) {
      return {
        success: false,
        error: `Acceso denegado. Se ha alcanzado el límite de intentos. Sistema bloqueado por ${failStatus.lockoutSeconds}s.`,
      };
    }

    return {
      success: false,
      error: `Credenciales inválidas. Te quedan ${failStatus.remainingAttempts} intento(s) antes del bloqueo.`,
    };
  },

  logoutAdmin: () => {
    set({ adminUser: null, adminToken: null });
    if (typeof window !== "undefined") {
      sessionStorage.removeItem(STORAGE_KEY_AUTH);
    }
  },

  verifyAdminSession: () => {
    if (typeof window === "undefined") return false;

    const token =
      sessionStorage.getItem(STORAGE_KEY_AUTH) || get().adminToken;
    if (!token) {
      set({ adminUser: null, adminToken: null });
      return false;
    }

    const verification = verifyMockJWT(token);
    if (!verification.valid || !verification.payload) {
      set({
        adminUser: null,
        adminToken: null,
        securityNotice:
          "Sesión cerrada: El token JWT ha expirado o la firma digital es inválida.",
      });
      sessionStorage.removeItem(STORAGE_KEY_AUTH);
      return false;
    }

    set({
      adminUser: {
        id: verification.payload.sub,
        email: verification.payload.email,
        role: verification.payload.role,
        token,
      },
      adminToken: token,
    });
    return true;
  },

  clearSecurityNotice: () => set({ securityNotice: null }),

  hydrateStore: () => {
    if (typeof window === "undefined") return;

    // 1. Hidratar Productos con verificación anti-tamper
    const rawProducts = localStorage.getItem(STORAGE_KEY_PRODUCTS);
    if (rawProducts) {
      const parsedProducts = deobfuscateData<Product[]>(rawProducts);
      if (
        parsedProducts &&
        Array.isArray(parsedProducts) &&
        parsedProducts.length > 0
      ) {
        const merged = parsedProducts.map((p) => {
          const initial = INITIAL_PRODUCTS.find((init) => init.id === p.id);
          return initial
            ? {
                ...initial,
                ...p,
                hasManual: initial.hasManual ?? p.hasManual ?? true,
                dosageRule: initial.dosageRule ?? p.dosageRule,
                technicalSheet: initial.technicalSheet ?? p.technicalSheet,
              }
            : p;
        });
        set({ products: merged });
      } else {
        set({
          products: INITIAL_PRODUCTS,
          securityNotice:
            "Alerta de Seguridad: Se detectó alteración no autorizada del catálogo local. Se ha restaurado la versión íntegra de fábrica.",
        });
        localStorage.setItem(
          STORAGE_KEY_PRODUCTS,
          obfuscateData(INITIAL_PRODUCTS)
        );
      }
    } else {
      localStorage.setItem(
        STORAGE_KEY_PRODUCTS,
        obfuscateData(INITIAL_PRODUCTS)
      );
    }

    // 2. Hidratar Carrito
    const rawCart = localStorage.getItem(STORAGE_KEY_CART);
    if (rawCart) {
      const parsedCart = deobfuscateData<CartItem[]>(rawCart);
      if (parsedCart) {
        set({ cart: parsedCart });
      }
    }

    // 3. Hidratar Configuración de Envíos (Costo Fijo + Costo por Km)
    const rawShipping = localStorage.getItem(STORAGE_KEY_SHIPPING);
    if (rawShipping) {
      const parsedShipping = deobfuscateData<ShippingConfig>(rawShipping);
      if (parsedShipping) {
        set({ shippingConfig: parsedShipping });
      }
    } else {
      localStorage.setItem(
        STORAGE_KEY_SHIPPING,
        obfuscateData(DEFAULT_SHIPPING_CONFIG)
      );
    }

    // 4. Hidratar Órdenes (Histórico + Kanban)
    const rawOrders = localStorage.getItem(STORAGE_KEY_ORDERS);
    if (rawOrders) {
      const parsedOrders = deobfuscateData<Order[]>(rawOrders);
      if (parsedOrders && Array.isArray(parsedOrders)) {
        set({ orders: parsedOrders });
      }
    } else {
      localStorage.setItem(STORAGE_KEY_ORDERS, obfuscateData(INITIAL_ORDERS));
    }

    // 5. Verificar sesión Admin
    get().verifyAdminSession();
  },
}));
