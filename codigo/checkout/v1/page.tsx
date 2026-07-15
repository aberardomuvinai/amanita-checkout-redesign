import type { Metadata } from 'next';
import { CheckoutExperience } from '../CheckoutExperience';
import { resolveInitialCountry, type CheckoutSearchParams } from '../resolve-country';

// Variante V1 de la maqueta (votación de botones, ronda 4): CTAs con el
// btn-ornate clásico de gemas (pre-ronda 3, commit 83eb67b). Misma
// experiencia y metadata noindex que la raíz; el toggle salta a V2 en vivo.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: 'Checkout Design — referencia interna',
};

export default async function CheckoutDesignV1Page({
  searchParams,
}: {
  searchParams: Promise<CheckoutSearchParams>;
}) {
  const initialCountry = await resolveInitialCountry(searchParams);
  return <CheckoutExperience initialCountry={initialCountry} initialVariant="v1" />;
}
