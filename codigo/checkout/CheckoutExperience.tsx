'use client';

/**
 * Maqueta interactiva del checkout (referencia de diseño, plan
 * docs/PLAN_CHECKOUT_REDESIGN.md): réplica del flujo live de
 * entradas.amanitafestival.com — stepper de UNA sección visible a la vez,
 * nav superior de pills, barra TOTAL fija abajo — con la piel Amanita 2026.
 * Todo el estado vive acá (useState/useReducer); cero pagos, cero APIs.
 * Ronda 1 de fine-tuning (Agus): sin Aftermovie ni Galería.
 * Ronda 2 (Agus): productos primero y "Tus Datos" al final (previo a
 * Confirmar); "Estacionamiento" pasa a "Extras"; FAQs fuera del stepper, en
 * un drawer global (pill en la nav); hero sin total y CTAs contextuales.
 */

import { useCallback, useEffect, useMemo, useReducer, useState } from 'react';
import { Stars } from '@/components/ornaments/Stars';
import { CATALOG, VARIANTS_BY_ID, formatARS } from './products';
import {
  CatalogSectionView,
  ConfirmSection,
  FaqsDrawer,
  getInfoErrors,
  HeroSection,
  InfoSection,
  WA_COUNTRIES,
  type BuyerInfo,
  type CartLine,
} from './sections';

/* Las FAQs generales NO son un paso: viven en el FaqsDrawer, accesible desde
   la pill "FAQs" al final de la nav en cualquier momento del proceso. */
const SECTIONS = [
  { id: 'hero', label: 'Inicio' },
  { id: 'tickets', label: 'Tickets' },
  { id: 'alojamiento', label: 'Alojamiento' },
  { id: 'extras', label: 'Extras' },
  { id: 'datos', label: 'Tus Datos' },
  { id: 'confirmar', label: 'Confirmar' },
] as const;

const LAST = SECTIONS.length - 1;
const STEP_TICKETS = SECTIONS.findIndex((s) => s.id === 'tickets');
const STEP_DATOS = SECTIONS.findIndex((s) => s.id === 'datos');

type CartState = Record<string, number>;
type CartAction = { type: 'inc'; id: string } | { type: 'dec'; id: string };

function cartReducer(state: CartState, action: CartAction): CartState {
  const current = state[action.id] ?? 0;
  if (action.type === 'inc') return { ...state, [action.id]: current + 1 };
  if (current <= 1) {
    const next = { ...state };
    delete next[action.id];
    return next;
  }
  return { ...state, [action.id]: current - 1 };
}

