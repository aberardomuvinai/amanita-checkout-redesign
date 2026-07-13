import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { CheckoutExperience } from './CheckoutExperience';

// Maqueta de diseño del checkout — interna, sin links desde el sitio.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: 'Checkout Design — referencia interna',
};

// País del WhatsApp por IP REAL vía header de Vercel (x-vercel-ip-country) —
// server-side, sin APIs externas; mismo concepto que la geo por IP de EdgeOS
// (la que ya usan para rutear MP/Stripe). `?pais=XX` fuerza un país para
// demos. Si el header no está (dev local), CheckoutExperience cae a
// navigator.language y por último a AR.
export default async function CheckoutDesignPage({
  searchParams,
}: {
  searchParams: Promise<{ pais?: string }>;
}) {
  const [hdrs, params] = await Promise.all([headers(), searchParams]);
  const fromQuery = params.pais?.toUpperCase();
  const fromIp = hdrs.get('x-vercel-ip-country')?.toUpperCase() ?? null;
  const initialCountry = /^[A-Z]{2}$/.test(fromQuery ?? '') ? (fromQuery as string) : fromIp;
  return <CheckoutExperience initialCountry={initialCountry} />;
}
