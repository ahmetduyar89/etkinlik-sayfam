/** İşletim sistemi hareketi azaltmayı istiyorsa geçişler anlık olur. */
export function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}
