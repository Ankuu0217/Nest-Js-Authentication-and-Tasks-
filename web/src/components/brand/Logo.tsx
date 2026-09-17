export function Logo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <rect x="2" y="2" width="28" height="28" rx="8" fill="#1d1d1c" />
      <path
        d="M10 16.5 L14 20.5 L22 11.5"
        stroke="#f8f7f2"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={className}>
      <Logo className="inline-block size-7 align-middle" />
      <span className="ml-2 align-middle text-body font-bold text-ink-black">MyTask</span>
    </span>
  );
}
