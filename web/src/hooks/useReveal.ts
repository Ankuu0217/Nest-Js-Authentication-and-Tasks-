"use client";

import { useEffect, useRef, useState } from "react";

const EASE = "cubic-bezier(.16,1,.3,1)";

/** Scroll-reveal: 24px rise + fade, staggered by index, once, and a no-op
 * under prefers-reduced-motion (renders visible immediately, no animation). */
export function useReveal<T extends HTMLElement>(index = 0) {
  const ref = useRef<T | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      // A generous rootMargin so a fast scroll (PageDown, spacebar, a hard
      // trackpad flick) is far less likely to jump an element's whole
      // intersection window in a single frame and miss it entirely.
      { threshold: 0.15, rootMargin: "200px 0px" },
    );
    observer.observe(el);

    // Belt and suspenders: IntersectionObserver is frame-driven, so a large
    // enough instant scroll jump can in principle skip an element's
    // intersecting window without a frame ever landing inside it. Confirmed
    // this happening on some cards in a 6-card grid during testing (rows 2-3
    // stayed at opacity:0 forever). Content must never be stuck invisible,
    // so force it visible after a short delay regardless.
    const fallback = setTimeout(() => setVisible(true), 1200);

    return () => {
      observer.disconnect();
      clearTimeout(fallback);
    };
  }, []);

  return {
    ref,
    style: {
      transform: visible ? "none" : "translateY(24px)",
      opacity: visible ? 1 : 0,
      transition: `transform 0.5s ${EASE} ${index * 60}ms, opacity 0.5s ${EASE} ${index * 60}ms`,
    } as const,
  };
}
