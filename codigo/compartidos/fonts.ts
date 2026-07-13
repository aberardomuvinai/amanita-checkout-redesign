import { Amarante, Oswald, Quicksand } from 'next/font/google';

/**
 * Tipografías REALES de la marca (BRAND_TOKENS.md, extraídas del Webflow vivo):
 * - Amarante: serif ornamental art-nouveau, LA fuente identitaria. Un solo
 *   peso (400); se usa para display/H1-H2, siempre en uppercase.
 * - Oswald: condensada para subtítulos, labels y botones.
 * - Quicksand: cuerpo — redondeada y cálida, matchea el tono cercano de la marca.
 * Todas vía next/font (sin FOUT/CLS).
 */
export const display = Amarante({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

export const condensed = Oswald({
  subsets: ['latin'],
  variable: '--font-condensed',
  display: 'swap',
});

export const sans = Quicksand({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});
