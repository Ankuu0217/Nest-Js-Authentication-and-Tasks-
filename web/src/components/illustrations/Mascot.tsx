"use client";

import { motion, useReducedMotion } from "motion/react";

export interface MascotProps {
  className?: string;
  size?: number;
}

/** Hand-authored blob character — the brand anchor used across the hero,
 * auth panels and the /auth/verify loading state. Coral/pink body per
 * DESIGN-3.md's Imagery section, a small leaf, and a face with just enough
 * asymmetry to read as friendly rather than corporate-clipart. */
export function Mascot({ className, size = 160 }: MascotProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label="MyTask mascot, a friendly rounded blob character"
      animate={prefersReducedMotion ? undefined : { y: [0, -10, 0] }}
      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
    >
      <title>MyTask mascot</title>
      <path
        d="M100 22 C138 22 168 42 176 80 C184 118 166 158 128 176 C94 192 54 182 32 152 C12 124 16 82 42 52 C62 28 78 22 100 22 Z"
        fill="#f788d2"
        stroke="#1d1d1c"
        strokeWidth="3"
      />
      <path
        d="M92 26 C86 10 100 2 112 8 C120 12 118 24 108 28 C102 30 96 29 92 26 Z"
        fill="#58df8c"
        stroke="#1d1d1c"
        strokeWidth="2.5"
      />
      <circle cx="62" cy="108" r="10" fill="#ee5968" opacity="0.35" />
      <circle cx="138" cy="108" r="10" fill="#ee5968" opacity="0.35" />
      <circle cx="76" cy="92" r="12" fill="#1d1d1c" />
      <circle cx="124" cy="92" r="12" fill="#1d1d1c" />
      <circle cx="80" cy="87" r="3.5" fill="#ffffff" />
      <circle cx="128" cy="87" r="3.5" fill="#ffffff" />
      <path
        d="M88 120 Q100 130 112 120"
        stroke="#1d1d1c"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
    </motion.svg>
  );
}
