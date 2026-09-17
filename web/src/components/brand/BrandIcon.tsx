import { cn } from "@/lib/utils";

interface SimpleIcon {
  title: string;
  path: string;
  hex: string;
}

/** Renders a Simple Icons entry as an inline SVG. Rests at the inherited
 * text color (uniform Charcoal Stone monochrome in the stack bar) and swaps
 * to the brand's own real color on hover, via a CSS custom property so each
 * icon can carry a different hex without a Tailwind class per brand.
 * `group`/`group-hover` (rather than hovering the path directly) so the
 * whole icon's bounding box triggers the swap, not just its inked pixels —
 * several of these logos have internal negative space a plain `hover:` on
 * the path would miss, flickering the color on and off within the icon. */
export function BrandIcon({ icon, className }: { icon: SimpleIcon; className?: string }) {
  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      className={cn("group", className)}
      fill="currentColor"
      style={{ "--brand-color": `#${icon.hex}` } as React.CSSProperties}
    >
      <title>{icon.title}</title>
      <path d={icon.path} className="transition-[fill] duration-200 group-hover:[fill:var(--brand-color)]" />
    </svg>
  );
}
