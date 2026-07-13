import type { ReactNode } from 'react';

/**
 * Sistema ornamental (docs/SISTEMA_ORNAMENTAL.md): los separadores, estrellas,
 * flourishes y marcos que construyen el look Amanita del sitio viejo.
 * Reglas: decorativos (alt="" aria-hidden), lazy salvo above-the-fold,
 * "enmarca, no compite" — ante la duda, menos.
 */

const O = '/brand/ornaments';

type DividerVariant = 'gold' | 'cream' | 'small';

const DIVIDER_SRC: Record<DividerVariant, string> = {
  gold: `${O}/divider-1.webp`,        // sand/dorado — secciones crema
  cream: `${O}/divider-1-dark.webp`,  // crema — secciones navy
  small: `${O}/divider-2.webp`,       // compacto petróleo
};

export function Divider({
  variant = 'gold',
  eager = false,
  className = '',
}: {
  variant?: DividerVariant;
  /** true solo si está above-the-fold */
  eager?: boolean;
  className?: string;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={DIVIDER_SRC[variant]}
      alt=""
      aria-hidden="true"
      loading={eager ? 'eager' : 'lazy'}
      className={`mx-auto block w-full opacity-90 ${
        variant === 'small' ? 'max-w-[160px] md:max-w-[200px]' : 'max-w-[240px] md:max-w-[360px]'
      } ${className}`}
    />
  );
}

/** H2 con flourishes a los costados (ocultos en mobile). */
export function FlourishTitle({
  children,
  className = '',
  dark = false,
}: {
  children: ReactNode;
  className?: string;
  dark?: boolean;
}) {
  return (
    <div className="flex items-center justify-start gap-4 sm:gap-5">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`${O}/flourish-left.svg`}
        alt=""
        aria-hidden="true"
        loading="lazy"
        className={`hidden h-6 w-auto sm:block ${dark ? 'opacity-70 invert' : 'opacity-80'}`}
      />
      <h2 className={`font-display text-3xl uppercase tracking-wide ${className}`}>
        {children}
      </h2>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`${O}/flourish-right.svg`}
        alt=""
        aria-hidden="true"
        loading="lazy"
        className={`hidden h-6 w-auto sm:block ${dark ? 'opacity-70 invert' : 'opacity-80'}`}
      />
    </div>
  );
}

/** Lista con la estrella Amanita como bullet (patrón del sitio viejo). */
export function StarList({
  items,
  className = '',
}: {
  items: ReactNode[];
  className?: string;
}) {
  return (
    <ul className={`flex flex-col gap-2.5 ${className}`}>
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`${O}/star.svg`}
            alt=""
            aria-hidden="true"
            loading="lazy"
            className="mt-1 h-4 w-4 shrink-0"
          />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

/** Marco con esquinas art-nouveau (bloques destacados: tickets, manifiesto). */
export function CornerFrame({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`relative ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`${O}/corner-bl.webp`}
        alt=""
        aria-hidden="true"
        loading="lazy"
        className="pointer-events-none absolute -bottom-1 -left-1 w-20 opacity-80 md:w-28"
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`${O}/corner-tr.webp`}
        alt=""
        aria-hidden="true"
        loading="lazy"
        className="pointer-events-none absolute -right-1 -top-1 w-20 opacity-80 md:w-28"
      />
      {children}
    </div>
  );
}

/** Estrella suelta (icono junto a categorías/preguntas). */
export function Star({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={`${O}/star.svg`} alt="" aria-hidden="true" loading="lazy" className={className} />
  );
}
