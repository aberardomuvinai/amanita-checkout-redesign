'use client';

/**
 * Secciones de la referencia de diseño del checkout (maqueta interactiva,
 * sin pagos ni APIs). Piel Amanita 2026: cards crema sobre fondo oscuro,
 * separadores de gemas, botones ornamentales (.btn-ornate*), estrella de
 * marca como bullet. Patrones copiados de la página canónica
 * app/[locale]/artistas/[slug]/page.tsx + skill amanita-design.
 *
 * GOTCHA del design system: dentro de .section-dark los tokens semánticos
 * (muted/line/surface) se invierten a claros — en las cards CREMA van valores
 * fijos del modo claro por style inline (desc #4a6670, bordes rgba(4,34,49,…)).
 *
 * Ronda 2 (Agus): "Tu información" pasa a ser "Tus Datos" (al final del
 * stepper, con campo WhatsApp); las FAQs generales salen del stepper al
 * FaqsDrawer global; Extras agrupa las cards por categoría.
 * Ronda 3 (Agus): botón de confirmar en DORADO — sólido sin marco (ck-gold-solid:
 * la imagen del frame ornamental se estira feo en botones full-width),
 * como los botones que cobran de la home) + línea "Cargos por servicio (10%)"
 * en el resumen (el TOTAL ya la incluye, igual que la barra).
 * Ronda 4: ConfirmSection recibe `variant` (votación V1/V2 del equipo) —
 * v1 = btn-ornate clásico con gemas (clases exactas del commit 83eb67b),
 * v2 = dorado ck-gold-solid. El toggle vive en CheckoutExperience.
 */

import { Fragment, useEffect, useRef, useState, type ReactNode } from 'react';
import { Divider, CornerFrame } from '@/components/ornaments/Ornaments';
import { FAQS, formatARS, type CatalogSection, type ProductGroup, type Variant } from './products';

export type BuyerInfo = {
  email: string;
  nombre: string;
  apellido: string;
  /** código ISO del país del WhatsApp (el select muestra "AR +54") */
  waCountry: string;
  waNumber: string;
};
export type InfoErrors = Partial<Record<keyof BuyerInfo, string>>;
export type CartLine = { id: string; label: string; qty: number; amount: number };
/** Variante de botones en votación (ronda 4): 'v1' ornate con gemas · 'v2' dorado */
export type ButtonVariant = 'v1' | 'v2';

/** Lista curada de países del select de WhatsApp. ⚠️ Se muestran como TEXTO
 *  "AR +54" — nada de emojis de bandera (no renderizan en Chrome/Windows,
 *  gotcha conocido del repo). En producción EdgeOS preselecciona por geo IP;
 *  la maqueta lo emula con navigator.language (ver CheckoutExperience). */
export const WA_COUNTRIES = [
  { code: 'AR', dial: '54' },
  { code: 'UY', dial: '598' },
  { code: 'CL', dial: '56' },
  { code: 'BR', dial: '55' },
  { code: 'PY', dial: '595' },
  { code: 'BO', dial: '591' },
  { code: 'PE', dial: '51' },
  { code: 'CO', dial: '57' },
  { code: 'MX', dial: '52' },
  { code: 'US', dial: '1' },
  { code: 'ES', dial: '34' },
  { code: 'DE', dial: '49' },
  { code: 'FR', dial: '33' },
  { code: 'GB', dial: '44' },
  { code: 'IT', dial: '39' },
  { code: 'IL', dial: '972' },
  { code: 'PT', dial: '351' },
  { code: 'NL', dial: '31' },
] as const;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\d{6,15}$/;

export function getInfoErrors(buyer: BuyerInfo): InfoErrors {
  const errors: InfoErrors = {};
  if (!buyer.email.trim()) errors.email = 'Completá tu email';
  else if (!EMAIL_RE.test(buyer.email.trim())) errors.email = 'Revisá el formato del email';
  if (!buyer.nombre.trim()) errors.nombre = 'Completá tu nombre';
  if (!buyer.apellido.trim()) errors.apellido = 'Completá tu apellido';
  if (!buyer.waNumber.trim()) errors.waNumber = 'Completá tu WhatsApp';
  else if (!PHONE_RE.test(buyer.waNumber.replace(/[\s.-]/g, '')))
    errors.waNumber = 'Revisá el número: solo dígitos';
  return errors;
}

