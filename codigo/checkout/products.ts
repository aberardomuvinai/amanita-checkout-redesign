/**
 * Catálogo LOCAL de la referencia de diseño del checkout (sin fetch, sin
 * Supabase): productos reales del backoffice de EdgeOS (popup
 * amanita-festival-2026), tomados de docs/checkout-redesign-productos-edgeos.jsonl
 * — solo los activos (deleted_at: null). Los precios son en pesos argentinos.
 *
 * Nota: el producto de 7 días figura como "Vental General" en el backoffice
 * (typo de EdgeOS — se corrige allá, no acá); en la maqueta se muestra
 * "Venta General" (plan docs/PLAN_CHECKOUT_REDESIGN.md).
 *
 * Ronda 2 (Agus): la sección "Estacionamiento" pasa a ser "Extras"
 * (estacionamiento + transporte bajo el mismo paso). Cada ProductGroup puede
 * llevar `category` para titular bloques dentro de una sección multi-rubro —
 * las próximas categorías (ej. Transporte) se suman como grupos con su
 * `category`, sin tocar el view.
 */

export type Variant = {
  /** id real del producto en EdgeOS */
  id: string;
  label: string;
  price: number;
};

export type ProductGroup = {
  id: string;
  title: string;
  description: string;
  image: string | null;
  variants: Variant[];
  /** categoría dentro de una sección multi-rubro (Extras: 'Estacionamiento',
   *  'Transporte'…) — el view agrupa las cards contiguas y titula cada bloque */
  category?: string;
};

export type CatalogSectionId = 'tickets' | 'alojamiento' | 'extras';

export type CatalogSection = {
  id: CatalogSectionId;
  kicker: string;
  title: string;
  intro: string;
  groups: ProductGroup[];
  /** fine print debajo de las cards (ej. condiciones de estacionamiento) */
  footnotes?: string[];
  /** preguntas propias de la sección: accordion al final (ej. acampe) */
  faqs?: { title: string; items: Array<{ q: string; a: string }> };
};

const CDN = 'https://cdn.edgeos.world/superadmin/images';

const DESC_TICKET_4 = `La entrada te brinda acceso a todas las actividades, talleres y shows durante los cuatro días del festival.

Podés participar de:
Amanita Festival: 20 al 24 de noviembre, 2026.

Incluye:
⛺ Días repletos de actividades en comunidad
🎵 DJs y bandas en vivo
🎨 Arte inmersivo
🧘 Yoga, meditación, clases de baile y movimiento
🎭 Talleres interactivos, charlas y paneles

Podés ingresar a partir del jueves 19 de noviembre a las 18 hs.

*El espacio de acampe, las comidas y el estacionamiento no están incluidos.
⚠️ No hay devoluciones (sin excepción).
⚠️ Tickets transferibles hasta el 30 de octubre de 2026 (sin excepción).`;

const DESC_TICKET_7 = `La entrada te brinda acceso a todas las actividades, talleres y shows durante los siete días del festival.

Podés participar de:
Experiencia Extendida: 17, 18 y 19 de noviembre, 2026.
Amanita Festival: 20 al 24 de noviembre, 2026.

Incluye:
⛺ Días repletos de actividades en comunidad
🎵 DJs y bandas en vivo
🎨 Arte inmersivo
🧘 Yoga, meditación, clases de baile y movimiento
🎭 Talleres interactivos, charlas y paneles

*El espacio de acampe, las comidas y el estacionamiento no están incluidos.
⚠️ No hay devoluciones (sin excepción).
⚠️ Tickets transferibles hasta el 30 de octubre de 2026 (sin excepción).`;

const DESC_NINOS = `La entrada para niños es hasta los 12 años. Es necesario que traigan su documento de identidad y que entren al evento acompañados por sus responsables. A partir de los 13 años, deberán pagar una entrada normal.

Importante:
Todo menor de 18 años debe estar acompañado por un adulto responsable en todo momento, sin excepción.

Incluye:
⛺ 4 días repletos de actividades en comunidad
🎵 DJs y bandas en vivo
🎨 Arte inmersivo
🧘 Yoga, meditación, clases de baile y movimiento
🎭 Talleres interactivos, charlas y paneles

*El espacio de acampe, las comidas y el estacionamiento no están incluidos.`;

const DESC_ACAMPE = `Espacio para acampar con tu propia carpa dentro de las parcelas delimitadas. El valor es para todos los días, ya sea de 4 o 7 días de acampe (no es valor por día). Acceso a los servicios del sector camping.

El derecho a acampe es por carpa, no por persona.
⚠️ No hay electricidad en la zona de acampe.
⚠️ Está prohibido hacer fuego.`;

