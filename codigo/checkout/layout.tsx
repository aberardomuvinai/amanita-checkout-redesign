import { sans, display, condensed } from '@/lib/fonts';
import '../globals.css';

// Referencia interna de diseño del checkout (plan
// docs/PLAN_CHECKOUT_REDESIGN.md): ruta SIN locale (castellano rioplatense),
// sin next-intl ni Supabase — mismo patrón que app/aplicar/layout.tsx.
// El noindex va en la metadata de la page.
export default function CheckoutDesignLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="es"
      className={`${sans.variable} ${display.variable} ${condensed.variable}`}
    >
      <body className="min-h-dvh bg-deep font-sans text-cream antialiased">
        {children}
      </body>
    </html>
  );
}