export function CheckoutExperience({ initialCountry = null }: { initialCountry?: string | null }) {
  /* Pais por IP real (header x-vercel-ip-country, resuelto en page.tsx) --
     validado contra la lista; llega igual en SSR y cliente -> sin mismatch. */
  const ipCountry =
    initialCountry && WA_COUNTRIES.some((c) => c.code === initialCountry) ? initialCountry : null;

  const [active, setActive] = useState(0);
  const [cart, dispatch] = useReducer(cartReducer, {});
  const [buyer, setBuyer] = useState<BuyerInfo>({
    email: '',
    nombre: '',
    apellido: '',
    waCountry: ipCountry ?? 'AR',
    waNumber: '',
  });
  const [showInfoErrors, setShowInfoErrors] = useState(false);
  const [couponApplied, setCouponApplied] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [faqsOpen, setFaqsOpen] = useState(false);
  const closeFaqs = useCallback(() => setFaqsOpen(false), []);

  /* País del WhatsApp auto-seleccionado SIN llamadas de red (regla de la
     maqueta): se deriva de navigator.language (es-AR → AR), fallback AR. En
     useEffect para no romper la hidratación (el SSR arranca siempre en AR).
     En producción EdgeOS lo resuelve su geo por IP (ver plan, handoff). */
  useEffect(() => {
    if (ipCountry) return;
    const region = (navigator.language ?? '')
      .split(/[-_]/)
      .slice(1)
      .find((part) => part.length === 2)
      ?.toUpperCase();
    if (region && WA_COUNTRIES.some((c) => c.code === region)) {
      setBuyer((prev) => ({ ...prev, waCountry: region }));
    }
  }, [ipCountry]);

  /* ── derivados del carrito ── */
  const lines = useMemo<CartLine[]>(() => {
    const result: CartLine[] = [];
    for (const [id, qty] of Object.entries(cart)) {
      const found = VARIANTS_BY_ID[id];
      if (!found || qty <= 0) continue;
      const label =
        found.group.variants.length > 1
          ? `${found.group.title} · ${found.variant.label}`
          : found.group.title;
      result.push({ id, label, qty, amount: qty * found.variant.price });
    }
    return result;
  }, [cart]);

  const subtotal = useMemo(() => lines.reduce((acc, l) => acc + l.amount, 0), [lines]);
  const cartCount = useMemo(() => lines.reduce((acc, l) => acc + l.qty, 0), [lines]);
  const discount = couponApplied ? Math.round(subtotal * 0.1) : 0;
  const total = subtotal - discount;

  const infoErrors = getInfoErrors(buyer);
  const infoValid = Object.keys(infoErrors).length === 0;

  /* ── navegación del stepper ── */
  function goTo(index: number) {
    setActive(Math.min(Math.max(index, 0), LAST));
  }

  function confirmPurchase() {
    setToast(
      cartCount === 0
        ? 'Elegí tus pases antes de confirmar 🍄'
        : '✨ Maqueta de diseño — acá iría el pago real',
    );
  }

  function next() {
    // validación mock de "Tus Datos": marca los errores y no avanza
    if (active === STEP_DATOS && !infoValid) {
      setShowInfoErrors(true);
      return;
    }
    if (active === LAST) {
      confirmPurchase();
      return;
    }
    goTo(active + 1);
  }

  /* al cambiar de sección: arriba de todo + pill activa a la vista */
  useEffect(() => {
    window.scrollTo(0, 0);
    document
      .getElementById(`ck-pill-${active}`)
      ?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }, [active]);

  /* toast efímero */
  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 4000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  /* CTA contextual de la barra: cada paso nombra al siguiente; en Confirmar,
     el mock de compra. El hero tiene su propia barra (sin total ni Volver). */
  const nextLabel = active === LAST ? 'Confirmar compra' : SECTIONS[active + 1].label;
  const current = SECTIONS[active].id;
  const errorsToShow = showInfoErrors ? infoErrors : {};

  return (
    /* .section-dark invierte los tokens semánticos; el fondo lo pone la capa
       fija con foto de marca + overlay navy (inline transparent pisa el bg). */
    <div className="section-dark relative min-h-dvh" style={{ backgroundColor: 'transparent' }}>
      {/* ── fondo full-screen: arte del bosque + overlay navy + estrellas ── */}
      <div aria-hidden className="fixed inset-0 z-0">
        <picture>
          <source media="(max-width: 767px)" srcSet="/brand/artist-hero-bg-mobile.webp" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/artist-hero-bg.webp"
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
        </picture>
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(4,34,49,0.78) 0%, rgba(3,25,37,0.86) 45%, rgba(1,15,22,0.93) 100%)',
          }}
        />
        {/* textura de estrellitas de marca sobre el velo */}
        <div className="dark-stars absolute inset-0" />
        <Stars dim />
      </div>

      {/* ── nav superior fija: pills de secciones (scrolleable en mobile) ── */}
      <header
        className="fixed inset-x-0 top-0 z-40"
        style={{
          background:
            'linear-gradient(180deg, rgba(1,15,22,0.92) 0%, rgba(1,15,22,0.72) 72%, rgba(1,15,22,0) 100%)',
        }}
      >
        <nav
          aria-label="Secciones del checkout"
          className="no-scrollbar mx-auto flex max-w-[980px] items-center gap-1.5 overflow-x-auto px-3 py-3 md:justify-center"
        >
          {SECTIONS.map((section, i) => {
            const isActive = i === active;
            return (
              <button
                key={section.id}
                id={`ck-pill-${i}`}
                type="button"
                onClick={() => goTo(i)}
                aria-current={isActive ? 'step' : undefined}
                className={`flex shrink-0 items-center whitespace-nowrap rounded-full border px-3.5 py-1.5 font-condensed text-xs font-medium uppercase tracking-[0.08em] transition-colors ${
                  isActive ? 'text-sand' : 'border-white/20 hover:border-mint hover:text-mint'
                }`}
                style={
                  isActive
                    ? { backgroundColor: '#0a1424', borderColor: 'rgba(193,170,136,0.7)' }
                    : { color: 'rgba(241,235,227,0.78)' }
                }
              >
                {i === 0 ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/brand/logo-hongo.webp" alt="" aria-hidden className="h-4 w-auto" />
                    <span className="sr-only">Inicio</span>
                  </>
                ) : (
                  section.label
                )}
                {section.id === 'confirmar' && cartCount > 0 && (
                  <span className="ml-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-sand px-1 font-condensed text-[0.6rem] font-semibold text-deep">
                    {cartCount}
                  </span>
                )}
              </button>
            );
          })}
          {/* FAQs fuera del stepper: pill ghost (borde punteado) separada del
              grupo de pasos — abre el drawer desde cualquier paso */}
          <span aria-hidden className="mx-1 h-4 w-px shrink-0 bg-white/25" />
          <button
            type="button"
            onClick={() => setFaqsOpen(true)}
            aria-haspopup="dialog"
            aria-expanded={faqsOpen}
            className="shrink-0 whitespace-nowrap rounded-full border border-dashed bg-transparent px-3.5 py-1.5 font-condensed text-xs font-medium uppercase tracking-[0.08em] transition-colors hover:border-mint hover:text-mint"
            style={{ borderColor: 'rgba(241,235,227,0.4)', color: 'rgba(241,235,227,0.85)' }}
          >
            FAQs
          </button>
        </nav>
      </header>

      {/* ── contenido: una sección visible a la vez (como el checkout live) ── */}
      <main className="relative z-[1] mx-auto w-full max-w-[760px] px-4 pb-48 pt-20 md:pt-24">
        {current === 'hero' && <HeroSection />}
        {current === 'tickets' && (
          <CatalogSectionView
            section={CATALOG[0]}
            gem="bold"
            cart={cart}
            onInc={(id) => dispatch({ type: 'inc', id })}
            onDec={(id) => dispatch({ type: 'dec', id })}
          />
        )}
        {current === 'alojamiento' && (
          <CatalogSectionView
            section={CATALOG[1]}
            gem="mid"
            cart={cart}
            onInc={(id) => dispatch({ type: 'inc', id })}
            onDec={(id) => dispatch({ type: 'dec', id })}
          />
        )}
        {current === 'extras' && (
          <CatalogSectionView
            section={CATALOG[2]}
            gem="thin"
            cart={cart}
            onInc={(id) => dispatch({ type: 'inc', id })}
            onDec={(id) => dispatch({ type: 'dec', id })}
          />
        )}
        {current === 'datos' && (
          <InfoSection
            buyer={buyer}
            onChange={(field, value) => setBuyer((prev) => ({ ...prev, [field]: value }))}
            errors={errorsToShow}
          />
        )}
        {current === 'confirmar' && (
          <ConfirmSection
            lines={lines}
            subtotal={subtotal}
            discount={discount}
            total={total}
            couponApplied={couponApplied}
            onApplyCoupon={(code) => {
              const ok = code.trim().toUpperCase() === 'AMANITA10';
              if (ok) setCouponApplied(true);
              return ok;
            }}
            buyer={buyer}
            onConfirm={confirmPurchase}
            onGoTickets={() => goTo(STEP_TICKETS)}
          />
        )}
      </main>

      {/* ── toast (maqueta: acá iría el pago real) ── */}
      {toast && (
        <div className="pointer-events-none fixed inset-x-0 bottom-[104px] z-50 flex justify-center px-4">
          <p
            role="status"
            className="ck-section rounded-2xl border px-5 py-3 text-center text-sm font-semibold text-cream"
            style={{
              backgroundColor: 'rgba(4,20,33,0.95)',
              borderColor: 'rgba(193,170,136,0.5)',
              boxShadow: '0 14px 40px rgba(1,15,22,0.65)',
            }}
          >
            {toast}
          </p>
        </div>
      )}

      {/* ── FAQs: drawer global, se abre desde la nav sin perder el estado ── */}
      <FaqsDrawer open={faqsOpen} onClose={closeFaqs} />

      {/* ── barra fija inferior: en el hero todavía no se mostraron productos,
          así que va invitación + "Ver Entradas" (sin total ni Volver); del
          paso Tickets en adelante, Volver + TOTAL + CTA contextual. ── */}
      <div
        className="pointer-events-none fixed inset-x-0 bottom-0 z-40 px-3"
        style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
      >
        <div
          className="pointer-events-auto mx-auto flex max-w-[760px] items-center justify-between gap-3 rounded-2xl border border-white/10 px-4 py-3 md:px-6"
          style={{
            backgroundColor: 'rgba(3,22,33,0.93)',
            boxShadow: '0 18px 48px rgba(1,15,22,0.65)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
          }}
        >
          {current === 'hero' ? (
            <>
              <p
                className="min-w-0 text-sm leading-snug md:text-base"
                style={{ color: 'rgba(241,235,227,0.85)' }}
              >
                Elegí tu entrada para comenzar
              </p>
              <button
                type="button"
                onClick={() => goTo(STEP_TICKETS)}
                className="btn-ornate flex shrink-0 items-center justify-center whitespace-nowrap !px-4 py-2.5 font-condensed text-xs font-medium uppercase tracking-[0.1em] md:!px-6 md:text-sm"
              >
                Ver Entradas →
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => goTo(active - 1)}
                className="shrink-0 font-condensed text-xs font-medium uppercase tracking-[0.12em] transition-colors hover:text-cream"
                style={{ color: 'rgba(241,235,227,0.7)' }}
              >
                ← Volver
              </button>
              <div className="min-w-0 text-center">
                <p className="font-condensed text-[0.6rem] font-medium uppercase tracking-[0.24em] text-sand">
                  Total
                </p>
                <p className="font-condensed text-lg leading-tight text-cream md:text-xl">
                  {formatARS(total)}
                </p>
              </div>
              <button
                type="button"
                onClick={next}
                className="btn-ornate flex shrink-0 items-center justify-center whitespace-nowrap !px-4 py-2.5 font-condensed text-xs font-medium uppercase tracking-[0.1em] md:!px-6 md:text-sm"
              >
                {nextLabel} →
              </button>
            </>
          )}
        </div>
      </div>

      {/* entrada suave de cada sección (reduced-motion la frena vía globals) +
          separadores de gemas por CSS mask: los sep-gem-*.webp son RGB con
          fondo negro, la máscara va en modo LUMINANCIA (negro → transparente
          garantizado, la gema pinta con el bg crema del div — "efecto png").
          Si el browser no soporta mask-mode, mejor sin gema que con placa. */}
      <style>{`
        @keyframes ckSectionIn { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
        .ck-section { animation: ckSectionIn 0.45s ease both; }
        @keyframes ckFadeIn { from { opacity: 0; } to { opacity: 1; } }
        .ck-drawer-backdrop { animation: ckFadeIn 0.25s ease both; }
        @keyframes ckDrawerIn { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: none; } }
        .ck-drawer-panel { animation: ckDrawerIn 0.32s ease both; }
        .ck-gem { display: none; }
        @supports (mask-mode: luminance) {
          .ck-gem {
            display: block;
            mask-repeat: no-repeat;
            mask-position: center;
            mask-size: contain;
            mask-mode: luminance;
          }
        }
        .ck-gem-bold { aspect-ratio: 1400/169; mask-image: url(/brand/sep-gem-bold.webp); }
        .ck-gem-mid { aspect-ratio: 1400/122; mask-image: url(/brand/sep-gem-mid.webp); }
        .ck-gem-thin { aspect-ratio: 1400/169; mask-image: url(/brand/sep-gem-thin.webp); }
        .ck-gem-flourish { aspect-ratio: 1400/123; mask-image: url(/brand/sep-gem-flourish.webp); }
      `}</style>
    </div>
  );
}
