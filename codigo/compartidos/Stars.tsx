/** Capa de estrellas titilantes para los fondos oscuros (decorativa).
 *  Nació en la landing de artista; compartida desde LP 3.1 (collection). */
export function Stars({ dim = false }: { dim?: boolean }) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0"
      style={{
        opacity: dim ? 0.5 : 1,
        backgroundImage:
          'radial-gradient(circle at 18% 26%,rgba(241,235,227,.7) 0 1px,transparent 1.4px),radial-gradient(circle at 70% 18%,rgba(176,213,206,.55) 0 1px,transparent 1.4px),radial-gradient(circle at 86% 62%,rgba(193,170,136,.55) 0 1px,transparent 1.4px),radial-gradient(circle at 40% 80%,rgba(241,235,227,.5) 0 1px,transparent 1.4px)',
        animation: 'amTwinkle 5s ease-in-out infinite',
      }}
    />
  );
}
