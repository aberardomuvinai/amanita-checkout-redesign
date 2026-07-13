# Rediseño del checkout de Amanita Festival — Paquete de handoff para EdgeOS

**De:** equipo Amanita Festival · **Para:** equipo EdgeOS (SimpleFi)
**Referencia viva:** https://amanita-web.vercel.app/checkout-design (agregar `?pais=XX` — ej. `?pais=BR` — para forzar el país del WhatsApp y demo de la geo por IP)

---

## 1 · Qué es esto

El rediseño completo del checkout de `entradas.amanitafestival.com` — **visual + cambios de flujo** — entregado como **maqueta React funcional** para portar a EdgeOS. Es el mismo formato de trabajo que ya usaron para construir el checkout actual (referencia de diseño React externa → port con agentes, workflow magipatterns): la maqueta se navega, se inspecciona y se porta.

- La maqueta es **Next.js 15 + React 19 + Tailwind** — paridad de stack con el frontend de EdgeOS.
- Es interactiva de verdad: carrito con cantidades, stepper de secciones, validación de datos, cupón, drawer de FAQs. **Cero pagos y cero APIs**: toda la data es local (`products.ts`) y el estado vive en el cliente.
- La anatomía de componentes es compatible con shadcn/Radix (Button/Card/Accordion/Input): el port es mecánico.
- Los productos de la maqueta son **los reales del backoffice de EdgeOS** (popup `amanita-festival-2026`), con sus IDs, precios y descripciones — el mapeo a su API es directo.

## 2 · Cómo portarlo (visión general)

**La maqueta es la spec.** Mismo markup, mismas clases, mismos estados y microcopy — no hace falta interpretar nada: lo que se ve en la URL de referencia es lo que tiene que quedar.

1. **Portar los componentes** de `codigo/checkout/` + `codigo/compartidos/` a su repo (ajustar los imports `@/...` a su convención).
2. **Sumar los tokens y utilities** de `codigo/estilos/design-tokens.css` a su CSS global, y el snippet de `theme.extend` (comentado al final de ese archivo) a su `tailwind.config`. Las fuentes van vía `next/font/google` (ya resuelto en `layout.tsx` + `fonts.ts`).
3. **Copiar `assets/brand/` a su `public/brand/`** (los paths `/brand/...` del código quedan funcionando tal cual).
4. **Reemplazar la data local (`products.ts`) por sus productos reales** del backoffice, mapeando categorías de producto → sección del stepper:
   - `ticket` → **Tickets**
   - `housing` → **Alojamiento**
   - `estacionamiento` + el futuro `transporte` → **Extras** (una sola sección multi-rubro; cada rubro con su heading interno vía el campo `category` — ver §5, cambio 2)
5. **Enchufar su lógica existente** (verificación por email, cupones, pago, geo) en los puntos indicados en §6.

## 3 · Estructura del paquete

| Archivo | Qué es | De dónde sale |
| --- | --- | --- |
| `README.md` | Este documento | — |
| `codigo/checkout/page.tsx` | Server component de la ruta: resuelve el **país por IP** (header `x-vercel-ip-country`) + override `?pais=XX` para demos; noindex | Repo Amanita, `app/checkout-design/` (intacto) |
| `codigo/checkout/layout.tsx` | Layout de la ruta: `<html>/<body>` + las tres fuentes vía `next/font` | Ídem |
| `codigo/checkout/products.ts` | **Catálogo local (mock de data)**: productos reales de EdgeOS con IDs/precios/descripciones + FAQs generales + `formatARS` | Ídem |
| `codigo/checkout/sections.tsx` | Todas las secciones: Hero, vista de catálogo (cards + steppers de cantidad), Tus Datos (con WhatsApp), drawer de FAQs, Confirmar (resumen + cupón) | Ídem |
| `codigo/checkout/CheckoutExperience.tsx` | Orquestador client: estado (carrito/comprador/cupón), stepper, nav de pills, barra inferior fija, fondo, estilos `.ck-*` (gemas, animaciones) | Ídem |
| `codigo/compartidos/` | `Stars.tsx`, `Ornaments.tsx`, `fonts.ts` — componentes/config del design system de Amanita que la maqueta importa (+ `ORIGEN.md` con el detalle) | Repo Amanita, `src/` (intactos) |
| `codigo/estilos/design-tokens.css` | Variables de color/radios + utilities usadas (`.section-dark`, `.dark-stars`, `.btn-ornate*`, `.no-scrollbar`, keyframes) + snippet de `tailwind.config`, todo comentado | Extracto de `app/globals.css` del repo Amanita |
| `assets/brand/` | Los 20 webp/svg que usa la maqueta (fondos, logos, gemas, botones, ornamentos), mismas rutas relativas que en `public/` | `public/brand/` del repo Amanita |

