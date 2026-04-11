"use client";

import { useEffect, useState } from "react";

/**
 * SSR-safe: false until mounted, then matches window.matchMedia(query).
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const m = window.matchMedia(query);
    const update = () => setMatches(m.matches);
    update();
    m.addEventListener("change", update);
    return () => m.removeEventListener("change", update);
  }, [query]);

  return matches;
}