/* ───────────────────────── piezas compartidas ───────────────────────── */

/** Estrella de marca en dorado: star.svg es petróleo → CSS mask + bg sand
 *  (mismo patrón que los labels de players del design system). */
export function GoldStar({ className = 'h-3.5 w-3.5' }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={`inline-block shrink-0 ${className}`}
      style={{
        backgroundColor: '#c1aa88',
        WebkitMaskImage: 'url(/brand/ornaments/star.svg)',
        maskImage: 'url(/brand/ornaments/star.svg)',
        WebkitMaskRepeat: 'no-repeat',
        maskRepeat: 'no-repeat',
        WebkitMaskSize: 'contain',
        maskSize: 'contain',
        WebkitMaskPosition: 'center',
        maskPosition: 'center',
      }}
    />
  );
}

type GemVariant = 'bold' | 'mid' | 'thin' | 'flourish';

/** Shell de sección del stepper: separador de gemas + kicker + título. */
export function SectionShell({
  gem,
  kicker,
  title,
  intro,
  children,
}: {
  gem: GemVariant;
  kicker: string;
  title: string;
  intro?: string;
  children: ReactNode;
}) {
  return (
    <section className="ck-section pt-2">
      {/* separador de gemas recoloreado por CSS mask (patrón star.svg/honguito
          del nav): sep-gem-*.webp es RGB con fondo negro, así que la máscara va
          en modo luminancia — el negro queda transparente garantizado y la gema
          es una forma sólida crema, "efecto png". mix-blend-screen acá NO
          sirve: el stacking context de <main> aísla el blending del fondo con
          foto y deja placa negra. Estilos .ck-gem en CheckoutExperience. */}
      <div
        aria-hidden
        className={`ck-gem ck-gem-${gem} pointer-events-none mx-auto w-[min(420px,80%)] bg-cream md:w-[380px]`}
      />
      <div className="mt-5 text-center">
        <p className="font-condensed text-xs font-medium uppercase tracking-[0.22em] text-sand md:text-sm">
          {kicker}
        </p>
        <h2
          className="mt-1.5 font-display uppercase leading-tight text-cream"
          style={{ fontSize: 'clamp(1.7rem,4.6vw,2.4rem)' }}
        >
          {title}
        </h2>
        {intro && (
          <p
            className="mx-auto mt-2.5 max-w-[46ch] text-sm leading-relaxed md:text-base"
            style={{ color: 'rgba(241,235,227,0.78)' }}
          >
            {intro}
          </p>
        )}
      </div>
      <div className="mt-8 flex flex-col gap-6 md:gap-5">{children}</div>
    </section>
  );
}

const CREAM_CARD_STYLE: React.CSSProperties = {
  border: '1px solid rgba(193,170,136,0.4)',
  boxShadow: '0 18px 48px rgba(1,15,22,0.5)',
};

/* ───────────────────────────── 1 · Hero ───────────────────────────── */

