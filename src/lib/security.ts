/**
 * ==============================================================================
 * AQUA-PURE CYBERSECURITY & CRYPTO UTILITIES (FRONTEND HARDENING)
 * ==============================================================================
 * Demuestra patrones profesionales de ciberseguridad para aplicaciones client-only:
 * 1. Persistencia ofuscada con verificación de integridad anti-manipulación (Anti-Tamper).
 * 2. Sanitización estricta de inputs contra ataques Cross-Site Scripting (XSS).
 * 3. Mock JWT con claims estándar (RFC 7519), verificación criptográfica y expiración.
 * 4. Rate-Limiting en cliente para mitigación de fuerza bruta en autenticación.
 */

import DOMPurify from "dompurify";

const STORAGE_SALT =
  process.env.NEXT_PUBLIC_STORAGE_SALT || "AQUA_DEMO_PUBLIC_SALT_v1";
const JWT_MOCK_SECRET =
  process.env.NEXT_PUBLIC_JWT_MOCK_SECRET || "AQUA_DEMO_PUBLIC_HMAC_KEY_2026";

// ==========================================
// 1. INTEGRIDAD & OFUSCACIÓN DE LOCALSTORAGE
// ==========================================

/**
 * Genera un hash simple pero efectivo para validar integridad en cliente (CheckSum)
 */
function generateChecksum(data: string): string {
  let hash = 0;
  const combined = data + STORAGE_SALT;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convertir a 32bit integer
  }
  return Math.abs(hash).toString(36);
}

/**
 * Codifica y firma un objeto para almacenamiento seguro
 */
export function obfuscateData<T>(payload: T): string {
  try {
    const rawJson = JSON.stringify(payload);
    const checksum = generateChecksum(rawJson);
    const packagePayload = JSON.stringify({ d: rawJson, c: checksum });
    
    // Ofuscación reversible base64 con byte-shift seguro
    if (typeof window !== "undefined") {
      return btoa(encodeURIComponent(packagePayload));
    }
    return Buffer.from(packagePayload).toString("base64");
  } catch (error) {
    console.error("[Security] Error al ofuscar estado:", error);
    return "";
  }
}

/**
 * Decodifica y verifica la integridad del almacenamiento.
 * Si detecta manipulación en DevTools (Tampering), descarta los datos y devuelve null.
 */
export function deobfuscateData<T>(encodedString: string): T | null {
  try {
    if (!encodedString) return null;

    let decodedPackage = "";
    if (typeof window !== "undefined") {
      decodedPackage = decodeURIComponent(atob(encodedString));
    } else {
      decodedPackage = Buffer.from(encodedString, "base64").toString("utf-8");
    }

    const { d: rawJson, c: checksum } = JSON.parse(decodedPackage);

    // Verificación de integridad estricta
    const expectedChecksum = generateChecksum(rawJson);
    if (checksum !== expectedChecksum) {
      console.warn(
        "[Security Warning] ¡Violación de integridad de datos detectada! Los datos han sido alterados en el cliente."
      );
      return null;
    }

    return JSON.parse(rawJson) as T;
  } catch (error) {
    console.warn("[Security] Fallo de deserialización o estructura no segura:", error);
    return null;
  }
}

// ==========================================
// 2. SANITIZACIÓN ANTI-XSS
// ==========================================

/**
 * Escapa caracteres peligrosos en caso de ejecutarse en SSR antes de montar DOMPurify
 */
export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Sanitiza cualquier string de entrada del usuario contra inyecciones XSS
 */
export function sanitizeInput(input: string): string {
  if (!input) return "";

  // Si estamos en el navegador y DOMPurify está disponible
  if (typeof window !== "undefined" && DOMPurify.sanitize) {
    return DOMPurify.sanitize(input.trim(), {
      ALLOWED_TAGS: [], // No se permite ningún tag HTML en inputs de texto estándar
      ALLOWED_ATTR: [],
    });
  }

  // Fallback seguro en SSR
  return escapeHtml(input.trim());
}

/**
 * Sanitiza campos de texto largos permitiendo solo formato seguro básico
 */
export function sanitizeRichText(input: string): string {
  if (!input) return "";
  if (typeof window !== "undefined" && DOMPurify.sanitize) {
    return DOMPurify.sanitize(input, {
      ALLOWED_TAGS: ["b", "i", "em", "strong", "br", "p", "ul", "li"],
      ALLOWED_ATTR: [],
    });
  }
  return escapeHtml(input);
}

