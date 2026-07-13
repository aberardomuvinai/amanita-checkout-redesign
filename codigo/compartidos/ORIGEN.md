# Origen de estos archivos

Componentes y config compartidos del repo de la web de Amanita que la maqueta del checkout importa. Van **intactos**, tal como corren en producción (`amanita-web.vercel.app`):

| Archivo | Ruta original en el repo de Amanita | Quién lo importa / para qué |
| --- | --- | --- |
| `Stars.tsx` | `src/components/ornaments/Stars.tsx` | `CheckoutExperience.tsx` (`@/components/ornaments/Stars`) — capa de estrellas titilantes del fondo. Necesita el keyframe `amTwinkle` (está en `../estilos/design-tokens.css`). |
| `Ornaments.tsx` | `src/components/ornaments/Ornaments.tsx` | `sections.tsx` (`@/components/ornaments/Ornaments`) — la maqueta usa `Divider` (variante `cream`, en el hero) y `CornerFrame` (marco del resumen de compra en Confirmar). El archivo exporta más piezas (`FlourishTitle`, `StarList`, `Star`); van incluidas para que el archivo quede intacto, y sus assets también (`assets/brand/ornaments/`). |
| `fonts.ts` | `src/lib/fonts.ts` | `layout.tsx` (`@/lib/fonts`) — las tres Google Fonts vía `next/font/google` (cero FOUT/CLS): Amarante (`--font-display`), Oswald (`--font-condensed`), Quicksand (`--font-sans`). |

Al portar: ubicarlos donde su convención de imports lo pida (`@/components/...`, `@/lib/...`) o ajustar los imports de la maqueta. Los paths de assets (`/brand/...`) asumen los archivos de `assets/brand/` servidos desde la raíz pública (en Next: `public/brand/...`).