export function HeroSection() {
  const bullets = [
    '+200 artistas y facilitadores',
    '+10 escenarios',
    'Sé parte de una experiencia única',
    'Mercedes, Pcia. de Bs. As.',
  ];
  return (
    <section className="ck-section flex min-h-[calc(100dvh-230px)] flex-col items-center justify-center gap-5 py-6 text-center">
      {/* wordmark + banner de fechas (arte de marca: AMANITA FESTIVAL · 20–24 nov) */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/brand/logo-fecha.webp"
        alt="Amanita Festival — 20 al 24 de noviembre de 2026 · Mercedes, Bs. As., Argentina"
        width={550}
        height={251}
        className="w-[min(400px,84%)]"
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/brand/tercera-edicion.webp"
        alt="Tercera edición — El Portal"
        width={437}
        height={64}
        className="w-[min(240px,60%)]"
      />
      <h1
        className="max-w-[22ch] font-display uppercase leading-tight text-cream"
        style={{ fontSize: 'clamp(1.75rem,5.4vw,2.7rem)' }}
      >
        4 días de música, arte, yoga y talleres
      </h1>
      <Divider variant="cream" eager />
      <p className="max-w-[34ch] text-lg italic text-mint md:text-xl">
        Una celebración de amor, apertura y conexión
      </p>
      <span
        className="rounded-full border px-4 py-1.5 font-condensed text-xs font-medium uppercase tracking-[0.16em] text-sand md:text-sm"
        style={{ borderColor: 'rgba(193,170,136,0.55)', backgroundColor: 'rgba(193,170,136,0.12)' }}
      >
        Experiencia Extendida — 17, 18 y 19 de noviembre
      </span>
      <ul className="mt-1 flex flex-col items-start gap-2.5">
        {bullets.map((b) => (
          <li
            key={b}
            className="flex items-center gap-2.5 text-sm md:text-base"
            style={{ color: 'rgba(241,235,227,0.85)' }}
          >
            <GoldStar />
            {b}
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ──────────────── 5 · Tus Datos (ex "Tu información") ──────────────── */

function Field({
  id,
  label,
  type = 'text',
  autoComplete,
  placeholder,
  value,
  onChange,
  error,
}: {
  id: string;
  label: string;
  type?: string;
  autoComplete?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="font-condensed text-xs font-medium uppercase tracking-[0.16em] text-primary"
      >
        {label}
      </label>
      <input
        id={id}
        type={type}
        autoComplete={autoComplete}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={error ? true : undefined}
        className="mt-1.5 w-full rounded-xl border px-4 py-3 text-deep outline-none transition-shadow focus:ring-2 focus:ring-accent"
        style={{
          backgroundColor: '#faf6ef',
          borderColor: error ? '#b3271e' : 'rgba(4,34,49,0.18)',
        }}
      />
      {error && (
        <p className="mt-1.5 text-xs font-semibold" style={{ color: '#b3271e' }}>
          {error}
        </p>
      )}
    </div>
  );
}

export function InfoSection({
  buyer,
  onChange,
  errors,
}: {
  buyer: BuyerInfo;
  onChange: (field: keyof BuyerInfo, value: string) => void;
  errors: InfoErrors;
}) {
  return (
    /* último paso antes de Confirmar — "¡Estás a un paso!" ahora es literal */
    <SectionShell
      gem="flourish"
      kicker="Tus datos"
      title="¡Estás a un paso!"
      intro="Un par de datos para emitir tus entradas — después, solo queda confirmar."
    >
      <div className="rounded-2xl bg-cream p-6 text-left md:p-8" style={CREAM_CARD_STYLE}>
        <div className="flex items-start gap-2.5">
          {/* candadito de la línea de privacidad */}
          <svg
            aria-hidden
            viewBox="0 0 24 24"
            className="mt-0.5 h-4 w-4 shrink-0 text-primary"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="4" y="11" width="16" height="10" rx="2" />
            <path d="M8 11V7a4 4 0 0 1 8 0v4" />
          </svg>
          <p className="text-xs leading-relaxed" style={{ color: '#4a6670' }}>
            Tus datos viajan seguros: los usamos solo para emitir tus entradas y contactarte por
            tu compra.
          </p>
        </div>
        <div className="mt-6 flex flex-col gap-5">
          <Field
            id="ck-email"
            label="Email"
            type="email"
            autoComplete="email"
            placeholder="tu@email.com"
            value={buyer.email}
            onChange={(v) => onChange('email', v)}
            error={errors.email}
          />
          <div className="grid gap-5 md:grid-cols-2">
            <Field
              id="ck-nombre"
              label="Nombre"
              autoComplete="given-name"
              placeholder="Tu nombre"
              value={buyer.nombre}
              onChange={(v) => onChange('nombre', v)}
              error={errors.nombre}
            />
            <Field
              id="ck-apellido"
              label="Apellido"
              autoComplete="family-name"
              placeholder="Tu apellido"
              value={buyer.apellido}
              onChange={(v) => onChange('apellido', v)}
              error={errors.apellido}
            />
          </div>
          {/* WhatsApp: select de país como texto "AR +54" (⚠️ sin emojis de
              bandera — no renderizan en Chrome/Windows) + número. El país
              llega preseleccionado: navigator.language en la maqueta, geo IP
              en producción EdgeOS (ver plan, sección de handoff). */}
          <div>
            <label
              htmlFor="ck-whatsapp"
              className="font-condensed text-xs font-medium uppercase tracking-[0.16em] text-primary"
            >
              WhatsApp
            </label>
            <div className="mt-1.5 flex gap-2">
              <select
                aria-label="Código de país del WhatsApp"
                autoComplete="tel-country-code"
                value={buyer.waCountry}
                onChange={(e) => onChange('waCountry', e.target.value)}
                className="shrink-0 rounded-xl border px-3 py-3 text-sm font-medium text-deep outline-none transition-shadow focus:ring-2 focus:ring-accent"
                style={{ backgroundColor: '#faf6ef', borderColor: 'rgba(4,34,49,0.18)' }}
              >
                {WA_COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code} +{c.dial}
                  </option>
                ))}
              </select>
              <input
                id="ck-whatsapp"
                type="tel"
                inputMode="numeric"
                autoComplete="tel-national"
                placeholder="11 2345 6789"
                value={buyer.waNumber}
                onChange={(e) => onChange('waNumber', e.target.value)}
                aria-invalid={errors.waNumber ? true : undefined}
                className="w-full min-w-0 rounded-xl border px-4 py-3 text-deep outline-none transition-shadow focus:ring-2 focus:ring-accent"
                style={{
                  backgroundColor: '#faf6ef',
                  borderColor: errors.waNumber ? '#b3271e' : 'rgba(4,34,49,0.18)',
                }}
              />
            </div>
            {errors.waNumber && (
              <p className="mt-1.5 text-xs font-semibold" style={{ color: '#b3271e' }}>
                {errors.waNumber}
              </p>
            )}
          </div>
        </div>
      </div>
    </SectionShell>
  );
}

/* ─────────────── 2-4 · Tickets / Alojamiento / Extras ─────────────── */

function VariantRow({
  variant,
  qty,
  onInc,
  onDec,
}: {
  variant: Variant;
  qty: number;
  onInc: () => void;
  onDec: () => void;
}) {
  return (
    <div
      className="flex items-center justify-between gap-3 border-t py-3.5 md:py-3"
      style={{ borderColor: 'rgba(4,34,49,0.12)' }}
    >
      <div className="min-w-0">
        <p className="text-sm font-semibold leading-snug text-deep">{variant.label}</p>
        <p className="mt-0.5 font-condensed text-lg leading-none text-primary">
          {formatARS(variant.price)}
        </p>
      </div>
      {qty === 0 ? (
        <button
          type="button"
          aria-label={`Agregar ${variant.label}`}
          onClick={onInc}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-xl leading-none text-cream transition-colors hover:bg-deep"
        >
          +
        </button>
      ) : (
        <div
          className="flex shrink-0 items-center gap-0.5 rounded-full border p-1"
          style={{ borderColor: 'rgba(0,74,90,0.35)', backgroundColor: 'rgba(10,155,155,0.1)' }}
        >
          <button
            type="button"
            aria-label={`Quitar uno de ${variant.label}`}
            onClick={onDec}
            className="flex h-8 w-8 items-center justify-center rounded-full text-lg leading-none text-primary transition-colors hover:bg-primary hover:text-cream"
          >
            −
          </button>
          <span className="min-w-7 text-center font-condensed text-base font-medium text-deep">
            {qty}
          </span>
          <button
            type="button"
            aria-label={`Agregar uno más de ${variant.label}`}
            onClick={onInc}
            className="flex h-8 w-8 items-center justify-center rounded-full text-lg leading-none text-primary transition-colors hover:bg-primary hover:text-cream"
          >
            +
          </button>
        </div>
      )}
    </div>
  );
}

/* Cards de producto: en mobile quedan verticales (imagen 16:9 arriba, igual
   que la v1); en md+ pasan a horizontales compactas — imagen a la izquierda
   (40% del ancho, alto completo, object-cover) y contenido a la derecha.
   Apiladas en 1 columna: escala bien cuando se sumen productos (5-8 cards)
   y mantiene consistencia entre Tickets, Alojamiento y Extras. */
function ProductCard({
  group,
  cart,
  onInc,
  onDec,
}: {
  group: ProductGroup;
  cart: Record<string, number>;
  onInc: (id: string) => void;
  onDec: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  return (
    <article className="overflow-hidden rounded-2xl bg-cream text-left md:flex" style={CREAM_CARD_STYLE}>
      {group.image && (
        <div
          className="aspect-[16/9] overflow-hidden md:aspect-auto md:w-[40%] md:shrink-0"
          style={{ backgroundColor: '#0a1424' }}
        >
          {/* imagen real del backoffice de EdgeOS — <img> nativa en la maqueta
              (dominio externo sin tocar next.config) */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={group.image}
            alt={group.title}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        </div>
      )}
      <div className="p-5 md:min-w-0 md:flex-1">
        <h3 className="font-display text-xl uppercase leading-tight tracking-wide text-deep">
          {group.title}
        </h3>
        <p
          className={`mt-2 whitespace-pre-line text-sm leading-relaxed ${expanded ? '' : 'line-clamp-3 md:line-clamp-2'}`}
          style={{ color: '#4a6670' }}
        >
          {group.description}
        </p>
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          className="mt-2 font-condensed text-xs font-medium uppercase tracking-[0.14em] text-primary underline underline-offset-4 transition-colors hover:text-accent"
        >
          {expanded ? 'Ver menos' : 'Ver más'}
        </button>
        <div className="mt-4 md:mt-3">
          {group.variants.map((v) => (
            <VariantRow
              key={v.id}
              variant={v}
              qty={cart[v.id] ?? 0}
              onInc={() => onInc(v.id)}
              onDec={() => onDec(v.id)}
            />
          ))}
        </div>
      </div>
    </article>
  );
}

/** Agrupa cards contiguas por `category` (Extras: Estacionamiento /
 *  Transporte…). Secciones sin categorías quedan en un único bloque sin
 *  heading — Tickets y Alojamiento no cambian. */
function clusterByCategory(groups: ProductGroup[]) {
  const clusters: Array<{ category?: string; groups: ProductGroup[] }> = [];
  for (const group of groups) {
    const last = clusters[clusters.length - 1];
    if (last && last.category === group.category) last.groups.push(group);
    else clusters.push({ category: group.category, groups: [group] });
  }
  return clusters;
}

export function CatalogSectionView({
  section,
  gem,
  cart,
  onInc,
  onDec,
}: {
  section: CatalogSection;
  gem: GemVariant;
  cart: Record<string, number>;
  onInc: (id: string) => void;
  onDec: (id: string) => void;
}) {
  return (
    <SectionShell gem={gem} kicker={section.kicker} title={section.title} intro={section.intro}>
      {clusterByCategory(section.groups).map((cluster) => (
        <Fragment key={cluster.groups[0].id}>
          {cluster.category && (
            <div className="-mb-2 flex items-center justify-center gap-2.5">
              <GoldStar className="h-3 w-3" />
              <h3 className="font-display text-lg uppercase tracking-wide text-cream md:text-xl">
                {cluster.category}
              </h3>
              <GoldStar className="h-3 w-3" />
            </div>
          )}
          {cluster.groups.map((group) => (
            <ProductCard key={group.id} group={group} cart={cart} onInc={onInc} onDec={onDec} />
          ))}
        </Fragment>
      ))}
      {/* preguntas propias de la sección (ej. acampe) — mismo accordion que FAQs */}
      {section.faqs && (
        <div className="mt-2">
          <div className="flex items-center justify-center gap-2.5">
            <GoldStar className="h-3 w-3" />
            <h3 className="font-display text-lg uppercase tracking-wide text-cream md:text-xl">
              {section.faqs.title}
            </h3>
            <GoldStar className="h-3 w-3" />
          </div>
          <div className="mt-4">
            <FaqList items={section.faqs.items} />
          </div>
        </div>
      )}
      {section.footnotes && (
        <div className="mt-1 flex flex-col gap-1.5 text-center">
          {section.footnotes.map((f) => (
            <p key={f} className="text-xs leading-relaxed" style={{ color: 'rgba(241,235,227,0.66)' }}>
              * {f}
            </p>
          ))}
        </div>
      )}
    </SectionShell>
  );
}

/* ──────────────── FAQs · drawer global (fuera del stepper) ──────────────── */

/** Accordion de preguntas — compartido por las FAQs generales y las del acampe. */
function FaqList({ items }: { items: Array<{ q: string; a: string }> }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="flex flex-col gap-3">
      {items.map((faq, i) => {
        const isOpen = open === i;
        return (
          <div
            key={faq.q}
            className="rounded-2xl border border-white/10"
            style={{ backgroundColor: 'rgba(255,255,255,0.04)' }}
          >
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
            >
              <span className="flex items-center gap-3">
                <GoldStar className="h-3 w-3" />
                <span className="text-sm font-semibold text-cream md:text-base">{faq.q}</span>
              </span>
              <svg
                aria-hidden
                viewBox="0 0 24 24"
                className={`h-4 w-4 shrink-0 text-sand transition-transform ${isOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>
            {isOpen && (
              <p
                className="px-5 pb-5 pl-[3.15rem] text-left text-sm leading-relaxed"
                style={{ color: 'rgba(241,235,227,0.75)' }}
              >
                {faq.a}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

/** Ronda 2 (Agus): las FAQs generales salen del stepper — dejan de ser un
 *  paso y viven en este drawer modal, accesible desde la pill "FAQs" de la
 *  nav en CUALQUIER paso, sin perder el estado del carrito. Fondo navy,
 *  mismo accordion. A11y: role=dialog + trampa de foco + Escape + body-lock
 *  + cierre 44×44; al cerrar, el foco vuelve al disparador. Full-screen en
 *  mobile, panel lateral en md+. Las FAQs por paso (acampe) siguen en su
 *  sección. */
export function FaqsDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const panelRef = useRef<HTMLElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden'; // body-lock
    closeRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== 'Tab' || !panelRef.current) return;
      // trampa de foco: Tab circula solo dentro del panel
      const focusables = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        ),
      );
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (!first || !last) return;
      const current = document.activeElement;
      if (event.shiftKey) {
        if (current === first || !panelRef.current.contains(current)) {
          event.preventDefault();
          last.focus();
        }
      } else if (current === last || !panelRef.current.contains(current)) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = prevOverflow;
      previous?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60]">
      {/* backdrop: cierra al click — la vía accesible es el botón ✕ */}
      <div
        aria-hidden
        onClick={onClose}
        className="ck-drawer-backdrop absolute inset-0"
        style={{
          backgroundColor: 'rgba(1,15,22,0.65)',
          backdropFilter: 'blur(3px)',
          WebkitBackdropFilter: 'blur(3px)',
        }}
      />
      <aside
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="ck-faqs-drawer-title"
        className="ck-drawer-panel absolute inset-0 overflow-y-auto border-white/10 md:inset-y-0 md:left-auto md:right-0 md:w-[480px] md:border-l"
        style={{
          backgroundColor: 'rgba(2,19,29,0.97)',
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          boxShadow: '-18px 0 48px rgba(1,15,22,0.55)',
        }}
      >
        <div aria-hidden className="dark-stars pointer-events-none absolute inset-0" />
        <div
          className="relative z-[1] px-5 pt-5 md:px-8"
          style={{ paddingBottom: 'max(2.5rem, env(safe-area-inset-bottom))' }}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="pt-1.5">
              <p className="font-condensed text-xs font-medium uppercase tracking-[0.22em] text-sand">
                Dudas frecuentes
              </p>
              <h2
                id="ck-faqs-drawer-title"
                className="mt-1 font-display text-2xl uppercase leading-tight text-cream"
              >
                FAQs
              </h2>
            </div>
            {/* cierre 44×44 (h-11/w-11) */}
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              aria-label="Cerrar las preguntas frecuentes"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/20 text-cream transition-colors hover:border-mint hover:text-mint"
            >
              <svg
                aria-hidden
                viewBox="0 0 24 24"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              >
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>
          <p className="mt-2 max-w-[42ch] text-sm leading-relaxed" style={{ color: 'rgba(241,235,227,0.72)' }}>
            Lo que más nos preguntan antes de sacar la entrada. Cerrá y seguís justo donde
            estabas.
          </p>
          <div className="mt-6">
            <FaqList items={FAQS} />
          </div>
        </div>
      </aside>
    </div>
  );
}

/* ────────────────────────── 6 · Confirmar ────────────────────────── */

/* Botón "Confirmar compra" por variante (ronda 4 — votación del equipo):
   · v1: clases EXACTAS pre-ronda 3 (commit 83eb67b) — btn-ornate full-width
     CON su marco de gemas (justamente lo que se evalúa en V1).
   · v2 (ronda 3): dorado sólido ck-gold-solid (el frame webp se estira feo
     en full-width) — ring-offset crema porque vive sobre la card clara. */
const CONFIRM_BTN_CLASSES: Record<ButtonVariant, string> = {
  v1: 'btn-ornate mt-6 flex w-full items-center justify-center !px-6 !py-3.5 font-condensed text-sm font-medium uppercase tracking-[0.12em]',
  v2: 'ck-gold-solid mt-6 flex w-full items-center justify-center px-6 py-3.5 font-condensed text-sm font-medium uppercase tracking-[0.12em] transition-all duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-cream',
};

export function ConfirmSection({
  variant,
  lines,
  subtotal,
  discount,
  serviceFee,
  total,
  couponApplied,
  onApplyCoupon,
  buyer,
  onConfirm,
  onGoTickets,
}: {
  /** estilo de los CTAs en votación: 'v1' ornate con gemas · 'v2' dorado */
  variant: ButtonVariant;
  lines: CartLine[];
  subtotal: number;
  discount: number;
  /** cargos por servicio (10% del neto post-cupón) — ya incluidos en total */
  serviceFee: number;
  total: number;
  couponApplied: boolean;
  onApplyCoupon: (code: string) => boolean;
  buyer: BuyerInfo;
  onConfirm: () => void;
  onGoTickets: () => void;
}) {
  const [couponInput, setCouponInput] = useState('');
  const [couponMsg, setCouponMsg] = useState<'ok' | 'bad' | null>(null);
  const hasBuyer = buyer.nombre.trim() && buyer.apellido.trim() && buyer.email.trim();

  if (lines.length === 0) {
    return (
      <SectionShell gem="bold" kicker="Último paso" title="Confirmar">
        <div className="flex flex-col items-center gap-5 py-10 text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/logo-hongo.webp" alt="" aria-hidden className="h-16 w-auto opacity-60" />
          <p className="font-display text-xl uppercase tracking-wide text-cream">
            Todavía no elegiste tus pases
          </p>
          <p className="max-w-[38ch] text-sm" style={{ color: 'rgba(241,235,227,0.72)' }}>
            Volvé a la sección de tickets y elegí cómo querés vivir Amanita.
          </p>
          {/* sobre fondo con foto va el marco simple (regla del design system) */}
          <button
            type="button"
            onClick={onGoTickets}
            className="btn-ornate-2 mt-2 inline-flex items-center justify-center !px-8 py-3 font-condensed text-sm font-medium uppercase tracking-[0.12em]"
          >
            Ver tickets
          </button>
        </div>
      </SectionShell>
    );
  }

  return (
    <SectionShell
      gem="bold"
      kicker="Último paso"
      title="Confirmar"
      intro="Revisá tu compra antes de pasar al pago."
    >
      <CornerFrame>
        <div className="rounded-2xl bg-cream p-6 text-left md:p-8" style={CREAM_CARD_STYLE}>
          <h3 className="font-display text-xl uppercase tracking-wide text-deep">Tu compra</h3>
          <div className="mt-4">
            {lines.map((line) => (
              <div
                key={line.id}
                className="flex items-start justify-between gap-4 border-t py-3"
                style={{ borderColor: 'rgba(4,34,49,0.12)' }}
              >
                <p className="text-sm leading-snug text-deep">
                  <span className="font-condensed text-base font-medium text-primary">{line.qty}×</span>{' '}
                  {line.label}
                </p>
                <p className="shrink-0 font-condensed text-base text-deep">{formatARS(line.amount)}</p>
              </div>
            ))}
          </div>

          {/* cupón (mock de UI: AMANITA10 aplica 10%) */}
          <div className="mt-5">
            <label
              htmlFor="ck-cupon"
              className="font-condensed text-xs font-medium uppercase tracking-[0.16em] text-primary"
            >
              ¿Tenés un cupón?
            </label>
            <div className="mt-1.5 flex gap-2">
              <input
                id="ck-cupon"
                type="text"
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value)}
                placeholder="Tu código"
                disabled={couponApplied}
                className="w-full min-w-0 rounded-xl border px-4 py-2.5 text-sm uppercase text-deep outline-none transition-shadow focus:ring-2 focus:ring-accent disabled:opacity-60"
                style={{ backgroundColor: '#faf6ef', borderColor: 'rgba(4,34,49,0.18)' }}
              />
              <button
                type="button"
                disabled={couponApplied}
                onClick={() => setCouponMsg(onApplyCoupon(couponInput) ? 'ok' : 'bad')}
                className="shrink-0 rounded-full bg-primary px-5 py-2.5 font-condensed text-xs font-medium uppercase tracking-[0.12em] text-cream transition-colors hover:bg-deep disabled:opacity-60"
              >
                Aplicar
              </button>
            </div>
            {couponMsg === 'ok' && couponApplied && (
              <p className="mt-1.5 text-xs font-semibold text-primary">
                ✨ Cupón AMANITA10 aplicado: 10% de descuento
              </p>
            )}
            {couponMsg === 'bad' && !couponApplied && (
              <p className="mt-1.5 text-xs font-semibold" style={{ color: '#b3271e' }}>
                Ese cupón no existe. Probá AMANITA10.
              </p>
            )}
          </div>

          {/* totales (ronda 3): Subtotal → cupón (si aplica) → Cargos por
              servicio (10% del neto, mismo estilo que Subtotal) → TOTAL que
              YA incluye el fee — idéntico al de la barra, sin sorpresas */}
          <div className="mt-5 border-t pt-4" style={{ borderColor: 'rgba(4,34,49,0.12)' }}>
            <div className="flex items-center justify-between text-sm" style={{ color: '#4a6670' }}>
              <p>Subtotal</p>
              <p className="font-condensed text-base">{formatARS(subtotal)}</p>
            </div>
            {discount > 0 && (
              <div className="mt-1 flex items-center justify-between text-sm text-primary">
                <p>Cupón AMANITA10 (−10%)</p>
                <p className="font-condensed text-base">−{formatARS(discount)}</p>
              </div>
            )}
            <div className="mt-1 flex items-center justify-between text-sm" style={{ color: '#4a6670' }}>
              <p>Cargos por servicio (10%)</p>
              <p className="font-condensed text-base">{formatARS(serviceFee)}</p>
            </div>
            <div className="mt-2 flex items-end justify-between">
              <p className="font-condensed text-sm font-medium uppercase tracking-[0.2em] text-primary">
                Total
              </p>
              <p className="font-condensed text-3xl leading-none text-deep">{formatARS(total)}</p>
            </div>
          </div>

          {/* mismo estilo que el CTA de la barra, según la variante en
              votación (clases en CONFIRM_BTN_CLASSES, ronda 4) */}
          <button
            type="button"
            onClick={onConfirm}
            className={CONFIRM_BTN_CLASSES[variant]}
          >
            Confirmar compra →
          </button>
          {hasBuyer ? (
            <p className="mt-3 text-center text-xs" style={{ color: '#4a6670' }}>
              A nombre de {buyer.nombre} {buyer.apellido} · {buyer.email}
            </p>
          ) : null}
        </div>
      </CornerFrame>
    </SectionShell>
  );
}