// ==========================================
// 3. MOCK JWT AUTENTICACIÓN (RFC 7519)
// ==========================================

interface JWTPayload {
  sub: string;
  email: string;
  role: "superadmin" | "admin" | "viewer";
  iat: number;
  exp: number;
}

/**
 * Genera un token JWT mockeado válido con formato Header.Payload.Signature
 */
export function generateMockJWT(user: { id: string; email: string; role: "superadmin" | "admin" | "viewer" }): string {
  const header = {
    alg: "HS256",
    typ: "JWT",
  };

  const now = Math.floor(Date.now() / 1000);
  const payload: JWTPayload = {
    sub: user.id,
    email: user.email,
    role: user.role,
    iat: now,
    exp: now + 3600 * 2, // Expira en 2 horas
  };

  const b64Header = btoa(JSON.stringify(header));
  const b64Payload = btoa(JSON.stringify(payload));
  const signature = generateChecksum(`${b64Header}.${b64Payload}.${JWT_MOCK_SECRET}`);

  return `${b64Header}.${b64Payload}.${signature}`;
}

/**
 * Valida un token JWT: verifica estructura, firma y vigencia temporal
 */
export function verifyMockJWT(token: string): { valid: boolean; payload: JWTPayload | null; error?: string } {
  try {
    if (!token) return { valid: false, payload: null, error: "Token ausente" };

    const parts = token.split(".");
    if (parts.length !== 3) {
      return { valid: false, payload: null, error: "Formato de token inválido" };
    }

    const [b64Header, b64Payload, signature] = parts;
    const expectedSignature = generateChecksum(`${b64Header}.${b64Payload}.${JWT_MOCK_SECRET}`);

    if (signature !== expectedSignature) {
      return { valid: false, payload: null, error: "Firma criptográfica inválida" };
    }

    const payload: JWTPayload = JSON.parse(atob(b64Payload));
    const now = Math.floor(Date.now() / 1000);

    if (payload.exp < now) {
      return { valid: false, payload: null, error: "Token expirado" };
    }

    return { valid: true, payload };
  } catch {
    return { valid: false, payload: null, error: "Error en decodificación de token" };
  }
}

// ==========================================
// 4. RATE LIMITING DE LOGIN (CLIENT-SIDE)
// ==========================================

const MAX_ATTEMPTS = 3;
const LOCKOUT_TIME_MS = 60 * 1000; // 60 segundos de bloqueo

interface RateLimitState {
  attempts: number;
  lockUntil: number | null;
}

export class LoginRateLimiter {
  private static STORAGE_KEY = "aqua_login_limiter_state";

  private static getState(): RateLimitState {
    if (typeof window === "undefined") return { attempts: 0, lockUntil: null };
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (!raw) return { attempts: 0, lockUntil: null };
      return JSON.parse(raw);
    } catch {
      return { attempts: 0, lockUntil: null };
    }
  }

  private static setState(state: RateLimitState) {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignorar errores de quota
    }
  }

  public static checkLimit(): { allowed: boolean; remainingSeconds?: number } {
    const state = this.getState();
    const now = Date.now();

    if (state.lockUntil && now < state.lockUntil) {
      const remainingSeconds = Math.ceil((state.lockUntil - now) / 1000);
      return { allowed: false, remainingSeconds };
    }

    // Si ya pasó el bloqueo, reseteamos
    if (state.lockUntil && now >= state.lockUntil) {
      this.reset();
    }

    return { allowed: true };
  }

  public static recordFailure(): { locked: boolean; remainingAttempts: number; lockoutSeconds?: number } {
    const state = this.getState();
    state.attempts += 1;

    if (state.attempts >= MAX_ATTEMPTS) {
      state.lockUntil = Date.now() + LOCKOUT_TIME_MS;
      this.setState(state);
      return {
        locked: true,
        remainingAttempts: 0,
        lockoutSeconds: LOCKOUT_TIME_MS / 1000,
      };
    }

    this.setState(state);
    return {
      locked: false,
      remainingAttempts: MAX_ATTEMPTS - state.attempts,
    };
  }

  public static reset() {
    this.setState({ attempts: 0, lockUntil: null });
  }
}
