# 🌊 Aqua-Pure Pools — E-Commerce Arquitectura Frontend & Ciberseguridad

Un prototipo de **e-commerce de alta gama para productos y equipamiento de piscinas**, diseñado como proyecto de exhibición profesional para portfolio. Implementa estándares estrictos de arquitectura moderna, diseño UI/UX minimalista y **endurecimiento de ciberseguridad en el cliente (Zero-Backend Architecture)**.

---

## 💎 1. Diseño UI/UX y Sistema Visual

* **Estilo Visual:** Minimalismo refinado con uso extensivo de espacio negativo (*negative space*), bordes sutiles, microinteracciones fluidas y tipografía moderna orientada a la legibilidad.
* **Paleta de Colores Estratégica:**
  * **Blanco Absoluto (`#FFFFFF` / `slate-50`):** Base predominante de fondos para transmitir pureza química y agua cristalina.
  * **Verde / Turquesa (`#0d9488` / `#059669`):** Botones de llamada a la acción principal (CTA), notificaciones de éxito y precios destacados.
  * **Azul Celeste (`#38bdf8` / `sky-400`):** Iconografía técnica, elementos secundarios, bordes sutiles y estados *hover*.
* **Animaciones (Framer Motion):**
  * *Fade-ins* suaves al hacer scroll con detección de visibilidad.
  * Tarjetas de producto flotantes con elevación reactiva (`y: -6px`), sombra dinámica y escala suave.
  * *Drawer* lateral del carrito con transición tipo resorte (*spring physics*).

---

## 🛡️ 2. Altísimos Estándares de Ciberseguridad Frontend

A pesar de no depender de una base de datos real en el servidor, este proyecto demuestra cómo implementar defensas avanzadas en el cliente:

1. **Persistencia Ofuscada Anti-Tamper (`src/lib/security.ts`):**
   * El estado del catálogo, carrito y órdenes se serializa con un *salt* rotativo y un algoritmo de suma de comprobación criptográfica (*checksum hash*).
   * **Detección de Manipulación:** Si un usuario altera los precios, stock o propiedades desde las *DevTools* de Chrome, el sistema detecta la alteración al deserializar, descarta la carga corrupta y restaura el catálogo íntegro de fábrica alertando en la interfaz.
2. **Sanitización de Entradas contra Inyecciones XSS:**
   * Todos los campos de formulario (búsqueda en tiempo real, checkout y formulario de productos) pasan por sanitización estricta con **DOMPurify** y codificación de entidades HTML.
3. **Validación de Esquemas Rigurosa con Zod (`src/lib/validations.ts`):**
   * Validación estricta y tipado de datos de checkout, login y CRUD de productos (formatos de teléfono, código postal, email y longitud de cadenas).
4. **Mock JWT con Claims RFC 7519 & Protected Routes:**
   * Formato `Header.Payload.Signature` con expiración temporal (2 horas) y firma de verificación HMAC mockeada.
   * La ruta `/admin` verifica la firma y vigencia antes de conceder acceso al dashboard.
5. **Mitigación de Fuerza Bruta (Rate Limiting en Cliente):**
   * Tras 3 intentos fallidos consecutivos en el login de administrador, el sistema bloquea el acceso durante 60 segundos con un temporizador reactivo.
6. **Hardened HTTP Headers (`next.config.mjs`):**
   * Configuración de cabeceras de seguridad para producción: `Content-Security-Policy`, `Strict-Transport-Security`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Permissions-Policy`.

---

## ⚙️ 3. Lógica de Negocio y Funcionalidades Avanzadas

* **Carrito Lateral & Checkout Simplificado por Mapa:**
  * Datos de pedido ágiles y enfocados en conversión: **Nombre y Apellido**, **Número de Teléfono** y **Dirección Opcional**.
  * **Selector Dual de Entrega:**
    1. **Retiro Físico en Local (¡GRATIS! - $0):** Informa la dirección de la sucursal sin cargos adicionales.
    2. **Envío a Domicilio con Mapa Interactivo y GPS:** El cliente marca su ubicación en el mapa interactivo (o usa su GPS actual). El sistema calcula la distancia en kilómetros (`km`), aplica la fórmula tarifaria establecida por el Administrador ($\text{Costo Fijo} + \text{Km} \times \text{Costo por Km}$) y genera automáticamente un **link oficial de Google Maps (`https://www.google.com/maps?q=lat,lng`)** que llega directamente al WhatsApp.
* **Manual de Uso en PDF y Envío Directo por WhatsApp:**
  * Cada producto del catálogo (en su tarjeta, modal de detalle, calculadora de piscinas y tabla de administrador) cuenta con dos opciones de asistencia técnica:
    * **Descargar Manual PDF:** Generado en cliente con `jsPDF`.
    * **Mandar Manual al WhatsApp:** Compila la ficha técnica completa, dosificación, rango de pH, paso a paso y precauciones de seguridad para enviarla por WhatsApp en 1 clic.
* **Tablero Kanban de Pedidos, Histórico Eliminable & Doble Caja Financiera (`/admin`):**
  * **Tablero Kanban Interactivo (3 Columnas):** *Pendientes de Pago*, *Confirmados (Pago Verificado)* y *Cancelados*.
  * **Doble Caja en Tiempo Real:**
    * 🟢 **Caja Real:** Dinero efectivamente cobrado de pedidos confirmados en el Kanban.
    * 🟡 **Caja Estimativa:** Dinero en pedidos pendientes de cobro y proyección total de caja.
  * **Listado Histórico de Pedidos:** Buscador avanzado, filtro por estados, ajuste de kilómetros en vivo con recálculo automático, apertura del link de Google Maps del cliente y **eliminación de pedidos** con confirmación de seguridad.
* **Panel de Estadísticas Completo y Ganancias Históricas:**
  * Gráfico comparativo de ganancias históricas de los últimos 6 meses (Caja Real vs Estimativa), ticket promedio, tasa de conversión de pagos, recaudación por categoría química, ranking de productos estrella y métricas logísticas.
* **Parametrización de Envíos desde el Administrador:**
  * Interfaz exclusiva para que el Admin establezca el **Costo Fijo Base ($)** y el **Costo por Kilómetro ($/km)** con simulador de distancias integrado.

---

## 🚀 4. Puesta en Marcha Local

### Prerrequisitos
* Node.js v18+ (recomendado Node 20 o 22)
* npm o pnpm

### Instalación y Ejecución
```bash
# 1. Instalar dependencias
npm install

# 2. (Opcional) Configurar variables de entorno privadas sin subirlas a Git
cp .env.example .env.local

# 3. Iniciar servidor de desarrollo
npm run dev

# 4. Compilar para producción
npm run build
npm run start
```
Abrir `http://localhost:3000` en el navegador.

---

## 🔑 Credenciales para la Demo de Portfolio

Para ingresar al Panel de Control de Administrador:
* **Ruta:** `/admin/login` (o desde el enlace "Acceso Admin" en la barra de navegación)
* **Correo:** `admin@aquapure.com`
* **Contraseña:** `AquaSecure2026!`
*(La pantalla de inicio de sesión incluye un botón de **Autocompletar Credenciales en 1 Clic** para facilitar la evaluación rápida de evaluadores y reclutadores).*
