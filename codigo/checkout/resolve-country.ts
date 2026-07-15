import { headers } from 'next/headers';

export type CheckoutSearchParams = { pais?: string };

/**
 * País del WhatsApp por IP REAL vía header de Vercel (x-vercel-ip-country) —
 * server-side, sin APIs externas; mismo concepto que la geo por IP de EdgeOS
 * (la que ya usan para rutear MP/Stripe). `?pais=XX` fuerza un país para
 * demos. Si el header no está (dev local), CheckoutExperience cae a
 * navigator.language y por último a AR.
 * Compartido por /checkout-design y sus rutas /v1 y /v2 (ronda 4).
 */
export async function resolveInitialCountry(
  searchParams: Promise<CheckoutSearchParams>,
): Promise<string | null> {
  const [hdrs, params] = await Promise.all([headers(), searchParams]);
  const fromQuery = params.pais?.toUpperCase();
  const fromIp = hdrs.get('x-vercel-ip-country')?.toUpperCase() ?? null;
  return /^[A-Z]{2}$/.test(fromQuery ?? '') ? (fromQuery as string) : fromIp;
}