const DESC_CARPA = `Hacemos que la experiencia de acampe sea más fácil y cómoda.

Cuando llegues, te va a estar esperando tu carpa armada para 2 personas, lista en el lugar. Adentro vas a encontrar un colchón inflable nuevo en su caja, con el inflador. (Sí, vas a tener que inflar tu colchón. ¡Tampoco podemos hacerlo tan fácil! 🤭)

Traé tus sábanas, tu almohada y tu peluche preferido 🧸`;

const DESC_MOTORHOME = `Reservá un espacio para venir con motorhome 🚙

No se brinda servicio de agua, electricidad ni descarga de aguas grises.
Consultar medidas máximas, por favor.
Prohibido hacer fuego.`;

const DESC_PARKING_PERMANENTE = `Este ticket de estacionamiento es válido por la estadía completa, con un único ingreso y egreso.

Importante: el estacionamiento es exclusivamente para dejar tu vehículo. Te recomendamos llevar todo lo que necesites al área de camping para reducir la circulación en el área de estacionamiento.

El estacionamiento se encuentra a 400 m de la entrada del festival, aproximadamente.`;

const DESC_PARKING_ENTRADA_SALIDA = `Este ticket de estacionamiento te permite entrar y salir con tu auto a lo largo del festival.

Importante: el estacionamiento es exclusivamente para dejar tu vehículo. No está permitido dormir ni dejar pertenencias que necesites durante el festival dentro del auto. Te recomendamos llevar todo lo que necesites al área del festival para reducir la circulación en el área de estacionamiento.

El estacionamiento está a unos 400 metros de la entrada del festival.`;

export const CATALOG: CatalogSection[] = [
  {
    id: 'tickets',
    kicker: 'Elegí tu pase',
    title: 'Tickets',
    intro: 'Tu entrada a los 4 días del festival — o a la semana completa con la Experiencia Extendida.',
    groups: [
      {
        id: 'ticket-4-dias',
        title: 'Ticket 4 Días',
        description: DESC_TICKET_4,
        image: `${CDN}/3f312bb4-a299-4ad1-9765-17db762a2a63.png`,
        variants: [
          { id: 'ea7a7ee4-9415-47e5-8a0b-cdc8102b26d9', label: 'Venta General', price: 249000 },
        ],
      },
      {
        id: 'ticket-7-dias',
        title: 'Ticket 7 Días — Experiencia Extendida',
        description: DESC_TICKET_7,
        image: `${CDN}/aeec92b7-3b1d-47cb-b083-feaf75fbfd5a.png`,
        variants: [
          { id: 'b6127405-d7b3-4ffb-9d3f-0ca6c91f8e6b', label: 'Venta General', price: 289000 },
        ],
      },
      {
        id: 'entrada-ninos',
        title: 'Entrada Niños',
        description: DESC_NINOS,
        image: `${CDN}/9013bcef-7b00-4609-994f-c48e9892ffca.png`,
        variants: [
          { id: 'c9820c42-a93b-4366-8c7e-360088b20fa3', label: '0 a 6 años', price: 10000 },
          { id: '068953b9-91f8-4962-b89c-3fbcc469ad73', label: '7 a 12 años', price: 80000 },
        ],
      },
    ],
  },
  {
    id: 'alojamiento',
    kicker: 'Dormí en el predio',
    title: 'Alojamiento',
    intro: 'Acampá con tu propia carpa o llegá y encontrá todo listo.',
    groups: [
      {
        id: 'derecho-acampe',
        title: 'Derecho a Acampe',
        description: DESC_ACAMPE,
        image: `${CDN}/055f9dd6-dc24-40c7-942c-75bac4f478b7.jpg`,
        variants: [
          { id: '60d022df-2b70-4df4-9ad3-400406d9b80c', label: 'Derecho a Acampe', price: 45000 },
        ],
      },
      {
        id: 'carpa-pre-armada',
        title: 'Alquiler Carpa Pre Armada — 2 personas',
        description: DESC_CARPA,
        image: `${CDN}/f407e3d0-dcde-4e71-9a58-0082169aba02.png`,
        variants: [
          { id: '1c28d1a4-cb5a-4fef-960d-6bb5979dfcf1', label: 'Carpa + Colchón Inflable Doble', price: 290000 },
          { id: '6d51e42d-5b8e-4a72-af78-e7e163ac542c', label: 'Carpa + Colchón Inflable Simple x2', price: 300000 },
        ],
      },
      {
        id: 'motorhome',
        title: 'Motorhome',
        description: DESC_MOTORHOME,
        image: `${CDN}/1ce8fdab-1907-4182-ab1b-e2d5a8e983bc.png`,
        variants: [
          { id: '6b53552e-6fdd-43a7-b34c-92f9597a8bf6', label: 'Espacio para Motorhome', price: 150000 },
        ],
      },
    ],
    // Respuestas redactadas desde las descripciones reales de los productos.
    faqs: {
      title: 'Preguntas sobre el acampe',
      items: [
        {
          q: '¿El derecho a acampe es por persona o por carpa?',
          a: 'Por carpa, no por persona. Y el valor es por toda la estadía (4 o 7 días), no por día.',
        },
        {
          q: '¿Hay electricidad en la zona de acampe?',
          a: 'No hay electricidad en la zona de acampe. Prepará linterna y batería para tus dispositivos.',
        },
        {
          q: '¿Qué incluye la carpa pre-armada?',
          a: 'Te espera armada para 2 personas, con un colchón inflable nuevo con su inflador. Traé tus sábanas, tu almohada y tu peluche preferido 🧸',
        },
        {
          q: '¿Puedo hacer fuego?',
          a: 'No, está prohibido hacer fuego en todo el predio, incluido el sector de acampe.',
        },
        {
          q: '¿Qué servicios tiene el espacio para motorhome?',
          a: 'Es un espacio reservado para estacionar tu motorhome. No incluye agua, electricidad ni descarga de aguas grises. Consultanos las medidas máximas antes de comprar.',
        },
      ],
    },
  },
  {
    // Ronda 2: ex "Estacionamiento" — agrupa estacionamiento + transporte.
    id: 'extras',
    kicker: 'Completá tu experiencia',
    title: 'Extras',
    intro: 'Estacionamiento y transporte — sumá lo que necesitás para tu llegada.',
    groups: [
      {
        id: 'estadia-permanente',
        title: 'Estadía Permanente',
        description: DESC_PARKING_PERMANENTE,
        image: `${CDN}/7e1e044d-75ec-4fc1-9672-e05325cf92d2.jpg`,
        category: 'Estacionamiento',
        variants: [
          { id: 'daae49ad-88d8-4c6c-b6f5-0c703c4d5d6b', label: 'Estadía Permanente', price: 40000 },
        ],
      },
      {
        id: 'entrada-salida',
        title: 'Entrada y Salida',
        description: DESC_PARKING_ENTRADA_SALIDA,
        image: `${CDN}/2d856ecf-fb43-4f7d-a403-8f9c7154397a.webp`,
        category: 'Estacionamiento',
        variants: [
          { id: '4b5f7e0f-69f4-4515-a842-37adbbffd2cc', label: 'Entrada y Salida', price: 55000 },
        ],
      },
      // Cuando el backoffice sume productos de transporte, van acá con
      // category: 'Transporte' — el view arma el bloque solo.
    ],
    footnotes: [
      'No hay reembolsos, sin excepción.',
      'Entradas transferibles hasta el 30 de octubre de 2026, sin excepción.',
      'Entrada con DNI o QR.',
    ],
  },
];

