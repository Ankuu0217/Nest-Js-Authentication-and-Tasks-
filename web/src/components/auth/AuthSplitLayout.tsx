"use client";

import { useEffect, useState } from "react";
import { Mascot } from "@/components/illustrations/Mascot";
import { TwilightSky } from "@/components/illustrations/TwilightSky";

const PRODUCT_TRUTHS = [
  "Access tokens live in an httpOnly cookie — never in localStorage.",
  "Every login attempt is rate-limited: five per minute, per account.",
  "Passwords are hashed with bcrypt before they touch the database.",
  "The refresh token rotates on every use.",
];

export function AuthSplitLayout({ children }: { children: React.ReactNode }) {
  const [truthIndex, setTruthIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTruthIndex((i) => (i + 1) % PRODUCT_TRUTHS.length), 4000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex items-center justify-center bg-parchment-cream px-6 py-16">
        <div className="w-full max-w-sm">{children}</div>
      </div>
      <div className="relative hidden overflow-hidden lg:flex lg:flex-col lg:items-center lg:justify-center lg:gap-8 lg:p-12">
        <TwilightSky />
        <Mascot size={180} className="relative z-10" />
        <p className="relative z-10 max-w-xs text-center text-body-sm text-parchment-cream/80" aria-live="polite">
          {PRODUCT_TRUTHS[truthIndex]}
        </p>
      </div>
    </div>
  );
}
