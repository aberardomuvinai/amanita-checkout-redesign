import type { Metadata } from 'next';
import { CheckoutExperience } from './CheckoutExperience';
import { resolveInitialCountry, type CheckoutSearchParams } from './resolve-country';

// Maqueta de diseño del checkout — interna, sin links desde el sitio.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: 'Checkout Design — referencia interna',
};

// País del WhatsApp por IP real: resolver compartido con /v1 y /v2 (ronda 4)
// en resolve-country.ts. La raíz no fija `initialVariant`: muestra el default
// (v2, botones dorados); /checkout-design/v1|v2 fijan la variante inicial.
export default async function CheckoutDesignPage({
  searchParams,
}: {
  searchParams: Promise<CheckoutSearchParams>;
}) {
  const initialCountry = await resolveInitialCountry(searchParams);
  return <CheckoutExperience initialCountry={initialCountry} />;
}