/** Índice plano variante → { variante, grupo } para carrito y totales. */
export const VARIANTS_BY_ID: Record<string, { variant: Variant; group: ProductGroup }> = {};
for (const section of CATALOG) {
  for (const group of section.groups) {
    for (const variant of group.variants) {
      VARIANTS_BY_ID[variant.id] = { variant, group };
    }
  }
}

export const FAQS: Array<{ q: string; a: string }> = [
  {
    q: '¿Puedo ir con mis hijos?',
    a: 'Sí — Amanita es para toda la familia. Los niños de 0 a 6 años pagan $10.000 y los de 7 a 12, $80.000; desde los 13 abonan entrada normal. Todo menor de 18 debe estar acompañado por un adulto responsable en todo momento, con documento en mano.',
  },
  {
    q: '¿Qué incluye mi entrada?',
    a: 'El acceso a todas las actividades del festival: DJs y bandas en vivo, arte inmersivo, yoga, meditación, clases de baile y movimiento, talleres, charlas y paneles. El acampe, las comidas y el estacionamiento se suman aparte.',
  },
  {
    q: '¿Puedo llegar en auto?',
    a: 'Sí. Tenés dos opciones de estacionamiento: Estadía Permanente (un único ingreso y egreso) o Entrada y Salida libre durante el festival. Está a unos 400 metros de la entrada.',
  },
  {
    q: '¿Hay devoluciones?',
    a: 'No hay reembolsos, sin excepción. Las entradas son transferibles hasta el 30 de octubre de 2026.',
  },
];

/** $ argentino con punto de miles, determinístico (mismo output en SSR y cliente). */
export function formatARS(value: number): string {
  return `$${value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;
}