## 4 · Sistema de diseño

### Paleta (hex exactos)

| Token | Hex | Uso en el checkout |
| --- | --- | --- |
| `--color-cream` | `#F1EBE3` | Cards de producto/datos/resumen, texto sobre oscuro, gemas |
| `--color-primary` (petróleo) | `#004A5A` | Precios, labels de inputs, botones + / stepper de cantidad |
| `--color-deep` (navy) | `#042231` | Base oscura, overlays, texto sobre crema |
| `--color-night` | `#010F16` | Gradientes de fondo y de la nav |
| `--color-accent` (teal) | `#0A9B9B` | Focus rings, hovers interactivos |
| `--color-sand` (dorado arena) | `#C1AA88` | Kickers, pill activa, badge del carrito, estrellas doradas, bordes de cards |
| `--color-mint` | `#B0D5CE` | Hovers de pills, subtítulo del hero |
| `--color-deep-2` / surface crema | `#0D3042` / `#FAF6EF` | Apoyo oscuro / fondo de inputs sobre crema |

Todos los valores viven como CSS variables en `design-tokens.css`; el markup los consume vía utilities de Tailwind (`text-sand`, `bg-cream`…) — mapeo en el snippet de `theme.extend`.

### Tipografías (Google Fonts, incluidas vía `next/font` en `layout.tsx` + `fonts.ts`)

- **Amarante** (`--font-display`) — títulos/display, siempre uppercase. Un solo peso (400): nada de bold sintético, el énfasis lo dan tamaño y uppercase.
- **Oswald** (`--font-condensed`) — precios, labels, kickers, pills y botones (tracking amplio).
- **Quicksand** (`--font-sans`) — cuerpo.

### Fondo de toda la experiencia

Capa `fixed` full-screen (en `CheckoutExperience.tsx`): foto del bosque (`artist-hero-bg.webp`, con variante mobile vía `<picture>`) + gradiente navy vertical (`rgba(4,34,49,0.78)` → `rgba(1,15,22,0.93)`) + textura de estrellitas `.dark-stars` + capa `<Stars>` titilante. El wrapper raíz es `.section-dark` (invierte los tokens semánticos) con `background-color: transparent` inline para que se vea la foto.

### Cards crema

`bg-cream` + `rounded-2xl` (2rem) + borde `1px solid rgba(193,170,136,0.4)` (sand al 40%) + sombra `0 18px 48px rgba(1,15,22,0.5)` (constante `CREAM_CARD_STYLE` en `sections.tsx`). **Gotcha resuelto:** dentro de `.section-dark` los tokens semánticos quedan invertidos (claros), así que los textos secundarios y bordes DENTRO de las cards crema van con valores fijos del modo claro por style inline (`#4a6670`, `rgba(4,34,49,…)`) — ya está así en el código, no "simplificarlo".

### Botones ornamentales

`.btn-ornate` (primario) y `.btn-ornate-2` (secundario): arte webp de marco con gemas estirado 100%/100% sobre fondo navy redondeado. CSS incluido en `design-tokens.css` (§6), assets incluidos. En EdgeOS: aplicar la clase sobre su `<Button>` de shadcn (los `!important` pisan el bg de las variants sin tocar markup).

### ⚠️ Gotchas que YA resolvimos — respetarlos al portar

1. **Separadores de gemas (`sep-gem-*.webp`) SIN canal alpha** (RGB con fondo negro). La solución es **CSS mask con `mask-mode: luminance`** dentro de `@supports (mask-mode: luminance)`: el negro queda transparente garantizado y la gema pinta como forma sólida crema ("efecto png"). Si el browser no soporta `mask-mode`, la gema no se muestra (mejor sin gema que con placa negra). Código: estilos `.ck-gem*` en `CheckoutExperience.tsx`, uso en `SectionShell` (`sections.tsx`). **NO usar `mix-blend-screen`:** el stacking context de `<main>` aísla el blending del fondo con foto y deja la placa negra visible.
2. **NADA de emojis de bandera** en el select de país del WhatsApp: no renderizan en Chrome/Windows (caen a "AR"/"BR" en texto plano feo). El select muestra **texto "AR +54"** — así está en la maqueta y así debe quedar.
3. **Mobile 375px primero.** Cards de producto **verticales en mobile** (imagen 16:9 arriba) y **horizontales en desktop** (imagen a la izquierda, 40% del ancho, `object-cover` a alto completo). La nav de pills scrollea horizontal en mobile (`.no-scrollbar`) y el drawer de FAQs es full-screen en mobile / panel lateral de 480px en md+.

