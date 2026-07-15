import type { Metadata } from 'next';
import { CheckoutExperience } from '../CheckoutExperience';
import { resolveInitialCountry, type CheckoutSearchParams } from '../resolve-country';

// Variante V2 de la maqueta (votación de botones, ronda 4): CTAs dorados de
// la ronda 3 — el default actual, acá con URL propia para compartir. Misma
// experiencia y metadata noindex que la raíz; el toggle salta a V1 en vivo.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: 'Checkout Design — referencia interna',
};

export default async function CheckoutDesignV2Page({
  searchParams,
}: {
  searchParams: Promise<CheckoutSearchParams>;
}) {
  const initialCountry = await resolveInitialCountry(searchParams);
  return <CheckoutExperience initialCountry={initialCountry} initialVariant="v2" />;
}
