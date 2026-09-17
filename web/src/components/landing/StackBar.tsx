import {
  siTypescript,
  siNestjs,
  siNextdotjs,
  siPostgresql,
  siDrizzle,
  siTailwindcss,
  siJsonwebtokens,
} from "simple-icons";
import { BrandIcon } from "@/components/brand/BrandIcon";

const STACK = [
  siTypescript,
  siNestjs,
  siNextdotjs,
  siPostgresql,
  siDrizzle,
  siTailwindcss,
  siJsonwebtokens,
];

/** Real logos for real dependencies — this replaces the usual fake
 * "trusted by" customer-logo row a portfolio project shouldn't invent. */
export function StackBar() {
  return (
    <section className="border-b border-sand-gray bg-parchment-cream py-12">
      <div className="mx-auto max-w-5xl px-6">
        <p className="text-center text-caption font-medium tracking-wide text-charcoal-stone uppercase">
          Built with
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-6">
          {STACK.map((icon) => (
            <BrandIcon
              key={icon.title}
              icon={icon}
              className="h-6 w-auto text-charcoal-stone opacity-80 transition-opacity hover:opacity-100"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