## 5 · Flujo y cambios vs checkout actual

La maqueta replica el flujo live 1:1 **salvo** estos 6 cambios (ronda 2 de iteración con Agus, 12/7 — ya implementados en la maqueta). La columna derecha dice qué implica cada uno para EdgeOS:

| Cambio | Qué implica para EdgeOS |
| --- | --- |
| **1 · Nuevo orden de pasos:** Tickets → Alojamiento → Extras → Tus Datos → Confirmar. "Tu información" pasa a llamarse **"Tus Datos"** y se mueve al final, justo antes de Confirmar (primero productos, después datos). | Solo front: reordenar/renombrar las secciones del stepper (la verificación por email viaja con la sección al final del flujo). Sin cambios de API ni de modelo. |
| **2 · "Estacionamiento" → "Extras"** (subtítulo "Estacionamiento y transporte"): una sola sección que agrupa varias categorías de productos, cada una con su heading interno. Hoy solo hay estacionamiento; transporte se suma ahí. | Mapeo de categorías de productos del backoffice → sección "Extras" (los productos de estacionamiento y los futuros de transporte cuelgan del mismo paso, agrupados por categoría). En la maqueta: campo `category` por producto en `products.ts`. |
| **3 · FAQs fuera del stepper:** dejan de ser un paso (el flujo Volver/Continuar las saltea); viven en un drawer/overlay modal global — pill "FAQs" al final de la nav, visualmente distinta del grupo de pasos — accesible desde cualquier paso sin perder el estado. A11y: Escape cierra, trampa de foco, body-lock, botón cerrar 44×44, full-screen en mobile. Las FAQs por paso (ej. acampe) quedan dentro de su sección. | Solo front. |
| **4 · Hero sin "Total":** la barra inferior del hero no muestra total (todavía no se mostraron productos); en su lugar, texto "Elegí tu entrada para comenzar" + CTA "Ver Entradas →" (va a Tickets). Sin botón Volver en el hero. | Solo front. |
| **5 · CTAs contextuales en la barra inferior** (total visible desde Tickets en adelante): Tickets → "Alojamiento →" · Alojamiento → "Extras →" · Extras → "Tus Datos →" · Tus Datos → "Confirmar →" · Confirmar → "Confirmar compra". "← Volver" en todos los pasos menos el hero. | Solo front. |
| **6 · Campo WhatsApp en Tus Datos:** select de código de país (texto plano "AR +54" — ⚠️ sin emojis de bandera, no renderizan en Chrome/Windows) + input numérico, con el país preseleccionado **por IP real**. | ⚠️ **El único cambio que requiere backend:** persistir el teléfono en su modelo (humans/attendees) y usar su geo por IP —la misma que ya usan para el routing MP/Stripe— para preseleccionar el país. La maqueta YA lo resuelve por IP real server-side vía el header `x-vercel-ip-country` de Vercel (`page.tsx` → prop `initialCountry`; `?pais=XX` fuerza país para demos; `navigator.language` solo como fallback de dev local). EdgeOS replica el concepto con su propia geo. |

Todo lo demás (secciones single-page con una visible a la vez, barra TOTAL fija abajo, verificación por email, selección de cantidades, cupón, confirmación) mantiene el comportamiento del checkout actual — con la piel nueva.

## 6 · Puntos de integración con EdgeOS

Qué es mock en la maqueta y con qué se reemplaza:

| Mock en la maqueta | Real en EdgeOS |
| --- | --- |
| Catálogo local `products.ts` (`CATALOG`, `VARIANTS_BY_ID`) — los `Variant.id` son los **IDs reales de productos** del popup `amanita-festival-2026` | Su API de products por popup. Mapear categorías → secciones como en §2 (paso 4); conservar el concepto `category` para los bloques internos de Extras |
| Validación de "Tus Datos" (`getInfoErrors` en `sections.tsx`: campos requeridos + formato, errores al querer continuar) | Su verificación por email real. La sección viaja al FINAL del flujo (cambio 1) — la verificación viaja con ella |
| Cupón `AMANITA10` (−10% hardcodeado en el front, solo UI) | Su sistema de cupones/discounts. La UI (input + Aplicar + desglose Subtotal/Cupón/Total) queda igual |
| "Confirmar compra" dispara un toast (`✨ Maqueta de diseño — acá iría el pago real`) | Su flujo de pago real MP/Stripe |
| País por IP: `x-vercel-ip-country` en `page.tsx` (+ `?pais=XX` demo, `navigator.language` fallback dev) | Su geo por IP (la del routing MP/Stripe) + persistir el teléfono (ver §5, cambio 6) |
| Idioma: la maqueta es **solo ES** (castellano rioplatense — estas strings son la versión ES final) | Mantener su i18n actual (selector de idioma arriba a la derecha). La versión EN sale de su sistema de traducciones |
| Tracking: la maqueta no trackea nada | El checkout actual ya tiene el **Pixel de Meta de Amanita instalado: conservarlo**, más los eventos del funnel según el doc **"Integración Amanita ↔ EdgeOS"** que ya les compartimos (ya está en manos de Tule) — ese doc es la spec de tracking; este paquete no la duplica |

## 7 · Checklist de QA — para dar por buena la implementación

Comparar SIEMPRE contra la referencia viva (https://amanita-web.vercel.app/checkout-design), en desktop y en mobile real (viewport 375px):

- [ ] **1 · Orden de pasos:** pills Inicio (honguito) → Tickets → Alojamiento → Extras → Tus Datos → Confirmar; la pill "FAQs" separada del grupo (separador vertical + borde punteado).
- [ ] **2 · Hero sin total:** barra inferior con "Elegí tu entrada para comenzar" + "Ver Entradas →" (lleva a Tickets); sin "← Volver" ni total en el hero.
- [ ] **3 · Barra inferior desde Tickets en adelante:** "← Volver" + TOTAL centrado (actualiza en vivo) + CTA contextual que nombra el paso siguiente; en Confirmar dice "Confirmar compra".
- [ ] **4 · Badge del carrito:** la pill Confirmar muestra la cantidad de items cuando hay productos elegidos.
- [ ] **5 · Drawer de FAQs — a11y completa:** abre desde cualquier paso sin perder el carrito; Escape cierra; al abrir el foco va al botón cerrar (44×44) y al cerrar vuelve al disparador; Tab queda atrapado dentro del panel; el body no scrollea de fondo; full-screen en mobile, panel lateral 480px en desktop.
- [ ] **6 · Cards de producto:** verticales (imagen 16:9 arriba) en mobile 375px; horizontales (imagen izquierda al 40%, alto completo) en desktop. "Ver más/Ver menos" expande la descripción.
- [ ] **7 · Gemas separadoras sin placa negra:** los separadores `sep-gem-*` se ven como forma crema limpia sobre el fondo con foto (mask luminance); en browsers sin soporte, no aparecen — nunca un rectángulo negro.
- [ ] **8 · Extras agrupada por categoría:** heading interno "Estacionamiento" con estrellitas doradas; al sumar productos de transporte, se agrupan igual por su categoría.
- [ ] **9 · Tus Datos al final + WhatsApp:** validación por campo al querer continuar (no avanza con errores); select de país como TEXTO "AR +54" (cero emojis de bandera, verificar en Chrome/Windows); país preseleccionado por IP — probar el equivalente a `?pais=BR` de la referencia.
- [ ] **10 · Cupón:** `AMANITA10` aplica −10% con desglose Subtotal / Cupón / Total y deshabilita el input; código inválido muestra el error sin romper el total.
- [ ] **11 · Estado vacío de Confirmar:** honguito + "Todavía no elegiste tus pases" + botón "Ver tickets" (`.btn-ornate-2`) que vuelve a Tickets.
- [ ] **12 · Typo "Vental General" corregido:** el producto de 7 días figura como "Vental General" en el backoffice de EdgeOS — corregirlo **en el backoffice** a "Venta General" (la maqueta ya lo muestra corregido; no parchearlo en código).

Extra deseable: con `prefers-reduced-motion` activo, todas las animaciones (secciones, drawer, estrellas) quedan quietas — la regla global está en `design-tokens.css`.

## 8 · Contacto

- **Agustín (Amanita Festival)** — dueño del proyecto y del OK final de diseño.
- Preguntas técnicas sobre la maqueta o este paquete: responder sobre este README (todo lo que no esté acá, está en los comentarios del código — los archivos van comentados justamente para el port).
